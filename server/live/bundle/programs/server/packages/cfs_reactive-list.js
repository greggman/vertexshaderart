(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;

/* Package-scope variables */
var ReactiveList;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/cfs_reactive-list/packages/cfs_reactive-list.js                                        //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
(function () {                                                                                     // 1
                                                                                                   // 2
//////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                          //     // 4
// packages/cfs:reactive-list/reactive-list.js                                              //     // 5
//                                                                                          //     // 6
//////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                            //     // 8
// #ReactiveList                                                                            // 1   // 9
// Provides a simple reactive list interface                                                // 2   // 10
var _noopCallback = function() {};                                                          // 3   // 11
                                                                                            // 4   // 12
var _nonReactive = {                                                                        // 5   // 13
  changed: _noopCallback,                                                                   // 6   // 14
  depend: _noopCallback                                                                     // 7   // 15
};                                                                                          // 8   // 16
                                                                                            // 9   // 17
/** @method ReactiveList Keeps a reactive list of key+value items                           // 10  // 18
  * @constructor                                                                            // 11  // 19
  * @namespace ReactiveList                                                                 // 12  // 20
  * @param {object} [options]                                                               // 13  // 21
  * @param {function} sort The sort algorithm to use                                        // 14  // 22
  * @param {boolean} [reactive=true] If set false this list is not reactive                 // 15  // 23
  * Example:                                                                                // 16  // 24
  * ```js                                                                                   // 17  // 25
  *   var list = new ReactiveList();                                                        // 18  // 26
  *   list.insert(1, { text: 'Hello id: 1' });                                              // 19  // 27
  *   list.insert(2, { text: 'Hello id: 2' });                                              // 20  // 28
  *   list.insert(3, { text: 'Hello id: 3' });                                              // 21  // 29
  *   list.update(2, { text: 'Updated 2'});                                                 // 22  // 30
  *   list.remove(1);                                                                       // 23  // 31
  *                                                                                         // 24  // 32
  *   list.forEach(function(value, key) {                                                   // 25  // 33
  *     console.log('GOT: ' + value.text);                                                  // 26  // 34
  *   }, true); // Set noneReactive = true, default behaviour is reactive                   // 27  // 35
  *                                                                                         // 28  // 36
  *   // Return from Template:                                                              // 29  // 37
  *   Template.hello.list = function() {                                                    // 30  // 38
  *     return list.fetch();                                                                // 31  // 39
  *   };                                                                                    // 32  // 40
  * ```                                                                                     // 33  // 41
  *                                                                                         // 34  // 42
  * ####Example of a sort algorithm                                                         // 35  // 43
  * Sort can be used to define the order of the list                                        // 36  // 44
  * ```js                                                                                   // 37  // 45
  *   var list = new ReactiveList({                                                         // 38  // 46
  *     sort: function(a, b) {                                                              // 39  // 47
  *       // a and b are type of { key, value }                                             // 40  // 48
  *       // here we sort by the key:                                                       // 41  // 49
  *       return a.key < b.key;                                                             // 42  // 50
  *     }                                                                                   // 43  // 51
  *   });                                                                                   // 44  // 52
  * ```                                                                                     // 45  // 53
  * ###Object chain                                                                         // 46  // 54
  * ```                                                                                     // 47  // 55
  *                   first                               last                              // 48  // 56
  *  undefined -       obj       -       obj       -       obj       - undefined            // 49  // 57
  *             (prev value next) (prev value next) (prev value next)                       // 50  // 58
  * ```                                                                                     // 51  // 59
  */                                                                                        // 52  // 60
ReactiveList = function(options) {                                                          // 53  // 61
  var self = this;                                                                          // 54  // 62
  // Object container                                                                       // 55  // 63
  self.lookup = {};                                                                         // 56  // 64
  // Length                                                                                 // 57  // 65
  self._length = 0;                                                                         // 58  // 66
  // First object in list                                                                   // 59  // 67
  self.first;                                                                               // 60  // 68
  // Last object in list                                                                    // 61  // 69
  self.last;                                                                                // 62  // 70
  // Set sort to options.sort or default to true (asc)                                      // 63  // 71
  self.sort = (options && options.sort || function(a, b) {                                  // 64  // 72
    return a.key < b.key;                                                                   // 65  // 73
  });                                                                                       // 66  // 74
                                                                                            // 67  // 75
  // Allow user to disable reactivity, default true                                         // 68  // 76
  self.isReactive = (options)? options.reactive !== false : true;                           // 69  // 77
                                                                                            // 70  // 78
  // If lifo queue                                                                          // 71  // 79
  if (options === true || options && options.sort === true) {                               // 72  // 80
    self.sort = function(a, b) { return a.key > b.key; };                                   // 73  // 81
  }                                                                                         // 74  // 82
                                                                                            // 75  // 83
  // Rig the dependencies                                                                   // 76  // 84
  self._listDeps = (self.isReactive)? new Deps.Dependency() : _nonReactive;                 // 77  // 85
                                                                                            // 78  // 86
  self._lengthDeps = (self.isReactive)? new Deps.Dependency() : _nonReactive;               // 79  // 87
};                                                                                          // 80  // 88
                                                                                            // 81  // 89
/** @method ReactiveList.prototype.length Returns the length of the list                    // 82  // 90
  * @reactive                                                                               // 83  // 91
  * @returns {number} Length of the reactive list                                           // 84  // 92
  */                                                                                        // 85  // 93
ReactiveList.prototype.length = function() {                                                // 86  // 94
  var self = this;                                                                          // 87  // 95
  // Make this reactive                                                                     // 88  // 96
  self._lengthDeps.depend();                                                                // 89  // 97
  return self._length;                                                                      // 90  // 98
};                                                                                          // 91  // 99
                                                                                            // 92  // 100
/** @method ReactiveList.prototype.reset Reset and empty the list                           // 93  // 101
  * @todo Check for memory leaks, if so we have to iterate over lookup and delete the items // 94  // 102
  */                                                                                        // 95  // 103
ReactiveList.prototype.reset = function() {                                                 // 96  // 104
  var self = this;                                                                          // 97  // 105
  // Clear the reference to the first object                                                // 98  // 106
  self.first = undefined;                                                                   // 99  // 107
  // Clear the reference to the last object                                                 // 100
  self.last = undefined;                                                                    // 101
  // Clear the lookup object                                                                // 102
  self.lookup = {};                                                                         // 103
  // Set the length to 0                                                                    // 104
  self._length = 0;                                                                         // 105
  self._lengthDeps.changed();                                                               // 106
  // Invalidate the list                                                                    // 107
  self._listDeps.changed();                                                                 // 108
};                                                                                          // 109
                                                                                            // 110
/** @method ReactiveList.prototype.update                                                   // 111
  * @param {string|number} key Key to update                                                // 112
  * @param {any} value Update with this value                                               // 113
  */                                                                                        // 114
ReactiveList.prototype.update = function(key, value) {                                      // 115
  var self = this;                                                                          // 116
  // Make sure the key is found in the list                                                 // 117
  if (typeof self.lookup[key] === 'undefined') {                                            // 118
    throw new Error('Reactive list cannot update, key "' + key + '" not found');            // 119
  }                                                                                         // 120
  // Set the new value                                                                      // 121
  self.lookup[key].value = value;                                                           // 122
  // Invalidate the list                                                                    // 123
  self._listDeps.changed();                                                                 // 124
};                                                                                          // 125
                                                                                            // 126
/** @method ReactiveList.prototype.insert                                                   // 127
  * @param {string|number} key Key to insert                                                // 128
  * @param {any} value Insert item with this value                                          // 129
  */                                                                                        // 130
ReactiveList.prototype.insert = function(key, value) {                                      // 131
  var self = this;                                                                          // 132
  if (typeof self.lookup[key] !== 'undefined') {                                            // 133
    throw new Error('Reactive list could not insert: key "' + key +                         // 134
            '" allready found');                                                            // 135
  }                                                                                         // 136
  // Create the new item to insert into the list                                            // 137
  var newItem = { key: key, value: value };                                                 // 138
  // Init current by pointing it at the first object in the list                            // 139
  var current = self.first;                                                                 // 140
  // Init the isInserted flag                                                               // 141
  var isInserted = false;                                                                   // 142
                                                                                            // 143
                                                                                            // 144
  // Iterate through list while not empty and item is not inserted                          // 145
  while (typeof current !== 'undefined' && !isInserted) {                                   // 146
                                                                                            // 147
    // Sort the list by using the sort function                                             // 148
    if (self.sort(newItem, current)) {                                                      // 149
                                                                                            // 150
      // Insert self.lookup[key] before                                                     // 151
      if (typeof current.prev === 'undefined') { self.first = newItem; }                    // 152
                                                                                            // 153
      // Set the references in the inserted object                                          // 154
      newItem.prev = current.prev;                                                          // 155
      newItem.next = current;                                                               // 156
                                                                                            // 157
      // Update the two existing objects                                                    // 158
      if (current.prev) { current.prev.next = newItem; }                                    // 159
      current.prev = newItem;                                                               // 160
                                                                                            // 161
      // Mark the item as inserted - job's done                                             // 162
      isInserted = true;                                                                    // 163
    }                                                                                       // 164
    // Goto next object                                                                     // 165
    current = current.next;                                                                 // 166
  }                                                                                         // 167
                                                                                            // 168
                                                                                            // 169
  if (!isInserted) {                                                                        // 170
    // We append it to the list                                                             // 171
    newItem.prev = self.last;                                                               // 172
    if (self.last) { self.last.next = newItem; }                                            // 173
                                                                                            // 174
    // Update the last pointing to newItem                                                  // 175
    self.last = newItem;                                                                    // 176
    // Update first if we are appending to an empty list                                    // 177
    if (self._length === 0) { self.first = newItem; }                                       // 178
  }                                                                                         // 179
                                                                                            // 180
                                                                                            // 181
  // Reference the object for a quick lookup option                                         // 182
  self.lookup[key] = newItem;                                                               // 183
  // Increase length                                                                        // 184
  self._length++;                                                                           // 185
  self._lengthDeps.changed();                                                               // 186
  // And invalidate the list                                                                // 187
  self._listDeps.changed();                                                                 // 188
};                                                                                          // 189
                                                                                            // 190
/** @method ReactiveList.prototype.remove                                                   // 191
  * @param {string|number} key Key to remove                                                // 192
  */                                                                                        // 193
ReactiveList.prototype.remove = function(key) {                                             // 194
  var self = this;                                                                          // 195
  // Get the item object                                                                    // 196
  var item = self.lookup[key];                                                              // 197
                                                                                            // 198
  // Check that it exists                                                                   // 199
  if (typeof item === 'undefined') {                                                        // 200
    return;                                                                                 // 201
    // throw new Error('ReactiveList cannot remove item, unknow key "' + key +              // 202
    //        '"');                                                                         // 203
  }                                                                                         // 204
                                                                                            // 205
  // Rig the references                                                                     // 206
  var prevItem = item.prev;                                                                 // 207
  var nextItem = item.next;                                                                 // 208
                                                                                            // 209
  // Update chain prev object next reference                                                // 210
  if (typeof prevItem !== 'undefined') {                                                    // 211
    prevItem.next = nextItem;                                                               // 212
  } else {                                                                                  // 213
    self.first = nextItem;                                                                  // 214
  }                                                                                         // 215
                                                                                            // 216
  // Update chain next object prev reference                                                // 217
  if (typeof nextItem !== 'undefined') {                                                    // 218
    nextItem.prev = prevItem;                                                               // 219
  } else {                                                                                  // 220
    self.last = prevItem;                                                                   // 221
  }                                                                                         // 222
                                                                                            // 223
  // Clean up                                                                               // 224
  self.lookup[key].last = null;                                                             // 225
  self.lookup[key].prev = null;                                                             // 226
  self.lookup[key] = null;                                                                  // 227
  prevItem = null;                                                                          // 228
                                                                                            // 229
  delete self.lookup[key];                                                                  // 230
  // Decrease the length                                                                    // 231
  self._length--;                                                                           // 232
  self._lengthDeps.changed();                                                               // 233
  // Invalidate the list                                                                    // 234
  self._listDeps.changed();                                                                 // 235
};                                                                                          // 236
                                                                                            // 237
/** @method ReactiveList.prototype.getLastItem                                              // 238
  * @returns {any} Pops last item from the list - removes the item from the list            // 239
  */                                                                                        // 240
ReactiveList.prototype.getLastItem = function(first) {                                      // 241
  var self = this;                                                                          // 242
                                                                                            // 243
  // Get the relevant item first or last                                                    // 244
  var item = (first)?self.first: self.last;                                                 // 245
                                                                                            // 246
  if (typeof item === 'undefined') {                                                        // 247
    return; // Empty list                                                                   // 248
  }                                                                                         // 249
  // Remove the item from the list                                                          // 250
  self.remove(item.key);                                                                    // 251
  // Return the value                                                                       // 252
  return item.value;                                                                        // 253
};                                                                                          // 254
                                                                                            // 255
/** @method ReactiveList.prototype.getFirstItem                                             // 256
  * @returns {any} Pops first item from the list - removes the item from the list           // 257
  */                                                                                        // 258
ReactiveList.prototype.getFirstItem = function() {                                          // 259
  // This gets the first item...                                                            // 260
  return this.getLastItem(true);                                                            // 261
};                                                                                          // 262
                                                                                            // 263
/** @method ReactiveList.prototype.forEach                                                  // 264
  * @param {function} f Callback `funciton(value, key)`                                     // 265
  * @param {boolean} [noneReactive=false] Set true if want to disable reactivity            // 266
  * @param {boolean} [reverse=false] Set true to reverse iteration `forEachReverse`         // 267
  */                                                                                        // 268
ReactiveList.prototype.forEach = function(f, noneReactive, reverse) {                       // 269
  var self = this;                                                                          // 270
  // Check if f is a function                                                               // 271
  if (typeof f !== 'function') {                                                            // 272
    throw new Error('ReactiveList forEach requires a function');                            // 273
  }                                                                                         // 274
  // We allow this not to be reactive                                                       // 275
  if (!noneReactive) { self._listDeps.depend(); }                                           // 276
  // Set current to the first object                                                        // 277
  var current = (reverse)?self.last: self.first;                                            // 278
  // Iterate over the list while its not empty                                              // 279
  while (current) {                                                                         // 280
    // Call the callback function                                                           // 281
    f(current.value, current.key);                                                          // 282
    // Jump to the next item in the list                                                    // 283
    current = (reverse)?current.prev: current.next;                                         // 284
  }                                                                                         // 285
};                                                                                          // 286
                                                                                            // 287
/** @method ReactiveList.prototype.forEachReverse                                           // 288
  * @param {function} f Callback `funciton(value, key)`                                     // 289
  * @param {boolean} [noneReactive=false] Set true if want to disable reactivity            // 290
  */                                                                                        // 291
ReactiveList.prototype.forEachReverse = function(f, noneReactive) {                         // 292
  // Call forEach with the reverse flag                                                     // 293
  this.forEach(f, noneReactive, true);                                                      // 294
};                                                                                          // 295
                                                                                            // 296
/** @method ReactiveList.prototype.fetch Returns list as array                              // 297
  * @param {boolean} [noneReactive=false] Set true if want to disable reactivity            // 298
  * @reactive This can be disabled                                                          // 299
  * @returns {array} List of items                                                          // 300
  */                                                                                        // 301
ReactiveList.prototype.fetch = function(noneReactive) {                                     // 302
  var self = this;                                                                          // 303
  // Init the result buffer                                                                 // 304
  var result = [];                                                                          // 305
  // Iterate over the list items                                                            // 306
  self.forEach(function fetchCallback(value) {                                              // 307
    // Add the item value to the result                                                     // 308
    result.push(value);                                                                     // 309
  }, noneReactive);                                                                         // 310
  // Return the result                                                                      // 311
  return result;                                                                            // 312
};                                                                                          // 313
                                                                                            // 314
//////////////////////////////////////////////////////////////////////////////////////////////     // 323
                                                                                                   // 324
}).call(this);                                                                                     // 325
                                                                                                   // 326
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:reactive-list'] = {
  ReactiveList: ReactiveList
};

})();

//# sourceMappingURL=cfs_reactive-list.js.map
