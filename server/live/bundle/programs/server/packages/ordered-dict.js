(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var OrderedDict;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/ordered-dict/packages/ordered-dict.js                                       //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
(function(){                                                                            // 1
                                                                                        // 2
///////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                               //     // 4
// packages/ordered-dict/ordered_dict.js                                         //     // 5
//                                                                               //     // 6
///////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                 //     // 8
// This file defines an ordered dictionary abstraction that is useful for        // 1   // 9
// maintaining a dataset backed by observeChanges.  It supports ordering items   // 2   // 10
// by specifying the item they now come before.                                  // 3   // 11
                                                                                 // 4   // 12
// The implementation is a dictionary that contains nodes of a doubly-linked     // 5   // 13
// list as its values.                                                           // 6   // 14
                                                                                 // 7   // 15
// constructs a new element struct                                               // 8   // 16
// next and prev are whole elements, not keys.                                   // 9   // 17
var element = function (key, value, next, prev) {                                // 10  // 18
  return {                                                                       // 11  // 19
    key: key,                                                                    // 12  // 20
    value: value,                                                                // 13  // 21
    next: next,                                                                  // 14  // 22
    prev: prev                                                                   // 15  // 23
  };                                                                             // 16  // 24
};                                                                               // 17  // 25
OrderedDict = function (/* ... */) {                                             // 18  // 26
  var self = this;                                                               // 19  // 27
  self._dict = {};                                                               // 20  // 28
  self._first = null;                                                            // 21  // 29
  self._last = null;                                                             // 22  // 30
  self._size = 0;                                                                // 23  // 31
  var args = _.toArray(arguments);                                               // 24  // 32
  self._stringify = function (x) { return x; };                                  // 25  // 33
  if (typeof args[0] === 'function')                                             // 26  // 34
    self._stringify = args.shift();                                              // 27  // 35
  _.each(args, function (kv) {                                                   // 28  // 36
    self.putBefore(kv[0], kv[1], null);                                          // 29  // 37
  });                                                                            // 30  // 38
};                                                                               // 31  // 39
                                                                                 // 32  // 40
_.extend(OrderedDict.prototype, {                                                // 33  // 41
  // the "prefix keys with a space" thing comes from here                        // 34  // 42
  // https://github.com/documentcloud/underscore/issues/376#issuecomment-2815649        // 43
  _k: function (key) { return " " + this._stringify(key); },                     // 36  // 44
                                                                                 // 37  // 45
  empty: function () {                                                           // 38  // 46
    var self = this;                                                             // 39  // 47
    return !self._first;                                                         // 40  // 48
  },                                                                             // 41  // 49
  size: function () {                                                            // 42  // 50
    var self = this;                                                             // 43  // 51
    return self._size;                                                           // 44  // 52
  },                                                                             // 45  // 53
  _linkEltIn: function (elt) {                                                   // 46  // 54
    var self = this;                                                             // 47  // 55
    if (!elt.next) {                                                             // 48  // 56
      elt.prev = self._last;                                                     // 49  // 57
      if (self._last)                                                            // 50  // 58
        self._last.next = elt;                                                   // 51  // 59
      self._last = elt;                                                          // 52  // 60
    } else {                                                                     // 53  // 61
      elt.prev = elt.next.prev;                                                  // 54  // 62
      elt.next.prev = elt;                                                       // 55  // 63
      if (elt.prev)                                                              // 56  // 64
        elt.prev.next = elt;                                                     // 57  // 65
    }                                                                            // 58  // 66
    if (self._first === null || self._first === elt.next)                        // 59  // 67
      self._first = elt;                                                         // 60  // 68
  },                                                                             // 61  // 69
  _linkEltOut: function (elt) {                                                  // 62  // 70
    var self = this;                                                             // 63  // 71
    if (elt.next)                                                                // 64  // 72
      elt.next.prev = elt.prev;                                                  // 65  // 73
    if (elt.prev)                                                                // 66  // 74
      elt.prev.next = elt.next;                                                  // 67  // 75
    if (elt === self._last)                                                      // 68  // 76
      self._last = elt.prev;                                                     // 69  // 77
    if (elt === self._first)                                                     // 70  // 78
      self._first = elt.next;                                                    // 71  // 79
  },                                                                             // 72  // 80
  putBefore: function (key, item, before) {                                      // 73  // 81
    var self = this;                                                             // 74  // 82
    if (self._dict[self._k(key)])                                                // 75  // 83
      throw new Error("Item " + key + " already present in OrderedDict");        // 76  // 84
    var elt = before ?                                                           // 77  // 85
          element(key, item, self._dict[self._k(before)]) :                      // 78  // 86
          element(key, item, null);                                              // 79  // 87
    if (elt.next === undefined)                                                  // 80  // 88
      throw new Error("could not find item to put this one before");             // 81  // 89
    self._linkEltIn(elt);                                                        // 82  // 90
    self._dict[self._k(key)] = elt;                                              // 83  // 91
    self._size++;                                                                // 84  // 92
  },                                                                             // 85  // 93
  append: function (key, item) {                                                 // 86  // 94
    var self = this;                                                             // 87  // 95
    self.putBefore(key, item, null);                                             // 88  // 96
  },                                                                             // 89  // 97
  remove: function (key) {                                                       // 90  // 98
    var self = this;                                                             // 91  // 99
    var elt = self._dict[self._k(key)];                                          // 92  // 100
    if (elt === undefined)                                                       // 93  // 101
      throw new Error("Item " + key + " not present in OrderedDict");            // 94  // 102
    self._linkEltOut(elt);                                                       // 95  // 103
    self._size--;                                                                // 96  // 104
    delete self._dict[self._k(key)];                                             // 97  // 105
    return elt.value;                                                            // 98  // 106
  },                                                                             // 99  // 107
  get: function (key) {                                                          // 100
    var self = this;                                                             // 101
    if (self.has(key))                                                           // 102
        return self._dict[self._k(key)].value;                                   // 103
    return undefined;                                                            // 104
  },                                                                             // 105
  has: function (key) {                                                          // 106
    var self = this;                                                             // 107
    return _.has(self._dict, self._k(key));                                      // 108
  },                                                                             // 109
  // Iterate through the items in this dictionary in order, calling              // 110
  // iter(value, key, index) on each one.                                        // 111
                                                                                 // 112
  // Stops whenever iter returns OrderedDict.BREAK, or after the last element.   // 113
  forEach: function (iter) {                                                     // 114
    var self = this;                                                             // 115
    var i = 0;                                                                   // 116
    var elt = self._first;                                                       // 117
    while (elt !== null) {                                                       // 118
      var b = iter(elt.value, elt.key, i);                                       // 119
      if (b === OrderedDict.BREAK)                                               // 120
        return;                                                                  // 121
      elt = elt.next;                                                            // 122
      i++;                                                                       // 123
    }                                                                            // 124
  },                                                                             // 125
  first: function () {                                                           // 126
    var self = this;                                                             // 127
    if (self.empty())                                                            // 128
      return undefined;                                                          // 129
    return self._first.key;                                                      // 130
  },                                                                             // 131
  firstValue: function () {                                                      // 132
    var self = this;                                                             // 133
    if (self.empty())                                                            // 134
      return undefined;                                                          // 135
    return self._first.value;                                                    // 136
  },                                                                             // 137
  last: function () {                                                            // 138
    var self = this;                                                             // 139
    if (self.empty())                                                            // 140
      return undefined;                                                          // 141
    return self._last.key;                                                       // 142
  },                                                                             // 143
  lastValue: function () {                                                       // 144
    var self = this;                                                             // 145
    if (self.empty())                                                            // 146
      return undefined;                                                          // 147
    return self._last.value;                                                     // 148
  },                                                                             // 149
  prev: function (key) {                                                         // 150
    var self = this;                                                             // 151
    if (self.has(key)) {                                                         // 152
      var elt = self._dict[self._k(key)];                                        // 153
      if (elt.prev)                                                              // 154
        return elt.prev.key;                                                     // 155
    }                                                                            // 156
    return null;                                                                 // 157
  },                                                                             // 158
  next: function (key) {                                                         // 159
    var self = this;                                                             // 160
    if (self.has(key)) {                                                         // 161
      var elt = self._dict[self._k(key)];                                        // 162
      if (elt.next)                                                              // 163
        return elt.next.key;                                                     // 164
    }                                                                            // 165
    return null;                                                                 // 166
  },                                                                             // 167
  moveBefore: function (key, before) {                                           // 168
    var self = this;                                                             // 169
    var elt = self._dict[self._k(key)];                                          // 170
    var eltBefore = before ? self._dict[self._k(before)] : null;                 // 171
    if (elt === undefined)                                                       // 172
      throw new Error("Item to move is not present");                            // 173
    if (eltBefore === undefined) {                                               // 174
      throw new Error("Could not find element to move this one before");         // 175
    }                                                                            // 176
    if (eltBefore === elt.next) // no moving necessary                           // 177
      return;                                                                    // 178
    // remove from its old place                                                 // 179
    self._linkEltOut(elt);                                                       // 180
    // patch into its new place                                                  // 181
    elt.next = eltBefore;                                                        // 182
    self._linkEltIn(elt);                                                        // 183
  },                                                                             // 184
  // Linear, sadly.                                                              // 185
  indexOf: function (key) {                                                      // 186
    var self = this;                                                             // 187
    var ret = null;                                                              // 188
    self.forEach(function (v, k, i) {                                            // 189
      if (self._k(k) === self._k(key)) {                                         // 190
        ret = i;                                                                 // 191
        return OrderedDict.BREAK;                                                // 192
      }                                                                          // 193
      return undefined;                                                          // 194
    });                                                                          // 195
    return ret;                                                                  // 196
  },                                                                             // 197
  _checkRep: function () {                                                       // 198
    var self = this;                                                             // 199
    _.each(self._dict, function (k, v) {                                         // 200
      if (v.next === v)                                                          // 201
        throw new Error("Next is a loop");                                       // 202
      if (v.prev === v)                                                          // 203
        throw new Error("Prev is a loop");                                       // 204
    });                                                                          // 205
  }                                                                              // 206
                                                                                 // 207
});                                                                              // 208
OrderedDict.BREAK = {"break": true};                                             // 209
                                                                                 // 210
///////////////////////////////////////////////////////////////////////////////////     // 219
                                                                                        // 220
}).call(this);                                                                          // 221
                                                                                        // 222
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ordered-dict'] = {
  OrderedDict: OrderedDict
};

})();

//# sourceMappingURL=ordered-dict.js.map
