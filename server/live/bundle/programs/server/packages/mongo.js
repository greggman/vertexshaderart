(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var NpmModuleMongodb = Package['npm-mongo'].NpmModuleMongodb;
var NpmModuleMongodbVersion = Package['npm-mongo'].NpmModuleMongodbVersion;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var check = Package.check.check;
var Match = Package.check.Match;
var MaxHeap = Package['binary-heap'].MaxHeap;
var MinHeap = Package['binary-heap'].MinHeap;
var MinMaxHeap = Package['binary-heap'].MinMaxHeap;
var Hook = Package['callback-hook'].Hook;

/* Package-scope variables */
var MongoInternals, MongoTest, MongoConnection, CursorDescription, Cursor, listenAll, forEachTrigger, OPLOG_COLLECTION, idForOp, OplogHandle, ObserveMultiplexer, ObserveHandle, DocFetcher, PollingObserveDriver, OplogObserveDriver, LocalCollectionDriver, Mongo;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/packages/mongo.js                                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
(function(){                                                                                                          // 1
                                                                                                                      // 2
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/mongo_driver.js                                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/**                                                                                                                   // 1
 * Provide a synchronous Collection API using fibers, backed by                                                       // 2
 * MongoDB.  This is only for use on the server, and mostly identical                                                 // 3
 * to the client API.                                                                                                 // 4
 *                                                                                                                    // 5
 * NOTE: the public API methods must be run within a fiber. If you call                                               // 6
 * these outside of a fiber they will explode!                                                                        // 7
 */                                                                                                                   // 8
                                                                                                                      // 9
var path = Npm.require('path');                                                                                       // 10
var MongoDB = NpmModuleMongodb;                                                                                       // 11
var Fiber = Npm.require('fibers');                                                                                    // 12
var Future = Npm.require(path.join('fibers', 'future'));                                                              // 13
                                                                                                                      // 14
MongoInternals = {};                                                                                                  // 15
MongoTest = {};                                                                                                       // 16
                                                                                                                      // 17
MongoInternals.NpmModules = {                                                                                         // 18
  mongodb: {                                                                                                          // 19
    version: NpmModuleMongodbVersion,                                                                                 // 20
    module: MongoDB                                                                                                   // 21
  }                                                                                                                   // 22
};                                                                                                                    // 23
                                                                                                                      // 24
// Older version of what is now available via                                                                         // 25
// MongoInternals.NpmModules.mongodb.module.  It was never documented, but                                            // 26
// people do use it.                                                                                                  // 27
// XXX COMPAT WITH 1.0.3.2                                                                                            // 28
MongoInternals.NpmModule = MongoDB;                                                                                   // 29
                                                                                                                      // 30
// This is used to add or remove EJSON from the beginning of everything nested                                        // 31
// inside an EJSON custom type. It should only be called on pure JSON!                                                // 32
var replaceNames = function (filter, thing) {                                                                         // 33
  if (typeof thing === "object") {                                                                                    // 34
    if (_.isArray(thing)) {                                                                                           // 35
      return _.map(thing, _.bind(replaceNames, null, filter));                                                        // 36
    }                                                                                                                 // 37
    var ret = {};                                                                                                     // 38
    _.each(thing, function (value, key) {                                                                             // 39
      ret[filter(key)] = replaceNames(filter, value);                                                                 // 40
    });                                                                                                               // 41
    return ret;                                                                                                       // 42
  }                                                                                                                   // 43
  return thing;                                                                                                       // 44
};                                                                                                                    // 45
                                                                                                                      // 46
// Ensure that EJSON.clone keeps a Timestamp as a Timestamp (instead of just                                          // 47
// doing a structural clone).                                                                                         // 48
// XXX how ok is this? what if there are multiple copies of MongoDB loaded?                                           // 49
MongoDB.Timestamp.prototype.clone = function () {                                                                     // 50
  // Timestamps should be immutable.                                                                                  // 51
  return this;                                                                                                        // 52
};                                                                                                                    // 53
                                                                                                                      // 54
var makeMongoLegal = function (name) { return "EJSON" + name; };                                                      // 55
var unmakeMongoLegal = function (name) { return name.substr(5); };                                                    // 56
                                                                                                                      // 57
var replaceMongoAtomWithMeteor = function (document) {                                                                // 58
  if (document instanceof MongoDB.Binary) {                                                                           // 59
    var buffer = document.value(true);                                                                                // 60
    return new Uint8Array(buffer);                                                                                    // 61
  }                                                                                                                   // 62
  if (document instanceof MongoDB.ObjectID) {                                                                         // 63
    return new Mongo.ObjectID(document.toHexString());                                                                // 64
  }                                                                                                                   // 65
  if (document["EJSON$type"] && document["EJSON$value"]                                                               // 66
      && _.size(document) === 2) {                                                                                    // 67
    return EJSON.fromJSONValue(replaceNames(unmakeMongoLegal, document));                                             // 68
  }                                                                                                                   // 69
  if (document instanceof MongoDB.Timestamp) {                                                                        // 70
    // For now, the Meteor representation of a Mongo timestamp type (not a date!                                      // 71
    // this is a weird internal thing used in the oplog!) is the same as the                                          // 72
    // Mongo representation. We need to do this explicitly or else we would do a                                      // 73
    // structural clone and lose the prototype.                                                                       // 74
    return document;                                                                                                  // 75
  }                                                                                                                   // 76
  return undefined;                                                                                                   // 77
};                                                                                                                    // 78
                                                                                                                      // 79
var replaceMeteorAtomWithMongo = function (document) {                                                                // 80
  if (EJSON.isBinary(document)) {                                                                                     // 81
    // This does more copies than we'd like, but is necessary because                                                 // 82
    // MongoDB.BSON only looks like it takes a Uint8Array (and doesn't actually                                       // 83
    // serialize it correctly).                                                                                       // 84
    return new MongoDB.Binary(new Buffer(document));                                                                  // 85
  }                                                                                                                   // 86
  if (document instanceof Mongo.ObjectID) {                                                                           // 87
    return new MongoDB.ObjectID(document.toHexString());                                                              // 88
  }                                                                                                                   // 89
  if (document instanceof MongoDB.Timestamp) {                                                                        // 90
    // For now, the Meteor representation of a Mongo timestamp type (not a date!                                      // 91
    // this is a weird internal thing used in the oplog!) is the same as the                                          // 92
    // Mongo representation. We need to do this explicitly or else we would do a                                      // 93
    // structural clone and lose the prototype.                                                                       // 94
    return document;                                                                                                  // 95
  }                                                                                                                   // 96
  if (EJSON._isCustomType(document)) {                                                                                // 97
    return replaceNames(makeMongoLegal, EJSON.toJSONValue(document));                                                 // 98
  }                                                                                                                   // 99
  // It is not ordinarily possible to stick dollar-sign keys into mongo                                               // 100
  // so we don't bother checking for things that need escaping at this time.                                          // 101
  return undefined;                                                                                                   // 102
};                                                                                                                    // 103
                                                                                                                      // 104
var replaceTypes = function (document, atomTransformer) {                                                             // 105
  if (typeof document !== 'object' || document === null)                                                              // 106
    return document;                                                                                                  // 107
                                                                                                                      // 108
  var replacedTopLevelAtom = atomTransformer(document);                                                               // 109
  if (replacedTopLevelAtom !== undefined)                                                                             // 110
    return replacedTopLevelAtom;                                                                                      // 111
                                                                                                                      // 112
  var ret = document;                                                                                                 // 113
  _.each(document, function (val, key) {                                                                              // 114
    var valReplaced = replaceTypes(val, atomTransformer);                                                             // 115
    if (val !== valReplaced) {                                                                                        // 116
      // Lazy clone. Shallow copy.                                                                                    // 117
      if (ret === document)                                                                                           // 118
        ret = _.clone(document);                                                                                      // 119
      ret[key] = valReplaced;                                                                                         // 120
    }                                                                                                                 // 121
  });                                                                                                                 // 122
  return ret;                                                                                                         // 123
};                                                                                                                    // 124
                                                                                                                      // 125
                                                                                                                      // 126
MongoConnection = function (url, options) {                                                                           // 127
  var self = this;                                                                                                    // 128
  options = options || {};                                                                                            // 129
  self._observeMultiplexers = {};                                                                                     // 130
  self._onFailoverHook = new Hook;                                                                                    // 131
                                                                                                                      // 132
  var mongoOptions = {db: {safe: true}, server: {}, replSet: {}};                                                     // 133
                                                                                                                      // 134
  // Set autoReconnect to true, unless passed on the URL. Why someone                                                 // 135
  // would want to set autoReconnect to false, I'm not really sure, but                                               // 136
  // keeping this for backwards compatibility for now.                                                                // 137
  if (!(/[\?&]auto_?[rR]econnect=/.test(url))) {                                                                      // 138
    mongoOptions.server.auto_reconnect = true;                                                                        // 139
  }                                                                                                                   // 140
                                                                                                                      // 141
  // Disable the native parser by default, unless specifically enabled                                                // 142
  // in the mongo URL.                                                                                                // 143
  // - The native driver can cause errors which normally would be                                                     // 144
  //   thrown, caught, and handled into segfaults that take down the                                                  // 145
  //   whole app.                                                                                                     // 146
  // - Binary modules don't yet work when you bundle and move the bundle                                              // 147
  //   to a different platform (aka deploy)                                                                           // 148
  // We should revisit this after binary npm module support lands.                                                    // 149
  if (!(/[\?&]native_?[pP]arser=/.test(url))) {                                                                       // 150
    mongoOptions.db.native_parser = false;                                                                            // 151
  }                                                                                                                   // 152
                                                                                                                      // 153
  // XXX maybe we should have a better way of allowing users to configure the                                         // 154
  // underlying Mongo driver                                                                                          // 155
  if (_.has(options, 'poolSize')) {                                                                                   // 156
    // If we just set this for "server", replSet will override it. If we just                                         // 157
    // set it for replSet, it will be ignored if we're not using a replSet.                                           // 158
    mongoOptions.server.poolSize = options.poolSize;                                                                  // 159
    mongoOptions.replSet.poolSize = options.poolSize;                                                                 // 160
  }                                                                                                                   // 161
                                                                                                                      // 162
  self.db = null;                                                                                                     // 163
  // We keep track of the ReplSet's primary, so that we can trigger hooks when                                        // 164
  // it changes.  The Node driver's joined callback seems to fire way too                                             // 165
  // often, which is why we need to track it ourselves.                                                               // 166
  self._primary = null;                                                                                               // 167
  self._oplogHandle = null;                                                                                           // 168
  self._docFetcher = null;                                                                                            // 169
                                                                                                                      // 170
                                                                                                                      // 171
  var connectFuture = new Future;                                                                                     // 172
  MongoDB.connect(                                                                                                    // 173
    url,                                                                                                              // 174
    mongoOptions,                                                                                                     // 175
    Meteor.bindEnvironment(                                                                                           // 176
      function (err, db) {                                                                                            // 177
        if (err) {                                                                                                    // 178
          throw err;                                                                                                  // 179
        }                                                                                                             // 180
                                                                                                                      // 181
        // First, figure out what the current primary is, if any.                                                     // 182
        if (db.serverConfig._state.master)                                                                            // 183
          self._primary = db.serverConfig._state.master.name;                                                         // 184
        db.serverConfig.on(                                                                                           // 185
          'joined', Meteor.bindEnvironment(function (kind, doc) {                                                     // 186
            if (kind === 'primary') {                                                                                 // 187
              if (doc.primary !== self._primary) {                                                                    // 188
                self._primary = doc.primary;                                                                          // 189
                self._onFailoverHook.each(function (callback) {                                                       // 190
                  callback();                                                                                         // 191
                  return true;                                                                                        // 192
                });                                                                                                   // 193
              }                                                                                                       // 194
            } else if (doc.me === self._primary) {                                                                    // 195
              // The thing we thought was primary is now something other than                                         // 196
              // primary.  Forget that we thought it was primary.  (This means                                        // 197
              // that if a server stops being primary and then starts being                                           // 198
              // primary again without another server becoming primary in the                                         // 199
              // middle, we'll correctly count it as a failover.)                                                     // 200
              self._primary = null;                                                                                   // 201
            }                                                                                                         // 202
          }));                                                                                                        // 203
                                                                                                                      // 204
        // Allow the constructor to return.                                                                           // 205
        connectFuture['return'](db);                                                                                  // 206
      },                                                                                                              // 207
      connectFuture.resolver()  // onException                                                                        // 208
    )                                                                                                                 // 209
  );                                                                                                                  // 210
                                                                                                                      // 211
  // Wait for the connection to be successful; throws on failure.                                                     // 212
  self.db = connectFuture.wait();                                                                                     // 213
                                                                                                                      // 214
  if (options.oplogUrl && ! Package['disable-oplog']) {                                                               // 215
    self._oplogHandle = new OplogHandle(options.oplogUrl, self.db.databaseName);                                      // 216
    self._docFetcher = new DocFetcher(self);                                                                          // 217
  }                                                                                                                   // 218
};                                                                                                                    // 219
                                                                                                                      // 220
MongoConnection.prototype.close = function() {                                                                        // 221
  var self = this;                                                                                                    // 222
                                                                                                                      // 223
  if (! self.db)                                                                                                      // 224
    throw Error("close called before Connection created?");                                                           // 225
                                                                                                                      // 226
  // XXX probably untested                                                                                            // 227
  var oplogHandle = self._oplogHandle;                                                                                // 228
  self._oplogHandle = null;                                                                                           // 229
  if (oplogHandle)                                                                                                    // 230
    oplogHandle.stop();                                                                                               // 231
                                                                                                                      // 232
  // Use Future.wrap so that errors get thrown. This happens to                                                       // 233
  // work even outside a fiber since the 'close' method is not                                                        // 234
  // actually asynchronous.                                                                                           // 235
  Future.wrap(_.bind(self.db.close, self.db))(true).wait();                                                           // 236
};                                                                                                                    // 237
                                                                                                                      // 238
// Returns the Mongo Collection object; may yield.                                                                    // 239
MongoConnection.prototype.rawCollection = function (collectionName) {                                                 // 240
  var self = this;                                                                                                    // 241
                                                                                                                      // 242
  if (! self.db)                                                                                                      // 243
    throw Error("rawCollection called before Connection created?");                                                   // 244
                                                                                                                      // 245
  var future = new Future;                                                                                            // 246
  self.db.collection(collectionName, future.resolver());                                                              // 247
  return future.wait();                                                                                               // 248
};                                                                                                                    // 249
                                                                                                                      // 250
MongoConnection.prototype._createCappedCollection = function (                                                        // 251
    collectionName, byteSize, maxDocuments) {                                                                         // 252
  var self = this;                                                                                                    // 253
                                                                                                                      // 254
  if (! self.db)                                                                                                      // 255
    throw Error("_createCappedCollection called before Connection created?");                                         // 256
                                                                                                                      // 257
  var future = new Future();                                                                                          // 258
  self.db.createCollection(                                                                                           // 259
    collectionName,                                                                                                   // 260
    { capped: true, size: byteSize, max: maxDocuments },                                                              // 261
    future.resolver());                                                                                               // 262
  future.wait();                                                                                                      // 263
};                                                                                                                    // 264
                                                                                                                      // 265
// This should be called synchronously with a write, to create a                                                      // 266
// transaction on the current write fence, if any. After we can read                                                  // 267
// the write, and after observers have been notified (or at least,                                                    // 268
// after the observer notifiers have added themselves to the write                                                    // 269
// fence), you should call 'committed()' on the object returned.                                                      // 270
MongoConnection.prototype._maybeBeginWrite = function () {                                                            // 271
  var self = this;                                                                                                    // 272
  var fence = DDPServer._CurrentWriteFence.get();                                                                     // 273
  if (fence)                                                                                                          // 274
    return fence.beginWrite();                                                                                        // 275
  else                                                                                                                // 276
    return {committed: function () {}};                                                                               // 277
};                                                                                                                    // 278
                                                                                                                      // 279
// Internal interface: adds a callback which is called when the Mongo primary                                         // 280
// changes. Returns a stop handle.                                                                                    // 281
MongoConnection.prototype._onFailover = function (callback) {                                                         // 282
  return this._onFailoverHook.register(callback);                                                                     // 283
};                                                                                                                    // 284
                                                                                                                      // 285
                                                                                                                      // 286
//////////// Public API //////////                                                                                    // 287
                                                                                                                      // 288
// The write methods block until the database has confirmed the write (it may                                         // 289
// not be replicated or stable on disk, but one server has confirmed it) if no                                        // 290
// callback is provided. If a callback is provided, then they call the callback                                       // 291
// when the write is confirmed. They return nothing on success, and raise an                                          // 292
// exception on failure.                                                                                              // 293
//                                                                                                                    // 294
// After making a write (with insert, update, remove), observers are                                                  // 295
// notified asynchronously. If you want to receive a callback once all                                                // 296
// of the observer notifications have landed for your write, do the                                                   // 297
// writes inside a write fence (set DDPServer._CurrentWriteFence to a new                                             // 298
// _WriteFence, and then set a callback on the write fence.)                                                          // 299
//                                                                                                                    // 300
// Since our execution environment is single-threaded, this is                                                        // 301
// well-defined -- a write "has been made" if it's returned, and an                                                   // 302
// observer "has been notified" if its callback has returned.                                                         // 303
                                                                                                                      // 304
var writeCallback = function (write, refresh, callback) {                                                             // 305
  return function (err, result) {                                                                                     // 306
    if (! err) {                                                                                                      // 307
      // XXX We don't have to run this on error, right?                                                               // 308
      try {                                                                                                           // 309
        refresh();                                                                                                    // 310
      } catch (refreshErr) {                                                                                          // 311
        if (callback) {                                                                                               // 312
          callback(refreshErr);                                                                                       // 313
          return;                                                                                                     // 314
        } else {                                                                                                      // 315
          throw refreshErr;                                                                                           // 316
        }                                                                                                             // 317
      }                                                                                                               // 318
    }                                                                                                                 // 319
    write.committed();                                                                                                // 320
    if (callback)                                                                                                     // 321
      callback(err, result);                                                                                          // 322
    else if (err)                                                                                                     // 323
      throw err;                                                                                                      // 324
  };                                                                                                                  // 325
};                                                                                                                    // 326
                                                                                                                      // 327
var bindEnvironmentForWrite = function (callback) {                                                                   // 328
  return Meteor.bindEnvironment(callback, "Mongo write");                                                             // 329
};                                                                                                                    // 330
                                                                                                                      // 331
MongoConnection.prototype._insert = function (collection_name, document,                                              // 332
                                              callback) {                                                             // 333
  var self = this;                                                                                                    // 334
                                                                                                                      // 335
  var sendError = function (e) {                                                                                      // 336
    if (callback)                                                                                                     // 337
      return callback(e);                                                                                             // 338
    throw e;                                                                                                          // 339
  };                                                                                                                  // 340
                                                                                                                      // 341
  if (collection_name === "___meteor_failure_test_collection") {                                                      // 342
    var e = new Error("Failure test");                                                                                // 343
    e.expected = true;                                                                                                // 344
    sendError(e);                                                                                                     // 345
    return;                                                                                                           // 346
  }                                                                                                                   // 347
                                                                                                                      // 348
  if (!(LocalCollection._isPlainObject(document) &&                                                                   // 349
        !EJSON._isCustomType(document))) {                                                                            // 350
    sendError(new Error(                                                                                              // 351
      "Only plain objects may be inserted into MongoDB"));                                                            // 352
    return;                                                                                                           // 353
  }                                                                                                                   // 354
                                                                                                                      // 355
  var write = self._maybeBeginWrite();                                                                                // 356
  var refresh = function () {                                                                                         // 357
    Meteor.refresh({collection: collection_name, id: document._id });                                                 // 358
  };                                                                                                                  // 359
  callback = bindEnvironmentForWrite(writeCallback(write, refresh, callback));                                        // 360
  try {                                                                                                               // 361
    var collection = self.rawCollection(collection_name);                                                             // 362
    collection.insert(replaceTypes(document, replaceMeteorAtomWithMongo),                                             // 363
                      {safe: true}, callback);                                                                        // 364
  } catch (e) {                                                                                                       // 365
    write.committed();                                                                                                // 366
    throw e;                                                                                                          // 367
  }                                                                                                                   // 368
};                                                                                                                    // 369
                                                                                                                      // 370
// Cause queries that may be affected by the selector to poll in this write                                           // 371
// fence.                                                                                                             // 372
MongoConnection.prototype._refresh = function (collectionName, selector) {                                            // 373
  var self = this;                                                                                                    // 374
  var refreshKey = {collection: collectionName};                                                                      // 375
  // If we know which documents we're removing, don't poll queries that are                                           // 376
  // specific to other documents. (Note that multiple notifications here should                                       // 377
  // not cause multiple polls, since all our listener is doing is enqueueing a                                        // 378
  // poll.)                                                                                                           // 379
  var specificIds = LocalCollection._idsMatchedBySelector(selector);                                                  // 380
  if (specificIds) {                                                                                                  // 381
    _.each(specificIds, function (id) {                                                                               // 382
      Meteor.refresh(_.extend({id: id}, refreshKey));                                                                 // 383
    });                                                                                                               // 384
  } else {                                                                                                            // 385
    Meteor.refresh(refreshKey);                                                                                       // 386
  }                                                                                                                   // 387
};                                                                                                                    // 388
                                                                                                                      // 389
MongoConnection.prototype._remove = function (collection_name, selector,                                              // 390
                                              callback) {                                                             // 391
  var self = this;                                                                                                    // 392
                                                                                                                      // 393
  if (collection_name === "___meteor_failure_test_collection") {                                                      // 394
    var e = new Error("Failure test");                                                                                // 395
    e.expected = true;                                                                                                // 396
    if (callback)                                                                                                     // 397
      return callback(e);                                                                                             // 398
    else                                                                                                              // 399
      throw e;                                                                                                        // 400
  }                                                                                                                   // 401
                                                                                                                      // 402
  var write = self._maybeBeginWrite();                                                                                // 403
  var refresh = function () {                                                                                         // 404
    self._refresh(collection_name, selector);                                                                         // 405
  };                                                                                                                  // 406
  callback = bindEnvironmentForWrite(writeCallback(write, refresh, callback));                                        // 407
                                                                                                                      // 408
  try {                                                                                                               // 409
    var collection = self.rawCollection(collection_name);                                                             // 410
    collection.remove(replaceTypes(selector, replaceMeteorAtomWithMongo),                                             // 411
                      {safe: true}, callback);                                                                        // 412
  } catch (e) {                                                                                                       // 413
    write.committed();                                                                                                // 414
    throw e;                                                                                                          // 415
  }                                                                                                                   // 416
};                                                                                                                    // 417
                                                                                                                      // 418
MongoConnection.prototype._dropCollection = function (collectionName, cb) {                                           // 419
  var self = this;                                                                                                    // 420
                                                                                                                      // 421
  var write = self._maybeBeginWrite();                                                                                // 422
  var refresh = function () {                                                                                         // 423
    Meteor.refresh({collection: collectionName, id: null,                                                             // 424
                    dropCollection: true});                                                                           // 425
  };                                                                                                                  // 426
  cb = bindEnvironmentForWrite(writeCallback(write, refresh, cb));                                                    // 427
                                                                                                                      // 428
  try {                                                                                                               // 429
    var collection = self.rawCollection(collectionName);                                                              // 430
    collection.drop(cb);                                                                                              // 431
  } catch (e) {                                                                                                       // 432
    write.committed();                                                                                                // 433
    throw e;                                                                                                          // 434
  }                                                                                                                   // 435
};                                                                                                                    // 436
                                                                                                                      // 437
// For testing only.  Slightly better than `c.rawDatabase().dropDatabase()`                                           // 438
// because it lets the test's fence wait for it to be complete.                                                       // 439
MongoConnection.prototype._dropDatabase = function (cb) {                                                             // 440
  var self = this;                                                                                                    // 441
                                                                                                                      // 442
  var write = self._maybeBeginWrite();                                                                                // 443
  var refresh = function () {                                                                                         // 444
    Meteor.refresh({ dropDatabase: true });                                                                           // 445
  };                                                                                                                  // 446
  cb = bindEnvironmentForWrite(writeCallback(write, refresh, cb));                                                    // 447
                                                                                                                      // 448
  try {                                                                                                               // 449
    self.db.dropDatabase(cb);                                                                                         // 450
  } catch (e) {                                                                                                       // 451
    write.committed();                                                                                                // 452
    throw e;                                                                                                          // 453
  }                                                                                                                   // 454
};                                                                                                                    // 455
                                                                                                                      // 456
MongoConnection.prototype._update = function (collection_name, selector, mod,                                         // 457
                                              options, callback) {                                                    // 458
  var self = this;                                                                                                    // 459
                                                                                                                      // 460
  if (! callback && options instanceof Function) {                                                                    // 461
    callback = options;                                                                                               // 462
    options = null;                                                                                                   // 463
  }                                                                                                                   // 464
                                                                                                                      // 465
  if (collection_name === "___meteor_failure_test_collection") {                                                      // 466
    var e = new Error("Failure test");                                                                                // 467
    e.expected = true;                                                                                                // 468
    if (callback)                                                                                                     // 469
      return callback(e);                                                                                             // 470
    else                                                                                                              // 471
      throw e;                                                                                                        // 472
  }                                                                                                                   // 473
                                                                                                                      // 474
  // explicit safety check. null and undefined can crash the mongo                                                    // 475
  // driver. Although the node driver and minimongo do 'support'                                                      // 476
  // non-object modifier in that they don't crash, they are not                                                       // 477
  // meaningful operations and do not do anything. Defensively throw an                                               // 478
  // error here.                                                                                                      // 479
  if (!mod || typeof mod !== 'object')                                                                                // 480
    throw new Error("Invalid modifier. Modifier must be an object.");                                                 // 481
                                                                                                                      // 482
  if (!(LocalCollection._isPlainObject(mod) &&                                                                        // 483
        !EJSON._isCustomType(mod))) {                                                                                 // 484
    throw new Error(                                                                                                  // 485
      "Only plain objects may be used as replacement" +                                                               // 486
        " documents in MongoDB");                                                                                     // 487
    return;                                                                                                           // 488
  }                                                                                                                   // 489
                                                                                                                      // 490
  if (!options) options = {};                                                                                         // 491
                                                                                                                      // 492
  var write = self._maybeBeginWrite();                                                                                // 493
  var refresh = function () {                                                                                         // 494
    self._refresh(collection_name, selector);                                                                         // 495
  };                                                                                                                  // 496
  callback = writeCallback(write, refresh, callback);                                                                 // 497
  try {                                                                                                               // 498
    var collection = self.rawCollection(collection_name);                                                             // 499
    var mongoOpts = {safe: true};                                                                                     // 500
    // explictly enumerate options that minimongo supports                                                            // 501
    if (options.upsert) mongoOpts.upsert = true;                                                                      // 502
    if (options.multi) mongoOpts.multi = true;                                                                        // 503
    // Lets you get a more more full result from MongoDB. Use with caution:                                           // 504
    // might not work with C.upsert (as opposed to C.update({upsert:true}) or                                         // 505
    // with simulated upsert.                                                                                         // 506
    if (options.fullResult) mongoOpts.fullResult = true;                                                              // 507
                                                                                                                      // 508
    var mongoSelector = replaceTypes(selector, replaceMeteorAtomWithMongo);                                           // 509
    var mongoMod = replaceTypes(mod, replaceMeteorAtomWithMongo);                                                     // 510
                                                                                                                      // 511
    var isModify = isModificationMod(mongoMod);                                                                       // 512
    var knownId = selector._id || mod._id;                                                                            // 513
                                                                                                                      // 514
    if (options._forbidReplace && ! isModify) {                                                                       // 515
      var e = new Error("Invalid modifier. Replacements are forbidden.");                                             // 516
      if (callback) {                                                                                                 // 517
        return callback(e);                                                                                           // 518
      } else {                                                                                                        // 519
        throw e;                                                                                                      // 520
      }                                                                                                               // 521
    }                                                                                                                 // 522
                                                                                                                      // 523
    if (options.upsert && (! knownId) && options.insertedId) {                                                        // 524
      // XXX If we know we're using Mongo 2.6 (and this isn't a replacement)                                          // 525
      //     we should be able to just use $setOnInsert instead of this                                               // 526
      //     simulated upsert thing. (We can't use $setOnInsert with                                                  // 527
      //     replacements because there's nowhere to write it, and $setOnInsert                                       // 528
      //     can't set _id on Mongo 2.4.)                                                                             // 529
      //                                                                                                              // 530
      //     Also, in the future we could do a real upsert for the mongo id                                           // 531
      //     generation case, if the the node mongo driver gives us back the id                                       // 532
      //     of the upserted doc (which our current version does not).                                                // 533
      //                                                                                                              // 534
      //     For more context, see                                                                                    // 535
      //     https://github.com/meteor/meteor/issues/2278#issuecomment-64252706                                       // 536
      simulateUpsertWithInsertedId(                                                                                   // 537
        collection, mongoSelector, mongoMod,                                                                          // 538
        isModify, options,                                                                                            // 539
        // This callback does not need to be bindEnvironment'ed because                                               // 540
        // simulateUpsertWithInsertedId() wraps it and then passes it through                                         // 541
        // bindEnvironmentForWrite.                                                                                   // 542
        function (err, result) {                                                                                      // 543
          // If we got here via a upsert() call, then options._returnObject will                                      // 544
          // be set and we should return the whole object. Otherwise, we should                                       // 545
          // just return the number of affected docs to match the mongo API.                                          // 546
          if (result && ! options._returnObject)                                                                      // 547
            callback(err, result.numberAffected);                                                                     // 548
          else                                                                                                        // 549
            callback(err, result);                                                                                    // 550
        }                                                                                                             // 551
      );                                                                                                              // 552
    } else {                                                                                                          // 553
      collection.update(                                                                                              // 554
        mongoSelector, mongoMod, mongoOpts,                                                                           // 555
        bindEnvironmentForWrite(function (err, result, extra) {                                                       // 556
          if (! err) {                                                                                                // 557
            if (result && options._returnObject) {                                                                    // 558
              result = { numberAffected: result };                                                                    // 559
              // If this was an upsert() call, and we ended up                                                        // 560
              // inserting a new doc and we know its id, then                                                         // 561
              // return that id as well.                                                                              // 562
              if (options.upsert && knownId &&                                                                        // 563
                  ! extra.updatedExisting)                                                                            // 564
                result.insertedId = knownId;                                                                          // 565
            }                                                                                                         // 566
          }                                                                                                           // 567
          callback(err, result);                                                                                      // 568
        }));                                                                                                          // 569
    }                                                                                                                 // 570
  } catch (e) {                                                                                                       // 571
    write.committed();                                                                                                // 572
    throw e;                                                                                                          // 573
  }                                                                                                                   // 574
};                                                                                                                    // 575
                                                                                                                      // 576
var isModificationMod = function (mod) {                                                                              // 577
  var isReplace = false;                                                                                              // 578
  var isModify = false;                                                                                               // 579
  for (var k in mod) {                                                                                                // 580
    if (k.substr(0, 1) === '$') {                                                                                     // 581
      isModify = true;                                                                                                // 582
    } else {                                                                                                          // 583
      isReplace = true;                                                                                               // 584
    }                                                                                                                 // 585
  }                                                                                                                   // 586
  if (isModify && isReplace) {                                                                                        // 587
    throw new Error(                                                                                                  // 588
      "Update parameter cannot have both modifier and non-modifier fields.");                                         // 589
  }                                                                                                                   // 590
  return isModify;                                                                                                    // 591
};                                                                                                                    // 592
                                                                                                                      // 593
var NUM_OPTIMISTIC_TRIES = 3;                                                                                         // 594
                                                                                                                      // 595
// exposed for testing                                                                                                // 596
MongoConnection._isCannotChangeIdError = function (err) {                                                             // 597
  // First check for what this error looked like in Mongo 2.4.  Either of these                                       // 598
  // checks should work, but just to be safe...                                                                       // 599
  if (err.code === 13596)                                                                                             // 600
    return true;                                                                                                      // 601
  if (err.err.indexOf("cannot change _id of a document") === 0)                                                       // 602
    return true;                                                                                                      // 603
                                                                                                                      // 604
  // Now look for what it looks like in Mongo 2.6.  We don't use the error code                                       // 605
  // here, because the error code we observed it producing (16837) appears to be                                      // 606
  // a far more generic error code based on examining the source.                                                     // 607
  if (err.err.indexOf("The _id field cannot be changed") === 0)                                                       // 608
    return true;                                                                                                      // 609
                                                                                                                      // 610
  return false;                                                                                                       // 611
};                                                                                                                    // 612
                                                                                                                      // 613
var simulateUpsertWithInsertedId = function (collection, selector, mod,                                               // 614
                                             isModify, options, callback) {                                           // 615
  // STRATEGY:  First try doing a plain update.  If it affected 0 documents,                                          // 616
  // then without affecting the database, we know we should probably do an                                            // 617
  // insert.  We then do a *conditional* insert that will fail in the case                                            // 618
  // of a race condition.  This conditional insert is actually an                                                     // 619
  // upsert-replace with an _id, which will never successfully update an                                              // 620
  // existing document.  If this upsert fails with an error saying it                                                 // 621
  // couldn't change an existing _id, then we know an intervening write has                                           // 622
  // caused the query to match something.  We go back to step one and repeat.                                         // 623
  // Like all "optimistic write" schemes, we rely on the fact that it's                                               // 624
  // unlikely our writes will continue to be interfered with under normal                                             // 625
  // circumstances (though sufficiently heavy contention with writers                                                 // 626
  // disagreeing on the existence of an object will cause writes to fail                                              // 627
  // in theory).                                                                                                      // 628
                                                                                                                      // 629
  var newDoc;                                                                                                         // 630
  // Run this code up front so that it fails fast if someone uses                                                     // 631
  // a Mongo update operator we don't support.                                                                        // 632
  if (isModify) {                                                                                                     // 633
    // We've already run replaceTypes/replaceMeteorAtomWithMongo on                                                   // 634
    // selector and mod.  We assume it doesn't matter, as far as                                                      // 635
    // the behavior of modifiers is concerned, whether `_modify`                                                      // 636
    // is run on EJSON or on mongo-converted EJSON.                                                                   // 637
    var selectorDoc = LocalCollection._removeDollarOperators(selector);                                               // 638
                                                                                                                      // 639
    newDoc = selectorDoc;                                                                                             // 640
                                                                                                                      // 641
    // Convert dotted keys into objects. (Resolves issue #4522).                                                      // 642
    _.each(newDoc, function (value, key) {                                                                            // 643
      var trail = key.split(".");                                                                                     // 644
                                                                                                                      // 645
      if (trail.length > 1) {                                                                                         // 646
        //Key is dotted. Convert it into an object.                                                                   // 647
        delete newDoc[key];                                                                                           // 648
                                                                                                                      // 649
        var obj = newDoc,                                                                                             // 650
            leaf = trail.pop();                                                                                       // 651
                                                                                                                      // 652
        // XXX It is not quite certain what should be done if there are clashing                                      // 653
        // keys on the trail of the dotted key. For now we will just override it                                      // 654
        // It wouldn't be a very sane query in the first place, but should look                                       // 655
        // up what mongo does in this case.                                                                           // 656
                                                                                                                      // 657
        while ((key = trail.shift())) {                                                                               // 658
          if (typeof obj[key] !== "object") {                                                                         // 659
            obj[key] = {};                                                                                            // 660
          }                                                                                                           // 661
                                                                                                                      // 662
          obj = obj[key];                                                                                             // 663
        }                                                                                                             // 664
                                                                                                                      // 665
        obj[leaf] = value;                                                                                            // 666
      }                                                                                                               // 667
    });                                                                                                               // 668
                                                                                                                      // 669
    LocalCollection._modify(newDoc, mod, {isInsert: true});                                                           // 670
  } else {                                                                                                            // 671
    newDoc = mod;                                                                                                     // 672
  }                                                                                                                   // 673
                                                                                                                      // 674
  var insertedId = options.insertedId; // must exist                                                                  // 675
  var mongoOptsForUpdate = {                                                                                          // 676
    safe: true,                                                                                                       // 677
    multi: options.multi                                                                                              // 678
  };                                                                                                                  // 679
  var mongoOptsForInsert = {                                                                                          // 680
    safe: true,                                                                                                       // 681
    upsert: true                                                                                                      // 682
  };                                                                                                                  // 683
                                                                                                                      // 684
  var tries = NUM_OPTIMISTIC_TRIES;                                                                                   // 685
                                                                                                                      // 686
  var doUpdate = function () {                                                                                        // 687
    tries--;                                                                                                          // 688
    if (! tries) {                                                                                                    // 689
      callback(new Error("Upsert failed after " + NUM_OPTIMISTIC_TRIES + " tries."));                                 // 690
    } else {                                                                                                          // 691
      collection.update(selector, mod, mongoOptsForUpdate,                                                            // 692
                        bindEnvironmentForWrite(function (err, result) {                                              // 693
                          if (err)                                                                                    // 694
                            callback(err);                                                                            // 695
                          else if (result)                                                                            // 696
                            callback(null, {                                                                          // 697
                              numberAffected: result                                                                  // 698
                            });                                                                                       // 699
                          else                                                                                        // 700
                            doConditionalInsert();                                                                    // 701
                        }));                                                                                          // 702
    }                                                                                                                 // 703
  };                                                                                                                  // 704
                                                                                                                      // 705
  var doConditionalInsert = function () {                                                                             // 706
    var replacementWithId = _.extend(                                                                                 // 707
      replaceTypes({_id: insertedId}, replaceMeteorAtomWithMongo),                                                    // 708
      newDoc);                                                                                                        // 709
    collection.update(selector, replacementWithId, mongoOptsForInsert,                                                // 710
                      bindEnvironmentForWrite(function (err, result) {                                                // 711
                        if (err) {                                                                                    // 712
                          // figure out if this is a                                                                  // 713
                          // "cannot change _id of document" error, and                                               // 714
                          // if so, try doUpdate() again, up to 3 times.                                              // 715
                          if (MongoConnection._isCannotChangeIdError(err)) {                                          // 716
                            doUpdate();                                                                               // 717
                          } else {                                                                                    // 718
                            callback(err);                                                                            // 719
                          }                                                                                           // 720
                        } else {                                                                                      // 721
                          callback(null, {                                                                            // 722
                            numberAffected: result,                                                                   // 723
                            insertedId: insertedId                                                                    // 724
                          });                                                                                         // 725
                        }                                                                                             // 726
                      }));                                                                                            // 727
  };                                                                                                                  // 728
                                                                                                                      // 729
  doUpdate();                                                                                                         // 730
};                                                                                                                    // 731
                                                                                                                      // 732
_.each(["insert", "update", "remove", "dropCollection", "dropDatabase"], function (method) {                          // 733
  MongoConnection.prototype[method] = function (/* arguments */) {                                                    // 734
    var self = this;                                                                                                  // 735
    return Meteor.wrapAsync(self["_" + method]).apply(self, arguments);                                               // 736
  };                                                                                                                  // 737
});                                                                                                                   // 738
                                                                                                                      // 739
// XXX MongoConnection.upsert() does not return the id of the inserted document                                       // 740
// unless you set it explicitly in the selector or modifier (as a replacement                                         // 741
// doc).                                                                                                              // 742
MongoConnection.prototype.upsert = function (collectionName, selector, mod,                                           // 743
                                             options, callback) {                                                     // 744
  var self = this;                                                                                                    // 745
  if (typeof options === "function" && ! callback) {                                                                  // 746
    callback = options;                                                                                               // 747
    options = {};                                                                                                     // 748
  }                                                                                                                   // 749
                                                                                                                      // 750
  return self.update(collectionName, selector, mod,                                                                   // 751
                     _.extend({}, options, {                                                                          // 752
                       upsert: true,                                                                                  // 753
                       _returnObject: true                                                                            // 754
                     }), callback);                                                                                   // 755
};                                                                                                                    // 756
                                                                                                                      // 757
MongoConnection.prototype.find = function (collectionName, selector, options) {                                       // 758
  var self = this;                                                                                                    // 759
                                                                                                                      // 760
  if (arguments.length === 1)                                                                                         // 761
    selector = {};                                                                                                    // 762
                                                                                                                      // 763
  return new Cursor(                                                                                                  // 764
    self, new CursorDescription(collectionName, selector, options));                                                  // 765
};                                                                                                                    // 766
                                                                                                                      // 767
MongoConnection.prototype.findOne = function (collection_name, selector,                                              // 768
                                              options) {                                                              // 769
  var self = this;                                                                                                    // 770
  if (arguments.length === 1)                                                                                         // 771
    selector = {};                                                                                                    // 772
                                                                                                                      // 773
  options = options || {};                                                                                            // 774
  options.limit = 1;                                                                                                  // 775
  return self.find(collection_name, selector, options).fetch()[0];                                                    // 776
};                                                                                                                    // 777
                                                                                                                      // 778
// We'll actually design an index API later. For now, we just pass through to                                         // 779
// Mongo's, but make it synchronous.                                                                                  // 780
MongoConnection.prototype._ensureIndex = function (collectionName, index,                                             // 781
                                                   options) {                                                         // 782
  var self = this;                                                                                                    // 783
                                                                                                                      // 784
  // We expect this function to be called at startup, not from within a method,                                       // 785
  // so we don't interact with the write fence.                                                                       // 786
  var collection = self.rawCollection(collectionName);                                                                // 787
  var future = new Future;                                                                                            // 788
  var indexName = collection.ensureIndex(index, options, future.resolver());                                          // 789
  future.wait();                                                                                                      // 790
};                                                                                                                    // 791
MongoConnection.prototype._dropIndex = function (collectionName, index) {                                             // 792
  var self = this;                                                                                                    // 793
                                                                                                                      // 794
  // This function is only used by test code, not within a method, so we don't                                        // 795
  // interact with the write fence.                                                                                   // 796
  var collection = self.rawCollection(collectionName);                                                                // 797
  var future = new Future;                                                                                            // 798
  var indexName = collection.dropIndex(index, future.resolver());                                                     // 799
  future.wait();                                                                                                      // 800
};                                                                                                                    // 801
                                                                                                                      // 802
// CURSORS                                                                                                            // 803
                                                                                                                      // 804
// There are several classes which relate to cursors:                                                                 // 805
//                                                                                                                    // 806
// CursorDescription represents the arguments used to construct a cursor:                                             // 807
// collectionName, selector, and (find) options.  Because it is used as a key                                         // 808
// for cursor de-dup, everything in it should either be JSON-stringifiable or                                         // 809
// not affect observeChanges output (eg, options.transform functions are not                                          // 810
// stringifiable but do not affect observeChanges).                                                                   // 811
//                                                                                                                    // 812
// SynchronousCursor is a wrapper around a MongoDB cursor                                                             // 813
// which includes fully-synchronous versions of forEach, etc.                                                         // 814
//                                                                                                                    // 815
// Cursor is the cursor object returned from find(), which implements the                                             // 816
// documented Mongo.Collection cursor API.  It wraps a CursorDescription and a                                        // 817
// SynchronousCursor (lazily: it doesn't contact Mongo until you call a method                                        // 818
// like fetch or forEach on it).                                                                                      // 819
//                                                                                                                    // 820
// ObserveHandle is the "observe handle" returned from observeChanges. It has a                                       // 821
// reference to an ObserveMultiplexer.                                                                                // 822
//                                                                                                                    // 823
// ObserveMultiplexer allows multiple identical ObserveHandles to be driven by a                                      // 824
// single observe driver.                                                                                             // 825
//                                                                                                                    // 826
// There are two "observe drivers" which drive ObserveMultiplexers:                                                   // 827
//   - PollingObserveDriver caches the results of a query and reruns it when                                          // 828
//     necessary.                                                                                                     // 829
//   - OplogObserveDriver follows the Mongo operation log to directly observe                                         // 830
//     database changes.                                                                                              // 831
// Both implementations follow the same simple interface: when you create them,                                       // 832
// they start sending observeChanges callbacks (and a ready() invocation) to                                          // 833
// their ObserveMultiplexer, and you stop them by calling their stop() method.                                        // 834
                                                                                                                      // 835
CursorDescription = function (collectionName, selector, options) {                                                    // 836
  var self = this;                                                                                                    // 837
  self.collectionName = collectionName;                                                                               // 838
  self.selector = Mongo.Collection._rewriteSelector(selector);                                                        // 839
  self.options = options || {};                                                                                       // 840
};                                                                                                                    // 841
                                                                                                                      // 842
Cursor = function (mongo, cursorDescription) {                                                                        // 843
  var self = this;                                                                                                    // 844
                                                                                                                      // 845
  self._mongo = mongo;                                                                                                // 846
  self._cursorDescription = cursorDescription;                                                                        // 847
  self._synchronousCursor = null;                                                                                     // 848
};                                                                                                                    // 849
                                                                                                                      // 850
_.each(['forEach', 'map', 'fetch', 'count'], function (method) {                                                      // 851
  Cursor.prototype[method] = function () {                                                                            // 852
    var self = this;                                                                                                  // 853
                                                                                                                      // 854
    // You can only observe a tailable cursor.                                                                        // 855
    if (self._cursorDescription.options.tailable)                                                                     // 856
      throw new Error("Cannot call " + method + " on a tailable cursor");                                             // 857
                                                                                                                      // 858
    if (!self._synchronousCursor) {                                                                                   // 859
      self._synchronousCursor = self._mongo._createSynchronousCursor(                                                 // 860
        self._cursorDescription, {                                                                                    // 861
          // Make sure that the "self" argument to forEach/map callbacks is the                                       // 862
          // Cursor, not the SynchronousCursor.                                                                       // 863
          selfForIteration: self,                                                                                     // 864
          useTransform: true                                                                                          // 865
        });                                                                                                           // 866
    }                                                                                                                 // 867
                                                                                                                      // 868
    return self._synchronousCursor[method].apply(                                                                     // 869
      self._synchronousCursor, arguments);                                                                            // 870
  };                                                                                                                  // 871
});                                                                                                                   // 872
                                                                                                                      // 873
// Since we don't actually have a "nextObject" interface, there's really no                                           // 874
// reason to have a "rewind" interface.  All it did was make multiple calls                                           // 875
// to fetch/map/forEach return nothing the second time.                                                               // 876
// XXX COMPAT WITH 0.8.1                                                                                              // 877
Cursor.prototype.rewind = function () {                                                                               // 878
};                                                                                                                    // 879
                                                                                                                      // 880
Cursor.prototype.getTransform = function () {                                                                         // 881
  return this._cursorDescription.options.transform;                                                                   // 882
};                                                                                                                    // 883
                                                                                                                      // 884
// When you call Meteor.publish() with a function that returns a Cursor, we need                                      // 885
// to transmute it into the equivalent subscription.  This is the function that                                       // 886
// does that.                                                                                                         // 887
                                                                                                                      // 888
Cursor.prototype._publishCursor = function (sub) {                                                                    // 889
  var self = this;                                                                                                    // 890
  var collection = self._cursorDescription.collectionName;                                                            // 891
  return Mongo.Collection._publishCursor(self, sub, collection);                                                      // 892
};                                                                                                                    // 893
                                                                                                                      // 894
// Used to guarantee that publish functions return at most one cursor per                                             // 895
// collection. Private, because we might later have cursors that include                                              // 896
// documents from multiple collections somehow.                                                                       // 897
Cursor.prototype._getCollectionName = function () {                                                                   // 898
  var self = this;                                                                                                    // 899
  return self._cursorDescription.collectionName;                                                                      // 900
}                                                                                                                     // 901
                                                                                                                      // 902
Cursor.prototype.observe = function (callbacks) {                                                                     // 903
  var self = this;                                                                                                    // 904
  return LocalCollection._observeFromObserveChanges(self, callbacks);                                                 // 905
};                                                                                                                    // 906
                                                                                                                      // 907
Cursor.prototype.observeChanges = function (callbacks) {                                                              // 908
  var self = this;                                                                                                    // 909
  var ordered = LocalCollection._observeChangesCallbacksAreOrdered(callbacks);                                        // 910
  return self._mongo._observeChanges(                                                                                 // 911
    self._cursorDescription, ordered, callbacks);                                                                     // 912
};                                                                                                                    // 913
                                                                                                                      // 914
MongoConnection.prototype._createSynchronousCursor = function(                                                        // 915
    cursorDescription, options) {                                                                                     // 916
  var self = this;                                                                                                    // 917
  options = _.pick(options || {}, 'selfForIteration', 'useTransform');                                                // 918
                                                                                                                      // 919
  var collection = self.rawCollection(cursorDescription.collectionName);                                              // 920
  var cursorOptions = cursorDescription.options;                                                                      // 921
  var mongoOptions = {                                                                                                // 922
    sort: cursorOptions.sort,                                                                                         // 923
    limit: cursorOptions.limit,                                                                                       // 924
    skip: cursorOptions.skip                                                                                          // 925
  };                                                                                                                  // 926
                                                                                                                      // 927
  // Do we want a tailable cursor (which only works on capped collections)?                                           // 928
  if (cursorOptions.tailable) {                                                                                       // 929
    // We want a tailable cursor...                                                                                   // 930
    mongoOptions.tailable = true;                                                                                     // 931
    // ... and for the server to wait a bit if any getMore has no data (rather                                        // 932
    // than making us put the relevant sleeps in the client)...                                                       // 933
    mongoOptions.awaitdata = true;                                                                                    // 934
    // ... and to keep querying the server indefinitely rather than just 5 times                                      // 935
    // if there's no more data.                                                                                       // 936
    mongoOptions.numberOfRetries = -1;                                                                                // 937
    // And if this is on the oplog collection and the cursor specifies a 'ts',                                        // 938
    // then set the undocumented oplog replay flag, which does a special scan to                                      // 939
    // find the first document (instead of creating an index on ts). This is a                                        // 940
    // very hard-coded Mongo flag which only works on the oplog collection and                                        // 941
    // only works with the ts field.                                                                                  // 942
    if (cursorDescription.collectionName === OPLOG_COLLECTION &&                                                      // 943
        cursorDescription.selector.ts) {                                                                              // 944
      mongoOptions.oplogReplay = true;                                                                                // 945
    }                                                                                                                 // 946
  }                                                                                                                   // 947
                                                                                                                      // 948
  var dbCursor = collection.find(                                                                                     // 949
    replaceTypes(cursorDescription.selector, replaceMeteorAtomWithMongo),                                             // 950
    cursorOptions.fields, mongoOptions);                                                                              // 951
                                                                                                                      // 952
  return new SynchronousCursor(dbCursor, cursorDescription, options);                                                 // 953
};                                                                                                                    // 954
                                                                                                                      // 955
var SynchronousCursor = function (dbCursor, cursorDescription, options) {                                             // 956
  var self = this;                                                                                                    // 957
  options = _.pick(options || {}, 'selfForIteration', 'useTransform');                                                // 958
                                                                                                                      // 959
  self._dbCursor = dbCursor;                                                                                          // 960
  self._cursorDescription = cursorDescription;                                                                        // 961
  // The "self" argument passed to forEach/map callbacks. If we're wrapped                                            // 962
  // inside a user-visible Cursor, we want to provide the outer cursor!                                               // 963
  self._selfForIteration = options.selfForIteration || self;                                                          // 964
  if (options.useTransform && cursorDescription.options.transform) {                                                  // 965
    self._transform = LocalCollection.wrapTransform(                                                                  // 966
      cursorDescription.options.transform);                                                                           // 967
  } else {                                                                                                            // 968
    self._transform = null;                                                                                           // 969
  }                                                                                                                   // 970
                                                                                                                      // 971
  // Need to specify that the callback is the first argument to nextObject,                                           // 972
  // since otherwise when we try to call it with no args the driver will                                              // 973
  // interpret "undefined" first arg as an options hash and crash.                                                    // 974
  self._synchronousNextObject = Future.wrap(                                                                          // 975
    dbCursor.nextObject.bind(dbCursor), 0);                                                                           // 976
  self._synchronousCount = Future.wrap(dbCursor.count.bind(dbCursor));                                                // 977
  self._visitedIds = new LocalCollection._IdMap;                                                                      // 978
};                                                                                                                    // 979
                                                                                                                      // 980
_.extend(SynchronousCursor.prototype, {                                                                               // 981
  _nextObject: function () {                                                                                          // 982
    var self = this;                                                                                                  // 983
                                                                                                                      // 984
    while (true) {                                                                                                    // 985
      var doc = self._synchronousNextObject().wait();                                                                 // 986
                                                                                                                      // 987
      if (!doc) return null;                                                                                          // 988
      doc = replaceTypes(doc, replaceMongoAtomWithMeteor);                                                            // 989
                                                                                                                      // 990
      if (!self._cursorDescription.options.tailable && _.has(doc, '_id')) {                                           // 991
        // Did Mongo give us duplicate documents in the same cursor? If so,                                           // 992
        // ignore this one. (Do this before the transform, since transform might                                      // 993
        // return some unrelated value.) We don't do this for tailable cursors,                                       // 994
        // because we want to maintain O(1) memory usage. And if there isn't _id                                      // 995
        // for some reason (maybe it's the oplog), then we don't do this either.                                      // 996
        // (Be careful to do this for falsey but existing _id, though.)                                               // 997
        if (self._visitedIds.has(doc._id)) continue;                                                                  // 998
        self._visitedIds.set(doc._id, true);                                                                          // 999
      }                                                                                                               // 1000
                                                                                                                      // 1001
      if (self._transform)                                                                                            // 1002
        doc = self._transform(doc);                                                                                   // 1003
                                                                                                                      // 1004
      return doc;                                                                                                     // 1005
    }                                                                                                                 // 1006
  },                                                                                                                  // 1007
                                                                                                                      // 1008
  forEach: function (callback, thisArg) {                                                                             // 1009
    var self = this;                                                                                                  // 1010
                                                                                                                      // 1011
    // Get back to the beginning.                                                                                     // 1012
    self._rewind();                                                                                                   // 1013
                                                                                                                      // 1014
    // We implement the loop ourself instead of using self._dbCursor.each,                                            // 1015
    // because "each" will call its callback outside of a fiber which makes it                                        // 1016
    // much more complex to make this function synchronous.                                                           // 1017
    var index = 0;                                                                                                    // 1018
    while (true) {                                                                                                    // 1019
      var doc = self._nextObject();                                                                                   // 1020
      if (!doc) return;                                                                                               // 1021
      callback.call(thisArg, doc, index++, self._selfForIteration);                                                   // 1022
    }                                                                                                                 // 1023
  },                                                                                                                  // 1024
                                                                                                                      // 1025
  // XXX Allow overlapping callback executions if callback yields.                                                    // 1026
  map: function (callback, thisArg) {                                                                                 // 1027
    var self = this;                                                                                                  // 1028
    var res = [];                                                                                                     // 1029
    self.forEach(function (doc, index) {                                                                              // 1030
      res.push(callback.call(thisArg, doc, index, self._selfForIteration));                                           // 1031
    });                                                                                                               // 1032
    return res;                                                                                                       // 1033
  },                                                                                                                  // 1034
                                                                                                                      // 1035
  _rewind: function () {                                                                                              // 1036
    var self = this;                                                                                                  // 1037
                                                                                                                      // 1038
    // known to be synchronous                                                                                        // 1039
    self._dbCursor.rewind();                                                                                          // 1040
                                                                                                                      // 1041
    self._visitedIds = new LocalCollection._IdMap;                                                                    // 1042
  },                                                                                                                  // 1043
                                                                                                                      // 1044
  // Mostly usable for tailable cursors.                                                                              // 1045
  close: function () {                                                                                                // 1046
    var self = this;                                                                                                  // 1047
                                                                                                                      // 1048
    self._dbCursor.close();                                                                                           // 1049
  },                                                                                                                  // 1050
                                                                                                                      // 1051
  fetch: function () {                                                                                                // 1052
    var self = this;                                                                                                  // 1053
    return self.map(_.identity);                                                                                      // 1054
  },                                                                                                                  // 1055
                                                                                                                      // 1056
  count: function () {                                                                                                // 1057
    var self = this;                                                                                                  // 1058
    return self._synchronousCount().wait();                                                                           // 1059
  },                                                                                                                  // 1060
                                                                                                                      // 1061
  // This method is NOT wrapped in Cursor.                                                                            // 1062
  getRawObjects: function (ordered) {                                                                                 // 1063
    var self = this;                                                                                                  // 1064
    if (ordered) {                                                                                                    // 1065
      return self.fetch();                                                                                            // 1066
    } else {                                                                                                          // 1067
      var results = new LocalCollection._IdMap;                                                                       // 1068
      self.forEach(function (doc) {                                                                                   // 1069
        results.set(doc._id, doc);                                                                                    // 1070
      });                                                                                                             // 1071
      return results;                                                                                                 // 1072
    }                                                                                                                 // 1073
  }                                                                                                                   // 1074
});                                                                                                                   // 1075
                                                                                                                      // 1076
MongoConnection.prototype.tail = function (cursorDescription, docCallback) {                                          // 1077
  var self = this;                                                                                                    // 1078
  if (!cursorDescription.options.tailable)                                                                            // 1079
    throw new Error("Can only tail a tailable cursor");                                                               // 1080
                                                                                                                      // 1081
  var cursor = self._createSynchronousCursor(cursorDescription);                                                      // 1082
                                                                                                                      // 1083
  var stopped = false;                                                                                                // 1084
  var lastTS = undefined;                                                                                             // 1085
  var loop = function () {                                                                                            // 1086
    while (true) {                                                                                                    // 1087
      if (stopped)                                                                                                    // 1088
        return;                                                                                                       // 1089
      try {                                                                                                           // 1090
        var doc = cursor._nextObject();                                                                               // 1091
      } catch (err) {                                                                                                 // 1092
        // There's no good way to figure out if this was actually an error                                            // 1093
        // from Mongo. Ah well. But either way, we need to retry the cursor                                           // 1094
        // (unless the failure was because the observe got stopped).                                                  // 1095
        doc = null;                                                                                                   // 1096
      }                                                                                                               // 1097
      // Since cursor._nextObject can yield, we need to check again to see if                                         // 1098
      // we've been stopped before calling the callback.                                                              // 1099
      if (stopped)                                                                                                    // 1100
        return;                                                                                                       // 1101
      if (doc) {                                                                                                      // 1102
        // If a tailable cursor contains a "ts" field, use it to recreate the                                         // 1103
        // cursor on error. ("ts" is a standard that Mongo uses internally for                                        // 1104
        // the oplog, and there's a special flag that lets you do binary search                                       // 1105
        // on it instead of needing to use an index.)                                                                 // 1106
        lastTS = doc.ts;                                                                                              // 1107
        docCallback(doc);                                                                                             // 1108
      } else {                                                                                                        // 1109
        var newSelector = _.clone(cursorDescription.selector);                                                        // 1110
        if (lastTS) {                                                                                                 // 1111
          newSelector.ts = {$gt: lastTS};                                                                             // 1112
        }                                                                                                             // 1113
        cursor = self._createSynchronousCursor(new CursorDescription(                                                 // 1114
          cursorDescription.collectionName,                                                                           // 1115
          newSelector,                                                                                                // 1116
          cursorDescription.options));                                                                                // 1117
        // Mongo failover takes many seconds.  Retry in a bit.  (Without this                                         // 1118
        // setTimeout, we peg the CPU at 100% and never notice the actual                                             // 1119
        // failover.                                                                                                  // 1120
        Meteor.setTimeout(loop, 100);                                                                                 // 1121
        break;                                                                                                        // 1122
      }                                                                                                               // 1123
    }                                                                                                                 // 1124
  };                                                                                                                  // 1125
                                                                                                                      // 1126
  Meteor.defer(loop);                                                                                                 // 1127
                                                                                                                      // 1128
  return {                                                                                                            // 1129
    stop: function () {                                                                                               // 1130
      stopped = true;                                                                                                 // 1131
      cursor.close();                                                                                                 // 1132
    }                                                                                                                 // 1133
  };                                                                                                                  // 1134
};                                                                                                                    // 1135
                                                                                                                      // 1136
MongoConnection.prototype._observeChanges = function (                                                                // 1137
    cursorDescription, ordered, callbacks) {                                                                          // 1138
  var self = this;                                                                                                    // 1139
                                                                                                                      // 1140
  if (cursorDescription.options.tailable) {                                                                           // 1141
    return self._observeChangesTailable(cursorDescription, ordered, callbacks);                                       // 1142
  }                                                                                                                   // 1143
                                                                                                                      // 1144
  // You may not filter out _id when observing changes, because the id is a core                                      // 1145
  // part of the observeChanges API.                                                                                  // 1146
  if (cursorDescription.options.fields &&                                                                             // 1147
      (cursorDescription.options.fields._id === 0 ||                                                                  // 1148
       cursorDescription.options.fields._id === false)) {                                                             // 1149
    throw Error("You may not observe a cursor with {fields: {_id: 0}}");                                              // 1150
  }                                                                                                                   // 1151
                                                                                                                      // 1152
  var observeKey = JSON.stringify(                                                                                    // 1153
    _.extend({ordered: ordered}, cursorDescription));                                                                 // 1154
                                                                                                                      // 1155
  var multiplexer, observeDriver;                                                                                     // 1156
  var firstHandle = false;                                                                                            // 1157
                                                                                                                      // 1158
  // Find a matching ObserveMultiplexer, or create a new one. This next block is                                      // 1159
  // guaranteed to not yield (and it doesn't call anything that can observe a                                         // 1160
  // new query), so no other calls to this function can interleave with it.                                           // 1161
  Meteor._noYieldsAllowed(function () {                                                                               // 1162
    if (_.has(self._observeMultiplexers, observeKey)) {                                                               // 1163
      multiplexer = self._observeMultiplexers[observeKey];                                                            // 1164
    } else {                                                                                                          // 1165
      firstHandle = true;                                                                                             // 1166
      // Create a new ObserveMultiplexer.                                                                             // 1167
      multiplexer = new ObserveMultiplexer({                                                                          // 1168
        ordered: ordered,                                                                                             // 1169
        onStop: function () {                                                                                         // 1170
          delete self._observeMultiplexers[observeKey];                                                               // 1171
          observeDriver.stop();                                                                                       // 1172
        }                                                                                                             // 1173
      });                                                                                                             // 1174
      self._observeMultiplexers[observeKey] = multiplexer;                                                            // 1175
    }                                                                                                                 // 1176
  });                                                                                                                 // 1177
                                                                                                                      // 1178
  var observeHandle = new ObserveHandle(multiplexer, callbacks);                                                      // 1179
                                                                                                                      // 1180
  if (firstHandle) {                                                                                                  // 1181
    var matcher, sorter;                                                                                              // 1182
    var canUseOplog = _.all([                                                                                         // 1183
      function () {                                                                                                   // 1184
        // At a bare minimum, using the oplog requires us to have an oplog, to                                        // 1185
        // want unordered callbacks, and to not want a callback on the polls                                          // 1186
        // that won't happen.                                                                                         // 1187
        return self._oplogHandle && !ordered &&                                                                       // 1188
          !callbacks._testOnlyPollCallback;                                                                           // 1189
      }, function () {                                                                                                // 1190
        // We need to be able to compile the selector. Fall back to polling for                                       // 1191
        // some newfangled $selector that minimongo doesn't support yet.                                              // 1192
        try {                                                                                                         // 1193
          matcher = new Minimongo.Matcher(cursorDescription.selector);                                                // 1194
          return true;                                                                                                // 1195
        } catch (e) {                                                                                                 // 1196
          // XXX make all compilation errors MinimongoError or something                                              // 1197
          //     so that this doesn't ignore unrelated exceptions                                                     // 1198
          return false;                                                                                               // 1199
        }                                                                                                             // 1200
      }, function () {                                                                                                // 1201
        // ... and the selector itself needs to support oplog.                                                        // 1202
        return OplogObserveDriver.cursorSupported(cursorDescription, matcher);                                        // 1203
      }, function () {                                                                                                // 1204
        // And we need to be able to compile the sort, if any.  eg, can't be                                          // 1205
        // {$natural: 1}.                                                                                             // 1206
        if (!cursorDescription.options.sort)                                                                          // 1207
          return true;                                                                                                // 1208
        try {                                                                                                         // 1209
          sorter = new Minimongo.Sorter(cursorDescription.options.sort,                                               // 1210
                                        { matcher: matcher });                                                        // 1211
          return true;                                                                                                // 1212
        } catch (e) {                                                                                                 // 1213
          // XXX make all compilation errors MinimongoError or something                                              // 1214
          //     so that this doesn't ignore unrelated exceptions                                                     // 1215
          return false;                                                                                               // 1216
        }                                                                                                             // 1217
      }], function (f) { return f(); });  // invoke each function                                                     // 1218
                                                                                                                      // 1219
    var driverClass = canUseOplog ? OplogObserveDriver : PollingObserveDriver;                                        // 1220
    observeDriver = new driverClass({                                                                                 // 1221
      cursorDescription: cursorDescription,                                                                           // 1222
      mongoHandle: self,                                                                                              // 1223
      multiplexer: multiplexer,                                                                                       // 1224
      ordered: ordered,                                                                                               // 1225
      matcher: matcher,  // ignored by polling                                                                        // 1226
      sorter: sorter,  // ignored by polling                                                                          // 1227
      _testOnlyPollCallback: callbacks._testOnlyPollCallback                                                          // 1228
    });                                                                                                               // 1229
                                                                                                                      // 1230
    // This field is only set for use in tests.                                                                       // 1231
    multiplexer._observeDriver = observeDriver;                                                                       // 1232
  }                                                                                                                   // 1233
                                                                                                                      // 1234
  // Blocks until the initial adds have been sent.                                                                    // 1235
  multiplexer.addHandleAndSendInitialAdds(observeHandle);                                                             // 1236
                                                                                                                      // 1237
  return observeHandle;                                                                                               // 1238
};                                                                                                                    // 1239
                                                                                                                      // 1240
// Listen for the invalidation messages that will trigger us to poll the                                              // 1241
// database for changes. If this selector specifies specific IDs, specify them                                        // 1242
// here, so that updates to different specific IDs don't cause us to poll.                                            // 1243
// listenCallback is the same kind of (notification, complete) callback passed                                        // 1244
// to InvalidationCrossbar.listen.                                                                                    // 1245
                                                                                                                      // 1246
listenAll = function (cursorDescription, listenCallback) {                                                            // 1247
  var listeners = [];                                                                                                 // 1248
  forEachTrigger(cursorDescription, function (trigger) {                                                              // 1249
    listeners.push(DDPServer._InvalidationCrossbar.listen(                                                            // 1250
      trigger, listenCallback));                                                                                      // 1251
  });                                                                                                                 // 1252
                                                                                                                      // 1253
  return {                                                                                                            // 1254
    stop: function () {                                                                                               // 1255
      _.each(listeners, function (listener) {                                                                         // 1256
        listener.stop();                                                                                              // 1257
      });                                                                                                             // 1258
    }                                                                                                                 // 1259
  };                                                                                                                  // 1260
};                                                                                                                    // 1261
                                                                                                                      // 1262
forEachTrigger = function (cursorDescription, triggerCallback) {                                                      // 1263
  var key = {collection: cursorDescription.collectionName};                                                           // 1264
  var specificIds = LocalCollection._idsMatchedBySelector(                                                            // 1265
    cursorDescription.selector);                                                                                      // 1266
  if (specificIds) {                                                                                                  // 1267
    _.each(specificIds, function (id) {                                                                               // 1268
      triggerCallback(_.extend({id: id}, key));                                                                       // 1269
    });                                                                                                               // 1270
    triggerCallback(_.extend({dropCollection: true, id: null}, key));                                                 // 1271
  } else {                                                                                                            // 1272
    triggerCallback(key);                                                                                             // 1273
  }                                                                                                                   // 1274
  // Everyone cares about the database being dropped.                                                                 // 1275
  triggerCallback({ dropDatabase: true });                                                                            // 1276
};                                                                                                                    // 1277
                                                                                                                      // 1278
// observeChanges for tailable cursors on capped collections.                                                         // 1279
//                                                                                                                    // 1280
// Some differences from normal cursors:                                                                              // 1281
//   - Will never produce anything other than 'added' or 'addedBefore'. If you                                        // 1282
//     do update a document that has already been produced, this will not notice                                      // 1283
//     it.                                                                                                            // 1284
//   - If you disconnect and reconnect from Mongo, it will essentially restart                                        // 1285
//     the query, which will lead to duplicate results. This is pretty bad,                                           // 1286
//     but if you include a field called 'ts' which is inserted as                                                    // 1287
//     new MongoInternals.MongoTimestamp(0, 0) (which is initialized to the                                           // 1288
//     current Mongo-style timestamp), we'll be able to find the place to                                             // 1289
//     restart properly. (This field is specifically understood by Mongo with an                                      // 1290
//     optimization which allows it to find the right place to start without                                          // 1291
//     an index on ts. It's how the oplog works.)                                                                     // 1292
//   - No callbacks are triggered synchronously with the call (there's no                                             // 1293
//     differentiation between "initial data" and "later changes"; everything                                         // 1294
//     that matches the query gets sent asynchronously).                                                              // 1295
//   - De-duplication is not implemented.                                                                             // 1296
//   - Does not yet interact with the write fence. Probably, this should work by                                      // 1297
//     ignoring removes (which don't work on capped collections) and updates                                          // 1298
//     (which don't affect tailable cursors), and just keeping track of the ID                                        // 1299
//     of the inserted object, and closing the write fence once you get to that                                       // 1300
//     ID (or timestamp?).  This doesn't work well if the document doesn't match                                      // 1301
//     the query, though.  On the other hand, the write fence can close                                               // 1302
//     immediately if it does not match the query. So if we trust minimongo                                           // 1303
//     enough to accurately evaluate the query against the write fence, we                                            // 1304
//     should be able to do this...  Of course, minimongo doesn't even support                                        // 1305
//     Mongo Timestamps yet.                                                                                          // 1306
MongoConnection.prototype._observeChangesTailable = function (                                                        // 1307
    cursorDescription, ordered, callbacks) {                                                                          // 1308
  var self = this;                                                                                                    // 1309
                                                                                                                      // 1310
  // Tailable cursors only ever call added/addedBefore callbacks, so it's an                                          // 1311
  // error if you didn't provide them.                                                                                // 1312
  if ((ordered && !callbacks.addedBefore) ||                                                                          // 1313
      (!ordered && !callbacks.added)) {                                                                               // 1314
    throw new Error("Can't observe an " + (ordered ? "ordered" : "unordered")                                         // 1315
                    + " tailable cursor without a "                                                                   // 1316
                    + (ordered ? "addedBefore" : "added") + " callback");                                             // 1317
  }                                                                                                                   // 1318
                                                                                                                      // 1319
  return self.tail(cursorDescription, function (doc) {                                                                // 1320
    var id = doc._id;                                                                                                 // 1321
    delete doc._id;                                                                                                   // 1322
    // The ts is an implementation detail. Hide it.                                                                   // 1323
    delete doc.ts;                                                                                                    // 1324
    if (ordered) {                                                                                                    // 1325
      callbacks.addedBefore(id, doc, null);                                                                           // 1326
    } else {                                                                                                          // 1327
      callbacks.added(id, doc);                                                                                       // 1328
    }                                                                                                                 // 1329
  });                                                                                                                 // 1330
};                                                                                                                    // 1331
                                                                                                                      // 1332
// XXX We probably need to find a better way to expose this. Right now                                                // 1333
// it's only used by tests, but in fact you need it in normal                                                         // 1334
// operation to interact with capped collections.                                                                     // 1335
MongoInternals.MongoTimestamp = MongoDB.Timestamp;                                                                    // 1336
                                                                                                                      // 1337
MongoInternals.Connection = MongoConnection;                                                                          // 1338
                                                                                                                      // 1339
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 1349
}).call(this);                                                                                                        // 1350
                                                                                                                      // 1351
                                                                                                                      // 1352
                                                                                                                      // 1353
                                                                                                                      // 1354
                                                                                                                      // 1355
                                                                                                                      // 1356
(function(){                                                                                                          // 1357
                                                                                                                      // 1358
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/oplog_tailing.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Future = Npm.require('fibers/future');                                                                            // 1
                                                                                                                      // 2
OPLOG_COLLECTION = 'oplog.rs';                                                                                        // 3
                                                                                                                      // 4
var TOO_FAR_BEHIND = process.env.METEOR_OPLOG_TOO_FAR_BEHIND || 2000;                                                 // 5
                                                                                                                      // 6
var showTS = function (ts) {                                                                                          // 7
  return "Timestamp(" + ts.getHighBits() + ", " + ts.getLowBits() + ")";                                              // 8
};                                                                                                                    // 9
                                                                                                                      // 10
idForOp = function (op) {                                                                                             // 11
  if (op.op === 'd')                                                                                                  // 12
    return op.o._id;                                                                                                  // 13
  else if (op.op === 'i')                                                                                             // 14
    return op.o._id;                                                                                                  // 15
  else if (op.op === 'u')                                                                                             // 16
    return op.o2._id;                                                                                                 // 17
  else if (op.op === 'c')                                                                                             // 18
    throw Error("Operator 'c' doesn't supply an object with id: " +                                                   // 19
                EJSON.stringify(op));                                                                                 // 20
  else                                                                                                                // 21
    throw Error("Unknown op: " + EJSON.stringify(op));                                                                // 22
};                                                                                                                    // 23
                                                                                                                      // 24
OplogHandle = function (oplogUrl, dbName) {                                                                           // 25
  var self = this;                                                                                                    // 26
  self._oplogUrl = oplogUrl;                                                                                          // 27
  self._dbName = dbName;                                                                                              // 28
                                                                                                                      // 29
  self._oplogLastEntryConnection = null;                                                                              // 30
  self._oplogTailConnection = null;                                                                                   // 31
  self._stopped = false;                                                                                              // 32
  self._tailHandle = null;                                                                                            // 33
  self._readyFuture = new Future();                                                                                   // 34
  self._crossbar = new DDPServer._Crossbar({                                                                          // 35
    factPackage: "mongo-livedata", factName: "oplog-watchers"                                                         // 36
  });                                                                                                                 // 37
  self._baseOplogSelector = {                                                                                         // 38
    ns: new RegExp('^' + Meteor._escapeRegExp(self._dbName) + '\\.'),                                                 // 39
    $or: [                                                                                                            // 40
      { op: {$in: ['i', 'u', 'd']} },                                                                                 // 41
      // drop collection                                                                                              // 42
      { op: 'c', 'o.drop': { $exists: true } },                                                                       // 43
      { op: 'c', 'o.dropDatabase': 1 },                                                                               // 44
    ]                                                                                                                 // 45
  };                                                                                                                  // 46
                                                                                                                      // 47
  // Data structures to support waitUntilCaughtUp(). Each oplog entry has a                                           // 48
  // MongoTimestamp object on it (which is not the same as a Date --- it's a                                          // 49
  // combination of time and an incrementing counter; see                                                             // 50
  // http://docs.mongodb.org/manual/reference/bson-types/#timestamps).                                                // 51
  //                                                                                                                  // 52
  // _catchingUpFutures is an array of {ts: MongoTimestamp, future: Future}                                           // 53
  // objects, sorted by ascending timestamp. _lastProcessedTS is the                                                  // 54
  // MongoTimestamp of the last oplog entry we've processed.                                                          // 55
  //                                                                                                                  // 56
  // Each time we call waitUntilCaughtUp, we take a peek at the final oplog                                           // 57
  // entry in the db.  If we've already processed it (ie, it is not greater than                                      // 58
  // _lastProcessedTS), waitUntilCaughtUp immediately returns. Otherwise,                                             // 59
  // waitUntilCaughtUp makes a new Future and inserts it along with the final                                         // 60
  // timestamp entry that it read, into _catchingUpFutures. waitUntilCaughtUp                                         // 61
  // then waits on that future, which is resolved once _lastProcessedTS is                                            // 62
  // incremented to be past its timestamp by the worker fiber.                                                        // 63
  //                                                                                                                  // 64
  // XXX use a priority queue or something else that's faster than an array                                           // 65
  self._catchingUpFutures = [];                                                                                       // 66
  self._lastProcessedTS = null;                                                                                       // 67
                                                                                                                      // 68
  self._onSkippedEntriesHook = new Hook({                                                                             // 69
    debugPrintExceptions: "onSkippedEntries callback"                                                                 // 70
  });                                                                                                                 // 71
                                                                                                                      // 72
  self._entryQueue = new Meteor._DoubleEndedQueue();                                                                  // 73
  self._workerActive = false;                                                                                         // 74
                                                                                                                      // 75
  self._startTailing();                                                                                               // 76
};                                                                                                                    // 77
                                                                                                                      // 78
_.extend(OplogHandle.prototype, {                                                                                     // 79
  stop: function () {                                                                                                 // 80
    var self = this;                                                                                                  // 81
    if (self._stopped)                                                                                                // 82
      return;                                                                                                         // 83
    self._stopped = true;                                                                                             // 84
    if (self._tailHandle)                                                                                             // 85
      self._tailHandle.stop();                                                                                        // 86
    // XXX should close connections too                                                                               // 87
  },                                                                                                                  // 88
  onOplogEntry: function (trigger, callback) {                                                                        // 89
    var self = this;                                                                                                  // 90
    if (self._stopped)                                                                                                // 91
      throw new Error("Called onOplogEntry on stopped handle!");                                                      // 92
                                                                                                                      // 93
    // Calling onOplogEntry requires us to wait for the tailing to be ready.                                          // 94
    self._readyFuture.wait();                                                                                         // 95
                                                                                                                      // 96
    var originalCallback = callback;                                                                                  // 97
    callback = Meteor.bindEnvironment(function (notification) {                                                       // 98
      // XXX can we avoid this clone by making oplog.js careful?                                                      // 99
      originalCallback(EJSON.clone(notification));                                                                    // 100
    }, function (err) {                                                                                               // 101
      Meteor._debug("Error in oplog callback", err.stack);                                                            // 102
    });                                                                                                               // 103
    var listenHandle = self._crossbar.listen(trigger, callback);                                                      // 104
    return {                                                                                                          // 105
      stop: function () {                                                                                             // 106
        listenHandle.stop();                                                                                          // 107
      }                                                                                                               // 108
    };                                                                                                                // 109
  },                                                                                                                  // 110
  // Register a callback to be invoked any time we skip oplog entries (eg,                                            // 111
  // because we are too far behind).                                                                                  // 112
  onSkippedEntries: function (callback) {                                                                             // 113
    var self = this;                                                                                                  // 114
    if (self._stopped)                                                                                                // 115
      throw new Error("Called onSkippedEntries on stopped handle!");                                                  // 116
    return self._onSkippedEntriesHook.register(callback);                                                             // 117
  },                                                                                                                  // 118
  // Calls `callback` once the oplog has been processed up to a point that is                                         // 119
  // roughly "now": specifically, once we've processed all ops that are                                               // 120
  // currently visible.                                                                                               // 121
  // XXX become convinced that this is actually safe even if oplogConnection                                          // 122
  // is some kind of pool                                                                                             // 123
  waitUntilCaughtUp: function () {                                                                                    // 124
    var self = this;                                                                                                  // 125
    if (self._stopped)                                                                                                // 126
      throw new Error("Called waitUntilCaughtUp on stopped handle!");                                                 // 127
                                                                                                                      // 128
    // Calling waitUntilCaughtUp requries us to wait for the oplog connection to                                      // 129
    // be ready.                                                                                                      // 130
    self._readyFuture.wait();                                                                                         // 131
                                                                                                                      // 132
    while (!self._stopped) {                                                                                          // 133
      // We need to make the selector at least as restrictive as the actual                                           // 134
      // tailing selector (ie, we need to specify the DB name) or else we might                                       // 135
      // find a TS that won't show up in the actual tail stream.                                                      // 136
      try {                                                                                                           // 137
        var lastEntry = self._oplogLastEntryConnection.findOne(                                                       // 138
          OPLOG_COLLECTION, self._baseOplogSelector,                                                                  // 139
          {fields: {ts: 1}, sort: {$natural: -1}});                                                                   // 140
        break;                                                                                                        // 141
      } catch (e) {                                                                                                   // 142
        // During failover (eg) if we get an exception we should log and retry                                        // 143
        // instead of crashing.                                                                                       // 144
        Meteor._debug("Got exception while reading last entry: " + e);                                                // 145
        Meteor._sleepForMs(100);                                                                                      // 146
      }                                                                                                               // 147
    }                                                                                                                 // 148
                                                                                                                      // 149
    if (self._stopped)                                                                                                // 150
      return;                                                                                                         // 151
                                                                                                                      // 152
    if (!lastEntry) {                                                                                                 // 153
      // Really, nothing in the oplog? Well, we've processed everything.                                              // 154
      return;                                                                                                         // 155
    }                                                                                                                 // 156
                                                                                                                      // 157
    var ts = lastEntry.ts;                                                                                            // 158
    if (!ts)                                                                                                          // 159
      throw Error("oplog entry without ts: " + EJSON.stringify(lastEntry));                                           // 160
                                                                                                                      // 161
    if (self._lastProcessedTS && ts.lessThanOrEqual(self._lastProcessedTS)) {                                         // 162
      // We've already caught up to here.                                                                             // 163
      return;                                                                                                         // 164
    }                                                                                                                 // 165
                                                                                                                      // 166
                                                                                                                      // 167
    // Insert the future into our list. Almost always, this will be at the end,                                       // 168
    // but it's conceivable that if we fail over from one primary to another,                                         // 169
    // the oplog entries we see will go backwards.                                                                    // 170
    var insertAfter = self._catchingUpFutures.length;                                                                 // 171
    while (insertAfter - 1 > 0                                                                                        // 172
           && self._catchingUpFutures[insertAfter - 1].ts.greaterThan(ts)) {                                          // 173
      insertAfter--;                                                                                                  // 174
    }                                                                                                                 // 175
    var f = new Future;                                                                                               // 176
    self._catchingUpFutures.splice(insertAfter, 0, {ts: ts, future: f});                                              // 177
    f.wait();                                                                                                         // 178
  },                                                                                                                  // 179
  _startTailing: function () {                                                                                        // 180
    var self = this;                                                                                                  // 181
    // First, make sure that we're talking to the local database.                                                     // 182
    var mongodbUri = Npm.require('mongodb-uri');                                                                      // 183
    if (mongodbUri.parse(self._oplogUrl).database !== 'local') {                                                      // 184
      throw Error("$MONGO_OPLOG_URL must be set to the 'local' database of " +                                        // 185
                  "a Mongo replica set");                                                                             // 186
    }                                                                                                                 // 187
                                                                                                                      // 188
    // We make two separate connections to Mongo. The Node Mongo driver                                               // 189
    // implements a naive round-robin connection pool: each "connection" is a                                         // 190
    // pool of several (5 by default) TCP connections, and each request is                                            // 191
    // rotated through the pools. Tailable cursor queries block on the server                                         // 192
    // until there is some data to return (or until a few seconds have                                                // 193
    // passed). So if the connection pool used for tailing cursors is the same                                        // 194
    // pool used for other queries, the other queries will be delayed by seconds                                      // 195
    // 1/5 of the time.                                                                                               // 196
    //                                                                                                                // 197
    // The tail connection will only ever be running a single tail command, so                                        // 198
    // it only needs to make one underlying TCP connection.                                                           // 199
    self._oplogTailConnection = new MongoConnection(                                                                  // 200
      self._oplogUrl, {poolSize: 1});                                                                                 // 201
    // XXX better docs, but: it's to get monotonic results                                                            // 202
    // XXX is it safe to say "if there's an in flight query, just use its                                             // 203
    //     results"? I don't think so but should consider that                                                        // 204
    self._oplogLastEntryConnection = new MongoConnection(                                                             // 205
      self._oplogUrl, {poolSize: 1});                                                                                 // 206
                                                                                                                      // 207
    // Now, make sure that there actually is a repl set here. If not, oplog                                           // 208
    // tailing won't ever find anything!                                                                              // 209
    var f = new Future;                                                                                               // 210
    self._oplogLastEntryConnection.db.admin().command(                                                                // 211
      { ismaster: 1 }, f.resolver());                                                                                 // 212
    var isMasterDoc = f.wait();                                                                                       // 213
    if (!(isMasterDoc && isMasterDoc.documents && isMasterDoc.documents[0] &&                                         // 214
          isMasterDoc.documents[0].setName)) {                                                                        // 215
      throw Error("$MONGO_OPLOG_URL must be set to the 'local' database of " +                                        // 216
                  "a Mongo replica set");                                                                             // 217
    }                                                                                                                 // 218
                                                                                                                      // 219
    // Find the last oplog entry.                                                                                     // 220
    var lastOplogEntry = self._oplogLastEntryConnection.findOne(                                                      // 221
      OPLOG_COLLECTION, {}, {sort: {$natural: -1}, fields: {ts: 1}});                                                 // 222
                                                                                                                      // 223
    var oplogSelector = _.clone(self._baseOplogSelector);                                                             // 224
    if (lastOplogEntry) {                                                                                             // 225
      // Start after the last entry that currently exists.                                                            // 226
      oplogSelector.ts = {$gt: lastOplogEntry.ts};                                                                    // 227
      // If there are any calls to callWhenProcessedLatest before any other                                           // 228
      // oplog entries show up, allow callWhenProcessedLatest to call its                                             // 229
      // callback immediately.                                                                                        // 230
      self._lastProcessedTS = lastOplogEntry.ts;                                                                      // 231
    }                                                                                                                 // 232
                                                                                                                      // 233
    var cursorDescription = new CursorDescription(                                                                    // 234
      OPLOG_COLLECTION, oplogSelector, {tailable: true});                                                             // 235
                                                                                                                      // 236
    self._tailHandle = self._oplogTailConnection.tail(                                                                // 237
      cursorDescription, function (doc) {                                                                             // 238
        self._entryQueue.push(doc);                                                                                   // 239
        self._maybeStartWorker();                                                                                     // 240
      }                                                                                                               // 241
    );                                                                                                                // 242
    self._readyFuture.return();                                                                                       // 243
  },                                                                                                                  // 244
                                                                                                                      // 245
  _maybeStartWorker: function () {                                                                                    // 246
    var self = this;                                                                                                  // 247
    if (self._workerActive)                                                                                           // 248
      return;                                                                                                         // 249
    self._workerActive = true;                                                                                        // 250
    Meteor.defer(function () {                                                                                        // 251
      try {                                                                                                           // 252
        while (! self._stopped && ! self._entryQueue.isEmpty()) {                                                     // 253
          // Are we too far behind? Just tell our observers that they need to                                         // 254
          // repoll, and drop our queue.                                                                              // 255
          if (self._entryQueue.length > TOO_FAR_BEHIND) {                                                             // 256
            var lastEntry = self._entryQueue.pop();                                                                   // 257
            self._entryQueue.clear();                                                                                 // 258
                                                                                                                      // 259
            self._onSkippedEntriesHook.each(function (callback) {                                                     // 260
              callback();                                                                                             // 261
              return true;                                                                                            // 262
            });                                                                                                       // 263
                                                                                                                      // 264
            // Free any waitUntilCaughtUp() calls that were waiting for us to                                         // 265
            // pass something that we just skipped.                                                                   // 266
            self._setLastProcessedTS(lastEntry.ts);                                                                   // 267
            continue;                                                                                                 // 268
          }                                                                                                           // 269
                                                                                                                      // 270
          var doc = self._entryQueue.shift();                                                                         // 271
                                                                                                                      // 272
          if (!(doc.ns && doc.ns.length > self._dbName.length + 1 &&                                                  // 273
                doc.ns.substr(0, self._dbName.length + 1) ===                                                         // 274
                (self._dbName + '.'))) {                                                                              // 275
            throw new Error("Unexpected ns");                                                                         // 276
          }                                                                                                           // 277
                                                                                                                      // 278
          var trigger = {collection: doc.ns.substr(self._dbName.length + 1),                                          // 279
                         dropCollection: false,                                                                       // 280
                         dropDatabase: false,                                                                         // 281
                         op: doc};                                                                                    // 282
                                                                                                                      // 283
          // Is it a special command and the collection name is hidden somewhere                                      // 284
          // in operator?                                                                                             // 285
          if (trigger.collection === "$cmd") {                                                                        // 286
            if (doc.o.dropDatabase) {                                                                                 // 287
              delete trigger.collection;                                                                              // 288
              trigger.dropDatabase = true;                                                                            // 289
            } else if (_.has(doc.o, 'drop')) {                                                                        // 290
              trigger.collection = doc.o.drop;                                                                        // 291
              trigger.dropCollection = true;                                                                          // 292
              trigger.id = null;                                                                                      // 293
            } else {                                                                                                  // 294
              throw Error("Unknown command " + JSON.stringify(doc));                                                  // 295
            }                                                                                                         // 296
          } else {                                                                                                    // 297
            // All other ops have an id.                                                                              // 298
            trigger.id = idForOp(doc);                                                                                // 299
          }                                                                                                           // 300
                                                                                                                      // 301
          self._crossbar.fire(trigger);                                                                               // 302
                                                                                                                      // 303
          // Now that we've processed this operation, process pending                                                 // 304
          // sequencers.                                                                                              // 305
          if (!doc.ts)                                                                                                // 306
            throw Error("oplog entry without ts: " + EJSON.stringify(doc));                                           // 307
          self._setLastProcessedTS(doc.ts);                                                                           // 308
        }                                                                                                             // 309
      } finally {                                                                                                     // 310
        self._workerActive = false;                                                                                   // 311
      }                                                                                                               // 312
    });                                                                                                               // 313
  },                                                                                                                  // 314
  _setLastProcessedTS: function (ts) {                                                                                // 315
    var self = this;                                                                                                  // 316
    self._lastProcessedTS = ts;                                                                                       // 317
    while (!_.isEmpty(self._catchingUpFutures)                                                                        // 318
           && self._catchingUpFutures[0].ts.lessThanOrEqual(                                                          // 319
             self._lastProcessedTS)) {                                                                                // 320
      var sequencer = self._catchingUpFutures.shift();                                                                // 321
      sequencer.future.return();                                                                                      // 322
    }                                                                                                                 // 323
  }                                                                                                                   // 324
});                                                                                                                   // 325
                                                                                                                      // 326
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 1692
}).call(this);                                                                                                        // 1693
                                                                                                                      // 1694
                                                                                                                      // 1695
                                                                                                                      // 1696
                                                                                                                      // 1697
                                                                                                                      // 1698
                                                                                                                      // 1699
(function(){                                                                                                          // 1700
                                                                                                                      // 1701
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/observe_multiplex.js                                                                                //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Future = Npm.require('fibers/future');                                                                            // 1
                                                                                                                      // 2
ObserveMultiplexer = function (options) {                                                                             // 3
  var self = this;                                                                                                    // 4
                                                                                                                      // 5
  if (!options || !_.has(options, 'ordered'))                                                                         // 6
    throw Error("must specified ordered");                                                                            // 7
                                                                                                                      // 8
  Package.facts && Package.facts.Facts.incrementServerFact(                                                           // 9
    "mongo-livedata", "observe-multiplexers", 1);                                                                     // 10
                                                                                                                      // 11
  self._ordered = options.ordered;                                                                                    // 12
  self._onStop = options.onStop || function () {};                                                                    // 13
  self._queue = new Meteor._SynchronousQueue();                                                                       // 14
  self._handles = {};                                                                                                 // 15
  self._readyFuture = new Future;                                                                                     // 16
  self._cache = new LocalCollection._CachingChangeObserver({                                                          // 17
    ordered: options.ordered});                                                                                       // 18
  // Number of addHandleAndSendInitialAdds tasks scheduled but not yet                                                // 19
  // running. removeHandle uses this to know if it's time to call the onStop                                          // 20
  // callback.                                                                                                        // 21
  self._addHandleTasksScheduledButNotPerformed = 0;                                                                   // 22
                                                                                                                      // 23
  _.each(self.callbackNames(), function (callbackName) {                                                              // 24
    self[callbackName] = function (/* ... */) {                                                                       // 25
      self._applyCallback(callbackName, _.toArray(arguments));                                                        // 26
    };                                                                                                                // 27
  });                                                                                                                 // 28
};                                                                                                                    // 29
                                                                                                                      // 30
_.extend(ObserveMultiplexer.prototype, {                                                                              // 31
  addHandleAndSendInitialAdds: function (handle) {                                                                    // 32
    var self = this;                                                                                                  // 33
                                                                                                                      // 34
    // Check this before calling runTask (even though runTask does the same                                           // 35
    // check) so that we don't leak an ObserveMultiplexer on error by                                                 // 36
    // incrementing _addHandleTasksScheduledButNotPerformed and never                                                 // 37
    // decrementing it.                                                                                               // 38
    if (!self._queue.safeToRunTask())                                                                                 // 39
      throw new Error(                                                                                                // 40
        "Can't call observeChanges from an observe callback on the same query");                                      // 41
    ++self._addHandleTasksScheduledButNotPerformed;                                                                   // 42
                                                                                                                      // 43
    Package.facts && Package.facts.Facts.incrementServerFact(                                                         // 44
      "mongo-livedata", "observe-handles", 1);                                                                        // 45
                                                                                                                      // 46
    self._queue.runTask(function () {                                                                                 // 47
      self._handles[handle._id] = handle;                                                                             // 48
      // Send out whatever adds we have so far (whether or not we the                                                 // 49
      // multiplexer is ready).                                                                                       // 50
      self._sendAdds(handle);                                                                                         // 51
      --self._addHandleTasksScheduledButNotPerformed;                                                                 // 52
    });                                                                                                               // 53
    // *outside* the task, since otherwise we'd deadlock                                                              // 54
    self._readyFuture.wait();                                                                                         // 55
  },                                                                                                                  // 56
                                                                                                                      // 57
  // Remove an observe handle. If it was the last observe handle, call the                                            // 58
  // onStop callback; you cannot add any more observe handles after this.                                             // 59
  //                                                                                                                  // 60
  // This is not synchronized with polls and handle additions: this means that                                        // 61
  // you can safely call it from within an observe callback, but it also means                                        // 62
  // that we have to be careful when we iterate over _handles.                                                        // 63
  removeHandle: function (id) {                                                                                       // 64
    var self = this;                                                                                                  // 65
                                                                                                                      // 66
    // This should not be possible: you can only call removeHandle by having                                          // 67
    // access to the ObserveHandle, which isn't returned to user code until the                                       // 68
    // multiplex is ready.                                                                                            // 69
    if (!self._ready())                                                                                               // 70
      throw new Error("Can't remove handles until the multiplex is ready");                                           // 71
                                                                                                                      // 72
    delete self._handles[id];                                                                                         // 73
                                                                                                                      // 74
    Package.facts && Package.facts.Facts.incrementServerFact(                                                         // 75
      "mongo-livedata", "observe-handles", -1);                                                                       // 76
                                                                                                                      // 77
    if (_.isEmpty(self._handles) &&                                                                                   // 78
        self._addHandleTasksScheduledButNotPerformed === 0) {                                                         // 79
      self._stop();                                                                                                   // 80
    }                                                                                                                 // 81
  },                                                                                                                  // 82
  _stop: function (options) {                                                                                         // 83
    var self = this;                                                                                                  // 84
    options = options || {};                                                                                          // 85
                                                                                                                      // 86
    // It shouldn't be possible for us to stop when all our handles still                                             // 87
    // haven't been returned from observeChanges!                                                                     // 88
    if (! self._ready() && ! options.fromQueryError)                                                                  // 89
      throw Error("surprising _stop: not ready");                                                                     // 90
                                                                                                                      // 91
    // Call stop callback (which kills the underlying process which sends us                                          // 92
    // callbacks and removes us from the connection's dictionary).                                                    // 93
    self._onStop();                                                                                                   // 94
    Package.facts && Package.facts.Facts.incrementServerFact(                                                         // 95
      "mongo-livedata", "observe-multiplexers", -1);                                                                  // 96
                                                                                                                      // 97
    // Cause future addHandleAndSendInitialAdds calls to throw (but the onStop                                        // 98
    // callback should make our connection forget about us).                                                          // 99
    self._handles = null;                                                                                             // 100
  },                                                                                                                  // 101
                                                                                                                      // 102
  // Allows all addHandleAndSendInitialAdds calls to return, once all preceding                                       // 103
  // adds have been processed. Does not block.                                                                        // 104
  ready: function () {                                                                                                // 105
    var self = this;                                                                                                  // 106
    self._queue.queueTask(function () {                                                                               // 107
      if (self._ready())                                                                                              // 108
        throw Error("can't make ObserveMultiplex ready twice!");                                                      // 109
      self._readyFuture.return();                                                                                     // 110
    });                                                                                                               // 111
  },                                                                                                                  // 112
                                                                                                                      // 113
  // If trying to execute the query results in an error, call this. This is                                           // 114
  // intended for permanent errors, not transient network errors that could be                                        // 115
  // fixed. It should only be called before ready(), because if you called ready                                      // 116
  // that meant that you managed to run the query once. It will stop this                                             // 117
  // ObserveMultiplex and cause addHandleAndSendInitialAdds calls (and thus                                           // 118
  // observeChanges calls) to throw the error.                                                                        // 119
  queryError: function (err) {                                                                                        // 120
    var self = this;                                                                                                  // 121
    self._queue.runTask(function () {                                                                                 // 122
      if (self._ready())                                                                                              // 123
        throw Error("can't claim query has an error after it worked!");                                               // 124
      self._stop({fromQueryError: true});                                                                             // 125
      self._readyFuture.throw(err);                                                                                   // 126
    });                                                                                                               // 127
  },                                                                                                                  // 128
                                                                                                                      // 129
  // Calls "cb" once the effects of all "ready", "addHandleAndSendInitialAdds"                                        // 130
  // and observe callbacks which came before this call have been propagated to                                        // 131
  // all handles. "ready" must have already been called on this multiplexer.                                          // 132
  onFlush: function (cb) {                                                                                            // 133
    var self = this;                                                                                                  // 134
    self._queue.queueTask(function () {                                                                               // 135
      if (!self._ready())                                                                                             // 136
        throw Error("only call onFlush on a multiplexer that will be ready");                                         // 137
      cb();                                                                                                           // 138
    });                                                                                                               // 139
  },                                                                                                                  // 140
  callbackNames: function () {                                                                                        // 141
    var self = this;                                                                                                  // 142
    if (self._ordered)                                                                                                // 143
      return ["addedBefore", "changed", "movedBefore", "removed"];                                                    // 144
    else                                                                                                              // 145
      return ["added", "changed", "removed"];                                                                         // 146
  },                                                                                                                  // 147
  _ready: function () {                                                                                               // 148
    return this._readyFuture.isResolved();                                                                            // 149
  },                                                                                                                  // 150
  _applyCallback: function (callbackName, args) {                                                                     // 151
    var self = this;                                                                                                  // 152
    self._queue.queueTask(function () {                                                                               // 153
      // If we stopped in the meantime, do nothing.                                                                   // 154
      if (!self._handles)                                                                                             // 155
        return;                                                                                                       // 156
                                                                                                                      // 157
      // First, apply the change to the cache.                                                                        // 158
      // XXX We could make applyChange callbacks promise not to hang on to any                                        // 159
      // state from their arguments (assuming that their supplied callbacks                                           // 160
      // don't) and skip this clone. Currently 'changed' hangs on to state                                            // 161
      // though.                                                                                                      // 162
      self._cache.applyChange[callbackName].apply(null, EJSON.clone(args));                                           // 163
                                                                                                                      // 164
      // If we haven't finished the initial adds, then we should only be getting                                      // 165
      // adds.                                                                                                        // 166
      if (!self._ready() &&                                                                                           // 167
          (callbackName !== 'added' && callbackName !== 'addedBefore')) {                                             // 168
        throw new Error("Got " + callbackName + " during initial adds");                                              // 169
      }                                                                                                               // 170
                                                                                                                      // 171
      // Now multiplex the callbacks out to all observe handles. It's OK if                                           // 172
      // these calls yield; since we're inside a task, no other use of our queue                                      // 173
      // can continue until these are done. (But we do have to be careful to not                                      // 174
      // use a handle that got removed, because removeHandle does not use the                                         // 175
      // queue; thus, we iterate over an array of keys that we control.)                                              // 176
      _.each(_.keys(self._handles), function (handleId) {                                                             // 177
        var handle = self._handles && self._handles[handleId];                                                        // 178
        if (!handle)                                                                                                  // 179
          return;                                                                                                     // 180
        var callback = handle['_' + callbackName];                                                                    // 181
        // clone arguments so that callbacks can mutate their arguments                                               // 182
        callback && callback.apply(null, EJSON.clone(args));                                                          // 183
      });                                                                                                             // 184
    });                                                                                                               // 185
  },                                                                                                                  // 186
                                                                                                                      // 187
  // Sends initial adds to a handle. It should only be called from within a task                                      // 188
  // (the task that is processing the addHandleAndSendInitialAdds call). It                                           // 189
  // synchronously invokes the handle's added or addedBefore; there's no need to                                      // 190
  // flush the queue afterwards to ensure that the callbacks get out.                                                 // 191
  _sendAdds: function (handle) {                                                                                      // 192
    var self = this;                                                                                                  // 193
    if (self._queue.safeToRunTask())                                                                                  // 194
      throw Error("_sendAdds may only be called from within a task!");                                                // 195
    var add = self._ordered ? handle._addedBefore : handle._added;                                                    // 196
    if (!add)                                                                                                         // 197
      return;                                                                                                         // 198
    // note: docs may be an _IdMap or an OrderedDict                                                                  // 199
    self._cache.docs.forEach(function (doc, id) {                                                                     // 200
      if (!_.has(self._handles, handle._id))                                                                          // 201
        throw Error("handle got removed before sending initial adds!");                                               // 202
      var fields = EJSON.clone(doc);                                                                                  // 203
      delete fields._id;                                                                                              // 204
      if (self._ordered)                                                                                              // 205
        add(id, fields, null); // we're going in order, so add at end                                                 // 206
      else                                                                                                            // 207
        add(id, fields);                                                                                              // 208
    });                                                                                                               // 209
  }                                                                                                                   // 210
});                                                                                                                   // 211
                                                                                                                      // 212
                                                                                                                      // 213
var nextObserveHandleId = 1;                                                                                          // 214
ObserveHandle = function (multiplexer, callbacks) {                                                                   // 215
  var self = this;                                                                                                    // 216
  // The end user is only supposed to call stop().  The other fields are                                              // 217
  // accessible to the multiplexer, though.                                                                           // 218
  self._multiplexer = multiplexer;                                                                                    // 219
  _.each(multiplexer.callbackNames(), function (name) {                                                               // 220
    if (callbacks[name]) {                                                                                            // 221
      self['_' + name] = callbacks[name];                                                                             // 222
    } else if (name === "addedBefore" && callbacks.added) {                                                           // 223
      // Special case: if you specify "added" and "movedBefore", you get an                                           // 224
      // ordered observe where for some reason you don't get ordering data on                                         // 225
      // the adds.  I dunno, we wrote tests for it, there must have been a                                            // 226
      // reason.                                                                                                      // 227
      self._addedBefore = function (id, fields, before) {                                                             // 228
        callbacks.added(id, fields);                                                                                  // 229
      };                                                                                                              // 230
    }                                                                                                                 // 231
  });                                                                                                                 // 232
  self._stopped = false;                                                                                              // 233
  self._id = nextObserveHandleId++;                                                                                   // 234
};                                                                                                                    // 235
ObserveHandle.prototype.stop = function () {                                                                          // 236
  var self = this;                                                                                                    // 237
  if (self._stopped)                                                                                                  // 238
    return;                                                                                                           // 239
  self._stopped = true;                                                                                               // 240
  self._multiplexer.removeHandle(self._id);                                                                           // 241
};                                                                                                                    // 242
                                                                                                                      // 243
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 1952
}).call(this);                                                                                                        // 1953
                                                                                                                      // 1954
                                                                                                                      // 1955
                                                                                                                      // 1956
                                                                                                                      // 1957
                                                                                                                      // 1958
                                                                                                                      // 1959
(function(){                                                                                                          // 1960
                                                                                                                      // 1961
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/doc_fetcher.js                                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Fiber = Npm.require('fibers');                                                                                    // 1
var Future = Npm.require('fibers/future');                                                                            // 2
                                                                                                                      // 3
DocFetcher = function (mongoConnection) {                                                                             // 4
  var self = this;                                                                                                    // 5
  self._mongoConnection = mongoConnection;                                                                            // 6
  // Map from cache key -> [callback]                                                                                 // 7
  self._callbacksForCacheKey = {};                                                                                    // 8
};                                                                                                                    // 9
                                                                                                                      // 10
_.extend(DocFetcher.prototype, {                                                                                      // 11
  // Fetches document "id" from collectionName, returning it or null if not                                           // 12
  // found.                                                                                                           // 13
  //                                                                                                                  // 14
  // If you make multiple calls to fetch() with the same cacheKey (a string),                                         // 15
  // DocFetcher may assume that they all return the same document. (It does                                           // 16
  // not check to see if collectionName/id match.)                                                                    // 17
  //                                                                                                                  // 18
  // You may assume that callback is never called synchronously (and in fact                                          // 19
  // OplogObserveDriver does so).                                                                                     // 20
  fetch: function (collectionName, id, cacheKey, callback) {                                                          // 21
    var self = this;                                                                                                  // 22
                                                                                                                      // 23
    check(collectionName, String);                                                                                    // 24
    // id is some sort of scalar                                                                                      // 25
    check(cacheKey, String);                                                                                          // 26
                                                                                                                      // 27
    // If there's already an in-progress fetch for this cache key, yield until                                        // 28
    // it's done and return whatever it returns.                                                                      // 29
    if (_.has(self._callbacksForCacheKey, cacheKey)) {                                                                // 30
      self._callbacksForCacheKey[cacheKey].push(callback);                                                            // 31
      return;                                                                                                         // 32
    }                                                                                                                 // 33
                                                                                                                      // 34
    var callbacks = self._callbacksForCacheKey[cacheKey] = [callback];                                                // 35
                                                                                                                      // 36
    Fiber(function () {                                                                                               // 37
      try {                                                                                                           // 38
        var doc = self._mongoConnection.findOne(                                                                      // 39
          collectionName, {_id: id}) || null;                                                                         // 40
        // Return doc to all relevant callbacks. Note that this array can                                             // 41
        // continue to grow during callback excecution.                                                               // 42
        while (!_.isEmpty(callbacks)) {                                                                               // 43
          // Clone the document so that the various calls to fetch don't return                                       // 44
          // objects that are intertwingled with each other. Clone before                                             // 45
          // popping the future, so that if clone throws, the error gets passed                                       // 46
          // to the next callback.                                                                                    // 47
          var clonedDoc = EJSON.clone(doc);                                                                           // 48
          callbacks.pop()(null, clonedDoc);                                                                           // 49
        }                                                                                                             // 50
      } catch (e) {                                                                                                   // 51
        while (!_.isEmpty(callbacks)) {                                                                               // 52
          callbacks.pop()(e);                                                                                         // 53
        }                                                                                                             // 54
      } finally {                                                                                                     // 55
        // XXX consider keeping the doc around for a period of time before                                            // 56
        // removing from the cache                                                                                    // 57
        delete self._callbacksForCacheKey[cacheKey];                                                                  // 58
      }                                                                                                               // 59
    }).run();                                                                                                         // 60
  }                                                                                                                   // 61
});                                                                                                                   // 62
                                                                                                                      // 63
MongoTest.DocFetcher = DocFetcher;                                                                                    // 64
                                                                                                                      // 65
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 2034
}).call(this);                                                                                                        // 2035
                                                                                                                      // 2036
                                                                                                                      // 2037
                                                                                                                      // 2038
                                                                                                                      // 2039
                                                                                                                      // 2040
                                                                                                                      // 2041
(function(){                                                                                                          // 2042
                                                                                                                      // 2043
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/polling_observe_driver.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
PollingObserveDriver = function (options) {                                                                           // 1
  var self = this;                                                                                                    // 2
                                                                                                                      // 3
  self._cursorDescription = options.cursorDescription;                                                                // 4
  self._mongoHandle = options.mongoHandle;                                                                            // 5
  self._ordered = options.ordered;                                                                                    // 6
  self._multiplexer = options.multiplexer;                                                                            // 7
  self._stopCallbacks = [];                                                                                           // 8
  self._stopped = false;                                                                                              // 9
                                                                                                                      // 10
  self._synchronousCursor = self._mongoHandle._createSynchronousCursor(                                               // 11
    self._cursorDescription);                                                                                         // 12
                                                                                                                      // 13
  // previous results snapshot.  on each poll cycle, diffs against                                                    // 14
  // results drives the callbacks.                                                                                    // 15
  self._results = null;                                                                                               // 16
                                                                                                                      // 17
  // The number of _pollMongo calls that have been added to self._taskQueue but                                       // 18
  // have not started running. Used to make sure we never schedule more than one                                      // 19
  // _pollMongo (other than possibly the one that is currently running). It's                                         // 20
  // also used by _suspendPolling to pretend there's a poll scheduled. Usually,                                       // 21
  // it's either 0 (for "no polls scheduled other than maybe one currently                                            // 22
  // running") or 1 (for "a poll scheduled that isn't running yet"), but it can                                       // 23
  // also be 2 if incremented by _suspendPolling.                                                                     // 24
  self._pollsScheduledButNotStarted = 0;                                                                              // 25
  self._pendingWrites = []; // people to notify when polling completes                                                // 26
                                                                                                                      // 27
  // Make sure to create a separately throttled function for each                                                     // 28
  // PollingObserveDriver object.                                                                                     // 29
  self._ensurePollIsScheduled = _.throttle(                                                                           // 30
    self._unthrottledEnsurePollIsScheduled, 50 /* ms */);                                                             // 31
                                                                                                                      // 32
  // XXX figure out if we still need a queue                                                                          // 33
  self._taskQueue = new Meteor._SynchronousQueue();                                                                   // 34
                                                                                                                      // 35
  var listenersHandle = listenAll(                                                                                    // 36
    self._cursorDescription, function (notification) {                                                                // 37
      // When someone does a transaction that might affect us, schedule a poll                                        // 38
      // of the database. If that transaction happens inside of a write fence,                                        // 39
      // block the fence until we've polled and notified observers.                                                   // 40
      var fence = DDPServer._CurrentWriteFence.get();                                                                 // 41
      if (fence)                                                                                                      // 42
        self._pendingWrites.push(fence.beginWrite());                                                                 // 43
      // Ensure a poll is scheduled... but if we already know that one is,                                            // 44
      // don't hit the throttled _ensurePollIsScheduled function (which might                                         // 45
      // lead to us calling it unnecessarily in 50ms).                                                                // 46
      if (self._pollsScheduledButNotStarted === 0)                                                                    // 47
        self._ensurePollIsScheduled();                                                                                // 48
    }                                                                                                                 // 49
  );                                                                                                                  // 50
  self._stopCallbacks.push(function () { listenersHandle.stop(); });                                                  // 51
                                                                                                                      // 52
  // every once and a while, poll even if we don't think we're dirty, for                                             // 53
  // eventual consistency with database writes from outside the Meteor                                                // 54
  // universe.                                                                                                        // 55
  //                                                                                                                  // 56
  // For testing, there's an undocumented callback argument to observeChanges                                         // 57
  // which disables time-based polling and gets called at the beginning of each                                       // 58
  // poll.                                                                                                            // 59
  if (options._testOnlyPollCallback) {                                                                                // 60
    self._testOnlyPollCallback = options._testOnlyPollCallback;                                                       // 61
  } else {                                                                                                            // 62
    var intervalHandle = Meteor.setInterval(                                                                          // 63
      _.bind(self._ensurePollIsScheduled, self), 10 * 1000);                                                          // 64
    self._stopCallbacks.push(function () {                                                                            // 65
      Meteor.clearInterval(intervalHandle);                                                                           // 66
    });                                                                                                               // 67
  }                                                                                                                   // 68
                                                                                                                      // 69
  // Make sure we actually poll soon!                                                                                 // 70
  self._unthrottledEnsurePollIsScheduled();                                                                           // 71
                                                                                                                      // 72
  Package.facts && Package.facts.Facts.incrementServerFact(                                                           // 73
    "mongo-livedata", "observe-drivers-polling", 1);                                                                  // 74
};                                                                                                                    // 75
                                                                                                                      // 76
_.extend(PollingObserveDriver.prototype, {                                                                            // 77
  // This is always called through _.throttle (except once at startup).                                               // 78
  _unthrottledEnsurePollIsScheduled: function () {                                                                    // 79
    var self = this;                                                                                                  // 80
    if (self._pollsScheduledButNotStarted > 0)                                                                        // 81
      return;                                                                                                         // 82
    ++self._pollsScheduledButNotStarted;                                                                              // 83
    self._taskQueue.queueTask(function () {                                                                           // 84
      self._pollMongo();                                                                                              // 85
    });                                                                                                               // 86
  },                                                                                                                  // 87
                                                                                                                      // 88
  // test-only interface for controlling polling.                                                                     // 89
  //                                                                                                                  // 90
  // _suspendPolling blocks until any currently running and scheduled polls are                                       // 91
  // done, and prevents any further polls from being scheduled. (new                                                  // 92
  // ObserveHandles can be added and receive their initial added callbacks,                                           // 93
  // though.)                                                                                                         // 94
  //                                                                                                                  // 95
  // _resumePolling immediately polls, and allows further polls to occur.                                             // 96
  _suspendPolling: function() {                                                                                       // 97
    var self = this;                                                                                                  // 98
    // Pretend that there's another poll scheduled (which will prevent                                                // 99
    // _ensurePollIsScheduled from queueing any more polls).                                                          // 100
    ++self._pollsScheduledButNotStarted;                                                                              // 101
    // Now block until all currently running or scheduled polls are done.                                             // 102
    self._taskQueue.runTask(function() {});                                                                           // 103
                                                                                                                      // 104
    // Confirm that there is only one "poll" (the fake one we're pretending to                                        // 105
    // have) scheduled.                                                                                               // 106
    if (self._pollsScheduledButNotStarted !== 1)                                                                      // 107
      throw new Error("_pollsScheduledButNotStarted is " +                                                            // 108
                      self._pollsScheduledButNotStarted);                                                             // 109
  },                                                                                                                  // 110
  _resumePolling: function() {                                                                                        // 111
    var self = this;                                                                                                  // 112
    // We should be in the same state as in the end of _suspendPolling.                                               // 113
    if (self._pollsScheduledButNotStarted !== 1)                                                                      // 114
      throw new Error("_pollsScheduledButNotStarted is " +                                                            // 115
                      self._pollsScheduledButNotStarted);                                                             // 116
    // Run a poll synchronously (which will counteract the                                                            // 117
    // ++_pollsScheduledButNotStarted from _suspendPolling).                                                          // 118
    self._taskQueue.runTask(function () {                                                                             // 119
      self._pollMongo();                                                                                              // 120
    });                                                                                                               // 121
  },                                                                                                                  // 122
                                                                                                                      // 123
  _pollMongo: function () {                                                                                           // 124
    var self = this;                                                                                                  // 125
    --self._pollsScheduledButNotStarted;                                                                              // 126
                                                                                                                      // 127
    if (self._stopped)                                                                                                // 128
      return;                                                                                                         // 129
                                                                                                                      // 130
    var first = false;                                                                                                // 131
    var oldResults = self._results;                                                                                   // 132
    if (!oldResults) {                                                                                                // 133
      first = true;                                                                                                   // 134
      // XXX maybe use OrderedDict instead?                                                                           // 135
      oldResults = self._ordered ? [] : new LocalCollection._IdMap;                                                   // 136
    }                                                                                                                 // 137
                                                                                                                      // 138
    self._testOnlyPollCallback && self._testOnlyPollCallback();                                                       // 139
                                                                                                                      // 140
    // Save the list of pending writes which this round will commit.                                                  // 141
    var writesForCycle = self._pendingWrites;                                                                         // 142
    self._pendingWrites = [];                                                                                         // 143
                                                                                                                      // 144
    // Get the new query results. (This yields.)                                                                      // 145
    try {                                                                                                             // 146
      var newResults = self._synchronousCursor.getRawObjects(self._ordered);                                          // 147
    } catch (e) {                                                                                                     // 148
      if (first && typeof(e.code) === 'number') {                                                                     // 149
        // This is an error document sent to us by mongod, not a connection                                           // 150
        // error generated by the client. And we've never seen this query work                                        // 151
        // successfully. Probably it's a bad selector or something, so we should                                      // 152
        // NOT retry. Instead, we should halt the observe (which ends up calling                                      // 153
        // `stop` on us).                                                                                             // 154
        self._multiplexer.queryError(                                                                                 // 155
          new Error(                                                                                                  // 156
            "Exception while polling query " +                                                                        // 157
              JSON.stringify(self._cursorDescription) + ": " + e.message));                                           // 158
        return;                                                                                                       // 159
      }                                                                                                               // 160
                                                                                                                      // 161
      // getRawObjects can throw if we're having trouble talking to the                                               // 162
      // database.  That's fine --- we will repoll later anyway. But we should                                        // 163
      // make sure not to lose track of this cycle's writes.                                                          // 164
      // (It also can throw if there's just something invalid about this query;                                       // 165
      // unfortunately the ObserveDriver API doesn't provide a good way to                                            // 166
      // "cancel" the observe from the inside in this case.                                                           // 167
      Array.prototype.push.apply(self._pendingWrites, writesForCycle);                                                // 168
      Meteor._debug("Exception while polling query " +                                                                // 169
                    JSON.stringify(self._cursorDescription) + ": " + e.stack);                                        // 170
      return;                                                                                                         // 171
    }                                                                                                                 // 172
                                                                                                                      // 173
    // Run diffs.                                                                                                     // 174
    if (!self._stopped) {                                                                                             // 175
      LocalCollection._diffQueryChanges(                                                                              // 176
        self._ordered, oldResults, newResults, self._multiplexer);                                                    // 177
    }                                                                                                                 // 178
                                                                                                                      // 179
    // Signals the multiplexer to allow all observeChanges calls that share this                                      // 180
    // multiplexer to return. (This happens asynchronously, via the                                                   // 181
    // multiplexer's queue.)                                                                                          // 182
    if (first)                                                                                                        // 183
      self._multiplexer.ready();                                                                                      // 184
                                                                                                                      // 185
    // Replace self._results atomically.  (This assignment is what makes `first`                                      // 186
    // stay through on the next cycle, so we've waited until after we've                                              // 187
    // committed to ready-ing the multiplexer.)                                                                       // 188
    self._results = newResults;                                                                                       // 189
                                                                                                                      // 190
    // Once the ObserveMultiplexer has processed everything we've done in this                                        // 191
    // round, mark all the writes which existed before this call as                                                   // 192
    // commmitted. (If new writes have shown up in the meantime, there'll                                             // 193
    // already be another _pollMongo task scheduled.)                                                                 // 194
    self._multiplexer.onFlush(function () {                                                                           // 195
      _.each(writesForCycle, function (w) {                                                                           // 196
        w.committed();                                                                                                // 197
      });                                                                                                             // 198
    });                                                                                                               // 199
  },                                                                                                                  // 200
                                                                                                                      // 201
  stop: function () {                                                                                                 // 202
    var self = this;                                                                                                  // 203
    self._stopped = true;                                                                                             // 204
    _.each(self._stopCallbacks, function (c) { c(); });                                                               // 205
    // Release any write fences that are waiting on us.                                                               // 206
    _.each(self._pendingWrites, function (w) {                                                                        // 207
      w.committed();                                                                                                  // 208
    });                                                                                                               // 209
    Package.facts && Package.facts.Facts.incrementServerFact(                                                         // 210
      "mongo-livedata", "observe-drivers-polling", -1);                                                               // 211
  }                                                                                                                   // 212
});                                                                                                                   // 213
                                                                                                                      // 214
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 2265
}).call(this);                                                                                                        // 2266
                                                                                                                      // 2267
                                                                                                                      // 2268
                                                                                                                      // 2269
                                                                                                                      // 2270
                                                                                                                      // 2271
                                                                                                                      // 2272
(function(){                                                                                                          // 2273
                                                                                                                      // 2274
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/oplog_observe_driver.js                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Fiber = Npm.require('fibers');                                                                                    // 1
var Future = Npm.require('fibers/future');                                                                            // 2
                                                                                                                      // 3
var PHASE = {                                                                                                         // 4
  QUERYING: "QUERYING",                                                                                               // 5
  FETCHING: "FETCHING",                                                                                               // 6
  STEADY: "STEADY"                                                                                                    // 7
};                                                                                                                    // 8
                                                                                                                      // 9
// Exception thrown by _needToPollQuery which unrolls the stack up to the                                             // 10
// enclosing call to finishIfNeedToPollQuery.                                                                         // 11
var SwitchedToQuery = function () {};                                                                                 // 12
var finishIfNeedToPollQuery = function (f) {                                                                          // 13
  return function () {                                                                                                // 14
    try {                                                                                                             // 15
      f.apply(this, arguments);                                                                                       // 16
    } catch (e) {                                                                                                     // 17
      if (!(e instanceof SwitchedToQuery))                                                                            // 18
        throw e;                                                                                                      // 19
    }                                                                                                                 // 20
  };                                                                                                                  // 21
};                                                                                                                    // 22
                                                                                                                      // 23
var currentId = 0;                                                                                                    // 24
                                                                                                                      // 25
// OplogObserveDriver is an alternative to PollingObserveDriver which follows                                         // 26
// the Mongo operation log instead of just re-polling the query. It obeys the                                         // 27
// same simple interface: constructing it starts sending observeChanges                                               // 28
// callbacks (and a ready() invocation) to the ObserveMultiplexer, and you stop                                       // 29
// it by calling the stop() method.                                                                                   // 30
OplogObserveDriver = function (options) {                                                                             // 31
  var self = this;                                                                                                    // 32
  self._usesOplog = true;  // tests look at this                                                                      // 33
                                                                                                                      // 34
  self._id = currentId;                                                                                               // 35
  currentId++;                                                                                                        // 36
                                                                                                                      // 37
  self._cursorDescription = options.cursorDescription;                                                                // 38
  self._mongoHandle = options.mongoHandle;                                                                            // 39
  self._multiplexer = options.multiplexer;                                                                            // 40
                                                                                                                      // 41
  if (options.ordered) {                                                                                              // 42
    throw Error("OplogObserveDriver only supports unordered observeChanges");                                         // 43
  }                                                                                                                   // 44
                                                                                                                      // 45
  var sorter = options.sorter;                                                                                        // 46
  // We don't support $near and other geo-queries so it's OK to initialize the                                        // 47
  // comparator only once in the constructor.                                                                         // 48
  var comparator = sorter && sorter.getComparator();                                                                  // 49
                                                                                                                      // 50
  if (options.cursorDescription.options.limit) {                                                                      // 51
    // There are several properties ordered driver implements:                                                        // 52
    // - _limit is a positive number                                                                                  // 53
    // - _comparator is a function-comparator by which the query is ordered                                           // 54
    // - _unpublishedBuffer is non-null Min/Max Heap,                                                                 // 55
    //                      the empty buffer in STEADY phase implies that the                                         // 56
    //                      everything that matches the queries selector fits                                         // 57
    //                      into published set.                                                                       // 58
    // - _published - Min Heap (also implements IdMap methods)                                                        // 59
                                                                                                                      // 60
    var heapOptions = { IdMap: LocalCollection._IdMap };                                                              // 61
    self._limit = self._cursorDescription.options.limit;                                                              // 62
    self._comparator = comparator;                                                                                    // 63
    self._sorter = sorter;                                                                                            // 64
    self._unpublishedBuffer = new MinMaxHeap(comparator, heapOptions);                                                // 65
    // We need something that can find Max value in addition to IdMap interface                                       // 66
    self._published = new MaxHeap(comparator, heapOptions);                                                           // 67
  } else {                                                                                                            // 68
    self._limit = 0;                                                                                                  // 69
    self._comparator = null;                                                                                          // 70
    self._sorter = null;                                                                                              // 71
    self._unpublishedBuffer = null;                                                                                   // 72
    self._published = new LocalCollection._IdMap;                                                                     // 73
  }                                                                                                                   // 74
                                                                                                                      // 75
  // Indicates if it is safe to insert a new document at the end of the buffer                                        // 76
  // for this query. i.e. it is known that there are no documents matching the                                        // 77
  // selector those are not in published or buffer.                                                                   // 78
  self._safeAppendToBuffer = false;                                                                                   // 79
                                                                                                                      // 80
  self._stopped = false;                                                                                              // 81
  self._stopHandles = [];                                                                                             // 82
                                                                                                                      // 83
  Package.facts && Package.facts.Facts.incrementServerFact(                                                           // 84
    "mongo-livedata", "observe-drivers-oplog", 1);                                                                    // 85
                                                                                                                      // 86
  self._registerPhaseChange(PHASE.QUERYING);                                                                          // 87
                                                                                                                      // 88
  var selector = self._cursorDescription.selector;                                                                    // 89
  self._matcher = options.matcher;                                                                                    // 90
  var projection = self._cursorDescription.options.fields || {};                                                      // 91
  self._projectionFn = LocalCollection._compileProjection(projection);                                                // 92
  // Projection function, result of combining important fields for selector and                                       // 93
  // existing fields projection                                                                                       // 94
  self._sharedProjection = self._matcher.combineIntoProjection(projection);                                           // 95
  if (sorter)                                                                                                         // 96
    self._sharedProjection = sorter.combineIntoProjection(self._sharedProjection);                                    // 97
  self._sharedProjectionFn = LocalCollection._compileProjection(                                                      // 98
    self._sharedProjection);                                                                                          // 99
                                                                                                                      // 100
  self._needToFetch = new LocalCollection._IdMap;                                                                     // 101
  self._currentlyFetching = null;                                                                                     // 102
  self._fetchGeneration = 0;                                                                                          // 103
                                                                                                                      // 104
  self._requeryWhenDoneThisQuery = false;                                                                             // 105
  self._writesToCommitWhenWeReachSteady = [];                                                                         // 106
                                                                                                                      // 107
  // If the oplog handle tells us that it skipped some entries (because it got                                        // 108
  // behind, say), re-poll.                                                                                           // 109
  self._stopHandles.push(self._mongoHandle._oplogHandle.onSkippedEntries(                                             // 110
    finishIfNeedToPollQuery(function () {                                                                             // 111
      self._needToPollQuery();                                                                                        // 112
    })                                                                                                                // 113
  ));                                                                                                                 // 114
                                                                                                                      // 115
  forEachTrigger(self._cursorDescription, function (trigger) {                                                        // 116
    self._stopHandles.push(self._mongoHandle._oplogHandle.onOplogEntry(                                               // 117
      trigger, function (notification) {                                                                              // 118
        Meteor._noYieldsAllowed(finishIfNeedToPollQuery(function () {                                                 // 119
          var op = notification.op;                                                                                   // 120
          if (notification.dropCollection || notification.dropDatabase) {                                             // 121
            // Note: this call is not allowed to block on anything (especially                                        // 122
            // on waiting for oplog entries to catch up) because that will block                                      // 123
            // onOplogEntry!                                                                                          // 124
            self._needToPollQuery();                                                                                  // 125
          } else {                                                                                                    // 126
            // All other operators should be handled depending on phase                                               // 127
            if (self._phase === PHASE.QUERYING)                                                                       // 128
              self._handleOplogEntryQuerying(op);                                                                     // 129
            else                                                                                                      // 130
              self._handleOplogEntrySteadyOrFetching(op);                                                             // 131
          }                                                                                                           // 132
        }));                                                                                                          // 133
      }                                                                                                               // 134
    ));                                                                                                               // 135
  });                                                                                                                 // 136
                                                                                                                      // 137
  // XXX ordering w.r.t. everything else?                                                                             // 138
  self._stopHandles.push(listenAll(                                                                                   // 139
    self._cursorDescription, function (notification) {                                                                // 140
      // If we're not in a pre-fire write fence, we don't have to do anything.                                        // 141
      var fence = DDPServer._CurrentWriteFence.get();                                                                 // 142
      if (!fence || fence.fired)                                                                                      // 143
        return;                                                                                                       // 144
                                                                                                                      // 145
      if (fence._oplogObserveDrivers) {                                                                               // 146
        fence._oplogObserveDrivers[self._id] = self;                                                                  // 147
        return;                                                                                                       // 148
      }                                                                                                               // 149
                                                                                                                      // 150
      fence._oplogObserveDrivers = {};                                                                                // 151
      fence._oplogObserveDrivers[self._id] = self;                                                                    // 152
                                                                                                                      // 153
      fence.onBeforeFire(function () {                                                                                // 154
        var drivers = fence._oplogObserveDrivers;                                                                     // 155
        delete fence._oplogObserveDrivers;                                                                            // 156
                                                                                                                      // 157
        // This fence cannot fire until we've caught up to "this point" in the                                        // 158
        // oplog, and all observers made it back to the steady state.                                                 // 159
        self._mongoHandle._oplogHandle.waitUntilCaughtUp();                                                           // 160
                                                                                                                      // 161
        _.each(drivers, function (driver) {                                                                           // 162
          if (driver._stopped)                                                                                        // 163
            return;                                                                                                   // 164
                                                                                                                      // 165
          var write = fence.beginWrite();                                                                             // 166
          if (driver._phase === PHASE.STEADY) {                                                                       // 167
            // Make sure that all of the callbacks have made it through the                                           // 168
            // multiplexer and been delivered to ObserveHandles before committing                                     // 169
            // writes.                                                                                                // 170
            driver._multiplexer.onFlush(function () {                                                                 // 171
              write.committed();                                                                                      // 172
            });                                                                                                       // 173
          } else {                                                                                                    // 174
            driver._writesToCommitWhenWeReachSteady.push(write);                                                      // 175
          }                                                                                                           // 176
        });                                                                                                           // 177
      });                                                                                                             // 178
    }                                                                                                                 // 179
  ));                                                                                                                 // 180
                                                                                                                      // 181
  // When Mongo fails over, we need to repoll the query, in case we processed an                                      // 182
  // oplog entry that got rolled back.                                                                                // 183
  self._stopHandles.push(self._mongoHandle._onFailover(finishIfNeedToPollQuery(                                       // 184
    function () {                                                                                                     // 185
      self._needToPollQuery();                                                                                        // 186
    })));                                                                                                             // 187
                                                                                                                      // 188
  // Give _observeChanges a chance to add the new ObserveHandle to our                                                // 189
  // multiplexer, so that the added calls get streamed.                                                               // 190
  Meteor.defer(finishIfNeedToPollQuery(function () {                                                                  // 191
    self._runInitialQuery();                                                                                          // 192
  }));                                                                                                                // 193
};                                                                                                                    // 194
                                                                                                                      // 195
_.extend(OplogObserveDriver.prototype, {                                                                              // 196
  _addPublished: function (id, doc) {                                                                                 // 197
    var self = this;                                                                                                  // 198
    Meteor._noYieldsAllowed(function () {                                                                             // 199
      var fields = _.clone(doc);                                                                                      // 200
      delete fields._id;                                                                                              // 201
      self._published.set(id, self._sharedProjectionFn(doc));                                                         // 202
      self._multiplexer.added(id, self._projectionFn(fields));                                                        // 203
                                                                                                                      // 204
      // After adding this document, the published set might be overflowed                                            // 205
      // (exceeding capacity specified by limit). If so, push the maximum                                             // 206
      // element to the buffer, we might want to save it in memory to reduce the                                      // 207
      // amount of Mongo lookups in the future.                                                                       // 208
      if (self._limit && self._published.size() > self._limit) {                                                      // 209
        // XXX in theory the size of published is no more than limit+1                                                // 210
        if (self._published.size() !== self._limit + 1) {                                                             // 211
          throw new Error("After adding to published, " +                                                             // 212
                          (self._published.size() - self._limit) +                                                    // 213
                          " documents are overflowing the set");                                                      // 214
        }                                                                                                             // 215
                                                                                                                      // 216
        var overflowingDocId = self._published.maxElementId();                                                        // 217
        var overflowingDoc = self._published.get(overflowingDocId);                                                   // 218
                                                                                                                      // 219
        if (EJSON.equals(overflowingDocId, id)) {                                                                     // 220
          throw new Error("The document just added is overflowing the published set");                                // 221
        }                                                                                                             // 222
                                                                                                                      // 223
        self._published.remove(overflowingDocId);                                                                     // 224
        self._multiplexer.removed(overflowingDocId);                                                                  // 225
        self._addBuffered(overflowingDocId, overflowingDoc);                                                          // 226
      }                                                                                                               // 227
    });                                                                                                               // 228
  },                                                                                                                  // 229
  _removePublished: function (id) {                                                                                   // 230
    var self = this;                                                                                                  // 231
    Meteor._noYieldsAllowed(function () {                                                                             // 232
      self._published.remove(id);                                                                                     // 233
      self._multiplexer.removed(id);                                                                                  // 234
      if (! self._limit || self._published.size() === self._limit)                                                    // 235
        return;                                                                                                       // 236
                                                                                                                      // 237
      if (self._published.size() > self._limit)                                                                       // 238
        throw Error("self._published got too big");                                                                   // 239
                                                                                                                      // 240
      // OK, we are publishing less than the limit. Maybe we should look in the                                       // 241
      // buffer to find the next element past what we were publishing before.                                         // 242
                                                                                                                      // 243
      if (!self._unpublishedBuffer.empty()) {                                                                         // 244
        // There's something in the buffer; move the first thing in it to                                             // 245
        // _published.                                                                                                // 246
        var newDocId = self._unpublishedBuffer.minElementId();                                                        // 247
        var newDoc = self._unpublishedBuffer.get(newDocId);                                                           // 248
        self._removeBuffered(newDocId);                                                                               // 249
        self._addPublished(newDocId, newDoc);                                                                         // 250
        return;                                                                                                       // 251
      }                                                                                                               // 252
                                                                                                                      // 253
      // There's nothing in the buffer.  This could mean one of a few things.                                         // 254
                                                                                                                      // 255
      // (a) We could be in the middle of re-running the query (specifically, we                                      // 256
      // could be in _publishNewResults). In that case, _unpublishedBuffer is                                         // 257
      // empty because we clear it at the beginning of _publishNewResults. In                                         // 258
      // this case, our caller already knows the entire answer to the query and                                       // 259
      // we don't need to do anything fancy here.  Just return.                                                       // 260
      if (self._phase === PHASE.QUERYING)                                                                             // 261
        return;                                                                                                       // 262
                                                                                                                      // 263
      // (b) We're pretty confident that the union of _published and                                                  // 264
      // _unpublishedBuffer contain all documents that match selector. Because                                        // 265
      // _unpublishedBuffer is empty, that means we're confident that _published                                      // 266
      // contains all documents that match selector. So we have nothing to do.                                        // 267
      if (self._safeAppendToBuffer)                                                                                   // 268
        return;                                                                                                       // 269
                                                                                                                      // 270
      // (c) Maybe there are other documents out there that should be in our                                          // 271
      // buffer. But in that case, when we emptied _unpublishedBuffer in                                              // 272
      // _removeBuffered, we should have called _needToPollQuery, which will                                          // 273
      // either put something in _unpublishedBuffer or set _safeAppendToBuffer                                        // 274
      // (or both), and it will put us in QUERYING for that whole time. So in                                         // 275
      // fact, we shouldn't be able to get here.                                                                      // 276
                                                                                                                      // 277
      throw new Error("Buffer inexplicably empty");                                                                   // 278
    });                                                                                                               // 279
  },                                                                                                                  // 280
  _changePublished: function (id, oldDoc, newDoc) {                                                                   // 281
    var self = this;                                                                                                  // 282
    Meteor._noYieldsAllowed(function () {                                                                             // 283
      self._published.set(id, self._sharedProjectionFn(newDoc));                                                      // 284
      var projectedNew = self._projectionFn(newDoc);                                                                  // 285
      var projectedOld = self._projectionFn(oldDoc);                                                                  // 286
      var changed = DiffSequence.makeChangedFields(                                                                   // 287
        projectedNew, projectedOld);                                                                                  // 288
      if (!_.isEmpty(changed))                                                                                        // 289
        self._multiplexer.changed(id, changed);                                                                       // 290
    });                                                                                                               // 291
  },                                                                                                                  // 292
  _addBuffered: function (id, doc) {                                                                                  // 293
    var self = this;                                                                                                  // 294
    Meteor._noYieldsAllowed(function () {                                                                             // 295
      self._unpublishedBuffer.set(id, self._sharedProjectionFn(doc));                                                 // 296
                                                                                                                      // 297
      // If something is overflowing the buffer, we just remove it from cache                                         // 298
      if (self._unpublishedBuffer.size() > self._limit) {                                                             // 299
        var maxBufferedId = self._unpublishedBuffer.maxElementId();                                                   // 300
                                                                                                                      // 301
        self._unpublishedBuffer.remove(maxBufferedId);                                                                // 302
                                                                                                                      // 303
        // Since something matching is removed from cache (both published set and                                     // 304
        // buffer), set flag to false                                                                                 // 305
        self._safeAppendToBuffer = false;                                                                             // 306
      }                                                                                                               // 307
    });                                                                                                               // 308
  },                                                                                                                  // 309
  // Is called either to remove the doc completely from matching set or to move                                       // 310
  // it to the published set later.                                                                                   // 311
  _removeBuffered: function (id) {                                                                                    // 312
    var self = this;                                                                                                  // 313
    Meteor._noYieldsAllowed(function () {                                                                             // 314
      self._unpublishedBuffer.remove(id);                                                                             // 315
      // To keep the contract "buffer is never empty in STEADY phase unless the                                       // 316
      // everything matching fits into published" true, we poll everything as                                         // 317
      // soon as we see the buffer becoming empty.                                                                    // 318
      if (! self._unpublishedBuffer.size() && ! self._safeAppendToBuffer)                                             // 319
        self._needToPollQuery();                                                                                      // 320
    });                                                                                                               // 321
  },                                                                                                                  // 322
  // Called when a document has joined the "Matching" results set.                                                    // 323
  // Takes responsibility of keeping _unpublishedBuffer in sync with _published                                       // 324
  // and the effect of limit enforced.                                                                                // 325
  _addMatching: function (doc) {                                                                                      // 326
    var self = this;                                                                                                  // 327
    Meteor._noYieldsAllowed(function () {                                                                             // 328
      var id = doc._id;                                                                                               // 329
      if (self._published.has(id))                                                                                    // 330
        throw Error("tried to add something already published " + id);                                                // 331
      if (self._limit && self._unpublishedBuffer.has(id))                                                             // 332
        throw Error("tried to add something already existed in buffer " + id);                                        // 333
                                                                                                                      // 334
      var limit = self._limit;                                                                                        // 335
      var comparator = self._comparator;                                                                              // 336
      var maxPublished = (limit && self._published.size() > 0) ?                                                      // 337
        self._published.get(self._published.maxElementId()) : null;                                                   // 338
      var maxBuffered = (limit && self._unpublishedBuffer.size() > 0)                                                 // 339
        ? self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId())                                         // 340
        : null;                                                                                                       // 341
      // The query is unlimited or didn't publish enough documents yet or the                                         // 342
      // new document would fit into published set pushing the maximum element                                        // 343
      // out, then we need to publish the doc.                                                                        // 344
      var toPublish = ! limit || self._published.size() < limit ||                                                    // 345
        comparator(doc, maxPublished) < 0;                                                                            // 346
                                                                                                                      // 347
      // Otherwise we might need to buffer it (only in case of limited query).                                        // 348
      // Buffering is allowed if the buffer is not filled up yet and all                                              // 349
      // matching docs are either in the published set or in the buffer.                                              // 350
      var canAppendToBuffer = !toPublish && self._safeAppendToBuffer &&                                               // 351
        self._unpublishedBuffer.size() < limit;                                                                       // 352
                                                                                                                      // 353
      // Or if it is small enough to be safely inserted to the middle or the                                          // 354
      // beginning of the buffer.                                                                                     // 355
      var canInsertIntoBuffer = !toPublish && maxBuffered &&                                                          // 356
        comparator(doc, maxBuffered) <= 0;                                                                            // 357
                                                                                                                      // 358
      var toBuffer = canAppendToBuffer || canInsertIntoBuffer;                                                        // 359
                                                                                                                      // 360
      if (toPublish) {                                                                                                // 361
        self._addPublished(id, doc);                                                                                  // 362
      } else if (toBuffer) {                                                                                          // 363
        self._addBuffered(id, doc);                                                                                   // 364
      } else {                                                                                                        // 365
        // dropping it and not saving to the cache                                                                    // 366
        self._safeAppendToBuffer = false;                                                                             // 367
      }                                                                                                               // 368
    });                                                                                                               // 369
  },                                                                                                                  // 370
  // Called when a document leaves the "Matching" results set.                                                        // 371
  // Takes responsibility of keeping _unpublishedBuffer in sync with _published                                       // 372
  // and the effect of limit enforced.                                                                                // 373
  _removeMatching: function (id) {                                                                                    // 374
    var self = this;                                                                                                  // 375
    Meteor._noYieldsAllowed(function () {                                                                             // 376
      if (! self._published.has(id) && ! self._limit)                                                                 // 377
        throw Error("tried to remove something matching but not cached " + id);                                       // 378
                                                                                                                      // 379
      if (self._published.has(id)) {                                                                                  // 380
        self._removePublished(id);                                                                                    // 381
      } else if (self._unpublishedBuffer.has(id)) {                                                                   // 382
        self._removeBuffered(id);                                                                                     // 383
      }                                                                                                               // 384
    });                                                                                                               // 385
  },                                                                                                                  // 386
  _handleDoc: function (id, newDoc) {                                                                                 // 387
    var self = this;                                                                                                  // 388
    Meteor._noYieldsAllowed(function () {                                                                             // 389
      var matchesNow = newDoc && self._matcher.documentMatches(newDoc).result;                                        // 390
                                                                                                                      // 391
      var publishedBefore = self._published.has(id);                                                                  // 392
      var bufferedBefore = self._limit && self._unpublishedBuffer.has(id);                                            // 393
      var cachedBefore = publishedBefore || bufferedBefore;                                                           // 394
                                                                                                                      // 395
      if (matchesNow && !cachedBefore) {                                                                              // 396
        self._addMatching(newDoc);                                                                                    // 397
      } else if (cachedBefore && !matchesNow) {                                                                       // 398
        self._removeMatching(id);                                                                                     // 399
      } else if (cachedBefore && matchesNow) {                                                                        // 400
        var oldDoc = self._published.get(id);                                                                         // 401
        var comparator = self._comparator;                                                                            // 402
        var minBuffered = self._limit && self._unpublishedBuffer.size() &&                                            // 403
          self._unpublishedBuffer.get(self._unpublishedBuffer.minElementId());                                        // 404
                                                                                                                      // 405
        if (publishedBefore) {                                                                                        // 406
          // Unlimited case where the document stays in published once it                                             // 407
          // matches or the case when we don't have enough matching docs to                                           // 408
          // publish or the changed but matching doc will stay in published                                           // 409
          // anyways.                                                                                                 // 410
          //                                                                                                          // 411
          // XXX: We rely on the emptiness of buffer. Be sure to maintain the                                         // 412
          // fact that buffer can't be empty if there are matching documents not                                      // 413
          // published. Notably, we don't want to schedule repoll and continue                                        // 414
          // relying on this property.                                                                                // 415
          var staysInPublished = ! self._limit ||                                                                     // 416
            self._unpublishedBuffer.size() === 0 ||                                                                   // 417
            comparator(newDoc, minBuffered) <= 0;                                                                     // 418
                                                                                                                      // 419
          if (staysInPublished) {                                                                                     // 420
            self._changePublished(id, oldDoc, newDoc);                                                                // 421
          } else {                                                                                                    // 422
            // after the change doc doesn't stay in the published, remove it                                          // 423
            self._removePublished(id);                                                                                // 424
            // but it can move into buffered now, check it                                                            // 425
            var maxBuffered = self._unpublishedBuffer.get(                                                            // 426
              self._unpublishedBuffer.maxElementId());                                                                // 427
                                                                                                                      // 428
            var toBuffer = self._safeAppendToBuffer ||                                                                // 429
                  (maxBuffered && comparator(newDoc, maxBuffered) <= 0);                                              // 430
                                                                                                                      // 431
            if (toBuffer) {                                                                                           // 432
              self._addBuffered(id, newDoc);                                                                          // 433
            } else {                                                                                                  // 434
              // Throw away from both published set and buffer                                                        // 435
              self._safeAppendToBuffer = false;                                                                       // 436
            }                                                                                                         // 437
          }                                                                                                           // 438
        } else if (bufferedBefore) {                                                                                  // 439
          oldDoc = self._unpublishedBuffer.get(id);                                                                   // 440
          // remove the old version manually instead of using _removeBuffered so                                      // 441
          // we don't trigger the querying immediately.  if we end this block                                         // 442
          // with the buffer empty, we will need to trigger the query poll                                            // 443
          // manually too.                                                                                            // 444
          self._unpublishedBuffer.remove(id);                                                                         // 445
                                                                                                                      // 446
          var maxPublished = self._published.get(                                                                     // 447
            self._published.maxElementId());                                                                          // 448
          var maxBuffered = self._unpublishedBuffer.size() &&                                                         // 449
                self._unpublishedBuffer.get(                                                                          // 450
                  self._unpublishedBuffer.maxElementId());                                                            // 451
                                                                                                                      // 452
          // the buffered doc was updated, it could move to published                                                 // 453
          var toPublish = comparator(newDoc, maxPublished) < 0;                                                       // 454
                                                                                                                      // 455
          // or stays in buffer even after the change                                                                 // 456
          var staysInBuffer = (! toPublish && self._safeAppendToBuffer) ||                                            // 457
                (!toPublish && maxBuffered &&                                                                         // 458
                 comparator(newDoc, maxBuffered) <= 0);                                                               // 459
                                                                                                                      // 460
          if (toPublish) {                                                                                            // 461
            self._addPublished(id, newDoc);                                                                           // 462
          } else if (staysInBuffer) {                                                                                 // 463
            // stays in buffer but changes                                                                            // 464
            self._unpublishedBuffer.set(id, newDoc);                                                                  // 465
          } else {                                                                                                    // 466
            // Throw away from both published set and buffer                                                          // 467
            self._safeAppendToBuffer = false;                                                                         // 468
            // Normally this check would have been done in _removeBuffered but                                        // 469
            // we didn't use it, so we need to do it ourself now.                                                     // 470
            if (! self._unpublishedBuffer.size()) {                                                                   // 471
              self._needToPollQuery();                                                                                // 472
            }                                                                                                         // 473
          }                                                                                                           // 474
        } else {                                                                                                      // 475
          throw new Error("cachedBefore implies either of publishedBefore or bufferedBefore is true.");               // 476
        }                                                                                                             // 477
      }                                                                                                               // 478
    });                                                                                                               // 479
  },                                                                                                                  // 480
  _fetchModifiedDocuments: function () {                                                                              // 481
    var self = this;                                                                                                  // 482
    Meteor._noYieldsAllowed(function () {                                                                             // 483
      self._registerPhaseChange(PHASE.FETCHING);                                                                      // 484
      // Defer, because nothing called from the oplog entry handler may yield,                                        // 485
      // but fetch() yields.                                                                                          // 486
      Meteor.defer(finishIfNeedToPollQuery(function () {                                                              // 487
        while (!self._stopped && !self._needToFetch.empty()) {                                                        // 488
          if (self._phase === PHASE.QUERYING) {                                                                       // 489
            // While fetching, we decided to go into QUERYING mode, and then we                                       // 490
            // saw another oplog entry, so _needToFetch is not empty. But we                                          // 491
            // shouldn't fetch these documents until AFTER the query is done.                                         // 492
            break;                                                                                                    // 493
          }                                                                                                           // 494
                                                                                                                      // 495
          // Being in steady phase here would be surprising.                                                          // 496
          if (self._phase !== PHASE.FETCHING)                                                                         // 497
            throw new Error("phase in fetchModifiedDocuments: " + self._phase);                                       // 498
                                                                                                                      // 499
          self._currentlyFetching = self._needToFetch;                                                                // 500
          var thisGeneration = ++self._fetchGeneration;                                                               // 501
          self._needToFetch = new LocalCollection._IdMap;                                                             // 502
          var waiting = 0;                                                                                            // 503
          var fut = new Future;                                                                                       // 504
          // This loop is safe, because _currentlyFetching will not be updated                                        // 505
          // during this loop (in fact, it is never mutated).                                                         // 506
          self._currentlyFetching.forEach(function (cacheKey, id) {                                                   // 507
            waiting++;                                                                                                // 508
            self._mongoHandle._docFetcher.fetch(                                                                      // 509
              self._cursorDescription.collectionName, id, cacheKey,                                                   // 510
              finishIfNeedToPollQuery(function (err, doc) {                                                           // 511
                try {                                                                                                 // 512
                  if (err) {                                                                                          // 513
                    Meteor._debug("Got exception while fetching documents: " +                                        // 514
                                  err);                                                                               // 515
                    // If we get an error from the fetcher (eg, trouble                                               // 516
                    // connecting to Mongo), let's just abandon the fetch phase                                       // 517
                    // altogether and fall back to polling. It's not like we're                                       // 518
                    // getting live updates anyway.                                                                   // 519
                    if (self._phase !== PHASE.QUERYING) {                                                             // 520
                      self._needToPollQuery();                                                                        // 521
                    }                                                                                                 // 522
                  } else if (!self._stopped && self._phase === PHASE.FETCHING                                         // 523
                             && self._fetchGeneration === thisGeneration) {                                           // 524
                    // We re-check the generation in case we've had an explicit                                       // 525
                    // _pollQuery call (eg, in another fiber) which should                                            // 526
                    // effectively cancel this round of fetches.  (_pollQuery                                         // 527
                    // increments the generation.)                                                                    // 528
                    self._handleDoc(id, doc);                                                                         // 529
                  }                                                                                                   // 530
                } finally {                                                                                           // 531
                  waiting--;                                                                                          // 532
                  // Because fetch() never calls its callback synchronously,                                          // 533
                  // this is safe (ie, we won't call fut.return() before the                                          // 534
                  // forEach is done).                                                                                // 535
                  if (waiting === 0)                                                                                  // 536
                    fut.return();                                                                                     // 537
                }                                                                                                     // 538
              }));                                                                                                    // 539
          });                                                                                                         // 540
          fut.wait();                                                                                                 // 541
          // Exit now if we've had a _pollQuery call (here or in another fiber).                                      // 542
          if (self._phase === PHASE.QUERYING)                                                                         // 543
            return;                                                                                                   // 544
          self._currentlyFetching = null;                                                                             // 545
        }                                                                                                             // 546
        // We're done fetching, so we can be steady, unless we've had a                                               // 547
        // _pollQuery call (here or in another fiber).                                                                // 548
        if (self._phase !== PHASE.QUERYING)                                                                           // 549
          self._beSteady();                                                                                           // 550
      }));                                                                                                            // 551
    });                                                                                                               // 552
  },                                                                                                                  // 553
  _beSteady: function () {                                                                                            // 554
    var self = this;                                                                                                  // 555
    Meteor._noYieldsAllowed(function () {                                                                             // 556
      self._registerPhaseChange(PHASE.STEADY);                                                                        // 557
      var writes = self._writesToCommitWhenWeReachSteady;                                                             // 558
      self._writesToCommitWhenWeReachSteady = [];                                                                     // 559
      self._multiplexer.onFlush(function () {                                                                         // 560
        _.each(writes, function (w) {                                                                                 // 561
          w.committed();                                                                                              // 562
        });                                                                                                           // 563
      });                                                                                                             // 564
    });                                                                                                               // 565
  },                                                                                                                  // 566
  _handleOplogEntryQuerying: function (op) {                                                                          // 567
    var self = this;                                                                                                  // 568
    Meteor._noYieldsAllowed(function () {                                                                             // 569
      self._needToFetch.set(idForOp(op), op.ts.toString());                                                           // 570
    });                                                                                                               // 571
  },                                                                                                                  // 572
  _handleOplogEntrySteadyOrFetching: function (op) {                                                                  // 573
    var self = this;                                                                                                  // 574
    Meteor._noYieldsAllowed(function () {                                                                             // 575
      var id = idForOp(op);                                                                                           // 576
      // If we're already fetching this one, or about to, we can't optimize;                                          // 577
      // make sure that we fetch it again if necessary.                                                               // 578
      if (self._phase === PHASE.FETCHING &&                                                                           // 579
          ((self._currentlyFetching && self._currentlyFetching.has(id)) ||                                            // 580
           self._needToFetch.has(id))) {                                                                              // 581
        self._needToFetch.set(id, op.ts.toString());                                                                  // 582
        return;                                                                                                       // 583
      }                                                                                                               // 584
                                                                                                                      // 585
      if (op.op === 'd') {                                                                                            // 586
        if (self._published.has(id) ||                                                                                // 587
            (self._limit && self._unpublishedBuffer.has(id)))                                                         // 588
          self._removeMatching(id);                                                                                   // 589
      } else if (op.op === 'i') {                                                                                     // 590
        if (self._published.has(id))                                                                                  // 591
          throw new Error("insert found for already-existing ID in published");                                       // 592
        if (self._unpublishedBuffer && self._unpublishedBuffer.has(id))                                               // 593
          throw new Error("insert found for already-existing ID in buffer");                                          // 594
                                                                                                                      // 595
        // XXX what if selector yields?  for now it can't but later it could                                          // 596
        // have $where                                                                                                // 597
        if (self._matcher.documentMatches(op.o).result)                                                               // 598
          self._addMatching(op.o);                                                                                    // 599
      } else if (op.op === 'u') {                                                                                     // 600
        // Is this a modifier ($set/$unset, which may require us to poll the                                          // 601
        // database to figure out if the whole document matches the selector) or                                      // 602
        // a replacement (in which case we can just directly re-evaluate the                                          // 603
        // selector)?                                                                                                 // 604
        var isReplace = !_.has(op.o, '$set') && !_.has(op.o, '$unset');                                               // 605
        // If this modifier modifies something inside an EJSON custom type (ie,                                       // 606
        // anything with EJSON$), then we can't try to use                                                            // 607
        // LocalCollection._modify, since that just mutates the EJSON encoding,                                       // 608
        // not the actual object.                                                                                     // 609
        var canDirectlyModifyDoc =                                                                                    // 610
          !isReplace && modifierCanBeDirectlyApplied(op.o);                                                           // 611
                                                                                                                      // 612
        var publishedBefore = self._published.has(id);                                                                // 613
        var bufferedBefore = self._limit && self._unpublishedBuffer.has(id);                                          // 614
                                                                                                                      // 615
        if (isReplace) {                                                                                              // 616
          self._handleDoc(id, _.extend({_id: id}, op.o));                                                             // 617
        } else if ((publishedBefore || bufferedBefore) &&                                                             // 618
                   canDirectlyModifyDoc) {                                                                            // 619
          // Oh great, we actually know what the document is, so we can apply                                         // 620
          // this directly.                                                                                           // 621
          var newDoc = self._published.has(id)                                                                        // 622
            ? self._published.get(id) : self._unpublishedBuffer.get(id);                                              // 623
          newDoc = EJSON.clone(newDoc);                                                                               // 624
                                                                                                                      // 625
          newDoc._id = id;                                                                                            // 626
          try {                                                                                                       // 627
            LocalCollection._modify(newDoc, op.o);                                                                    // 628
          } catch (e) {                                                                                               // 629
            if (e.name !== "MinimongoError")                                                                          // 630
              throw e;                                                                                                // 631
            // We didn't understand the modifier.  Re-fetch.                                                          // 632
            self._needToFetch.set(id, op.ts.toString());                                                              // 633
            if (self._phase === PHASE.STEADY) {                                                                       // 634
              self._fetchModifiedDocuments();                                                                         // 635
            }                                                                                                         // 636
            return;                                                                                                   // 637
          }                                                                                                           // 638
          self._handleDoc(id, self._sharedProjectionFn(newDoc));                                                      // 639
        } else if (!canDirectlyModifyDoc ||                                                                           // 640
                   self._matcher.canBecomeTrueByModifier(op.o) ||                                                     // 641
                   (self._sorter && self._sorter.affectedByModifier(op.o))) {                                         // 642
          self._needToFetch.set(id, op.ts.toString());                                                                // 643
          if (self._phase === PHASE.STEADY)                                                                           // 644
            self._fetchModifiedDocuments();                                                                           // 645
        }                                                                                                             // 646
      } else {                                                                                                        // 647
        throw Error("XXX SURPRISING OPERATION: " + op);                                                               // 648
      }                                                                                                               // 649
    });                                                                                                               // 650
  },                                                                                                                  // 651
  // Yields!                                                                                                          // 652
  _runInitialQuery: function () {                                                                                     // 653
    var self = this;                                                                                                  // 654
    if (self._stopped)                                                                                                // 655
      throw new Error("oplog stopped surprisingly early");                                                            // 656
                                                                                                                      // 657
    self._runQuery({initial: true});  // yields                                                                       // 658
                                                                                                                      // 659
    if (self._stopped)                                                                                                // 660
      return;  // can happen on queryError                                                                            // 661
                                                                                                                      // 662
    // Allow observeChanges calls to return. (After this, it's possible for                                           // 663
    // stop() to be called.)                                                                                          // 664
    self._multiplexer.ready();                                                                                        // 665
                                                                                                                      // 666
    self._doneQuerying();  // yields                                                                                  // 667
  },                                                                                                                  // 668
                                                                                                                      // 669
  // In various circumstances, we may just want to stop processing the oplog and                                      // 670
  // re-run the initial query, just as if we were a PollingObserveDriver.                                             // 671
  //                                                                                                                  // 672
  // This function may not block, because it is called from an oplog entry                                            // 673
  // handler.                                                                                                         // 674
  //                                                                                                                  // 675
  // XXX We should call this when we detect that we've been in FETCHING for "too                                      // 676
  // long".                                                                                                           // 677
  //                                                                                                                  // 678
  // XXX We should call this when we detect Mongo failover (since that might                                          // 679
  // mean that some of the oplog entries we have processed have been rolled                                           // 680
  // back). The Node Mongo driver is in the middle of a bunch of huge                                                 // 681
  // refactorings, including the way that it notifies you when primary                                                // 682
  // changes. Will put off implementing this until driver 1.4 is out.                                                 // 683
  _pollQuery: function () {                                                                                           // 684
    var self = this;                                                                                                  // 685
    Meteor._noYieldsAllowed(function () {                                                                             // 686
      if (self._stopped)                                                                                              // 687
        return;                                                                                                       // 688
                                                                                                                      // 689
      // Yay, we get to forget about all the things we thought we had to fetch.                                       // 690
      self._needToFetch = new LocalCollection._IdMap;                                                                 // 691
      self._currentlyFetching = null;                                                                                 // 692
      ++self._fetchGeneration;  // ignore any in-flight fetches                                                       // 693
      self._registerPhaseChange(PHASE.QUERYING);                                                                      // 694
                                                                                                                      // 695
      // Defer so that we don't yield.  We don't need finishIfNeedToPollQuery                                         // 696
      // here because SwitchedToQuery is not thrown in QUERYING mode.                                                 // 697
      Meteor.defer(function () {                                                                                      // 698
        self._runQuery();                                                                                             // 699
        self._doneQuerying();                                                                                         // 700
      });                                                                                                             // 701
    });                                                                                                               // 702
  },                                                                                                                  // 703
                                                                                                                      // 704
  // Yields!                                                                                                          // 705
  _runQuery: function (options) {                                                                                     // 706
    var self = this;                                                                                                  // 707
    options = options || {};                                                                                          // 708
    var newResults, newBuffer;                                                                                        // 709
                                                                                                                      // 710
    // This while loop is just to retry failures.                                                                     // 711
    while (true) {                                                                                                    // 712
      // If we've been stopped, we don't have to run anything any more.                                               // 713
      if (self._stopped)                                                                                              // 714
        return;                                                                                                       // 715
                                                                                                                      // 716
      newResults = new LocalCollection._IdMap;                                                                        // 717
      newBuffer = new LocalCollection._IdMap;                                                                         // 718
                                                                                                                      // 719
      // Query 2x documents as the half excluded from the original query will go                                      // 720
      // into unpublished buffer to reduce additional Mongo lookups in cases                                          // 721
      // when documents are removed from the published set and need a                                                 // 722
      // replacement.                                                                                                 // 723
      // XXX needs more thought on non-zero skip                                                                      // 724
      // XXX 2 is a "magic number" meaning there is an extra chunk of docs for                                        // 725
      // buffer if such is needed.                                                                                    // 726
      var cursor = self._cursorForQuery({ limit: self._limit * 2 });                                                  // 727
      try {                                                                                                           // 728
        cursor.forEach(function (doc, i) {  // yields                                                                 // 729
          if (!self._limit || i < self._limit)                                                                        // 730
            newResults.set(doc._id, doc);                                                                             // 731
          else                                                                                                        // 732
            newBuffer.set(doc._id, doc);                                                                              // 733
        });                                                                                                           // 734
        break;                                                                                                        // 735
      } catch (e) {                                                                                                   // 736
        if (options.initial && typeof(e.code) === 'number') {                                                         // 737
          // This is an error document sent to us by mongod, not a connection                                         // 738
          // error generated by the client. And we've never seen this query work                                      // 739
          // successfully. Probably it's a bad selector or something, so we                                           // 740
          // should NOT retry. Instead, we should halt the observe (which ends                                        // 741
          // up calling `stop` on us).                                                                                // 742
          self._multiplexer.queryError(e);                                                                            // 743
          return;                                                                                                     // 744
        }                                                                                                             // 745
                                                                                                                      // 746
        // During failover (eg) if we get an exception we should log and retry                                        // 747
        // instead of crashing.                                                                                       // 748
        Meteor._debug("Got exception while polling query: " + e);                                                     // 749
        Meteor._sleepForMs(100);                                                                                      // 750
      }                                                                                                               // 751
    }                                                                                                                 // 752
                                                                                                                      // 753
    if (self._stopped)                                                                                                // 754
      return;                                                                                                         // 755
                                                                                                                      // 756
    self._publishNewResults(newResults, newBuffer);                                                                   // 757
  },                                                                                                                  // 758
                                                                                                                      // 759
  // Transitions to QUERYING and runs another query, or (if already in QUERYING)                                      // 760
  // ensures that we will query again later.                                                                          // 761
  //                                                                                                                  // 762
  // This function may not block, because it is called from an oplog entry                                            // 763
  // handler. However, if we were not already in the QUERYING phase, it throws                                        // 764
  // an exception that is caught by the closest surrounding                                                           // 765
  // finishIfNeedToPollQuery call; this ensures that we don't continue running                                        // 766
  // close that was designed for another phase inside PHASE.QUERYING.                                                 // 767
  //                                                                                                                  // 768
  // (It's also necessary whenever logic in this file yields to check that other                                      // 769
  // phases haven't put us into QUERYING mode, though; eg,                                                            // 770
  // _fetchModifiedDocuments does this.)                                                                              // 771
  _needToPollQuery: function () {                                                                                     // 772
    var self = this;                                                                                                  // 773
    Meteor._noYieldsAllowed(function () {                                                                             // 774
      if (self._stopped)                                                                                              // 775
        return;                                                                                                       // 776
                                                                                                                      // 777
      // If we're not already in the middle of a query, we can query now                                              // 778
      // (possibly pausing FETCHING).                                                                                 // 779
      if (self._phase !== PHASE.QUERYING) {                                                                           // 780
        self._pollQuery();                                                                                            // 781
        throw new SwitchedToQuery;                                                                                    // 782
      }                                                                                                               // 783
                                                                                                                      // 784
      // We're currently in QUERYING. Set a flag to ensure that we run another                                        // 785
      // query when we're done.                                                                                       // 786
      self._requeryWhenDoneThisQuery = true;                                                                          // 787
    });                                                                                                               // 788
  },                                                                                                                  // 789
                                                                                                                      // 790
  // Yields!                                                                                                          // 791
  _doneQuerying: function () {                                                                                        // 792
    var self = this;                                                                                                  // 793
                                                                                                                      // 794
    if (self._stopped)                                                                                                // 795
      return;                                                                                                         // 796
    self._mongoHandle._oplogHandle.waitUntilCaughtUp();  // yields                                                    // 797
    if (self._stopped)                                                                                                // 798
      return;                                                                                                         // 799
    if (self._phase !== PHASE.QUERYING)                                                                               // 800
      throw Error("Phase unexpectedly " + self._phase);                                                               // 801
                                                                                                                      // 802
    Meteor._noYieldsAllowed(function () {                                                                             // 803
      if (self._requeryWhenDoneThisQuery) {                                                                           // 804
        self._requeryWhenDoneThisQuery = false;                                                                       // 805
        self._pollQuery();                                                                                            // 806
      } else if (self._needToFetch.empty()) {                                                                         // 807
        self._beSteady();                                                                                             // 808
      } else {                                                                                                        // 809
        self._fetchModifiedDocuments();                                                                               // 810
      }                                                                                                               // 811
    });                                                                                                               // 812
  },                                                                                                                  // 813
                                                                                                                      // 814
  _cursorForQuery: function (optionsOverwrite) {                                                                      // 815
    var self = this;                                                                                                  // 816
    return Meteor._noYieldsAllowed(function () {                                                                      // 817
      // The query we run is almost the same as the cursor we are observing,                                          // 818
      // with a few changes. We need to read all the fields that are relevant to                                      // 819
      // the selector, not just the fields we are going to publish (that's the                                        // 820
      // "shared" projection). And we don't want to apply any transform in the                                        // 821
      // cursor, because observeChanges shouldn't use the transform.                                                  // 822
      var options = _.clone(self._cursorDescription.options);                                                         // 823
                                                                                                                      // 824
      // Allow the caller to modify the options. Useful to specify different                                          // 825
      // skip and limit values.                                                                                       // 826
      _.extend(options, optionsOverwrite);                                                                            // 827
                                                                                                                      // 828
      options.fields = self._sharedProjection;                                                                        // 829
      delete options.transform;                                                                                       // 830
      // We are NOT deep cloning fields or selector here, which should be OK.                                         // 831
      var description = new CursorDescription(                                                                        // 832
        self._cursorDescription.collectionName,                                                                       // 833
        self._cursorDescription.selector,                                                                             // 834
        options);                                                                                                     // 835
      return new Cursor(self._mongoHandle, description);                                                              // 836
    });                                                                                                               // 837
  },                                                                                                                  // 838
                                                                                                                      // 839
                                                                                                                      // 840
  // Replace self._published with newResults (both are IdMaps), invoking observe                                      // 841
  // callbacks on the multiplexer.                                                                                    // 842
  // Replace self._unpublishedBuffer with newBuffer.                                                                  // 843
  //                                                                                                                  // 844
  // XXX This is very similar to LocalCollection._diffQueryUnorderedChanges. We                                       // 845
  // should really: (a) Unify IdMap and OrderedDict into Unordered/OrderedDict                                        // 846
  // (b) Rewrite diff.js to use these classes instead of arrays and objects.                                          // 847
  _publishNewResults: function (newResults, newBuffer) {                                                              // 848
    var self = this;                                                                                                  // 849
    Meteor._noYieldsAllowed(function () {                                                                             // 850
                                                                                                                      // 851
      // If the query is limited and there is a buffer, shut down so it doesn't                                       // 852
      // stay in a way.                                                                                               // 853
      if (self._limit) {                                                                                              // 854
        self._unpublishedBuffer.clear();                                                                              // 855
      }                                                                                                               // 856
                                                                                                                      // 857
      // First remove anything that's gone. Be careful not to modify                                                  // 858
      // self._published while iterating over it.                                                                     // 859
      var idsToRemove = [];                                                                                           // 860
      self._published.forEach(function (doc, id) {                                                                    // 861
        if (!newResults.has(id))                                                                                      // 862
          idsToRemove.push(id);                                                                                       // 863
      });                                                                                                             // 864
      _.each(idsToRemove, function (id) {                                                                             // 865
        self._removePublished(id);                                                                                    // 866
      });                                                                                                             // 867
                                                                                                                      // 868
      // Now do adds and changes.                                                                                     // 869
      // If self has a buffer and limit, the new fetched result will be                                               // 870
      // limited correctly as the query has sort specifier.                                                           // 871
      newResults.forEach(function (doc, id) {                                                                         // 872
        self._handleDoc(id, doc);                                                                                     // 873
      });                                                                                                             // 874
                                                                                                                      // 875
      // Sanity-check that everything we tried to put into _published ended up                                        // 876
      // there.                                                                                                       // 877
      // XXX if this is slow, remove it later                                                                         // 878
      if (self._published.size() !== newResults.size()) {                                                             // 879
        throw Error(                                                                                                  // 880
          "The Mongo server and the Meteor query disagree on how " +                                                  // 881
            "many documents match your query. Maybe it is hitting a Mongo " +                                         // 882
            "edge case? The query is: " +                                                                             // 883
            EJSON.stringify(self._cursorDescription.selector));                                                       // 884
      }                                                                                                               // 885
      self._published.forEach(function (doc, id) {                                                                    // 886
        if (!newResults.has(id))                                                                                      // 887
          throw Error("_published has a doc that newResults doesn't; " + id);                                         // 888
      });                                                                                                             // 889
                                                                                                                      // 890
      // Finally, replace the buffer                                                                                  // 891
      newBuffer.forEach(function (doc, id) {                                                                          // 892
        self._addBuffered(id, doc);                                                                                   // 893
      });                                                                                                             // 894
                                                                                                                      // 895
      self._safeAppendToBuffer = newBuffer.size() < self._limit;                                                      // 896
    });                                                                                                               // 897
  },                                                                                                                  // 898
                                                                                                                      // 899
  // This stop function is invoked from the onStop of the ObserveMultiplexer, so                                      // 900
  // it shouldn't actually be possible to call it until the multiplexer is                                            // 901
  // ready.                                                                                                           // 902
  //                                                                                                                  // 903
  // It's important to check self._stopped after every call in this file that                                         // 904
  // can yield!                                                                                                       // 905
  stop: function () {                                                                                                 // 906
    var self = this;                                                                                                  // 907
    if (self._stopped)                                                                                                // 908
      return;                                                                                                         // 909
    self._stopped = true;                                                                                             // 910
    _.each(self._stopHandles, function (handle) {                                                                     // 911
      handle.stop();                                                                                                  // 912
    });                                                                                                               // 913
                                                                                                                      // 914
    // Note: we *don't* use multiplexer.onFlush here because this stop                                                // 915
    // callback is actually invoked by the multiplexer itself when it has                                             // 916
    // determined that there are no handles left. So nothing is actually going                                        // 917
    // to get flushed (and it's probably not valid to call methods on the                                             // 918
    // dying multiplexer).                                                                                            // 919
    _.each(self._writesToCommitWhenWeReachSteady, function (w) {                                                      // 920
      w.committed();  // maybe yields?                                                                                // 921
    });                                                                                                               // 922
    self._writesToCommitWhenWeReachSteady = null;                                                                     // 923
                                                                                                                      // 924
    // Proactively drop references to potentially big things.                                                         // 925
    self._published = null;                                                                                           // 926
    self._unpublishedBuffer = null;                                                                                   // 927
    self._needToFetch = null;                                                                                         // 928
    self._currentlyFetching = null;                                                                                   // 929
    self._oplogEntryHandle = null;                                                                                    // 930
    self._listenersHandle = null;                                                                                     // 931
                                                                                                                      // 932
    Package.facts && Package.facts.Facts.incrementServerFact(                                                         // 933
      "mongo-livedata", "observe-drivers-oplog", -1);                                                                 // 934
  },                                                                                                                  // 935
                                                                                                                      // 936
  _registerPhaseChange: function (phase) {                                                                            // 937
    var self = this;                                                                                                  // 938
    Meteor._noYieldsAllowed(function () {                                                                             // 939
      var now = new Date;                                                                                             // 940
                                                                                                                      // 941
      if (self._phase) {                                                                                              // 942
        var timeDiff = now - self._phaseStartTime;                                                                    // 943
        Package.facts && Package.facts.Facts.incrementServerFact(                                                     // 944
          "mongo-livedata", "time-spent-in-" + self._phase + "-phase", timeDiff);                                     // 945
      }                                                                                                               // 946
                                                                                                                      // 947
      self._phase = phase;                                                                                            // 948
      self._phaseStartTime = now;                                                                                     // 949
    });                                                                                                               // 950
  }                                                                                                                   // 951
});                                                                                                                   // 952
                                                                                                                      // 953
// Does our oplog tailing code support this cursor? For now, we are being very                                        // 954
// conservative and allowing only simple queries with simple options.                                                 // 955
// (This is a "static method".)                                                                                       // 956
OplogObserveDriver.cursorSupported = function (cursorDescription, matcher) {                                          // 957
  // First, check the options.                                                                                        // 958
  var options = cursorDescription.options;                                                                            // 959
                                                                                                                      // 960
  // Did the user say no explicitly?                                                                                  // 961
  if (options._disableOplog)                                                                                          // 962
    return false;                                                                                                     // 963
                                                                                                                      // 964
  // skip is not supported: to support it we would need to keep track of all                                          // 965
  // "skipped" documents or at least their ids.                                                                       // 966
  // limit w/o a sort specifier is not supported: current implementation needs a                                      // 967
  // deterministic way to order documents.                                                                            // 968
  if (options.skip || (options.limit && !options.sort)) return false;                                                 // 969
                                                                                                                      // 970
  // If a fields projection option is given check if it is supported by                                               // 971
  // minimongo (some operators are not supported).                                                                    // 972
  if (options.fields) {                                                                                               // 973
    try {                                                                                                             // 974
      LocalCollection._checkSupportedProjection(options.fields);                                                      // 975
    } catch (e) {                                                                                                     // 976
      if (e.name === "MinimongoError")                                                                                // 977
        return false;                                                                                                 // 978
      else                                                                                                            // 979
        throw e;                                                                                                      // 980
    }                                                                                                                 // 981
  }                                                                                                                   // 982
                                                                                                                      // 983
  // We don't allow the following selectors:                                                                          // 984
  //   - $where (not confident that we provide the same JS environment                                                // 985
  //             as Mongo, and can yield!)                                                                            // 986
  //   - $near (has "interesting" properties in MongoDB, like the possibility                                         // 987
  //            of returning an ID multiple times, though even polling maybe                                          // 988
  //            have a bug there)                                                                                     // 989
  //           XXX: once we support it, we would need to think more on how we                                         // 990
  //           initialize the comparators when we create the driver.                                                  // 991
  return !matcher.hasWhere() && !matcher.hasGeoQuery();                                                               // 992
};                                                                                                                    // 993
                                                                                                                      // 994
var modifierCanBeDirectlyApplied = function (modifier) {                                                              // 995
  return _.all(modifier, function (fields, operation) {                                                               // 996
    return _.all(fields, function (value, field) {                                                                    // 997
      return !/EJSON\$/.test(field);                                                                                  // 998
    });                                                                                                               // 999
  });                                                                                                                 // 1000
};                                                                                                                    // 1001
                                                                                                                      // 1002
MongoInternals.OplogObserveDriver = OplogObserveDriver;                                                               // 1003
                                                                                                                      // 1004
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 3286
}).call(this);                                                                                                        // 3287
                                                                                                                      // 3288
                                                                                                                      // 3289
                                                                                                                      // 3290
                                                                                                                      // 3291
                                                                                                                      // 3292
                                                                                                                      // 3293
(function(){                                                                                                          // 3294
                                                                                                                      // 3295
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/local_collection_driver.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
LocalCollectionDriver = function () {                                                                                 // 1
  var self = this;                                                                                                    // 2
  self.noConnCollections = {};                                                                                        // 3
};                                                                                                                    // 4
                                                                                                                      // 5
var ensureCollection = function (name, collections) {                                                                 // 6
  if (!(name in collections))                                                                                         // 7
    collections[name] = new LocalCollection(name);                                                                    // 8
  return collections[name];                                                                                           // 9
};                                                                                                                    // 10
                                                                                                                      // 11
_.extend(LocalCollectionDriver.prototype, {                                                                           // 12
  open: function (name, conn) {                                                                                       // 13
    var self = this;                                                                                                  // 14
    if (!name)                                                                                                        // 15
      return new LocalCollection;                                                                                     // 16
    if (! conn) {                                                                                                     // 17
      return ensureCollection(name, self.noConnCollections);                                                          // 18
    }                                                                                                                 // 19
    if (! conn._mongo_livedata_collections)                                                                           // 20
      conn._mongo_livedata_collections = {};                                                                          // 21
    // XXX is there a way to keep track of a connection's collections without                                         // 22
    // dangling it off the connection object?                                                                         // 23
    return ensureCollection(name, conn._mongo_livedata_collections);                                                  // 24
  }                                                                                                                   // 25
});                                                                                                                   // 26
                                                                                                                      // 27
// singleton                                                                                                          // 28
LocalCollectionDriver = new LocalCollectionDriver;                                                                    // 29
                                                                                                                      // 30
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 3333
}).call(this);                                                                                                        // 3334
                                                                                                                      // 3335
                                                                                                                      // 3336
                                                                                                                      // 3337
                                                                                                                      // 3338
                                                                                                                      // 3339
                                                                                                                      // 3340
(function(){                                                                                                          // 3341
                                                                                                                      // 3342
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/remote_collection_driver.js                                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
MongoInternals.RemoteCollectionDriver = function (                                                                    // 1
  mongo_url, options) {                                                                                               // 2
  var self = this;                                                                                                    // 3
  self.mongo = new MongoConnection(mongo_url, options);                                                               // 4
};                                                                                                                    // 5
                                                                                                                      // 6
_.extend(MongoInternals.RemoteCollectionDriver.prototype, {                                                           // 7
  open: function (name) {                                                                                             // 8
    var self = this;                                                                                                  // 9
    var ret = {};                                                                                                     // 10
    _.each(                                                                                                           // 11
      ['find', 'findOne', 'insert', 'update', 'upsert',                                                               // 12
       'remove', '_ensureIndex', '_dropIndex', '_createCappedCollection',                                             // 13
       'dropCollection', 'rawCollection'],                                                                            // 14
      function (m) {                                                                                                  // 15
        ret[m] = _.bind(self.mongo[m], self.mongo, name);                                                             // 16
      });                                                                                                             // 17
    return ret;                                                                                                       // 18
  }                                                                                                                   // 19
});                                                                                                                   // 20
                                                                                                                      // 21
                                                                                                                      // 22
// Create the singleton RemoteCollectionDriver only on demand, so we                                                  // 23
// only require Mongo configuration if it's actually used (eg, not if                                                 // 24
// you're only trying to receive data from a remote DDP server.)                                                      // 25
MongoInternals.defaultRemoteCollectionDriver = _.once(function () {                                                   // 26
  var connectionOptions = {};                                                                                         // 27
                                                                                                                      // 28
  var mongoUrl = process.env.MONGO_URL;                                                                               // 29
                                                                                                                      // 30
  if (process.env.MONGO_OPLOG_URL) {                                                                                  // 31
    connectionOptions.oplogUrl = process.env.MONGO_OPLOG_URL;                                                         // 32
  }                                                                                                                   // 33
                                                                                                                      // 34
  if (! mongoUrl)                                                                                                     // 35
    throw new Error("MONGO_URL must be set in environment");                                                          // 36
                                                                                                                      // 37
  return new MongoInternals.RemoteCollectionDriver(mongoUrl, connectionOptions);                                      // 38
});                                                                                                                   // 39
                                                                                                                      // 40
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 3390
}).call(this);                                                                                                        // 3391
                                                                                                                      // 3392
                                                                                                                      // 3393
                                                                                                                      // 3394
                                                                                                                      // 3395
                                                                                                                      // 3396
                                                                                                                      // 3397
(function(){                                                                                                          // 3398
                                                                                                                      // 3399
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/mongo/collection.js                                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// options.connection, if given, is a LivedataClient or LivedataServer                                                // 1
// XXX presently there is no way to destroy/clean up a Collection                                                     // 2
                                                                                                                      // 3
/**                                                                                                                   // 4
 * @summary Namespace for MongoDB-related items                                                                       // 5
 * @namespace                                                                                                         // 6
 */                                                                                                                   // 7
Mongo = {};                                                                                                           // 8
                                                                                                                      // 9
/**                                                                                                                   // 10
 * @summary Constructor for a Collection                                                                              // 11
 * @locus Anywhere                                                                                                    // 12
 * @instancename collection                                                                                           // 13
 * @class                                                                                                             // 14
 * @param {String} name The name of the collection.  If null, creates an unmanaged (unsynchronized) local collection.
 * @param {Object} [options]                                                                                          // 16
 * @param {Object} options.connection The server connection that will manage this collection. Uses the default connection if not specified.  Pass the return value of calling [`DDP.connect`](#ddp_connect) to specify a different server. Pass `null` to specify no connection. Unmanaged (`name` is null) collections cannot specify a connection.
 * @param {String} options.idGeneration The method of generating the `_id` fields of new documents in this collection.  Possible values:
                                                                                                                      // 19
 - **`'STRING'`**: random strings                                                                                     // 20
 - **`'MONGO'`**:  random [`Mongo.ObjectID`](#mongo_object_id) values                                                 // 21
                                                                                                                      // 22
The default id generation technique is `'STRING'`.                                                                    // 23
 * @param {Function} options.transform An optional transformation function. Documents will be passed through this function before being returned from `fetch` or `findOne`, and before being passed to callbacks of `observe`, `map`, `forEach`, `allow`, and `deny`. Transforms are *not* applied for the callbacks of `observeChanges` or to cursors returned from publish functions.
 */                                                                                                                   // 25
Mongo.Collection = function (name, options) {                                                                         // 26
  var self = this;                                                                                                    // 27
  if (! (self instanceof Mongo.Collection))                                                                           // 28
    throw new Error('use "new" to construct a Mongo.Collection');                                                     // 29
                                                                                                                      // 30
  if (!name && (name !== null)) {                                                                                     // 31
    Meteor._debug("Warning: creating anonymous collection. It will not be " +                                         // 32
                  "saved or synchronized over the network. (Pass null for " +                                         // 33
                  "the collection name to turn off this warning.)");                                                  // 34
    name = null;                                                                                                      // 35
  }                                                                                                                   // 36
                                                                                                                      // 37
  if (name !== null && typeof name !== "string") {                                                                    // 38
    throw new Error(                                                                                                  // 39
      "First argument to new Mongo.Collection must be a string or null");                                             // 40
  }                                                                                                                   // 41
                                                                                                                      // 42
  if (options && options.methods) {                                                                                   // 43
    // Backwards compatibility hack with original signature (which passed                                             // 44
    // "connection" directly instead of in options. (Connections must have a "methods"                                // 45
    // method.)                                                                                                       // 46
    // XXX remove before 1.0                                                                                          // 47
    options = {connection: options};                                                                                  // 48
  }                                                                                                                   // 49
  // Backwards compatibility: "connection" used to be called "manager".                                               // 50
  if (options && options.manager && !options.connection) {                                                            // 51
    options.connection = options.manager;                                                                             // 52
  }                                                                                                                   // 53
  options = _.extend({                                                                                                // 54
    connection: undefined,                                                                                            // 55
    idGeneration: 'STRING',                                                                                           // 56
    transform: null,                                                                                                  // 57
    _driver: undefined,                                                                                               // 58
    _preventAutopublish: false                                                                                        // 59
  }, options);                                                                                                        // 60
                                                                                                                      // 61
  switch (options.idGeneration) {                                                                                     // 62
  case 'MONGO':                                                                                                       // 63
    self._makeNewID = function () {                                                                                   // 64
      var src = name ? DDP.randomStream('/collection/' + name) : Random;                                              // 65
      return new Mongo.ObjectID(src.hexString(24));                                                                   // 66
    };                                                                                                                // 67
    break;                                                                                                            // 68
  case 'STRING':                                                                                                      // 69
  default:                                                                                                            // 70
    self._makeNewID = function () {                                                                                   // 71
      var src = name ? DDP.randomStream('/collection/' + name) : Random;                                              // 72
      return src.id();                                                                                                // 73
    };                                                                                                                // 74
    break;                                                                                                            // 75
  }                                                                                                                   // 76
                                                                                                                      // 77
  self._transform = LocalCollection.wrapTransform(options.transform);                                                 // 78
                                                                                                                      // 79
  if (! name || options.connection === null)                                                                          // 80
    // note: nameless collections never have a connection                                                             // 81
    self._connection = null;                                                                                          // 82
  else if (options.connection)                                                                                        // 83
    self._connection = options.connection;                                                                            // 84
  else if (Meteor.isClient)                                                                                           // 85
    self._connection = Meteor.connection;                                                                             // 86
  else                                                                                                                // 87
    self._connection = Meteor.server;                                                                                 // 88
                                                                                                                      // 89
  if (!options._driver) {                                                                                             // 90
    // XXX This check assumes that webapp is loaded so that Meteor.server !==                                         // 91
    // null. We should fully support the case of "want to use a Mongo-backed                                          // 92
    // collection from Node code without webapp", but we don't yet.                                                   // 93
    // #MeteorServerNull                                                                                              // 94
    if (name && self._connection === Meteor.server &&                                                                 // 95
        typeof MongoInternals !== "undefined" &&                                                                      // 96
        MongoInternals.defaultRemoteCollectionDriver) {                                                               // 97
      options._driver = MongoInternals.defaultRemoteCollectionDriver();                                               // 98
    } else {                                                                                                          // 99
      options._driver = LocalCollectionDriver;                                                                        // 100
    }                                                                                                                 // 101
  }                                                                                                                   // 102
                                                                                                                      // 103
  self._collection = options._driver.open(name, self._connection);                                                    // 104
  self._name = name;                                                                                                  // 105
  self._driver = options._driver;                                                                                     // 106
                                                                                                                      // 107
  if (self._connection && self._connection.registerStore) {                                                           // 108
    // OK, we're going to be a slave, replicating some remote                                                         // 109
    // database, except possibly with some temporary divergence while                                                 // 110
    // we have unacknowledged RPC's.                                                                                  // 111
    var ok = self._connection.registerStore(name, {                                                                   // 112
      // Called at the beginning of a batch of updates. batchSize is the number                                       // 113
      // of update calls to expect.                                                                                   // 114
      //                                                                                                              // 115
      // XXX This interface is pretty janky. reset probably ought to go back to                                       // 116
      // being its own function, and callers shouldn't have to calculate                                              // 117
      // batchSize. The optimization of not calling pause/remove should be                                            // 118
      // delayed until later: the first call to update() should buffer its                                            // 119
      // message, and then we can either directly apply it at endUpdate time if                                       // 120
      // it was the only update, or do pauseObservers/apply/apply at the next                                         // 121
      // update() if there's another one.                                                                             // 122
      beginUpdate: function (batchSize, reset) {                                                                      // 123
        // pause observers so users don't see flicker when updating several                                           // 124
        // objects at once (including the post-reconnect reset-and-reapply                                            // 125
        // stage), and so that a re-sorting of a query can take advantage of the                                      // 126
        // full _diffQuery moved calculation instead of applying change one at a                                      // 127
        // time.                                                                                                      // 128
        if (batchSize > 1 || reset)                                                                                   // 129
          self._collection.pauseObservers();                                                                          // 130
                                                                                                                      // 131
        if (reset)                                                                                                    // 132
          self._collection.remove({});                                                                                // 133
      },                                                                                                              // 134
                                                                                                                      // 135
      // Apply an update.                                                                                             // 136
      // XXX better specify this interface (not in terms of a wire message)?                                          // 137
      update: function (msg) {                                                                                        // 138
        var mongoId = MongoID.idParse(msg.id);                                                                        // 139
        var doc = self._collection.findOne(mongoId);                                                                  // 140
                                                                                                                      // 141
        // Is this a "replace the whole doc" message coming from the quiescence                                       // 142
        // of method writes to an object? (Note that 'undefined' is a valid                                           // 143
        // value meaning "remove it".)                                                                                // 144
        if (msg.msg === 'replace') {                                                                                  // 145
          var replace = msg.replace;                                                                                  // 146
          if (!replace) {                                                                                             // 147
            if (doc)                                                                                                  // 148
              self._collection.remove(mongoId);                                                                       // 149
          } else if (!doc) {                                                                                          // 150
            self._collection.insert(replace);                                                                         // 151
          } else {                                                                                                    // 152
            // XXX check that replace has no $ ops                                                                    // 153
            self._collection.update(mongoId, replace);                                                                // 154
          }                                                                                                           // 155
          return;                                                                                                     // 156
        } else if (msg.msg === 'added') {                                                                             // 157
          if (doc) {                                                                                                  // 158
            throw new Error("Expected not to find a document already present for an add");                            // 159
          }                                                                                                           // 160
          self._collection.insert(_.extend({_id: mongoId}, msg.fields));                                              // 161
        } else if (msg.msg === 'removed') {                                                                           // 162
          if (!doc)                                                                                                   // 163
            throw new Error("Expected to find a document already present for removed");                               // 164
          self._collection.remove(mongoId);                                                                           // 165
        } else if (msg.msg === 'changed') {                                                                           // 166
          if (!doc)                                                                                                   // 167
            throw new Error("Expected to find a document to change");                                                 // 168
          if (!_.isEmpty(msg.fields)) {                                                                               // 169
            var modifier = {};                                                                                        // 170
            _.each(msg.fields, function (value, key) {                                                                // 171
              if (value === undefined) {                                                                              // 172
                if (!modifier.$unset)                                                                                 // 173
                  modifier.$unset = {};                                                                               // 174
                modifier.$unset[key] = 1;                                                                             // 175
              } else {                                                                                                // 176
                if (!modifier.$set)                                                                                   // 177
                  modifier.$set = {};                                                                                 // 178
                modifier.$set[key] = value;                                                                           // 179
              }                                                                                                       // 180
            });                                                                                                       // 181
            self._collection.update(mongoId, modifier);                                                               // 182
          }                                                                                                           // 183
        } else {                                                                                                      // 184
          throw new Error("I don't know how to deal with this message");                                              // 185
        }                                                                                                             // 186
                                                                                                                      // 187
      },                                                                                                              // 188
                                                                                                                      // 189
      // Called at the end of a batch of updates.                                                                     // 190
      endUpdate: function () {                                                                                        // 191
        self._collection.resumeObservers();                                                                           // 192
      },                                                                                                              // 193
                                                                                                                      // 194
      // Called around method stub invocations to capture the original versions                                       // 195
      // of modified documents.                                                                                       // 196
      saveOriginals: function () {                                                                                    // 197
        self._collection.saveOriginals();                                                                             // 198
      },                                                                                                              // 199
      retrieveOriginals: function () {                                                                                // 200
        return self._collection.retrieveOriginals();                                                                  // 201
      },                                                                                                              // 202
                                                                                                                      // 203
      // Used to preserve current versions of documents across a store reset.                                         // 204
      getDoc: function(id) {                                                                                          // 205
        return self.findOne(id);                                                                                      // 206
      },                                                                                                              // 207
    });                                                                                                               // 208
                                                                                                                      // 209
    if (!ok)                                                                                                          // 210
      throw new Error("There is already a collection named '" + name + "'");                                          // 211
  }                                                                                                                   // 212
                                                                                                                      // 213
  self._defineMutationMethods();                                                                                      // 214
                                                                                                                      // 215
  // autopublish                                                                                                      // 216
  if (Package.autopublish && !options._preventAutopublish && self._connection                                         // 217
      && self._connection.publish) {                                                                                  // 218
    self._connection.publish(null, function () {                                                                      // 219
      return self.find();                                                                                             // 220
    }, {is_auto: true});                                                                                              // 221
  }                                                                                                                   // 222
};                                                                                                                    // 223
                                                                                                                      // 224
///                                                                                                                   // 225
/// Main collection API                                                                                               // 226
///                                                                                                                   // 227
                                                                                                                      // 228
                                                                                                                      // 229
_.extend(Mongo.Collection.prototype, {                                                                                // 230
                                                                                                                      // 231
  _getFindSelector: function (args) {                                                                                 // 232
    if (args.length == 0)                                                                                             // 233
      return {};                                                                                                      // 234
    else                                                                                                              // 235
      return args[0];                                                                                                 // 236
  },                                                                                                                  // 237
                                                                                                                      // 238
  _getFindOptions: function (args) {                                                                                  // 239
    var self = this;                                                                                                  // 240
    if (args.length < 2) {                                                                                            // 241
      return { transform: self._transform };                                                                          // 242
    } else {                                                                                                          // 243
      check(args[1], Match.Optional(Match.ObjectIncluding({                                                           // 244
        fields: Match.Optional(Match.OneOf(Object, undefined)),                                                       // 245
        sort: Match.Optional(Match.OneOf(Object, Array, undefined)),                                                  // 246
        limit: Match.Optional(Match.OneOf(Number, undefined)),                                                        // 247
        skip: Match.Optional(Match.OneOf(Number, undefined))                                                          // 248
     })));                                                                                                            // 249
                                                                                                                      // 250
      return _.extend({                                                                                               // 251
        transform: self._transform                                                                                    // 252
      }, args[1]);                                                                                                    // 253
    }                                                                                                                 // 254
  },                                                                                                                  // 255
                                                                                                                      // 256
  /**                                                                                                                 // 257
   * @summary Find the documents in a collection that match the selector.                                             // 258
   * @locus Anywhere                                                                                                  // 259
   * @method find                                                                                                     // 260
   * @memberOf Mongo.Collection                                                                                       // 261
   * @instance                                                                                                        // 262
   * @param {MongoSelector} [selector] A query describing the documents to find                                       // 263
   * @param {Object} [options]                                                                                        // 264
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)                                     // 265
   * @param {Number} options.skip Number of results to skip at the beginning                                          // 266
   * @param {Number} options.limit Maximum number of results to return                                                // 267
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.                           // 268
   * @param {Boolean} options.reactive (Client only) Default `true`; pass `false` to disable reactivity               // 269
   * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @returns {Mongo.Cursor}                                                                                          // 271
   */                                                                                                                 // 272
  find: function (/* selector, options */) {                                                                          // 273
    // Collection.find() (return all docs) behaves differently                                                        // 274
    // from Collection.find(undefined) (return 0 docs).  so be                                                        // 275
    // careful about the length of arguments.                                                                         // 276
    var self = this;                                                                                                  // 277
    var argArray = _.toArray(arguments);                                                                              // 278
    return self._collection.find(self._getFindSelector(argArray),                                                     // 279
                                 self._getFindOptions(argArray));                                                     // 280
  },                                                                                                                  // 281
                                                                                                                      // 282
  /**                                                                                                                 // 283
   * @summary Finds the first document that matches the selector, as ordered by sort and skip options.                // 284
   * @locus Anywhere                                                                                                  // 285
   * @method findOne                                                                                                  // 286
   * @memberOf Mongo.Collection                                                                                       // 287
   * @instance                                                                                                        // 288
   * @param {MongoSelector} [selector] A query describing the documents to find                                       // 289
   * @param {Object} [options]                                                                                        // 290
   * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)                                     // 291
   * @param {Number} options.skip Number of results to skip at the beginning                                          // 292
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.                           // 293
   * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity                   // 294
   * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
   * @returns {Object}                                                                                                // 296
   */                                                                                                                 // 297
  findOne: function (/* selector, options */) {                                                                       // 298
    var self = this;                                                                                                  // 299
    var argArray = _.toArray(arguments);                                                                              // 300
    return self._collection.findOne(self._getFindSelector(argArray),                                                  // 301
                                    self._getFindOptions(argArray));                                                  // 302
  }                                                                                                                   // 303
                                                                                                                      // 304
});                                                                                                                   // 305
                                                                                                                      // 306
Mongo.Collection._publishCursor = function (cursor, sub, collection) {                                                // 307
  var observeHandle = cursor.observeChanges({                                                                         // 308
    added: function (id, fields) {                                                                                    // 309
      sub.added(collection, id, fields);                                                                              // 310
    },                                                                                                                // 311
    changed: function (id, fields) {                                                                                  // 312
      sub.changed(collection, id, fields);                                                                            // 313
    },                                                                                                                // 314
    removed: function (id) {                                                                                          // 315
      sub.removed(collection, id);                                                                                    // 316
    }                                                                                                                 // 317
  });                                                                                                                 // 318
                                                                                                                      // 319
  // We don't call sub.ready() here: it gets called in livedata_server, after                                         // 320
  // possibly calling _publishCursor on multiple returned cursors.                                                    // 321
                                                                                                                      // 322
  // register stop callback (expects lambda w/ no args).                                                              // 323
  sub.onStop(function () {observeHandle.stop();});                                                                    // 324
};                                                                                                                    // 325
                                                                                                                      // 326
// protect against dangerous selectors.  falsey and {_id: falsey} are both                                            // 327
// likely programmer error, and not what you want, particularly for destructive                                       // 328
// operations.  JS regexps don't serialize over DDP but can be trivially                                              // 329
// replaced by $regex.                                                                                                // 330
Mongo.Collection._rewriteSelector = function (selector) {                                                             // 331
  // shorthand -- scalars match _id                                                                                   // 332
  if (LocalCollection._selectorIsId(selector))                                                                        // 333
    selector = {_id: selector};                                                                                       // 334
                                                                                                                      // 335
  if (_.isArray(selector)) {                                                                                          // 336
    // This is consistent with the Mongo console itself; if we don't do this                                          // 337
    // check passing an empty array ends up selecting all items                                                       // 338
    throw new Error("Mongo selector can't be an array.");                                                             // 339
  }                                                                                                                   // 340
                                                                                                                      // 341
  if (!selector || (('_id' in selector) && !selector._id))                                                            // 342
    // can't match anything                                                                                           // 343
    return {_id: Random.id()};                                                                                        // 344
                                                                                                                      // 345
  var ret = {};                                                                                                       // 346
  _.each(selector, function (value, key) {                                                                            // 347
    // Mongo supports both {field: /foo/} and {field: {$regex: /foo/}}                                                // 348
    if (value instanceof RegExp) {                                                                                    // 349
      ret[key] = convertRegexpToMongoSelector(value);                                                                 // 350
    } else if (value && value.$regex instanceof RegExp) {                                                             // 351
      ret[key] = convertRegexpToMongoSelector(value.$regex);                                                          // 352
      // if value is {$regex: /foo/, $options: ...} then $options                                                     // 353
      // override the ones set on $regex.                                                                             // 354
      if (value.$options !== undefined)                                                                               // 355
        ret[key].$options = value.$options;                                                                           // 356
    }                                                                                                                 // 357
    else if (_.contains(['$or','$and','$nor'], key)) {                                                                // 358
      // Translate lower levels of $and/$or/$nor                                                                      // 359
      ret[key] = _.map(value, function (v) {                                                                          // 360
        return Mongo.Collection._rewriteSelector(v);                                                                  // 361
      });                                                                                                             // 362
    } else {                                                                                                          // 363
      ret[key] = value;                                                                                               // 364
    }                                                                                                                 // 365
  });                                                                                                                 // 366
  return ret;                                                                                                         // 367
};                                                                                                                    // 368
                                                                                                                      // 369
// convert a JS RegExp object to a Mongo {$regex: ..., $options: ...}                                                 // 370
// selector                                                                                                           // 371
var convertRegexpToMongoSelector = function (regexp) {                                                                // 372
  check(regexp, RegExp); // safety belt                                                                               // 373
                                                                                                                      // 374
  var selector = {$regex: regexp.source};                                                                             // 375
  var regexOptions = '';                                                                                              // 376
  // JS RegExp objects support 'i', 'm', and 'g'. Mongo regex $options                                                // 377
  // support 'i', 'm', 'x', and 's'. So we support 'i' and 'm' here.                                                  // 378
  if (regexp.ignoreCase)                                                                                              // 379
    regexOptions += 'i';                                                                                              // 380
  if (regexp.multiline)                                                                                               // 381
    regexOptions += 'm';                                                                                              // 382
  if (regexOptions)                                                                                                   // 383
    selector.$options = regexOptions;                                                                                 // 384
                                                                                                                      // 385
  return selector;                                                                                                    // 386
};                                                                                                                    // 387
                                                                                                                      // 388
var throwIfSelectorIsNotId = function (selector, methodName) {                                                        // 389
  if (!LocalCollection._selectorIsIdPerhapsAsObject(selector)) {                                                      // 390
    throw new Meteor.Error(                                                                                           // 391
      403, "Not permitted. Untrusted code may only " + methodName +                                                   // 392
        " documents by ID.");                                                                                         // 393
  }                                                                                                                   // 394
};                                                                                                                    // 395
                                                                                                                      // 396
// 'insert' immediately returns the inserted document's new _id.                                                      // 397
// The others return values immediately if you are in a stub, an in-memory                                            // 398
// unmanaged collection, or a mongo-backed collection and you don't pass a                                            // 399
// callback. 'update' and 'remove' return the number of affected                                                      // 400
// documents. 'upsert' returns an object with keys 'numberAffected' and, if an                                        // 401
// insert happened, 'insertedId'.                                                                                     // 402
//                                                                                                                    // 403
// Otherwise, the semantics are exactly like other methods: they take                                                 // 404
// a callback as an optional last argument; if no callback is                                                         // 405
// provided, they block until the operation is complete, and throw an                                                 // 406
// exception if it fails; if a callback is provided, then they don't                                                  // 407
// necessarily block, and they call the callback when they finish with error and                                      // 408
// result arguments.  (The insert method provides the document ID as its result;                                      // 409
// update and remove provide the number of affected docs as the result; upsert                                        // 410
// provides an object with numberAffected and maybe insertedId.)                                                      // 411
//                                                                                                                    // 412
// On the client, blocking is impossible, so if a callback                                                            // 413
// isn't provided, they just return immediately and any error                                                         // 414
// information is lost.                                                                                               // 415
//                                                                                                                    // 416
// There's one more tweak. On the client, if you don't provide a                                                      // 417
// callback, then if there is an error, a message will be logged with                                                 // 418
// Meteor._debug.                                                                                                     // 419
//                                                                                                                    // 420
// The intent (though this is actually determined by the underlying                                                   // 421
// drivers) is that the operations should be done synchronously, not                                                  // 422
// generating their result until the database has acknowledged                                                        // 423
// them. In the future maybe we should provide a flag to turn this                                                    // 424
// off.                                                                                                               // 425
                                                                                                                      // 426
/**                                                                                                                   // 427
 * @summary Insert a document in the collection.  Returns its unique _id.                                             // 428
 * @locus Anywhere                                                                                                    // 429
 * @method  insert                                                                                                    // 430
 * @memberOf Mongo.Collection                                                                                         // 431
 * @instance                                                                                                          // 432
 * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
 * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the _id as the second.
 */                                                                                                                   // 435
                                                                                                                      // 436
/**                                                                                                                   // 437
 * @summary Modify one or more documents in the collection. Returns the number of affected documents.                 // 438
 * @locus Anywhere                                                                                                    // 439
 * @method update                                                                                                     // 440
 * @memberOf Mongo.Collection                                                                                         // 441
 * @instance                                                                                                          // 442
 * @param {MongoSelector} selector Specifies which documents to modify                                                // 443
 * @param {MongoModifier} modifier Specifies how to modify the documents                                              // 444
 * @param {Object} [options]                                                                                          // 445
 * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
 * @param {Boolean} options.upsert True to insert a document if no matching documents are found.                      // 447
 * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
 */                                                                                                                   // 449
                                                                                                                      // 450
/**                                                                                                                   // 451
 * @summary Remove documents from the collection                                                                      // 452
 * @locus Anywhere                                                                                                    // 453
 * @method remove                                                                                                     // 454
 * @memberOf Mongo.Collection                                                                                         // 455
 * @instance                                                                                                          // 456
 * @param {MongoSelector} selector Specifies which documents to remove                                                // 457
 * @param {Function} [callback] Optional.  If present, called with an error object as its argument.                   // 458
 */                                                                                                                   // 459
                                                                                                                      // 460
_.each(["insert", "update", "remove"], function (name) {                                                              // 461
  Mongo.Collection.prototype[name] = function (/* arguments */) {                                                     // 462
    var self = this;                                                                                                  // 463
    var args = _.toArray(arguments);                                                                                  // 464
    var callback;                                                                                                     // 465
    var insertId;                                                                                                     // 466
    var ret;                                                                                                          // 467
                                                                                                                      // 468
    // Pull off any callback (or perhaps a 'callback' variable that was passed                                        // 469
    // in undefined, like how 'upsert' does it).                                                                      // 470
    if (args.length &&                                                                                                // 471
        (args[args.length - 1] === undefined ||                                                                       // 472
         args[args.length - 1] instanceof Function)) {                                                                // 473
      callback = args.pop();                                                                                          // 474
    }                                                                                                                 // 475
                                                                                                                      // 476
    if (name === "insert") {                                                                                          // 477
      if (!args.length)                                                                                               // 478
        throw new Error("insert requires an argument");                                                               // 479
      // shallow-copy the document and generate an ID                                                                 // 480
      args[0] = _.extend({}, args[0]);                                                                                // 481
      if ('_id' in args[0]) {                                                                                         // 482
        insertId = args[0]._id;                                                                                       // 483
        if (!insertId || !(typeof insertId === 'string'                                                               // 484
              || insertId instanceof Mongo.ObjectID))                                                                 // 485
          throw new Error("Meteor requires document _id fields to be non-empty strings or ObjectIDs");                // 486
      } else {                                                                                                        // 487
        var generateId = true;                                                                                        // 488
        // Don't generate the id if we're the client and the 'outermost' call                                         // 489
        // This optimization saves us passing both the randomSeed and the id                                          // 490
        // Passing both is redundant.                                                                                 // 491
        if (self._connection && self._connection !== Meteor.server) {                                                 // 492
          var enclosing = DDP._CurrentInvocation.get();                                                               // 493
          if (!enclosing) {                                                                                           // 494
            generateId = false;                                                                                       // 495
          }                                                                                                           // 496
        }                                                                                                             // 497
        if (generateId) {                                                                                             // 498
          insertId = args[0]._id = self._makeNewID();                                                                 // 499
        }                                                                                                             // 500
      }                                                                                                               // 501
    } else {                                                                                                          // 502
      args[0] = Mongo.Collection._rewriteSelector(args[0]);                                                           // 503
                                                                                                                      // 504
      if (name === "update") {                                                                                        // 505
        // Mutate args but copy the original options object. We need to add                                           // 506
        // insertedId to options, but don't want to mutate the caller's options                                       // 507
        // object. We need to mutate `args` because we pass `args` into the                                           // 508
        // driver below.                                                                                              // 509
        var options = args[2] = _.clone(args[2]) || {};                                                               // 510
        if (options && typeof options !== "function" && options.upsert) {                                             // 511
          // set `insertedId` if absent.  `insertedId` is a Meteor extension.                                         // 512
          if (options.insertedId) {                                                                                   // 513
            if (!(typeof options.insertedId === 'string'                                                              // 514
                  || options.insertedId instanceof Mongo.ObjectID))                                                   // 515
              throw new Error("insertedId must be string or ObjectID");                                               // 516
          } else if (! args[0]._id) {                                                                                 // 517
            options.insertedId = self._makeNewID();                                                                   // 518
          }                                                                                                           // 519
        }                                                                                                             // 520
      }                                                                                                               // 521
    }                                                                                                                 // 522
                                                                                                                      // 523
    // On inserts, always return the id that we generated; on all other                                               // 524
    // operations, just return the result from the collection.                                                        // 525
    var chooseReturnValueFromCollectionResult = function (result) {                                                   // 526
      if (name === "insert") {                                                                                        // 527
        if (!insertId && result) {                                                                                    // 528
          insertId = result;                                                                                          // 529
        }                                                                                                             // 530
        return insertId;                                                                                              // 531
      } else {                                                                                                        // 532
        return result;                                                                                                // 533
      }                                                                                                               // 534
    };                                                                                                                // 535
                                                                                                                      // 536
    var wrappedCallback;                                                                                              // 537
    if (callback) {                                                                                                   // 538
      wrappedCallback = function (error, result) {                                                                    // 539
        callback(error, ! error && chooseReturnValueFromCollectionResult(result));                                    // 540
      };                                                                                                              // 541
    }                                                                                                                 // 542
                                                                                                                      // 543
    // XXX see #MeteorServerNull                                                                                      // 544
    if (self._connection && self._connection !== Meteor.server) {                                                     // 545
      // just remote to another endpoint, propagate return value or                                                   // 546
      // exception.                                                                                                   // 547
                                                                                                                      // 548
      var enclosing = DDP._CurrentInvocation.get();                                                                   // 549
      var alreadyInSimulation = enclosing && enclosing.isSimulation;                                                  // 550
                                                                                                                      // 551
      if (Meteor.isClient && !wrappedCallback && ! alreadyInSimulation) {                                             // 552
        // Client can't block, so it can't report errors by exception,                                                // 553
        // only by callback. If they forget the callback, give them a                                                 // 554
        // default one that logs the error, so they aren't totally                                                    // 555
        // baffled if their writes don't work because their database is                                               // 556
        // down.                                                                                                      // 557
        // Don't give a default callback in simulation, because inside stubs we                                       // 558
        // want to return the results from the local collection immediately and                                       // 559
        // not force a callback.                                                                                      // 560
        wrappedCallback = function (err) {                                                                            // 561
          if (err)                                                                                                    // 562
            Meteor._debug(name + " failed: " + (err.reason || err.stack));                                            // 563
        };                                                                                                            // 564
      }                                                                                                               // 565
                                                                                                                      // 566
      if (!alreadyInSimulation && name !== "insert") {                                                                // 567
        // If we're about to actually send an RPC, we should throw an error if                                        // 568
        // this is a non-ID selector, because the mutation methods only allow                                         // 569
        // single-ID selectors. (If we don't throw here, we'll see flicker.)                                          // 570
        throwIfSelectorIsNotId(args[0], name);                                                                        // 571
      }                                                                                                               // 572
                                                                                                                      // 573
      ret = chooseReturnValueFromCollectionResult(                                                                    // 574
        self._connection.apply(self._prefix + name, args, {returnStubValue: true}, wrappedCallback)                   // 575
      );                                                                                                              // 576
                                                                                                                      // 577
    } else {                                                                                                          // 578
      // it's my collection.  descend into the collection object                                                      // 579
      // and propagate any exception.                                                                                 // 580
      args.push(wrappedCallback);                                                                                     // 581
      try {                                                                                                           // 582
        // If the user provided a callback and the collection implements this                                         // 583
        // operation asynchronously, then queryRet will be undefined, and the                                         // 584
        // result will be returned through the callback instead.                                                      // 585
        var queryRet = self._collection[name].apply(self._collection, args);                                          // 586
        ret = chooseReturnValueFromCollectionResult(queryRet);                                                        // 587
      } catch (e) {                                                                                                   // 588
        if (callback) {                                                                                               // 589
          callback(e);                                                                                                // 590
          return null;                                                                                                // 591
        }                                                                                                             // 592
        throw e;                                                                                                      // 593
      }                                                                                                               // 594
    }                                                                                                                 // 595
                                                                                                                      // 596
    // both sync and async, unless we threw an exception, return ret                                                  // 597
    // (new document ID for insert, num affected for update/remove, object with                                       // 598
    // numberAffected and maybe insertedId for upsert).                                                               // 599
    return ret;                                                                                                       // 600
  };                                                                                                                  // 601
});                                                                                                                   // 602
                                                                                                                      // 603
/**                                                                                                                   // 604
 * @summary Modify one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
 * @locus Anywhere                                                                                                    // 606
 * @param {MongoSelector} selector Specifies which documents to modify                                                // 607
 * @param {MongoModifier} modifier Specifies how to modify the documents                                              // 608
 * @param {Object} [options]                                                                                          // 609
 * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
 * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
 */                                                                                                                   // 612
Mongo.Collection.prototype.upsert = function (selector, modifier,                                                     // 613
                                               options, callback) {                                                   // 614
  var self = this;                                                                                                    // 615
  if (! callback && typeof options === "function") {                                                                  // 616
    callback = options;                                                                                               // 617
    options = {};                                                                                                     // 618
  }                                                                                                                   // 619
  return self.update(selector, modifier,                                                                              // 620
              _.extend({}, options, { _returnObject: true, upsert: true }),                                           // 621
              callback);                                                                                              // 622
};                                                                                                                    // 623
                                                                                                                      // 624
// We'll actually design an index API later. For now, we just pass through to                                         // 625
// Mongo's, but make it synchronous.                                                                                  // 626
Mongo.Collection.prototype._ensureIndex = function (index, options) {                                                 // 627
  var self = this;                                                                                                    // 628
  if (!self._collection._ensureIndex)                                                                                 // 629
    throw new Error("Can only call _ensureIndex on server collections");                                              // 630
  self._collection._ensureIndex(index, options);                                                                      // 631
};                                                                                                                    // 632
Mongo.Collection.prototype._dropIndex = function (index) {                                                            // 633
  var self = this;                                                                                                    // 634
  if (!self._collection._dropIndex)                                                                                   // 635
    throw new Error("Can only call _dropIndex on server collections");                                                // 636
  self._collection._dropIndex(index);                                                                                 // 637
};                                                                                                                    // 638
Mongo.Collection.prototype._dropCollection = function () {                                                            // 639
  var self = this;                                                                                                    // 640
  if (!self._collection.dropCollection)                                                                               // 641
    throw new Error("Can only call _dropCollection on server collections");                                           // 642
  self._collection.dropCollection();                                                                                  // 643
};                                                                                                                    // 644
Mongo.Collection.prototype._createCappedCollection = function (byteSize, maxDocuments) {                              // 645
  var self = this;                                                                                                    // 646
  if (!self._collection._createCappedCollection)                                                                      // 647
    throw new Error("Can only call _createCappedCollection on server collections");                                   // 648
  self._collection._createCappedCollection(byteSize, maxDocuments);                                                   // 649
};                                                                                                                    // 650
                                                                                                                      // 651
/**                                                                                                                   // 652
 * @summary Returns the [`Collection`](http://mongodb.github.io/node-mongodb-native/1.4/api-generated/collection.html) object corresponding to this collection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
 * @locus Server                                                                                                      // 654
 */                                                                                                                   // 655
Mongo.Collection.prototype.rawCollection = function () {                                                              // 656
  var self = this;                                                                                                    // 657
  if (! self._collection.rawCollection) {                                                                             // 658
    throw new Error("Can only call rawCollection on server collections");                                             // 659
  }                                                                                                                   // 660
  return self._collection.rawCollection();                                                                            // 661
};                                                                                                                    // 662
                                                                                                                      // 663
/**                                                                                                                   // 664
 * @summary Returns the [`Db`](http://mongodb.github.io/node-mongodb-native/1.4/api-generated/db.html) object corresponding to this collection's database connection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
 * @locus Server                                                                                                      // 666
 */                                                                                                                   // 667
Mongo.Collection.prototype.rawDatabase = function () {                                                                // 668
  var self = this;                                                                                                    // 669
  if (! (self._driver.mongo && self._driver.mongo.db)) {                                                              // 670
    throw new Error("Can only call rawDatabase on server collections");                                               // 671
  }                                                                                                                   // 672
  return self._driver.mongo.db;                                                                                       // 673
};                                                                                                                    // 674
                                                                                                                      // 675
                                                                                                                      // 676
/**                                                                                                                   // 677
 * @summary Create a Mongo-style `ObjectID`.  If you don't specify a `hexString`, the `ObjectID` will generated randomly (not using MongoDB's ID construction rules).
 * @locus Anywhere                                                                                                    // 679
 * @class                                                                                                             // 680
 * @param {String} [hexString] Optional.  The 24-character hexadecimal contents of the ObjectID to create             // 681
 */                                                                                                                   // 682
Mongo.ObjectID = MongoID.ObjectID;                                                                                    // 683
                                                                                                                      // 684
/**                                                                                                                   // 685
 * @summary To create a cursor, use find. To access the documents in a cursor, use forEach, map, or fetch.            // 686
 * @class                                                                                                             // 687
 * @instanceName cursor                                                                                               // 688
 */                                                                                                                   // 689
Mongo.Cursor = LocalCollection.Cursor;                                                                                // 690
                                                                                                                      // 691
/**                                                                                                                   // 692
 * @deprecated in 0.9.1                                                                                               // 693
 */                                                                                                                   // 694
Mongo.Collection.Cursor = Mongo.Cursor;                                                                               // 695
                                                                                                                      // 696
/**                                                                                                                   // 697
 * @deprecated in 0.9.1                                                                                               // 698
 */                                                                                                                   // 699
Mongo.Collection.ObjectID = Mongo.ObjectID;                                                                           // 700
                                                                                                                      // 701
///                                                                                                                   // 702
/// Remote methods and access control.                                                                                // 703
///                                                                                                                   // 704
                                                                                                                      // 705
// Restrict default mutators on collection. allow() and deny() take the                                               // 706
// same options:                                                                                                      // 707
//                                                                                                                    // 708
// options.insert {Function(userId, doc)}                                                                             // 709
//   return true to allow/deny adding this document                                                                   // 710
//                                                                                                                    // 711
// options.update {Function(userId, docs, fields, modifier)}                                                          // 712
//   return true to allow/deny updating these documents.                                                              // 713
//   `fields` is passed as an array of fields that are to be modified                                                 // 714
//                                                                                                                    // 715
// options.remove {Function(userId, docs)}                                                                            // 716
//   return true to allow/deny removing these documents                                                               // 717
//                                                                                                                    // 718
// options.fetch {Array}                                                                                              // 719
//   Fields to fetch for these validators. If any call to allow or deny                                               // 720
//   does not have this option then all fields are loaded.                                                            // 721
//                                                                                                                    // 722
// allow and deny can be called multiple times. The validators are                                                    // 723
// evaluated as follows:                                                                                              // 724
// - If neither deny() nor allow() has been called on the collection,                                                 // 725
//   then the request is allowed if and only if the "insecure" smart                                                  // 726
//   package is in use.                                                                                               // 727
// - Otherwise, if any deny() function returns true, the request is denied.                                           // 728
// - Otherwise, if any allow() function returns true, the request is allowed.                                         // 729
// - Otherwise, the request is denied.                                                                                // 730
//                                                                                                                    // 731
// Meteor may call your deny() and allow() functions in any order, and may not                                        // 732
// call all of them if it is able to make a decision without calling them all                                         // 733
// (so don't include side effects).                                                                                   // 734
                                                                                                                      // 735
(function () {                                                                                                        // 736
  var addValidator = function(allowOrDeny, options) {                                                                 // 737
    // validate keys                                                                                                  // 738
    var VALID_KEYS = ['insert', 'update', 'remove', 'fetch', 'transform'];                                            // 739
    _.each(_.keys(options), function (key) {                                                                          // 740
      if (!_.contains(VALID_KEYS, key))                                                                               // 741
        throw new Error(allowOrDeny + ": Invalid key: " + key);                                                       // 742
    });                                                                                                               // 743
                                                                                                                      // 744
    var self = this;                                                                                                  // 745
    self._restricted = true;                                                                                          // 746
                                                                                                                      // 747
    _.each(['insert', 'update', 'remove'], function (name) {                                                          // 748
      if (options[name]) {                                                                                            // 749
        if (!(options[name] instanceof Function)) {                                                                   // 750
          throw new Error(allowOrDeny + ": Value for `" + name + "` must be a function");                             // 751
        }                                                                                                             // 752
                                                                                                                      // 753
        // If the transform is specified at all (including as 'null') in this                                         // 754
        // call, then take that; otherwise, take the transform from the                                               // 755
        // collection.                                                                                                // 756
        if (options.transform === undefined) {                                                                        // 757
          options[name].transform = self._transform;  // already wrapped                                              // 758
        } else {                                                                                                      // 759
          options[name].transform = LocalCollection.wrapTransform(                                                    // 760
            options.transform);                                                                                       // 761
        }                                                                                                             // 762
                                                                                                                      // 763
        self._validators[name][allowOrDeny].push(options[name]);                                                      // 764
      }                                                                                                               // 765
    });                                                                                                               // 766
                                                                                                                      // 767
    // Only update the fetch fields if we're passed things that affect                                                // 768
    // fetching. This way allow({}) and allow({insert: f}) don't result in                                            // 769
    // setting fetchAllFields                                                                                         // 770
    if (options.update || options.remove || options.fetch) {                                                          // 771
      if (options.fetch && !(options.fetch instanceof Array)) {                                                       // 772
        throw new Error(allowOrDeny + ": Value for `fetch` must be an array");                                        // 773
      }                                                                                                               // 774
      self._updateFetch(options.fetch);                                                                               // 775
    }                                                                                                                 // 776
  };                                                                                                                  // 777
                                                                                                                      // 778
  /**                                                                                                                 // 779
   * @summary Allow users to write directly to this collection from client code, subject to limitations you define.   // 780
   * @locus Server                                                                                                    // 781
   * @param {Object} options                                                                                          // 782
   * @param {Function} options.insert,update,remove Functions that look at a proposed modification to the database and return true if it should be allowed.
   * @param {String[]} options.fetch Optional performance enhancement. Limits the fields that will be fetched from the database for inspection by your `update` and `remove` functions.
   * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections).  Pass `null` to disable transformation.
   */                                                                                                                 // 786
  Mongo.Collection.prototype.allow = function(options) {                                                              // 787
    addValidator.call(this, 'allow', options);                                                                        // 788
  };                                                                                                                  // 789
                                                                                                                      // 790
  /**                                                                                                                 // 791
   * @summary Override `allow` rules.                                                                                 // 792
   * @locus Server                                                                                                    // 793
   * @param {Object} options                                                                                          // 794
   * @param {Function} options.insert,update,remove Functions that look at a proposed modification to the database and return true if it should be denied, even if an [allow](#allow) rule says otherwise.
   * @param {String[]} options.fetch Optional performance enhancement. Limits the fields that will be fetched from the database for inspection by your `update` and `remove` functions.
   * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections).  Pass `null` to disable transformation.
   */                                                                                                                 // 798
  Mongo.Collection.prototype.deny = function(options) {                                                               // 799
    addValidator.call(this, 'deny', options);                                                                         // 800
  };                                                                                                                  // 801
})();                                                                                                                 // 802
                                                                                                                      // 803
                                                                                                                      // 804
Mongo.Collection.prototype._defineMutationMethods = function() {                                                      // 805
  var self = this;                                                                                                    // 806
                                                                                                                      // 807
  // set to true once we call any allow or deny methods. If true, use                                                 // 808
  // allow/deny semantics. If false, use insecure mode semantics.                                                     // 809
  self._restricted = false;                                                                                           // 810
                                                                                                                      // 811
  // Insecure mode (default to allowing writes). Defaults to 'undefined' which                                        // 812
  // means insecure iff the insecure package is loaded. This property can be                                          // 813
  // overriden by tests or packages wishing to change insecure mode behavior of                                       // 814
  // their collections.                                                                                               // 815
  self._insecure = undefined;                                                                                         // 816
                                                                                                                      // 817
  self._validators = {                                                                                                // 818
    insert: {allow: [], deny: []},                                                                                    // 819
    update: {allow: [], deny: []},                                                                                    // 820
    remove: {allow: [], deny: []},                                                                                    // 821
    upsert: {allow: [], deny: []}, // dummy arrays; can't set these!                                                  // 822
    fetch: [],                                                                                                        // 823
    fetchAllFields: false                                                                                             // 824
  };                                                                                                                  // 825
                                                                                                                      // 826
  if (!self._name)                                                                                                    // 827
    return; // anonymous collection                                                                                   // 828
                                                                                                                      // 829
  // XXX Think about method namespacing. Maybe methods should be                                                      // 830
  // "Meteor:Mongo:insert/NAME"?                                                                                      // 831
  self._prefix = '/' + self._name + '/';                                                                              // 832
                                                                                                                      // 833
  // mutation methods                                                                                                 // 834
  if (self._connection) {                                                                                             // 835
    var m = {};                                                                                                       // 836
                                                                                                                      // 837
    _.each(['insert', 'update', 'remove'], function (method) {                                                        // 838
      m[self._prefix + method] = function (/* ... */) {                                                               // 839
        // All the methods do their own validation, instead of using check().                                         // 840
        check(arguments, [Match.Any]);                                                                                // 841
        var args = _.toArray(arguments);                                                                              // 842
        try {                                                                                                         // 843
          // For an insert, if the client didn't specify an _id, generate one                                         // 844
          // now; because this uses DDP.randomStream, it will be consistent with                                      // 845
          // what the client generated. We generate it now rather than later so                                       // 846
          // that if (eg) an allow/deny rule does an insert to the same                                               // 847
          // collection (not that it really should), the generated _id will                                           // 848
          // still be the first use of the stream and will be consistent.                                             // 849
          //                                                                                                          // 850
          // However, we don't actually stick the _id onto the document yet,                                          // 851
          // because we want allow/deny rules to be able to differentiate                                             // 852
          // between arbitrary client-specified _id fields and merely                                                 // 853
          // client-controlled-via-randomSeed fields.                                                                 // 854
          var generatedId = null;                                                                                     // 855
          if (method === "insert" && !_.has(args[0], '_id')) {                                                        // 856
            generatedId = self._makeNewID();                                                                          // 857
          }                                                                                                           // 858
                                                                                                                      // 859
          if (this.isSimulation) {                                                                                    // 860
            // In a client simulation, you can do any mutation (even with a                                           // 861
            // complex selector).                                                                                     // 862
            if (generatedId !== null)                                                                                 // 863
              args[0]._id = generatedId;                                                                              // 864
            return self._collection[method].apply(                                                                    // 865
              self._collection, args);                                                                                // 866
          }                                                                                                           // 867
                                                                                                                      // 868
          // This is the server receiving a method call from the client.                                              // 869
                                                                                                                      // 870
          // We don't allow arbitrary selectors in mutations from the client: only                                    // 871
          // single-ID selectors.                                                                                     // 872
          if (method !== 'insert')                                                                                    // 873
            throwIfSelectorIsNotId(args[0], method);                                                                  // 874
                                                                                                                      // 875
          if (self._restricted) {                                                                                     // 876
            // short circuit if there is no way it will pass.                                                         // 877
            if (self._validators[method].allow.length === 0) {                                                        // 878
              throw new Meteor.Error(                                                                                 // 879
                403, "Access denied. No allow validators set on restricted " +                                        // 880
                  "collection for method '" + method + "'.");                                                         // 881
            }                                                                                                         // 882
                                                                                                                      // 883
            var validatedMethodName =                                                                                 // 884
                  '_validated' + method.charAt(0).toUpperCase() + method.slice(1);                                    // 885
            args.unshift(this.userId);                                                                                // 886
            method === 'insert' && args.push(generatedId);                                                            // 887
            return self[validatedMethodName].apply(self, args);                                                       // 888
          } else if (self._isInsecure()) {                                                                            // 889
            if (generatedId !== null)                                                                                 // 890
              args[0]._id = generatedId;                                                                              // 891
            // In insecure mode, allow any mutation (with a simple selector).                                         // 892
            // XXX This is kind of bogus.  Instead of blindly passing whatever                                        // 893
            //     we get from the network to this function, we should actually                                       // 894
            //     know the correct arguments for the function and pass just                                          // 895
            //     them.  For example, if you have an extraneous extra null                                           // 896
            //     argument and this is Mongo on the server, the .wrapAsync'd                                         // 897
            //     functions like update will get confused and pass the                                               // 898
            //     "fut.resolver()" in the wrong slot, where _update will never                                       // 899
            //     invoke it. Bam, broken DDP connection.  Probably should just                                       // 900
            //     take this whole method and write it three times, invoking                                          // 901
            //     helpers for the common code.                                                                       // 902
            return self._collection[method].apply(self._collection, args);                                            // 903
          } else {                                                                                                    // 904
            // In secure mode, if we haven't called allow or deny, then nothing                                       // 905
            // is permitted.                                                                                          // 906
            throw new Meteor.Error(403, "Access denied");                                                             // 907
          }                                                                                                           // 908
        } catch (e) {                                                                                                 // 909
          if (e.name === 'MongoError' || e.name === 'MinimongoError') {                                               // 910
            throw new Meteor.Error(409, e.toString());                                                                // 911
          } else {                                                                                                    // 912
            throw e;                                                                                                  // 913
          }                                                                                                           // 914
        }                                                                                                             // 915
      };                                                                                                              // 916
    });                                                                                                               // 917
    // Minimongo on the server gets no stubs; instead, by default                                                     // 918
    // it wait()s until its result is ready, yielding.                                                                // 919
    // This matches the behavior of macromongo on the server better.                                                  // 920
    // XXX see #MeteorServerNull                                                                                      // 921
    if (Meteor.isClient || self._connection === Meteor.server)                                                        // 922
      self._connection.methods(m);                                                                                    // 923
  }                                                                                                                   // 924
};                                                                                                                    // 925
                                                                                                                      // 926
                                                                                                                      // 927
Mongo.Collection.prototype._updateFetch = function (fields) {                                                         // 928
  var self = this;                                                                                                    // 929
                                                                                                                      // 930
  if (!self._validators.fetchAllFields) {                                                                             // 931
    if (fields) {                                                                                                     // 932
      self._validators.fetch = _.union(self._validators.fetch, fields);                                               // 933
    } else {                                                                                                          // 934
      self._validators.fetchAllFields = true;                                                                         // 935
      // clear fetch just to make sure we don't accidentally read it                                                  // 936
      self._validators.fetch = null;                                                                                  // 937
    }                                                                                                                 // 938
  }                                                                                                                   // 939
};                                                                                                                    // 940
                                                                                                                      // 941
Mongo.Collection.prototype._isInsecure = function () {                                                                // 942
  var self = this;                                                                                                    // 943
  if (self._insecure === undefined)                                                                                   // 944
    return !!Package.insecure;                                                                                        // 945
  return self._insecure;                                                                                              // 946
};                                                                                                                    // 947
                                                                                                                      // 948
var docToValidate = function (validator, doc, generatedId) {                                                          // 949
  var ret = doc;                                                                                                      // 950
  if (validator.transform) {                                                                                          // 951
    ret = EJSON.clone(doc);                                                                                           // 952
    // If you set a server-side transform on your collection, then you don't get                                      // 953
    // to tell the difference between "client specified the ID" and "server                                           // 954
    // generated the ID", because transforms expect to get _id.  If you want to                                       // 955
    // do that check, you can do it with a specific                                                                   // 956
    // `C.allow({insert: f, transform: null})` validator.                                                             // 957
    if (generatedId !== null) {                                                                                       // 958
      ret._id = generatedId;                                                                                          // 959
    }                                                                                                                 // 960
    ret = validator.transform(ret);                                                                                   // 961
  }                                                                                                                   // 962
  return ret;                                                                                                         // 963
};                                                                                                                    // 964
                                                                                                                      // 965
Mongo.Collection.prototype._validatedInsert = function (userId, doc,                                                  // 966
                                                         generatedId) {                                               // 967
  var self = this;                                                                                                    // 968
                                                                                                                      // 969
  // call user validators.                                                                                            // 970
  // Any deny returns true means denied.                                                                              // 971
  if (_.any(self._validators.insert.deny, function(validator) {                                                       // 972
    return validator(userId, docToValidate(validator, doc, generatedId));                                             // 973
  })) {                                                                                                               // 974
    throw new Meteor.Error(403, "Access denied");                                                                     // 975
  }                                                                                                                   // 976
  // Any allow returns true means proceed. Throw error if they all fail.                                              // 977
  if (_.all(self._validators.insert.allow, function(validator) {                                                      // 978
    return !validator(userId, docToValidate(validator, doc, generatedId));                                            // 979
  })) {                                                                                                               // 980
    throw new Meteor.Error(403, "Access denied");                                                                     // 981
  }                                                                                                                   // 982
                                                                                                                      // 983
  // If we generated an ID above, insert it now: after the validation, but                                            // 984
  // before actually inserting.                                                                                       // 985
  if (generatedId !== null)                                                                                           // 986
    doc._id = generatedId;                                                                                            // 987
                                                                                                                      // 988
  self._collection.insert.call(self._collection, doc);                                                                // 989
};                                                                                                                    // 990
                                                                                                                      // 991
var transformDoc = function (validator, doc) {                                                                        // 992
  if (validator.transform)                                                                                            // 993
    return validator.transform(doc);                                                                                  // 994
  return doc;                                                                                                         // 995
};                                                                                                                    // 996
                                                                                                                      // 997
// Simulate a mongo `update` operation while validating that the access                                               // 998
// control rules set by calls to `allow/deny` are satisfied. If all                                                   // 999
// pass, rewrite the mongo operation to use $in to set the list of                                                    // 1000
// document ids to change ##ValidatedChange                                                                           // 1001
Mongo.Collection.prototype._validatedUpdate = function(                                                               // 1002
    userId, selector, mutator, options) {                                                                             // 1003
  var self = this;                                                                                                    // 1004
                                                                                                                      // 1005
  check(mutator, Object);                                                                                             // 1006
                                                                                                                      // 1007
  options = _.clone(options) || {};                                                                                   // 1008
                                                                                                                      // 1009
  if (!LocalCollection._selectorIsIdPerhapsAsObject(selector))                                                        // 1010
    throw new Error("validated update should be of a single ID");                                                     // 1011
                                                                                                                      // 1012
  // We don't support upserts because they don't fit nicely into allow/deny                                           // 1013
  // rules.                                                                                                           // 1014
  if (options.upsert)                                                                                                 // 1015
    throw new Meteor.Error(403, "Access denied. Upserts not " +                                                       // 1016
                           "allowed in a restricted collection.");                                                    // 1017
                                                                                                                      // 1018
  var noReplaceError = "Access denied. In a restricted collection you can only" +                                     // 1019
        " update documents, not replace them. Use a Mongo update operator, such " +                                   // 1020
        "as '$set'.";                                                                                                 // 1021
                                                                                                                      // 1022
  // compute modified fields                                                                                          // 1023
  var fields = [];                                                                                                    // 1024
  if (_.isEmpty(mutator)) {                                                                                           // 1025
    throw new Meteor.Error(403, noReplaceError);                                                                      // 1026
  }                                                                                                                   // 1027
  _.each(mutator, function (params, op) {                                                                             // 1028
    if (op.charAt(0) !== '$') {                                                                                       // 1029
      throw new Meteor.Error(403, noReplaceError);                                                                    // 1030
    } else if (!_.has(ALLOWED_UPDATE_OPERATIONS, op)) {                                                               // 1031
      throw new Meteor.Error(                                                                                         // 1032
        403, "Access denied. Operator " + op + " not allowed in a restricted collection.");                           // 1033
    } else {                                                                                                          // 1034
      _.each(_.keys(params), function (field) {                                                                       // 1035
        // treat dotted fields as if they are replacing their                                                         // 1036
        // top-level part                                                                                             // 1037
        if (field.indexOf('.') !== -1)                                                                                // 1038
          field = field.substring(0, field.indexOf('.'));                                                             // 1039
                                                                                                                      // 1040
        // record the field we are trying to change                                                                   // 1041
        if (!_.contains(fields, field))                                                                               // 1042
          fields.push(field);                                                                                         // 1043
      });                                                                                                             // 1044
    }                                                                                                                 // 1045
  });                                                                                                                 // 1046
                                                                                                                      // 1047
  var findOptions = {transform: null};                                                                                // 1048
  if (!self._validators.fetchAllFields) {                                                                             // 1049
    findOptions.fields = {};                                                                                          // 1050
    _.each(self._validators.fetch, function(fieldName) {                                                              // 1051
      findOptions.fields[fieldName] = 1;                                                                              // 1052
    });                                                                                                               // 1053
  }                                                                                                                   // 1054
                                                                                                                      // 1055
  var doc = self._collection.findOne(selector, findOptions);                                                          // 1056
  if (!doc)  // none satisfied!                                                                                       // 1057
    return 0;                                                                                                         // 1058
                                                                                                                      // 1059
  // call user validators.                                                                                            // 1060
  // Any deny returns true means denied.                                                                              // 1061
  if (_.any(self._validators.update.deny, function(validator) {                                                       // 1062
    var factoriedDoc = transformDoc(validator, doc);                                                                  // 1063
    return validator(userId,                                                                                          // 1064
                     factoriedDoc,                                                                                    // 1065
                     fields,                                                                                          // 1066
                     mutator);                                                                                        // 1067
  })) {                                                                                                               // 1068
    throw new Meteor.Error(403, "Access denied");                                                                     // 1069
  }                                                                                                                   // 1070
  // Any allow returns true means proceed. Throw error if they all fail.                                              // 1071
  if (_.all(self._validators.update.allow, function(validator) {                                                      // 1072
    var factoriedDoc = transformDoc(validator, doc);                                                                  // 1073
    return !validator(userId,                                                                                         // 1074
                      factoriedDoc,                                                                                   // 1075
                      fields,                                                                                         // 1076
                      mutator);                                                                                       // 1077
  })) {                                                                                                               // 1078
    throw new Meteor.Error(403, "Access denied");                                                                     // 1079
  }                                                                                                                   // 1080
                                                                                                                      // 1081
  options._forbidReplace = true;                                                                                      // 1082
                                                                                                                      // 1083
  // Back when we supported arbitrary client-provided selectors, we actually                                          // 1084
  // rewrote the selector to include an _id clause before passing to Mongo to                                         // 1085
  // avoid races, but since selector is guaranteed to already just be an ID, we                                       // 1086
  // don't have to any more.                                                                                          // 1087
                                                                                                                      // 1088
  return self._collection.update.call(                                                                                // 1089
    self._collection, selector, mutator, options);                                                                    // 1090
};                                                                                                                    // 1091
                                                                                                                      // 1092
// Only allow these operations in validated updates. Specifically                                                     // 1093
// whitelist operations, rather than blacklist, so new complex                                                        // 1094
// operations that are added aren't automatically allowed. A complex                                                  // 1095
// operation is one that does more than just modify its target                                                        // 1096
// field. For now this contains all update operations except '$rename'.                                               // 1097
// http://docs.mongodb.org/manual/reference/operators/#update                                                         // 1098
var ALLOWED_UPDATE_OPERATIONS = {                                                                                     // 1099
  $inc:1, $set:1, $unset:1, $addToSet:1, $pop:1, $pullAll:1, $pull:1,                                                 // 1100
  $pushAll:1, $push:1, $bit:1                                                                                         // 1101
};                                                                                                                    // 1102
                                                                                                                      // 1103
// Simulate a mongo `remove` operation while validating access control                                                // 1104
// rules. See #ValidatedChange                                                                                        // 1105
Mongo.Collection.prototype._validatedRemove = function(userId, selector) {                                            // 1106
  var self = this;                                                                                                    // 1107
                                                                                                                      // 1108
  var findOptions = {transform: null};                                                                                // 1109
  if (!self._validators.fetchAllFields) {                                                                             // 1110
    findOptions.fields = {};                                                                                          // 1111
    _.each(self._validators.fetch, function(fieldName) {                                                              // 1112
      findOptions.fields[fieldName] = 1;                                                                              // 1113
    });                                                                                                               // 1114
  }                                                                                                                   // 1115
                                                                                                                      // 1116
  var doc = self._collection.findOne(selector, findOptions);                                                          // 1117
  if (!doc)                                                                                                           // 1118
    return 0;                                                                                                         // 1119
                                                                                                                      // 1120
  // call user validators.                                                                                            // 1121
  // Any deny returns true means denied.                                                                              // 1122
  if (_.any(self._validators.remove.deny, function(validator) {                                                       // 1123
    return validator(userId, transformDoc(validator, doc));                                                           // 1124
  })) {                                                                                                               // 1125
    throw new Meteor.Error(403, "Access denied");                                                                     // 1126
  }                                                                                                                   // 1127
  // Any allow returns true means proceed. Throw error if they all fail.                                              // 1128
  if (_.all(self._validators.remove.allow, function(validator) {                                                      // 1129
    return !validator(userId, transformDoc(validator, doc));                                                          // 1130
  })) {                                                                                                               // 1131
    throw new Meteor.Error(403, "Access denied");                                                                     // 1132
  }                                                                                                                   // 1133
                                                                                                                      // 1134
  // Back when we supported arbitrary client-provided selectors, we actually                                          // 1135
  // rewrote the selector to {_id: {$in: [ids that we found]}} before passing to                                      // 1136
  // Mongo to avoid races, but since selector is guaranteed to already just be                                        // 1137
  // an ID, we don't have to any more.                                                                                // 1138
                                                                                                                      // 1139
  return self._collection.remove.call(self._collection, selector);                                                    // 1140
};                                                                                                                    // 1141
                                                                                                                      // 1142
/**                                                                                                                   // 1143
 * @deprecated in 0.9.1                                                                                               // 1144
 */                                                                                                                   // 1145
Meteor.Collection = Mongo.Collection;                                                                                 // 1146
                                                                                                                      // 1147
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 4554
}).call(this);                                                                                                        // 4555
                                                                                                                      // 4556
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.mongo = {
  MongoInternals: MongoInternals,
  MongoTest: MongoTest,
  Mongo: Mongo
};

})();

//# sourceMappingURL=mongo.js.map
