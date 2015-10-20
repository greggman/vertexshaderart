(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var Log;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
// packages/logging/packages/logging.js                                                       //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              //
(function(){                                                                                  // 1
                                                                                              // 2
/////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                     //     // 4
// packages/logging/logging.js                                                         //     // 5
//                                                                                     //     // 6
/////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                       //     // 8
Log = function () {                                                                    // 1   // 9
  return Log.info.apply(this, arguments);                                              // 2   // 10
};                                                                                     // 3   // 11
                                                                                       // 4   // 12
/// FOR TESTING                                                                        // 5   // 13
var intercept = 0;                                                                     // 6   // 14
var interceptedLines = [];                                                             // 7   // 15
var suppress = 0;                                                                      // 8   // 16
                                                                                       // 9   // 17
// Intercept the next 'count' calls to a Log function. The actual                      // 10  // 18
// lines printed to the console can be cleared and read by calling                     // 11  // 19
// Log._intercepted().                                                                 // 12  // 20
Log._intercept = function (count) {                                                    // 13  // 21
  intercept += count;                                                                  // 14  // 22
};                                                                                     // 15  // 23
                                                                                       // 16  // 24
// Suppress the next 'count' calls to a Log function. Use this to stop                 // 17  // 25
// tests from spamming the console, especially with red errors that                    // 18  // 26
// might look like a failing test.                                                     // 19  // 27
Log._suppress = function (count) {                                                     // 20  // 28
  suppress += count;                                                                   // 21  // 29
};                                                                                     // 22  // 30
                                                                                       // 23  // 31
// Returns intercepted lines and resets the intercept counter.                         // 24  // 32
Log._intercepted = function () {                                                       // 25  // 33
  var lines = interceptedLines;                                                        // 26  // 34
  interceptedLines = [];                                                               // 27  // 35
  intercept = 0;                                                                       // 28  // 36
  return lines;                                                                        // 29  // 37
};                                                                                     // 30  // 38
                                                                                       // 31  // 39
// Either 'json' or 'colored-text'.                                                    // 32  // 40
//                                                                                     // 33  // 41
// When this is set to 'json', print JSON documents that are parsed by another         // 34  // 42
// process ('satellite' or 'meteor run'). This other process should call               // 35  // 43
// 'Log.format' for nice output.                                                       // 36  // 44
//                                                                                     // 37  // 45
// When this is set to 'colored-text', call 'Log.format' before printing.              // 38  // 46
// This should be used for logging from within satellite, since there is no            // 39  // 47
// other process that will be reading its standard output.                             // 40  // 48
Log.outputFormat = 'json';                                                             // 41  // 49
                                                                                       // 42  // 50
var LEVEL_COLORS = {                                                                   // 43  // 51
  debug: 'green',                                                                      // 44  // 52
  // leave info as the default color                                                   // 45  // 53
  warn: 'magenta',                                                                     // 46  // 54
  error: 'red'                                                                         // 47  // 55
};                                                                                     // 48  // 56
                                                                                       // 49  // 57
var META_COLOR = 'blue';                                                               // 50  // 58
                                                                                       // 51  // 59
// XXX package                                                                         // 52  // 60
var RESTRICTED_KEYS = ['time', 'timeInexact', 'level', 'file', 'line',                 // 53  // 61
                        'program', 'originApp', 'satellite', 'stderr'];                // 54  // 62
                                                                                       // 55  // 63
var FORMATTED_KEYS = RESTRICTED_KEYS.concat(['app', 'message']);                       // 56  // 64
                                                                                       // 57  // 65
var logInBrowser = function (obj) {                                                    // 58  // 66
  var str = Log.format(obj);                                                           // 59  // 67
                                                                                       // 60  // 68
  // XXX Some levels should be probably be sent to the server                          // 61  // 69
  var level = obj.level;                                                               // 62  // 70
                                                                                       // 63  // 71
  if ((typeof console !== 'undefined') && console[level]) {                            // 64  // 72
    console[level](str);                                                               // 65  // 73
  } else {                                                                             // 66  // 74
    // XXX Uses of Meteor._debug should probably be replaced by Log.debug or           // 67  // 75
    //     Log.info, and we should have another name for "do your best to              // 68  // 76
    //     call call console.log".                                                     // 69  // 77
    Meteor._debug(str);                                                                // 70  // 78
  }                                                                                    // 71  // 79
};                                                                                     // 72  // 80
                                                                                       // 73  // 81
// @returns {Object: { line: Number, file: String }}                                   // 74  // 82
Log._getCallerDetails = function () {                                                  // 75  // 83
  var getStack = function () {                                                         // 76  // 84
    // We do NOT use Error.prepareStackTrace here (a V8 extension that gets us a       // 77  // 85
    // pre-parsed stack) since it's impossible to compose it with the use of           // 78  // 86
    // Error.prepareStackTrace used on the server for source maps.                     // 79  // 87
    var err = new Error;                                                               // 80  // 88
    var stack = err.stack;                                                             // 81  // 89
    return stack;                                                                      // 82  // 90
  };                                                                                   // 83  // 91
                                                                                       // 84  // 92
  var stack = getStack();                                                              // 85  // 93
                                                                                       // 86  // 94
  if (!stack) return {};                                                               // 87  // 95
                                                                                       // 88  // 96
  var lines = stack.split('\n');                                                       // 89  // 97
                                                                                       // 90  // 98
  // looking for the first line outside the logging package (or an                     // 91  // 99
  // eval if we find that first)                                                       // 92  // 100
  var line;                                                                            // 93  // 101
  for (var i = 1; i < lines.length; ++i) {                                             // 94  // 102
    line = lines[i];                                                                   // 95  // 103
    if (line.match(/^\s*at eval \(eval/)) {                                            // 96  // 104
      return {file: "eval"};                                                           // 97  // 105
    }                                                                                  // 98  // 106
                                                                                       // 99  // 107
    if (!line.match(/packages\/(?:local-test[:_])?logging(?:\/|\.js)/))                // 100
      break;                                                                           // 101
  }                                                                                    // 102
                                                                                       // 103
  var details = {};                                                                    // 104
                                                                                       // 105
  // The format for FF is 'functionName@filePath:lineNumber'                           // 106
  // The format for V8 is 'functionName (packages/logging/logging.js:81)' or           // 107
  //                      'packages/logging/logging.js:81'                             // 108
  var match = /(?:[@(]| at )([^(]+?):([0-9:]+)(?:\)|$)/.exec(line);                    // 109
  if (!match)                                                                          // 110
    return details;                                                                    // 111
  // in case the matched block here is line:column                                     // 112
  details.line = match[2].split(':')[0];                                               // 113
                                                                                       // 114
  // Possible format: https://foo.bar.com/scripts/file.js?random=foobar                // 115
  // XXX: if you can write the following in better way, please do it                   // 116
  // XXX: what about evals?                                                            // 117
  details.file = match[1].split('/').slice(-1)[0].split('?')[0];                       // 118
                                                                                       // 119
  return details;                                                                      // 120
};                                                                                     // 121
                                                                                       // 122
_.each(['debug', 'info', 'warn', 'error'], function (level) {                          // 123
  // @param arg {String|Object}                                                        // 124
  Log[level] = function (arg) {                                                        // 125
    if (suppress) {                                                                    // 126
      suppress--;                                                                      // 127
      return;                                                                          // 128
    }                                                                                  // 129
                                                                                       // 130
    var intercepted = false;                                                           // 131
    if (intercept) {                                                                   // 132
      intercept--;                                                                     // 133
      intercepted = true;                                                              // 134
    }                                                                                  // 135
                                                                                       // 136
    var obj = (_.isObject(arg) && !_.isRegExp(arg) && !_.isDate(arg) ) ?               // 137
              arg : {message: new String(arg).toString() };                            // 138
                                                                                       // 139
    _.each(RESTRICTED_KEYS, function (key) {                                           // 140
      if (obj[key])                                                                    // 141
        throw new Error("Can't set '" + key + "' in log message");                     // 142
    });                                                                                // 143
                                                                                       // 144
    if (_.has(obj, 'message') && !_.isString(obj.message))                             // 145
      throw new Error("The 'message' field in log objects must be a string");          // 146
    if (!obj.omitCallerDetails)                                                        // 147
      obj = _.extend(Log._getCallerDetails(), obj);                                    // 148
    obj.time = new Date();                                                             // 149
    obj.level = level;                                                                 // 150
                                                                                       // 151
    // XXX allow you to enable 'debug', probably per-package                           // 152
    if (level === 'debug')                                                             // 153
      return;                                                                          // 154
                                                                                       // 155
    if (intercepted) {                                                                 // 156
      interceptedLines.push(EJSON.stringify(obj));                                     // 157
    } else if (Meteor.isServer) {                                                      // 158
      if (Log.outputFormat === 'colored-text') {                                       // 159
        console.log(Log.format(obj, {color: true}));                                   // 160
      } else if (Log.outputFormat === 'json') {                                        // 161
        console.log(EJSON.stringify(obj));                                             // 162
      } else {                                                                         // 163
        throw new Error("Unknown logging output format: " + Log.outputFormat);         // 164
      }                                                                                // 165
    } else {                                                                           // 166
      logInBrowser(obj);                                                               // 167
    }                                                                                  // 168
  };                                                                                   // 169
});                                                                                    // 170
                                                                                       // 171
// tries to parse line as EJSON. returns object if parse is successful, or null if not        // 180
Log.parse = function (line) {                                                          // 173
  var obj = null;                                                                      // 174
  if (line && line.charAt(0) === '{') { // might be json generated from calling 'Log'  // 175
    try { obj = EJSON.parse(line); } catch (e) {}                                      // 176
  }                                                                                    // 177
                                                                                       // 178
  // XXX should probably check fields other than 'time'                                // 179
  if (obj && obj.time && (obj.time instanceof Date))                                   // 180
    return obj;                                                                        // 181
  else                                                                                 // 182
    return null;                                                                       // 183
};                                                                                     // 184
                                                                                       // 185
// formats a log object into colored human and machine-readable text                   // 186
Log.format = function (obj, options) {                                                 // 187
  obj = EJSON.clone(obj); // don't mutate the argument                                 // 188
  options = options || {};                                                             // 189
                                                                                       // 190
  var time = obj.time;                                                                 // 191
  if (!(time instanceof Date))                                                         // 192
    throw new Error("'time' must be a Date object");                                   // 193
  var timeInexact = obj.timeInexact;                                                   // 194
                                                                                       // 195
  // store fields that are in FORMATTED_KEYS since we strip them                       // 196
  var level = obj.level || 'info';                                                     // 197
  var file = obj.file;                                                                 // 198
  var lineNumber = obj.line;                                                           // 199
  var appName = obj.app || '';                                                         // 200
  var originApp = obj.originApp;                                                       // 201
  var message = obj.message || '';                                                     // 202
  var program = obj.program || '';                                                     // 203
  var satellite = obj.satellite;                                                       // 204
  var stderr = obj.stderr || '';                                                       // 205
                                                                                       // 206
  _.each(FORMATTED_KEYS, function(key) {                                               // 207
    delete obj[key];                                                                   // 208
  });                                                                                  // 209
                                                                                       // 210
  if (!_.isEmpty(obj)) {                                                               // 211
    if (message) message += " ";                                                       // 212
    message += EJSON.stringify(obj);                                                   // 213
  }                                                                                    // 214
                                                                                       // 215
  var pad2 = function(n) { return n < 10 ? '0' + n : n.toString(); };                  // 216
  var pad3 = function(n) { return n < 100 ? '0' + pad2(n) : n.toString(); };           // 217
                                                                                       // 218
  var dateStamp = time.getFullYear().toString() +                                      // 219
    pad2(time.getMonth() + 1 /*0-based*/) +                                            // 220
    pad2(time.getDate());                                                              // 221
  var timeStamp = pad2(time.getHours()) +                                              // 222
        ':' +                                                                          // 223
        pad2(time.getMinutes()) +                                                      // 224
        ':' +                                                                          // 225
        pad2(time.getSeconds()) +                                                      // 226
        '.' +                                                                          // 227
        pad3(time.getMilliseconds());                                                  // 228
                                                                                       // 229
  // eg in San Francisco in June this will be '(-7)'                                   // 230
  var utcOffsetStr = '(' + (-(new Date().getTimezoneOffset() / 60)) + ')';             // 231
                                                                                       // 232
  var appInfo = '';                                                                    // 233
  if (appName) appInfo += appName;                                                     // 234
  if (originApp && originApp !== appName) appInfo += ' via ' + originApp;              // 235
  if (appInfo) appInfo = '[' + appInfo + '] ';                                         // 236
                                                                                       // 237
  var sourceInfoParts = [];                                                            // 238
  if (program) sourceInfoParts.push(program);                                          // 239
  if (file) sourceInfoParts.push(file);                                                // 240
  if (lineNumber) sourceInfoParts.push(lineNumber);                                    // 241
  var sourceInfo = _.isEmpty(sourceInfoParts) ?                                        // 242
    '' : '(' + sourceInfoParts.join(':') + ') ';                                       // 243
                                                                                       // 244
  if (satellite)                                                                       // 245
    sourceInfo += ['[', satellite, ']'].join('');                                      // 246
                                                                                       // 247
  var stderrIndicator = stderr ? '(STDERR) ' : '';                                     // 248
                                                                                       // 249
  var metaPrefix = [                                                                   // 250
    level.charAt(0).toUpperCase(),                                                     // 251
    dateStamp,                                                                         // 252
    '-',                                                                               // 253
    timeStamp,                                                                         // 254
    utcOffsetStr,                                                                      // 255
    timeInexact ? '? ' : ' ',                                                          // 256
    appInfo,                                                                           // 257
    sourceInfo,                                                                        // 258
    stderrIndicator].join('');                                                         // 259
                                                                                       // 260
  var prettify = function (line, color) {                                              // 261
    return (options.color && Meteor.isServer && color) ?                               // 262
      Npm.require('cli-color')[color](line) : line;                                    // 263
  };                                                                                   // 264
                                                                                       // 265
  return prettify(metaPrefix, options.metaColor || META_COLOR) +                       // 266
    prettify(message, LEVEL_COLORS[level]);                                            // 267
};                                                                                     // 268
                                                                                       // 269
// Turn a line of text into a loggable object.                                         // 270
// @param line {String}                                                                // 271
// @param override {Object}                                                            // 272
Log.objFromText = function (line, override) {                                          // 273
  var obj = {message: line, level: "info", time: new Date(), timeInexact: true};       // 274
  return _.extend(obj, override);                                                      // 275
};                                                                                     // 276
                                                                                       // 277
/////////////////////////////////////////////////////////////////////////////////////////     // 286
                                                                                              // 287
}).call(this);                                                                                // 288
                                                                                              // 289
////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.logging = {
  Log: Log
};

})();

//# sourceMappingURL=logging.js.map
