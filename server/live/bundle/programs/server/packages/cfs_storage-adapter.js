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
var EJSON = Package.ejson.EJSON;
var EventEmitter = Package['raix:eventemitter'].EventEmitter;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var _storageAdapters;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs_storage-adapter/packages/cfs_storage-adapter.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
(function () {                                                                                                         // 1
                                                                                                                       // 2
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                                               //    // 4
// packages/cfs:storage-adapter/storageAdapter.server.js                                                         //    // 5
//                                                                                                               //    // 6
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                                                 //    // 8
/* global FS, _storageAdapters:true, EventEmitter */                                                             // 1  // 9
                                                                                                                 // 2  // 10
// #############################################################################                                 // 3  // 11
//                                                                                                               // 4  // 12
// STORAGE ADAPTER                                                                                               // 5  // 13
//                                                                                                               // 6  // 14
// #############################################################################                                 // 7  // 15
_storageAdapters = {};                                                                                           // 8  // 16
                                                                                                                 // 9  // 17
FS.StorageAdapter = function(storeName, options, api) {                                                          // 10
  var self = this, fileKeyMaker;                                                                                 // 11
  options = options || {};                                                                                       // 12
                                                                                                                 // 13
  // If storeName is the only argument, a string and the SA already found                                        // 14
  // we will just return that SA                                                                                 // 15
  if (arguments.length === 1 && storeName === '' + storeName &&                                                  // 16
          typeof _storageAdapters[storeName] !== 'undefined')                                                    // 17
    return _storageAdapters[storeName];                                                                          // 18
                                                                                                                 // 19
  // Verify that the storage adapter defines all the necessary API methods                                       // 20
  if (typeof api === 'undefined') {                                                                              // 21
    throw new Error('FS.StorageAdapter please define an api');                                                   // 22
  }                                                                                                              // 23
                                                                                                                 // 24
  FS.Utility.each('fileKey,remove,typeName,createReadStream,createWriteStream'.split(','), function(name) {      // 25
    if (typeof api[name] === 'undefined') {                                                                      // 26
      throw new Error('FS.StorageAdapter please define an api. "' + name + '" ' + (api.typeName || ''));         // 27
    }                                                                                                            // 28
  });                                                                                                            // 29
                                                                                                                 // 30
  // Create an internal namespace, starting a name with underscore is only                                       // 31
  // allowed for stores marked with options.internal === true                                                    // 32
  if (options.internal !== true && storeName[0] === '_') {                                                       // 33
    throw new Error('A storage adapter name may not begin with "_"');                                            // 34
  }                                                                                                              // 35
                                                                                                                 // 36
  if (storeName.indexOf('.') !== -1) {                                                                           // 37
    throw new Error('A storage adapter name may not contain a "."');                                             // 38
  }                                                                                                              // 39
                                                                                                                 // 40
  // store reference for easy lookup by storeName                                                                // 41
  if (typeof _storageAdapters[storeName] !== 'undefined') {                                                      // 42
    throw new Error('Storage name already exists: "' + storeName + '"');                                         // 43
  } else {                                                                                                       // 44
    _storageAdapters[storeName] = self;                                                                          // 45
  }                                                                                                              // 46
                                                                                                                 // 47
  // User can customize the file key generation function                                                         // 48
  if (typeof options.fileKeyMaker === "function") {                                                              // 49
    fileKeyMaker = options.fileKeyMaker;                                                                         // 50
  } else {                                                                                                       // 51
    fileKeyMaker = api.fileKey;                                                                                  // 52
  }                                                                                                              // 53
                                                                                                                 // 54
  // User can provide a function to adjust the fileObj                                                           // 55
  // before it is written to the store.                                                                          // 56
  var beforeWrite = options.beforeWrite;                                                                         // 57
                                                                                                                 // 58
  // extend self with options and other info                                                                     // 59
  FS.Utility.extend(this, options, {                                                                             // 60
    name: storeName,                                                                                             // 61
    typeName: api.typeName                                                                                       // 62
  });                                                                                                            // 63
                                                                                                                 // 64
  // Create a nicer abstracted adapter interface                                                                 // 65
  self.adapter = {};                                                                                             // 66
                                                                                                                 // 67
  self.adapter.fileKey = function(fileObj) {                                                                     // 68
    return fileKeyMaker(fileObj);                                                                                // 69
  };                                                                                                             // 70
                                                                                                                 // 71
  // Return readable stream for fileKey                                                                          // 72
  self.adapter.createReadStreamForFileKey = function(fileKey, options) {                                         // 73
    if (FS.debug) console.log('createReadStreamForFileKey ' + storeName);                                        // 74
    return FS.Utility.safeStream( api.createReadStream(fileKey, options) );                                      // 75
  };                                                                                                             // 76
                                                                                                                 // 77
  // Return readable stream for fileObj                                                                          // 78
  self.adapter.createReadStream = function(fileObj, options) {                                                   // 79
    if (FS.debug) console.log('createReadStream ' + storeName);                                                  // 80
    if (self.internal) {                                                                                         // 81
      // Internal stores take a fileKey                                                                          // 82
      return self.adapter.createReadStreamForFileKey(fileObj, options);                                          // 83
    }                                                                                                            // 84
    return FS.Utility.safeStream( self._transform.createReadStream(fileObj, options) );                          // 85
  };                                                                                                             // 86
                                                                                                                 // 87
  function logEventsForStream(stream) {                                                                          // 88
    if (FS.debug) {                                                                                              // 89
      stream.on('stored', function() {                                                                           // 90
        console.log('-----------STORED STREAM', storeName);                                                      // 91
      });                                                                                                        // 92
                                                                                                                 // 93
      stream.on('close', function() {                                                                            // 94
        console.log('-----------CLOSE STREAM', storeName);                                                       // 95
      });                                                                                                        // 96
                                                                                                                 // 97
      stream.on('end', function() {                                                                              // 98
        console.log('-----------END STREAM', storeName);                                                         // 99
      });                                                                                                        // 100
                                                                                                                 // 101
      stream.on('finish', function() {                                                                           // 102
        console.log('-----------FINISH STREAM', storeName);                                                      // 103
      });                                                                                                        // 104
                                                                                                                 // 105
      stream.on('error', function(error) {                                                                       // 106
        console.log('-----------ERROR STREAM', storeName, error && (error.message || error.code));               // 107
      });                                                                                                        // 108
    }                                                                                                            // 109
  }                                                                                                              // 110
                                                                                                                 // 111
  // Return writeable stream for fileKey                                                                         // 112
  self.adapter.createWriteStreamForFileKey = function(fileKey, options) {                                        // 113
    if (FS.debug) console.log('createWriteStreamForFileKey ' + storeName);                                       // 114
    var writeStream = FS.Utility.safeStream( api.createWriteStream(fileKey, options) );                          // 115
                                                                                                                 // 116
    logEventsForStream(writeStream);                                                                             // 117
                                                                                                                 // 118
    return writeStream;                                                                                          // 119
  };                                                                                                             // 120
                                                                                                                 // 121
  // Return writeable stream for fileObj                                                                         // 122
  self.adapter.createWriteStream = function(fileObj, options) {                                                  // 123
    if (FS.debug) console.log('createWriteStream ' + storeName + ', internal: ' + !!self.internal);              // 124
                                                                                                                 // 125
    if (self.internal) {                                                                                         // 126
      // Internal stores take a fileKey                                                                          // 127
      return self.adapter.createWriteStreamForFileKey(fileObj, options);                                         // 128
    }                                                                                                            // 129
                                                                                                                 // 130
    // If we haven't set name, type, or size for this version yet,                                               // 131
    // set it to same values as original version. We don't save                                                  // 132
    // these to the DB right away because they might be changed                                                  // 133
    // in a transformWrite function.                                                                             // 134
    if (!fileObj.name({store: storeName})) {                                                                     // 135
      fileObj.name(fileObj.name(), {store: storeName, save: false});                                             // 136
    }                                                                                                            // 137
    if (!fileObj.type({store: storeName})) {                                                                     // 138
      fileObj.type(fileObj.type(), {store: storeName, save: false});                                             // 139
    }                                                                                                            // 140
    if (!fileObj.size({store: storeName})) {                                                                     // 141
      fileObj.size(fileObj.size(), {store: storeName, save: false});                                             // 142
    }                                                                                                            // 143
                                                                                                                 // 144
    // Call user function to adjust file metadata for this store.                                                // 145
    // We support updating name, extension, and/or type based on                                                 // 146
    // info returned in an object. Or `fileObj` could be                                                         // 147
    // altered directly within the beforeWrite function.                                                         // 148
    if (beforeWrite) {                                                                                           // 149
      var fileChanges = beforeWrite(fileObj);                                                                    // 150
      if (typeof fileChanges === "object") {                                                                     // 151
        if (fileChanges.extension) {                                                                             // 152
          fileObj.extension(fileChanges.extension, {store: storeName, save: false});                             // 153
        } else if (fileChanges.name) {                                                                           // 154
          fileObj.name(fileChanges.name, {store: storeName, save: false});                                       // 155
        }                                                                                                        // 156
        if (fileChanges.type) {                                                                                  // 157
          fileObj.type(fileChanges.type, {store: storeName, save: false});                                       // 158
        }                                                                                                        // 159
      }                                                                                                          // 160
    }                                                                                                            // 161
                                                                                                                 // 162
    var writeStream = FS.Utility.safeStream( self._transform.createWriteStream(fileObj, options) );              // 163
                                                                                                                 // 164
    logEventsForStream(writeStream);                                                                             // 165
                                                                                                                 // 166
    // Its really only the storage adapter who knows if the file is uploaded                                     // 167
    //                                                                                                           // 168
    // We have to use our own event making sure the storage process is completed                                 // 169
    // this is mainly                                                                                            // 170
    writeStream.safeOn('stored', function(result) {                                                              // 171
      if (typeof result.fileKey === 'undefined') {                                                               // 172
        throw new Error('SA ' + storeName + ' type ' + api.typeName + ' did not return a fileKey');              // 173
      }                                                                                                          // 174
      if (FS.debug) console.log('SA', storeName, 'stored', result.fileKey);                                      // 175
      // Set the fileKey                                                                                         // 176
      fileObj.copies[storeName].key = result.fileKey;                                                            // 177
                                                                                                                 // 178
      // Update the size, as provided by the SA, in case it was changed by stream transformation                 // 179
      if (typeof result.size === "number") {                                                                     // 180
        fileObj.copies[storeName].size = result.size;                                                            // 181
      }                                                                                                          // 182
                                                                                                                 // 183
      // Set last updated time, either provided by SA or now                                                     // 184
      fileObj.copies[storeName].updatedAt = result.storedAt || new Date();                                       // 185
                                                                                                                 // 186
      // If the file object copy havent got a createdAt then set this                                            // 187
      if (typeof fileObj.copies[storeName].createdAt === 'undefined') {                                          // 188
        fileObj.copies[storeName].createdAt = fileObj.copies[storeName].updatedAt;                               // 189
      }                                                                                                          // 190
                                                                                                                 // 191
      fileObj._saveChanges(storeName);                                                                           // 192
                                                                                                                 // 193
      // There is code in transform that may have set the original file size, too.                               // 194
      fileObj._saveChanges('_original');                                                                         // 195
    });                                                                                                          // 196
                                                                                                                 // 197
    // Emit events from SA                                                                                       // 198
    writeStream.once('stored', function(/*result*/) {                                                            // 199
      // XXX Because of the way stores inherit from SA, this will emit on every store.                           // 200
      // Maybe need to rewrite the way we inherit from SA?                                                       // 201
      var emitted = self.emit('stored', storeName, fileObj);                                                     // 202
      if (FS.debug && !emitted) {                                                                                // 203
        console.log(fileObj.name() + ' was successfully stored in the ' + storeName + ' store. You are seeing this informational message because you enabled debugging and you have not defined any listeners for the "stored" event on this store.');
      }                                                                                                          // 205
    });                                                                                                          // 206
                                                                                                                 // 207
    writeStream.on('error', function(error) {                                                                    // 208
      // XXX We could wrap and clarify error                                                                     // 209
      // XXX Because of the way stores inherit from SA, this will emit on every store.                           // 210
      // Maybe need to rewrite the way we inherit from SA?                                                       // 211
      var emitted = self.emit('error', storeName, error, fileObj);                                               // 212
      if (FS.debug && !emitted) {                                                                                // 213
        console.log(error);                                                                                      // 214
      }                                                                                                          // 215
    });                                                                                                          // 216
                                                                                                                 // 217
    return writeStream;                                                                                          // 218
  };                                                                                                             // 219
                                                                                                                 // 220
  //internal                                                                                                     // 221
  self._removeAsync = function(fileKey, callback) {                                                              // 222
    // Remove the file from the store                                                                            // 223
    api.remove.call(self, fileKey, callback);                                                                    // 224
  };                                                                                                             // 225
                                                                                                                 // 226
  /**                                                                                                            // 227
   * @method FS.StorageAdapter.prototype.remove                                                                  // 228
   * @public                                                                                                     // 229
   * @param {FS.File} fsFile The FS.File instance to be stored.                                                  // 230
   * @param {Function} [callback] If not provided, will block and return true or false                           // 231
   *                                                                                                             // 232
   * Attempts to remove a file from the store. Returns true if removed or not                                    // 233
   * found, or false if the file couldn't be removed.                                                            // 234
   */                                                                                                            // 235
  self.adapter.remove = function(fileObj, callback) {                                                            // 236
    if (FS.debug) console.log("---SA REMOVE");                                                                   // 237
                                                                                                                 // 238
    // Get the fileKey                                                                                           // 239
    var fileKey = (fileObj instanceof FS.File) ? self.adapter.fileKey(fileObj) : fileObj;                        // 240
                                                                                                                 // 241
    if (callback) {                                                                                              // 242
      return self._removeAsync(fileKey, FS.Utility.safeCallback(callback));                                      // 243
    } else {                                                                                                     // 244
      return Meteor.wrapAsync(self._removeAsync)(fileKey);                                                       // 245
    }                                                                                                            // 246
  };                                                                                                             // 247
                                                                                                                 // 248
  self.remove = function(fileObj, callback) {                                                                    // 249
    // Add deprecation note                                                                                      // 250
    console.warn('Storage.remove is deprecating, use "Storage.adapter.remove"');                                 // 251
    return self.adapter.remove(fileObj, callback);                                                               // 252
  };                                                                                                             // 253
                                                                                                                 // 254
  if (typeof api.init === 'function') {                                                                          // 255
    Meteor.wrapAsync(api.init.bind(self))();                                                                     // 256
  }                                                                                                              // 257
                                                                                                                 // 258
  // This supports optional transformWrite and transformRead                                                     // 259
  self._transform = new FS.Transform({                                                                           // 260
    adapter: self.adapter,                                                                                       // 261
    // Optional transformation functions:                                                                        // 262
    transformWrite: options.transformWrite,                                                                      // 263
    transformRead: options.transformRead                                                                         // 264
  });                                                                                                            // 265
                                                                                                                 // 266
};                                                                                                               // 267
                                                                                                                 // 268
Npm.require('util').inherits(FS.StorageAdapter, EventEmitter);                                                   // 269
                                                                                                                 // 270
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 279
                                                                                                                       // 280
}).call(this);                                                                                                         // 281
                                                                                                                       // 282
                                                                                                                       // 283
                                                                                                                       // 284
                                                                                                                       // 285
                                                                                                                       // 286
                                                                                                                       // 287
(function () {                                                                                                         // 288
                                                                                                                       // 289
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 290
//                                                                                                               //    // 291
// packages/cfs:storage-adapter/transform.server.js                                                              //    // 292
//                                                                                                               //    // 293
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 294
                                                                                                                 //    // 295
/* global FS, gm */                                                                                              // 1  // 296
                                                                                                                 // 2  // 297
var PassThrough = Npm.require('stream').PassThrough;                                                             // 3  // 298
var lengthStream = Npm.require('length-stream');                                                                 // 4  // 299
                                                                                                                 // 5  // 300
FS.Transform = function(options) {                                                                               // 6  // 301
  var self = this;                                                                                               // 7  // 302
                                                                                                                 // 8  // 303
  options = options || {};                                                                                       // 9  // 304
                                                                                                                 // 10
  if (!(self instanceof FS.Transform))                                                                           // 11
    throw new Error('FS.Transform must be called with the "new" keyword');                                       // 12
                                                                                                                 // 13
  if (!options.adapter)                                                                                          // 14
    throw new Error('Transform expects option.adapter to be a storage adapter');                                 // 15
                                                                                                                 // 16
  self.storage = options.adapter;                                                                                // 17
                                                                                                                 // 18
  // Fetch the transformation functions if any                                                                   // 19
  self.transformWrite = options.transformWrite;                                                                  // 20
  self.transformRead = options.transformRead;                                                                    // 21
};                                                                                                               // 22
                                                                                                                 // 23
// Allow packages to add scope                                                                                   // 24
FS.Transform.scope = {                                                                                           // 25
// Deprecate gm scope:                                                                                           // 26
  gm: function(source, height, color) {                                                                          // 27
    console.warn('Deprecation notice: `this.gm` is deprecating in favour of the general global `gm` scope');     // 28
    if (typeof gm !== 'function')                                                                                // 29
      throw new Error('No graphicsmagick package installed, `gm` not found in scope, eg. `cfs-graphicsmagick`'); // 30
    return gm(source, height, color);                                                                            // 31
  }                                                                                                              // 32
// EO Deprecate gm scope                                                                                         // 33
};                                                                                                               // 34
                                                                                                                 // 35
// The transformation stream triggers an "stored" event when data is stored into                                 // 36
// the storage adapter                                                                                           // 37
FS.Transform.prototype.createWriteStream = function(fileObj) {                                                   // 38
  var self = this;                                                                                               // 39
                                                                                                                 // 40
  // Get the file key                                                                                            // 41
  var fileKey = self.storage.fileKey(fileObj);                                                                   // 42
                                                                                                                 // 43
  // Rig write stream                                                                                            // 44
  var destinationStream = self.storage.createWriteStreamForFileKey(fileKey, {                                    // 45
    // Not all SA's can set these options and cfs dont depend on setting these                                   // 46
    // but its nice if other systems are accessing the SA that some of the data                                  // 47
    // is also available to those                                                                                // 48
    aliases: [fileObj.name()],                                                                                   // 49
    contentType: fileObj.type(),                                                                                 // 50
    metadata: fileObj.metadata                                                                                   // 51
  });                                                                                                            // 52
                                                                                                                 // 53
  // Pass through transformWrite function if provided                                                            // 54
  if (typeof self.transformWrite === 'function') {                                                               // 55
                                                                                                                 // 56
    destinationStream = addPassThrough(destinationStream, function (ptStream, originalStream) {                  // 57
      // Rig transform                                                                                           // 58
      try {                                                                                                      // 59
        self.transformWrite.call(FS.Transform.scope, fileObj, ptStream, originalStream);                         // 60
        // XXX: If the transform function returns a buffer should we stream that?                                // 61
      } catch(err) {                                                                                             // 62
        // We emit an error - should we throw an error?                                                          // 63
        console.warn('FS.Transform.createWriteStream transform function failed, Error: ');                       // 64
        throw err;                                                                                               // 65
      }                                                                                                          // 66
    });                                                                                                          // 67
                                                                                                                 // 68
  }                                                                                                              // 69
                                                                                                                 // 70
  // If original doesn't have size, add another PassThrough to get and set the size.                             // 71
  // This will run on size=0, too, which is OK.                                                                  // 72
  // NOTE: This must come AFTER the transformWrite code block above. This might seem                             // 73
  // confusing, but by coming after it, this will actually be executed BEFORE the user's                         // 74
  // transform, which is what we need in order to be sure we get the original file                               // 75
  // size and not the transformed file size.                                                                     // 76
  if (!fileObj.size()) {                                                                                         // 77
    destinationStream = addPassThrough(destinationStream, function (ptStream, originalStream) {                  // 78
      var lstream = lengthStream(function (fileSize) {                                                           // 79
        fileObj.size(fileSize, {save: false});                                                                   // 80
      });                                                                                                        // 81
                                                                                                                 // 82
      ptStream.pipe(lstream).pipe(originalStream);                                                               // 83
    });                                                                                                          // 84
  }                                                                                                              // 85
                                                                                                                 // 86
  return destinationStream;                                                                                      // 87
};                                                                                                               // 88
                                                                                                                 // 89
FS.Transform.prototype.createReadStream = function(fileObj, options) {                                           // 90
  var self = this;                                                                                               // 91
                                                                                                                 // 92
  // Get the file key                                                                                            // 93
  var fileKey = self.storage.fileKey(fileObj);                                                                   // 94
                                                                                                                 // 95
  // Rig read stream                                                                                             // 96
  var sourceStream = self.storage.createReadStreamForFileKey(fileKey, options);                                  // 97
                                                                                                                 // 98
  // Pass through transformRead function if provided                                                             // 99
  if (typeof self.transformRead === 'function') {                                                                // 100
                                                                                                                 // 101
    sourceStream = addPassThrough(sourceStream, function (ptStream, originalStream) {                            // 102
      // Rig transform                                                                                           // 103
      try {                                                                                                      // 104
        self.transformRead.call(FS.Transform.scope, fileObj, originalStream, ptStream);                          // 105
      } catch(err) {                                                                                             // 106
        //throw new Error(err);                                                                                  // 107
        // We emit an error - should we throw an error?                                                          // 108
        sourceStream.emit('error', 'FS.Transform.createReadStream transform function failed');                   // 109
      }                                                                                                          // 110
    });                                                                                                          // 111
                                                                                                                 // 112
  }                                                                                                              // 113
                                                                                                                 // 114
  // We dont transform just normal SA interface                                                                  // 115
  return sourceStream;                                                                                           // 116
};                                                                                                               // 117
                                                                                                                 // 118
// Utility function to simplify adding layers of passthrough                                                     // 119
function addPassThrough(stream, func) {                                                                          // 120
  var pts = new PassThrough();                                                                                   // 121
  // We pass on the special "stored" event for those listening                                                   // 122
  stream.on('stored', function(result) {                                                                         // 123
    pts.emit('stored', result);                                                                                  // 124
  });                                                                                                            // 125
  func(pts, stream);                                                                                             // 126
  return pts;                                                                                                    // 127
}                                                                                                                // 128
                                                                                                                 // 129
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////    // 425
                                                                                                                       // 426
}).call(this);                                                                                                         // 427
                                                                                                                       // 428
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:storage-adapter'] = {};

})();

//# sourceMappingURL=cfs_storage-adapter.js.map
