(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var NpmModuleBcrypt;

(function(){

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/npm-bcrypt/packages/npm-bcrypt.js                             //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
(function () {                                                            // 1
                                                                          // 2
///////////////////////////////////////////////////////////////////////   // 3
//                                                                   //   // 4
// packages/npm-bcrypt/wrapper.js                                    //   // 5
//                                                                   //   // 6
///////////////////////////////////////////////////////////////////////   // 7
                                                                     //   // 8
NpmModuleBcrypt = Npm.require('bcrypt');                             // 1
                                                                     // 2
///////////////////////////////////////////////////////////////////////   // 11
                                                                          // 12
}).call(this);                                                            // 13
                                                                          // 14
////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['npm-bcrypt'] = {
  NpmModuleBcrypt: NpmModuleBcrypt
};

})();

//# sourceMappingURL=npm-bcrypt.js.map
