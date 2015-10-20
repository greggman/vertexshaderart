(function () {

/* Package-scope variables */
var exports, _;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/underscore/packages/underscore.js                                                                    //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
(function(){                                                                                                     // 1
                                                                                                                 // 2
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3
//                                                                                                       //      // 4
// packages/underscore/pre.js                                                                            //      // 5
//                                                                                                       //      // 6
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 7
                                                                                                         //      // 8
// Define an object named exports. This will cause underscore.js to put `_` as a                         // 1    // 9
// field on it, instead of in the global namespace.  See also post.js.                                   // 2    // 10
exports = {};                                                                                            // 3    // 11
                                                                                                         // 4    // 12
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 13
                                                                                                                 // 14
}).call(this);                                                                                                   // 15
                                                                                                                 // 16
                                                                                                                 // 17
                                                                                                                 // 18
                                                                                                                 // 19
                                                                                                                 // 20
                                                                                                                 // 21
(function(){                                                                                                     // 22
                                                                                                                 // 23
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 24
//                                                                                                       //      // 25
// packages/underscore/underscore.js                                                                     //      // 26
//                                                                                                       //      // 27
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 28
                                                                                                         //      // 29
//     Underscore.js 1.5.2                                                                               // 1    // 30
//     http://underscorejs.org                                                                           // 2    // 31
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors                // 3    // 32
//     Underscore may be freely distributed under the MIT license.                                       // 4    // 33
                                                                                                         // 5    // 34
(function() {                                                                                            // 6    // 35
                                                                                                         // 7    // 36
  // Baseline setup                                                                                      // 8    // 37
  // --------------                                                                                      // 9    // 38
                                                                                                         // 10   // 39
  // Establish the root object, `window` in the browser, or `exports` on the server.                     // 11   // 40
  var root = this;                                                                                       // 12   // 41
                                                                                                         // 13   // 42
  // Save the previous value of the `_` variable.                                                        // 14   // 43
  var previousUnderscore = root._;                                                                       // 15   // 44
                                                                                                         // 16   // 45
  // Establish the object that gets returned to break out of a loop iteration.                           // 17   // 46
  var breaker = {};                                                                                      // 18   // 47
                                                                                                         // 19   // 48
  // Save bytes in the minified (but not gzipped) version:                                               // 20   // 49
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;         // 21   // 50
                                                                                                         // 22   // 51
  // Create quick reference variables for speed access to core prototypes.                               // 23   // 52
  var                                                                                                    // 24   // 53
    push             = ArrayProto.push,                                                                  // 25   // 54
    slice            = ArrayProto.slice,                                                                 // 26   // 55
    concat           = ArrayProto.concat,                                                                // 27   // 56
    toString         = ObjProto.toString,                                                                // 28   // 57
    hasOwnProperty   = ObjProto.hasOwnProperty;                                                          // 29   // 58
                                                                                                         // 30   // 59
  // All **ECMAScript 5** native function implementations that we hope to use                            // 31   // 60
  // are declared here.                                                                                  // 32   // 61
  var                                                                                                    // 33   // 62
    nativeForEach      = ArrayProto.forEach,                                                             // 34   // 63
    nativeMap          = ArrayProto.map,                                                                 // 35   // 64
    nativeReduce       = ArrayProto.reduce,                                                              // 36   // 65
    nativeReduceRight  = ArrayProto.reduceRight,                                                         // 37   // 66
    nativeFilter       = ArrayProto.filter,                                                              // 38   // 67
    nativeEvery        = ArrayProto.every,                                                               // 39   // 68
    nativeSome         = ArrayProto.some,                                                                // 40   // 69
    nativeIndexOf      = ArrayProto.indexOf,                                                             // 41   // 70
    nativeLastIndexOf  = ArrayProto.lastIndexOf,                                                         // 42   // 71
    nativeIsArray      = Array.isArray,                                                                  // 43   // 72
    nativeKeys         = Object.keys,                                                                    // 44   // 73
    nativeBind         = FuncProto.bind;                                                                 // 45   // 74
                                                                                                         // 46   // 75
  // Create a safe reference to the Underscore object for use below.                                     // 47   // 76
  var _ = function(obj) {                                                                                // 48   // 77
    if (obj instanceof _) return obj;                                                                    // 49   // 78
    if (!(this instanceof _)) return new _(obj);                                                         // 50   // 79
    this._wrapped = obj;                                                                                 // 51   // 80
  };                                                                                                     // 52   // 81
                                                                                                         // 53   // 82
  // Export the Underscore object for **Node.js**, with                                                  // 54   // 83
  // backwards-compatibility for the old `require()` API. If we're in                                    // 55   // 84
  // the browser, add `_` as a global object via a string identifier,                                    // 56   // 85
  // for Closure Compiler "advanced" mode.                                                               // 57   // 86
  if (typeof exports !== 'undefined') {                                                                  // 58   // 87
    if (typeof module !== 'undefined' && module.exports) {                                               // 59   // 88
      exports = module.exports = _;                                                                      // 60   // 89
    }                                                                                                    // 61   // 90
    exports._ = _;                                                                                       // 62   // 91
  } else {                                                                                               // 63   // 92
    root._ = _;                                                                                          // 64   // 93
  }                                                                                                      // 65   // 94
                                                                                                         // 66   // 95
  // Current version.                                                                                    // 67   // 96
  _.VERSION = '1.5.2';                                                                                   // 68   // 97
                                                                                                         // 69   // 98
  // Collection Functions                                                                                // 70   // 99
  // --------------------                                                                                // 71   // 100
                                                                                                         // 72   // 101
  // METEOR CHANGE: Define _isArguments instead of depending on                                          // 73   // 102
  // _.isArguments which is defined using each. In looksLikeArray                                        // 74   // 103
  // (which each depends on), we then use _isArguments instead of                                        // 75   // 104
  // _.isArguments.                                                                                      // 76   // 105
  var _isArguments = function (obj) {                                                                    // 77   // 106
    return toString.call(obj) === '[object Arguments]';                                                  // 78   // 107
  };                                                                                                     // 79   // 108
  // Define a fallback version of the method in browsers (ahem, IE), where                               // 80   // 109
  // there isn't any inspectable "Arguments" type.                                                       // 81   // 110
  if (!_isArguments(arguments)) {                                                                        // 82   // 111
    _isArguments = function (obj) {                                                                      // 83   // 112
      return !!(obj && hasOwnProperty.call(obj, 'callee') && typeof obj.callee === 'function');          // 84   // 113
    };                                                                                                   // 85   // 114
  }                                                                                                      // 86   // 115
                                                                                                         // 87   // 116
  // METEOR CHANGE: _.each({length: 5}) should be treated like an object, not an                         // 88   // 117
  // array. This looksLikeArray function is introduced by Meteor, and replaces                           // 89   // 118
  // all instances of `obj.length === +obj.length`.                                                      // 90   // 119
  // https://github.com/meteor/meteor/issues/594                                                         // 91   // 120
  // https://github.com/jashkenas/underscore/issues/770                                                  // 92   // 121
  var looksLikeArray = function (obj) {                                                                  // 93   // 122
    return (obj.length === +obj.length                                                                   // 94   // 123
            // _.isArguments not yet necessarily defined here                                            // 95   // 124
            && (_isArguments(obj) || obj.constructor !== Object));                                       // 96   // 125
  };                                                                                                     // 97   // 126
                                                                                                         // 98   // 127
  // The cornerstone, an `each` implementation, aka `forEach`.                                           // 99   // 128
  // Handles objects with the built-in `forEach`, arrays, and raw objects.                               // 100  // 129
  // Delegates to **ECMAScript 5**'s native `forEach` if available.                                      // 101  // 130
  var each = _.each = _.forEach = function(obj, iterator, context) {                                     // 102  // 131
    if (obj == null) return;                                                                             // 103  // 132
    if (nativeForEach && obj.forEach === nativeForEach) {                                                // 104  // 133
      obj.forEach(iterator, context);                                                                    // 105  // 134
    } else if (looksLikeArray(obj)) {                                                                    // 106  // 135
      for (var i = 0, length = obj.length; i < length; i++) {                                            // 107  // 136
        if (iterator.call(context, obj[i], i, obj) === breaker) return;                                  // 108  // 137
      }                                                                                                  // 109  // 138
    } else {                                                                                             // 110  // 139
      var keys = _.keys(obj);                                                                            // 111  // 140
      for (var i = 0, length = keys.length; i < length; i++) {                                           // 112  // 141
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;                      // 113  // 142
      }                                                                                                  // 114  // 143
    }                                                                                                    // 115  // 144
  };                                                                                                     // 116  // 145
                                                                                                         // 117  // 146
  // Return the results of applying the iterator to each element.                                        // 118  // 147
  // Delegates to **ECMAScript 5**'s native `map` if available.                                          // 119  // 148
  _.map = _.collect = function(obj, iterator, context) {                                                 // 120  // 149
    var results = [];                                                                                    // 121  // 150
    if (obj == null) return results;                                                                     // 122  // 151
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);                           // 123  // 152
    each(obj, function(value, index, list) {                                                             // 124  // 153
      results.push(iterator.call(context, value, index, list));                                          // 125  // 154
    });                                                                                                  // 126  // 155
    return results;                                                                                      // 127  // 156
  };                                                                                                     // 128  // 157
                                                                                                         // 129  // 158
  var reduceError = 'Reduce of empty array with no initial value';                                       // 130  // 159
                                                                                                         // 131  // 160
  // **Reduce** builds up a single result from a list of values, aka `inject`,                           // 132  // 161
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.                           // 133  // 162
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {                               // 134  // 163
    var initial = arguments.length > 2;                                                                  // 135  // 164
    if (obj == null) obj = [];                                                                           // 136  // 165
    if (nativeReduce && obj.reduce === nativeReduce) {                                                   // 137  // 166
      if (context) iterator = _.bind(iterator, context);                                                 // 138  // 167
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);                                // 139  // 168
    }                                                                                                    // 140  // 169
    each(obj, function(value, index, list) {                                                             // 141  // 170
      if (!initial) {                                                                                    // 142  // 171
        memo = value;                                                                                    // 143  // 172
        initial = true;                                                                                  // 144  // 173
      } else {                                                                                           // 145  // 174
        memo = iterator.call(context, memo, value, index, list);                                         // 146  // 175
      }                                                                                                  // 147  // 176
    });                                                                                                  // 148  // 177
    if (!initial) throw new TypeError(reduceError);                                                      // 149  // 178
    return memo;                                                                                         // 150  // 179
  };                                                                                                     // 151  // 180
                                                                                                         // 152  // 181
  // The right-associative version of reduce, also known as `foldr`.                                     // 153  // 182
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.                                  // 154  // 183
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {                                     // 155  // 184
    var initial = arguments.length > 2;                                                                  // 156  // 185
    if (obj == null) obj = [];                                                                           // 157  // 186
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {                                    // 158  // 187
      if (context) iterator = _.bind(iterator, context);                                                 // 159  // 188
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);                      // 160  // 189
    }                                                                                                    // 161  // 190
    var length = obj.length;                                                                             // 162  // 191
    if (!looksLikeArray(obj)) {                                                                          // 163  // 192
      var keys = _.keys(obj);                                                                            // 164  // 193
      length = keys.length;                                                                              // 165  // 194
    }                                                                                                    // 166  // 195
    each(obj, function(value, index, list) {                                                             // 167  // 196
      index = keys ? keys[--length] : --length;                                                          // 168  // 197
      if (!initial) {                                                                                    // 169  // 198
        memo = obj[index];                                                                               // 170  // 199
        initial = true;                                                                                  // 171  // 200
      } else {                                                                                           // 172  // 201
        memo = iterator.call(context, memo, obj[index], index, list);                                    // 173  // 202
      }                                                                                                  // 174  // 203
    });                                                                                                  // 175  // 204
    if (!initial) throw new TypeError(reduceError);                                                      // 176  // 205
    return memo;                                                                                         // 177  // 206
  };                                                                                                     // 178  // 207
                                                                                                         // 179  // 208
  // Return the first value which passes a truth test. Aliased as `detect`.                              // 180  // 209
  _.find = _.detect = function(obj, iterator, context) {                                                 // 181  // 210
    var result;                                                                                          // 182  // 211
    any(obj, function(value, index, list) {                                                              // 183  // 212
      if (iterator.call(context, value, index, list)) {                                                  // 184  // 213
        result = value;                                                                                  // 185  // 214
        return true;                                                                                     // 186  // 215
      }                                                                                                  // 187  // 216
    });                                                                                                  // 188  // 217
    return result;                                                                                       // 189  // 218
  };                                                                                                     // 190  // 219
                                                                                                         // 191  // 220
  // Return all the elements that pass a truth test.                                                     // 192  // 221
  // Delegates to **ECMAScript 5**'s native `filter` if available.                                       // 193  // 222
  // Aliased as `select`.                                                                                // 194  // 223
  _.filter = _.select = function(obj, iterator, context) {                                               // 195  // 224
    var results = [];                                                                                    // 196  // 225
    if (obj == null) return results;                                                                     // 197  // 226
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);               // 198  // 227
    each(obj, function(value, index, list) {                                                             // 199  // 228
      if (iterator.call(context, value, index, list)) results.push(value);                               // 200  // 229
    });                                                                                                  // 201  // 230
    return results;                                                                                      // 202  // 231
  };                                                                                                     // 203  // 232
                                                                                                         // 204  // 233
  // Return all the elements for which a truth test fails.                                               // 205  // 234
  _.reject = function(obj, iterator, context) {                                                          // 206  // 235
    return _.filter(obj, function(value, index, list) {                                                  // 207  // 236
      return !iterator.call(context, value, index, list);                                                // 208  // 237
    }, context);                                                                                         // 209  // 238
  };                                                                                                     // 210  // 239
                                                                                                         // 211  // 240
  // Determine whether all of the elements match a truth test.                                           // 212  // 241
  // Delegates to **ECMAScript 5**'s native `every` if available.                                        // 213  // 242
  // Aliased as `all`.                                                                                   // 214  // 243
  _.every = _.all = function(obj, iterator, context) {                                                   // 215  // 244
    iterator || (iterator = _.identity);                                                                 // 216  // 245
    var result = true;                                                                                   // 217  // 246
    if (obj == null) return result;                                                                      // 218  // 247
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);                   // 219  // 248
    each(obj, function(value, index, list) {                                                             // 220  // 249
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;              // 221  // 250
    });                                                                                                  // 222  // 251
    return !!result;                                                                                     // 223  // 252
  };                                                                                                     // 224  // 253
                                                                                                         // 225  // 254
  // Determine if at least one element in the object matches a truth test.                               // 226  // 255
  // Delegates to **ECMAScript 5**'s native `some` if available.                                         // 227  // 256
  // Aliased as `any`.                                                                                   // 228  // 257
  var any = _.some = _.any = function(obj, iterator, context) {                                          // 229  // 258
    iterator || (iterator = _.identity);                                                                 // 230  // 259
    var result = false;                                                                                  // 231  // 260
    if (obj == null) return result;                                                                      // 232  // 261
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);                       // 233  // 262
    each(obj, function(value, index, list) {                                                             // 234  // 263
      if (result || (result = iterator.call(context, value, index, list))) return breaker;               // 235  // 264
    });                                                                                                  // 236  // 265
    return !!result;                                                                                     // 237  // 266
  };                                                                                                     // 238  // 267
                                                                                                         // 239  // 268
  // Determine if the array or object contains a given value (using `===`).                              // 240  // 269
  // Aliased as `include`.                                                                               // 241  // 270
  _.contains = _.include = function(obj, target) {                                                       // 242  // 271
    if (obj == null) return false;                                                                       // 243  // 272
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;                // 244  // 273
    return any(obj, function(value) {                                                                    // 245  // 274
      return value === target;                                                                           // 246  // 275
    });                                                                                                  // 247  // 276
  };                                                                                                     // 248  // 277
                                                                                                         // 249  // 278
  // Invoke a method (with arguments) on every item in a collection.                                     // 250  // 279
  _.invoke = function(obj, method) {                                                                     // 251  // 280
    var args = slice.call(arguments, 2);                                                                 // 252  // 281
    var isFunc = _.isFunction(method);                                                                   // 253  // 282
    return _.map(obj, function(value) {                                                                  // 254  // 283
      return (isFunc ? method : value[method]).apply(value, args);                                       // 255  // 284
    });                                                                                                  // 256  // 285
  };                                                                                                     // 257  // 286
                                                                                                         // 258  // 287
  // Convenience version of a common use case of `map`: fetching a property.                             // 259  // 288
  _.pluck = function(obj, key) {                                                                         // 260  // 289
    return _.map(obj, function(value){ return value[key]; });                                            // 261  // 290
  };                                                                                                     // 262  // 291
                                                                                                         // 263  // 292
  // Convenience version of a common use case of `filter`: selecting only objects                        // 264  // 293
  // containing specific `key:value` pairs.                                                              // 265  // 294
  _.where = function(obj, attrs, first) {                                                                // 266  // 295
    if (_.isEmpty(attrs)) return first ? void 0 : [];                                                    // 267  // 296
    return _[first ? 'find' : 'filter'](obj, function(value) {                                           // 268  // 297
      for (var key in attrs) {                                                                           // 269  // 298
        if (attrs[key] !== value[key]) return false;                                                     // 270  // 299
      }                                                                                                  // 271  // 300
      return true;                                                                                       // 272  // 301
    });                                                                                                  // 273  // 302
  };                                                                                                     // 274  // 303
                                                                                                         // 275  // 304
  // Convenience version of a common use case of `find`: getting the first object                        // 276  // 305
  // containing specific `key:value` pairs.                                                              // 277  // 306
  _.findWhere = function(obj, attrs) {                                                                   // 278  // 307
    return _.where(obj, attrs, true);                                                                    // 279  // 308
  };                                                                                                     // 280  // 309
                                                                                                         // 281  // 310
  // Return the maximum element or (element-based computation).                                          // 282  // 311
  // Can't optimize arrays of integers longer than 65,535 elements.                                      // 283  // 312
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)                               // 284  // 313
  _.max = function(obj, iterator, context) {                                                             // 285  // 314
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {                       // 286  // 315
      return Math.max.apply(Math, obj);                                                                  // 287  // 316
    }                                                                                                    // 288  // 317
    if (!iterator && _.isEmpty(obj)) return -Infinity;                                                   // 289  // 318
    var result = {computed : -Infinity, value: -Infinity};                                               // 290  // 319
    each(obj, function(value, index, list) {                                                             // 291  // 320
      var computed = iterator ? iterator.call(context, value, index, list) : value;                      // 292  // 321
      computed > result.computed && (result = {value : value, computed : computed});                     // 293  // 322
    });                                                                                                  // 294  // 323
    return result.value;                                                                                 // 295  // 324
  };                                                                                                     // 296  // 325
                                                                                                         // 297  // 326
  // Return the minimum element (or element-based computation).                                          // 298  // 327
  _.min = function(obj, iterator, context) {                                                             // 299  // 328
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {                       // 300  // 329
      return Math.min.apply(Math, obj);                                                                  // 301  // 330
    }                                                                                                    // 302  // 331
    if (!iterator && _.isEmpty(obj)) return Infinity;                                                    // 303  // 332
    var result = {computed : Infinity, value: Infinity};                                                 // 304  // 333
    each(obj, function(value, index, list) {                                                             // 305  // 334
      var computed = iterator ? iterator.call(context, value, index, list) : value;                      // 306  // 335
      computed < result.computed && (result = {value : value, computed : computed});                     // 307  // 336
    });                                                                                                  // 308  // 337
    return result.value;                                                                                 // 309  // 338
  };                                                                                                     // 310  // 339
                                                                                                         // 311  // 340
  // Shuffle an array, using the modern version of the                                                   // 312  // 341
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).                          // 313  // 342
  _.shuffle = function(obj) {                                                                            // 314  // 343
    var rand;                                                                                            // 315  // 344
    var index = 0;                                                                                       // 316  // 345
    var shuffled = [];                                                                                   // 317  // 346
    each(obj, function(value) {                                                                          // 318  // 347
      rand = _.random(index++);                                                                          // 319  // 348
      shuffled[index - 1] = shuffled[rand];                                                              // 320  // 349
      shuffled[rand] = value;                                                                            // 321  // 350
    });                                                                                                  // 322  // 351
    return shuffled;                                                                                     // 323  // 352
  };                                                                                                     // 324  // 353
                                                                                                         // 325  // 354
  // Sample **n** random values from an array.                                                           // 326  // 355
  // If **n** is not specified, returns a single random element from the array.                          // 327  // 356
  // The internal `guard` argument allows it to work with `map`.                                         // 328  // 357
  _.sample = function(obj, n, guard) {                                                                   // 329  // 358
    if (arguments.length < 2 || guard) {                                                                 // 330  // 359
      return obj[_.random(obj.length - 1)];                                                              // 331  // 360
    }                                                                                                    // 332  // 361
    return _.shuffle(obj).slice(0, Math.max(0, n));                                                      // 333  // 362
  };                                                                                                     // 334  // 363
                                                                                                         // 335  // 364
  // An internal function to generate lookup iterators.                                                  // 336  // 365
  var lookupIterator = function(value) {                                                                 // 337  // 366
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };                            // 338  // 367
  };                                                                                                     // 339  // 368
                                                                                                         // 340  // 369
  // Sort the object's values by a criterion produced by an iterator.                                    // 341  // 370
  _.sortBy = function(obj, value, context) {                                                             // 342  // 371
    var iterator = lookupIterator(value);                                                                // 343  // 372
    return _.pluck(_.map(obj, function(value, index, list) {                                             // 344  // 373
      return {                                                                                           // 345  // 374
        value: value,                                                                                    // 346  // 375
        index: index,                                                                                    // 347  // 376
        criteria: iterator.call(context, value, index, list)                                             // 348  // 377
      };                                                                                                 // 349  // 378
    }).sort(function(left, right) {                                                                      // 350  // 379
      var a = left.criteria;                                                                             // 351  // 380
      var b = right.criteria;                                                                            // 352  // 381
      if (a !== b) {                                                                                     // 353  // 382
        if (a > b || a === void 0) return 1;                                                             // 354  // 383
        if (a < b || b === void 0) return -1;                                                            // 355  // 384
      }                                                                                                  // 356  // 385
      return left.index - right.index;                                                                   // 357  // 386
    }), 'value');                                                                                        // 358  // 387
  };                                                                                                     // 359  // 388
                                                                                                         // 360  // 389
  // An internal function used for aggregate "group by" operations.                                      // 361  // 390
  var group = function(behavior) {                                                                       // 362  // 391
    return function(obj, value, context) {                                                               // 363  // 392
      var result = {};                                                                                   // 364  // 393
      var iterator = value == null ? _.identity : lookupIterator(value);                                 // 365  // 394
      each(obj, function(value, index) {                                                                 // 366  // 395
        var key = iterator.call(context, value, index, obj);                                             // 367  // 396
        behavior(result, key, value);                                                                    // 368  // 397
      });                                                                                                // 369  // 398
      return result;                                                                                     // 370  // 399
    };                                                                                                   // 371  // 400
  };                                                                                                     // 372  // 401
                                                                                                         // 373  // 402
  // Groups the object's values by a criterion. Pass either a string attribute                           // 374  // 403
  // to group by, or a function that returns the criterion.                                              // 375  // 404
  _.groupBy = group(function(result, key, value) {                                                       // 376  // 405
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);                                 // 377  // 406
  });                                                                                                    // 378  // 407
                                                                                                         // 379  // 408
  // Indexes the object's values by a criterion, similar to `groupBy`, but for                           // 380  // 409
  // when you know that your index values will be unique.                                                // 381  // 410
  _.indexBy = group(function(result, key, value) {                                                       // 382  // 411
    result[key] = value;                                                                                 // 383  // 412
  });                                                                                                    // 384  // 413
                                                                                                         // 385  // 414
  // Counts instances of an object that group by a certain criterion. Pass                               // 386  // 415
  // either a string attribute to count by, or a function that returns the                               // 387  // 416
  // criterion.                                                                                          // 388  // 417
  _.countBy = group(function(result, key) {                                                              // 389  // 418
    _.has(result, key) ? result[key]++ : result[key] = 1;                                                // 390  // 419
  });                                                                                                    // 391  // 420
                                                                                                         // 392  // 421
  // Use a comparator function to figure out the smallest index at which                                 // 393  // 422
  // an object should be inserted so as to maintain order. Uses binary search.                           // 394  // 423
  _.sortedIndex = function(array, obj, iterator, context) {                                              // 395  // 424
    iterator = iterator == null ? _.identity : lookupIterator(iterator);                                 // 396  // 425
    var value = iterator.call(context, obj);                                                             // 397  // 426
    var low = 0, high = array.length;                                                                    // 398  // 427
    while (low < high) {                                                                                 // 399  // 428
      var mid = (low + high) >>> 1;                                                                      // 400  // 429
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;                           // 401  // 430
    }                                                                                                    // 402  // 431
    return low;                                                                                          // 403  // 432
  };                                                                                                     // 404  // 433
                                                                                                         // 405  // 434
  // Safely create a real, live array from anything iterable.                                            // 406  // 435
  _.toArray = function(obj) {                                                                            // 407  // 436
    if (!obj) return [];                                                                                 // 408  // 437
    if (_.isArray(obj)) return slice.call(obj);                                                          // 409  // 438
    if (looksLikeArray(obj)) return _.map(obj, _.identity);                                              // 410  // 439
    return _.values(obj);                                                                                // 411  // 440
  };                                                                                                     // 412  // 441
                                                                                                         // 413  // 442
  // Return the number of elements in an object.                                                         // 414  // 443
  _.size = function(obj) {                                                                               // 415  // 444
    if (obj == null) return 0;                                                                           // 416  // 445
    return (looksLikeArray(obj)) ? obj.length : _.keys(obj).length;                                      // 417  // 446
  };                                                                                                     // 418  // 447
                                                                                                         // 419  // 448
  // Array Functions                                                                                     // 420  // 449
  // ---------------                                                                                     // 421  // 450
                                                                                                         // 422  // 451
  // Get the first element of an array. Passing **n** will return the first N                            // 423  // 452
  // values in the array. Aliased as `head` and `take`. The **guard** check                              // 424  // 453
  // allows it to work with `_.map`.                                                                     // 425  // 454
  _.first = _.head = _.take = function(array, n, guard) {                                                // 426  // 455
    if (array == null) return void 0;                                                                    // 427  // 456
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);                                    // 428  // 457
  };                                                                                                     // 429  // 458
                                                                                                         // 430  // 459
  // Returns everything but the last entry of the array. Especially useful on                            // 431  // 460
  // the arguments object. Passing **n** will return all the values in                                   // 432  // 461
  // the array, excluding the last N. The **guard** check allows it to work with                         // 433  // 462
  // `_.map`.                                                                                            // 434  // 463
  _.initial = function(array, n, guard) {                                                                // 435  // 464
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));                          // 436  // 465
  };                                                                                                     // 437  // 466
                                                                                                         // 438  // 467
  // Get the last element of an array. Passing **n** will return the last N                              // 439  // 468
  // values in the array. The **guard** check allows it to work with `_.map`.                            // 440  // 469
  _.last = function(array, n, guard) {                                                                   // 441  // 470
    if (array == null) return void 0;                                                                    // 442  // 471
    if ((n == null) || guard) {                                                                          // 443  // 472
      return array[array.length - 1];                                                                    // 444  // 473
    } else {                                                                                             // 445  // 474
      return slice.call(array, Math.max(array.length - n, 0));                                           // 446  // 475
    }                                                                                                    // 447  // 476
  };                                                                                                     // 448  // 477
                                                                                                         // 449  // 478
  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.                  // 450  // 479
  // Especially useful on the arguments object. Passing an **n** will return                             // 451  // 480
  // the rest N values in the array. The **guard**                                                       // 452  // 481
  // check allows it to work with `_.map`.                                                               // 453  // 482
  _.rest = _.tail = _.drop = function(array, n, guard) {                                                 // 454  // 483
    return slice.call(array, (n == null) || guard ? 1 : n);                                              // 455  // 484
  };                                                                                                     // 456  // 485
                                                                                                         // 457  // 486
  // Trim out all falsy values from an array.                                                            // 458  // 487
  _.compact = function(array) {                                                                          // 459  // 488
    return _.filter(array, _.identity);                                                                  // 460  // 489
  };                                                                                                     // 461  // 490
                                                                                                         // 462  // 491
  // Internal implementation of a recursive `flatten` function.                                          // 463  // 492
  var flatten = function(input, shallow, output) {                                                       // 464  // 493
    if (shallow && _.every(input, _.isArray)) {                                                          // 465  // 494
      return concat.apply(output, input);                                                                // 466  // 495
    }                                                                                                    // 467  // 496
    each(input, function(value) {                                                                        // 468  // 497
      if (_.isArray(value) || _.isArguments(value)) {                                                    // 469  // 498
        shallow ? push.apply(output, value) : flatten(value, shallow, output);                           // 470  // 499
      } else {                                                                                           // 471  // 500
        output.push(value);                                                                              // 472  // 501
      }                                                                                                  // 473  // 502
    });                                                                                                  // 474  // 503
    return output;                                                                                       // 475  // 504
  };                                                                                                     // 476  // 505
                                                                                                         // 477  // 506
  // Flatten out an array, either recursively (by default), or just one level.                           // 478  // 507
  _.flatten = function(array, shallow) {                                                                 // 479  // 508
    return flatten(array, shallow, []);                                                                  // 480  // 509
  };                                                                                                     // 481  // 510
                                                                                                         // 482  // 511
  // Return a version of the array that does not contain the specified value(s).                         // 483  // 512
  _.without = function(array) {                                                                          // 484  // 513
    return _.difference(array, slice.call(arguments, 1));                                                // 485  // 514
  };                                                                                                     // 486  // 515
                                                                                                         // 487  // 516
  // Produce a duplicate-free version of the array. If the array has already                             // 488  // 517
  // been sorted, you have the option of using a faster algorithm.                                       // 489  // 518
  // Aliased as `unique`.                                                                                // 490  // 519
  _.uniq = _.unique = function(array, isSorted, iterator, context) {                                     // 491  // 520
    if (_.isFunction(isSorted)) {                                                                        // 492  // 521
      context = iterator;                                                                                // 493  // 522
      iterator = isSorted;                                                                               // 494  // 523
      isSorted = false;                                                                                  // 495  // 524
    }                                                                                                    // 496  // 525
    var initial = iterator ? _.map(array, iterator, context) : array;                                    // 497  // 526
    var results = [];                                                                                    // 498  // 527
    var seen = [];                                                                                       // 499  // 528
    each(initial, function(value, index) {                                                               // 500  // 529
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {           // 501  // 530
        seen.push(value);                                                                                // 502  // 531
        results.push(array[index]);                                                                      // 503  // 532
      }                                                                                                  // 504  // 533
    });                                                                                                  // 505  // 534
    return results;                                                                                      // 506  // 535
  };                                                                                                     // 507  // 536
                                                                                                         // 508  // 537
  // Produce an array that contains the union: each distinct element from all of                         // 509  // 538
  // the passed-in arrays.                                                                               // 510  // 539
  _.union = function() {                                                                                 // 511  // 540
    return _.uniq(_.flatten(arguments, true));                                                           // 512  // 541
  };                                                                                                     // 513  // 542
                                                                                                         // 514  // 543
  // Produce an array that contains every item shared between all the                                    // 515  // 544
  // passed-in arrays.                                                                                   // 516  // 545
  _.intersection = function(array) {                                                                     // 517  // 546
    var rest = slice.call(arguments, 1);                                                                 // 518  // 547
    return _.filter(_.uniq(array), function(item) {                                                      // 519  // 548
      return _.every(rest, function(other) {                                                             // 520  // 549
        return _.indexOf(other, item) >= 0;                                                              // 521  // 550
      });                                                                                                // 522  // 551
    });                                                                                                  // 523  // 552
  };                                                                                                     // 524  // 553
                                                                                                         // 525  // 554
  // Take the difference between one array and a number of other arrays.                                 // 526  // 555
  // Only the elements present in just the first array will remain.                                      // 527  // 556
  _.difference = function(array) {                                                                       // 528  // 557
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));                                       // 529  // 558
    return _.filter(array, function(value){ return !_.contains(rest, value); });                         // 530  // 559
  };                                                                                                     // 531  // 560
                                                                                                         // 532  // 561
  // Zip together multiple lists into a single array -- elements that share                              // 533  // 562
  // an index go together.                                                                               // 534  // 563
  _.zip = function() {                                                                                   // 535  // 564
    var length = _.max(_.pluck(arguments, "length").concat(0));                                          // 536  // 565
    var results = new Array(length);                                                                     // 537  // 566
    for (var i = 0; i < length; i++) {                                                                   // 538  // 567
      results[i] = _.pluck(arguments, '' + i);                                                           // 539  // 568
    }                                                                                                    // 540  // 569
    return results;                                                                                      // 541  // 570
  };                                                                                                     // 542  // 571
                                                                                                         // 543  // 572
  // Converts lists into objects. Pass either a single array of `[key, value]`                           // 544  // 573
  // pairs, or two parallel arrays of the same length -- one of keys, and one of                         // 545  // 574
  // the corresponding values.                                                                           // 546  // 575
  _.object = function(list, values) {                                                                    // 547  // 576
    if (list == null) return {};                                                                         // 548  // 577
    var result = {};                                                                                     // 549  // 578
    for (var i = 0, length = list.length; i < length; i++) {                                             // 550  // 579
      if (values) {                                                                                      // 551  // 580
        result[list[i]] = values[i];                                                                     // 552  // 581
      } else {                                                                                           // 553  // 582
        result[list[i][0]] = list[i][1];                                                                 // 554  // 583
      }                                                                                                  // 555  // 584
    }                                                                                                    // 556  // 585
    return result;                                                                                       // 557  // 586
  };                                                                                                     // 558  // 587
                                                                                                         // 559  // 588
  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),                       // 560  // 589
  // we need this function. Return the position of the first occurrence of an                            // 561  // 590
  // item in an array, or -1 if the item is not included in the array.                                   // 562  // 591
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.                                      // 563  // 592
  // If the array is large and already in sort order, pass `true`                                        // 564  // 593
  // for **isSorted** to use binary search.                                                              // 565  // 594
  _.indexOf = function(array, item, isSorted) {                                                          // 566  // 595
    if (array == null) return -1;                                                                        // 567  // 596
    var i = 0, length = array.length;                                                                    // 568  // 597
    if (isSorted) {                                                                                      // 569  // 598
      if (typeof isSorted == 'number') {                                                                 // 570  // 599
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);                                  // 571  // 600
      } else {                                                                                           // 572  // 601
        i = _.sortedIndex(array, item);                                                                  // 573  // 602
        return array[i] === item ? i : -1;                                                               // 574  // 603
      }                                                                                                  // 575  // 604
    }                                                                                                    // 576  // 605
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);          // 577  // 606
    for (; i < length; i++) if (array[i] === item) return i;                                             // 578  // 607
    return -1;                                                                                           // 579  // 608
  };                                                                                                     // 580  // 609
                                                                                                         // 581  // 610
  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.                                  // 582  // 611
  _.lastIndexOf = function(array, item, from) {                                                          // 583  // 612
    if (array == null) return -1;                                                                        // 584  // 613
    var hasIndex = from != null;                                                                         // 585  // 614
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {                                  // 586  // 615
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);                         // 587  // 616
    }                                                                                                    // 588  // 617
    var i = (hasIndex ? from : array.length);                                                            // 589  // 618
    while (i--) if (array[i] === item) return i;                                                         // 590  // 619
    return -1;                                                                                           // 591  // 620
  };                                                                                                     // 592  // 621
                                                                                                         // 593  // 622
  // Generate an integer Array containing an arithmetic progression. A port of                           // 594  // 623
  // the native Python `range()` function. See                                                           // 595  // 624
  // [the Python documentation](http://docs.python.org/library/functions.html#range).                    // 596  // 625
  _.range = function(start, stop, step) {                                                                // 597  // 626
    if (arguments.length <= 1) {                                                                         // 598  // 627
      stop = start || 0;                                                                                 // 599  // 628
      start = 0;                                                                                         // 600  // 629
    }                                                                                                    // 601  // 630
    step = arguments[2] || 1;                                                                            // 602  // 631
                                                                                                         // 603  // 632
    var length = Math.max(Math.ceil((stop - start) / step), 0);                                          // 604  // 633
    var idx = 0;                                                                                         // 605  // 634
    var range = new Array(length);                                                                       // 606  // 635
                                                                                                         // 607  // 636
    while(idx < length) {                                                                                // 608  // 637
      range[idx++] = start;                                                                              // 609  // 638
      start += step;                                                                                     // 610  // 639
    }                                                                                                    // 611  // 640
                                                                                                         // 612  // 641
    return range;                                                                                        // 613  // 642
  };                                                                                                     // 614  // 643
                                                                                                         // 615  // 644
  // Function (ahem) Functions                                                                           // 616  // 645
  // ------------------                                                                                  // 617  // 646
                                                                                                         // 618  // 647
  // Reusable constructor function for prototype setting.                                                // 619  // 648
  var ctor = function(){};                                                                               // 620  // 649
                                                                                                         // 621  // 650
  // Create a function bound to a given object (assigning `this`, and arguments,                         // 622  // 651
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if                              // 623  // 652
  // available.                                                                                          // 624  // 653
  _.bind = function(func, context) {                                                                     // 625  // 654
    var args, bound;                                                                                     // 626  // 655
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));         // 656
    if (!_.isFunction(func)) throw new TypeError;                                                        // 628  // 657
    args = slice.call(arguments, 2);                                                                     // 629  // 658
    return bound = function() {                                                                          // 630  // 659
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));      // 631  // 660
      ctor.prototype = func.prototype;                                                                   // 632  // 661
      var self = new ctor;                                                                               // 633  // 662
      ctor.prototype = null;                                                                             // 634  // 663
      var result = func.apply(self, args.concat(slice.call(arguments)));                                 // 635  // 664
      if (Object(result) === result) return result;                                                      // 636  // 665
      return self;                                                                                       // 637  // 666
    };                                                                                                   // 638  // 667
  };                                                                                                     // 639  // 668
                                                                                                         // 640  // 669
  // Partially apply a function by creating a version that has had some of its                           // 641  // 670
  // arguments pre-filled, without changing its dynamic `this` context.                                  // 642  // 671
  _.partial = function(func) {                                                                           // 643  // 672
    var args = slice.call(arguments, 1);                                                                 // 644  // 673
    return function() {                                                                                  // 645  // 674
      return func.apply(this, args.concat(slice.call(arguments)));                                       // 646  // 675
    };                                                                                                   // 647  // 676
  };                                                                                                     // 648  // 677
                                                                                                         // 649  // 678
  // Bind all of an object's methods to that object. Useful for ensuring that                            // 650  // 679
  // all callbacks defined on an object belong to it.                                                    // 651  // 680
  _.bindAll = function(obj) {                                                                            // 652  // 681
    var funcs = slice.call(arguments, 1);                                                                // 653  // 682
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");                    // 654  // 683
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });                                          // 655  // 684
    return obj;                                                                                          // 656  // 685
  };                                                                                                     // 657  // 686
                                                                                                         // 658  // 687
  // Memoize an expensive function by storing its results.                                               // 659  // 688
  _.memoize = function(func, hasher) {                                                                   // 660  // 689
    var memo = {};                                                                                       // 661  // 690
    hasher || (hasher = _.identity);                                                                     // 662  // 691
    return function() {                                                                                  // 663  // 692
      var key = hasher.apply(this, arguments);                                                           // 664  // 693
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));                   // 665  // 694
    };                                                                                                   // 666  // 695
  };                                                                                                     // 667  // 696
                                                                                                         // 668  // 697
  // Delays a function for the given number of milliseconds, and then calls                              // 669  // 698
  // it with the arguments supplied.                                                                     // 670  // 699
  _.delay = function(func, wait) {                                                                       // 671  // 700
    var args = slice.call(arguments, 2);                                                                 // 672  // 701
    return setTimeout(function(){ return func.apply(null, args); }, wait);                               // 673  // 702
  };                                                                                                     // 674  // 703
                                                                                                         // 675  // 704
  // Defers a function, scheduling it to run after the current call stack has                            // 676  // 705
  // cleared.                                                                                            // 677  // 706
  _.defer = function(func) {                                                                             // 678  // 707
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));                                 // 679  // 708
  };                                                                                                     // 680  // 709
                                                                                                         // 681  // 710
  // Returns a function, that, when invoked, will only be triggered at most once                         // 682  // 711
  // during a given window of time. Normally, the throttled function will run                            // 683  // 712
  // as much as it can, without ever going more than once per `wait` duration;                           // 684  // 713
  // but if you'd like to disable the execution on the leading edge, pass                                // 685  // 714
  // `{leading: false}`. To disable execution on the trailing edge, ditto.                               // 686  // 715
  _.throttle = function(func, wait, options) {                                                           // 687  // 716
    var context, args, result;                                                                           // 688  // 717
    var timeout = null;                                                                                  // 689  // 718
    var previous = 0;                                                                                    // 690  // 719
    options || (options = {});                                                                           // 691  // 720
    var later = function() {                                                                             // 692  // 721
      previous = options.leading === false ? 0 : new Date;                                               // 693  // 722
      timeout = null;                                                                                    // 694  // 723
      result = func.apply(context, args);                                                                // 695  // 724
    };                                                                                                   // 696  // 725
    return function() {                                                                                  // 697  // 726
      var now = new Date;                                                                                // 698  // 727
      if (!previous && options.leading === false) previous = now;                                        // 699  // 728
      var remaining = wait - (now - previous);                                                           // 700  // 729
      context = this;                                                                                    // 701  // 730
      args = arguments;                                                                                  // 702  // 731
      if (remaining <= 0) {                                                                              // 703  // 732
        clearTimeout(timeout);                                                                           // 704  // 733
        timeout = null;                                                                                  // 705  // 734
        previous = now;                                                                                  // 706  // 735
        result = func.apply(context, args);                                                              // 707  // 736
      } else if (!timeout && options.trailing !== false) {                                               // 708  // 737
        timeout = setTimeout(later, remaining);                                                          // 709  // 738
      }                                                                                                  // 710  // 739
      return result;                                                                                     // 711  // 740
    };                                                                                                   // 712  // 741
  };                                                                                                     // 713  // 742
                                                                                                         // 714  // 743
  // Returns a function, that, as long as it continues to be invoked, will not                           // 715  // 744
  // be triggered. The function will be called after it stops being called for                           // 716  // 745
  // N milliseconds. If `immediate` is passed, trigger the function on the                               // 717  // 746
  // leading edge, instead of the trailing.                                                              // 718  // 747
  _.debounce = function(func, wait, immediate) {                                                         // 719  // 748
    var timeout, args, context, timestamp, result;                                                       // 720  // 749
    return function() {                                                                                  // 721  // 750
      context = this;                                                                                    // 722  // 751
      args = arguments;                                                                                  // 723  // 752
      timestamp = new Date();                                                                            // 724  // 753
      var later = function() {                                                                           // 725  // 754
        var last = (new Date()) - timestamp;                                                             // 726  // 755
        if (last < wait) {                                                                               // 727  // 756
          timeout = setTimeout(later, wait - last);                                                      // 728  // 757
        } else {                                                                                         // 729  // 758
          timeout = null;                                                                                // 730  // 759
          if (!immediate) result = func.apply(context, args);                                            // 731  // 760
        }                                                                                                // 732  // 761
      };                                                                                                 // 733  // 762
      var callNow = immediate && !timeout;                                                               // 734  // 763
      if (!timeout) {                                                                                    // 735  // 764
        timeout = setTimeout(later, wait);                                                               // 736  // 765
      }                                                                                                  // 737  // 766
      if (callNow) result = func.apply(context, args);                                                   // 738  // 767
      return result;                                                                                     // 739  // 768
    };                                                                                                   // 740  // 769
  };                                                                                                     // 741  // 770
                                                                                                         // 742  // 771
  // Returns a function that will be executed at most one time, no matter how                            // 743  // 772
  // often you call it. Useful for lazy initialization.                                                  // 744  // 773
  _.once = function(func) {                                                                              // 745  // 774
    var ran = false, memo;                                                                               // 746  // 775
    return function() {                                                                                  // 747  // 776
      if (ran) return memo;                                                                              // 748  // 777
      ran = true;                                                                                        // 749  // 778
      memo = func.apply(this, arguments);                                                                // 750  // 779
      func = null;                                                                                       // 751  // 780
      return memo;                                                                                       // 752  // 781
    };                                                                                                   // 753  // 782
  };                                                                                                     // 754  // 783
                                                                                                         // 755  // 784
  // Returns the first function passed as an argument to the second,                                     // 756  // 785
  // allowing you to adjust arguments, run code before and after, and                                    // 757  // 786
  // conditionally execute the original function.                                                        // 758  // 787
  _.wrap = function(func, wrapper) {                                                                     // 759  // 788
    return function() {                                                                                  // 760  // 789
      var args = [func];                                                                                 // 761  // 790
      push.apply(args, arguments);                                                                       // 762  // 791
      return wrapper.apply(this, args);                                                                  // 763  // 792
    };                                                                                                   // 764  // 793
  };                                                                                                     // 765  // 794
                                                                                                         // 766  // 795
  // Returns a function that is the composition of a list of functions, each                             // 767  // 796
  // consuming the return value of the function that follows.                                            // 768  // 797
  _.compose = function() {                                                                               // 769  // 798
    var funcs = arguments;                                                                               // 770  // 799
    return function() {                                                                                  // 771  // 800
      var args = arguments;                                                                              // 772  // 801
      for (var i = funcs.length - 1; i >= 0; i--) {                                                      // 773  // 802
        args = [funcs[i].apply(this, args)];                                                             // 774  // 803
      }                                                                                                  // 775  // 804
      return args[0];                                                                                    // 776  // 805
    };                                                                                                   // 777  // 806
  };                                                                                                     // 778  // 807
                                                                                                         // 779  // 808
  // Returns a function that will only be executed after being called N times.                           // 780  // 809
  _.after = function(times, func) {                                                                      // 781  // 810
    return function() {                                                                                  // 782  // 811
      if (--times < 1) {                                                                                 // 783  // 812
        return func.apply(this, arguments);                                                              // 784  // 813
      }                                                                                                  // 785  // 814
    };                                                                                                   // 786  // 815
  };                                                                                                     // 787  // 816
                                                                                                         // 788  // 817
  // Object Functions                                                                                    // 789  // 818
  // ----------------                                                                                    // 790  // 819
                                                                                                         // 791  // 820
  // Retrieve the names of an object's properties.                                                       // 792  // 821
  // Delegates to **ECMAScript 5**'s native `Object.keys`                                                // 793  // 822
  _.keys = nativeKeys || function(obj) {                                                                 // 794  // 823
    if (obj !== Object(obj)) throw new TypeError('Invalid object');                                      // 795  // 824
    var keys = [];                                                                                       // 796  // 825
    for (var key in obj) if (_.has(obj, key)) keys.push(key);                                            // 797  // 826
    return keys;                                                                                         // 798  // 827
  };                                                                                                     // 799  // 828
                                                                                                         // 800  // 829
  // Retrieve the values of an object's properties.                                                      // 801  // 830
  _.values = function(obj) {                                                                             // 802  // 831
    var keys = _.keys(obj);                                                                              // 803  // 832
    var length = keys.length;                                                                            // 804  // 833
    var values = new Array(length);                                                                      // 805  // 834
    for (var i = 0; i < length; i++) {                                                                   // 806  // 835
      values[i] = obj[keys[i]];                                                                          // 807  // 836
    }                                                                                                    // 808  // 837
    return values;                                                                                       // 809  // 838
  };                                                                                                     // 810  // 839
                                                                                                         // 811  // 840
  // Convert an object into a list of `[key, value]` pairs.                                              // 812  // 841
  _.pairs = function(obj) {                                                                              // 813  // 842
    var keys = _.keys(obj);                                                                              // 814  // 843
    var length = keys.length;                                                                            // 815  // 844
    var pairs = new Array(length);                                                                       // 816  // 845
    for (var i = 0; i < length; i++) {                                                                   // 817  // 846
      pairs[i] = [keys[i], obj[keys[i]]];                                                                // 818  // 847
    }                                                                                                    // 819  // 848
    return pairs;                                                                                        // 820  // 849
  };                                                                                                     // 821  // 850
                                                                                                         // 822  // 851
  // Invert the keys and values of an object. The values must be serializable.                           // 823  // 852
  _.invert = function(obj) {                                                                             // 824  // 853
    var result = {};                                                                                     // 825  // 854
    var keys = _.keys(obj);                                                                              // 826  // 855
    for (var i = 0, length = keys.length; i < length; i++) {                                             // 827  // 856
      result[obj[keys[i]]] = keys[i];                                                                    // 828  // 857
    }                                                                                                    // 829  // 858
    return result;                                                                                       // 830  // 859
  };                                                                                                     // 831  // 860
                                                                                                         // 832  // 861
  // Return a sorted list of the function names available on the object.                                 // 833  // 862
  // Aliased as `methods`                                                                                // 834  // 863
  _.functions = _.methods = function(obj) {                                                              // 835  // 864
    var names = [];                                                                                      // 836  // 865
    for (var key in obj) {                                                                               // 837  // 866
      if (_.isFunction(obj[key])) names.push(key);                                                       // 838  // 867
    }                                                                                                    // 839  // 868
    return names.sort();                                                                                 // 840  // 869
  };                                                                                                     // 841  // 870
                                                                                                         // 842  // 871
  // Extend a given object with all the properties in passed-in object(s).                               // 843  // 872
  _.extend = function(obj) {                                                                             // 844  // 873
    each(slice.call(arguments, 1), function(source) {                                                    // 845  // 874
      if (source) {                                                                                      // 846  // 875
        for (var prop in source) {                                                                       // 847  // 876
          obj[prop] = source[prop];                                                                      // 848  // 877
        }                                                                                                // 849  // 878
      }                                                                                                  // 850  // 879
    });                                                                                                  // 851  // 880
    return obj;                                                                                          // 852  // 881
  };                                                                                                     // 853  // 882
                                                                                                         // 854  // 883
  // Return a copy of the object only containing the whitelisted properties.                             // 855  // 884
  _.pick = function(obj) {                                                                               // 856  // 885
    var copy = {};                                                                                       // 857  // 886
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));                                       // 858  // 887
    each(keys, function(key) {                                                                           // 859  // 888
      if (key in obj) copy[key] = obj[key];                                                              // 860  // 889
    });                                                                                                  // 861  // 890
    return copy;                                                                                         // 862  // 891
  };                                                                                                     // 863  // 892
                                                                                                         // 864  // 893
   // Return a copy of the object without the blacklisted properties.                                    // 865  // 894
  _.omit = function(obj) {                                                                               // 866  // 895
    var copy = {};                                                                                       // 867  // 896
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));                                       // 868  // 897
    for (var key in obj) {                                                                               // 869  // 898
      if (!_.contains(keys, key)) copy[key] = obj[key];                                                  // 870  // 899
    }                                                                                                    // 871  // 900
    return copy;                                                                                         // 872  // 901
  };                                                                                                     // 873  // 902
                                                                                                         // 874  // 903
  // Fill in a given object with default properties.                                                     // 875  // 904
  _.defaults = function(obj) {                                                                           // 876  // 905
    each(slice.call(arguments, 1), function(source) {                                                    // 877  // 906
      if (source) {                                                                                      // 878  // 907
        for (var prop in source) {                                                                       // 879  // 908
          if (obj[prop] === void 0) obj[prop] = source[prop];                                            // 880  // 909
        }                                                                                                // 881  // 910
      }                                                                                                  // 882  // 911
    });                                                                                                  // 883  // 912
    return obj;                                                                                          // 884  // 913
  };                                                                                                     // 885  // 914
                                                                                                         // 886  // 915
  // Create a (shallow-cloned) duplicate of an object.                                                   // 887  // 916
  _.clone = function(obj) {                                                                              // 888  // 917
    if (!_.isObject(obj)) return obj;                                                                    // 889  // 918
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);                                             // 890  // 919
  };                                                                                                     // 891  // 920
                                                                                                         // 892  // 921
  // Invokes interceptor with the obj, and then returns obj.                                             // 893  // 922
  // The primary purpose of this method is to "tap into" a method chain, in                              // 894  // 923
  // order to perform operations on intermediate results within the chain.                               // 895  // 924
  _.tap = function(obj, interceptor) {                                                                   // 896  // 925
    interceptor(obj);                                                                                    // 897  // 926
    return obj;                                                                                          // 898  // 927
  };                                                                                                     // 899  // 928
                                                                                                         // 900  // 929
  // Internal recursive comparison function for `isEqual`.                                               // 901  // 930
  var eq = function(a, b, aStack, bStack) {                                                              // 902  // 931
    // Identical objects are equal. `0 === -0`, but they aren't identical.                               // 903  // 932
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).           // 904  // 933
    if (a === b) return a !== 0 || 1 / a == 1 / b;                                                       // 905  // 934
    // A strict comparison is necessary because `null == undefined`.                                     // 906  // 935
    if (a == null || b == null) return a === b;                                                          // 907  // 936
    // Unwrap any wrapped objects.                                                                       // 908  // 937
    if (a instanceof _) a = a._wrapped;                                                                  // 909  // 938
    if (b instanceof _) b = b._wrapped;                                                                  // 910  // 939
    // Compare `[[Class]]` names.                                                                        // 911  // 940
    var className = toString.call(a);                                                                    // 912  // 941
    if (className != toString.call(b)) return false;                                                     // 913  // 942
    switch (className) {                                                                                 // 914  // 943
      // Strings, numbers, dates, and booleans are compared by value.                                    // 915  // 944
      case '[object String]':                                                                            // 916  // 945
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is             // 917  // 946
        // equivalent to `new String("5")`.                                                              // 918  // 947
        return a == String(b);                                                                           // 919  // 948
      case '[object Number]':                                                                            // 920  // 949
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for               // 921  // 950
        // other numeric values.                                                                         // 922  // 951
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);                                  // 923  // 952
      case '[object Date]':                                                                              // 924  // 953
      case '[object Boolean]':                                                                           // 925  // 954
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their            // 926  // 955
        // millisecond representations. Note that invalid dates with millisecond representations         // 927  // 956
        // of `NaN` are not equivalent.                                                                  // 928  // 957
        return +a == +b;                                                                                 // 929  // 958
      // RegExps are compared by their source patterns and flags.                                        // 930  // 959
      case '[object RegExp]':                                                                            // 931  // 960
        return a.source == b.source &&                                                                   // 932  // 961
               a.global == b.global &&                                                                   // 933  // 962
               a.multiline == b.multiline &&                                                             // 934  // 963
               a.ignoreCase == b.ignoreCase;                                                             // 935  // 964
    }                                                                                                    // 936  // 965
    if (typeof a != 'object' || typeof b != 'object') return false;                                      // 937  // 966
    // Assume equality for cyclic structures. The algorithm for detecting cyclic                         // 938  // 967
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.                       // 939  // 968
    var length = aStack.length;                                                                          // 940  // 969
    while (length--) {                                                                                   // 941  // 970
      // Linear search. Performance is inversely proportional to the number of                           // 942  // 971
      // unique nested structures.                                                                       // 943  // 972
      if (aStack[length] == a) return bStack[length] == b;                                               // 944  // 973
    }                                                                                                    // 945  // 974
    // Objects with different constructors are not equivalent, but `Object`s                             // 946  // 975
    // from different frames are.                                                                        // 947  // 976
    var aCtor = a.constructor, bCtor = b.constructor;                                                    // 948  // 977
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&                          // 949  // 978
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {                         // 950  // 979
      return false;                                                                                      // 951  // 980
    }                                                                                                    // 952  // 981
    // Add the first object to the stack of traversed objects.                                           // 953  // 982
    aStack.push(a);                                                                                      // 954  // 983
    bStack.push(b);                                                                                      // 955  // 984
    var size = 0, result = true;                                                                         // 956  // 985
    // Recursively compare objects and arrays.                                                           // 957  // 986
    if (className == '[object Array]') {                                                                 // 958  // 987
      // Compare array lengths to determine if a deep comparison is necessary.                           // 959  // 988
      size = a.length;                                                                                   // 960  // 989
      result = size == b.length;                                                                         // 961  // 990
      if (result) {                                                                                      // 962  // 991
        // Deep compare the contents, ignoring non-numeric properties.                                   // 963  // 992
        while (size--) {                                                                                 // 964  // 993
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;                                   // 965  // 994
        }                                                                                                // 966  // 995
      }                                                                                                  // 967  // 996
    } else {                                                                                             // 968  // 997
      // Deep compare objects.                                                                           // 969  // 998
      for (var key in a) {                                                                               // 970  // 999
        if (_.has(a, key)) {                                                                             // 971  // 1000
          // Count the expected number of properties.                                                    // 972  // 1001
          size++;                                                                                        // 973  // 1002
          // Deep compare each member.                                                                   // 974  // 1003
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;                    // 975  // 1004
        }                                                                                                // 976  // 1005
      }                                                                                                  // 977  // 1006
      // Ensure that both objects contain the same number of properties.                                 // 978  // 1007
      if (result) {                                                                                      // 979  // 1008
        for (key in b) {                                                                                 // 980  // 1009
          if (_.has(b, key) && !(size--)) break;                                                         // 981  // 1010
        }                                                                                                // 982  // 1011
        result = !size;                                                                                  // 983  // 1012
      }                                                                                                  // 984  // 1013
    }                                                                                                    // 985  // 1014
    // Remove the first object from the stack of traversed objects.                                      // 986  // 1015
    aStack.pop();                                                                                        // 987  // 1016
    bStack.pop();                                                                                        // 988  // 1017
    return result;                                                                                       // 989  // 1018
  };                                                                                                     // 990  // 1019
                                                                                                         // 991  // 1020
  // Perform a deep comparison to check if two objects are equal.                                        // 992  // 1021
  _.isEqual = function(a, b) {                                                                           // 993  // 1022
    return eq(a, b, [], []);                                                                             // 994  // 1023
  };                                                                                                     // 995  // 1024
                                                                                                         // 996  // 1025
  // Is a given array, string, or object empty?                                                          // 997  // 1026
  // An "empty" object has no enumerable own-properties.                                                 // 998  // 1027
  _.isEmpty = function(obj) {                                                                            // 999  // 1028
    if (obj == null) return true;                                                                        // 1000
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;                                      // 1001
    for (var key in obj) if (_.has(obj, key)) return false;                                              // 1002
    return true;                                                                                         // 1003
  };                                                                                                     // 1004
                                                                                                         // 1005
  // Is a given value a DOM element?                                                                     // 1006
  _.isElement = function(obj) {                                                                          // 1007
    return !!(obj && obj.nodeType === 1);                                                                // 1008
  };                                                                                                     // 1009
                                                                                                         // 1010
  // Is a given value an array?                                                                          // 1011
  // Delegates to ECMA5's native Array.isArray                                                           // 1012
  _.isArray = nativeIsArray || function(obj) {                                                           // 1013
    return toString.call(obj) == '[object Array]';                                                       // 1014
  };                                                                                                     // 1015
                                                                                                         // 1016
  // Is a given variable an object?                                                                      // 1017
  _.isObject = function(obj) {                                                                           // 1018
    return obj === Object(obj);                                                                          // 1019
  };                                                                                                     // 1020
                                                                                                         // 1021
  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.             // 1022
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {                 // 1023
    _['is' + name] = function(obj) {                                                                     // 1024
      return toString.call(obj) == '[object ' + name + ']';                                              // 1025
    };                                                                                                   // 1026
  });                                                                                                    // 1027
                                                                                                         // 1028
  // Define a fallback version of the method in browsers (ahem, IE), where                               // 1029
  // there isn't any inspectable "Arguments" type.                                                       // 1030
  if (!_.isArguments(arguments)) {                                                                       // 1031
    _.isArguments = function(obj) {                                                                      // 1032
      return !!(obj && _.has(obj, 'callee'));                                                            // 1033
    };                                                                                                   // 1034
  }                                                                                                      // 1035
                                                                                                         // 1036
  // Optimize `isFunction` if appropriate.                                                               // 1037
  if (typeof (/./) !== 'function') {                                                                     // 1038
    _.isFunction = function(obj) {                                                                       // 1039
      return typeof obj === 'function';                                                                  // 1040
    };                                                                                                   // 1041
  }                                                                                                      // 1042
                                                                                                         // 1043
  // Is a given object a finite number?                                                                  // 1044
  _.isFinite = function(obj) {                                                                           // 1045
    return isFinite(obj) && !isNaN(parseFloat(obj));                                                     // 1046
  };                                                                                                     // 1047
                                                                                                         // 1048
  // Is the given value `NaN`? (NaN is the only number which does not equal itself).                     // 1049
  _.isNaN = function(obj) {                                                                              // 1050
    return _.isNumber(obj) && obj != +obj;                                                               // 1051
  };                                                                                                     // 1052
                                                                                                         // 1053
  // Is a given value a boolean?                                                                         // 1054
  _.isBoolean = function(obj) {                                                                          // 1055
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';                    // 1056
  };                                                                                                     // 1057
                                                                                                         // 1058
  // Is a given value equal to null?                                                                     // 1059
  _.isNull = function(obj) {                                                                             // 1060
    return obj === null;                                                                                 // 1061
  };                                                                                                     // 1062
                                                                                                         // 1063
  // Is a given variable undefined?                                                                      // 1064
  _.isUndefined = function(obj) {                                                                        // 1065
    return obj === void 0;                                                                               // 1066
  };                                                                                                     // 1067
                                                                                                         // 1068
  // Shortcut function for checking if an object has a given property directly                           // 1069
  // on itself (in other words, not on a prototype).                                                     // 1070
  _.has = function(obj, key) {                                                                           // 1071
    return hasOwnProperty.call(obj, key);                                                                // 1072
  };                                                                                                     // 1073
                                                                                                         // 1074
  // Utility Functions                                                                                   // 1075
  // -----------------                                                                                   // 1076
                                                                                                         // 1077
  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its                           // 1078
  // previous owner. Returns a reference to the Underscore object.                                       // 1079
  _.noConflict = function() {                                                                            // 1080
    root._ = previousUnderscore;                                                                         // 1081
    return this;                                                                                         // 1082
  };                                                                                                     // 1083
                                                                                                         // 1084
  // Keep the identity function around for default iterators.                                            // 1085
  _.identity = function(value) {                                                                         // 1086
    return value;                                                                                        // 1087
  };                                                                                                     // 1088
                                                                                                         // 1089
  // Run a function **n** times.                                                                         // 1090
  _.times = function(n, iterator, context) {                                                             // 1091
    var accum = Array(Math.max(0, n));                                                                   // 1092
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);                                    // 1093
    return accum;                                                                                        // 1094
  };                                                                                                     // 1095
                                                                                                         // 1096
  // Return a random integer between min and max (inclusive).                                            // 1097
  _.random = function(min, max) {                                                                        // 1098
    if (max == null) {                                                                                   // 1099
      max = min;                                                                                         // 1100
      min = 0;                                                                                           // 1101
    }                                                                                                    // 1102
    return min + Math.floor(Math.random() * (max - min + 1));                                            // 1103
  };                                                                                                     // 1104
                                                                                                         // 1105
  // List of HTML entities for escaping.                                                                 // 1106
  var entityMap = {                                                                                      // 1107
    escape: {                                                                                            // 1108
      '&': '&amp;',                                                                                      // 1109
      '<': '&lt;',                                                                                       // 1110
      '>': '&gt;',                                                                                       // 1111
      '"': '&quot;',                                                                                     // 1112
      "'": '&#x27;'                                                                                      // 1113
    }                                                                                                    // 1114
  };                                                                                                     // 1115
  entityMap.unescape = _.invert(entityMap.escape);                                                       // 1116
                                                                                                         // 1117
  // Regexes containing the keys and values listed immediately above.                                    // 1118
  var entityRegexes = {                                                                                  // 1119
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),                            // 1120
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')                          // 1121
  };                                                                                                     // 1122
                                                                                                         // 1123
  // Functions for escaping and unescaping strings to/from HTML interpolation.                           // 1124
  _.each(['escape', 'unescape'], function(method) {                                                      // 1125
    _[method] = function(string) {                                                                       // 1126
      if (string == null) return '';                                                                     // 1127
      return ('' + string).replace(entityRegexes[method], function(match) {                              // 1128
        return entityMap[method][match];                                                                 // 1129
      });                                                                                                // 1130
    };                                                                                                   // 1131
  });                                                                                                    // 1132
                                                                                                         // 1133
  // If the value of the named `property` is a function then invoke it with the                          // 1134
  // `object` as context; otherwise, return it.                                                          // 1135
  _.result = function(object, property) {                                                                // 1136
    if (object == null) return void 0;                                                                   // 1137
    var value = object[property];                                                                        // 1138
    return _.isFunction(value) ? value.call(object) : value;                                             // 1139
  };                                                                                                     // 1140
                                                                                                         // 1141
  // Add your own custom functions to the Underscore object.                                             // 1142
  _.mixin = function(obj) {                                                                              // 1143
    each(_.functions(obj), function(name) {                                                              // 1144
      var func = _[name] = obj[name];                                                                    // 1145
      _.prototype[name] = function() {                                                                   // 1146
        var args = [this._wrapped];                                                                      // 1147
        push.apply(args, arguments);                                                                     // 1148
        return result.call(this, func.apply(_, args));                                                   // 1149
      };                                                                                                 // 1150
    });                                                                                                  // 1151
  };                                                                                                     // 1152
                                                                                                         // 1153
  // Generate a unique integer id (unique within the entire client session).                             // 1154
  // Useful for temporary DOM ids.                                                                       // 1155
  var idCounter = 0;                                                                                     // 1156
  _.uniqueId = function(prefix) {                                                                        // 1157
    var id = ++idCounter + '';                                                                           // 1158
    return prefix ? prefix + id : id;                                                                    // 1159
  };                                                                                                     // 1160
                                                                                                         // 1161
  // By default, Underscore uses ERB-style template delimiters, change the                               // 1162
  // following template settings to use alternative delimiters.                                          // 1163
  _.templateSettings = {                                                                                 // 1164
    evaluate    : /<%([\s\S]+?)%>/g,                                                                     // 1165
    interpolate : /<%=([\s\S]+?)%>/g,                                                                    // 1166
    escape      : /<%-([\s\S]+?)%>/g                                                                     // 1167
  };                                                                                                     // 1168
                                                                                                         // 1169
  // When customizing `templateSettings`, if you don't want to define an                                 // 1170
  // interpolation, evaluation or escaping regex, we need one that is                                    // 1171
  // guaranteed not to match.                                                                            // 1172
  var noMatch = /(.)^/;                                                                                  // 1173
                                                                                                         // 1174
  // Certain characters need to be escaped so that they can be put into a                                // 1175
  // string literal.                                                                                     // 1176
  var escapes = {                                                                                        // 1177
    "'":      "'",                                                                                       // 1178
    '\\':     '\\',                                                                                      // 1179
    '\r':     'r',                                                                                       // 1180
    '\n':     'n',                                                                                       // 1181
    '\t':     't',                                                                                       // 1182
    '\u2028': 'u2028',                                                                                   // 1183
    '\u2029': 'u2029'                                                                                    // 1184
  };                                                                                                     // 1185
                                                                                                         // 1186
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;                                                          // 1187
                                                                                                         // 1188
  // JavaScript micro-templating, similar to John Resig's implementation.                                // 1189
  // Underscore templating handles arbitrary delimiters, preserves whitespace,                           // 1190
  // and correctly escapes quotes within interpolated code.                                              // 1191
  _.template = function(text, data, settings) {                                                          // 1192
    var render;                                                                                          // 1193
    settings = _.defaults({}, settings, _.templateSettings);                                             // 1194
                                                                                                         // 1195
    // Combine delimiters into one regular expression via alternation.                                   // 1196
    var matcher = new RegExp([                                                                           // 1197
      (settings.escape || noMatch).source,                                                               // 1198
      (settings.interpolate || noMatch).source,                                                          // 1199
      (settings.evaluate || noMatch).source                                                              // 1200
    ].join('|') + '|$', 'g');                                                                            // 1201
                                                                                                         // 1202
    // Compile the template source, escaping string literals appropriately.                              // 1203
    var index = 0;                                                                                       // 1204
    var source = "__p+='";                                                                               // 1205
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {                       // 1206
      source += text.slice(index, offset)                                                                // 1207
        .replace(escaper, function(match) { return '\\' + escapes[match]; });                            // 1208
                                                                                                         // 1209
      if (escape) {                                                                                      // 1210
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";                             // 1211
      }                                                                                                  // 1212
      if (interpolate) {                                                                                 // 1213
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";                                  // 1214
      }                                                                                                  // 1215
      if (evaluate) {                                                                                    // 1216
        source += "';\n" + evaluate + "\n__p+='";                                                        // 1217
      }                                                                                                  // 1218
      index = offset + match.length;                                                                     // 1219
      return match;                                                                                      // 1220
    });                                                                                                  // 1221
    source += "';\n";                                                                                    // 1222
                                                                                                         // 1223
    // If a variable is not specified, place data values in local scope.                                 // 1224
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';                                // 1225
                                                                                                         // 1226
    source = "var __t,__p='',__j=Array.prototype.join," +                                                // 1227
      "print=function(){__p+=__j.call(arguments,'');};\n" +                                              // 1228
      source + "return __p;\n";                                                                          // 1229
                                                                                                         // 1230
    try {                                                                                                // 1231
      render = new Function(settings.variable || 'obj', '_', source);                                    // 1232
    } catch (e) {                                                                                        // 1233
      e.source = source;                                                                                 // 1234
      throw e;                                                                                           // 1235
    }                                                                                                    // 1236
                                                                                                         // 1237
    if (data) return render(data, _);                                                                    // 1238
    var template = function(data) {                                                                      // 1239
      return render.call(this, data, _);                                                                 // 1240
    };                                                                                                   // 1241
                                                                                                         // 1242
    // Provide the compiled function source as a convenience for precompilation.                         // 1243
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';                // 1244
                                                                                                         // 1245
    return template;                                                                                     // 1246
  };                                                                                                     // 1247
                                                                                                         // 1248
  // Add a "chain" function, which will delegate to the wrapper.                                         // 1249
  _.chain = function(obj) {                                                                              // 1250
    return _(obj).chain();                                                                               // 1251
  };                                                                                                     // 1252
                                                                                                         // 1253
  // OOP                                                                                                 // 1254
  // ---------------                                                                                     // 1255
  // If Underscore is called as a function, it returns a wrapped object that                             // 1256
  // can be used OO-style. This wrapper holds altered versions of all the                                // 1257
  // underscore functions. Wrapped objects may be chained.                                               // 1258
                                                                                                         // 1259
  // Helper function to continue chaining intermediate results.                                          // 1260
  var result = function(obj) {                                                                           // 1261
    return this._chain ? _(obj).chain() : obj;                                                           // 1262
  };                                                                                                     // 1263
                                                                                                         // 1264
  // Add all of the Underscore functions to the wrapper object.                                          // 1265
  _.mixin(_);                                                                                            // 1266
                                                                                                         // 1267
  // Add all mutator Array functions to the wrapper.                                                     // 1268
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {                // 1269
    var method = ArrayProto[name];                                                                       // 1270
    _.prototype[name] = function() {                                                                     // 1271
      var obj = this._wrapped;                                                                           // 1272
      method.apply(obj, arguments);                                                                      // 1273
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];                      // 1274
      return result.call(this, obj);                                                                     // 1275
    };                                                                                                   // 1276
  });                                                                                                    // 1277
                                                                                                         // 1278
  // Add all accessor Array functions to the wrapper.                                                    // 1279
  each(['concat', 'join', 'slice'], function(name) {                                                     // 1280
    var method = ArrayProto[name];                                                                       // 1281
    _.prototype[name] = function() {                                                                     // 1282
      return result.call(this, method.apply(this._wrapped, arguments));                                  // 1283
    };                                                                                                   // 1284
  });                                                                                                    // 1285
                                                                                                         // 1286
  _.extend(_.prototype, {                                                                                // 1287
                                                                                                         // 1288
    // Start chaining a wrapped Underscore object.                                                       // 1289
    chain: function() {                                                                                  // 1290
      this._chain = true;                                                                                // 1291
      return this;                                                                                       // 1292
    },                                                                                                   // 1293
                                                                                                         // 1294
    // Extracts the result from a wrapped and chained object.                                            // 1295
    value: function() {                                                                                  // 1296
      return this._wrapped;                                                                              // 1297
    }                                                                                                    // 1298
                                                                                                         // 1299
  });                                                                                                    // 1300
                                                                                                         // 1301
}).call(this);                                                                                           // 1302
                                                                                                         // 1303
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1333
                                                                                                                 // 1334
}).call(this);                                                                                                   // 1335
                                                                                                                 // 1336
                                                                                                                 // 1337
                                                                                                                 // 1338
                                                                                                                 // 1339
                                                                                                                 // 1340
                                                                                                                 // 1341
(function(){                                                                                                     // 1342
                                                                                                                 // 1343
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1344
//                                                                                                       //      // 1345
// packages/underscore/post.js                                                                           //      // 1346
//                                                                                                       //      // 1347
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1348
                                                                                                         //      // 1349
// This exports object was created in pre.js.  Now copy the `_` object from it                           // 1    // 1350
// into the package-scope variable `_`, which will get exported.                                         // 2    // 1351
_ = exports._;                                                                                           // 3    // 1352
                                                                                                         // 4    // 1353
///////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1354
                                                                                                                 // 1355
}).call(this);                                                                                                   // 1356
                                                                                                                 // 1357
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.underscore = {
  _: _
};

})();

//# sourceMappingURL=underscore.js.map
