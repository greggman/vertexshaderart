(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var URL, buildUrl;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       //
// packages/url/packages/url.js                                                          //
//                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////
                                                                                         //
(function(){                                                                             // 1
                                                                                         // 2
/////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                 //    // 4
// packages/url/url_common.js                                                      //    // 5
//                                                                                 //    // 6
/////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                   //    // 8
URL = {};                                                                          // 1  // 9
                                                                                   // 2  // 10
var encodeString = function(str) {                                                 // 3  // 11
  return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");       // 12
};                                                                                 // 5  // 13
                                                                                   // 6  // 14
                                                                                   // 7  // 15
URL._encodeParams = function(params) {                                             // 8  // 16
  var buf = [];                                                                    // 9  // 17
  _.each(params, function(value, key) {                                            // 10
    if (buf.length)                                                                // 11
      buf.push('&');                                                               // 12
    buf.push(encodeString(key), '=', encodeString(value));                         // 13
  });                                                                              // 14
  return buf.join('').replace(/%20/g, '+');                                        // 15
};                                                                                 // 16
                                                                                   // 17
                                                                                   // 18
buildUrl = function(before_qmark, from_qmark, opt_query, opt_params) {             // 19
  var url_without_query = before_qmark;                                            // 20
  var query = from_qmark ? from_qmark.slice(1) : null;                             // 21
                                                                                   // 22
  if (typeof opt_query === "string")                                               // 23
    query = String(opt_query);                                                     // 24
                                                                                   // 25
  if (opt_params) {                                                                // 26
    query = query || "";                                                           // 27
    var prms = URL._encodeParams(opt_params);                                      // 28
    if (query && prms)                                                             // 29
      query += '&';                                                                // 30
    query += prms;                                                                 // 31
  }                                                                                // 32
                                                                                   // 33
  var url = url_without_query;                                                     // 34
  if (query !== null)                                                              // 35
    url += ("?"+query);                                                            // 36
                                                                                   // 37
  return url;                                                                      // 38
};                                                                                 // 39
                                                                                   // 40
/////////////////////////////////////////////////////////////////////////////////////    // 49
                                                                                         // 50
}).call(this);                                                                           // 51
                                                                                         // 52
                                                                                         // 53
                                                                                         // 54
                                                                                         // 55
                                                                                         // 56
                                                                                         // 57
(function(){                                                                             // 58
                                                                                         // 59
/////////////////////////////////////////////////////////////////////////////////////    // 60
//                                                                                 //    // 61
// packages/url/url_server.js                                                      //    // 62
//                                                                                 //    // 63
/////////////////////////////////////////////////////////////////////////////////////    // 64
                                                                                   //    // 65
var url_util = Npm.require('url');                                                 // 1  // 66
                                                                                   // 2  // 67
URL._constructUrl = function (url, query, params) {                                // 3  // 68
  var url_parts = url_util.parse(url);                                             // 4  // 69
  return buildUrl(                                                                 // 5  // 70
    url_parts.protocol + "//" + url_parts.host + url_parts.pathname,               // 6  // 71
    url_parts.search, query, params);                                              // 7  // 72
};                                                                                 // 8  // 73
                                                                                   // 9  // 74
/////////////////////////////////////////////////////////////////////////////////////    // 75
                                                                                         // 76
}).call(this);                                                                           // 77
                                                                                         // 78
///////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.url = {
  URL: URL
};

})();

//# sourceMappingURL=url.js.map
