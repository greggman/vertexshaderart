(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var FS = Package['cfs:base-package'].FS;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var check = Package.check.check;
var Match = Package.check.Match;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var EventEmitter = Package['raix:eventemitter'].EventEmitter;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/cfs_collection/packages/cfs_collection.js                //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {                                                       // 1
                                                                     // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:collection/common.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    // 1
 *                                                                                                                     // 2
 * @constructor                                                                                                        // 3
 * @param {string} name A name for the collection                                                                      // 4
 * @param {Object} options                                                                                             // 5
 * @param {FS.StorageAdapter[]} options.stores An array of stores in which files should be saved. At least one is required.
 * @param {Object} [options.filter] Filter definitions                                                                 // 7
 * @param {Number} [options.chunkSize=2MB] Override the chunk size in bytes for uploads                                // 8
 * @param {Function} [options.uploader] A function to pass FS.File instances after inserting, which will begin uploading them. By default, `FS.HTTP.uploadQueue.uploadFile` is used if the `cfs-upload-http` package is present, or `FS.DDP.uploadQueue.uploadFile` is used if the `cfs-upload-ddp` package is present. You can override with your own, or set to `null` to prevent automatic uploading.
 * @returns {undefined}                                                                                                // 10
 */                                                                                                                    // 11
FS.Collection = function(name, options) {                                                                              // 12
  var self = this;                                                                                                     // 13
                                                                                                                       // 14
  self.storesLookup = {};                                                                                              // 15
                                                                                                                       // 16
  self.primaryStore = {};                                                                                              // 17
                                                                                                                       // 18
  self.options = {                                                                                                     // 19
    filter: null, //optional                                                                                           // 20
    stores: [], //required                                                                                             // 21
    chunkSize: null                                                                                                    // 22
  };                                                                                                                   // 23
                                                                                                                       // 24
  // Define a default uploader based on which upload packages are present,                                             // 25
  // preferring HTTP. You may override with your own function or                                                       // 26
  // set to null to skip automatic uploading of data after file insert/update.                                         // 27
  if (FS.HTTP && FS.HTTP.uploadQueue) {                                                                                // 28
    self.options.uploader = FS.HTTP.uploadQueue.uploadFile;                                                            // 29
  } else if (FS.DDP && FS.DDP.uploadQueue) {                                                                           // 30
    self.options.uploader = FS.DDP.uploadQueue.uploadFile;                                                             // 31
  }                                                                                                                    // 32
                                                                                                                       // 33
  // Extend and overwrite options                                                                                      // 34
  FS.Utility.extend(self.options, options || {});                                                                      // 35
                                                                                                                       // 36
  // Set the FS.Collection name                                                                                        // 37
  self.name = name;                                                                                                    // 38
                                                                                                                       // 39
  // Make sure at least one store has been supplied.                                                                   // 40
  // Usually the stores aren't used on the client, but we need them defined                                            // 41
  // so that we can access their names and use the first one as the default.                                           // 42
  if (FS.Utility.isEmpty(self.options.stores)) {                                                                       // 43
    throw new Error("You must specify at least one store. Please consult the documentation.");                         // 44
  }                                                                                                                    // 45
                                                                                                                       // 46
  FS.Utility.each(self.options.stores, function(store, i) {                                                            // 47
    // Set the primary store                                                                                           // 48
    if (i === 0) {                                                                                                     // 49
      self.primaryStore = store;                                                                                       // 50
    }                                                                                                                  // 51
                                                                                                                       // 52
    // Check for duplicate naming                                                                                      // 53
    if (typeof self.storesLookup[store.name] !== 'undefined') {                                                        // 54
      throw new Error('FS.Collection store names must be uniq, duplicate found: ' + store.name);                       // 55
    }                                                                                                                  // 56
                                                                                                                       // 57
    // Set the lookup                                                                                                  // 58
    self.storesLookup[store.name] = store;                                                                             // 59
                                                                                                                       // 60
    if (Meteor.isServer) {                                                                                             // 61
                                                                                                                       // 62
      // Emit events based on store events                                                                             // 63
      store.on('stored', function (storeName, fileObj) {                                                               // 64
        // This is weird, but currently there is a bug where each store will emit the                                  // 65
        // events for all other stores, too, so we need to make sure that this event                                   // 66
        // is truly for this store.                                                                                    // 67
        if (storeName !== store.name)                                                                                  // 68
          return;                                                                                                      // 69
        // When a file is successfully stored into the store, we emit a "stored" event on the FS.Collection only if the file belongs to this collection
        if (fileObj.collectionName === name) {                                                                         // 71
          var emitted = self.emit('stored', fileObj, store.name);                                                      // 72
          if (FS.debug && !emitted) {                                                                                  // 73
            console.log(fileObj.name({store: store.name}) + ' was successfully saved to the ' + store.name + ' store. You are seeing this informational message because you enabled debugging and you have not defined any listeners for the "stored" event on the ' + name + ' collection.');
          }                                                                                                            // 75
        }                                                                                                              // 76
        fileObj.emit('stored', store.name);                                                                            // 77
      });                                                                                                              // 78
                                                                                                                       // 79
      store.on('error', function (storeName, error, fileObj) {                                                         // 80
        // This is weird, but currently there is a bug where each store will emit the                                  // 81
        // events for all other stores, too, so we need to make sure that this event                                   // 82
        // is truly for this store.                                                                                    // 83
        if (storeName !== store.name)                                                                                  // 84
          return;                                                                                                      // 85
        // When a file has an error while being stored into the temp store, we emit an "error" event on the FS.Collection only if the file belongs to this collection
        if (fileObj.collectionName === name) {                                                                         // 87
          error = new Error('Error storing file to the ' + store.name + ' store: ' + error.message);                   // 88
          var emitted = self.emit('error', error, fileObj, store.name);                                                // 89
          if (FS.debug && !emitted) {                                                                                  // 90
            console.log(error.message);                                                                                // 91
          }                                                                                                            // 92
        }                                                                                                              // 93
        fileObj.emit('error', store.name);                                                                             // 94
      });                                                                                                              // 95
                                                                                                                       // 96
    }                                                                                                                  // 97
  });                                                                                                                  // 98
                                                                                                                       // 99
  var _filesOptions = {                                                                                                // 100
    transform: function(doc) {                                                                                         // 101
      // This should keep the filerecord in the file object updated in reactive                                        // 102
      // context                                                                                                       // 103
      var result = new FS.File(doc, true);                                                                             // 104
      result.collectionName = name;                                                                                    // 105
      return result;                                                                                                   // 106
    }                                                                                                                  // 107
  };                                                                                                                   // 108
                                                                                                                       // 109
  // Create the 'cfs.' ++ ".filerecord" and use fsFile                                                                 // 110
  var collectionName = 'cfs.' + name + '.filerecord';                                                                  // 111
  self.files = new Mongo.Collection(collectionName, _filesOptions);                                                    // 112
                                                                                                                       // 113
  // For storing custom allow/deny functions                                                                           // 114
  self._validators = {                                                                                                 // 115
    download: {allow: [], deny: []}                                                                                    // 116
  };                                                                                                                   // 117
                                                                                                                       // 118
  // Set up filters                                                                                                    // 119
  // XXX Should we deprecate the filter option now that this is done with a separate pkg, or just keep it?             // 120
  if (self.filters) {                                                                                                  // 121
    self.filters(self.options.filter);                                                                                 // 122
  }                                                                                                                    // 123
                                                                                                                       // 124
  // Save the collection reference (we want it without the 'cfs.' prefix and '.filerecord' suffix)                     // 125
  FS._collections[name] = this;                                                                                        // 126
                                                                                                                       // 127
  // Set up observers                                                                                                  // 128
  Meteor.isServer && FS.FileWorker && FS.FileWorker.observe(this);                                                     // 129
                                                                                                                       // 130
  // Emit "removed" event on collection                                                                                // 131
  self.files.find().observe({                                                                                          // 132
    removed: function(fileObj) {                                                                                       // 133
      self.emit('removed', fileObj);                                                                                   // 134
    }                                                                                                                  // 135
  });                                                                                                                  // 136
                                                                                                                       // 137
  // Emit events based on TempStore events                                                                             // 138
  if (FS.TempStore) {                                                                                                  // 139
    FS.TempStore.on('stored', function (fileObj, result) {                                                             // 140
      // When a file is successfully stored into the temp store, we emit an "uploaded" event on the FS.Collection only if the file belongs to this collection
      if (fileObj.collectionName === name) {                                                                           // 142
        var emitted = self.emit('uploaded', fileObj);                                                                  // 143
        if (FS.debug && !emitted) {                                                                                    // 144
          console.log(fileObj.name() + ' was successfully uploaded. You are seeing this informational message because you enabled debugging and you have not defined any listeners for the "uploaded" event on the ' + name + ' collection.');
        }                                                                                                              // 146
      }                                                                                                                // 147
    });                                                                                                                // 148
                                                                                                                       // 149
    FS.TempStore.on('error', function (error, fileObj) {                                                               // 150
      // When a file has an error while being stored into the temp store, we emit an "error" event on the FS.Collection only if the file belongs to this collection
      if (fileObj.collectionName === name) {                                                                           // 152
        self.emit('error', new Error('Error storing uploaded file to TempStore: ' + error.message), fileObj);          // 153
      }                                                                                                                // 154
    });                                                                                                                // 155
  } else if (Meteor.isServer) {                                                                                        // 156
    throw new Error("FS.Collection constructor: FS.TempStore must be defined before constructing any FS.Collections.") // 157
  }                                                                                                                    // 158
                                                                                                                       // 159
};                                                                                                                     // 160
                                                                                                                       // 161
// An FS.Collection can emit events                                                                                    // 162
FS.Collection.prototype = new EventEmitter();                                                                          // 163
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 173
}).call(this);                                                       // 174
                                                                     // 175
                                                                     // 176
                                                                     // 177
                                                                     // 178
                                                                     // 179
                                                                     // 180
(function () {                                                       // 181
                                                                     // 182
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:collection/api.common.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/** @method FS.Collection.prototype.insert Insert `File` or `FS.File` or remote URL into collection                    // 1
 * @public                                                                                                             // 2
 * @param {File|Blob|Buffer|ArrayBuffer|Uint8Array|String} fileRef File, FS.File, or other data to insert              // 3
 * @param {function} [callback] Callback `function(error, fileObj)`                                                    // 4
 * @returns {FS.File|undefined} The `file object`                                                                      // 5
 * [Meteor docs](http://docs.meteor.com/#insert)                                                                       // 6
 */                                                                                                                    // 7
FS.Collection.prototype.insert = function(fileRef, callback) {                                                         // 8
  var self = this;                                                                                                     // 9
                                                                                                                       // 10
  if (Meteor.isClient && !callback) {                                                                                  // 11
    callback = FS.Utility.defaultCallback;                                                                             // 12
  }                                                                                                                    // 13
                                                                                                                       // 14
  // XXX:                                                                                                              // 15
  // We should out factor beginStorage to FS.File.beginStorage                                                         // 16
  // the client side storage adapters should be the one providing                                                      // 17
  // the upload either via http/ddp or direct upload                                                                   // 18
  // Could be cool to have a streaming api on the client side                                                          // 19
  // having a createReadStream etc. on the client too...                                                               // 20
  function beginStorage(fileObj) {                                                                                     // 21
                                                                                                                       // 22
    // If on client, begin uploading the data                                                                          // 23
    if (Meteor.isClient) {                                                                                             // 24
      self.options.uploader && self.options.uploader(fileObj);                                                         // 25
    }                                                                                                                  // 26
                                                                                                                       // 27
    // If on the server, save the binary to a single chunk temp file,                                                  // 28
    // so that it is available when FileWorker calls saveCopies.                                                       // 29
    // This will also trigger file handling from collection observes.                                                  // 30
    else if (Meteor.isServer) {                                                                                        // 31
      fileObj.createReadStream().pipe(FS.TempStore.createWriteStream(fileObj));                                        // 32
    }                                                                                                                  // 33
  }                                                                                                                    // 34
                                                                                                                       // 35
  // XXX: would be great if this function could be simplyfied - if even possible?                                      // 36
  function checkAndInsert(fileObj) {                                                                                   // 37
    // Check filters. This is called in deny functions, too, but we call here to catch                                 // 38
    // server inserts and to catch client inserts early, allowing us to call `onInvalid` on                            // 39
    // the client and save a trip to the server.                                                                       // 40
    if (!self.allowsFile(fileObj)) {                                                                                   // 41
      return FS.Utility.handleError(callback, 'FS.Collection insert: file does not pass collection filters');          // 42
    }                                                                                                                  // 43
                                                                                                                       // 44
    // Set collection name                                                                                             // 45
    fileObj.collectionName = self.name;                                                                                // 46
                                                                                                                       // 47
    // Insert the file into db                                                                                         // 48
    // We call cloneFileRecord as an easy way of extracting the properties                                             // 49
    // that need saving.                                                                                               // 50
    if (callback) {                                                                                                    // 51
      fileObj._id = self.files.insert(FS.Utility.cloneFileRecord(fileObj), function(err, id) {                         // 52
        if (err) {                                                                                                     // 53
          if (fileObj._id) {                                                                                           // 54
            delete fileObj._id;                                                                                        // 55
          }                                                                                                            // 56
        } else {                                                                                                       // 57
          // Set _id, just to be safe, since this could be before or after the insert method returns                   // 58
          fileObj._id = id;                                                                                            // 59
          // Pass to uploader or stream data to the temp store                                                         // 60
          beginStorage(fileObj);                                                                                       // 61
        }                                                                                                              // 62
        callback(err, err ? void 0 : fileObj);                                                                         // 63
      });                                                                                                              // 64
    } else {                                                                                                           // 65
      fileObj._id = self.files.insert(FS.Utility.cloneFileRecord(fileObj));                                            // 66
      // Pass to uploader or stream data to the temp store                                                             // 67
      beginStorage(fileObj);                                                                                           // 68
    }                                                                                                                  // 69
    return fileObj;                                                                                                    // 70
  }                                                                                                                    // 71
                                                                                                                       // 72
  // Parse, adjust fileRef                                                                                             // 73
  if (fileRef instanceof FS.File) {                                                                                    // 74
    return checkAndInsert(fileRef);                                                                                    // 75
  } else {                                                                                                             // 76
    // For convenience, allow File, Blob, Buffer, data URI, filepath, URL, etc. to be passed as first arg,             // 77
    // and we will attach that to a new fileobj for them                                                               // 78
    var fileObj = new FS.File(fileRef);                                                                                // 79
    if (callback) {                                                                                                    // 80
      fileObj.attachData(fileRef, function attachDataCallback(error) {                                                 // 81
        if (error) {                                                                                                   // 82
          callback(error);                                                                                             // 83
        } else {                                                                                                       // 84
          checkAndInsert(fileObj);                                                                                     // 85
        }                                                                                                              // 86
      });                                                                                                              // 87
    } else {                                                                                                           // 88
      // We ensure there's a callback on the client, so if there isn't one at this point,                              // 89
      // we must be on the server expecting synchronous behavior.                                                      // 90
      fileObj.attachData(fileRef);                                                                                     // 91
      checkAndInsert(fileObj);                                                                                         // 92
    }                                                                                                                  // 93
    return fileObj;                                                                                                    // 94
  }                                                                                                                    // 95
};                                                                                                                     // 96
                                                                                                                       // 97
/** @method FS.Collection.prototype.update Update the file record                                                      // 98
 * @public                                                                                                             // 99
 * @param {FS.File|object} selector                                                                                    // 100
 * @param {object} modifier                                                                                            // 101
 * @param {object} [options]                                                                                           // 102
 * @param {function} [callback]                                                                                        // 103
 * [Meteor docs](http://docs.meteor.com/#update)                                                                       // 104
 */                                                                                                                    // 105
FS.Collection.prototype.update = function(selector, modifier, options, callback) {                                     // 106
  var self = this;                                                                                                     // 107
  if (selector instanceof FS.File) {                                                                                   // 108
    // Make sure the file belongs to this FS.Collection                                                                // 109
    if (selector.collectionName === self.files._name) {                                                                // 110
      return selector.update(modifier, options, callback);                                                             // 111
    } else {                                                                                                           // 112
      // Tried to save a file in the wrong FS.Collection                                                               // 113
      throw new Error('FS.Collection cannot update file belongs to: "' + selector.collectionName + '" not: "' + self.files._name + '"');
    }                                                                                                                  // 115
  }                                                                                                                    // 116
                                                                                                                       // 117
  return self.files.update(selector, modifier, options, callback);                                                     // 118
};                                                                                                                     // 119
                                                                                                                       // 120
/** @method FS.Collection.prototype.remove Remove the file from the collection                                         // 121
 * @public                                                                                                             // 122
 * @param {FS.File|object} selector                                                                                    // 123
 * @param {Function} [callback]                                                                                        // 124
 * [Meteor docs](http://docs.meteor.com/#remove)                                                                       // 125
 */                                                                                                                    // 126
FS.Collection.prototype.remove = function(selector, callback) {                                                        // 127
  var self = this;                                                                                                     // 128
  if (selector instanceof FS.File) {                                                                                   // 129
                                                                                                                       // 130
    // Make sure the file belongs to this FS.Collection                                                                // 131
    if (selector.collectionName === self.files._name) {                                                                // 132
      return selector.remove(callback);                                                                                // 133
    } else {                                                                                                           // 134
      // Tried to remove a file from the wrong FS.Collection                                                           // 135
      throw new Error('FS.Collection cannot remove file belongs to: "' + selector.collectionName + '" not: "' + self.files._name + '"');
    }                                                                                                                  // 137
  }                                                                                                                    // 138
                                                                                                                       // 139
  //doesn't work correctly on the client without a callback                                                            // 140
  callback = callback || FS.Utility.defaultCallback;                                                                   // 141
  return self.files.remove(selector, callback);                                                                        // 142
};                                                                                                                     // 143
                                                                                                                       // 144
/** @method FS.Collection.prototype.findOne                                                                            // 145
 * @public                                                                                                             // 146
 * @param {[selector](http://docs.meteor.com/#selectors)} selector                                                     // 147
 * [Meteor docs](http://docs.meteor.com/#findone)                                                                      // 148
 * Example:                                                                                                            // 149
 ```js                                                                                                                 // 150
 var images = new FS.Collection( ... );                                                                                // 151
 // Get the file object                                                                                                // 152
 var fo = images.findOne({ _id: 'NpnskCt6ippN6CgD8' });                                                                // 153
 ```                                                                                                                   // 154
 */                                                                                                                    // 155
// Call findOne on files collection                                                                                    // 156
FS.Collection.prototype.findOne = function(selector) {                                                                 // 157
  var self = this;                                                                                                     // 158
  return self.files.findOne.apply(self.files, arguments);                                                              // 159
};                                                                                                                     // 160
                                                                                                                       // 161
/** @method FS.Collection.prototype.find                                                                               // 162
 * @public                                                                                                             // 163
 * @param {[selector](http://docs.meteor.com/#selectors)} selector                                                     // 164
 * [Meteor docs](http://docs.meteor.com/#find)                                                                         // 165
 * Example:                                                                                                            // 166
 ```js                                                                                                                 // 167
 var images = new FS.Collection( ... );                                                                                // 168
 // Get the all file objects                                                                                           // 169
 var files = images.find({ _id: 'NpnskCt6ippN6CgD8' }).fetch();                                                        // 170
 ```                                                                                                                   // 171
 */                                                                                                                    // 172
FS.Collection.prototype.find = function(selector) {                                                                    // 173
  var self = this;                                                                                                     // 174
  return self.files.find.apply(self.files, arguments);                                                                 // 175
};                                                                                                                     // 176
                                                                                                                       // 177
/** @method FS.Collection.prototype.allow                                                                              // 178
 * @public                                                                                                             // 179
 * @param {object} options                                                                                             // 180
 * @param {function} options.download Function that checks if the file contents may be downloaded                      // 181
 * @param {function} options.insert                                                                                    // 182
 * @param {function} options.update                                                                                    // 183
 * @param {function} options.remove Functions that look at a proposed modification to the database and return true if it should be allowed
 * @param {[string]} [options.fetch] Optional performance enhancement. Limits the fields that will be fetched from the database for inspection by your update and remove functions
 * [Meteor docs](http://docs.meteor.com/#allow)                                                                        // 186
 * Example:                                                                                                            // 187
 ```js                                                                                                                 // 188
 var images = new FS.Collection( ... );                                                                                // 189
 // Get the all file objects                                                                                           // 190
 var files = images.allow({                                                                                            // 191
 insert: function(userId, doc) { return true; },                                                                       // 192
 update: function(userId, doc, fields, modifier) { return true; },                                                     // 193
 remove: function(userId, doc) { return true; },                                                                       // 194
 download: function(userId, fileObj) { return true; },                                                                 // 195
 });                                                                                                                   // 196
 ```                                                                                                                   // 197
 */                                                                                                                    // 198
FS.Collection.prototype.allow = function(options) {                                                                    // 199
  var self = this;                                                                                                     // 200
                                                                                                                       // 201
  // Pull out the custom "download" functions                                                                          // 202
  if (options.download) {                                                                                              // 203
    if (!(options.download instanceof Function)) {                                                                     // 204
      throw new Error("allow: Value for `download` must be a function");                                               // 205
    }                                                                                                                  // 206
    self._validators.download.allow.push(options.download);                                                            // 207
    delete options.download;                                                                                           // 208
  }                                                                                                                    // 209
                                                                                                                       // 210
  return self.files.allow.call(self.files, options);                                                                   // 211
};                                                                                                                     // 212
                                                                                                                       // 213
/** @method FS.Collection.prototype.deny                                                                               // 214
 * @public                                                                                                             // 215
 * @param {object} options                                                                                             // 216
 * @param {function} options.download Function that checks if the file contents may be downloaded                      // 217
 * @param {function} options.insert                                                                                    // 218
 * @param {function} options.update                                                                                    // 219
 * @param {function} options.remove Functions that look at a proposed modification to the database and return true if it should be denyed
 * @param {[string]} [options.fetch] Optional performance enhancement. Limits the fields that will be fetched from the database for inspection by your update and remove functions
 * [Meteor docs](http://docs.meteor.com/#deny)                                                                         // 222
 * Example:                                                                                                            // 223
 ```js                                                                                                                 // 224
 var images = new FS.Collection( ... );                                                                                // 225
 // Get the all file objects                                                                                           // 226
 var files = images.deny({                                                                                             // 227
 insert: function(userId, doc) { return true; },                                                                       // 228
 update: function(userId, doc, fields, modifier) { return true; },                                                     // 229
 remove: function(userId, doc) { return true; },                                                                       // 230
 download: function(userId, fileObj) { return true; },                                                                 // 231
 });                                                                                                                   // 232
 ```                                                                                                                   // 233
 */                                                                                                                    // 234
FS.Collection.prototype.deny = function(options) {                                                                     // 235
  var self = this;                                                                                                     // 236
                                                                                                                       // 237
  // Pull out the custom "download" functions                                                                          // 238
  if (options.download) {                                                                                              // 239
    if (!(options.download instanceof Function)) {                                                                     // 240
      throw new Error("deny: Value for `download` must be a function");                                                // 241
    }                                                                                                                  // 242
    self._validators.download.deny.push(options.download);                                                             // 243
    delete options.download;                                                                                           // 244
  }                                                                                                                    // 245
                                                                                                                       // 246
  return self.files.deny.call(self.files, options);                                                                    // 247
};                                                                                                                     // 248
                                                                                                                       // 249
// TODO: Upsert?                                                                                                       // 250
                                                                                                                       // 251
/**                                                                                                                    // 252
 * We provide a default implementation that doesn't do anything.                                                       // 253
 * Can be changed by user or packages, such as the default cfs-collection-filters pkg.                                 // 254
 * @param  {FS.File} fileObj File object                                                                               // 255
 * @return {Boolean} Should we allow insertion of this file?                                                           // 256
 */                                                                                                                    // 257
FS.Collection.prototype.allowsFile = function fsColAllowsFile(fileObj) {                                               // 258
  return true;                                                                                                         // 259
};                                                                                                                     // 260
                                                                                                                       // 261
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 451
}).call(this);                                                       // 452
                                                                     // 453
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:collection'] = {};

})();

//# sourceMappingURL=cfs_collection.js.map
