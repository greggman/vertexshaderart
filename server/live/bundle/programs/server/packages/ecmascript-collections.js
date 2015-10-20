(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Map, Set;

(function(){

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/ecmascript-collections/packages/ecmascript-collections.js     //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
(function(){                                                              // 1
                                                                          // 2
///////////////////////////////////////////////////////////////////////   // 3
//                                                                   //   // 4
// packages/ecmascript-collections/collections.js                    //   // 5
//                                                                   //   // 6
///////////////////////////////////////////////////////////////////////   // 7
                                                                     //   // 8
var collections = Npm.require("ecmascript-collections");             // 1
Map = collections.Map;                                               // 2
Set = collections.Set;                                               // 3
                                                                     // 4
///////////////////////////////////////////////////////////////////////   // 13
                                                                          // 14
}).call(this);                                                            // 15
                                                                          // 16
////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['ecmascript-collections'] = {
  Map: Map,
  Set: Set
};

})();

//# sourceMappingURL=ecmascript-collections.js.map
