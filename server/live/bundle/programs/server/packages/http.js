(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var URL = Package.url.URL;

/* Package-scope variables */
var makeErrorByStatus, populateData, HTTP, HTTPInternals;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/http/packages/http.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
(function(){                                                                                                           // 1
                                                                                                                       // 2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/http/httpcall_common.js                                                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
makeErrorByStatus = function(statusCode, content) {                                                                 // 1
  var MAX_LENGTH = 500; // if you change this, also change the appropriate test                                     // 2
                                                                                                                    // 3
  var truncate = function(str, length) {                                                                            // 4
    return str.length > length ? str.slice(0, length) + '...' : str;                                                // 5
  };                                                                                                                // 6
                                                                                                                    // 7
  var contentToCheck = typeof content == "string" ? content : content.toString();                                   // 8
                                                                                                                    // 9
  var message = "failed [" + statusCode + "]";                                                                      // 10
                                                                                                                    // 11
  if (contentToCheck) {                                                                                             // 12
    message += " " + truncate(contentToCheck.replace(/\n/g, " "), MAX_LENGTH);                                      // 13
  }                                                                                                                 // 14
                                                                                                                    // 15
  return new Error(message);                                                                                        // 16
};                                                                                                                  // 17
                                                                                                                    // 18
                                                                                                                    // 19
// Fill in `response.data` if the content-type is JSON.                                                             // 20
populateData = function(response) {                                                                                 // 21
  // Read Content-Type header, up to a ';' if there is one.                                                         // 22
  // A typical header might be "application/json; charset=utf-8"                                                    // 23
  // or just "application/json".                                                                                    // 24
  var contentType = (response.headers['content-type'] || ';').split(';')[0];                                        // 25
                                                                                                                    // 26
  // Only try to parse data as JSON if server sets correct content type.                                            // 27
  if (_.include(['application/json', 'text/javascript',                                                             // 28
      'application/javascript', 'application/x-javascript'], contentType)) {                                        // 29
    try {                                                                                                           // 30
      response.data = JSON.parse(response.content);                                                                 // 31
    } catch (err) {                                                                                                 // 32
      response.data = null;                                                                                         // 33
    }                                                                                                               // 34
  } else {                                                                                                          // 35
    response.data = null;                                                                                           // 36
  }                                                                                                                 // 37
};                                                                                                                  // 38
                                                                                                                    // 39
HTTP = {};                                                                                                          // 40
                                                                                                                    // 41
/**                                                                                                                 // 42
 * @summary Send an HTTP `GET` request. Equivalent to calling [`HTTP.call`](#http_call) with "GET" as the first argument.
 * @param {String} url The URL to which the request should be sent.                                                 // 44
 * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    // 45
 * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.    // 54
 * @locus Anywhere                                                                                                  // 47
 */                                                                                                                 // 48
HTTP.get = function (/* varargs */) {                                                                               // 49
  return HTTP.call.apply(this, ["GET"].concat(_.toArray(arguments)));                                               // 50
};                                                                                                                  // 51
                                                                                                                    // 52
/**                                                                                                                 // 53
 * @summary Send an HTTP `POST` request. Equivalent to calling [`HTTP.call`](#http_call) with "POST" as the first argument.
 * @param {String} url The URL to which the request should be sent.                                                 // 55
 * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    // 56
 * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.    // 65
 * @locus Anywhere                                                                                                  // 58
 */                                                                                                                 // 59
HTTP.post = function (/* varargs */) {                                                                              // 60
  return HTTP.call.apply(this, ["POST"].concat(_.toArray(arguments)));                                              // 61
};                                                                                                                  // 62
                                                                                                                    // 63
/**                                                                                                                 // 64
 * @summary Send an HTTP `PUT` request. Equivalent to calling [`HTTP.call`](#http_call) with "PUT" as the first argument.
 * @param {String} url The URL to which the request should be sent.                                                 // 66
 * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    // 67
 * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.    // 76
 * @locus Anywhere                                                                                                  // 69
 */                                                                                                                 // 70
HTTP.put = function (/* varargs */) {                                                                               // 71
  return HTTP.call.apply(this, ["PUT"].concat(_.toArray(arguments)));                                               // 72
};                                                                                                                  // 73
                                                                                                                    // 74
/**                                                                                                                 // 75
 * @summary Send an HTTP `DELETE` request. Equivalent to calling [`HTTP.call`](#http_call) with "DELETE" as the first argument. (Named `del` to avoid conflic with the Javascript keyword `delete`)
 * @param {String} url The URL to which the request should be sent.                                                 // 77
 * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    // 78
 * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client.    // 87
 * @locus Anywhere                                                                                                  // 80
 */                                                                                                                 // 81
HTTP.del = function (/* varargs */) {                                                                               // 82
  return HTTP.call.apply(this, ["DELETE"].concat(_.toArray(arguments)));                                            // 83
};                                                                                                                  // 84
                                                                                                                    // 85
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 95
}).call(this);                                                                                                         // 96
                                                                                                                       // 97
                                                                                                                       // 98
                                                                                                                       // 99
                                                                                                                       // 100
                                                                                                                       // 101
                                                                                                                       // 102
(function(){                                                                                                           // 103
                                                                                                                       // 104
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/http/httpcall_server.js                                                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var path = Npm.require('path');                                                                                     // 1
var request = Npm.require('request');                                                                               // 2
var url_util = Npm.require('url');                                                                                  // 3
                                                                                                                    // 4
HTTPInternals = {                                                                                                   // 5
  NpmModules: {                                                                                                     // 6
    request: {                                                                                                      // 7
      version: Npm.require('request/package.json').version,                                                         // 8
      module: request                                                                                               // 9
    }                                                                                                               // 10
  }                                                                                                                 // 11
};                                                                                                                  // 12
                                                                                                                    // 13
// _call always runs asynchronously; HTTP.call, defined below,                                                      // 14
// wraps _call and runs synchronously when no callback is provided.                                                 // 15
var _call = function(method, url, options, callback) {                                                              // 16
                                                                                                                    // 17
  ////////// Process arguments //////////                                                                           // 18
                                                                                                                    // 19
  if (! callback && typeof options === "function") {                                                                // 20
    // support (method, url, callback) argument list                                                                // 21
    callback = options;                                                                                             // 22
    options = null;                                                                                                 // 23
  }                                                                                                                 // 24
                                                                                                                    // 25
  options = options || {};                                                                                          // 26
                                                                                                                    // 27
  if (_.has(options, 'beforeSend')) {                                                                               // 28
    throw new Error("Option beforeSend not supported on server.");                                                  // 29
  }                                                                                                                 // 30
                                                                                                                    // 31
  method = (method || "").toUpperCase();                                                                            // 32
                                                                                                                    // 33
  if (! /^https?:\/\//.test(url))                                                                                   // 34
    throw new Error("url must be absolute and start with http:// or https://");                                     // 35
                                                                                                                    // 36
  var headers = {};                                                                                                 // 37
                                                                                                                    // 38
  var content = options.content;                                                                                    // 39
  if (options.data) {                                                                                               // 40
    content = JSON.stringify(options.data);                                                                         // 41
    headers['Content-Type'] = 'application/json';                                                                   // 42
  }                                                                                                                 // 43
                                                                                                                    // 44
                                                                                                                    // 45
  var paramsForUrl, paramsForBody;                                                                                  // 46
  if (content || method === "GET" || method === "HEAD")                                                             // 47
    paramsForUrl = options.params;                                                                                  // 48
  else                                                                                                              // 49
    paramsForBody = options.params;                                                                                 // 50
                                                                                                                    // 51
  var newUrl = URL._constructUrl(url, options.query, paramsForUrl);                                                 // 52
                                                                                                                    // 53
  if (options.auth) {                                                                                               // 54
    if (options.auth.indexOf(':') < 0)                                                                              // 55
      throw new Error('auth option should be of the form "username:password"');                                     // 56
    headers['Authorization'] = "Basic "+                                                                            // 57
      (new Buffer(options.auth, "ascii")).toString("base64");                                                       // 58
  }                                                                                                                 // 59
                                                                                                                    // 60
  if (paramsForBody) {                                                                                              // 61
    content = URL._encodeParams(paramsForBody);                                                                     // 62
    headers['Content-Type'] = "application/x-www-form-urlencoded";                                                  // 63
  }                                                                                                                 // 64
                                                                                                                    // 65
  _.extend(headers, options.headers || {});                                                                         // 66
                                                                                                                    // 67
  // wrap callback to add a 'response' property on an error, in case                                                // 68
  // we have both (http 4xx/5xx error, which has a response payload)                                                // 69
  callback = (function(callback) {                                                                                  // 70
    return function(error, response) {                                                                              // 71
      if (error && response)                                                                                        // 72
        error.response = response;                                                                                  // 73
      callback(error, response);                                                                                    // 74
    };                                                                                                              // 75
  })(callback);                                                                                                     // 76
                                                                                                                    // 77
  // safety belt: only call the callback once.                                                                      // 78
  callback = _.once(callback);                                                                                      // 79
                                                                                                                    // 80
                                                                                                                    // 81
  ////////// Kickoff! //////////                                                                                    // 82
                                                                                                                    // 83
  // Allow users to override any request option with the npmRequestOptions                                          // 84
  // option.                                                                                                        // 85
  var reqOptions = _.extend({                                                                                       // 86
    url: newUrl,                                                                                                    // 87
    method: method,                                                                                                 // 88
    encoding: "utf8",                                                                                               // 89
    jar: false,                                                                                                     // 90
    timeout: options.timeout,                                                                                       // 91
    body: content,                                                                                                  // 92
    followRedirect: options.followRedirects,                                                                        // 93
    // Follow redirects on non-GET requests                                                                         // 94
    // also. (https://github.com/meteor/meteor/issues/2808)                                                         // 95
    followAllRedirects: options.followRedirects,                                                                    // 96
    headers: headers                                                                                                // 97
  }, options.npmRequestOptions || {});                                                                              // 98
                                                                                                                    // 99
  request(reqOptions, function(error, res, body) {                                                                  // 100
    var response = null;                                                                                            // 101
                                                                                                                    // 102
    if (! error) {                                                                                                  // 103
                                                                                                                    // 104
      response = {};                                                                                                // 105
      response.statusCode = res.statusCode;                                                                         // 106
      response.content = body;                                                                                      // 107
      response.headers = res.headers;                                                                               // 108
                                                                                                                    // 109
      populateData(response);                                                                                       // 110
                                                                                                                    // 111
      if (response.statusCode >= 400)                                                                               // 112
        error = makeErrorByStatus(response.statusCode, response.content);                                           // 113
    }                                                                                                               // 114
                                                                                                                    // 115
    callback(error, response);                                                                                      // 116
                                                                                                                    // 117
  });                                                                                                               // 118
};                                                                                                                  // 119
                                                                                                                    // 120
HTTP.call = Meteor.wrapAsync(_call);                                                                                // 121
                                                                                                                    // 122
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 234
}).call(this);                                                                                                         // 235
                                                                                                                       // 236
                                                                                                                       // 237
                                                                                                                       // 238
                                                                                                                       // 239
                                                                                                                       // 240
                                                                                                                       // 241
(function(){                                                                                                           // 242
                                                                                                                       // 243
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/http/deprecated.js                                                                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// The HTTP object used to be called Meteor.http.                                                                   // 1
// XXX COMPAT WITH 0.6.4                                                                                            // 2
Meteor.http = HTTP;                                                                                                 // 3
                                                                                                                    // 4
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 255
}).call(this);                                                                                                         // 256
                                                                                                                       // 257
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.http = {
  HTTP: HTTP,
  HTTPInternals: HTTPInternals
};

})();

//# sourceMappingURL=http.js.map
