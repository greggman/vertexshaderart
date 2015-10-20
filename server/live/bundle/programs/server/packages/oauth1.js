(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Random = Package.random.Random;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var _ = Package.underscore._;
var check = Package.check.check;
var Match = Package.check.Match;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var OAuth1Binding, OAuth1Test;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/oauth1/packages/oauth1.js                                                                         //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
(function(){                                                                                                  // 1
                                                                                                              // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                     //     // 4
// packages/oauth1/oauth1_binding.js                                                                   //     // 5
//                                                                                                     //     // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                       //     // 8
var crypto = Npm.require("crypto");                                                                    // 1   // 9
var querystring = Npm.require("querystring");                                                          // 2   // 10
var urlModule = Npm.require("url");                                                                    // 3   // 11
                                                                                                       // 4   // 12
// An OAuth1 wrapper around http calls which helps get tokens and                                      // 5   // 13
// takes care of HTTP headers                                                                          // 6   // 14
//                                                                                                     // 7   // 15
// @param config {Object}                                                                              // 8   // 16
//   - consumerKey (String): oauth consumer key                                                        // 9   // 17
//   - secret (String): oauth consumer secret                                                          // 10  // 18
// @param urls {Object}                                                                                // 11  // 19
//   - requestToken (String): url                                                                      // 12  // 20
//   - authorize (String): url                                                                         // 13  // 21
//   - accessToken (String): url                                                                       // 14  // 22
//   - authenticate (String): url                                                                      // 15  // 23
OAuth1Binding = function(config, urls) {                                                               // 16  // 24
  this._config = config;                                                                               // 17  // 25
  this._urls = urls;                                                                                   // 18  // 26
};                                                                                                     // 19  // 27
                                                                                                       // 20  // 28
OAuth1Binding.prototype.prepareRequestToken = function(callbackUrl) {                                  // 21  // 29
  var self = this;                                                                                     // 22  // 30
                                                                                                       // 23  // 31
  var headers = self._buildHeader({                                                                    // 24  // 32
    oauth_callback: callbackUrl                                                                        // 25  // 33
  });                                                                                                  // 26  // 34
                                                                                                       // 27  // 35
  var response = self._call('POST', self._urls.requestToken, headers);                                 // 28  // 36
  var tokens = querystring.parse(response.content);                                                    // 29  // 37
                                                                                                       // 30  // 38
  if (! tokens.oauth_callback_confirmed)                                                               // 31  // 39
    throw _.extend(new Error("oauth_callback_confirmed false when requesting oauth1 token"),           // 32  // 40
                             {response: response});                                                    // 33  // 41
                                                                                                       // 34  // 42
  self.requestToken = tokens.oauth_token;                                                              // 35  // 43
  self.requestTokenSecret = tokens.oauth_token_secret;                                                 // 36  // 44
};                                                                                                     // 37  // 45
                                                                                                       // 38  // 46
OAuth1Binding.prototype.prepareAccessToken = function(query, requestTokenSecret) {                     // 39  // 47
  var self = this;                                                                                     // 40  // 48
                                                                                                       // 41  // 49
  // support implementations that use request token secrets. This is                                   // 42  // 50
  // read by self._call.                                                                               // 43  // 51
  //                                                                                                   // 44  // 52
  // XXX make it a param to call, not something stashed on self? It's                                  // 45  // 53
  // kinda confusing right now, everything except this is passed as                                    // 46  // 54
  // arguments, but this is stored.                                                                    // 47  // 55
  if (requestTokenSecret)                                                                              // 48  // 56
    self.accessTokenSecret = requestTokenSecret;                                                       // 49  // 57
                                                                                                       // 50  // 58
  var headers = self._buildHeader({                                                                    // 51  // 59
    oauth_token: query.oauth_token,                                                                    // 52  // 60
    oauth_verifier: query.oauth_verifier                                                               // 53  // 61
  });                                                                                                  // 54  // 62
                                                                                                       // 55  // 63
  var response = self._call('POST', self._urls.accessToken, headers);                                  // 56  // 64
  var tokens = querystring.parse(response.content);                                                    // 57  // 65
                                                                                                       // 58  // 66
  if (! tokens.oauth_token || ! tokens.oauth_token_secret) {                                           // 59  // 67
    var error = new Error("missing oauth token or secret");                                            // 60  // 68
    // We provide response only if no token is available, we do not want to leak any tokens            // 61  // 69
    if (! tokens.oauth_token && ! tokens.oauth_token_secret) {                                         // 62  // 70
      _.extend(error, {response: response});                                                           // 63  // 71
    }                                                                                                  // 64  // 72
    throw error;                                                                                       // 65  // 73
  }                                                                                                    // 66  // 74
                                                                                                       // 67  // 75
  self.accessToken = tokens.oauth_token;                                                               // 68  // 76
  self.accessTokenSecret = tokens.oauth_token_secret;                                                  // 69  // 77
};                                                                                                     // 70  // 78
                                                                                                       // 71  // 79
OAuth1Binding.prototype.call = function(method, url, params, callback) {                               // 72  // 80
  var self = this;                                                                                     // 73  // 81
                                                                                                       // 74  // 82
  var headers = self._buildHeader({                                                                    // 75  // 83
    oauth_token: self.accessToken                                                                      // 76  // 84
  });                                                                                                  // 77  // 85
                                                                                                       // 78  // 86
  if(! params) {                                                                                       // 79  // 87
    params = {};                                                                                       // 80  // 88
  }                                                                                                    // 81  // 89
                                                                                                       // 82  // 90
  return self._call(method, url, headers, params, callback);                                           // 83  // 91
};                                                                                                     // 84  // 92
                                                                                                       // 85  // 93
OAuth1Binding.prototype.get = function(url, params, callback) {                                        // 86  // 94
  return this.call('GET', url, params, callback);                                                      // 87  // 95
};                                                                                                     // 88  // 96
                                                                                                       // 89  // 97
OAuth1Binding.prototype.post = function(url, params, callback) {                                       // 90  // 98
  return this.call('POST', url, params, callback);                                                     // 91  // 99
};                                                                                                     // 92  // 100
                                                                                                       // 93  // 101
OAuth1Binding.prototype._buildHeader = function(headers) {                                             // 94  // 102
  var self = this;                                                                                     // 95  // 103
  return _.extend({                                                                                    // 96  // 104
    oauth_consumer_key: self._config.consumerKey,                                                      // 97  // 105
    oauth_nonce: Random.secret().replace(/\W/g, ''),                                                   // 98  // 106
    oauth_signature_method: 'HMAC-SHA1',                                                               // 99  // 107
    oauth_timestamp: (new Date().valueOf()/1000).toFixed().toString(),                                 // 100
    oauth_version: '1.0'                                                                               // 101
  }, headers);                                                                                         // 102
};                                                                                                     // 103
                                                                                                       // 104
OAuth1Binding.prototype._getSignature = function(method, url, rawHeaders, accessTokenSecret, params) {        // 113
  var self = this;                                                                                     // 106
  var headers = self._encodeHeader(_.extend({}, rawHeaders, params));                                  // 107
                                                                                                       // 108
  var parameters = _.map(headers, function(val, key) {                                                 // 109
    return key + '=' + val;                                                                            // 110
  }).sort().join('&');                                                                                 // 111
                                                                                                       // 112
  var signatureBase = [                                                                                // 113
    method,                                                                                            // 114
    self._encodeString(url),                                                                           // 115
    self._encodeString(parameters)                                                                     // 116
  ].join('&');                                                                                         // 117
                                                                                                       // 118
  var secret = OAuth.openSecret(self._config.secret);                                                  // 119
                                                                                                       // 120
  var signingKey = self._encodeString(secret) + '&';                                                   // 121
  if (accessTokenSecret)                                                                               // 122
    signingKey += self._encodeString(accessTokenSecret);                                               // 123
                                                                                                       // 124
  return crypto.createHmac('SHA1', signingKey).update(signatureBase).digest('base64');                 // 125
};                                                                                                     // 126
                                                                                                       // 127
OAuth1Binding.prototype._call = function(method, url, headers, params, callback) {                     // 128
  var self = this;                                                                                     // 129
                                                                                                       // 130
  // all URLs to be functions to support parameters/customization                                      // 131
  if(typeof url === "function") {                                                                      // 132
    url = url(self);                                                                                   // 133
  }                                                                                                    // 134
                                                                                                       // 135
  headers = headers || {};                                                                             // 136
  params = params || {};                                                                               // 137
                                                                                                       // 138
  // Extract all query string parameters from the provided URL                                         // 139
  var parsedUrl = urlModule.parse(url, true);                                                          // 140
  // Merge them in a way that params given to the method call have precedence                          // 141
  params = _.extend({}, parsedUrl.query, params);                                                      // 142
                                                                                                       // 143
  // Reconstruct the URL back without any query string parameters                                      // 144
  // (they are now in params)                                                                          // 145
  parsedUrl.query = {};                                                                                // 146
  parsedUrl.search = '';                                                                               // 147
  url = urlModule.format(parsedUrl);                                                                   // 148
                                                                                                       // 149
  // Get the signature                                                                                 // 150
  headers.oauth_signature =                                                                            // 151
    self._getSignature(method, url, headers, self.accessTokenSecret, params);                          // 152
                                                                                                       // 153
  // Make a authorization string according to oauth1 spec                                              // 154
  var authString = self._getAuthHeaderString(headers);                                                 // 155
                                                                                                       // 156
  // Make signed request                                                                               // 157
  try {                                                                                                // 158
    var response = HTTP.call(method, url, {                                                            // 159
      params: params,                                                                                  // 160
      headers: {                                                                                       // 161
        Authorization: authString                                                                      // 162
      }                                                                                                // 163
    }, callback && function (error, response) {                                                        // 164
      if (! error) {                                                                                   // 165
        response.nonce = headers.oauth_nonce;                                                          // 166
      }                                                                                                // 167
      callback(error, response);                                                                       // 168
    });                                                                                                // 169
    // We store nonce so that JWTs can be validated                                                    // 170
    if (response)                                                                                      // 171
      response.nonce = headers.oauth_nonce;                                                            // 172
    return response;                                                                                   // 173
  } catch (err) {                                                                                      // 174
    throw _.extend(new Error("Failed to send OAuth1 request to " + url + ". " + err.message),          // 175
                   {response: err.response});                                                          // 176
  }                                                                                                    // 177
};                                                                                                     // 178
                                                                                                       // 179
OAuth1Binding.prototype._encodeHeader = function(header) {                                             // 180
  var self = this;                                                                                     // 181
  return _.reduce(header, function(memo, val, key) {                                                   // 182
    memo[self._encodeString(key)] = self._encodeString(val);                                           // 183
    return memo;                                                                                       // 184
  }, {});                                                                                              // 185
};                                                                                                     // 186
                                                                                                       // 187
OAuth1Binding.prototype._encodeString = function(str) {                                                // 188
  return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");                     // 189
};                                                                                                     // 190
                                                                                                       // 191
OAuth1Binding.prototype._getAuthHeaderString = function(headers) {                                     // 192
  var self = this;                                                                                     // 193
  return 'OAuth ' +  _.map(headers, function(val, key) {                                               // 194
    return self._encodeString(key) + '="' + self._encodeString(val) + '"';                             // 195
  }).sort().join(', ');                                                                                // 196
};                                                                                                     // 197
                                                                                                       // 198
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 207
                                                                                                              // 208
}).call(this);                                                                                                // 209
                                                                                                              // 210
                                                                                                              // 211
                                                                                                              // 212
                                                                                                              // 213
                                                                                                              // 214
                                                                                                              // 215
(function(){                                                                                                  // 216
                                                                                                              // 217
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 218
//                                                                                                     //     // 219
// packages/oauth1/oauth1_server.js                                                                    //     // 220
//                                                                                                     //     // 221
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 222
                                                                                                       //     // 223
var url = Npm.require("url");                                                                          // 1   // 224
                                                                                                       // 2   // 225
// connect middleware                                                                                  // 3   // 226
OAuth._requestHandlers['1'] = function (service, query, res) {                                         // 4   // 227
  var config = ServiceConfiguration.configurations.findOne({service: service.serviceName});            // 5   // 228
  if (! config) {                                                                                      // 6   // 229
    throw new ServiceConfiguration.ConfigError(service.serviceName);                                   // 7   // 230
  }                                                                                                    // 8   // 231
                                                                                                       // 9   // 232
  var urls = service.urls;                                                                             // 10  // 233
  var oauthBinding = new OAuth1Binding(config, urls);                                                  // 11  // 234
                                                                                                       // 12  // 235
  var credentialSecret;                                                                                // 13  // 236
                                                                                                       // 14  // 237
  if (query.requestTokenAndRedirect) {                                                                 // 15  // 238
    // step 1 - get and store a request token                                                          // 16  // 239
    var callbackUrl = OAuth._redirectUri(service.serviceName, config, {                                // 17  // 240
      state: query.state,                                                                              // 18  // 241
      cordova: (query.cordova === "true"),                                                             // 19  // 242
      android: (query.android === "true")                                                              // 20  // 243
    });                                                                                                // 21  // 244
                                                                                                       // 22  // 245
    // Get a request token to start auth process                                                       // 23  // 246
    oauthBinding.prepareRequestToken(callbackUrl);                                                     // 24  // 247
                                                                                                       // 25  // 248
    // Keep track of request token so we can verify it on the next step                                // 26  // 249
    OAuth._storeRequestToken(                                                                          // 27  // 250
      OAuth._credentialTokenFromQuery(query),                                                          // 28  // 251
      oauthBinding.requestToken,                                                                       // 29  // 252
      oauthBinding.requestTokenSecret);                                                                // 30  // 253
                                                                                                       // 31  // 254
    // support for scope/name parameters                                                               // 32  // 255
    var redirectUrl = undefined;                                                                       // 33  // 256
    if(typeof urls.authenticate === "function") {                                                      // 34  // 257
      redirectUrl = urls.authenticate(oauthBinding, {                                                  // 35  // 258
        query: query                                                                                   // 36  // 259
      });                                                                                              // 37  // 260
    } else {                                                                                           // 38  // 261
      // Parse the URL to support additional query parameters in urls.authenticate                     // 39  // 262
      var redirectUrlObj = url.parse(urls.authenticate, true);                                         // 40  // 263
      redirectUrlObj.query = redirectUrlObj.query || {};                                               // 41  // 264
      redirectUrlObj.query.oauth_token = oauthBinding.requestToken;                                    // 42  // 265
      redirectUrlObj.search = '';                                                                      // 43  // 266
      // Reconstruct the URL back with provided query parameters merged with oauth_token               // 44  // 267
      redirectUrl = url.format(redirectUrlObj);                                                        // 45  // 268
    }                                                                                                  // 46  // 269
                                                                                                       // 47  // 270
    // redirect to provider login, which will redirect back to "step 2" below                          // 48  // 271
                                                                                                       // 49  // 272
    res.writeHead(302, {'Location': redirectUrl});                                                     // 50  // 273
    res.end();                                                                                         // 51  // 274
  } else {                                                                                             // 52  // 275
    // step 2, redirected from provider login - store the result                                       // 53  // 276
    // and close the window to allow the login handler to proceed                                      // 54  // 277
                                                                                                       // 55  // 278
    // Get the user's request token so we can verify it and clear it                                   // 56  // 279
    var requestTokenInfo = OAuth._retrieveRequestToken(                                                // 57  // 280
      OAuth._credentialTokenFromQuery(query));                                                         // 58  // 281
                                                                                                       // 59  // 282
    if (! requestTokenInfo) {                                                                          // 60  // 283
      throw new Error("Unable to retrieve request token");                                             // 61  // 284
    }                                                                                                  // 62  // 285
                                                                                                       // 63  // 286
    // Verify user authorized access and the oauth_token matches                                       // 64  // 287
    // the requestToken from previous step                                                             // 65  // 288
    if (query.oauth_token && query.oauth_token === requestTokenInfo.requestToken) {                    // 66  // 289
                                                                                                       // 67  // 290
      // Prepare the login results before returning.  This way the                                     // 68  // 291
      // subsequent call to the `login` method will be immediate.                                      // 69  // 292
                                                                                                       // 70  // 293
      // Get the access token for signing requests                                                     // 71  // 294
      oauthBinding.prepareAccessToken(query, requestTokenInfo.requestTokenSecret);                     // 72  // 295
                                                                                                       // 73  // 296
      // Run service-specific handler.                                                                 // 74  // 297
      var oauthResult = service.handleOauthRequest(                                                    // 75  // 298
        oauthBinding, { query: query });                                                               // 76  // 299
                                                                                                       // 77  // 300
      var credentialToken = OAuth._credentialTokenFromQuery(query);                                    // 78  // 301
      credentialSecret = Random.secret();                                                              // 79  // 302
                                                                                                       // 80  // 303
      // Store the login result so it can be retrieved in another                                      // 81  // 304
      // browser tab by the result handler                                                             // 82  // 305
      OAuth._storePendingCredential(credentialToken, {                                                 // 83  // 306
        serviceName: service.serviceName,                                                              // 84  // 307
        serviceData: oauthResult.serviceData,                                                          // 85  // 308
        options: oauthResult.options                                                                   // 86  // 309
      }, credentialSecret);                                                                            // 87  // 310
    }                                                                                                  // 88  // 311
                                                                                                       // 89  // 312
    // Either close the window, redirect, or render nothing                                            // 90  // 313
    // if all else fails                                                                               // 91  // 314
    OAuth._renderOauthResults(res, query, credentialSecret);                                           // 92  // 315
  }                                                                                                    // 93  // 316
};                                                                                                     // 94  // 317
                                                                                                       // 95  // 318
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 319
                                                                                                              // 320
}).call(this);                                                                                                // 321
                                                                                                              // 322
                                                                                                              // 323
                                                                                                              // 324
                                                                                                              // 325
                                                                                                              // 326
                                                                                                              // 327
(function(){                                                                                                  // 328
                                                                                                              // 329
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 330
//                                                                                                     //     // 331
// packages/oauth1/oauth1_pending_request_tokens.js                                                    //     // 332
//                                                                                                     //     // 333
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 334
                                                                                                       //     // 335
//                                                                                                     // 1   // 336
// _pendingRequestTokens are request tokens that have been received                                    // 2   // 337
// but not yet fully authorized (processed).                                                           // 3   // 338
//                                                                                                     // 4   // 339
// During the oauth1 authorization process, the Meteor App opens                                       // 5   // 340
// a pop-up, requests a request token from the oauth1 service, and                                     // 6   // 341
// redirects the browser to the oauth1 service for the user                                            // 7   // 342
// to grant authorization.  The user is then returned to the                                           // 8   // 343
// Meteor Apps' callback url and the request token is verified.                                        // 9   // 344
//                                                                                                     // 10  // 345
// When Meteor Apps run on multiple servers, it's possible that                                        // 11  // 346
// 2 different servers may be used to generate the request token                                       // 12  // 347
// and to verify it in the callback once the user has authorized.                                      // 13  // 348
//                                                                                                     // 14  // 349
// For this reason, the _pendingRequestTokens are stored in the database                               // 15  // 350
// so they can be shared across Meteor App servers.                                                    // 16  // 351
//                                                                                                     // 17  // 352
// XXX This code is fairly similar to oauth/pending_credentials.js --                                  // 18  // 353
// maybe we can combine them somehow.                                                                  // 19  // 354
                                                                                                       // 20  // 355
// Collection containing pending request tokens                                                        // 21  // 356
// Has key, requestToken, requestTokenSecret, and createdAt fields.                                    // 22  // 357
OAuth._pendingRequestTokens = new Mongo.Collection(                                                    // 23  // 358
  "meteor_oauth_pendingRequestTokens", {                                                               // 24  // 359
    _preventAutopublish: true                                                                          // 25  // 360
  });                                                                                                  // 26  // 361
                                                                                                       // 27  // 362
OAuth._pendingRequestTokens._ensureIndex('key', {unique: 1});                                          // 28  // 363
OAuth._pendingRequestTokens._ensureIndex('createdAt');                                                 // 29  // 364
                                                                                                       // 30  // 365
                                                                                                       // 31  // 366
                                                                                                       // 32  // 367
// Periodically clear old entries that never got completed                                             // 33  // 368
var _cleanStaleResults = function() {                                                                  // 34  // 369
  // Remove request tokens older than 5 minute                                                         // 35  // 370
  var timeCutoff = new Date();                                                                         // 36  // 371
  timeCutoff.setMinutes(timeCutoff.getMinutes() - 5);                                                  // 37  // 372
  OAuth._pendingRequestTokens.remove({ createdAt: { $lt: timeCutoff } });                              // 38  // 373
};                                                                                                     // 39  // 374
var _cleanupHandle = Meteor.setInterval(_cleanStaleResults, 60 * 1000);                                // 40  // 375
                                                                                                       // 41  // 376
                                                                                                       // 42  // 377
// Stores the key and request token in the _pendingRequestTokens collection.                           // 43  // 378
// Will throw an exception if `key` is not a string.                                                   // 44  // 379
//                                                                                                     // 45  // 380
// @param key {string}                                                                                 // 46  // 381
// @param requestToken {string}                                                                        // 47  // 382
// @param requestTokenSecret {string}                                                                  // 48  // 383
//                                                                                                     // 49  // 384
OAuth._storeRequestToken = function (key, requestToken, requestTokenSecret) {                          // 50  // 385
  check(key, String);                                                                                  // 51  // 386
                                                                                                       // 52  // 387
  // We do an upsert here instead of an insert in case the user happens                                // 53  // 388
  // to somehow send the same `state` parameter twice during an OAuth                                  // 54  // 389
  // login; we don't want a duplicate key error.                                                       // 55  // 390
  OAuth._pendingRequestTokens.upsert({                                                                 // 56  // 391
    key: key                                                                                           // 57  // 392
  }, {                                                                                                 // 58  // 393
    key: key,                                                                                          // 59  // 394
    requestToken: OAuth.sealSecret(requestToken),                                                      // 60  // 395
    requestTokenSecret: OAuth.sealSecret(requestTokenSecret),                                          // 61  // 396
    createdAt: new Date()                                                                              // 62  // 397
  });                                                                                                  // 63  // 398
};                                                                                                     // 64  // 399
                                                                                                       // 65  // 400
                                                                                                       // 66  // 401
// Retrieves and removes a request token from the _pendingRequestTokens collection                     // 67  // 402
// Returns an object containing requestToken and requestTokenSecret properties                         // 68  // 403
//                                                                                                     // 69  // 404
// @param key {string}                                                                                 // 70  // 405
//                                                                                                     // 71  // 406
OAuth._retrieveRequestToken = function (key) {                                                         // 72  // 407
  check(key, String);                                                                                  // 73  // 408
                                                                                                       // 74  // 409
  var pendingRequestToken = OAuth._pendingRequestTokens.findOne({ key: key });                         // 75  // 410
  if (pendingRequestToken) {                                                                           // 76  // 411
    OAuth._pendingRequestTokens.remove({ _id: pendingRequestToken._id });                              // 77  // 412
    return {                                                                                           // 78  // 413
      requestToken: OAuth.openSecret(pendingRequestToken.requestToken),                                // 79  // 414
      requestTokenSecret: OAuth.openSecret(                                                            // 80  // 415
        pendingRequestToken.requestTokenSecret)                                                        // 81  // 416
    };                                                                                                 // 82  // 417
  } else {                                                                                             // 83  // 418
    return undefined;                                                                                  // 84  // 419
  }                                                                                                    // 85  // 420
};                                                                                                     // 86  // 421
                                                                                                       // 87  // 422
/////////////////////////////////////////////////////////////////////////////////////////////////////////     // 423
                                                                                                              // 424
}).call(this);                                                                                                // 425
                                                                                                              // 426
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.oauth1 = {
  OAuth1Binding: OAuth1Binding,
  OAuth1Test: OAuth1Test
};

})();

//# sourceMappingURL=oauth1.js.map
