(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var check, Match;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/check/packages/check.js                                                                        //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
(function(){                                                                                               // 1
                                                                                                           // 2
//////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                  //     // 4
// packages/check/match.js                                                                          //     // 5
//                                                                                                  //     // 6
//////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                    //     // 8
// XXX docs                                                                                         // 1   // 9
                                                                                                    // 2   // 10
// Things we explicitly do NOT support:                                                             // 3   // 11
//    - heterogenous arrays                                                                         // 4   // 12
                                                                                                    // 5   // 13
var currentArgumentChecker = new Meteor.EnvironmentVariable;                                        // 6   // 14
                                                                                                    // 7   // 15
/**                                                                                                 // 8   // 16
 * @summary Check that a value matches a [pattern](#matchpatterns).                                 // 9   // 17
 * If the value does not match the pattern, throw a `Match.Error`.                                  // 10  // 18
 *                                                                                                  // 11  // 19
 * Particularly useful to assert that arguments to a function have the right                        // 12  // 20
 * types and structure.                                                                             // 13  // 21
 * @locus Anywhere                                                                                  // 14  // 22
 * @param {Any} value The value to check                                                            // 15  // 23
 * @param {MatchPattern} pattern The pattern to match                                               // 16  // 24
 * `value` against                                                                                  // 17  // 25
 */                                                                                                 // 18  // 26
check = function (value, pattern) {                                                                 // 19  // 27
  // Record that check got called, if somebody cared.                                               // 20  // 28
  //                                                                                                // 21  // 29
  // We use getOrNullIfOutsideFiber so that it's OK to call check()                                 // 22  // 30
  // from non-Fiber server contexts; the downside is that if you forget to                          // 23  // 31
  // bindEnvironment on some random callback in your method/publisher,                              // 24  // 32
  // it might not find the argumentChecker and you'll get an error about                            // 25  // 33
  // not checking an argument that it looks like you're checking (instead                           // 26  // 34
  // of just getting a "Node code must run in a Fiber" error).                                      // 27  // 35
  var argChecker = currentArgumentChecker.getOrNullIfOutsideFiber();                                // 28  // 36
  if (argChecker)                                                                                   // 29  // 37
    argChecker.checking(value);                                                                     // 30  // 38
  try {                                                                                             // 31  // 39
    checkSubtree(value, pattern);                                                                   // 32  // 40
  } catch (err) {                                                                                   // 33  // 41
    if ((err instanceof Match.Error) && err.path)                                                   // 34  // 42
      err.message += " in field " + err.path;                                                       // 35  // 43
    throw err;                                                                                      // 36  // 44
  }                                                                                                 // 37  // 45
};                                                                                                  // 38  // 46
                                                                                                    // 39  // 47
/**                                                                                                 // 40  // 48
 * @namespace Match                                                                                 // 41  // 49
 * @summary The namespace for all Match types and methods.                                          // 42  // 50
 */                                                                                                 // 43  // 51
Match = {                                                                                           // 44  // 52
  Optional: function (pattern) {                                                                    // 45  // 53
    return new Optional(pattern);                                                                   // 46  // 54
  },                                                                                                // 47  // 55
  OneOf: function (/*arguments*/) {                                                                 // 48  // 56
    return new OneOf(_.toArray(arguments));                                                         // 49  // 57
  },                                                                                                // 50  // 58
  Any: ['__any__'],                                                                                 // 51  // 59
  Where: function (condition) {                                                                     // 52  // 60
    return new Where(condition);                                                                    // 53  // 61
  },                                                                                                // 54  // 62
  ObjectIncluding: function (pattern) {                                                             // 55  // 63
    return new ObjectIncluding(pattern);                                                            // 56  // 64
  },                                                                                                // 57  // 65
  ObjectWithValues: function (pattern) {                                                            // 58  // 66
    return new ObjectWithValues(pattern);                                                           // 59  // 67
  },                                                                                                // 60  // 68
  // Matches only signed 32-bit integers                                                            // 61  // 69
  Integer: ['__integer__'],                                                                         // 62  // 70
                                                                                                    // 63  // 71
  // XXX matchers should know how to describe themselves for errors                                 // 64  // 72
  Error: Meteor.makeErrorType("Match.Error", function (msg) {                                       // 65  // 73
    this.message = "Match error: " + msg;                                                           // 66  // 74
    // The path of the value that failed to match. Initially empty, this gets                       // 67  // 75
    // populated by catching and rethrowing the exception as it goes back up the                    // 68  // 76
    // stack.                                                                                       // 69  // 77
    // E.g.: "vals[3].entity.created"                                                               // 70  // 78
    this.path = "";                                                                                 // 71  // 79
    // If this gets sent over DDP, don't give full internal details but at least                    // 72  // 80
    // provide something better than 500 Internal server error.                                     // 73  // 81
    this.sanitizedError = new Meteor.Error(400, "Match failed");                                    // 74  // 82
  }),                                                                                               // 75  // 83
                                                                                                    // 76  // 84
  // Tests to see if value matches pattern. Unlike check, it merely returns true                    // 77  // 85
  // or false (unless an error other than Match.Error was thrown). It does not                      // 78  // 86
  // interact with _failIfArgumentsAreNotAllChecked.                                                // 79  // 87
  // XXX maybe also implement a Match.match which returns more information about                    // 80  // 88
  //     failures but without using exception handling or doing what check()                        // 81  // 89
  //     does with _failIfArgumentsAreNotAllChecked and Meteor.Error conversion                     // 82  // 90
                                                                                                    // 83  // 91
  /**                                                                                               // 84  // 92
   * @summary Returns true if the value matches the pattern.                                        // 85  // 93
   * @locus Anywhere                                                                                // 86  // 94
   * @param {Any} value The value to check                                                          // 87  // 95
   * @param {MatchPattern} pattern The pattern to match `value` against                             // 88  // 96
   */                                                                                               // 89  // 97
  test: function (value, pattern) {                                                                 // 90  // 98
    try {                                                                                           // 91  // 99
      checkSubtree(value, pattern);                                                                 // 92  // 100
      return true;                                                                                  // 93  // 101
    } catch (e) {                                                                                   // 94  // 102
      if (e instanceof Match.Error)                                                                 // 95  // 103
        return false;                                                                               // 96  // 104
      // Rethrow other errors.                                                                      // 97  // 105
      throw e;                                                                                      // 98  // 106
    }                                                                                               // 99  // 107
  },                                                                                                // 100
                                                                                                    // 101
  // Runs `f.apply(context, args)`. If check() is not called on every element of                    // 102
  // `args` (either directly or in the first level of an array), throws an error                    // 103
  // (using `description` in the message).                                                          // 104
  //                                                                                                // 105
  _failIfArgumentsAreNotAllChecked: function (f, context, args, description) {                      // 106
    var argChecker = new ArgumentChecker(args, description);                                        // 107
    var result = currentArgumentChecker.withValue(argChecker, function () {                         // 108
      return f.apply(context, args);                                                                // 109
    });                                                                                             // 110
    // If f didn't itself throw, make sure it checked all of its arguments.                         // 111
    argChecker.throwUnlessAllArgumentsHaveBeenChecked();                                            // 112
    return result;                                                                                  // 113
  }                                                                                                 // 114
};                                                                                                  // 115
                                                                                                    // 116
var Optional = function (pattern) {                                                                 // 117
  this.pattern = pattern;                                                                           // 118
};                                                                                                  // 119
                                                                                                    // 120
var OneOf = function (choices) {                                                                    // 121
  if (_.isEmpty(choices))                                                                           // 122
    throw new Error("Must provide at least one choice to Match.OneOf");                             // 123
  this.choices = choices;                                                                           // 124
};                                                                                                  // 125
                                                                                                    // 126
var Where = function (condition) {                                                                  // 127
  this.condition = condition;                                                                       // 128
};                                                                                                  // 129
                                                                                                    // 130
var ObjectIncluding = function (pattern) {                                                          // 131
  this.pattern = pattern;                                                                           // 132
};                                                                                                  // 133
                                                                                                    // 134
var ObjectWithValues = function (pattern) {                                                         // 135
  this.pattern = pattern;                                                                           // 136
};                                                                                                  // 137
                                                                                                    // 138
var typeofChecks = [                                                                                // 139
  [String, "string"],                                                                               // 140
  [Number, "number"],                                                                               // 141
  [Boolean, "boolean"],                                                                             // 142
  // While we don't allow undefined in EJSON, this is good for optional                             // 143
  // arguments with OneOf.                                                                          // 144
  [undefined, "undefined"]                                                                          // 145
];                                                                                                  // 146
                                                                                                    // 147
var checkSubtree = function (value, pattern) {                                                      // 148
  // Match anything!                                                                                // 149
  if (pattern === Match.Any)                                                                        // 150
    return;                                                                                         // 151
                                                                                                    // 152
  // Basic atomic types.                                                                            // 153
  // Do not match boxed objects (e.g. String, Boolean)                                              // 154
  for (var i = 0; i < typeofChecks.length; ++i) {                                                   // 155
    if (pattern === typeofChecks[i][0]) {                                                           // 156
      if (typeof value === typeofChecks[i][1])                                                      // 157
        return;                                                                                     // 158
      throw new Match.Error("Expected " + typeofChecks[i][1] + ", got " +                           // 159
                            typeof value);                                                          // 160
    }                                                                                               // 161
  }                                                                                                 // 162
  if (pattern === null) {                                                                           // 163
    if (value === null)                                                                             // 164
      return;                                                                                       // 165
    throw new Match.Error("Expected null, got " + EJSON.stringify(value));                          // 166
  }                                                                                                 // 167
                                                                                                    // 168
  // Strings, numbers, and booleans match literally. Goes well with Match.OneOf.                    // 169
  if (typeof pattern === "string" || typeof pattern === "number" || typeof pattern === "boolean") {        // 178
    if (value === pattern)                                                                          // 171
      return;                                                                                       // 172
    throw new Match.Error("Expected " + pattern + ", got " +                                        // 173
                          EJSON.stringify(value));                                                  // 174
  }                                                                                                 // 175
                                                                                                    // 176
  // Match.Integer is special type encoded with array                                               // 177
  if (pattern === Match.Integer) {                                                                  // 178
    // There is no consistent and reliable way to check if variable is a 64-bit                     // 179
    // integer. One of the popular solutions is to get reminder of division by 1                    // 180
    // but this method fails on really large floats with big precision.                             // 181
    // E.g.: 1.348192308491824e+23 % 1 === 0 in V8                                                  // 182
    // Bitwise operators work consistantly but always cast variable to 32-bit                       // 183
    // signed integer according to JavaScript specs.                                                // 184
    if (typeof value === "number" && (value | 0) === value)                                         // 185
      return                                                                                        // 186
    throw new Match.Error("Expected Integer, got "                                                  // 187
                + (value instanceof Object ? EJSON.stringify(value) : value));                      // 188
  }                                                                                                 // 189
                                                                                                    // 190
  // "Object" is shorthand for Match.ObjectIncluding({});                                           // 191
  if (pattern === Object)                                                                           // 192
    pattern = Match.ObjectIncluding({});                                                            // 193
                                                                                                    // 194
  // Array (checked AFTER Any, which is implemented as an Array).                                   // 195
  if (pattern instanceof Array) {                                                                   // 196
    if (pattern.length !== 1)                                                                       // 197
      throw Error("Bad pattern: arrays must have one type element" +                                // 198
                  EJSON.stringify(pattern));                                                        // 199
    if (!_.isArray(value) && !_.isArguments(value)) {                                               // 200
      throw new Match.Error("Expected array, got " + EJSON.stringify(value));                       // 201
    }                                                                                               // 202
                                                                                                    // 203
    _.each(value, function (valueElement, index) {                                                  // 204
      try {                                                                                         // 205
        checkSubtree(valueElement, pattern[0]);                                                     // 206
      } catch (err) {                                                                               // 207
        if (err instanceof Match.Error) {                                                           // 208
          err.path = _prependPath(index, err.path);                                                 // 209
        }                                                                                           // 210
        throw err;                                                                                  // 211
      }                                                                                             // 212
    });                                                                                             // 213
    return;                                                                                         // 214
  }                                                                                                 // 215
                                                                                                    // 216
  // Arbitrary validation checks. The condition can return false or throw a                         // 217
  // Match.Error (ie, it can internally use check()) to fail.                                       // 218
  if (pattern instanceof Where) {                                                                   // 219
    if (pattern.condition(value))                                                                   // 220
      return;                                                                                       // 221
    // XXX this error is terrible                                                                   // 222
    throw new Match.Error("Failed Match.Where validation");                                         // 223
  }                                                                                                 // 224
                                                                                                    // 225
                                                                                                    // 226
  if (pattern instanceof Optional)                                                                  // 227
    pattern = Match.OneOf(undefined, pattern.pattern);                                              // 228
                                                                                                    // 229
  if (pattern instanceof OneOf) {                                                                   // 230
    for (var i = 0; i < pattern.choices.length; ++i) {                                              // 231
      try {                                                                                         // 232
        checkSubtree(value, pattern.choices[i]);                                                    // 233
        // No error? Yay, return.                                                                   // 234
        return;                                                                                     // 235
      } catch (err) {                                                                               // 236
        // Other errors should be thrown. Match errors just mean try another                        // 237
        // choice.                                                                                  // 238
        if (!(err instanceof Match.Error))                                                          // 239
          throw err;                                                                                // 240
      }                                                                                             // 241
    }                                                                                               // 242
    // XXX this error is terrible                                                                   // 243
    throw new Match.Error("Failed Match.OneOf or Match.Optional validation");                       // 244
  }                                                                                                 // 245
                                                                                                    // 246
  // A function that isn't something we special-case is assumed to be a                             // 247
  // constructor.                                                                                   // 248
  if (pattern instanceof Function) {                                                                // 249
    if (value instanceof pattern)                                                                   // 250
      return;                                                                                       // 251
    throw new Match.Error("Expected " + (pattern.name ||                                            // 252
                                         "particular constructor"));                                // 253
  }                                                                                                 // 254
                                                                                                    // 255
  var unknownKeysAllowed = false;                                                                   // 256
  var unknownKeyPattern;                                                                            // 257
  if (pattern instanceof ObjectIncluding) {                                                         // 258
    unknownKeysAllowed = true;                                                                      // 259
    pattern = pattern.pattern;                                                                      // 260
  }                                                                                                 // 261
  if (pattern instanceof ObjectWithValues) {                                                        // 262
    unknownKeysAllowed = true;                                                                      // 263
    unknownKeyPattern = [pattern.pattern];                                                          // 264
    pattern = {};  // no required keys                                                              // 265
  }                                                                                                 // 266
                                                                                                    // 267
  if (typeof pattern !== "object")                                                                  // 268
    throw Error("Bad pattern: unknown pattern type");                                               // 269
                                                                                                    // 270
  // An object, with required and optional keys. Note that this does NOT do                         // 271
  // structural matches against objects of special types that happen to match                       // 272
  // the pattern: this really needs to be a plain old {Object}!                                     // 273
  if (typeof value !== 'object')                                                                    // 274
    throw new Match.Error("Expected object, got " + typeof value);                                  // 275
  if (value === null)                                                                               // 276
    throw new Match.Error("Expected object, got null");                                             // 277
  if (value.constructor !== Object)                                                                 // 278
    throw new Match.Error("Expected plain object");                                                 // 279
                                                                                                    // 280
  var requiredPatterns = {};                                                                        // 281
  var optionalPatterns = {};                                                                        // 282
  _.each(pattern, function (subPattern, key) {                                                      // 283
    if (subPattern instanceof Optional)                                                             // 284
      optionalPatterns[key] = subPattern.pattern;                                                   // 285
    else                                                                                            // 286
      requiredPatterns[key] = subPattern;                                                           // 287
  });                                                                                               // 288
                                                                                                    // 289
  _.each(value, function (subValue, key) {                                                          // 290
    try {                                                                                           // 291
      if (_.has(requiredPatterns, key)) {                                                           // 292
        checkSubtree(subValue, requiredPatterns[key]);                                              // 293
        delete requiredPatterns[key];                                                               // 294
      } else if (_.has(optionalPatterns, key)) {                                                    // 295
        checkSubtree(subValue, optionalPatterns[key]);                                              // 296
      } else {                                                                                      // 297
        if (!unknownKeysAllowed)                                                                    // 298
          throw new Match.Error("Unknown key");                                                     // 299
        if (unknownKeyPattern) {                                                                    // 300
          checkSubtree(subValue, unknownKeyPattern[0]);                                             // 301
        }                                                                                           // 302
      }                                                                                             // 303
    } catch (err) {                                                                                 // 304
      if (err instanceof Match.Error)                                                               // 305
        err.path = _prependPath(key, err.path);                                                     // 306
      throw err;                                                                                    // 307
    }                                                                                               // 308
  });                                                                                               // 309
                                                                                                    // 310
  _.each(requiredPatterns, function (subPattern, key) {                                             // 311
    throw new Match.Error("Missing key '" + key + "'");                                             // 312
  });                                                                                               // 313
};                                                                                                  // 314
                                                                                                    // 315
var ArgumentChecker = function (args, description) {                                                // 316
  var self = this;                                                                                  // 317
  // Make a SHALLOW copy of the arguments. (We'll be doing identity checks                          // 318
  // against its contents.)                                                                         // 319
  self.args = _.clone(args);                                                                        // 320
  // Since the common case will be to check arguments in order, and we splice                       // 321
  // out arguments when we check them, make it so we splice out from the end                        // 322
  // rather than the beginning.                                                                     // 323
  self.args.reverse();                                                                              // 324
  self.description = description;                                                                   // 325
};                                                                                                  // 326
                                                                                                    // 327
_.extend(ArgumentChecker.prototype, {                                                               // 328
  checking: function (value) {                                                                      // 329
    var self = this;                                                                                // 330
    if (self._checkingOneValue(value))                                                              // 331
      return;                                                                                       // 332
    // Allow check(arguments, [String]) or check(arguments.slice(1), [String])                      // 333
    // or check([foo, bar], [String]) to count... but only if value wasn't                          // 334
    // itself an argument.                                                                          // 335
    if (_.isArray(value) || _.isArguments(value)) {                                                 // 336
      _.each(value, _.bind(self._checkingOneValue, self));                                          // 337
    }                                                                                               // 338
  },                                                                                                // 339
  _checkingOneValue: function (value) {                                                             // 340
    var self = this;                                                                                // 341
    for (var i = 0; i < self.args.length; ++i) {                                                    // 342
      // Is this value one of the arguments? (This can have a false positive if                     // 343
      // the argument is an interned primitive, but it's still a good enough                        // 344
      // check.)                                                                                    // 345
      // (NaN is not === to itself, so we have to check specially.)                                 // 346
      if (value === self.args[i] || (_.isNaN(value) && _.isNaN(self.args[i]))) {                    // 347
        self.args.splice(i, 1);                                                                     // 348
        return true;                                                                                // 349
      }                                                                                             // 350
    }                                                                                               // 351
    return false;                                                                                   // 352
  },                                                                                                // 353
  throwUnlessAllArgumentsHaveBeenChecked: function () {                                             // 354
    var self = this;                                                                                // 355
    if (!_.isEmpty(self.args))                                                                      // 356
      throw new Error("Did not check() all arguments during " +                                     // 357
                      self.description);                                                            // 358
  }                                                                                                 // 359
});                                                                                                 // 360
                                                                                                    // 361
var _jsKeywords = ["do", "if", "in", "for", "let", "new", "try", "var", "case",                     // 362
  "else", "enum", "eval", "false", "null", "this", "true", "void", "with",                          // 363
  "break", "catch", "class", "const", "super", "throw", "while", "yield",                           // 364
  "delete", "export", "import", "public", "return", "static", "switch",                             // 365
  "typeof", "default", "extends", "finally", "package", "private", "continue",                      // 366
  "debugger", "function", "arguments", "interface", "protected", "implements",                      // 367
  "instanceof"];                                                                                    // 368
                                                                                                    // 369
// Assumes the base of path is already escaped properly                                             // 370
// returns key + base                                                                               // 371
var _prependPath = function (key, base) {                                                           // 372
  if ((typeof key) === "number" || key.match(/^[0-9]+$/))                                           // 373
    key = "[" + key + "]";                                                                          // 374
  else if (!key.match(/^[a-z_$][0-9a-z_$]*$/i) || _.contains(_jsKeywords, key))                     // 375
    key = JSON.stringify([key]);                                                                    // 376
                                                                                                    // 377
  if (base && base[0] !== "[")                                                                      // 378
    return key + '.' + base;                                                                        // 379
  return key + base;                                                                                // 380
};                                                                                                  // 381
                                                                                                    // 382
                                                                                                    // 383
//////////////////////////////////////////////////////////////////////////////////////////////////////     // 392
                                                                                                           // 393
}).call(this);                                                                                             // 394
                                                                                                           // 395
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.check = {
  check: check,
  Match: Match
};

})();

//# sourceMappingURL=check.js.map
