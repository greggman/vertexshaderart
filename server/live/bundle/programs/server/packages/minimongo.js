(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;
var IdMap = Package['id-map'].IdMap;
var OrderedDict = Package['ordered-dict'].OrderedDict;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var MongoID = Package['mongo-id'].MongoID;
var Random = Package.random.Random;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var GeoJSON = Package['geojson-utils'].GeoJSON;

/* Package-scope variables */
var LocalCollection, Minimongo, MinimongoTest, MinimongoError, isArray, isPlainObject, isIndexable, isOperatorObject, isNumericKey, regexpElementMatcher, equalityElementMatcher, ELEMENT_OPERATORS, makeLookupFunction, expandArraysInBranches, projectionDetails, pathsToTree, combineImportantPathsIntoProjection;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/minimongo/packages/minimongo.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
(function(){                                                                                                          // 1
                                                                                                                      // 2
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3
//                                                                                                            //      // 4
// packages/minimongo/minimongo.js                                                                            //      // 5
//                                                                                                            //      // 6
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 7
                                                                                                              //      // 8
// XXX type checking on selectors (graceful error if malformed)                                               // 1    // 9
                                                                                                              // 2    // 10
// LocalCollection: a set of documents that supports queries and modifiers.                                   // 3    // 11
                                                                                                              // 4    // 12
// Cursor: a specification for a particular subset of documents, w/                                           // 5    // 13
// a defined order, limit, and offset.  creating a Cursor with LocalCollection.find(),                        // 6    // 14
                                                                                                              // 7    // 15
// ObserveHandle: the return value of a live query.                                                           // 8    // 16
                                                                                                              // 9    // 17
LocalCollection = function (name) {                                                                           // 10   // 18
  var self = this;                                                                                            // 11   // 19
  self.name = name;                                                                                           // 12   // 20
  // _id -> document (also containing id)                                                                     // 13   // 21
  self._docs = new LocalCollection._IdMap;                                                                    // 14   // 22
                                                                                                              // 15   // 23
  self._observeQueue = new Meteor._SynchronousQueue();                                                        // 16   // 24
                                                                                                              // 17   // 25
  self.next_qid = 1; // live query id generator                                                               // 18   // 26
                                                                                                              // 19   // 27
  // qid -> live query object. keys:                                                                          // 20   // 28
  //  ordered: bool. ordered queries have addedBefore/movedBefore callbacks.                                  // 21   // 29
  //  results: array (ordered) or object (unordered) of current results                                       // 22   // 30
  //    (aliased with self._docs!)                                                                            // 23   // 31
  //  resultsSnapshot: snapshot of results. null if not paused.                                               // 24   // 32
  //  cursor: Cursor object for the query.                                                                    // 25   // 33
  //  selector, sorter, (callbacks): functions                                                                // 26   // 34
  self.queries = {};                                                                                          // 27   // 35
                                                                                                              // 28   // 36
  // null if not saving originals; an IdMap from id to original document value if                             // 29   // 37
  // saving originals. See comments before saveOriginals().                                                   // 30   // 38
  self._savedOriginals = null;                                                                                // 31   // 39
                                                                                                              // 32   // 40
  // True when observers are paused and we should not send callbacks.                                         // 33   // 41
  self.paused = false;                                                                                        // 34   // 42
};                                                                                                            // 35   // 43
                                                                                                              // 36   // 44
Minimongo = {};                                                                                               // 37   // 45
                                                                                                              // 38   // 46
// Object exported only for unit testing.                                                                     // 39   // 47
// Use it to export private functions to test in Tinytest.                                                    // 40   // 48
MinimongoTest = {};                                                                                           // 41   // 49
                                                                                                              // 42   // 50
MinimongoError = function (message) {                                                                         // 43   // 51
  var e = new Error(message);                                                                                 // 44   // 52
  e.name = "MinimongoError";                                                                                  // 45   // 53
  return e;                                                                                                   // 46   // 54
};                                                                                                            // 47   // 55
                                                                                                              // 48   // 56
                                                                                                              // 49   // 57
// options may include sort, skip, limit, reactive                                                            // 50   // 58
// sort may be any of these forms:                                                                            // 51   // 59
//     {a: 1, b: -1}                                                                                          // 52   // 60
//     [["a", "asc"], ["b", "desc"]]                                                                          // 53   // 61
//     ["a", ["b", "desc"]]                                                                                   // 54   // 62
//   (in the first form you're beholden to key enumeration order in                                           // 55   // 63
//   your javascript VM)                                                                                      // 56   // 64
//                                                                                                            // 57   // 65
// reactive: if given, and false, don't register with Tracker (default                                        // 58   // 66
// is true)                                                                                                   // 59   // 67
//                                                                                                            // 60   // 68
// XXX possibly should support retrieving a subset of fields? and                                             // 61   // 69
// have it be a hint (ignored on the client, when not copying the                                             // 62   // 70
// doc?)                                                                                                      // 63   // 71
//                                                                                                            // 64   // 72
// XXX sort does not yet support subkeys ('a.b') .. fix that!                                                 // 65   // 73
// XXX add one more sort form: "key"                                                                          // 66   // 74
// XXX tests                                                                                                  // 67   // 75
LocalCollection.prototype.find = function (selector, options) {                                               // 68   // 76
  // default syntax for everything is to omit the selector argument.                                          // 69   // 77
  // but if selector is explicitly passed in as false or undefined, we                                        // 70   // 78
  // want a selector that matches nothing.                                                                    // 71   // 79
  if (arguments.length === 0)                                                                                 // 72   // 80
    selector = {};                                                                                            // 73   // 81
                                                                                                              // 74   // 82
  return new LocalCollection.Cursor(this, selector, options);                                                 // 75   // 83
};                                                                                                            // 76   // 84
                                                                                                              // 77   // 85
// don't call this ctor directly.  use LocalCollection.find().                                                // 78   // 86
                                                                                                              // 79   // 87
LocalCollection.Cursor = function (collection, selector, options) {                                           // 80   // 88
  var self = this;                                                                                            // 81   // 89
  if (!options) options = {};                                                                                 // 82   // 90
                                                                                                              // 83   // 91
  self.collection = collection;                                                                               // 84   // 92
  self.sorter = null;                                                                                         // 85   // 93
  self.matcher = new Minimongo.Matcher(selector);                                                             // 86   // 94
                                                                                                              // 87   // 95
  if (LocalCollection._selectorIsId(selector)) {                                                              // 88   // 96
    // stash for fast path                                                                                    // 89   // 97
    self._selectorId = selector;                                                                              // 90   // 98
  } else if (LocalCollection._selectorIsIdPerhapsAsObject(selector)) {                                        // 91   // 99
    // also do the fast path for { _id: idString }                                                            // 92   // 100
    self._selectorId = selector._id;                                                                          // 93   // 101
  } else {                                                                                                    // 94   // 102
    self._selectorId = undefined;                                                                             // 95   // 103
    if (self.matcher.hasGeoQuery() || options.sort) {                                                         // 96   // 104
      self.sorter = new Minimongo.Sorter(options.sort || [],                                                  // 97   // 105
                                         { matcher: self.matcher });                                          // 98   // 106
    }                                                                                                         // 99   // 107
  }                                                                                                           // 100  // 108
                                                                                                              // 101  // 109
  self.skip = options.skip;                                                                                   // 102  // 110
  self.limit = options.limit;                                                                                 // 103  // 111
  self.fields = options.fields;                                                                               // 104  // 112
                                                                                                              // 105  // 113
  self._projectionFn = LocalCollection._compileProjection(self.fields || {});                                 // 106  // 114
                                                                                                              // 107  // 115
  self._transform = LocalCollection.wrapTransform(options.transform);                                         // 108  // 116
                                                                                                              // 109  // 117
  // by default, queries register w/ Tracker when it is available.                                            // 110  // 118
  if (typeof Tracker !== "undefined")                                                                         // 111  // 119
    self.reactive = (options.reactive === undefined) ? true : options.reactive;                               // 112  // 120
};                                                                                                            // 113  // 121
                                                                                                              // 114  // 122
// Since we don't actually have a "nextObject" interface, there's really no                                   // 115  // 123
// reason to have a "rewind" interface.  All it did was make multiple calls                                   // 116  // 124
// to fetch/map/forEach return nothing the second time.                                                       // 117  // 125
// XXX COMPAT WITH 0.8.1                                                                                      // 118  // 126
LocalCollection.Cursor.prototype.rewind = function () {                                                       // 119  // 127
};                                                                                                            // 120  // 128
                                                                                                              // 121  // 129
LocalCollection.prototype.findOne = function (selector, options) {                                            // 122  // 130
  if (arguments.length === 0)                                                                                 // 123  // 131
    selector = {};                                                                                            // 124  // 132
                                                                                                              // 125  // 133
  // NOTE: by setting limit 1 here, we end up using very inefficient                                          // 126  // 134
  // code that recomputes the whole query on each update. The upside is                                       // 127  // 135
  // that when you reactively depend on a findOne you only get                                                // 128  // 136
  // invalidated when the found object changes, not any object in the                                         // 129  // 137
  // collection. Most findOne will be by id, which has a fast path, so                                        // 130  // 138
  // this might not be a big deal. In most cases, invalidation causes                                         // 131  // 139
  // the called to re-query anyway, so this should be a net performance                                       // 132  // 140
  // improvement.                                                                                             // 133  // 141
  options = options || {};                                                                                    // 134  // 142
  options.limit = 1;                                                                                          // 135  // 143
                                                                                                              // 136  // 144
  return this.find(selector, options).fetch()[0];                                                             // 137  // 145
};                                                                                                            // 138  // 146
                                                                                                              // 139  // 147
/**                                                                                                           // 140  // 148
 * @callback IterationCallback                                                                                // 141  // 149
 * @param {Object} doc                                                                                        // 142  // 150
 * @param {Number} index                                                                                      // 143  // 151
 */                                                                                                           // 144  // 152
/**                                                                                                           // 145  // 153
 * @summary Call `callback` once for each matching document, sequentially and synchronously.                  // 146  // 154
 * @locus Anywhere                                                                                            // 147  // 155
 * @method  forEach                                                                                           // 148  // 156
 * @instance                                                                                                  // 149  // 157
 * @memberOf Mongo.Cursor                                                                                     // 150  // 158
 * @param {IterationCallback} callback Function to call. It will be called with three arguments: the document, a 0-based index, and <em>cursor</em> itself.
 * @param {Any} [thisArg] An object which will be the value of `this` inside `callback`.                      // 152  // 160
 */                                                                                                           // 153  // 161
LocalCollection.Cursor.prototype.forEach = function (callback, thisArg) {                                     // 154  // 162
  var self = this;                                                                                            // 155  // 163
                                                                                                              // 156  // 164
  var objects = self._getRawObjects({ordered: true});                                                         // 157  // 165
                                                                                                              // 158  // 166
  if (self.reactive) {                                                                                        // 159  // 167
    self._depend({                                                                                            // 160  // 168
      addedBefore: true,                                                                                      // 161  // 169
      removed: true,                                                                                          // 162  // 170
      changed: true,                                                                                          // 163  // 171
      movedBefore: true});                                                                                    // 164  // 172
  }                                                                                                           // 165  // 173
                                                                                                              // 166  // 174
  _.each(objects, function (elt, i) {                                                                         // 167  // 175
    // This doubles as a clone operation.                                                                     // 168  // 176
    elt = self._projectionFn(elt);                                                                            // 169  // 177
                                                                                                              // 170  // 178
    if (self._transform)                                                                                      // 171  // 179
      elt = self._transform(elt);                                                                             // 172  // 180
    callback.call(thisArg, elt, i, self);                                                                     // 173  // 181
  });                                                                                                         // 174  // 182
};                                                                                                            // 175  // 183
                                                                                                              // 176  // 184
LocalCollection.Cursor.prototype.getTransform = function () {                                                 // 177  // 185
  return this._transform;                                                                                     // 178  // 186
};                                                                                                            // 179  // 187
                                                                                                              // 180  // 188
/**                                                                                                           // 181  // 189
 * @summary Map callback over all matching documents.  Returns an Array.                                      // 182  // 190
 * @locus Anywhere                                                                                            // 183  // 191
 * @method map                                                                                                // 184  // 192
 * @instance                                                                                                  // 185  // 193
 * @memberOf Mongo.Cursor                                                                                     // 186  // 194
 * @param {IterationCallback} callback Function to call. It will be called with three arguments: the document, a 0-based index, and <em>cursor</em> itself.
 * @param {Any} [thisArg] An object which will be the value of `this` inside `callback`.                      // 188  // 196
 */                                                                                                           // 189  // 197
LocalCollection.Cursor.prototype.map = function (callback, thisArg) {                                         // 190  // 198
  var self = this;                                                                                            // 191  // 199
  var res = [];                                                                                               // 192  // 200
  self.forEach(function (doc, index) {                                                                        // 193  // 201
    res.push(callback.call(thisArg, doc, index, self));                                                       // 194  // 202
  });                                                                                                         // 195  // 203
  return res;                                                                                                 // 196  // 204
};                                                                                                            // 197  // 205
                                                                                                              // 198  // 206
/**                                                                                                           // 199  // 207
 * @summary Return all matching documents as an Array.                                                        // 200  // 208
 * @memberOf Mongo.Cursor                                                                                     // 201  // 209
 * @method  fetch                                                                                             // 202  // 210
 * @instance                                                                                                  // 203  // 211
 * @locus Anywhere                                                                                            // 204  // 212
 * @returns {Object[]}                                                                                        // 205  // 213
 */                                                                                                           // 206  // 214
LocalCollection.Cursor.prototype.fetch = function () {                                                        // 207  // 215
  var self = this;                                                                                            // 208  // 216
  var res = [];                                                                                               // 209  // 217
  self.forEach(function (doc) {                                                                               // 210  // 218
    res.push(doc);                                                                                            // 211  // 219
  });                                                                                                         // 212  // 220
  return res;                                                                                                 // 213  // 221
};                                                                                                            // 214  // 222
                                                                                                              // 215  // 223
/**                                                                                                           // 216  // 224
 * @summary Returns the number of documents that match a query.                                               // 217  // 225
 * @memberOf Mongo.Cursor                                                                                     // 218  // 226
 * @method  count                                                                                             // 219  // 227
 * @instance                                                                                                  // 220  // 228
 * @locus Anywhere                                                                                            // 221  // 229
 * @returns {Number}                                                                                          // 222  // 230
 */                                                                                                           // 223  // 231
LocalCollection.Cursor.prototype.count = function () {                                                        // 224  // 232
  var self = this;                                                                                            // 225  // 233
                                                                                                              // 226  // 234
  if (self.reactive)                                                                                          // 227  // 235
    self._depend({added: true, removed: true},                                                                // 228  // 236
                 true /* allow the observe to be unordered */);                                               // 229  // 237
                                                                                                              // 230  // 238
  return self._getRawObjects({ordered: true}).length;                                                         // 231  // 239
};                                                                                                            // 232  // 240
                                                                                                              // 233  // 241
LocalCollection.Cursor.prototype._publishCursor = function (sub) {                                            // 234  // 242
  var self = this;                                                                                            // 235  // 243
  if (! self.collection.name)                                                                                 // 236  // 244
    throw new Error("Can't publish a cursor from a collection without a name.");                              // 237  // 245
  var collection = self.collection.name;                                                                      // 238  // 246
                                                                                                              // 239  // 247
  // XXX minimongo should not depend on mongo-livedata!                                                       // 240  // 248
  if (! Package.mongo) {                                                                                      // 241  // 249
    throw new Error("Can't publish from Minimongo without the `mongo` package.");                             // 242  // 250
  }                                                                                                           // 243  // 251
                                                                                                              // 244  // 252
  return Package.mongo.Mongo.Collection._publishCursor(self, sub, collection);                                // 245  // 253
};                                                                                                            // 246  // 254
                                                                                                              // 247  // 255
LocalCollection.Cursor.prototype._getCollectionName = function () {                                           // 248  // 256
  var self = this;                                                                                            // 249  // 257
  return self.collection.name;                                                                                // 250  // 258
};                                                                                                            // 251  // 259
                                                                                                              // 252  // 260
LocalCollection._observeChangesCallbacksAreOrdered = function (callbacks) {                                   // 253  // 261
  if (callbacks.added && callbacks.addedBefore)                                                               // 254  // 262
    throw new Error("Please specify only one of added() and addedBefore()");                                  // 255  // 263
  return !!(callbacks.addedBefore || callbacks.movedBefore);                                                  // 256  // 264
};                                                                                                            // 257  // 265
                                                                                                              // 258  // 266
LocalCollection._observeCallbacksAreOrdered = function (callbacks) {                                          // 259  // 267
  if (callbacks.addedAt && callbacks.added)                                                                   // 260  // 268
    throw new Error("Please specify only one of added() and addedAt()");                                      // 261  // 269
  if (callbacks.changedAt && callbacks.changed)                                                               // 262  // 270
    throw new Error("Please specify only one of changed() and changedAt()");                                  // 263  // 271
  if (callbacks.removed && callbacks.removedAt)                                                               // 264  // 272
    throw new Error("Please specify only one of removed() and removedAt()");                                  // 265  // 273
                                                                                                              // 266  // 274
  return !!(callbacks.addedAt || callbacks.movedTo || callbacks.changedAt                                     // 267  // 275
            || callbacks.removedAt);                                                                          // 268  // 276
};                                                                                                            // 269  // 277
                                                                                                              // 270  // 278
// the handle that comes back from observe.                                                                   // 271  // 279
LocalCollection.ObserveHandle = function () {};                                                               // 272  // 280
                                                                                                              // 273  // 281
// options to contain:                                                                                        // 274  // 282
//  * callbacks for observe():                                                                                // 275  // 283
//    - addedAt (document, atIndex)                                                                           // 276  // 284
//    - added (document)                                                                                      // 277  // 285
//    - changedAt (newDocument, oldDocument, atIndex)                                                         // 278  // 286
//    - changed (newDocument, oldDocument)                                                                    // 279  // 287
//    - removedAt (document, atIndex)                                                                         // 280  // 288
//    - removed (document)                                                                                    // 281  // 289
//    - movedTo (document, oldIndex, newIndex)                                                                // 282  // 290
//                                                                                                            // 283  // 291
// attributes available on returned query handle:                                                             // 284  // 292
//  * stop(): end updates                                                                                     // 285  // 293
//  * collection: the collection this query is querying                                                       // 286  // 294
//                                                                                                            // 287  // 295
// iff x is a returned query handle, (x instanceof                                                            // 288  // 296
// LocalCollection.ObserveHandle) is true                                                                     // 289  // 297
//                                                                                                            // 290  // 298
// initial results delivered through added callback                                                           // 291  // 299
// XXX maybe callbacks should take a list of objects, to expose transactions?                                 // 292  // 300
// XXX maybe support field limiting (to limit what you're notified on)                                        // 293  // 301
                                                                                                              // 294  // 302
_.extend(LocalCollection.Cursor.prototype, {                                                                  // 295  // 303
  /**                                                                                                         // 296  // 304
   * @summary Watch a query.  Receive callbacks as the result set changes.                                    // 297  // 305
   * @locus Anywhere                                                                                          // 298  // 306
   * @memberOf Mongo.Cursor                                                                                   // 299  // 307
   * @instance                                                                                                // 300  // 308
   * @param {Object} callbacks Functions to call to deliver the result set as it changes                      // 301  // 309
   */                                                                                                         // 302  // 310
  observe: function (options) {                                                                               // 303  // 311
    var self = this;                                                                                          // 304  // 312
    return LocalCollection._observeFromObserveChanges(self, options);                                         // 305  // 313
  },                                                                                                          // 306  // 314
                                                                                                              // 307  // 315
  /**                                                                                                         // 308  // 316
   * @summary Watch a query.  Receive callbacks as the result set changes.  Only the differences between the old and new documents are passed to the callbacks.
   * @locus Anywhere                                                                                          // 310  // 318
   * @memberOf Mongo.Cursor                                                                                   // 311  // 319
   * @instance                                                                                                // 312  // 320
   * @param {Object} callbacks Functions to call to deliver the result set as it changes                      // 313  // 321
   */                                                                                                         // 314  // 322
  observeChanges: function (options) {                                                                        // 315  // 323
    var self = this;                                                                                          // 316  // 324
                                                                                                              // 317  // 325
    var ordered = LocalCollection._observeChangesCallbacksAreOrdered(options);                                // 318  // 326
                                                                                                              // 319  // 327
    // there are several places that assume you aren't combining skip/limit with                              // 320  // 328
    // unordered observe.  eg, update's EJSON.clone, and the "there are several"                              // 321  // 329
    // comment in _modifyAndNotify                                                                            // 322  // 330
    // XXX allow skip/limit with unordered observe                                                            // 323  // 331
    if (!options._allow_unordered && !ordered && (self.skip || self.limit))                                   // 324  // 332
      throw new Error("must use ordered observe (ie, 'addedBefore' instead of 'added') with skip or limit");  // 325  // 333
                                                                                                              // 326  // 334
    if (self.fields && (self.fields._id === 0 || self.fields._id === false))                                  // 327  // 335
      throw Error("You may not observe a cursor with {fields: {_id: 0}}");                                    // 328  // 336
                                                                                                              // 329  // 337
    var query = {                                                                                             // 330  // 338
      matcher: self.matcher, // not fast pathed                                                               // 331  // 339
      sorter: ordered && self.sorter,                                                                         // 332  // 340
      distances: (                                                                                            // 333  // 341
        self.matcher.hasGeoQuery() && ordered && new LocalCollection._IdMap),                                 // 334  // 342
      resultsSnapshot: null,                                                                                  // 335  // 343
      ordered: ordered,                                                                                       // 336  // 344
      cursor: self,                                                                                           // 337  // 345
      projectionFn: self._projectionFn                                                                        // 338  // 346
    };                                                                                                        // 339  // 347
    var qid;                                                                                                  // 340  // 348
                                                                                                              // 341  // 349
    // Non-reactive queries call added[Before] and then never call anything                                   // 342  // 350
    // else.                                                                                                  // 343  // 351
    if (self.reactive) {                                                                                      // 344  // 352
      qid = self.collection.next_qid++;                                                                       // 345  // 353
      self.collection.queries[qid] = query;                                                                   // 346  // 354
    }                                                                                                         // 347  // 355
    query.results = self._getRawObjects({                                                                     // 348  // 356
      ordered: ordered, distances: query.distances});                                                         // 349  // 357
    if (self.collection.paused)                                                                               // 350  // 358
      query.resultsSnapshot = (ordered ? [] : new LocalCollection._IdMap);                                    // 351  // 359
                                                                                                              // 352  // 360
    // wrap callbacks we were passed. callbacks only fire when not paused and                                 // 353  // 361
    // are never undefined                                                                                    // 354  // 362
    // Filters out blacklisted fields according to cursor's projection.                                       // 355  // 363
    // XXX wrong place for this?                                                                              // 356  // 364
                                                                                                              // 357  // 365
    // furthermore, callbacks enqueue until the operation we're working on is                                 // 358  // 366
    // done.                                                                                                  // 359  // 367
    var wrapCallback = function (f) {                                                                         // 360  // 368
      if (!f)                                                                                                 // 361  // 369
        return function () {};                                                                                // 362  // 370
      return function (/*args*/) {                                                                            // 363  // 371
        var context = this;                                                                                   // 364  // 372
        var args = arguments;                                                                                 // 365  // 373
                                                                                                              // 366  // 374
        if (self.collection.paused)                                                                           // 367  // 375
          return;                                                                                             // 368  // 376
                                                                                                              // 369  // 377
        self.collection._observeQueue.queueTask(function () {                                                 // 370  // 378
          f.apply(context, args);                                                                             // 371  // 379
        });                                                                                                   // 372  // 380
      };                                                                                                      // 373  // 381
    };                                                                                                        // 374  // 382
    query.added = wrapCallback(options.added);                                                                // 375  // 383
    query.changed = wrapCallback(options.changed);                                                            // 376  // 384
    query.removed = wrapCallback(options.removed);                                                            // 377  // 385
    if (ordered) {                                                                                            // 378  // 386
      query.addedBefore = wrapCallback(options.addedBefore);                                                  // 379  // 387
      query.movedBefore = wrapCallback(options.movedBefore);                                                  // 380  // 388
    }                                                                                                         // 381  // 389
                                                                                                              // 382  // 390
    if (!options._suppress_initial && !self.collection.paused) {                                              // 383  // 391
      // XXX unify ordered and unordered interface                                                            // 384  // 392
      var each = ordered                                                                                      // 385  // 393
            ? _.bind(_.each, null, query.results)                                                             // 386  // 394
            : _.bind(query.results.forEach, query.results);                                                   // 387  // 395
      each(function (doc) {                                                                                   // 388  // 396
        var fields = EJSON.clone(doc);                                                                        // 389  // 397
                                                                                                              // 390  // 398
        delete fields._id;                                                                                    // 391  // 399
        if (ordered)                                                                                          // 392  // 400
          query.addedBefore(doc._id, self._projectionFn(fields), null);                                       // 393  // 401
        query.added(doc._id, self._projectionFn(fields));                                                     // 394  // 402
      });                                                                                                     // 395  // 403
    }                                                                                                         // 396  // 404
                                                                                                              // 397  // 405
    var handle = new LocalCollection.ObserveHandle;                                                           // 398  // 406
    _.extend(handle, {                                                                                        // 399  // 407
      collection: self.collection,                                                                            // 400  // 408
      stop: function () {                                                                                     // 401  // 409
        if (self.reactive)                                                                                    // 402  // 410
          delete self.collection.queries[qid];                                                                // 403  // 411
      }                                                                                                       // 404  // 412
    });                                                                                                       // 405  // 413
                                                                                                              // 406  // 414
    if (self.reactive && Tracker.active) {                                                                    // 407  // 415
      // XXX in many cases, the same observe will be recreated when                                           // 408  // 416
      // the current autorun is rerun.  we could save work by                                                 // 409  // 417
      // letting it linger across rerun and potentially get                                                   // 410  // 418
      // repurposed if the same observe is performed, using logic                                             // 411  // 419
      // similar to that of Meteor.subscribe.                                                                 // 412  // 420
      Tracker.onInvalidate(function () {                                                                      // 413  // 421
        handle.stop();                                                                                        // 414  // 422
      });                                                                                                     // 415  // 423
    }                                                                                                         // 416  // 424
    // run the observe callbacks resulting from the initial contents                                          // 417  // 425
    // before we leave the observe.                                                                           // 418  // 426
    self.collection._observeQueue.drain();                                                                    // 419  // 427
                                                                                                              // 420  // 428
    return handle;                                                                                            // 421  // 429
  }                                                                                                           // 422  // 430
});                                                                                                           // 423  // 431
                                                                                                              // 424  // 432
// Returns a collection of matching objects, but doesn't deep copy them.                                      // 425  // 433
//                                                                                                            // 426  // 434
// If ordered is set, returns a sorted array, respecting sorter, skip, and limit                              // 427  // 435
// properties of the query.  if sorter is falsey, no sort -- you get the natural                              // 428  // 436
// order.                                                                                                     // 429  // 437
//                                                                                                            // 430  // 438
// If ordered is not set, returns an object mapping from ID to doc (sorter, skip                              // 431  // 439
// and limit should not be set).                                                                              // 432  // 440
//                                                                                                            // 433  // 441
// If ordered is set and this cursor is a $near geoquery, then this function                                  // 434  // 442
// will use an _IdMap to track each distance from the $near argument point in                                 // 435  // 443
// order to use it as a sort key. If an _IdMap is passed in the 'distances'                                   // 436  // 444
// argument, this function will clear it and use it for this purpose (otherwise                               // 437  // 445
// it will just create its own _IdMap). The observeChanges implementation uses                                // 438  // 446
// this to remember the distances after this function returns.                                                // 439  // 447
LocalCollection.Cursor.prototype._getRawObjects = function (options) {                                        // 440  // 448
  var self = this;                                                                                            // 441  // 449
  options = options || {};                                                                                    // 442  // 450
                                                                                                              // 443  // 451
  // XXX use OrderedDict instead of array, and make IdMap and OrderedDict                                     // 444  // 452
  // compatible                                                                                               // 445  // 453
  var results = options.ordered ? [] : new LocalCollection._IdMap;                                            // 446  // 454
                                                                                                              // 447  // 455
  // fast path for single ID value                                                                            // 448  // 456
  if (self._selectorId !== undefined) {                                                                       // 449  // 457
    // If you have non-zero skip and ask for a single id, you get                                             // 450  // 458
    // nothing. This is so it matches the behavior of the '{_id: foo}'                                        // 451  // 459
    // path.                                                                                                  // 452  // 460
    if (self.skip)                                                                                            // 453  // 461
      return results;                                                                                         // 454  // 462
                                                                                                              // 455  // 463
    var selectedDoc = self.collection._docs.get(self._selectorId);                                            // 456  // 464
    if (selectedDoc) {                                                                                        // 457  // 465
      if (options.ordered)                                                                                    // 458  // 466
        results.push(selectedDoc);                                                                            // 459  // 467
      else                                                                                                    // 460  // 468
        results.set(self._selectorId, selectedDoc);                                                           // 461  // 469
    }                                                                                                         // 462  // 470
    return results;                                                                                           // 463  // 471
  }                                                                                                           // 464  // 472
                                                                                                              // 465  // 473
  // slow path for arbitrary selector, sort, skip, limit                                                      // 466  // 474
                                                                                                              // 467  // 475
  // in the observeChanges case, distances is actually part of the "query" (ie,                               // 468  // 476
  // live results set) object.  in other cases, distances is only used inside                                 // 469  // 477
  // this function.                                                                                           // 470  // 478
  var distances;                                                                                              // 471  // 479
  if (self.matcher.hasGeoQuery() && options.ordered) {                                                        // 472  // 480
    if (options.distances) {                                                                                  // 473  // 481
      distances = options.distances;                                                                          // 474  // 482
      distances.clear();                                                                                      // 475  // 483
    } else {                                                                                                  // 476  // 484
      distances = new LocalCollection._IdMap();                                                               // 477  // 485
    }                                                                                                         // 478  // 486
  }                                                                                                           // 479  // 487
                                                                                                              // 480  // 488
  self.collection._docs.forEach(function (doc, id) {                                                          // 481  // 489
    var matchResult = self.matcher.documentMatches(doc);                                                      // 482  // 490
    if (matchResult.result) {                                                                                 // 483  // 491
      if (options.ordered) {                                                                                  // 484  // 492
        results.push(doc);                                                                                    // 485  // 493
        if (distances && matchResult.distance !== undefined)                                                  // 486  // 494
          distances.set(id, matchResult.distance);                                                            // 487  // 495
      } else {                                                                                                // 488  // 496
        results.set(id, doc);                                                                                 // 489  // 497
      }                                                                                                       // 490  // 498
    }                                                                                                         // 491  // 499
    // Fast path for limited unsorted queries.                                                                // 492  // 500
    // XXX 'length' check here seems wrong for ordered                                                        // 493  // 501
    if (self.limit && !self.skip && !self.sorter &&                                                           // 494  // 502
        results.length === self.limit)                                                                        // 495  // 503
      return false;  // break                                                                                 // 496  // 504
    return true;  // continue                                                                                 // 497  // 505
  });                                                                                                         // 498  // 506
                                                                                                              // 499  // 507
  if (!options.ordered)                                                                                       // 500  // 508
    return results;                                                                                           // 501  // 509
                                                                                                              // 502  // 510
  if (self.sorter) {                                                                                          // 503  // 511
    var comparator = self.sorter.getComparator({distances: distances});                                       // 504  // 512
    results.sort(comparator);                                                                                 // 505  // 513
  }                                                                                                           // 506  // 514
                                                                                                              // 507  // 515
  var idx_start = self.skip || 0;                                                                             // 508  // 516
  var idx_end = self.limit ? (self.limit + idx_start) : results.length;                                       // 509  // 517
  return results.slice(idx_start, idx_end);                                                                   // 510  // 518
};                                                                                                            // 511  // 519
                                                                                                              // 512  // 520
// XXX Maybe we need a version of observe that just calls a callback if                                       // 513  // 521
// anything changed.                                                                                          // 514  // 522
LocalCollection.Cursor.prototype._depend = function (changers, _allow_unordered) {                            // 515  // 523
  var self = this;                                                                                            // 516  // 524
                                                                                                              // 517  // 525
  if (Tracker.active) {                                                                                       // 518  // 526
    var v = new Tracker.Dependency;                                                                           // 519  // 527
    v.depend();                                                                                               // 520  // 528
    var notifyChange = _.bind(v.changed, v);                                                                  // 521  // 529
                                                                                                              // 522  // 530
    var options = {                                                                                           // 523  // 531
      _suppress_initial: true,                                                                                // 524  // 532
      _allow_unordered: _allow_unordered                                                                      // 525  // 533
    };                                                                                                        // 526  // 534
    _.each(['added', 'changed', 'removed', 'addedBefore', 'movedBefore'],                                     // 527  // 535
           function (fnName) {                                                                                // 528  // 536
             if (changers[fnName])                                                                            // 529  // 537
               options[fnName] = notifyChange;                                                                // 530  // 538
           });                                                                                                // 531  // 539
                                                                                                              // 532  // 540
    // observeChanges will stop() when this computation is invalidated                                        // 533  // 541
    self.observeChanges(options);                                                                             // 534  // 542
  }                                                                                                           // 535  // 543
};                                                                                                            // 536  // 544
                                                                                                              // 537  // 545
// XXX enforce rule that field names can't start with '$' or contain '.'                                      // 538  // 546
// (real mongodb does in fact enforce this)                                                                   // 539  // 547
// XXX possibly enforce that 'undefined' does not appear (we assume                                           // 540  // 548
// this in our handling of null and $exists)                                                                  // 541  // 549
LocalCollection.prototype.insert = function (doc, callback) {                                                 // 542  // 550
  var self = this;                                                                                            // 543  // 551
  doc = EJSON.clone(doc);                                                                                     // 544  // 552
                                                                                                              // 545  // 553
  if (!_.has(doc, '_id')) {                                                                                   // 546  // 554
    // if you really want to use ObjectIDs, set this global.                                                  // 547  // 555
    // Mongo.Collection specifies its own ids and does not use this code.                                     // 548  // 556
    doc._id = LocalCollection._useOID ? new MongoID.ObjectID()                                                // 549  // 557
                                      : Random.id();                                                          // 550  // 558
  }                                                                                                           // 551  // 559
  var id = doc._id;                                                                                           // 552  // 560
                                                                                                              // 553  // 561
  if (self._docs.has(id))                                                                                     // 554  // 562
    throw MinimongoError("Duplicate _id '" + id + "'");                                                       // 555  // 563
                                                                                                              // 556  // 564
  self._saveOriginal(id, undefined);                                                                          // 557  // 565
  self._docs.set(id, doc);                                                                                    // 558  // 566
                                                                                                              // 559  // 567
  var queriesToRecompute = [];                                                                                // 560  // 568
  // trigger live queries that match                                                                          // 561  // 569
  for (var qid in self.queries) {                                                                             // 562  // 570
    var query = self.queries[qid];                                                                            // 563  // 571
    var matchResult = query.matcher.documentMatches(doc);                                                     // 564  // 572
    if (matchResult.result) {                                                                                 // 565  // 573
      if (query.distances && matchResult.distance !== undefined)                                              // 566  // 574
        query.distances.set(id, matchResult.distance);                                                        // 567  // 575
      if (query.cursor.skip || query.cursor.limit)                                                            // 568  // 576
        queriesToRecompute.push(qid);                                                                         // 569  // 577
      else                                                                                                    // 570  // 578
        LocalCollection._insertInResults(query, doc);                                                         // 571  // 579
    }                                                                                                         // 572  // 580
  }                                                                                                           // 573  // 581
                                                                                                              // 574  // 582
  _.each(queriesToRecompute, function (qid) {                                                                 // 575  // 583
    if (self.queries[qid])                                                                                    // 576  // 584
      self._recomputeResults(self.queries[qid]);                                                              // 577  // 585
  });                                                                                                         // 578  // 586
  self._observeQueue.drain();                                                                                 // 579  // 587
                                                                                                              // 580  // 588
  // Defer because the caller likely doesn't expect the callback to be run                                    // 581  // 589
  // immediately.                                                                                             // 582  // 590
  if (callback)                                                                                               // 583  // 591
    Meteor.defer(function () {                                                                                // 584  // 592
      callback(null, id);                                                                                     // 585  // 593
    });                                                                                                       // 586  // 594
  return id;                                                                                                  // 587  // 595
};                                                                                                            // 588  // 596
                                                                                                              // 589  // 597
// Iterates over a subset of documents that could match selector; calls                                       // 590  // 598
// f(doc, id) on each of them.  Specifically, if selector specifies                                           // 591  // 599
// specific _id's, it only looks at those.  doc is *not* cloned: it is the                                    // 592  // 600
// same object that is in _docs.                                                                              // 593  // 601
LocalCollection.prototype._eachPossiblyMatchingDoc = function (selector, f) {                                 // 594  // 602
  var self = this;                                                                                            // 595  // 603
  var specificIds = LocalCollection._idsMatchedBySelector(selector);                                          // 596  // 604
  if (specificIds) {                                                                                          // 597  // 605
    for (var i = 0; i < specificIds.length; ++i) {                                                            // 598  // 606
      var id = specificIds[i];                                                                                // 599  // 607
      var doc = self._docs.get(id);                                                                           // 600  // 608
      if (doc) {                                                                                              // 601  // 609
        var breakIfFalse = f(doc, id);                                                                        // 602  // 610
        if (breakIfFalse === false)                                                                           // 603  // 611
          break;                                                                                              // 604  // 612
      }                                                                                                       // 605  // 613
    }                                                                                                         // 606  // 614
  } else {                                                                                                    // 607  // 615
    self._docs.forEach(f);                                                                                    // 608  // 616
  }                                                                                                           // 609  // 617
};                                                                                                            // 610  // 618
                                                                                                              // 611  // 619
LocalCollection.prototype.remove = function (selector, callback) {                                            // 612  // 620
  var self = this;                                                                                            // 613  // 621
                                                                                                              // 614  // 622
  // Easy special case: if we're not calling observeChanges callbacks and we're                               // 615  // 623
  // not saving originals and we got asked to remove everything, then just empty                              // 616  // 624
  // everything directly.                                                                                     // 617  // 625
  if (self.paused && !self._savedOriginals && EJSON.equals(selector, {})) {                                   // 618  // 626
    var result = self._docs.size();                                                                           // 619  // 627
    self._docs.clear();                                                                                       // 620  // 628
    _.each(self.queries, function (query) {                                                                   // 621  // 629
      if (query.ordered) {                                                                                    // 622  // 630
        query.results = [];                                                                                   // 623  // 631
      } else {                                                                                                // 624  // 632
        query.results.clear();                                                                                // 625  // 633
      }                                                                                                       // 626  // 634
    });                                                                                                       // 627  // 635
    if (callback) {                                                                                           // 628  // 636
      Meteor.defer(function () {                                                                              // 629  // 637
        callback(null, result);                                                                               // 630  // 638
      });                                                                                                     // 631  // 639
    }                                                                                                         // 632  // 640
    return result;                                                                                            // 633  // 641
  }                                                                                                           // 634  // 642
                                                                                                              // 635  // 643
  var matcher = new Minimongo.Matcher(selector);                                                              // 636  // 644
  var remove = [];                                                                                            // 637  // 645
  self._eachPossiblyMatchingDoc(selector, function (doc, id) {                                                // 638  // 646
    if (matcher.documentMatches(doc).result)                                                                  // 639  // 647
      remove.push(id);                                                                                        // 640  // 648
  });                                                                                                         // 641  // 649
                                                                                                              // 642  // 650
  var queriesToRecompute = [];                                                                                // 643  // 651
  var queryRemove = [];                                                                                       // 644  // 652
  for (var i = 0; i < remove.length; i++) {                                                                   // 645  // 653
    var removeId = remove[i];                                                                                 // 646  // 654
    var removeDoc = self._docs.get(removeId);                                                                 // 647  // 655
    _.each(self.queries, function (query, qid) {                                                              // 648  // 656
      if (query.matcher.documentMatches(removeDoc).result) {                                                  // 649  // 657
        if (query.cursor.skip || query.cursor.limit)                                                          // 650  // 658
          queriesToRecompute.push(qid);                                                                       // 651  // 659
        else                                                                                                  // 652  // 660
          queryRemove.push({qid: qid, doc: removeDoc});                                                       // 653  // 661
      }                                                                                                       // 654  // 662
    });                                                                                                       // 655  // 663
    self._saveOriginal(removeId, removeDoc);                                                                  // 656  // 664
    self._docs.remove(removeId);                                                                              // 657  // 665
  }                                                                                                           // 658  // 666
                                                                                                              // 659  // 667
  // run live query callbacks _after_ we've removed the documents.                                            // 660  // 668
  _.each(queryRemove, function (remove) {                                                                     // 661  // 669
    var query = self.queries[remove.qid];                                                                     // 662  // 670
    if (query) {                                                                                              // 663  // 671
      query.distances && query.distances.remove(remove.doc._id);                                              // 664  // 672
      LocalCollection._removeFromResults(query, remove.doc);                                                  // 665  // 673
    }                                                                                                         // 666  // 674
  });                                                                                                         // 667  // 675
  _.each(queriesToRecompute, function (qid) {                                                                 // 668  // 676
    var query = self.queries[qid];                                                                            // 669  // 677
    if (query)                                                                                                // 670  // 678
      self._recomputeResults(query);                                                                          // 671  // 679
  });                                                                                                         // 672  // 680
  self._observeQueue.drain();                                                                                 // 673  // 681
  result = remove.length;                                                                                     // 674  // 682
  if (callback)                                                                                               // 675  // 683
    Meteor.defer(function () {                                                                                // 676  // 684
      callback(null, result);                                                                                 // 677  // 685
    });                                                                                                       // 678  // 686
  return result;                                                                                              // 679  // 687
};                                                                                                            // 680  // 688
                                                                                                              // 681  // 689
// XXX atomicity: if multi is true, and one modification fails, do                                            // 682  // 690
// we rollback the whole operation, or what?                                                                  // 683  // 691
LocalCollection.prototype.update = function (selector, mod, options, callback) {                              // 684  // 692
  var self = this;                                                                                            // 685  // 693
  if (! callback && options instanceof Function) {                                                            // 686  // 694
    callback = options;                                                                                       // 687  // 695
    options = null;                                                                                           // 688  // 696
  }                                                                                                           // 689  // 697
  if (!options) options = {};                                                                                 // 690  // 698
                                                                                                              // 691  // 699
  var matcher = new Minimongo.Matcher(selector);                                                              // 692  // 700
                                                                                                              // 693  // 701
  // Save the original results of any query that we might need to                                             // 694  // 702
  // _recomputeResults on, because _modifyAndNotify will mutate the objects in                                // 695  // 703
  // it. (We don't need to save the original results of paused queries because                                // 696  // 704
  // they already have a resultsSnapshot and we won't be diffing in                                           // 697  // 705
  // _recomputeResults.)                                                                                      // 698  // 706
  var qidToOriginalResults = {};                                                                              // 699  // 707
  _.each(self.queries, function (query, qid) {                                                                // 700  // 708
    // XXX for now, skip/limit implies ordered observe, so query.results is                                   // 701  // 709
    // always an array                                                                                        // 702  // 710
    if ((query.cursor.skip || query.cursor.limit) && ! self.paused)                                           // 703  // 711
      qidToOriginalResults[qid] = EJSON.clone(query.results);                                                 // 704  // 712
  });                                                                                                         // 705  // 713
  var recomputeQids = {};                                                                                     // 706  // 714
                                                                                                              // 707  // 715
  var updateCount = 0;                                                                                        // 708  // 716
                                                                                                              // 709  // 717
  self._eachPossiblyMatchingDoc(selector, function (doc, id) {                                                // 710  // 718
    var queryResult = matcher.documentMatches(doc);                                                           // 711  // 719
    if (queryResult.result) {                                                                                 // 712  // 720
      // XXX Should we save the original even if mod ends up being a no-op?                                   // 713  // 721
      self._saveOriginal(id, doc);                                                                            // 714  // 722
      self._modifyAndNotify(doc, mod, recomputeQids, queryResult.arrayIndices);                               // 715  // 723
      ++updateCount;                                                                                          // 716  // 724
      if (!options.multi)                                                                                     // 717  // 725
        return false;  // break                                                                               // 718  // 726
    }                                                                                                         // 719  // 727
    return true;                                                                                              // 720  // 728
  });                                                                                                         // 721  // 729
                                                                                                              // 722  // 730
  _.each(recomputeQids, function (dummy, qid) {                                                               // 723  // 731
    var query = self.queries[qid];                                                                            // 724  // 732
    if (query)                                                                                                // 725  // 733
      self._recomputeResults(query, qidToOriginalResults[qid]);                                               // 726  // 734
  });                                                                                                         // 727  // 735
  self._observeQueue.drain();                                                                                 // 728  // 736
                                                                                                              // 729  // 737
  // If we are doing an upsert, and we didn't modify any documents yet, then                                  // 730  // 738
  // it's time to do an insert. Figure out what document we are inserting, and                                // 731  // 739
  // generate an id for it.                                                                                   // 732  // 740
  var insertedId;                                                                                             // 733  // 741
  if (updateCount === 0 && options.upsert) {                                                                  // 734  // 742
    var newDoc = LocalCollection._removeDollarOperators(selector);                                            // 735  // 743
    LocalCollection._modify(newDoc, mod, {isInsert: true});                                                   // 736  // 744
    if (! newDoc._id && options.insertedId)                                                                   // 737  // 745
      newDoc._id = options.insertedId;                                                                        // 738  // 746
    insertedId = self.insert(newDoc);                                                                         // 739  // 747
    updateCount = 1;                                                                                          // 740  // 748
  }                                                                                                           // 741  // 749
                                                                                                              // 742  // 750
  // Return the number of affected documents, or in the upsert case, an object                                // 743  // 751
  // containing the number of affected docs and the id of the doc that was                                    // 744  // 752
  // inserted, if any.                                                                                        // 745  // 753
  var result;                                                                                                 // 746  // 754
  if (options._returnObject) {                                                                                // 747  // 755
    result = {                                                                                                // 748  // 756
      numberAffected: updateCount                                                                             // 749  // 757
    };                                                                                                        // 750  // 758
    if (insertedId !== undefined)                                                                             // 751  // 759
      result.insertedId = insertedId;                                                                         // 752  // 760
  } else {                                                                                                    // 753  // 761
    result = updateCount;                                                                                     // 754  // 762
  }                                                                                                           // 755  // 763
                                                                                                              // 756  // 764
  if (callback)                                                                                               // 757  // 765
    Meteor.defer(function () {                                                                                // 758  // 766
      callback(null, result);                                                                                 // 759  // 767
    });                                                                                                       // 760  // 768
  return result;                                                                                              // 761  // 769
};                                                                                                            // 762  // 770
                                                                                                              // 763  // 771
// A convenience wrapper on update. LocalCollection.upsert(sel, mod) is                                       // 764  // 772
// equivalent to LocalCollection.update(sel, mod, { upsert: true, _returnObject:                              // 765  // 773
// true }).                                                                                                   // 766  // 774
LocalCollection.prototype.upsert = function (selector, mod, options, callback) {                              // 767  // 775
  var self = this;                                                                                            // 768  // 776
  if (! callback && typeof options === "function") {                                                          // 769  // 777
    callback = options;                                                                                       // 770  // 778
    options = {};                                                                                             // 771  // 779
  }                                                                                                           // 772  // 780
  return self.update(selector, mod, _.extend({}, options, {                                                   // 773  // 781
    upsert: true,                                                                                             // 774  // 782
    _returnObject: true                                                                                       // 775  // 783
  }), callback);                                                                                              // 776  // 784
};                                                                                                            // 777  // 785
                                                                                                              // 778  // 786
LocalCollection.prototype._modifyAndNotify = function (                                                       // 779  // 787
    doc, mod, recomputeQids, arrayIndices) {                                                                  // 780  // 788
  var self = this;                                                                                            // 781  // 789
                                                                                                              // 782  // 790
  var matched_before = {};                                                                                    // 783  // 791
  for (var qid in self.queries) {                                                                             // 784  // 792
    var query = self.queries[qid];                                                                            // 785  // 793
    if (query.ordered) {                                                                                      // 786  // 794
      matched_before[qid] = query.matcher.documentMatches(doc).result;                                        // 787  // 795
    } else {                                                                                                  // 788  // 796
      // Because we don't support skip or limit (yet) in unordered queries, we                                // 789  // 797
      // can just do a direct lookup.                                                                         // 790  // 798
      matched_before[qid] = query.results.has(doc._id);                                                       // 791  // 799
    }                                                                                                         // 792  // 800
  }                                                                                                           // 793  // 801
                                                                                                              // 794  // 802
  var old_doc = EJSON.clone(doc);                                                                             // 795  // 803
                                                                                                              // 796  // 804
  LocalCollection._modify(doc, mod, {arrayIndices: arrayIndices});                                            // 797  // 805
                                                                                                              // 798  // 806
  for (qid in self.queries) {                                                                                 // 799  // 807
    query = self.queries[qid];                                                                                // 800  // 808
    var before = matched_before[qid];                                                                         // 801  // 809
    var afterMatch = query.matcher.documentMatches(doc);                                                      // 802  // 810
    var after = afterMatch.result;                                                                            // 803  // 811
    if (after && query.distances && afterMatch.distance !== undefined)                                        // 804  // 812
      query.distances.set(doc._id, afterMatch.distance);                                                      // 805  // 813
                                                                                                              // 806  // 814
    if (query.cursor.skip || query.cursor.limit) {                                                            // 807  // 815
      // We need to recompute any query where the doc may have been in the                                    // 808  // 816
      // cursor's window either before or after the update. (Note that if skip                                // 809  // 817
      // or limit is set, "before" and "after" being true do not necessarily                                  // 810  // 818
      // mean that the document is in the cursor's output after skip/limit is                                 // 811  // 819
      // applied... but if they are false, then the document definitely is NOT                                // 812  // 820
      // in the output. So it's safe to skip recompute if neither before or                                   // 813  // 821
      // after are true.)                                                                                     // 814  // 822
      if (before || after)                                                                                    // 815  // 823
        recomputeQids[qid] = true;                                                                            // 816  // 824
    } else if (before && !after) {                                                                            // 817  // 825
      LocalCollection._removeFromResults(query, doc);                                                         // 818  // 826
    } else if (!before && after) {                                                                            // 819  // 827
      LocalCollection._insertInResults(query, doc);                                                           // 820  // 828
    } else if (before && after) {                                                                             // 821  // 829
      LocalCollection._updateInResults(query, doc, old_doc);                                                  // 822  // 830
    }                                                                                                         // 823  // 831
  }                                                                                                           // 824  // 832
};                                                                                                            // 825  // 833
                                                                                                              // 826  // 834
// XXX the sorted-query logic below is laughably inefficient. we'll                                           // 827  // 835
// need to come up with a better datastructure for this.                                                      // 828  // 836
//                                                                                                            // 829  // 837
// XXX the logic for observing with a skip or a limit is even more                                            // 830  // 838
// laughably inefficient. we recompute the whole results every time!                                          // 831  // 839
                                                                                                              // 832  // 840
LocalCollection._insertInResults = function (query, doc) {                                                    // 833  // 841
  var fields = EJSON.clone(doc);                                                                              // 834  // 842
  delete fields._id;                                                                                          // 835  // 843
  if (query.ordered) {                                                                                        // 836  // 844
    if (!query.sorter) {                                                                                      // 837  // 845
      query.addedBefore(doc._id, query.projectionFn(fields), null);                                           // 838  // 846
      query.results.push(doc);                                                                                // 839  // 847
    } else {                                                                                                  // 840  // 848
      var i = LocalCollection._insertInSortedList(                                                            // 841  // 849
        query.sorter.getComparator({distances: query.distances}),                                             // 842  // 850
        query.results, doc);                                                                                  // 843  // 851
      var next = query.results[i+1];                                                                          // 844  // 852
      if (next)                                                                                               // 845  // 853
        next = next._id;                                                                                      // 846  // 854
      else                                                                                                    // 847  // 855
        next = null;                                                                                          // 848  // 856
      query.addedBefore(doc._id, query.projectionFn(fields), next);                                           // 849  // 857
    }                                                                                                         // 850  // 858
    query.added(doc._id, query.projectionFn(fields));                                                         // 851  // 859
  } else {                                                                                                    // 852  // 860
    query.added(doc._id, query.projectionFn(fields));                                                         // 853  // 861
    query.results.set(doc._id, doc);                                                                          // 854  // 862
  }                                                                                                           // 855  // 863
};                                                                                                            // 856  // 864
                                                                                                              // 857  // 865
LocalCollection._removeFromResults = function (query, doc) {                                                  // 858  // 866
  if (query.ordered) {                                                                                        // 859  // 867
    var i = LocalCollection._findInOrderedResults(query, doc);                                                // 860  // 868
    query.removed(doc._id);                                                                                   // 861  // 869
    query.results.splice(i, 1);                                                                               // 862  // 870
  } else {                                                                                                    // 863  // 871
    var id = doc._id;  // in case callback mutates doc                                                        // 864  // 872
    query.removed(doc._id);                                                                                   // 865  // 873
    query.results.remove(id);                                                                                 // 866  // 874
  }                                                                                                           // 867  // 875
};                                                                                                            // 868  // 876
                                                                                                              // 869  // 877
LocalCollection._updateInResults = function (query, doc, old_doc) {                                           // 870  // 878
  if (!EJSON.equals(doc._id, old_doc._id))                                                                    // 871  // 879
    throw new Error("Can't change a doc's _id while updating");                                               // 872  // 880
  var projectionFn = query.projectionFn;                                                                      // 873  // 881
  var changedFields = DiffSequence.makeChangedFields(                                                         // 874  // 882
    projectionFn(doc), projectionFn(old_doc));                                                                // 875  // 883
                                                                                                              // 876  // 884
  if (!query.ordered) {                                                                                       // 877  // 885
    if (!_.isEmpty(changedFields)) {                                                                          // 878  // 886
      query.changed(doc._id, changedFields);                                                                  // 879  // 887
      query.results.set(doc._id, doc);                                                                        // 880  // 888
    }                                                                                                         // 881  // 889
    return;                                                                                                   // 882  // 890
  }                                                                                                           // 883  // 891
                                                                                                              // 884  // 892
  var orig_idx = LocalCollection._findInOrderedResults(query, doc);                                           // 885  // 893
                                                                                                              // 886  // 894
  if (!_.isEmpty(changedFields))                                                                              // 887  // 895
    query.changed(doc._id, changedFields);                                                                    // 888  // 896
  if (!query.sorter)                                                                                          // 889  // 897
    return;                                                                                                   // 890  // 898
                                                                                                              // 891  // 899
  // just take it out and put it back in again, and see if the index                                          // 892  // 900
  // changes                                                                                                  // 893  // 901
  query.results.splice(orig_idx, 1);                                                                          // 894  // 902
  var new_idx = LocalCollection._insertInSortedList(                                                          // 895  // 903
    query.sorter.getComparator({distances: query.distances}),                                                 // 896  // 904
    query.results, doc);                                                                                      // 897  // 905
  if (orig_idx !== new_idx) {                                                                                 // 898  // 906
    var next = query.results[new_idx+1];                                                                      // 899  // 907
    if (next)                                                                                                 // 900  // 908
      next = next._id;                                                                                        // 901  // 909
    else                                                                                                      // 902  // 910
      next = null;                                                                                            // 903  // 911
    query.movedBefore && query.movedBefore(doc._id, next);                                                    // 904  // 912
  }                                                                                                           // 905  // 913
};                                                                                                            // 906  // 914
                                                                                                              // 907  // 915
// Recomputes the results of a query and runs observe callbacks for the                                       // 908  // 916
// difference between the previous results and the current results (unless                                    // 909  // 917
// paused). Used for skip/limit queries.                                                                      // 910  // 918
//                                                                                                            // 911  // 919
// When this is used by insert or remove, it can just use query.results for the                               // 912  // 920
// old results (and there's no need to pass in oldResults), because these                                     // 913  // 921
// operations don't mutate the documents in the collection. Update needs to pass                              // 914  // 922
// in an oldResults which was deep-copied before the modifier was applied.                                    // 915  // 923
//                                                                                                            // 916  // 924
// oldResults is guaranteed to be ignored if the query is not paused.                                         // 917  // 925
LocalCollection.prototype._recomputeResults = function (query, oldResults) {                                  // 918  // 926
  var self = this;                                                                                            // 919  // 927
  if (! self.paused && ! oldResults)                                                                          // 920  // 928
    oldResults = query.results;                                                                               // 921  // 929
  if (query.distances)                                                                                        // 922  // 930
    query.distances.clear();                                                                                  // 923  // 931
  query.results = query.cursor._getRawObjects({                                                               // 924  // 932
    ordered: query.ordered, distances: query.distances});                                                     // 925  // 933
                                                                                                              // 926  // 934
  if (! self.paused) {                                                                                        // 927  // 935
    LocalCollection._diffQueryChanges(                                                                        // 928  // 936
      query.ordered, oldResults, query.results, query,                                                        // 929  // 937
      { projectionFn: query.projectionFn });                                                                  // 930  // 938
  }                                                                                                           // 931  // 939
};                                                                                                            // 932  // 940
                                                                                                              // 933  // 941
                                                                                                              // 934  // 942
LocalCollection._findInOrderedResults = function (query, doc) {                                               // 935  // 943
  if (!query.ordered)                                                                                         // 936  // 944
    throw new Error("Can't call _findInOrderedResults on unordered query");                                   // 937  // 945
  for (var i = 0; i < query.results.length; i++)                                                              // 938  // 946
    if (query.results[i] === doc)                                                                             // 939  // 947
      return i;                                                                                               // 940  // 948
  throw Error("object missing from query");                                                                   // 941  // 949
};                                                                                                            // 942  // 950
                                                                                                              // 943  // 951
// This binary search puts a value between any equal values, and the first                                    // 944  // 952
// lesser value.                                                                                              // 945  // 953
LocalCollection._binarySearch = function (cmp, array, value) {                                                // 946  // 954
  var first = 0, rangeLength = array.length;                                                                  // 947  // 955
                                                                                                              // 948  // 956
  while (rangeLength > 0) {                                                                                   // 949  // 957
    var halfRange = Math.floor(rangeLength/2);                                                                // 950  // 958
    if (cmp(value, array[first + halfRange]) >= 0) {                                                          // 951  // 959
      first += halfRange + 1;                                                                                 // 952  // 960
      rangeLength -= halfRange + 1;                                                                           // 953  // 961
    } else {                                                                                                  // 954  // 962
      rangeLength = halfRange;                                                                                // 955  // 963
    }                                                                                                         // 956  // 964
  }                                                                                                           // 957  // 965
  return first;                                                                                               // 958  // 966
};                                                                                                            // 959  // 967
                                                                                                              // 960  // 968
LocalCollection._insertInSortedList = function (cmp, array, value) {                                          // 961  // 969
  if (array.length === 0) {                                                                                   // 962  // 970
    array.push(value);                                                                                        // 963  // 971
    return 0;                                                                                                 // 964  // 972
  }                                                                                                           // 965  // 973
                                                                                                              // 966  // 974
  var idx = LocalCollection._binarySearch(cmp, array, value);                                                 // 967  // 975
  array.splice(idx, 0, value);                                                                                // 968  // 976
  return idx;                                                                                                 // 969  // 977
};                                                                                                            // 970  // 978
                                                                                                              // 971  // 979
// To track what documents are affected by a piece of code, call saveOriginals()                              // 972  // 980
// before it and retrieveOriginals() after it. retrieveOriginals returns an                                   // 973  // 981
// object whose keys are the ids of the documents that were affected since the                                // 974  // 982
// call to saveOriginals(), and the values are equal to the document's contents                               // 975  // 983
// at the time of saveOriginals. (In the case of an inserted document, undefined                              // 976  // 984
// is the value.) You must alternate between calls to saveOriginals() and                                     // 977  // 985
// retrieveOriginals().                                                                                       // 978  // 986
LocalCollection.prototype.saveOriginals = function () {                                                       // 979  // 987
  var self = this;                                                                                            // 980  // 988
  if (self._savedOriginals)                                                                                   // 981  // 989
    throw new Error("Called saveOriginals twice without retrieveOriginals");                                  // 982  // 990
  self._savedOriginals = new LocalCollection._IdMap;                                                          // 983  // 991
};                                                                                                            // 984  // 992
LocalCollection.prototype.retrieveOriginals = function () {                                                   // 985  // 993
  var self = this;                                                                                            // 986  // 994
  if (!self._savedOriginals)                                                                                  // 987  // 995
    throw new Error("Called retrieveOriginals without saveOriginals");                                        // 988  // 996
                                                                                                              // 989  // 997
  var originals = self._savedOriginals;                                                                       // 990  // 998
  self._savedOriginals = null;                                                                                // 991  // 999
  return originals;                                                                                           // 992  // 1000
};                                                                                                            // 993  // 1001
                                                                                                              // 994  // 1002
LocalCollection.prototype._saveOriginal = function (id, doc) {                                                // 995  // 1003
  var self = this;                                                                                            // 996  // 1004
  // Are we even trying to save originals?                                                                    // 997  // 1005
  if (!self._savedOriginals)                                                                                  // 998  // 1006
    return;                                                                                                   // 999  // 1007
  // Have we previously mutated the original (and so 'doc' is not actually                                    // 1000
  // original)?  (Note the 'has' check rather than truth: we store undefined                                  // 1001
  // here for inserted docs!)                                                                                 // 1002
  if (self._savedOriginals.has(id))                                                                           // 1003
    return;                                                                                                   // 1004
  self._savedOriginals.set(id, EJSON.clone(doc));                                                             // 1005
};                                                                                                            // 1006
                                                                                                              // 1007
// Pause the observers. No callbacks from observers will fire until                                           // 1008
// 'resumeObservers' is called.                                                                               // 1009
LocalCollection.prototype.pauseObservers = function () {                                                      // 1010
  // No-op if already paused.                                                                                 // 1011
  if (this.paused)                                                                                            // 1012
    return;                                                                                                   // 1013
                                                                                                              // 1014
  // Set the 'paused' flag such that new observer messages don't fire.                                        // 1015
  this.paused = true;                                                                                         // 1016
                                                                                                              // 1017
  // Take a snapshot of the query results for each query.                                                     // 1018
  for (var qid in this.queries) {                                                                             // 1019
    var query = this.queries[qid];                                                                            // 1020
                                                                                                              // 1021
    query.resultsSnapshot = EJSON.clone(query.results);                                                       // 1022
  }                                                                                                           // 1023
};                                                                                                            // 1024
                                                                                                              // 1025
// Resume the observers. Observers immediately receive change                                                 // 1026
// notifications to bring them to the current state of the                                                    // 1027
// database. Note that this is not just replaying all the changes that                                        // 1028
// happened during the pause, it is a smarter 'coalesced' diff.                                               // 1029
LocalCollection.prototype.resumeObservers = function () {                                                     // 1030
  var self = this;                                                                                            // 1031
  // No-op if not paused.                                                                                     // 1032
  if (!this.paused)                                                                                           // 1033
    return;                                                                                                   // 1034
                                                                                                              // 1035
  // Unset the 'paused' flag. Make sure to do this first, otherwise                                           // 1036
  // observer methods won't actually fire when we trigger them.                                               // 1037
  this.paused = false;                                                                                        // 1038
                                                                                                              // 1039
  for (var qid in this.queries) {                                                                             // 1040
    var query = self.queries[qid];                                                                            // 1041
    // Diff the current results against the snapshot and send to observers.                                   // 1042
    // pass the query object for its observer callbacks.                                                      // 1043
    LocalCollection._diffQueryChanges(                                                                        // 1044
      query.ordered, query.resultsSnapshot, query.results, query,                                             // 1045
      { projectionFn: query.projectionFn });                                                                  // 1046
    query.resultsSnapshot = null;                                                                             // 1047
  }                                                                                                           // 1048
  self._observeQueue.drain();                                                                                 // 1049
};                                                                                                            // 1050
                                                                                                              // 1051
                                                                                                              // 1052
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1061
                                                                                                                      // 1062
}).call(this);                                                                                                        // 1063
                                                                                                                      // 1064
                                                                                                                      // 1065
                                                                                                                      // 1066
                                                                                                                      // 1067
                                                                                                                      // 1068
                                                                                                                      // 1069
(function(){                                                                                                          // 1070
                                                                                                                      // 1071
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1072
//                                                                                                            //      // 1073
// packages/minimongo/wrap_transform.js                                                                       //      // 1074
//                                                                                                            //      // 1075
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1076
                                                                                                              //      // 1077
// Wrap a transform function to return objects that have the _id field                                        // 1    // 1078
// of the untransformed document. This ensures that subsystems such as                                        // 2    // 1079
// the observe-sequence package that call `observe` can keep track of                                         // 3    // 1080
// the documents identities.                                                                                  // 4    // 1081
//                                                                                                            // 5    // 1082
// - Require that it returns objects                                                                          // 6    // 1083
// - If the return value has an _id field, verify that it matches the                                         // 7    // 1084
//   original _id field                                                                                       // 8    // 1085
// - If the return value doesn't have an _id field, add it back.                                              // 9    // 1086
LocalCollection.wrapTransform = function (transform) {                                                        // 10   // 1087
  if (! transform)                                                                                            // 11   // 1088
    return null;                                                                                              // 12   // 1089
                                                                                                              // 13   // 1090
  // No need to doubly-wrap transforms.                                                                       // 14   // 1091
  if (transform.__wrappedTransform__)                                                                         // 15   // 1092
    return transform;                                                                                         // 16   // 1093
                                                                                                              // 17   // 1094
  var wrapped = function (doc) {                                                                              // 18   // 1095
    if (!_.has(doc, '_id')) {                                                                                 // 19   // 1096
      // XXX do we ever have a transform on the oplog's collection? because that                              // 20   // 1097
      // collection has no _id.                                                                               // 21   // 1098
      throw new Error("can only transform documents with _id");                                               // 22   // 1099
    }                                                                                                         // 23   // 1100
                                                                                                              // 24   // 1101
    var id = doc._id;                                                                                         // 25   // 1102
    // XXX consider making tracker a weak dependency and checking Package.tracker here                        // 26   // 1103
    var transformed = Tracker.nonreactive(function () {                                                       // 27   // 1104
      return transform(doc);                                                                                  // 28   // 1105
    });                                                                                                       // 29   // 1106
                                                                                                              // 30   // 1107
    if (!isPlainObject(transformed)) {                                                                        // 31   // 1108
      throw new Error("transform must return object");                                                        // 32   // 1109
    }                                                                                                         // 33   // 1110
                                                                                                              // 34   // 1111
    if (_.has(transformed, '_id')) {                                                                          // 35   // 1112
      if (!EJSON.equals(transformed._id, id)) {                                                               // 36   // 1113
        throw new Error("transformed document can't have different _id");                                     // 37   // 1114
      }                                                                                                       // 38   // 1115
    } else {                                                                                                  // 39   // 1116
      transformed._id = id;                                                                                   // 40   // 1117
    }                                                                                                         // 41   // 1118
    return transformed;                                                                                       // 42   // 1119
  };                                                                                                          // 43   // 1120
  wrapped.__wrappedTransform__ = true;                                                                        // 44   // 1121
  return wrapped;                                                                                             // 45   // 1122
};                                                                                                            // 46   // 1123
                                                                                                              // 47   // 1124
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1125
                                                                                                                      // 1126
}).call(this);                                                                                                        // 1127
                                                                                                                      // 1128
                                                                                                                      // 1129
                                                                                                                      // 1130
                                                                                                                      // 1131
                                                                                                                      // 1132
                                                                                                                      // 1133
(function(){                                                                                                          // 1134
                                                                                                                      // 1135
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1136
//                                                                                                            //      // 1137
// packages/minimongo/helpers.js                                                                              //      // 1138
//                                                                                                            //      // 1139
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1140
                                                                                                              //      // 1141
// Like _.isArray, but doesn't regard polyfilled Uint8Arrays on old browsers as                               // 1    // 1142
// arrays.                                                                                                    // 2    // 1143
// XXX maybe this should be EJSON.isArray                                                                     // 3    // 1144
isArray = function (x) {                                                                                      // 4    // 1145
  return _.isArray(x) && !EJSON.isBinary(x);                                                                  // 5    // 1146
};                                                                                                            // 6    // 1147
                                                                                                              // 7    // 1148
// XXX maybe this should be EJSON.isObject, though EJSON doesn't know about                                   // 8    // 1149
// RegExp                                                                                                     // 9    // 1150
// XXX note that _type(undefined) === 3!!!!                                                                   // 10   // 1151
isPlainObject = LocalCollection._isPlainObject = function (x) {                                               // 11   // 1152
  return x && LocalCollection._f._type(x) === 3;                                                              // 12   // 1153
};                                                                                                            // 13   // 1154
                                                                                                              // 14   // 1155
isIndexable = function (x) {                                                                                  // 15   // 1156
  return isArray(x) || isPlainObject(x);                                                                      // 16   // 1157
};                                                                                                            // 17   // 1158
                                                                                                              // 18   // 1159
// Returns true if this is an object with at least one key and all keys begin                                 // 19   // 1160
// with $.  Unless inconsistentOK is set, throws if some keys begin with $ and                                // 20   // 1161
// others don't.                                                                                              // 21   // 1162
isOperatorObject = function (valueSelector, inconsistentOK) {                                                 // 22   // 1163
  if (!isPlainObject(valueSelector))                                                                          // 23   // 1164
    return false;                                                                                             // 24   // 1165
                                                                                                              // 25   // 1166
  var theseAreOperators = undefined;                                                                          // 26   // 1167
  _.each(valueSelector, function (value, selKey) {                                                            // 27   // 1168
    var thisIsOperator = selKey.substr(0, 1) === '$';                                                         // 28   // 1169
    if (theseAreOperators === undefined) {                                                                    // 29   // 1170
      theseAreOperators = thisIsOperator;                                                                     // 30   // 1171
    } else if (theseAreOperators !== thisIsOperator) {                                                        // 31   // 1172
      if (!inconsistentOK)                                                                                    // 32   // 1173
        throw new Error("Inconsistent operator: " +                                                           // 33   // 1174
                        JSON.stringify(valueSelector));                                                       // 34   // 1175
      theseAreOperators = false;                                                                              // 35   // 1176
    }                                                                                                         // 36   // 1177
  });                                                                                                         // 37   // 1178
  return !!theseAreOperators;  // {} has no operators                                                         // 38   // 1179
};                                                                                                            // 39   // 1180
                                                                                                              // 40   // 1181
                                                                                                              // 41   // 1182
// string can be converted to integer                                                                         // 42   // 1183
isNumericKey = function (s) {                                                                                 // 43   // 1184
  return /^[0-9]+$/.test(s);                                                                                  // 44   // 1185
};                                                                                                            // 45   // 1186
                                                                                                              // 46   // 1187
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1188
                                                                                                                      // 1189
}).call(this);                                                                                                        // 1190
                                                                                                                      // 1191
                                                                                                                      // 1192
                                                                                                                      // 1193
                                                                                                                      // 1194
                                                                                                                      // 1195
                                                                                                                      // 1196
(function(){                                                                                                          // 1197
                                                                                                                      // 1198
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1199
//                                                                                                            //      // 1200
// packages/minimongo/selector.js                                                                             //      // 1201
//                                                                                                            //      // 1202
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 1203
                                                                                                              //      // 1204
// The minimongo selector compiler!                                                                           // 1    // 1205
                                                                                                              // 2    // 1206
// Terminology:                                                                                               // 3    // 1207
//  - a "selector" is the EJSON object representing a selector                                                // 4    // 1208
//  - a "matcher" is its compiled form (whether a full Minimongo.Matcher                                      // 5    // 1209
//    object or one of the component lambdas that matches parts of it)                                        // 6    // 1210
//  - a "result object" is an object with a "result" field and maybe                                          // 7    // 1211
//    distance and arrayIndices.                                                                              // 8    // 1212
//  - a "branched value" is an object with a "value" field and maybe                                          // 9    // 1213
//    "dontIterate" and "arrayIndices".                                                                       // 10   // 1214
//  - a "document" is a top-level object that can be stored in a collection.                                  // 11   // 1215
//  - a "lookup function" is a function that takes in a document and returns                                  // 12   // 1216
//    an array of "branched values".                                                                          // 13   // 1217
//  - a "branched matcher" maps from an array of branched values to a result                                  // 14   // 1218
//    object.                                                                                                 // 15   // 1219
//  - an "element matcher" maps from a single value to a bool.                                                // 16   // 1220
                                                                                                              // 17   // 1221
// Main entry point.                                                                                          // 18   // 1222
//   var matcher = new Minimongo.Matcher({a: {$gt: 5}});                                                      // 19   // 1223
//   if (matcher.documentMatches({a: 7})) ...                                                                 // 20   // 1224
Minimongo.Matcher = function (selector) {                                                                     // 21   // 1225
  var self = this;                                                                                            // 22   // 1226
  // A set (object mapping string -> *) of all of the document paths looked                                   // 23   // 1227
  // at by the selector. Also includes the empty string if it may look at any                                 // 24   // 1228
  // path (eg, $where).                                                                                       // 25   // 1229
  self._paths = {};                                                                                           // 26   // 1230
  // Set to true if compilation finds a $near.                                                                // 27   // 1231
  self._hasGeoQuery = false;                                                                                  // 28   // 1232
  // Set to true if compilation finds a $where.                                                               // 29   // 1233
  self._hasWhere = false;                                                                                     // 30   // 1234
  // Set to false if compilation finds anything other than a simple equality or                               // 31   // 1235
  // one or more of '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin' used with                              // 32   // 1236
  // scalars as operands.                                                                                     // 33   // 1237
  self._isSimple = true;                                                                                      // 34   // 1238
  // Set to a dummy document which always matches this Matcher. Or set to null                                // 35   // 1239
  // if such document is too hard to find.                                                                    // 36   // 1240
  self._matchingDocument = undefined;                                                                         // 37   // 1241
  // A clone of the original selector. It may just be a function if the user                                  // 38   // 1242
  // passed in a function; otherwise is definitely an object (eg, IDs are                                     // 39   // 1243
  // translated into {_id: ID} first. Used by canBecomeTrueByModifier and                                     // 40   // 1244
  // Sorter._useWithMatcher.                                                                                  // 41   // 1245
  self._selector = null;                                                                                      // 42   // 1246
  self._docMatcher = self._compileSelector(selector);                                                         // 43   // 1247
};                                                                                                            // 44   // 1248
                                                                                                              // 45   // 1249
_.extend(Minimongo.Matcher.prototype, {                                                                       // 46   // 1250
  documentMatches: function (doc) {                                                                           // 47   // 1251
    if (!doc || typeof doc !== "object") {                                                                    // 48   // 1252
      throw Error("documentMatches needs a document");                                                        // 49   // 1253
    }                                                                                                         // 50   // 1254
    return this._docMatcher(doc);                                                                             // 51   // 1255
  },                                                                                                          // 52   // 1256
  hasGeoQuery: function () {                                                                                  // 53   // 1257
    return this._hasGeoQuery;                                                                                 // 54   // 1258
  },                                                                                                          // 55   // 1259
  hasWhere: function () {                                                                                     // 56   // 1260
    return this._hasWhere;                                                                                    // 57   // 1261
  },                                                                                                          // 58   // 1262
  isSimple: function () {                                                                                     // 59   // 1263
    return this._isSimple;                                                                                    // 60   // 1264
  },                                                                                                          // 61   // 1265
                                                                                                              // 62   // 1266
  // Given a selector, return a function that takes one argument, a                                           // 63   // 1267
  // document. It returns a result object.                                                                    // 64   // 1268
  _compileSelector: function (selector) {                                                                     // 65   // 1269
    var self = this;                                                                                          // 66   // 1270
    // you can pass a literal function instead of a selector                                                  // 67   // 1271
    if (selector instanceof Function) {                                                                       // 68   // 1272
      self._isSimple = false;                                                                                 // 69   // 1273
      self._selector = selector;                                                                              // 70   // 1274
      self._recordPathUsed('');                                                                               // 71   // 1275
      return function (doc) {                                                                                 // 72   // 1276
        return {result: !!selector.call(doc)};                                                                // 73   // 1277
      };                                                                                                      // 74   // 1278
    }                                                                                                         // 75   // 1279
                                                                                                              // 76   // 1280
    // shorthand -- scalars match _id                                                                         // 77   // 1281
    if (LocalCollection._selectorIsId(selector)) {                                                            // 78   // 1282
      self._selector = {_id: selector};                                                                       // 79   // 1283
      self._recordPathUsed('_id');                                                                            // 80   // 1284
      return function (doc) {                                                                                 // 81   // 1285
        return {result: EJSON.equals(doc._id, selector)};                                                     // 82   // 1286
      };                                                                                                      // 83   // 1287
    }                                                                                                         // 84   // 1288
                                                                                                              // 85   // 1289
    // protect against dangerous selectors.  falsey and {_id: falsey} are both                                // 86   // 1290
    // likely programmer error, and not what you want, particularly for                                       // 87   // 1291
    // destructive operations.                                                                                // 88   // 1292
    if (!selector || (('_id' in selector) && !selector._id)) {                                                // 89   // 1293
      self._isSimple = false;                                                                                 // 90   // 1294
      return nothingMatcher;                                                                                  // 91   // 1295
    }                                                                                                         // 92   // 1296
                                                                                                              // 93   // 1297
    // Top level can't be an array or true or binary.                                                         // 94   // 1298
    if (typeof(selector) === 'boolean' || isArray(selector) ||                                                // 95   // 1299
        EJSON.isBinary(selector))                                                                             // 96   // 1300
      throw new Error("Invalid selector: " + selector);                                                       // 97   // 1301
                                                                                                              // 98   // 1302
    self._selector = EJSON.clone(selector);                                                                   // 99   // 1303
    return compileDocumentSelector(selector, self, {isRoot: true});                                           // 100  // 1304
  },                                                                                                          // 101  // 1305
  _recordPathUsed: function (path) {                                                                          // 102  // 1306
    this._paths[path] = true;                                                                                 // 103  // 1307
  },                                                                                                          // 104  // 1308
  // Returns a list of key paths the given selector is looking for. It includes                               // 105  // 1309
  // the empty string if there is a $where.                                                                   // 106  // 1310
  _getPaths: function () {                                                                                    // 107  // 1311
    return _.keys(this._paths);                                                                               // 108  // 1312
  }                                                                                                           // 109  // 1313
});                                                                                                           // 110  // 1314
                                                                                                              // 111  // 1315
                                                                                                              // 112  // 1316
// Takes in a selector that could match a full document (eg, the original                                     // 113  // 1317
// selector). Returns a function mapping document->result object.                                             // 114  // 1318
//                                                                                                            // 115  // 1319
// matcher is the Matcher object we are compiling.                                                            // 116  // 1320
//                                                                                                            // 117  // 1321
// If this is the root document selector (ie, not wrapped in $and or the like),                               // 118  // 1322
// then isRoot is true. (This is used by $near.)                                                              // 119  // 1323
var compileDocumentSelector = function (docSelector, matcher, options) {                                      // 120  // 1324
  options = options || {};                                                                                    // 121  // 1325
  var docMatchers = [];                                                                                       // 122  // 1326
  _.each(docSelector, function (subSelector, key) {                                                           // 123  // 1327
    if (key.substr(0, 1) === '$') {                                                                           // 124  // 1328
      // Outer operators are either logical operators (they recurse back into                                 // 125  // 1329
      // this function), or $where.                                                                           // 126  // 1330
      if (!_.has(LOGICAL_OPERATORS, key))                                                                     // 127  // 1331
        throw new Error("Unrecognized logical operator: " + key);                                             // 128  // 1332
      matcher._isSimple = false;                                                                              // 129  // 1333
      docMatchers.push(LOGICAL_OPERATORS[key](subSelector, matcher,                                           // 130  // 1334
                                              options.inElemMatch));                                          // 131  // 1335
    } else {                                                                                                  // 132  // 1336
      // Record this path, but only if we aren't in an elemMatcher, since in an                               // 133  // 1337
      // elemMatch this is a path inside an object in an array, not in the doc                                // 134  // 1338
      // root.                                                                                                // 135  // 1339
      if (!options.inElemMatch)                                                                               // 136  // 1340
        matcher._recordPathUsed(key);                                                                         // 137  // 1341
      var lookUpByIndex = makeLookupFunction(key);                                                            // 138  // 1342
      var valueMatcher =                                                                                      // 139  // 1343
        compileValueSelector(subSelector, matcher, options.isRoot);                                           // 140  // 1344
      docMatchers.push(function (doc) {                                                                       // 141  // 1345
        var branchValues = lookUpByIndex(doc);                                                                // 142  // 1346
        return valueMatcher(branchValues);                                                                    // 143  // 1347
      });                                                                                                     // 144  // 1348
    }                                                                                                         // 145  // 1349
  });                                                                                                         // 146  // 1350
                                                                                                              // 147  // 1351
  return andDocumentMatchers(docMatchers);                                                                    // 148  // 1352
};                                                                                                            // 149  // 1353
                                                                                                              // 150  // 1354
// Takes in a selector that could match a key-indexed value in a document; eg,                                // 151  // 1355
// {$gt: 5, $lt: 9}, or a regular expression, or any non-expression object (to                                // 152  // 1356
// indicate equality).  Returns a branched matcher: a function mapping                                        // 153  // 1357
// [branched value]->result object.                                                                           // 154  // 1358
var compileValueSelector = function (valueSelector, matcher, isRoot) {                                        // 155  // 1359
  if (valueSelector instanceof RegExp) {                                                                      // 156  // 1360
    matcher._isSimple = false;                                                                                // 157  // 1361
    return convertElementMatcherToBranchedMatcher(                                                            // 158  // 1362
      regexpElementMatcher(valueSelector));                                                                   // 159  // 1363
  } else if (isOperatorObject(valueSelector)) {                                                               // 160  // 1364
    return operatorBranchedMatcher(valueSelector, matcher, isRoot);                                           // 161  // 1365
  } else {                                                                                                    // 162  // 1366
    return convertElementMatcherToBranchedMatcher(                                                            // 163  // 1367
      equalityElementMatcher(valueSelector));                                                                 // 164  // 1368
  }                                                                                                           // 165  // 1369
};                                                                                                            // 166  // 1370
                                                                                                              // 167  // 1371
// Given an element matcher (which evaluates a single value), returns a branched                              // 168  // 1372
// value (which evaluates the element matcher on all the branches and returns a                               // 169  // 1373
// more structured return value possibly including arrayIndices).                                             // 170  // 1374
var convertElementMatcherToBranchedMatcher = function (                                                       // 171  // 1375
    elementMatcher, options) {                                                                                // 172  // 1376
  options = options || {};                                                                                    // 173  // 1377
  return function (branches) {                                                                                // 174  // 1378
    var expanded = branches;                                                                                  // 175  // 1379
    if (!options.dontExpandLeafArrays) {                                                                      // 176  // 1380
      expanded = expandArraysInBranches(                                                                      // 177  // 1381
        branches, options.dontIncludeLeafArrays);                                                             // 178  // 1382
    }                                                                                                         // 179  // 1383
    var ret = {};                                                                                             // 180  // 1384
    ret.result = _.any(expanded, function (element) {                                                         // 181  // 1385
      var matched = elementMatcher(element.value);                                                            // 182  // 1386
                                                                                                              // 183  // 1387
      // Special case for $elemMatch: it means "true, and use this as an array                                // 184  // 1388
      // index if I didn't already have one".                                                                 // 185  // 1389
      if (typeof matched === 'number') {                                                                      // 186  // 1390
        // XXX This code dates from when we only stored a single array index                                  // 187  // 1391
        // (for the outermost array). Should we be also including deeper array                                // 188  // 1392
        // indices from the $elemMatch match?                                                                 // 189  // 1393
        if (!element.arrayIndices)                                                                            // 190  // 1394
          element.arrayIndices = [matched];                                                                   // 191  // 1395
        matched = true;                                                                                       // 192  // 1396
      }                                                                                                       // 193  // 1397
                                                                                                              // 194  // 1398
      // If some element matched, and it's tagged with array indices, include                                 // 195  // 1399
      // those indices in our result object.                                                                  // 196  // 1400
      if (matched && element.arrayIndices)                                                                    // 197  // 1401
        ret.arrayIndices = element.arrayIndices;                                                              // 198  // 1402
                                                                                                              // 199  // 1403
      return matched;                                                                                         // 200  // 1404
    });                                                                                                       // 201  // 1405
    return ret;                                                                                               // 202  // 1406
  };                                                                                                          // 203  // 1407
};                                                                                                            // 204  // 1408
                                                                                                              // 205  // 1409
// Takes a RegExp object and returns an element matcher.                                                      // 206  // 1410
regexpElementMatcher = function (regexp) {                                                                    // 207  // 1411
  return function (value) {                                                                                   // 208  // 1412
    if (value instanceof RegExp) {                                                                            // 209  // 1413
      // Comparing two regexps means seeing if the regexps are identical                                      // 210  // 1414
      // (really!). Underscore knows how.                                                                     // 211  // 1415
      return _.isEqual(value, regexp);                                                                        // 212  // 1416
    }                                                                                                         // 213  // 1417
    // Regexps only work against strings.                                                                     // 214  // 1418
    if (typeof value !== 'string')                                                                            // 215  // 1419
      return false;                                                                                           // 216  // 1420
                                                                                                              // 217  // 1421
    // Reset regexp's state to avoid inconsistent matching for objects with the                               // 218  // 1422
    // same value on consecutive calls of regexp.test. This happens only if the                               // 219  // 1423
    // regexp has the 'g' flag. Also note that ES6 introduces a new flag 'y' for                              // 220  // 1424
    // which we should *not* change the lastIndex but MongoDB doesn't support                                 // 221  // 1425
    // either of these flags.                                                                                 // 222  // 1426
    regexp.lastIndex = 0;                                                                                     // 223  // 1427
                                                                                                              // 224  // 1428
    return regexp.test(value);                                                                                // 225  // 1429
  };                                                                                                          // 226  // 1430
};                                                                                                            // 227  // 1431
                                                                                                              // 228  // 1432
// Takes something that is not an operator object and returns an element matcher                              // 229  // 1433
// for equality with that thing.                                                                              // 230  // 1434
equalityElementMatcher = function (elementSelector) {                                                         // 231  // 1435
  if (isOperatorObject(elementSelector))                                                                      // 232  // 1436
    throw Error("Can't create equalityValueSelector for operator object");                                    // 233  // 1437
                                                                                                              // 234  // 1438
  // Special-case: null and undefined are equal (if you got undefined in there                                // 235  // 1439
  // somewhere, or if you got it due to some branch being non-existent in the                                 // 236  // 1440
  // weird special case), even though they aren't with EJSON.equals.                                          // 237  // 1441
  if (elementSelector == null) {  // undefined or null                                                        // 238  // 1442
    return function (value) {                                                                                 // 239  // 1443
      return value == null;  // undefined or null                                                             // 240  // 1444
    };                                                                                                        // 241  // 1445
  }                                                                                                           // 242  // 1446
                                                                                                              // 243  // 1447
  return function (value) {                                                                                   // 244  // 1448
    return LocalCollection._f._equal(elementSelector, value);                                                 // 245  // 1449
  };                                                                                                          // 246  // 1450
};                                                                                                            // 247  // 1451
                                                                                                              // 248  // 1452
// Takes an operator object (an object with $ keys) and returns a branched                                    // 249  // 1453
// matcher for it.                                                                                            // 250  // 1454
var operatorBranchedMatcher = function (valueSelector, matcher, isRoot) {                                     // 251  // 1455
  // Each valueSelector works separately on the various branches.  So one                                     // 252  // 1456
  // operator can match one branch and another can match another branch.  This                                // 253  // 1457
  // is OK.                                                                                                   // 254  // 1458
                                                                                                              // 255  // 1459
  var operatorMatchers = [];                                                                                  // 256  // 1460
  _.each(valueSelector, function (operand, operator) {                                                        // 257  // 1461
    // XXX we should actually implement $eq, which is new in 2.6                                              // 258  // 1462
    var simpleRange = _.contains(['$lt', '$lte', '$gt', '$gte'], operator) &&                                 // 259  // 1463
      _.isNumber(operand);                                                                                    // 260  // 1464
    var simpleInequality = operator === '$ne' && !_.isObject(operand);                                        // 261  // 1465
    var simpleInclusion = _.contains(['$in', '$nin'], operator) &&                                            // 262  // 1466
      _.isArray(operand) && !_.any(operand, _.isObject);                                                      // 263  // 1467
                                                                                                              // 264  // 1468
    if (! (operator === '$eq' || simpleRange ||                                                               // 265  // 1469
           simpleInclusion || simpleInequality)) {                                                            // 266  // 1470
      matcher._isSimple = false;                                                                              // 267  // 1471
    }                                                                                                         // 268  // 1472
                                                                                                              // 269  // 1473
    if (_.has(VALUE_OPERATORS, operator)) {                                                                   // 270  // 1474
      operatorMatchers.push(                                                                                  // 271  // 1475
        VALUE_OPERATORS[operator](operand, valueSelector, matcher, isRoot));                                  // 272  // 1476
    } else if (_.has(ELEMENT_OPERATORS, operator)) {                                                          // 273  // 1477
      var options = ELEMENT_OPERATORS[operator];                                                              // 274  // 1478
      operatorMatchers.push(                                                                                  // 275  // 1479
        convertElementMatcherToBranchedMatcher(                                                               // 276  // 1480
          options.compileElementSelector(                                                                     // 277  // 1481
            operand, valueSelector, matcher),                                                                 // 278  // 1482
          options));                                                                                          // 279  // 1483
    } else {                                                                                                  // 280  // 1484
      throw new Error("Unrecognized operator: " + operator);                                                  // 281  // 1485
    }                                                                                                         // 282  // 1486
  });                                                                                                         // 283  // 1487
                                                                                                              // 284  // 1488
  return andBranchedMatchers(operatorMatchers);                                                               // 285  // 1489
};                                                                                                            // 286  // 1490
                                                                                                              // 287  // 1491
var compileArrayOfDocumentSelectors = function (                                                              // 288  // 1492
    selectors, matcher, inElemMatch) {                                                                        // 289  // 1493
  if (!isArray(selectors) || _.isEmpty(selectors))                                                            // 290  // 1494
    throw Error("$and/$or/$nor must be nonempty array");                                                      // 291  // 1495
  return _.map(selectors, function (subSelector) {                                                            // 292  // 1496
    if (!isPlainObject(subSelector))                                                                          // 293  // 1497
      throw Error("$or/$and/$nor entries need to be full objects");                                           // 294  // 1498
    return compileDocumentSelector(                                                                           // 295  // 1499
      subSelector, matcher, {inElemMatch: inElemMatch});                                                      // 296  // 1500
  });                                                                                                         // 297  // 1501
};                                                                                                            // 298  // 1502
                                                                                                              // 299  // 1503
// Operators that appear at the top level of a document selector.                                             // 300  // 1504
var LOGICAL_OPERATORS = {                                                                                     // 301  // 1505
  $and: function (subSelector, matcher, inElemMatch) {                                                        // 302  // 1506
    var matchers = compileArrayOfDocumentSelectors(                                                           // 303  // 1507
      subSelector, matcher, inElemMatch);                                                                     // 304  // 1508
    return andDocumentMatchers(matchers);                                                                     // 305  // 1509
  },                                                                                                          // 306  // 1510
                                                                                                              // 307  // 1511
  $or: function (subSelector, matcher, inElemMatch) {                                                         // 308  // 1512
    var matchers = compileArrayOfDocumentSelectors(                                                           // 309  // 1513
      subSelector, matcher, inElemMatch);                                                                     // 310  // 1514
                                                                                                              // 311  // 1515
    // Special case: if there is only one matcher, use it directly, *preserving*                              // 312  // 1516
    // any arrayIndices it returns.                                                                           // 313  // 1517
    if (matchers.length === 1)                                                                                // 314  // 1518
      return matchers[0];                                                                                     // 315  // 1519
                                                                                                              // 316  // 1520
    return function (doc) {                                                                                   // 317  // 1521
      var result = _.any(matchers, function (f) {                                                             // 318  // 1522
        return f(doc).result;                                                                                 // 319  // 1523
      });                                                                                                     // 320  // 1524
      // $or does NOT set arrayIndices when it has multiple                                                   // 321  // 1525
      // sub-expressions. (Tested against MongoDB.)                                                           // 322  // 1526
      return {result: result};                                                                                // 323  // 1527
    };                                                                                                        // 324  // 1528
  },                                                                                                          // 325  // 1529
                                                                                                              // 326  // 1530
  $nor: function (subSelector, matcher, inElemMatch) {                                                        // 327  // 1531
    var matchers = compileArrayOfDocumentSelectors(                                                           // 328  // 1532
      subSelector, matcher, inElemMatch);                                                                     // 329  // 1533
    return function (doc) {                                                                                   // 330  // 1534
      var result = _.all(matchers, function (f) {                                                             // 331  // 1535
        return !f(doc).result;                                                                                // 332  // 1536
      });                                                                                                     // 333  // 1537
      // Never set arrayIndices, because we only match if nothing in particular                               // 334  // 1538
      // "matched" (and because this is consistent with MongoDB).                                             // 335  // 1539
      return {result: result};                                                                                // 336  // 1540
    };                                                                                                        // 337  // 1541
  },                                                                                                          // 338  // 1542
                                                                                                              // 339  // 1543
  $where: function (selectorValue, matcher) {                                                                 // 340  // 1544
    // Record that *any* path may be used.                                                                    // 341  // 1545
    matcher._recordPathUsed('');                                                                              // 342  // 1546
    matcher._hasWhere = true;                                                                                 // 343  // 1547
    if (!(selectorValue instanceof Function)) {                                                               // 344  // 1548
      // XXX MongoDB seems to have more complex logic to decide where or or not                               // 345  // 1549
      // to add "return"; not sure exactly what it is.                                                        // 346  // 1550
      selectorValue = Function("obj", "return " + selectorValue);                                             // 347  // 1551
    }                                                                                                         // 348  // 1552
    return function (doc) {                                                                                   // 349  // 1553
      // We make the document available as both `this` and `obj`.                                             // 350  // 1554
      // XXX not sure what we should do if this throws                                                        // 351  // 1555
      return {result: selectorValue.call(doc, doc)};                                                          // 352  // 1556
    };                                                                                                        // 353  // 1557
  },                                                                                                          // 354  // 1558
                                                                                                              // 355  // 1559
  // This is just used as a comment in the query (in MongoDB, it also ends up in                              // 356  // 1560
  // query logs); it has no effect on the actual selection.                                                   // 357  // 1561
  $comment: function () {                                                                                     // 358  // 1562
    return function () {                                                                                      // 359  // 1563
      return {result: true};                                                                                  // 360  // 1564
    };                                                                                                        // 361  // 1565
  }                                                                                                           // 362  // 1566
};                                                                                                            // 363  // 1567
                                                                                                              // 364  // 1568
// Returns a branched matcher that matches iff the given matcher does not.                                    // 365  // 1569
// Note that this implicitly "deMorganizes" the wrapped function.  ie, it                                     // 366  // 1570
// means that ALL branch values need to fail to match innerBranchedMatcher.                                   // 367  // 1571
var invertBranchedMatcher = function (branchedMatcher) {                                                      // 368  // 1572
  return function (branchValues) {                                                                            // 369  // 1573
    var invertMe = branchedMatcher(branchValues);                                                             // 370  // 1574
    // We explicitly choose to strip arrayIndices here: it doesn't make sense to                              // 371  // 1575
    // say "update the array element that does not match something", at least                                 // 372  // 1576
    // in mongo-land.                                                                                         // 373  // 1577
    return {result: !invertMe.result};                                                                        // 374  // 1578
  };                                                                                                          // 375  // 1579
};                                                                                                            // 376  // 1580
                                                                                                              // 377  // 1581
// Operators that (unlike LOGICAL_OPERATORS) pertain to individual paths in a                                 // 378  // 1582
// document, but (unlike ELEMENT_OPERATORS) do not have a simple definition as                                // 379  // 1583
// "match each branched value independently and combine with                                                  // 380  // 1584
// convertElementMatcherToBranchedMatcher".                                                                   // 381  // 1585
var VALUE_OPERATORS = {                                                                                       // 382  // 1586
  $not: function (operand, valueSelector, matcher) {                                                          // 383  // 1587
    return invertBranchedMatcher(compileValueSelector(operand, matcher));                                     // 384  // 1588
  },                                                                                                          // 385  // 1589
  $ne: function (operand) {                                                                                   // 386  // 1590
    return invertBranchedMatcher(convertElementMatcherToBranchedMatcher(                                      // 387  // 1591
      equalityElementMatcher(operand)));                                                                      // 388  // 1592
  },                                                                                                          // 389  // 1593
  $nin: function (operand) {                                                                                  // 390  // 1594
    return invertBranchedMatcher(convertElementMatcherToBranchedMatcher(                                      // 391  // 1595
      ELEMENT_OPERATORS.$in.compileElementSelector(operand)));                                                // 392  // 1596
  },                                                                                                          // 393  // 1597
  $exists: function (operand) {                                                                               // 394  // 1598
    var exists = convertElementMatcherToBranchedMatcher(function (value) {                                    // 395  // 1599
      return value !== undefined;                                                                             // 396  // 1600
    });                                                                                                       // 397  // 1601
    return operand ? exists : invertBranchedMatcher(exists);                                                  // 398  // 1602
  },                                                                                                          // 399  // 1603
  // $options just provides options for $regex; its logic is inside $regex                                    // 400  // 1604
  $options: function (operand, valueSelector) {                                                               // 401  // 1605
    if (!_.has(valueSelector, '$regex'))                                                                      // 402  // 1606
      throw Error("$options needs a $regex");                                                                 // 403  // 1607
    return everythingMatcher;                                                                                 // 404  // 1608
  },                                                                                                          // 405  // 1609
  // $maxDistance is basically an argument to $near                                                           // 406  // 1610
  $maxDistance: function (operand, valueSelector) {                                                           // 407  // 1611
    if (!valueSelector.$near)                                                                                 // 408  // 1612
      throw Error("$maxDistance needs a $near");                                                              // 409  // 1613
    return everythingMatcher;                                                                                 // 410  // 1614
  },                                                                                                          // 411  // 1615
  $all: function (operand, valueSelector, matcher) {                                                          // 412  // 1616
    if (!isArray(operand))                                                                                    // 413  // 1617
      throw Error("$all requires array");                                                                     // 414  // 1618
    // Not sure why, but this seems to be what MongoDB does.                                                  // 415  // 1619
    if (_.isEmpty(operand))                                                                                   // 416  // 1620
      return nothingMatcher;                                                                                  // 417  // 1621
                                                                                                              // 418  // 1622
    var branchedMatchers = [];                                                                                // 419  // 1623
    _.each(operand, function (criterion) {                                                                    // 420  // 1624
      // XXX handle $all/$elemMatch combination                                                               // 421  // 1625
      if (isOperatorObject(criterion))                                                                        // 422  // 1626
        throw Error("no $ expressions in $all");                                                              // 423  // 1627
      // This is always a regexp or equality selector.                                                        // 424  // 1628
      branchedMatchers.push(compileValueSelector(criterion, matcher));                                        // 425  // 1629
    });                                                                                                       // 426  // 1630
    // andBranchedMatchers does NOT require all selectors to return true on the                               // 427  // 1631
    // SAME branch.                                                                                           // 428  // 1632
    return andBranchedMatchers(branchedMatchers);                                                             // 429  // 1633
  },                                                                                                          // 430  // 1634
  $near: function (operand, valueSelector, matcher, isRoot) {                                                 // 431  // 1635
    if (!isRoot)                                                                                              // 432  // 1636
      throw Error("$near can't be inside another $ operator");                                                // 433  // 1637
    matcher._hasGeoQuery = true;                                                                              // 434  // 1638
                                                                                                              // 435  // 1639
    // There are two kinds of geodata in MongoDB: coordinate pairs and                                        // 436  // 1640
    // GeoJSON. They use different distance metrics, too. GeoJSON queries are                                 // 437  // 1641
    // marked with a $geometry property.                                                                      // 438  // 1642
                                                                                                              // 439  // 1643
    var maxDistance, point, distance;                                                                         // 440  // 1644
    if (isPlainObject(operand) && _.has(operand, '$geometry')) {                                              // 441  // 1645
      // GeoJSON "2dsphere" mode.                                                                             // 442  // 1646
      maxDistance = operand.$maxDistance;                                                                     // 443  // 1647
      point = operand.$geometry;                                                                              // 444  // 1648
      distance = function (value) {                                                                           // 445  // 1649
        // XXX: for now, we don't calculate the actual distance between, say,                                 // 446  // 1650
        // polygon and circle. If people care about this use-case it will get                                 // 447  // 1651
        // a priority.                                                                                        // 448  // 1652
        if (!value || !value.type)                                                                            // 449  // 1653
          return null;                                                                                        // 450  // 1654
        if (value.type === "Point") {                                                                         // 451  // 1655
          return GeoJSON.pointDistance(point, value);                                                         // 452  // 1656
        } else {                                                                                              // 453  // 1657
          return GeoJSON.geometryWithinRadius(value, point, maxDistance)                                      // 454  // 1658
            ? 0 : maxDistance + 1;                                                                            // 455  // 1659
        }                                                                                                     // 456  // 1660
      };                                                                                                      // 457  // 1661
    } else {                                                                                                  // 458  // 1662
      maxDistance = valueSelector.$maxDistance;                                                               // 459  // 1663
      if (!isArray(operand) && !isPlainObject(operand))                                                       // 460  // 1664
        throw Error("$near argument must be coordinate pair or GeoJSON");                                     // 461  // 1665
      point = pointToArray(operand);                                                                          // 462  // 1666
      distance = function (value) {                                                                           // 463  // 1667
        if (!isArray(value) && !isPlainObject(value))                                                         // 464  // 1668
          return null;                                                                                        // 465  // 1669
        return distanceCoordinatePairs(point, value);                                                         // 466  // 1670
      };                                                                                                      // 467  // 1671
    }                                                                                                         // 468  // 1672
                                                                                                              // 469  // 1673
    return function (branchedValues) {                                                                        // 470  // 1674
      // There might be multiple points in the document that match the given                                  // 471  // 1675
      // field. Only one of them needs to be within $maxDistance, but we need to                              // 472  // 1676
      // evaluate all of them and use the nearest one for the implicit sort                                   // 473  // 1677
      // specifier. (That's why we can't just use ELEMENT_OPERATORS here.)                                    // 474  // 1678
      //                                                                                                      // 475  // 1679
      // Note: This differs from MongoDB's implementation, where a document will                              // 476  // 1680
      // actually show up *multiple times* in the result set, with one entry for                              // 477  // 1681
      // each within-$maxDistance branching point.                                                            // 478  // 1682
      branchedValues = expandArraysInBranches(branchedValues);                                                // 479  // 1683
      var result = {result: false};                                                                           // 480  // 1684
      _.each(branchedValues, function (branch) {                                                              // 481  // 1685
        var curDistance = distance(branch.value);                                                             // 482  // 1686
        // Skip branches that aren't real points or are too far away.                                         // 483  // 1687
        if (curDistance === null || curDistance > maxDistance)                                                // 484  // 1688
          return;                                                                                             // 485  // 1689
        // Skip anything that's a tie.                                                                        // 486  // 1690
        if (result.distance !== undefined && result.distance <= curDistance)                                  // 487  // 1691
          return;                                                                                             // 488  // 1692
        result.result = true;                                                                                 // 489  // 1693
        result.distance = curDistance;                                                                        // 490  // 1694
        if (!branch.arrayIndices)                                                                             // 491  // 1695
          delete result.arrayIndices;                                                                         // 492  // 1696
        else                                                                                                  // 493  // 1697
          result.arrayIndices = branch.arrayIndices;                                                          // 494  // 1698
      });                                                                                                     // 495  // 1699
      return result;                                                                                          // 496  // 1700
    };                                                                                                        // 497  // 1701
  }                                                                                                           // 498  // 1702
};                                                                                                            // 499  // 1703
                                                                                                              // 500  // 1704
// Helpers for $near.                                                                                         // 501  // 1705
var distanceCoordinatePairs = function (a, b) {                                                               // 502  // 1706
  a = pointToArray(a);                                                                                        // 503  // 1707
  b = pointToArray(b);                                                                                        // 504  // 1708
  var x = a[0] - b[0];                                                                                        // 505  // 1709
  var y = a[1] - b[1];                                                                                        // 506  // 1710
  if (_.isNaN(x) || _.isNaN(y))                                                                               // 507  // 1711
    return null;                                                                                              // 508  // 1712
  return Math.sqrt(x * x + y * y);                                                                            // 509  // 1713
};                                                                                                            // 510  // 1714
// Makes sure we get 2 elements array and assume the first one to be x and                                    // 511  // 1715
// the second one to y no matter what user passes.                                                            // 512  // 1716
// In case user passes { lon: x, lat: y } returns [x, y]                                                      // 513  // 1717
var pointToArray = function (point) {                                                                         // 514  // 1718
  return _.map(point, _.identity);                                                                            // 515  // 1719
};                                                                                                            // 516  // 1720
                                                                                                              // 517  // 1721
// Helper for $lt/$gt/$lte/$gte.                                                                              // 518  // 1722
var makeInequality = function (cmpValueComparator) {                                                          // 519  // 1723
  return {                                                                                                    // 520  // 1724
    compileElementSelector: function (operand) {                                                              // 521  // 1725
      // Arrays never compare false with non-arrays for any inequality.                                       // 522  // 1726
      // XXX This was behavior we observed in pre-release MongoDB 2.5, but                                    // 523  // 1727
      //     it seems to have been reverted.                                                                  // 524  // 1728
      //     See https://jira.mongodb.org/browse/SERVER-11444                                                 // 525  // 1729
      if (isArray(operand)) {                                                                                 // 526  // 1730
        return function () {                                                                                  // 527  // 1731
          return false;                                                                                       // 528  // 1732
        };                                                                                                    // 529  // 1733
      }                                                                                                       // 530  // 1734
                                                                                                              // 531  // 1735
      // Special case: consider undefined and null the same (so true with                                     // 532  // 1736
      // $gte/$lte).                                                                                          // 533  // 1737
      if (operand === undefined)                                                                              // 534  // 1738
        operand = null;                                                                                       // 535  // 1739
                                                                                                              // 536  // 1740
      var operandType = LocalCollection._f._type(operand);                                                    // 537  // 1741
                                                                                                              // 538  // 1742
      return function (value) {                                                                               // 539  // 1743
        if (value === undefined)                                                                              // 540  // 1744
          value = null;                                                                                       // 541  // 1745
        // Comparisons are never true among things of different type (except                                  // 542  // 1746
        // null vs undefined).                                                                                // 543  // 1747
        if (LocalCollection._f._type(value) !== operandType)                                                  // 544  // 1748
          return false;                                                                                       // 545  // 1749
        return cmpValueComparator(LocalCollection._f._cmp(value, operand));                                   // 546  // 1750
      };                                                                                                      // 547  // 1751
    }                                                                                                         // 548  // 1752
  };                                                                                                          // 549  // 1753
};                                                                                                            // 550  // 1754
                                                                                                              // 551  // 1755
// Each element selector contains:                                                                            // 552  // 1756
//  - compileElementSelector, a function with args:                                                           // 553  // 1757
//    - operand - the "right hand side" of the operator                                                       // 554  // 1758
//    - valueSelector - the "context" for the operator (so that $regex can find                               // 555  // 1759
//      $options)                                                                                             // 556  // 1760
//    - matcher - the Matcher this is going into (so that $elemMatch can compile                              // 557  // 1761
//      more things)                                                                                          // 558  // 1762
//    returning a function mapping a single value to bool.                                                    // 559  // 1763
//  - dontExpandLeafArrays, a bool which prevents expandArraysInBranches from                                 // 560  // 1764
//    being called                                                                                            // 561  // 1765
//  - dontIncludeLeafArrays, a bool which causes an argument to be passed to                                  // 562  // 1766
//    expandArraysInBranches if it is called                                                                  // 563  // 1767
ELEMENT_OPERATORS = {                                                                                         // 564  // 1768
  $lt: makeInequality(function (cmpValue) {                                                                   // 565  // 1769
    return cmpValue < 0;                                                                                      // 566  // 1770
  }),                                                                                                         // 567  // 1771
  $gt: makeInequality(function (cmpValue) {                                                                   // 568  // 1772
    return cmpValue > 0;                                                                                      // 569  // 1773
  }),                                                                                                         // 570  // 1774
  $lte: makeInequality(function (cmpValue) {                                                                  // 571  // 1775
    return cmpValue <= 0;                                                                                     // 572  // 1776
  }),                                                                                                         // 573  // 1777
  $gte: makeInequality(function (cmpValue) {                                                                  // 574  // 1778
    return cmpValue >= 0;                                                                                     // 575  // 1779
  }),                                                                                                         // 576  // 1780
  $mod: {                                                                                                     // 577  // 1781
    compileElementSelector: function (operand) {                                                              // 578  // 1782
      if (!(isArray(operand) && operand.length === 2                                                          // 579  // 1783
            && typeof(operand[0]) === 'number'                                                                // 580  // 1784
            && typeof(operand[1]) === 'number')) {                                                            // 581  // 1785
        throw Error("argument to $mod must be an array of two numbers");                                      // 582  // 1786
      }                                                                                                       // 583  // 1787
      // XXX could require to be ints or round or something                                                   // 584  // 1788
      var divisor = operand[0];                                                                               // 585  // 1789
      var remainder = operand[1];                                                                             // 586  // 1790
      return function (value) {                                                                               // 587  // 1791
        return typeof value === 'number' && value % divisor === remainder;                                    // 588  // 1792
      };                                                                                                      // 589  // 1793
    }                                                                                                         // 590  // 1794
  },                                                                                                          // 591  // 1795
  $in: {                                                                                                      // 592  // 1796
    compileElementSelector: function (operand) {                                                              // 593  // 1797
      if (!isArray(operand))                                                                                  // 594  // 1798
        throw Error("$in needs an array");                                                                    // 595  // 1799
                                                                                                              // 596  // 1800
      var elementMatchers = [];                                                                               // 597  // 1801
      _.each(operand, function (option) {                                                                     // 598  // 1802
        if (option instanceof RegExp)                                                                         // 599  // 1803
          elementMatchers.push(regexpElementMatcher(option));                                                 // 600  // 1804
        else if (isOperatorObject(option))                                                                    // 601  // 1805
          throw Error("cannot nest $ under $in");                                                             // 602  // 1806
        else                                                                                                  // 603  // 1807
          elementMatchers.push(equalityElementMatcher(option));                                               // 604  // 1808
      });                                                                                                     // 605  // 1809
                                                                                                              // 606  // 1810
      return function (value) {                                                                               // 607  // 1811
        // Allow {a: {$in: [null]}} to match when 'a' does not exist.                                         // 608  // 1812
        if (value === undefined)                                                                              // 609  // 1813
          value = null;                                                                                       // 610  // 1814
        return _.any(elementMatchers, function (e) {                                                          // 611  // 1815
          return e(value);                                                                                    // 612  // 1816
        });                                                                                                   // 613  // 1817
      };                                                                                                      // 614  // 1818
    }                                                                                                         // 615  // 1819
  },                                                                                                          // 616  // 1820
  $size: {                                                                                                    // 617  // 1821
    // {a: [[5, 5]]} must match {a: {$size: 1}} but not {a: {$size: 2}}, so we                                // 618  // 1822
    // don't want to consider the element [5,5] in the leaf array [[5,5]] as a                                // 619  // 1823
    // possible value.                                                                                        // 620  // 1824
    dontExpandLeafArrays: true,                                                                               // 621  // 1825
    compileElementSelector: function (operand) {                                                              // 622  // 1826
      if (typeof operand === 'string') {                                                                      // 623  // 1827
        // Don't ask me why, but by experimentation, this seems to be what Mongo                              // 624  // 1828
        // does.                                                                                              // 625  // 1829
        operand = 0;                                                                                          // 626  // 1830
      } else if (typeof operand !== 'number') {                                                               // 627  // 1831
        throw Error("$size needs a number");                                                                  // 628  // 1832
      }                                                                                                       // 629  // 1833
      return function (value) {                                                                               // 630  // 1834
        return isArray(value) && value.length === operand;                                                    // 631  // 1835
      };                                                                                                      // 632  // 1836
    }                                                                                                         // 633  // 1837
  },                                                                                                          // 634  // 1838
  $type: {                                                                                                    // 635  // 1839
    // {a: [5]} must not match {a: {$type: 4}} (4 means array), but it should                                 // 636  // 1840
    // match {a: {$type: 1}} (1 means number), and {a: [[5]]} must match {$a:                                 // 637  // 1841
    // {$type: 4}}. Thus, when we see a leaf array, we *should* expand it but                                 // 638  // 1842
    // should *not* include it itself.                                                                        // 639  // 1843
    dontIncludeLeafArrays: true,                                                                              // 640  // 1844
    compileElementSelector: function (operand) {                                                              // 641  // 1845
      if (typeof operand !== 'number')                                                                        // 642  // 1846
        throw Error("$type needs a number");                                                                  // 643  // 1847
      return function (value) {                                                                               // 644  // 1848
        return value !== undefined                                                                            // 645  // 1849
          && LocalCollection._f._type(value) === operand;                                                     // 646  // 1850
      };                                                                                                      // 647  // 1851
    }                                                                                                         // 648  // 1852
  },                                                                                                          // 649  // 1853
  $regex: {                                                                                                   // 650  // 1854
    compileElementSelector: function (operand, valueSelector) {                                               // 651  // 1855
      if (!(typeof operand === 'string' || operand instanceof RegExp))                                        // 652  // 1856
        throw Error("$regex has to be a string or RegExp");                                                   // 653  // 1857
                                                                                                              // 654  // 1858
      var regexp;                                                                                             // 655  // 1859
      if (valueSelector.$options !== undefined) {                                                             // 656  // 1860
        // Options passed in $options (even the empty string) always overrides                                // 657  // 1861
        // options in the RegExp object itself. (See also                                                     // 658  // 1862
        // Mongo.Collection._rewriteSelector.)                                                                // 659  // 1863
                                                                                                              // 660  // 1864
        // Be clear that we only support the JS-supported options, not extended                               // 661  // 1865
        // ones (eg, Mongo supports x and s). Ideally we would implement x and s                              // 662  // 1866
        // by transforming the regexp, but not today...                                                       // 663  // 1867
        if (/[^gim]/.test(valueSelector.$options))                                                            // 664  // 1868
          throw new Error("Only the i, m, and g regexp options are supported");                               // 665  // 1869
                                                                                                              // 666  // 1870
        var regexSource = operand instanceof RegExp ? operand.source : operand;                               // 667  // 1871
        regexp = new RegExp(regexSource, valueSelector.$options);                                             // 668  // 1872
      } else if (operand instanceof RegExp) {                                                                 // 669  // 1873
        regexp = operand;                                                                                     // 670  // 1874
      } else {                                                                                                // 671  // 1875
        regexp = new RegExp(operand);                                                                         // 672  // 1876
      }                                                                                                       // 673  // 1877
      return regexpElementMatcher(regexp);                                                                    // 674  // 1878
    }                                                                                                         // 675  // 1879
  },                                                                                                          // 676  // 1880
  $elemMatch: {                                                                                               // 677  // 1881
    dontExpandLeafArrays: true,                                                                               // 678  // 1882
    compileElementSelector: function (operand, valueSelector, matcher) {                                      // 679  // 1883
      if (!isPlainObject(operand))                                                                            // 680  // 1884
        throw Error("$elemMatch need an object");                                                             // 681  // 1885
                                                                                                              // 682  // 1886
      var subMatcher, isDocMatcher;                                                                           // 683  // 1887
      if (isOperatorObject(operand, true)) {                                                                  // 684  // 1888
        subMatcher = compileValueSelector(operand, matcher);                                                  // 685  // 1889
        isDocMatcher = false;                                                                                 // 686  // 1890
      } else {                                                                                                // 687  // 1891
        // This is NOT the same as compileValueSelector(operand), and not just                                // 688  // 1892
        // because of the slightly different calling convention.                                              // 689  // 1893
        // {$elemMatch: {x: 3}} means "an element has a field x:3", not                                       // 690  // 1894
        // "consists only of a field x:3". Also, regexps and sub-$ are allowed.                               // 691  // 1895
        subMatcher = compileDocumentSelector(operand, matcher,                                                // 692  // 1896
                                             {inElemMatch: true});                                            // 693  // 1897
        isDocMatcher = true;                                                                                  // 694  // 1898
      }                                                                                                       // 695  // 1899
                                                                                                              // 696  // 1900
      return function (value) {                                                                               // 697  // 1901
        if (!isArray(value))                                                                                  // 698  // 1902
          return false;                                                                                       // 699  // 1903
        for (var i = 0; i < value.length; ++i) {                                                              // 700  // 1904
          var arrayElement = value[i];                                                                        // 701  // 1905
          var arg;                                                                                            // 702  // 1906
          if (isDocMatcher) {                                                                                 // 703  // 1907
            // We can only match {$elemMatch: {b: 3}} against objects.                                        // 704  // 1908
            // (We can also match against arrays, if there's numeric indices,                                 // 705  // 1909
            // eg {$elemMatch: {'0.b': 3}} or {$elemMatch: {0: 3}}.)                                          // 706  // 1910
            if (!isPlainObject(arrayElement) && !isArray(arrayElement))                                       // 707  // 1911
              return false;                                                                                   // 708  // 1912
            arg = arrayElement;                                                                               // 709  // 1913
          } else {                                                                                            // 710  // 1914
            // dontIterate ensures that {a: {$elemMatch: {$gt: 5}}} matches                                   // 711  // 1915
            // {a: [8]} but not {a: [[8]]}                                                                    // 712  // 1916
            arg = [{value: arrayElement, dontIterate: true}];                                                 // 713  // 1917
          }                                                                                                   // 714  // 1918
          // XXX support $near in $elemMatch by propagating $distance?                                        // 715  // 1919
          if (subMatcher(arg).result)                                                                         // 716  // 1920
            return i;   // specially understood to mean "use as arrayIndices"                                 // 717  // 1921
        }                                                                                                     // 718  // 1922
        return false;                                                                                         // 719  // 1923
      };                                                                                                      // 720  // 1924
    }                                                                                                         // 721  // 1925
  }                                                                                                           // 722  // 1926
};                                                                                                            // 723  // 1927
                                                                                                              // 724  // 1928
// makeLookupFunction(key) returns a lookup function.                                                         // 725  // 1929
//                                                                                                            // 726  // 1930
// A lookup function takes in a document and returns an array of matching                                     // 727  // 1931
// branches.  If no arrays are found while looking up the key, this array will                                // 728  // 1932
// have exactly one branches (possibly 'undefined', if some segment of the key                                // 729  // 1933
// was not found).                                                                                            // 730  // 1934
//                                                                                                            // 731  // 1935
// If arrays are found in the middle, this can have more than one element, since                              // 732  // 1936
// we "branch". When we "branch", if there are more key segments to look up,                                  // 733  // 1937
// then we only pursue branches that are plain objects (not arrays or scalars).                               // 734  // 1938
// This means we can actually end up with no branches!                                                        // 735  // 1939
//                                                                                                            // 736  // 1940
// We do *NOT* branch on arrays that are found at the end (ie, at the last                                    // 737  // 1941
// dotted member of the key). We just return that array; if you want to                                       // 738  // 1942
// effectively "branch" over the array's values, post-process the lookup                                      // 739  // 1943
// function with expandArraysInBranches.                                                                      // 740  // 1944
//                                                                                                            // 741  // 1945
// Each branch is an object with keys:                                                                        // 742  // 1946
//  - value: the value at the branch                                                                          // 743  // 1947
//  - dontIterate: an optional bool; if true, it means that 'value' is an array                               // 744  // 1948
//    that expandArraysInBranches should NOT expand. This specifically happens                                // 745  // 1949
//    when there is a numeric index in the key, and ensures the                                               // 746  // 1950
//    perhaps-surprising MongoDB behavior where {'a.0': 5} does NOT                                           // 747  // 1951
//    match {a: [[5]]}.                                                                                       // 748  // 1952
//  - arrayIndices: if any array indexing was done during lookup (either due to                               // 749  // 1953
//    explicit numeric indices or implicit branching), this will be an array of                               // 750  // 1954
//    the array indices used, from outermost to innermost; it is falsey or                                    // 751  // 1955
//    absent if no array index is used. If an explicit numeric index is used,                                 // 752  // 1956
//    the index will be followed in arrayIndices by the string 'x'.                                           // 753  // 1957
//                                                                                                            // 754  // 1958
//    Note: arrayIndices is used for two purposes. First, it is used to                                       // 755  // 1959
//    implement the '$' modifier feature, which only ever looks at its first                                  // 756  // 1960
//    element.                                                                                                // 757  // 1961
//                                                                                                            // 758  // 1962
//    Second, it is used for sort key generation, which needs to be able to tell                              // 759  // 1963
//    the difference between different paths. Moreover, it needs to                                           // 760  // 1964
//    differentiate between explicit and implicit branching, which is why                                     // 761  // 1965
//    there's the somewhat hacky 'x' entry: this means that explicit and                                      // 762  // 1966
//    implicit array lookups will have different full arrayIndices paths. (That                               // 763  // 1967
//    code only requires that different paths have different arrayIndices; it                                 // 764  // 1968
//    doesn't actually "parse" arrayIndices. As an alternative, arrayIndices                                  // 765  // 1969
//    could contain objects with flags like "implicit", but I think that only                                 // 766  // 1970
//    makes the code surrounding them more complex.)                                                          // 767  // 1971
//                                                                                                            // 768  // 1972
//    (By the way, this field ends up getting passed around a lot without                                     // 769  // 1973
//    cloning, so never mutate any arrayIndices field/var in this package!)                                   // 770  // 1974
//                                                                                                            // 771  // 1975
//                                                                                                            // 772  // 1976
// At the top level, you may only pass in a plain object or array.                                            // 773  // 1977
//                                                                                                            // 774  // 1978
// See the test 'minimongo - lookup' for some examples of what lookup functions                               // 775  // 1979
// return.                                                                                                    // 776  // 1980
makeLookupFunction = function (key, options) {                                                                // 777  // 1981
  options = options || {};                                                                                    // 778  // 1982
  var parts = key.split('.');                                                                                 // 779  // 1983
  var firstPart = parts.length ? parts[0] : '';                                                               // 780  // 1984
  var firstPartIsNumeric = isNumericKey(firstPart);                                                           // 781  // 1985
  var nextPartIsNumeric = parts.length >= 2 && isNumericKey(parts[1]);                                        // 782  // 1986
  var lookupRest;                                                                                             // 783  // 1987
  if (parts.length > 1) {                                                                                     // 784  // 1988
    lookupRest = makeLookupFunction(parts.slice(1).join('.'));                                                // 785  // 1989
  }                                                                                                           // 786  // 1990
                                                                                                              // 787  // 1991
  var omitUnnecessaryFields = function (retVal) {                                                             // 788  // 1992
    if (!retVal.dontIterate)                                                                                  // 789  // 1993
      delete retVal.dontIterate;                                                                              // 790  // 1994
    if (retVal.arrayIndices && !retVal.arrayIndices.length)                                                   // 791  // 1995
      delete retVal.arrayIndices;                                                                             // 792  // 1996
    return retVal;                                                                                            // 793  // 1997
  };                                                                                                          // 794  // 1998
                                                                                                              // 795  // 1999
  // Doc will always be a plain object or an array.                                                           // 796  // 2000
  // apply an explicit numeric index, an array.                                                               // 797  // 2001
  return function (doc, arrayIndices) {                                                                       // 798  // 2002
    if (!arrayIndices)                                                                                        // 799  // 2003
      arrayIndices = [];                                                                                      // 800  // 2004
                                                                                                              // 801  // 2005
    if (isArray(doc)) {                                                                                       // 802  // 2006
      // If we're being asked to do an invalid lookup into an array (non-integer                              // 803  // 2007
      // or out-of-bounds), return no results (which is different from returning                              // 804  // 2008
      // a single undefined result, in that `null` equality checks won't match).                              // 805  // 2009
      if (!(firstPartIsNumeric && firstPart < doc.length))                                                    // 806  // 2010
        return [];                                                                                            // 807  // 2011
                                                                                                              // 808  // 2012
      // Remember that we used this array index. Include an 'x' to indicate that                              // 809  // 2013
      // the previous index came from being considered as an explicit array                                   // 810  // 2014
      // index (not branching).                                                                               // 811  // 2015
      arrayIndices = arrayIndices.concat(+firstPart, 'x');                                                    // 812  // 2016
    }                                                                                                         // 813  // 2017
                                                                                                              // 814  // 2018
    // Do our first lookup.                                                                                   // 815  // 2019
    var firstLevel = doc[firstPart];                                                                          // 816  // 2020
                                                                                                              // 817  // 2021
    // If there is no deeper to dig, return what we found.                                                    // 818  // 2022
    //                                                                                                        // 819  // 2023
    // If what we found is an array, most value selectors will choose to treat                                // 820  // 2024
    // the elements of the array as matchable values in their own right, but                                  // 821  // 2025
    // that's done outside of the lookup function. (Exceptions to this are $size                              // 822  // 2026
    // and stuff relating to $elemMatch.  eg, {a: {$size: 2}} does not match {a:                              // 823  // 2027
    // [[1, 2]]}.)                                                                                            // 824  // 2028
    //                                                                                                        // 825  // 2029
    // That said, if we just did an *explicit* array lookup (on doc) to find                                  // 826  // 2030
    // firstLevel, and firstLevel is an array too, we do NOT want value                                       // 827  // 2031
    // selectors to iterate over it.  eg, {'a.0': 5} does not match {a: [[5]]}.                               // 828  // 2032
    // So in that case, we mark the return value as "don't iterate".                                          // 829  // 2033
    if (!lookupRest) {                                                                                        // 830  // 2034
      return [omitUnnecessaryFields({                                                                         // 831  // 2035
        value: firstLevel,                                                                                    // 832  // 2036
        dontIterate: isArray(doc) && isArray(firstLevel),                                                     // 833  // 2037
        arrayIndices: arrayIndices})];                                                                        // 834  // 2038
    }                                                                                                         // 835  // 2039
                                                                                                              // 836  // 2040
    // We need to dig deeper.  But if we can't, because what we've found is not                               // 837  // 2041
    // an array or plain object, we're done. If we just did a numeric index into                              // 838  // 2042
    // an array, we return nothing here (this is a change in Mongo 2.5 from                                   // 839  // 2043
    // Mongo 2.4, where {'a.0.b': null} stopped matching {a: [5]}). Otherwise,                                // 840  // 2044
    // return a single `undefined` (which can, for example, match via equality                                // 841  // 2045
    // with `null`).                                                                                          // 842  // 2046
    if (!isIndexable(firstLevel)) {                                                                           // 843  // 2047
      if (isArray(doc))                                                                                       // 844  // 2048
        return [];                                                                                            // 845  // 2049
      return [omitUnnecessaryFields({value: undefined,                                                        // 846  // 2050
                                      arrayIndices: arrayIndices})];                                          // 847  // 2051
    }                                                                                                         // 848  // 2052
                                                                                                              // 849  // 2053
    var result = [];                                                                                          // 850  // 2054
    var appendToResult = function (more) {                                                                    // 851  // 2055
      Array.prototype.push.apply(result, more);                                                               // 852  // 2056
    };                                                                                                        // 853  // 2057
                                                                                                              // 854  // 2058
    // Dig deeper: look up the rest of the parts on whatever we've found.                                     // 855  // 2059
    // (lookupRest is smart enough to not try to do invalid lookups into                                      // 856  // 2060
    // firstLevel if it's an array.)                                                                          // 857  // 2061
    appendToResult(lookupRest(firstLevel, arrayIndices));                                                     // 858  // 2062
                                                                                                              // 859  // 2063
    // If we found an array, then in *addition* to potentially treating the next                              // 860  // 2064
    // part as a literal integer lookup, we should also "branch": try to look up                              // 861  // 2065
    // the rest of the parts on each array element in parallel.                                               // 862  // 2066
    //                                                                                                        // 863  // 2067
    // In this case, we *only* dig deeper into array elements that are plain                                  // 864  // 2068
    // objects. (Recall that we only got this far if we have further to dig.)                                 // 865  // 2069
    // This makes sense: we certainly don't dig deeper into non-indexable                                     // 866  // 2070
    // objects. And it would be weird to dig into an array: it's simpler to have                              // 867  // 2071
    // a rule that explicit integer indexes only apply to an outer array, not to                              // 868  // 2072
    // an array you find after a branching search.                                                            // 869  // 2073
    //                                                                                                        // 870  // 2074
    // In the special case of a numeric part in a *sort selector* (not a query                                // 871  // 2075
    // selector), we skip the branching: we ONLY allow the numeric part to mean                               // 872  // 2076
    // "look up this index" in that case, not "also look up this index in all                                 // 873  // 2077
    // the elements of the array".                                                                            // 874  // 2078
    if (isArray(firstLevel) && !(nextPartIsNumeric && options.forSort)) {                                     // 875  // 2079
      _.each(firstLevel, function (branch, arrayIndex) {                                                      // 876  // 2080
        if (isPlainObject(branch)) {                                                                          // 877  // 2081
          appendToResult(lookupRest(                                                                          // 878  // 2082
            branch,                                                                                           // 879  // 2083
            arrayIndices.concat(arrayIndex)));                                                                // 880  // 2084
        }                                                                                                     // 881  // 2085
      });                                                                                                     // 882  // 2086
    }                                                                                                         // 883  // 2087
                                                                                                              // 884  // 2088
    return result;                                                                                            // 885  // 2089
  };                                                                                                          // 886  // 2090
};                                                                                                            // 887  // 2091
MinimongoTest.makeLookupFunction = makeLookupFunction;                                                        // 888  // 2092
                                                                                                              // 889  // 2093
expandArraysInBranches = function (branches, skipTheArrays) {                                                 // 890  // 2094
  var branchesOut = [];                                                                                       // 891  // 2095
  _.each(branches, function (branch) {                                                                        // 892  // 2096
    var thisIsArray = isArray(branch.value);                                                                  // 893  // 2097
    // We include the branch itself, *UNLESS* we it's an array that we're going                               // 894  // 2098
    // to iterate and we're told to skip arrays.  (That's right, we include some                              // 895  // 2099
    // arrays even skipTheArrays is true: these are arrays that were found via                                // 896  // 2100
    // explicit numerical indices.)                                                                           // 897  // 2101
    if (!(skipTheArrays && thisIsArray && !branch.dontIterate)) {                                             // 898  // 2102
      branchesOut.push({                                                                                      // 899  // 2103
        value: branch.value,                                                                                  // 900  // 2104
        arrayIndices: branch.arrayIndices                                                                     // 901  // 2105
      });                                                                                                     // 902  // 2106
    }                                                                                                         // 903  // 2107
    if (thisIsArray && !branch.dontIterate) {                                                                 // 904  // 2108
      _.each(branch.value, function (leaf, i) {                                                               // 905  // 2109
        branchesOut.push({                                                                                    // 906  // 2110
          value: leaf,                                                                                        // 907  // 2111
          arrayIndices: (branch.arrayIndices || []).concat(i)                                                 // 908  // 2112
        });                                                                                                   // 909  // 2113
      });                                                                                                     // 910  // 2114
    }                                                                                                         // 911  // 2115
  });                                                                                                         // 912  // 2116
  return branchesOut;                                                                                         // 913  // 2117
};                                                                                                            // 914  // 2118
                                                                                                              // 915  // 2119
var nothingMatcher = function (docOrBranchedValues) {                                                         // 916  // 2120
  return {result: false};                                                                                     // 917  // 2121
};                                                                                                            // 918  // 2122
                                                                                                              // 919  // 2123
var everythingMatcher = function (docOrBranchedValues) {                                                      // 920  // 2124
  return {result: true};                                                                                      // 921  // 2125
};                                                                                                            // 922  // 2126
                                                                                                              // 923  // 2127
                                                                                                              // 924  // 2128
// NB: We are cheating and using this function to implement "AND" for both                                    // 925  // 2129
// "document matchers" and "branched matchers". They both return result objects                               // 926  // 2130
// but the argument is different: for the former it's a whole doc, whereas for                                // 927  // 2131
// the latter it's an array of "branched values".                                                             // 928  // 2132
var andSomeMatchers = function (subMatchers) {                                                                // 929  // 2133
  if (subMatchers.length === 0)                                                                               // 930  // 2134
    return everythingMatcher;                                                                                 // 931  // 2135
  if (subMatchers.length === 1)                                                                               // 932  // 2136
    return subMatchers[0];                                                                                    // 933  // 2137
                                                                                                              // 934  // 2138
  return function (docOrBranches) {                                                                           // 935  // 2139
    var ret = {};                                                                                             // 936  // 2140
    ret.result = _.all(subMatchers, function (f) {                                                            // 937  // 2141
      var subResult = f(docOrBranches);                                                                       // 938  // 2142
      // Copy a 'distance' number out of the first sub-matcher that has                                       // 939  // 2143
      // one. Yes, this means that if there are multiple $near fields in a                                    // 940  // 2144
      // query, something arbitrary happens; this appears to be consistent with                               // 941  // 2145
      // Mongo.                                                                                               // 942  // 2146
      if (subResult.result && subResult.distance !== undefined                                                // 943  // 2147
          && ret.distance === undefined) {                                                                    // 944  // 2148
        ret.distance = subResult.distance;                                                                    // 945  // 2149
      }                                                                                                       // 946  // 2150
      // Similarly, propagate arrayIndices from sub-matchers... but to match                                  // 947  // 2151
      // MongoDB behavior, this time the *last* sub-matcher with arrayIndices                                 // 948  // 2152
      // wins.                                                                                                // 949  // 2153
      if (subResult.result && subResult.arrayIndices) {                                                       // 950  // 2154
        ret.arrayIndices = subResult.arrayIndices;                                                            // 951  // 2155
      }                                                                                                       // 952  // 2156
      return subResult.result;                                                                                // 953  // 2157
    });                                                                                                       // 954  // 2158
                                                                                                              // 955  // 2159
    // If we didn't actually match, forget any extra metadata we came up with.                                // 956  // 2160
    if (!ret.result) {                                                                                        // 957  // 2161
      delete ret.distance;                                                                                    // 958  // 2162
      delete ret.arrayIndices;                                                                                // 959  // 2163
    }                                                                                                         // 960  // 2164
    return ret;                                                                                               // 961  // 2165
  };                                                                                                          // 962  // 2166
};                                                                                                            // 963  // 2167
                                                                                                              // 964  // 2168
var andDocumentMatchers = andSomeMatchers;                                                                    // 965  // 2169
var andBranchedMatchers = andSomeMatchers;                                                                    // 966  // 2170
                                                                                                              // 967  // 2171
                                                                                                              // 968  // 2172
// helpers used by compiled selector code                                                                     // 969  // 2173
LocalCollection._f = {                                                                                        // 970  // 2174
  // XXX for _all and _in, consider building 'inquery' at compile time..                                      // 971  // 2175
                                                                                                              // 972  // 2176
  _type: function (v) {                                                                                       // 973  // 2177
    if (typeof v === "number")                                                                                // 974  // 2178
      return 1;                                                                                               // 975  // 2179
    if (typeof v === "string")                                                                                // 976  // 2180
      return 2;                                                                                               // 977  // 2181
    if (typeof v === "boolean")                                                                               // 978  // 2182
      return 8;                                                                                               // 979  // 2183
    if (isArray(v))                                                                                           // 980  // 2184
      return 4;                                                                                               // 981  // 2185
    if (v === null)                                                                                           // 982  // 2186
      return 10;                                                                                              // 983  // 2187
    if (v instanceof RegExp)                                                                                  // 984  // 2188
      // note that typeof(/x/) === "object"                                                                   // 985  // 2189
      return 11;                                                                                              // 986  // 2190
    if (typeof v === "function")                                                                              // 987  // 2191
      return 13;                                                                                              // 988  // 2192
    if (v instanceof Date)                                                                                    // 989  // 2193
      return 9;                                                                                               // 990  // 2194
    if (EJSON.isBinary(v))                                                                                    // 991  // 2195
      return 5;                                                                                               // 992  // 2196
    if (v instanceof MongoID.ObjectID)                                                                        // 993  // 2197
      return 7;                                                                                               // 994  // 2198
    return 3; // object                                                                                       // 995  // 2199
                                                                                                              // 996  // 2200
    // XXX support some/all of these:                                                                         // 997  // 2201
    // 14, symbol                                                                                             // 998  // 2202
    // 15, javascript code with scope                                                                         // 999  // 2203
    // 16, 18: 32-bit/64-bit integer                                                                          // 1000
    // 17, timestamp                                                                                          // 1001
    // 255, minkey                                                                                            // 1002
    // 127, maxkey                                                                                            // 1003
  },                                                                                                          // 1004
                                                                                                              // 1005
  // deep equality test: use for literal document and array matches                                           // 1006
  _equal: function (a, b) {                                                                                   // 1007
    return EJSON.equals(a, b, {keyOrderSensitive: true});                                                     // 1008
  },                                                                                                          // 1009
                                                                                                              // 1010
  // maps a type code to a value that can be used to sort values of                                           // 1011
  // different types                                                                                          // 1012
  _typeorder: function (t) {                                                                                  // 1013
    // http://www.mongodb.org/display/DOCS/What+is+the+Compare+Order+for+BSON+Types                           // 1014
    // XXX what is the correct sort position for Javascript code?                                             // 1015
    // ('100' in the matrix below)                                                                            // 1016
    // XXX minkey/maxkey                                                                                      // 1017
    return [-1,  // (not a type)                                                                              // 1018
            1,   // number                                                                                    // 1019
            2,   // string                                                                                    // 1020
            3,   // object                                                                                    // 1021
            4,   // array                                                                                     // 1022
            5,   // binary                                                                                    // 1023
            -1,  // deprecated                                                                                // 1024
            6,   // ObjectID                                                                                  // 1025
            7,   // bool                                                                                      // 1026
            8,   // Date                                                                                      // 1027
            0,   // null                                                                                      // 1028
            9,   // RegExp                                                                                    // 1029
            -1,  // deprecated                                                                                // 1030
            100, // JS code                                                                                   // 1031
            2,   // deprecated (symbol)                                                                       // 1032
            100, // JS code                                                                                   // 1033
            1,   // 32-bit int                                                                                // 1034
            8,   // Mongo timestamp                                                                           // 1035
            1    // 64-bit int                                                                                // 1036
           ][t];                                                                                              // 1037
  },                                                                                                          // 1038
                                                                                                              // 1039
  // compare two values of unknown type according to BSON ordering                                            // 1040
  // semantics. (as an extension, consider 'undefined' to be less than                                        // 1041
  // any other value.) return negative if a is less, positive if b is                                         // 1042
  // less, or 0 if equal                                                                                      // 1043
  _cmp: function (a, b) {                                                                                     // 1044
    if (a === undefined)                                                                                      // 1045
      return b === undefined ? 0 : -1;                                                                        // 1046
    if (b === undefined)                                                                                      // 1047
      return 1;                                                                                               // 1048
    var ta = LocalCollection._f._type(a);                                                                     // 1049
    var tb = LocalCollection._f._type(b);                                                                     // 1050
    var oa = LocalCollection._f._typeorder(ta);                                                               // 1051
    var ob = LocalCollection._f._typeorder(tb);                                                               // 1052
    if (oa !== ob)                                                                                            // 1053
      return oa < ob ? -1 : 1;                                                                                // 1054
    if (ta !== tb)                                                                                            // 1055
      // XXX need to implement this if we implement Symbol or integers, or                                    // 1056
      // Timestamp                                                                                            // 1057
      throw Error("Missing type coercion logic in _cmp");                                                     // 1058
    if (ta === 7) { // ObjectID                                                                               // 1059
      // Convert to string.                                                                                   // 1060
      ta = tb = 2;                                                                                            // 1061
      a = a.toHexString();                                                                                    // 1062
      b = b.toHexString();                                                                                    // 1063
    }                                                                                                         // 1064
    if (ta === 9) { // Date                                                                                   // 1065
      // Convert to millis.                                                                                   // 1066
      ta = tb = 1;                                                                                            // 1067
      a = a.getTime();                                                                                        // 1068
      b = b.getTime();                                                                                        // 1069
    }                                                                                                         // 1070
                                                                                                              // 1071
    if (ta === 1) // double                                                                                   // 1072
      return a - b;                                                                                           // 1073
    if (tb === 2) // string                                                                                   // 1074
      return a < b ? -1 : (a === b ? 0 : 1);                                                                  // 1075
    if (ta === 3) { // Object                                                                                 // 1076
      // this could be much more efficient in the expected case ...                                           // 1077
      var to_array = function (obj) {                                                                         // 1078
        var ret = [];                                                                                         // 1079
        for (var key in obj) {                                                                                // 1080
          ret.push(key);                                                                                      // 1081
          ret.push(obj[key]);                                                                                 // 1082
        }                                                                                                     // 1083
        return ret;                                                                                           // 1084
      };                                                                                                      // 1085
      return LocalCollection._f._cmp(to_array(a), to_array(b));                                               // 1086
    }                                                                                                         // 1087
    if (ta === 4) { // Array                                                                                  // 1088
      for (var i = 0; ; i++) {                                                                                // 1089
        if (i === a.length)                                                                                   // 1090
          return (i === b.length) ? 0 : -1;                                                                   // 1091
        if (i === b.length)                                                                                   // 1092
          return 1;                                                                                           // 1093
        var s = LocalCollection._f._cmp(a[i], b[i]);                                                          // 1094
        if (s !== 0)                                                                                          // 1095
          return s;                                                                                           // 1096
      }                                                                                                       // 1097
    }                                                                                                         // 1098
    if (ta === 5) { // binary                                                                                 // 1099
      // Surprisingly, a small binary blob is always less than a large one in                                 // 1100
      // Mongo.                                                                                               // 1101
      if (a.length !== b.length)                                                                              // 1102
        return a.length - b.length;                                                                           // 1103
      for (i = 0; i < a.length; i++) {                                                                        // 1104
        if (a[i] < b[i])                                                                                      // 1105
          return -1;                                                                                          // 1106
        if (a[i] > b[i])                                                                                      // 1107
          return 1;                                                                                           // 1108
      }                                                                                                       // 1109
      return 0;                                                                                               // 1110
    }                                                                                                         // 1111
    if (ta === 8) { // boolean                                                                                // 1112
      if (a) return b ? 0 : 1;                                                                                // 1113
      return b ? -1 : 0;                                                                                      // 1114
    }                                                                                                         // 1115
    if (ta === 10) // null                                                                                    // 1116
      return 0;                                                                                               // 1117
    if (ta === 11) // regexp                                                                                  // 1118
      throw Error("Sorting not supported on regular expression"); // XXX                                      // 1119
    // 13: javascript code                                                                                    // 1120
    // 14: symbol                                                                                             // 1121
    // 15: javascript code with scope                                                                         // 1122
    // 16: 32-bit integer                                                                                     // 1123
    // 17: timestamp                                                                                          // 1124
    // 18: 64-bit integer                                                                                     // 1125
    // 255: minkey                                                                                            // 1126
    // 127: maxkey                                                                                            // 1127
    if (ta === 13) // javascript code                                                                         // 1128
      throw Error("Sorting not supported on Javascript code"); // XXX                                         // 1129
    throw Error("Unknown type to sort");                                                                      // 1130
  }                                                                                                           // 1131
};                                                                                                            // 1132
                                                                                                              // 1133
// Oddball function used by upsert.                                                                           // 1134
LocalCollection._removeDollarOperators = function (selector) {                                                // 1135
  var selectorDoc = {};                                                                                       // 1136
  for (var k in selector)                                                                                     // 1137
    if (k.substr(0, 1) !== '$')                                                                               // 1138
      selectorDoc[k] = selector[k];                                                                           // 1139
  return selectorDoc;                                                                                         // 1140
};                                                                                                            // 1141
                                                                                                              // 1142
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2347
                                                                                                                      // 2348
}).call(this);                                                                                                        // 2349
                                                                                                                      // 2350
                                                                                                                      // 2351
                                                                                                                      // 2352
                                                                                                                      // 2353
                                                                                                                      // 2354
                                                                                                                      // 2355
(function(){                                                                                                          // 2356
                                                                                                                      // 2357
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2358
//                                                                                                            //      // 2359
// packages/minimongo/sort.js                                                                                 //      // 2360
//                                                                                                            //      // 2361
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2362
                                                                                                              //      // 2363
// Give a sort spec, which can be in any of these forms:                                                      // 1    // 2364
//   {"key1": 1, "key2": -1}                                                                                  // 2    // 2365
//   [["key1", "asc"], ["key2", "desc"]]                                                                      // 3    // 2366
//   ["key1", ["key2", "desc"]]                                                                               // 4    // 2367
//                                                                                                            // 5    // 2368
// (.. with the first form being dependent on the key enumeration                                             // 6    // 2369
// behavior of your javascript VM, which usually does what you mean in                                        // 7    // 2370
// this case if the key names don't look like integers ..)                                                    // 8    // 2371
//                                                                                                            // 9    // 2372
// return a function that takes two objects, and returns -1 if the                                            // 10   // 2373
// first object comes first in order, 1 if the second object comes                                            // 11   // 2374
// first, or 0 if neither object comes before the other.                                                      // 12   // 2375
                                                                                                              // 13   // 2376
Minimongo.Sorter = function (spec, options) {                                                                 // 14   // 2377
  var self = this;                                                                                            // 15   // 2378
  options = options || {};                                                                                    // 16   // 2379
                                                                                                              // 17   // 2380
  self._sortSpecParts = [];                                                                                   // 18   // 2381
                                                                                                              // 19   // 2382
  var addSpecPart = function (path, ascending) {                                                              // 20   // 2383
    if (!path)                                                                                                // 21   // 2384
      throw Error("sort keys must be non-empty");                                                             // 22   // 2385
    if (path.charAt(0) === '$')                                                                               // 23   // 2386
      throw Error("unsupported sort key: " + path);                                                           // 24   // 2387
    self._sortSpecParts.push({                                                                                // 25   // 2388
      path: path,                                                                                             // 26   // 2389
      lookup: makeLookupFunction(path, {forSort: true}),                                                      // 27   // 2390
      ascending: ascending                                                                                    // 28   // 2391
    });                                                                                                       // 29   // 2392
  };                                                                                                          // 30   // 2393
                                                                                                              // 31   // 2394
  if (spec instanceof Array) {                                                                                // 32   // 2395
    for (var i = 0; i < spec.length; i++) {                                                                   // 33   // 2396
      if (typeof spec[i] === "string") {                                                                      // 34   // 2397
        addSpecPart(spec[i], true);                                                                           // 35   // 2398
      } else {                                                                                                // 36   // 2399
        addSpecPart(spec[i][0], spec[i][1] !== "desc");                                                       // 37   // 2400
      }                                                                                                       // 38   // 2401
    }                                                                                                         // 39   // 2402
  } else if (typeof spec === "object") {                                                                      // 40   // 2403
    _.each(spec, function (value, key) {                                                                      // 41   // 2404
      addSpecPart(key, value >= 0);                                                                           // 42   // 2405
    });                                                                                                       // 43   // 2406
  } else {                                                                                                    // 44   // 2407
    throw Error("Bad sort specification: " + JSON.stringify(spec));                                           // 45   // 2408
  }                                                                                                           // 46   // 2409
                                                                                                              // 47   // 2410
  // To implement affectedByModifier, we piggy-back on top of Matcher's                                       // 48   // 2411
  // affectedByModifier code; we create a selector that is affected by the same                               // 49   // 2412
  // modifiers as this sort order. This is only implemented on the server.                                    // 50   // 2413
  if (self.affectedByModifier) {                                                                              // 51   // 2414
    var selector = {};                                                                                        // 52   // 2415
    _.each(self._sortSpecParts, function (spec) {                                                             // 53   // 2416
      selector[spec.path] = 1;                                                                                // 54   // 2417
    });                                                                                                       // 55   // 2418
    self._selectorForAffectedByModifier = new Minimongo.Matcher(selector);                                    // 56   // 2419
  }                                                                                                           // 57   // 2420
                                                                                                              // 58   // 2421
  self._keyComparator = composeComparators(                                                                   // 59   // 2422
    _.map(self._sortSpecParts, function (spec, i) {                                                           // 60   // 2423
      return self._keyFieldComparator(i);                                                                     // 61   // 2424
    }));                                                                                                      // 62   // 2425
                                                                                                              // 63   // 2426
  // If you specify a matcher for this Sorter, _keyFilter may be set to a                                     // 64   // 2427
  // function which selects whether or not a given "sort key" (tuple of values                                // 65   // 2428
  // for the different sort spec fields) is compatible with the selector.                                     // 66   // 2429
  self._keyFilter = null;                                                                                     // 67   // 2430
  options.matcher && self._useWithMatcher(options.matcher);                                                   // 68   // 2431
};                                                                                                            // 69   // 2432
                                                                                                              // 70   // 2433
// In addition to these methods, sorter_project.js defines combineIntoProjection                              // 71   // 2434
// on the server only.                                                                                        // 72   // 2435
_.extend(Minimongo.Sorter.prototype, {                                                                        // 73   // 2436
  getComparator: function (options) {                                                                         // 74   // 2437
    var self = this;                                                                                          // 75   // 2438
                                                                                                              // 76   // 2439
    // If we have no distances, just use the comparator from the source                                       // 77   // 2440
    // specification (which defaults to "everything is equal".                                                // 78   // 2441
    if (!options || !options.distances) {                                                                     // 79   // 2442
      return self._getBaseComparator();                                                                       // 80   // 2443
    }                                                                                                         // 81   // 2444
                                                                                                              // 82   // 2445
    var distances = options.distances;                                                                        // 83   // 2446
                                                                                                              // 84   // 2447
    // Return a comparator which first tries the sort specification, and if that                              // 85   // 2448
    // says "it's equal", breaks ties using $near distances.                                                  // 86   // 2449
    return composeComparators([self._getBaseComparator(), function (a, b) {                                   // 87   // 2450
      if (!distances.has(a._id))                                                                              // 88   // 2451
        throw Error("Missing distance for " + a._id);                                                         // 89   // 2452
      if (!distances.has(b._id))                                                                              // 90   // 2453
        throw Error("Missing distance for " + b._id);                                                         // 91   // 2454
      return distances.get(a._id) - distances.get(b._id);                                                     // 92   // 2455
    }]);                                                                                                      // 93   // 2456
  },                                                                                                          // 94   // 2457
                                                                                                              // 95   // 2458
  _getPaths: function () {                                                                                    // 96   // 2459
    var self = this;                                                                                          // 97   // 2460
    return _.pluck(self._sortSpecParts, 'path');                                                              // 98   // 2461
  },                                                                                                          // 99   // 2462
                                                                                                              // 100  // 2463
  // Finds the minimum key from the doc, according to the sort specs.  (We say                                // 101  // 2464
  // "minimum" here but this is with respect to the sort spec, so "descending"                                // 102  // 2465
  // sort fields mean we're finding the max for that field.)                                                  // 103  // 2466
  //                                                                                                          // 104  // 2467
  // Note that this is NOT "find the minimum value of the first field, the                                    // 105  // 2468
  // minimum value of the second field, etc"... it's "choose the                                              // 106  // 2469
  // lexicographically minimum value of the key vector, allowing only keys which                              // 107  // 2470
  // you can find along the same paths".  ie, for a doc {a: [{x: 0, y: 5}, {x:                                // 108  // 2471
  // 1, y: 3}]} with sort spec {'a.x': 1, 'a.y': 1}, the only keys are [0,5] and                              // 109  // 2472
  // [1,3], and the minimum key is [0,5]; notably, [0,3] is NOT a key.                                        // 110  // 2473
  _getMinKeyFromDoc: function (doc) {                                                                         // 111  // 2474
    var self = this;                                                                                          // 112  // 2475
    var minKey = null;                                                                                        // 113  // 2476
                                                                                                              // 114  // 2477
    self._generateKeysFromDoc(doc, function (key) {                                                           // 115  // 2478
      if (!self._keyCompatibleWithSelector(key))                                                              // 116  // 2479
        return;                                                                                               // 117  // 2480
                                                                                                              // 118  // 2481
      if (minKey === null) {                                                                                  // 119  // 2482
        minKey = key;                                                                                         // 120  // 2483
        return;                                                                                               // 121  // 2484
      }                                                                                                       // 122  // 2485
      if (self._compareKeys(key, minKey) < 0) {                                                               // 123  // 2486
        minKey = key;                                                                                         // 124  // 2487
      }                                                                                                       // 125  // 2488
    });                                                                                                       // 126  // 2489
                                                                                                              // 127  // 2490
    // This could happen if our key filter somehow filters out all the keys even                              // 128  // 2491
    // though somehow the selector matches.                                                                   // 129  // 2492
    if (minKey === null)                                                                                      // 130  // 2493
      throw Error("sort selector found no keys in doc?");                                                     // 131  // 2494
    return minKey;                                                                                            // 132  // 2495
  },                                                                                                          // 133  // 2496
                                                                                                              // 134  // 2497
  _keyCompatibleWithSelector: function (key) {                                                                // 135  // 2498
    var self = this;                                                                                          // 136  // 2499
    return !self._keyFilter || self._keyFilter(key);                                                          // 137  // 2500
  },                                                                                                          // 138  // 2501
                                                                                                              // 139  // 2502
  // Iterates over each possible "key" from doc (ie, over each branch), calling                               // 140  // 2503
  // 'cb' with the key.                                                                                       // 141  // 2504
  _generateKeysFromDoc: function (doc, cb) {                                                                  // 142  // 2505
    var self = this;                                                                                          // 143  // 2506
                                                                                                              // 144  // 2507
    if (self._sortSpecParts.length === 0)                                                                     // 145  // 2508
      throw new Error("can't generate keys without a spec");                                                  // 146  // 2509
                                                                                                              // 147  // 2510
    // maps index -> ({'' -> value} or {path -> value})                                                       // 148  // 2511
    var valuesByIndexAndPath = [];                                                                            // 149  // 2512
                                                                                                              // 150  // 2513
    var pathFromIndices = function (indices) {                                                                // 151  // 2514
      return indices.join(',') + ',';                                                                         // 152  // 2515
    };                                                                                                        // 153  // 2516
                                                                                                              // 154  // 2517
    var knownPaths = null;                                                                                    // 155  // 2518
                                                                                                              // 156  // 2519
    _.each(self._sortSpecParts, function (spec, whichField) {                                                 // 157  // 2520
      // Expand any leaf arrays that we find, and ignore those arrays                                         // 158  // 2521
      // themselves.  (We never sort based on an array itself.)                                               // 159  // 2522
      var branches = expandArraysInBranches(spec.lookup(doc), true);                                          // 160  // 2523
                                                                                                              // 161  // 2524
      // If there are no values for a key (eg, key goes to an empty array),                                   // 162  // 2525
      // pretend we found one null value.                                                                     // 163  // 2526
      if (!branches.length)                                                                                   // 164  // 2527
        branches = [{value: null}];                                                                           // 165  // 2528
                                                                                                              // 166  // 2529
      var usedPaths = false;                                                                                  // 167  // 2530
      valuesByIndexAndPath[whichField] = {};                                                                  // 168  // 2531
      _.each(branches, function (branch) {                                                                    // 169  // 2532
        if (!branch.arrayIndices) {                                                                           // 170  // 2533
          // If there are no array indices for a branch, then it must be the                                  // 171  // 2534
          // only branch, because the only thing that produces multiple branches                              // 172  // 2535
          // is the use of arrays.                                                                            // 173  // 2536
          if (branches.length > 1)                                                                            // 174  // 2537
            throw Error("multiple branches but no array used?");                                              // 175  // 2538
          valuesByIndexAndPath[whichField][''] = branch.value;                                                // 176  // 2539
          return;                                                                                             // 177  // 2540
        }                                                                                                     // 178  // 2541
                                                                                                              // 179  // 2542
        usedPaths = true;                                                                                     // 180  // 2543
        var path = pathFromIndices(branch.arrayIndices);                                                      // 181  // 2544
        if (_.has(valuesByIndexAndPath[whichField], path))                                                    // 182  // 2545
          throw Error("duplicate path: " + path);                                                             // 183  // 2546
        valuesByIndexAndPath[whichField][path] = branch.value;                                                // 184  // 2547
                                                                                                              // 185  // 2548
        // If two sort fields both go into arrays, they have to go into the                                   // 186  // 2549
        // exact same arrays and we have to find the same paths.  This is                                     // 187  // 2550
        // roughly the same condition that makes MongoDB throw this strange                                   // 188  // 2551
        // error message.  eg, the main thing is that if sort spec is {a: 1,                                  // 189  // 2552
        // b:1} then a and b cannot both be arrays.                                                           // 190  // 2553
        //                                                                                                    // 191  // 2554
        // (In MongoDB it seems to be OK to have {a: 1, 'a.x.y': 1} where 'a'                                 // 192  // 2555
        // and 'a.x.y' are both arrays, but we don't allow this for now.                                      // 193  // 2556
        // #NestedArraySort                                                                                   // 194  // 2557
        // XXX achieve full compatibility here                                                                // 195  // 2558
        if (knownPaths && !_.has(knownPaths, path)) {                                                         // 196  // 2559
          throw Error("cannot index parallel arrays");                                                        // 197  // 2560
        }                                                                                                     // 198  // 2561
      });                                                                                                     // 199  // 2562
                                                                                                              // 200  // 2563
      if (knownPaths) {                                                                                       // 201  // 2564
        // Similarly to above, paths must match everywhere, unless this is a                                  // 202  // 2565
        // non-array field.                                                                                   // 203  // 2566
        if (!_.has(valuesByIndexAndPath[whichField], '') &&                                                   // 204  // 2567
            _.size(knownPaths) !== _.size(valuesByIndexAndPath[whichField])) {                                // 205  // 2568
          throw Error("cannot index parallel arrays!");                                                       // 206  // 2569
        }                                                                                                     // 207  // 2570
      } else if (usedPaths) {                                                                                 // 208  // 2571
        knownPaths = {};                                                                                      // 209  // 2572
        _.each(valuesByIndexAndPath[whichField], function (x, path) {                                         // 210  // 2573
          knownPaths[path] = true;                                                                            // 211  // 2574
        });                                                                                                   // 212  // 2575
      }                                                                                                       // 213  // 2576
    });                                                                                                       // 214  // 2577
                                                                                                              // 215  // 2578
    if (!knownPaths) {                                                                                        // 216  // 2579
      // Easy case: no use of arrays.                                                                         // 217  // 2580
      var soleKey = _.map(valuesByIndexAndPath, function (values) {                                           // 218  // 2581
        if (!_.has(values, ''))                                                                               // 219  // 2582
          throw Error("no value in sole key case?");                                                          // 220  // 2583
        return values[''];                                                                                    // 221  // 2584
      });                                                                                                     // 222  // 2585
      cb(soleKey);                                                                                            // 223  // 2586
      return;                                                                                                 // 224  // 2587
    }                                                                                                         // 225  // 2588
                                                                                                              // 226  // 2589
    _.each(knownPaths, function (x, path) {                                                                   // 227  // 2590
      var key = _.map(valuesByIndexAndPath, function (values) {                                               // 228  // 2591
        if (_.has(values, ''))                                                                                // 229  // 2592
          return values[''];                                                                                  // 230  // 2593
        if (!_.has(values, path))                                                                             // 231  // 2594
          throw Error("missing path?");                                                                       // 232  // 2595
        return values[path];                                                                                  // 233  // 2596
      });                                                                                                     // 234  // 2597
      cb(key);                                                                                                // 235  // 2598
    });                                                                                                       // 236  // 2599
  },                                                                                                          // 237  // 2600
                                                                                                              // 238  // 2601
  // Takes in two keys: arrays whose lengths match the number of spec                                         // 239  // 2602
  // parts. Returns negative, 0, or positive based on using the sort spec to                                  // 240  // 2603
  // compare fields.                                                                                          // 241  // 2604
  _compareKeys: function (key1, key2) {                                                                       // 242  // 2605
    var self = this;                                                                                          // 243  // 2606
    if (key1.length !== self._sortSpecParts.length ||                                                         // 244  // 2607
        key2.length !== self._sortSpecParts.length) {                                                         // 245  // 2608
      throw Error("Key has wrong length");                                                                    // 246  // 2609
    }                                                                                                         // 247  // 2610
                                                                                                              // 248  // 2611
    return self._keyComparator(key1, key2);                                                                   // 249  // 2612
  },                                                                                                          // 250  // 2613
                                                                                                              // 251  // 2614
  // Given an index 'i', returns a comparator that compares two key arrays based                              // 252  // 2615
  // on field 'i'.                                                                                            // 253  // 2616
  _keyFieldComparator: function (i) {                                                                         // 254  // 2617
    var self = this;                                                                                          // 255  // 2618
    var invert = !self._sortSpecParts[i].ascending;                                                           // 256  // 2619
    return function (key1, key2) {                                                                            // 257  // 2620
      var compare = LocalCollection._f._cmp(key1[i], key2[i]);                                                // 258  // 2621
      if (invert)                                                                                             // 259  // 2622
        compare = -compare;                                                                                   // 260  // 2623
      return compare;                                                                                         // 261  // 2624
    };                                                                                                        // 262  // 2625
  },                                                                                                          // 263  // 2626
                                                                                                              // 264  // 2627
  // Returns a comparator that represents the sort specification (but not                                     // 265  // 2628
  // including a possible geoquery distance tie-breaker).                                                     // 266  // 2629
  _getBaseComparator: function () {                                                                           // 267  // 2630
    var self = this;                                                                                          // 268  // 2631
                                                                                                              // 269  // 2632
    // If we're only sorting on geoquery distance and no specs, just say                                      // 270  // 2633
    // everything is equal.                                                                                   // 271  // 2634
    if (!self._sortSpecParts.length) {                                                                        // 272  // 2635
      return function (doc1, doc2) {                                                                          // 273  // 2636
        return 0;                                                                                             // 274  // 2637
      };                                                                                                      // 275  // 2638
    }                                                                                                         // 276  // 2639
                                                                                                              // 277  // 2640
    return function (doc1, doc2) {                                                                            // 278  // 2641
      var key1 = self._getMinKeyFromDoc(doc1);                                                                // 279  // 2642
      var key2 = self._getMinKeyFromDoc(doc2);                                                                // 280  // 2643
      return self._compareKeys(key1, key2);                                                                   // 281  // 2644
    };                                                                                                        // 282  // 2645
  },                                                                                                          // 283  // 2646
                                                                                                              // 284  // 2647
  // In MongoDB, if you have documents                                                                        // 285  // 2648
  //    {_id: 'x', a: [1, 10]} and                                                                            // 286  // 2649
  //    {_id: 'y', a: [5, 15]},                                                                               // 287  // 2650
  // then C.find({}, {sort: {a: 1}}) puts x before y (1 comes before 5).                                      // 288  // 2651
  // But  C.find({a: {$gt: 3}}, {sort: {a: 1}}) puts y before x (1 does not                                   // 289  // 2652
  // match the selector, and 5 comes before 10).                                                              // 290  // 2653
  //                                                                                                          // 291  // 2654
  // The way this works is pretty subtle!  For example, if the documents                                      // 292  // 2655
  // are instead {_id: 'x', a: [{x: 1}, {x: 10}]}) and                                                        // 293  // 2656
  //             {_id: 'y', a: [{x: 5}, {x: 15}]}),                                                           // 294  // 2657
  // then C.find({'a.x': {$gt: 3}}, {sort: {'a.x': 1}}) and                                                   // 295  // 2658
  //      C.find({a: {$elemMatch: {x: {$gt: 3}}}}, {sort: {'a.x': 1}})                                        // 296  // 2659
  // both follow this rule (y before x).  (ie, you do have to apply this                                      // 297  // 2660
  // through $elemMatch.)                                                                                     // 298  // 2661
  //                                                                                                          // 299  // 2662
  // So if you pass a matcher to this sorter's constructor, we will attempt to                                // 300  // 2663
  // skip sort keys that don't match the selector. The logic here is pretty                                   // 301  // 2664
  // subtle and undocumented; we've gotten as close as we can figure out based                                // 302  // 2665
  // on our understanding of Mongo's behavior.                                                                // 303  // 2666
  _useWithMatcher: function (matcher) {                                                                       // 304  // 2667
    var self = this;                                                                                          // 305  // 2668
                                                                                                              // 306  // 2669
    if (self._keyFilter)                                                                                      // 307  // 2670
      throw Error("called _useWithMatcher twice?");                                                           // 308  // 2671
                                                                                                              // 309  // 2672
    // If we are only sorting by distance, then we're not going to bother to                                  // 310  // 2673
    // build a key filter.                                                                                    // 311  // 2674
    // XXX figure out how geoqueries interact with this stuff                                                 // 312  // 2675
    if (_.isEmpty(self._sortSpecParts))                                                                       // 313  // 2676
      return;                                                                                                 // 314  // 2677
                                                                                                              // 315  // 2678
    var selector = matcher._selector;                                                                         // 316  // 2679
                                                                                                              // 317  // 2680
    // If the user just passed a literal function to find(), then we can't get a                              // 318  // 2681
    // key filter from it.                                                                                    // 319  // 2682
    if (selector instanceof Function)                                                                         // 320  // 2683
      return;                                                                                                 // 321  // 2684
                                                                                                              // 322  // 2685
    var constraintsByPath = {};                                                                               // 323  // 2686
    _.each(self._sortSpecParts, function (spec, i) {                                                          // 324  // 2687
      constraintsByPath[spec.path] = [];                                                                      // 325  // 2688
    });                                                                                                       // 326  // 2689
                                                                                                              // 327  // 2690
    _.each(selector, function (subSelector, key) {                                                            // 328  // 2691
      // XXX support $and and $or                                                                             // 329  // 2692
                                                                                                              // 330  // 2693
      var constraints = constraintsByPath[key];                                                               // 331  // 2694
      if (!constraints)                                                                                       // 332  // 2695
        return;                                                                                               // 333  // 2696
                                                                                                              // 334  // 2697
      // XXX it looks like the real MongoDB implementation isn't "does the                                    // 335  // 2698
      // regexp match" but "does the value fall into a range named by the                                     // 336  // 2699
      // literal prefix of the regexp", ie "foo" in /^foo(bar|baz)+/  But                                     // 337  // 2700
      // "does the regexp match" is a good approximation.                                                     // 338  // 2701
      if (subSelector instanceof RegExp) {                                                                    // 339  // 2702
        // As far as we can tell, using either of the options that both we and                                // 340  // 2703
        // MongoDB support ('i' and 'm') disables use of the key filter. This                                 // 341  // 2704
        // makes sense: MongoDB mostly appears to be calculating ranges of an                                 // 342  // 2705
        // index to use, which means it only cares about regexps that match                                   // 343  // 2706
        // one range (with a literal prefix), and both 'i' and 'm' prevent the                                // 344  // 2707
        // literal prefix of the regexp from actually meaning one range.                                      // 345  // 2708
        if (subSelector.ignoreCase || subSelector.multiline)                                                  // 346  // 2709
          return;                                                                                             // 347  // 2710
        constraints.push(regexpElementMatcher(subSelector));                                                  // 348  // 2711
        return;                                                                                               // 349  // 2712
      }                                                                                                       // 350  // 2713
                                                                                                              // 351  // 2714
      if (isOperatorObject(subSelector)) {                                                                    // 352  // 2715
        _.each(subSelector, function (operand, operator) {                                                    // 353  // 2716
          if (_.contains(['$lt', '$lte', '$gt', '$gte'], operator)) {                                         // 354  // 2717
            // XXX this depends on us knowing that these operators don't use any                              // 355  // 2718
            // of the arguments to compileElementSelector other than operand.                                 // 356  // 2719
            constraints.push(                                                                                 // 357  // 2720
              ELEMENT_OPERATORS[operator].compileElementSelector(operand));                                   // 358  // 2721
          }                                                                                                   // 359  // 2722
                                                                                                              // 360  // 2723
          // See comments in the RegExp block above.                                                          // 361  // 2724
          if (operator === '$regex' && !subSelector.$options) {                                               // 362  // 2725
            constraints.push(                                                                                 // 363  // 2726
              ELEMENT_OPERATORS.$regex.compileElementSelector(                                                // 364  // 2727
                operand, subSelector));                                                                       // 365  // 2728
          }                                                                                                   // 366  // 2729
                                                                                                              // 367  // 2730
          // XXX support {$exists: true}, $mod, $type, $in, $elemMatch                                        // 368  // 2731
        });                                                                                                   // 369  // 2732
        return;                                                                                               // 370  // 2733
      }                                                                                                       // 371  // 2734
                                                                                                              // 372  // 2735
      // OK, it's an equality thing.                                                                          // 373  // 2736
      constraints.push(equalityElementMatcher(subSelector));                                                  // 374  // 2737
    });                                                                                                       // 375  // 2738
                                                                                                              // 376  // 2739
    // It appears that the first sort field is treated differently from the                                   // 377  // 2740
    // others; we shouldn't create a key filter unless the first sort field is                                // 378  // 2741
    // restricted, though after that point we can restrict the other sort fields                              // 379  // 2742
    // or not as we wish.                                                                                     // 380  // 2743
    if (_.isEmpty(constraintsByPath[self._sortSpecParts[0].path]))                                            // 381  // 2744
      return;                                                                                                 // 382  // 2745
                                                                                                              // 383  // 2746
    self._keyFilter = function (key) {                                                                        // 384  // 2747
      return _.all(self._sortSpecParts, function (specPart, index) {                                          // 385  // 2748
        return _.all(constraintsByPath[specPart.path], function (f) {                                         // 386  // 2749
          return f(key[index]);                                                                               // 387  // 2750
        });                                                                                                   // 388  // 2751
      });                                                                                                     // 389  // 2752
    };                                                                                                        // 390  // 2753
  }                                                                                                           // 391  // 2754
});                                                                                                           // 392  // 2755
                                                                                                              // 393  // 2756
// Given an array of comparators                                                                              // 394  // 2757
// (functions (a,b)->(negative or positive or zero)), returns a single                                        // 395  // 2758
// comparator which uses each comparator in order and returns the first                                       // 396  // 2759
// non-zero value.                                                                                            // 397  // 2760
var composeComparators = function (comparatorArray) {                                                         // 398  // 2761
  return function (a, b) {                                                                                    // 399  // 2762
    for (var i = 0; i < comparatorArray.length; ++i) {                                                        // 400  // 2763
      var compare = comparatorArray[i](a, b);                                                                 // 401  // 2764
      if (compare !== 0)                                                                                      // 402  // 2765
        return compare;                                                                                       // 403  // 2766
    }                                                                                                         // 404  // 2767
    return 0;                                                                                                 // 405  // 2768
  };                                                                                                          // 406  // 2769
};                                                                                                            // 407  // 2770
                                                                                                              // 408  // 2771
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2772
                                                                                                                      // 2773
}).call(this);                                                                                                        // 2774
                                                                                                                      // 2775
                                                                                                                      // 2776
                                                                                                                      // 2777
                                                                                                                      // 2778
                                                                                                                      // 2779
                                                                                                                      // 2780
(function(){                                                                                                          // 2781
                                                                                                                      // 2782
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2783
//                                                                                                            //      // 2784
// packages/minimongo/projection.js                                                                           //      // 2785
//                                                                                                            //      // 2786
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2787
                                                                                                              //      // 2788
// Knows how to compile a fields projection to a predicate function.                                          // 1    // 2789
// @returns - Function: a closure that filters out an object according to the                                 // 2    // 2790
//            fields projection rules:                                                                        // 3    // 2791
//            @param obj - Object: MongoDB-styled document                                                    // 4    // 2792
//            @returns - Object: a document with the fields filtered out                                      // 5    // 2793
//                       according to projection rules. Doesn't retain subfields                              // 6    // 2794
//                       of passed argument.                                                                  // 7    // 2795
LocalCollection._compileProjection = function (fields) {                                                      // 8    // 2796
  LocalCollection._checkSupportedProjection(fields);                                                          // 9    // 2797
                                                                                                              // 10   // 2798
  var _idProjection = _.isUndefined(fields._id) ? true : fields._id;                                          // 11   // 2799
  var details = projectionDetails(fields);                                                                    // 12   // 2800
                                                                                                              // 13   // 2801
  // returns transformed doc according to ruleTree                                                            // 14   // 2802
  var transform = function (doc, ruleTree) {                                                                  // 15   // 2803
    // Special case for "sets"                                                                                // 16   // 2804
    if (_.isArray(doc))                                                                                       // 17   // 2805
      return _.map(doc, function (subdoc) { return transform(subdoc, ruleTree); });                           // 18   // 2806
                                                                                                              // 19   // 2807
    var res = details.including ? {} : EJSON.clone(doc);                                                      // 20   // 2808
    _.each(ruleTree, function (rule, key) {                                                                   // 21   // 2809
      if (!_.has(doc, key))                                                                                   // 22   // 2810
        return;                                                                                               // 23   // 2811
      if (_.isObject(rule)) {                                                                                 // 24   // 2812
        // For sub-objects/subsets we branch                                                                  // 25   // 2813
        if (_.isObject(doc[key]))                                                                             // 26   // 2814
          res[key] = transform(doc[key], rule);                                                               // 27   // 2815
        // Otherwise we don't even touch this subfield                                                        // 28   // 2816
      } else if (details.including)                                                                           // 29   // 2817
        res[key] = EJSON.clone(doc[key]);                                                                     // 30   // 2818
      else                                                                                                    // 31   // 2819
        delete res[key];                                                                                      // 32   // 2820
    });                                                                                                       // 33   // 2821
                                                                                                              // 34   // 2822
    return res;                                                                                               // 35   // 2823
  };                                                                                                          // 36   // 2824
                                                                                                              // 37   // 2825
  return function (obj) {                                                                                     // 38   // 2826
    var res = transform(obj, details.tree);                                                                   // 39   // 2827
                                                                                                              // 40   // 2828
    if (_idProjection && _.has(obj, '_id'))                                                                   // 41   // 2829
      res._id = obj._id;                                                                                      // 42   // 2830
    if (!_idProjection && _.has(res, '_id'))                                                                  // 43   // 2831
      delete res._id;                                                                                         // 44   // 2832
    return res;                                                                                               // 45   // 2833
  };                                                                                                          // 46   // 2834
};                                                                                                            // 47   // 2835
                                                                                                              // 48   // 2836
// Traverses the keys of passed projection and constructs a tree where all                                    // 49   // 2837
// leaves are either all True or all False                                                                    // 50   // 2838
// @returns Object:                                                                                           // 51   // 2839
//  - tree - Object - tree representation of keys involved in projection                                      // 52   // 2840
//  (exception for '_id' as it is a special case handled separately)                                          // 53   // 2841
//  - including - Boolean - "take only certain fields" type of projection                                     // 54   // 2842
projectionDetails = function (fields) {                                                                       // 55   // 2843
  // Find the non-_id keys (_id is handled specially because it is included unless                            // 56   // 2844
  // explicitly excluded). Sort the keys, so that our code to detect overlaps                                 // 57   // 2845
  // like 'foo' and 'foo.bar' can assume that 'foo' comes first.                                              // 58   // 2846
  var fieldsKeys = _.keys(fields).sort();                                                                     // 59   // 2847
                                                                                                              // 60   // 2848
  // If _id is the only field in the projection, do not remove it, since it is                                // 61   // 2849
  // required to determine if this is an exclusion or exclusion. Also keep an                                 // 62   // 2850
  // inclusive _id, since inclusive _id follows the normal rules about mixing                                 // 63   // 2851
  // inclusive and exclusive fields. If _id is not the only field in the                                      // 64   // 2852
  // projection and is exclusive, remove it so it can be handled later by a                                   // 65   // 2853
  // special case, since exclusive _id is always allowed.                                                     // 66   // 2854
  if (fieldsKeys.length > 0 &&                                                                                // 67   // 2855
      !(fieldsKeys.length === 1 && fieldsKeys[0] === '_id') &&                                                // 68   // 2856
      !(_.contains(fieldsKeys, '_id') && fields['_id']))                                                      // 69   // 2857
    fieldsKeys = _.reject(fieldsKeys, function (key) { return key === '_id'; });                              // 70   // 2858
                                                                                                              // 71   // 2859
  var including = null; // Unknown                                                                            // 72   // 2860
                                                                                                              // 73   // 2861
  _.each(fieldsKeys, function (keyPath) {                                                                     // 74   // 2862
    var rule = !!fields[keyPath];                                                                             // 75   // 2863
    if (including === null)                                                                                   // 76   // 2864
      including = rule;                                                                                       // 77   // 2865
    if (including !== rule)                                                                                   // 78   // 2866
      // This error message is copied from MongoDB shell                                                      // 79   // 2867
      throw MinimongoError("You cannot currently mix including and excluding fields.");                       // 80   // 2868
  });                                                                                                         // 81   // 2869
                                                                                                              // 82   // 2870
                                                                                                              // 83   // 2871
  var projectionRulesTree = pathsToTree(                                                                      // 84   // 2872
    fieldsKeys,                                                                                               // 85   // 2873
    function (path) { return including; },                                                                    // 86   // 2874
    function (node, path, fullPath) {                                                                         // 87   // 2875
      // Check passed projection fields' keys: If you have two rules such as                                  // 88   // 2876
      // 'foo.bar' and 'foo.bar.baz', then the result becomes ambiguous. If                                   // 89   // 2877
      // that happens, there is a probability you are doing something wrong,                                  // 90   // 2878
      // framework should notify you about such mistake earlier on cursor                                     // 91   // 2879
      // compilation step than later during runtime.  Note, that real mongo                                   // 92   // 2880
      // doesn't do anything about it and the later rule appears in projection                                // 93   // 2881
      // project, more priority it takes.                                                                     // 94   // 2882
      //                                                                                                      // 95   // 2883
      // Example, assume following in mongo shell:                                                            // 96   // 2884
      // > db.coll.insert({ a: { b: 23, c: 44 } })                                                            // 97   // 2885
      // > db.coll.find({}, { 'a': 1, 'a.b': 1 })                                                             // 98   // 2886
      // { "_id" : ObjectId("520bfe456024608e8ef24af3"), "a" : { "b" : 23 } }                                 // 99   // 2887
      // > db.coll.find({}, { 'a.b': 1, 'a': 1 })                                                             // 100  // 2888
      // { "_id" : ObjectId("520bfe456024608e8ef24af3"), "a" : { "b" : 23, "c" : 44 } }                       // 101  // 2889
      //                                                                                                      // 102  // 2890
      // Note, how second time the return set of keys is different.                                           // 103  // 2891
                                                                                                              // 104  // 2892
      var currentPath = fullPath;                                                                             // 105  // 2893
      var anotherPath = path;                                                                                 // 106  // 2894
      throw MinimongoError("both " + currentPath + " and " + anotherPath +                                    // 107  // 2895
                           " found in fields option, using both of them may trigger " +                       // 108  // 2896
                           "unexpected behavior. Did you mean to use only one of them?");                     // 109  // 2897
    });                                                                                                       // 110  // 2898
                                                                                                              // 111  // 2899
  return {                                                                                                    // 112  // 2900
    tree: projectionRulesTree,                                                                                // 113  // 2901
    including: including                                                                                      // 114  // 2902
  };                                                                                                          // 115  // 2903
};                                                                                                            // 116  // 2904
                                                                                                              // 117  // 2905
// paths - Array: list of mongo style paths                                                                   // 118  // 2906
// newLeafFn - Function: of form function(path) should return a scalar value to                               // 119  // 2907
//                       put into list created for that path                                                  // 120  // 2908
// conflictFn - Function: of form function(node, path, fullPath) is called                                    // 121  // 2909
//                        when building a tree path for 'fullPath' node on                                    // 122  // 2910
//                        'path' was already a leaf with a value. Must return a                               // 123  // 2911
//                        conflict resolution.                                                                // 124  // 2912
// initial tree - Optional Object: starting tree.                                                             // 125  // 2913
// @returns - Object: tree represented as a set of nested objects                                             // 126  // 2914
pathsToTree = function (paths, newLeafFn, conflictFn, tree) {                                                 // 127  // 2915
  tree = tree || {};                                                                                          // 128  // 2916
  _.each(paths, function (keyPath) {                                                                          // 129  // 2917
    var treePos = tree;                                                                                       // 130  // 2918
    var pathArr = keyPath.split('.');                                                                         // 131  // 2919
                                                                                                              // 132  // 2920
    // use _.all just for iteration with break                                                                // 133  // 2921
    var success = _.all(pathArr.slice(0, -1), function (key, idx) {                                           // 134  // 2922
      if (!_.has(treePos, key))                                                                               // 135  // 2923
        treePos[key] = {};                                                                                    // 136  // 2924
      else if (!_.isObject(treePos[key])) {                                                                   // 137  // 2925
        treePos[key] = conflictFn(treePos[key],                                                               // 138  // 2926
                                  pathArr.slice(0, idx + 1).join('.'),                                        // 139  // 2927
                                  keyPath);                                                                   // 140  // 2928
        // break out of loop if we are failing for this path                                                  // 141  // 2929
        if (!_.isObject(treePos[key]))                                                                        // 142  // 2930
          return false;                                                                                       // 143  // 2931
      }                                                                                                       // 144  // 2932
                                                                                                              // 145  // 2933
      treePos = treePos[key];                                                                                 // 146  // 2934
      return true;                                                                                            // 147  // 2935
    });                                                                                                       // 148  // 2936
                                                                                                              // 149  // 2937
    if (success) {                                                                                            // 150  // 2938
      var lastKey = _.last(pathArr);                                                                          // 151  // 2939
      if (!_.has(treePos, lastKey))                                                                           // 152  // 2940
        treePos[lastKey] = newLeafFn(keyPath);                                                                // 153  // 2941
      else                                                                                                    // 154  // 2942
        treePos[lastKey] = conflictFn(treePos[lastKey], keyPath, keyPath);                                    // 155  // 2943
    }                                                                                                         // 156  // 2944
  });                                                                                                         // 157  // 2945
                                                                                                              // 158  // 2946
  return tree;                                                                                                // 159  // 2947
};                                                                                                            // 160  // 2948
                                                                                                              // 161  // 2949
LocalCollection._checkSupportedProjection = function (fields) {                                               // 162  // 2950
  if (!_.isObject(fields) || _.isArray(fields))                                                               // 163  // 2951
    throw MinimongoError("fields option must be an object");                                                  // 164  // 2952
                                                                                                              // 165  // 2953
  _.each(fields, function (val, keyPath) {                                                                    // 166  // 2954
    if (_.contains(keyPath.split('.'), '$'))                                                                  // 167  // 2955
      throw MinimongoError("Minimongo doesn't support $ operator in projections yet.");                       // 168  // 2956
    if (typeof val === 'object' && _.intersection(['$elemMatch', '$meta', '$slice'], _.keys(val)).length > 0)         // 2957
      throw MinimongoError("Minimongo doesn't support operators in projections yet.");                        // 170  // 2958
    if (_.indexOf([1, 0, true, false], val) === -1)                                                           // 171  // 2959
      throw MinimongoError("Projection values should be one of 1, 0, true, or false");                        // 172  // 2960
  });                                                                                                         // 173  // 2961
};                                                                                                            // 174  // 2962
                                                                                                              // 175  // 2963
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2964
                                                                                                                      // 2965
}).call(this);                                                                                                        // 2966
                                                                                                                      // 2967
                                                                                                                      // 2968
                                                                                                                      // 2969
                                                                                                                      // 2970
                                                                                                                      // 2971
                                                                                                                      // 2972
(function(){                                                                                                          // 2973
                                                                                                                      // 2974
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2975
//                                                                                                            //      // 2976
// packages/minimongo/modify.js                                                                               //      // 2977
//                                                                                                            //      // 2978
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 2979
                                                                                                              //      // 2980
// XXX need a strategy for passing the binding of $ into this                                                 // 1    // 2981
// function, from the compiled selector                                                                       // 2    // 2982
//                                                                                                            // 3    // 2983
// maybe just {key.up.to.just.before.dollarsign: array_index}                                                 // 4    // 2984
//                                                                                                            // 5    // 2985
// XXX atomicity: if one modification fails, do we roll back the whole                                        // 6    // 2986
// change?                                                                                                    // 7    // 2987
//                                                                                                            // 8    // 2988
// options:                                                                                                   // 9    // 2989
//   - isInsert is set when _modify is being called to compute the document to                                // 10   // 2990
//     insert as part of an upsert operation. We use this primarily to figure                                 // 11   // 2991
//     out when to set the fields in $setOnInsert, if present.                                                // 12   // 2992
LocalCollection._modify = function (doc, mod, options) {                                                      // 13   // 2993
  options = options || {};                                                                                    // 14   // 2994
  if (!isPlainObject(mod))                                                                                    // 15   // 2995
    throw MinimongoError("Modifier must be an object");                                                       // 16   // 2996
                                                                                                              // 17   // 2997
  // Make sure the caller can't mutate our data structures.                                                   // 18   // 2998
  mod = EJSON.clone(mod);                                                                                     // 19   // 2999
                                                                                                              // 20   // 3000
  var isModifier = isOperatorObject(mod);                                                                     // 21   // 3001
                                                                                                              // 22   // 3002
  var newDoc;                                                                                                 // 23   // 3003
                                                                                                              // 24   // 3004
  if (!isModifier) {                                                                                          // 25   // 3005
    if (mod._id && !EJSON.equals(doc._id, mod._id))                                                           // 26   // 3006
      throw MinimongoError("Cannot change the _id of a document");                                            // 27   // 3007
                                                                                                              // 28   // 3008
    // replace the whole document                                                                             // 29   // 3009
    for (var k in mod) {                                                                                      // 30   // 3010
      if (/\./.test(k))                                                                                       // 31   // 3011
        throw MinimongoError(                                                                                 // 32   // 3012
          "When replacing document, field name may not contain '.'");                                         // 33   // 3013
    }                                                                                                         // 34   // 3014
    newDoc = mod;                                                                                             // 35   // 3015
  } else {                                                                                                    // 36   // 3016
    // apply modifiers to the doc.                                                                            // 37   // 3017
    newDoc = EJSON.clone(doc);                                                                                // 38   // 3018
                                                                                                              // 39   // 3019
    _.each(mod, function (operand, op) {                                                                      // 40   // 3020
      var modFunc = MODIFIERS[op];                                                                            // 41   // 3021
      // Treat $setOnInsert as $set if this is an insert.                                                     // 42   // 3022
      if (options.isInsert && op === '$setOnInsert')                                                          // 43   // 3023
        modFunc = MODIFIERS['$set'];                                                                          // 44   // 3024
      if (!modFunc)                                                                                           // 45   // 3025
        throw MinimongoError("Invalid modifier specified " + op);                                             // 46   // 3026
      _.each(operand, function (arg, keypath) {                                                               // 47   // 3027
        if (keypath === '') {                                                                                 // 48   // 3028
          throw MinimongoError("An empty update path is not valid.");                                         // 49   // 3029
        }                                                                                                     // 50   // 3030
                                                                                                              // 51   // 3031
        if (keypath === '_id') {                                                                              // 52   // 3032
          throw MinimongoError("Mod on _id not allowed");                                                     // 53   // 3033
        }                                                                                                     // 54   // 3034
                                                                                                              // 55   // 3035
        var keyparts = keypath.split('.');                                                                    // 56   // 3036
                                                                                                              // 57   // 3037
        if (! _.all(keyparts, _.identity)) {                                                                  // 58   // 3038
          throw MinimongoError(                                                                               // 59   // 3039
            "The update path '" + keypath +                                                                   // 60   // 3040
              "' contains an empty field name, which is not allowed.");                                       // 61   // 3041
        }                                                                                                     // 62   // 3042
                                                                                                              // 63   // 3043
        var noCreate = _.has(NO_CREATE_MODIFIERS, op);                                                        // 64   // 3044
        var forbidArray = (op === "$rename");                                                                 // 65   // 3045
        var target = findModTarget(newDoc, keyparts, {                                                        // 66   // 3046
          noCreate: NO_CREATE_MODIFIERS[op],                                                                  // 67   // 3047
          forbidArray: (op === "$rename"),                                                                    // 68   // 3048
          arrayIndices: options.arrayIndices                                                                  // 69   // 3049
        });                                                                                                   // 70   // 3050
        var field = keyparts.pop();                                                                           // 71   // 3051
        modFunc(target, field, arg, keypath, newDoc);                                                         // 72   // 3052
      });                                                                                                     // 73   // 3053
    });                                                                                                       // 74   // 3054
  }                                                                                                           // 75   // 3055
                                                                                                              // 76   // 3056
  // move new document into place.                                                                            // 77   // 3057
  _.each(_.keys(doc), function (k) {                                                                          // 78   // 3058
    // Note: this used to be for (var k in doc) however, this does not                                        // 79   // 3059
    // work right in Opera. Deleting from a doc while iterating over it                                       // 80   // 3060
    // would sometimes cause opera to skip some keys.                                                         // 81   // 3061
    if (k !== '_id')                                                                                          // 82   // 3062
      delete doc[k];                                                                                          // 83   // 3063
  });                                                                                                         // 84   // 3064
  _.each(newDoc, function (v, k) {                                                                            // 85   // 3065
    doc[k] = v;                                                                                               // 86   // 3066
  });                                                                                                         // 87   // 3067
};                                                                                                            // 88   // 3068
                                                                                                              // 89   // 3069
// for a.b.c.2.d.e, keyparts should be ['a', 'b', 'c', '2', 'd', 'e'],                                        // 90   // 3070
// and then you would operate on the 'e' property of the returned                                             // 91   // 3071
// object.                                                                                                    // 92   // 3072
//                                                                                                            // 93   // 3073
// if options.noCreate is falsey, creates intermediate levels of                                              // 94   // 3074
// structure as necessary, like mkdir -p (and raises an exception if                                          // 95   // 3075
// that would mean giving a non-numeric property to an array.) if                                             // 96   // 3076
// options.noCreate is true, return undefined instead.                                                        // 97   // 3077
//                                                                                                            // 98   // 3078
// may modify the last element of keyparts to signal to the caller that it needs                              // 99   // 3079
// to use a different value to index into the returned object (for example,                                   // 100  // 3080
// ['a', '01'] -> ['a', 1]).                                                                                  // 101  // 3081
//                                                                                                            // 102  // 3082
// if forbidArray is true, return null if the keypath goes through an array.                                  // 103  // 3083
//                                                                                                            // 104  // 3084
// if options.arrayIndices is set, use its first element for the (first) '$' in                               // 105  // 3085
// the path.                                                                                                  // 106  // 3086
var findModTarget = function (doc, keyparts, options) {                                                       // 107  // 3087
  options = options || {};                                                                                    // 108  // 3088
  var usedArrayIndex = false;                                                                                 // 109  // 3089
  for (var i = 0; i < keyparts.length; i++) {                                                                 // 110  // 3090
    var last = (i === keyparts.length - 1);                                                                   // 111  // 3091
    var keypart = keyparts[i];                                                                                // 112  // 3092
    var indexable = isIndexable(doc);                                                                         // 113  // 3093
    if (!indexable) {                                                                                         // 114  // 3094
      if (options.noCreate)                                                                                   // 115  // 3095
        return undefined;                                                                                     // 116  // 3096
      var e = MinimongoError(                                                                                 // 117  // 3097
        "cannot use the part '" + keypart + "' to traverse " + doc);                                          // 118  // 3098
      e.setPropertyError = true;                                                                              // 119  // 3099
      throw e;                                                                                                // 120  // 3100
    }                                                                                                         // 121  // 3101
    if (doc instanceof Array) {                                                                               // 122  // 3102
      if (options.forbidArray)                                                                                // 123  // 3103
        return null;                                                                                          // 124  // 3104
      if (keypart === '$') {                                                                                  // 125  // 3105
        if (usedArrayIndex)                                                                                   // 126  // 3106
          throw MinimongoError("Too many positional (i.e. '$') elements");                                    // 127  // 3107
        if (!options.arrayIndices || !options.arrayIndices.length) {                                          // 128  // 3108
          throw MinimongoError("The positional operator did not find the " +                                  // 129  // 3109
                               "match needed from the query");                                                // 130  // 3110
        }                                                                                                     // 131  // 3111
        keypart = options.arrayIndices[0];                                                                    // 132  // 3112
        usedArrayIndex = true;                                                                                // 133  // 3113
      } else if (isNumericKey(keypart)) {                                                                     // 134  // 3114
        keypart = parseInt(keypart);                                                                          // 135  // 3115
      } else {                                                                                                // 136  // 3116
        if (options.noCreate)                                                                                 // 137  // 3117
          return undefined;                                                                                   // 138  // 3118
        throw MinimongoError(                                                                                 // 139  // 3119
          "can't append to array using string field name ["                                                   // 140  // 3120
                    + keypart + "]");                                                                         // 141  // 3121
      }                                                                                                       // 142  // 3122
      if (last)                                                                                               // 143  // 3123
        // handle 'a.01'                                                                                      // 144  // 3124
        keyparts[i] = keypart;                                                                                // 145  // 3125
      if (options.noCreate && keypart >= doc.length)                                                          // 146  // 3126
        return undefined;                                                                                     // 147  // 3127
      while (doc.length < keypart)                                                                            // 148  // 3128
        doc.push(null);                                                                                       // 149  // 3129
      if (!last) {                                                                                            // 150  // 3130
        if (doc.length === keypart)                                                                           // 151  // 3131
          doc.push({});                                                                                       // 152  // 3132
        else if (typeof doc[keypart] !== "object")                                                            // 153  // 3133
          throw MinimongoError("can't modify field '" + keyparts[i + 1] +                                     // 154  // 3134
                      "' of list value " + JSON.stringify(doc[keypart]));                                     // 155  // 3135
      }                                                                                                       // 156  // 3136
    } else {                                                                                                  // 157  // 3137
      if (keypart.length && keypart.substr(0, 1) === '$')                                                     // 158  // 3138
        throw MinimongoError("can't set field named " + keypart);                                             // 159  // 3139
      if (!(keypart in doc)) {                                                                                // 160  // 3140
        if (options.noCreate)                                                                                 // 161  // 3141
          return undefined;                                                                                   // 162  // 3142
        if (!last)                                                                                            // 163  // 3143
          doc[keypart] = {};                                                                                  // 164  // 3144
      }                                                                                                       // 165  // 3145
    }                                                                                                         // 166  // 3146
                                                                                                              // 167  // 3147
    if (last)                                                                                                 // 168  // 3148
      return doc;                                                                                             // 169  // 3149
    doc = doc[keypart];                                                                                       // 170  // 3150
  }                                                                                                           // 171  // 3151
                                                                                                              // 172  // 3152
  // notreached                                                                                               // 173  // 3153
};                                                                                                            // 174  // 3154
                                                                                                              // 175  // 3155
var NO_CREATE_MODIFIERS = {                                                                                   // 176  // 3156
  $unset: true,                                                                                               // 177  // 3157
  $pop: true,                                                                                                 // 178  // 3158
  $rename: true,                                                                                              // 179  // 3159
  $pull: true,                                                                                                // 180  // 3160
  $pullAll: true                                                                                              // 181  // 3161
};                                                                                                            // 182  // 3162
                                                                                                              // 183  // 3163
var MODIFIERS = {                                                                                             // 184  // 3164
  $inc: function (target, field, arg) {                                                                       // 185  // 3165
    if (typeof arg !== "number")                                                                              // 186  // 3166
      throw MinimongoError("Modifier $inc allowed for numbers only");                                         // 187  // 3167
    if (field in target) {                                                                                    // 188  // 3168
      if (typeof target[field] !== "number")                                                                  // 189  // 3169
        throw MinimongoError("Cannot apply $inc modifier to non-number");                                     // 190  // 3170
      target[field] += arg;                                                                                   // 191  // 3171
    } else {                                                                                                  // 192  // 3172
      target[field] = arg;                                                                                    // 193  // 3173
    }                                                                                                         // 194  // 3174
  },                                                                                                          // 195  // 3175
  $set: function (target, field, arg) {                                                                       // 196  // 3176
    if (!_.isObject(target)) { // not an array or an object                                                   // 197  // 3177
      var e = MinimongoError("Cannot set property on non-object field");                                      // 198  // 3178
      e.setPropertyError = true;                                                                              // 199  // 3179
      throw e;                                                                                                // 200  // 3180
    }                                                                                                         // 201  // 3181
    if (target === null) {                                                                                    // 202  // 3182
      var e = MinimongoError("Cannot set property on null");                                                  // 203  // 3183
      e.setPropertyError = true;                                                                              // 204  // 3184
      throw e;                                                                                                // 205  // 3185
    }                                                                                                         // 206  // 3186
    target[field] = arg;                                                                                      // 207  // 3187
  },                                                                                                          // 208  // 3188
  $setOnInsert: function (target, field, arg) {                                                               // 209  // 3189
    // converted to `$set` in `_modify`                                                                       // 210  // 3190
  },                                                                                                          // 211  // 3191
  $unset: function (target, field, arg) {                                                                     // 212  // 3192
    if (target !== undefined) {                                                                               // 213  // 3193
      if (target instanceof Array) {                                                                          // 214  // 3194
        if (field in target)                                                                                  // 215  // 3195
          target[field] = null;                                                                               // 216  // 3196
      } else                                                                                                  // 217  // 3197
        delete target[field];                                                                                 // 218  // 3198
    }                                                                                                         // 219  // 3199
  },                                                                                                          // 220  // 3200
  $push: function (target, field, arg) {                                                                      // 221  // 3201
    if (target[field] === undefined)                                                                          // 222  // 3202
      target[field] = [];                                                                                     // 223  // 3203
    if (!(target[field] instanceof Array))                                                                    // 224  // 3204
      throw MinimongoError("Cannot apply $push modifier to non-array");                                       // 225  // 3205
                                                                                                              // 226  // 3206
    if (!(arg && arg.$each)) {                                                                                // 227  // 3207
      // Simple mode: not $each                                                                               // 228  // 3208
      target[field].push(arg);                                                                                // 229  // 3209
      return;                                                                                                 // 230  // 3210
    }                                                                                                         // 231  // 3211
                                                                                                              // 232  // 3212
    // Fancy mode: $each (and maybe $slice and $sort and $position)                                           // 233  // 3213
    var toPush = arg.$each;                                                                                   // 234  // 3214
    if (!(toPush instanceof Array))                                                                           // 235  // 3215
      throw MinimongoError("$each must be an array");                                                         // 236  // 3216
                                                                                                              // 237  // 3217
    // Parse $position                                                                                        // 238  // 3218
    var position = undefined;                                                                                 // 239  // 3219
    if ('$position' in arg) {                                                                                 // 240  // 3220
      if (typeof arg.$position !== "number")                                                                  // 241  // 3221
        throw MinimongoError("$position must be a numeric value");                                            // 242  // 3222
      // XXX should check to make sure integer                                                                // 243  // 3223
      if (arg.$position < 0)                                                                                  // 244  // 3224
        throw MinimongoError("$position in $push must be zero or positive");                                  // 245  // 3225
      position = arg.$position;                                                                               // 246  // 3226
    }                                                                                                         // 247  // 3227
                                                                                                              // 248  // 3228
    // Parse $slice.                                                                                          // 249  // 3229
    var slice = undefined;                                                                                    // 250  // 3230
    if ('$slice' in arg) {                                                                                    // 251  // 3231
      if (typeof arg.$slice !== "number")                                                                     // 252  // 3232
        throw MinimongoError("$slice must be a numeric value");                                               // 253  // 3233
      // XXX should check to make sure integer                                                                // 254  // 3234
      if (arg.$slice > 0)                                                                                     // 255  // 3235
        throw MinimongoError("$slice in $push must be zero or negative");                                     // 256  // 3236
      slice = arg.$slice;                                                                                     // 257  // 3237
    }                                                                                                         // 258  // 3238
                                                                                                              // 259  // 3239
    // Parse $sort.                                                                                           // 260  // 3240
    var sortFunction = undefined;                                                                             // 261  // 3241
    if (arg.$sort) {                                                                                          // 262  // 3242
      if (slice === undefined)                                                                                // 263  // 3243
        throw MinimongoError("$sort requires $slice to be present");                                          // 264  // 3244
      // XXX this allows us to use a $sort whose value is an array, but that's                                // 265  // 3245
      // actually an extension of the Node driver, so it won't work                                           // 266  // 3246
      // server-side. Could be confusing!                                                                     // 267  // 3247
      // XXX is it correct that we don't do geo-stuff here?                                                   // 268  // 3248
      sortFunction = new Minimongo.Sorter(arg.$sort).getComparator();                                         // 269  // 3249
      for (var i = 0; i < toPush.length; i++) {                                                               // 270  // 3250
        if (LocalCollection._f._type(toPush[i]) !== 3) {                                                      // 271  // 3251
          throw MinimongoError("$push like modifiers using $sort " +                                          // 272  // 3252
                      "require all elements to be objects");                                                  // 273  // 3253
        }                                                                                                     // 274  // 3254
      }                                                                                                       // 275  // 3255
    }                                                                                                         // 276  // 3256
                                                                                                              // 277  // 3257
    // Actually push.                                                                                         // 278  // 3258
    if (position === undefined) {                                                                             // 279  // 3259
      for (var j = 0; j < toPush.length; j++)                                                                 // 280  // 3260
        target[field].push(toPush[j]);                                                                        // 281  // 3261
    } else {                                                                                                  // 282  // 3262
      var spliceArguments = [position, 0];                                                                    // 283  // 3263
      for (var j = 0; j < toPush.length; j++)                                                                 // 284  // 3264
        spliceArguments.push(toPush[j]);                                                                      // 285  // 3265
      Array.prototype.splice.apply(target[field], spliceArguments);                                           // 286  // 3266
    }                                                                                                         // 287  // 3267
                                                                                                              // 288  // 3268
    // Actually sort.                                                                                         // 289  // 3269
    if (sortFunction)                                                                                         // 290  // 3270
      target[field].sort(sortFunction);                                                                       // 291  // 3271
                                                                                                              // 292  // 3272
    // Actually slice.                                                                                        // 293  // 3273
    if (slice !== undefined) {                                                                                // 294  // 3274
      if (slice === 0)                                                                                        // 295  // 3275
        target[field] = [];  // differs from Array.slice!                                                     // 296  // 3276
      else                                                                                                    // 297  // 3277
        target[field] = target[field].slice(slice);                                                           // 298  // 3278
    }                                                                                                         // 299  // 3279
  },                                                                                                          // 300  // 3280
  $pushAll: function (target, field, arg) {                                                                   // 301  // 3281
    if (!(typeof arg === "object" && arg instanceof Array))                                                   // 302  // 3282
      throw MinimongoError("Modifier $pushAll/pullAll allowed for arrays only");                              // 303  // 3283
    var x = target[field];                                                                                    // 304  // 3284
    if (x === undefined)                                                                                      // 305  // 3285
      target[field] = arg;                                                                                    // 306  // 3286
    else if (!(x instanceof Array))                                                                           // 307  // 3287
      throw MinimongoError("Cannot apply $pushAll modifier to non-array");                                    // 308  // 3288
    else {                                                                                                    // 309  // 3289
      for (var i = 0; i < arg.length; i++)                                                                    // 310  // 3290
        x.push(arg[i]);                                                                                       // 311  // 3291
    }                                                                                                         // 312  // 3292
  },                                                                                                          // 313  // 3293
  $addToSet: function (target, field, arg) {                                                                  // 314  // 3294
    var isEach = false;                                                                                       // 315  // 3295
    if (typeof arg === "object") {                                                                            // 316  // 3296
      //check if first key is '$each'                                                                         // 317  // 3297
      for (var k in arg) {                                                                                    // 318  // 3298
        if (k === "$each")                                                                                    // 319  // 3299
          isEach = true;                                                                                      // 320  // 3300
        break;                                                                                                // 321  // 3301
      }                                                                                                       // 322  // 3302
    }                                                                                                         // 323  // 3303
    var values = isEach ? arg["$each"] : [arg];                                                               // 324  // 3304
    var x = target[field];                                                                                    // 325  // 3305
    if (x === undefined)                                                                                      // 326  // 3306
      target[field] = values;                                                                                 // 327  // 3307
    else if (!(x instanceof Array))                                                                           // 328  // 3308
      throw MinimongoError("Cannot apply $addToSet modifier to non-array");                                   // 329  // 3309
    else {                                                                                                    // 330  // 3310
      _.each(values, function (value) {                                                                       // 331  // 3311
        for (var i = 0; i < x.length; i++)                                                                    // 332  // 3312
          if (LocalCollection._f._equal(value, x[i]))                                                         // 333  // 3313
            return;                                                                                           // 334  // 3314
        x.push(value);                                                                                        // 335  // 3315
      });                                                                                                     // 336  // 3316
    }                                                                                                         // 337  // 3317
  },                                                                                                          // 338  // 3318
  $pop: function (target, field, arg) {                                                                       // 339  // 3319
    if (target === undefined)                                                                                 // 340  // 3320
      return;                                                                                                 // 341  // 3321
    var x = target[field];                                                                                    // 342  // 3322
    if (x === undefined)                                                                                      // 343  // 3323
      return;                                                                                                 // 344  // 3324
    else if (!(x instanceof Array))                                                                           // 345  // 3325
      throw MinimongoError("Cannot apply $pop modifier to non-array");                                        // 346  // 3326
    else {                                                                                                    // 347  // 3327
      if (typeof arg === 'number' && arg < 0)                                                                 // 348  // 3328
        x.splice(0, 1);                                                                                       // 349  // 3329
      else                                                                                                    // 350  // 3330
        x.pop();                                                                                              // 351  // 3331
    }                                                                                                         // 352  // 3332
  },                                                                                                          // 353  // 3333
  $pull: function (target, field, arg) {                                                                      // 354  // 3334
    if (target === undefined)                                                                                 // 355  // 3335
      return;                                                                                                 // 356  // 3336
    var x = target[field];                                                                                    // 357  // 3337
    if (x === undefined)                                                                                      // 358  // 3338
      return;                                                                                                 // 359  // 3339
    else if (!(x instanceof Array))                                                                           // 360  // 3340
      throw MinimongoError("Cannot apply $pull/pullAll modifier to non-array");                               // 361  // 3341
    else {                                                                                                    // 362  // 3342
      var out = [];                                                                                           // 363  // 3343
      if (arg != null && typeof arg === "object" && !(arg instanceof Array)) {                                // 364  // 3344
        // XXX would be much nicer to compile this once, rather than                                          // 365  // 3345
        // for each document we modify.. but usually we're not                                                // 366  // 3346
        // modifying that many documents, so we'll let it slide for                                           // 367  // 3347
        // now                                                                                                // 368  // 3348
                                                                                                              // 369  // 3349
        // XXX Minimongo.Matcher isn't up for the job, because we need                                        // 370  // 3350
        // to permit stuff like {$pull: {a: {$gt: 4}}}.. something                                            // 371  // 3351
        // like {$gt: 4} is not normally a complete selector.                                                 // 372  // 3352
        // same issue as $elemMatch possibly?                                                                 // 373  // 3353
        var matcher = new Minimongo.Matcher(arg);                                                             // 374  // 3354
        for (var i = 0; i < x.length; i++)                                                                    // 375  // 3355
          if (!matcher.documentMatches(x[i]).result)                                                          // 376  // 3356
            out.push(x[i]);                                                                                   // 377  // 3357
      } else {                                                                                                // 378  // 3358
        for (var i = 0; i < x.length; i++)                                                                    // 379  // 3359
          if (!LocalCollection._f._equal(x[i], arg))                                                          // 380  // 3360
            out.push(x[i]);                                                                                   // 381  // 3361
      }                                                                                                       // 382  // 3362
      target[field] = out;                                                                                    // 383  // 3363
    }                                                                                                         // 384  // 3364
  },                                                                                                          // 385  // 3365
  $pullAll: function (target, field, arg) {                                                                   // 386  // 3366
    if (!(typeof arg === "object" && arg instanceof Array))                                                   // 387  // 3367
      throw MinimongoError("Modifier $pushAll/pullAll allowed for arrays only");                              // 388  // 3368
    if (target === undefined)                                                                                 // 389  // 3369
      return;                                                                                                 // 390  // 3370
    var x = target[field];                                                                                    // 391  // 3371
    if (x === undefined)                                                                                      // 392  // 3372
      return;                                                                                                 // 393  // 3373
    else if (!(x instanceof Array))                                                                           // 394  // 3374
      throw MinimongoError("Cannot apply $pull/pullAll modifier to non-array");                               // 395  // 3375
    else {                                                                                                    // 396  // 3376
      var out = [];                                                                                           // 397  // 3377
      for (var i = 0; i < x.length; i++) {                                                                    // 398  // 3378
        var exclude = false;                                                                                  // 399  // 3379
        for (var j = 0; j < arg.length; j++) {                                                                // 400  // 3380
          if (LocalCollection._f._equal(x[i], arg[j])) {                                                      // 401  // 3381
            exclude = true;                                                                                   // 402  // 3382
            break;                                                                                            // 403  // 3383
          }                                                                                                   // 404  // 3384
        }                                                                                                     // 405  // 3385
        if (!exclude)                                                                                         // 406  // 3386
          out.push(x[i]);                                                                                     // 407  // 3387
      }                                                                                                       // 408  // 3388
      target[field] = out;                                                                                    // 409  // 3389
    }                                                                                                         // 410  // 3390
  },                                                                                                          // 411  // 3391
  $rename: function (target, field, arg, keypath, doc) {                                                      // 412  // 3392
    if (keypath === arg)                                                                                      // 413  // 3393
      // no idea why mongo has this restriction..                                                             // 414  // 3394
      throw MinimongoError("$rename source must differ from target");                                         // 415  // 3395
    if (target === null)                                                                                      // 416  // 3396
      throw MinimongoError("$rename source field invalid");                                                   // 417  // 3397
    if (typeof arg !== "string")                                                                              // 418  // 3398
      throw MinimongoError("$rename target must be a string");                                                // 419  // 3399
    if (target === undefined)                                                                                 // 420  // 3400
      return;                                                                                                 // 421  // 3401
    var v = target[field];                                                                                    // 422  // 3402
    delete target[field];                                                                                     // 423  // 3403
                                                                                                              // 424  // 3404
    var keyparts = arg.split('.');                                                                            // 425  // 3405
    var target2 = findModTarget(doc, keyparts, {forbidArray: true});                                          // 426  // 3406
    if (target2 === null)                                                                                     // 427  // 3407
      throw MinimongoError("$rename target field invalid");                                                   // 428  // 3408
    var field2 = keyparts.pop();                                                                              // 429  // 3409
    target2[field2] = v;                                                                                      // 430  // 3410
  },                                                                                                          // 431  // 3411
  $bit: function (target, field, arg) {                                                                       // 432  // 3412
    // XXX mongo only supports $bit on integers, and we only support                                          // 433  // 3413
    // native javascript numbers (doubles) so far, so we can't support $bit                                   // 434  // 3414
    throw MinimongoError("$bit is not supported");                                                            // 435  // 3415
  }                                                                                                           // 436  // 3416
};                                                                                                            // 437  // 3417
                                                                                                              // 438  // 3418
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3419
                                                                                                                      // 3420
}).call(this);                                                                                                        // 3421
                                                                                                                      // 3422
                                                                                                                      // 3423
                                                                                                                      // 3424
                                                                                                                      // 3425
                                                                                                                      // 3426
                                                                                                                      // 3427
(function(){                                                                                                          // 3428
                                                                                                                      // 3429
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3430
//                                                                                                            //      // 3431
// packages/minimongo/diff.js                                                                                 //      // 3432
//                                                                                                            //      // 3433
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3434
                                                                                                              //      // 3435
// ordered: bool.                                                                                             // 1    // 3436
// old_results and new_results: collections of documents.                                                     // 2    // 3437
//    if ordered, they are arrays.                                                                            // 3    // 3438
//    if unordered, they are IdMaps                                                                           // 4    // 3439
LocalCollection._diffQueryChanges = function (ordered, oldResults, newResults, observer, options) {           // 5    // 3440
  return DiffSequence.diffQueryChanges(ordered, oldResults, newResults, observer, options);                   // 6    // 3441
};                                                                                                            // 7    // 3442
                                                                                                              // 8    // 3443
LocalCollection._diffQueryUnorderedChanges = function (oldResults, newResults, observer, options) {           // 9    // 3444
  return DiffSequence.diffQueryUnorderedChanges(oldResults, newResults, observer, options);                   // 10   // 3445
};                                                                                                            // 11   // 3446
                                                                                                              // 12   // 3447
                                                                                                              // 13   // 3448
LocalCollection._diffQueryOrderedChanges =                                                                    // 14   // 3449
  function (oldResults, newResults, observer, options) {                                                      // 15   // 3450
  return DiffSequence.diffQueryOrderedChanges(oldResults, newResults, observer, options);                     // 16   // 3451
};                                                                                                            // 17   // 3452
                                                                                                              // 18   // 3453
LocalCollection._diffObjects = function (left, right, callbacks) {                                            // 19   // 3454
  return DiffSequence.diffObjects(left, right, callbacks);                                                    // 20   // 3455
};                                                                                                            // 21   // 3456
                                                                                                              // 22   // 3457
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3458
                                                                                                                      // 3459
}).call(this);                                                                                                        // 3460
                                                                                                                      // 3461
                                                                                                                      // 3462
                                                                                                                      // 3463
                                                                                                                      // 3464
                                                                                                                      // 3465
                                                                                                                      // 3466
(function(){                                                                                                          // 3467
                                                                                                                      // 3468
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3469
//                                                                                                            //      // 3470
// packages/minimongo/id_map.js                                                                               //      // 3471
//                                                                                                            //      // 3472
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3473
                                                                                                              //      // 3474
LocalCollection._IdMap = function () {                                                                        // 1    // 3475
  var self = this;                                                                                            // 2    // 3476
  IdMap.call(self, MongoID.idStringify, MongoID.idParse);                                                     // 3    // 3477
};                                                                                                            // 4    // 3478
                                                                                                              // 5    // 3479
Meteor._inherits(LocalCollection._IdMap, IdMap);                                                              // 6    // 3480
                                                                                                              // 7    // 3481
                                                                                                              // 8    // 3482
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3483
                                                                                                                      // 3484
}).call(this);                                                                                                        // 3485
                                                                                                                      // 3486
                                                                                                                      // 3487
                                                                                                                      // 3488
                                                                                                                      // 3489
                                                                                                                      // 3490
                                                                                                                      // 3491
(function(){                                                                                                          // 3492
                                                                                                                      // 3493
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3494
//                                                                                                            //      // 3495
// packages/minimongo/observe.js                                                                              //      // 3496
//                                                                                                            //      // 3497
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3498
                                                                                                              //      // 3499
// XXX maybe move these into another ObserveHelpers package or something                                      // 1    // 3500
                                                                                                              // 2    // 3501
// _CachingChangeObserver is an object which receives observeChanges callbacks                                // 3    // 3502
// and keeps a cache of the current cursor state up to date in self.docs. Users                               // 4    // 3503
// of this class should read the docs field but not modify it. You should pass                                // 5    // 3504
// the "applyChange" field as the callbacks to the underlying observeChanges                                  // 6    // 3505
// call. Optionally, you can specify your own observeChanges callbacks which are                              // 7    // 3506
// invoked immediately before the docs field is updated; this object is made                                  // 8    // 3507
// available as `this` to those callbacks.                                                                    // 9    // 3508
LocalCollection._CachingChangeObserver = function (options) {                                                 // 10   // 3509
  var self = this;                                                                                            // 11   // 3510
  options = options || {};                                                                                    // 12   // 3511
                                                                                                              // 13   // 3512
  var orderedFromCallbacks = options.callbacks &&                                                             // 14   // 3513
        LocalCollection._observeChangesCallbacksAreOrdered(options.callbacks);                                // 15   // 3514
  if (_.has(options, 'ordered')) {                                                                            // 16   // 3515
    self.ordered = options.ordered;                                                                           // 17   // 3516
    if (options.callbacks && options.ordered !== orderedFromCallbacks)                                        // 18   // 3517
      throw Error("ordered option doesn't match callbacks");                                                  // 19   // 3518
  } else if (options.callbacks) {                                                                             // 20   // 3519
    self.ordered = orderedFromCallbacks;                                                                      // 21   // 3520
  } else {                                                                                                    // 22   // 3521
    throw Error("must provide ordered or callbacks");                                                         // 23   // 3522
  }                                                                                                           // 24   // 3523
  var callbacks = options.callbacks || {};                                                                    // 25   // 3524
                                                                                                              // 26   // 3525
  if (self.ordered) {                                                                                         // 27   // 3526
    self.docs = new OrderedDict(MongoID.idStringify);                                                         // 28   // 3527
    self.applyChange = {                                                                                      // 29   // 3528
      addedBefore: function (id, fields, before) {                                                            // 30   // 3529
        var doc = EJSON.clone(fields);                                                                        // 31   // 3530
        doc._id = id;                                                                                         // 32   // 3531
        callbacks.addedBefore && callbacks.addedBefore.call(                                                  // 33   // 3532
          self, id, fields, before);                                                                          // 34   // 3533
        // This line triggers if we provide added with movedBefore.                                           // 35   // 3534
        callbacks.added && callbacks.added.call(self, id, fields);                                            // 36   // 3535
        // XXX could `before` be a falsy ID?  Technically                                                     // 37   // 3536
        // idStringify seems to allow for them -- though                                                      // 38   // 3537
        // OrderedDict won't call stringify on a falsy arg.                                                   // 39   // 3538
        self.docs.putBefore(id, doc, before || null);                                                         // 40   // 3539
      },                                                                                                      // 41   // 3540
      movedBefore: function (id, before) {                                                                    // 42   // 3541
        var doc = self.docs.get(id);                                                                          // 43   // 3542
        callbacks.movedBefore && callbacks.movedBefore.call(self, id, before);                                // 44   // 3543
        self.docs.moveBefore(id, before || null);                                                             // 45   // 3544
      }                                                                                                       // 46   // 3545
    };                                                                                                        // 47   // 3546
  } else {                                                                                                    // 48   // 3547
    self.docs = new LocalCollection._IdMap;                                                                   // 49   // 3548
    self.applyChange = {                                                                                      // 50   // 3549
      added: function (id, fields) {                                                                          // 51   // 3550
        var doc = EJSON.clone(fields);                                                                        // 52   // 3551
        callbacks.added && callbacks.added.call(self, id, fields);                                            // 53   // 3552
        doc._id = id;                                                                                         // 54   // 3553
        self.docs.set(id,  doc);                                                                              // 55   // 3554
      }                                                                                                       // 56   // 3555
    };                                                                                                        // 57   // 3556
  }                                                                                                           // 58   // 3557
                                                                                                              // 59   // 3558
  // The methods in _IdMap and OrderedDict used by these callbacks are                                        // 60   // 3559
  // identical.                                                                                               // 61   // 3560
  self.applyChange.changed = function (id, fields) {                                                          // 62   // 3561
    var doc = self.docs.get(id);                                                                              // 63   // 3562
    if (!doc)                                                                                                 // 64   // 3563
      throw new Error("Unknown id for changed: " + id);                                                       // 65   // 3564
    callbacks.changed && callbacks.changed.call(                                                              // 66   // 3565
      self, id, EJSON.clone(fields));                                                                         // 67   // 3566
    DiffSequence.applyChanges(doc, fields);                                                                   // 68   // 3567
  };                                                                                                          // 69   // 3568
  self.applyChange.removed = function (id) {                                                                  // 70   // 3569
    callbacks.removed && callbacks.removed.call(self, id);                                                    // 71   // 3570
    self.docs.remove(id);                                                                                     // 72   // 3571
  };                                                                                                          // 73   // 3572
};                                                                                                            // 74   // 3573
                                                                                                              // 75   // 3574
LocalCollection._observeFromObserveChanges = function (cursor, observeCallbacks) {                            // 76   // 3575
  var transform = cursor.getTransform() || function (doc) {return doc;};                                      // 77   // 3576
  var suppressed = !!observeCallbacks._suppress_initial;                                                      // 78   // 3577
                                                                                                              // 79   // 3578
  var observeChangesCallbacks;                                                                                // 80   // 3579
  if (LocalCollection._observeCallbacksAreOrdered(observeCallbacks)) {                                        // 81   // 3580
    // The "_no_indices" option sets all index arguments to -1 and skips the                                  // 82   // 3581
    // linear scans required to generate them.  This lets observers that don't                                // 83   // 3582
    // need absolute indices benefit from the other features of this API --                                   // 84   // 3583
    // relative order, transforms, and applyChanges -- without the speed hit.                                 // 85   // 3584
    var indices = !observeCallbacks._no_indices;                                                              // 86   // 3585
    observeChangesCallbacks = {                                                                               // 87   // 3586
      addedBefore: function (id, fields, before) {                                                            // 88   // 3587
        var self = this;                                                                                      // 89   // 3588
        if (suppressed || !(observeCallbacks.addedAt || observeCallbacks.added))                              // 90   // 3589
          return;                                                                                             // 91   // 3590
        var doc = transform(_.extend(fields, {_id: id}));                                                     // 92   // 3591
        if (observeCallbacks.addedAt) {                                                                       // 93   // 3592
          var index = indices                                                                                 // 94   // 3593
                ? (before ? self.docs.indexOf(before) : self.docs.size()) : -1;                               // 95   // 3594
          observeCallbacks.addedAt(doc, index, before);                                                       // 96   // 3595
        } else {                                                                                              // 97   // 3596
          observeCallbacks.added(doc);                                                                        // 98   // 3597
        }                                                                                                     // 99   // 3598
      },                                                                                                      // 100  // 3599
      changed: function (id, fields) {                                                                        // 101  // 3600
        var self = this;                                                                                      // 102  // 3601
        if (!(observeCallbacks.changedAt || observeCallbacks.changed))                                        // 103  // 3602
          return;                                                                                             // 104  // 3603
        var doc = EJSON.clone(self.docs.get(id));                                                             // 105  // 3604
        if (!doc)                                                                                             // 106  // 3605
          throw new Error("Unknown id for changed: " + id);                                                   // 107  // 3606
        var oldDoc = transform(EJSON.clone(doc));                                                             // 108  // 3607
        DiffSequence.applyChanges(doc, fields);                                                               // 109  // 3608
        doc = transform(doc);                                                                                 // 110  // 3609
        if (observeCallbacks.changedAt) {                                                                     // 111  // 3610
          var index = indices ? self.docs.indexOf(id) : -1;                                                   // 112  // 3611
          observeCallbacks.changedAt(doc, oldDoc, index);                                                     // 113  // 3612
        } else {                                                                                              // 114  // 3613
          observeCallbacks.changed(doc, oldDoc);                                                              // 115  // 3614
        }                                                                                                     // 116  // 3615
      },                                                                                                      // 117  // 3616
      movedBefore: function (id, before) {                                                                    // 118  // 3617
        var self = this;                                                                                      // 119  // 3618
        if (!observeCallbacks.movedTo)                                                                        // 120  // 3619
          return;                                                                                             // 121  // 3620
        var from = indices ? self.docs.indexOf(id) : -1;                                                      // 122  // 3621
                                                                                                              // 123  // 3622
        var to = indices                                                                                      // 124  // 3623
              ? (before ? self.docs.indexOf(before) : self.docs.size()) : -1;                                 // 125  // 3624
        // When not moving backwards, adjust for the fact that removing the                                   // 126  // 3625
        // document slides everything back one slot.                                                          // 127  // 3626
        if (to > from)                                                                                        // 128  // 3627
          --to;                                                                                               // 129  // 3628
        observeCallbacks.movedTo(transform(EJSON.clone(self.docs.get(id))),                                   // 130  // 3629
                                 from, to, before || null);                                                   // 131  // 3630
      },                                                                                                      // 132  // 3631
      removed: function (id) {                                                                                // 133  // 3632
        var self = this;                                                                                      // 134  // 3633
        if (!(observeCallbacks.removedAt || observeCallbacks.removed))                                        // 135  // 3634
          return;                                                                                             // 136  // 3635
        // technically maybe there should be an EJSON.clone here, but it's about                              // 137  // 3636
        // to be removed from self.docs!                                                                      // 138  // 3637
        var doc = transform(self.docs.get(id));                                                               // 139  // 3638
        if (observeCallbacks.removedAt) {                                                                     // 140  // 3639
          var index = indices ? self.docs.indexOf(id) : -1;                                                   // 141  // 3640
          observeCallbacks.removedAt(doc, index);                                                             // 142  // 3641
        } else {                                                                                              // 143  // 3642
          observeCallbacks.removed(doc);                                                                      // 144  // 3643
        }                                                                                                     // 145  // 3644
      }                                                                                                       // 146  // 3645
    };                                                                                                        // 147  // 3646
  } else {                                                                                                    // 148  // 3647
    observeChangesCallbacks = {                                                                               // 149  // 3648
      added: function (id, fields) {                                                                          // 150  // 3649
        if (!suppressed && observeCallbacks.added) {                                                          // 151  // 3650
          var doc = _.extend(fields, {_id:  id});                                                             // 152  // 3651
          observeCallbacks.added(transform(doc));                                                             // 153  // 3652
        }                                                                                                     // 154  // 3653
      },                                                                                                      // 155  // 3654
      changed: function (id, fields) {                                                                        // 156  // 3655
        var self = this;                                                                                      // 157  // 3656
        if (observeCallbacks.changed) {                                                                       // 158  // 3657
          var oldDoc = self.docs.get(id);                                                                     // 159  // 3658
          var doc = EJSON.clone(oldDoc);                                                                      // 160  // 3659
          DiffSequence.applyChanges(doc, fields);                                                             // 161  // 3660
          observeCallbacks.changed(transform(doc),                                                            // 162  // 3661
                                   transform(EJSON.clone(oldDoc)));                                           // 163  // 3662
        }                                                                                                     // 164  // 3663
      },                                                                                                      // 165  // 3664
      removed: function (id) {                                                                                // 166  // 3665
        var self = this;                                                                                      // 167  // 3666
        if (observeCallbacks.removed) {                                                                       // 168  // 3667
          observeCallbacks.removed(transform(self.docs.get(id)));                                             // 169  // 3668
        }                                                                                                     // 170  // 3669
      }                                                                                                       // 171  // 3670
    };                                                                                                        // 172  // 3671
  }                                                                                                           // 173  // 3672
                                                                                                              // 174  // 3673
  var changeObserver = new LocalCollection._CachingChangeObserver(                                            // 175  // 3674
    {callbacks: observeChangesCallbacks});                                                                    // 176  // 3675
  var handle = cursor.observeChanges(changeObserver.applyChange);                                             // 177  // 3676
  suppressed = false;                                                                                         // 178  // 3677
                                                                                                              // 179  // 3678
  return handle;                                                                                              // 180  // 3679
};                                                                                                            // 181  // 3680
                                                                                                              // 182  // 3681
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3682
                                                                                                                      // 3683
}).call(this);                                                                                                        // 3684
                                                                                                                      // 3685
                                                                                                                      // 3686
                                                                                                                      // 3687
                                                                                                                      // 3688
                                                                                                                      // 3689
                                                                                                                      // 3690
(function(){                                                                                                          // 3691
                                                                                                                      // 3692
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3693
//                                                                                                            //      // 3694
// packages/minimongo/objectid.js                                                                             //      // 3695
//                                                                                                            //      // 3696
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3697
                                                                                                              //      // 3698
// Is this selector just shorthand for lookup by _id?                                                         // 1    // 3699
LocalCollection._selectorIsId = function (selector) {                                                         // 2    // 3700
  return (typeof selector === "string") ||                                                                    // 3    // 3701
    (typeof selector === "number") ||                                                                         // 4    // 3702
    selector instanceof MongoID.ObjectID;                                                                     // 5    // 3703
};                                                                                                            // 6    // 3704
                                                                                                              // 7    // 3705
// Is the selector just lookup by _id (shorthand or not)?                                                     // 8    // 3706
LocalCollection._selectorIsIdPerhapsAsObject = function (selector) {                                          // 9    // 3707
  return LocalCollection._selectorIsId(selector) ||                                                           // 10   // 3708
    (selector && typeof selector === "object" &&                                                              // 11   // 3709
     selector._id && LocalCollection._selectorIsId(selector._id) &&                                           // 12   // 3710
     _.size(selector) === 1);                                                                                 // 13   // 3711
};                                                                                                            // 14   // 3712
                                                                                                              // 15   // 3713
// If this is a selector which explicitly constrains the match by ID to a finite                              // 16   // 3714
// number of documents, returns a list of their IDs.  Otherwise returns                                       // 17   // 3715
// null. Note that the selector may have other restrictions so it may not even                                // 18   // 3716
// match those document!  We care about $in and $and since those are generated                                // 19   // 3717
// access-controlled update and remove.                                                                       // 20   // 3718
LocalCollection._idsMatchedBySelector = function (selector) {                                                 // 21   // 3719
  // Is the selector just an ID?                                                                              // 22   // 3720
  if (LocalCollection._selectorIsId(selector))                                                                // 23   // 3721
    return [selector];                                                                                        // 24   // 3722
  if (!selector)                                                                                              // 25   // 3723
    return null;                                                                                              // 26   // 3724
                                                                                                              // 27   // 3725
  // Do we have an _id clause?                                                                                // 28   // 3726
  if (_.has(selector, '_id')) {                                                                               // 29   // 3727
    // Is the _id clause just an ID?                                                                          // 30   // 3728
    if (LocalCollection._selectorIsId(selector._id))                                                          // 31   // 3729
      return [selector._id];                                                                                  // 32   // 3730
    // Is the _id clause {_id: {$in: ["x", "y", "z"]}}?                                                       // 33   // 3731
    if (selector._id && selector._id.$in                                                                      // 34   // 3732
        && _.isArray(selector._id.$in)                                                                        // 35   // 3733
        && !_.isEmpty(selector._id.$in)                                                                       // 36   // 3734
        && _.all(selector._id.$in, LocalCollection._selectorIsId)) {                                          // 37   // 3735
      return selector._id.$in;                                                                                // 38   // 3736
    }                                                                                                         // 39   // 3737
    return null;                                                                                              // 40   // 3738
  }                                                                                                           // 41   // 3739
                                                                                                              // 42   // 3740
  // If this is a top-level $and, and any of the clauses constrain their                                      // 43   // 3741
  // documents, then the whole selector is constrained by any one clause's                                    // 44   // 3742
  // constraint. (Well, by their intersection, but that seems unlikely.)                                      // 45   // 3743
  if (selector.$and && _.isArray(selector.$and)) {                                                            // 46   // 3744
    for (var i = 0; i < selector.$and.length; ++i) {                                                          // 47   // 3745
      var subIds = LocalCollection._idsMatchedBySelector(selector.$and[i]);                                   // 48   // 3746
      if (subIds)                                                                                             // 49   // 3747
        return subIds;                                                                                        // 50   // 3748
    }                                                                                                         // 51   // 3749
  }                                                                                                           // 52   // 3750
                                                                                                              // 53   // 3751
  return null;                                                                                                // 54   // 3752
};                                                                                                            // 55   // 3753
                                                                                                              // 56   // 3754
                                                                                                              // 57   // 3755
                                                                                                              // 58   // 3756
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3757
                                                                                                                      // 3758
}).call(this);                                                                                                        // 3759
                                                                                                                      // 3760
                                                                                                                      // 3761
                                                                                                                      // 3762
                                                                                                                      // 3763
                                                                                                                      // 3764
                                                                                                                      // 3765
(function(){                                                                                                          // 3766
                                                                                                                      // 3767
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3768
//                                                                                                            //      // 3769
// packages/minimongo/selector_projection.js                                                                  //      // 3770
//                                                                                                            //      // 3771
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3772
                                                                                                              //      // 3773
// Knows how to combine a mongo selector and a fields projection to a new fields                              // 1    // 3774
// projection taking into account active fields from the passed selector.                                     // 2    // 3775
// @returns Object - projection object (same as fields option of mongo cursor)                                // 3    // 3776
Minimongo.Matcher.prototype.combineIntoProjection = function (projection) {                                   // 4    // 3777
  var self = this;                                                                                            // 5    // 3778
  var selectorPaths = Minimongo._pathsElidingNumericKeys(self._getPaths());                                   // 6    // 3779
                                                                                                              // 7    // 3780
  // Special case for $where operator in the selector - projection should depend                              // 8    // 3781
  // on all fields of the document. getSelectorPaths returns a list of paths                                  // 9    // 3782
  // selector depends on. If one of the paths is '' (empty string) representing                               // 10   // 3783
  // the root or the whole document, complete projection should be returned.                                  // 11   // 3784
  if (_.contains(selectorPaths, ''))                                                                          // 12   // 3785
    return {};                                                                                                // 13   // 3786
                                                                                                              // 14   // 3787
  return combineImportantPathsIntoProjection(selectorPaths, projection);                                      // 15   // 3788
};                                                                                                            // 16   // 3789
                                                                                                              // 17   // 3790
Minimongo._pathsElidingNumericKeys = function (paths) {                                                       // 18   // 3791
  var self = this;                                                                                            // 19   // 3792
  return _.map(paths, function (path) {                                                                       // 20   // 3793
    return _.reject(path.split('.'), isNumericKey).join('.');                                                 // 21   // 3794
  });                                                                                                         // 22   // 3795
};                                                                                                            // 23   // 3796
                                                                                                              // 24   // 3797
combineImportantPathsIntoProjection = function (paths, projection) {                                          // 25   // 3798
  var prjDetails = projectionDetails(projection);                                                             // 26   // 3799
  var tree = prjDetails.tree;                                                                                 // 27   // 3800
  var mergedProjection = {};                                                                                  // 28   // 3801
                                                                                                              // 29   // 3802
  // merge the paths to include                                                                               // 30   // 3803
  tree = pathsToTree(paths,                                                                                   // 31   // 3804
                     function (path) { return true; },                                                        // 32   // 3805
                     function (node, path, fullPath) { return true; },                                        // 33   // 3806
                     tree);                                                                                   // 34   // 3807
  mergedProjection = treeToPaths(tree);                                                                       // 35   // 3808
  if (prjDetails.including) {                                                                                 // 36   // 3809
    // both selector and projection are pointing on fields to include                                         // 37   // 3810
    // so we can just return the merged tree                                                                  // 38   // 3811
    return mergedProjection;                                                                                  // 39   // 3812
  } else {                                                                                                    // 40   // 3813
    // selector is pointing at fields to include                                                              // 41   // 3814
    // projection is pointing at fields to exclude                                                            // 42   // 3815
    // make sure we don't exclude important paths                                                             // 43   // 3816
    var mergedExclProjection = {};                                                                            // 44   // 3817
    _.each(mergedProjection, function (incl, path) {                                                          // 45   // 3818
      if (!incl)                                                                                              // 46   // 3819
        mergedExclProjection[path] = false;                                                                   // 47   // 3820
    });                                                                                                       // 48   // 3821
                                                                                                              // 49   // 3822
    return mergedExclProjection;                                                                              // 50   // 3823
  }                                                                                                           // 51   // 3824
};                                                                                                            // 52   // 3825
                                                                                                              // 53   // 3826
// Returns a set of key paths similar to                                                                      // 54   // 3827
// { 'foo.bar': 1, 'a.b.c': 1 }                                                                               // 55   // 3828
var treeToPaths = function (tree, prefix) {                                                                   // 56   // 3829
  prefix = prefix || '';                                                                                      // 57   // 3830
  var result = {};                                                                                            // 58   // 3831
                                                                                                              // 59   // 3832
  _.each(tree, function (val, key) {                                                                          // 60   // 3833
    if (_.isObject(val))                                                                                      // 61   // 3834
      _.extend(result, treeToPaths(val, prefix + key + '.'));                                                 // 62   // 3835
    else                                                                                                      // 63   // 3836
      result[prefix + key] = val;                                                                             // 64   // 3837
  });                                                                                                         // 65   // 3838
                                                                                                              // 66   // 3839
  return result;                                                                                              // 67   // 3840
};                                                                                                            // 68   // 3841
                                                                                                              // 69   // 3842
                                                                                                              // 70   // 3843
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3844
                                                                                                                      // 3845
}).call(this);                                                                                                        // 3846
                                                                                                                      // 3847
                                                                                                                      // 3848
                                                                                                                      // 3849
                                                                                                                      // 3850
                                                                                                                      // 3851
                                                                                                                      // 3852
(function(){                                                                                                          // 3853
                                                                                                                      // 3854
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3855
//                                                                                                            //      // 3856
// packages/minimongo/selector_modifier.js                                                                    //      // 3857
//                                                                                                            //      // 3858
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 3859
                                                                                                              //      // 3860
// Returns true if the modifier applied to some document may change the result                                // 1    // 3861
// of matching the document by selector                                                                       // 2    // 3862
// The modifier is always in a form of Object:                                                                // 3    // 3863
//  - $set                                                                                                    // 4    // 3864
//    - 'a.b.22.z': value                                                                                     // 5    // 3865
//    - 'foo.bar': 42                                                                                         // 6    // 3866
//  - $unset                                                                                                  // 7    // 3867
//    - 'abc.d': 1                                                                                            // 8    // 3868
Minimongo.Matcher.prototype.affectedByModifier = function (modifier) {                                        // 9    // 3869
  var self = this;                                                                                            // 10   // 3870
  // safe check for $set/$unset being objects                                                                 // 11   // 3871
  modifier = _.extend({ $set: {}, $unset: {} }, modifier);                                                    // 12   // 3872
  var modifiedPaths = _.keys(modifier.$set).concat(_.keys(modifier.$unset));                                  // 13   // 3873
  var meaningfulPaths = self._getPaths();                                                                     // 14   // 3874
                                                                                                              // 15   // 3875
  return _.any(modifiedPaths, function (path) {                                                               // 16   // 3876
    var mod = path.split('.');                                                                                // 17   // 3877
    return _.any(meaningfulPaths, function (meaningfulPath) {                                                 // 18   // 3878
      var sel = meaningfulPath.split('.');                                                                    // 19   // 3879
      var i = 0, j = 0;                                                                                       // 20   // 3880
                                                                                                              // 21   // 3881
      while (i < sel.length && j < mod.length) {                                                              // 22   // 3882
        if (isNumericKey(sel[i]) && isNumericKey(mod[j])) {                                                   // 23   // 3883
          // foo.4.bar selector affected by foo.4 modifier                                                    // 24   // 3884
          // foo.3.bar selector unaffected by foo.4 modifier                                                  // 25   // 3885
          if (sel[i] === mod[j])                                                                              // 26   // 3886
            i++, j++;                                                                                         // 27   // 3887
          else                                                                                                // 28   // 3888
            return false;                                                                                     // 29   // 3889
        } else if (isNumericKey(sel[i])) {                                                                    // 30   // 3890
          // foo.4.bar selector unaffected by foo.bar modifier                                                // 31   // 3891
          return false;                                                                                       // 32   // 3892
        } else if (isNumericKey(mod[j])) {                                                                    // 33   // 3893
          j++;                                                                                                // 34   // 3894
        } else if (sel[i] === mod[j])                                                                         // 35   // 3895
          i++, j++;                                                                                           // 36   // 3896
        else                                                                                                  // 37   // 3897
          return false;                                                                                       // 38   // 3898
      }                                                                                                       // 39   // 3899
                                                                                                              // 40   // 3900
      // One is a prefix of another, taking numeric fields into account                                       // 41   // 3901
      return true;                                                                                            // 42   // 3902
    });                                                                                                       // 43   // 3903
  });                                                                                                         // 44   // 3904
};                                                                                                            // 45   // 3905
                                                                                                              // 46   // 3906
// Minimongo.Sorter gets a similar method, which delegates to a Matcher it made                               // 47   // 3907
// for this exact purpose.                                                                                    // 48   // 3908
Minimongo.Sorter.prototype.affectedByModifier = function (modifier) {                                         // 49   // 3909
  var self = this;                                                                                            // 50   // 3910
  return self._selectorForAffectedByModifier.affectedByModifier(modifier);                                    // 51   // 3911
};                                                                                                            // 52   // 3912
                                                                                                              // 53   // 3913
// @param modifier - Object: MongoDB-styled modifier with `$set`s and `$unsets`                               // 54   // 3914
//                           only. (assumed to come from oplog)                                               // 55   // 3915
// @returns - Boolean: if after applying the modifier, selector can start                                     // 56   // 3916
//                     accepting the modified value.                                                          // 57   // 3917
// NOTE: assumes that document affected by modifier didn't match this Matcher                                 // 58   // 3918
// before, so if modifier can't convince selector in a positive change it would                               // 59   // 3919
// stay 'false'.                                                                                              // 60   // 3920
// Currently doesn't support $-operators and numeric indices precisely.                                       // 61   // 3921
Minimongo.Matcher.prototype.canBecomeTrueByModifier = function (modifier) {                                   // 62   // 3922
  var self = this;                                                                                            // 63   // 3923
  if (!this.affectedByModifier(modifier))                                                                     // 64   // 3924
    return false;                                                                                             // 65   // 3925
                                                                                                              // 66   // 3926
  modifier = _.extend({$set:{}, $unset:{}}, modifier);                                                        // 67   // 3927
  var modifierPaths = _.keys(modifier.$set).concat(_.keys(modifier.$unset));                                  // 68   // 3928
                                                                                                              // 69   // 3929
  if (!self.isSimple())                                                                                       // 70   // 3930
    return true;                                                                                              // 71   // 3931
                                                                                                              // 72   // 3932
  if (_.any(self._getPaths(), pathHasNumericKeys) ||                                                          // 73   // 3933
      _.any(modifierPaths, pathHasNumericKeys))                                                               // 74   // 3934
    return true;                                                                                              // 75   // 3935
                                                                                                              // 76   // 3936
  // check if there is a $set or $unset that indicates something is an                                        // 77   // 3937
  // object rather than a scalar in the actual object where we saw $-operator                                 // 78   // 3938
  // NOTE: it is correct since we allow only scalars in $-operators                                           // 79   // 3939
  // Example: for selector {'a.b': {$gt: 5}} the modifier {'a.b.c':7} would                                   // 80   // 3940
  // definitely set the result to false as 'a.b' appears to be an object.                                     // 81   // 3941
  var expectedScalarIsObject = _.any(self._selector, function (sel, path) {                                   // 82   // 3942
    if (! isOperatorObject(sel))                                                                              // 83   // 3943
      return false;                                                                                           // 84   // 3944
    return _.any(modifierPaths, function (modifierPath) {                                                     // 85   // 3945
      return startsWith(modifierPath, path + '.');                                                            // 86   // 3946
    });                                                                                                       // 87   // 3947
  });                                                                                                         // 88   // 3948
                                                                                                              // 89   // 3949
  if (expectedScalarIsObject)                                                                                 // 90   // 3950
    return false;                                                                                             // 91   // 3951
                                                                                                              // 92   // 3952
  // See if we can apply the modifier on the ideally matching object. If it                                   // 93   // 3953
  // still matches the selector, then the modifier could have turned the real                                 // 94   // 3954
  // object in the database into something matching.                                                          // 95   // 3955
  var matchingDocument = EJSON.clone(self.matchingDocument());                                                // 96   // 3956
                                                                                                              // 97   // 3957
  // The selector is too complex, anything can happen.                                                        // 98   // 3958
  if (matchingDocument === null)                                                                              // 99   // 3959
    return true;                                                                                              // 100  // 3960
                                                                                                              // 101  // 3961
  try {                                                                                                       // 102  // 3962
    LocalCollection._modify(matchingDocument, modifier);                                                      // 103  // 3963
  } catch (e) {                                                                                               // 104  // 3964
    // Couldn't set a property on a field which is a scalar or null in the                                    // 105  // 3965
    // selector.                                                                                              // 106  // 3966
    // Example:                                                                                               // 107  // 3967
    // real document: { 'a.b': 3 }                                                                            // 108  // 3968
    // selector: { 'a': 12 }                                                                                  // 109  // 3969
    // converted selector (ideal document): { 'a': 12 }                                                       // 110  // 3970
    // modifier: { $set: { 'a.b': 4 } }                                                                       // 111  // 3971
    // We don't know what real document was like but from the error raised by                                 // 112  // 3972
    // $set on a scalar field we can reason that the structure of real document                               // 113  // 3973
    // is completely different.                                                                               // 114  // 3974
    if (e.name === "MinimongoError" && e.setPropertyError)                                                    // 115  // 3975
      return false;                                                                                           // 116  // 3976
    throw e;                                                                                                  // 117  // 3977
  }                                                                                                           // 118  // 3978
                                                                                                              // 119  // 3979
  return self.documentMatches(matchingDocument).result;                                                       // 120  // 3980
};                                                                                                            // 121  // 3981
                                                                                                              // 122  // 3982
// Returns an object that would match the selector if possible or null if the                                 // 123  // 3983
// selector is too complex for us to analyze                                                                  // 124  // 3984
// { 'a.b': { ans: 42 }, 'foo.bar': null, 'foo.baz': "something" }                                            // 125  // 3985
// => { a: { b: { ans: 42 } }, foo: { bar: null, baz: "something" } }                                         // 126  // 3986
Minimongo.Matcher.prototype.matchingDocument = function () {                                                  // 127  // 3987
  var self = this;                                                                                            // 128  // 3988
                                                                                                              // 129  // 3989
  // check if it was computed before                                                                          // 130  // 3990
  if (self._matchingDocument !== undefined)                                                                   // 131  // 3991
    return self._matchingDocument;                                                                            // 132  // 3992
                                                                                                              // 133  // 3993
  // If the analysis of this selector is too hard for our implementation                                      // 134  // 3994
  // fallback to "YES"                                                                                        // 135  // 3995
  var fallback = false;                                                                                       // 136  // 3996
  self._matchingDocument = pathsToTree(self._getPaths(),                                                      // 137  // 3997
    function (path) {                                                                                         // 138  // 3998
      var valueSelector = self._selector[path];                                                               // 139  // 3999
      if (isOperatorObject(valueSelector)) {                                                                  // 140  // 4000
        // if there is a strict equality, there is a good                                                     // 141  // 4001
        // chance we can use one of those as "matching"                                                       // 142  // 4002
        // dummy value                                                                                        // 143  // 4003
        if (valueSelector.$in) {                                                                              // 144  // 4004
          var matcher = new Minimongo.Matcher({ placeholder: valueSelector });                                // 145  // 4005
                                                                                                              // 146  // 4006
          // Return anything from $in that matches the whole selector for this                                // 147  // 4007
          // path. If nothing matches, returns `undefined` as nothing can make                                // 148  // 4008
          // this selector into `true`.                                                                       // 149  // 4009
          return _.find(valueSelector.$in, function (x) {                                                     // 150  // 4010
            return matcher.documentMatches({ placeholder: x }).result;                                        // 151  // 4011
          });                                                                                                 // 152  // 4012
        } else if (onlyContainsKeys(valueSelector, ['$gt', '$gte', '$lt', '$lte'])) {                         // 153  // 4013
          var lowerBound = -Infinity, upperBound = Infinity;                                                  // 154  // 4014
          _.each(['$lte', '$lt'], function (op) {                                                             // 155  // 4015
            if (_.has(valueSelector, op) && valueSelector[op] < upperBound)                                   // 156  // 4016
              upperBound = valueSelector[op];                                                                 // 157  // 4017
          });                                                                                                 // 158  // 4018
          _.each(['$gte', '$gt'], function (op) {                                                             // 159  // 4019
            if (_.has(valueSelector, op) && valueSelector[op] > lowerBound)                                   // 160  // 4020
              lowerBound = valueSelector[op];                                                                 // 161  // 4021
          });                                                                                                 // 162  // 4022
                                                                                                              // 163  // 4023
          var middle = (lowerBound + upperBound) / 2;                                                         // 164  // 4024
          var matcher = new Minimongo.Matcher({ placeholder: valueSelector });                                // 165  // 4025
          if (!matcher.documentMatches({ placeholder: middle }).result &&                                     // 166  // 4026
              (middle === lowerBound || middle === upperBound))                                               // 167  // 4027
            fallback = true;                                                                                  // 168  // 4028
                                                                                                              // 169  // 4029
          return middle;                                                                                      // 170  // 4030
        } else if (onlyContainsKeys(valueSelector, ['$nin',' $ne'])) {                                        // 171  // 4031
          // Since self._isSimple makes sure $nin and $ne are not combined with                               // 172  // 4032
          // objects or arrays, we can confidently return an empty object as it                               // 173  // 4033
          // never matches any scalar.                                                                        // 174  // 4034
          return {};                                                                                          // 175  // 4035
        } else {                                                                                              // 176  // 4036
          fallback = true;                                                                                    // 177  // 4037
        }                                                                                                     // 178  // 4038
      }                                                                                                       // 179  // 4039
      return self._selector[path];                                                                            // 180  // 4040
    },                                                                                                        // 181  // 4041
    _.identity /*conflict resolution is no resolution*/);                                                     // 182  // 4042
                                                                                                              // 183  // 4043
  if (fallback)                                                                                               // 184  // 4044
    self._matchingDocument = null;                                                                            // 185  // 4045
                                                                                                              // 186  // 4046
  return self._matchingDocument;                                                                              // 187  // 4047
};                                                                                                            // 188  // 4048
                                                                                                              // 189  // 4049
var getPaths = function (sel) {                                                                               // 190  // 4050
  return _.keys(new Minimongo.Matcher(sel)._paths);                                                           // 191  // 4051
  return _.chain(sel).map(function (v, k) {                                                                   // 192  // 4052
    // we don't know how to handle $where because it can be anything                                          // 193  // 4053
    if (k === "$where")                                                                                       // 194  // 4054
      return ''; // matches everything                                                                        // 195  // 4055
    // we branch from $or/$and/$nor operator                                                                  // 196  // 4056
    if (_.contains(['$or', '$and', '$nor'], k))                                                               // 197  // 4057
      return _.map(v, getPaths);                                                                              // 198  // 4058
    // the value is a literal or some comparison operator                                                     // 199  // 4059
    return k;                                                                                                 // 200  // 4060
  }).flatten().uniq().value();                                                                                // 201  // 4061
};                                                                                                            // 202  // 4062
                                                                                                              // 203  // 4063
// A helper to ensure object has only certain keys                                                            // 204  // 4064
var onlyContainsKeys = function (obj, keys) {                                                                 // 205  // 4065
  return _.all(obj, function (v, k) {                                                                         // 206  // 4066
    return _.contains(keys, k);                                                                               // 207  // 4067
  });                                                                                                         // 208  // 4068
};                                                                                                            // 209  // 4069
                                                                                                              // 210  // 4070
var pathHasNumericKeys = function (path) {                                                                    // 211  // 4071
  return _.any(path.split('.'), isNumericKey);                                                                // 212  // 4072
}                                                                                                             // 213  // 4073
                                                                                                              // 214  // 4074
// XXX from Underscore.String (http://epeli.github.com/underscore.string/)                                    // 215  // 4075
var startsWith = function(str, starts) {                                                                      // 216  // 4076
  return str.length >= starts.length &&                                                                       // 217  // 4077
    str.substring(0, starts.length) === starts;                                                               // 218  // 4078
};                                                                                                            // 219  // 4079
                                                                                                              // 220  // 4080
                                                                                                              // 221  // 4081
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 4082
                                                                                                                      // 4083
}).call(this);                                                                                                        // 4084
                                                                                                                      // 4085
                                                                                                                      // 4086
                                                                                                                      // 4087
                                                                                                                      // 4088
                                                                                                                      // 4089
                                                                                                                      // 4090
(function(){                                                                                                          // 4091
                                                                                                                      // 4092
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 4093
//                                                                                                            //      // 4094
// packages/minimongo/sorter_projection.js                                                                    //      // 4095
//                                                                                                            //      // 4096
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 4097
                                                                                                              //      // 4098
Minimongo.Sorter.prototype.combineIntoProjection = function (projection) {                                    // 1    // 4099
  var self = this;                                                                                            // 2    // 4100
  var specPaths = Minimongo._pathsElidingNumericKeys(self._getPaths());                                       // 3    // 4101
  return combineImportantPathsIntoProjection(specPaths, projection);                                          // 4    // 4102
};                                                                                                            // 5    // 4103
                                                                                                              // 6    // 4104
////////////////////////////////////////////////////////////////////////////////////////////////////////////////      // 4105
                                                                                                                      // 4106
}).call(this);                                                                                                        // 4107
                                                                                                                      // 4108
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.minimongo = {
  LocalCollection: LocalCollection,
  Minimongo: Minimongo,
  MinimongoTest: MinimongoTest
};

})();

//# sourceMappingURL=minimongo.js.map
