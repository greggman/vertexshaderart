(function () {

/* Imports */
var _ = Package.underscore._;

/* Package-scope variables */
var Meteor;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/meteor/packages/meteor.js                                                                            //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
(function(){                                                                                                     // 1
                                                                                                                 // 2
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                        //     // 4
// packages/meteor/server_environment.js                                                                  //     // 5
//                                                                                                        //     // 6
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                          //     // 8
Meteor = {                                                                                                // 1   // 9
  isClient: false,                                                                                        // 2   // 10
  isServer: true,                                                                                         // 3   // 11
  isCordova: false                                                                                        // 4   // 12
};                                                                                                        // 5   // 13
                                                                                                          // 6   // 14
Meteor.settings = {};                                                                                     // 7   // 15
                                                                                                          // 8   // 16
if (process.env.METEOR_SETTINGS) {                                                                        // 9   // 17
  try {                                                                                                   // 10  // 18
    Meteor.settings = JSON.parse(process.env.METEOR_SETTINGS);                                            // 11  // 19
  } catch (e) {                                                                                           // 12  // 20
    throw new Error("METEOR_SETTINGS are not valid JSON: " + process.env.METEOR_SETTINGS);                // 13  // 21
  }                                                                                                       // 14  // 22
}                                                                                                         // 15  // 23
                                                                                                          // 16  // 24
// Make sure that there is always a public attribute                                                      // 17  // 25
// to enable Meteor.settings.public on client                                                             // 18  // 26
if (! Meteor.settings.public) {                                                                           // 19  // 27
    Meteor.settings.public = {};                                                                          // 20  // 28
}                                                                                                         // 21  // 29
                                                                                                          // 22  // 30
// Push a subset of settings to the client.  Note that the way this                                       // 23  // 31
// code is written, if the app mutates `Meteor.settings.public` on the                                    // 24  // 32
// server, it also mutates                                                                                // 25  // 33
// `__meteor_runtime_config__.PUBLIC_SETTINGS`, and the modified                                          // 26  // 34
// settings will be sent to the client.                                                                   // 27  // 35
if (typeof __meteor_runtime_config__ === "object") {                                                      // 28  // 36
  __meteor_runtime_config__.PUBLIC_SETTINGS = Meteor.settings.public;                                     // 29  // 37
}                                                                                                         // 30  // 38
                                                                                                          // 31  // 39
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 40
                                                                                                                 // 41
}).call(this);                                                                                                   // 42
                                                                                                                 // 43
                                                                                                                 // 44
                                                                                                                 // 45
                                                                                                                 // 46
                                                                                                                 // 47
                                                                                                                 // 48
(function(){                                                                                                     // 49
                                                                                                                 // 50
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 51
//                                                                                                        //     // 52
// packages/meteor/helpers.js                                                                             //     // 53
//                                                                                                        //     // 54
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 55
                                                                                                          //     // 56
if (Meteor.isServer)                                                                                      // 1   // 57
  var Future = Npm.require('fibers/future');                                                              // 2   // 58
                                                                                                          // 3   // 59
if (typeof __meteor_runtime_config__ === 'object' &&                                                      // 4   // 60
    __meteor_runtime_config__.meteorRelease) {                                                            // 5   // 61
  /**                                                                                                     // 6   // 62
   * @summary `Meteor.release` is a string containing the name of the [release](#meteorupdate) with which the project was built (for example, `"1.2.3"`). It is `undefined` if the project was built using a git checkout of Meteor.
   * @locus Anywhere                                                                                      // 8   // 64
   * @type {String}                                                                                       // 9   // 65
   */                                                                                                     // 10  // 66
  Meteor.release = __meteor_runtime_config__.meteorRelease;                                               // 11  // 67
}                                                                                                         // 12  // 68
                                                                                                          // 13  // 69
// XXX find a better home for these? Ideally they would be _.get,                                         // 14  // 70
// _.ensure, _.delete..                                                                                   // 15  // 71
                                                                                                          // 16  // 72
_.extend(Meteor, {                                                                                        // 17  // 73
  // _get(a,b,c,d) returns a[b][c][d], or else undefined if a[b] or                                       // 18  // 74
  // a[b][c] doesn't exist.                                                                               // 19  // 75
  //                                                                                                      // 20  // 76
  _get: function (obj /*, arguments */) {                                                                 // 21  // 77
    for (var i = 1; i < arguments.length; i++) {                                                          // 22  // 78
      if (!(arguments[i] in obj))                                                                         // 23  // 79
        return undefined;                                                                                 // 24  // 80
      obj = obj[arguments[i]];                                                                            // 25  // 81
    }                                                                                                     // 26  // 82
    return obj;                                                                                           // 27  // 83
  },                                                                                                      // 28  // 84
                                                                                                          // 29  // 85
  // _ensure(a,b,c,d) ensures that a[b][c][d] exists. If it does not,                                     // 30  // 86
  // it is created and set to {}. Either way, it is returned.                                             // 31  // 87
  //                                                                                                      // 32  // 88
  _ensure: function (obj /*, arguments */) {                                                              // 33  // 89
    for (var i = 1; i < arguments.length; i++) {                                                          // 34  // 90
      var key = arguments[i];                                                                             // 35  // 91
      if (!(key in obj))                                                                                  // 36  // 92
        obj[key] = {};                                                                                    // 37  // 93
      obj = obj[key];                                                                                     // 38  // 94
    }                                                                                                     // 39  // 95
                                                                                                          // 40  // 96
    return obj;                                                                                           // 41  // 97
  },                                                                                                      // 42  // 98
                                                                                                          // 43  // 99
  // _delete(a, b, c, d) deletes a[b][c][d], then a[b][c] unless it                                       // 44  // 100
  // isn't empty, then a[b] unless it isn't empty.                                                        // 45  // 101
  //                                                                                                      // 46  // 102
  _delete: function (obj /*, arguments */) {                                                              // 47  // 103
    var stack = [obj];                                                                                    // 48  // 104
    var leaf = true;                                                                                      // 49  // 105
    for (var i = 1; i < arguments.length - 1; i++) {                                                      // 50  // 106
      var key = arguments[i];                                                                             // 51  // 107
      if (!(key in obj)) {                                                                                // 52  // 108
        leaf = false;                                                                                     // 53  // 109
        break;                                                                                            // 54  // 110
      }                                                                                                   // 55  // 111
      obj = obj[key];                                                                                     // 56  // 112
      if (typeof obj !== "object")                                                                        // 57  // 113
        break;                                                                                            // 58  // 114
      stack.push(obj);                                                                                    // 59  // 115
    }                                                                                                     // 60  // 116
                                                                                                          // 61  // 117
    for (var i = stack.length - 1; i >= 0; i--) {                                                         // 62  // 118
      var key = arguments[i+1];                                                                           // 63  // 119
                                                                                                          // 64  // 120
      if (leaf)                                                                                           // 65  // 121
        leaf = false;                                                                                     // 66  // 122
      else                                                                                                // 67  // 123
        for (var other in stack[i][key])                                                                  // 68  // 124
          return; // not empty -- we're done                                                              // 69  // 125
                                                                                                          // 70  // 126
      delete stack[i][key];                                                                               // 71  // 127
    }                                                                                                     // 72  // 128
  },                                                                                                      // 73  // 129
                                                                                                          // 74  // 130
  // wrapAsync can wrap any function that takes some number of arguments that                             // 75  // 131
  // can't be undefined, followed by some optional arguments, where the callback                          // 76  // 132
  // is the last optional argument.                                                                       // 77  // 133
  // e.g. fs.readFile(pathname, [callback]),                                                              // 78  // 134
  // fs.open(pathname, flags, [mode], [callback])                                                         // 79  // 135
  // For maximum effectiveness and least confusion, wrapAsync should be used on                           // 80  // 136
  // functions where the callback is the only argument of type Function.                                  // 81  // 137
                                                                                                          // 82  // 138
  /**                                                                                                     // 83  // 139
   * @memberOf Meteor                                                                                     // 84  // 140
   * @summary Wrap a function that takes a callback function as its final parameter. The signature of the callback of the wrapped function should be `function(error, result){}`. On the server, the wrapped function can be used either synchronously (without passing a callback) or asynchronously (when a callback is passed). On the client, a callback is always required; errors will be logged if there is no callback. If a callback is provided, the environment captured when the original function was called will be restored in the callback.
   * @locus Anywhere                                                                                      // 86  // 142
   * @param {Function} func A function that takes a callback as its final parameter                       // 87  // 143
   * @param {Object} [context] Optional `this` object against which the original function will be invoked        // 144
   */                                                                                                     // 89  // 145
  wrapAsync: function (fn, context) {                                                                     // 90  // 146
    return function (/* arguments */) {                                                                   // 91  // 147
      var self = context || this;                                                                         // 92  // 148
      var newArgs = _.toArray(arguments);                                                                 // 93  // 149
      var callback;                                                                                       // 94  // 150
                                                                                                          // 95  // 151
      for (var i = newArgs.length - 1; i >= 0; --i) {                                                     // 96  // 152
        var arg = newArgs[i];                                                                             // 97  // 153
        var type = typeof arg;                                                                            // 98  // 154
        if (type !== "undefined") {                                                                       // 99  // 155
          if (type === "function") {                                                                      // 100
            callback = arg;                                                                               // 101
          }                                                                                               // 102
          break;                                                                                          // 103
        }                                                                                                 // 104
      }                                                                                                   // 105
                                                                                                          // 106
      if (! callback) {                                                                                   // 107
        if (Meteor.isClient) {                                                                            // 108
          callback = logErr;                                                                              // 109
        } else {                                                                                          // 110
          var fut = new Future();                                                                         // 111
          callback = fut.resolver();                                                                      // 112
        }                                                                                                 // 113
        ++i; // Insert the callback just after arg.                                                       // 114
      }                                                                                                   // 115
                                                                                                          // 116
      newArgs[i] = Meteor.bindEnvironment(callback);                                                      // 117
      var result = fn.apply(self, newArgs);                                                               // 118
      return fut ? fut.wait() : result;                                                                   // 119
    };                                                                                                    // 120
  },                                                                                                      // 121
                                                                                                          // 122
  // Sets child's prototype to a new object whose prototype is parent's                                   // 123
  // prototype. Used as:                                                                                  // 124
  //   Meteor._inherits(ClassB, ClassA).                                                                  // 125
  //   _.extend(ClassB.prototype, { ... })                                                                // 126
  // Inspired by CoffeeScript's `extend` and Google Closure's `goog.inherits`.                            // 127
  _inherits: function (Child, Parent) {                                                                   // 128
    // copy Parent static properties                                                                      // 129
    for (var key in Parent) {                                                                             // 130
      // make sure we only copy hasOwnProperty properties vs. prototype                                   // 131
      // properties                                                                                       // 132
      if (_.has(Parent, key))                                                                             // 133
        Child[key] = Parent[key];                                                                         // 134
    }                                                                                                     // 135
                                                                                                          // 136
    // a middle member of prototype chain: takes the prototype from the Parent                            // 137
    var Middle = function () {                                                                            // 138
      this.constructor = Child;                                                                           // 139
    };                                                                                                    // 140
    Middle.prototype = Parent.prototype;                                                                  // 141
    Child.prototype = new Middle();                                                                       // 142
    Child.__super__ = Parent.prototype;                                                                   // 143
    return Child;                                                                                         // 144
  }                                                                                                       // 145
});                                                                                                       // 146
                                                                                                          // 147
var warnedAboutWrapAsync = false;                                                                         // 148
                                                                                                          // 149
/**                                                                                                       // 150
 * @deprecated in 0.9.3                                                                                   // 151
 */                                                                                                       // 152
Meteor._wrapAsync = function(fn, context) {                                                               // 153
  if (! warnedAboutWrapAsync) {                                                                           // 154
    Meteor._debug("Meteor._wrapAsync has been renamed to Meteor.wrapAsync");                              // 155
    warnedAboutWrapAsync = true;                                                                          // 156
  }                                                                                                       // 157
  return Meteor.wrapAsync.apply(Meteor, arguments);                                                       // 158
};                                                                                                        // 159
                                                                                                          // 160
function logErr(err) {                                                                                    // 161
  if (err) {                                                                                              // 162
    return Meteor._debug(                                                                                 // 163
      "Exception in callback of async function",                                                          // 164
      err.stack ? err.stack : err                                                                         // 165
    );                                                                                                    // 166
  }                                                                                                       // 167
}                                                                                                         // 168
                                                                                                          // 169
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 226
                                                                                                                 // 227
}).call(this);                                                                                                   // 228
                                                                                                                 // 229
                                                                                                                 // 230
                                                                                                                 // 231
                                                                                                                 // 232
                                                                                                                 // 233
                                                                                                                 // 234
(function(){                                                                                                     // 235
                                                                                                                 // 236
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 237
//                                                                                                        //     // 238
// packages/meteor/setimmediate.js                                                                        //     // 239
//                                                                                                        //     // 240
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 241
                                                                                                          //     // 242
// Chooses one of three setImmediate implementations:                                                     // 1   // 243
//                                                                                                        // 2   // 244
// * Native setImmediate (IE 10, Node 0.9+)                                                               // 3   // 245
//                                                                                                        // 4   // 246
// * postMessage (many browsers)                                                                          // 5   // 247
//                                                                                                        // 6   // 248
// * setTimeout  (fallback)                                                                               // 7   // 249
//                                                                                                        // 8   // 250
// The postMessage implementation is based on                                                             // 9   // 251
// https://github.com/NobleJS/setImmediate/tree/1.0.1                                                     // 10  // 252
//                                                                                                        // 11  // 253
// Don't use `nextTick` for Node since it runs its callbacks before                                       // 12  // 254
// I/O, which is stricter than we're looking for.                                                         // 13  // 255
//                                                                                                        // 14  // 256
// Not installed as a polyfill, as our public API is `Meteor.defer`.                                      // 15  // 257
// Since we're not trying to be a polyfill, we have some                                                  // 16  // 258
// simplifications:                                                                                       // 17  // 259
//                                                                                                        // 18  // 260
// If one invocation of a setImmediate callback pauses itself by a                                        // 19  // 261
// call to alert/prompt/showModelDialog, the NobleJS polyfill                                             // 20  // 262
// implementation ensured that no setImmedate callback would run until                                    // 21  // 263
// the first invocation completed.  While correct per the spec, what it                                   // 22  // 264
// would mean for us in practice is that any reactive updates relying                                     // 23  // 265
// on Meteor.defer would be hung in the main window until the modal                                       // 24  // 266
// dialog was dismissed.  Thus we only ensure that a setImmediate                                         // 25  // 267
// function is called in a later event loop.                                                              // 26  // 268
//                                                                                                        // 27  // 269
// We don't need to support using a string to be eval'ed for the                                          // 28  // 270
// callback, arguments to the function, or clearImmediate.                                                // 29  // 271
                                                                                                          // 30  // 272
"use strict";                                                                                             // 31  // 273
                                                                                                          // 32  // 274
var global = this;                                                                                        // 33  // 275
                                                                                                          // 34  // 276
                                                                                                          // 35  // 277
// IE 10, Node >= 9.1                                                                                     // 36  // 278
                                                                                                          // 37  // 279
function useSetImmediate() {                                                                              // 38  // 280
  if (! global.setImmediate)                                                                              // 39  // 281
    return null;                                                                                          // 40  // 282
  else {                                                                                                  // 41  // 283
    var setImmediate = function (fn) {                                                                    // 42  // 284
      global.setImmediate(fn);                                                                            // 43  // 285
    };                                                                                                    // 44  // 286
    setImmediate.implementation = 'setImmediate';                                                         // 45  // 287
    return setImmediate;                                                                                  // 46  // 288
  }                                                                                                       // 47  // 289
}                                                                                                         // 48  // 290
                                                                                                          // 49  // 291
                                                                                                          // 50  // 292
// Android 2.3.6, Chrome 26, Firefox 20, IE 8-9, iOS 5.1.1 Safari                                         // 51  // 293
                                                                                                          // 52  // 294
function usePostMessage() {                                                                               // 53  // 295
  // The test against `importScripts` prevents this implementation                                        // 54  // 296
  // from being installed inside a web worker, where                                                      // 55  // 297
  // `global.postMessage` means something completely different and                                        // 56  // 298
  // can't be used for this purpose.                                                                      // 57  // 299
                                                                                                          // 58  // 300
  if (!global.postMessage || global.importScripts) {                                                      // 59  // 301
    return null;                                                                                          // 60  // 302
  }                                                                                                       // 61  // 303
                                                                                                          // 62  // 304
  // Avoid synchronous post message implementations.                                                      // 63  // 305
                                                                                                          // 64  // 306
  var postMessageIsAsynchronous = true;                                                                   // 65  // 307
  var oldOnMessage = global.onmessage;                                                                    // 66  // 308
  global.onmessage = function () {                                                                        // 67  // 309
      postMessageIsAsynchronous = false;                                                                  // 68  // 310
  };                                                                                                      // 69  // 311
  global.postMessage("", "*");                                                                            // 70  // 312
  global.onmessage = oldOnMessage;                                                                        // 71  // 313
                                                                                                          // 72  // 314
  if (! postMessageIsAsynchronous)                                                                        // 73  // 315
    return null;                                                                                          // 74  // 316
                                                                                                          // 75  // 317
  var funcIndex = 0;                                                                                      // 76  // 318
  var funcs = {};                                                                                         // 77  // 319
                                                                                                          // 78  // 320
  // Installs an event handler on `global` for the `message` event: see                                   // 79  // 321
  // * https://developer.mozilla.org/en/DOM/window.postMessage                                            // 80  // 322
  // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages       // 81  // 323
                                                                                                          // 82  // 324
  // XXX use Random.id() here?                                                                            // 83  // 325
  var MESSAGE_PREFIX = "Meteor._setImmediate." + Math.random() + '.';                                     // 84  // 326
                                                                                                          // 85  // 327
  function isStringAndStartsWith(string, putativeStart) {                                                 // 86  // 328
    return (typeof string === "string" &&                                                                 // 87  // 329
            string.substring(0, putativeStart.length) === putativeStart);                                 // 88  // 330
  }                                                                                                       // 89  // 331
                                                                                                          // 90  // 332
  function onGlobalMessage(event) {                                                                       // 91  // 333
    // This will catch all incoming messages (even from other                                             // 92  // 334
    // windows!), so we need to try reasonably hard to avoid letting                                      // 93  // 335
    // anyone else trick us into firing off. We test the origin is                                        // 94  // 336
    // still this window, and that a (randomly generated)                                                 // 95  // 337
    // unpredictable identifying prefix is present.                                                       // 96  // 338
    if (event.source === global &&                                                                        // 97  // 339
        isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {                                              // 98  // 340
      var index = event.data.substring(MESSAGE_PREFIX.length);                                            // 99  // 341
      try {                                                                                               // 100
        if (funcs[index])                                                                                 // 101
          funcs[index]();                                                                                 // 102
      }                                                                                                   // 103
      finally {                                                                                           // 104
        delete funcs[index];                                                                              // 105
      }                                                                                                   // 106
    }                                                                                                     // 107
  }                                                                                                       // 108
                                                                                                          // 109
  if (global.addEventListener) {                                                                          // 110
    global.addEventListener("message", onGlobalMessage, false);                                           // 111
  } else {                                                                                                // 112
    global.attachEvent("onmessage", onGlobalMessage);                                                     // 113
  }                                                                                                       // 114
                                                                                                          // 115
  var setImmediate = function (fn) {                                                                      // 116
    // Make `global` post a message to itself with the handle and                                         // 117
    // identifying prefix, thus asynchronously invoking our                                               // 118
    // onGlobalMessage listener above.                                                                    // 119
    ++funcIndex;                                                                                          // 120
    funcs[funcIndex] = fn;                                                                                // 121
    global.postMessage(MESSAGE_PREFIX + funcIndex, "*");                                                  // 122
  };                                                                                                      // 123
  setImmediate.implementation = 'postMessage';                                                            // 124
  return setImmediate;                                                                                    // 125
}                                                                                                         // 126
                                                                                                          // 127
                                                                                                          // 128
function useTimeout() {                                                                                   // 129
  var setImmediate = function (fn) {                                                                      // 130
    global.setTimeout(fn, 0);                                                                             // 131
  };                                                                                                      // 132
  setImmediate.implementation = 'setTimeout';                                                             // 133
  return setImmediate;                                                                                    // 134
}                                                                                                         // 135
                                                                                                          // 136
                                                                                                          // 137
Meteor._setImmediate =                                                                                    // 138
  useSetImmediate() ||                                                                                    // 139
  usePostMessage() ||                                                                                     // 140
  useTimeout();                                                                                           // 141
                                                                                                          // 142
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 385
                                                                                                                 // 386
}).call(this);                                                                                                   // 387
                                                                                                                 // 388
                                                                                                                 // 389
                                                                                                                 // 390
                                                                                                                 // 391
                                                                                                                 // 392
                                                                                                                 // 393
(function(){                                                                                                     // 394
                                                                                                                 // 395
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 396
//                                                                                                        //     // 397
// packages/meteor/timers.js                                                                              //     // 398
//                                                                                                        //     // 399
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 400
                                                                                                          //     // 401
var withoutInvocation = function (f) {                                                                    // 1   // 402
  if (Package.ddp) {                                                                                      // 2   // 403
    var _CurrentInvocation = Package.ddp.DDP._CurrentInvocation;                                          // 3   // 404
    if (_CurrentInvocation.get() && _CurrentInvocation.get().isSimulation)                                // 4   // 405
      throw new Error("Can't set timers inside simulations");                                             // 5   // 406
    return function () { _CurrentInvocation.withValue(null, f); };                                        // 6   // 407
  }                                                                                                       // 7   // 408
  else                                                                                                    // 8   // 409
    return f;                                                                                             // 9   // 410
};                                                                                                        // 10  // 411
                                                                                                          // 11  // 412
var bindAndCatch = function (context, f) {                                                                // 12  // 413
  return Meteor.bindEnvironment(withoutInvocation(f), context);                                           // 13  // 414
};                                                                                                        // 14  // 415
                                                                                                          // 15  // 416
_.extend(Meteor, {                                                                                        // 16  // 417
  // Meteor.setTimeout and Meteor.setInterval callbacks scheduled                                         // 17  // 418
  // inside a server method are not part of the method invocation and                                     // 18  // 419
  // should clear out the CurrentInvocation environment variable.                                         // 19  // 420
                                                                                                          // 20  // 421
  /**                                                                                                     // 21  // 422
   * @memberOf Meteor                                                                                     // 22  // 423
   * @summary Call a function in the future after waiting for a specified delay.                          // 23  // 424
   * @locus Anywhere                                                                                      // 24  // 425
   * @param {Function} func The function to run                                                           // 25  // 426
   * @param {Number} delay Number of milliseconds to wait before calling function                         // 26  // 427
   */                                                                                                     // 27  // 428
  setTimeout: function (f, duration) {                                                                    // 28  // 429
    return setTimeout(bindAndCatch("setTimeout callback", f), duration);                                  // 29  // 430
  },                                                                                                      // 30  // 431
                                                                                                          // 31  // 432
  /**                                                                                                     // 32  // 433
   * @memberOf Meteor                                                                                     // 33  // 434
   * @summary Call a function repeatedly, with a time delay between calls.                                // 34  // 435
   * @locus Anywhere                                                                                      // 35  // 436
   * @param {Function} func The function to run                                                           // 36  // 437
   * @param {Number} delay Number of milliseconds to wait between each function call.                     // 37  // 438
   */                                                                                                     // 38  // 439
  setInterval: function (f, duration) {                                                                   // 39  // 440
    return setInterval(bindAndCatch("setInterval callback", f), duration);                                // 40  // 441
  },                                                                                                      // 41  // 442
                                                                                                          // 42  // 443
  /**                                                                                                     // 43  // 444
   * @memberOf Meteor                                                                                     // 44  // 445
   * @summary Cancel a repeating function call scheduled by `Meteor.setInterval`.                         // 45  // 446
   * @locus Anywhere                                                                                      // 46  // 447
   * @param {Number} id The handle returned by `Meteor.setInterval`                                       // 47  // 448
   */                                                                                                     // 48  // 449
  clearInterval: function(x) {                                                                            // 49  // 450
    return clearInterval(x);                                                                              // 50  // 451
  },                                                                                                      // 51  // 452
                                                                                                          // 52  // 453
  /**                                                                                                     // 53  // 454
   * @memberOf Meteor                                                                                     // 54  // 455
   * @summary Cancel a function call scheduled by `Meteor.setTimeout`.                                    // 55  // 456
   * @locus Anywhere                                                                                      // 56  // 457
   * @param {Number} id The handle returned by `Meteor.setTimeout`                                        // 57  // 458
   */                                                                                                     // 58  // 459
  clearTimeout: function(x) {                                                                             // 59  // 460
    return clearTimeout(x);                                                                               // 60  // 461
  },                                                                                                      // 61  // 462
                                                                                                          // 62  // 463
  // XXX consider making this guarantee ordering of defer'd callbacks, like                               // 63  // 464
  // Tracker.afterFlush or Node's nextTick (in practice). Then tests can do:                              // 64  // 465
  //    callSomethingThatDefersSomeWork();                                                                // 65  // 466
  //    Meteor.defer(expect(somethingThatValidatesThatTheWorkHappened));                                  // 66  // 467
  defer: function (f) {                                                                                   // 67  // 468
    Meteor._setImmediate(bindAndCatch("defer callback", f));                                              // 68  // 469
  }                                                                                                       // 69  // 470
});                                                                                                       // 70  // 471
                                                                                                          // 71  // 472
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 473
                                                                                                                 // 474
}).call(this);                                                                                                   // 475
                                                                                                                 // 476
                                                                                                                 // 477
                                                                                                                 // 478
                                                                                                                 // 479
                                                                                                                 // 480
                                                                                                                 // 481
(function(){                                                                                                     // 482
                                                                                                                 // 483
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 484
//                                                                                                        //     // 485
// packages/meteor/errors.js                                                                              //     // 486
//                                                                                                        //     // 487
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 488
                                                                                                          //     // 489
// Makes an error subclass which properly contains a stack trace in most                                  // 1   // 490
// environments. constructor can set fields on `this` (and should probably set                            // 2   // 491
// `message`, which is what gets displayed at the top of a stack trace).                                  // 3   // 492
//                                                                                                        // 4   // 493
Meteor.makeErrorType = function (name, constructor) {                                                     // 5   // 494
  var errorClass = function (/*arguments*/) {                                                             // 6   // 495
    var self = this;                                                                                      // 7   // 496
                                                                                                          // 8   // 497
    // Ensure we get a proper stack trace in most Javascript environments                                 // 9   // 498
    if (Error.captureStackTrace) {                                                                        // 10  // 499
      // V8 environments (Chrome and Node.js)                                                             // 11  // 500
      Error.captureStackTrace(self, errorClass);                                                          // 12  // 501
    } else {                                                                                              // 13  // 502
      // Firefox                                                                                          // 14  // 503
      var e = new Error;                                                                                  // 15  // 504
      e.__proto__ = errorClass.prototype;                                                                 // 16  // 505
      if (e instanceof errorClass)                                                                        // 17  // 506
        self = e;                                                                                         // 18  // 507
    }                                                                                                     // 19  // 508
    // Safari magically works.                                                                            // 20  // 509
                                                                                                          // 21  // 510
    constructor.apply(self, arguments);                                                                   // 22  // 511
                                                                                                          // 23  // 512
    self.errorType = name;                                                                                // 24  // 513
                                                                                                          // 25  // 514
    return self;                                                                                          // 26  // 515
  };                                                                                                      // 27  // 516
                                                                                                          // 28  // 517
  Meteor._inherits(errorClass, Error);                                                                    // 29  // 518
                                                                                                          // 30  // 519
  return errorClass;                                                                                      // 31  // 520
};                                                                                                        // 32  // 521
                                                                                                          // 33  // 522
// This should probably be in the livedata package, but we don't want                                     // 34  // 523
// to require you to use the livedata package to get it. Eventually we                                    // 35  // 524
// should probably rename it to DDP.Error and put it back in the                                          // 36  // 525
// 'livedata' package (which we should rename to 'ddp' also.)                                             // 37  // 526
//                                                                                                        // 38  // 527
// Note: The DDP server assumes that Meteor.Error EJSON-serializes as an object                           // 39  // 528
// containing 'error' and optionally 'reason' and 'details'.                                              // 40  // 529
// The DDP client manually puts these into Meteor.Error objects. (We don't use                            // 41  // 530
// EJSON.addType here because the type is determined by location in the                                   // 42  // 531
// protocol, not text on the wire.)                                                                       // 43  // 532
                                                                                                          // 44  // 533
/**                                                                                                       // 45  // 534
 * @summary This class represents a symbolic error thrown by a method.                                    // 46  // 535
 * @locus Anywhere                                                                                        // 47  // 536
 * @class                                                                                                 // 48  // 537
 * @param {String} error A string code uniquely identifying this kind of error.                           // 49  // 538
 * This string should be used by callers of the method to determine the                                   // 50  // 539
 * appropriate action to take, instead of attempting to parse the reason                                  // 51  // 540
 * or details fields. For example:                                                                        // 52  // 541
 *                                                                                                        // 53  // 542
 * ```                                                                                                    // 54  // 543
 * // on the server, pick a code unique to this error                                                     // 55  // 544
 * // the reason field should be a useful debug message                                                   // 56  // 545
 * throw new Meteor.Error("logged-out",                                                                   // 57  // 546
 *   "The user must be logged in to post a comment.");                                                    // 58  // 547
 *                                                                                                        // 59  // 548
 * // on the client                                                                                       // 60  // 549
 * Meteor.call("methodName", function (error) {                                                           // 61  // 550
 *   // identify the error                                                                                // 62  // 551
 *   if (error && error.error === "logged-out") {                                                         // 63  // 552
 *     // show a nice error message                                                                       // 64  // 553
 *     Session.set("errorMessage", "Please log in to post a comment.");                                   // 65  // 554
 *   }                                                                                                    // 66  // 555
 * });                                                                                                    // 67  // 556
 * ```                                                                                                    // 68  // 557
 *                                                                                                        // 69  // 558
 * For legacy reasons, some built-in Meteor functions such as `check` throw                               // 70  // 559
 * errors with a number in this field.                                                                    // 71  // 560
 *                                                                                                        // 72  // 561
 * @param {String} [reason] Optional.  A short human-readable summary of the                              // 73  // 562
 * error, like 'Not Found'.                                                                               // 74  // 563
 * @param {String} [details] Optional.  Additional information about the error,                           // 75  // 564
 * like a textual stack trace.                                                                            // 76  // 565
 */                                                                                                       // 77  // 566
Meteor.Error = Meteor.makeErrorType(                                                                      // 78  // 567
  "Meteor.Error",                                                                                         // 79  // 568
  function (error, reason, details) {                                                                     // 80  // 569
    var self = this;                                                                                      // 81  // 570
                                                                                                          // 82  // 571
    // String code uniquely identifying this kind of error.                                               // 83  // 572
    self.error = error;                                                                                   // 84  // 573
                                                                                                          // 85  // 574
    // Optional: A short human-readable summary of the error. Not                                         // 86  // 575
    // intended to be shown to end users, just developers. ("Not Found",                                  // 87  // 576
    // "Internal Server Error")                                                                           // 88  // 577
    self.reason = reason;                                                                                 // 89  // 578
                                                                                                          // 90  // 579
    // Optional: Additional information about the error, say for                                          // 91  // 580
    // debugging. It might be a (textual) stack trace if the server is                                    // 92  // 581
    // willing to provide one. The corresponding thing in HTTP would be                                   // 93  // 582
    // the body of a 404 or 500 response. (The difference is that we                                      // 94  // 583
    // never expect this to be shown to end users, only developers, so                                    // 95  // 584
    // it doesn't need to be pretty.)                                                                     // 96  // 585
    self.details = details;                                                                               // 97  // 586
                                                                                                          // 98  // 587
    // This is what gets displayed at the top of a stack trace. Current                                   // 99  // 588
    // format is "[404]" (if no reason is set) or "File not found [404]"                                  // 100
    if (self.reason)                                                                                      // 101
      self.message = self.reason + ' [' + self.error + ']';                                               // 102
    else                                                                                                  // 103
      self.message = '[' + self.error + ']';                                                              // 104
  });                                                                                                     // 105
                                                                                                          // 106
// Meteor.Error is basically data and is sent over DDP, so you should be able to                          // 107
// properly EJSON-clone it. This is especially important because if a                                     // 108
// Meteor.Error is thrown through a Future, the error, reason, and details                                // 109
// properties become non-enumerable so a standard Object clone won't preserve                             // 110
// them and they will be lost from DDP.                                                                   // 111
Meteor.Error.prototype.clone = function () {                                                              // 112
  var self = this;                                                                                        // 113
  return new Meteor.Error(self.error, self.reason, self.details);                                         // 114
};                                                                                                        // 115
                                                                                                          // 116
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 606
                                                                                                                 // 607
}).call(this);                                                                                                   // 608
                                                                                                                 // 609
                                                                                                                 // 610
                                                                                                                 // 611
                                                                                                                 // 612
                                                                                                                 // 613
                                                                                                                 // 614
(function(){                                                                                                     // 615
                                                                                                                 // 616
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 617
//                                                                                                        //     // 618
// packages/meteor/fiber_helpers.js                                                                       //     // 619
//                                                                                                        //     // 620
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 621
                                                                                                          //     // 622
var path = Npm.require('path');                                                                           // 1   // 623
var Fiber = Npm.require('fibers');                                                                        // 2   // 624
var Future = Npm.require(path.join('fibers', 'future'));                                                  // 3   // 625
                                                                                                          // 4   // 626
Meteor._noYieldsAllowed = function (f) {                                                                  // 5   // 627
  var savedYield = Fiber.yield;                                                                           // 6   // 628
  Fiber.yield = function () {                                                                             // 7   // 629
    throw new Error("Can't call yield in a noYieldsAllowed block!");                                      // 8   // 630
  };                                                                                                      // 9   // 631
  try {                                                                                                   // 10  // 632
    return f();                                                                                           // 11  // 633
  } finally {                                                                                             // 12  // 634
    Fiber.yield = savedYield;                                                                             // 13  // 635
  }                                                                                                       // 14  // 636
};                                                                                                        // 15  // 637
                                                                                                          // 16  // 638
Meteor._DoubleEndedQueue = Npm.require('meteor-deque');                                                   // 17  // 639
                                                                                                          // 18  // 640
// Meteor._SynchronousQueue is a queue which runs task functions serially.                                // 19  // 641
// Tasks are assumed to be synchronous: ie, it's assumed that they are                                    // 20  // 642
// done when they return.                                                                                 // 21  // 643
//                                                                                                        // 22  // 644
// It has two methods:                                                                                    // 23  // 645
//   - queueTask queues a task to be run, and returns immediately.                                        // 24  // 646
//   - runTask queues a task to be run, and then yields. It returns                                       // 25  // 647
//     when the task finishes running.                                                                    // 26  // 648
//                                                                                                        // 27  // 649
// It's safe to call queueTask from within a task, but not runTask (unless                                // 28  // 650
// you're calling runTask from a nested Fiber).                                                           // 29  // 651
//                                                                                                        // 30  // 652
// Somewhat inspired by async.queue, but specific to blocking tasks.                                      // 31  // 653
// XXX break this out into an NPM module?                                                                 // 32  // 654
// XXX could maybe use the npm 'schlock' module instead, which would                                      // 33  // 655
//     also support multiple concurrent "read" tasks                                                      // 34  // 656
//                                                                                                        // 35  // 657
Meteor._SynchronousQueue = function () {                                                                  // 36  // 658
  var self = this;                                                                                        // 37  // 659
  // List of tasks to run (not including a currently-running task if any). Each                           // 38  // 660
  // is an object with field 'task' (the task function to run) and 'future' (the                          // 39  // 661
  // Future associated with the blocking runTask call that queued it, or null if                          // 40  // 662
  // called from queueTask).                                                                              // 41  // 663
  self._taskHandles = new Meteor._DoubleEndedQueue();                                                     // 42  // 664
  // This is true if self._run() is either currently executing or scheduled to                            // 43  // 665
  // do so soon.                                                                                          // 44  // 666
  self._runningOrRunScheduled = false;                                                                    // 45  // 667
  // During the execution of a task, this is set to the fiber used to execute                             // 46  // 668
  // that task. We use this to throw an error rather than deadlocking if the                              // 47  // 669
  // user calls runTask from within a task on the same fiber.                                             // 48  // 670
  self._currentTaskFiber = undefined;                                                                     // 49  // 671
  // This is true if we're currently draining.  While we're draining, a further                           // 50  // 672
  // drain is a noop, to prevent infinite loops.  "drain" is a heuristic type                             // 51  // 673
  // operation, that has a meaning like unto "what a naive person would expect                            // 52  // 674
  // when modifying a table from an observe"                                                              // 53  // 675
  self._draining = false;                                                                                 // 54  // 676
};                                                                                                        // 55  // 677
                                                                                                          // 56  // 678
_.extend(Meteor._SynchronousQueue.prototype, {                                                            // 57  // 679
  runTask: function (task) {                                                                              // 58  // 680
    var self = this;                                                                                      // 59  // 681
                                                                                                          // 60  // 682
    if (!self.safeToRunTask()) {                                                                          // 61  // 683
      if (Fiber.current)                                                                                  // 62  // 684
        throw new Error("Can't runTask from another task in the same fiber");                             // 63  // 685
      else                                                                                                // 64  // 686
        throw new Error("Can only call runTask in a Fiber");                                              // 65  // 687
    }                                                                                                     // 66  // 688
                                                                                                          // 67  // 689
    var fut = new Future;                                                                                 // 68  // 690
    var handle = {                                                                                        // 69  // 691
      task: Meteor.bindEnvironment(task, function (e) {                                                   // 70  // 692
        Meteor._debug("Exception from task:", e && e.stack || e);                                         // 71  // 693
        throw e;                                                                                          // 72  // 694
      }),                                                                                                 // 73  // 695
      future: fut,                                                                                        // 74  // 696
      name: task.name                                                                                     // 75  // 697
    };                                                                                                    // 76  // 698
    self._taskHandles.push(handle);                                                                       // 77  // 699
    self._scheduleRun();                                                                                  // 78  // 700
    // Yield. We'll get back here after the task is run (and will throw if the                            // 79  // 701
    // task throws).                                                                                      // 80  // 702
    fut.wait();                                                                                           // 81  // 703
  },                                                                                                      // 82  // 704
  queueTask: function (task) {                                                                            // 83  // 705
    var self = this;                                                                                      // 84  // 706
    self._taskHandles.push({                                                                              // 85  // 707
      task: task,                                                                                         // 86  // 708
      name: task.name                                                                                     // 87  // 709
    });                                                                                                   // 88  // 710
    self._scheduleRun();                                                                                  // 89  // 711
    // No need to block.                                                                                  // 90  // 712
  },                                                                                                      // 91  // 713
                                                                                                          // 92  // 714
  flush: function () {                                                                                    // 93  // 715
    var self = this;                                                                                      // 94  // 716
    self.runTask(function () {});                                                                         // 95  // 717
  },                                                                                                      // 96  // 718
                                                                                                          // 97  // 719
  safeToRunTask: function () {                                                                            // 98  // 720
    var self = this;                                                                                      // 99  // 721
    return Fiber.current && self._currentTaskFiber !== Fiber.current;                                     // 100
  },                                                                                                      // 101
                                                                                                          // 102
  drain: function () {                                                                                    // 103
    var self = this;                                                                                      // 104
    if (self._draining)                                                                                   // 105
      return;                                                                                             // 106
    if (!self.safeToRunTask())                                                                            // 107
      return;                                                                                             // 108
    self._draining = true;                                                                                // 109
    while (! self._taskHandles.isEmpty()) {                                                               // 110
      self.flush();                                                                                       // 111
    }                                                                                                     // 112
    self._draining = false;                                                                               // 113
  },                                                                                                      // 114
                                                                                                          // 115
  _scheduleRun: function () {                                                                             // 116
    var self = this;                                                                                      // 117
    // Already running or scheduled? Do nothing.                                                          // 118
    if (self._runningOrRunScheduled)                                                                      // 119
      return;                                                                                             // 120
                                                                                                          // 121
    self._runningOrRunScheduled = true;                                                                   // 122
    setImmediate(function () {                                                                            // 123
      Fiber(function () {                                                                                 // 124
        self._run();                                                                                      // 125
      }).run();                                                                                           // 126
    });                                                                                                   // 127
  },                                                                                                      // 128
  _run: function () {                                                                                     // 129
    var self = this;                                                                                      // 130
                                                                                                          // 131
    if (!self._runningOrRunScheduled)                                                                     // 132
      throw new Error("expected to be _runningOrRunScheduled");                                           // 133
                                                                                                          // 134
    if (self._taskHandles.isEmpty()) {                                                                    // 135
      // Done running tasks! Don't immediately schedule another run, but                                  // 136
      // allow future tasks to do so.                                                                     // 137
      self._runningOrRunScheduled = false;                                                                // 138
      return;                                                                                             // 139
    }                                                                                                     // 140
    var taskHandle = self._taskHandles.shift();                                                           // 141
                                                                                                          // 142
    // Run the task.                                                                                      // 143
    self._currentTaskFiber = Fiber.current;                                                               // 144
    var exception = undefined;                                                                            // 145
    try {                                                                                                 // 146
      taskHandle.task();                                                                                  // 147
    } catch (err) {                                                                                       // 148
      if (taskHandle.future) {                                                                            // 149
        // We'll throw this exception through runTask.                                                    // 150
        exception = err;                                                                                  // 151
      } else {                                                                                            // 152
        Meteor._debug("Exception in queued task: " + (err.stack || err));                                 // 153
      }                                                                                                   // 154
    }                                                                                                     // 155
    self._currentTaskFiber = undefined;                                                                   // 156
                                                                                                          // 157
    // Soon, run the next task, if there is any.                                                          // 158
    self._runningOrRunScheduled = false;                                                                  // 159
    self._scheduleRun();                                                                                  // 160
                                                                                                          // 161
    // If this was queued with runTask, let the runTask call return (throwing if                          // 162
    // the task threw).                                                                                   // 163
    if (taskHandle.future) {                                                                              // 164
      if (exception)                                                                                      // 165
        taskHandle.future['throw'](exception);                                                            // 166
      else                                                                                                // 167
        taskHandle.future['return']();                                                                    // 168
    }                                                                                                     // 169
  }                                                                                                       // 170
});                                                                                                       // 171
                                                                                                          // 172
// Sleep. Mostly used for debugging (eg, inserting latency into server                                    // 173
// methods).                                                                                              // 174
//                                                                                                        // 175
Meteor._sleepForMs = function (ms) {                                                                      // 176
  var fiber = Fiber.current;                                                                              // 177
  setTimeout(function() {                                                                                 // 178
    fiber.run();                                                                                          // 179
  }, ms);                                                                                                 // 180
  Fiber.yield();                                                                                          // 181
};                                                                                                        // 182
                                                                                                          // 183
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 806
                                                                                                                 // 807
}).call(this);                                                                                                   // 808
                                                                                                                 // 809
                                                                                                                 // 810
                                                                                                                 // 811
                                                                                                                 // 812
                                                                                                                 // 813
                                                                                                                 // 814
(function(){                                                                                                     // 815
                                                                                                                 // 816
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 817
//                                                                                                        //     // 818
// packages/meteor/startup_server.js                                                                      //     // 819
//                                                                                                        //     // 820
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 821
                                                                                                          //     // 822
Meteor.startup = function (callback) {                                                                    // 1   // 823
  if (__meteor_bootstrap__.startupHooks) {                                                                // 2   // 824
    __meteor_bootstrap__.startupHooks.push(callback);                                                     // 3   // 825
  } else {                                                                                                // 4   // 826
    // We already started up. Just call it now.                                                           // 5   // 827
    callback();                                                                                           // 6   // 828
  }                                                                                                       // 7   // 829
};                                                                                                        // 8   // 830
                                                                                                          // 9   // 831
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 832
                                                                                                                 // 833
}).call(this);                                                                                                   // 834
                                                                                                                 // 835
                                                                                                                 // 836
                                                                                                                 // 837
                                                                                                                 // 838
                                                                                                                 // 839
                                                                                                                 // 840
(function(){                                                                                                     // 841
                                                                                                                 // 842
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 843
//                                                                                                        //     // 844
// packages/meteor/debug.js                                                                               //     // 845
//                                                                                                        //     // 846
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 847
                                                                                                          //     // 848
var suppress = 0;                                                                                         // 1   // 849
                                                                                                          // 2   // 850
// replacement for console.log. This is a temporary API. We should                                        // 3   // 851
// provide a real logging API soon (possibly just a polyfill for                                          // 4   // 852
// console?)                                                                                              // 5   // 853
//                                                                                                        // 6   // 854
// NOTE: this is used on the server to print the warning about                                            // 7   // 855
// having autopublish enabled when you probably meant to turn it                                          // 8   // 856
// off. it's not really the proper use of something called                                                // 9   // 857
// _debug. the intent is for this message to go to the terminal and                                       // 10  // 858
// be very visible. if you change _debug to go someplace else, etc,                                       // 11  // 859
// please fix the autopublish code to do something reasonable.                                            // 12  // 860
//                                                                                                        // 13  // 861
Meteor._debug = function (/* arguments */) {                                                              // 14  // 862
  if (suppress) {                                                                                         // 15  // 863
    suppress--;                                                                                           // 16  // 864
    return;                                                                                               // 17  // 865
  }                                                                                                       // 18  // 866
  if (typeof console !== 'undefined' &&                                                                   // 19  // 867
      typeof console.log !== 'undefined') {                                                               // 20  // 868
    if (arguments.length == 0) { // IE Companion breaks otherwise                                         // 21  // 869
      // IE10 PP4 requires at least one argument                                                          // 22  // 870
      console.log('');                                                                                    // 23  // 871
    } else {                                                                                              // 24  // 872
      // IE doesn't have console.log.apply, it's not a real Object.                                       // 25  // 873
      // http://stackoverflow.com/questions/5538972/console-log-apply-not-working-in-ie9                  // 26  // 874
      // http://patik.com/blog/complete-cross-browser-console-log/                                        // 27  // 875
      if (typeof console.log.apply === "function") {                                                      // 28  // 876
        // Most browsers                                                                                  // 29  // 877
                                                                                                          // 30  // 878
        // Chrome and Safari only hyperlink URLs to source files in first argument of                     // 31  // 879
        // console.log, so try to call it with one argument if possible.                                  // 32  // 880
        // Approach taken here: If all arguments are strings, join them on space.                         // 33  // 881
        // See https://github.com/meteor/meteor/pull/732#issuecomment-13975991                            // 34  // 882
        var allArgumentsOfTypeString = true;                                                              // 35  // 883
        for (var i = 0; i < arguments.length; i++)                                                        // 36  // 884
          if (typeof arguments[i] !== "string")                                                           // 37  // 885
            allArgumentsOfTypeString = false;                                                             // 38  // 886
                                                                                                          // 39  // 887
        if (allArgumentsOfTypeString)                                                                     // 40  // 888
          console.log.apply(console, [Array.prototype.join.call(arguments, " ")]);                        // 41  // 889
        else                                                                                              // 42  // 890
          console.log.apply(console, arguments);                                                          // 43  // 891
                                                                                                          // 44  // 892
      } else if (typeof Function.prototype.bind === "function") {                                         // 45  // 893
        // IE9                                                                                            // 46  // 894
        var log = Function.prototype.bind.call(console.log, console);                                     // 47  // 895
        log.apply(console, arguments);                                                                    // 48  // 896
      } else {                                                                                            // 49  // 897
        // IE8                                                                                            // 50  // 898
        Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));        // 51  // 899
      }                                                                                                   // 52  // 900
    }                                                                                                     // 53  // 901
  }                                                                                                       // 54  // 902
};                                                                                                        // 55  // 903
                                                                                                          // 56  // 904
// Suppress the next 'count' Meteor._debug messsages. Use this to                                         // 57  // 905
// stop tests from spamming the console.                                                                  // 58  // 906
//                                                                                                        // 59  // 907
Meteor._suppress_log = function (count) {                                                                 // 60  // 908
  suppress += count;                                                                                      // 61  // 909
};                                                                                                        // 62  // 910
                                                                                                          // 63  // 911
Meteor._suppressed_log_expected = function () {                                                           // 64  // 912
  return suppress !== 0;                                                                                  // 65  // 913
};                                                                                                        // 66  // 914
                                                                                                          // 67  // 915
                                                                                                          // 68  // 916
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 917
                                                                                                                 // 918
}).call(this);                                                                                                   // 919
                                                                                                                 // 920
                                                                                                                 // 921
                                                                                                                 // 922
                                                                                                                 // 923
                                                                                                                 // 924
                                                                                                                 // 925
(function(){                                                                                                     // 926
                                                                                                                 // 927
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 928
//                                                                                                        //     // 929
// packages/meteor/string_utils.js                                                                        //     // 930
//                                                                                                        //     // 931
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 932
                                                                                                          //     // 933
// Like Perl's quotemeta: quotes all regexp metacharacters.                                               // 1   // 934
// Code taken from                                                                                        // 2   // 935
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions                      // 3   // 936
Meteor._escapeRegExp = function (string) {                                                                // 4   // 937
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");                                         // 5   // 938
};                                                                                                        // 6   // 939
                                                                                                          // 7   // 940
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 941
                                                                                                                 // 942
}).call(this);                                                                                                   // 943
                                                                                                                 // 944
                                                                                                                 // 945
                                                                                                                 // 946
                                                                                                                 // 947
                                                                                                                 // 948
                                                                                                                 // 949
(function(){                                                                                                     // 950
                                                                                                                 // 951
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 952
//                                                                                                        //     // 953
// packages/meteor/dynamics_nodejs.js                                                                     //     // 954
//                                                                                                        //     // 955
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 956
                                                                                                          //     // 957
// Fiber-aware implementation of dynamic scoping, for use on the server                                   // 1   // 958
                                                                                                          // 2   // 959
var Fiber = Npm.require('fibers');                                                                        // 3   // 960
                                                                                                          // 4   // 961
var nextSlot = 0;                                                                                         // 5   // 962
                                                                                                          // 6   // 963
Meteor._nodeCodeMustBeInFiber = function () {                                                             // 7   // 964
  if (!Fiber.current) {                                                                                   // 8   // 965
    throw new Error("Meteor code must always run within a Fiber. " +                                      // 9   // 966
                    "Try wrapping callbacks that you pass to non-Meteor " +                               // 10  // 967
                    "libraries with Meteor.bindEnvironment.");                                            // 11  // 968
  }                                                                                                       // 12  // 969
};                                                                                                        // 13  // 970
                                                                                                          // 14  // 971
Meteor.EnvironmentVariable = function () {                                                                // 15  // 972
  this.slot = nextSlot++;                                                                                 // 16  // 973
};                                                                                                        // 17  // 974
                                                                                                          // 18  // 975
_.extend(Meteor.EnvironmentVariable.prototype, {                                                          // 19  // 976
  get: function () {                                                                                      // 20  // 977
    Meteor._nodeCodeMustBeInFiber();                                                                      // 21  // 978
                                                                                                          // 22  // 979
    return Fiber.current._meteor_dynamics &&                                                              // 23  // 980
      Fiber.current._meteor_dynamics[this.slot];                                                          // 24  // 981
  },                                                                                                      // 25  // 982
                                                                                                          // 26  // 983
  // Most Meteor code ought to run inside a fiber, and the                                                // 27  // 984
  // _nodeCodeMustBeInFiber assertion helps you remember to include appropriate                           // 28  // 985
  // bindEnvironment calls (which will get you the *right value* for your                                 // 29  // 986
  // environment variables, on the server).                                                               // 30  // 987
  //                                                                                                      // 31  // 988
  // In some very special cases, it's more important to run Meteor code on the                            // 32  // 989
  // server in non-Fiber contexts rather than to strongly enforce the safeguard                           // 33  // 990
  // against forgetting to use bindEnvironment. For example, using `check` in                             // 34  // 991
  // some top-level constructs like connect handlers without needing unnecessary                          // 35  // 992
  // Fibers on every request is more important that possibly failing to find the                          // 36  // 993
  // correct argumentChecker. So this function is just like get(), but it                                 // 37  // 994
  // returns null rather than throwing when called from outside a Fiber. (On the                          // 38  // 995
  // client, it is identical to get().)                                                                   // 39  // 996
  getOrNullIfOutsideFiber: function () {                                                                  // 40  // 997
    if (!Fiber.current)                                                                                   // 41  // 998
      return null;                                                                                        // 42  // 999
    return this.get();                                                                                    // 43  // 1000
  },                                                                                                      // 44  // 1001
                                                                                                          // 45  // 1002
  withValue: function (value, func) {                                                                     // 46  // 1003
    Meteor._nodeCodeMustBeInFiber();                                                                      // 47  // 1004
                                                                                                          // 48  // 1005
    if (!Fiber.current._meteor_dynamics)                                                                  // 49  // 1006
      Fiber.current._meteor_dynamics = [];                                                                // 50  // 1007
    var currentValues = Fiber.current._meteor_dynamics;                                                   // 51  // 1008
                                                                                                          // 52  // 1009
    var saved = currentValues[this.slot];                                                                 // 53  // 1010
    try {                                                                                                 // 54  // 1011
      currentValues[this.slot] = value;                                                                   // 55  // 1012
      var ret = func();                                                                                   // 56  // 1013
    } finally {                                                                                           // 57  // 1014
      currentValues[this.slot] = saved;                                                                   // 58  // 1015
    }                                                                                                     // 59  // 1016
                                                                                                          // 60  // 1017
    return ret;                                                                                           // 61  // 1018
  }                                                                                                       // 62  // 1019
});                                                                                                       // 63  // 1020
                                                                                                          // 64  // 1021
// Meteor application code is always supposed to be run inside a                                          // 65  // 1022
// fiber. bindEnvironment ensures that the function it wraps is run from                                  // 66  // 1023
// inside a fiber and ensures it sees the values of Meteor environment                                    // 67  // 1024
// variables that are set at the time bindEnvironment is called.                                          // 68  // 1025
//                                                                                                        // 69  // 1026
// If an environment-bound function is called from outside a fiber (eg, from                              // 70  // 1027
// an asynchronous callback from a non-Meteor library such as MongoDB), it'll                             // 71  // 1028
// kick off a new fiber to execute the function, and returns undefined as soon                            // 72  // 1029
// as that fiber returns or yields (and func's return value is ignored).                                  // 73  // 1030
//                                                                                                        // 74  // 1031
// If it's called inside a fiber, it works normally (the                                                  // 75  // 1032
// return value of the function will be passed through, and no new                                        // 76  // 1033
// fiber will be created.)                                                                                // 77  // 1034
//                                                                                                        // 78  // 1035
// `onException` should be a function or a string.  When it is a                                          // 79  // 1036
// function, it is called as a callback when the bound function raises                                    // 80  // 1037
// an exception.  If it is a string, it should be a description of the                                    // 81  // 1038
// callback, and when an exception is raised a debug message will be                                      // 82  // 1039
// printed with the description.                                                                          // 83  // 1040
Meteor.bindEnvironment = function (func, onException, _this) {                                            // 84  // 1041
  Meteor._nodeCodeMustBeInFiber();                                                                        // 85  // 1042
                                                                                                          // 86  // 1043
  var boundValues = _.clone(Fiber.current._meteor_dynamics || []);                                        // 87  // 1044
                                                                                                          // 88  // 1045
  if (!onException || typeof(onException) === 'string') {                                                 // 89  // 1046
    var description = onException || "callback of async function";                                        // 90  // 1047
    onException = function (error) {                                                                      // 91  // 1048
      Meteor._debug(                                                                                      // 92  // 1049
        "Exception in " + description + ":",                                                              // 93  // 1050
        error && error.stack || error                                                                     // 94  // 1051
      );                                                                                                  // 95  // 1052
    };                                                                                                    // 96  // 1053
  }                                                                                                       // 97  // 1054
                                                                                                          // 98  // 1055
  return function (/* arguments */) {                                                                     // 99  // 1056
    var args = _.toArray(arguments);                                                                      // 100
                                                                                                          // 101
    var runWithEnvironment = function () {                                                                // 102
      var savedValues = Fiber.current._meteor_dynamics;                                                   // 103
      try {                                                                                               // 104
        // Need to clone boundValues in case two fibers invoke this                                       // 105
        // function at the same time                                                                      // 106
        Fiber.current._meteor_dynamics = _.clone(boundValues);                                            // 107
        var ret = func.apply(_this, args);                                                                // 108
      } catch (e) {                                                                                       // 109
        // note: callback-hook currently relies on the fact that if onException                           // 110
        // throws and you were originally calling the wrapped callback from                               // 111
        // within a Fiber, the wrapped call throws.                                                       // 112
        onException(e);                                                                                   // 113
      } finally {                                                                                         // 114
        Fiber.current._meteor_dynamics = savedValues;                                                     // 115
      }                                                                                                   // 116
      return ret;                                                                                         // 117
    };                                                                                                    // 118
                                                                                                          // 119
    if (Fiber.current)                                                                                    // 120
      return runWithEnvironment();                                                                        // 121
    Fiber(runWithEnvironment).run();                                                                      // 122
  };                                                                                                      // 123
};                                                                                                        // 124
                                                                                                          // 125
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1083
                                                                                                                 // 1084
}).call(this);                                                                                                   // 1085
                                                                                                                 // 1086
                                                                                                                 // 1087
                                                                                                                 // 1088
                                                                                                                 // 1089
                                                                                                                 // 1090
                                                                                                                 // 1091
(function(){                                                                                                     // 1092
                                                                                                                 // 1093
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1094
//                                                                                                        //     // 1095
// packages/meteor/url_server.js                                                                          //     // 1096
//                                                                                                        //     // 1097
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1098
                                                                                                          //     // 1099
if (process.env.ROOT_URL &&                                                                               // 1   // 1100
    typeof __meteor_runtime_config__ === "object") {                                                      // 2   // 1101
  __meteor_runtime_config__.ROOT_URL = process.env.ROOT_URL;                                              // 3   // 1102
  if (__meteor_runtime_config__.ROOT_URL) {                                                               // 4   // 1103
    var parsedUrl = Npm.require('url').parse(__meteor_runtime_config__.ROOT_URL);                         // 5   // 1104
    // Sometimes users try to pass, eg, ROOT_URL=mydomain.com.                                            // 6   // 1105
    if (!parsedUrl.host) {                                                                                // 7   // 1106
      throw Error("$ROOT_URL, if specified, must be an URL");                                             // 8   // 1107
    }                                                                                                     // 9   // 1108
    var pathPrefix = parsedUrl.pathname;                                                                  // 10  // 1109
    if (pathPrefix.slice(-1) === '/') {                                                                   // 11  // 1110
      // remove trailing slash (or turn "/" into "")                                                      // 12  // 1111
      pathPrefix = pathPrefix.slice(0, -1);                                                               // 13  // 1112
    }                                                                                                     // 14  // 1113
    __meteor_runtime_config__.ROOT_URL_PATH_PREFIX = pathPrefix;                                          // 15  // 1114
  } else {                                                                                                // 16  // 1115
    __meteor_runtime_config__.ROOT_URL_PATH_PREFIX = "";                                                  // 17  // 1116
  }                                                                                                       // 18  // 1117
}                                                                                                         // 19  // 1118
                                                                                                          // 20  // 1119
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1120
                                                                                                                 // 1121
}).call(this);                                                                                                   // 1122
                                                                                                                 // 1123
                                                                                                                 // 1124
                                                                                                                 // 1125
                                                                                                                 // 1126
                                                                                                                 // 1127
                                                                                                                 // 1128
(function(){                                                                                                     // 1129
                                                                                                                 // 1130
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1131
//                                                                                                        //     // 1132
// packages/meteor/url_common.js                                                                          //     // 1133
//                                                                                                        //     // 1134
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1135
                                                                                                          //     // 1136
/**                                                                                                       // 1   // 1137
 * @summary Generate an absolute URL pointing to the application. The server reads from the `ROOT_URL` environment variable to determine where it is running. This is taken care of automatically for apps deployed with `meteor deploy`, but must be provided when using `meteor build`.
 * @locus Anywhere                                                                                        // 3   // 1139
 * @param {String} [path] A path to append to the root URL. Do not include a leading "`/`".               // 4   // 1140
 * @param {Object} [options]                                                                              // 5   // 1141
 * @param {Boolean} options.secure Create an HTTPS URL.                                                   // 6   // 1142
 * @param {Boolean} options.replaceLocalhost Replace localhost with 127.0.0.1. Useful for services that don't recognize localhost as a domain name.
 * @param {String} options.rootUrl Override the default ROOT_URL from the server environment. For example: "`http://foo.example.com`"
 */                                                                                                       // 9   // 1145
Meteor.absoluteUrl = function (path, options) {                                                           // 10  // 1146
  // path is optional                                                                                     // 11  // 1147
  if (!options && typeof path === 'object') {                                                             // 12  // 1148
    options = path;                                                                                       // 13  // 1149
    path = undefined;                                                                                     // 14  // 1150
  }                                                                                                       // 15  // 1151
  // merge options with defaults                                                                          // 16  // 1152
  options = _.extend({}, Meteor.absoluteUrl.defaultOptions, options || {});                               // 17  // 1153
                                                                                                          // 18  // 1154
  var url = options.rootUrl;                                                                              // 19  // 1155
  if (!url)                                                                                               // 20  // 1156
    throw new Error("Must pass options.rootUrl or set ROOT_URL in the server environment");               // 21  // 1157
                                                                                                          // 22  // 1158
  if (!/^http[s]?:\/\//i.test(url)) // url starts with 'http://' or 'https://'                            // 23  // 1159
    url = 'http://' + url; // we will later fix to https if options.secure is set                         // 24  // 1160
                                                                                                          // 25  // 1161
  if (!/\/$/.test(url)) // url ends with '/'                                                              // 26  // 1162
    url += '/';                                                                                           // 27  // 1163
                                                                                                          // 28  // 1164
  if (path)                                                                                               // 29  // 1165
    url += path;                                                                                          // 30  // 1166
                                                                                                          // 31  // 1167
  // turn http to https if secure option is set, and we're not talking                                    // 32  // 1168
  // to localhost.                                                                                        // 33  // 1169
  if (options.secure &&                                                                                   // 34  // 1170
      /^http:/.test(url) && // url starts with 'http:'                                                    // 35  // 1171
      !/http:\/\/localhost[:\/]/.test(url) && // doesn't match localhost                                  // 36  // 1172
      !/http:\/\/127\.0\.0\.1[:\/]/.test(url)) // or 127.0.0.1                                            // 37  // 1173
    url = url.replace(/^http:/, 'https:');                                                                // 38  // 1174
                                                                                                          // 39  // 1175
  if (options.replaceLocalhost)                                                                           // 40  // 1176
    url = url.replace(/^http:\/\/localhost([:\/].*)/, 'http://127.0.0.1$1');                              // 41  // 1177
                                                                                                          // 42  // 1178
  return url;                                                                                             // 43  // 1179
};                                                                                                        // 44  // 1180
                                                                                                          // 45  // 1181
// allow later packages to override default options                                                       // 46  // 1182
Meteor.absoluteUrl.defaultOptions = { };                                                                  // 47  // 1183
if (typeof __meteor_runtime_config__ === "object" &&                                                      // 48  // 1184
    __meteor_runtime_config__.ROOT_URL)                                                                   // 49  // 1185
  Meteor.absoluteUrl.defaultOptions.rootUrl = __meteor_runtime_config__.ROOT_URL;                         // 50  // 1186
                                                                                                          // 51  // 1187
                                                                                                          // 52  // 1188
Meteor._relativeToSiteRootUrl = function (link) {                                                         // 53  // 1189
  if (typeof __meteor_runtime_config__ === "object" &&                                                    // 54  // 1190
      link.substr(0, 1) === "/")                                                                          // 55  // 1191
    link = (__meteor_runtime_config__.ROOT_URL_PATH_PREFIX || "") + link;                                 // 56  // 1192
  return link;                                                                                            // 57  // 1193
};                                                                                                        // 58  // 1194
                                                                                                          // 59  // 1195
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1196
                                                                                                                 // 1197
}).call(this);                                                                                                   // 1198
                                                                                                                 // 1199
                                                                                                                 // 1200
                                                                                                                 // 1201
                                                                                                                 // 1202
                                                                                                                 // 1203
                                                                                                                 // 1204
(function(){                                                                                                     // 1205
                                                                                                                 // 1206
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1207
//                                                                                                        //     // 1208
// packages/meteor/flush-buffers-on-exit-in-windows.js                                                    //     // 1209
//                                                                                                        //     // 1210
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1211
                                                                                                          //     // 1212
if (process.platform === "win32") {                                                                       // 1   // 1213
  /*                                                                                                      // 2   // 1214
   * Based on https://github.com/cowboy/node-exit                                                         // 3   // 1215
   *                                                                                                      // 4   // 1216
   * Copyright (c) 2013 "Cowboy" Ben Alman                                                                // 5   // 1217
   * Licensed under the MIT license.                                                                      // 6   // 1218
   */                                                                                                     // 7   // 1219
  var origProcessExit = process.exit.bind(process);                                                       // 8   // 1220
  process.exit = function (exitCode) {                                                                    // 9   // 1221
    var streams = [process.stdout, process.stderr];                                                       // 10  // 1222
    var drainCount = 0;                                                                                   // 11  // 1223
    // Actually exit if all streams are drained.                                                          // 12  // 1224
    function tryToExit() {                                                                                // 13  // 1225
      if (drainCount === streams.length) {                                                                // 14  // 1226
        origProcessExit(exitCode);                                                                        // 15  // 1227
      }                                                                                                   // 16  // 1228
    }                                                                                                     // 17  // 1229
    streams.forEach(function(stream) {                                                                    // 18  // 1230
      // Count drained streams now, but monitor non-drained streams.                                      // 19  // 1231
      if (stream.bufferSize === 0) {                                                                      // 20  // 1232
        drainCount++;                                                                                     // 21  // 1233
      } else {                                                                                            // 22  // 1234
        stream.write('', 'utf-8', function() {                                                            // 23  // 1235
          drainCount++;                                                                                   // 24  // 1236
          tryToExit();                                                                                    // 25  // 1237
        });                                                                                               // 26  // 1238
      }                                                                                                   // 27  // 1239
      // Prevent further writing.                                                                         // 28  // 1240
      stream.write = function() {};                                                                       // 29  // 1241
    });                                                                                                   // 30  // 1242
    // If all streams were already drained, exit now.                                                     // 31  // 1243
    tryToExit();                                                                                          // 32  // 1244
    // In Windows, when run as a Node.js child process, a script utilizing                                // 33  // 1245
    // this library might just exit with a 0 exit code, regardless. This code,                            // 34  // 1246
    // despite the fact that it looks a bit crazy, appears to fix that.                                   // 35  // 1247
    process.on('exit', function() {                                                                       // 36  // 1248
      origProcessExit(exitCode);                                                                          // 37  // 1249
    });                                                                                                   // 38  // 1250
  };                                                                                                      // 39  // 1251
}                                                                                                         // 40  // 1252
////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 1253
                                                                                                                 // 1254
}).call(this);                                                                                                   // 1255
                                                                                                                 // 1256
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.meteor = {
  Meteor: Meteor
};

})();

//# sourceMappingURL=meteor.js.map
