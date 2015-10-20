(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var ReactiveDict;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// packages/reactive-dict/packages/reactive-dict.js                                    //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
(function(){                                                                           // 1
                                                                                       // 2
//////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                              //     // 4
// packages/reactive-dict/reactive-dict.js                                      //     // 5
//                                                                              //     // 6
//////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                //     // 8
// XXX come up with a serialization method which canonicalizes object key       // 1   // 9
// order, which would allow us to use objects as values for equals.             // 2   // 10
var stringify = function (value) {                                              // 3   // 11
  if (value === undefined)                                                      // 4   // 12
    return 'undefined';                                                         // 5   // 13
  return EJSON.stringify(value);                                                // 6   // 14
};                                                                              // 7   // 15
var parse = function (serialized) {                                             // 8   // 16
  if (serialized === undefined || serialized === 'undefined')                   // 9   // 17
    return undefined;                                                           // 10  // 18
  return EJSON.parse(serialized);                                               // 11  // 19
};                                                                              // 12  // 20
                                                                                // 13  // 21
var changed = function (v) {                                                    // 14  // 22
  v && v.changed();                                                             // 15  // 23
};                                                                              // 16  // 24
                                                                                // 17  // 25
// XXX COMPAT WITH 0.9.1 : accept migrationData instead of dictName             // 18  // 26
ReactiveDict = function (dictName) {                                            // 19  // 27
  // this.keys: key -> value                                                    // 20  // 28
  if (dictName) {                                                               // 21  // 29
    if (typeof dictName === 'string') {                                         // 22  // 30
      // the normal case, argument is a string name.                            // 23  // 31
      // _registerDictForMigrate will throw an error on duplicate name.         // 24  // 32
      ReactiveDict._registerDictForMigrate(dictName, this);                     // 25  // 33
      this.keys = ReactiveDict._loadMigratedDict(dictName) || {};               // 26  // 34
      this.name = dictName;                                                     // 27  // 35
    } else if (typeof dictName === 'object') {                                  // 28  // 36
      // back-compat case: dictName is actually migrationData                   // 29  // 37
      this.keys = dictName;                                                     // 30  // 38
    } else {                                                                    // 31  // 39
      throw new Error("Invalid ReactiveDict argument: " + dictName);            // 32  // 40
    }                                                                           // 33  // 41
  } else {                                                                      // 34  // 42
    // no name given; no migration will be performed                            // 35  // 43
    this.keys = {};                                                             // 36  // 44
  }                                                                             // 37  // 45
                                                                                // 38  // 46
  this.allDeps = new Tracker.Dependency;                                        // 39  // 47
  this.keyDeps = {}; // key -> Dependency                                       // 40  // 48
  this.keyValueDeps = {}; // key -> Dependency                                  // 41  // 49
};                                                                              // 42  // 50
                                                                                // 43  // 51
_.extend(ReactiveDict.prototype, {                                              // 44  // 52
  // set() began as a key/value method, but we are now overloading it           // 45  // 53
  // to take an object of key/value pairs, similar to backbone                  // 46  // 54
  // http://backbonejs.org/#Model-set                                           // 47  // 55
                                                                                // 48  // 56
  set: function (keyOrObject, value) {                                          // 49  // 57
    var self = this;                                                            // 50  // 58
                                                                                // 51  // 59
    if ((typeof keyOrObject === 'object') && (value === undefined)) {           // 52  // 60
      // Called as `dict.set({...})`                                            // 53  // 61
      self._setObject(keyOrObject);                                             // 54  // 62
      return;                                                                   // 55  // 63
    }                                                                           // 56  // 64
    // the input isn't an object, so it must be a key                           // 57  // 65
    // and we resume with the rest of the function                              // 58  // 66
    var key = keyOrObject;                                                      // 59  // 67
                                                                                // 60  // 68
    value = stringify(value);                                                   // 61  // 69
                                                                                // 62  // 70
    var keyExisted = _.has(self.keys, key);                                     // 63  // 71
    var oldSerializedValue = keyExisted ? self.keys[key] : 'undefined';         // 64  // 72
    var isNewValue = (value !== oldSerializedValue);                            // 65  // 73
                                                                                // 66  // 74
    self.keys[key] = value;                                                     // 67  // 75
                                                                                // 68  // 76
    if (isNewValue || !keyExisted) {                                            // 69  // 77
      self.allDeps.changed();                                                   // 70  // 78
    }                                                                           // 71  // 79
                                                                                // 72  // 80
    if (isNewValue) {                                                           // 73  // 81
      changed(self.keyDeps[key]);                                               // 74  // 82
      if (self.keyValueDeps[key]) {                                             // 75  // 83
        changed(self.keyValueDeps[key][oldSerializedValue]);                    // 76  // 84
        changed(self.keyValueDeps[key][value]);                                 // 77  // 85
      }                                                                         // 78  // 86
    }                                                                           // 79  // 87
  },                                                                            // 80  // 88
                                                                                // 81  // 89
  setDefault: function (key, value) {                                           // 82  // 90
    var self = this;                                                            // 83  // 91
    if (! _.has(self.keys, key)) {                                              // 84  // 92
      self.set(key, value);                                                     // 85  // 93
    }                                                                           // 86  // 94
  },                                                                            // 87  // 95
                                                                                // 88  // 96
  get: function (key) {                                                         // 89  // 97
    var self = this;                                                            // 90  // 98
    self._ensureKey(key);                                                       // 91  // 99
    self.keyDeps[key].depend();                                                 // 92  // 100
    return parse(self.keys[key]);                                               // 93  // 101
  },                                                                            // 94  // 102
                                                                                // 95  // 103
  equals: function (key, value) {                                               // 96  // 104
    var self = this;                                                            // 97  // 105
                                                                                // 98  // 106
    // Mongo.ObjectID is in the 'mongo' package                                 // 99  // 107
    var ObjectID = null;                                                        // 100
    if (Package.mongo) {                                                        // 101
      ObjectID = Package.mongo.Mongo.ObjectID;                                  // 102
    }                                                                           // 103
                                                                                // 104
    // We don't allow objects (or arrays that might include objects) for        // 105
    // .equals, because JSON.stringify doesn't canonicalize object key          // 106
    // order. (We can make equals have the right return value by parsing the    // 107
    // current value and using EJSON.equals, but we won't have a canonical      // 108
    // element of keyValueDeps[key] to store the dependency.) You can still use        // 117
    // "EJSON.equals(reactiveDict.get(key), value)".                            // 110
    //                                                                          // 111
    // XXX we could allow arrays as long as we recursively check that there     // 112
    // are no objects                                                           // 113
    if (typeof value !== 'string' &&                                            // 114
        typeof value !== 'number' &&                                            // 115
        typeof value !== 'boolean' &&                                           // 116
        typeof value !== 'undefined' &&                                         // 117
        !(value instanceof Date) &&                                             // 118
        !(ObjectID && value instanceof ObjectID) &&                             // 119
        value !== null) {                                                       // 120
      throw new Error("ReactiveDict.equals: value must be scalar");             // 121
    }                                                                           // 122
    var serializedValue = stringify(value);                                     // 123
                                                                                // 124
    if (Tracker.active) {                                                       // 125
      self._ensureKey(key);                                                     // 126
                                                                                // 127
      if (! _.has(self.keyValueDeps[key], serializedValue))                     // 128
        self.keyValueDeps[key][serializedValue] = new Tracker.Dependency;       // 129
                                                                                // 130
      var isNew = self.keyValueDeps[key][serializedValue].depend();             // 131
      if (isNew) {                                                              // 132
        Tracker.onInvalidate(function () {                                      // 133
          // clean up [key][serializedValue] if it's now empty, so we don't     // 134
          // use O(n) memory for n = values seen ever                           // 135
          if (! self.keyValueDeps[key][serializedValue].hasDependents())        // 136
            delete self.keyValueDeps[key][serializedValue];                     // 137
        });                                                                     // 138
      }                                                                         // 139
    }                                                                           // 140
                                                                                // 141
    var oldValue = undefined;                                                   // 142
    if (_.has(self.keys, key)) oldValue = parse(self.keys[key]);                // 143
    return EJSON.equals(oldValue, value);                                       // 144
  },                                                                            // 145
                                                                                // 146
  all: function() {                                                             // 147
    this.allDeps.depend();                                                      // 148
    var ret = {};                                                               // 149
    _.each(this.keys, function(value, key) {                                    // 150
      ret[key] = parse(value);                                                  // 151
    });                                                                         // 152
    return ret;                                                                 // 153
  },                                                                            // 154
                                                                                // 155
  clear: function() {                                                           // 156
    var self = this;                                                            // 157
                                                                                // 158
    var oldKeys = self.keys;                                                    // 159
    self.keys = {};                                                             // 160
                                                                                // 161
    self.allDeps.changed();                                                     // 162
                                                                                // 163
    _.each(oldKeys, function(value, key) {                                      // 164
      changed(self.keyDeps[key]);                                               // 165
      changed(self.keyValueDeps[key][value]);                                   // 166
      changed(self.keyValueDeps[key]['undefined']);                             // 167
    });                                                                         // 168
                                                                                // 169
  },                                                                            // 170
                                                                                // 171
  delete: function(key) {                                                       // 172
    var self = this;                                                            // 173
    var didRemove = false;                                                      // 174
                                                                                // 175
    if (_.has(self.keys, key)) {                                                // 176
      var oldValue = self.keys[key];                                            // 177
      delete self.keys[key];                                                    // 178
      changed(self.keyDeps[key]);                                               // 179
      if (self.keyValueDeps[key]) {                                             // 180
        changed(self.keyValueDeps[key][oldValue]);                              // 181
        changed(self.keyValueDeps[key]['undefined']);                           // 182
      }                                                                         // 183
      self.allDeps.changed();                                                   // 184
      didRemove = true;                                                         // 185
    }                                                                           // 186
                                                                                // 187
    return didRemove;                                                           // 188
  },                                                                            // 189
                                                                                // 190
  _setObject: function (object) {                                               // 191
    var self = this;                                                            // 192
                                                                                // 193
    _.each(object, function (value, key){                                       // 194
      self.set(key, value);                                                     // 195
    });                                                                         // 196
  },                                                                            // 197
                                                                                // 198
  _ensureKey: function (key) {                                                  // 199
    var self = this;                                                            // 200
    if (!(key in self.keyDeps)) {                                               // 201
      self.keyDeps[key] = new Tracker.Dependency;                               // 202
      self.keyValueDeps[key] = {};                                              // 203
    }                                                                           // 204
  },                                                                            // 205
                                                                                // 206
  // Get a JSON value that can be passed to the constructor to                  // 207
  // create a new ReactiveDict with the same contents as this one               // 208
  _getMigrationData: function () {                                              // 209
    // XXX sanitize and make sure it's JSONible?                                // 210
    return this.keys;                                                           // 211
  }                                                                             // 212
});                                                                             // 213
                                                                                // 214
//////////////////////////////////////////////////////////////////////////////////     // 223
                                                                                       // 224
}).call(this);                                                                         // 225
                                                                                       // 226
                                                                                       // 227
                                                                                       // 228
                                                                                       // 229
                                                                                       // 230
                                                                                       // 231
(function(){                                                                           // 232
                                                                                       // 233
//////////////////////////////////////////////////////////////////////////////////     // 234
//                                                                              //     // 235
// packages/reactive-dict/migration.js                                          //     // 236
//                                                                              //     // 237
//////////////////////////////////////////////////////////////////////////////////     // 238
                                                                                //     // 239
ReactiveDict._migratedDictData = {}; // name -> data                            // 1   // 240
ReactiveDict._dictsToMigrate = {}; // name -> ReactiveDict                      // 2   // 241
                                                                                // 3   // 242
ReactiveDict._loadMigratedDict = function (dictName) {                          // 4   // 243
  if (_.has(ReactiveDict._migratedDictData, dictName))                          // 5   // 244
    return ReactiveDict._migratedDictData[dictName];                            // 6   // 245
                                                                                // 7   // 246
  return null;                                                                  // 8   // 247
};                                                                              // 9   // 248
                                                                                // 10  // 249
ReactiveDict._registerDictForMigrate = function (dictName, dict) {              // 11  // 250
  if (_.has(ReactiveDict._dictsToMigrate, dictName))                            // 12  // 251
    throw new Error("Duplicate ReactiveDict name: " + dictName);                // 13  // 252
                                                                                // 14  // 253
  ReactiveDict._dictsToMigrate[dictName] = dict;                                // 15  // 254
};                                                                              // 16  // 255
                                                                                // 17  // 256
if (Meteor.isClient && Package.reload) {                                        // 18  // 257
  // Put old migrated data into ReactiveDict._migratedDictData,                 // 19  // 258
  // where it can be accessed by ReactiveDict._loadMigratedDict.                // 20  // 259
  var migrationData = Package.reload.Reload._migrationData('reactive-dict');    // 21  // 260
  if (migrationData && migrationData.dicts)                                     // 22  // 261
    ReactiveDict._migratedDictData = migrationData.dicts;                       // 23  // 262
                                                                                // 24  // 263
  // On migration, assemble the data from all the dicts that have been          // 25  // 264
  // registered.                                                                // 26  // 265
  Package.reload.Reload._onMigrate('reactive-dict', function () {               // 27  // 266
    var dictsToMigrate = ReactiveDict._dictsToMigrate;                          // 28  // 267
    var dataToMigrate = {};                                                     // 29  // 268
                                                                                // 30  // 269
    for (var dictName in dictsToMigrate)                                        // 31  // 270
      dataToMigrate[dictName] = dictsToMigrate[dictName]._getMigrationData();   // 32  // 271
                                                                                // 33  // 272
    return [true, {dicts: dataToMigrate}];                                      // 34  // 273
  });                                                                           // 35  // 274
}                                                                               // 36  // 275
                                                                                // 37  // 276
//////////////////////////////////////////////////////////////////////////////////     // 277
                                                                                       // 278
}).call(this);                                                                         // 279
                                                                                       // 280
/////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['reactive-dict'] = {
  ReactiveDict: ReactiveDict
};

})();

//# sourceMappingURL=reactive-dict.js.map
