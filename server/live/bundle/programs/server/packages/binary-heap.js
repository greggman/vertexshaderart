(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var IdMap = Package['id-map'].IdMap;

/* Package-scope variables */
var MaxHeap, MinHeap, MinMaxHeap;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                           //
// packages/binary-heap/packages/binary-heap.js                                              //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////
                                                                                             //
(function(){                                                                                 // 1
                                                                                             // 2
////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                    //     // 4
// packages/binary-heap/max-heap.js                                                   //     // 5
//                                                                                    //     // 6
////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                      //     // 8
// Constructor of Heap                                                                // 1   // 9
// - comparator - Function - given two items returns a number                         // 2   // 10
// - options:                                                                         // 3   // 11
//   - initData - Array - Optional - the initial data in a format:                    // 4   // 12
//        Object:                                                                     // 5   // 13
//          - id - String - unique id of the item                                     // 6   // 14
//          - value - Any - the data value                                            // 7   // 15
//      each value is retained                                                        // 8   // 16
//   - IdMap - Constructor - Optional - custom IdMap class to store id->index         // 9   // 17
//       mappings internally. Standard IdMap is used by default.                      // 10  // 18
MaxHeap = function (comparator, options) {                                            // 11  // 19
  if (! _.isFunction(comparator))                                                     // 12  // 20
    throw new Error('Passed comparator is invalid, should be a comparison function');        // 21
  var self = this;                                                                    // 14  // 22
                                                                                      // 15  // 23
  // a C-style comparator that is given two values and returns a number,              // 16  // 24
  // negative if the first value is less than the second, positive if the second      // 17  // 25
  // value is greater than the first and zero if they are equal.                      // 18  // 26
  self._comparator = comparator;                                                      // 19  // 27
                                                                                      // 20  // 28
  options = _.defaults(options || {}, { IdMap: IdMap });                              // 21  // 29
                                                                                      // 22  // 30
  // _heapIdx maps an id to an index in the Heap array the corresponding value        // 23  // 31
  // is located on.                                                                   // 24  // 32
  self._heapIdx = new options.IdMap;                                                  // 25  // 33
                                                                                      // 26  // 34
  // The Heap data-structure implemented as a 0-based contiguous array where          // 27  // 35
  // every item on index idx is a node in a complete binary tree. Every node can      // 28  // 36
  // have children on indexes idx*2+1 and idx*2+2, except for the leaves. Every       // 29  // 37
  // node has a parent on index (idx-1)/2;                                            // 30  // 38
  self._heap = [];                                                                    // 31  // 39
                                                                                      // 32  // 40
  // If the initial array is passed, we can build the heap in linear time             // 33  // 41
  // complexity (O(N)) compared to linearithmic time complexity (O(nlogn)) if         // 34  // 42
  // we push elements one by one.                                                     // 35  // 43
  if (_.isArray(options.initData))                                                    // 36  // 44
    self._initFromData(options.initData);                                             // 37  // 45
};                                                                                    // 38  // 46
                                                                                      // 39  // 47
_.extend(MaxHeap.prototype, {                                                         // 40  // 48
  // Builds a new heap in-place in linear time based on passed data                   // 41  // 49
  _initFromData: function (data) {                                                    // 42  // 50
    var self = this;                                                                  // 43  // 51
                                                                                      // 44  // 52
    self._heap = _.map(data, function (o) {                                           // 45  // 53
      return { id: o.id, value: o.value };                                            // 46  // 54
    });                                                                               // 47  // 55
                                                                                      // 48  // 56
    _.each(data, function (o, i) {                                                    // 49  // 57
      self._heapIdx.set(o.id, i);                                                     // 50  // 58
    });                                                                               // 51  // 59
                                                                                      // 52  // 60
    if (! data.length)                                                                // 53  // 61
      return;                                                                         // 54  // 62
                                                                                      // 55  // 63
    // start from the first non-leaf - the parent of the last leaf                    // 56  // 64
    for (var i = parentIdx(data.length - 1); i >= 0; i--)                             // 57  // 65
      self._downHeap(i);                                                              // 58  // 66
  },                                                                                  // 59  // 67
                                                                                      // 60  // 68
  _downHeap: function (idx) {                                                         // 61  // 69
    var self = this;                                                                  // 62  // 70
                                                                                      // 63  // 71
    while (leftChildIdx(idx) < self.size()) {                                         // 64  // 72
      var left = leftChildIdx(idx);                                                   // 65  // 73
      var right = rightChildIdx(idx);                                                 // 66  // 74
      var largest = idx;                                                              // 67  // 75
                                                                                      // 68  // 76
      if (left < self.size()) {                                                       // 69  // 77
        largest = self._maxIndex(largest, left);                                      // 70  // 78
      }                                                                               // 71  // 79
      if (right < self.size()) {                                                      // 72  // 80
        largest = self._maxIndex(largest, right);                                     // 73  // 81
      }                                                                               // 74  // 82
                                                                                      // 75  // 83
      if (largest === idx)                                                            // 76  // 84
        break;                                                                        // 77  // 85
                                                                                      // 78  // 86
      self._swap(largest, idx);                                                       // 79  // 87
      idx = largest;                                                                  // 80  // 88
    }                                                                                 // 81  // 89
  },                                                                                  // 82  // 90
                                                                                      // 83  // 91
  _upHeap: function (idx) {                                                           // 84  // 92
    var self = this;                                                                  // 85  // 93
                                                                                      // 86  // 94
    while (idx > 0) {                                                                 // 87  // 95
      var parent = parentIdx(idx);                                                    // 88  // 96
      if (self._maxIndex(parent, idx) === idx) {                                      // 89  // 97
        self._swap(parent, idx)                                                       // 90  // 98
        idx = parent;                                                                 // 91  // 99
      } else {                                                                        // 92  // 100
        break;                                                                        // 93  // 101
      }                                                                               // 94  // 102
    }                                                                                 // 95  // 103
  },                                                                                  // 96  // 104
                                                                                      // 97  // 105
  _maxIndex: function (idxA, idxB) {                                                  // 98  // 106
    var self = this;                                                                  // 99  // 107
    var valueA = self._get(idxA);                                                     // 100
    var valueB = self._get(idxB);                                                     // 101
    return self._comparator(valueA, valueB) >= 0 ? idxA : idxB;                       // 102
  },                                                                                  // 103
                                                                                      // 104
  // Internal: gets raw data object placed on idxth place in heap                     // 105
  _get: function (idx) {                                                              // 106
    var self = this;                                                                  // 107
    return self._heap[idx].value;                                                     // 108
  },                                                                                  // 109
                                                                                      // 110
  _swap: function (idxA, idxB) {                                                      // 111
    var self = this;                                                                  // 112
    var recA = self._heap[idxA];                                                      // 113
    var recB = self._heap[idxB];                                                      // 114
                                                                                      // 115
    self._heapIdx.set(recA.id, idxB);                                                 // 116
    self._heapIdx.set(recB.id, idxA);                                                 // 117
                                                                                      // 118
    self._heap[idxA] = recB;                                                          // 119
    self._heap[idxB] = recA;                                                          // 120
  },                                                                                  // 121
                                                                                      // 122
  get: function (id) {                                                                // 123
    var self = this;                                                                  // 124
    if (! self.has(id))                                                               // 125
      return null;                                                                    // 126
    return self._get(self._heapIdx.get(id));                                          // 127
  },                                                                                  // 128
  set: function (id, value) {                                                         // 129
    var self = this;                                                                  // 130
                                                                                      // 131
    if (self.has(id)) {                                                               // 132
      if (self.get(id) === value)                                                     // 133
        return;                                                                       // 134
                                                                                      // 135
      var idx = self._heapIdx.get(id);                                                // 136
      self._heap[idx].value = value;                                                  // 137
                                                                                      // 138
      // Fix the new value's position                                                 // 139
      // Either bubble new value up if it is greater than its parent                  // 140
      self._upHeap(idx);                                                              // 141
      // or bubble it down if it is smaller than one of its children                  // 142
      self._downHeap(idx);                                                            // 143
    } else {                                                                          // 144
      self._heapIdx.set(id, self._heap.length);                                       // 145
      self._heap.push({ id: id, value: value });                                      // 146
      self._upHeap(self._heap.length - 1);                                            // 147
    }                                                                                 // 148
  },                                                                                  // 149
  remove: function (id) {                                                             // 150
    var self = this;                                                                  // 151
                                                                                      // 152
    if (self.has(id)) {                                                               // 153
      var last = self._heap.length - 1;                                               // 154
      var idx = self._heapIdx.get(id);                                                // 155
                                                                                      // 156
      if (idx !== last) {                                                             // 157
        self._swap(idx, last);                                                        // 158
        self._heap.pop();                                                             // 159
        self._heapIdx.remove(id);                                                     // 160
                                                                                      // 161
        // Fix the swapped value's position                                           // 162
        self._upHeap(idx);                                                            // 163
        self._downHeap(idx);                                                          // 164
      } else {                                                                        // 165
        self._heap.pop();                                                             // 166
        self._heapIdx.remove(id);                                                     // 167
      }                                                                               // 168
    }                                                                                 // 169
  },                                                                                  // 170
  has: function (id) {                                                                // 171
    var self = this;                                                                  // 172
    return self._heapIdx.has(id);                                                     // 173
  },                                                                                  // 174
  empty: function () {                                                                // 175
    var self = this;                                                                  // 176
    return !self.size();                                                              // 177
  },                                                                                  // 178
  clear: function () {                                                                // 179
    var self = this;                                                                  // 180
    self._heap = [];                                                                  // 181
    self._heapIdx.clear();                                                            // 182
  },                                                                                  // 183
  // iterate over values in no particular order                                       // 184
  forEach: function (iterator) {                                                      // 185
    var self = this;                                                                  // 186
    _.each(self._heap, function (obj) {                                               // 187
      return iterator(obj.value, obj.id);                                             // 188
    });                                                                               // 189
  },                                                                                  // 190
  size: function () {                                                                 // 191
    var self = this;                                                                  // 192
    return self._heap.length;                                                         // 193
  },                                                                                  // 194
  setDefault: function (id, def) {                                                    // 195
    var self = this;                                                                  // 196
    if (self.has(id))                                                                 // 197
      return self.get(id);                                                            // 198
    self.set(id, def);                                                                // 199
    return def;                                                                       // 200
  },                                                                                  // 201
  clone: function () {                                                                // 202
    var self = this;                                                                  // 203
    var clone = new MaxHeap(self._comparator, self._heap);                            // 204
    return clone;                                                                     // 205
  },                                                                                  // 206
                                                                                      // 207
  maxElementId: function () {                                                         // 208
    var self = this;                                                                  // 209
    return self.size() ? self._heap[0].id : null;                                     // 210
  },                                                                                  // 211
                                                                                      // 212
  _selfCheck: function () {                                                           // 213
    var self = this;                                                                  // 214
    for (var i = 1; i < self._heap.length; i++)                                       // 215
      if (self._maxIndex(parentIdx(i), i) !== parentIdx(i))                           // 216
          throw new Error("An item with id " + self._heap[i].id +                     // 217
                          " has a parent younger than it: " +                         // 218
                          self._heap[parentIdx(i)].id);                               // 219
  }                                                                                   // 220
});                                                                                   // 221
                                                                                      // 222
function leftChildIdx (i) { return i * 2 + 1; }                                       // 223
function rightChildIdx (i) { return i * 2 + 2; }                                      // 224
function parentIdx (i) { return (i - 1) >> 1; }                                       // 225
                                                                                      // 226
                                                                                      // 227
////////////////////////////////////////////////////////////////////////////////////////     // 236
                                                                                             // 237
}).call(this);                                                                               // 238
                                                                                             // 239
                                                                                             // 240
                                                                                             // 241
                                                                                             // 242
                                                                                             // 243
                                                                                             // 244
(function(){                                                                                 // 245
                                                                                             // 246
////////////////////////////////////////////////////////////////////////////////////////     // 247
//                                                                                    //     // 248
// packages/binary-heap/min-heap.js                                                   //     // 249
//                                                                                    //     // 250
////////////////////////////////////////////////////////////////////////////////////////     // 251
                                                                                      //     // 252
MinHeap = function (comparator, options) {                                            // 1   // 253
  var self = this;                                                                    // 2   // 254
  MaxHeap.call(self, function (a, b) {                                                // 3   // 255
    return -comparator(a, b);                                                         // 4   // 256
  }, options);                                                                        // 5   // 257
};                                                                                    // 6   // 258
                                                                                      // 7   // 259
Meteor._inherits(MinHeap, MaxHeap);                                                   // 8   // 260
                                                                                      // 9   // 261
_.extend(MinHeap.prototype, {                                                         // 10  // 262
  maxElementId: function () {                                                         // 11  // 263
    throw new Error("Cannot call maxElementId on MinHeap");                           // 12  // 264
  },                                                                                  // 13  // 265
  minElementId: function () {                                                         // 14  // 266
    var self = this;                                                                  // 15  // 267
    return MaxHeap.prototype.maxElementId.call(self);                                 // 16  // 268
  }                                                                                   // 17  // 269
});                                                                                   // 18  // 270
                                                                                      // 19  // 271
                                                                                      // 20  // 272
////////////////////////////////////////////////////////////////////////////////////////     // 273
                                                                                             // 274
}).call(this);                                                                               // 275
                                                                                             // 276
                                                                                             // 277
                                                                                             // 278
                                                                                             // 279
                                                                                             // 280
                                                                                             // 281
(function(){                                                                                 // 282
                                                                                             // 283
////////////////////////////////////////////////////////////////////////////////////////     // 284
//                                                                                    //     // 285
// packages/binary-heap/min-max-heap.js                                               //     // 286
//                                                                                    //     // 287
////////////////////////////////////////////////////////////////////////////////////////     // 288
                                                                                      //     // 289
// This implementation of Min/Max-Heap is just a subclass of Max-Heap                 // 1   // 290
// with a Min-Heap as an encapsulated property.                                       // 2   // 291
//                                                                                    // 3   // 292
// Most of the operations are just proxy methods to call the same method on both      // 4   // 293
// heaps.                                                                             // 5   // 294
//                                                                                    // 6   // 295
// This implementation takes 2*N memory but is fairly simple to write and             // 7   // 296
// understand. And the constant factor of a simple Heap is usually smaller            // 8   // 297
// compared to other two-way priority queues like Min/Max Heaps                       // 9   // 298
// (http://www.cs.otago.ac.nz/staffpriv/mike/Papers/MinMaxHeaps/MinMaxHeaps.pdf)      // 10  // 299
// and Interval Heaps                                                                 // 11  // 300
// (http://www.cise.ufl.edu/~sahni/dsaac/enrich/c13/double.htm)                       // 12  // 301
MinMaxHeap = function (comparator, options) {                                         // 13  // 302
  var self = this;                                                                    // 14  // 303
                                                                                      // 15  // 304
  MaxHeap.call(self, comparator, options);                                            // 16  // 305
  self._minHeap = new MinHeap(comparator, options);                                   // 17  // 306
};                                                                                    // 18  // 307
                                                                                      // 19  // 308
Meteor._inherits(MinMaxHeap, MaxHeap);                                                // 20  // 309
                                                                                      // 21  // 310
_.extend(MinMaxHeap.prototype, {                                                      // 22  // 311
  set: function (id, value) {                                                         // 23  // 312
    var self = this;                                                                  // 24  // 313
    MaxHeap.prototype.set.apply(self, arguments);                                     // 25  // 314
    self._minHeap.set(id, value);                                                     // 26  // 315
  },                                                                                  // 27  // 316
  remove: function (id) {                                                             // 28  // 317
    var self = this;                                                                  // 29  // 318
    MaxHeap.prototype.remove.apply(self, arguments);                                  // 30  // 319
    self._minHeap.remove(id);                                                         // 31  // 320
  },                                                                                  // 32  // 321
  clear: function () {                                                                // 33  // 322
    var self = this;                                                                  // 34  // 323
    MaxHeap.prototype.clear.apply(self, arguments);                                   // 35  // 324
    self._minHeap.clear();                                                            // 36  // 325
  },                                                                                  // 37  // 326
  setDefault: function (id, def) {                                                    // 38  // 327
    var self = this;                                                                  // 39  // 328
    MaxHeap.prototype.setDefault.apply(self, arguments);                              // 40  // 329
    return self._minHeap.setDefault(id, def);                                         // 41  // 330
  },                                                                                  // 42  // 331
  clone: function () {                                                                // 43  // 332
    var self = this;                                                                  // 44  // 333
    var clone = new MinMaxHeap(self._comparator, self._heap);                         // 45  // 334
    return clone;                                                                     // 46  // 335
  },                                                                                  // 47  // 336
  minElementId: function () {                                                         // 48  // 337
    var self = this;                                                                  // 49  // 338
    return self._minHeap.minElementId();                                              // 50  // 339
  }                                                                                   // 51  // 340
});                                                                                   // 52  // 341
                                                                                      // 53  // 342
                                                                                      // 54  // 343
////////////////////////////////////////////////////////////////////////////////////////     // 344
                                                                                             // 345
}).call(this);                                                                               // 346
                                                                                             // 347
///////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['binary-heap'] = {
  MaxHeap: MaxHeap,
  MinHeap: MinHeap,
  MinMaxHeap: MinMaxHeap
};

})();

//# sourceMappingURL=binary-heap.js.map
