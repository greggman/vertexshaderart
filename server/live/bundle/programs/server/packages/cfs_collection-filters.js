(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var FS = Package['cfs:base-package'].FS;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/cfs_collection-filters/packages/cfs_collection-filters.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
(function () {                                                                                                         // 1
                                                                                                                       // 2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/cfs:collection-filters/filters.js                                                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
/**                                                                                                                 // 1
 * @method FS.Collection.prototype.filters                                                                          // 2
 * @public                                                                                                          // 3
 * @param {Object} filters - File filters for this collection.                                                      // 4
 * @returns {undefined}                                                                                             // 5
 */                                                                                                                 // 6
FS.Collection.prototype.filters = function fsColFilters(filters) {                                                  // 7
  var self = this;                                                                                                  // 8
                                                                                                                    // 9
  // Check filter option values and normalize them for quicker checking later                                       // 10
  if (filters) {                                                                                                    // 11
    // check/adjust allow/deny                                                                                      // 12
    FS.Utility.each(['allow', 'deny'], function (type) {                                                            // 13
      if (!filters[type]) {                                                                                         // 14
        filters[type] = {};                                                                                         // 15
      } else if (typeof filters[type] !== "object") {                                                               // 16
        throw new Error(type + ' filter must be an object');                                                        // 17
      }                                                                                                             // 18
    });                                                                                                             // 19
                                                                                                                    // 20
    // check/adjust maxSize                                                                                         // 21
    if (typeof filters.maxSize === "undefined") {                                                                   // 22
      filters.maxSize = null;                                                                                       // 23
    } else if (filters.maxSize && typeof filters.maxSize !== "number") {                                            // 24
      throw new Error('maxSize filter must be an number');                                                          // 25
    }                                                                                                               // 26
                                                                                                                    // 27
    // check/adjust extensions                                                                                      // 28
    FS.Utility.each(['allow', 'deny'], function (type) {                                                            // 29
      if (!filters[type].extensions) {                                                                              // 30
        filters[type].extensions = [];                                                                              // 31
      } else if (!FS.Utility.isArray(filters[type].extensions)) {                                                   // 32
        throw new Error(type + '.extensions filter must be an array of extensions');                                // 33
      } else {                                                                                                      // 34
        //convert all to lowercase                                                                                  // 35
        for (var i = 0, ln = filters[type].extensions.length; i < ln; i++) {                                        // 36
          filters[type].extensions[i] = filters[type].extensions[i].toLowerCase();                                  // 37
        }                                                                                                           // 38
      }                                                                                                             // 39
    });                                                                                                             // 40
                                                                                                                    // 41
    // check/adjust content types                                                                                   // 42
    FS.Utility.each(['allow', 'deny'], function (type) {                                                            // 43
      if (!filters[type].contentTypes) {                                                                            // 44
        filters[type].contentTypes = [];                                                                            // 45
      } else if (!FS.Utility.isArray(filters[type].contentTypes)) {                                                 // 46
        throw new Error(type + '.contentTypes filter must be an array of content types');                           // 47
      }                                                                                                             // 48
    });                                                                                                             // 49
                                                                                                                    // 50
    self.options.filter = filters;                                                                                  // 51
  }                                                                                                                 // 52
                                                                                                                    // 53
  // Define deny functions to enforce file filters on the server                                                    // 54
  // for inserts and updates that initiate from untrusted code.                                                     // 55
  self.files.deny({                                                                                                 // 56
    insert: function(userId, fsFile) {                                                                              // 57
      return !self.allowsFile(fsFile);                                                                              // 58
    },                                                                                                              // 59
    update: function(userId, fsFile, fields, modifier) {                                                            // 60
      // TODO will need some kind of additional security here:                                                      // 61
      // Don't allow them to change the type, size, name, and                                                       // 62
      // anything else that would be security or data integrity issue.                                              // 63
      // Such security should probably be added by cfs-collection package, not here.                                // 64
      return !self.allowsFile(fsFile);                                                                              // 65
    },                                                                                                              // 66
    fetch: []                                                                                                       // 67
  });                                                                                                               // 68
                                                                                                                    // 69
  // If insecure package is in use, we need to add allow rules that return                                          // 70
  // true. Otherwise, it would seemingly turn off insecure mode.                                                    // 71
  if (Package && Package.insecure) {                                                                                // 72
    self.allow({                                                                                                    // 73
      insert: function() {                                                                                          // 74
        return true;                                                                                                // 75
      },                                                                                                            // 76
      update: function() {                                                                                          // 77
        return true;                                                                                                // 78
      },                                                                                                            // 79
      remove: function() {                                                                                          // 80
        return true;                                                                                                // 81
      },                                                                                                            // 82
      download: function() {                                                                                        // 83
        return true;                                                                                                // 84
      },                                                                                                            // 85
      fetch: [],                                                                                                    // 86
      transform: null                                                                                               // 87
    });                                                                                                             // 88
  }                                                                                                                 // 89
  // If insecure package is NOT in use, then adding the deny function                                               // 90
  // does not have any effect on the main app's security paradigm. The                                              // 91
  // user will still be required to add at least one allow function of her                                          // 92
  // own for each operation for this collection. And the user may still add                                         // 93
  // additional deny functions, but does not have to.                                                               // 94
};                                                                                                                  // 95
                                                                                                                    // 96
/**                                                                                                                 // 97
 * @method FS.Collection.prototype.allowsFile Does the collection allow the specified file?                         // 98
 * @public                                                                                                          // 99
 * @returns {boolean} True if the collection allows this file.                                                      // 100
 *                                                                                                                  // 101
 * Checks based on any filters defined on the collection. If the                                                    // 102
 * file is not valid according to the filters, this method returns false                                            // 103
 * and also calls the filter `onInvalid` method defined for the                                                     // 104
 * collection, passing it an English error string that explains why it                                              // 105
 * failed.                                                                                                          // 106
 */                                                                                                                 // 107
FS.Collection.prototype.allowsFile = function fsColAllowsFile(fileObj) {                                            // 108
  var self = this;                                                                                                  // 109
                                                                                                                    // 110
  // Get filters                                                                                                    // 111
  var filter = self.options.filter;                                                                                 // 112
  if (!filter) {                                                                                                    // 113
    return true;                                                                                                    // 114
  }                                                                                                                 // 115
  var saveAllFileExtensions = (filter.allow.extensions.length === 0);                                               // 116
  var saveAllContentTypes = (filter.allow.contentTypes.length === 0);                                               // 117
                                                                                                                    // 118
  // Get info about the file                                                                                        // 119
  var filename = fileObj.name();                                                                                    // 120
  var contentType = fileObj.type();                                                                                 // 121
  if (!saveAllContentTypes && !contentType) {                                                                       // 122
    filter.onInvalid && filter.onInvalid(filename + " has an unknown content type");                                // 123
    return false;                                                                                                   // 124
  }                                                                                                                 // 125
  var fileSize = fileObj.size();                                                                                    // 126
  if (!fileSize || isNaN(fileSize)) {                                                                               // 127
    filter.onInvalid && filter.onInvalid(filename + " has an unknown file size");                                   // 128
    return false;                                                                                                   // 129
  }                                                                                                                 // 130
                                                                                                                    // 131
  // Do extension checks only if we have a filename                                                                 // 132
  if (filename) {                                                                                                   // 133
    var ext = fileObj.getExtension();                                                                               // 134
    if (!((saveAllFileExtensions ||                                                                                 // 135
            FS.Utility.indexOf(filter.allow.extensions, ext) !== -1) &&                                             // 136
            FS.Utility.indexOf(filter.deny.extensions, ext) === -1)) {                                              // 137
      filter.onInvalid && filter.onInvalid(filename + ' has the extension "' + ext + '", which is not allowed');    // 138
      return false;                                                                                                 // 139
    }                                                                                                               // 140
  }                                                                                                                 // 141
                                                                                                                    // 142
  // Do content type checks                                                                                         // 143
  if (!((saveAllContentTypes ||                                                                                     // 144
          contentTypeInList(filter.allow.contentTypes, contentType)) &&                                             // 145
          !contentTypeInList(filter.deny.contentTypes, contentType))) {                                             // 146
    filter.onInvalid && filter.onInvalid(filename + ' is of the type "' + contentType + '", which is not allowed'); // 147
    return false;                                                                                                   // 148
  }                                                                                                                 // 149
                                                                                                                    // 150
  // Do max size check                                                                                              // 151
  if (typeof filter.maxSize === "number" && fileSize > filter.maxSize) {                                            // 152
    filter.onInvalid && filter.onInvalid(filename + " is too big");                                                 // 153
    return false;                                                                                                   // 154
  }                                                                                                                 // 155
  return true;                                                                                                      // 156
};                                                                                                                  // 157
                                                                                                                    // 158
/**                                                                                                                 // 159
 * @method contentTypeInList Is the content type string in the list?                                                // 160
 * @private                                                                                                         // 161
 * @param {String[]} list - Array of content types                                                                  // 162
 * @param {String} contentType - The content type                                                                   // 163
 * @returns {Boolean}                                                                                               // 164
 *                                                                                                                  // 165
 * Returns true if the content type is in the list, or if it matches                                                // 166
 * one of the special types in the list, e.g., "image/*".                                                           // 167
 */                                                                                                                 // 168
function contentTypeInList(list, contentType) {                                                                     // 169
  var listType, found = false;                                                                                      // 170
  for (var i = 0, ln = list.length; i < ln; i++) {                                                                  // 171
    listType = list[i];                                                                                             // 172
    if (listType === contentType) {                                                                                 // 173
      found = true;                                                                                                 // 174
      break;                                                                                                        // 175
    }                                                                                                               // 176
    if (listType === "image/*" && contentType.indexOf("image/") === 0) {                                            // 177
      found = true;                                                                                                 // 178
      break;                                                                                                        // 179
    }                                                                                                               // 180
    if (listType === "audio/*" && contentType.indexOf("audio/") === 0) {                                            // 181
      found = true;                                                                                                 // 182
      break;                                                                                                        // 183
    }                                                                                                               // 184
    if (listType === "video/*" && contentType.indexOf("video/") === 0) {                                            // 185
      found = true;                                                                                                 // 186
      break;                                                                                                        // 187
    }                                                                                                               // 188
  }                                                                                                                 // 189
  return found;                                                                                                     // 190
}                                                                                                                   // 191
                                                                                                                    // 192
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 202
}).call(this);                                                                                                         // 203
                                                                                                                       // 204
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:collection-filters'] = {};

})();

//# sourceMappingURL=cfs_collection-filters.js.map
