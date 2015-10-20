(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var MongoID = Package['mongo-id'].MongoID;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var _ = Package.underscore._;
var Random = Package.random.Random;

/* Package-scope variables */
var ObserveSequence, seqChangedToEmpty, seqChangedToArray, seqChangedToCursor;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/observe-sequence/packages/observe-sequence.js                               //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
(function(){                                                                            // 1
                                                                                        // 2
///////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                               //     // 4
// packages/observe-sequence/observe_sequence.js                                 //     // 5
//                                                                               //     // 6
///////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                 //     // 8
var warn = function () {                                                         // 1   // 9
  if (ObserveSequence._suppressWarnings) {                                       // 2   // 10
    ObserveSequence._suppressWarnings--;                                         // 3   // 11
  } else {                                                                       // 4   // 12
    if (typeof console !== 'undefined' && console.warn)                          // 5   // 13
      console.warn.apply(console, arguments);                                    // 6   // 14
                                                                                 // 7   // 15
    ObserveSequence._loggedWarnings++;                                           // 8   // 16
  }                                                                              // 9   // 17
};                                                                               // 10  // 18
                                                                                 // 11  // 19
var idStringify = MongoID.idStringify;                                           // 12  // 20
var idParse = MongoID.idParse;                                                   // 13  // 21
                                                                                 // 14  // 22
ObserveSequence = {                                                              // 15  // 23
  _suppressWarnings: 0,                                                          // 16  // 24
  _loggedWarnings: 0,                                                            // 17  // 25
                                                                                 // 18  // 26
  // A mechanism similar to cursor.observe which receives a reactive             // 19  // 27
  // function returning a sequence type and firing appropriate callbacks         // 20  // 28
  // when the value changes.                                                     // 21  // 29
  //                                                                             // 22  // 30
  // @param sequenceFunc {Function} a reactive function returning a              // 23  // 31
  //     sequence type. The currently supported sequence types are:              // 24  // 32
  //     Array, Cursor, and null.                                                // 25  // 33
  //                                                                             // 26  // 34
  // @param callbacks {Object} similar to a specific subset of                   // 27  // 35
  //     callbacks passed to `cursor.observe`                                    // 28  // 36
  //     (http://docs.meteor.com/#observe), with minor variations to             // 29  // 37
  //     support the fact that not all sequences contain objects with            // 30  // 38
  //     _id fields.  Specifically:                                              // 31  // 39
  //                                                                             // 32  // 40
  //     * addedAt(id, item, atIndex, beforeId)                                  // 33  // 41
  //     * changedAt(id, newItem, oldItem, atIndex)                              // 34  // 42
  //     * removedAt(id, oldItem, atIndex)                                       // 35  // 43
  //     * movedTo(id, item, fromIndex, toIndex, beforeId)                       // 36  // 44
  //                                                                             // 37  // 45
  // @returns {Object(stop: Function)} call 'stop' on the return value           // 38  // 46
  //     to stop observing this sequence function.                               // 39  // 47
  //                                                                             // 40  // 48
  // We don't make any assumptions about our ability to compare sequence         // 41  // 49
  // elements (ie, we don't assume EJSON.equals works; maybe there is extra      // 42  // 50
  // state/random methods on the objects) so unlike cursor.observe, we may       // 43  // 51
  // sometimes call changedAt() when nothing actually changed.                   // 44  // 52
  // XXX consider if we *can* make the stronger assumption and avoid             // 45  // 53
  //     no-op changedAt calls (in some cases?)                                  // 46  // 54
  //                                                                             // 47  // 55
  // XXX currently only supports the callbacks used by our                       // 48  // 56
  // implementation of {{#each}}, but this can be expanded.                      // 49  // 57
  //                                                                             // 50  // 58
  // XXX #each doesn't use the indices (though we'll eventually need             // 51  // 59
  // a way to get them when we support `@index`), but calling                    // 52  // 60
  // `cursor.observe` causes the index to be calculated on every                 // 53  // 61
  // callback using a linear scan (unless you turn it off by passing             // 54  // 62
  // `_no_indices`).  Any way to avoid calculating indices on a pure             // 55  // 63
  // cursor observe like we used to?                                             // 56  // 64
  observe: function (sequenceFunc, callbacks) {                                  // 57  // 65
    var lastSeq = null;                                                          // 58  // 66
    var activeObserveHandle = null;                                              // 59  // 67
                                                                                 // 60  // 68
    // 'lastSeqArray' contains the previous value of the sequence                // 61  // 69
    // we're observing. It is an array of objects with '_id' and                 // 62  // 70
    // 'item' fields.  'item' is the element in the array, or the                // 63  // 71
    // document in the cursor.                                                   // 64  // 72
    //                                                                           // 65  // 73
    // '_id' is whichever of the following is relevant, unless it has            // 66  // 74
    // already appeared -- in which case it's randomly generated.                // 67  // 75
    //                                                                           // 68  // 76
    // * if 'item' is an object:                                                 // 69  // 77
    //   * an '_id' field, if present                                            // 70  // 78
    //   * otherwise, the index in the array                                     // 71  // 79
    //                                                                           // 72  // 80
    // * if 'item' is a number or string, use that value                         // 73  // 81
    //                                                                           // 74  // 82
    // XXX this can be generalized by allowing {{#each}} to accept a             // 75  // 83
    // general 'key' argument which could be a function, a dotted                // 76  // 84
    // field name, or the special @index value.                                  // 77  // 85
    var lastSeqArray = []; // elements are objects of form {_id, item}           // 78  // 86
    var computation = Tracker.autorun(function () {                              // 79  // 87
      var seq = sequenceFunc();                                                  // 80  // 88
                                                                                 // 81  // 89
      Tracker.nonreactive(function () {                                          // 82  // 90
        var seqArray; // same structure as `lastSeqArray` above.                 // 83  // 91
                                                                                 // 84  // 92
        if (activeObserveHandle) {                                               // 85  // 93
          // If we were previously observing a cursor, replace lastSeqArray with        // 94
          // more up-to-date information.  Then stop the old observe.            // 87  // 95
          lastSeqArray = _.map(lastSeq.fetch(), function (doc) {                 // 88  // 96
            return {_id: doc._id, item: doc};                                    // 89  // 97
          });                                                                    // 90  // 98
          activeObserveHandle.stop();                                            // 91  // 99
          activeObserveHandle = null;                                            // 92  // 100
        }                                                                        // 93  // 101
                                                                                 // 94  // 102
        if (!seq) {                                                              // 95  // 103
          seqArray = seqChangedToEmpty(lastSeqArray, callbacks);                 // 96  // 104
        } else if (seq instanceof Array) {                                       // 97  // 105
          seqArray = seqChangedToArray(lastSeqArray, seq, callbacks);            // 98  // 106
        } else if (isStoreCursor(seq)) {                                         // 99  // 107
          var result /* [seqArray, activeObserveHandle] */ =                     // 100
                seqChangedToCursor(lastSeqArray, seq, callbacks);                // 101
          seqArray = result[0];                                                  // 102
          activeObserveHandle = result[1];                                       // 103
        } else {                                                                 // 104
          throw badSequenceError();                                              // 105
        }                                                                        // 106
                                                                                 // 107
        diffArray(lastSeqArray, seqArray, callbacks);                            // 108
        lastSeq = seq;                                                           // 109
        lastSeqArray = seqArray;                                                 // 110
      });                                                                        // 111
    });                                                                          // 112
                                                                                 // 113
    return {                                                                     // 114
      stop: function () {                                                        // 115
        computation.stop();                                                      // 116
        if (activeObserveHandle)                                                 // 117
          activeObserveHandle.stop();                                            // 118
      }                                                                          // 119
    };                                                                           // 120
  },                                                                             // 121
                                                                                 // 122
  // Fetch the items of `seq` into an array, where `seq` is of one of the        // 123
  // sequence types accepted by `observe`.  If `seq` is a cursor, a              // 124
  // dependency is established.                                                  // 125
  fetch: function (seq) {                                                        // 126
    if (!seq) {                                                                  // 127
      return [];                                                                 // 128
    } else if (seq instanceof Array) {                                           // 129
      return seq;                                                                // 130
    } else if (isStoreCursor(seq)) {                                             // 131
      return seq.fetch();                                                        // 132
    } else {                                                                     // 133
      throw badSequenceError();                                                  // 134
    }                                                                            // 135
  }                                                                              // 136
};                                                                               // 137
                                                                                 // 138
var badSequenceError = function () {                                             // 139
  return new Error("{{#each}} currently only accepts " +                         // 140
                   "arrays, cursors or falsey values.");                         // 141
};                                                                               // 142
                                                                                 // 143
var isStoreCursor = function (cursor) {                                          // 144
  return cursor && _.isObject(cursor) &&                                         // 145
    _.isFunction(cursor.observe) && _.isFunction(cursor.fetch);                  // 146
};                                                                               // 147
                                                                                 // 148
// Calculates the differences between `lastSeqArray` and                         // 149
// `seqArray` and calls appropriate functions from `callbacks`.                  // 150
// Reuses Minimongo's diff algorithm implementation.                             // 151
var diffArray = function (lastSeqArray, seqArray, callbacks) {                   // 152
  var diffFn = Package['diff-sequence'].DiffSequence.diffQueryOrderedChanges;    // 153
  var oldIdObjects = [];                                                         // 154
  var newIdObjects = [];                                                         // 155
  var posOld = {}; // maps from idStringify'd ids                                // 156
  var posNew = {}; // ditto                                                      // 157
  var posCur = {};                                                               // 158
  var lengthCur = lastSeqArray.length;                                           // 159
                                                                                 // 160
  _.each(seqArray, function (doc, i) {                                           // 161
    newIdObjects.push({_id: doc._id});                                           // 162
    posNew[idStringify(doc._id)] = i;                                            // 163
  });                                                                            // 164
  _.each(lastSeqArray, function (doc, i) {                                       // 165
    oldIdObjects.push({_id: doc._id});                                           // 166
    posOld[idStringify(doc._id)] = i;                                            // 167
    posCur[idStringify(doc._id)] = i;                                            // 168
  });                                                                            // 169
                                                                                 // 170
  // Arrays can contain arbitrary objects. We don't diff the                     // 171
  // objects. Instead we always fire 'changedAt' callback on every               // 172
  // object. The consumer of `observe-sequence` should deal with                 // 173
  // it appropriately.                                                           // 174
  diffFn(oldIdObjects, newIdObjects, {                                           // 175
    addedBefore: function (id, doc, before) {                                    // 176
      var position = before ? posCur[idStringify(before)] : lengthCur;           // 177
                                                                                 // 178
      if (before) {                                                              // 179
        // If not adding at the end, we need to update indexes.                  // 180
        // XXX this can still be improved greatly!                               // 181
        _.each(posCur, function (pos, id) {                                      // 182
          if (pos >= position)                                                   // 183
            posCur[id]++;                                                        // 184
        });                                                                      // 185
      }                                                                          // 186
                                                                                 // 187
      lengthCur++;                                                               // 188
      posCur[idStringify(id)] = position;                                        // 189
                                                                                 // 190
      callbacks.addedAt(                                                         // 191
        id,                                                                      // 192
        seqArray[posNew[idStringify(id)]].item,                                  // 193
        position,                                                                // 194
        before);                                                                 // 195
    },                                                                           // 196
    movedBefore: function (id, before) {                                         // 197
      if (id === before)                                                         // 198
        return;                                                                  // 199
                                                                                 // 200
      var oldPosition = posCur[idStringify(id)];                                 // 201
      var newPosition = before ? posCur[idStringify(before)] : lengthCur;        // 202
                                                                                 // 203
      // Moving the item forward. The new element is losing one position as it   // 204
      // was removed from the old position before being inserted at the new      // 205
      // position.                                                               // 206
      // Ex.:   0  *1*  2   3   4                                                // 207
      //        0   2   3  *1*  4                                                // 208
      // The original issued callback is "1" before "4".                         // 209
      // The position of "1" is 1, the position of "4" is 4.                     // 210
      // The generated move is (1) -> (3)                                        // 211
      if (newPosition > oldPosition) {                                           // 212
        newPosition--;                                                           // 213
      }                                                                          // 214
                                                                                 // 215
      // Fix up the positions of elements between the old and the new positions  // 216
      // of the moved element.                                                   // 217
      //                                                                         // 218
      // There are two cases:                                                    // 219
      //   1. The element is moved forward. Then all the positions in between    // 220
      //   are moved back.                                                       // 221
      //   2. The element is moved back. Then the positions in between *and* the        // 230
      //   element that is currently standing on the moved element's future      // 223
      //   position are moved forward.                                           // 224
      _.each(posCur, function (elCurPosition, id) {                              // 225
        if (oldPosition < elCurPosition && elCurPosition < newPosition)          // 226
          posCur[id]--;                                                          // 227
        else if (newPosition <= elCurPosition && elCurPosition < oldPosition)    // 228
          posCur[id]++;                                                          // 229
      });                                                                        // 230
                                                                                 // 231
      // Finally, update the position of the moved element.                      // 232
      posCur[idStringify(id)] = newPosition;                                     // 233
                                                                                 // 234
      callbacks.movedTo(                                                         // 235
        id,                                                                      // 236
        seqArray[posNew[idStringify(id)]].item,                                  // 237
        oldPosition,                                                             // 238
        newPosition,                                                             // 239
        before);                                                                 // 240
    },                                                                           // 241
    removed: function (id) {                                                     // 242
      var prevPosition = posCur[idStringify(id)];                                // 243
                                                                                 // 244
      _.each(posCur, function (pos, id) {                                        // 245
        if (pos >= prevPosition)                                                 // 246
          posCur[id]--;                                                          // 247
      });                                                                        // 248
                                                                                 // 249
      delete posCur[idStringify(id)];                                            // 250
      lengthCur--;                                                               // 251
                                                                                 // 252
      callbacks.removedAt(                                                       // 253
        id,                                                                      // 254
        lastSeqArray[posOld[idStringify(id)]].item,                              // 255
        prevPosition);                                                           // 256
    }                                                                            // 257
  });                                                                            // 258
                                                                                 // 259
  _.each(posNew, function (pos, idString) {                                      // 260
    var id = idParse(idString);                                                  // 261
    if (_.has(posOld, idString)) {                                               // 262
      // specifically for primitive types, compare equality before               // 263
      // firing the 'changedAt' callback. otherwise, always fire it              // 264
      // because doing a deep EJSON comparison is not guaranteed to              // 265
      // work (an array can contain arbitrary objects, and 'transform'           // 266
      // can be used on cursors). also, deep diffing is not                      // 267
      // necessarily the most efficient (if only a specific subfield             // 268
      // of the object is later accessed).                                       // 269
      var newItem = seqArray[pos].item;                                          // 270
      var oldItem = lastSeqArray[posOld[idString]].item;                         // 271
                                                                                 // 272
      if (typeof newItem === 'object' || newItem !== oldItem)                    // 273
          callbacks.changedAt(id, newItem, oldItem, pos);                        // 274
      }                                                                          // 275
  });                                                                            // 276
};                                                                               // 277
                                                                                 // 278
seqChangedToEmpty = function (lastSeqArray, callbacks) {                         // 279
  return [];                                                                     // 280
};                                                                               // 281
                                                                                 // 282
seqChangedToArray = function (lastSeqArray, array, callbacks) {                  // 283
  var idsUsed = {};                                                              // 284
  var seqArray = _.map(array, function (item, index) {                           // 285
    var id;                                                                      // 286
    if (typeof item === 'string') {                                              // 287
      // ensure not empty, since other layers (eg DomRange) assume this as well  // 288
      id = "-" + item;                                                           // 289
    } else if (typeof item === 'number' ||                                       // 290
               typeof item === 'boolean' ||                                      // 291
               item === undefined) {                                             // 292
      id = item;                                                                 // 293
    } else if (typeof item === 'object') {                                       // 294
      id = (item && _.has(item, '_id')) ? item._id : index;                      // 295
    } else {                                                                     // 296
      throw new Error("{{#each}} doesn't support arrays with " +                 // 297
                      "elements of type " + typeof item);                        // 298
    }                                                                            // 299
                                                                                 // 300
    var idString = idStringify(id);                                              // 301
    if (idsUsed[idString]) {                                                     // 302
      if (typeof item === 'object' && '_id' in item)                             // 303
        warn("duplicate id " + id + " in", array);                               // 304
      id = Random.id();                                                          // 305
    } else {                                                                     // 306
      idsUsed[idString] = true;                                                  // 307
    }                                                                            // 308
                                                                                 // 309
    return { _id: id, item: item };                                              // 310
  });                                                                            // 311
                                                                                 // 312
  return seqArray;                                                               // 313
};                                                                               // 314
                                                                                 // 315
seqChangedToCursor = function (lastSeqArray, cursor, callbacks) {                // 316
  var initial = true; // are we observing initial data from cursor?              // 317
  var seqArray = [];                                                             // 318
                                                                                 // 319
  var observeHandle = cursor.observe({                                           // 320
    addedAt: function (document, atIndex, before) {                              // 321
      if (initial) {                                                             // 322
        // keep track of initial data so that we can diff once                   // 323
        // we exit `observe`.                                                    // 324
        if (before !== null)                                                     // 325
          throw new Error("Expected initial data from observe in order");        // 326
        seqArray.push({ _id: document._id, item: document });                    // 327
      } else {                                                                   // 328
        callbacks.addedAt(document._id, document, atIndex, before);              // 329
      }                                                                          // 330
    },                                                                           // 331
    changedAt: function (newDocument, oldDocument, atIndex) {                    // 332
      callbacks.changedAt(newDocument._id, newDocument, oldDocument,             // 333
                          atIndex);                                              // 334
    },                                                                           // 335
    removedAt: function (oldDocument, atIndex) {                                 // 336
      callbacks.removedAt(oldDocument._id, oldDocument, atIndex);                // 337
    },                                                                           // 338
    movedTo: function (document, fromIndex, toIndex, before) {                   // 339
      callbacks.movedTo(                                                         // 340
        document._id, document, fromIndex, toIndex, before);                     // 341
    }                                                                            // 342
  });                                                                            // 343
  initial = false;                                                               // 344
                                                                                 // 345
  return [seqArray, observeHandle];                                              // 346
};                                                                               // 347
                                                                                 // 348
///////////////////////////////////////////////////////////////////////////////////     // 357
                                                                                        // 358
}).call(this);                                                                          // 359
                                                                                        // 360
//////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['observe-sequence'] = {
  ObserveSequence: ObserveSequence
};

})();

//# sourceMappingURL=observe-sequence.js.map
