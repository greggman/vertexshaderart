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
var IdMap = Package['id-map'].IdMap;
var DDPCommon = Package['ddp-common'].DDPCommon;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;

/* Package-scope variables */
var DDP, LivedataTest, MongoIDMap, toSockjsUrl, toWebsocketUrl, allConnections;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-client/packages/ddp-client.js                                                                         //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
(function(){                                                                                                          // 1
                                                                                                                      // 2
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3
//                                                                                                            //      // 4
// packages/ddp-client/namespace.js                                                                           //      // 5
//                                                                                                            //      // 6
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 7
                                                                                                              //      // 8
/**                                                                                                           // 1    // 9
 * @namespace DDP                                                                                             // 2    // 10
 * @summary Namespace for DDP-related methods/classes.                                                        // 3    // 11
 */                                                                                                           // 4    // 12
DDP          = {};                                                                                            // 5    // 13
LivedataTest = {};                                                                                            // 6    // 14
                                                                                                              // 7    // 15
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 16
                                                                                                                      // 17
}).call(this);                                                                                                        // 18
                                                                                                                      // 19
                                                                                                                      // 20
                                                                                                                      // 21
                                                                                                                      // 22
                                                                                                                      // 23
                                                                                                                      // 24
(function(){                                                                                                          // 25
                                                                                                                      // 26
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 27
//                                                                                                            //      // 28
// packages/ddp-client/id_map.js                                                                              //      // 29
//                                                                                                            //      // 30
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 31
                                                                                                              //      // 32
MongoIDMap = function () {                                                                                    // 1    // 33
  var self = this;                                                                                            // 2    // 34
  IdMap.call(self, MongoID.idStringify, MongoID.idParse);                                                     // 3    // 35
};                                                                                                            // 4    // 36
                                                                                                              // 5    // 37
Meteor._inherits(MongoIDMap, IdMap);                                                                          // 6    // 38
                                                                                                              // 7    // 39
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 40
                                                                                                                      // 41
}).call(this);                                                                                                        // 42
                                                                                                                      // 43
                                                                                                                      // 44
                                                                                                                      // 45
                                                                                                                      // 46
                                                                                                                      // 47
                                                                                                                      // 48
(function(){                                                                                                          // 49
                                                                                                                      // 50
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 51
//                                                                                                            //      // 52
// packages/ddp-client/stream_client_nodejs.js                                                                //      // 53
//                                                                                                            //      // 54
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 55
                                                                                                              //      // 56
// @param endpoint {String} URL to Meteor app                                                                 // 1    // 57
//   "http://subdomain.meteor.com/" or "/" or                                                                 // 2    // 58
//   "ddp+sockjs://foo-**.meteor.com/sockjs"                                                                  // 3    // 59
//                                                                                                            // 4    // 60
// We do some rewriting of the URL to eventually make it "ws://" or "wss://",                                 // 5    // 61
// whatever was passed in.  At the very least, what Meteor.absoluteUrl() returns                              // 6    // 62
// us should work.                                                                                            // 7    // 63
//                                                                                                            // 8    // 64
// We don't do any heartbeating. (The logic that did this in sockjs was removed,                              // 9    // 65
// because it used a built-in sockjs mechanism. We could do it with WebSocket                                 // 10   // 66
// ping frames or with DDP-level messages.)                                                                   // 11   // 67
LivedataTest.ClientStream = function (endpoint, options) {                                                    // 12   // 68
  var self = this;                                                                                            // 13   // 69
  options = options || {};                                                                                    // 14   // 70
                                                                                                              // 15   // 71
  self.options = _.extend({                                                                                   // 16   // 72
    retry: true                                                                                               // 17   // 73
  }, options);                                                                                                // 18   // 74
                                                                                                              // 19   // 75
  self.client = null;  // created in _launchConnection                                                        // 20   // 76
  self.endpoint = endpoint;                                                                                   // 21   // 77
                                                                                                              // 22   // 78
  self.headers = self.options.headers || {};                                                                  // 23   // 79
                                                                                                              // 24   // 80
  self._initCommon(self.options);                                                                             // 25   // 81
                                                                                                              // 26   // 82
  //// Kickoff!                                                                                               // 27   // 83
  self._launchConnection();                                                                                   // 28   // 84
};                                                                                                            // 29   // 85
                                                                                                              // 30   // 86
_.extend(LivedataTest.ClientStream.prototype, {                                                               // 31   // 87
                                                                                                              // 32   // 88
  // data is a utf8 string. Data sent while not connected is dropped on                                       // 33   // 89
  // the floor, and it is up the user of this API to retransmit lost                                          // 34   // 90
  // messages on 'reset'                                                                                      // 35   // 91
  send: function (data) {                                                                                     // 36   // 92
    var self = this;                                                                                          // 37   // 93
    if (self.currentStatus.connected) {                                                                       // 38   // 94
      self.client.send(data);                                                                                 // 39   // 95
    }                                                                                                         // 40   // 96
  },                                                                                                          // 41   // 97
                                                                                                              // 42   // 98
  // Changes where this connection points                                                                     // 43   // 99
  _changeUrl: function (url) {                                                                                // 44   // 100
    var self = this;                                                                                          // 45   // 101
    self.endpoint = url;                                                                                      // 46   // 102
  },                                                                                                          // 47   // 103
                                                                                                              // 48   // 104
  _onConnect: function (client) {                                                                             // 49   // 105
    var self = this;                                                                                          // 50   // 106
                                                                                                              // 51   // 107
    if (client !== self.client) {                                                                             // 52   // 108
      // This connection is not from the last call to _launchConnection.                                      // 53   // 109
      // But _launchConnection calls _cleanup which closes previous connections.                              // 54   // 110
      // It's our belief that this stifles future 'open' events, but maybe                                    // 55   // 111
      // we are wrong?                                                                                        // 56   // 112
      throw new Error("Got open from inactive client " + !!self.client);                                      // 57   // 113
    }                                                                                                         // 58   // 114
                                                                                                              // 59   // 115
    if (self._forcedToDisconnect) {                                                                           // 60   // 116
      // We were asked to disconnect between trying to open the connection and                                // 61   // 117
      // actually opening it. Let's just pretend this never happened.                                         // 62   // 118
      self.client.close();                                                                                    // 63   // 119
      self.client = null;                                                                                     // 64   // 120
      return;                                                                                                 // 65   // 121
    }                                                                                                         // 66   // 122
                                                                                                              // 67   // 123
    if (self.currentStatus.connected) {                                                                       // 68   // 124
      // We already have a connection. It must have been the case that we                                     // 69   // 125
      // started two parallel connection attempts (because we wanted to                                       // 70   // 126
      // 'reconnect now' on a hanging connection and we had no way to cancel the                              // 71   // 127
      // connection attempt.) But this shouldn't happen (similarly to the client                              // 72   // 128
      // !== self.client check above).                                                                        // 73   // 129
      throw new Error("Two parallel connections?");                                                           // 74   // 130
    }                                                                                                         // 75   // 131
                                                                                                              // 76   // 132
    self._clearConnectionTimer();                                                                             // 77   // 133
                                                                                                              // 78   // 134
    // update status                                                                                          // 79   // 135
    self.currentStatus.status = "connected";                                                                  // 80   // 136
    self.currentStatus.connected = true;                                                                      // 81   // 137
    self.currentStatus.retryCount = 0;                                                                        // 82   // 138
    self.statusChanged();                                                                                     // 83   // 139
                                                                                                              // 84   // 140
    // fire resets. This must come after status change so that clients                                        // 85   // 141
    // can call send from within a reset callback.                                                            // 86   // 142
    _.each(self.eventCallbacks.reset, function (callback) { callback(); });                                   // 87   // 143
  },                                                                                                          // 88   // 144
                                                                                                              // 89   // 145
  _cleanup: function (maybeError) {                                                                           // 90   // 146
    var self = this;                                                                                          // 91   // 147
                                                                                                              // 92   // 148
    self._clearConnectionTimer();                                                                             // 93   // 149
    if (self.client) {                                                                                        // 94   // 150
      var client = self.client;                                                                               // 95   // 151
      self.client = null;                                                                                     // 96   // 152
      client.close();                                                                                         // 97   // 153
                                                                                                              // 98   // 154
      _.each(self.eventCallbacks.disconnect, function (callback) {                                            // 99   // 155
        callback(maybeError);                                                                                 // 100  // 156
      });                                                                                                     // 101  // 157
    }                                                                                                         // 102  // 158
  },                                                                                                          // 103  // 159
                                                                                                              // 104  // 160
  _clearConnectionTimer: function () {                                                                        // 105  // 161
    var self = this;                                                                                          // 106  // 162
                                                                                                              // 107  // 163
    if (self.connectionTimer) {                                                                               // 108  // 164
      clearTimeout(self.connectionTimer);                                                                     // 109  // 165
      self.connectionTimer = null;                                                                            // 110  // 166
    }                                                                                                         // 111  // 167
  },                                                                                                          // 112  // 168
                                                                                                              // 113  // 169
  _getProxyUrl: function (targetUrl) {                                                                        // 114  // 170
    var self = this;                                                                                          // 115  // 171
    // Similar to code in tools/http-helpers.js.                                                              // 116  // 172
    var proxy = process.env.HTTP_PROXY || process.env.http_proxy || null;                                     // 117  // 173
    // if we're going to a secure url, try the https_proxy env variable first.                                // 118  // 174
    if (targetUrl.match(/^wss:/)) {                                                                           // 119  // 175
      proxy = process.env.HTTPS_PROXY || process.env.https_proxy || proxy;                                    // 120  // 176
    }                                                                                                         // 121  // 177
    return proxy;                                                                                             // 122  // 178
  },                                                                                                          // 123  // 179
                                                                                                              // 124  // 180
  _launchConnection: function () {                                                                            // 125  // 181
    var self = this;                                                                                          // 126  // 182
    self._cleanup(); // cleanup the old socket, if there was one.                                             // 127  // 183
                                                                                                              // 128  // 184
    // Since server-to-server DDP is still an experimental feature, we only                                   // 129  // 185
    // require the module if we actually create a server-to-server                                            // 130  // 186
    // connection.                                                                                            // 131  // 187
    var FayeWebSocket = Npm.require('faye-websocket');                                                        // 132  // 188
    var deflate = Npm.require('permessage-deflate');                                                          // 133  // 189
                                                                                                              // 134  // 190
    var targetUrl = toWebsocketUrl(self.endpoint);                                                            // 135  // 191
    var fayeOptions = {                                                                                       // 136  // 192
      headers: self.headers,                                                                                  // 137  // 193
      extensions: [deflate]                                                                                   // 138  // 194
    };                                                                                                        // 139  // 195
    var proxyUrl = self._getProxyUrl(targetUrl);                                                              // 140  // 196
    if (proxyUrl) {                                                                                           // 141  // 197
      fayeOptions.proxy = { origin: proxyUrl };                                                               // 142  // 198
    };                                                                                                        // 143  // 199
                                                                                                              // 144  // 200
    // We would like to specify 'ddp' as the subprotocol here. The npm module we                              // 145  // 201
    // used to use as a client would fail the handshake if we ask for a                                       // 146  // 202
    // subprotocol and the server doesn't send one back (and sockjs doesn't).                                 // 147  // 203
    // Faye doesn't have that behavior; it's unclear from reading RFC 6455 if                                 // 148  // 204
    // Faye is erroneous or not.  So for now, we don't specify protocols.                                     // 149  // 205
    var subprotocols = [];                                                                                    // 150  // 206
                                                                                                              // 151  // 207
    var client = self.client = new FayeWebSocket.Client(                                                      // 152  // 208
      targetUrl, subprotocols, fayeOptions);                                                                  // 153  // 209
                                                                                                              // 154  // 210
    self._clearConnectionTimer();                                                                             // 155  // 211
    self.connectionTimer = Meteor.setTimeout(                                                                 // 156  // 212
      function () {                                                                                           // 157  // 213
        self._lostConnection(                                                                                 // 158  // 214
          new DDP.ConnectionError("DDP connection timed out"));                                               // 159  // 215
      },                                                                                                      // 160  // 216
      self.CONNECT_TIMEOUT);                                                                                  // 161  // 217
                                                                                                              // 162  // 218
    self.client.on('open', Meteor.bindEnvironment(function () {                                               // 163  // 219
      return self._onConnect(client);                                                                         // 164  // 220
    }, "stream connect callback"));                                                                           // 165  // 221
                                                                                                              // 166  // 222
    var clientOnIfCurrent = function (event, description, f) {                                                // 167  // 223
      self.client.on(event, Meteor.bindEnvironment(function () {                                              // 168  // 224
        // Ignore events from any connection we've already cleaned up.                                        // 169  // 225
        if (client !== self.client)                                                                           // 170  // 226
          return;                                                                                             // 171  // 227
        f.apply(this, arguments);                                                                             // 172  // 228
      }, description));                                                                                       // 173  // 229
    };                                                                                                        // 174  // 230
                                                                                                              // 175  // 231
    clientOnIfCurrent('error', 'stream error callback', function (error) {                                    // 176  // 232
      if (!self.options._dontPrintErrors)                                                                     // 177  // 233
        Meteor._debug("stream error", error.message);                                                         // 178  // 234
                                                                                                              // 179  // 235
      // Faye's 'error' object is not a JS error (and among other things,                                     // 180  // 236
      // doesn't stringify well). Convert it to one.                                                          // 181  // 237
      self._lostConnection(new DDP.ConnectionError(error.message));                                           // 182  // 238
    });                                                                                                       // 183  // 239
                                                                                                              // 184  // 240
                                                                                                              // 185  // 241
    clientOnIfCurrent('close', 'stream close callback', function () {                                         // 186  // 242
      self._lostConnection();                                                                                 // 187  // 243
    });                                                                                                       // 188  // 244
                                                                                                              // 189  // 245
                                                                                                              // 190  // 246
    clientOnIfCurrent('message', 'stream message callback', function (message) {                              // 191  // 247
      // Ignore binary frames, where message.data is a Buffer                                                 // 192  // 248
      if (typeof message.data !== "string")                                                                   // 193  // 249
        return;                                                                                               // 194  // 250
                                                                                                              // 195  // 251
      _.each(self.eventCallbacks.message, function (callback) {                                               // 196  // 252
        callback(message.data);                                                                               // 197  // 253
      });                                                                                                     // 198  // 254
    });                                                                                                       // 199  // 255
  }                                                                                                           // 200  // 256
});                                                                                                           // 201  // 257
                                                                                                              // 202  // 258
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 259
                                                                                                                      // 260
}).call(this);                                                                                                        // 261
                                                                                                                      // 262
                                                                                                                      // 263
                                                                                                                      // 264
                                                                                                                      // 265
                                                                                                                      // 266
                                                                                                                      // 267
(function(){                                                                                                          // 268
                                                                                                                      // 269
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 270
//                                                                                                            //      // 271
// packages/ddp-client/stream_client_common.js                                                                //      // 272
//                                                                                                            //      // 273
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 274
                                                                                                              //      // 275
// XXX from Underscore.String (http://epeli.github.com/underscore.string/)                                    // 1    // 276
var startsWith = function(str, starts) {                                                                      // 2    // 277
  return str.length >= starts.length &&                                                                       // 3    // 278
    str.substring(0, starts.length) === starts;                                                               // 4    // 279
};                                                                                                            // 5    // 280
var endsWith = function(str, ends) {                                                                          // 6    // 281
  return str.length >= ends.length &&                                                                         // 7    // 282
    str.substring(str.length - ends.length) === ends;                                                         // 8    // 283
};                                                                                                            // 9    // 284
                                                                                                              // 10   // 285
// @param url {String} URL to Meteor app, eg:                                                                 // 11   // 286
//   "/" or "madewith.meteor.com" or "https://foo.meteor.com"                                                 // 12   // 287
//   or "ddp+sockjs://ddp--****-foo.meteor.com/sockjs"                                                        // 13   // 288
// @returns {String} URL to the endpoint with the specific scheme and subPath, e.g.                           // 14   // 289
// for scheme "http" and subPath "sockjs"                                                                     // 15   // 290
//   "http://subdomain.meteor.com/sockjs" or "/sockjs"                                                        // 16   // 291
//   or "https://ddp--1234-foo.meteor.com/sockjs"                                                             // 17   // 292
var translateUrl =  function(url, newSchemeBase, subPath) {                                                   // 18   // 293
  if (! newSchemeBase) {                                                                                      // 19   // 294
    newSchemeBase = "http";                                                                                   // 20   // 295
  }                                                                                                           // 21   // 296
                                                                                                              // 22   // 297
  var ddpUrlMatch = url.match(/^ddp(i?)\+sockjs:\/\//);                                                       // 23   // 298
  var httpUrlMatch = url.match(/^http(s?):\/\//);                                                             // 24   // 299
  var newScheme;                                                                                              // 25   // 300
  if (ddpUrlMatch) {                                                                                          // 26   // 301
    // Remove scheme and split off the host.                                                                  // 27   // 302
    var urlAfterDDP = url.substr(ddpUrlMatch[0].length);                                                      // 28   // 303
    newScheme = ddpUrlMatch[1] === "i" ? newSchemeBase : newSchemeBase + "s";                                 // 29   // 304
    var slashPos = urlAfterDDP.indexOf('/');                                                                  // 30   // 305
    var host =                                                                                                // 31   // 306
          slashPos === -1 ? urlAfterDDP : urlAfterDDP.substr(0, slashPos);                                    // 32   // 307
    var rest = slashPos === -1 ? '' : urlAfterDDP.substr(slashPos);                                           // 33   // 308
                                                                                                              // 34   // 309
    // In the host (ONLY!), change '*' characters into random digits. This                                    // 35   // 310
    // allows different stream connections to connect to different hostnames                                  // 36   // 311
    // and avoid browser per-hostname connection limits.                                                      // 37   // 312
    host = host.replace(/\*/g, function () {                                                                  // 38   // 313
      return Math.floor(Random.fraction()*10);                                                                // 39   // 314
    });                                                                                                       // 40   // 315
                                                                                                              // 41   // 316
    return newScheme + '://' + host + rest;                                                                   // 42   // 317
  } else if (httpUrlMatch) {                                                                                  // 43   // 318
    newScheme = !httpUrlMatch[1] ? newSchemeBase : newSchemeBase + "s";                                       // 44   // 319
    var urlAfterHttp = url.substr(httpUrlMatch[0].length);                                                    // 45   // 320
    url = newScheme + "://" + urlAfterHttp;                                                                   // 46   // 321
  }                                                                                                           // 47   // 322
                                                                                                              // 48   // 323
  // Prefix FQDNs but not relative URLs                                                                       // 49   // 324
  if (url.indexOf("://") === -1 && !startsWith(url, "/")) {                                                   // 50   // 325
    url = newSchemeBase + "://" + url;                                                                        // 51   // 326
  }                                                                                                           // 52   // 327
                                                                                                              // 53   // 328
  // XXX This is not what we should be doing: if I have a site                                                // 54   // 329
  // deployed at "/foo", then DDP.connect("/") should actually connect                                        // 55   // 330
  // to "/", not to "/foo". "/" is an absolute path. (Contrast: if                                            // 56   // 331
  // deployed at "/foo", it would be reasonable for DDP.connect("bar")                                        // 57   // 332
  // to connect to "/foo/bar").                                                                               // 58   // 333
  //                                                                                                          // 59   // 334
  // We should make this properly honor absolute paths rather than                                            // 60   // 335
  // forcing the path to be relative to the site root. Simultaneously,                                        // 61   // 336
  // we should set DDP_DEFAULT_CONNECTION_URL to include the site                                             // 62   // 337
  // root. See also client_convenience.js #RationalizingRelativeDDPURLs                                       // 63   // 338
  url = Meteor._relativeToSiteRootUrl(url);                                                                   // 64   // 339
                                                                                                              // 65   // 340
  if (endsWith(url, "/"))                                                                                     // 66   // 341
    return url + subPath;                                                                                     // 67   // 342
  else                                                                                                        // 68   // 343
    return url + "/" + subPath;                                                                               // 69   // 344
};                                                                                                            // 70   // 345
                                                                                                              // 71   // 346
toSockjsUrl = function (url) {                                                                                // 72   // 347
  return translateUrl(url, "http", "sockjs");                                                                 // 73   // 348
};                                                                                                            // 74   // 349
                                                                                                              // 75   // 350
toWebsocketUrl = function (url) {                                                                             // 76   // 351
  var ret = translateUrl(url, "ws", "websocket");                                                             // 77   // 352
  return ret;                                                                                                 // 78   // 353
};                                                                                                            // 79   // 354
                                                                                                              // 80   // 355
LivedataTest.toSockjsUrl = toSockjsUrl;                                                                       // 81   // 356
                                                                                                              // 82   // 357
                                                                                                              // 83   // 358
_.extend(LivedataTest.ClientStream.prototype, {                                                               // 84   // 359
                                                                                                              // 85   // 360
  // Register for callbacks.                                                                                  // 86   // 361
  on: function (name, callback) {                                                                             // 87   // 362
    var self = this;                                                                                          // 88   // 363
                                                                                                              // 89   // 364
    if (name !== 'message' && name !== 'reset' && name !== 'disconnect')                                      // 90   // 365
      throw new Error("unknown event type: " + name);                                                         // 91   // 366
                                                                                                              // 92   // 367
    if (!self.eventCallbacks[name])                                                                           // 93   // 368
      self.eventCallbacks[name] = [];                                                                         // 94   // 369
    self.eventCallbacks[name].push(callback);                                                                 // 95   // 370
  },                                                                                                          // 96   // 371
                                                                                                              // 97   // 372
                                                                                                              // 98   // 373
  _initCommon: function (options) {                                                                           // 99   // 374
    var self = this;                                                                                          // 100  // 375
    options = options || {};                                                                                  // 101  // 376
                                                                                                              // 102  // 377
    //// Constants                                                                                            // 103  // 378
                                                                                                              // 104  // 379
    // how long to wait until we declare the connection attempt                                               // 105  // 380
    // failed.                                                                                                // 106  // 381
    self.CONNECT_TIMEOUT = options.connectTimeoutMs || 10000;                                                 // 107  // 382
                                                                                                              // 108  // 383
    self.eventCallbacks = {}; // name -> [callback]                                                           // 109  // 384
                                                                                                              // 110  // 385
    self._forcedToDisconnect = false;                                                                         // 111  // 386
                                                                                                              // 112  // 387
    //// Reactive status                                                                                      // 113  // 388
    self.currentStatus = {                                                                                    // 114  // 389
      status: "connecting",                                                                                   // 115  // 390
      connected: false,                                                                                       // 116  // 391
      retryCount: 0                                                                                           // 117  // 392
    };                                                                                                        // 118  // 393
                                                                                                              // 119  // 394
                                                                                                              // 120  // 395
    self.statusListeners = typeof Tracker !== 'undefined' && new Tracker.Dependency;                          // 121  // 396
    self.statusChanged = function () {                                                                        // 122  // 397
      if (self.statusListeners)                                                                               // 123  // 398
        self.statusListeners.changed();                                                                       // 124  // 399
    };                                                                                                        // 125  // 400
                                                                                                              // 126  // 401
    //// Retry logic                                                                                          // 127  // 402
    self._retry = new Retry;                                                                                  // 128  // 403
    self.connectionTimer = null;                                                                              // 129  // 404
                                                                                                              // 130  // 405
  },                                                                                                          // 131  // 406
                                                                                                              // 132  // 407
  // Trigger a reconnect.                                                                                     // 133  // 408
  reconnect: function (options) {                                                                             // 134  // 409
    var self = this;                                                                                          // 135  // 410
    options = options || {};                                                                                  // 136  // 411
                                                                                                              // 137  // 412
    if (options.url) {                                                                                        // 138  // 413
      self._changeUrl(options.url);                                                                           // 139  // 414
    }                                                                                                         // 140  // 415
                                                                                                              // 141  // 416
    if (options._sockjsOptions) {                                                                             // 142  // 417
      self.options._sockjsOptions = options._sockjsOptions;                                                   // 143  // 418
    }                                                                                                         // 144  // 419
                                                                                                              // 145  // 420
    if (self.currentStatus.connected) {                                                                       // 146  // 421
      if (options._force || options.url) {                                                                    // 147  // 422
        // force reconnect.                                                                                   // 148  // 423
        self._lostConnection(new DDP.ForcedReconnectError);                                                   // 149  // 424
      } // else, noop.                                                                                        // 150  // 425
      return;                                                                                                 // 151  // 426
    }                                                                                                         // 152  // 427
                                                                                                              // 153  // 428
    // if we're mid-connection, stop it.                                                                      // 154  // 429
    if (self.currentStatus.status === "connecting") {                                                         // 155  // 430
      // Pretend it's a clean close.                                                                          // 156  // 431
      self._lostConnection();                                                                                 // 157  // 432
    }                                                                                                         // 158  // 433
                                                                                                              // 159  // 434
    self._retry.clear();                                                                                      // 160  // 435
    self.currentStatus.retryCount -= 1; // don't count manual retries                                         // 161  // 436
    self._retryNow();                                                                                         // 162  // 437
  },                                                                                                          // 163  // 438
                                                                                                              // 164  // 439
  disconnect: function (options) {                                                                            // 165  // 440
    var self = this;                                                                                          // 166  // 441
    options = options || {};                                                                                  // 167  // 442
                                                                                                              // 168  // 443
    // Failed is permanent. If we're failed, don't let people go back                                         // 169  // 444
    // online by calling 'disconnect' then 'reconnect'.                                                       // 170  // 445
    if (self._forcedToDisconnect)                                                                             // 171  // 446
      return;                                                                                                 // 172  // 447
                                                                                                              // 173  // 448
    // If _permanent is set, permanently disconnect a stream. Once a stream                                   // 174  // 449
    // is forced to disconnect, it can never reconnect. This is for                                           // 175  // 450
    // error cases such as ddp version mismatch, where trying again                                           // 176  // 451
    // won't fix the problem.                                                                                 // 177  // 452
    if (options._permanent) {                                                                                 // 178  // 453
      self._forcedToDisconnect = true;                                                                        // 179  // 454
    }                                                                                                         // 180  // 455
                                                                                                              // 181  // 456
    self._cleanup();                                                                                          // 182  // 457
    self._retry.clear();                                                                                      // 183  // 458
                                                                                                              // 184  // 459
    self.currentStatus = {                                                                                    // 185  // 460
      status: (options._permanent ? "failed" : "offline"),                                                    // 186  // 461
      connected: false,                                                                                       // 187  // 462
      retryCount: 0                                                                                           // 188  // 463
    };                                                                                                        // 189  // 464
                                                                                                              // 190  // 465
    if (options._permanent && options._error)                                                                 // 191  // 466
      self.currentStatus.reason = options._error;                                                             // 192  // 467
                                                                                                              // 193  // 468
    self.statusChanged();                                                                                     // 194  // 469
  },                                                                                                          // 195  // 470
                                                                                                              // 196  // 471
  // maybeError is set unless it's a clean protocol-level close.                                              // 197  // 472
  _lostConnection: function (maybeError) {                                                                    // 198  // 473
    var self = this;                                                                                          // 199  // 474
                                                                                                              // 200  // 475
    self._cleanup(maybeError);                                                                                // 201  // 476
    self._retryLater(maybeError); // sets status. no need to do it here.                                      // 202  // 477
  },                                                                                                          // 203  // 478
                                                                                                              // 204  // 479
  // fired when we detect that we've gone online. try to reconnect                                            // 205  // 480
  // immediately.                                                                                             // 206  // 481
  _online: function () {                                                                                      // 207  // 482
    // if we've requested to be offline by disconnecting, don't reconnect.                                    // 208  // 483
    if (this.currentStatus.status != "offline")                                                               // 209  // 484
      this.reconnect();                                                                                       // 210  // 485
  },                                                                                                          // 211  // 486
                                                                                                              // 212  // 487
  _retryLater: function (maybeError) {                                                                        // 213  // 488
    var self = this;                                                                                          // 214  // 489
                                                                                                              // 215  // 490
    var timeout = 0;                                                                                          // 216  // 491
    if (self.options.retry ||                                                                                 // 217  // 492
        (maybeError && maybeError.errorType === "DDP.ForcedReconnectError")) {                                // 218  // 493
      timeout = self._retry.retryLater(                                                                       // 219  // 494
        self.currentStatus.retryCount,                                                                        // 220  // 495
        _.bind(self._retryNow, self)                                                                          // 221  // 496
      );                                                                                                      // 222  // 497
      self.currentStatus.status = "waiting";                                                                  // 223  // 498
      self.currentStatus.retryTime = (new Date()).getTime() + timeout;                                        // 224  // 499
    } else {                                                                                                  // 225  // 500
      self.currentStatus.status = "failed";                                                                   // 226  // 501
      delete self.currentStatus.retryTime;                                                                    // 227  // 502
    }                                                                                                         // 228  // 503
                                                                                                              // 229  // 504
    self.currentStatus.connected = false;                                                                     // 230  // 505
    self.statusChanged();                                                                                     // 231  // 506
  },                                                                                                          // 232  // 507
                                                                                                              // 233  // 508
  _retryNow: function () {                                                                                    // 234  // 509
    var self = this;                                                                                          // 235  // 510
                                                                                                              // 236  // 511
    if (self._forcedToDisconnect)                                                                             // 237  // 512
      return;                                                                                                 // 238  // 513
                                                                                                              // 239  // 514
    self.currentStatus.retryCount += 1;                                                                       // 240  // 515
    self.currentStatus.status = "connecting";                                                                 // 241  // 516
    self.currentStatus.connected = false;                                                                     // 242  // 517
    delete self.currentStatus.retryTime;                                                                      // 243  // 518
    self.statusChanged();                                                                                     // 244  // 519
                                                                                                              // 245  // 520
    self._launchConnection();                                                                                 // 246  // 521
  },                                                                                                          // 247  // 522
                                                                                                              // 248  // 523
                                                                                                              // 249  // 524
  // Get current status. Reactive.                                                                            // 250  // 525
  status: function () {                                                                                       // 251  // 526
    var self = this;                                                                                          // 252  // 527
    if (self.statusListeners)                                                                                 // 253  // 528
      self.statusListeners.depend();                                                                          // 254  // 529
    return self.currentStatus;                                                                                // 255  // 530
  }                                                                                                           // 256  // 531
});                                                                                                           // 257  // 532
                                                                                                              // 258  // 533
DDP.ConnectionError = Meteor.makeErrorType(                                                                   // 259  // 534
  "DDP.ConnectionError", function (message) {                                                                 // 260  // 535
    var self = this;                                                                                          // 261  // 536
    self.message = message;                                                                                   // 262  // 537
});                                                                                                           // 263  // 538
                                                                                                              // 264  // 539
DDP.ForcedReconnectError = Meteor.makeErrorType(                                                              // 265  // 540
  "DDP.ForcedReconnectError", function () {});                                                                // 266  // 541
                                                                                                              // 267  // 542
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 543
                                                                                                                      // 544
}).call(this);                                                                                                        // 545
                                                                                                                      // 546
                                                                                                                      // 547
                                                                                                                      // 548
                                                                                                                      // 549
                                                                                                                      // 550
                                                                                                                      // 551
(function(){                                                                                                          // 552
                                                                                                                      // 553
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 554
//                                                                                                            //      // 555
// packages/ddp-client/livedata_common.js                                                                     //      // 556
//                                                                                                            //      // 557
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 558
                                                                                                              //      // 559
LivedataTest.SUPPORTED_DDP_VERSIONS = DDPCommon.SUPPORTED_DDP_VERSIONS;                                       // 1    // 560
                                                                                                              // 2    // 561
// This is private but it's used in a few places. accounts-base uses                                          // 3    // 562
// it to get the current user. Meteor.setTimeout and friends clear                                            // 4    // 563
// it. We can probably find a better way to factor this.                                                      // 5    // 564
DDP._CurrentInvocation = new Meteor.EnvironmentVariable;                                                      // 6    // 565
                                                                                                              // 7    // 566
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 567
                                                                                                                      // 568
}).call(this);                                                                                                        // 569
                                                                                                                      // 570
                                                                                                                      // 571
                                                                                                                      // 572
                                                                                                                      // 573
                                                                                                                      // 574
                                                                                                                      // 575
(function(){                                                                                                          // 576
                                                                                                                      // 577
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 578
//                                                                                                            //      // 579
// packages/ddp-client/random_stream.js                                                                       //      // 580
//                                                                                                            //      // 581
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 582
                                                                                                              //      // 583
// Returns the named sequence of pseudo-random values.                                                        // 1    // 584
// The scope will be DDP._CurrentInvocation.get(), so the stream will produce                                 // 2    // 585
// consistent values for method calls on the client and server.                                               // 3    // 586
DDP.randomStream = function (name) {                                                                          // 4    // 587
  var scope = DDP._CurrentInvocation.get();                                                                   // 5    // 588
  return DDPCommon.RandomStream.get(scope, name);                                                             // 6    // 589
};                                                                                                            // 7    // 590
                                                                                                              // 8    // 591
                                                                                                              // 9    // 592
                                                                                                              // 10   // 593
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 594
                                                                                                                      // 595
}).call(this);                                                                                                        // 596
                                                                                                                      // 597
                                                                                                                      // 598
                                                                                                                      // 599
                                                                                                                      // 600
                                                                                                                      // 601
                                                                                                                      // 602
(function(){                                                                                                          // 603
                                                                                                                      // 604
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 605
//                                                                                                            //      // 606
// packages/ddp-client/livedata_connection.js                                                                 //      // 607
//                                                                                                            //      // 608
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 609
                                                                                                              //      // 610
if (Meteor.isServer) {                                                                                        // 1    // 611
  var path = Npm.require('path');                                                                             // 2    // 612
  var Fiber = Npm.require('fibers');                                                                          // 3    // 613
  var Future = Npm.require(path.join('fibers', 'future'));                                                    // 4    // 614
}                                                                                                             // 5    // 615
                                                                                                              // 6    // 616
// @param url {String|Object} URL to Meteor app,                                                              // 7    // 617
//   or an object as a test hook (see code)                                                                   // 8    // 618
// Options:                                                                                                   // 9    // 619
//   reloadWithOutstanding: is it OK to reload if there are outstanding methods?                              // 10   // 620
//   headers: extra headers to send on the websockets connection, for                                         // 11   // 621
//     server-to-server DDP only                                                                              // 12   // 622
//   _sockjsOptions: Specifies options to pass through to the sockjs client                                   // 13   // 623
//   onDDPNegotiationVersionFailure: callback when version negotiation fails.                                 // 14   // 624
//                                                                                                            // 15   // 625
// XXX There should be a way to destroy a DDP connection, causing all                                         // 16   // 626
// outstanding method calls to fail.                                                                          // 17   // 627
//                                                                                                            // 18   // 628
// XXX Our current way of handling failure and reconnection is great                                          // 19   // 629
// for an app (where we want to tolerate being disconnected as an                                             // 20   // 630
// expect state, and keep trying forever to reconnect) but cumbersome                                         // 21   // 631
// for something like a command line tool that wants to make a                                                // 22   // 632
// connection, call a method, and print an error if connection                                                // 23   // 633
// fails. We should have better usability in the latter case (while                                           // 24   // 634
// still transparently reconnecting if it's just a transient failure                                          // 25   // 635
// or the server migrating us).                                                                               // 26   // 636
var Connection = function (url, options) {                                                                    // 27   // 637
  var self = this;                                                                                            // 28   // 638
  options = _.extend({                                                                                        // 29   // 639
    onConnected: function () {},                                                                              // 30   // 640
    onDDPVersionNegotiationFailure: function (description) {                                                  // 31   // 641
      Meteor._debug(description);                                                                             // 32   // 642
    },                                                                                                        // 33   // 643
    heartbeatInterval: 17500,                                                                                 // 34   // 644
    heartbeatTimeout: 15000,                                                                                  // 35   // 645
    // These options are only for testing.                                                                    // 36   // 646
    reloadWithOutstanding: false,                                                                             // 37   // 647
    supportedDDPVersions: DDPCommon.SUPPORTED_DDP_VERSIONS,                                                   // 38   // 648
    retry: true,                                                                                              // 39   // 649
    respondToPings: true                                                                                      // 40   // 650
  }, options);                                                                                                // 41   // 651
                                                                                                              // 42   // 652
  // If set, called when we reconnect, queuing method calls _before_ the                                      // 43   // 653
  // existing outstanding ones. This is the only data member that is part of the                              // 44   // 654
  // public API!                                                                                              // 45   // 655
  self.onReconnect = null;                                                                                    // 46   // 656
                                                                                                              // 47   // 657
  // as a test hook, allow passing a stream instead of a url.                                                 // 48   // 658
  if (typeof url === "object") {                                                                              // 49   // 659
    self._stream = url;                                                                                       // 50   // 660
  } else {                                                                                                    // 51   // 661
    self._stream = new LivedataTest.ClientStream(url, {                                                       // 52   // 662
      retry: options.retry,                                                                                   // 53   // 663
      headers: options.headers,                                                                               // 54   // 664
      _sockjsOptions: options._sockjsOptions,                                                                 // 55   // 665
      // Used to keep some tests quiet, or for other cases in which                                           // 56   // 666
      // the right thing to do with connection errors is to silently                                          // 57   // 667
      // fail (e.g. sending package usage stats). At some point we                                            // 58   // 668
      // should have a real API for handling client-stream-level                                              // 59   // 669
      // errors.                                                                                              // 60   // 670
      _dontPrintErrors: options._dontPrintErrors,                                                             // 61   // 671
      connectTimeoutMs: options.connectTimeoutMs                                                              // 62   // 672
    });                                                                                                       // 63   // 673
  }                                                                                                           // 64   // 674
                                                                                                              // 65   // 675
  self._lastSessionId = null;                                                                                 // 66   // 676
  self._versionSuggestion = null;  // The last proposed DDP version.                                          // 67   // 677
  self._version = null;   // The DDP version agreed on by client and server.                                  // 68   // 678
  self._stores = {}; // name -> object with methods                                                           // 69   // 679
  self._methodHandlers = {}; // name -> func                                                                  // 70   // 680
  self._nextMethodId = 1;                                                                                     // 71   // 681
  self._supportedDDPVersions = options.supportedDDPVersions;                                                  // 72   // 682
                                                                                                              // 73   // 683
  self._heartbeatInterval = options.heartbeatInterval;                                                        // 74   // 684
  self._heartbeatTimeout = options.heartbeatTimeout;                                                          // 75   // 685
                                                                                                              // 76   // 686
  // Tracks methods which the user has tried to call but which have not yet                                   // 77   // 687
  // called their user callback (ie, they are waiting on their result or for all                              // 78   // 688
  // of their writes to be written to the local cache). Map from method ID to                                 // 79   // 689
  // MethodInvoker object.                                                                                    // 80   // 690
  self._methodInvokers = {};                                                                                  // 81   // 691
                                                                                                              // 82   // 692
  // Tracks methods which the user has called but whose result messages have not                              // 83   // 693
  // arrived yet.                                                                                             // 84   // 694
  //                                                                                                          // 85   // 695
  // _outstandingMethodBlocks is an array of blocks of methods. Each block                                    // 86   // 696
  // represents a set of methods that can run at the same time. The first block                               // 87   // 697
  // represents the methods which are currently in flight; subsequent blocks                                  // 88   // 698
  // must wait for previous blocks to be fully finished before they can be sent                               // 89   // 699
  // to the server.                                                                                           // 90   // 700
  //                                                                                                          // 91   // 701
  // Each block is an object with the following fields:                                                       // 92   // 702
  // - methods: a list of MethodInvoker objects                                                               // 93   // 703
  // - wait: a boolean; if true, this block had a single method invoked with                                  // 94   // 704
  //         the "wait" option                                                                                // 95   // 705
  //                                                                                                          // 96   // 706
  // There will never be adjacent blocks with wait=false, because the only thing                              // 97   // 707
  // that makes methods need to be serialized is a wait method.                                               // 98   // 708
  //                                                                                                          // 99   // 709
  // Methods are removed from the first block when their "result" is                                          // 100  // 710
  // received. The entire first block is only removed when all of the in-flight                               // 101  // 711
  // methods have received their results (so the "methods" list is empty) *AND*                               // 102  // 712
  // all of the data written by those methods are visible in the local cache. So                              // 103  // 713
  // it is possible for the first block's methods list to be empty, if we are                                 // 104  // 714
  // still waiting for some objects to quiesce.                                                               // 105  // 715
  //                                                                                                          // 106  // 716
  // Example:                                                                                                 // 107  // 717
  //  _outstandingMethodBlocks = [                                                                            // 108  // 718
  //    {wait: false, methods: []},                                                                           // 109  // 719
  //    {wait: true, methods: [<MethodInvoker for 'login'>]},                                                 // 110  // 720
  //    {wait: false, methods: [<MethodInvoker for 'foo'>,                                                    // 111  // 721
  //                            <MethodInvoker for 'bar'>]}]                                                  // 112  // 722
  // This means that there were some methods which were sent to the server and                                // 113  // 723
  // which have returned their results, but some of the data written by                                       // 114  // 724
  // the methods may not be visible in the local cache. Once all that data is                                 // 115  // 725
  // visible, we will send a 'login' method. Once the login method has returned                               // 116  // 726
  // and all the data is visible (including re-running subs if userId changes),                               // 117  // 727
  // we will send the 'foo' and 'bar' methods in parallel.                                                    // 118  // 728
  self._outstandingMethodBlocks = [];                                                                         // 119  // 729
                                                                                                              // 120  // 730
  // method ID -> array of objects with keys 'collection' and 'id', listing                                   // 121  // 731
  // documents written by a given method's stub. keys are associated with                                     // 122  // 732
  // methods whose stub wrote at least one document, and whose data-done message                              // 123  // 733
  // has not yet been received.                                                                               // 124  // 734
  self._documentsWrittenByStub = {};                                                                          // 125  // 735
  // collection -> IdMap of "server document" object. A "server document" has:                                // 126  // 736
  // - "document": the version of the document according the                                                  // 127  // 737
  //   server (ie, the snapshot before a stub wrote it, amended by any changes                                // 128  // 738
  //   received from the server)                                                                              // 129  // 739
  //   It is undefined if we think the document does not exist                                                // 130  // 740
  // - "writtenByStubs": a set of method IDs whose stubs wrote to the document                                // 131  // 741
  //   whose "data done" messages have not yet been processed                                                 // 132  // 742
  self._serverDocuments = {};                                                                                 // 133  // 743
                                                                                                              // 134  // 744
  // Array of callbacks to be called after the next update of the local                                       // 135  // 745
  // cache. Used for:                                                                                         // 136  // 746
  //  - Calling methodInvoker.dataVisible and sub ready callbacks after                                       // 137  // 747
  //    the relevant data is flushed.                                                                         // 138  // 748
  //  - Invoking the callbacks of "half-finished" methods after reconnect                                     // 139  // 749
  //    quiescence. Specifically, methods whose result was received over the old                              // 140  // 750
  //    connection (so we don't re-send it) but whose data had not been made                                  // 141  // 751
  //    visible.                                                                                              // 142  // 752
  self._afterUpdateCallbacks = [];                                                                            // 143  // 753
                                                                                                              // 144  // 754
  // In two contexts, we buffer all incoming data messages and then process them                              // 145  // 755
  // all at once in a single update:                                                                          // 146  // 756
  //   - During reconnect, we buffer all data messages until all subs that had                                // 147  // 757
  //     been ready before reconnect are ready again, and all methods that are                                // 148  // 758
  //     active have returned their "data done message"; then                                                 // 149  // 759
  //   - During the execution of a "wait" method, we buffer all data messages                                 // 150  // 760
  //     until the wait method gets its "data done" message. (If the wait method                              // 151  // 761
  //     occurs during reconnect, it doesn't get any special handling.)                                       // 152  // 762
  // all data messages are processed in one update.                                                           // 153  // 763
  //                                                                                                          // 154  // 764
  // The following fields are used for this "quiescence" process.                                             // 155  // 765
                                                                                                              // 156  // 766
  // This buffers the messages that aren't being processed yet.                                               // 157  // 767
  self._messagesBufferedUntilQuiescence = [];                                                                 // 158  // 768
  // Map from method ID -> true. Methods are removed from this when their                                     // 159  // 769
  // "data done" message is received, and we will not quiesce until it is                                     // 160  // 770
  // empty.                                                                                                   // 161  // 771
  self._methodsBlockingQuiescence = {};                                                                       // 162  // 772
  // map from sub ID -> true for subs that were ready (ie, called the sub                                     // 163  // 773
  // ready callback) before reconnect but haven't become ready again yet                                      // 164  // 774
  self._subsBeingRevived = {}; // map from sub._id -> true                                                    // 165  // 775
  // if true, the next data update should reset all stores. (set during                                       // 166  // 776
  // reconnect.)                                                                                              // 167  // 777
  self._resetStores = false;                                                                                  // 168  // 778
                                                                                                              // 169  // 779
  // name -> array of updates for (yet to be created) collections                                             // 170  // 780
  self._updatesForUnknownStores = {};                                                                         // 171  // 781
  // if we're blocking a migration, the retry func                                                            // 172  // 782
  self._retryMigrate = null;                                                                                  // 173  // 783
                                                                                                              // 174  // 784
  // metadata for subscriptions.  Map from sub ID to object with keys:                                        // 175  // 785
  //   - id                                                                                                   // 176  // 786
  //   - name                                                                                                 // 177  // 787
  //   - params                                                                                               // 178  // 788
  //   - inactive (if true, will be cleaned up if not reused in re-run)                                       // 179  // 789
  //   - ready (has the 'ready' message been received?)                                                       // 180  // 790
  //   - readyCallback (an optional callback to call when ready)                                              // 181  // 791
  //   - errorCallback (an optional callback to call if the sub terminates with                               // 182  // 792
  //                    an error, XXX COMPAT WITH 1.0.3.1)                                                    // 183  // 793
  //   - stopCallback (an optional callback to call when the sub terminates                                   // 184  // 794
  //     for any reason, with an error argument if an error triggered the stop)                               // 185  // 795
  self._subscriptions = {};                                                                                   // 186  // 796
                                                                                                              // 187  // 797
  // Reactive userId.                                                                                         // 188  // 798
  self._userId = null;                                                                                        // 189  // 799
  self._userIdDeps = new Tracker.Dependency;                                                                  // 190  // 800
                                                                                                              // 191  // 801
  // Block auto-reload while we're waiting for method responses.                                              // 192  // 802
  if (Meteor.isClient && Package.reload && !options.reloadWithOutstanding) {                                  // 193  // 803
    Package.reload.Reload._onMigrate(function (retry) {                                                       // 194  // 804
      if (!self._readyToMigrate()) {                                                                          // 195  // 805
        if (self._retryMigrate)                                                                               // 196  // 806
          throw new Error("Two migrations in progress?");                                                     // 197  // 807
        self._retryMigrate = retry;                                                                           // 198  // 808
        return false;                                                                                         // 199  // 809
      } else {                                                                                                // 200  // 810
        return [true];                                                                                        // 201  // 811
      }                                                                                                       // 202  // 812
    });                                                                                                       // 203  // 813
  }                                                                                                           // 204  // 814
                                                                                                              // 205  // 815
  var onMessage = function (raw_msg) {                                                                        // 206  // 816
    try {                                                                                                     // 207  // 817
      var msg = DDPCommon.parseDDP(raw_msg);                                                                  // 208  // 818
    } catch (e) {                                                                                             // 209  // 819
      Meteor._debug("Exception while parsing DDP", e);                                                        // 210  // 820
      return;                                                                                                 // 211  // 821
    }                                                                                                         // 212  // 822
                                                                                                              // 213  // 823
    // Any message counts as receiving a pong, as it demonstrates that                                        // 214  // 824
    // the server is still alive.                                                                             // 215  // 825
    if (self._heartbeat) {                                                                                    // 216  // 826
      self._heartbeat.messageReceived();                                                                      // 217  // 827
    }                                                                                                         // 218  // 828
                                                                                                              // 219  // 829
    if (msg === null || !msg.msg) {                                                                           // 220  // 830
      // XXX COMPAT WITH 0.6.6. ignore the old welcome message for back                                       // 221  // 831
      // compat.  Remove this 'if' once the server stops sending welcome                                      // 222  // 832
      // messages (stream_server.js).                                                                         // 223  // 833
      if (! (msg && msg.server_id))                                                                           // 224  // 834
        Meteor._debug("discarding invalid livedata message", msg);                                            // 225  // 835
      return;                                                                                                 // 226  // 836
    }                                                                                                         // 227  // 837
                                                                                                              // 228  // 838
    if (msg.msg === 'connected') {                                                                            // 229  // 839
      self._version = self._versionSuggestion;                                                                // 230  // 840
      self._livedata_connected(msg);                                                                          // 231  // 841
      options.onConnected();                                                                                  // 232  // 842
    }                                                                                                         // 233  // 843
    else if (msg.msg === 'failed') {                                                                          // 234  // 844
      if (_.contains(self._supportedDDPVersions, msg.version)) {                                              // 235  // 845
        self._versionSuggestion = msg.version;                                                                // 236  // 846
        self._stream.reconnect({_force: true});                                                               // 237  // 847
      } else {                                                                                                // 238  // 848
        var description =                                                                                     // 239  // 849
              "DDP version negotiation failed; server requested version " + msg.version;                      // 240  // 850
        self._stream.disconnect({_permanent: true, _error: description});                                     // 241  // 851
        options.onDDPVersionNegotiationFailure(description);                                                  // 242  // 852
      }                                                                                                       // 243  // 853
    }                                                                                                         // 244  // 854
    else if (msg.msg === 'ping' && options.respondToPings) {                                                  // 245  // 855
      self._send({msg: "pong", id: msg.id});                                                                  // 246  // 856
    }                                                                                                         // 247  // 857
    else if (msg.msg === 'pong') {                                                                            // 248  // 858
      // noop, as we assume everything's a pong                                                               // 249  // 859
    }                                                                                                         // 250  // 860
    else if (_.include(['added', 'changed', 'removed', 'ready', 'updated'], msg.msg))                         // 251  // 861
      self._livedata_data(msg);                                                                               // 252  // 862
    else if (msg.msg === 'nosub')                                                                             // 253  // 863
      self._livedata_nosub(msg);                                                                              // 254  // 864
    else if (msg.msg === 'result')                                                                            // 255  // 865
      self._livedata_result(msg);                                                                             // 256  // 866
    else if (msg.msg === 'error')                                                                             // 257  // 867
      self._livedata_error(msg);                                                                              // 258  // 868
    else                                                                                                      // 259  // 869
      Meteor._debug("discarding unknown livedata message type", msg);                                         // 260  // 870
  };                                                                                                          // 261  // 871
                                                                                                              // 262  // 872
  var onReset = function () {                                                                                 // 263  // 873
    // Send a connect message at the beginning of the stream.                                                 // 264  // 874
    // NOTE: reset is called even on the first connection, so this is                                         // 265  // 875
    // the only place we send this message.                                                                   // 266  // 876
    var msg = {msg: 'connect'};                                                                               // 267  // 877
    if (self._lastSessionId)                                                                                  // 268  // 878
      msg.session = self._lastSessionId;                                                                      // 269  // 879
    msg.version = self._versionSuggestion || self._supportedDDPVersions[0];                                   // 270  // 880
    self._versionSuggestion = msg.version;                                                                    // 271  // 881
    msg.support = self._supportedDDPVersions;                                                                 // 272  // 882
    self._send(msg);                                                                                          // 273  // 883
                                                                                                              // 274  // 884
    // Now, to minimize setup latency, go ahead and blast out all of                                          // 275  // 885
    // our pending methods ands subscriptions before we've even taken                                         // 276  // 886
    // the necessary RTT to know if we successfully reconnected. (1)                                          // 277  // 887
    // They're supposed to be idempotent; (2) even if we did                                                  // 278  // 888
    // reconnect, we're not sure what messages might have gotten lost                                         // 279  // 889
    // (in either direction) since we were disconnected (TCP being                                            // 280  // 890
    // sloppy about that.)                                                                                    // 281  // 891
                                                                                                              // 282  // 892
    // If the current block of methods all got their results (but didn't all get                              // 283  // 893
    // their data visible), discard the empty block now.                                                      // 284  // 894
    if (! _.isEmpty(self._outstandingMethodBlocks) &&                                                         // 285  // 895
        _.isEmpty(self._outstandingMethodBlocks[0].methods)) {                                                // 286  // 896
      self._outstandingMethodBlocks.shift();                                                                  // 287  // 897
    }                                                                                                         // 288  // 898
                                                                                                              // 289  // 899
    // Mark all messages as unsent, they have not yet been sent on this                                       // 290  // 900
    // connection.                                                                                            // 291  // 901
    _.each(self._methodInvokers, function (m) {                                                               // 292  // 902
      m.sentMessage = false;                                                                                  // 293  // 903
    });                                                                                                       // 294  // 904
                                                                                                              // 295  // 905
    // If an `onReconnect` handler is set, call it first. Go through                                          // 296  // 906
    // some hoops to ensure that methods that are called from within                                          // 297  // 907
    // `onReconnect` get executed _before_ ones that were originally                                          // 298  // 908
    // outstanding (since `onReconnect` is used to re-establish auth                                          // 299  // 909
    // certificates)                                                                                          // 300  // 910
    if (self.onReconnect)                                                                                     // 301  // 911
      self._callOnReconnectAndSendAppropriateOutstandingMethods();                                            // 302  // 912
    else                                                                                                      // 303  // 913
      self._sendOutstandingMethods();                                                                         // 304  // 914
                                                                                                              // 305  // 915
    // add new subscriptions at the end. this way they take effect after                                      // 306  // 916
    // the handlers and we don't see flicker.                                                                 // 307  // 917
    _.each(self._subscriptions, function (sub, id) {                                                          // 308  // 918
      self._send({                                                                                            // 309  // 919
        msg: 'sub',                                                                                           // 310  // 920
        id: id,                                                                                               // 311  // 921
        name: sub.name,                                                                                       // 312  // 922
        params: sub.params                                                                                    // 313  // 923
      });                                                                                                     // 314  // 924
    });                                                                                                       // 315  // 925
  };                                                                                                          // 316  // 926
                                                                                                              // 317  // 927
  var onDisconnect = function () {                                                                            // 318  // 928
    if (self._heartbeat) {                                                                                    // 319  // 929
      self._heartbeat.stop();                                                                                 // 320  // 930
      self._heartbeat = null;                                                                                 // 321  // 931
    }                                                                                                         // 322  // 932
  };                                                                                                          // 323  // 933
                                                                                                              // 324  // 934
  if (Meteor.isServer) {                                                                                      // 325  // 935
    self._stream.on('message', Meteor.bindEnvironment(onMessage, "handling DDP message"));                    // 326  // 936
    self._stream.on('reset', Meteor.bindEnvironment(onReset, "handling DDP reset"));                          // 327  // 937
    self._stream.on('disconnect', Meteor.bindEnvironment(onDisconnect, "handling DDP disconnect"));           // 328  // 938
  } else {                                                                                                    // 329  // 939
    self._stream.on('message', onMessage);                                                                    // 330  // 940
    self._stream.on('reset', onReset);                                                                        // 331  // 941
    self._stream.on('disconnect', onDisconnect);                                                              // 332  // 942
  }                                                                                                           // 333  // 943
};                                                                                                            // 334  // 944
                                                                                                              // 335  // 945
// A MethodInvoker manages sending a method to the server and calling the user's                              // 336  // 946
// callbacks. On construction, it registers itself in the connection's                                        // 337  // 947
// _methodInvokers map; it removes itself once the method is fully finished and                               // 338  // 948
// the callback is invoked. This occurs when it has both received a result,                                   // 339  // 949
// and the data written by it is fully visible.                                                               // 340  // 950
var MethodInvoker = function (options) {                                                                      // 341  // 951
  var self = this;                                                                                            // 342  // 952
                                                                                                              // 343  // 953
  // Public (within this file) fields.                                                                        // 344  // 954
  self.methodId = options.methodId;                                                                           // 345  // 955
  self.sentMessage = false;                                                                                   // 346  // 956
                                                                                                              // 347  // 957
  self._callback = options.callback;                                                                          // 348  // 958
  self._connection = options.connection;                                                                      // 349  // 959
  self._message = options.message;                                                                            // 350  // 960
  self._onResultReceived = options.onResultReceived || function () {};                                        // 351  // 961
  self._wait = options.wait;                                                                                  // 352  // 962
  self._methodResult = null;                                                                                  // 353  // 963
  self._dataVisible = false;                                                                                  // 354  // 964
                                                                                                              // 355  // 965
  // Register with the connection.                                                                            // 356  // 966
  self._connection._methodInvokers[self.methodId] = self;                                                     // 357  // 967
};                                                                                                            // 358  // 968
_.extend(MethodInvoker.prototype, {                                                                           // 359  // 969
  // Sends the method message to the server. May be called additional times if                                // 360  // 970
  // we lose the connection and reconnect before receiving a result.                                          // 361  // 971
  sendMessage: function () {                                                                                  // 362  // 972
    var self = this;                                                                                          // 363  // 973
    // This function is called before sending a method (including resending on                                // 364  // 974
    // reconnect). We should only (re)send methods where we don't already have a                              // 365  // 975
    // result!                                                                                                // 366  // 976
    if (self.gotResult())                                                                                     // 367  // 977
      throw new Error("sendingMethod is called on method with result");                                       // 368  // 978
                                                                                                              // 369  // 979
    // If we're re-sending it, it doesn't matter if data was written the first                                // 370  // 980
    // time.                                                                                                  // 371  // 981
    self._dataVisible = false;                                                                                // 372  // 982
                                                                                                              // 373  // 983
    self.sentMessage = true;                                                                                  // 374  // 984
                                                                                                              // 375  // 985
    // If this is a wait method, make all data messages be buffered until it is                               // 376  // 986
    // done.                                                                                                  // 377  // 987
    if (self._wait)                                                                                           // 378  // 988
      self._connection._methodsBlockingQuiescence[self.methodId] = true;                                      // 379  // 989
                                                                                                              // 380  // 990
    // Actually send the message.                                                                             // 381  // 991
    self._connection._send(self._message);                                                                    // 382  // 992
  },                                                                                                          // 383  // 993
  // Invoke the callback, if we have both a result and know that all data has                                 // 384  // 994
  // been written to the local cache.                                                                         // 385  // 995
  _maybeInvokeCallback: function () {                                                                         // 386  // 996
    var self = this;                                                                                          // 387  // 997
    if (self._methodResult && self._dataVisible) {                                                            // 388  // 998
      // Call the callback. (This won't throw: the callback was wrapped with                                  // 389  // 999
      // bindEnvironment.)                                                                                    // 390  // 1000
      self._callback(self._methodResult[0], self._methodResult[1]);                                           // 391  // 1001
                                                                                                              // 392  // 1002
      // Forget about this method.                                                                            // 393  // 1003
      delete self._connection._methodInvokers[self.methodId];                                                 // 394  // 1004
                                                                                                              // 395  // 1005
      // Let the connection know that this method is finished, so it can try to                               // 396  // 1006
      // move on to the next block of methods.                                                                // 397  // 1007
      self._connection._outstandingMethodFinished();                                                          // 398  // 1008
    }                                                                                                         // 399  // 1009
  },                                                                                                          // 400  // 1010
  // Call with the result of the method from the server. Only may be called                                   // 401  // 1011
  // once; once it is called, you should not call sendMessage again.                                          // 402  // 1012
  // If the user provided an onResultReceived callback, call it immediately.                                  // 403  // 1013
  // Then invoke the main callback if data is also visible.                                                   // 404  // 1014
  receiveResult: function (err, result) {                                                                     // 405  // 1015
    var self = this;                                                                                          // 406  // 1016
    if (self.gotResult())                                                                                     // 407  // 1017
      throw new Error("Methods should only receive results once");                                            // 408  // 1018
    self._methodResult = [err, result];                                                                       // 409  // 1019
    self._onResultReceived(err, result);                                                                      // 410  // 1020
    self._maybeInvokeCallback();                                                                              // 411  // 1021
  },                                                                                                          // 412  // 1022
  // Call this when all data written by the method is visible. This means that                                // 413  // 1023
  // the method has returns its "data is done" message *AND* all server                                       // 414  // 1024
  // documents that are buffered at that time have been written to the local                                  // 415  // 1025
  // cache. Invokes the main callback if the result has been received.                                        // 416  // 1026
  dataVisible: function () {                                                                                  // 417  // 1027
    var self = this;                                                                                          // 418  // 1028
    self._dataVisible = true;                                                                                 // 419  // 1029
    self._maybeInvokeCallback();                                                                              // 420  // 1030
  },                                                                                                          // 421  // 1031
  // True if receiveResult has been called.                                                                   // 422  // 1032
  gotResult: function () {                                                                                    // 423  // 1033
    var self = this;                                                                                          // 424  // 1034
    return !!self._methodResult;                                                                              // 425  // 1035
  }                                                                                                           // 426  // 1036
});                                                                                                           // 427  // 1037
                                                                                                              // 428  // 1038
_.extend(Connection.prototype, {                                                                              // 429  // 1039
  // 'name' is the name of the data on the wire that should go in the                                         // 430  // 1040
  // store. 'wrappedStore' should be an object with methods beginUpdate, update,                              // 431  // 1041
  // endUpdate, saveOriginals, retrieveOriginals. see Collection for an example.                              // 432  // 1042
  registerStore: function (name, wrappedStore) {                                                              // 433  // 1043
    var self = this;                                                                                          // 434  // 1044
                                                                                                              // 435  // 1045
    if (name in self._stores)                                                                                 // 436  // 1046
      return false;                                                                                           // 437  // 1047
                                                                                                              // 438  // 1048
    // Wrap the input object in an object which makes any store method not                                    // 439  // 1049
    // implemented by 'store' into a no-op.                                                                   // 440  // 1050
    var store = {};                                                                                           // 441  // 1051
    _.each(['update', 'beginUpdate', 'endUpdate', 'saveOriginals',                                            // 442  // 1052
            'retrieveOriginals', 'getDoc'], function (method) {                                               // 443  // 1053
              store[method] = function () {                                                                   // 444  // 1054
                return (wrappedStore[method]                                                                  // 445  // 1055
                        ? wrappedStore[method].apply(wrappedStore, arguments)                                 // 446  // 1056
                        : undefined);                                                                         // 447  // 1057
              };                                                                                              // 448  // 1058
            });                                                                                               // 449  // 1059
                                                                                                              // 450  // 1060
    self._stores[name] = store;                                                                               // 451  // 1061
                                                                                                              // 452  // 1062
    var queued = self._updatesForUnknownStores[name];                                                         // 453  // 1063
    if (queued) {                                                                                             // 454  // 1064
      store.beginUpdate(queued.length, false);                                                                // 455  // 1065
      _.each(queued, function (msg) {                                                                         // 456  // 1066
        store.update(msg);                                                                                    // 457  // 1067
      });                                                                                                     // 458  // 1068
      store.endUpdate();                                                                                      // 459  // 1069
      delete self._updatesForUnknownStores[name];                                                             // 460  // 1070
    }                                                                                                         // 461  // 1071
                                                                                                              // 462  // 1072
    return true;                                                                                              // 463  // 1073
  },                                                                                                          // 464  // 1074
                                                                                                              // 465  // 1075
  /**                                                                                                         // 466  // 1076
   * @memberOf Meteor                                                                                         // 467  // 1077
   * @summary Subscribe to a record set.  Returns a handle that provides                                      // 468  // 1078
   * `stop()` and `ready()` methods.                                                                          // 469  // 1079
   * @locus Client                                                                                            // 470  // 1080
   * @param {String} name Name of the subscription.  Matches the name of the                                  // 471  // 1081
   * server's `publish()` call.                                                                               // 472  // 1082
   * @param {Any} [arg1,arg2...] Optional arguments passed to publisher                                       // 473  // 1083
   * function on server.                                                                                      // 474  // 1084
   * @param {Function|Object} [callbacks] Optional. May include `onStop`                                      // 475  // 1085
   * and `onReady` callbacks. If there is an error, it is passed as an                                        // 476  // 1086
   * argument to `onStop`. If a function is passed instead of an object, it                                   // 477  // 1087
   * is interpreted as an `onReady` callback.                                                                 // 478  // 1088
   */                                                                                                         // 479  // 1089
  subscribe: function (name /* .. [arguments] .. (callback|callbacks) */) {                                   // 480  // 1090
    var self = this;                                                                                          // 481  // 1091
                                                                                                              // 482  // 1092
    var params = Array.prototype.slice.call(arguments, 1);                                                    // 483  // 1093
    var callbacks = {};                                                                                       // 484  // 1094
    if (params.length) {                                                                                      // 485  // 1095
      var lastParam = params[params.length - 1];                                                              // 486  // 1096
      if (_.isFunction(lastParam)) {                                                                          // 487  // 1097
        callbacks.onReady = params.pop();                                                                     // 488  // 1098
      } else if (lastParam &&                                                                                 // 489  // 1099
        // XXX COMPAT WITH 1.0.3.1 onError used to exist, but now we use                                      // 490  // 1100
        // onStop with an error callback instead.                                                             // 491  // 1101
        _.any([lastParam.onReady, lastParam.onError, lastParam.onStop],                                       // 492  // 1102
          _.isFunction)) {                                                                                    // 493  // 1103
        callbacks = params.pop();                                                                             // 494  // 1104
      }                                                                                                       // 495  // 1105
    }                                                                                                         // 496  // 1106
                                                                                                              // 497  // 1107
    // Is there an existing sub with the same name and param, run in an                                       // 498  // 1108
    // invalidated Computation? This will happen if we are rerunning an                                       // 499  // 1109
    // existing computation.                                                                                  // 500  // 1110
    //                                                                                                        // 501  // 1111
    // For example, consider a rerun of:                                                                      // 502  // 1112
    //                                                                                                        // 503  // 1113
    //     Tracker.autorun(function () {                                                                      // 504  // 1114
    //       Meteor.subscribe("foo", Session.get("foo"));                                                     // 505  // 1115
    //       Meteor.subscribe("bar", Session.get("bar"));                                                     // 506  // 1116
    //     });                                                                                                // 507  // 1117
    //                                                                                                        // 508  // 1118
    // If "foo" has changed but "bar" has not, we will match the "bar"                                        // 509  // 1119
    // subcribe to an existing inactive subscription in order to not                                          // 510  // 1120
    // unsub and resub the subscription unnecessarily.                                                        // 511  // 1121
    //                                                                                                        // 512  // 1122
    // We only look for one such sub; if there are N apparently-identical subs                                // 513  // 1123
    // being invalidated, we will require N matching subscribe calls to keep                                  // 514  // 1124
    // them all active.                                                                                       // 515  // 1125
    var existing = _.find(self._subscriptions, function (sub) {                                               // 516  // 1126
      return sub.inactive && sub.name === name &&                                                             // 517  // 1127
        EJSON.equals(sub.params, params);                                                                     // 518  // 1128
    });                                                                                                       // 519  // 1129
                                                                                                              // 520  // 1130
    var id;                                                                                                   // 521  // 1131
    if (existing) {                                                                                           // 522  // 1132
      id = existing.id;                                                                                       // 523  // 1133
      existing.inactive = false; // reactivate                                                                // 524  // 1134
                                                                                                              // 525  // 1135
      if (callbacks.onReady) {                                                                                // 526  // 1136
        // If the sub is not already ready, replace any ready callback with the                               // 527  // 1137
        // one provided now. (It's not really clear what users would expect for                               // 528  // 1138
        // an onReady callback inside an autorun; the semantics we provide is                                 // 529  // 1139
        // that at the time the sub first becomes ready, we call the last                                     // 530  // 1140
        // onReady callback provided, if any.)                                                                // 531  // 1141
        if (!existing.ready)                                                                                  // 532  // 1142
          existing.readyCallback = callbacks.onReady;                                                         // 533  // 1143
      }                                                                                                       // 534  // 1144
                                                                                                              // 535  // 1145
      // XXX COMPAT WITH 1.0.3.1 we used to have onError but now we call                                      // 536  // 1146
      // onStop with an optional error argument                                                               // 537  // 1147
      if (callbacks.onError) {                                                                                // 538  // 1148
        // Replace existing callback if any, so that errors aren't                                            // 539  // 1149
        // double-reported.                                                                                   // 540  // 1150
        existing.errorCallback = callbacks.onError;                                                           // 541  // 1151
      }                                                                                                       // 542  // 1152
                                                                                                              // 543  // 1153
      if (callbacks.onStop) {                                                                                 // 544  // 1154
        existing.stopCallback = callbacks.onStop;                                                             // 545  // 1155
      }                                                                                                       // 546  // 1156
    } else {                                                                                                  // 547  // 1157
      // New sub! Generate an id, save it locally, and send message.                                          // 548  // 1158
      id = Random.id();                                                                                       // 549  // 1159
      self._subscriptions[id] = {                                                                             // 550  // 1160
        id: id,                                                                                               // 551  // 1161
        name: name,                                                                                           // 552  // 1162
        params: EJSON.clone(params),                                                                          // 553  // 1163
        inactive: false,                                                                                      // 554  // 1164
        ready: false,                                                                                         // 555  // 1165
        readyDeps: new Tracker.Dependency,                                                                    // 556  // 1166
        readyCallback: callbacks.onReady,                                                                     // 557  // 1167
        // XXX COMPAT WITH 1.0.3.1 #errorCallback                                                             // 558  // 1168
        errorCallback: callbacks.onError,                                                                     // 559  // 1169
        stopCallback: callbacks.onStop,                                                                       // 560  // 1170
        connection: self,                                                                                     // 561  // 1171
        remove: function() {                                                                                  // 562  // 1172
          delete this.connection._subscriptions[this.id];                                                     // 563  // 1173
          this.ready && this.readyDeps.changed();                                                             // 564  // 1174
        },                                                                                                    // 565  // 1175
        stop: function() {                                                                                    // 566  // 1176
          this.connection._send({msg: 'unsub', id: id});                                                      // 567  // 1177
          this.remove();                                                                                      // 568  // 1178
                                                                                                              // 569  // 1179
          if (callbacks.onStop) {                                                                             // 570  // 1180
            callbacks.onStop();                                                                               // 571  // 1181
          }                                                                                                   // 572  // 1182
        }                                                                                                     // 573  // 1183
      };                                                                                                      // 574  // 1184
      self._send({msg: 'sub', id: id, name: name, params: params});                                           // 575  // 1185
    }                                                                                                         // 576  // 1186
                                                                                                              // 577  // 1187
    // return a handle to the application.                                                                    // 578  // 1188
    var handle = {                                                                                            // 579  // 1189
      stop: function () {                                                                                     // 580  // 1190
        if (!_.has(self._subscriptions, id))                                                                  // 581  // 1191
          return;                                                                                             // 582  // 1192
                                                                                                              // 583  // 1193
        self._subscriptions[id].stop();                                                                       // 584  // 1194
      },                                                                                                      // 585  // 1195
      ready: function () {                                                                                    // 586  // 1196
        // return false if we've unsubscribed.                                                                // 587  // 1197
        if (!_.has(self._subscriptions, id))                                                                  // 588  // 1198
          return false;                                                                                       // 589  // 1199
        var record = self._subscriptions[id];                                                                 // 590  // 1200
        record.readyDeps.depend();                                                                            // 591  // 1201
        return record.ready;                                                                                  // 592  // 1202
      },                                                                                                      // 593  // 1203
      subscriptionId: id                                                                                      // 594  // 1204
    };                                                                                                        // 595  // 1205
                                                                                                              // 596  // 1206
    if (Tracker.active) {                                                                                     // 597  // 1207
      // We're in a reactive computation, so we'd like to unsubscribe when the                                // 598  // 1208
      // computation is invalidated... but not if the rerun just re-subscribes                                // 599  // 1209
      // to the same subscription!  When a rerun happens, we use onInvalidate                                 // 600  // 1210
      // as a change to mark the subscription "inactive" so that it can                                       // 601  // 1211
      // be reused from the rerun.  If it isn't reused, it's killed from                                      // 602  // 1212
      // an afterFlush.                                                                                       // 603  // 1213
      Tracker.onInvalidate(function (c) {                                                                     // 604  // 1214
        if (_.has(self._subscriptions, id))                                                                   // 605  // 1215
          self._subscriptions[id].inactive = true;                                                            // 606  // 1216
                                                                                                              // 607  // 1217
        Tracker.afterFlush(function () {                                                                      // 608  // 1218
          if (_.has(self._subscriptions, id) &&                                                               // 609  // 1219
              self._subscriptions[id].inactive)                                                               // 610  // 1220
            handle.stop();                                                                                    // 611  // 1221
        });                                                                                                   // 612  // 1222
      });                                                                                                     // 613  // 1223
    }                                                                                                         // 614  // 1224
                                                                                                              // 615  // 1225
    return handle;                                                                                            // 616  // 1226
  },                                                                                                          // 617  // 1227
                                                                                                              // 618  // 1228
  // options:                                                                                                 // 619  // 1229
  // - onLateError {Function(error)} called if an error was received after the ready event.                   // 620  // 1230
  //     (errors received before ready cause an error to be thrown)                                           // 621  // 1231
  _subscribeAndWait: function (name, args, options) {                                                         // 622  // 1232
    var self = this;                                                                                          // 623  // 1233
    var f = new Future();                                                                                     // 624  // 1234
    var ready = false;                                                                                        // 625  // 1235
    var handle;                                                                                               // 626  // 1236
    args = args || [];                                                                                        // 627  // 1237
    args.push({                                                                                               // 628  // 1238
      onReady: function () {                                                                                  // 629  // 1239
        ready = true;                                                                                         // 630  // 1240
        f['return']();                                                                                        // 631  // 1241
      },                                                                                                      // 632  // 1242
      onError: function (e) {                                                                                 // 633  // 1243
        if (!ready)                                                                                           // 634  // 1244
          f['throw'](e);                                                                                      // 635  // 1245
        else                                                                                                  // 636  // 1246
          options && options.onLateError && options.onLateError(e);                                           // 637  // 1247
      }                                                                                                       // 638  // 1248
    });                                                                                                       // 639  // 1249
                                                                                                              // 640  // 1250
    handle = self.subscribe.apply(self, [name].concat(args));                                                 // 641  // 1251
    f.wait();                                                                                                 // 642  // 1252
    return handle;                                                                                            // 643  // 1253
  },                                                                                                          // 644  // 1254
                                                                                                              // 645  // 1255
  methods: function (methods) {                                                                               // 646  // 1256
    var self = this;                                                                                          // 647  // 1257
    _.each(methods, function (func, name) {                                                                   // 648  // 1258
      if (typeof func !== 'function')                                                                         // 649  // 1259
        throw new Error("Method '" + name + "' must be a function");                                          // 650  // 1260
      if (self._methodHandlers[name])                                                                         // 651  // 1261
        throw new Error("A method named '" + name + "' is already defined");                                  // 652  // 1262
      self._methodHandlers[name] = func;                                                                      // 653  // 1263
    });                                                                                                       // 654  // 1264
  },                                                                                                          // 655  // 1265
                                                                                                              // 656  // 1266
  /**                                                                                                         // 657  // 1267
   * @memberOf Meteor                                                                                         // 658  // 1268
   * @summary Invokes a method passing any number of arguments.                                               // 659  // 1269
   * @locus Anywhere                                                                                          // 660  // 1270
   * @param {String} name Name of method to invoke                                                            // 661  // 1271
   * @param {EJSONable} [arg1,arg2...] Optional method arguments                                              // 662  // 1272
   * @param {Function} [asyncCallback] Optional callback, which is called asynchronously with the error or result after the method is complete. If not provided, the method runs synchronously if possible (see below).
   */                                                                                                         // 664  // 1274
  call: function (name /* .. [arguments] .. callback */) {                                                    // 665  // 1275
    // if it's a function, the last argument is the result callback,                                          // 666  // 1276
    // not a parameter to the remote method.                                                                  // 667  // 1277
    var args = Array.prototype.slice.call(arguments, 1);                                                      // 668  // 1278
    if (args.length && typeof args[args.length - 1] === "function")                                           // 669  // 1279
      var callback = args.pop();                                                                              // 670  // 1280
    return this.apply(name, args, callback);                                                                  // 671  // 1281
  },                                                                                                          // 672  // 1282
                                                                                                              // 673  // 1283
  // @param options {Optional Object}                                                                         // 674  // 1284
  //   wait: Boolean - Should we wait to call this until all current methods                                  // 675  // 1285
  //                   are fully finished, and block subsequent method calls                                  // 676  // 1286
  //                   until this method is fully finished?                                                   // 677  // 1287
  //                   (does not affect methods called from within this method)                               // 678  // 1288
  //   onResultReceived: Function - a callback to call as soon as the method                                  // 679  // 1289
  //                                result is received. the data written by                                   // 680  // 1290
  //                                the method may not yet be in the cache!                                   // 681  // 1291
  //   returnStubValue: Boolean - If true then in cases where we would have                                   // 682  // 1292
  //                              otherwise discarded the stub's return value                                 // 683  // 1293
  //                              and returned undefined, instead we go ahead                                 // 684  // 1294
  //                              and return it.  Specifically, this is any                                   // 685  // 1295
  //                              time other than when (a) we are already                                     // 686  // 1296
  //                              inside a stub or (b) we are in Node and no                                  // 687  // 1297
  //                              callback was provided.  Currently we require                                // 688  // 1298
  //                              this flag to be explicitly passed to reduce                                 // 689  // 1299
  //                              the likelihood that stub return values will                                 // 690  // 1300
  //                              be confused with server return values; we                                   // 691  // 1301
  //                              may improve this in future.                                                 // 692  // 1302
  // @param callback {Optional Function}                                                                      // 693  // 1303
                                                                                                              // 694  // 1304
  /**                                                                                                         // 695  // 1305
   * @memberOf Meteor                                                                                         // 696  // 1306
   * @summary Invoke a method passing an array of arguments.                                                  // 697  // 1307
   * @locus Anywhere                                                                                          // 698  // 1308
   * @param {String} name Name of method to invoke                                                            // 699  // 1309
   * @param {EJSONable[]} args Method arguments                                                               // 700  // 1310
   * @param {Object} [options]                                                                                // 701  // 1311
   * @param {Boolean} options.wait (Client only) If true, don't send this method until all previous method calls have completed, and don't send any subsequent method calls until this one is completed.
   * @param {Function} options.onResultReceived (Client only) This callback is invoked with the error or result of the method (just like `asyncCallback`) as soon as the error or result is available. The local cache may not yet reflect the writes performed by the method.
   * @param {Function} [asyncCallback] Optional callback; same semantics as in [`Meteor.call`](#meteor_call).         // 1314
   */                                                                                                         // 705  // 1315
  apply: function (name, args, options, callback) {                                                           // 706  // 1316
    var self = this;                                                                                          // 707  // 1317
                                                                                                              // 708  // 1318
    // We were passed 3 arguments. They may be either (name, args, options)                                   // 709  // 1319
    // or (name, args, callback)                                                                              // 710  // 1320
    if (!callback && typeof options === 'function') {                                                         // 711  // 1321
      callback = options;                                                                                     // 712  // 1322
      options = {};                                                                                           // 713  // 1323
    }                                                                                                         // 714  // 1324
    options = options || {};                                                                                  // 715  // 1325
                                                                                                              // 716  // 1326
    if (callback) {                                                                                           // 717  // 1327
      // XXX would it be better form to do the binding in stream.on,                                          // 718  // 1328
      // or caller, instead of here?                                                                          // 719  // 1329
      // XXX improve error message (and how we report it)                                                     // 720  // 1330
      callback = Meteor.bindEnvironment(                                                                      // 721  // 1331
        callback,                                                                                             // 722  // 1332
        "delivering result of invoking '" + name + "'"                                                        // 723  // 1333
      );                                                                                                      // 724  // 1334
    }                                                                                                         // 725  // 1335
                                                                                                              // 726  // 1336
    // Keep our args safe from mutation (eg if we don't send the message for a                                // 727  // 1337
    // while because of a wait method).                                                                       // 728  // 1338
    args = EJSON.clone(args);                                                                                 // 729  // 1339
                                                                                                              // 730  // 1340
    // Lazily allocate method ID once we know that it'll be needed.                                           // 731  // 1341
    var methodId = (function () {                                                                             // 732  // 1342
      var id;                                                                                                 // 733  // 1343
      return function () {                                                                                    // 734  // 1344
        if (id === undefined)                                                                                 // 735  // 1345
          id = '' + (self._nextMethodId++);                                                                   // 736  // 1346
        return id;                                                                                            // 737  // 1347
      };                                                                                                      // 738  // 1348
    })();                                                                                                     // 739  // 1349
                                                                                                              // 740  // 1350
    var enclosing = DDP._CurrentInvocation.get();                                                             // 741  // 1351
    var alreadyInSimulation = enclosing && enclosing.isSimulation;                                            // 742  // 1352
                                                                                                              // 743  // 1353
    // Lazily generate a randomSeed, only if it is requested by the stub.                                     // 744  // 1354
    // The random streams only have utility if they're used on both the client                                // 745  // 1355
    // and the server; if the client doesn't generate any 'random' values                                     // 746  // 1356
    // then we don't expect the server to generate any either.                                                // 747  // 1357
    // Less commonly, the server may perform different actions from the client,                               // 748  // 1358
    // and may in fact generate values where the client did not, but we don't                                 // 749  // 1359
    // have any client-side values to match, so even here we may as well just                                 // 750  // 1360
    // use a random seed on the server.  In that case, we don't pass the                                      // 751  // 1361
    // randomSeed to save bandwidth, and we don't even generate it to save a                                  // 752  // 1362
    // bit of CPU and to avoid consuming entropy.                                                             // 753  // 1363
    var randomSeed = null;                                                                                    // 754  // 1364
    var randomSeedGenerator = function () {                                                                   // 755  // 1365
      if (randomSeed === null) {                                                                              // 756  // 1366
        randomSeed = DDPCommon.makeRpcSeed(enclosing, name);                                                  // 757  // 1367
      }                                                                                                       // 758  // 1368
      return randomSeed;                                                                                      // 759  // 1369
    };                                                                                                        // 760  // 1370
                                                                                                              // 761  // 1371
    // Run the stub, if we have one. The stub is supposed to make some                                        // 762  // 1372
    // temporary writes to the database to give the user a smooth experience                                  // 763  // 1373
    // until the actual result of executing the method comes back from the                                    // 764  // 1374
    // server (whereupon the temporary writes to the database will be reversed                                // 765  // 1375
    // during the beginUpdate/endUpdate process.)                                                             // 766  // 1376
    //                                                                                                        // 767  // 1377
    // Normally, we ignore the return value of the stub (even if it is an                                     // 768  // 1378
    // exception), in favor of the real return value from the server. The                                     // 769  // 1379
    // exception is if the *caller* is a stub. In that case, we're not going                                  // 770  // 1380
    // to do a RPC, so we use the return value of the stub as our return                                      // 771  // 1381
    // value.                                                                                                 // 772  // 1382
                                                                                                              // 773  // 1383
    var stub = self._methodHandlers[name];                                                                    // 774  // 1384
    if (stub) {                                                                                               // 775  // 1385
      var setUserId = function(userId) {                                                                      // 776  // 1386
        self.setUserId(userId);                                                                               // 777  // 1387
      };                                                                                                      // 778  // 1388
                                                                                                              // 779  // 1389
      var invocation = new DDPCommon.MethodInvocation({                                                       // 780  // 1390
        isSimulation: true,                                                                                   // 781  // 1391
        userId: self.userId(),                                                                                // 782  // 1392
        setUserId: setUserId,                                                                                 // 783  // 1393
        randomSeed: function () { return randomSeedGenerator(); }                                             // 784  // 1394
      });                                                                                                     // 785  // 1395
                                                                                                              // 786  // 1396
      if (!alreadyInSimulation)                                                                               // 787  // 1397
        self._saveOriginals();                                                                                // 788  // 1398
                                                                                                              // 789  // 1399
      try {                                                                                                   // 790  // 1400
        // Note that unlike in the corresponding server code, we never audit                                  // 791  // 1401
        // that stubs check() their arguments.                                                                // 792  // 1402
        var stubReturnValue = DDP._CurrentInvocation.withValue(invocation, function () {                      // 793  // 1403
          if (Meteor.isServer) {                                                                              // 794  // 1404
            // Because saveOriginals and retrieveOriginals aren't reentrant,                                  // 795  // 1405
            // don't allow stubs to yield.                                                                    // 796  // 1406
            return Meteor._noYieldsAllowed(function () {                                                      // 797  // 1407
              // re-clone, so that the stub can't affect our caller's values                                  // 798  // 1408
              return stub.apply(invocation, EJSON.clone(args));                                               // 799  // 1409
            });                                                                                               // 800  // 1410
          } else {                                                                                            // 801  // 1411
            return stub.apply(invocation, EJSON.clone(args));                                                 // 802  // 1412
          }                                                                                                   // 803  // 1413
        });                                                                                                   // 804  // 1414
      }                                                                                                       // 805  // 1415
      catch (e) {                                                                                             // 806  // 1416
        var exception = e;                                                                                    // 807  // 1417
      }                                                                                                       // 808  // 1418
                                                                                                              // 809  // 1419
      if (!alreadyInSimulation)                                                                               // 810  // 1420
        self._retrieveAndStoreOriginals(methodId());                                                          // 811  // 1421
    }                                                                                                         // 812  // 1422
                                                                                                              // 813  // 1423
    // If we're in a simulation, stop and return the result we have,                                          // 814  // 1424
    // rather than going on to do an RPC. If there was no stub,                                               // 815  // 1425
    // we'll end up returning undefined.                                                                      // 816  // 1426
    if (alreadyInSimulation) {                                                                                // 817  // 1427
      if (callback) {                                                                                         // 818  // 1428
        callback(exception, stubReturnValue);                                                                 // 819  // 1429
        return undefined;                                                                                     // 820  // 1430
      }                                                                                                       // 821  // 1431
      if (exception)                                                                                          // 822  // 1432
        throw exception;                                                                                      // 823  // 1433
      return stubReturnValue;                                                                                 // 824  // 1434
    }                                                                                                         // 825  // 1435
                                                                                                              // 826  // 1436
    // If an exception occurred in a stub, and we're ignoring it                                              // 827  // 1437
    // because we're doing an RPC and want to use what the server                                             // 828  // 1438
    // returns instead, log it so the developer knows                                                         // 829  // 1439
    // (unless they explicitly ask to see the error).                                                         // 830  // 1440
    //                                                                                                        // 831  // 1441
    // Tests can set the 'expected' flag on an exception so it won't                                          // 832  // 1442
    // go to log.                                                                                             // 833  // 1443
    if (exception) {                                                                                          // 834  // 1444
      if (options.throwStubExceptions) {                                                                      // 835  // 1445
        throw exception;                                                                                      // 836  // 1446
      } else if (!exception.expected) {                                                                       // 837  // 1447
        Meteor._debug("Exception while simulating the effect of invoking '" +                                 // 838  // 1448
          name + "'", exception, exception.stack);                                                            // 839  // 1449
      }                                                                                                       // 840  // 1450
    }                                                                                                         // 841  // 1451
                                                                                                              // 842  // 1452
                                                                                                              // 843  // 1453
    // At this point we're definitely doing an RPC, and we're going to                                        // 844  // 1454
    // return the value of the RPC to the caller.                                                             // 845  // 1455
                                                                                                              // 846  // 1456
    // If the caller didn't give a callback, decide what to do.                                               // 847  // 1457
    if (!callback) {                                                                                          // 848  // 1458
      if (Meteor.isClient) {                                                                                  // 849  // 1459
        // On the client, we don't have fibers, so we can't block. The                                        // 850  // 1460
        // only thing we can do is to return undefined and discard the                                        // 851  // 1461
        // result of the RPC. If an error occurred then print the error                                       // 852  // 1462
        // to the console.                                                                                    // 853  // 1463
        callback = function (err) {                                                                           // 854  // 1464
          err && Meteor._debug("Error invoking Method '" + name + "':",                                       // 855  // 1465
                               err.message);                                                                  // 856  // 1466
        };                                                                                                    // 857  // 1467
      } else {                                                                                                // 858  // 1468
        // On the server, make the function synchronous. Throw on                                             // 859  // 1469
        // errors, return on success.                                                                         // 860  // 1470
        var future = new Future;                                                                              // 861  // 1471
        callback = future.resolver();                                                                         // 862  // 1472
      }                                                                                                       // 863  // 1473
    }                                                                                                         // 864  // 1474
    // Send the RPC. Note that on the client, it is important that the                                        // 865  // 1475
    // stub have finished before we send the RPC, so that we know we have                                     // 866  // 1476
    // a complete list of which local documents the stub wrote.                                               // 867  // 1477
    var message = {                                                                                           // 868  // 1478
      msg: 'method',                                                                                          // 869  // 1479
      method: name,                                                                                           // 870  // 1480
      params: args,                                                                                           // 871  // 1481
      id: methodId()                                                                                          // 872  // 1482
    };                                                                                                        // 873  // 1483
                                                                                                              // 874  // 1484
    // Send the randomSeed only if we used it                                                                 // 875  // 1485
    if (randomSeed !== null) {                                                                                // 876  // 1486
      message.randomSeed = randomSeed;                                                                        // 877  // 1487
    }                                                                                                         // 878  // 1488
                                                                                                              // 879  // 1489
    var methodInvoker = new MethodInvoker({                                                                   // 880  // 1490
      methodId: methodId(),                                                                                   // 881  // 1491
      callback: callback,                                                                                     // 882  // 1492
      connection: self,                                                                                       // 883  // 1493
      onResultReceived: options.onResultReceived,                                                             // 884  // 1494
      wait: !!options.wait,                                                                                   // 885  // 1495
      message: message                                                                                        // 886  // 1496
    });                                                                                                       // 887  // 1497
                                                                                                              // 888  // 1498
    if (options.wait) {                                                                                       // 889  // 1499
      // It's a wait method! Wait methods go in their own block.                                              // 890  // 1500
      self._outstandingMethodBlocks.push(                                                                     // 891  // 1501
        {wait: true, methods: [methodInvoker]});                                                              // 892  // 1502
    } else {                                                                                                  // 893  // 1503
      // Not a wait method. Start a new block if the previous block was a wait                                // 894  // 1504
      // block, and add it to the last block of methods.                                                      // 895  // 1505
      if (_.isEmpty(self._outstandingMethodBlocks) ||                                                         // 896  // 1506
          _.last(self._outstandingMethodBlocks).wait)                                                         // 897  // 1507
        self._outstandingMethodBlocks.push({wait: false, methods: []});                                       // 898  // 1508
      _.last(self._outstandingMethodBlocks).methods.push(methodInvoker);                                      // 899  // 1509
    }                                                                                                         // 900  // 1510
                                                                                                              // 901  // 1511
    // If we added it to the first block, send it out now.                                                    // 902  // 1512
    if (self._outstandingMethodBlocks.length === 1)                                                           // 903  // 1513
      methodInvoker.sendMessage();                                                                            // 904  // 1514
                                                                                                              // 905  // 1515
    // If we're using the default callback on the server,                                                     // 906  // 1516
    // block waiting for the result.                                                                          // 907  // 1517
    if (future) {                                                                                             // 908  // 1518
      return future.wait();                                                                                   // 909  // 1519
    }                                                                                                         // 910  // 1520
    return options.returnStubValue ? stubReturnValue : undefined;                                             // 911  // 1521
  },                                                                                                          // 912  // 1522
                                                                                                              // 913  // 1523
  // Before calling a method stub, prepare all stores to track changes and allow                              // 914  // 1524
  // _retrieveAndStoreOriginals to get the original versions of changed                                       // 915  // 1525
  // documents.                                                                                               // 916  // 1526
  _saveOriginals: function () {                                                                               // 917  // 1527
    var self = this;                                                                                          // 918  // 1528
    _.each(self._stores, function (s) {                                                                       // 919  // 1529
      s.saveOriginals();                                                                                      // 920  // 1530
    });                                                                                                       // 921  // 1531
  },                                                                                                          // 922  // 1532
  // Retrieves the original versions of all documents modified by the stub for                                // 923  // 1533
  // method 'methodId' from all stores and saves them to _serverDocuments (keyed                              // 924  // 1534
  // by document) and _documentsWrittenByStub (keyed by method ID).                                           // 925  // 1535
  _retrieveAndStoreOriginals: function (methodId) {                                                           // 926  // 1536
    var self = this;                                                                                          // 927  // 1537
    if (self._documentsWrittenByStub[methodId])                                                               // 928  // 1538
      throw new Error("Duplicate methodId in _retrieveAndStoreOriginals");                                    // 929  // 1539
                                                                                                              // 930  // 1540
    var docsWritten = [];                                                                                     // 931  // 1541
    _.each(self._stores, function (s, collection) {                                                           // 932  // 1542
      var originals = s.retrieveOriginals();                                                                  // 933  // 1543
      // not all stores define retrieveOriginals                                                              // 934  // 1544
      if (!originals)                                                                                         // 935  // 1545
        return;                                                                                               // 936  // 1546
      originals.forEach(function (doc, id) {                                                                  // 937  // 1547
        docsWritten.push({collection: collection, id: id});                                                   // 938  // 1548
        if (!_.has(self._serverDocuments, collection))                                                        // 939  // 1549
          self._serverDocuments[collection] = new MongoIDMap;                                                 // 940  // 1550
        var serverDoc = self._serverDocuments[collection].setDefault(id, {});                                 // 941  // 1551
        if (serverDoc.writtenByStubs) {                                                                       // 942  // 1552
          // We're not the first stub to write this doc. Just add our method ID                               // 943  // 1553
          // to the record.                                                                                   // 944  // 1554
          serverDoc.writtenByStubs[methodId] = true;                                                          // 945  // 1555
        } else {                                                                                              // 946  // 1556
          // First stub! Save the original value and our method ID.                                           // 947  // 1557
          serverDoc.document = doc;                                                                           // 948  // 1558
          serverDoc.flushCallbacks = [];                                                                      // 949  // 1559
          serverDoc.writtenByStubs = {};                                                                      // 950  // 1560
          serverDoc.writtenByStubs[methodId] = true;                                                          // 951  // 1561
        }                                                                                                     // 952  // 1562
      });                                                                                                     // 953  // 1563
    });                                                                                                       // 954  // 1564
    if (!_.isEmpty(docsWritten)) {                                                                            // 955  // 1565
      self._documentsWrittenByStub[methodId] = docsWritten;                                                   // 956  // 1566
    }                                                                                                         // 957  // 1567
  },                                                                                                          // 958  // 1568
                                                                                                              // 959  // 1569
  // This is very much a private function we use to make the tests                                            // 960  // 1570
  // take up fewer server resources after they complete.                                                      // 961  // 1571
  _unsubscribeAll: function () {                                                                              // 962  // 1572
    var self = this;                                                                                          // 963  // 1573
    _.each(_.clone(self._subscriptions), function (sub, id) {                                                 // 964  // 1574
      // Avoid killing the autoupdate subscription so that developers                                         // 965  // 1575
      // still get hot code pushes when writing tests.                                                        // 966  // 1576
      //                                                                                                      // 967  // 1577
      // XXX it's a hack to encode knowledge about autoupdate here,                                           // 968  // 1578
      // but it doesn't seem worth it yet to have a special API for                                           // 969  // 1579
      // subscriptions to preserve after unit tests.                                                          // 970  // 1580
      if (sub.name !== 'meteor_autoupdate_clientVersions') {                                                  // 971  // 1581
        self._subscriptions[id].stop();                                                                       // 972  // 1582
      }                                                                                                       // 973  // 1583
    });                                                                                                       // 974  // 1584
  },                                                                                                          // 975  // 1585
                                                                                                              // 976  // 1586
  // Sends the DDP stringification of the given message object                                                // 977  // 1587
  _send: function (obj) {                                                                                     // 978  // 1588
    var self = this;                                                                                          // 979  // 1589
    self._stream.send(DDPCommon.stringifyDDP(obj));                                                           // 980  // 1590
  },                                                                                                          // 981  // 1591
                                                                                                              // 982  // 1592
  // We detected via DDP-level heartbeats that we've lost the                                                 // 983  // 1593
  // connection.  Unlike `disconnect` or `close`, a lost connection                                           // 984  // 1594
  // will be automatically retried.                                                                           // 985  // 1595
  _lostConnection: function (error) {                                                                         // 986  // 1596
    var self = this;                                                                                          // 987  // 1597
    self._stream._lostConnection(error);                                                                      // 988  // 1598
  },                                                                                                          // 989  // 1599
                                                                                                              // 990  // 1600
  /**                                                                                                         // 991  // 1601
   * @summary Get the current connection status. A reactive data source.                                      // 992  // 1602
   * @locus Client                                                                                            // 993  // 1603
   * @memberOf Meteor                                                                                         // 994  // 1604
   */                                                                                                         // 995  // 1605
  status: function (/*passthrough args*/) {                                                                   // 996  // 1606
    var self = this;                                                                                          // 997  // 1607
    return self._stream.status.apply(self._stream, arguments);                                                // 998  // 1608
  },                                                                                                          // 999  // 1609
                                                                                                              // 1000
  /**                                                                                                         // 1001
   * @summary Force an immediate reconnection attempt if the client is not connected to the server.           // 1002
                                                                                                              // 1003
  This method does nothing if the client is already connected.                                                // 1004
   * @locus Client                                                                                            // 1005
   * @memberOf Meteor                                                                                         // 1006
   */                                                                                                         // 1007
  reconnect: function (/*passthrough args*/) {                                                                // 1008
    var self = this;                                                                                          // 1009
    return self._stream.reconnect.apply(self._stream, arguments);                                             // 1010
  },                                                                                                          // 1011
                                                                                                              // 1012
  /**                                                                                                         // 1013
   * @summary Disconnect the client from the server.                                                          // 1014
   * @locus Client                                                                                            // 1015
   * @memberOf Meteor                                                                                         // 1016
   */                                                                                                         // 1017
  disconnect: function (/*passthrough args*/) {                                                               // 1018
    var self = this;                                                                                          // 1019
    return self._stream.disconnect.apply(self._stream, arguments);                                            // 1020
  },                                                                                                          // 1021
                                                                                                              // 1022
  close: function () {                                                                                        // 1023
    var self = this;                                                                                          // 1024
    return self._stream.disconnect({_permanent: true});                                                       // 1025
  },                                                                                                          // 1026
                                                                                                              // 1027
  ///                                                                                                         // 1028
  /// Reactive user system                                                                                    // 1029
  ///                                                                                                         // 1030
  userId: function () {                                                                                       // 1031
    var self = this;                                                                                          // 1032
    if (self._userIdDeps)                                                                                     // 1033
      self._userIdDeps.depend();                                                                              // 1034
    return self._userId;                                                                                      // 1035
  },                                                                                                          // 1036
                                                                                                              // 1037
  setUserId: function (userId) {                                                                              // 1038
    var self = this;                                                                                          // 1039
    // Avoid invalidating dependents if setUserId is called with current value.                               // 1040
    if (self._userId === userId)                                                                              // 1041
      return;                                                                                                 // 1042
    self._userId = userId;                                                                                    // 1043
    if (self._userIdDeps)                                                                                     // 1044
      self._userIdDeps.changed();                                                                             // 1045
  },                                                                                                          // 1046
                                                                                                              // 1047
  // Returns true if we are in a state after reconnect of waiting for subs to be                              // 1048
  // revived or early methods to finish their data, or we are waiting for a                                   // 1049
  // "wait" method to finish.                                                                                 // 1050
  _waitingForQuiescence: function () {                                                                        // 1051
    var self = this;                                                                                          // 1052
    return (! _.isEmpty(self._subsBeingRevived) ||                                                            // 1053
            ! _.isEmpty(self._methodsBlockingQuiescence));                                                    // 1054
  },                                                                                                          // 1055
                                                                                                              // 1056
  // Returns true if any method whose message has been sent to the server has                                 // 1057
  // not yet invoked its user callback.                                                                       // 1058
  _anyMethodsAreOutstanding: function () {                                                                    // 1059
    var self = this;                                                                                          // 1060
    return _.any(_.pluck(self._methodInvokers, 'sentMessage'));                                               // 1061
  },                                                                                                          // 1062
                                                                                                              // 1063
  _livedata_connected: function (msg) {                                                                       // 1064
    var self = this;                                                                                          // 1065
                                                                                                              // 1066
    if (self._version !== 'pre1' && self._heartbeatInterval !== 0) {                                          // 1067
      self._heartbeat = new DDPCommon.Heartbeat({                                                             // 1068
        heartbeatInterval: self._heartbeatInterval,                                                           // 1069
        heartbeatTimeout: self._heartbeatTimeout,                                                             // 1070
        onTimeout: function () {                                                                              // 1071
          self._lostConnection(                                                                               // 1072
            new DDP.ConnectionError("DDP heartbeat timed out"));                                              // 1073
        },                                                                                                    // 1074
        sendPing: function () {                                                                               // 1075
          self._send({msg: 'ping'});                                                                          // 1076
        }                                                                                                     // 1077
      });                                                                                                     // 1078
      self._heartbeat.start();                                                                                // 1079
    }                                                                                                         // 1080
                                                                                                              // 1081
    // If this is a reconnect, we'll have to reset all stores.                                                // 1082
    if (self._lastSessionId)                                                                                  // 1083
      self._resetStores = true;                                                                               // 1084
                                                                                                              // 1085
    if (typeof (msg.session) === "string") {                                                                  // 1086
      var reconnectedToPreviousSession = (self._lastSessionId === msg.session);                               // 1087
      self._lastSessionId = msg.session;                                                                      // 1088
    }                                                                                                         // 1089
                                                                                                              // 1090
    if (reconnectedToPreviousSession) {                                                                       // 1091
      // Successful reconnection -- pick up where we left off.  Note that right                               // 1092
      // now, this never happens: the server never connects us to a previous                                  // 1093
      // session, because DDP doesn't provide enough data for the server to know                              // 1094
      // what messages the client has processed. We need to improve DDP to make                               // 1095
      // this possible, at which point we'll probably need more code here.                                    // 1096
      return;                                                                                                 // 1097
    }                                                                                                         // 1098
                                                                                                              // 1099
    // Server doesn't have our data any more. Re-sync a new session.                                          // 1100
                                                                                                              // 1101
    // Forget about messages we were buffering for unknown collections. They'll                               // 1102
    // be resent if still relevant.                                                                           // 1103
    self._updatesForUnknownStores = {};                                                                       // 1104
                                                                                                              // 1105
    if (self._resetStores) {                                                                                  // 1106
      // Forget about the effects of stubs. We'll be resetting all collections                                // 1107
      // anyway.                                                                                              // 1108
      self._documentsWrittenByStub = {};                                                                      // 1109
      self._serverDocuments = {};                                                                             // 1110
    }                                                                                                         // 1111
                                                                                                              // 1112
    // Clear _afterUpdateCallbacks.                                                                           // 1113
    self._afterUpdateCallbacks = [];                                                                          // 1114
                                                                                                              // 1115
    // Mark all named subscriptions which are ready (ie, we already called the                                // 1116
    // ready callback) as needing to be revived.                                                              // 1117
    // XXX We should also block reconnect quiescence until unnamed subscriptions                              // 1118
    //     (eg, autopublish) are done re-publishing to avoid flicker!                                         // 1119
    self._subsBeingRevived = {};                                                                              // 1120
    _.each(self._subscriptions, function (sub, id) {                                                          // 1121
      if (sub.ready)                                                                                          // 1122
        self._subsBeingRevived[id] = true;                                                                    // 1123
    });                                                                                                       // 1124
                                                                                                              // 1125
    // Arrange for "half-finished" methods to have their callbacks run, and                                   // 1126
    // track methods that were sent on this connection so that we don't                                       // 1127
    // quiesce until they are all done.                                                                       // 1128
    //                                                                                                        // 1129
    // Start by clearing _methodsBlockingQuiescence: methods sent before                                      // 1130
    // reconnect don't matter, and any "wait" methods sent on the new connection                              // 1131
    // that we drop here will be restored by the loop below.                                                  // 1132
    self._methodsBlockingQuiescence = {};                                                                     // 1133
    if (self._resetStores) {                                                                                  // 1134
      _.each(self._methodInvokers, function (invoker) {                                                       // 1135
        if (invoker.gotResult()) {                                                                            // 1136
          // This method already got its result, but it didn't call its callback                              // 1137
          // because its data didn't become visible. We did not resend the                                    // 1138
          // method RPC. We'll call its callback when we get a full quiesce,                                  // 1139
          // since that's as close as we'll get to "data must be visible".                                    // 1140
          self._afterUpdateCallbacks.push(_.bind(invoker.dataVisible, invoker));                              // 1141
        } else if (invoker.sentMessage) {                                                                     // 1142
          // This method has been sent on this connection (maybe as a resend                                  // 1143
          // from the last connection, maybe from onReconnect, maybe just very                                // 1144
          // quickly before processing the connected message).                                                // 1145
          //                                                                                                  // 1146
          // We don't need to do anything special to ensure its callbacks get                                 // 1147
          // called, but we'll count it as a method which is preventing                                       // 1148
          // reconnect quiescence. (eg, it might be a login method that was run                               // 1149
          // from onReconnect, and we don't want to see flicker by seeing a                                   // 1150
          // logged-out state.)                                                                               // 1151
          self._methodsBlockingQuiescence[invoker.methodId] = true;                                           // 1152
        }                                                                                                     // 1153
      });                                                                                                     // 1154
    }                                                                                                         // 1155
                                                                                                              // 1156
    self._messagesBufferedUntilQuiescence = [];                                                               // 1157
                                                                                                              // 1158
    // If we're not waiting on any methods or subs, we can reset the stores and                               // 1159
    // call the callbacks immediately.                                                                        // 1160
    if (!self._waitingForQuiescence()) {                                                                      // 1161
      if (self._resetStores) {                                                                                // 1162
        _.each(self._stores, function (s) {                                                                   // 1163
          s.beginUpdate(0, true);                                                                             // 1164
          s.endUpdate();                                                                                      // 1165
        });                                                                                                   // 1166
        self._resetStores = false;                                                                            // 1167
      }                                                                                                       // 1168
      self._runAfterUpdateCallbacks();                                                                        // 1169
    }                                                                                                         // 1170
  },                                                                                                          // 1171
                                                                                                              // 1172
                                                                                                              // 1173
  _processOneDataMessage: function (msg, updates) {                                                           // 1174
    var self = this;                                                                                          // 1175
    // Using underscore here so as not to need to capitalize.                                                 // 1176
    self['_process_' + msg.msg](msg, updates);                                                                // 1177
  },                                                                                                          // 1178
                                                                                                              // 1179
                                                                                                              // 1180
  _livedata_data: function (msg) {                                                                            // 1181
    var self = this;                                                                                          // 1182
                                                                                                              // 1183
    // collection name -> array of messages                                                                   // 1184
    var updates = {};                                                                                         // 1185
                                                                                                              // 1186
    if (self._waitingForQuiescence()) {                                                                       // 1187
      self._messagesBufferedUntilQuiescence.push(msg);                                                        // 1188
                                                                                                              // 1189
      if (msg.msg === "nosub")                                                                                // 1190
        delete self._subsBeingRevived[msg.id];                                                                // 1191
                                                                                                              // 1192
      _.each(msg.subs || [], function (subId) {                                                               // 1193
        delete self._subsBeingRevived[subId];                                                                 // 1194
      });                                                                                                     // 1195
      _.each(msg.methods || [], function (methodId) {                                                         // 1196
        delete self._methodsBlockingQuiescence[methodId];                                                     // 1197
      });                                                                                                     // 1198
                                                                                                              // 1199
      if (self._waitingForQuiescence())                                                                       // 1200
        return;                                                                                               // 1201
                                                                                                              // 1202
      // No methods or subs are blocking quiescence!                                                          // 1203
      // We'll now process and all of our buffered messages, reset all stores,                                // 1204
      // and apply them all at once.                                                                          // 1205
      _.each(self._messagesBufferedUntilQuiescence, function (bufferedMsg) {                                  // 1206
        self._processOneDataMessage(bufferedMsg, updates);                                                    // 1207
      });                                                                                                     // 1208
      self._messagesBufferedUntilQuiescence = [];                                                             // 1209
    } else {                                                                                                  // 1210
      self._processOneDataMessage(msg, updates);                                                              // 1211
    }                                                                                                         // 1212
                                                                                                              // 1213
    if (self._resetStores || !_.isEmpty(updates)) {                                                           // 1214
      // Begin a transactional update of each store.                                                          // 1215
      _.each(self._stores, function (s, storeName) {                                                          // 1216
        s.beginUpdate(_.has(updates, storeName) ? updates[storeName].length : 0,                              // 1217
                      self._resetStores);                                                                     // 1218
      });                                                                                                     // 1219
      self._resetStores = false;                                                                              // 1220
                                                                                                              // 1221
      _.each(updates, function (updateMessages, storeName) {                                                  // 1222
        var store = self._stores[storeName];                                                                  // 1223
        if (store) {                                                                                          // 1224
          _.each(updateMessages, function (updateMessage) {                                                   // 1225
            store.update(updateMessage);                                                                      // 1226
          });                                                                                                 // 1227
        } else {                                                                                              // 1228
          // Nobody's listening for this data. Queue it up until                                              // 1229
          // someone wants it.                                                                                // 1230
          // XXX memory use will grow without bound if you forget to                                          // 1231
          // create a collection or just don't care about it... going                                         // 1232
          // to have to do something about that.                                                              // 1233
          if (!_.has(self._updatesForUnknownStores, storeName))                                               // 1234
            self._updatesForUnknownStores[storeName] = [];                                                    // 1235
          Array.prototype.push.apply(self._updatesForUnknownStores[storeName],                                // 1236
                                     updateMessages);                                                         // 1237
        }                                                                                                     // 1238
      });                                                                                                     // 1239
                                                                                                              // 1240
      // End update transaction.                                                                              // 1241
      _.each(self._stores, function (s) { s.endUpdate(); });                                                  // 1242
    }                                                                                                         // 1243
                                                                                                              // 1244
    self._runAfterUpdateCallbacks();                                                                          // 1245
  },                                                                                                          // 1246
                                                                                                              // 1247
  // Call any callbacks deferred with _runWhenAllServerDocsAreFlushed whose                                   // 1248
  // relevant docs have been flushed, as well as dataVisible callbacks at                                     // 1249
  // reconnect-quiescence time.                                                                               // 1250
  _runAfterUpdateCallbacks: function () {                                                                     // 1251
    var self = this;                                                                                          // 1252
    var callbacks = self._afterUpdateCallbacks;                                                               // 1253
    self._afterUpdateCallbacks = [];                                                                          // 1254
    _.each(callbacks, function (c) {                                                                          // 1255
      c();                                                                                                    // 1256
    });                                                                                                       // 1257
  },                                                                                                          // 1258
                                                                                                              // 1259
  _pushUpdate: function (updates, collection, msg) {                                                          // 1260
    var self = this;                                                                                          // 1261
    if (!_.has(updates, collection)) {                                                                        // 1262
      updates[collection] = [];                                                                               // 1263
    }                                                                                                         // 1264
    updates[collection].push(msg);                                                                            // 1265
  },                                                                                                          // 1266
                                                                                                              // 1267
  _getServerDoc: function (collection, id) {                                                                  // 1268
    var self = this;                                                                                          // 1269
    if (!_.has(self._serverDocuments, collection))                                                            // 1270
      return null;                                                                                            // 1271
    var serverDocsForCollection = self._serverDocuments[collection];                                          // 1272
    return serverDocsForCollection.get(id) || null;                                                           // 1273
  },                                                                                                          // 1274
                                                                                                              // 1275
  _process_added: function (msg, updates) {                                                                   // 1276
    var self = this;                                                                                          // 1277
    var id = MongoID.idParse(msg.id);                                                                         // 1278
    var serverDoc = self._getServerDoc(msg.collection, id);                                                   // 1279
    if (serverDoc) {                                                                                          // 1280
      // Some outstanding stub wrote here.                                                                    // 1281
      var isExisting = (serverDoc.document !== undefined);                                                    // 1282
                                                                                                              // 1283
      serverDoc.document = msg.fields || {};                                                                  // 1284
      serverDoc.document._id = id;                                                                            // 1285
                                                                                                              // 1286
      if (self._resetStores) {                                                                                // 1287
        // During reconnect the server is sending adds for existing ids.                                      // 1288
        // Always push an update so that document stays in the store after                                    // 1289
        // reset. Use current version of the document for this update, so                                     // 1290
        // that stub-written values are preserved.                                                            // 1291
        var currentDoc = self._stores[msg.collection].getDoc(msg.id);                                         // 1292
        if (currentDoc !== undefined)                                                                         // 1293
          msg.fields = currentDoc;                                                                            // 1294
                                                                                                              // 1295
        self._pushUpdate(updates, msg.collection, msg);                                                       // 1296
      } else if (isExisting) {                                                                                // 1297
        throw new Error("Server sent add for existing id: " + msg.id);                                        // 1298
      }                                                                                                       // 1299
    } else {                                                                                                  // 1300
      self._pushUpdate(updates, msg.collection, msg);                                                         // 1301
    }                                                                                                         // 1302
  },                                                                                                          // 1303
                                                                                                              // 1304
  _process_changed: function (msg, updates) {                                                                 // 1305
    var self = this;                                                                                          // 1306
    var serverDoc = self._getServerDoc(                                                                       // 1307
      msg.collection, MongoID.idParse(msg.id));                                                               // 1308
    if (serverDoc) {                                                                                          // 1309
      if (serverDoc.document === undefined)                                                                   // 1310
        throw new Error("Server sent changed for nonexisting id: " + msg.id);                                 // 1311
      DiffSequence.applyChanges(serverDoc.document, msg.fields);                                              // 1312
    } else {                                                                                                  // 1313
      self._pushUpdate(updates, msg.collection, msg);                                                         // 1314
    }                                                                                                         // 1315
  },                                                                                                          // 1316
                                                                                                              // 1317
  _process_removed: function (msg, updates) {                                                                 // 1318
    var self = this;                                                                                          // 1319
    var serverDoc = self._getServerDoc(                                                                       // 1320
      msg.collection, MongoID.idParse(msg.id));                                                               // 1321
    if (serverDoc) {                                                                                          // 1322
      // Some outstanding stub wrote here.                                                                    // 1323
      if (serverDoc.document === undefined)                                                                   // 1324
        throw new Error("Server sent removed for nonexisting id:" + msg.id);                                  // 1325
      serverDoc.document = undefined;                                                                         // 1326
    } else {                                                                                                  // 1327
      self._pushUpdate(updates, msg.collection, {                                                             // 1328
        msg: 'removed',                                                                                       // 1329
        collection: msg.collection,                                                                           // 1330
        id: msg.id                                                                                            // 1331
      });                                                                                                     // 1332
    }                                                                                                         // 1333
  },                                                                                                          // 1334
                                                                                                              // 1335
  _process_updated: function (msg, updates) {                                                                 // 1336
    var self = this;                                                                                          // 1337
    // Process "method done" messages.                                                                        // 1338
    _.each(msg.methods, function (methodId) {                                                                 // 1339
      _.each(self._documentsWrittenByStub[methodId], function (written) {                                     // 1340
        var serverDoc = self._getServerDoc(written.collection, written.id);                                   // 1341
        if (!serverDoc)                                                                                       // 1342
          throw new Error("Lost serverDoc for " + JSON.stringify(written));                                   // 1343
        if (!serverDoc.writtenByStubs[methodId])                                                              // 1344
          throw new Error("Doc " + JSON.stringify(written) +                                                  // 1345
                          " not written by  method " + methodId);                                             // 1346
        delete serverDoc.writtenByStubs[methodId];                                                            // 1347
        if (_.isEmpty(serverDoc.writtenByStubs)) {                                                            // 1348
          // All methods whose stubs wrote this method have completed! We can                                 // 1349
          // now copy the saved document to the database (reverting the stub's                                // 1350
          // change if the server did not write to this object, or applying the                               // 1351
          // server's writes if it did).                                                                      // 1352
                                                                                                              // 1353
          // This is a fake ddp 'replace' message.  It's just for talking                                     // 1354
          // between livedata connections and minimongo.  (We have to stringify                               // 1355
          // the ID because it's supposed to look like a wire message.)                                       // 1356
          self._pushUpdate(updates, written.collection, {                                                     // 1357
            msg: 'replace',                                                                                   // 1358
            id: MongoID.idStringify(written.id),                                                              // 1359
            replace: serverDoc.document                                                                       // 1360
          });                                                                                                 // 1361
          // Call all flush callbacks.                                                                        // 1362
          _.each(serverDoc.flushCallbacks, function (c) {                                                     // 1363
            c();                                                                                              // 1364
          });                                                                                                 // 1365
                                                                                                              // 1366
          // Delete this completed serverDocument. Don't bother to GC empty                                   // 1367
          // IdMaps inside self._serverDocuments, since there probably aren't                                 // 1368
          // many collections and they'll be written repeatedly.                                              // 1369
          self._serverDocuments[written.collection].remove(written.id);                                       // 1370
        }                                                                                                     // 1371
      });                                                                                                     // 1372
      delete self._documentsWrittenByStub[methodId];                                                          // 1373
                                                                                                              // 1374
      // We want to call the data-written callback, but we can't do so until all                              // 1375
      // currently buffered messages are flushed.                                                             // 1376
      var callbackInvoker = self._methodInvokers[methodId];                                                   // 1377
      if (!callbackInvoker)                                                                                   // 1378
        throw new Error("No callback invoker for method " + methodId);                                        // 1379
      self._runWhenAllServerDocsAreFlushed(                                                                   // 1380
        _.bind(callbackInvoker.dataVisible, callbackInvoker));                                                // 1381
    });                                                                                                       // 1382
  },                                                                                                          // 1383
                                                                                                              // 1384
  _process_ready: function (msg, updates) {                                                                   // 1385
    var self = this;                                                                                          // 1386
    // Process "sub ready" messages. "sub ready" messages don't take effect                                   // 1387
    // until all current server documents have been flushed to the local                                      // 1388
    // database. We can use a write fence to implement this.                                                  // 1389
    _.each(msg.subs, function (subId) {                                                                       // 1390
      self._runWhenAllServerDocsAreFlushed(function () {                                                      // 1391
        var subRecord = self._subscriptions[subId];                                                           // 1392
        // Did we already unsubscribe?                                                                        // 1393
        if (!subRecord)                                                                                       // 1394
          return;                                                                                             // 1395
        // Did we already receive a ready message? (Oops!)                                                    // 1396
        if (subRecord.ready)                                                                                  // 1397
          return;                                                                                             // 1398
        subRecord.ready = true;                                                                               // 1399
        subRecord.readyCallback && subRecord.readyCallback();                                                 // 1400
        subRecord.readyDeps.changed();                                                                        // 1401
      });                                                                                                     // 1402
    });                                                                                                       // 1403
  },                                                                                                          // 1404
                                                                                                              // 1405
  // Ensures that "f" will be called after all documents currently in                                         // 1406
  // _serverDocuments have been written to the local cache. f will not be called                              // 1407
  // if the connection is lost before then!                                                                   // 1408
  _runWhenAllServerDocsAreFlushed: function (f) {                                                             // 1409
    var self = this;                                                                                          // 1410
    var runFAfterUpdates = function () {                                                                      // 1411
      self._afterUpdateCallbacks.push(f);                                                                     // 1412
    };                                                                                                        // 1413
    var unflushedServerDocCount = 0;                                                                          // 1414
    var onServerDocFlush = function () {                                                                      // 1415
      --unflushedServerDocCount;                                                                              // 1416
      if (unflushedServerDocCount === 0) {                                                                    // 1417
        // This was the last doc to flush! Arrange to run f after the updates                                 // 1418
        // have been applied.                                                                                 // 1419
        runFAfterUpdates();                                                                                   // 1420
      }                                                                                                       // 1421
    };                                                                                                        // 1422
    _.each(self._serverDocuments, function (collectionDocs) {                                                 // 1423
      collectionDocs.forEach(function (serverDoc) {                                                           // 1424
        var writtenByStubForAMethodWithSentMessage = _.any(                                                   // 1425
          serverDoc.writtenByStubs, function (dummy, methodId) {                                              // 1426
            var invoker = self._methodInvokers[methodId];                                                     // 1427
            return invoker && invoker.sentMessage;                                                            // 1428
          });                                                                                                 // 1429
        if (writtenByStubForAMethodWithSentMessage) {                                                         // 1430
          ++unflushedServerDocCount;                                                                          // 1431
          serverDoc.flushCallbacks.push(onServerDocFlush);                                                    // 1432
        }                                                                                                     // 1433
      });                                                                                                     // 1434
    });                                                                                                       // 1435
    if (unflushedServerDocCount === 0) {                                                                      // 1436
      // There aren't any buffered docs --- we can call f as soon as the current                              // 1437
      // round of updates is applied!                                                                         // 1438
      runFAfterUpdates();                                                                                     // 1439
    }                                                                                                         // 1440
  },                                                                                                          // 1441
                                                                                                              // 1442
  _livedata_nosub: function (msg) {                                                                           // 1443
    var self = this;                                                                                          // 1444
                                                                                                              // 1445
    // First pass it through _livedata_data, which only uses it to help get                                   // 1446
    // towards quiescence.                                                                                    // 1447
    self._livedata_data(msg);                                                                                 // 1448
                                                                                                              // 1449
    // Do the rest of our processing immediately, with no                                                     // 1450
    // buffering-until-quiescence.                                                                            // 1451
                                                                                                              // 1452
    // we weren't subbed anyway, or we initiated the unsub.                                                   // 1453
    if (!_.has(self._subscriptions, msg.id))                                                                  // 1454
      return;                                                                                                 // 1455
                                                                                                              // 1456
    // XXX COMPAT WITH 1.0.3.1 #errorCallback                                                                 // 1457
    var errorCallback = self._subscriptions[msg.id].errorCallback;                                            // 1458
    var stopCallback = self._subscriptions[msg.id].stopCallback;                                              // 1459
                                                                                                              // 1460
    self._subscriptions[msg.id].remove();                                                                     // 1461
                                                                                                              // 1462
    var meteorErrorFromMsg = function (msgArg) {                                                              // 1463
      return msgArg && msgArg.error && new Meteor.Error(                                                      // 1464
        msgArg.error.error, msgArg.error.reason, msgArg.error.details);                                       // 1465
    }                                                                                                         // 1466
                                                                                                              // 1467
    // XXX COMPAT WITH 1.0.3.1 #errorCallback                                                                 // 1468
    if (errorCallback && msg.error) {                                                                         // 1469
      errorCallback(meteorErrorFromMsg(msg));                                                                 // 1470
    }                                                                                                         // 1471
                                                                                                              // 1472
    if (stopCallback) {                                                                                       // 1473
      stopCallback(meteorErrorFromMsg(msg));                                                                  // 1474
    }                                                                                                         // 1475
  },                                                                                                          // 1476
                                                                                                              // 1477
  _process_nosub: function () {                                                                               // 1478
    // This is called as part of the "buffer until quiescence" process, but                                   // 1479
    // nosub's effect is always immediate. It only goes in the buffer at all                                  // 1480
    // because it's possible for a nosub to be the thing that triggers                                        // 1481
    // quiescence, if we were waiting for a sub to be revived and it dies                                     // 1482
    // instead.                                                                                               // 1483
  },                                                                                                          // 1484
                                                                                                              // 1485
  _livedata_result: function (msg) {                                                                          // 1486
    // id, result or error. error has error (code), reason, details                                           // 1487
                                                                                                              // 1488
    var self = this;                                                                                          // 1489
                                                                                                              // 1490
    // find the outstanding request                                                                           // 1491
    // should be O(1) in nearly all realistic use cases                                                       // 1492
    if (_.isEmpty(self._outstandingMethodBlocks)) {                                                           // 1493
      Meteor._debug("Received method result but no methods outstanding");                                     // 1494
      return;                                                                                                 // 1495
    }                                                                                                         // 1496
    var currentMethodBlock = self._outstandingMethodBlocks[0].methods;                                        // 1497
    var m;                                                                                                    // 1498
    for (var i = 0; i < currentMethodBlock.length; i++) {                                                     // 1499
      m = currentMethodBlock[i];                                                                              // 1500
      if (m.methodId === msg.id)                                                                              // 1501
        break;                                                                                                // 1502
    }                                                                                                         // 1503
                                                                                                              // 1504
    if (!m) {                                                                                                 // 1505
      Meteor._debug("Can't match method response to original method call", msg);                              // 1506
      return;                                                                                                 // 1507
    }                                                                                                         // 1508
                                                                                                              // 1509
    // Remove from current method block. This may leave the block empty, but we                               // 1510
    // don't move on to the next block until the callback has been delivered, in                              // 1511
    // _outstandingMethodFinished.                                                                            // 1512
    currentMethodBlock.splice(i, 1);                                                                          // 1513
                                                                                                              // 1514
    if (_.has(msg, 'error')) {                                                                                // 1515
      m.receiveResult(new Meteor.Error(                                                                       // 1516
        msg.error.error, msg.error.reason,                                                                    // 1517
        msg.error.details));                                                                                  // 1518
    } else {                                                                                                  // 1519
      // msg.result may be undefined if the method didn't return a                                            // 1520
      // value                                                                                                // 1521
      m.receiveResult(undefined, msg.result);                                                                 // 1522
    }                                                                                                         // 1523
  },                                                                                                          // 1524
                                                                                                              // 1525
  // Called by MethodInvoker after a method's callback is invoked.  If this was                               // 1526
  // the last outstanding method in the current block, runs the next block. If                                // 1527
  // there are no more methods, consider accepting a hot code push.                                           // 1528
  _outstandingMethodFinished: function () {                                                                   // 1529
    var self = this;                                                                                          // 1530
    if (self._anyMethodsAreOutstanding())                                                                     // 1531
      return;                                                                                                 // 1532
                                                                                                              // 1533
    // No methods are outstanding. This should mean that the first block of                                   // 1534
    // methods is empty. (Or it might not exist, if this was a method that                                    // 1535
    // half-finished before disconnect/reconnect.)                                                            // 1536
    if (! _.isEmpty(self._outstandingMethodBlocks)) {                                                         // 1537
      var firstBlock = self._outstandingMethodBlocks.shift();                                                 // 1538
      if (! _.isEmpty(firstBlock.methods))                                                                    // 1539
        throw new Error("No methods outstanding but nonempty block: " +                                       // 1540
                        JSON.stringify(firstBlock));                                                          // 1541
                                                                                                              // 1542
      // Send the outstanding methods now in the first block.                                                 // 1543
      if (!_.isEmpty(self._outstandingMethodBlocks))                                                          // 1544
        self._sendOutstandingMethods();                                                                       // 1545
    }                                                                                                         // 1546
                                                                                                              // 1547
    // Maybe accept a hot code push.                                                                          // 1548
    self._maybeMigrate();                                                                                     // 1549
  },                                                                                                          // 1550
                                                                                                              // 1551
  // Sends messages for all the methods in the first block in                                                 // 1552
  // _outstandingMethodBlocks.                                                                                // 1553
  _sendOutstandingMethods: function() {                                                                       // 1554
    var self = this;                                                                                          // 1555
    if (_.isEmpty(self._outstandingMethodBlocks))                                                             // 1556
      return;                                                                                                 // 1557
    _.each(self._outstandingMethodBlocks[0].methods, function (m) {                                           // 1558
      m.sendMessage();                                                                                        // 1559
    });                                                                                                       // 1560
  },                                                                                                          // 1561
                                                                                                              // 1562
  _livedata_error: function (msg) {                                                                           // 1563
    Meteor._debug("Received error from server: ", msg.reason);                                                // 1564
    if (msg.offendingMessage)                                                                                 // 1565
      Meteor._debug("For: ", msg.offendingMessage);                                                           // 1566
  },                                                                                                          // 1567
                                                                                                              // 1568
  _callOnReconnectAndSendAppropriateOutstandingMethods: function() {                                          // 1569
    var self = this;                                                                                          // 1570
    var oldOutstandingMethodBlocks = self._outstandingMethodBlocks;                                           // 1571
    self._outstandingMethodBlocks = [];                                                                       // 1572
                                                                                                              // 1573
    self.onReconnect();                                                                                       // 1574
                                                                                                              // 1575
    if (_.isEmpty(oldOutstandingMethodBlocks))                                                                // 1576
      return;                                                                                                 // 1577
                                                                                                              // 1578
    // We have at least one block worth of old outstanding methods to try                                     // 1579
    // again. First: did onReconnect actually send anything? If not, we just                                  // 1580
    // restore all outstanding methods and run the first block.                                               // 1581
    if (_.isEmpty(self._outstandingMethodBlocks)) {                                                           // 1582
      self._outstandingMethodBlocks = oldOutstandingMethodBlocks;                                             // 1583
      self._sendOutstandingMethods();                                                                         // 1584
      return;                                                                                                 // 1585
    }                                                                                                         // 1586
                                                                                                              // 1587
    // OK, there are blocks on both sides. Special case: merge the last block of                              // 1588
    // the reconnect methods with the first block of the original methods, if                                 // 1589
    // neither of them are "wait" blocks.                                                                     // 1590
    if (!_.last(self._outstandingMethodBlocks).wait &&                                                        // 1591
        !oldOutstandingMethodBlocks[0].wait) {                                                                // 1592
      _.each(oldOutstandingMethodBlocks[0].methods, function (m) {                                            // 1593
        _.last(self._outstandingMethodBlocks).methods.push(m);                                                // 1594
                                                                                                              // 1595
        // If this "last block" is also the first block, send the message.                                    // 1596
        if (self._outstandingMethodBlocks.length === 1)                                                       // 1597
          m.sendMessage();                                                                                    // 1598
      });                                                                                                     // 1599
                                                                                                              // 1600
      oldOutstandingMethodBlocks.shift();                                                                     // 1601
    }                                                                                                         // 1602
                                                                                                              // 1603
    // Now add the rest of the original blocks on.                                                            // 1604
    _.each(oldOutstandingMethodBlocks, function (block) {                                                     // 1605
      self._outstandingMethodBlocks.push(block);                                                              // 1606
    });                                                                                                       // 1607
  },                                                                                                          // 1608
                                                                                                              // 1609
  // We can accept a hot code push if there are no methods in flight.                                         // 1610
  _readyToMigrate: function() {                                                                               // 1611
    var self = this;                                                                                          // 1612
    return _.isEmpty(self._methodInvokers);                                                                   // 1613
  },                                                                                                          // 1614
                                                                                                              // 1615
  // If we were blocking a migration, see if it's now possible to continue.                                   // 1616
  // Call whenever the set of outstanding/blocked methods shrinks.                                            // 1617
  _maybeMigrate: function () {                                                                                // 1618
    var self = this;                                                                                          // 1619
    if (self._retryMigrate && self._readyToMigrate()) {                                                       // 1620
      self._retryMigrate();                                                                                   // 1621
      self._retryMigrate = null;                                                                              // 1622
    }                                                                                                         // 1623
  }                                                                                                           // 1624
});                                                                                                           // 1625
                                                                                                              // 1626
LivedataTest.Connection = Connection;                                                                         // 1627
                                                                                                              // 1628
// @param url {String} URL to Meteor app,                                                                     // 1629
//     e.g.:                                                                                                  // 1630
//     "subdomain.meteor.com",                                                                                // 1631
//     "http://subdomain.meteor.com",                                                                         // 1632
//     "/",                                                                                                   // 1633
//     "ddp+sockjs://ddp--****-foo.meteor.com/sockjs"                                                         // 1634
                                                                                                              // 1635
/**                                                                                                           // 1636
 * @summary Connect to the server of a different Meteor application to subscribe to its document sets and invoke its remote methods.
 * @locus Anywhere                                                                                            // 1638
 * @param {String} url The URL of another Meteor application.                                                 // 1639
 */                                                                                                           // 1640
DDP.connect = function (url, options) {                                                                       // 1641
  var ret = new Connection(url, options);                                                                     // 1642
  allConnections.push(ret); // hack. see below.                                                               // 1643
  return ret;                                                                                                 // 1644
};                                                                                                            // 1645
                                                                                                              // 1646
// Hack for `spiderable` package: a way to see if the page is done                                            // 1647
// loading all the data it needs.                                                                             // 1648
//                                                                                                            // 1649
allConnections = [];                                                                                          // 1650
DDP._allSubscriptionsReady = function () {                                                                    // 1651
  return _.all(allConnections, function (conn) {                                                              // 1652
    return _.all(conn._subscriptions, function (sub) {                                                        // 1653
      return sub.ready;                                                                                       // 1654
    });                                                                                                       // 1655
  });                                                                                                         // 1656
};                                                                                                            // 1657
                                                                                                              // 1658
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2269
                                                                                                                      // 2270
}).call(this);                                                                                                        // 2271
                                                                                                                      // 2272
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ddp-client'] = {
  DDP: DDP,
  LivedataTest: LivedataTest
};

})();

//# sourceMappingURL=ddp-client.js.map
