(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var Handler, MiddlewareStack, Iron;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/iron_middleware-stack/packages/iron_middleware-stack.js                                           //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
(function(){                                                                                                  // 1
                                                                                                              // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                     //     // 4
// packages/iron_middleware-stack/lib/handler.js                                                       //     // 5
//                                                                                                     //     // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                       //     // 8
var Url = Iron.Url;                                                                                    // 1   // 9
                                                                                                       // 2   // 10
Handler = function (path, fn, options) {                                                               // 3   // 11
  if (_.isFunction(path)) {                                                                            // 4   // 12
    options = options || fn || {};                                                                     // 5   // 13
    fn = path;                                                                                         // 6   // 14
    path = '/';                                                                                        // 7   // 15
                                                                                                       // 8   // 16
    // probably need a better approach here to differentiate between                                   // 9   // 17
    // Router.use(function () {}) and Router.use(MyAdminApp). In the first                             // 10  // 18
    // case we don't want to count it as a viable server handler when we're                            // 11  // 19
    // on the client and need to decide whether to go to the server. in the                            // 12  // 20
    // latter case, we DO want to go to the server, potentially.                                       // 13  // 21
    this.middleware = true;                                                                            // 14  // 22
                                                                                                       // 15  // 23
    if (typeof options.mount === 'undefined')                                                          // 16  // 24
      options.mount = true;                                                                            // 17  // 25
  }                                                                                                    // 18  // 26
                                                                                                       // 19  // 27
  // if fn is a function then typeof fn => 'function'                                                  // 20  // 28
  // but note we can't use _.isObject here because that will return true if the                        // 21  // 29
  // fn is a function OR an object.                                                                    // 22  // 30
  if (typeof fn === 'object') {                                                                        // 23  // 31
    options = fn;                                                                                      // 24  // 32
    fn = options.action || 'action';                                                                   // 25  // 33
  }                                                                                                    // 26  // 34
                                                                                                       // 27  // 35
  options = options || {};                                                                             // 28  // 36
                                                                                                       // 29  // 37
  this.options = options;                                                                              // 30  // 38
  this.mount = options.mount;                                                                          // 31  // 39
  this.method = (options.method && options.method.toLowerCase()) || false;                             // 32  // 40
                                                                                                       // 33  // 41
  // should the handler be on the 'client', 'server' or 'both'?                                        // 34  // 42
  // XXX can't we default this to undefined in which case it's run in all                              // 35  // 43
  // environments?                                                                                     // 36  // 44
  this.where = options.where || 'client';                                                              // 37  // 45
                                                                                                       // 38  // 46
  // if we're mounting at path '/foo' then this handler should also handle                             // 39  // 47
  // '/foo/bar' and '/foo/bar/baz'                                                                     // 40  // 48
  if (this.mount)                                                                                      // 41  // 49
    options.end = false;                                                                               // 42  // 50
                                                                                                       // 43  // 51
  // set the name                                                                                      // 44  // 52
  if (options.name)                                                                                    // 45  // 53
    this.name = options.name;                                                                          // 46  // 54
  else if (typeof path === 'string' && path.charAt(0) !== '/')                                         // 47  // 55
    this.name = path;                                                                                  // 48  // 56
  else if (fn && fn.name)                                                                              // 49  // 57
    this.name = fn.name;                                                                               // 50  // 58
  else if (typeof path === 'string' && path !== '/')                                                   // 51  // 59
    this.name = path.split('/').slice(1).join('.');                                                    // 52  // 60
                                                                                                       // 53  // 61
  // if the path is explicitly set on the options (e.g. legacy router support)                         // 54  // 62
  // then use that                                                                                     // 55  // 63
  // otherwise use the path argument which could also be a name                                        // 56  // 64
  path = options.path || path;                                                                         // 57  // 65
                                                                                                       // 58  // 66
  if (typeof path === 'string' && path.charAt(0) !== '/')                                              // 59  // 67
    path = '/' + path;                                                                                 // 60  // 68
                                                                                                       // 61  // 69
  this.path = path;                                                                                    // 62  // 70
  this.compiledUrl = new Url(path, options);                                                           // 63  // 71
                                                                                                       // 64  // 72
  if (_.isString(fn)) {                                                                                // 65  // 73
    this.handle = function handle () {                                                                 // 66  // 74
      // try to find a method on the current thisArg which might be a Controller                       // 67  // 75
      // for example.                                                                                  // 68  // 76
      var func = this[fn];                                                                             // 69  // 77
                                                                                                       // 70  // 78
      if (typeof func !== 'function')                                                                  // 71  // 79
        throw new Error("No method named " + JSON.stringify(fn) + " found on handler.");               // 72  // 80
                                                                                                       // 73  // 81
      return func.apply(this, arguments);                                                              // 74  // 82
    };                                                                                                 // 75  // 83
  } else if (_.isFunction(fn)) {                                                                       // 76  // 84
    // or just a regular old function                                                                  // 77  // 85
    this.handle = fn;                                                                                  // 78  // 86
  }                                                                                                    // 79  // 87
};                                                                                                     // 80  // 88
                                                                                                       // 81  // 89
/**                                                                                                    // 82  // 90
 * Returns true if the path matches the handler's compiled url, method                                 // 83  // 91
 * and environment (e.g. client/server). If no options.method or options.where                         // 84  // 92
 * is provided, then only the path will be used to test.                                               // 85  // 93
 */                                                                                                    // 86  // 94
Handler.prototype.test = function (path, options) {                                                    // 87  // 95
  options = options || {};                                                                             // 88  // 96
                                                                                                       // 89  // 97
  var isUrlMatch = this.compiledUrl.test(path);                                                        // 90  // 98
  var isMethodMatch = true;                                                                            // 91  // 99
  var isEnvMatch = true;                                                                               // 92  // 100
                                                                                                       // 93  // 101
  if (this.method && options.method)                                                                   // 94  // 102
    isMethodMatch = this.method == options.method.toLowerCase();                                       // 95  // 103
                                                                                                       // 96  // 104
  if (options.where)                                                                                   // 97  // 105
    isEnvMatch = this.where == options.where;                                                          // 98  // 106
                                                                                                       // 99  // 107
  return isUrlMatch && isMethodMatch && isEnvMatch;                                                    // 100
};                                                                                                     // 101
                                                                                                       // 102
Handler.prototype.params = function (path) {                                                           // 103
  return this.compiledUrl.params(path);                                                                // 104
};                                                                                                     // 105
                                                                                                       // 106
Handler.prototype.resolve = function (params, options) {                                               // 107
  return this.compiledUrl.resolve(params, options);                                                    // 108
};                                                                                                     // 109
                                                                                                       // 110
/**                                                                                                    // 111
 * Returns a new cloned Handler.                                                                       // 112
 * XXX problem is here because we're not storing the original path.                                    // 113
 */                                                                                                    // 114
Handler.prototype.clone = function () {                                                                // 115
  var clone = new Handler(this.path, this.handle, this.options);                                       // 116
  // in case the original function had a name                                                          // 117
  clone.name = this.name;                                                                              // 118
  return clone;                                                                                        // 119
};                                                                                                     // 120
                                                                                                       // 121
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 130
                                                                                                              // 131
}).call(this);                                                                                                // 132
                                                                                                              // 133
                                                                                                              // 134
                                                                                                              // 135
                                                                                                              // 136
                                                                                                              // 137
                                                                                                              // 138
(function(){                                                                                                  // 139
                                                                                                              // 140
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 141
//                                                                                                     //     // 142
// packages/iron_middleware-stack/lib/middleware_stack.js                                              //     // 143
//                                                                                                     //     // 144
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 145
                                                                                                       //     // 146
var Url = Iron.Url;                                                                                    // 1   // 147
var assert = Iron.utils.assert;                                                                        // 2   // 148
var defaultValue = Iron.utils.defaultValue;                                                            // 3   // 149
                                                                                                       // 4   // 150
/**                                                                                                    // 5   // 151
 * Connect inspired middleware stack that works on the client and the server.                          // 6   // 152
 *                                                                                                     // 7   // 153
 * You can add handlers to the stack for various paths. Those handlers can run                         // 8   // 154
 * on the client or server. Then you can dispatch into the stack with a                                // 9   // 155
 * given path by calling the dispatch method. This goes down the stack looking                         // 10  // 156
 * for matching handlers given the url and environment (client/server). If we're                       // 11  // 157
 * on the client and we should make a trip to the server, the onServerDispatch                         // 12  // 158
 * callback is called.                                                                                 // 13  // 159
 *                                                                                                     // 14  // 160
 * The middleware stack supports the Connect API. But it also allows you to                            // 15  // 161
 * specify a context so we can have one context object (like a Controller) that                        // 16  // 162
 * is a consistent context for each handler function called on a dispatch.                             // 17  // 163
 *                                                                                                     // 18  // 164
 */                                                                                                    // 19  // 165
MiddlewareStack = function () {                                                                        // 20  // 166
  this._stack = [];                                                                                    // 21  // 167
  this.length = 0;                                                                                     // 22  // 168
};                                                                                                     // 23  // 169
                                                                                                       // 24  // 170
MiddlewareStack.prototype._create = function (path, fn, options) {                                     // 25  // 171
  var handler = new Handler(path, fn, options);                                                        // 26  // 172
  var name = handler.name;                                                                             // 27  // 173
                                                                                                       // 28  // 174
  if (name) {                                                                                          // 29  // 175
    if (_.has(this._stack, name)) {                                                                    // 30  // 176
      throw new Error("Handler with name '" + name + "' already exists.");                             // 31  // 177
    }                                                                                                  // 32  // 178
    this._stack[name] = handler;                                                                       // 33  // 179
  }                                                                                                    // 34  // 180
                                                                                                       // 35  // 181
  return handler;                                                                                      // 36  // 182
};                                                                                                     // 37  // 183
                                                                                                       // 38  // 184
MiddlewareStack.prototype.findByName = function (name) {                                               // 39  // 185
  return this._stack[name];                                                                            // 40  // 186
};                                                                                                     // 41  // 187
                                                                                                       // 42  // 188
/**                                                                                                    // 43  // 189
 * Push a new handler onto the stack.                                                                  // 44  // 190
 */                                                                                                    // 45  // 191
MiddlewareStack.prototype.push = function (path, fn, options) {                                        // 46  // 192
  var handler = this._create(path, fn, options);                                                       // 47  // 193
  this._stack.push(handler);                                                                           // 48  // 194
  this.length++;                                                                                       // 49  // 195
  return handler;                                                                                      // 50  // 196
};                                                                                                     // 51  // 197
                                                                                                       // 52  // 198
MiddlewareStack.prototype.append = function (/* fn1, fn2, [f3, f4]... */) {                            // 53  // 199
  var self = this;                                                                                     // 54  // 200
  var args = _.toArray(arguments);                                                                     // 55  // 201
  var options = {};                                                                                    // 56  // 202
                                                                                                       // 57  // 203
  if (typeof args[args.length-1] === 'object')                                                         // 58  // 204
    options = args.pop();                                                                              // 59  // 205
                                                                                                       // 60  // 206
  _.each(args, function (fnOrArray) {                                                                  // 61  // 207
    if (typeof fnOrArray === 'undefined')                                                              // 62  // 208
      return;                                                                                          // 63  // 209
    else if (typeof fnOrArray === 'function')                                                          // 64  // 210
      self.push(fnOrArray, options);                                                                   // 65  // 211
    else if (_.isArray(fnOrArray))                                                                     // 66  // 212
      self.append.apply(self, fnOrArray.concat([options]));                                            // 67  // 213
    else                                                                                               // 68  // 214
      throw new Error("Can only append functions or arrays to the MiddlewareStack");                   // 69  // 215
  });                                                                                                  // 70  // 216
                                                                                                       // 71  // 217
  return this;                                                                                         // 72  // 218
};                                                                                                     // 73  // 219
                                                                                                       // 74  // 220
/**                                                                                                    // 75  // 221
 * Insert a handler at a specific index in the stack.                                                  // 76  // 222
 *                                                                                                     // 77  // 223
 * The index behavior is the same as Array.prototype.splice. If the index is                           // 78  // 224
 * greater than the stack length the handler will be appended at the end of the                        // 79  // 225
 * stack. If the index is negative, the item will be inserted "index" elements                         // 80  // 226
 * from the end.                                                                                       // 81  // 227
 */                                                                                                    // 82  // 228
MiddlewareStack.prototype.insertAt = function (index, path, fn, options) {                             // 83  // 229
  var handler = this._create(path, fn, options);                                                       // 84  // 230
  this._stack.splice(index, 0, handler);                                                               // 85  // 231
  this.length = this._stack.length;                                                                    // 86  // 232
  return this;                                                                                         // 87  // 233
};                                                                                                     // 88  // 234
                                                                                                       // 89  // 235
/**                                                                                                    // 90  // 236
 * Insert a handler before another named handler.                                                      // 91  // 237
 */                                                                                                    // 92  // 238
MiddlewareStack.prototype.insertBefore = function (name, path, fn, options) {                          // 93  // 239
  var beforeHandler;                                                                                   // 94  // 240
  var index;                                                                                           // 95  // 241
                                                                                                       // 96  // 242
  if (!(beforeHandler = this._stack[name]))                                                            // 97  // 243
    throw new Error("Couldn't find a handler named '" + name + "' on the path stack");                 // 98  // 244
                                                                                                       // 99  // 245
  index = _.indexOf(this._stack, beforeHandler);                                                       // 100
  this.insertAt(index, path, fn, options);                                                             // 101
  return this;                                                                                         // 102
};                                                                                                     // 103
                                                                                                       // 104
/**                                                                                                    // 105
 * Insert a handler after another named handler.                                                       // 106
 *                                                                                                     // 107
 */                                                                                                    // 108
MiddlewareStack.prototype.insertAfter = function (name, path, fn, options) {                           // 109
  var handler;                                                                                         // 110
  var index;                                                                                           // 111
                                                                                                       // 112
  if (!(handler = this._stack[name]))                                                                  // 113
    throw new Error("Couldn't find a handler named '" + name + "' on the path stack");                 // 114
                                                                                                       // 115
  index = _.indexOf(this._stack, handler);                                                             // 116
  this.insertAt(index + 1, path, fn, options);                                                         // 117
  return this;                                                                                         // 118
};                                                                                                     // 119
                                                                                                       // 120
/**                                                                                                    // 121
 * Return a new MiddlewareStack comprised of this stack joined with other                              // 122
 * stacks. Note the new stack will not have named handlers anymore. Only the                           // 123
 * handlers are cloned but not the name=>handler mapping.                                              // 124
 */                                                                                                    // 125
MiddlewareStack.prototype.concat = function (/* stack1, stack2, */) {                                  // 126
  var ret = new MiddlewareStack;                                                                       // 127
  var concat = Array.prototype.concat;                                                                 // 128
  var clonedThisStack = EJSON.clone(this._stack);                                                      // 129
  var clonedOtherStacks = _.map(_.toArray(arguments), function (s) { return EJSON.clone(s._stack); });        // 276
  ret._stack = concat.apply(clonedThisStack, clonedOtherStacks);                                       // 131
  ret.length = ret._stack.length;                                                                      // 132
  return ret;                                                                                          // 133
};                                                                                                     // 134
                                                                                                       // 135
/**                                                                                                    // 136
 * Dispatch into the middleware stack, allowing the handlers to control the                            // 137
 * iteration by calling this.next();                                                                   // 138
 */                                                                                                    // 139
MiddlewareStack.prototype.dispatch = function dispatch (url, context, done) {                          // 140
  var self = this;                                                                                     // 141
  var originalUrl = url;                                                                               // 142
                                                                                                       // 143
  assert(typeof url === 'string', "Requires url");                                                     // 144
  assert(typeof context === 'object', "Requires context object");                                      // 145
                                                                                                       // 146
  url = Url.normalize(url || '/');                                                                     // 147
                                                                                                       // 148
  defaultValue(context, 'request', {});                                                                // 149
  defaultValue(context, 'response', {});                                                               // 150
  defaultValue(context, 'originalUrl', url);                                                           // 151
                                                                                                       // 152
  //defaultValue(context, 'location', Url.parse(originalUrl));                                         // 153
  defaultValue(context, '_method', context.method);                                                    // 154
  defaultValue(context, '_handlersForEnv', {client: false, server: false});                            // 155
  defaultValue(context, '_handled', false);                                                            // 156
                                                                                                       // 157
  defaultValue(context, 'isHandled', function () {                                                     // 158
    return context._handled;                                                                           // 159
  });                                                                                                  // 160
                                                                                                       // 161
  defaultValue(context, 'willBeHandledOnClient', function () {                                         // 162
    return context._handlersForEnv.client;                                                             // 163
  });                                                                                                  // 164
                                                                                                       // 165
  defaultValue(context, 'willBeHandledOnServer', function () {                                         // 166
    return context._handlersForEnv.server;                                                             // 167
  });                                                                                                  // 168
                                                                                                       // 169
  var wrappedDone = function () {                                                                      // 170
    if (done) {                                                                                        // 171
      try {                                                                                            // 172
        done.apply(this, arguments);                                                                   // 173
      } catch (err) {                                                                                  // 174
        // if we catch an error at this point in the stack we don't want it                            // 175
        // handled in the next() iterator below. So we'll mark the error to tell                       // 176
        // the next iterator to ignore it.                                                             // 177
        err._punt = true;                                                                              // 178
                                                                                                       // 179
        // now rethrow it!                                                                             // 180
        throw err;                                                                                     // 181
      }                                                                                                // 182
    }                                                                                                  // 183
  };                                                                                                   // 184
                                                                                                       // 185
  var index = 0;                                                                                       // 186
                                                                                                       // 187
  var next = Meteor.bindEnvironment(function boundNext (err) {                                         // 188
    var handler = self._stack[index++];                                                                // 189
                                                                                                       // 190
    // reset the url                                                                                   // 191
    context.url = context.request.url = context.originalUrl;                                           // 192
                                                                                                       // 193
    if (!handler)                                                                                      // 194
      return wrappedDone.call(context, err);                                                           // 195
                                                                                                       // 196
    if (!handler.test(url, {method: context._method}))                                                 // 197
      return next(err);                                                                                // 198
                                                                                                       // 199
    // okay if we've gotten this far the handler matches our url but we still                          // 200
    // don't know if this is a client or server handler. Let's track that.                             // 201
    // XXX couldn't the environment be something else like cordova?                                    // 202
    var where = Meteor.isClient ? 'client' : 'server';                                                 // 203
                                                                                                       // 204
    // track that we have a handler for the given environment so long as it's                          // 205
    // not middleware created like this Router.use(function () {}). We'll assume                       // 206
    // that if the handler is of that form we don't want to make a trip to                             // 207
    // the client or the server for it.                                                                // 208
    if (!handler.middleware)                                                                           // 209
      context._handlersForEnv[handler.where] = true;                                                   // 210
                                                                                                       // 211
    // but if we're not actually on that env, skip to the next handler.                                // 212
    if (handler.where !== where)                                                                       // 213
      return next(err);                                                                                // 214
                                                                                                       // 215
    // get the parameters for this url from the handler's compiled path                                // 216
    // XXX removing for now                                                                            // 217
    //var params = handler.params(context.location.href);                                              // 218
    //context.request.params = defaultValue(context, 'params', {});                                    // 219
    //_.extend(context.params, params);                                                                // 220
                                                                                                       // 221
    // so we can call this.next()                                                                      // 222
    // XXX this breaks with things like request.body which require that the                            // 223
    // iterator be saved for the given function call.                                                  // 224
    context.next = next;                                                                               // 225
                                                                                                       // 226
    if (handler.mount) {                                                                               // 227
      var mountpath = Url.normalize(handler.compiledUrl.pathname);                                     // 228
      var newUrl = url.substr(mountpath.length, url.length);                                           // 229
      newUrl = Url.normalize(newUrl);                                                                  // 230
      context.url = context.request.url = newUrl;                                                      // 231
    }                                                                                                  // 232
                                                                                                       // 233
    try {                                                                                              // 234
      //                                                                                               // 235
      // The connect api says a handler signature (arity) can look like any of:                        // 236
      //                                                                                               // 237
      // 1) function (req, res, next)                                                                  // 238
      // 2) function (err, req, res, next)                                                             // 239
      // 3) function (err)                                                                             // 240
      var arity = handler.handle.length                                                                // 241
      var req = context.request;                                                                       // 242
      var res = context.response;                                                                      // 243
                                                                                                       // 244
      // function (err, req, res, next)                                                                // 245
      if (err && arity === 4)                                                                          // 246
        return handler.handle.call(context, err, req, res, next);                                      // 247
                                                                                                       // 248
      // function (req, res, next)                                                                     // 249
      if (!err && arity < 4)                                                                           // 250
        return handler.handle.call(context, req, res, next);                                           // 251
                                                                                                       // 252
      // default is function (err) so punt the error down the stack                                    // 253
      // until we either find a handler who likes to deal with errors or we call                       // 254
      // out                                                                                           // 255
      return next(err);                                                                                // 256
    } catch (err) {                                                                                    // 257
      if (err._punt)                                                                                   // 258
        // ignore this error and throw it down the stack                                               // 259
        throw err;                                                                                     // 260
      else                                                                                             // 261
        // see if the next handler wants to deal with the error                                        // 262
        next(err);                                                                                     // 263
    } finally {                                                                                        // 264
      // we'll put this at the end because some middleware                                             // 265
      // might want to decide what to do based on whether we've                                        // 266
      // been handled "yet". If we set this to true before the handler                                 // 267
      // is called, there's no way for the handler to say, if we haven't been                          // 268
      // handled yet go to the server, for example.                                                    // 269
      context._handled = true;                                                                         // 270
      context.next = null;                                                                             // 271
    }                                                                                                  // 272
  });                                                                                                  // 273
                                                                                                       // 274
  next();                                                                                              // 275
                                                                                                       // 276
  context.next = null;                                                                                 // 277
  return context;                                                                                      // 278
};                                                                                                     // 279
                                                                                                       // 280
Iron = Iron || {};                                                                                     // 281
Iron.MiddlewareStack = MiddlewareStack;                                                                // 282
                                                                                                       // 283
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 430
                                                                                                              // 431
}).call(this);                                                                                                // 432
                                                                                                              // 433
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['iron:middleware-stack'] = {
  Handler: Handler
};

})();

//# sourceMappingURL=iron_middleware-stack.js.map
