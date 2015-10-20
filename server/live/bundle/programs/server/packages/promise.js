(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Promise;

(function(){

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/promise/packages/promise.js                                        //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
(function(){                                                                   // 1
                                                                               // 2
////////////////////////////////////////////////////////////////////////////   // 3
//                                                                        //   // 4
// packages/promise/promise_server.js                                     //   // 5
//                                                                        //   // 6
////////////////////////////////////////////////////////////////////////////   // 7
                                                                          //   // 8
var MeteorPromise = Npm.require("meteor-promise");                        // 1
// Define MeteorPromise.Fiber so that every Promise callback can run in a      // 10
// Fiber drawn from a pool of reusable Fibers.                            // 3
MeteorPromise.Fiber = Npm.require("fibers");                              // 4
Promise = MeteorPromise;                                                  // 5
                                                                          // 6
////////////////////////////////////////////////////////////////////////////   // 15
                                                                               // 16
}).call(this);                                                                 // 17
                                                                               // 18
/////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.promise = {
  Promise: Promise
};

})();

//# sourceMappingURL=promise.js.map
