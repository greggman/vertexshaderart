(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var FS = Package['cfs:base-package'].FS;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var _chunkPath, _fileReference;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/cfs_tempstore/packages/cfs_tempstore.js                  //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {                                                       // 1
                                                                     // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:tempstore/tempStore.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// ##Temporary Storage                                                                                                 // 1
//                                                                                                                     // 2
// Temporary storage is used for chunked uploads until all chunks are received                                         // 3
// and all copies have been made or given up. In some cases, the original file                                         // 4
// is stored only in temporary storage (for example, if all copies do some                                             // 5
// manipulation in beforeSave). This is why we use the temporary file as the                                           // 6
// basis for each saved copy, and then remove it after all copies are saved.                                           // 7
//                                                                                                                     // 8
// Every chunk is saved as an individual temporary file. This is safer than                                            // 9
// attempting to write multiple incoming chunks to different positions in a                                            // 10
// single temporary file, which can lead to write conflicts.                                                           // 11
//                                                                                                                     // 12
// Using temp files also allows us to easily resume uploads, even if the server                                        // 13
// restarts, and to keep the working memory clear.                                                                     // 14
                                                                                                                       // 15
// The FS.TempStore emits events that others are able to listen to                                                     // 16
var EventEmitter = Npm.require('events').EventEmitter;                                                                 // 17
                                                                                                                       // 18
// We have a special stream concating all chunk files into one readable stream                                         // 19
var CombinedStream = Npm.require('combined-stream');                                                                   // 20
                                                                                                                       // 21
/** @namespace FS.TempStore                                                                                            // 22
 * @property FS.TempStore                                                                                              // 23
 * @type {object}                                                                                                      // 24
 * @public                                                                                                             // 25
 * *it's an event emitter*                                                                                             // 26
 */                                                                                                                    // 27
FS.TempStore = new EventEmitter();                                                                                     // 28
                                                                                                                       // 29
// Create a tracker collection for keeping track of all chunks for any files that are currently in the temp store      // 30
var tracker = FS.TempStore.Tracker = new Mongo.Collection('cfs._tempstore.chunks');                                    // 31
                                                                                                                       // 32
/**                                                                                                                    // 33
 * @property FS.TempStore.Storage                                                                                      // 34
 * @type {StorageAdapter}                                                                                              // 35
 * @namespace FS.TempStore                                                                                             // 36
 * @private                                                                                                            // 37
 * This property is set to either `FS.Store.FileSystem` or `FS.Store.GridFS`                                           // 38
 *                                                                                                                     // 39
 * __When and why:__                                                                                                   // 40
 * We normally default to `cfs-filesystem` unless its not installed. *(we default to gridfs if installed)*             // 41
 * But if `cfs-gridfs` and `cfs-worker` is installed we default to `cfs-gridfs`                                        // 42
 *                                                                                                                     // 43
 * If `cfs-gridfs` and `cfs-filesystem` is not installed we log a warning.                                             // 44
 * the user can set `FS.TempStore.Storage` them selfs eg.:                                                             // 45
 * ```js                                                                                                               // 46
 *   // Its important to set `internal: true` this lets the SA know that we                                            // 47
 *   // are using this internally and it will give us direct SA api                                                    // 48
 *   FS.TempStore.Storage = new FS.Store.GridFS('_tempstore', { internal: true });                                     // 49
 * ```                                                                                                                 // 50
 *                                                                                                                     // 51
 * > Note: This is considered as `advanced` use, its not a common pattern.                                             // 52
 */                                                                                                                    // 53
FS.TempStore.Storage = null;                                                                                           // 54
                                                                                                                       // 55
// We will not mount a storage adapter until needed. This allows us to check for the                                   // 56
// existance of FS.FileWorker, which is loaded after this package because it                                           // 57
// depends on this package.                                                                                            // 58
function mountStorage() {                                                                                              // 59
                                                                                                                       // 60
  if (FS.TempStore.Storage) return;                                                                                    // 61
                                                                                                                       // 62
  // XXX: We could replace this test, testing the FS scope for grifFS etc.                                             // 63
  // This is on the todo later when we get "stable"                                                                    // 64
  if (Package["cfs:gridfs"] && (Package["cfs:worker"] || !Package["cfs:filesystem"])) {                                // 65
    // If the file worker is installed we would prefer to use the gridfs sa                                            // 66
    // for scalability. We also default to gridfs if filesystem is not found                                           // 67
                                                                                                                       // 68
    // Use the gridfs                                                                                                  // 69
    FS.TempStore.Storage = new FS.Store.GridFS('_tempstore', { internal: true });                                      // 70
  } else if (Package["cfs:filesystem"]) {                                                                              // 71
                                                                                                                       // 72
    // use the Filesystem                                                                                              // 73
    FS.TempStore.Storage = new FS.Store.FileSystem('_tempstore', { internal: true });                                  // 74
  } else {                                                                                                             // 75
    throw new Error('FS.TempStore.Storage is not set: Install cfs:filesystem or cfs:gridfs or set it manually');       // 76
  }                                                                                                                    // 77
                                                                                                                       // 78
  FS.debug && console.log('TempStore is mounted on', FS.TempStore.Storage.typeName);                                   // 79
}                                                                                                                      // 80
                                                                                                                       // 81
function mountFile(fileObj, name) {                                                                                    // 82
  if (!fileObj.isMounted()) {                                                                                          // 83
    throw new Error(name + ' cannot work with unmounted file');                                                        // 84
  }                                                                                                                    // 85
}                                                                                                                      // 86
                                                                                                                       // 87
// We update the fileObj on progress                                                                                   // 88
FS.TempStore.on('progress', function(fileObj, chunkNum, count, total, result) {                                        // 89
  FS.debug && console.log('TempStore progress: Received ' + count + ' of ' + total + ' chunks for ' + fileObj.name()); // 90
});                                                                                                                    // 91
                                                                                                                       // 92
// XXX: TODO                                                                                                           // 93
// FS.TempStore.on('stored', function(fileObj, chunkCount, result) {                                                   // 94
//   // This should work if we pass on result from the SA on stored event...                                           // 95
//   fileObj.update({ $set: { chunkSum: 1, chunkCount: chunkCount, size: result.size } });                             // 96
// });                                                                                                                 // 97
                                                                                                                       // 98
// Stream implementation                                                                                               // 99
                                                                                                                       // 100
/**                                                                                                                    // 101
 * @method _chunkPath                                                                                                  // 102
 * @private                                                                                                            // 103
 * @param {Number} [n] Chunk number                                                                                    // 104
 * @returns {String} Chunk naming convention                                                                           // 105
 */                                                                                                                    // 106
_chunkPath = function(n) {                                                                                             // 107
  return (n || 0) + '.chunk';                                                                                          // 108
};                                                                                                                     // 109
                                                                                                                       // 110
/**                                                                                                                    // 111
 * @method _fileReference                                                                                              // 112
 * @param {FS.File} fileObj                                                                                            // 113
 * @param {Number} chunk                                                                                               // 114
 * @private                                                                                                            // 115
 * @returns {String} Generated SA specific fileKey for the chunk                                                       // 116
 *                                                                                                                     // 117
 * Note: Calling function should call mountStorage() first, and                                                        // 118
 * make sure that fileObj is mounted.                                                                                  // 119
 */                                                                                                                    // 120
_fileReference = function(fileObj, chunk, existing) {                                                                  // 121
  // Maybe it's a chunk we've already saved                                                                            // 122
  existing = existing || tracker.findOne({fileId: fileObj._id, collectionName: fileObj.collectionName});               // 123
                                                                                                                       // 124
  // Make a temporary fileObj just for fileKey generation                                                              // 125
  var tempFileObj = new FS.File({                                                                                      // 126
    collectionName: fileObj.collectionName,                                                                            // 127
    _id: fileObj._id,                                                                                                  // 128
    original: {                                                                                                        // 129
      name: _chunkPath(chunk)                                                                                          // 130
    },                                                                                                                 // 131
    copies: {                                                                                                          // 132
      _tempstore: {                                                                                                    // 133
        key: existing && existing.keys[chunk]                                                                          // 134
      }                                                                                                                // 135
    }                                                                                                                  // 136
  });                                                                                                                  // 137
                                                                                                                       // 138
  // Return a fitting fileKey SA specific                                                                              // 139
  return FS.TempStore.Storage.adapter.fileKey(tempFileObj);                                                            // 140
};                                                                                                                     // 141
                                                                                                                       // 142
/**                                                                                                                    // 143
 * @method FS.TempStore.exists                                                                                         // 144
 * @param {FS.File} File object                                                                                        // 145
 * @returns {Boolean} Is this file, or parts of it, currently stored in the TempStore                                  // 146
 */                                                                                                                    // 147
FS.TempStore.exists = function(fileObj) {                                                                              // 148
  var existing = tracker.findOne({fileId: fileObj._id, collectionName: fileObj.collectionName});                       // 149
  return !!existing;                                                                                                   // 150
};                                                                                                                     // 151
                                                                                                                       // 152
/**                                                                                                                    // 153
 * @method FS.TempStore.listParts                                                                                      // 154
 * @param {FS.File} fileObj                                                                                            // 155
 * @returns {Object} of parts already stored                                                                           // 156
 * @todo This is not yet implemented, milestone 1.1.0                                                                  // 157
 */                                                                                                                    // 158
FS.TempStore.listParts = function fsTempStoreListParts(fileObj) {                                                      // 159
  var self = this;                                                                                                     // 160
  console.warn('This function is not correctly implemented using SA in TempStore');                                    // 161
  //XXX This function might be necessary for resume. Not currently supported.                                          // 162
};                                                                                                                     // 163
                                                                                                                       // 164
/**                                                                                                                    // 165
 * @method FS.TempStore.removeFile                                                                                     // 166
 * @public                                                                                                             // 167
 * @param {FS.File} fileObj                                                                                            // 168
 * This function removes the file from tempstorage - it cares not if file is                                           // 169
 * already removed or not found, goal is reached anyway.                                                               // 170
 */                                                                                                                    // 171
FS.TempStore.removeFile = function fsTempStoreRemoveFile(fileObj) {                                                    // 172
  var self = this;                                                                                                     // 173
                                                                                                                       // 174
  // Ensure that we have a storage adapter mounted; if not, throw an error.                                            // 175
  mountStorage();                                                                                                      // 176
                                                                                                                       // 177
  // If fileObj is not mounted or can't be, throw an error                                                             // 178
  mountFile(fileObj, 'FS.TempStore.removeFile');                                                                       // 179
                                                                                                                       // 180
  // Emit event                                                                                                        // 181
  self.emit('remove', fileObj);                                                                                        // 182
                                                                                                                       // 183
  var chunkInfo = tracker.findOne({                                                                                    // 184
    fileId: fileObj._id,                                                                                               // 185
    collectionName: fileObj.collectionName                                                                             // 186
  });                                                                                                                  // 187
                                                                                                                       // 188
  if (chunkInfo) {                                                                                                     // 189
                                                                                                                       // 190
    // Unlink each file                                                                                                // 191
    FS.Utility.each(chunkInfo.keys || {}, function (key, chunk) {                                                      // 192
      var fileKey = _fileReference(fileObj, chunk, chunkInfo);                                                         // 193
      FS.TempStore.Storage.adapter.remove(fileKey, FS.Utility.noop);                                                   // 194
    });                                                                                                                // 195
                                                                                                                       // 196
    // Remove fileObj from tracker collection, too                                                                     // 197
    tracker.remove({_id: chunkInfo._id});                                                                              // 198
                                                                                                                       // 199
  }                                                                                                                    // 200
};                                                                                                                     // 201
                                                                                                                       // 202
/**                                                                                                                    // 203
 * @method FS.TempStore.removeAll                                                                                      // 204
 * @public                                                                                                             // 205
 * This function removes all files from tempstorage - it cares not if file is                                          // 206
 * already removed or not found, goal is reached anyway.                                                               // 207
 */                                                                                                                    // 208
FS.TempStore.removeAll = function fsTempStoreRemoveAll() {                                                             // 209
  var self = this;                                                                                                     // 210
                                                                                                                       // 211
  // Ensure that we have a storage adapter mounted; if not, throw an error.                                            // 212
  mountStorage();                                                                                                      // 213
                                                                                                                       // 214
  tracker.find().forEach(function (chunkInfo) {                                                                        // 215
    // Unlink each file                                                                                                // 216
    FS.Utility.each(chunkInfo.keys || {}, function (key, chunk) {                                                      // 217
      var fileKey = _fileReference({_id: chunkInfo.fileId, collectionName: chunkInfo.collectionName}, chunk, chunkInfo);
      FS.TempStore.Storage.adapter.remove(fileKey, FS.Utility.noop);                                                   // 219
    });                                                                                                                // 220
                                                                                                                       // 221
    // Remove from tracker collection, too                                                                             // 222
    tracker.remove({_id: chunkInfo._id});                                                                              // 223
  });                                                                                                                  // 224
};                                                                                                                     // 225
                                                                                                                       // 226
/**                                                                                                                    // 227
 * @method FS.TempStore.createWriteStream                                                                              // 228
 * @public                                                                                                             // 229
 * @param {FS.File} fileObj File to store in temporary storage                                                         // 230
 * @param {Number | String} [options]                                                                                  // 231
 * @returns {Stream} Writeable stream                                                                                  // 232
 *                                                                                                                     // 233
 * `options` of different types mean differnt things:                                                                  // 234
 * * `undefined` We store the file in one part                                                                         // 235
 * *(Normal server-side api usage)*                                                                                    // 236
 * * `Number` the number is the part number total                                                                      // 237
 * *(multipart uploads will use this api)*                                                                             // 238
 * * `String` the string is the name of the `store` that wants to store file data                                      // 239
 * *(stores that want to sync their data to the rest of the files stores will use this)*                               // 240
 *                                                                                                                     // 241
 * > Note: fileObj must be mounted on a `FS.Collection`, it makes no sense to store otherwise                          // 242
 */                                                                                                                    // 243
FS.TempStore.createWriteStream = function(fileObj, options) {                                                          // 244
  var self = this;                                                                                                     // 245
                                                                                                                       // 246
  // Ensure that we have a storage adapter mounted; if not, throw an error.                                            // 247
  mountStorage();                                                                                                      // 248
                                                                                                                       // 249
  // If fileObj is not mounted or can't be, throw an error                                                             // 250
  mountFile(fileObj, 'FS.TempStore.createWriteStream');                                                                // 251
                                                                                                                       // 252
  // Cache the selector for use multiple times below                                                                   // 253
  var selector = {fileId: fileObj._id, collectionName: fileObj.collectionName};                                        // 254
                                                                                                                       // 255
  // TODO, should pass in chunkSum so we don't need to use FS.File for it                                              // 256
  var chunkSum = fileObj.chunkSum || 1;                                                                                // 257
                                                                                                                       // 258
  // Add fileObj to tracker collection                                                                                 // 259
  tracker.upsert(selector, {$setOnInsert: {keys: {}}});                                                                // 260
                                                                                                                       // 261
  // Determine how we're using the writeStream                                                                         // 262
  var isOnePart = false, isMultiPart = false, isStoreSync = false, chunkNum = 0;                                       // 263
  if (options === +options) {                                                                                          // 264
    isMultiPart = true;                                                                                                // 265
    chunkNum = options;                                                                                                // 266
  } else if (options === ''+options) {                                                                                 // 267
    isStoreSync = true;                                                                                                // 268
  } else {                                                                                                             // 269
    isOnePart = true;                                                                                                  // 270
  }                                                                                                                    // 271
                                                                                                                       // 272
  // XXX: it should be possible for a store to sync by storing data into the                                           // 273
  // tempstore - this could be done nicely by setting the store name as string                                         // 274
  // in the chunk variable?                                                                                            // 275
  // This store name could be passed on the the fileworker via the uploaded                                            // 276
  // event                                                                                                             // 277
  // So the uploaded event can return:                                                                                 // 278
  // undefined - if data is stored into and should sync out to all storage adapters                                    // 279
  // number - if a chunk has been uploaded                                                                             // 280
  // string - if a storage adapter wants to sync its data to the other SA's                                            // 281
                                                                                                                       // 282
  // Find a nice location for the chunk data                                                                           // 283
  var fileKey = _fileReference(fileObj, chunkNum);                                                                     // 284
                                                                                                                       // 285
  // Create the stream as Meteor safe stream                                                                           // 286
  var writeStream = FS.TempStore.Storage.adapter.createWriteStream(fileKey);                                           // 287
                                                                                                                       // 288
  // When the stream closes we update the chunkCount                                                                   // 289
  writeStream.safeOn('stored', function(result) {                                                                      // 290
    // Save key in tracker document                                                                                    // 291
    var setObj = {};                                                                                                   // 292
    setObj['keys.' + chunkNum] = result.fileKey;                                                                       // 293
    tracker.update(selector, {$set: setObj});                                                                          // 294
                                                                                                                       // 295
    // Get updated chunkCount                                                                                          // 296
    var chunkCount = FS.Utility.size(tracker.findOne(selector).keys);                                                  // 297
                                                                                                                       // 298
    // Progress                                                                                                        // 299
    self.emit('progress', fileObj, chunkNum, chunkCount, chunkSum, result);                                            // 300
                                                                                                                       // 301
    // If upload is completed                                                                                          // 302
    if (chunkCount === chunkSum) {                                                                                     // 303
      // We no longer need the chunk info                                                                              // 304
      var modifier = { $set: {}, $unset: {chunkCount: 1, chunkSum: 1, chunkSize: 1} };                                 // 305
                                                                                                                       // 306
      // Check if the file has been uploaded before                                                                    // 307
      if (typeof fileObj.uploadedAt === 'undefined') {                                                                 // 308
        // We set the uploadedAt date                                                                                  // 309
        modifier.$set.uploadedAt = new Date();                                                                         // 310
      } else {                                                                                                         // 311
        // We have been uploaded so an event were file data is updated is                                              // 312
        // called synchronizing - so this must be a synchronizedAt?                                                    // 313
        modifier.$set.synchronizedAt = new Date();                                                                     // 314
      }                                                                                                                // 315
                                                                                                                       // 316
      // Update the fileObject                                                                                         // 317
      fileObj.update(modifier);                                                                                        // 318
                                                                                                                       // 319
      // Fire ending events                                                                                            // 320
      var eventName = isStoreSync ? 'synchronized' : 'stored';                                                         // 321
      self.emit(eventName, fileObj, result);                                                                           // 322
                                                                                                                       // 323
      // XXX is emitting "ready" necessary?                                                                            // 324
      self.emit('ready', fileObj, chunkCount, result);                                                                 // 325
    } else {                                                                                                           // 326
      // Update the chunkCount on the fileObject                                                                       // 327
      fileObj.update({ $set: {chunkCount: chunkCount} });                                                              // 328
    }                                                                                                                  // 329
  });                                                                                                                  // 330
                                                                                                                       // 331
  // Emit errors                                                                                                       // 332
  writeStream.on('error', function (error) {                                                                           // 333
    FS.debug && console.log('TempStore writeStream error:', error);                                                    // 334
    self.emit('error', error, fileObj);                                                                                // 335
  });                                                                                                                  // 336
                                                                                                                       // 337
  return writeStream;                                                                                                  // 338
};                                                                                                                     // 339
                                                                                                                       // 340
/**                                                                                                                    // 341
  * @method FS.TempStore.createReadStream                                                                              // 342
  * @public                                                                                                            // 343
  * @param {FS.File} fileObj The file to read                                                                          // 344
  * @return {Stream} Returns readable stream                                                                           // 345
  *                                                                                                                    // 346
  */                                                                                                                   // 347
FS.TempStore.createReadStream = function(fileObj) {                                                                    // 348
  // Ensure that we have a storage adapter mounted; if not, throw an error.                                            // 349
  mountStorage();                                                                                                      // 350
                                                                                                                       // 351
  // If fileObj is not mounted or can't be, throw an error                                                             // 352
  mountFile(fileObj, 'FS.TempStore.createReadStream');                                                                 // 353
                                                                                                                       // 354
  FS.debug && console.log('FS.TempStore creating read stream for ' + fileObj._id);                                     // 355
                                                                                                                       // 356
  // Determine how many total chunks there are from the tracker collection                                             // 357
  var chunkInfo = tracker.findOne({fileId: fileObj._id, collectionName: fileObj.collectionName}) || {};                // 358
  var totalChunks = FS.Utility.size(chunkInfo.keys);                                                                   // 359
                                                                                                                       // 360
  function getNextStreamFunc(chunk) {                                                                                  // 361
    return Meteor.bindEnvironment(function(next) {                                                                     // 362
      var fileKey = _fileReference(fileObj, chunk);                                                                    // 363
      var chunkReadStream = FS.TempStore.Storage.adapter.createReadStream(fileKey);                                    // 364
      next(chunkReadStream);                                                                                           // 365
    }, function (error) {                                                                                              // 366
      throw error;                                                                                                     // 367
    });                                                                                                                // 368
  }                                                                                                                    // 369
                                                                                                                       // 370
  // Make a combined stream                                                                                            // 371
  var combinedStream = CombinedStream.create();                                                                        // 372
                                                                                                                       // 373
  // Add each chunk stream to the combined stream when the previous chunk stream ends                                  // 374
  var currentChunk = 0;                                                                                                // 375
  for (var chunk = 0; chunk < totalChunks; chunk++) {                                                                  // 376
    combinedStream.append(getNextStreamFunc(chunk));                                                                   // 377
  }                                                                                                                    // 378
                                                                                                                       // 379
  // Return the combined stream                                                                                        // 380
  return combinedStream;                                                                                               // 381
};                                                                                                                     // 382
                                                                                                                       // 383
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 393
}).call(this);                                                       // 394
                                                                     // 395
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:tempstore'] = {};

})();

//# sourceMappingURL=cfs_tempstore.js.map
