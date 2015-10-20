(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;
var Random = Package.random.Random;
var HTTP = Package['cfs:http-methods'].HTTP;

/* Package-scope variables */
var _publishHTTP;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/cfs_http-publish/packages/cfs_http-publish.js                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
(function () {                                                                                                        // 1
                                                                                                                      // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/cfs:http-publish/http.publish.server.api.js                                                            //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
/*                                                                                                                 // 1
                                                                                                                   // 2
GET /note                                                                                                          // 3
GET /note/:id                                                                                                      // 4
POST /note                                                                                                         // 5
PUT /note/:id                                                                                                      // 6
DELETE /note/:id                                                                                                   // 7
                                                                                                                   // 8
*/                                                                                                                 // 9
                                                                                                                   // 10
// Could be cool if we could serve some api doc or even an api script                                              // 11
// user could do <script href="/note/api?token=1&user=2"></script> and be served                                   // 12
// a client-side javascript api?                                                                                   // 13
// Eg.                                                                                                             // 14
// HTTP.api.note.create();                                                                                         // 15
// HTTP.api.login(username, password);                                                                             // 16
// HTTP.api.logout                                                                                                 // 17
                                                                                                                   // 18
                                                                                                                   // 19
_publishHTTP = {};                                                                                                 // 20
                                                                                                                   // 21
// Cache the names of all http methods we've published                                                             // 22
_publishHTTP.currentlyPublished = [];                                                                              // 23
                                                                                                                   // 24
var defaultAPIPrefix = '/api/';                                                                                    // 25
                                                                                                                   // 26
/**                                                                                                                // 27
 * @method _publishHTTP.getPublishScope                                                                            // 28
 * @private                                                                                                        // 29
 * @param {Object} scope                                                                                           // 30
 * @returns {httpPublishGetPublishScope.publishScope}                                                              // 31
 *                                                                                                                 // 32
 * Creates a nice scope for the publish method                                                                     // 33
 */                                                                                                                // 34
_publishHTTP.getPublishScope = function httpPublishGetPublishScope(scope) {                                        // 35
  var publishScope = {};                                                                                           // 36
  publishScope.userId = scope.userId;                                                                              // 37
  publishScope.params = scope.params;                                                                              // 38
  publishScope.query = scope.query;                                                                                // 39
  // TODO: Additional scoping                                                                                      // 40
  // publishScope.added                                                                                            // 41
  // publishScope.ready                                                                                            // 42
  return publishScope;                                                                                             // 43
};                                                                                                                 // 44
                                                                                                                   // 45
_publishHTTP.formatHandlers = {};                                                                                  // 46
                                                                                                                   // 47
/**                                                                                                                // 48
 * @method _publishHTTP.formatHandlers.json                                                                        // 49
 * @private                                                                                                        // 50
 * @param {Object} result - The result object                                                                      // 51
 * @returns {String} JSON                                                                                          // 52
 *                                                                                                                 // 53
 * Formats the output into JSON and sets the appropriate content type on `this`                                    // 54
 */                                                                                                                // 55
_publishHTTP.formatHandlers.json = function httpPublishJSONFormatHandler(result) {                                 // 56
  // Set the method scope content type to json                                                                     // 57
  this.setContentType('application/json');                                                                         // 58
  // Return EJSON string                                                                                           // 59
  return EJSON.stringify(result);                                                                                  // 60
};                                                                                                                 // 61
                                                                                                                   // 62
/**                                                                                                                // 63
 * @method _publishHTTP.formatResult                                                                               // 64
 * @private                                                                                                        // 65
 * @param {Object} result - The result object                                                                      // 66
 * @param {Object} scope                                                                                           // 67
 * @param {String} [defaultFormat='json'] - Default format to use if format is not in query string.                // 68
 * @returns {Any} The formatted result                                                                             // 69
 *                                                                                                                 // 70
 * Formats the result into the format selected by querystring eg. "&format=json"                                   // 71
 */                                                                                                                // 72
_publishHTTP.formatResult = function httpPublishFormatResult(result, scope, defaultFormat) {                       // 73
                                                                                                                   // 74
  // Get the format in lower case and default to json                                                              // 75
  var format = scope && scope.query && scope.query.format || defaultFormat || 'json';                              // 76
                                                                                                                   // 77
  // Set the format handler found                                                                                  // 78
  var formatHandlerFound = !!(typeof _publishHTTP.formatHandlers[format] === 'function');                          // 79
                                                                                                                   // 80
  // Set the format handler and fallback to default json if handler not found                                      // 81
  var formatHandler = _publishHTTP.formatHandlers[(formatHandlerFound) ? format : 'json'];                         // 82
                                                                                                                   // 83
  // Check if format handler is a function                                                                         // 84
  if (typeof formatHandler !== 'function') {                                                                       // 85
    // We break things the user could have overwritten the default json handler                                    // 86
    throw new Error('The default json format handler not found');                                                  // 87
  }                                                                                                                // 88
                                                                                                                   // 89
  if (!formatHandlerFound) {                                                                                       // 90
    scope.setStatusCode(500);                                                                                      // 91
    return '{"error":"Format handler for: `' + format + '` not found"}';                                           // 92
  }                                                                                                                // 93
                                                                                                                   // 94
  // Execute the format handler                                                                                    // 95
  try {                                                                                                            // 96
    return formatHandler.apply(scope, [result]);                                                                   // 97
  } catch(err) {                                                                                                   // 98
    scope.setStatusCode(500);                                                                                      // 99
    return '{"error":"Format handler for: `' + format + '` Error: ' + err.message + '"}';                          // 100
  }                                                                                                                // 101
};                                                                                                                 // 102
                                                                                                                   // 103
/**                                                                                                                // 104
 * @method _publishHTTP.error                                                                                      // 105
 * @private                                                                                                        // 106
 * @param {String} statusCode - The status code                                                                    // 107
 * @param {String} message - The message                                                                           // 108
 * @param {Object} scope                                                                                           // 109
 * @returns {Any} The formatted result                                                                             // 110
 *                                                                                                                 // 111
 * Responds with error message in the expected format                                                              // 112
 */                                                                                                                // 113
_publishHTTP.error = function httpPublishError(statusCode, message, scope) {                                       // 114
  var result = _publishHTTP.formatResult(message, scope);                                                          // 115
  scope.setStatusCode(statusCode);                                                                                 // 116
  return result;                                                                                                   // 117
};                                                                                                                 // 118
                                                                                                                   // 119
/**                                                                                                                // 120
 * @method _publishHTTP.getMethodHandler                                                                           // 121
 * @private                                                                                                        // 122
 * @param {Meteor.Collection} collection - The Meteor.Collection instance                                          // 123
 * @param {String} methodName - The method name                                                                    // 124
 * @returns {Function} The server method                                                                           // 125
 *                                                                                                                 // 126
 * Returns the DDP connection handler, already setup and secured                                                   // 127
 */                                                                                                                // 128
_publishHTTP.getMethodHandler = function httpPublishGetMethodHandler(collection, methodName) {                     // 129
  if (collection instanceof Meteor.Collection) {                                                                   // 130
    if (collection._connection && collection._connection.method_handlers) {                                        // 131
      return collection._connection.method_handlers[collection._prefix + methodName];                              // 132
    } else {                                                                                                       // 133
      throw new Error('HTTP publish does not work with current version of Meteor');                                // 134
    }                                                                                                              // 135
  } else {                                                                                                         // 136
    throw new Error('_publishHTTP.getMethodHandler expected a collection');                                        // 137
  }                                                                                                                // 138
};                                                                                                                 // 139
                                                                                                                   // 140
/**                                                                                                                // 141
 * @method _publishHTTP.unpublishList                                                                              // 142
 * @private                                                                                                        // 143
 * @param {Array} names - List of method names to unpublish                                                        // 144
 * @returns {undefined}                                                                                            // 145
 *                                                                                                                 // 146
 * Unpublishes all HTTP methods that have names matching the given list.                                           // 147
 */                                                                                                                // 148
_publishHTTP.unpublishList = function httpPublishUnpublishList(names) {                                            // 149
  if (!names.length) {                                                                                             // 150
    return;                                                                                                        // 151
  }                                                                                                                // 152
                                                                                                                   // 153
  // Carry object for methods                                                                                      // 154
  var methods = {};                                                                                                // 155
                                                                                                                   // 156
  // Unpublish the rest points by setting them to false                                                            // 157
  for (var i = 0, ln = names.length; i < ln; i++) {                                                                // 158
    methods[names[i]] = false;                                                                                     // 159
  }                                                                                                                // 160
                                                                                                                   // 161
  HTTP.methods(methods);                                                                                           // 162
                                                                                                                   // 163
  // Remove the names from our list of currently published methods                                                 // 164
  _publishHTTP.currentlyPublished = _.difference(_publishHTTP.currentlyPublished, names);                          // 165
};                                                                                                                 // 166
                                                                                                                   // 167
/**                                                                                                                // 168
 * @method _publishHTTP.unpublish                                                                                  // 169
 * @private                                                                                                        // 170
 * @param {String|Meteor.Collection} [name] - The method name or collection                                        // 171
 * @returns {undefined}                                                                                            // 172
 *                                                                                                                 // 173
 * Unpublishes all HTTP methods that were published with the given name or                                         // 174
 * for the given collection. Call with no arguments to unpublish all.                                              // 175
 */                                                                                                                // 176
_publishHTTP.unpublish = function httpPublishUnpublish(/* name or collection, options */) {                        // 177
                                                                                                                   // 178
  // Determine what method name we're unpublishing                                                                 // 179
  var name = (arguments[0] instanceof Meteor.Collection) ?                                                         // 180
          defaultAPIPrefix + arguments[0]._name : arguments[0];                                                    // 181
                                                                                                                   // 182
  // Unpublish name and name/id                                                                                    // 183
  if (name && name.length) {                                                                                       // 184
    _publishHTTP.unpublishList([name, name + '/:id']);                                                             // 185
  }                                                                                                                // 186
                                                                                                                   // 187
  // If no args, unpublish all                                                                                     // 188
  else {                                                                                                           // 189
    _publishHTTP.unpublishList(_publishHTTP.currentlyPublished);                                                   // 190
  }                                                                                                                // 191
                                                                                                                   // 192
};                                                                                                                 // 193
                                                                                                                   // 194
/**                                                                                                                // 195
 * @method HTTP.publishFormats                                                                                     // 196
 * @public                                                                                                         // 197
 * @param {Object} newHandlers                                                                                     // 198
 * @returns {undefined}                                                                                            // 199
 *                                                                                                                 // 200
 * Add publish formats. Example:                                                                                   // 201
 ```js                                                                                                             // 202
 HTTP.publishFormats({                                                                                             // 203
                                                                                                                   // 204
    json: function(inputObject) {                                                                                  // 205
      // Set the method scope content type to json                                                                 // 206
      this.setContentType('application/json');                                                                     // 207
      // Return EJSON string                                                                                       // 208
      return EJSON.stringify(inputObject);                                                                         // 209
    }                                                                                                              // 210
                                                                                                                   // 211
  });                                                                                                              // 212
 ```                                                                                                               // 213
 */                                                                                                                // 214
HTTP.publishFormats = function httpPublishFormats(newHandlers) {                                                   // 215
  _.extend(_publishHTTP.formatHandlers, newHandlers);                                                              // 216
};                                                                                                                 // 217
                                                                                                                   // 218
/**                                                                                                                // 219
 * @method HTTP.publish                                                                                            // 220
 * @public                                                                                                         // 221
 * @param {Object} options                                                                                         // 222
 * @param {String} [name] - Restpoint name (url prefix). Optional if `collection` is passed. Will mount on `/api/collectionName` by default.
 * @param {Meteor.Collection} [collection] - Meteor.Collection instance. Required for all restpoints except collectionGet
 * @param {String} [options.defaultFormat='json'] - Format to use for responses when `format` is not found in the query string.
 * @param {String} [options.collectionGet=true] - Add GET restpoint for collection? Requires a publish function.   // 226
 * @param {String} [options.collectionPost=true] - Add POST restpoint for adding documents to the collection?      // 227
 * @param {String} [options.documentGet=true] - Add GET restpoint for documents in collection? Requires a publish function.
 * @param {String} [options.documentPut=true] - Add PUT restpoint for updating a document in the collection?       // 229
 * @param {String} [options.documentDelete=true] - Add DELETE restpoint for deleting a document in the collection? // 230
 * @param {Function} [publishFunc] - A publish function. Required to mount GET restpoints.                         // 231
 * @returns {undefined}                                                                                            // 232
 * @todo this should use options argument instead of optional args                                                 // 233
 *                                                                                                                 // 234
 * Publishes one or more restpoints, mounted on "name" ("/api/collectionName/"                                     // 235
 * by default). The GET restpoints are subscribed to the document set (cursor)                                     // 236
 * returned by the publish function you supply. The other restpoints forward                                       // 237
 * requests to Meteor's built-in DDP methods (insert, update, remove), meaning                                     // 238
 * that full allow/deny security is automatic.                                                                     // 239
 *                                                                                                                 // 240
 * __Usage:__                                                                                                      // 241
 *                                                                                                                 // 242
 * Publish only:                                                                                                   // 243
 *                                                                                                                 // 244
 * HTTP.publish({name: 'mypublish'}, publishFunc);                                                                 // 245
 *                                                                                                                 // 246
 * Publish and mount crud rest point for collection /api/myCollection:                                             // 247
 *                                                                                                                 // 248
 * HTTP.publish({collection: myCollection}, publishFunc);                                                          // 249
 *                                                                                                                 // 250
 * Mount CUD rest point for collection and documents without GET:                                                  // 251
 *                                                                                                                 // 252
 * HTTP.publish({collection: myCollection});                                                                       // 253
 *                                                                                                                 // 254
 */                                                                                                                // 255
HTTP.publish = function httpPublish(options, publishFunc) {                                                        // 256
  options = _.extend({                                                                                             // 257
    name: null,                                                                                                    // 258
    auth: null,                                                                                                    // 259
    collection: null,                                                                                              // 260
    defaultFormat: null,                                                                                           // 261
    collectionGet: true,                                                                                           // 262
    collectionPost: true,                                                                                          // 263
    documentGet: true,                                                                                             // 264
    documentPut: true,                                                                                             // 265
    documentDelete: true                                                                                           // 266
  }, options || {});                                                                                               // 267
                                                                                                                   // 268
  var collection = options.collection;                                                                             // 269
                                                                                                                   // 270
  // Use provided name or build one                                                                                // 271
  var name = (typeof options.name === "string") ? options.name : defaultAPIPrefix + collection._name;              // 272
                                                                                                                   // 273
  // Make sure we have a name                                                                                      // 274
  if (typeof name !== "string") {                                                                                  // 275
    throw new Error('HTTP.publish expected a collection or name option');                                          // 276
  }                                                                                                                // 277
                                                                                                                   // 278
  var defaultFormat = options.defaultFormat;                                                                       // 279
                                                                                                                   // 280
  // Rig the methods for the CRUD interface                                                                        // 281
  var methods = {};                                                                                                // 282
                                                                                                                   // 283
  // console.log('HTTP restpoint: ' + name);                                                                       // 284
                                                                                                                   // 285
  // list and create                                                                                               // 286
  methods[name] = {};                                                                                              // 287
                                                                                                                   // 288
  if (options.collectionGet && publishFunc) {                                                                      // 289
    // Return the published documents                                                                              // 290
    methods[name].get = function(data) {                                                                           // 291
      // Format the scope for the publish method                                                                   // 292
      var publishScope = _publishHTTP.getPublishScope(this);                                                       // 293
      // Get the publish cursor                                                                                    // 294
      var cursor = publishFunc.apply(publishScope, [data]);                                                        // 295
                                                                                                                   // 296
      // Check if its a cursor                                                                                     // 297
      if (cursor && cursor.fetch) {                                                                                // 298
        // Fetch the data fron cursor                                                                              // 299
        var result = cursor.fetch();                                                                               // 300
        // Return the data                                                                                         // 301
        return _publishHTTP.formatResult(result, this, defaultFormat);                                             // 302
      } else {                                                                                                     // 303
        // We didnt get any                                                                                        // 304
        return _publishHTTP.error(200, [], this);                                                                  // 305
      }                                                                                                            // 306
    };                                                                                                             // 307
  }                                                                                                                // 308
                                                                                                                   // 309
  if (collection) {                                                                                                // 310
    // If we have a collection then add insert method                                                              // 311
    if (options.collectionPost) {                                                                                  // 312
      methods[name].post = function(data) {                                                                        // 313
        var insertMethodHandler = _publishHTTP.getMethodHandler(collection, 'insert');                             // 314
        // Make sure that _id isset else create a Meteor id                                                        // 315
        data._id = data._id || Random.id();                                                                        // 316
        // Create the document                                                                                     // 317
        try {                                                                                                      // 318
          // We should be passed a document in data                                                                // 319
          insertMethodHandler.apply(this, [data]);                                                                 // 320
          // Return the data                                                                                       // 321
          return _publishHTTP.formatResult({ _id: data._id }, this, defaultFormat);                                // 322
        } catch(err) {                                                                                             // 323
          // This would be a Meteor.error?                                                                         // 324
          return _publishHTTP.error(err.error, { error: err.message }, this);                                      // 325
        }                                                                                                          // 326
      };                                                                                                           // 327
    }                                                                                                              // 328
                                                                                                                   // 329
    // We also add the findOne, update and remove methods                                                          // 330
    methods[name + '/:id'] = {};                                                                                   // 331
                                                                                                                   // 332
    if (options.documentGet && publishFunc) {                                                                      // 333
      // We have to have a publish method inorder to publish id? The user could                                    // 334
      // just write a publish all if needed - better to make this explicit                                         // 335
      methods[name + '/:id'].get = function(data) {                                                                // 336
        // Get the mongoId                                                                                         // 337
        var mongoId = this.params.id;                                                                              // 338
                                                                                                                   // 339
        // We would allways expect a string but it could be empty                                                  // 340
        if (mongoId !== '') {                                                                                      // 341
                                                                                                                   // 342
          // Format the scope for the publish method                                                               // 343
          var publishScope = _publishHTTP.getPublishScope(this);                                                   // 344
                                                                                                                   // 345
          // Get the publish cursor                                                                                // 346
          var cursor = publishFunc.apply(publishScope, [data]);                                                    // 347
                                                                                                                   // 348
          // Result will contain the document if found                                                             // 349
          var result;                                                                                              // 350
                                                                                                                   // 351
          // Check to see if document is in published cursor                                                       // 352
          if (cursor) {                                                                                            // 353
            cursor.forEach(function(doc) {                                                                         // 354
              if (!result) {                                                                                       // 355
                if (doc._id === mongoId) {                                                                         // 356
                  result = doc;                                                                                    // 357
                }                                                                                                  // 358
              }                                                                                                    // 359
            });                                                                                                    // 360
          }                                                                                                        // 361
                                                                                                                   // 362
          // If the document is found the return                                                                   // 363
          if (result) {                                                                                            // 364
            return _publishHTTP.formatResult(result, this, defaultFormat);                                         // 365
          } else {                                                                                                 // 366
            // We do a check to see if the doc id exists                                                           // 367
            var exists = collection.findOne({ _id: mongoId });                                                     // 368
            // If it exists its not published to the user                                                          // 369
            if (exists) {                                                                                          // 370
              // Unauthorized                                                                                      // 371
              return _publishHTTP.error(401, { error: 'Unauthorized' }, this);                                     // 372
            } else {                                                                                               // 373
              // Not found                                                                                         // 374
              return _publishHTTP.error(404, { error: 'Document with id ' + mongoId + ' not found' }, this);       // 375
            }                                                                                                      // 376
          }                                                                                                        // 377
                                                                                                                   // 378
        } else {                                                                                                   // 379
          return _publishHTTP.error(400, { error: 'Method expected a document id' }, this);                        // 380
        }                                                                                                          // 381
      };                                                                                                           // 382
    }                                                                                                              // 383
                                                                                                                   // 384
    if (options.documentPut) {                                                                                     // 385
      methods[name + '/:id'].put = function(data) {                                                                // 386
        // Get the mongoId                                                                                         // 387
        var mongoId = this.params.id;                                                                              // 388
                                                                                                                   // 389
        // We would allways expect a string but it could be empty                                                  // 390
        if (mongoId !== '') {                                                                                      // 391
                                                                                                                   // 392
          var updateMethodHandler = _publishHTTP.getMethodHandler(collection, 'update');                           // 393
          // Create the document                                                                                   // 394
          try {                                                                                                    // 395
            // We should be passed a document in data                                                              // 396
            updateMethodHandler.apply(this, [{ _id: mongoId }, data]);                                             // 397
            // Return the data                                                                                     // 398
            return _publishHTTP.formatResult({ _id: mongoId }, this, defaultFormat);                               // 399
          } catch(err) {                                                                                           // 400
            // This would be a Meteor.error?                                                                       // 401
            return _publishHTTP.error(err.error, { error: err.message }, this);                                    // 402
          }                                                                                                        // 403
                                                                                                                   // 404
        } else {                                                                                                   // 405
          return _publishHTTP.error(400, { error: 'Method expected a document id' }, this);                        // 406
        }                                                                                                          // 407
      };                                                                                                           // 408
    }                                                                                                              // 409
                                                                                                                   // 410
    if (options.documentDelete) {                                                                                  // 411
      methods[name + '/:id'].delete = function(data) {                                                             // 412
         // Get the mongoId                                                                                        // 413
        var mongoId = this.params.id;                                                                              // 414
                                                                                                                   // 415
        // We would allways expect a string but it could be empty                                                  // 416
        if (mongoId !== '') {                                                                                      // 417
                                                                                                                   // 418
          var removeMethodHandler = _publishHTTP.getMethodHandler(collection, 'remove');                           // 419
          // Create the document                                                                                   // 420
          try {                                                                                                    // 421
            // We should be passed a document in data                                                              // 422
            removeMethodHandler.apply(this, [{ _id: mongoId }]);                                                   // 423
            // Return the data                                                                                     // 424
            return _publishHTTP.formatResult({ _id: mongoId }, this, defaultFormat);                               // 425
          } catch(err) {                                                                                           // 426
            // This would be a Meteor.error?                                                                       // 427
            return _publishHTTP.error(err.error, { error: err.message }, this);                                    // 428
          }                                                                                                        // 429
                                                                                                                   // 430
        } else {                                                                                                   // 431
          return _publishHTTP.error(400, { error: 'Method expected a document id' }, this);                        // 432
        }                                                                                                          // 433
      };                                                                                                           // 434
    }                                                                                                              // 435
                                                                                                                   // 436
  }                                                                                                                // 437
                                                                                                                   // 438
  // Authenticate with our own auth method: https://github.com/CollectionFS/Meteor-http-methods#authentication     // 439
  if (options.auth) {                                                                                              // 440
    if (methods[name]) {                                                                                           // 441
      methods[name].auth = options.auth;                                                                           // 442
    }                                                                                                              // 443
    if (methods[name + '/:id']) {                                                                                  // 444
      methods[name + '/:id'].auth = options.auth;                                                                  // 445
    }                                                                                                              // 446
  }                                                                                                                // 447
                                                                                                                   // 448
  // Publish the methods                                                                                           // 449
  HTTP.methods(methods);                                                                                           // 450
                                                                                                                   // 451
  // Mark these method names as currently published                                                                // 452
  _publishHTTP.currentlyPublished = _.union(_publishHTTP.currentlyPublished, _.keys(methods));                     // 453
                                                                                                                   // 454
}; // EO Publish                                                                                                   // 455
                                                                                                                   // 456
/**                                                                                                                // 457
 * @method HTTP.unpublish                                                                                          // 458
 * @public                                                                                                         // 459
 * @param {String|Meteor.Collection} [name] - The method name or collection                                        // 460
 * @returns {undefined}                                                                                            // 461
 *                                                                                                                 // 462
 * Unpublishes all HTTP methods that were published with the given name or                                         // 463
 * for the given collection. Call with no arguments to unpublish all.                                              // 464
 */                                                                                                                // 465
HTTP.unpublish = _publishHTTP.unpublish;                                                                           // 466
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 476
}).call(this);                                                                                                        // 477
                                                                                                                      // 478
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:http-publish'] = {
  _publishHTTP: _publishHTTP
};

})();

//# sourceMappingURL=cfs_http-publish.js.map
