(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var Hook;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                       //
// packages/callback-hook/packages/callback-hook.js                                      //
//                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////
                                                                                         //
(function(){                                                                             // 1
                                                                                         // 2
////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                //     // 4
// packages/callback-hook/hook.js                                                 //     // 5
//                                                                                //     // 6
////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                  //     // 8
// XXX This pattern is under development. Do not add more callsites               // 1   // 9
// using this package for now. See:                                               // 2   // 10
// https://meteor.hackpad.com/Design-proposal-Hooks-YxvgEW06q6f                   // 3   // 11
//                                                                                // 4   // 12
// Encapsulates the pattern of registering callbacks on a hook.                   // 5   // 13
//                                                                                // 6   // 14
// The `each` method of the hook calls its iterator function argument             // 7   // 15
// with each registered callback.  This allows the hook to                        // 8   // 16
// conditionally decide not to call the callback (if, for example, the            // 9   // 17
// observed object has been closed or terminated).                                // 10  // 18
//                                                                                // 11  // 19
// By default, callbacks are bound with `Meteor.bindEnvironment`, so they will be        // 20
// called with the Meteor environment of the calling code that                    // 13  // 21
// registered the callback. Override by passing { bindEnvironment: false }        // 14  // 22
// to the constructor.                                                            // 15  // 23
//                                                                                // 16  // 24
// Registering a callback returns an object with a single `stop`                  // 17  // 25
// method which unregisters the callback.                                         // 18  // 26
//                                                                                // 19  // 27
// The code is careful to allow a callback to be safely unregistered              // 20  // 28
// while the callbacks are being iterated over.                                   // 21  // 29
//                                                                                // 22  // 30
// If the hook is configured with the `exceptionHandler` option, the              // 23  // 31
// handler will be called if a called callback throws an exception.               // 24  // 32
// By default (if the exception handler doesn't itself throw an                   // 25  // 33
// exception, or if the iterator function doesn't return a falsy value            // 26  // 34
// to terminate the calling of callbacks), the remaining callbacks                // 27  // 35
// will still be called.                                                          // 28  // 36
//                                                                                // 29  // 37
// Alternatively, the `debugPrintExceptions` option can be specified              // 30  // 38
// as string describing the callback.  On an exception the string and             // 31  // 39
// the exception will be printed to the console log with                          // 32  // 40
// `Meteor._debug`, and the exception otherwise ignored.                          // 33  // 41
//                                                                                // 34  // 42
// If an exception handler isn't specified, exceptions thrown in the              // 35  // 43
// callback will propagate up to the iterator function, and will                  // 36  // 44
// terminate calling the remaining callbacks if not caught.                       // 37  // 45
                                                                                  // 38  // 46
Hook = function (options) {                                                       // 39  // 47
  var self = this;                                                                // 40  // 48
  options = options || {};                                                        // 41  // 49
  self.nextCallbackId = 0;                                                        // 42  // 50
  self.callbacks = {};                                                            // 43  // 51
  // Whether to wrap callbacks with Meteor.bindEnvironment                        // 44  // 52
  self.bindEnvironment = true;                                                    // 45  // 53
  if (options.bindEnvironment === false)                                          // 46  // 54
    self.bindEnvironment = false;                                                 // 47  // 55
                                                                                  // 48  // 56
  if (options.exceptionHandler)                                                   // 49  // 57
    self.exceptionHandler = options.exceptionHandler;                             // 50  // 58
  else if (options.debugPrintExceptions) {                                        // 51  // 59
    if (! _.isString(options.debugPrintExceptions))                               // 52  // 60
      throw new Error("Hook option debugPrintExceptions should be a string");     // 53  // 61
    self.exceptionHandler = options.debugPrintExceptions;                         // 54  // 62
  }                                                                               // 55  // 63
};                                                                                // 56  // 64
                                                                                  // 57  // 65
_.extend(Hook.prototype, {                                                        // 58  // 66
  register: function (callback) {                                                 // 59  // 67
    var self = this;                                                              // 60  // 68
    var exceptionHandler =  self.exceptionHandler || function (exception) {       // 61  // 69
      // Note: this relies on the undocumented fact that if bindEnvironment's     // 62  // 70
      // onException throws, and you are invoking the callback either in the      // 63  // 71
      // browser or from within a Fiber in Node, the exception is propagated.     // 64  // 72
      throw exception;                                                            // 65  // 73
    };                                                                            // 66  // 74
                                                                                  // 67  // 75
    if (self.bindEnvironment) {                                                   // 68  // 76
      callback = Meteor.bindEnvironment(callback, exceptionHandler);              // 69  // 77
    } else {                                                                      // 70  // 78
      callback = dontBindEnvironment(callback, exceptionHandler);                 // 71  // 79
    }                                                                             // 72  // 80
                                                                                  // 73  // 81
    var id = self.nextCallbackId++;                                               // 74  // 82
    self.callbacks[id] = callback;                                                // 75  // 83
                                                                                  // 76  // 84
    return {                                                                      // 77  // 85
      stop: function () {                                                         // 78  // 86
        delete self.callbacks[id];                                                // 79  // 87
      }                                                                           // 80  // 88
    };                                                                            // 81  // 89
  },                                                                              // 82  // 90
                                                                                  // 83  // 91
  // For each registered callback, call the passed iterator function              // 84  // 92
  // with the callback.                                                           // 85  // 93
  //                                                                              // 86  // 94
  // The iterator function can choose whether or not to call the                  // 87  // 95
  // callback.  (For example, it might not call the callback if the               // 88  // 96
  // observed object has been closed or terminated).                              // 89  // 97
  //                                                                              // 90  // 98
  // The iteration is stopped if the iterator function returns a falsy            // 91  // 99
  // value or throws an exception.                                                // 92  // 100
  //                                                                              // 93  // 101
  each: function (iterator) {                                                     // 94  // 102
    var self = this;                                                              // 95  // 103
                                                                                  // 96  // 104
    // Invoking bindEnvironment'd callbacks outside of a Fiber in Node doesn't    // 97  // 105
    // run them to completion (and exceptions thrown from onException are not     // 98  // 106
    // propagated), so we need to be in a Fiber.                                  // 99  // 107
    Meteor._nodeCodeMustBeInFiber();                                              // 100
                                                                                  // 101
    var ids = _.keys(self.callbacks);                                             // 102
    for (var i = 0;  i < ids.length;  ++i) {                                      // 103
      var id = ids[i];                                                            // 104
      // check to see if the callback was removed during iteration                // 105
      if (_.has(self.callbacks, id)) {                                            // 106
        var callback = self.callbacks[id];                                        // 107
                                                                                  // 108
        if (! iterator(callback))                                                 // 109
          break;                                                                  // 110
      }                                                                           // 111
    }                                                                             // 112
  }                                                                               // 113
});                                                                               // 114
                                                                                  // 115
// Copied from Meteor.bindEnvironment and removed all the env stuff.              // 116
var dontBindEnvironment = function (func, onException, _this) {                   // 117
  if (!onException || typeof(onException) === 'string') {                         // 118
    var description = onException || "callback of async function";                // 119
    onException = function (error) {                                              // 120
      Meteor._debug(                                                              // 121
        "Exception in " + description + ":",                                      // 122
        error && error.stack || error                                             // 123
      );                                                                          // 124
    };                                                                            // 125
  }                                                                               // 126
                                                                                  // 127
  return function (/* arguments */) {                                             // 128
    var args = _.toArray(arguments);                                              // 129
                                                                                  // 130
    var runAndHandleExceptions = function () {                                    // 131
      try {                                                                       // 132
        var ret = func.apply(_this, args);                                        // 133
      } catch (e) {                                                               // 134
        onException(e);                                                           // 135
      }                                                                           // 136
      return ret;                                                                 // 137
    };                                                                            // 138
                                                                                  // 139
    return runAndHandleExceptions();                                              // 140
  };                                                                              // 141
};                                                                                // 142
                                                                                  // 143
////////////////////////////////////////////////////////////////////////////////////     // 152
                                                                                         // 153
}).call(this);                                                                           // 154
                                                                                         // 155
///////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['callback-hook'] = {
  Hook: Hook
};

})();

//# sourceMappingURL=callback-hook.js.map
