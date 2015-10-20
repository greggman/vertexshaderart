(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;

/* Package-scope variables */
var _noopCallback, _nonReactive, ReactiveProperty;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/cfs_reactive-property/packages/cfs_reactive-property.js                       //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
(function () {                                                                            // 1
                                                                                          // 2
/////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                 //     // 4
// packages/cfs:reactive-property/reactive-property.js                             //     // 5
//                                                                                 //     // 6
/////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                   //     // 8
// #ReactiveProperty                                                               // 1   // 9
// A simple class that provides an reactive property interface                     // 2   // 10
                                                                                   // 3   // 11
_noopCallback = function() {};                                                     // 4   // 12
                                                                                   // 5   // 13
_nonReactive = {                                                                   // 6   // 14
  changed: _noopCallback,                                                          // 7   // 15
  depend: _noopCallback                                                            // 8   // 16
};                                                                                 // 9   // 17
                                                                                   // 10  // 18
/**                                                                                // 11  // 19
  * @constructor                                                                   // 12  // 20
  * @param {any} defaultValue Set the default value for the reactive property      // 13  // 21
  * @param {boolean} [reactive = true] Allow the user to disable reactivity        // 14  // 22
  *                                                                                // 15  // 23
  * This api should only be in the internal.api.md                                 // 16  // 24
  */                                                                               // 17  // 25
ReactiveProperty = function(defaultValue, reactive) {                              // 18  // 26
  var self = this;                                                                 // 19  // 27
  var _deps = (reactive === false)? _nonReactive : new Deps.Dependency();          // 20  // 28
                                                                                   // 21  // 29
  /** @property ReactiveProperty.value                                             // 22  // 30
    * @private                                                                     // 23  // 31
    * This contains the non reactive value, should only be used as a getter for    // 24  // 32
    * internal use                                                                 // 25  // 33
    */                                                                             // 26  // 34
  self.value = defaultValue;                                                       // 27  // 35
                                                                                   // 28  // 36
  self.onChange = function() {};                                                   // 29  // 37
                                                                                   // 30  // 38
  self.changed = function() {                                                      // 31  // 39
    _deps.changed();                                                               // 32  // 40
    self.onChange(self.value);                                                     // 33  // 41
  };                                                                               // 34  // 42
                                                                                   // 35  // 43
  /**                                                                              // 36  // 44
    * @method ReactiveProperty.get                                                 // 37  // 45
    * Usage:                                                                       // 38  // 46
    * ```js                                                                        // 39  // 47
    *   var foo = new ReactiveProperty('bar');                                     // 40  // 48
    *   foo.get(); // equals "bar"                                                 // 41  // 49
    * ```                                                                          // 42  // 50
    */                                                                             // 43  // 51
  self.get = function() {                                                          // 44  // 52
    _deps.depend();                                                                // 45  // 53
    return self.value;                                                             // 46  // 54
  };                                                                               // 47  // 55
                                                                                   // 48  // 56
  /**                                                                              // 49  // 57
    * @method ReactiveProperty.set Set property to value                           // 50  // 58
    * @param {any} value                                                           // 51  // 59
    * Usage:                                                                       // 52  // 60
    * ```js                                                                        // 53  // 61
    *   var foo = new ReactiveProperty('bar');                                     // 54  // 62
    *   foo.set('bar');                                                            // 55  // 63
    * ```                                                                          // 56  // 64
    */                                                                             // 57  // 65
  self.set = function(value) {                                                     // 58  // 66
    if (self.value !== value) {                                                    // 59  // 67
      self.value = value;                                                          // 60  // 68
      self.changed();                                                              // 61  // 69
    }                                                                              // 62  // 70
  };                                                                               // 63  // 71
                                                                                   // 64  // 72
  /**                                                                              // 65  // 73
    * @method ReactiveProperty.dec Decrease numeric property                       // 66  // 74
    * @param {number} [by=1] Value to decrease by                                  // 67  // 75
    * Usage:                                                                       // 68  // 76
    * ```js                                                                        // 69  // 77
    *   var foo = new ReactiveProperty('bar');                                     // 70  // 78
    *   foo.set(0);                                                                // 71  // 79
    *   foo.dec(5); // -5                                                          // 72  // 80
    * ```                                                                          // 73  // 81
    */                                                                             // 74  // 82
  self.dec = function(by) {                                                        // 75  // 83
    self.value -= by || 1;                                                         // 76  // 84
    self.changed();                                                                // 77  // 85
  };                                                                               // 78  // 86
                                                                                   // 79  // 87
  /**                                                                              // 80  // 88
    * @method ReactiveProperty.inc increase numeric property                       // 81  // 89
    * @param {number} [by=1] Value to increase by                                  // 82  // 90
    * Usage:                                                                       // 83  // 91
    * ```js                                                                        // 84  // 92
    *   var foo = new ReactiveProperty('bar');                                     // 85  // 93
    *   foo.set(0);                                                                // 86  // 94
    *   foo.inc(5); // 5                                                           // 87  // 95
    * ```                                                                          // 88  // 96
    */                                                                             // 89  // 97
  self.inc = function(by) {                                                        // 90  // 98
    self.value += by || 1;                                                         // 91  // 99
    self.changed();                                                                // 92  // 100
  };                                                                               // 93  // 101
                                                                                   // 94  // 102
  /**                                                                              // 95  // 103
    * @method ReactiveProperty.getset increase numeric property                    // 96  // 104
    * @param {any} [value] Value to set property - if undefined the act like `get` // 97  // 105
    * @returns {any} Returns value if no arguments are passed to the function      // 98  // 106
    * Usage:                                                                       // 99  // 107
    * ```js                                                                        // 100
    *   var foo = new ReactiveProperty('bar');                                     // 101
    *   foo.getset(5);                                                             // 102
    *   foo.getset(); // returns 5                                                 // 103
    * ```                                                                          // 104
    */                                                                             // 105
  self.getset = function(value) {                                                  // 106
    if (typeof value !== 'undefined') {                                            // 107
      self.set(value);                                                             // 108
    } else {                                                                       // 109
      return self.get();                                                           // 110
    }                                                                              // 111
  };                                                                               // 112
                                                                                   // 113
  /**                                                                              // 114
    * @method ReactiveProperty.toString                                            // 115
    * Usage:                                                                       // 116
    * ```js                                                                        // 117
    *   var foo = new ReactiveProperty('bar');                                     // 118
    *   foo.toString(); // returns 'bar'                                           // 119
    * ```                                                                          // 120
    */                                                                             // 121
  self.toString = function() {                                                     // 122
    var val = self.get();                                                          // 123
    return val ? val.toString() : '';                                              // 124
  };                                                                               // 125
                                                                                   // 126
  /**                                                                              // 127
    * @method ReactiveProperty.toText                                              // 128
    * Usage:                                                                       // 129
    * ```js                                                                        // 130
    *   var foo = new ReactiveProperty('bar');                                     // 131
    *   foo.toText(); // returns 'bar'                                             // 132
    * ```                                                                          // 133
    */                                                                             // 134
  self.toText = self.toString;                                                     // 135
                                                                                   // 136
};                                                                                 // 137
                                                                                   // 138
/////////////////////////////////////////////////////////////////////////////////////     // 147
                                                                                          // 148
}).call(this);                                                                            // 149
                                                                                          // 150
////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:reactive-property'] = {
  ReactiveProperty: ReactiveProperty
};

})();

//# sourceMappingURL=cfs_reactive-property.js.map
