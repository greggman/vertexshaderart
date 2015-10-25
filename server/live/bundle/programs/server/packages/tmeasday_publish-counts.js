(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Counts, publishCount;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/tmeasday_publish-counts/packages/tmeasday_publish-counts.js                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
(function () {                                                                                                        // 1
                                                                                                                      // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/tmeasday:publish-counts/server/publish-counts.js                                                       //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var noWarnings = false;                                                                                            // 1
                                                                                                                   // 2
Counts = {};                                                                                                       // 3
Counts.publish = function(self, name, cursor, options) {                                                           // 4
  var initializing = true;                                                                                         // 5
  var handle;                                                                                                      // 6
  options = options || {};                                                                                         // 7
                                                                                                                   // 8
  var extraField, countFn;                                                                                         // 9
                                                                                                                   // 10
  if (options.countFromField) {                                                                                    // 11
    extraField = options.countFromField;                                                                           // 12
    if ('function' === typeof extraField) {                                                                        // 13
      countFn = Counts._safeAccessorFunction(extraField);                                                          // 14
    } else {                                                                                                       // 15
      countFn = function(doc) {                                                                                    // 16
        return doc[extraField] || 0;    // return 0 instead of undefined.                                          // 17
      }                                                                                                            // 18
    }                                                                                                              // 19
  } else if (options.countFromFieldLength) {                                                                       // 20
    extraField = options.countFromFieldLength;                                                                     // 21
    if ('function' === typeof extraField) {                                                                        // 22
      countFn = Counts._safeAccessorFunction(function (doc) {                                                      // 23
        return extraField(doc).length;                                                                             // 24
      });                                                                                                          // 25
    } else {                                                                                                       // 26
      countFn = function(doc) {                                                                                    // 27
        if (doc[extraField]) {                                                                                     // 28
          return doc[extraField].length;                                                                           // 29
        } else {                                                                                                   // 30
          return 0;                                                                                                // 31
        }                                                                                                          // 32
      }                                                                                                            // 33
    }                                                                                                              // 34
  }                                                                                                                // 35
                                                                                                                   // 36
                                                                                                                   // 37
  if (countFn && options.nonReactive)                                                                              // 38
    throw new Error("options.nonReactive is not yet supported with options.countFromFieldLength or options.countFromFieldSum");
                                                                                                                   // 40
  if (cursor && cursor._cursorDescription) {                                                                       // 41
    cursor._cursorDescription.options.fields =                                                                     // 42
      Counts._optimizeQueryFields(cursor._cursorDescription.options.fields, extraField, options.noWarnings);       // 43
  }                                                                                                                // 44
                                                                                                                   // 45
  var count = 0;                                                                                                   // 46
  var observers = {                                                                                                // 47
    added: function(doc) {                                                                                         // 48
      if (countFn) {                                                                                               // 49
        count += countFn(doc);                                                                                     // 50
      } else {                                                                                                     // 51
        count += 1;                                                                                                // 52
      }                                                                                                            // 53
                                                                                                                   // 54
      if (!initializing)                                                                                           // 55
        self.changed('counts', name, {count: count});                                                              // 56
    },                                                                                                             // 57
    removed: function(doc) {                                                                                       // 58
      if (countFn) {                                                                                               // 59
        count -= countFn(doc);                                                                                     // 60
      } else {                                                                                                     // 61
        count -= 1;                                                                                                // 62
      }                                                                                                            // 63
      self.changed('counts', name, {count: count});                                                                // 64
    }                                                                                                              // 65
  };                                                                                                               // 66
                                                                                                                   // 67
  if (countFn) {                                                                                                   // 68
    observers.changed = function(newDoc, oldDoc) {                                                                 // 69
      if (countFn) {                                                                                               // 70
        count += countFn(newDoc) - countFn(oldDoc);                                                                // 71
      }                                                                                                            // 72
                                                                                                                   // 73
      self.changed('counts', name, {count: count});                                                                // 74
    };                                                                                                             // 75
  }                                                                                                                // 76
                                                                                                                   // 77
  if (!countFn) {                                                                                                  // 78
    self.added('counts', name, {count: cursor.count()});                                                           // 79
    if (!options.noReady)                                                                                          // 80
      self.ready();                                                                                                // 81
  }                                                                                                                // 82
                                                                                                                   // 83
  if (!options.nonReactive)                                                                                        // 84
    handle = cursor.observe(observers);                                                                            // 85
                                                                                                                   // 86
  if (countFn)                                                                                                     // 87
    self.added('counts', name, {count: count});                                                                    // 88
                                                                                                                   // 89
  if (!options.noReady)                                                                                            // 90
    self.ready();                                                                                                  // 91
                                                                                                                   // 92
  initializing = false;                                                                                            // 93
                                                                                                                   // 94
  self.onStop(function() {                                                                                         // 95
    if (handle)                                                                                                    // 96
      handle.stop();                                                                                               // 97
  });                                                                                                              // 98
                                                                                                                   // 99
  return {                                                                                                         // 100
    stop: function() {                                                                                             // 101
      if (handle) {                                                                                                // 102
        handle.stop();                                                                                             // 103
        handle = undefined;                                                                                        // 104
      }                                                                                                            // 105
    }                                                                                                              // 106
  };                                                                                                               // 107
};                                                                                                                 // 108
// back compatibility                                                                                              // 109
publishCount = Counts.publish;                                                                                     // 110
                                                                                                                   // 111
Counts.noWarnings = function (noWarn) {                                                                            // 112
  // suppress warnings if no arguments, or first argument is truthy                                                // 113
  noWarnings = (0 == arguments.length || !!noWarn);                                                                // 114
}                                                                                                                  // 115
                                                                                                                   // 116
Counts._safeAccessorFunction = function safeAccessorFunction (fn) {                                                // 117
  // ensure that missing fields don't corrupt the count.  If the count field                                       // 118
  // doesn't exist, then it has a zero count.                                                                      // 119
  return function (doc) {                                                                                          // 120
    try {                                                                                                          // 121
      return fn(doc) || 0;    // return 0 instead of undefined                                                     // 122
    }                                                                                                              // 123
    catch (err) {                                                                                                  // 124
      if (err instanceof TypeError) {   // attempted to access property of undefined (i.e. deep access).           // 125
        return 0;                                                                                                  // 126
      } else {                                                                                                     // 127
        throw err;                                                                                                 // 128
      }                                                                                                            // 129
    }                                                                                                              // 130
  };                                                                                                               // 131
}                                                                                                                  // 132
                                                                                                                   // 133
Counts._optimizeQueryFields = function optimizeQueryFields (fields, extraField, noWarn) {                          // 134
  switch (typeof extraField) {                                                                                     // 135
    case 'function':      // accessor function used.                                                               // 136
      if (undefined === fields) {                                                                                  // 137
        // user did not place restrictions on cursor fields.                                                       // 138
        Counts._warn(noWarn,                                                                                       // 139
                      'publish-counts: Collection cursor has no field limits and will fetch entire documents.  ' + // 140
                      'consider specifying only required fields.');                                                // 141
        // if cursor field limits are empty to begin with, leave them empty.  it is the                            // 142
        // user's responsibility to specify field limits when using accessor functions.                            // 143
      }                                                                                                            // 144
      // else user specified restrictions on cursor fields.  Meteor will ensure _id is one of them.                // 145
      // WARNING: unable to verify user included appropriate field for accessor function to work.  we can't hold their hand ;_;
                                                                                                                   // 147
      return fields;                                                                                               // 148
                                                                                                                   // 149
    case 'string':        // countFromField or countFromFieldLength has property name.                             // 150
      // extra field is a property                                                                                 // 151
                                                                                                                   // 152
      // automatically set limits if none specified.  keep existing limits since user                              // 153
      // may use a cursor transform and specify a dynamic field to count, but require other                        // 154
      // fields in the transform process  (e.g. https://github.com/percolatestudio/publish-counts/issues/47).      // 155
      fields = fields || {};                                                                                       // 156
      // _id and extraField are required                                                                           // 157
      fields._id = true;                                                                                           // 158
      fields[extraField] = true;                                                                                   // 159
                                                                                                                   // 160
      if (2 < _.keys(fields).length)                                                                               // 161
        Counts._warn(noWarn,                                                                                       // 162
                      'publish-counts: unused fields detected in cursor fields option',                            // 163
                      _.omit(fields, ['_id', extraField]));                                                        // 164
                                                                                                                   // 165
      // use modified field limits.  automatically defaults to _id and extraField if none specified by user.       // 166
      return fields;                                                                                               // 167
                                                                                                                   // 168
    case 'undefined':     // basic count                                                                           // 169
      if (fields && 0 < _.keys(_.omit(fields, ['_id'])).length)                                                    // 170
        Counts._warn(noWarn,                                                                                       // 171
                      'publish-counts: unused fields removed from cursor fields option.',                          // 172
                      _.omit(fields, ['_id']));                                                                    // 173
                                                                                                                   // 174
      // dispose of user field limits, only _id is required                                                        // 175
      fields = { _id:  true };                                                                                     // 176
                                                                                                                   // 177
      // use modified field limits.  automatically defaults to _id if none specified by user.                      // 178
      return fields;                                                                                               // 179
                                                                                                                   // 180
    default:                                                                                                       // 181
      throw new Error("unknown invocation of Count.publish() detected.");                                          // 182
  }                                                                                                                // 183
}                                                                                                                  // 184
                                                                                                                   // 185
Counts._warn = function warn (noWarn) {                                                                            // 186
  if (noWarnings || noWarn || 'production' == process.env.NODE_ENV)                                                // 187
    return;                                                                                                        // 188
                                                                                                                   // 189
  var args = Array.prototype.slice.call(arguments, 1);                                                             // 190
  console.warn.apply(console, args);                                                                               // 191
}                                                                                                                  // 192
                                                                                                                   // 193
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      // 203
}).call(this);                                                                                                        // 204
                                                                                                                      // 205
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['tmeasday:publish-counts'] = {
  Counts: Counts,
  publishCount: publishCount
};

})();

//# sourceMappingURL=tmeasday_publish-counts.js.map
