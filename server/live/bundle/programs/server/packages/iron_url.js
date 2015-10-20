(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var compilePath, Url;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/iron_url/packages/iron_url.js                                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
(function(){                                                                                                       // 1
                                                                                                                   // 2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                          //     // 4
// packages/iron_url/lib/compiler.js                                                                        //     // 5
//                                                                                                          //     // 6
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                            //     // 8
/*                                                                                                          // 1   // 9
Based on https://github.com/pillarjs/path-to-regexp                                                         // 2   // 10
                                                                                                            // 3   // 11
The MIT License (MIT)                                                                                       // 4   // 12
                                                                                                            // 5   // 13
Copyright (c) 2014 Blake Embrey (hello@blakeembrey.com)                                                     // 6   // 14
                                                                                                            // 7   // 15
Permission is hereby granted, free of charge, to any person obtaining a copy                                // 8   // 16
of this software and associated documentation files (the "Software"), to deal                               // 9   // 17
in the Software without restriction, including without limitation the rights                                // 10  // 18
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell                                   // 11  // 19
copies of the Software, and to permit persons to whom the Software is                                       // 12  // 20
furnished to do so, subject to the following conditions:                                                    // 13  // 21
                                                                                                            // 14  // 22
The above copyright notice and this permission notice shall be included in                                  // 15  // 23
all copies or substantial portions of the Software.                                                         // 16  // 24
                                                                                                            // 17  // 25
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR                                  // 18  // 26
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,                                    // 19  // 27
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE                                 // 20  // 28
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER                                      // 21  // 29
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,                               // 22  // 30
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN                                   // 23  // 31
THE SOFTWARE.                                                                                               // 24  // 32
*/                                                                                                          // 25  // 33
                                                                                                            // 26  // 34
var typeOf = function (o) { return Object.prototype.toString.call(o); };                                    // 27  // 35
                                                                                                            // 28  // 36
/**                                                                                                         // 29  // 37
 * The main path matching regexp utility.                                                                   // 30  // 38
 *                                                                                                          // 31  // 39
 * @type {RegExp}                                                                                           // 32  // 40
 */                                                                                                         // 33  // 41
var PATH_REGEXP = new RegExp([                                                                              // 34  // 42
  // Match already escaped characters that would otherwise incorrectly appear                               // 35  // 43
  // in future matches. This allows the user to escape special characters that                              // 36  // 44
  // shouldn't be transformed.                                                                              // 37  // 45
  '(\\\\.)',                                                                                                // 38  // 46
  // Match Express-style parameters and un-named parameters with a prefix                                   // 39  // 47
  // and optional suffixes. Matches appear as:                                                              // 40  // 48
  //                                                                                                        // 41  // 49
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]                                                // 42  // 50
  // "/route(\\d+)" => [undefined, undefined, undefined, "\d+", undefined]                                  // 43  // 51
  '([\\/.])?(?:\\:(\\w+)(?:\\(((?:\\\\.|[^)])*)\\))?|\\(((?:\\\\.|[^)])*)\\))([+*?])?',                     // 44  // 52
  // Match regexp special characters that should always be escaped.                                         // 45  // 53
  '([.+*?=^!:${}()[\\]|\\/])'                                                                               // 46  // 54
].join('|'), 'g');                                                                                          // 47  // 55
                                                                                                            // 48  // 56
/**                                                                                                         // 49  // 57
 * Escape the capturing group by escaping special characters and meaning.                                   // 50  // 58
 *                                                                                                          // 51  // 59
 * @param  {String} group                                                                                   // 52  // 60
 * @return {String}                                                                                         // 53  // 61
 */                                                                                                         // 54  // 62
function escapeGroup (group) {                                                                              // 55  // 63
  return group.replace(/([=!:$\/()])/g, '\\$1');                                                            // 56  // 64
}                                                                                                           // 57  // 65
                                                                                                            // 58  // 66
/**                                                                                                         // 59  // 67
 * Attach the keys as a property of the regexp.                                                             // 60  // 68
 *                                                                                                          // 61  // 69
 * @param  {RegExp} re                                                                                      // 62  // 70
 * @param  {Array}  keys                                                                                    // 63  // 71
 * @return {RegExp}                                                                                         // 64  // 72
 */                                                                                                         // 65  // 73
var attachKeys = function (re, keys) {                                                                      // 66  // 74
  re.keys = keys;                                                                                           // 67  // 75
                                                                                                            // 68  // 76
  return re;                                                                                                // 69  // 77
};                                                                                                          // 70  // 78
                                                                                                            // 71  // 79
/**                                                                                                         // 72  // 80
 * Normalize the given path string, returning a regular expression.                                         // 73  // 81
 *                                                                                                          // 74  // 82
 * An empty array should be passed in, which will contain the placeholder key                               // 75  // 83
 * names. For example `/user/:id` will then contain `["id"]`.                                               // 76  // 84
 *                                                                                                          // 77  // 85
 * @param  {(String|RegExp|Array)} path                                                                     // 78  // 86
 * @param  {Array}                 keys                                                                     // 79  // 87
 * @param  {Object}                options                                                                  // 80  // 88
 * @return {RegExp}                                                                                         // 81  // 89
 */                                                                                                         // 82  // 90
function pathtoRegexp (path, keys, options) {                                                               // 83  // 91
  if (keys && typeOf(keys) !== '[object Array]') {                                                          // 84  // 92
    options = keys;                                                                                         // 85  // 93
    keys = null;                                                                                            // 86  // 94
  }                                                                                                         // 87  // 95
                                                                                                            // 88  // 96
  keys = keys || [];                                                                                        // 89  // 97
  options = options || {};                                                                                  // 90  // 98
                                                                                                            // 91  // 99
  var strict = options.strict;                                                                              // 92  // 100
  var end = options.end !== false;                                                                          // 93  // 101
  var flags = options.sensitive ? '' : 'i';                                                                 // 94  // 102
  var index = 0;                                                                                            // 95  // 103
                                                                                                            // 96  // 104
  if (path instanceof RegExp) {                                                                             // 97  // 105
    // Match all capturing groups of a regexp.                                                              // 98  // 106
    var groups = path.source.match(/\((?!\?)/g) || [];                                                      // 99  // 107
                                                                                                            // 100
    // Map all the matches to their numeric keys and push into the keys.                                    // 101
    keys.push.apply(keys, groups.map(function (match, index) {                                              // 102
      return {                                                                                              // 103
        name:      index,                                                                                   // 104
        delimiter: null,                                                                                    // 105
        optional:  false,                                                                                   // 106
        repeat:    false                                                                                    // 107
      };                                                                                                    // 108
    }));                                                                                                    // 109
                                                                                                            // 110
    // Return the source back to the user.                                                                  // 111
    return attachKeys(path, keys);                                                                          // 112
  }                                                                                                         // 113
                                                                                                            // 114
  if (typeOf(path) === '[object Array]') {                                                                  // 115
    // Map array parts into regexps and return their source. We also pass                                   // 116
    // the same keys and options instance into every generation to get                                      // 117
    // consistent matching groups before we join the sources together.                                      // 118
    path = path.map(function (value) {                                                                      // 119
      return pathtoRegexp(value, keys, options).source;                                                     // 120
    });                                                                                                     // 121
                                                                                                            // 122
    // Generate a new regexp instance by joining all the parts together.                                    // 123
    return attachKeys(new RegExp('(?:' + path.join('|') + ')', flags), keys);                               // 124
  }                                                                                                         // 125
                                                                                                            // 126
  // Alter the path string into a usable regexp.                                                            // 127
  path = path.replace(PATH_REGEXP, function (match, escaped, prefix, key, capture, group, suffix, escape) {        // 136
    // Avoiding re-escaping escaped characters.                                                             // 129
    if (escaped) {                                                                                          // 130
      return escaped;                                                                                       // 131
    }                                                                                                       // 132
                                                                                                            // 133
    // Escape regexp special characters.                                                                    // 134
    if (escape) {                                                                                           // 135
      return '\\' + escape;                                                                                 // 136
    }                                                                                                       // 137
                                                                                                            // 138
    var repeat   = suffix === '+' || suffix === '*';                                                        // 139
    var optional = suffix === '?' || suffix === '*';                                                        // 140
                                                                                                            // 141
    keys.push({                                                                                             // 142
      name:      key || index++,                                                                            // 143
      delimiter: prefix || '/',                                                                             // 144
      optional:  optional,                                                                                  // 145
      repeat:    repeat                                                                                     // 146
    });                                                                                                     // 147
                                                                                                            // 148
    // Escape the prefix character.                                                                         // 149
    prefix = prefix ? '\\' + prefix : '';                                                                   // 150
                                                                                                            // 151
    // Match using the custom capturing group, or fallback to capturing                                     // 152
    // everything up to the next slash (or next period if the param was                                     // 153
    // prefixed with a period).                                                                             // 154
    capture = escapeGroup(capture || group || '[^' + (prefix || '\\/') + ']+?');                            // 155
                                                                                                            // 156
    // Allow parameters to be repeated more than once.                                                      // 157
    if (repeat) {                                                                                           // 158
      capture = capture + '(?:' + prefix + capture + ')*';                                                  // 159
    }                                                                                                       // 160
                                                                                                            // 161
    // Allow a parameter to be optional.                                                                    // 162
    if (optional) {                                                                                         // 163
      return '(?:' + prefix + '(' + capture + '))?';                                                        // 164
    }                                                                                                       // 165
                                                                                                            // 166
    // Basic parameter support.                                                                             // 167
    return prefix + '(' + capture + ')';                                                                    // 168
  });                                                                                                       // 169
                                                                                                            // 170
  // Check whether the path ends in a slash as it alters some match behaviour.                              // 171
  var endsWithSlash = path[path.length - 1] === '/';                                                        // 172
                                                                                                            // 173
  // In non-strict mode we allow an optional trailing slash in the match. If                                // 174
  // the path to match already ended with a slash, we need to remove it for                                 // 175
  // consistency. The slash is only valid at the very end of a path match, not                              // 176
  // anywhere in the middle. This is important for non-ending mode, otherwise                               // 177
  // "/test/" will match "/test//route".                                                                    // 178
  if (!strict) {                                                                                            // 179
    path = (endsWithSlash ? path.slice(0, -2) : path) + '(?:\\/(?=$))?';                                    // 180
  }                                                                                                         // 181
                                                                                                            // 182
  // In non-ending mode, we need prompt the capturing groups to match as much                               // 183
  // as possible by using a positive lookahead for the end or next path segment.                            // 184
  if (!end) {                                                                                               // 185
    path += strict && endsWithSlash ? '' : '(?=\\/|$)';                                                     // 186
  }                                                                                                         // 187
                                                                                                            // 188
  return attachKeys(new RegExp('^' + path + (end ? '$' : ''), flags), keys);                                // 189
};                                                                                                          // 190
                                                                                                            // 191
compilePath = pathtoRegexp;                                                                                 // 192
                                                                                                            // 193
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 202
                                                                                                                   // 203
}).call(this);                                                                                                     // 204
                                                                                                                   // 205
                                                                                                                   // 206
                                                                                                                   // 207
                                                                                                                   // 208
                                                                                                                   // 209
                                                                                                                   // 210
(function(){                                                                                                       // 211
                                                                                                                   // 212
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 213
//                                                                                                          //     // 214
// packages/iron_url/lib/url.js                                                                             //     // 215
//                                                                                                          //     // 216
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 217
                                                                                                            //     // 218
/*****************************************************************************/                             // 1   // 219
/* Imports */                                                                                               // 2   // 220
/*****************************************************************************/                             // 3   // 221
var warn = Iron.utils.warn;                                                                                 // 4   // 222
                                                                                                            // 5   // 223
/*****************************************************************************/                             // 6   // 224
/* Url */                                                                                                   // 7   // 225
/*****************************************************************************/                             // 8   // 226
function safeDecodeURIComponent (val) {                                                                     // 9   // 227
  try {                                                                                                     // 10  // 228
    return decodeURIComponent(val.replace(/\+/g, ' '));                                                     // 11  // 229
  } catch (e) {                                                                                             // 12  // 230
    if (e.constructor == URIError) {                                                                        // 13  // 231
      warn("Tried to decode an invalid URI component: " + JSON.stringify(val) + " " + e.stack);             // 14  // 232
    }                                                                                                       // 15  // 233
                                                                                                            // 16  // 234
    return undefined;                                                                                       // 17  // 235
  }                                                                                                         // 18  // 236
}                                                                                                           // 19  // 237
                                                                                                            // 20  // 238
function safeDecodeURI (val) {                                                                              // 21  // 239
  try {                                                                                                     // 22  // 240
    return decodeURI(val.replace(/\+/g, ' '));                                                              // 23  // 241
  } catch (e) {                                                                                             // 24  // 242
    if (e.constructor == URIError) {                                                                        // 25  // 243
      warn("Tried to decode an invalid URI: " + JSON.stringify(val) + " " + e.stack);                       // 26  // 244
    }                                                                                                       // 27  // 245
                                                                                                            // 28  // 246
    return undefined;                                                                                       // 29  // 247
  }                                                                                                         // 30  // 248
}                                                                                                           // 31  // 249
                                                                                                            // 32  // 250
/**                                                                                                         // 33  // 251
 * Url utilities and the ability to compile a url into a regular expression.                                // 34  // 252
 */                                                                                                         // 35  // 253
Url = function (url, options) {                                                                             // 36  // 254
  options = options || {};                                                                                  // 37  // 255
  this.options = options;                                                                                   // 38  // 256
  this.keys = [];                                                                                           // 39  // 257
  this.regexp = compilePath(url, this.keys, options);                                                       // 40  // 258
  this._originalPath = url;                                                                                 // 41  // 259
  _.extend(this, Url.parse(url));                                                                           // 42  // 260
};                                                                                                          // 43  // 261
                                                                                                            // 44  // 262
/**                                                                                                         // 45  // 263
 * Given a relative or absolute path return                                                                 // 46  // 264
 * a relative path with a leading forward slash and                                                         // 47  // 265
 * no search string or hash fragment                                                                        // 48  // 266
 *                                                                                                          // 49  // 267
 * @param {String} path                                                                                     // 50  // 268
 * @return {String}                                                                                         // 51  // 269
 */                                                                                                         // 52  // 270
Url.normalize = function (url) {                                                                            // 53  // 271
  if (url instanceof RegExp)                                                                                // 54  // 272
    return url;                                                                                             // 55  // 273
  else if (typeof url !== 'string')                                                                         // 56  // 274
    return '/';                                                                                             // 57  // 275
                                                                                                            // 58  // 276
  var parts = Url.parse(url);                                                                               // 59  // 277
  var pathname = parts.pathname;                                                                            // 60  // 278
                                                                                                            // 61  // 279
  if (pathname.charAt(0) !== '/')                                                                           // 62  // 280
    pathname = '/' + pathname;                                                                              // 63  // 281
                                                                                                            // 64  // 282
  if (pathname.length > 1 && pathname.charAt(pathname.length - 1) === '/') {                                // 65  // 283
    pathname = pathname.slice(0, pathname.length - 1);                                                      // 66  // 284
  }                                                                                                         // 67  // 285
                                                                                                            // 68  // 286
  return pathname;                                                                                          // 69  // 287
};                                                                                                          // 70  // 288
                                                                                                            // 71  // 289
/**                                                                                                         // 72  // 290
 * Returns true if both a and b are of the same origin.                                                     // 73  // 291
 */                                                                                                         // 74  // 292
Url.isSameOrigin = function (a, b) {                                                                        // 75  // 293
  var aParts = Url.parse(a);                                                                                // 76  // 294
  var bParts = Url.parse(b);                                                                                // 77  // 295
  var result = aParts.origin === bParts.origin;                                                             // 78  // 296
  return result;                                                                                            // 79  // 297
};                                                                                                          // 80  // 298
                                                                                                            // 81  // 299
/**                                                                                                         // 82  // 300
 * Given a query string return an object of key value pairs.                                                // 83  // 301
 *                                                                                                          // 84  // 302
 * "?p1=value1&p2=value2 => {p1: value1, p2: value2}                                                        // 85  // 303
 */                                                                                                         // 86  // 304
Url.fromQueryString = function (query) {                                                                    // 87  // 305
  if (!query)                                                                                               // 88  // 306
    return {};                                                                                              // 89  // 307
                                                                                                            // 90  // 308
  if (typeof query !== 'string')                                                                            // 91  // 309
    throw new Error("expected string");                                                                     // 92  // 310
                                                                                                            // 93  // 311
  // get rid of the leading question mark                                                                   // 94  // 312
  if (query.charAt(0) === '?')                                                                              // 95  // 313
    query = query.slice(1);                                                                                 // 96  // 314
                                                                                                            // 97  // 315
  var keyValuePairs = query.split('&');                                                                     // 98  // 316
  var result = {};                                                                                          // 99  // 317
  var parts;                                                                                                // 100
                                                                                                            // 101
  _.each(keyValuePairs, function (pair) {                                                                   // 102
    var parts = pair.split('=');                                                                            // 103
    var key = parts[0];                                                                                     // 104
    var value = safeDecodeURIComponent(parts[1]);                                                           // 105
                                                                                                            // 106
    if (key.slice(-2) === '[]') {                                                                           // 107
      key = key.slice(0, -2);                                                                               // 108
      result[key] = result[key] || [];                                                                      // 109
      result[key].push(value);                                                                              // 110
    } else {                                                                                                // 111
      result[key] = value;                                                                                  // 112
    }                                                                                                       // 113
  });                                                                                                       // 114
                                                                                                            // 115
  return result;                                                                                            // 116
};                                                                                                          // 117
                                                                                                            // 118
/**                                                                                                         // 119
 * Given a query object return a query string.                                                              // 120
 */                                                                                                         // 121
Url.toQueryString = function (queryObject) {                                                                // 122
  var result = [];                                                                                          // 123
                                                                                                            // 124
  if (typeof queryObject === 'string') {                                                                    // 125
    if (queryObject.charAt(0) !== '?')                                                                      // 126
      return '?' + queryObject;                                                                             // 127
    else                                                                                                    // 128
      return queryObject;                                                                                   // 129
  }                                                                                                         // 130
                                                                                                            // 131
  _.each(queryObject, function (value, key) {                                                               // 132
    if (_.isArray(value)) {                                                                                 // 133
      _.each(value, function(valuePart) {                                                                   // 134
        result.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(valuePart));                       // 135
      });                                                                                                   // 136
    } else {                                                                                                // 137
      result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));                               // 138
    }                                                                                                       // 139
  });                                                                                                       // 140
                                                                                                            // 141
  // no sense in adding a pointless question mark                                                           // 142
  if (result.length > 0)                                                                                    // 143
    return '?' + result.join('&');                                                                          // 144
  else                                                                                                      // 145
    return '';                                                                                              // 146
};                                                                                                          // 147
                                                                                                            // 148
/**                                                                                                         // 149
 * Given a string url return an object with all of the url parts.                                           // 150
 */                                                                                                         // 151
Url.parse = function (url) {                                                                                // 152
  if (typeof url !== 'string')                                                                              // 153
    return {};                                                                                              // 154
                                                                                                            // 155
  //http://tools.ietf.org/html/rfc3986#page-50                                                              // 156
  //http://www.rfc-editor.org/errata_search.php?rfc=3986                                                    // 157
  var re = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;                                 // 158
                                                                                                            // 159
  var match = url.match(re);                                                                                // 160
                                                                                                            // 161
  var protocol = match[1] ? match[1].toLowerCase() : undefined;                                             // 162
  var hostWithSlashes = match[3];                                                                           // 163
  var slashes = !!hostWithSlashes;                                                                          // 164
  var hostWithAuth= match[4] ? match[4].toLowerCase() : undefined;                                          // 165
  var hostWithAuthParts = hostWithAuth ? hostWithAuth.split('@') : [];                                      // 166
                                                                                                            // 167
  var host, auth;                                                                                           // 168
                                                                                                            // 169
  if (hostWithAuthParts.length == 2) {                                                                      // 170
    auth = hostWithAuthParts[0];                                                                            // 171
    host = hostWithAuthParts[1];                                                                            // 172
  } else if (hostWithAuthParts.length == 1) {                                                               // 173
    host = hostWithAuthParts[0];                                                                            // 174
    auth = undefined;                                                                                       // 175
  } else {                                                                                                  // 176
    host = undefined;                                                                                       // 177
    auth = undefined;                                                                                       // 178
  }                                                                                                         // 179
                                                                                                            // 180
  var hostWithPortParts = (host && host.split(':')) || [];                                                  // 181
  var hostname = hostWithPortParts[0];                                                                      // 182
  var port = hostWithPortParts[1];                                                                          // 183
  var origin = (protocol && host) ? protocol + '//' + host : undefined;                                     // 184
  var pathname = match[5];                                                                                  // 185
  var hash = match[8];                                                                                      // 186
  var originalUrl = url;                                                                                    // 187
                                                                                                            // 188
  var search = match[6];                                                                                    // 189
                                                                                                            // 190
  var query;                                                                                                // 191
  var indexOfSearch = (hash && hash.indexOf('?')) || -1;                                                    // 192
                                                                                                            // 193
  // if we found a search string in the hash and there is no explicit search                                // 194
  // string                                                                                                 // 195
  if (~indexOfSearch && !search) {                                                                          // 196
    search = hash.slice(indexOfSearch);                                                                     // 197
    hash = hash.substr(0, indexOfSearch);                                                                   // 198
    // get rid of the ? character                                                                           // 199
    query = search.slice(1);                                                                                // 200
  } else {                                                                                                  // 201
    query = match[7];                                                                                       // 202
  }                                                                                                         // 203
                                                                                                            // 204
  var path = pathname + (search || '');                                                                     // 205
  var queryObject = Url.fromQueryString(query);                                                             // 206
                                                                                                            // 207
  var rootUrl = [                                                                                           // 208
    protocol || '',                                                                                         // 209
    slashes ? '//' : '',                                                                                    // 210
    hostWithAuth || ''                                                                                      // 211
  ].join('');                                                                                               // 212
                                                                                                            // 213
  var href = [                                                                                              // 214
    protocol || '',                                                                                         // 215
    slashes ? '//' : '',                                                                                    // 216
    hostWithAuth || '',                                                                                     // 217
    pathname || '',                                                                                         // 218
    search || '',                                                                                           // 219
    hash || ''                                                                                              // 220
  ].join('');                                                                                               // 221
                                                                                                            // 222
  return {                                                                                                  // 223
    rootUrl: rootUrl || '',                                                                                 // 224
    originalUrl: url || '',                                                                                 // 225
    href: href || '',                                                                                       // 226
    protocol: protocol || '',                                                                               // 227
    auth: auth || '',                                                                                       // 228
    host: host || '',                                                                                       // 229
    hostname: hostname || '',                                                                               // 230
    port: port || '',                                                                                       // 231
    origin: origin || '',                                                                                   // 232
    path: path || '',                                                                                       // 233
    pathname: pathname || '',                                                                               // 234
    search: search || '',                                                                                   // 235
    query: query || '',                                                                                     // 236
    queryObject: queryObject || '',                                                                         // 237
    hash: hash || '',                                                                                       // 238
    slashes: slashes                                                                                        // 239
  };                                                                                                        // 240
};                                                                                                          // 241
                                                                                                            // 242
/**                                                                                                         // 243
 * Returns true if the path matches and false otherwise.                                                    // 244
 */                                                                                                         // 245
Url.prototype.test = function (path) {                                                                      // 246
  return this.regexp.test(Url.normalize(path));                                                             // 247
};                                                                                                          // 248
                                                                                                            // 249
/**                                                                                                         // 250
 * Returns the result of calling exec on the compiled path with                                             // 251
 * the given path.                                                                                          // 252
 */                                                                                                         // 253
Url.prototype.exec = function (path) {                                                                      // 254
  return this.regexp.exec(Url.normalize(path));                                                             // 255
};                                                                                                          // 256
                                                                                                            // 257
/**                                                                                                         // 258
 * Returns an array of parameters given a path. The array may have named                                    // 259
 * properties in addition to indexed values.                                                                // 260
 */                                                                                                         // 261
Url.prototype.params = function (path) {                                                                    // 262
  if (!path)                                                                                                // 263
    return [];                                                                                              // 264
                                                                                                            // 265
  var params = [];                                                                                          // 266
  var m = this.exec(path);                                                                                  // 267
  var queryString;                                                                                          // 268
  var keys = this.keys;                                                                                     // 269
  var key;                                                                                                  // 270
  var value;                                                                                                // 271
                                                                                                            // 272
  if (!m)                                                                                                   // 273
    throw new Error('The route named "' + this.name + '" does not match the path "' + path + '"');          // 274
                                                                                                            // 275
  for (var i = 1, len = m.length; i < len; ++i) {                                                           // 276
    key = keys[i - 1];                                                                                      // 277
    value = typeof m[i] == 'string' ? safeDecodeURIComponent(m[i]) : m[i];                                  // 278
    if (key) {                                                                                              // 279
      params[key.name] = params[key.name] !== undefined ?                                                   // 280
        params[key.name] : value;                                                                           // 281
    } else                                                                                                  // 282
      params.push(value);                                                                                   // 283
  }                                                                                                         // 284
                                                                                                            // 285
  path = safeDecodeURI(path);                                                                               // 286
                                                                                                            // 287
  if (typeof path !== 'undefined') {                                                                        // 288
    queryString = path.split('?')[1];                                                                       // 289
    if (queryString)                                                                                        // 290
      queryString = queryString.split('#')[0];                                                              // 291
                                                                                                            // 292
    params.hash = path.split('#')[1] || null;                                                               // 293
    params.query = Url.fromQueryString(queryString);                                                        // 294
  }                                                                                                         // 295
                                                                                                            // 296
  return params;                                                                                            // 297
};                                                                                                          // 298
                                                                                                            // 299
Url.prototype.resolve = function (params, options) {                                                        // 300
  var value;                                                                                                // 301
  var isValueDefined;                                                                                       // 302
  var result;                                                                                               // 303
  var wildCardCount = 0;                                                                                    // 304
  var path = this._originalPath;                                                                            // 305
  var hash;                                                                                                 // 306
  var query;                                                                                                // 307
  var missingParams = [];                                                                                   // 308
  var originalParams = params;                                                                              // 309
                                                                                                            // 310
  options = options || {};                                                                                  // 311
  params = params || [];                                                                                    // 312
  query = options.query;                                                                                    // 313
  hash = options.hash && options.hash.toString();                                                           // 314
                                                                                                            // 315
  if (path instanceof RegExp) {                                                                             // 316
    throw new Error('Cannot currently resolve a regular expression path');                                  // 317
  } else {                                                                                                  // 318
    path = path                                                                                             // 319
      .replace(                                                                                             // 320
        /(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,                                                             // 321
        function (match, slash, format, key, capture, optional, offset) {                                   // 322
          slash = slash || '';                                                                              // 323
          format = format || '';                                                                            // 324
          value = params[key];                                                                              // 325
          isValueDefined = typeof value !== 'undefined';                                                    // 326
                                                                                                            // 327
          if (optional && !isValueDefined) {                                                                // 328
            value = '';                                                                                     // 329
          } else if (!isValueDefined) {                                                                     // 330
            missingParams.push(key);                                                                        // 331
            return;                                                                                         // 332
          }                                                                                                 // 333
                                                                                                            // 334
          value = _.isFunction(value) ? value.call(params) : value;                                         // 335
          var escapedValue = _.map(String(value).split('/'), function (segment) {                           // 336
            return encodeURIComponent(segment);                                                             // 337
          }).join('/');                                                                                     // 338
          return slash + format + escapedValue;                                                             // 339
        }                                                                                                   // 340
      )                                                                                                     // 341
      .replace(                                                                                             // 342
        /\*/g,                                                                                              // 343
        function (match) {                                                                                  // 344
          if (typeof params[wildCardCount] === 'undefined') {                                               // 345
            throw new Error(                                                                                // 346
              'You are trying to access a wild card parameter at index ' +                                  // 347
              wildCardCount +                                                                               // 348
              ' but the value of params at that index is undefined');                                       // 349
          }                                                                                                 // 350
                                                                                                            // 351
          var paramValue = String(params[wildCardCount++]);                                                 // 352
          return _.map(paramValue.split('/'), function (segment) {                                          // 353
            return encodeURIComponent(segment);                                                             // 354
          }).join('/');                                                                                     // 355
        }                                                                                                   // 356
      );                                                                                                    // 357
                                                                                                            // 358
    query = Url.toQueryString(query);                                                                       // 359
                                                                                                            // 360
    path = path + query;                                                                                    // 361
                                                                                                            // 362
    if (hash) {                                                                                             // 363
      hash = encodeURI(hash.replace('#', ''));                                                              // 364
      path = path + '#' + hash;                                                                             // 365
    }                                                                                                       // 366
  }                                                                                                         // 367
                                                                                                            // 368
  // Because of optional possibly empty segments we normalize path here                                     // 369
  path = path.replace(/\/+/g, '/'); // Multiple / -> one /                                                  // 370
  path = path.replace(/^(.+)\/$/g, '$1'); // Removal of trailing /                                          // 371
                                                                                                            // 372
  if (missingParams.length == 0)                                                                            // 373
    return path;                                                                                            // 374
  else if (options.throwOnMissingParams === true)                                                           // 375
    throw new Error("Missing required parameters on path " + JSON.stringify(this._originalPath) + ". The missing params are: " + JSON.stringify(missingParams) + ". The params object passed in was: " + JSON.stringify(originalParams) + ".");
  else                                                                                                      // 377
    return null;                                                                                            // 378
};                                                                                                          // 379
                                                                                                            // 380
/*****************************************************************************/                             // 381
/* Namespacing */                                                                                           // 382
/*****************************************************************************/                             // 383
Iron.Url = Url;                                                                                             // 384
                                                                                                            // 385
//////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 604
                                                                                                                   // 605
}).call(this);                                                                                                     // 606
                                                                                                                   // 607
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['iron:url'] = {};

})();

//# sourceMappingURL=iron_url.js.map
