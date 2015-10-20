(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var FS = Package['cfs:base-package'].FS;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var PowerQueue = Package['cfs:power-queue'].PowerQueue;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/cfs_worker/packages/cfs_worker.js                                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
(function () {                                                                                                 // 1
                                                                                                               // 2
//////////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                      //     // 4
// packages/cfs:worker/fileWorker.js                                                                    //     // 5
//                                                                                                      //     // 6
//////////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                        //     // 8
//// TODO: Use power queue to handle throttling etc.                                                    // 1   // 9
//// Use observe to monitor changes and have it create tasks for the power queue                        // 2   // 10
//// to perform.                                                                                        // 3   // 11
                                                                                                        // 4   // 12
/**                                                                                                     // 5   // 13
 * @public                                                                                              // 6   // 14
 * @type Object                                                                                         // 7   // 15
 */                                                                                                     // 8   // 16
FS.FileWorker = {};                                                                                     // 9   // 17
                                                                                                        // 10  // 18
/**                                                                                                     // 11  // 19
 * @method FS.FileWorker.observe                                                                        // 12  // 20
 * @public                                                                                              // 13  // 21
 * @param {FS.Collection} fsCollection                                                                  // 14  // 22
 * @returns {undefined}                                                                                 // 15  // 23
 *                                                                                                      // 16  // 24
 * Sets up observes on the fsCollection to store file copies and delete                                 // 17  // 25
 * temp files at the appropriate times.                                                                 // 18  // 26
 */                                                                                                     // 19  // 27
FS.FileWorker.observe = function(fsCollection) {                                                        // 20  // 28
                                                                                                        // 21  // 29
  // Initiate observe for finding newly uploaded/added files that need to be stored                     // 22  // 30
  // per store.                                                                                         // 23  // 31
  FS.Utility.each(fsCollection.options.stores, function(store) {                                        // 24  // 32
    var storeName = store.name;                                                                         // 25  // 33
    fsCollection.files.find(getReadyQuery(storeName), {                                                 // 26  // 34
      fields: {                                                                                         // 27  // 35
        copies: 0                                                                                       // 28  // 36
      }                                                                                                 // 29  // 37
    }).observe({                                                                                        // 30  // 38
      added: function(fsFile) {                                                                         // 31  // 39
        // added will catch fresh files                                                                 // 32  // 40
        FS.debug && console.log("FileWorker ADDED - calling saveCopy", storeName, "for", fsFile._id);   // 33  // 41
        saveCopy(fsFile, storeName);                                                                    // 34  // 42
      },                                                                                                // 35  // 43
      changed: function(fsFile) {                                                                       // 36  // 44
        // changed will catch failures and retry them                                                   // 37  // 45
        FS.debug && console.log("FileWorker CHANGED - calling saveCopy", storeName, "for", fsFile._id); // 38  // 46
        saveCopy(fsFile, storeName);                                                                    // 39  // 47
      }                                                                                                 // 40  // 48
    });                                                                                                 // 41  // 49
  });                                                                                                   // 42  // 50
                                                                                                        // 43  // 51
  // Initiate observe for finding files that have been stored so we can delete                          // 44  // 52
  // any temp files                                                                                     // 45  // 53
  fsCollection.files.find(getDoneQuery(fsCollection.options.stores)).observe({                          // 46  // 54
    added: function(fsFile) {                                                                           // 47  // 55
      FS.debug && console.log("FileWorker ADDED - calling deleteChunks for", fsFile._id);               // 48  // 56
      FS.TempStore.removeFile(fsFile);                                                                  // 49  // 57
    }                                                                                                   // 50  // 58
  });                                                                                                   // 51  // 59
                                                                                                        // 52  // 60
  // Initiate observe for catching files that have been removed and                                     // 53  // 61
  // removing the data from all stores as well                                                          // 54  // 62
  fsCollection.files.find().observe({                                                                   // 55  // 63
    removed: function(fsFile) {                                                                         // 56  // 64
      FS.debug && console.log('FileWorker REMOVED - removing all stored data for', fsFile._id);         // 57  // 65
      //remove from temp store                                                                          // 58  // 66
      FS.TempStore.removeFile(fsFile);                                                                  // 59  // 67
      //delete from all stores                                                                          // 60  // 68
      FS.Utility.each(fsCollection.options.stores, function(storage) {                                  // 61  // 69
        storage.adapter.remove(fsFile);                                                                 // 62  // 70
      });                                                                                               // 63  // 71
    }                                                                                                   // 64  // 72
  });                                                                                                   // 65  // 73
};                                                                                                      // 66  // 74
                                                                                                        // 67  // 75
/**                                                                                                     // 68  // 76
 *  @method getReadyQuery                                                                               // 69  // 77
 *  @private                                                                                            // 70  // 78
 *  @param {string} storeName - The name of the store to observe                                        // 71  // 79
 *                                                                                                      // 72  // 80
 *  Returns a selector that will be used to identify files that                                         // 73  // 81
 *  have been uploaded but have not yet been stored to the                                              // 74  // 82
 *  specified store.                                                                                    // 75  // 83
 *                                                                                                      // 76  // 84
 *  {                                                                                                   // 77  // 85
 *    uploadedAt: {$exists: true},                                                                      // 78  // 86
 *    'copies.storeName`: null,                                                                         // 79  // 87
 *    'failures.copies.storeName.doneTrying': {$ne: true}                                               // 80  // 88
 *  }                                                                                                   // 81  // 89
 */                                                                                                     // 82  // 90
function getReadyQuery(storeName) {                                                                     // 83  // 91
  var selector = {uploadedAt: {$exists: true}};                                                         // 84  // 92
  selector['copies.' + storeName] = null;                                                               // 85  // 93
  selector['failures.copies.' + storeName + '.doneTrying'] = {$ne: true};                               // 86  // 94
  return selector;                                                                                      // 87  // 95
}                                                                                                       // 88  // 96
                                                                                                        // 89  // 97
/**                                                                                                     // 90  // 98
 *  @method getDoneQuery                                                                                // 91  // 99
 *  @private                                                                                            // 92  // 100
 *  @param {Array} stores - The stores array from the FS.Collection options                             // 93  // 101
 *                                                                                                      // 94  // 102
 *  Returns a selector that will be used to identify files where all                                    // 95  // 103
 *  stores have successfully save or have failed the                                                    // 96  // 104
 *  max number of times but still have chunks. The resulting selector                                   // 97  // 105
 *  should be something like this:                                                                      // 98  // 106
 *                                                                                                      // 99  // 107
 *  {                                                                                                   // 100
 *    $and: [                                                                                           // 101
 *      {chunks: {$exists: true}},                                                                      // 102
 *      {                                                                                               // 103
 *        $or: [                                                                                        // 104
 *          {                                                                                           // 105
 *            $and: [                                                                                   // 106
 *              {                                                                                       // 107
 *                'copies.storeName': {$ne: null}                                                       // 108
 *              },                                                                                      // 109
 *              {                                                                                       // 110
 *                'copies.storeName': {$ne: false}                                                      // 111
 *              }                                                                                       // 112
 *            ]                                                                                         // 113
 *          },                                                                                          // 114
 *          {                                                                                           // 115
 *            'failures.copies.storeName.doneTrying': true                                              // 116
 *          }                                                                                           // 117
 *        ]                                                                                             // 118
 *      },                                                                                              // 119
 *      REPEATED FOR EACH STORE                                                                         // 120
 *    ]                                                                                                 // 121
 *  }                                                                                                   // 122
 *                                                                                                      // 123
 */                                                                                                     // 124
function getDoneQuery(stores) {                                                                         // 125
  var selector = {                                                                                      // 126
    $and: []                                                                                            // 127
  };                                                                                                    // 128
                                                                                                        // 129
  // Add conditions for all defined stores                                                              // 130
  FS.Utility.each(stores, function(store) {                                                             // 131
    var storeName = store.name;                                                                         // 132
    var copyCond = {$or: [{$and: []}]};                                                                 // 133
    var tempCond = {};                                                                                  // 134
    tempCond["copies." + storeName] = {$ne: null};                                                      // 135
    copyCond.$or[0].$and.push(tempCond);                                                                // 136
    tempCond = {};                                                                                      // 137
    tempCond["copies." + storeName] = {$ne: false};                                                     // 138
    copyCond.$or[0].$and.push(tempCond);                                                                // 139
    tempCond = {};                                                                                      // 140
    tempCond['failures.copies.' + storeName + '.doneTrying'] = true;                                    // 141
    copyCond.$or.push(tempCond);                                                                        // 142
    selector.$and.push(copyCond);                                                                       // 143
  })                                                                                                    // 144
                                                                                                        // 145
  return selector;                                                                                      // 146
}                                                                                                       // 147
                                                                                                        // 148
/**                                                                                                     // 149
 * @method saveCopy                                                                                     // 150
 * @private                                                                                             // 151
 * @param {FS.File} fsFile                                                                              // 152
 * @param {string} storeName                                                                            // 153
 * @param {Object} options                                                                              // 154
 * @param {Boolean} [options.overwrite=false] - Force save to the specified store?                      // 155
 * @returns {undefined}                                                                                 // 156
 *                                                                                                      // 157
 * Saves to the specified store. If the                                                                 // 158
 * `overwrite` option is `true`, will save to the store even if we already                              // 159
 * have, potentially overwriting any previously saved data. Synchronous.                                // 160
 */                                                                                                     // 161
function saveCopy(fsFile, storeName, options) {                                                         // 162
  options = options || {};                                                                              // 163
                                                                                                        // 164
  var storage = FS.StorageAdapter(storeName);                                                           // 165
  if (!storage) {                                                                                       // 166
    throw new Error('No store named "' + storeName + '" exists');                                       // 167
  }                                                                                                     // 168
                                                                                                        // 169
  FS.debug && console.log('saving to store ' + storeName);                                              // 170
                                                                                                        // 171
  var writeStream = storage.adapter.createWriteStream(fsFile);                                          // 172
  var readStream = FS.TempStore.createReadStream(fsFile);                                               // 173
                                                                                                        // 174
  // Pipe the temp data into the storage adapter                                                        // 175
  readStream.pipe(writeStream);                                                                         // 176
}                                                                                                       // 177
                                                                                                        // 178
//////////////////////////////////////////////////////////////////////////////////////////////////////////     // 187
                                                                                                               // 188
}).call(this);                                                                                                 // 189
                                                                                                               // 190
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:worker'] = {};

})();

//# sourceMappingURL=cfs_worker.js.map
