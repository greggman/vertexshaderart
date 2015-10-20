(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var HTTP, _methodHTTP, Fiber, runServerMethod;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/cfs_http-methods/packages/cfs_http-methods.js            //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {                                                       // 1
                                                                     // 2
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/cfs:http-methods/http.methods.server.api.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/*                                                                                                                    // 1
                                                                                                                      // 2
GET /note                                                                                                             // 3
GET /note/:id                                                                                                         // 4
POST /note                                                                                                            // 5
PUT /note/:id                                                                                                         // 6
DELETE /note/:id                                                                                                      // 7
                                                                                                                      // 8
*/                                                                                                                    // 9
HTTP = Package.http && Package.http.HTTP || {};                                                                       // 10
                                                                                                                      // 11
// Primary local test scope                                                                                           // 12
_methodHTTP = {};                                                                                                     // 13
                                                                                                                      // 14
                                                                                                                      // 15
_methodHTTP.methodHandlers = {};                                                                                      // 16
_methodHTTP.methodTree = {};                                                                                          // 17
                                                                                                                      // 18
// This could be changed eg. could allow larger data chunks than 1.000.000                                            // 19
// 5mb = 5 * 1024 * 1024 = 5242880;                                                                                   // 20
HTTP.methodsMaxDataLength = 5242880; //1e6;                                                                           // 21
                                                                                                                      // 22
_methodHTTP.nameFollowsConventions = function(name) {                                                                 // 23
  // Check that name is string, not a falsy or empty                                                                  // 24
  return name && name === '' + name && name !== '';                                                                   // 25
};                                                                                                                    // 26
                                                                                                                      // 27
                                                                                                                      // 28
_methodHTTP.getNameList = function(name) {                                                                            // 29
  // Remove leading and trailing slashes and make command array                                                       // 30
  name = name && name.replace(/^\//g, '') || ''; // /^\/|\/$/g                                                        // 31
  // TODO: Get the format from the url - eg.: "/list/45.json" format should be                                        // 32
  // set in this function by splitting the last list item by . and have format                                        // 33
  // as the last item. How should we toggle:                                                                          // 34
  // "/list/45/item.name.json" and "/list/45/item.name"?                                                              // 35
  // We would either have to check all known formats or allways determin the "."                                      // 36
  // as an extension. Resolving in "json" and "name" as handed format - the user                                      // 37
  // Could simply just add the format as a parametre? or be explicit about                                            // 38
  // naming                                                                                                           // 39
  return name && name.split('/') || [];                                                                               // 40
};                                                                                                                    // 41
                                                                                                                      // 42
// Merge two arrays one containing keys and one values                                                                // 43
_methodHTTP.createObject = function(keys, values) {                                                                   // 44
  var result = {};                                                                                                    // 45
  if (keys && values) {                                                                                               // 46
    for (var i = 0; i < keys.length; i++) {                                                                           // 47
      result[keys[i]] = values[i] && decodeURIComponent(values[i]) || '';                                             // 48
    }                                                                                                                 // 49
  }                                                                                                                   // 50
  return result;                                                                                                      // 51
};                                                                                                                    // 52
                                                                                                                      // 53
_methodHTTP.addToMethodTree = function(methodName) {                                                                  // 54
  var list = _methodHTTP.getNameList(methodName);                                                                     // 55
  var name = '/';                                                                                                     // 56
  // Contains the list of params names                                                                                // 57
  var params = [];                                                                                                    // 58
  var currentMethodTree = _methodHTTP.methodTree;                                                                     // 59
                                                                                                                      // 60
  for (var i = 0; i < list.length; i++) {                                                                             // 61
                                                                                                                      // 62
    // get the key name                                                                                               // 63
    var key = list[i];                                                                                                // 64
    // Check if it expects a value                                                                                    // 65
    if (key[0] === ':') {                                                                                             // 66
      // This is a value                                                                                              // 67
      params.push(key.slice(1));                                                                                      // 68
      key = ':value';                                                                                                 // 69
    }                                                                                                                 // 70
    name += key + '/';                                                                                                // 71
                                                                                                                      // 72
    // Set the key into the method tree                                                                               // 73
    if (typeof currentMethodTree[key] === 'undefined') {                                                              // 74
      currentMethodTree[key] = {};                                                                                    // 75
    }                                                                                                                 // 76
                                                                                                                      // 77
    // Dig deeper                                                                                                     // 78
    currentMethodTree = currentMethodTree[key];                                                                       // 79
                                                                                                                      // 80
  }                                                                                                                   // 81
                                                                                                                      // 82
  if (_.isEmpty(currentMethodTree[':ref'])) {                                                                         // 83
    currentMethodTree[':ref'] = {                                                                                     // 84
      name: name,                                                                                                     // 85
      params: params                                                                                                  // 86
    };                                                                                                                // 87
  }                                                                                                                   // 88
                                                                                                                      // 89
  return currentMethodTree[':ref'];                                                                                   // 90
};                                                                                                                    // 91
                                                                                                                      // 92
// This method should be optimized for speed since its called on allmost every                                        // 93
// http call to the server so we return null as soon as we know its not a method                                      // 94
_methodHTTP.getMethod = function(name) {                                                                              // 95
  // Check if the                                                                                                     // 96
  if (!_methodHTTP.nameFollowsConventions(name)) {                                                                    // 97
    return null;                                                                                                      // 98
  }                                                                                                                   // 99
  var list = _methodHTTP.getNameList(name);                                                                           // 100
  // Check if we got a correct list                                                                                   // 101
  if (!list || !list.length) {                                                                                        // 102
    return null;                                                                                                      // 103
  }                                                                                                                   // 104
  // Set current refernce in the _methodHTTP.methodTree                                                               // 105
  var currentMethodTree = _methodHTTP.methodTree;                                                                     // 106
  // Buffer for values to hand on later                                                                               // 107
  var values = [];                                                                                                    // 108
  // Iterate over the method name and check if its found in the method tree                                           // 109
  for (var i = 0; i < list.length; i++) {                                                                             // 110
    // get the key name                                                                                               // 111
    var key = list[i];                                                                                                // 112
    // We expect to find the key or :value if not we break                                                            // 113
    if (typeof currentMethodTree[key] !== 'undefined' ||                                                              // 114
            typeof currentMethodTree[':value'] !== 'undefined') {                                                     // 115
      // We got a result now check if its a value                                                                     // 116
      if (typeof currentMethodTree[key] === 'undefined') {                                                            // 117
        // Push the value                                                                                             // 118
        values.push(key);                                                                                             // 119
        // Set the key to :value to dig deeper                                                                        // 120
        key = ':value';                                                                                               // 121
      }                                                                                                               // 122
                                                                                                                      // 123
    } else {                                                                                                          // 124
      // Break - method call not found                                                                                // 125
      return null;                                                                                                    // 126
    }                                                                                                                 // 127
                                                                                                                      // 128
    // Dig deeper                                                                                                     // 129
    currentMethodTree = currentMethodTree[key];                                                                       // 130
  }                                                                                                                   // 131
                                                                                                                      // 132
  // Extract reference pointer                                                                                        // 133
  var reference = currentMethodTree && currentMethodTree[':ref'];                                                     // 134
  if (typeof reference !== 'undefined') {                                                                             // 135
    return {                                                                                                          // 136
      name: reference.name,                                                                                           // 137
      params: _methodHTTP.createObject(reference.params, values),                                                     // 138
      handle: _methodHTTP.methodHandlers[reference.name]                                                              // 139
    };                                                                                                                // 140
  } else {                                                                                                            // 141
    // Did not get any reference to the method                                                                        // 142
    return null;                                                                                                      // 143
  }                                                                                                                   // 144
};                                                                                                                    // 145
                                                                                                                      // 146
// This method retrieves the userId from the token and makes sure that the token                                      // 147
// is valid and not expired                                                                                           // 148
_methodHTTP.getUserId = function() {                                                                                  // 149
  var self = this;                                                                                                    // 150
                                                                                                                      // 151
  // // Get ip, x-forwarded-for can be comma seperated ips where the first is the                                     // 152
  // // client ip                                                                                                     // 153
  // var ip = self.req.headers['x-forwarded-for'] &&                                                                  // 154
  //         // Return the first item in ip list                                                                      // 155
  //         self.req.headers['x-forwarded-for'].split(',')[0] ||                                                     // 156
  //         // or return the remoteAddress                                                                           // 157
  //         self.req.connection.remoteAddress;                                                                       // 158
                                                                                                                      // 159
  // Check authentication                                                                                             // 160
  var userToken = self.query.token;                                                                                   // 161
                                                                                                                      // 162
  // Check if we are handed strings                                                                                   // 163
  try {                                                                                                               // 164
    userToken && check(userToken, String);                                                                            // 165
  } catch(err) {                                                                                                      // 166
    throw new Meteor.Error(404, 'Error user token and id not of type strings, Error: ' + (err.stack || err.message)); // 167
  }                                                                                                                   // 168
                                                                                                                      // 169
  // Set the this.userId                                                                                              // 170
  if (userToken) {                                                                                                    // 171
    // Look up user to check if user exists and is loggedin via token                                                 // 172
    var user = Meteor.users.findOne({                                                                                 // 173
        $or: [                                                                                                        // 174
          {'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(userToken)},                           // 175
          {'services.resume.loginTokens.token': userToken}                                                            // 176
        ]                                                                                                             // 177
      });                                                                                                             // 178
    // TODO: check 'services.resume.loginTokens.when' to have the token expire                                        // 179
                                                                                                                      // 180
    // Set the userId in the scope                                                                                    // 181
    return user && user._id;                                                                                          // 182
  }                                                                                                                   // 183
                                                                                                                      // 184
  return null;                                                                                                        // 185
};                                                                                                                    // 186
                                                                                                                      // 187
// Expose the default auth for calling from custom authentication handlers.                                           // 188
HTTP.defaultAuth = _methodHTTP.getUserId;                                                                             // 189
                                                                                                                      // 190
/*                                                                                                                    // 191
                                                                                                                      // 192
Add default support for options                                                                                       // 193
                                                                                                                      // 194
*/                                                                                                                    // 195
_methodHTTP.defaultOptionsHandler = function(methodObject) {                                                          // 196
  // List of supported methods                                                                                        // 197
  var allowMethods = [];                                                                                              // 198
  // The final result object                                                                                          // 199
  var result = {};                                                                                                    // 200
                                                                                                                      // 201
  // Iterate over the methods                                                                                         // 202
  // XXX: We should have a way to extend this - We should have some schema model                                      // 203
  // for our methods...                                                                                               // 204
  _.each(methodObject, function(f, methodName) {                                                                      // 205
    // Skip the stream and auth functions - they are not public / accessible                                          // 206
    if (methodName !== 'stream' && methodName !== 'auth') {                                                           // 207
                                                                                                                      // 208
      // Create an empty description                                                                                  // 209
      result[methodName] = { description: '', parameters: {} };                                                       // 210
      // Add method name to headers                                                                                   // 211
      allowMethods.push(methodName);                                                                                  // 212
                                                                                                                      // 213
    }                                                                                                                 // 214
  });                                                                                                                 // 215
                                                                                                                      // 216
  // Lets play nice                                                                                                   // 217
  this.setStatusCode(200);                                                                                            // 218
                                                                                                                      // 219
  // We have to set some allow headers here                                                                           // 220
  this.addHeader('Allow', allowMethods.join(','));                                                                    // 221
                                                                                                                      // 222
  // Return json result - Pretty print                                                                                // 223
  return JSON.stringify(result, null, '\t');                                                                          // 224
};                                                                                                                    // 225
                                                                                                                      // 226
// Public interface for adding server-side http methods - if setting a method to                                      // 227
// 'false' it would actually remove the method (can be used to unpublish a method)                                    // 228
HTTP.methods = function(newMethods) {                                                                                 // 229
  _.each(newMethods, function(func, name) {                                                                           // 230
    if (_methodHTTP.nameFollowsConventions(name)) {                                                                   // 231
      // Check if we got a function                                                                                   // 232
      //if (typeof func === 'function') {                                                                             // 233
        var method = _methodHTTP.addToMethodTree(name);                                                               // 234
        // The func is good                                                                                           // 235
        if (typeof _methodHTTP.methodHandlers[method.name] !== 'undefined') {                                         // 236
          if (func === false) {                                                                                       // 237
            // If the method is set to false then unpublish                                                           // 238
            delete _methodHTTP.methodHandlers[method.name];                                                           // 239
            // Delete the reference in the _methodHTTP.methodTree                                                     // 240
            delete method.name;                                                                                       // 241
            delete method.params;                                                                                     // 242
          } else {                                                                                                    // 243
            // We should not allow overwriting - following Meteor.methods                                             // 244
            throw new Error('HTTP method "' + name + '" is already registered');                                      // 245
          }                                                                                                           // 246
        } else {                                                                                                      // 247
          // We could have a function or a object                                                                     // 248
          // The object could have:                                                                                   // 249
          // '/test/': {                                                                                              // 250
          //   auth: function() ... returning the userId using over default                                           // 251
          //                                                                                                          // 252
          //   method: function() ...                                                                                 // 253
          //   or                                                                                                     // 254
          //   post: function() ...                                                                                   // 255
          //   put:                                                                                                   // 256
          //   get:                                                                                                   // 257
          //   delete:                                                                                                // 258
          //   head:                                                                                                  // 259
          // }                                                                                                        // 260
                                                                                                                      // 261
          /*                                                                                                          // 262
          We conform to the object format:                                                                            // 263
          {                                                                                                           // 264
            auth:                                                                                                     // 265
            post:                                                                                                     // 266
            put:                                                                                                      // 267
            get:                                                                                                      // 268
            delete:                                                                                                   // 269
            head:                                                                                                     // 270
          }                                                                                                           // 271
          This way we have a uniform reference                                                                        // 272
          */                                                                                                          // 273
                                                                                                                      // 274
          var uniObj = {};                                                                                            // 275
          if (typeof func === 'function') {                                                                           // 276
            uniObj = {                                                                                                // 277
              'auth': _methodHTTP.getUserId,                                                                          // 278
              'stream': false,                                                                                        // 279
              'POST': func,                                                                                           // 280
              'PUT': func,                                                                                            // 281
              'GET': func,                                                                                            // 282
              'DELETE': func,                                                                                         // 283
              'HEAD': func,                                                                                           // 284
              'OPTIONS': _methodHTTP.defaultOptionsHandler                                                            // 285
            };                                                                                                        // 286
          } else {                                                                                                    // 287
            uniObj = {                                                                                                // 288
              'stream': func.stream || false,                                                                         // 289
              'auth': func.auth || _methodHTTP.getUserId,                                                             // 290
              'POST': func.post || func.method,                                                                       // 291
              'PUT': func.put || func.method,                                                                         // 292
              'GET': func.get || func.method,                                                                         // 293
              'DELETE': func.delete || func.method,                                                                   // 294
              'HEAD': func.head || func.get || func.method,                                                           // 295
              'OPTIONS': func.options || _methodHTTP.defaultOptionsHandler                                            // 296
            };                                                                                                        // 297
          }                                                                                                           // 298
                                                                                                                      // 299
          // Registre the method                                                                                      // 300
          _methodHTTP.methodHandlers[method.name] = uniObj; // func;                                                  // 301
                                                                                                                      // 302
        }                                                                                                             // 303
      // } else {                                                                                                     // 304
      //   // We do require a function as a function to execute later                                                 // 305
      //   throw new Error('HTTP.methods failed: ' + name + ' is not a function');                                    // 306
      // }                                                                                                            // 307
    } else {                                                                                                          // 308
      // We have to follow the naming spec defined in nameFollowsConventions                                          // 309
      throw new Error('HTTP.method "' + name + '" invalid naming of method');                                         // 310
    }                                                                                                                 // 311
  });                                                                                                                 // 312
};                                                                                                                    // 313
                                                                                                                      // 314
var sendError = function(res, code, message) {                                                                        // 315
  if (code) {                                                                                                         // 316
    res.writeHead(code);                                                                                              // 317
  } else {                                                                                                            // 318
    res.writeHead(500);                                                                                               // 319
  }                                                                                                                   // 320
  res.end(message);                                                                                                   // 321
};                                                                                                                    // 322
                                                                                                                      // 323
// This handler collects the header data into either an object (if json) or the                                       // 324
// raw data. The data is passed to the callback                                                                       // 325
var requestHandler = function(req, res, callback) {                                                                   // 326
  if (typeof callback !== 'function') {                                                                               // 327
    return null;                                                                                                      // 328
  }                                                                                                                   // 329
                                                                                                                      // 330
  // Container for buffers and a sum of the length                                                                    // 331
  var bufferData = [], dataLen = 0;                                                                                   // 332
                                                                                                                      // 333
  // Extract the body                                                                                                 // 334
  req.on('data', function(data) {                                                                                     // 335
    bufferData.push(data);                                                                                            // 336
    dataLen += data.length;                                                                                           // 337
                                                                                                                      // 338
    // We have to check the data length in order to spare the server                                                  // 339
    if (dataLen > HTTP.methodsMaxDataLength) {                                                                        // 340
      dataLen = 0;                                                                                                    // 341
      bufferData = [];                                                                                                // 342
      // Flood attack or faulty client                                                                                // 343
      sendError(res, 413, 'Flood attack or faulty client');                                                           // 344
      req.connection.destroy();                                                                                       // 345
    }                                                                                                                 // 346
  });                                                                                                                 // 347
                                                                                                                      // 348
  // When message is ready to be passed on                                                                            // 349
  req.on('end', function() {                                                                                          // 350
    if (res.finished) {                                                                                               // 351
      return;                                                                                                         // 352
    }                                                                                                                 // 353
                                                                                                                      // 354
    // Allow the result to be undefined if so                                                                         // 355
    var result;                                                                                                       // 356
                                                                                                                      // 357
    // If data found the work it - either buffer or json                                                              // 358
    if (dataLen > 0) {                                                                                                // 359
      result = new Buffer(dataLen);                                                                                   // 360
      // Merge the chunks into one buffer                                                                             // 361
      for (var i = 0, ln = bufferData.length, pos = 0; i < ln; i++) {                                                 // 362
        bufferData[i].copy(result, pos);                                                                              // 363
        pos += bufferData[i].length;                                                                                  // 364
        delete bufferData[i];                                                                                         // 365
      }                                                                                                               // 366
      // Check if we could be dealing with json                                                                       // 367
      if (result[0] == 0x7b && result[1] === 0x22) {                                                                  // 368
        try {                                                                                                         // 369
          // Convert the body into json and extract the data object                                                   // 370
          result = EJSON.parse(result.toString());                                                                    // 371
        } catch(err) {                                                                                                // 372
          // Could not parse so we return the raw data                                                                // 373
        }                                                                                                             // 374
      }                                                                                                               // 375
    } // Else result will be undefined                                                                                // 376
                                                                                                                      // 377
    try {                                                                                                             // 378
      callback(result);                                                                                               // 379
    } catch(err) {                                                                                                    // 380
      sendError(res, 500, 'Error in requestHandler callback, Error: ' + (err.stack || err.message) );                 // 381
    }                                                                                                                 // 382
  });                                                                                                                 // 383
                                                                                                                      // 384
};                                                                                                                    // 385
                                                                                                                      // 386
// This is the simplest handler - it simply passes req stream as data to the                                          // 387
// method                                                                                                             // 388
var streamHandler = function(req, res, callback) {                                                                    // 389
  try {                                                                                                               // 390
    callback();                                                                                                       // 391
  } catch(err) {                                                                                                      // 392
    sendError(res, 500, 'Error in requestHandler callback, Error: ' + (err.stack || err.message) );                   // 393
  }                                                                                                                   // 394
};                                                                                                                    // 395
                                                                                                                      // 396
/*                                                                                                                    // 397
  Allow file uploads in cordova cfs                                                                                   // 398
*/                                                                                                                    // 399
var setCordovaHeaders = function(res) {                                                                               // 400
  res.setHeader("Access-Control-Allow-Origin", "http://meteor.local");                                                // 401
  res.setHeader("Access-Control-Allow-Methods", "PUT");                                                               // 402
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");                                                      // 403
};                                                                                                                    // 404
                                                                                                                      // 405
// Handle the actual connection                                                                                       // 406
WebApp.connectHandlers.use(function(req, res, next) {                                                                 // 407
                                                                                                                      // 408
  // Check to se if this is a http method call                                                                        // 409
  var method = _methodHTTP.getMethod(req._parsedUrl.pathname);                                                        // 410
                                                                                                                      // 411
  // If method is null then it wasn't and we pass the request along                                                   // 412
  if (method === null) {                                                                                              // 413
    return next();                                                                                                    // 414
  }                                                                                                                   // 415
                                                                                                                      // 416
  var dataHandle = (method.handle && method.handle.stream)?streamHandler:requestHandler;                              // 417
                                                                                                                      // 418
  dataHandle(req, res, function(data) {                                                                               // 419
    // If methodsHandler not found or somehow the methodshandler is not a                                             // 420
    // function then return a 404                                                                                     // 421
    if (typeof method.handle === 'undefined') {                                                                       // 422
      sendError(res, 404, 'Error HTTP method handler "' + method.name + '" is not found');                            // 423
      return;                                                                                                         // 424
    }                                                                                                                 // 425
                                                                                                                      // 426
    // Set CORS headers for Meteor Cordova clients                                                                    // 427
    setCordovaHeaders(res);                                                                                           // 428
                                                                                                                      // 429
    // Set fiber scope                                                                                                // 430
    var fiberScope = {                                                                                                // 431
      // Pointers to Request / Response                                                                               // 432
      req: req,                                                                                                       // 433
      res: res,                                                                                                       // 434
      // Request / Response helpers                                                                                   // 435
      statusCode: 200,                                                                                                // 436
      method: req.method,                                                                                             // 437
      // Headers for response                                                                                         // 438
      headers: {                                                                                                      // 439
        'Content-Type': 'text/html'  // Set default type                                                              // 440
      },                                                                                                              // 441
      // Arguments                                                                                                    // 442
      data: data,                                                                                                     // 443
      query: req.query,                                                                                               // 444
      params: method.params,                                                                                          // 445
      // Method reference                                                                                             // 446
      reference: method.name,                                                                                         // 447
      methodObject: method.handle,                                                                                    // 448
      _streamsWaiting: 0                                                                                              // 449
    };                                                                                                                // 450
                                                                                                                      // 451
    // Helper functions this scope                                                                                    // 452
    Fiber = Npm.require('fibers');                                                                                    // 453
    runServerMethod = Fiber(function(self) {                                                                          // 454
      var result, resultBuffer;                                                                                       // 455
                                                                                                                      // 456
      // We fetch methods data from methodsHandler, the handler uses the this.addItem()                               // 457
      // function to populate the methods, this way we have better check control and                                  // 458
      // better error handling + messages                                                                             // 459
                                                                                                                      // 460
      // The scope for the user methodObject callbacks                                                                // 461
      var thisScope = {                                                                                               // 462
        // The user whos id and token was used to run this method, if set/found                                       // 463
        userId: null,                                                                                                 // 464
        // The id of the data                                                                                         // 465
        _id: null,                                                                                                    // 466
        // Set the query params ?token=1&id=2 -> { token: 1, id: 2 }                                                  // 467
        query: self.query,                                                                                            // 468
        // Set params /foo/:name/test/:id -> { name: '', id: '' }                                                     // 469
        params: self.params,                                                                                          // 470
        // Method GET, PUT, POST, DELETE, HEAD                                                                        // 471
        method: self.method,                                                                                          // 472
        // User agent                                                                                                 // 473
        userAgent: req.headers['user-agent'],                                                                         // 474
        // All request headers                                                                                        // 475
        requestHeaders: req.headers,                                                                                  // 476
        // Add the request object it self                                                                             // 477
        request: req,                                                                                                 // 478
        // Set the userId                                                                                             // 479
        setUserId: function(id) {                                                                                     // 480
          this.userId = id;                                                                                           // 481
        },                                                                                                            // 482
        // We dont simulate / run this on the client at the moment                                                    // 483
        isSimulation: false,                                                                                          // 484
        // Run the next method in a new fiber - This is default at the moment                                         // 485
        unblock: function() {},                                                                                       // 486
        // Set the content type in header, defaults to text/html?                                                     // 487
        setContentType: function(type) {                                                                              // 488
          self.headers['Content-Type'] = type;                                                                        // 489
        },                                                                                                            // 490
        setStatusCode: function(code) {                                                                               // 491
          self.statusCode = code;                                                                                     // 492
        },                                                                                                            // 493
        addHeader: function(key, value) {                                                                             // 494
          self.headers[key] = value;                                                                                  // 495
        },                                                                                                            // 496
        createReadStream: function() {                                                                                // 497
          self._streamsWaiting++;                                                                                     // 498
          return req;                                                                                                 // 499
        },                                                                                                            // 500
        createWriteStream: function() {                                                                               // 501
          self._streamsWaiting++;                                                                                     // 502
          return res;                                                                                                 // 503
        },                                                                                                            // 504
        Error: function(err) {                                                                                        // 505
                                                                                                                      // 506
          if (err instanceof Meteor.Error) {                                                                          // 507
            // Return controlled error                                                                                // 508
            sendError(res, err.error, err.message);                                                                   // 509
          } else if (err instanceof Error) {                                                                          // 510
            // Return error trace - this is not intented                                                              // 511
            sendError(res, 503, 'Error in method "' + self.reference + '", Error: ' + (err.stack || err.message) );   // 512
          } else {                                                                                                    // 513
            sendError(res, 503, 'Error in method "' + self.reference + '"' );                                         // 514
          }                                                                                                           // 515
                                                                                                                      // 516
        },                                                                                                            // 517
        // getData: function() {                                                                                      // 518
        //   // XXX: TODO if we could run the request handler stuff eg.                                               // 519
        //   // in here in a fiber sync it could be cool - and the user did                                           // 520
        //   // not have to specify the stream=true flag?                                                             // 521
        // }                                                                                                          // 522
      };                                                                                                              // 523
                                                                                                                      // 524
      // This function sends the final response. Depending on the                                                     // 525
      // timing of the streaming, we might have to wait for all                                                       // 526
      // streaming to end, or we might have to wait for this function                                                 // 527
      // to finish after streaming ends. The checks in this function                                                  // 528
      // and the fact that we call it twice ensure that we will always                                                // 529
      // send the response if we haven't sent an error response, but                                                  // 530
      // we will not send it too early.                                                                               // 531
      function sendResponseIfDone() {                                                                                 // 532
        res.statusCode = self.statusCode;                                                                             // 533
        // If no streams are waiting                                                                                  // 534
        if (self._streamsWaiting === 0 &&                                                                             // 535
            (self.statusCode === 200 || self.statusCode === 206) &&                                                   // 536
            self.done &&                                                                                              // 537
            !self._responseSent &&                                                                                    // 538
            !res.finished) {                                                                                          // 539
          self._responseSent = true;                                                                                  // 540
          res.end(resultBuffer);                                                                                      // 541
        }                                                                                                             // 542
      }                                                                                                               // 543
                                                                                                                      // 544
      var methodCall = self.methodObject[self.method];                                                                // 545
                                                                                                                      // 546
      // If the method call is set for the POST/PUT/GET or DELETE then run the                                        // 547
      // respective methodCall if its a function                                                                      // 548
      if (typeof methodCall === 'function') {                                                                         // 549
                                                                                                                      // 550
        // Get the userId - This is either set as a method specific handler and                                       // 551
        // will allways default back to the builtin getUserId handler                                                 // 552
        try {                                                                                                         // 553
          // Try to set the userId                                                                                    // 554
          thisScope.userId = self.methodObject.auth.apply(self);                                                      // 555
        } catch(err) {                                                                                                // 556
          sendError(res, err.error, (err.message || err.stack));                                                      // 557
          return;                                                                                                     // 558
        }                                                                                                             // 559
                                                                                                                      // 560
        // This must be attached before there's any chance of `createReadStream`                                      // 561
        // or `createWriteStream` being called, which means before we do                                              // 562
        // `methodCall.apply` below.                                                                                  // 563
        req.on('end', function() {                                                                                    // 564
          self._streamsWaiting--;                                                                                     // 565
          sendResponseIfDone();                                                                                       // 566
        });                                                                                                           // 567
                                                                                                                      // 568
        // Get the result of the methodCall                                                                           // 569
        try {                                                                                                         // 570
          if (self.method === 'OPTIONS') {                                                                            // 571
            result = methodCall.apply(thisScope, [self.methodObject]) || '';                                          // 572
          } else {                                                                                                    // 573
            result = methodCall.apply(thisScope, [self.data]) || '';                                                  // 574
          }                                                                                                           // 575
        } catch(err) {                                                                                                // 576
          if (err instanceof Meteor.Error) {                                                                          // 577
            // Return controlled error                                                                                // 578
            sendError(res, err.error, err.message);                                                                   // 579
          } else {                                                                                                    // 580
            // Return error trace - this is not intented                                                              // 581
            sendError(res, 503, 'Error in method "' + self.reference + '", Error: ' + (err.stack || err.message) );   // 582
          }                                                                                                           // 583
          return;                                                                                                     // 584
        }                                                                                                             // 585
                                                                                                                      // 586
        // Set headers                                                                                                // 587
        _.each(self.headers, function(value, key) {                                                                   // 588
          // If value is defined then set the header, this allows for unsetting                                       // 589
          // the default content-type                                                                                 // 590
          if (typeof value !== 'undefined')                                                                           // 591
            res.setHeader(key, value);                                                                                // 592
        });                                                                                                           // 593
                                                                                                                      // 594
        // If OK / 200 then Return the result                                                                         // 595
        if (self.statusCode === 200 || self.statusCode === 206) {                                                     // 596
                                                                                                                      // 597
          if (self.method !== "HEAD") {                                                                               // 598
            // Return result                                                                                          // 599
            if (typeof result === 'string') {                                                                         // 600
              resultBuffer = new Buffer(result);                                                                      // 601
            } else {                                                                                                  // 602
              resultBuffer = new Buffer(JSON.stringify(result));                                                      // 603
            }                                                                                                         // 604
                                                                                                                      // 605
            // Check if user wants to overwrite content length for some reason?                                       // 606
            if (typeof self.headers['Content-Length'] === 'undefined') {                                              // 607
              self.headers['Content-Length'] = resultBuffer.length;                                                   // 608
            }                                                                                                         // 609
                                                                                                                      // 610
          }                                                                                                           // 611
                                                                                                                      // 612
          self.done = true;                                                                                           // 613
          sendResponseIfDone();                                                                                       // 614
                                                                                                                      // 615
        } else {                                                                                                      // 616
          // Allow user to alter the status code and send a message                                                   // 617
          sendError(res, self.statusCode, result);                                                                    // 618
        }                                                                                                             // 619
                                                                                                                      // 620
      } else {                                                                                                        // 621
        sendError(res, 404, 'Service not found');                                                                     // 622
      }                                                                                                               // 623
                                                                                                                      // 624
                                                                                                                      // 625
    });                                                                                                               // 626
    // Run http methods handler                                                                                       // 627
    try {                                                                                                             // 628
      runServerMethod.run(fiberScope);                                                                                // 629
    } catch(err) {                                                                                                    // 630
      sendError(res, 500, 'Error running the server http method handler, Error: ' + (err.stack || err.message));      // 631
    }                                                                                                                 // 632
                                                                                                                      // 633
  }); // EO Request handler                                                                                           // 634
                                                                                                                      // 635
                                                                                                                      // 636
});                                                                                                                   // 637
                                                                                                                      // 638
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 648
}).call(this);                                                       // 649
                                                                     // 650
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:http-methods'] = {
  HTTP: HTTP,
  _methodHTTP: _methodHTTP
};

})();

//# sourceMappingURL=cfs_http-methods.js.map
