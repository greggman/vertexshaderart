(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var DataMan;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/cfs_data-man/packages/cfs_data-man.js                    //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {                                                       // 1
                                                                     // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:data-man/server/data-man-api.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global DataMan:true, Buffer */                                                                                      // 1
                                                                                                                       // 2
var fs = Npm.require("fs");                                                                                            // 3
var Readable = Npm.require('stream').Readable;                                                                         // 4
                                                                                                                       // 5
/**                                                                                                                    // 6
 * @method DataMan                                                                                                     // 7
 * @public                                                                                                             // 8
 * @constructor                                                                                                        // 9
 * @param {Buffer|ArrayBuffer|Uint8Array|String} data The data that you want to manipulate.                            // 10
 * @param {String} [type] The data content (MIME) type, if known. Required if the first argument is a Buffer, ArrayBuffer, Uint8Array, or URL
 * @param {Object} [options] Currently used only to pass options for the GET request when `data` is a URL.             // 12
 */                                                                                                                    // 13
DataMan = function DataMan(data, type, options) {                                                                      // 14
  var self = this, buffer;                                                                                             // 15
                                                                                                                       // 16
  if (!data) {                                                                                                         // 17
    throw new Error("DataMan constructor requires a data argument");                                                   // 18
  }                                                                                                                    // 19
                                                                                                                       // 20
  // The end result of all this is that we will have this.source set to a correct                                      // 21
  // data type handler. We are simply detecting what the data arg is.                                                  // 22
  //                                                                                                                   // 23
  // Unless we already have in-memory data, we don't load anything into memory                                         // 24
  // and instead rely on obtaining a read stream when the time comes.                                                  // 25
  if (typeof Buffer !== "undefined" && data instanceof Buffer) {                                                       // 26
    if (!type) {                                                                                                       // 27
      throw new Error("DataMan constructor requires a type argument when passed a Buffer");                            // 28
    }                                                                                                                  // 29
    self.source = new DataMan.Buffer(data, type);                                                                      // 30
  } else if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) {                                      // 31
    if (typeof Buffer === "undefined") {                                                                               // 32
      throw new Error("Buffer support required to handle an ArrayBuffer");                                             // 33
    }                                                                                                                  // 34
    if (!type) {                                                                                                       // 35
      throw new Error("DataMan constructor requires a type argument when passed an ArrayBuffer");                      // 36
    }                                                                                                                  // 37
    buffer = new Buffer(new Uint8Array(data));                                                                         // 38
    self.source = new DataMan.Buffer(buffer, type);                                                                    // 39
  } else if (EJSON.isBinary(data)) {                                                                                   // 40
    if (typeof Buffer === "undefined") {                                                                               // 41
      throw new Error("Buffer support required to handle an ArrayBuffer");                                             // 42
    }                                                                                                                  // 43
    if (!type) {                                                                                                       // 44
      throw new Error("DataMan constructor requires a type argument when passed a Uint8Array");                        // 45
    }                                                                                                                  // 46
    buffer = new Buffer(data);                                                                                         // 47
    self.source = new DataMan.Buffer(buffer, type);                                                                    // 48
  } else if (typeof Readable !== "undefined" && data instanceof Readable) {                                            // 49
    if (!type) {                                                                                                       // 50
      throw new Error("DataMan constructor requires a type argument when passed a stream.Readable");                   // 51
    }                                                                                                                  // 52
    self.source = new DataMan.ReadStream(data, type);                                                                  // 53
  } else if (typeof data === "string") {                                                                               // 54
    if (data.slice(0, 5) === "data:") {                                                                                // 55
      self.source = new DataMan.DataURI(data);                                                                         // 56
    } else if (data.slice(0, 5) === "http:" || data.slice(0, 6) === "https:") {                                        // 57
      if (!type) {                                                                                                     // 58
        throw new Error("DataMan constructor requires a type argument when passed a URL");                             // 59
      }                                                                                                                // 60
      self.source = new DataMan.URL(data, type, options);                                                              // 61
    } else {                                                                                                           // 62
      // assume it's a filepath                                                                                        // 63
      self.source = new DataMan.FilePath(data, type);                                                                  // 64
    }                                                                                                                  // 65
  } else {                                                                                                             // 66
    throw new Error("DataMan constructor received data that it doesn't support");                                      // 67
  }                                                                                                                    // 68
};                                                                                                                     // 69
                                                                                                                       // 70
/**                                                                                                                    // 71
 * @method DataMan.prototype.getBuffer                                                                                 // 72
 * @public                                                                                                             // 73
 * @param {function} [callback] callback(err, buffer)                                                                  // 74
 * @returns {Buffer|undefined}                                                                                         // 75
 *                                                                                                                     // 76
 * Returns a Buffer representing this data, or passes the Buffer to a callback.                                        // 77
 */                                                                                                                    // 78
DataMan.prototype.getBuffer = function dataManGetBuffer(callback) {                                                    // 79
  var self = this;                                                                                                     // 80
  return callback ? self.source.getBuffer(callback) : Meteor.wrapAsync(bind(self.source.getBuffer, self.source))();    // 81
};                                                                                                                     // 82
                                                                                                                       // 83
function _saveToFile(readStream, filePath, callback) {                                                                 // 84
  var writeStream = fs.createWriteStream(filePath);                                                                    // 85
  writeStream.on('close', Meteor.bindEnvironment(function () {                                                         // 86
    callback();                                                                                                        // 87
  }, function (error) { callback(error); }));                                                                          // 88
  writeStream.on('error', Meteor.bindEnvironment(function (error) {                                                    // 89
    callback(error);                                                                                                   // 90
  }, function (error) { callback(error); }));                                                                          // 91
  readStream.pipe(writeStream);                                                                                        // 92
}                                                                                                                      // 93
                                                                                                                       // 94
/**                                                                                                                    // 95
 * @method DataMan.prototype.saveToFile                                                                                // 96
 * @public                                                                                                             // 97
 * @param {String} filePath                                                                                            // 98
 * @param {Function} callback                                                                                          // 99
 * @returns {undefined}                                                                                                // 100
 *                                                                                                                     // 101
 * Saves this data to a filepath on the local filesystem.                                                              // 102
 */                                                                                                                    // 103
DataMan.prototype.saveToFile = function dataManSaveToFile(filePath, callback) {                                        // 104
  var readStream = this.createReadStream();                                                                            // 105
  return callback ? _saveToFile(readStream, filePath, callback) : Meteor.wrapAsync(_saveToFile)(readStream, filePath); // 106
};                                                                                                                     // 107
                                                                                                                       // 108
/**                                                                                                                    // 109
 * @method DataMan.prototype.getDataUri                                                                                // 110
 * @public                                                                                                             // 111
 * @param {function} [callback] callback(err, dataUri)                                                                 // 112
 *                                                                                                                     // 113
 * If no callback, returns the data URI.                                                                               // 114
 */                                                                                                                    // 115
DataMan.prototype.getDataUri = function dataManGetDataUri(callback) {                                                  // 116
  var self = this;                                                                                                     // 117
  return callback ? self.source.getDataUri(callback) : Meteor.wrapAsync(bind(self.source.getDataUri, self.source))();  // 118
};                                                                                                                     // 119
                                                                                                                       // 120
/**                                                                                                                    // 121
 * @method DataMan.prototype.createReadStream                                                                          // 122
 * @public                                                                                                             // 123
 *                                                                                                                     // 124
 * Returns a read stream for the data.                                                                                 // 125
 */                                                                                                                    // 126
DataMan.prototype.createReadStream = function dataManCreateReadStream() {                                              // 127
  return this.source.createReadStream();                                                                               // 128
};                                                                                                                     // 129
                                                                                                                       // 130
/**                                                                                                                    // 131
 * @method DataMan.prototype.size                                                                                      // 132
 * @public                                                                                                             // 133
 * @param {function} [callback] callback(err, size)                                                                    // 134
 *                                                                                                                     // 135
 * If no callback, returns the size in bytes of the data.                                                              // 136
 */                                                                                                                    // 137
DataMan.prototype.size = function dataManSize(callback) {                                                              // 138
  var self = this;                                                                                                     // 139
  return callback ? self.source.size(callback) : Meteor.wrapAsync(bind(self.source.size, self.source))();              // 140
};                                                                                                                     // 141
                                                                                                                       // 142
/**                                                                                                                    // 143
 * @method DataMan.prototype.type                                                                                      // 144
 * @public                                                                                                             // 145
 *                                                                                                                     // 146
 * Returns the type of the data.                                                                                       // 147
 */                                                                                                                    // 148
DataMan.prototype.type = function dataManType() {                                                                      // 149
  return this.source.type();                                                                                           // 150
};                                                                                                                     // 151
                                                                                                                       // 152
/*                                                                                                                     // 153
 * "bind" shim; from underscorejs, but we avoid a dependency                                                           // 154
 */                                                                                                                    // 155
var slice = Array.prototype.slice;                                                                                     // 156
var nativeBind = Function.prototype.bind;                                                                              // 157
var ctor = function(){};                                                                                               // 158
function isFunction(obj) {                                                                                             // 159
  return Object.prototype.toString.call(obj) == '[object Function]';                                                   // 160
}                                                                                                                      // 161
function bind(func, context) {                                                                                         // 162
  var args, bound;                                                                                                     // 163
  if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));                 // 164
  if (!isFunction(func)) throw new TypeError;                                                                          // 165
  args = slice.call(arguments, 2);                                                                                     // 166
  return bound = function() {                                                                                          // 167
    if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));                      // 168
    ctor.prototype = func.prototype;                                                                                   // 169
    var self = new ctor;                                                                                               // 170
    ctor.prototype = null;                                                                                             // 171
    var result = func.apply(self, args.concat(slice.call(arguments)));                                                 // 172
    if (Object(result) === result) return result;                                                                      // 173
    return self;                                                                                                       // 174
  };                                                                                                                   // 175
}                                                                                                                      // 176
                                                                                                                       // 177
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 187
}).call(this);                                                       // 188
                                                                     // 189
                                                                     // 190
                                                                     // 191
                                                                     // 192
                                                                     // 193
                                                                     // 194
(function () {                                                       // 195
                                                                     // 196
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:data-man/server/data-man-buffer.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var bufferStreamReader = Npm.require('buffer-stream-reader');                                                          // 1
                                                                                                                       // 2
/**                                                                                                                    // 3
 * @method DataMan.Buffer                                                                                              // 4
 * @public                                                                                                             // 5
 * @constructor                                                                                                        // 6
 * @param {Buffer} buffer                                                                                              // 7
 * @param {String} type The data content (MIME) type.                                                                  // 8
 */                                                                                                                    // 9
DataMan.Buffer = function DataManBuffer(buffer, type) {                                                                // 10
  var self = this;                                                                                                     // 11
  self.buffer = buffer;                                                                                                // 12
  self._type = type;                                                                                                   // 13
};                                                                                                                     // 14
                                                                                                                       // 15
/**                                                                                                                    // 16
 * @method DataMan.Buffer.prototype.getBuffer                                                                          // 17
 * @private                                                                                                            // 18
 * @param {function} callback callback(err, buffer)                                                                    // 19
 * @returns {Buffer|undefined}                                                                                         // 20
 *                                                                                                                     // 21
 * Passes a Buffer representing the data to a callback.                                                                // 22
 */                                                                                                                    // 23
DataMan.Buffer.prototype.getBuffer = function dataManBufferGetBuffer(callback) {                                       // 24
  callback(null, this.buffer);                                                                                         // 25
};                                                                                                                     // 26
                                                                                                                       // 27
/**                                                                                                                    // 28
 * @method DataMan.Buffer.prototype.getDataUri                                                                         // 29
 * @private                                                                                                            // 30
 * @param {function} callback callback(err, dataUri)                                                                   // 31
 *                                                                                                                     // 32
 * Passes a data URI representing the data in the buffer to a callback.                                                // 33
 */                                                                                                                    // 34
DataMan.Buffer.prototype.getDataUri = function dataManBufferGetDataUri(callback) {                                     // 35
  var self = this;                                                                                                     // 36
  if (!self._type) {                                                                                                   // 37
    callback(new Error("DataMan.getDataUri couldn't get a contentType"));                                              // 38
  } else {                                                                                                             // 39
    var dataUri = "data:" + self._type + ";base64," + self.buffer.toString("base64");                                  // 40
    callback(null, dataUri);                                                                                           // 41
  }                                                                                                                    // 42
};                                                                                                                     // 43
                                                                                                                       // 44
/**                                                                                                                    // 45
 * @method DataMan.Buffer.prototype.createReadStream                                                                   // 46
 * @private                                                                                                            // 47
 *                                                                                                                     // 48
 * Returns a read stream for the data.                                                                                 // 49
 */                                                                                                                    // 50
DataMan.Buffer.prototype.createReadStream = function dataManBufferCreateReadStream() {                                 // 51
  return new bufferStreamReader(this.buffer);                                                                          // 52
};                                                                                                                     // 53
                                                                                                                       // 54
/**                                                                                                                    // 55
 * @method DataMan.Buffer.prototype.size                                                                               // 56
 * @param {function} callback callback(err, size)                                                                      // 57
 * @private                                                                                                            // 58
 *                                                                                                                     // 59
 * Passes the size in bytes of the data in the buffer to a callback.                                                   // 60
 */                                                                                                                    // 61
DataMan.Buffer.prototype.size = function dataManBufferSize(callback) {                                                 // 62
  var self = this;                                                                                                     // 63
                                                                                                                       // 64
  if (typeof self._size === "number") {                                                                                // 65
    callback(null, self._size);                                                                                        // 66
    return;                                                                                                            // 67
  }                                                                                                                    // 68
                                                                                                                       // 69
  self._size = self.buffer.length;                                                                                     // 70
  callback(null, self._size);                                                                                          // 71
};                                                                                                                     // 72
                                                                                                                       // 73
/**                                                                                                                    // 74
 * @method DataMan.Buffer.prototype.type                                                                               // 75
 * @private                                                                                                            // 76
 *                                                                                                                     // 77
 * Returns the type of the data.                                                                                       // 78
 */                                                                                                                    // 79
DataMan.Buffer.prototype.type = function dataManBufferType() {                                                         // 80
  return this._type;                                                                                                   // 81
};                                                                                                                     // 82
                                                                                                                       // 83
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 287
}).call(this);                                                       // 288
                                                                     // 289
                                                                     // 290
                                                                     // 291
                                                                     // 292
                                                                     // 293
                                                                     // 294
(function () {                                                       // 295
                                                                     // 296
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:data-man/server/data-man-datauri.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    // 1
 * @method DataMan.DataURI                                                                                             // 2
 * @public                                                                                                             // 3
 * @constructor                                                                                                        // 4
 * @param {String} dataUri                                                                                             // 5
 */                                                                                                                    // 6
DataMan.DataURI = function DataManDataURI(dataUri) {                                                                   // 7
  var self = this;                                                                                                     // 8
  var pieces = dataUri.match(/^data:(.*);base64,(.*)$/);                                                               // 9
  var buffer = new Buffer(pieces[2], 'base64');                                                                        // 10
  return new DataMan.Buffer(buffer, pieces[1]);                                                                        // 11
};                                                                                                                     // 12
                                                                                                                       // 13
DataMan.DataURI.prototype = DataMan.Buffer.prototype;                                                                  // 14
                                                                                                                       // 15
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 319
}).call(this);                                                       // 320
                                                                     // 321
                                                                     // 322
                                                                     // 323
                                                                     // 324
                                                                     // 325
                                                                     // 326
(function () {                                                       // 327
                                                                     // 328
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:data-man/server/data-man-filepath.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var mime = Npm.require('mime');                                                                                        // 1
var fs = Npm.require("fs");                                                                                            // 2
                                                                                                                       // 3
/**                                                                                                                    // 4
 * @method DataMan.FilePath                                                                                            // 5
 * @public                                                                                                             // 6
 * @constructor                                                                                                        // 7
 * @param {String} filepath                                                                                            // 8
 * @param {String} [type] The data content (MIME) type. Will lookup from file if not passed.                           // 9
 */                                                                                                                    // 10
DataMan.FilePath = function DataManFilePath(filepath, type) {                                                          // 11
  var self = this;                                                                                                     // 12
  self.filepath = filepath;                                                                                            // 13
  self._type = type || mime.lookup(filepath);                                                                          // 14
};                                                                                                                     // 15
                                                                                                                       // 16
/**                                                                                                                    // 17
 * @method DataMan.FilePath.prototype.getBuffer                                                                        // 18
 * @private                                                                                                            // 19
 * @param {function} callback callback(err, buffer)                                                                    // 20
 * @returns {Buffer|undefined}                                                                                         // 21
 *                                                                                                                     // 22
 * Passes a Buffer representing the data to a callback.                                                                // 23
 */                                                                                                                    // 24
DataMan.FilePath.prototype.getBuffer = function dataManFilePathGetBuffer(callback) {                                   // 25
  var self = this;                                                                                                     // 26
                                                                                                                       // 27
  // Call node readFile                                                                                                // 28
  fs.readFile(self.filepath, Meteor.bindEnvironment(function(err, buffer) {                                            // 29
    callback(err, buffer);                                                                                             // 30
  }, function(err) {                                                                                                   // 31
    callback(err);                                                                                                     // 32
  }));                                                                                                                 // 33
};                                                                                                                     // 34
                                                                                                                       // 35
/**                                                                                                                    // 36
 * @method DataMan.FilePath.prototype.getDataUri                                                                       // 37
 * @private                                                                                                            // 38
 * @param {function} callback callback(err, dataUri)                                                                   // 39
 *                                                                                                                     // 40
 * Passes a data URI representing the data to a callback.                                                              // 41
 */                                                                                                                    // 42
DataMan.FilePath.prototype.getDataUri = function dataManFilePathGetDataUri(callback) {                                 // 43
  var self = this;                                                                                                     // 44
                                                                                                                       // 45
  self.getBuffer(function (error, buffer) {                                                                            // 46
    if (error) {                                                                                                       // 47
      callback(error);                                                                                                 // 48
    } else {                                                                                                           // 49
      if (!self._type) {                                                                                               // 50
        callback(new Error("DataMan.getDataUri couldn't get a contentType"));                                          // 51
      } else {                                                                                                         // 52
        var dataUri = "data:" + self._type + ";base64," + buffer.toString("base64");                                   // 53
        buffer = null;                                                                                                 // 54
        callback(null, dataUri);                                                                                       // 55
      }                                                                                                                // 56
    }                                                                                                                  // 57
  });                                                                                                                  // 58
};                                                                                                                     // 59
                                                                                                                       // 60
/**                                                                                                                    // 61
 * @method DataMan.FilePath.prototype.createReadStream                                                                 // 62
 * @private                                                                                                            // 63
 *                                                                                                                     // 64
 * Returns a read stream for the data.                                                                                 // 65
 */                                                                                                                    // 66
DataMan.FilePath.prototype.createReadStream = function dataManFilePathCreateReadStream() {                             // 67
  // Stream from filesystem                                                                                            // 68
  return fs.createReadStream(this.filepath);                                                                           // 69
};                                                                                                                     // 70
                                                                                                                       // 71
/**                                                                                                                    // 72
 * @method DataMan.FilePath.prototype.size                                                                             // 73
 * @param {function} callback callback(err, size)                                                                      // 74
 * @private                                                                                                            // 75
 *                                                                                                                     // 76
 * Passes the size in bytes of the data to a callback.                                                                 // 77
 */                                                                                                                    // 78
DataMan.FilePath.prototype.size = function dataManFilePathSize(callback) {                                             // 79
  var self = this;                                                                                                     // 80
                                                                                                                       // 81
  if (typeof self._size === "number") {                                                                                // 82
    callback(null, self._size);                                                                                        // 83
    return;                                                                                                            // 84
  }                                                                                                                    // 85
                                                                                                                       // 86
  // We can get the size without buffering                                                                             // 87
  fs.stat(self.filepath, Meteor.bindEnvironment(function (error, stats) {                                              // 88
    if (stats && typeof stats.size === "number") {                                                                     // 89
      self._size = stats.size;                                                                                         // 90
      callback(null, self._size);                                                                                      // 91
    } else {                                                                                                           // 92
      callback(error);                                                                                                 // 93
    }                                                                                                                  // 94
  }, function (error) {                                                                                                // 95
    callback(error);                                                                                                   // 96
  }));                                                                                                                 // 97
};                                                                                                                     // 98
                                                                                                                       // 99
/**                                                                                                                    // 100
 * @method DataMan.FilePath.prototype.type                                                                             // 101
 * @private                                                                                                            // 102
 *                                                                                                                     // 103
 * Returns the type of the data.                                                                                       // 104
 */                                                                                                                    // 105
DataMan.FilePath.prototype.type = function dataManFilePathType() {                                                     // 106
  return this._type;                                                                                                   // 107
};                                                                                                                     // 108
                                                                                                                       // 109
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 445
}).call(this);                                                       // 446
                                                                     // 447
                                                                     // 448
                                                                     // 449
                                                                     // 450
                                                                     // 451
                                                                     // 452
(function () {                                                       // 453
                                                                     // 454
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:data-man/server/data-man-url.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var request = Npm.require("request");                                                                                  // 1
                                                                                                                       // 2
/**                                                                                                                    // 3
 * @method DataMan.URL                                                                                                 // 4
 * @public                                                                                                             // 5
 * @constructor                                                                                                        // 6
 * @param {String} url                                                                                                 // 7
 * @param {String} type The data content (MIME) type.                                                                  // 8
 */                                                                                                                    // 9
DataMan.URL = function DataManURL(url, type, options) {                                                                // 10
  var self = this;                                                                                                     // 11
  options = options || {};                                                                                             // 12
                                                                                                                       // 13
  self.url = url;                                                                                                      // 14
  self._type = type;                                                                                                   // 15
                                                                                                                       // 16
  // This is some code borrowed from the http package. Hopefully                                                       // 17
  // we can eventually use HTTP pkg directly instead of 'request'                                                      // 18
  // once it supports streams and buffers and such. (`request` takes                                                   // 19
  // and `auth` option, too, but not of the same form as `HTTP`.)                                                      // 20
  if (options.auth) {                                                                                                  // 21
    if (options.auth.indexOf(':') < 0)                                                                                 // 22
      throw new Error('auth option should be of the form "username:password"');                                        // 23
    options.headers = options.headers || {};                                                                           // 24
    options.headers['Authorization'] = "Basic "+                                                                       // 25
      (new Buffer(options.auth, "ascii")).toString("base64");                                                          // 26
    delete options.auth;                                                                                               // 27
  }                                                                                                                    // 28
                                                                                                                       // 29
  self.urlOpts = options;                                                                                              // 30
};                                                                                                                     // 31
                                                                                                                       // 32
/**                                                                                                                    // 33
 * @method DataMan.URL.prototype.getBuffer                                                                             // 34
 * @private                                                                                                            // 35
 * @param {function} callback callback(err, buffer)                                                                    // 36
 * @returns {Buffer|undefined}                                                                                         // 37
 *                                                                                                                     // 38
 * Passes a Buffer representing the data at the URL to a callback.                                                     // 39
 */                                                                                                                    // 40
DataMan.URL.prototype.getBuffer = function dataManUrlGetBuffer(callback) {                                             // 41
  var self = this;                                                                                                     // 42
                                                                                                                       // 43
  request(_.extend({                                                                                                   // 44
    url: self.url,                                                                                                     // 45
    method: "GET",                                                                                                     // 46
    encoding: null,                                                                                                    // 47
    jar: false                                                                                                         // 48
  }, self.urlOpts), Meteor.bindEnvironment(function(err, res, body) {                                                  // 49
    if (err) {                                                                                                         // 50
      callback(err);                                                                                                   // 51
    } else {                                                                                                           // 52
      self._type = res.headers['content-type'];                                                                        // 53
      callback(null, body);                                                                                            // 54
    }                                                                                                                  // 55
  }, function(err) {                                                                                                   // 56
    callback(err);                                                                                                     // 57
  }));                                                                                                                 // 58
};                                                                                                                     // 59
                                                                                                                       // 60
/**                                                                                                                    // 61
 * @method DataMan.URL.prototype.getDataUri                                                                            // 62
 * @private                                                                                                            // 63
 * @param {function} callback callback(err, dataUri)                                                                   // 64
 *                                                                                                                     // 65
 * Passes a data URI representing the data at the URL to a callback.                                                   // 66
 */                                                                                                                    // 67
DataMan.URL.prototype.getDataUri = function dataManUrlGetDataUri(callback) {                                           // 68
  var self = this;                                                                                                     // 69
                                                                                                                       // 70
  self.getBuffer(function (error, buffer) {                                                                            // 71
    if (error) {                                                                                                       // 72
      callback(error);                                                                                                 // 73
    } else {                                                                                                           // 74
      if (!self._type) {                                                                                               // 75
        callback(new Error("DataMan.getDataUri couldn't get a contentType"));                                          // 76
      } else {                                                                                                         // 77
        var dataUri = "data:" + self._type + ";base64," + buffer.toString("base64");                                   // 78
        callback(null, dataUri);                                                                                       // 79
      }                                                                                                                // 80
    }                                                                                                                  // 81
  });                                                                                                                  // 82
};                                                                                                                     // 83
                                                                                                                       // 84
/**                                                                                                                    // 85
 * @method DataMan.URL.prototype.createReadStream                                                                      // 86
 * @private                                                                                                            // 87
 *                                                                                                                     // 88
 * Returns a read stream for the data.                                                                                 // 89
 */                                                                                                                    // 90
DataMan.URL.prototype.createReadStream = function dataManUrlCreateReadStream() {                                       // 91
  var self = this;                                                                                                     // 92
  // Stream from URL                                                                                                   // 93
  return request(_.extend({                                                                                            // 94
    url: self.url,                                                                                                     // 95
    method: "GET"                                                                                                      // 96
  }, self.urlOpts));                                                                                                   // 97
};                                                                                                                     // 98
                                                                                                                       // 99
/**                                                                                                                    // 100
 * @method DataMan.URL.prototype.size                                                                                  // 101
 * @param {function} callback callback(err, size)                                                                      // 102
 * @private                                                                                                            // 103
 *                                                                                                                     // 104
 * Returns the size in bytes of the data at the URL.                                                                   // 105
 */                                                                                                                    // 106
DataMan.URL.prototype.size = function dataManUrlSize(callback) {                                                       // 107
  var self = this;                                                                                                     // 108
                                                                                                                       // 109
  if (typeof self._size === "number") {                                                                                // 110
    callback(null, self._size);                                                                                        // 111
    return;                                                                                                            // 112
  }                                                                                                                    // 113
                                                                                                                       // 114
  self.getBuffer(function (error, buffer) {                                                                            // 115
    if (error) {                                                                                                       // 116
      callback(error);                                                                                                 // 117
    } else {                                                                                                           // 118
      self._size = buffer.length;                                                                                      // 119
      callback(null, self._size);                                                                                      // 120
    }                                                                                                                  // 121
  });                                                                                                                  // 122
};                                                                                                                     // 123
                                                                                                                       // 124
/**                                                                                                                    // 125
 * @method DataMan.URL.prototype.type                                                                                  // 126
 * @private                                                                                                            // 127
 *                                                                                                                     // 128
 * Returns the type of the data.                                                                                       // 129
 */                                                                                                                    // 130
DataMan.URL.prototype.type = function dataManUrlType() {                                                               // 131
  return this._type;                                                                                                   // 132
};                                                                                                                     // 133
                                                                                                                       // 134
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 596
}).call(this);                                                       // 597
                                                                     // 598
                                                                     // 599
                                                                     // 600
                                                                     // 601
                                                                     // 602
                                                                     // 603
(function () {                                                       // 604
                                                                     // 605
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs:data-man/server/data-man-readstream.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global DataMan */                                                                                                   // 1
                                                                                                                       // 2
var PassThrough = Npm.require('stream').PassThrough;                                                                   // 3
                                                                                                                       // 4
/**                                                                                                                    // 5
 * @method DataMan.ReadStream                                                                                          // 6
 * @public                                                                                                             // 7
 * @constructor                                                                                                        // 8
 * @param {ReadStream} stream                                                                                          // 9
 * @param {String} type The data content (MIME) type.                                                                  // 10
 */                                                                                                                    // 11
DataMan.ReadStream = function DataManBuffer(stream, type) {                                                            // 12
  var self = this;                                                                                                     // 13
                                                                                                                       // 14
  // Create a bufferable / paused new stream...                                                                        // 15
  var pt = new PassThrough();                                                                                          // 16
                                                                                                                       // 17
  // Pipe provided read stream into pass-through stream                                                                // 18
  stream.pipe(pt);                                                                                                     // 19
                                                                                                                       // 20
  // Set pass-through stream reference                                                                                 // 21
  self.stream = pt;                                                                                                    // 22
                                                                                                                       // 23
  // Set type as provided                                                                                              // 24
  self._type = type;                                                                                                   // 25
};                                                                                                                     // 26
                                                                                                                       // 27
/**                                                                                                                    // 28
 * @method DataMan.ReadStream.prototype.getBuffer                                                                      // 29
 * @private                                                                                                            // 30
 * @param {function} callback callback(err, buffer)                                                                    // 31
 * @returns {undefined}                                                                                                // 32
 *                                                                                                                     // 33
 * Passes a Buffer representing the data to a callback.                                                                // 34
 */                                                                                                                    // 35
DataMan.ReadStream.prototype.getBuffer = function dataManReadStreamGetBuffer(/*callback*/) {                           // 36
  // TODO implement as passthrough stream?                                                                             // 37
};                                                                                                                     // 38
                                                                                                                       // 39
/**                                                                                                                    // 40
 * @method DataMan.ReadStream.prototype.getDataUri                                                                     // 41
 * @private                                                                                                            // 42
 * @param {function} callback callback(err, dataUri)                                                                   // 43
 *                                                                                                                     // 44
 * Passes a data URI representing the data in the stream to a callback.                                                // 45
 */                                                                                                                    // 46
DataMan.ReadStream.prototype.getDataUri = function dataManReadStreamGetDataUri(/*callback*/) {                         // 47
  // TODO implement as passthrough stream?                                                                             // 48
};                                                                                                                     // 49
                                                                                                                       // 50
/**                                                                                                                    // 51
 * @method DataMan.ReadStream.prototype.createReadStream                                                               // 52
 * @private                                                                                                            // 53
 *                                                                                                                     // 54
 * Returns a read stream for the data.                                                                                 // 55
 */                                                                                                                    // 56
DataMan.ReadStream.prototype.createReadStream = function dataManReadStreamCreateReadStream() {                         // 57
  return this.stream;                                                                                                  // 58
};                                                                                                                     // 59
                                                                                                                       // 60
/**                                                                                                                    // 61
 * @method DataMan.ReadStream.prototype.size                                                                           // 62
 * @param {function} callback callback(err, size)                                                                      // 63
 * @private                                                                                                            // 64
 *                                                                                                                     // 65
 * Passes the size in bytes of the data in the stream to a callback.                                                   // 66
 */                                                                                                                    // 67
DataMan.ReadStream.prototype.size = function dataManReadStreamSize(callback) {                                         // 68
  callback(0); // will determine from stream later                                                                     // 69
};                                                                                                                     // 70
                                                                                                                       // 71
/**                                                                                                                    // 72
 * @method DataMan.ReadStream.prototype.type                                                                           // 73
 * @private                                                                                                            // 74
 *                                                                                                                     // 75
 * Returns the type of the data.                                                                                       // 76
 */                                                                                                                    // 77
DataMan.ReadStream.prototype.type = function dataManReadStreamType() {                                                 // 78
  return this._type;                                                                                                   // 79
};                                                                                                                     // 80
                                                                                                                       // 81
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 694
}).call(this);                                                       // 695
                                                                     // 696
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:data-man'] = {
  DataMan: DataMan
};

})();

//# sourceMappingURL=cfs_data-man.js.map
