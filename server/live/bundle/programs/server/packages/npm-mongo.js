(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var NpmModuleMongodb, NpmModuleMongodbVersion;

(function(){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/npm-mongo/packages/npm-mongo.js                                 //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
(function(){                                                                // 1
                                                                            // 2
/////////////////////////////////////////////////////////////////////////   // 3
//                                                                     //   // 4
// packages/npm-mongo/wrapper.js                                       //   // 5
//                                                                     //   // 6
/////////////////////////////////////////////////////////////////////////   // 7
                                                                       //   // 8
NpmModuleMongodb = Npm.require('mongodb');                             // 1
NpmModuleMongodbVersion = Npm.require('mongodb/package.json').version;      // 10
                                                                       // 3
/////////////////////////////////////////////////////////////////////////   // 12
                                                                            // 13
}).call(this);                                                              // 14
                                                                            // 15
//////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['npm-mongo'] = {
  NpmModuleMongodb: NpmModuleMongodb,
  NpmModuleMongodbVersion: NpmModuleMongodbVersion
};

})();

//# sourceMappingURL=npm-mongo.js.map
