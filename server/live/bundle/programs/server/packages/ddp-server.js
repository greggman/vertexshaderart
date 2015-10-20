(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var Retry = Package.retry.Retry;
var MongoID = Package['mongo-id'].MongoID;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPCommon = Package['ddp-common'].DDPCommon;
var DDP = Package['ddp-client'].DDP;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Hook = Package['callback-hook'].Hook;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var babelHelpers = Package['babel-runtime'].babelHelpers;
var Promise = Package.promise.Promise;
var Map = Package['ecmascript-collections'].Map;
var Set = Package['ecmascript-collections'].Set;

/* Package-scope variables */
var StreamServer, DDPServer, Server;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/stream_server.js                                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var url = Npm.require('url');                                                                                         // 1
                                                                                                                      //
// By default, we use the permessage-deflate extension with default                                                   //
// configuration. If $SERVER_WEBSOCKET_COMPRESSION is set, then it must be valid                                      //
// JSON. If it represents a falsey value, then we do not use permessage-deflate                                       //
// at all; otherwise, the JSON value is used as an argument to deflate's                                              //
// configure method; see                                                                                              //
// https://github.com/faye/permessage-deflate-node/blob/master/README.md                                              //
//                                                                                                                    //
// (We do this in an _.once instead of at startup, because we don't want to                                           //
// crash the tool during isopacket load if your JSON doesn't parse. This is only                                      //
// a problem because the tool has to load the DDP server code just in order to                                        //
// be a DDP client; see https://github.com/meteor/meteor/issues/3452 .)                                               //
var websocketExtensions = _.once(function () {                                                                        // 14
  var extensions = [];                                                                                                // 15
                                                                                                                      //
  var websocketCompressionConfig = process.env.SERVER_WEBSOCKET_COMPRESSION ? JSON.parse(process.env.SERVER_WEBSOCKET_COMPRESSION) : {};
  if (websocketCompressionConfig) {                                                                                   // 19
    extensions.push(Npm.require('permessage-deflate').configure(websocketCompressionConfig));                         // 20
  }                                                                                                                   //
                                                                                                                      //
  return extensions;                                                                                                  // 25
});                                                                                                                   //
                                                                                                                      //
var pathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || "";                                                // 28
                                                                                                                      //
StreamServer = function () {                                                                                          // 30
  var self = this;                                                                                                    // 31
  self.registration_callbacks = [];                                                                                   // 32
  self.open_sockets = [];                                                                                             // 33
                                                                                                                      //
  // Because we are installing directly onto WebApp.httpServer instead of using                                       //
  // WebApp.app, we have to process the path prefix ourselves.                                                        //
  self.prefix = pathPrefix + '/sockjs';                                                                               // 37
  RoutePolicy.declare(self.prefix + '/', 'network');                                                                  // 38
                                                                                                                      //
  // set up sockjs                                                                                                    //
  var sockjs = Npm.require('sockjs');                                                                                 // 41
  var serverOptions = {                                                                                               // 42
    prefix: self.prefix,                                                                                              // 43
    log: function () {},                                                                                              // 44
    // this is the default, but we code it explicitly because we depend                                               //
    // on it in stream_client:HEARTBEAT_TIMEOUT                                                                       //
    heartbeat_delay: 45000,                                                                                           // 47
    // The default disconnect_delay is 5 seconds, but if the server ends up CPU                                       //
    // bound for that much time, SockJS might not notice that the user has                                            //
    // reconnected because the timer (of disconnect_delay ms) can fire before                                         //
    // SockJS processes the new connection. Eventually we'll fix this by not                                          //
    // combining CPU-heavy processing with SockJS termination (eg a proxy which                                       //
    // converts to Unix sockets) but for now, raise the delay.                                                        //
    disconnect_delay: 60 * 1000,                                                                                      // 54
    // Set the USE_JSESSIONID environment variable to enable setting the                                              //
    // JSESSIONID cookie. This is useful for setting up proxies with                                                  //
    // session affinity.                                                                                              //
    jsessionid: !!process.env.USE_JSESSIONID                                                                          // 58
  };                                                                                                                  //
                                                                                                                      //
  // If you know your server environment (eg, proxies) will prevent websockets                                        //
  // from ever working, set $DISABLE_WEBSOCKETS and SockJS clients (ie,                                               //
  // browsers) will not waste time attempting to use them.                                                            //
  // (Your server will still have a /websocket endpoint.)                                                             //
  if (process.env.DISABLE_WEBSOCKETS) {                                                                               // 65
    serverOptions.websocket = false;                                                                                  // 66
  } else {                                                                                                            //
    serverOptions.faye_server_options = {                                                                             // 68
      extensions: websocketExtensions()                                                                               // 69
    };                                                                                                                //
  }                                                                                                                   //
                                                                                                                      //
  self.server = sockjs.createServer(serverOptions);                                                                   // 73
                                                                                                                      //
  // Install the sockjs handlers, but we want to keep around our own particular                                       //
  // request handler that adjusts idle timeouts while we have an outstanding                                          //
  // request.  This compensates for the fact that sockjs removes all listeners                                        //
  // for "request" to add its own.                                                                                    //
  WebApp.httpServer.removeListener('request', WebApp._timeoutAdjustmentRequestCallback);                              // 79
  self.server.installHandlers(WebApp.httpServer);                                                                     // 81
  WebApp.httpServer.addListener('request', WebApp._timeoutAdjustmentRequestCallback);                                 // 82
                                                                                                                      //
  // Support the /websocket endpoint                                                                                  //
  self._redirectWebsocketEndpoint();                                                                                  // 86
                                                                                                                      //
  self.server.on('connection', function (socket) {                                                                    // 88
    socket.send = function (data) {                                                                                   // 89
      socket.write(data);                                                                                             // 90
    };                                                                                                                //
    socket.on('close', function () {                                                                                  // 92
      self.open_sockets = _.without(self.open_sockets, socket);                                                       // 93
    });                                                                                                               //
    self.open_sockets.push(socket);                                                                                   // 95
                                                                                                                      //
    // XXX COMPAT WITH 0.6.6. Send the old style welcome message, which                                               //
    // will force old clients to reload. Remove this once we're not                                                   //
    // concerned about people upgrading from a pre-0.7.0 release. Also,                                               //
    // remove the clause in the client that ignores the welcome message                                               //
    // (livedata_connection.js)                                                                                       //
    socket.send(JSON.stringify({ server_id: "0" }));                                                                  // 102
                                                                                                                      //
    // call all our callbacks when we get a new socket. they will do the                                              //
    // work of setting up handlers and such for specific messages.                                                    //
    _.each(self.registration_callbacks, function (callback) {                                                         // 106
      callback(socket);                                                                                               // 107
    });                                                                                                               //
  });                                                                                                                 //
};                                                                                                                    //
                                                                                                                      //
_.extend(StreamServer.prototype, {                                                                                    // 113
  // call my callback when a new socket connects.                                                                     //
  // also call it for all current connections.                                                                        //
  register: function (callback) {                                                                                     // 116
    var self = this;                                                                                                  // 117
    self.registration_callbacks.push(callback);                                                                       // 118
    _.each(self.all_sockets(), function (socket) {                                                                    // 119
      callback(socket);                                                                                               // 120
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  // get a list of all sockets                                                                                        //
  all_sockets: function () {                                                                                          // 125
    var self = this;                                                                                                  // 126
    return _.values(self.open_sockets);                                                                               // 127
  },                                                                                                                  //
                                                                                                                      //
  // Redirect /websocket to /sockjs/websocket in order to not expose                                                  //
  // sockjs to clients that want to use raw websockets                                                                //
  _redirectWebsocketEndpoint: function () {                                                                           // 132
    var self = this;                                                                                                  // 133
    // Unfortunately we can't use a connect middleware here since                                                     //
    // sockjs installs itself prior to all existing listeners                                                         //
    // (meaning prior to any connect middlewares) so we need to take                                                  //
    // an approach similar to overshadowListeners in                                                                  //
    // https://github.com/sockjs/sockjs-node/blob/cf820c55af6a9953e16558555a31decea554f70e/src/utils.coffee           //
    _.each(['request', 'upgrade'], function (event) {                                                                 // 139
      var httpServer = WebApp.httpServer;                                                                             // 140
      var oldHttpServerListeners = httpServer.listeners(event).slice(0);                                              // 141
      httpServer.removeAllListeners(event);                                                                           // 142
                                                                                                                      //
      // request and upgrade have different arguments passed but                                                      //
      // we only care about the first one which is always request                                                     //
      var newListener = function (request /*, moreArguments */) {                                                     // 146
        // Store arguments for use within the closure below                                                           //
        var args = arguments;                                                                                         // 148
                                                                                                                      //
        // Rewrite /websocket and /websocket/ urls to /sockjs/websocket while                                         //
        // preserving query string.                                                                                   //
        var parsedUrl = url.parse(request.url);                                                                       // 152
        if (parsedUrl.pathname === pathPrefix + '/websocket' || parsedUrl.pathname === pathPrefix + '/websocket/') {  // 153
          parsedUrl.pathname = self.prefix + '/websocket';                                                            // 155
          request.url = url.format(parsedUrl);                                                                        // 156
        }                                                                                                             //
        _.each(oldHttpServerListeners, function (oldListener) {                                                       // 158
          oldListener.apply(httpServer, args);                                                                        // 159
        });                                                                                                           //
      };                                                                                                              //
      httpServer.addListener(event, newListener);                                                                     // 162
    });                                                                                                               //
  }                                                                                                                   //
});                                                                                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/livedata_server.js                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
DDPServer = {};                                                                                                       // 1
                                                                                                                      //
var Fiber = Npm.require('fibers');                                                                                    // 3
                                                                                                                      //
// This file contains classes:                                                                                        //
// * Session - The server's connection to a single DDP client                                                         //
// * Subscription - A single subscription for a single client                                                         //
// * Server - An entire server that may talk to > 1 client. A DDP endpoint.                                           //
//                                                                                                                    //
// Session and Subscription are file scope. For now, until we freeze                                                  //
// the interface, Server is package scope (in the future it should be                                                 //
// exported.)                                                                                                         //
                                                                                                                      //
// Represents a single document in a SessionCollectionView                                                            //
var SessionDocumentView = function () {                                                                               // 15
  var self = this;                                                                                                    // 16
  self.existsIn = {}; // set of subscriptionHandle                                                                    // 17
  self.dataByKey = {}; // key-> [ {subscriptionHandle, value} by precedence]                                          // 18
};                                                                                                                    //
                                                                                                                      //
_.extend(SessionDocumentView.prototype, {                                                                             // 21
                                                                                                                      //
  getFields: function () {                                                                                            // 23
    var self = this;                                                                                                  // 24
    var ret = {};                                                                                                     // 25
    _.each(self.dataByKey, function (precedenceList, key) {                                                           // 26
      ret[key] = precedenceList[0].value;                                                                             // 27
    });                                                                                                               //
    return ret;                                                                                                       // 29
  },                                                                                                                  //
                                                                                                                      //
  clearField: function (subscriptionHandle, key, changeCollector) {                                                   // 32
    var self = this;                                                                                                  // 33
    // Publish API ignores _id if present in fields                                                                   //
    if (key === "_id") return;                                                                                        // 35
    var precedenceList = self.dataByKey[key];                                                                         // 37
                                                                                                                      //
    // It's okay to clear fields that didn't exist. No need to throw                                                  //
    // an error.                                                                                                      //
    if (!precedenceList) return;                                                                                      // 41
                                                                                                                      //
    var removedValue = undefined;                                                                                     // 44
    for (var i = 0; i < precedenceList.length; i++) {                                                                 // 45
      var precedence = precedenceList[i];                                                                             // 46
      if (precedence.subscriptionHandle === subscriptionHandle) {                                                     // 47
        // The view's value can only change if this subscription is the one that                                      //
        // used to have precedence.                                                                                   //
        if (i === 0) removedValue = precedence.value;                                                                 // 50
        precedenceList.splice(i, 1);                                                                                  // 52
        break;                                                                                                        // 53
      }                                                                                                               //
    }                                                                                                                 //
    if (_.isEmpty(precedenceList)) {                                                                                  // 56
      delete self.dataByKey[key];                                                                                     // 57
      changeCollector[key] = undefined;                                                                               // 58
    } else if (removedValue !== undefined && !EJSON.equals(removedValue, precedenceList[0].value)) {                  //
      changeCollector[key] = precedenceList[0].value;                                                                 // 61
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  changeField: function (subscriptionHandle, key, value, changeCollector, isAdd) {                                    // 65
    var self = this;                                                                                                  // 67
    // Publish API ignores _id if present in fields                                                                   //
    if (key === "_id") return;                                                                                        // 69
                                                                                                                      //
    // Don't share state with the data passed in by the user.                                                         //
    value = EJSON.clone(value);                                                                                       // 73
                                                                                                                      //
    if (!_.has(self.dataByKey, key)) {                                                                                // 75
      self.dataByKey[key] = [{ subscriptionHandle: subscriptionHandle,                                                // 76
        value: value }];                                                                                              // 77
      changeCollector[key] = value;                                                                                   // 78
      return;                                                                                                         // 79
    }                                                                                                                 //
    var precedenceList = self.dataByKey[key];                                                                         // 81
    var elt;                                                                                                          // 82
    if (!isAdd) {                                                                                                     // 83
      elt = _.find(precedenceList, function (precedence) {                                                            // 84
        return precedence.subscriptionHandle === subscriptionHandle;                                                  // 85
      });                                                                                                             //
    }                                                                                                                 //
                                                                                                                      //
    if (elt) {                                                                                                        // 89
      if (elt === precedenceList[0] && !EJSON.equals(value, elt.value)) {                                             // 90
        // this subscription is changing the value of this field.                                                     //
        changeCollector[key] = value;                                                                                 // 92
      }                                                                                                               //
      elt.value = value;                                                                                              // 94
    } else {                                                                                                          //
      // this subscription is newly caring about this field                                                           //
      precedenceList.push({ subscriptionHandle: subscriptionHandle, value: value });                                  // 97
    }                                                                                                                 //
  }                                                                                                                   //
});                                                                                                                   //
                                                                                                                      //
/**                                                                                                                   //
 * Represents a client's view of a single collection                                                                  //
 * @param {String} collectionName Name of the collection it represents                                                //
 * @param {Object.<String, Function>} sessionCallbacks The callbacks for added, changed, removed                      //
 * @class SessionCollectionView                                                                                       //
 */                                                                                                                   //
var SessionCollectionView = function (collectionName, sessionCallbacks) {                                             // 109
  var self = this;                                                                                                    // 110
  self.collectionName = collectionName;                                                                               // 111
  self.documents = {};                                                                                                // 112
  self.callbacks = sessionCallbacks;                                                                                  // 113
};                                                                                                                    //
                                                                                                                      //
DDPServer._SessionCollectionView = SessionCollectionView;                                                             // 116
                                                                                                                      //
_.extend(SessionCollectionView.prototype, {                                                                           // 119
                                                                                                                      //
  isEmpty: function () {                                                                                              // 121
    var self = this;                                                                                                  // 122
    return _.isEmpty(self.documents);                                                                                 // 123
  },                                                                                                                  //
                                                                                                                      //
  diff: function (previous) {                                                                                         // 126
    var self = this;                                                                                                  // 127
    DiffSequence.diffObjects(previous.documents, self.documents, {                                                    // 128
      both: _.bind(self.diffDocument, self),                                                                          // 129
                                                                                                                      //
      rightOnly: function (id, nowDV) {                                                                               // 131
        self.callbacks.added(self.collectionName, id, nowDV.getFields());                                             // 132
      },                                                                                                              //
                                                                                                                      //
      leftOnly: function (id, prevDV) {                                                                               // 135
        self.callbacks.removed(self.collectionName, id);                                                              // 136
      }                                                                                                               //
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  diffDocument: function (id, prevDV, nowDV) {                                                                        // 141
    var self = this;                                                                                                  // 142
    var fields = {};                                                                                                  // 143
    DiffSequence.diffObjects(prevDV.getFields(), nowDV.getFields(), {                                                 // 144
      both: function (key, prev, now) {                                                                               // 145
        if (!EJSON.equals(prev, now)) fields[key] = now;                                                              // 146
      },                                                                                                              //
      rightOnly: function (key, now) {                                                                                // 149
        fields[key] = now;                                                                                            // 150
      },                                                                                                              //
      leftOnly: function (key, prev) {                                                                                // 152
        fields[key] = undefined;                                                                                      // 153
      }                                                                                                               //
    });                                                                                                               //
    self.callbacks.changed(self.collectionName, id, fields);                                                          // 156
  },                                                                                                                  //
                                                                                                                      //
  added: function (subscriptionHandle, id, fields) {                                                                  // 159
    var self = this;                                                                                                  // 160
    var docView = self.documents[id];                                                                                 // 161
    var added = false;                                                                                                // 162
    if (!docView) {                                                                                                   // 163
      added = true;                                                                                                   // 164
      docView = new SessionDocumentView();                                                                            // 165
      self.documents[id] = docView;                                                                                   // 166
    }                                                                                                                 //
    docView.existsIn[subscriptionHandle] = true;                                                                      // 168
    var changeCollector = {};                                                                                         // 169
    _.each(fields, function (value, key) {                                                                            // 170
      docView.changeField(subscriptionHandle, key, value, changeCollector, true);                                     // 171
    });                                                                                                               //
    if (added) self.callbacks.added(self.collectionName, id, changeCollector);else self.callbacks.changed(self.collectionName, id, changeCollector);
  },                                                                                                                  //
                                                                                                                      //
  changed: function (subscriptionHandle, id, changed) {                                                               // 180
    var self = this;                                                                                                  // 181
    var changedResult = {};                                                                                           // 182
    var docView = self.documents[id];                                                                                 // 183
    if (!docView) throw new Error("Could not find element with id " + id + " to change");                             // 184
    _.each(changed, function (value, key) {                                                                           // 186
      if (value === undefined) docView.clearField(subscriptionHandle, key, changedResult);else docView.changeField(subscriptionHandle, key, value, changedResult);
    });                                                                                                               //
    self.callbacks.changed(self.collectionName, id, changedResult);                                                   // 192
  },                                                                                                                  //
                                                                                                                      //
  removed: function (subscriptionHandle, id) {                                                                        // 195
    var self = this;                                                                                                  // 196
    var docView = self.documents[id];                                                                                 // 197
    if (!docView) {                                                                                                   // 198
      var err = new Error("Removed nonexistent document " + id);                                                      // 199
      throw err;                                                                                                      // 200
    }                                                                                                                 //
    delete docView.existsIn[subscriptionHandle];                                                                      // 202
    if (_.isEmpty(docView.existsIn)) {                                                                                // 203
      // it is gone from everyone                                                                                     //
      self.callbacks.removed(self.collectionName, id);                                                                // 205
      delete self.documents[id];                                                                                      // 206
    } else {                                                                                                          //
      var changed = {};                                                                                               // 208
      // remove this subscription from every precedence list                                                          //
      // and record the changes                                                                                       //
      _.each(docView.dataByKey, function (precedenceList, key) {                                                      // 211
        docView.clearField(subscriptionHandle, key, changed);                                                         // 212
      });                                                                                                             //
                                                                                                                      //
      self.callbacks.changed(self.collectionName, id, changed);                                                       // 215
    }                                                                                                                 //
  }                                                                                                                   //
});                                                                                                                   //
                                                                                                                      //
/******************************************************************************/                                      //
/* Session                                                                    */                                      //
/******************************************************************************/                                      //
                                                                                                                      //
var Session = function (server, version, socket, options) {                                                           // 224
  var self = this;                                                                                                    // 225
  self.id = Random.id();                                                                                              // 226
                                                                                                                      //
  self.server = server;                                                                                               // 228
  self.version = version;                                                                                             // 229
                                                                                                                      //
  self.initialized = false;                                                                                           // 231
  self.socket = socket;                                                                                               // 232
                                                                                                                      //
  // set to null when the session is destroyed. multiple places below                                                 //
  // use this to determine if the session is alive or not.                                                            //
  self.inQueue = new Meteor._DoubleEndedQueue();                                                                      // 236
                                                                                                                      //
  self.blocked = false;                                                                                               // 238
  self.workerRunning = false;                                                                                         // 239
                                                                                                                      //
  // Sub objects for active subscriptions                                                                             //
  self._namedSubs = {};                                                                                               // 242
  self._universalSubs = [];                                                                                           // 243
                                                                                                                      //
  self.userId = null;                                                                                                 // 245
                                                                                                                      //
  self.collectionViews = {};                                                                                          // 247
                                                                                                                      //
  // Set this to false to not send messages when collectionViews are                                                  //
  // modified. This is done when rerunning subs in _setUserId and those messages                                      //
  // are calculated via a diff instead.                                                                               //
  self._isSending = true;                                                                                             // 252
                                                                                                                      //
  // If this is true, don't start a newly-created universal publisher on this                                         //
  // session. The session will take care of starting it when appropriate.                                             //
  self._dontStartNewUniversalSubs = false;                                                                            // 256
                                                                                                                      //
  // when we are rerunning subscriptions, any ready messages                                                          //
  // we want to buffer up for when we are done rerunning subscriptions                                                //
  self._pendingReady = [];                                                                                            // 260
                                                                                                                      //
  // List of callbacks to call when this connection is closed.                                                        //
  self._closeCallbacks = [];                                                                                          // 263
                                                                                                                      //
  // XXX HACK: If a sockjs connection, save off the URL. This is                                                      //
  // temporary and will go away in the near future.                                                                   //
  self._socketUrl = socket.url;                                                                                       // 268
                                                                                                                      //
  // Allow tests to disable responding to pings.                                                                      //
  self._respondToPings = options.respondToPings;                                                                      // 271
                                                                                                                      //
  // This object is the public interface to the session. In the public                                                //
  // API, it is called the `connection` object.  Internally we call it                                                //
  // a `connectionHandle` to avoid ambiguity.                                                                         //
  self.connectionHandle = {                                                                                           // 276
    id: self.id,                                                                                                      // 277
    close: function () {                                                                                              // 278
      self.close();                                                                                                   // 279
    },                                                                                                                //
    onClose: function (fn) {                                                                                          // 281
      var cb = Meteor.bindEnvironment(fn, "connection onClose callback");                                             // 282
      if (self.inQueue) {                                                                                             // 283
        self._closeCallbacks.push(cb);                                                                                // 284
      } else {                                                                                                        //
        // if we're already closed, call the callback.                                                                //
        Meteor.defer(cb);                                                                                             // 287
      }                                                                                                               //
    },                                                                                                                //
    clientAddress: self._clientAddress(),                                                                             // 290
    httpHeaders: self.socket.headers                                                                                  // 291
  };                                                                                                                  //
                                                                                                                      //
  socket.send(DDPCommon.stringifyDDP({ msg: 'connected',                                                              // 294
    session: self.id }));                                                                                             // 295
  // On initial connect, spin up all the universal publishers.                                                        //
  Fiber(function () {                                                                                                 // 297
    self.startUniversalSubs();                                                                                        // 298
  }).run();                                                                                                           //
                                                                                                                      //
  if (version !== 'pre1' && options.heartbeatInterval !== 0) {                                                        // 301
    self.heartbeat = new DDPCommon.Heartbeat({                                                                        // 302
      heartbeatInterval: options.heartbeatInterval,                                                                   // 303
      heartbeatTimeout: options.heartbeatTimeout,                                                                     // 304
      onTimeout: function () {                                                                                        // 305
        self.close();                                                                                                 // 306
      },                                                                                                              //
      sendPing: function () {                                                                                         // 308
        self.send({ msg: 'ping' });                                                                                   // 309
      }                                                                                                               //
    });                                                                                                               //
    self.heartbeat.start();                                                                                           // 312
  }                                                                                                                   //
                                                                                                                      //
  Package.facts && Package.facts.Facts.incrementServerFact("livedata", "sessions", 1);                                // 315
};                                                                                                                    //
                                                                                                                      //
_.extend(Session.prototype, {                                                                                         // 319
                                                                                                                      //
  sendReady: function (subscriptionIds) {                                                                             // 321
    var self = this;                                                                                                  // 322
    if (self._isSending) self.send({ msg: "ready", subs: subscriptionIds });else {                                    // 323
      _.each(subscriptionIds, function (subscriptionId) {                                                             // 326
        self._pendingReady.push(subscriptionId);                                                                      // 327
      });                                                                                                             //
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  sendAdded: function (collectionName, id, fields) {                                                                  // 332
    var self = this;                                                                                                  // 333
    if (self._isSending) self.send({ msg: "added", collection: collectionName, id: id, fields: fields });             // 334
  },                                                                                                                  //
                                                                                                                      //
  sendChanged: function (collectionName, id, fields) {                                                                // 338
    var self = this;                                                                                                  // 339
    if (_.isEmpty(fields)) return;                                                                                    // 340
                                                                                                                      //
    if (self._isSending) {                                                                                            // 343
      self.send({                                                                                                     // 344
        msg: "changed",                                                                                               // 345
        collection: collectionName,                                                                                   // 346
        id: id,                                                                                                       // 347
        fields: fields                                                                                                // 348
      });                                                                                                             //
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  sendRemoved: function (collectionName, id) {                                                                        // 353
    var self = this;                                                                                                  // 354
    if (self._isSending) self.send({ msg: "removed", collection: collectionName, id: id });                           // 355
  },                                                                                                                  //
                                                                                                                      //
  getSendCallbacks: function () {                                                                                     // 359
    var self = this;                                                                                                  // 360
    return {                                                                                                          // 361
      added: _.bind(self.sendAdded, self),                                                                            // 362
      changed: _.bind(self.sendChanged, self),                                                                        // 363
      removed: _.bind(self.sendRemoved, self)                                                                         // 364
    };                                                                                                                //
  },                                                                                                                  //
                                                                                                                      //
  getCollectionView: function (collectionName) {                                                                      // 368
    var self = this;                                                                                                  // 369
    if (_.has(self.collectionViews, collectionName)) {                                                                // 370
      return self.collectionViews[collectionName];                                                                    // 371
    }                                                                                                                 //
    var ret = new SessionCollectionView(collectionName, self.getSendCallbacks());                                     // 373
    self.collectionViews[collectionName] = ret;                                                                       // 375
    return ret;                                                                                                       // 376
  },                                                                                                                  //
                                                                                                                      //
  added: function (subscriptionHandle, collectionName, id, fields) {                                                  // 379
    var self = this;                                                                                                  // 380
    var view = self.getCollectionView(collectionName);                                                                // 381
    view.added(subscriptionHandle, id, fields);                                                                       // 382
  },                                                                                                                  //
                                                                                                                      //
  removed: function (subscriptionHandle, collectionName, id) {                                                        // 385
    var self = this;                                                                                                  // 386
    var view = self.getCollectionView(collectionName);                                                                // 387
    view.removed(subscriptionHandle, id);                                                                             // 388
    if (view.isEmpty()) {                                                                                             // 389
      delete self.collectionViews[collectionName];                                                                    // 390
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  changed: function (subscriptionHandle, collectionName, id, fields) {                                                // 394
    var self = this;                                                                                                  // 395
    var view = self.getCollectionView(collectionName);                                                                // 396
    view.changed(subscriptionHandle, id, fields);                                                                     // 397
  },                                                                                                                  //
                                                                                                                      //
  startUniversalSubs: function () {                                                                                   // 400
    var self = this;                                                                                                  // 401
    // Make a shallow copy of the set of universal handlers and start them. If                                        //
    // additional universal publishers start while we're running them (due to                                         //
    // yielding), they will run separately as part of Server.publish.                                                 //
    var handlers = _.clone(self.server.universal_publish_handlers);                                                   // 405
    _.each(handlers, function (handler) {                                                                             // 406
      self._startSubscription(handler);                                                                               // 407
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  // Destroy this session and unregister it at the server.                                                            //
  close: function () {                                                                                                // 412
    var self = this;                                                                                                  // 413
                                                                                                                      //
    // Destroy this session, even if it's not registered at the                                                       //
    // server. Stop all processing and tear everything down. If a socket                                              //
    // was attached, close it.                                                                                        //
                                                                                                                      //
    // Already destroyed.                                                                                             //
    if (!self.inQueue) return;                                                                                        // 420
                                                                                                                      //
    // Drop the merge box data immediately.                                                                           //
    self.inQueue = null;                                                                                              // 424
    self.collectionViews = {};                                                                                        // 425
                                                                                                                      //
    if (self.heartbeat) {                                                                                             // 427
      self.heartbeat.stop();                                                                                          // 428
      self.heartbeat = null;                                                                                          // 429
    }                                                                                                                 //
                                                                                                                      //
    if (self.socket) {                                                                                                // 432
      self.socket.close();                                                                                            // 433
      self.socket._meteorSession = null;                                                                              // 434
    }                                                                                                                 //
                                                                                                                      //
    Package.facts && Package.facts.Facts.incrementServerFact("livedata", "sessions", -1);                             // 437
                                                                                                                      //
    Meteor.defer(function () {                                                                                        // 440
      // stop callbacks can yield, so we defer this on close.                                                         //
      // sub._isDeactivated() detects that we set inQueue to null and                                                 //
      // treats it as semi-deactivated (it will ignore incoming callbacks, etc).                                      //
      self._deactivateAllSubscriptions();                                                                             // 444
                                                                                                                      //
      // Defer calling the close callbacks, so that the caller closing                                                //
      // the session isn't waiting for all the callbacks to complete.                                                 //
      _.each(self._closeCallbacks, function (callback) {                                                              // 448
        callback();                                                                                                   // 449
      });                                                                                                             //
    });                                                                                                               //
                                                                                                                      //
    // Unregister the session.                                                                                        //
    self.server._removeSession(self);                                                                                 // 454
  },                                                                                                                  //
                                                                                                                      //
  // Send a message (doing nothing if no socket is connected right now.)                                              //
  // It should be a JSON object (it will be stringified.)                                                             //
  send: function (msg) {                                                                                              // 459
    var self = this;                                                                                                  // 460
    if (self.socket) {                                                                                                // 461
      if (Meteor._printSentDDP) Meteor._debug("Sent DDP", DDPCommon.stringifyDDP(msg));                               // 462
      self.socket.send(DDPCommon.stringifyDDP(msg));                                                                  // 464
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  // Send a connection error.                                                                                         //
  sendError: function (reason, offendingMessage) {                                                                    // 469
    var self = this;                                                                                                  // 470
    var msg = { msg: 'error', reason: reason };                                                                       // 471
    if (offendingMessage) msg.offendingMessage = offendingMessage;                                                    // 472
    self.send(msg);                                                                                                   // 474
  },                                                                                                                  //
                                                                                                                      //
  // Process 'msg' as an incoming message. (But as a guard against                                                    //
  // race conditions during reconnection, ignore the message if                                                       //
  // 'socket' is not the currently connected socket.)                                                                 //
  //                                                                                                                  //
  // We run the messages from the client one at a time, in the order                                                  //
  // given by the client. The message handler is passed an idempotent                                                 //
  // function 'unblock' which it may call to allow other messages to                                                  //
  // begin running in parallel in another fiber (for example, a method                                                //
  // that wants to yield.) Otherwise, it is automatically unblocked                                                   //
  // when it returns.                                                                                                 //
  //                                                                                                                  //
  // Actually, we don't have to 'totally order' the messages in this                                                  //
  // way, but it's the easiest thing that's correct. (unsub needs to                                                  //
  // be ordered against sub, methods need to be ordered against each                                                  //
  // other.)                                                                                                          //
  processMessage: function (msg_in) {                                                                                 // 492
    var self = this;                                                                                                  // 493
    if (!self.inQueue) // we have been destroyed.                                                                     // 494
      return;                                                                                                         // 495
                                                                                                                      //
    // Respond to ping and pong messages immediately without queuing.                                                 //
    // If the negotiated DDP version is "pre1" which didn't support                                                   //
    // pings, preserve the "pre1" behavior of responding with a "bad                                                  //
    // request" for the unknown messages.                                                                             //
    //                                                                                                                //
    // Fibers are needed because heartbeat uses Meteor.setTimeout, which                                              //
    // needs a Fiber. We could actually use regular setTimeout and avoid                                              //
    // these new fibers, but it is easier to just make everything use                                                 //
    // Meteor.setTimeout and not think too hard.                                                                      //
    //                                                                                                                //
    // Any message counts as receiving a pong, as it demonstrates that                                                //
    // the client is still alive.                                                                                     //
    if (self.heartbeat) {                                                                                             // 509
      Fiber(function () {                                                                                             // 510
        self.heartbeat.messageReceived();                                                                             // 511
      }).run();                                                                                                       //
    }                                                                                                                 //
                                                                                                                      //
    if (self.version !== 'pre1' && msg_in.msg === 'ping') {                                                           // 515
      if (self._respondToPings) self.send({ msg: "pong", id: msg_in.id });                                            // 516
      return;                                                                                                         // 518
    }                                                                                                                 //
    if (self.version !== 'pre1' && msg_in.msg === 'pong') {                                                           // 520
      // Since everything is a pong, nothing to do                                                                    //
      return;                                                                                                         // 522
    }                                                                                                                 //
                                                                                                                      //
    self.inQueue.push(msg_in);                                                                                        // 525
    if (self.workerRunning) return;                                                                                   // 526
    self.workerRunning = true;                                                                                        // 528
                                                                                                                      //
    var processNext = function () {                                                                                   // 530
      var msg = self.inQueue && self.inQueue.shift();                                                                 // 531
      if (!msg) {                                                                                                     // 532
        self.workerRunning = false;                                                                                   // 533
        return;                                                                                                       // 534
      }                                                                                                               //
                                                                                                                      //
      Fiber(function () {                                                                                             // 537
        var blocked = true;                                                                                           // 538
                                                                                                                      //
        var unblock = function () {                                                                                   // 540
          if (!blocked) return; // idempotent                                                                         // 541
          blocked = false;                                                                                            // 543
          processNext();                                                                                              // 544
        };                                                                                                            //
                                                                                                                      //
        if (_.has(self.protocol_handlers, msg.msg)) self.protocol_handlers[msg.msg].call(self, msg, unblock);else self.sendError('Bad request', msg);
        unblock(); // in case the handler didn't already do it                                                        // 551
      }).run();                                                                                                       //
    };                                                                                                                //
                                                                                                                      //
    processNext();                                                                                                    // 555
  },                                                                                                                  //
                                                                                                                      //
  protocol_handlers: {                                                                                                // 558
    sub: function (msg) {                                                                                             // 559
      var self = this;                                                                                                // 560
                                                                                                                      //
      // reject malformed messages                                                                                    //
      if (typeof msg.id !== "string" || typeof msg.name !== "string" || 'params' in msg && !(msg.params instanceof Array)) {
        self.sendError("Malformed subscription", msg);                                                                // 566
        return;                                                                                                       // 567
      }                                                                                                               //
                                                                                                                      //
      if (!self.server.publish_handlers[msg.name]) {                                                                  // 570
        self.send({                                                                                                   // 571
          msg: 'nosub', id: msg.id,                                                                                   // 572
          error: new Meteor.Error(404, "Subscription not found") });                                                  // 573
        return;                                                                                                       // 574
      }                                                                                                               //
                                                                                                                      //
      if (_.has(self._namedSubs, msg.id))                                                                             // 577
        // subs are idempotent, or rather, they are ignored if a sub                                                  //
        // with that id already exists. this is important during                                                      //
        // reconnect.                                                                                                 //
        return;                                                                                                       // 581
                                                                                                                      //
      // XXX It'd be much better if we had generic hooks where any package can                                        //
      // hook into subscription handling, but in the mean while we special case                                       //
      // ddp-rate-limiter package. This is also done for weak requirements to                                         //
      // add the ddp-rate-limiter package in case we don't have Accounts. A                                           //
      // user trying to use the ddp-rate-limiter must explicitly require it.                                          //
      if (Package['ddp-rate-limiter']) {                                                                              // 588
        var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;                                              // 589
        var rateLimiterInput = {                                                                                      // 590
          userId: self.userId,                                                                                        // 591
          clientAddress: self.connectionHandle.clientAddress,                                                         // 592
          type: "subscription",                                                                                       // 593
          name: msg.name,                                                                                             // 594
          connectionId: self.id                                                                                       // 595
        };                                                                                                            //
                                                                                                                      //
        DDPRateLimiter._increment(rateLimiterInput);                                                                  // 598
        var rateLimitResult = DDPRateLimiter._check(rateLimiterInput);                                                // 599
        if (!rateLimitResult.allowed) {                                                                               // 600
          self.send({                                                                                                 // 601
            msg: 'nosub', id: msg.id,                                                                                 // 602
            error: new Meteor.Error('too-many-requests', DDPRateLimiter.getErrorMessage(rateLimitResult), { timeToReset: rateLimitResult.timeToReset })
          });                                                                                                         //
          return;                                                                                                     // 608
        }                                                                                                             //
      }                                                                                                               //
                                                                                                                      //
      var handler = self.server.publish_handlers[msg.name];                                                           // 612
                                                                                                                      //
      self._startSubscription(handler, msg.id, msg.params, msg.name);                                                 // 614
    },                                                                                                                //
                                                                                                                      //
    unsub: function (msg) {                                                                                           // 618
      var self = this;                                                                                                // 619
                                                                                                                      //
      self._stopSubscription(msg.id);                                                                                 // 621
    },                                                                                                                //
                                                                                                                      //
    method: function (msg, unblock) {                                                                                 // 624
      var self = this;                                                                                                // 625
                                                                                                                      //
      // reject malformed messages                                                                                    //
      // For now, we silently ignore unknown attributes,                                                              //
      // for forwards compatibility.                                                                                  //
      if (typeof msg.id !== "string" || typeof msg.method !== "string" || 'params' in msg && !(msg.params instanceof Array) || 'randomSeed' in msg && typeof msg.randomSeed !== "string") {
        self.sendError("Malformed method invocation", msg);                                                           // 634
        return;                                                                                                       // 635
      }                                                                                                               //
                                                                                                                      //
      var randomSeed = msg.randomSeed || null;                                                                        // 638
                                                                                                                      //
      // set up to mark the method as satisfied once all observers                                                    //
      // (and subscriptions) have reacted to any writes that were                                                     //
      // done.                                                                                                        //
      var fence = new DDPServer._WriteFence();                                                                        // 643
      fence.onAllCommitted(function () {                                                                              // 644
        // Retire the fence so that future writes are allowed.                                                        //
        // This means that callbacks like timers are free to use                                                      //
        // the fence, and if they fire before it's armed (for                                                         //
        // example, because the method waits for them) their                                                          //
        // writes will be included in the fence.                                                                      //
        fence.retire();                                                                                               // 650
        self.send({                                                                                                   // 651
          msg: 'updated', methods: [msg.id] });                                                                       // 652
      });                                                                                                             //
                                                                                                                      //
      // find the handler                                                                                             //
      var handler = self.server.method_handlers[msg.method];                                                          // 656
      if (!handler) {                                                                                                 // 657
        self.send({                                                                                                   // 658
          msg: 'result', id: msg.id,                                                                                  // 659
          error: new Meteor.Error(404, "Method not found") });                                                        // 660
        fence.arm();                                                                                                  // 661
        return;                                                                                                       // 662
      }                                                                                                               //
                                                                                                                      //
      var setUserId = function (userId) {                                                                             // 665
        self._setUserId(userId);                                                                                      // 666
      };                                                                                                              //
                                                                                                                      //
      var invocation = new DDPCommon.MethodInvocation({                                                               // 669
        isSimulation: false,                                                                                          // 670
        userId: self.userId,                                                                                          // 671
        setUserId: setUserId,                                                                                         // 672
        unblock: unblock,                                                                                             // 673
        connection: self.connectionHandle,                                                                            // 674
        randomSeed: randomSeed                                                                                        // 675
      });                                                                                                             //
                                                                                                                      //
      var promise = new Promise(function (resolve, reject) {                                                          // 678
        // XXX It'd be better if we could hook into method handlers better but                                        //
        // for now, we need to check if the ddp-rate-limiter exists since we                                          //
        // have a weak requirement for the ddp-rate-limiter package to be added                                       //
        // to our application.                                                                                        //
        if (Package['ddp-rate-limiter']) {                                                                            // 683
          var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;                                            // 684
          var rateLimiterInput = {                                                                                    // 685
            userId: self.userId,                                                                                      // 686
            clientAddress: self.connectionHandle.clientAddress,                                                       // 687
            type: "method",                                                                                           // 688
            name: msg.method,                                                                                         // 689
            connectionId: self.id                                                                                     // 690
          };                                                                                                          //
          DDPRateLimiter._increment(rateLimiterInput);                                                                // 692
          var rateLimitResult = DDPRateLimiter._check(rateLimiterInput);                                              // 693
          if (!rateLimitResult.allowed) {                                                                             // 694
            reject(new Meteor.Error("too-many-requests", DDPRateLimiter.getErrorMessage(rateLimitResult), { timeToReset: rateLimitResult.timeToReset }));
            return;                                                                                                   // 700
          }                                                                                                           //
        }                                                                                                             //
                                                                                                                      //
        resolve(DDPServer._CurrentWriteFence.withValue(fence, function () {                                           // 704
          return DDP._CurrentInvocation.withValue(invocation, function () {                                           //
            return maybeAuditArgumentChecks(handler, invocation, msg.params, "call to '" + msg.method + "'");         //
          });                                                                                                         //
        }));                                                                                                          //
      });                                                                                                             //
                                                                                                                      //
      function finish() {                                                                                             // 716
        fence.arm();                                                                                                  // 717
        unblock();                                                                                                    // 718
      }                                                                                                               //
                                                                                                                      //
      var payload = {                                                                                                 // 721
        msg: "result",                                                                                                // 722
        id: msg.id                                                                                                    // 723
      };                                                                                                              //
                                                                                                                      //
      promise.then(function (result) {                                                                                // 726
        finish();                                                                                                     // 727
        if (result !== undefined) {                                                                                   // 728
          payload.result = result;                                                                                    // 729
        }                                                                                                             //
        self.send(payload);                                                                                           // 731
      }, function (exception) {                                                                                       //
        finish();                                                                                                     // 733
        payload.error = wrapInternalException(exception, "while invoking method '" + msg.method + "'");               // 734
        self.send(payload);                                                                                           // 738
      });                                                                                                             //
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  _eachSub: function (f) {                                                                                            // 743
    var self = this;                                                                                                  // 744
    _.each(self._namedSubs, f);                                                                                       // 745
    _.each(self._universalSubs, f);                                                                                   // 746
  },                                                                                                                  //
                                                                                                                      //
  _diffCollectionViews: function (beforeCVs) {                                                                        // 749
    var self = this;                                                                                                  // 750
    DiffSequence.diffObjects(beforeCVs, self.collectionViews, {                                                       // 751
      both: function (collectionName, leftValue, rightValue) {                                                        // 752
        rightValue.diff(leftValue);                                                                                   // 753
      },                                                                                                              //
      rightOnly: function (collectionName, rightValue) {                                                              // 755
        _.each(rightValue.documents, function (docView, id) {                                                         // 756
          self.sendAdded(collectionName, id, docView.getFields());                                                    // 757
        });                                                                                                           //
      },                                                                                                              //
      leftOnly: function (collectionName, leftValue) {                                                                // 760
        _.each(leftValue.documents, function (doc, id) {                                                              // 761
          self.sendRemoved(collectionName, id);                                                                       // 762
        });                                                                                                           //
      }                                                                                                               //
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  // Sets the current user id in all appropriate contexts and reruns                                                  //
  // all subscriptions                                                                                                //
  _setUserId: function (userId) {                                                                                     // 770
    var self = this;                                                                                                  // 771
                                                                                                                      //
    if (userId !== null && typeof userId !== "string") throw new Error("setUserId must be called on string or null, not " + typeof userId);
                                                                                                                      //
    // Prevent newly-created universal subscriptions from being added to our                                          //
    // session; they will be found below when we call startUniversalSubs.                                             //
    //                                                                                                                //
    // (We don't have to worry about named subscriptions, because we only add                                         //
    // them when we process a 'sub' message. We are currently processing a                                            //
    // 'method' message, and the method did not unblock, because it is illegal                                        //
    // to call setUserId after unblock. Thus we cannot be concurrently adding a                                       //
    // new named subscription.)                                                                                       //
    self._dontStartNewUniversalSubs = true;                                                                           // 785
                                                                                                                      //
    // Prevent current subs from updating our collectionViews and call their                                          //
    // stop callbacks. This may yield.                                                                                //
    self._eachSub(function (sub) {                                                                                    // 789
      sub._deactivate();                                                                                              // 790
    });                                                                                                               //
                                                                                                                      //
    // All subs should now be deactivated. Stop sending messages to the client,                                       //
    // save the state of the published collections, reset to an empty view, and                                       //
    // update the userId.                                                                                             //
    self._isSending = false;                                                                                          // 796
    var beforeCVs = self.collectionViews;                                                                             // 797
    self.collectionViews = {};                                                                                        // 798
    self.userId = userId;                                                                                             // 799
                                                                                                                      //
    // Save the old named subs, and reset to having no subscriptions.                                                 //
    var oldNamedSubs = self._namedSubs;                                                                               // 802
    self._namedSubs = {};                                                                                             // 803
    self._universalSubs = [];                                                                                         // 804
                                                                                                                      //
    _.each(oldNamedSubs, function (sub, subscriptionId) {                                                             // 806
      self._namedSubs[subscriptionId] = sub._recreate();                                                              // 807
      // nb: if the handler throws or calls this.error(), it will in fact                                             //
      // immediately send its 'nosub'. This is OK, though.                                                            //
      self._namedSubs[subscriptionId]._runHandler();                                                                  // 810
    });                                                                                                               //
                                                                                                                      //
    // Allow newly-created universal subs to be started on our connection in                                          //
    // parallel with the ones we're spinning up here, and spin up universal                                           //
    // subs.                                                                                                          //
    self._dontStartNewUniversalSubs = false;                                                                          // 816
    self.startUniversalSubs();                                                                                        // 817
                                                                                                                      //
    // Start sending messages again, beginning with the diff from the previous                                        //
    // state of the world to the current state. No yields are allowed during                                          //
    // this diff, so that other changes cannot interleave.                                                            //
    Meteor._noYieldsAllowed(function () {                                                                             // 822
      self._isSending = true;                                                                                         // 823
      self._diffCollectionViews(beforeCVs);                                                                           // 824
      if (!_.isEmpty(self._pendingReady)) {                                                                           // 825
        self.sendReady(self._pendingReady);                                                                           // 826
        self._pendingReady = [];                                                                                      // 827
      }                                                                                                               //
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  _startSubscription: function (handler, subId, params, name) {                                                       // 832
    var self = this;                                                                                                  // 833
                                                                                                                      //
    var sub = new Subscription(self, handler, subId, params, name);                                                   // 835
    if (subId) self._namedSubs[subId] = sub;else self._universalSubs.push(sub);                                       // 837
                                                                                                                      //
    sub._runHandler();                                                                                                // 842
  },                                                                                                                  //
                                                                                                                      //
  // tear down specified subscription                                                                                 //
  _stopSubscription: function (subId, error) {                                                                        // 846
    var self = this;                                                                                                  // 847
                                                                                                                      //
    var subName = null;                                                                                               // 849
                                                                                                                      //
    if (subId && self._namedSubs[subId]) {                                                                            // 851
      subName = self._namedSubs[subId]._name;                                                                         // 852
      self._namedSubs[subId]._removeAllDocuments();                                                                   // 853
      self._namedSubs[subId]._deactivate();                                                                           // 854
      delete self._namedSubs[subId];                                                                                  // 855
    }                                                                                                                 //
                                                                                                                      //
    var response = { msg: 'nosub', id: subId };                                                                       // 858
                                                                                                                      //
    if (error) {                                                                                                      // 860
      response.error = wrapInternalException(error, subName ? "from sub " + subName + " id " + subId : "from sub id " + subId);
    }                                                                                                                 //
                                                                                                                      //
    self.send(response);                                                                                              // 867
  },                                                                                                                  //
                                                                                                                      //
  // tear down all subscriptions. Note that this does NOT send removed or nosub                                       //
  // messages, since we assume the client is gone.                                                                    //
  _deactivateAllSubscriptions: function () {                                                                          // 872
    var self = this;                                                                                                  // 873
                                                                                                                      //
    _.each(self._namedSubs, function (sub, id) {                                                                      // 875
      sub._deactivate();                                                                                              // 876
    });                                                                                                               //
    self._namedSubs = {};                                                                                             // 878
                                                                                                                      //
    _.each(self._universalSubs, function (sub) {                                                                      // 880
      sub._deactivate();                                                                                              // 881
    });                                                                                                               //
    self._universalSubs = [];                                                                                         // 883
  },                                                                                                                  //
                                                                                                                      //
  // Determine the remote client's IP address, based on the                                                           //
  // HTTP_FORWARDED_COUNT environment variable representing how many                                                  //
  // proxies the server is behind.                                                                                    //
  _clientAddress: function () {                                                                                       // 889
    var self = this;                                                                                                  // 890
                                                                                                                      //
    // For the reported client address for a connection to be correct,                                                //
    // the developer must set the HTTP_FORWARDED_COUNT environment                                                    //
    // variable to an integer representing the number of hops they                                                    //
    // expect in the `x-forwarded-for` header. E.g., set to "1" if the                                                //
    // server is behind one proxy.                                                                                    //
    //                                                                                                                //
    // This could be computed once at startup instead of every time.                                                  //
    var httpForwardedCount = parseInt(process.env['HTTP_FORWARDED_COUNT']) || 0;                                      // 899
                                                                                                                      //
    if (httpForwardedCount === 0) return self.socket.remoteAddress;                                                   // 901
                                                                                                                      //
    var forwardedFor = self.socket.headers["x-forwarded-for"];                                                        // 904
    if (!_.isString(forwardedFor)) return null;                                                                       // 905
    forwardedFor = forwardedFor.trim().split(/\s*,\s*/);                                                              // 907
                                                                                                                      //
    // Typically the first value in the `x-forwarded-for` header is                                                   //
    // the original IP address of the client connecting to the first                                                  //
    // proxy.  However, the end user can easily spoof the header, in                                                  //
    // which case the first value(s) will be the fake IP address from                                                 //
    // the user pretending to be a proxy reporting the original IP                                                    //
    // address value.  By counting HTTP_FORWARDED_COUNT back from the                                                 //
    // end of the list, we ensure that we get the IP address being                                                    //
    // reported by *our* first proxy.                                                                                 //
                                                                                                                      //
    if (httpForwardedCount < 0 || httpForwardedCount > forwardedFor.length) return null;                              // 918
                                                                                                                      //
    return forwardedFor[forwardedFor.length - httpForwardedCount];                                                    // 921
  }                                                                                                                   //
});                                                                                                                   //
                                                                                                                      //
/******************************************************************************/                                      //
/* Subscription                                                               */                                      //
/******************************************************************************/                                      //
                                                                                                                      //
// ctor for a sub handle: the input to each publish function                                                          //
                                                                                                                      //
// Instance name is this because it's usually referred to as this inside a                                            //
// publish                                                                                                            //
/**                                                                                                                   //
 * @summary The server's side of a subscription                                                                       //
 * @class Subscription                                                                                                //
 * @instanceName this                                                                                                 //
 */                                                                                                                   //
var Subscription = function (session, handler, subscriptionId, params, name) {                                        // 938
  var self = this;                                                                                                    // 940
  self._session = session; // type is Session                                                                         // 941
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Access inside the publish function. The incoming [connection](#meteor_onconnection) for this subscription.
   * @locus Server                                                                                                    //
   * @name  connection                                                                                                //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   */                                                                                                                 //
  self.connection = session.connectionHandle; // public API object                                                    // 950
                                                                                                                      //
  self._handler = handler;                                                                                            // 952
                                                                                                                      //
  // my subscription ID (generated by client, undefined for universal subs).                                          //
  self._subscriptionId = subscriptionId;                                                                              // 955
  // undefined for universal subs                                                                                     //
  self._name = name;                                                                                                  // 957
                                                                                                                      //
  self._params = params || [];                                                                                        // 959
                                                                                                                      //
  // Only named subscriptions have IDs, but we need some sort of string                                               //
  // internally to keep track of all subscriptions inside                                                             //
  // SessionDocumentViews. We use this subscriptionHandle for that.                                                   //
  if (self._subscriptionId) {                                                                                         // 964
    self._subscriptionHandle = 'N' + self._subscriptionId;                                                            // 965
  } else {                                                                                                            //
    self._subscriptionHandle = 'U' + Random.id();                                                                     // 967
  }                                                                                                                   //
                                                                                                                      //
  // has _deactivate been called?                                                                                     //
  self._deactivated = false;                                                                                          // 971
                                                                                                                      //
  // stop callbacks to g/c this sub.  called w/ zero arguments.                                                       //
  self._stopCallbacks = [];                                                                                           // 974
                                                                                                                      //
  // the set of (collection, documentid) that this subscription has                                                   //
  // an opinion about                                                                                                 //
  self._documents = {};                                                                                               // 978
                                                                                                                      //
  // remember if we are ready.                                                                                        //
  self._ready = false;                                                                                                // 981
                                                                                                                      //
  // Part of the public API: the user of this sub.                                                                    //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Access inside the publish function. The id of the logged-in user, or `null` if no user is logged in.    //
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @name  userId                                                                                                    //
   * @instance                                                                                                        //
   */                                                                                                                 //
  self.userId = session.userId;                                                                                       // 992
                                                                                                                      //
  // For now, the id filter is going to default to                                                                    //
  // the to/from DDP methods on MongoID, to                                                                           //
  // specifically deal with mongo/minimongo ObjectIds.                                                                //
                                                                                                                      //
  // Later, you will be able to make this be "raw"                                                                    //
  // if you want to publish a collection that you know                                                                //
  // just has strings for keys and no funny business, to                                                              //
  // a ddp consumer that isn't minimongo                                                                              //
                                                                                                                      //
  self._idFilter = {                                                                                                  // 1003
    idStringify: MongoID.idStringify,                                                                                 // 1004
    idParse: MongoID.idParse                                                                                          // 1005
  };                                                                                                                  //
                                                                                                                      //
  Package.facts && Package.facts.Facts.incrementServerFact("livedata", "subscriptions", 1);                           // 1008
};                                                                                                                    //
                                                                                                                      //
_.extend(Subscription.prototype, {                                                                                    // 1012
  _runHandler: function () {                                                                                          // 1013
    // XXX should we unblock() here? Either before running the publish                                                //
    // function, or before running _publishCursor.                                                                    //
    //                                                                                                                //
    // Right now, each publish function blocks all future publishes and                                               //
    // methods waiting on data from Mongo (or whatever else the function                                              //
    // blocks on). This probably slows page load in common cases.                                                     //
                                                                                                                      //
    var self = this;                                                                                                  // 1021
    try {                                                                                                             // 1022
      var res = maybeAuditArgumentChecks(self._handler, self, EJSON.clone(self._params),                              // 1023
      // It's OK that this would look weird for universal subscriptions,                                              //
      // because they have no arguments so there can never be an                                                      //
      // audit-argument-checks failure.                                                                               //
      "publisher '" + self._name + "'");                                                                              // 1028
    } catch (e) {                                                                                                     //
      self.error(e);                                                                                                  // 1030
      return;                                                                                                         // 1031
    }                                                                                                                 //
                                                                                                                      //
    // Did the handler call this.error or this.stop?                                                                  //
    if (self._isDeactivated()) return;                                                                                // 1035
                                                                                                                      //
    // SPECIAL CASE: Instead of writing their own callbacks that invoke                                               //
    // this.added/changed/ready/etc, the user can just return a collection                                            //
    // cursor or array of cursors from the publish function; we call their                                            //
    // _publishCursor method which starts observing the cursor and publishes the                                      //
    // results. Note that _publishCursor does NOT call ready().                                                       //
    //                                                                                                                //
    // XXX This uses an undocumented interface which only the Mongo cursor                                            //
    // interface publishes. Should we make this interface public and encourage                                        //
    // users to implement it themselves? Arguably, it's unnecessary; users can                                        //
    // already write their own functions like                                                                         //
    //   var publishMyReactiveThingy = function (name, handler) {                                                     //
    //     Meteor.publish(name, function () {                                                                         //
    //       var reactiveThingy = handler();                                                                          //
    //       reactiveThingy.publishMe();                                                                              //
    //     });                                                                                                        //
    //   };                                                                                                           //
    var isCursor = function (c) {                                                                                     // 1054
      return c && c._publishCursor;                                                                                   // 1055
    };                                                                                                                //
    if (isCursor(res)) {                                                                                              // 1057
      try {                                                                                                           // 1058
        res._publishCursor(self);                                                                                     // 1059
      } catch (e) {                                                                                                   //
        self.error(e);                                                                                                // 1061
        return;                                                                                                       // 1062
      }                                                                                                               //
      // _publishCursor only returns after the initial added callbacks have run.                                      //
      // mark subscription as ready.                                                                                  //
      self.ready();                                                                                                   // 1066
    } else if (_.isArray(res)) {                                                                                      //
      // check all the elements are cursors                                                                           //
      if (!_.all(res, isCursor)) {                                                                                    // 1069
        self.error(new Error("Publish function returned an array of non-Cursors"));                                   // 1070
        return;                                                                                                       // 1071
      }                                                                                                               //
      // find duplicate collection names                                                                              //
      // XXX we should support overlapping cursors, but that would require the                                        //
      // merge box to allow overlap within a subscription                                                             //
      var collectionNames = {};                                                                                       // 1076
      for (var i = 0; i < res.length; ++i) {                                                                          // 1077
        var collectionName = res[i]._getCollectionName();                                                             // 1078
        if (_.has(collectionNames, collectionName)) {                                                                 // 1079
          self.error(new Error("Publish function returned multiple cursors for collection " + collectionName));       // 1080
          return;                                                                                                     // 1083
        }                                                                                                             //
        collectionNames[collectionName] = true;                                                                       // 1085
      };                                                                                                              //
                                                                                                                      //
      try {                                                                                                           // 1088
        _.each(res, function (cur) {                                                                                  // 1089
          cur._publishCursor(self);                                                                                   // 1090
        });                                                                                                           //
      } catch (e) {                                                                                                   //
        self.error(e);                                                                                                // 1093
        return;                                                                                                       // 1094
      }                                                                                                               //
      self.ready();                                                                                                   // 1096
    } else if (res) {                                                                                                 //
      // truthy values other than cursors or arrays are probably a                                                    //
      // user mistake (possible returning a Mongo document via, say,                                                  //
      // `coll.findOne()`).                                                                                           //
      self.error(new Error("Publish function can only return a Cursor or " + "an array of Cursors"));                 // 1101
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  // This calls all stop callbacks and prevents the handler from updating any                                         //
  // SessionCollectionViews further. It's used when the user unsubscribes or                                          //
  // disconnects, as well as during setUserId re-runs. It does *NOT* send                                             //
  // removed messages for the published objects; if that is necessary, call                                           //
  // _removeAllDocuments first.                                                                                       //
  _deactivate: function () {                                                                                          // 1111
    var self = this;                                                                                                  // 1112
    if (self._deactivated) return;                                                                                    // 1113
    self._deactivated = true;                                                                                         // 1115
    self._callStopCallbacks();                                                                                        // 1116
    Package.facts && Package.facts.Facts.incrementServerFact("livedata", "subscriptions", -1);                        // 1117
  },                                                                                                                  //
                                                                                                                      //
  _callStopCallbacks: function () {                                                                                   // 1121
    var self = this;                                                                                                  // 1122
    // tell listeners, so they can clean up                                                                           //
    var callbacks = self._stopCallbacks;                                                                              // 1124
    self._stopCallbacks = [];                                                                                         // 1125
    _.each(callbacks, function (callback) {                                                                           // 1126
      callback();                                                                                                     // 1127
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  // Send remove messages for every document.                                                                         //
  _removeAllDocuments: function () {                                                                                  // 1132
    var self = this;                                                                                                  // 1133
    Meteor._noYieldsAllowed(function () {                                                                             // 1134
      _.each(self._documents, function (collectionDocs, collectionName) {                                             // 1135
        // Iterate over _.keys instead of the dictionary itself, since we'll be                                       //
        // mutating it.                                                                                               //
        _.each(_.keys(collectionDocs), function (strId) {                                                             // 1138
          self.removed(collectionName, self._idFilter.idParse(strId));                                                // 1139
        });                                                                                                           //
      });                                                                                                             //
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  // Returns a new Subscription for the same session with the same                                                    //
  // initial creation parameters. This isn't a clone: it doesn't have                                                 //
  // the same _documents cache, stopped state or callbacks; may have a                                                //
  // different _subscriptionHandle, and gets its userId from the                                                      //
  // session, not from this object.                                                                                   //
  _recreate: function () {                                                                                            // 1150
    var self = this;                                                                                                  // 1151
    return new Subscription(self._session, self._handler, self._subscriptionId, self._params, self._name);            // 1152
  },                                                                                                                  //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Call inside the publish function.  Stops this client's subscription, triggering a call on the client to the `onStop` callback passed to [`Meteor.subscribe`](#meteor_subscribe), if any. If `error` is not a [`Meteor.Error`](#meteor_error), it will be [sanitized](#meteor_error).
   * @locus Server                                                                                                    //
   * @param {Error} error The error to pass to the client.                                                            //
   * @instance                                                                                                        //
   * @memberOf Subscription                                                                                           //
   */                                                                                                                 //
  error: function (error) {                                                                                           // 1164
    var self = this;                                                                                                  // 1165
    if (self._isDeactivated()) return;                                                                                // 1166
    self._session._stopSubscription(self._subscriptionId, error);                                                     // 1168
  },                                                                                                                  //
                                                                                                                      //
  // Note that while our DDP client will notice that you've called stop() on the                                      //
  // server (and clean up its _subscriptions table) we don't actually provide a                                       //
  // mechanism for an app to notice this (the subscribe onError callback only                                         //
  // triggers if there is an error).                                                                                  //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Call inside the publish function.  Stops this client's subscription and invokes the client's `onStop` callback with no error.
   * @locus Server                                                                                                    //
   * @instance                                                                                                        //
   * @memberOf Subscription                                                                                           //
   */                                                                                                                 //
  stop: function () {                                                                                                 // 1182
    var self = this;                                                                                                  // 1183
    if (self._isDeactivated()) return;                                                                                // 1184
    self._session._stopSubscription(self._subscriptionId);                                                            // 1186
  },                                                                                                                  //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Call inside the publish function.  Registers a callback function to run when the subscription is stopped.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   * @param {Function} func The callback function                                                                     //
   */                                                                                                                 //
  onStop: function (callback) {                                                                                       // 1196
    var self = this;                                                                                                  // 1197
    if (self._isDeactivated()) callback();else self._stopCallbacks.push(callback);                                    // 1198
  },                                                                                                                  //
                                                                                                                      //
  // This returns true if the sub has been deactivated, *OR* if the session was                                       //
  // destroyed but the deferred call to _deactivateAllSubscriptions hasn't                                            //
  // happened yet.                                                                                                    //
  _isDeactivated: function () {                                                                                       // 1207
    var self = this;                                                                                                  // 1208
    return self._deactivated || self._session.inQueue === null;                                                       // 1209
  },                                                                                                                  //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Call inside the publish function.  Informs the subscriber that a document has been added to the record set.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   * @param {String} collection The name of the collection that contains the new document.                            //
   * @param {String} id The new document's ID.                                                                        //
   * @param {Object} fields The fields in the new document.  If `_id` is present it is ignored.                       //
   */                                                                                                                 //
  added: function (collectionName, id, fields) {                                                                      // 1221
    var self = this;                                                                                                  // 1222
    if (self._isDeactivated()) return;                                                                                // 1223
    id = self._idFilter.idStringify(id);                                                                              // 1225
    Meteor._ensure(self._documents, collectionName)[id] = true;                                                       // 1226
    self._session.added(self._subscriptionHandle, collectionName, id, fields);                                        // 1227
  },                                                                                                                  //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Call inside the publish function.  Informs the subscriber that a document in the record set has been modified.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   * @param {String} collection The name of the collection that contains the changed document.                        //
   * @param {String} id The changed document's ID.                                                                    //
   * @param {Object} fields The fields in the document that have changed, together with their new values.  If a field is not present in `fields` it was left unchanged; if it is present in `fields` and has a value of `undefined` it was removed from the document.  If `_id` is present it is ignored.
   */                                                                                                                 //
  changed: function (collectionName, id, fields) {                                                                    // 1239
    var self = this;                                                                                                  // 1240
    if (self._isDeactivated()) return;                                                                                // 1241
    id = self._idFilter.idStringify(id);                                                                              // 1243
    self._session.changed(self._subscriptionHandle, collectionName, id, fields);                                      // 1244
  },                                                                                                                  //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Call inside the publish function.  Informs the subscriber that a document has been removed from the record set.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   * @param {String} collection The name of the collection that the document has been removed from.                   //
   * @param {String} id The ID of the document that has been removed.                                                 //
   */                                                                                                                 //
  removed: function (collectionName, id) {                                                                            // 1255
    var self = this;                                                                                                  // 1256
    if (self._isDeactivated()) return;                                                                                // 1257
    id = self._idFilter.idStringify(id);                                                                              // 1259
    // We don't bother to delete sets of things in a collection if the                                                //
    // collection is empty.  It could break _removeAllDocuments.                                                      //
    delete self._documents[collectionName][id];                                                                       // 1262
    self._session.removed(self._subscriptionHandle, collectionName, id);                                              // 1263
  },                                                                                                                  //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Call inside the publish function.  Informs the subscriber that an initial, complete snapshot of the record set has been sent.  This will trigger a call on the client to the `onReady` callback passed to  [`Meteor.subscribe`](#meteor_subscribe), if any.
   * @locus Server                                                                                                    //
   * @memberOf Subscription                                                                                           //
   * @instance                                                                                                        //
   */                                                                                                                 //
  ready: function () {                                                                                                // 1272
    var self = this;                                                                                                  // 1273
    if (self._isDeactivated()) return;                                                                                // 1274
    if (!self._subscriptionId) return; // unnecessary but ignored for universal sub                                   // 1276
    if (!self._ready) {                                                                                               // 1278
      self._session.sendReady([self._subscriptionId]);                                                                // 1279
      self._ready = true;                                                                                             // 1280
    }                                                                                                                 //
  }                                                                                                                   //
});                                                                                                                   //
                                                                                                                      //
/******************************************************************************/                                      //
/* Server                                                                     */                                      //
/******************************************************************************/                                      //
                                                                                                                      //
Server = function (options) {                                                                                         // 1289
  var self = this;                                                                                                    // 1290
                                                                                                                      //
  // The default heartbeat interval is 30 seconds on the server and 35                                                //
  // seconds on the client.  Since the client doesn't need to send a                                                  //
  // ping as long as it is receiving pings, this means that pings                                                     //
  // normally go from the server to the client.                                                                       //
  //                                                                                                                  //
  // Note: Troposphere depends on the ability to mutate                                                               //
  // Meteor.server.options.heartbeatTimeout! This is a hack, but it's life.                                           //
  self.options = _.defaults(options || {}, {                                                                          // 1299
    heartbeatInterval: 15000,                                                                                         // 1300
    heartbeatTimeout: 15000,                                                                                          // 1301
    // For testing, allow responding to pings to be disabled.                                                         //
    respondToPings: true                                                                                              // 1303
  });                                                                                                                 //
                                                                                                                      //
  // Map of callbacks to call when a new connection comes in to the                                                   //
  // server and completes DDP version negotiation. Use an object instead                                              //
  // of an array so we can safely remove one from the list while                                                      //
  // iterating over it.                                                                                               //
  self.onConnectionHook = new Hook({                                                                                  // 1310
    debugPrintExceptions: "onConnection callback"                                                                     // 1311
  });                                                                                                                 //
                                                                                                                      //
  self.publish_handlers = {};                                                                                         // 1314
  self.universal_publish_handlers = [];                                                                               // 1315
                                                                                                                      //
  self.method_handlers = {};                                                                                          // 1317
                                                                                                                      //
  self.sessions = {}; // map from id to session                                                                       // 1319
                                                                                                                      //
  self.stream_server = new StreamServer();                                                                            // 1321
                                                                                                                      //
  self.stream_server.register(function (socket) {                                                                     // 1323
    // socket implements the SockJSConnection interface                                                               //
    socket._meteorSession = null;                                                                                     // 1325
                                                                                                                      //
    var sendError = function (reason, offendingMessage) {                                                             // 1327
      var msg = { msg: 'error', reason: reason };                                                                     // 1328
      if (offendingMessage) msg.offendingMessage = offendingMessage;                                                  // 1329
      socket.send(DDPCommon.stringifyDDP(msg));                                                                       // 1331
    };                                                                                                                //
                                                                                                                      //
    socket.on('data', function (raw_msg) {                                                                            // 1334
      if (Meteor._printReceivedDDP) {                                                                                 // 1335
        Meteor._debug("Received DDP", raw_msg);                                                                       // 1336
      }                                                                                                               //
      try {                                                                                                           // 1338
        try {                                                                                                         // 1339
          var msg = DDPCommon.parseDDP(raw_msg);                                                                      // 1340
        } catch (err) {                                                                                               //
          sendError('Parse error');                                                                                   // 1342
          return;                                                                                                     // 1343
        }                                                                                                             //
        if (msg === null || !msg.msg) {                                                                               // 1345
          sendError('Bad request', msg);                                                                              // 1346
          return;                                                                                                     // 1347
        }                                                                                                             //
                                                                                                                      //
        if (msg.msg === 'connect') {                                                                                  // 1350
          if (socket._meteorSession) {                                                                                // 1351
            sendError("Already connected", msg);                                                                      // 1352
            return;                                                                                                   // 1353
          }                                                                                                           //
          Fiber(function () {                                                                                         // 1355
            self._handleConnect(socket, msg);                                                                         // 1356
          }).run();                                                                                                   //
          return;                                                                                                     // 1358
        }                                                                                                             //
                                                                                                                      //
        if (!socket._meteorSession) {                                                                                 // 1361
          sendError('Must connect first', msg);                                                                       // 1362
          return;                                                                                                     // 1363
        }                                                                                                             //
        socket._meteorSession.processMessage(msg);                                                                    // 1365
      } catch (e) {                                                                                                   //
        // XXX print stack nicely                                                                                     //
        Meteor._debug("Internal exception while processing message", msg, e.message, e.stack);                        // 1368
      }                                                                                                               //
    });                                                                                                               //
                                                                                                                      //
    socket.on('close', function () {                                                                                  // 1373
      if (socket._meteorSession) {                                                                                    // 1374
        Fiber(function () {                                                                                           // 1375
          socket._meteorSession.close();                                                                              // 1376
        }).run();                                                                                                     //
      }                                                                                                               //
    });                                                                                                               //
  });                                                                                                                 //
};                                                                                                                    //
                                                                                                                      //
_.extend(Server.prototype, {                                                                                          // 1383
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Register a callback to be called when a new DDP connection is made to the server.                       //
   * @locus Server                                                                                                    //
   * @param {function} callback The function to call when a new DDP connection is established.                        //
   * @memberOf Meteor                                                                                                 //
   */                                                                                                                 //
  onConnection: function (fn) {                                                                                       // 1391
    var self = this;                                                                                                  // 1392
    return self.onConnectionHook.register(fn);                                                                        // 1393
  },                                                                                                                  //
                                                                                                                      //
  _handleConnect: function (socket, msg) {                                                                            // 1396
    var self = this;                                                                                                  // 1397
                                                                                                                      //
    // The connect message must specify a version and an array of supported                                           //
    // versions, and it must claim to support what it is proposing.                                                   //
    if (!(typeof msg.version === 'string' && _.isArray(msg.support) && _.all(msg.support, _.isString) && _.contains(msg.support, msg.version))) {
      socket.send(DDPCommon.stringifyDDP({ msg: 'failed',                                                             // 1405
        version: DDPCommon.SUPPORTED_DDP_VERSIONS[0] }));                                                             // 1406
      socket.close();                                                                                                 // 1407
      return;                                                                                                         // 1408
    }                                                                                                                 //
                                                                                                                      //
    // In the future, handle session resumption: something like:                                                      //
    //  socket._meteorSession = self.sessions[msg.session]                                                            //
    var version = calculateVersion(msg.support, DDPCommon.SUPPORTED_DDP_VERSIONS);                                    // 1413
                                                                                                                      //
    if (msg.version !== version) {                                                                                    // 1415
      // The best version to use (according to the client's stated preferences)                                       //
      // is not the one the client is trying to use. Inform them about the best                                       //
      // version to use.                                                                                              //
      socket.send(DDPCommon.stringifyDDP({ msg: 'failed', version: version }));                                       // 1419
      socket.close();                                                                                                 // 1420
      return;                                                                                                         // 1421
    }                                                                                                                 //
                                                                                                                      //
    // Yay, version matches! Create a new session.                                                                    //
    // Note: Troposphere depends on the ability to mutate                                                             //
    // Meteor.server.options.heartbeatTimeout! This is a hack, but it's life.                                         //
    socket._meteorSession = new Session(self, version, socket, self.options);                                         // 1427
    self.sessions[socket._meteorSession.id] = socket._meteorSession;                                                  // 1428
    self.onConnectionHook.each(function (callback) {                                                                  // 1429
      if (socket._meteorSession) callback(socket._meteorSession.connectionHandle);                                    // 1430
      return true;                                                                                                    // 1432
    });                                                                                                               //
  },                                                                                                                  //
  /**                                                                                                                 //
   * Register a publish handler function.                                                                             //
   *                                                                                                                  //
   * @param name {String} identifier for query                                                                        //
   * @param handler {Function} publish handler                                                                        //
   * @param options {Object}                                                                                          //
   *                                                                                                                  //
   * Server will call handler function on each new subscription,                                                      //
   * either when receiving DDP sub message for a named subscription, or on                                            //
   * DDP connect for a universal subscription.                                                                        //
   *                                                                                                                  //
   * If name is null, this will be a subscription that is                                                             //
   * automatically established and permanently on for all connected                                                   //
   * client, instead of a subscription that can be turned on and off                                                  //
   * with subscribe().                                                                                                //
   *                                                                                                                  //
   * options to contain:                                                                                              //
   *  - (mostly internal) is_auto: true if generated automatically                                                    //
   *    from an autopublish hook. this is for cosmetic purposes only                                                  //
   *    (it lets us determine whether to print a warning suggesting                                                   //
   *    that you turn off autopublish.)                                                                               //
   */                                                                                                                 //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Publish a record set.                                                                                   //
   * @memberOf Meteor                                                                                                 //
   * @locus Server                                                                                                    //
   * @param {String} name Name of the record set.  If `null`, the set has no name, and the record set is automatically sent to all connected clients.
   * @param {Function} func Function called on the server each time a client subscribes.  Inside the function, `this` is the publish handler object, described below.  If the client passed arguments to `subscribe`, the function is called with the same arguments.
   */                                                                                                                 //
  publish: function (name, handler, options) {                                                                        // 1465
    var self = this;                                                                                                  // 1466
                                                                                                                      //
    options = options || {};                                                                                          // 1468
                                                                                                                      //
    if (name && name in self.publish_handlers) {                                                                      // 1470
      Meteor._debug("Ignoring duplicate publish named '" + name + "'");                                               // 1471
      return;                                                                                                         // 1472
    }                                                                                                                 //
                                                                                                                      //
    if (Package.autopublish && !options.is_auto) {                                                                    // 1475
      // They have autopublish on, yet they're trying to manually                                                     //
      // picking stuff to publish. They probably should turn off                                                      //
      // autopublish. (This check isn't perfect -- if you create a                                                    //
      // publish before you turn on autopublish, it won't catch                                                       //
      // it. But this will definitely handle the simple case where                                                    //
      // you've added the autopublish package to your app, and are                                                    //
      // calling publish from your app code.)                                                                         //
      if (!self.warned_about_autopublish) {                                                                           // 1483
        self.warned_about_autopublish = true;                                                                         // 1484
        Meteor._debug("** You've set up some data subscriptions with Meteor.publish(), but\n" + "** you still have autopublish turned on. Because autopublish is still\n" + "** on, your Meteor.publish() calls won't have much effect. All data\n" + "** will still be sent to all clients.\n" + "**\n" + "** Turn off autopublish by removing the autopublish package:\n" + "**\n" + "**   $ meteor remove autopublish\n" + "**\n" + "** .. and make sure you have Meteor.publish() and Meteor.subscribe() calls\n" + "** for each collection that you want clients to see.\n");
      }                                                                                                               //
    }                                                                                                                 //
                                                                                                                      //
    if (name) self.publish_handlers[name] = handler;else {                                                            // 1500
      self.universal_publish_handlers.push(handler);                                                                  // 1503
      // Spin up the new publisher on any existing session too. Run each                                              //
      // session's subscription in a new Fiber, so that there's no change for                                         //
      // self.sessions to change while we're running this loop.                                                       //
      _.each(self.sessions, function (session) {                                                                      // 1507
        if (!session._dontStartNewUniversalSubs) {                                                                    // 1508
          Fiber(function () {                                                                                         // 1509
            session._startSubscription(handler);                                                                      // 1510
          }).run();                                                                                                   //
        }                                                                                                             //
      });                                                                                                             //
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  _removeSession: function (session) {                                                                                // 1517
    var self = this;                                                                                                  // 1518
    if (self.sessions[session.id]) {                                                                                  // 1519
      delete self.sessions[session.id];                                                                               // 1520
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  /**                                                                                                                 //
   * @summary Defines functions that can be invoked over the network by clients.                                      //
   * @locus Anywhere                                                                                                  //
   * @param {Object} methods Dictionary whose keys are method names and values are functions.                         //
   * @memberOf Meteor                                                                                                 //
   */                                                                                                                 //
  methods: function (methods) {                                                                                       // 1530
    var self = this;                                                                                                  // 1531
    _.each(methods, function (func, name) {                                                                           // 1532
      if (typeof func !== 'function') throw new Error("Method '" + name + "' must be a function");                    // 1533
      if (self.method_handlers[name]) throw new Error("A method named '" + name + "' is already defined");            // 1535
      self.method_handlers[name] = func;                                                                              // 1537
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  call: function (name /*, arguments */) {                                                                            // 1541
    // if it's a function, the last argument is the result callback,                                                  //
    // not a parameter to the remote method.                                                                          //
    var args = Array.prototype.slice.call(arguments, 1);                                                              // 1544
    if (args.length && typeof args[args.length - 1] === "function") var callback = args.pop();                        // 1545
    return this.apply(name, args, callback);                                                                          // 1547
  },                                                                                                                  //
                                                                                                                      //
  // @param options {Optional Object}                                                                                 //
  // @param callback {Optional Function}                                                                              //
  apply: function (name, args, options, callback) {                                                                   // 1552
    var self = this;                                                                                                  // 1553
                                                                                                                      //
    // We were passed 3 arguments. They may be either (name, args, options)                                           //
    // or (name, args, callback)                                                                                      //
    if (!callback && typeof options === 'function') {                                                                 // 1557
      callback = options;                                                                                             // 1558
      options = {};                                                                                                   // 1559
    }                                                                                                                 //
    options = options || {};                                                                                          // 1561
                                                                                                                      //
    if (callback)                                                                                                     // 1563
      // It's not really necessary to do this, since we immediately                                                   //
      // run the callback in this fiber before returning, but we do it                                                //
      // anyway for regularity.                                                                                       //
      // XXX improve error message (and how we report it)                                                             //
      callback = Meteor.bindEnvironment(callback, "delivering result of invoking '" + name + "'");                    // 1568
                                                                                                                      //
    // Run the handler                                                                                                //
    var handler = self.method_handlers[name];                                                                         // 1574
    var exception;                                                                                                    // 1575
    if (!handler) {                                                                                                   // 1576
      exception = new Meteor.Error(404, "Method not found");                                                          // 1577
    } else {                                                                                                          //
      // If this is a method call from within another method, get the                                                 //
      // user state from the outer method, otherwise don't allow                                                      //
      // setUserId to be called                                                                                       //
      var userId = null;                                                                                              // 1582
      var setUserId = function () {                                                                                   // 1583
        throw new Error("Can't call setUserId on a server initiated method call");                                    // 1584
      };                                                                                                              //
      var connection = null;                                                                                          // 1586
      var currentInvocation = DDP._CurrentInvocation.get();                                                           // 1587
      if (currentInvocation) {                                                                                        // 1588
        userId = currentInvocation.userId;                                                                            // 1589
        setUserId = function (userId) {                                                                               // 1590
          currentInvocation.setUserId(userId);                                                                        // 1591
        };                                                                                                            //
        connection = currentInvocation.connection;                                                                    // 1593
      }                                                                                                               //
                                                                                                                      //
      var invocation = new DDPCommon.MethodInvocation({                                                               // 1596
        isSimulation: false,                                                                                          // 1597
        userId: userId,                                                                                               // 1598
        setUserId: setUserId,                                                                                         // 1599
        connection: connection,                                                                                       // 1600
        randomSeed: DDPCommon.makeRpcSeed(currentInvocation, name)                                                    // 1601
      });                                                                                                             //
      try {                                                                                                           // 1603
        var result = DDP._CurrentInvocation.withValue(invocation, function () {                                       // 1604
          return maybeAuditArgumentChecks(handler, invocation, EJSON.clone(args), "internal call to '" + name + "'");
        });                                                                                                           //
        result = EJSON.clone(result);                                                                                 // 1609
      } catch (e) {                                                                                                   //
        exception = e;                                                                                                // 1611
      }                                                                                                               //
    }                                                                                                                 //
                                                                                                                      //
    // Return the result in whichever way the caller asked for it. Note that we                                       //
    // do NOT block on the write fence in an analogous way to how the client                                          //
    // blocks on the relevant data being visible, so you are NOT guaranteed that                                      //
    // cursor observe callbacks have fired when your callback is invoked. (We                                         //
    // can change this if there's a real use case.)                                                                   //
    if (callback) {                                                                                                   // 1620
      callback(exception, result);                                                                                    // 1621
      return undefined;                                                                                               // 1622
    }                                                                                                                 //
    if (exception) throw exception;                                                                                   // 1624
    return result;                                                                                                    // 1626
  },                                                                                                                  //
                                                                                                                      //
  _urlForSession: function (sessionId) {                                                                              // 1629
    var self = this;                                                                                                  // 1630
    var session = self.sessions[sessionId];                                                                           // 1631
    if (session) return session._socketUrl;else return null;                                                          // 1632
  }                                                                                                                   //
});                                                                                                                   //
                                                                                                                      //
var calculateVersion = function (clientSupportedVersions, serverSupportedVersions) {                                  // 1639
  var correctVersion = _.find(clientSupportedVersions, function (version) {                                           // 1641
    return _.contains(serverSupportedVersions, version);                                                              // 1642
  });                                                                                                                 //
  if (!correctVersion) {                                                                                              // 1644
    correctVersion = serverSupportedVersions[0];                                                                      // 1645
  }                                                                                                                   //
  return correctVersion;                                                                                              // 1647
};                                                                                                                    //
                                                                                                                      //
DDPServer._calculateVersion = calculateVersion;                                                                       // 1650
                                                                                                                      //
// "blind" exceptions other than those that were deliberately thrown to signal                                        //
// errors to the client                                                                                               //
var wrapInternalException = function (exception, context) {                                                           // 1655
  if (!exception || exception instanceof Meteor.Error) return exception;                                              // 1656
                                                                                                                      //
  // tests can set the 'expected' flag on an exception so it won't go to the                                          //
  // server log                                                                                                       //
  if (!exception.expected) {                                                                                          // 1661
    Meteor._debug("Exception " + context, exception.stack);                                                           // 1662
    if (exception.sanitizedError) {                                                                                   // 1663
      Meteor._debug("Sanitized and reported to the client as:", exception.sanitizedError.message);                    // 1664
      Meteor._debug();                                                                                                // 1665
    }                                                                                                                 //
  }                                                                                                                   //
                                                                                                                      //
  // Did the error contain more details that could have been useful if caught in                                      //
  // server code (or if thrown from non-client-originated code), but also                                             //
  // provided a "sanitized" version with more context than 500 Internal server                                        //
  // error? Use that.                                                                                                 //
  if (exception.sanitizedError) {                                                                                     // 1673
    if (exception.sanitizedError instanceof Meteor.Error) return exception.sanitizedError;                            // 1674
    Meteor._debug("Exception " + context + " provides a sanitizedError that " + "is not a Meteor.Error; ignoring");   // 1676
  }                                                                                                                   //
                                                                                                                      //
  return new Meteor.Error(500, "Internal server error");                                                              // 1680
};                                                                                                                    //
                                                                                                                      //
// Audit argument checks, if the audit-argument-checks package exists (it is a                                        //
// weak dependency of this package).                                                                                  //
var maybeAuditArgumentChecks = function (f, context, args, description) {                                             // 1686
  args = args || [];                                                                                                  // 1687
  if (Package['audit-argument-checks']) {                                                                             // 1688
    return Match._failIfArgumentsAreNotAllChecked(f, context, args, description);                                     // 1689
  }                                                                                                                   //
  return f.apply(context, args);                                                                                      // 1692
};                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/writefence.js                                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var path = Npm.require('path');                                                                                       // 1
var Future = Npm.require(path.join('fibers', 'future'));                                                              // 2
                                                                                                                      //
// A write fence collects a group of writes, and provides a callback                                                  //
// when all of the writes are fully committed and propagated (all                                                     //
// observers have been notified of the write and acknowledged it.)                                                    //
//                                                                                                                    //
DDPServer._WriteFence = function () {                                                                                 // 8
  var self = this;                                                                                                    // 9
                                                                                                                      //
  self.armed = false;                                                                                                 // 11
  self.fired = false;                                                                                                 // 12
  self.retired = false;                                                                                               // 13
  self.outstanding_writes = 0;                                                                                        // 14
  self.before_fire_callbacks = [];                                                                                    // 15
  self.completion_callbacks = [];                                                                                     // 16
};                                                                                                                    //
                                                                                                                      //
// The current write fence. When there is a current write fence, code                                                 //
// that writes to databases should register their writes with it using                                                //
// beginWrite().                                                                                                      //
//                                                                                                                    //
DDPServer._CurrentWriteFence = new Meteor.EnvironmentVariable();                                                      // 23
                                                                                                                      //
_.extend(DDPServer._WriteFence.prototype, {                                                                           // 25
  // Start tracking a write, and return an object to represent it. The                                                //
  // object has a single method, committed(). This method should be                                                   //
  // called when the write is fully committed and propagated. You can                                                 //
  // continue to add writes to the WriteFence up until it is triggered                                                //
  // (calls its callbacks because all writes have committed.)                                                         //
  beginWrite: function () {                                                                                           // 31
    var self = this;                                                                                                  // 32
                                                                                                                      //
    if (self.retired) return { committed: function () {} };                                                           // 34
                                                                                                                      //
    if (self.fired) throw new Error("fence has already activated -- too late to add writes");                         // 37
                                                                                                                      //
    self.outstanding_writes++;                                                                                        // 40
    var committed = false;                                                                                            // 41
    return {                                                                                                          // 42
      committed: function () {                                                                                        // 43
        if (committed) throw new Error("committed called twice on the same write");                                   // 44
        committed = true;                                                                                             // 46
        self.outstanding_writes--;                                                                                    // 47
        self._maybeFire();                                                                                            // 48
      }                                                                                                               //
    };                                                                                                                //
  },                                                                                                                  //
                                                                                                                      //
  // Arm the fence. Once the fence is armed, and there are no more                                                    //
  // uncommitted writes, it will activate.                                                                            //
  arm: function () {                                                                                                  // 55
    var self = this;                                                                                                  // 56
    if (self === DDPServer._CurrentWriteFence.get()) throw Error("Can't arm the current fence");                      // 57
    self.armed = true;                                                                                                // 59
    self._maybeFire();                                                                                                // 60
  },                                                                                                                  //
                                                                                                                      //
  // Register a function to be called once before firing the fence.                                                   //
  // Callback function can add new writes to the fence, in which case                                                 //
  // it won't fire until those writes are done as well.                                                               //
  onBeforeFire: function (func) {                                                                                     // 66
    var self = this;                                                                                                  // 67
    if (self.fired) throw new Error("fence has already activated -- too late to " + "add a callback");                // 68
    self.before_fire_callbacks.push(func);                                                                            // 71
  },                                                                                                                  //
                                                                                                                      //
  // Register a function to be called when the fence fires.                                                           //
  onAllCommitted: function (func) {                                                                                   // 75
    var self = this;                                                                                                  // 76
    if (self.fired) throw new Error("fence has already activated -- too late to " + "add a callback");                // 77
    self.completion_callbacks.push(func);                                                                             // 80
  },                                                                                                                  //
                                                                                                                      //
  // Convenience function. Arms the fence, then blocks until it fires.                                                //
  armAndWait: function () {                                                                                           // 84
    var self = this;                                                                                                  // 85
    var future = new Future();                                                                                        // 86
    self.onAllCommitted(function () {                                                                                 // 87
      future['return']();                                                                                             // 88
    });                                                                                                               //
    self.arm();                                                                                                       // 90
    future.wait();                                                                                                    // 91
  },                                                                                                                  //
                                                                                                                      //
  _maybeFire: function () {                                                                                           // 94
    var self = this;                                                                                                  // 95
    if (self.fired) throw new Error("write fence already activated?");                                                // 96
    if (self.armed && !self.outstanding_writes) {                                                                     // 98
      function invokeCallback(func) {                                                                                 // 99
        try {                                                                                                         // 100
          func(self);                                                                                                 // 101
        } catch (err) {                                                                                               //
          Meteor._debug("exception in write fence callback:", err);                                                   // 103
        }                                                                                                             //
      }                                                                                                               //
                                                                                                                      //
      self.outstanding_writes++;                                                                                      // 107
      while (self.before_fire_callbacks.length > 0) {                                                                 // 108
        var callbacks = self.before_fire_callbacks;                                                                   // 109
        self.before_fire_callbacks = [];                                                                              // 110
        _.each(callbacks, invokeCallback);                                                                            // 111
      }                                                                                                               //
      self.outstanding_writes--;                                                                                      // 113
                                                                                                                      //
      if (!self.outstanding_writes) {                                                                                 // 115
        self.fired = true;                                                                                            // 116
        var callbacks = self.completion_callbacks;                                                                    // 117
        self.completion_callbacks = [];                                                                               // 118
        _.each(callbacks, invokeCallback);                                                                            // 119
      }                                                                                                               //
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  // Deactivate this fence so that adding more writes has no effect.                                                  //
  // The fence must have already fired.                                                                               //
  retire: function () {                                                                                               // 126
    var self = this;                                                                                                  // 127
    if (!self.fired) throw new Error("Can't retire a fence that hasn't fired.");                                      // 128
    self.retired = true;                                                                                              // 130
  }                                                                                                                   //
});                                                                                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/crossbar.js                                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// A "crossbar" is a class that provides structured notification registration.                                        //
// See _match for the definition of how a notification matches a trigger.                                             //
// All notifications and triggers must have a string key named 'collection'.                                          //
                                                                                                                      //
DDPServer._Crossbar = function (options) {                                                                            // 5
  var self = this;                                                                                                    // 6
  options = options || {};                                                                                            // 7
                                                                                                                      //
  self.nextId = 1;                                                                                                    // 9
  // map from collection name (string) -> listener id -> object. each object has                                      //
  // keys 'trigger', 'callback'.  As a hack, the empty string means "no                                               //
  // collection".                                                                                                     //
  self.listenersByCollection = {};                                                                                    // 13
  self.factPackage = options.factPackage || "livedata";                                                               // 14
  self.factName = options.factName || null;                                                                           // 15
};                                                                                                                    //
                                                                                                                      //
_.extend(DDPServer._Crossbar.prototype, {                                                                             // 18
  // msg is a trigger or a notification                                                                               //
  _collectionForMessage: function (msg) {                                                                             // 20
    var self = this;                                                                                                  // 21
    if (!_.has(msg, 'collection')) {                                                                                  // 22
      return '';                                                                                                      // 23
    } else if (typeof msg.collection === 'string') {                                                                  //
      if (msg.collection === '') throw Error("Message has empty collection!");                                        // 25
      return msg.collection;                                                                                          // 27
    } else {                                                                                                          //
      throw Error("Message has non-string collection!");                                                              // 29
    }                                                                                                                 //
  },                                                                                                                  //
                                                                                                                      //
  // Listen for notification that match 'trigger'. A notification                                                     //
  // matches if it has the key-value pairs in trigger as a                                                            //
  // subset. When a notification matches, call 'callback', passing                                                    //
  // the actual notification.                                                                                         //
  //                                                                                                                  //
  // Returns a listen handle, which is an object with a method                                                        //
  // stop(). Call stop() to stop listening.                                                                           //
  //                                                                                                                  //
  // XXX It should be legal to call fire() from inside a listen()                                                     //
  // callback?                                                                                                        //
  listen: function (trigger, callback) {                                                                              // 43
    var self = this;                                                                                                  // 44
    var id = self.nextId++;                                                                                           // 45
                                                                                                                      //
    var collection = self._collectionForMessage(trigger);                                                             // 47
    var record = { trigger: EJSON.clone(trigger), callback: callback };                                               // 48
    if (!_.has(self.listenersByCollection, collection)) {                                                             // 49
      self.listenersByCollection[collection] = {};                                                                    // 50
    }                                                                                                                 //
    self.listenersByCollection[collection][id] = record;                                                              // 52
                                                                                                                      //
    if (self.factName && Package.facts) {                                                                             // 54
      Package.facts.Facts.incrementServerFact(self.factPackage, self.factName, 1);                                    // 55
    }                                                                                                                 //
                                                                                                                      //
    return {                                                                                                          // 59
      stop: function () {                                                                                             // 60
        if (self.factName && Package.facts) {                                                                         // 61
          Package.facts.Facts.incrementServerFact(self.factPackage, self.factName, -1);                               // 62
        }                                                                                                             //
        delete self.listenersByCollection[collection][id];                                                            // 65
        if (_.isEmpty(self.listenersByCollection[collection])) {                                                      // 66
          delete self.listenersByCollection[collection];                                                              // 67
        }                                                                                                             //
      }                                                                                                               //
    };                                                                                                                //
  },                                                                                                                  //
                                                                                                                      //
  // Fire the provided 'notification' (an object whose attribute                                                      //
  // values are all JSON-compatibile) -- inform all matching listeners                                                //
  // (registered with listen()).                                                                                      //
  //                                                                                                                  //
  // If fire() is called inside a write fence, then each of the                                                       //
  // listener callbacks will be called inside the write fence as well.                                                //
  //                                                                                                                  //
  // The listeners may be invoked in parallel, rather than serially.                                                  //
  fire: function (notification) {                                                                                     // 81
    var self = this;                                                                                                  // 82
                                                                                                                      //
    var collection = self._collectionForMessage(notification);                                                        // 84
                                                                                                                      //
    if (!_.has(self.listenersByCollection, collection)) {                                                             // 86
      return;                                                                                                         // 87
    }                                                                                                                 //
                                                                                                                      //
    var listenersForCollection = self.listenersByCollection[collection];                                              // 90
    var callbackIds = [];                                                                                             // 91
    _.each(listenersForCollection, function (l, id) {                                                                 // 92
      if (self._matches(notification, l.trigger)) {                                                                   // 93
        callbackIds.push(id);                                                                                         // 94
      }                                                                                                               //
    });                                                                                                               //
                                                                                                                      //
    // Listener callbacks can yield, so we need to first find all the ones that                                       //
    // match in a single iteration over self.listenersByCollection (which can't                                       //
    // be mutated during this iteration), and then invoke the matching                                                //
    // callbacks, checking before each call to ensure they haven't stopped.                                           //
    // Note that we don't have to check that                                                                          //
    // self.listenersByCollection[collection] still === listenersForCollection,                                       //
    // because the only way that stops being true is if listenersForCollection                                        //
    // first gets reduced down to the empty object (and then never gets                                               //
    // increased again).                                                                                              //
    _.each(callbackIds, function (id) {                                                                               // 107
      if (_.has(listenersForCollection, id)) {                                                                        // 108
        listenersForCollection[id].callback(notification);                                                            // 109
      }                                                                                                               //
    });                                                                                                               //
  },                                                                                                                  //
                                                                                                                      //
  // A notification matches a trigger if all keys that exist in both are equal.                                       //
  //                                                                                                                  //
  // Examples:                                                                                                        //
  //  N:{collection: "C"} matches T:{collection: "C"}                                                                 //
  //    (a non-targeted write to a collection matches a                                                               //
  //     non-targeted query)                                                                                          //
  //  N:{collection: "C", id: "X"} matches T:{collection: "C"}                                                        //
  //    (a targeted write to a collection matches a non-targeted query)                                               //
  //  N:{collection: "C"} matches T:{collection: "C", id: "X"}                                                        //
  //    (a non-targeted write to a collection matches a                                                               //
  //     targeted query)                                                                                              //
  //  N:{collection: "C", id: "X"} matches T:{collection: "C", id: "X"}                                               //
  //    (a targeted write to a collection matches a targeted query targeted                                           //
  //     at the same document)                                                                                        //
  //  N:{collection: "C", id: "X"} does not match T:{collection: "C", id: "Y"}                                        //
  //    (a targeted write to a collection does not match a targeted query                                             //
  //     targeted at a different document)                                                                            //
  _matches: function (notification, trigger) {                                                                        // 131
    // Most notifications that use the crossbar have a string `collection` and                                        //
    // maybe an `id` that is a string or ObjectID. We're already dividing up                                          //
    // triggers by collection, but let's fast-track "nope, different ID" (and                                         //
    // avoid the overly generic EJSON.equals). This makes a noticeable                                                //
    // performance difference; see https://github.com/meteor/meteor/pull/3697                                         //
    if (typeof notification.id === 'string' && typeof trigger.id === 'string' && notification.id !== trigger.id) {    // 137
      return false;                                                                                                   // 140
    }                                                                                                                 //
    if (notification.id instanceof MongoID.ObjectID && trigger.id instanceof MongoID.ObjectID && !notification.id.equals(trigger.id)) {
      return false;                                                                                                   // 145
    }                                                                                                                 //
                                                                                                                      //
    return _.all(trigger, function (triggerValue, key) {                                                              // 148
      return !_.has(notification, key) || EJSON.equals(triggerValue, notification[key]);                              // 149
    });                                                                                                               //
  }                                                                                                                   //
});                                                                                                                   //
                                                                                                                      //
// The "invalidation crossbar" is a specific instance used by the DDP server to                                       //
// implement write fence notifications. Listener callbacks on this crossbar                                           //
// should call beginWrite on the current write fence before they return, if they                                      //
// want to delay the write fence from firing (ie, the DDP method-data-updated                                         //
// message from being sent).                                                                                          //
DDPServer._InvalidationCrossbar = new DDPServer._Crossbar({                                                           // 160
  factName: "invalidation-crossbar-listeners"                                                                         // 161
});                                                                                                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/ddp-server/server_convenience.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
if (process.env.DDP_DEFAULT_CONNECTION_URL) {                                                                         // 1
  __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = process.env.DDP_DEFAULT_CONNECTION_URL;                      // 2
}                                                                                                                     //
                                                                                                                      //
Meteor.server = new Server();                                                                                         // 6
                                                                                                                      //
Meteor.refresh = function (notification) {                                                                            // 8
  DDPServer._InvalidationCrossbar.fire(notification);                                                                 // 9
};                                                                                                                    //
                                                                                                                      //
// Proxy the public methods of Meteor.server so they can                                                              //
// be called directly on Meteor.                                                                                      //
_.each(['publish', 'methods', 'call', 'apply', 'onConnection'], function (name) {                                     // 14
  Meteor[name] = _.bind(Meteor.server[name], Meteor.server);                                                          // 16
});                                                                                                                   //
                                                                                                                      //
// Meteor.server used to be called Meteor.default_server. Provide                                                     //
// backcompat as a courtesy even though it was never documented.                                                      //
// XXX COMPAT WITH 0.6.4                                                                                              //
Meteor.default_server = Meteor.server;                                                                                // 22
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ddp-server'] = {
  DDPServer: DDPServer
};

})();

//# sourceMappingURL=ddp-server.js.map
