(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Retry = Package.retry.Retry;

/* Package-scope variables */
var DDPCommon;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/ddp-common/packages/ddp-common.js                                                               //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
(function(){                                                                                                // 1
                                                                                                            // 2
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                   //     // 4
// packages/ddp-common/namespace.js                                                                  //     // 5
//                                                                                                   //     // 6
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                     //     // 8
/**                                                                                                  // 1   // 9
 * @namespace DDPCommon                                                                              // 2   // 10
 * @summary Namespace for DDPCommon-related methods/classes. Shared between                          // 3   // 11
 * `ddp-client` and `ddp-server`, where the ddp-client is the implementation                         // 4   // 12
 * of a ddp client for both client AND server; and the ddp server is the                             // 5   // 13
 * implementation of the livedata server and stream server. Common                                   // 6   // 14
 * functionality shared between both can be shared under this namespace                              // 7   // 15
 */                                                                                                  // 8   // 16
DDPCommon = {};                                                                                      // 9   // 17
                                                                                                     // 10  // 18
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 19
                                                                                                            // 20
}).call(this);                                                                                              // 21
                                                                                                            // 22
                                                                                                            // 23
                                                                                                            // 24
                                                                                                            // 25
                                                                                                            // 26
                                                                                                            // 27
(function(){                                                                                                // 28
                                                                                                            // 29
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 30
//                                                                                                   //     // 31
// packages/ddp-common/heartbeat.js                                                                  //     // 32
//                                                                                                   //     // 33
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 34
                                                                                                     //     // 35
// Heartbeat options:                                                                                // 1   // 36
//   heartbeatInterval: interval to send pings, in milliseconds.                                     // 2   // 37
//   heartbeatTimeout: timeout to close the connection if a reply isn't                              // 3   // 38
//     received, in milliseconds.                                                                    // 4   // 39
//   sendPing: function to call to send a ping on the connection.                                    // 5   // 40
//   onTimeout: function to call to close the connection.                                            // 6   // 41
                                                                                                     // 7   // 42
DDPCommon.Heartbeat = function (options) {                                                           // 8   // 43
  var self = this;                                                                                   // 9   // 44
                                                                                                     // 10  // 45
  self.heartbeatInterval = options.heartbeatInterval;                                                // 11  // 46
  self.heartbeatTimeout = options.heartbeatTimeout;                                                  // 12  // 47
  self._sendPing = options.sendPing;                                                                 // 13  // 48
  self._onTimeout = options.onTimeout;                                                               // 14  // 49
  self._seenPacket = false;                                                                          // 15  // 50
                                                                                                     // 16  // 51
  self._heartbeatIntervalHandle = null;                                                              // 17  // 52
  self._heartbeatTimeoutHandle = null;                                                               // 18  // 53
};                                                                                                   // 19  // 54
                                                                                                     // 20  // 55
_.extend(DDPCommon.Heartbeat.prototype, {                                                            // 21  // 56
  stop: function () {                                                                                // 22  // 57
    var self = this;                                                                                 // 23  // 58
    self._clearHeartbeatIntervalTimer();                                                             // 24  // 59
    self._clearHeartbeatTimeoutTimer();                                                              // 25  // 60
  },                                                                                                 // 26  // 61
                                                                                                     // 27  // 62
  start: function () {                                                                               // 28  // 63
    var self = this;                                                                                 // 29  // 64
    self.stop();                                                                                     // 30  // 65
    self._startHeartbeatIntervalTimer();                                                             // 31  // 66
  },                                                                                                 // 32  // 67
                                                                                                     // 33  // 68
  _startHeartbeatIntervalTimer: function () {                                                        // 34  // 69
    var self = this;                                                                                 // 35  // 70
    self._heartbeatIntervalHandle = Meteor.setInterval(                                              // 36  // 71
      _.bind(self._heartbeatIntervalFired, self),                                                    // 37  // 72
      self.heartbeatInterval                                                                         // 38  // 73
    );                                                                                               // 39  // 74
  },                                                                                                 // 40  // 75
                                                                                                     // 41  // 76
  _startHeartbeatTimeoutTimer: function () {                                                         // 42  // 77
    var self = this;                                                                                 // 43  // 78
    self._heartbeatTimeoutHandle = Meteor.setTimeout(                                                // 44  // 79
      _.bind(self._heartbeatTimeoutFired, self),                                                     // 45  // 80
      self.heartbeatTimeout                                                                          // 46  // 81
    );                                                                                               // 47  // 82
  },                                                                                                 // 48  // 83
                                                                                                     // 49  // 84
  _clearHeartbeatIntervalTimer: function () {                                                        // 50  // 85
    var self = this;                                                                                 // 51  // 86
    if (self._heartbeatIntervalHandle) {                                                             // 52  // 87
      Meteor.clearInterval(self._heartbeatIntervalHandle);                                           // 53  // 88
      self._heartbeatIntervalHandle = null;                                                          // 54  // 89
    }                                                                                                // 55  // 90
  },                                                                                                 // 56  // 91
                                                                                                     // 57  // 92
  _clearHeartbeatTimeoutTimer: function () {                                                         // 58  // 93
    var self = this;                                                                                 // 59  // 94
    if (self._heartbeatTimeoutHandle) {                                                              // 60  // 95
      Meteor.clearTimeout(self._heartbeatTimeoutHandle);                                             // 61  // 96
      self._heartbeatTimeoutHandle = null;                                                           // 62  // 97
    }                                                                                                // 63  // 98
  },                                                                                                 // 64  // 99
                                                                                                     // 65  // 100
  // The heartbeat interval timer is fired when we should send a ping.                               // 66  // 101
  _heartbeatIntervalFired: function () {                                                             // 67  // 102
    var self = this;                                                                                 // 68  // 103
    // don't send ping if we've seen a packet since we last checked,                                 // 69  // 104
    // *or* if we have already sent a ping and are awaiting a timeout.                               // 70  // 105
    // That shouldn't happen, but it's possible if                                                   // 71  // 106
    // `self.heartbeatInterval` is smaller than                                                      // 72  // 107
    // `self.heartbeatTimeout`.                                                                      // 73  // 108
    if (! self._seenPacket && ! self._heartbeatTimeoutHandle) {                                      // 74  // 109
      self._sendPing();                                                                              // 75  // 110
      // Set up timeout, in case a pong doesn't arrive in time.                                      // 76  // 111
      self._startHeartbeatTimeoutTimer();                                                            // 77  // 112
    }                                                                                                // 78  // 113
    self._seenPacket = false;                                                                        // 79  // 114
  },                                                                                                 // 80  // 115
                                                                                                     // 81  // 116
  // The heartbeat timeout timer is fired when we sent a ping, but we                                // 82  // 117
  // timed out waiting for the pong.                                                                 // 83  // 118
  _heartbeatTimeoutFired: function () {                                                              // 84  // 119
    var self = this;                                                                                 // 85  // 120
    self._heartbeatTimeoutHandle = null;                                                             // 86  // 121
    self._onTimeout();                                                                               // 87  // 122
  },                                                                                                 // 88  // 123
                                                                                                     // 89  // 124
  messageReceived: function () {                                                                     // 90  // 125
    var self = this;                                                                                 // 91  // 126
    // Tell periodic checkin that we have seen a packet, and thus it                                 // 92  // 127
    // does not need to send a ping this cycle.                                                      // 93  // 128
    self._seenPacket = true;                                                                         // 94  // 129
    // If we were waiting for a pong, we got it.                                                     // 95  // 130
    if (self._heartbeatTimeoutHandle) {                                                              // 96  // 131
      self._clearHeartbeatTimeoutTimer();                                                            // 97  // 132
    }                                                                                                // 98  // 133
  }                                                                                                  // 99  // 134
});                                                                                                  // 100
                                                                                                     // 101
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 137
                                                                                                            // 138
}).call(this);                                                                                              // 139
                                                                                                            // 140
                                                                                                            // 141
                                                                                                            // 142
                                                                                                            // 143
                                                                                                            // 144
                                                                                                            // 145
(function(){                                                                                                // 146
                                                                                                            // 147
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 148
//                                                                                                   //     // 149
// packages/ddp-common/utils.js                                                                      //     // 150
//                                                                                                   //     // 151
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 152
                                                                                                     //     // 153
DDPCommon.SUPPORTED_DDP_VERSIONS = [ '1', 'pre2', 'pre1' ];                                          // 1   // 154
                                                                                                     // 2   // 155
DDPCommon.parseDDP = function (stringMessage) {                                                      // 3   // 156
  try {                                                                                              // 4   // 157
    var msg = JSON.parse(stringMessage);                                                             // 5   // 158
  } catch (e) {                                                                                      // 6   // 159
    Meteor._debug("Discarding message with invalid JSON", stringMessage);                            // 7   // 160
    return null;                                                                                     // 8   // 161
  }                                                                                                  // 9   // 162
  // DDP messages must be objects.                                                                   // 10  // 163
  if (msg === null || typeof msg !== 'object') {                                                     // 11  // 164
    Meteor._debug("Discarding non-object DDP message", stringMessage);                               // 12  // 165
    return null;                                                                                     // 13  // 166
  }                                                                                                  // 14  // 167
                                                                                                     // 15  // 168
  // massage msg to get it into "abstract ddp" rather than "wire ddp" format.                        // 16  // 169
                                                                                                     // 17  // 170
  // switch between "cleared" rep of unsetting fields and "undefined"                                // 18  // 171
  // rep of same                                                                                     // 19  // 172
  if (_.has(msg, 'cleared')) {                                                                       // 20  // 173
    if (!_.has(msg, 'fields'))                                                                       // 21  // 174
      msg.fields = {};                                                                               // 22  // 175
    _.each(msg.cleared, function (clearKey) {                                                        // 23  // 176
      msg.fields[clearKey] = undefined;                                                              // 24  // 177
    });                                                                                              // 25  // 178
    delete msg.cleared;                                                                              // 26  // 179
  }                                                                                                  // 27  // 180
                                                                                                     // 28  // 181
  _.each(['fields', 'params', 'result'], function (field) {                                          // 29  // 182
    if (_.has(msg, field))                                                                           // 30  // 183
      msg[field] = EJSON._adjustTypesFromJSONValue(msg[field]);                                      // 31  // 184
  });                                                                                                // 32  // 185
                                                                                                     // 33  // 186
  return msg;                                                                                        // 34  // 187
};                                                                                                   // 35  // 188
                                                                                                     // 36  // 189
DDPCommon.stringifyDDP = function (msg) {                                                            // 37  // 190
  var copy = EJSON.clone(msg);                                                                       // 38  // 191
  // swizzle 'changed' messages from 'fields undefined' rep to 'fields                               // 39  // 192
  // and cleared' rep                                                                                // 40  // 193
  if (_.has(msg, 'fields')) {                                                                        // 41  // 194
    var cleared = [];                                                                                // 42  // 195
    _.each(msg.fields, function (value, key) {                                                       // 43  // 196
      if (value === undefined) {                                                                     // 44  // 197
        cleared.push(key);                                                                           // 45  // 198
        delete copy.fields[key];                                                                     // 46  // 199
      }                                                                                              // 47  // 200
    });                                                                                              // 48  // 201
    if (!_.isEmpty(cleared))                                                                         // 49  // 202
      copy.cleared = cleared;                                                                        // 50  // 203
    if (_.isEmpty(copy.fields))                                                                      // 51  // 204
      delete copy.fields;                                                                            // 52  // 205
  }                                                                                                  // 53  // 206
  // adjust types to basic                                                                           // 54  // 207
  _.each(['fields', 'params', 'result'], function (field) {                                          // 55  // 208
    if (_.has(copy, field))                                                                          // 56  // 209
      copy[field] = EJSON._adjustTypesToJSONValue(copy[field]);                                      // 57  // 210
  });                                                                                                // 58  // 211
  if (msg.id && typeof msg.id !== 'string') {                                                        // 59  // 212
    throw new Error("Message id is not a string");                                                   // 60  // 213
  }                                                                                                  // 61  // 214
  return JSON.stringify(copy);                                                                       // 62  // 215
};                                                                                                   // 63  // 216
                                                                                                     // 64  // 217
                                                                                                     // 65  // 218
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 219
                                                                                                            // 220
}).call(this);                                                                                              // 221
                                                                                                            // 222
                                                                                                            // 223
                                                                                                            // 224
                                                                                                            // 225
                                                                                                            // 226
                                                                                                            // 227
(function(){                                                                                                // 228
                                                                                                            // 229
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 230
//                                                                                                   //     // 231
// packages/ddp-common/method_invocation.js                                                          //     // 232
//                                                                                                   //     // 233
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 234
                                                                                                     //     // 235
// Instance name is this because it is usually referred to as this inside a                          // 1   // 236
// method definition                                                                                 // 2   // 237
/**                                                                                                  // 3   // 238
 * @summary The state for a single invocation of a method, referenced by this                        // 4   // 239
 * inside a method definition.                                                                       // 5   // 240
 * @param {Object} options                                                                           // 6   // 241
 * @instanceName this                                                                                // 7   // 242
 */                                                                                                  // 8   // 243
DDPCommon.MethodInvocation = function (options) {                                                    // 9   // 244
  var self = this;                                                                                   // 10  // 245
                                                                                                     // 11  // 246
  // true if we're running not the actual method, but a stub (that is,                               // 12  // 247
  // if we're on a client (which may be a browser, or in the future a                                // 13  // 248
  // server connecting to another server) and presently running a                                    // 14  // 249
  // simulation of a server-side method for latency compensation                                     // 15  // 250
  // purposes). not currently true except in a client such as a browser,                             // 16  // 251
  // since there's usually no point in running stubs unless you have a                               // 17  // 252
  // zero-latency connection to the user.                                                            // 18  // 253
                                                                                                     // 19  // 254
  /**                                                                                                // 20  // 255
   * @summary Access inside a method invocation.  Boolean value, true if this invocation is a stub.  // 21  // 256
   * @locus Anywhere                                                                                 // 22  // 257
   * @name  isSimulation                                                                             // 23  // 258
   * @memberOf DDPCommon.MethodInvocation                                                            // 24  // 259
   * @instance                                                                                       // 25  // 260
   * @type {Boolean}                                                                                 // 26  // 261
   */                                                                                                // 27  // 262
  this.isSimulation = options.isSimulation;                                                          // 28  // 263
                                                                                                     // 29  // 264
  // call this function to allow other method invocations (from the                                  // 30  // 265
  // same client) to continue running without waiting for this one to                                // 31  // 266
  // complete.                                                                                       // 32  // 267
  this._unblock = options.unblock || function () {};                                                 // 33  // 268
  this._calledUnblock = false;                                                                       // 34  // 269
                                                                                                     // 35  // 270
  // current user id                                                                                 // 36  // 271
                                                                                                     // 37  // 272
  /**                                                                                                // 38  // 273
   * @summary The id of the user that made this method call, or `null` if no user was logged in.     // 39  // 274
   * @locus Anywhere                                                                                 // 40  // 275
   * @name  userId                                                                                   // 41  // 276
   * @memberOf DDPCommon.MethodInvocation                                                            // 42  // 277
   * @instance                                                                                       // 43  // 278
   */                                                                                                // 44  // 279
  this.userId = options.userId;                                                                      // 45  // 280
                                                                                                     // 46  // 281
  // sets current user id in all appropriate server contexts and                                     // 47  // 282
  // reruns subscriptions                                                                            // 48  // 283
  this._setUserId = options.setUserId || function () {};                                             // 49  // 284
                                                                                                     // 50  // 285
  // On the server, the connection this method call came in on.                                      // 51  // 286
                                                                                                     // 52  // 287
  /**                                                                                                // 53  // 288
   * @summary Access inside a method invocation. The [connection](#meteor_onconnection) that this method was received on. `null` if the method is not associated with a connection, eg. a server initiated method call.
   * @locus Server                                                                                   // 55  // 290
   * @name  connection                                                                               // 56  // 291
   * @memberOf DDPCommon.MethodInvocation                                                            // 57  // 292
   * @instance                                                                                       // 58  // 293
   */                                                                                                // 59  // 294
  this.connection = options.connection;                                                              // 60  // 295
                                                                                                     // 61  // 296
  // The seed for randomStream value generation                                                      // 62  // 297
  this.randomSeed = options.randomSeed;                                                              // 63  // 298
                                                                                                     // 64  // 299
  // This is set by RandomStream.get; and holds the random stream state                              // 65  // 300
  this.randomStream = null;                                                                          // 66  // 301
};                                                                                                   // 67  // 302
                                                                                                     // 68  // 303
_.extend(DDPCommon.MethodInvocation.prototype, {                                                     // 69  // 304
  /**                                                                                                // 70  // 305
   * @summary Call inside a method invocation.  Allow subsequent method from this client to begin running in a new fiber.
   * @locus Server                                                                                   // 72  // 307
   * @memberOf DDPCommon.MethodInvocation                                                            // 73  // 308
   * @instance                                                                                       // 74  // 309
   */                                                                                                // 75  // 310
  unblock: function () {                                                                             // 76  // 311
    var self = this;                                                                                 // 77  // 312
    self._calledUnblock = true;                                                                      // 78  // 313
    self._unblock();                                                                                 // 79  // 314
  },                                                                                                 // 80  // 315
                                                                                                     // 81  // 316
  /**                                                                                                // 82  // 317
   * @summary Set the logged in user.                                                                // 83  // 318
   * @locus Server                                                                                   // 84  // 319
   * @memberOf DDPCommon.MethodInvocation                                                            // 85  // 320
   * @instance                                                                                       // 86  // 321
   * @param {String | null} userId The value that should be returned by `userId` on this connection.        // 322
   */                                                                                                // 88  // 323
  setUserId: function(userId) {                                                                      // 89  // 324
    var self = this;                                                                                 // 90  // 325
    if (self._calledUnblock)                                                                         // 91  // 326
      throw new Error("Can't call setUserId in a method after calling unblock");                     // 92  // 327
    self.userId = userId;                                                                            // 93  // 328
    self._setUserId(userId);                                                                         // 94  // 329
  }                                                                                                  // 95  // 330
});                                                                                                  // 96  // 331
                                                                                                     // 97  // 332
                                                                                                     // 98  // 333
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 334
                                                                                                            // 335
}).call(this);                                                                                              // 336
                                                                                                            // 337
                                                                                                            // 338
                                                                                                            // 339
                                                                                                            // 340
                                                                                                            // 341
                                                                                                            // 342
(function(){                                                                                                // 343
                                                                                                            // 344
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 345
//                                                                                                   //     // 346
// packages/ddp-common/random_stream.js                                                              //     // 347
//                                                                                                   //     // 348
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 349
                                                                                                     //     // 350
// RandomStream allows for generation of pseudo-random values, from a seed.                          // 1   // 351
//                                                                                                   // 2   // 352
// We use this for consistent 'random' numbers across the client and server.                         // 3   // 353
// We want to generate probably-unique IDs on the client, and we ideally want                        // 4   // 354
// the server to generate the same IDs when it executes the method.                                  // 5   // 355
//                                                                                                   // 6   // 356
// For generated values to be the same, we must seed ourselves the same way,                         // 7   // 357
// and we must keep track of the current state of our pseudo-random generators.                      // 8   // 358
// We call this state the scope. By default, we use the current DDP method                           // 9   // 359
// invocation as our scope.  DDP now allows the client to specify a randomSeed.                      // 10  // 360
// If a randomSeed is provided it will be used to seed our random sequences.                         // 11  // 361
// In this way, client and server method calls will generate the same values.                        // 12  // 362
//                                                                                                   // 13  // 363
// We expose multiple named streams; each stream is independent                                      // 14  // 364
// and is seeded differently (but predictably from the name).                                        // 15  // 365
// By using multiple streams, we support reordering of requests,                                     // 16  // 366
// as long as they occur on different streams.                                                       // 17  // 367
//                                                                                                   // 18  // 368
// @param options {Optional Object}                                                                  // 19  // 369
//   seed: Array or value - Seed value(s) for the generator.                                         // 20  // 370
//                          If an array, will be used as-is                                          // 21  // 371
//                          If a value, will be converted to a single-value array                    // 22  // 372
//                          If omitted, a random array will be used as the seed.                     // 23  // 373
DDPCommon.RandomStream = function (options) {                                                        // 24  // 374
  var self = this;                                                                                   // 25  // 375
                                                                                                     // 26  // 376
  this.seed = [].concat(options.seed || randomToken());                                              // 27  // 377
                                                                                                     // 28  // 378
  this.sequences = {};                                                                               // 29  // 379
};                                                                                                   // 30  // 380
                                                                                                     // 31  // 381
// Returns a random string of sufficient length for a random seed.                                   // 32  // 382
// This is a placeholder function; a similar function is planned                                     // 33  // 383
// for Random itself; when that is added we should remove this function,                             // 34  // 384
// and call Random's randomToken instead.                                                            // 35  // 385
function randomToken() {                                                                             // 36  // 386
  return Random.hexString(20);                                                                       // 37  // 387
};                                                                                                   // 38  // 388
                                                                                                     // 39  // 389
// Returns the random stream with the specified name, in the specified scope.                        // 40  // 390
// If scope is null (or otherwise falsey) then we will use Random, which will                        // 41  // 391
// give us as random numbers as possible, but won't produce the same                                 // 42  // 392
// values across client and server.                                                                  // 43  // 393
// However, scope will normally be the current DDP method invocation, so                             // 44  // 394
// we'll use the stream with the specified name, and we should get consistent                        // 45  // 395
// values on the client and server sides of a method call.                                           // 46  // 396
DDPCommon.RandomStream.get = function (scope, name) {                                                // 47  // 397
  if (!name) {                                                                                       // 48  // 398
    name = "default";                                                                                // 49  // 399
  }                                                                                                  // 50  // 400
  if (!scope) {                                                                                      // 51  // 401
    // There was no scope passed in;                                                                 // 52  // 402
    // the sequence won't actually be reproducible.                                                  // 53  // 403
    return Random;                                                                                   // 54  // 404
  }                                                                                                  // 55  // 405
  var randomStream = scope.randomStream;                                                             // 56  // 406
  if (!randomStream) {                                                                               // 57  // 407
    scope.randomStream = randomStream = new DDPCommon.RandomStream({                                 // 58  // 408
      seed: scope.randomSeed                                                                         // 59  // 409
    });                                                                                              // 60  // 410
  }                                                                                                  // 61  // 411
  return randomStream._sequence(name);                                                               // 62  // 412
};                                                                                                   // 63  // 413
                                                                                                     // 64  // 414
                                                                                                     // 65  // 415
// Creates a randomSeed for passing to a method call.                                                // 66  // 416
// Note that we take enclosing as an argument,                                                       // 67  // 417
// though we expect it to be DDP._CurrentInvocation.get()                                            // 68  // 418
// However, we often evaluate makeRpcSeed lazily, and thus the relevant                              // 69  // 419
// invocation may not be the one currently in scope.                                                 // 70  // 420
// If enclosing is null, we'll use Random and values won't be repeatable.                            // 71  // 421
DDPCommon.makeRpcSeed = function (enclosing, methodName) {                                           // 72  // 422
  var stream = DDPCommon.RandomStream.get(enclosing, '/rpc/' + methodName);                          // 73  // 423
  return stream.hexString(20);                                                                       // 74  // 424
};                                                                                                   // 75  // 425
                                                                                                     // 76  // 426
_.extend(DDPCommon.RandomStream.prototype, {                                                         // 77  // 427
  // Get a random sequence with the specified name, creating it if does not exist.                   // 78  // 428
  // New sequences are seeded with the seed concatenated with the name.                              // 79  // 429
  // By passing a seed into Random.create, we use the Alea generator.                                // 80  // 430
  _sequence: function (name) {                                                                       // 81  // 431
    var self = this;                                                                                 // 82  // 432
                                                                                                     // 83  // 433
    var sequence = self.sequences[name] || null;                                                     // 84  // 434
    if (sequence === null) {                                                                         // 85  // 435
      var sequenceSeed = self.seed.concat(name);                                                     // 86  // 436
      for (var i = 0; i < sequenceSeed.length; i++) {                                                // 87  // 437
        if (_.isFunction(sequenceSeed[i])) {                                                         // 88  // 438
          sequenceSeed[i] = sequenceSeed[i]();                                                       // 89  // 439
        }                                                                                            // 90  // 440
      }                                                                                              // 91  // 441
      self.sequences[name] = sequence = Random.createWithSeeds.apply(null, sequenceSeed);            // 92  // 442
    }                                                                                                // 93  // 443
    return sequence;                                                                                 // 94  // 444
  }                                                                                                  // 95  // 445
});                                                                                                  // 96  // 446
                                                                                                     // 97  // 447
///////////////////////////////////////////////////////////////////////////////////////////////////////     // 448
                                                                                                            // 449
}).call(this);                                                                                              // 450
                                                                                                            // 451
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ddp-common'] = {
  DDPCommon: DDPCommon
};

})();

//# sourceMappingURL=ddp-common.js.map
