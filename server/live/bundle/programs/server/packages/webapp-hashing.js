(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var WebAppHashing;

(function(){

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// packages/webapp-hashing/packages/webapp-hashing.js                             //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
(function(){                                                                      // 1
                                                                                  // 2
//////////////////////////////////////////////////////////////////////////////    // 3
//                                                                          //    // 4
// packages/webapp-hashing/webapp-hashing.js                                //    // 5
//                                                                          //    // 6
//////////////////////////////////////////////////////////////////////////////    // 7
                                                                            //    // 8
var crypto = Npm.require("crypto");                                         // 1  // 9
                                                                            // 2  // 10
WebAppHashing = {};                                                         // 3  // 11
                                                                            // 4  // 12
// Calculate a hash of all the client resources downloaded by the           // 5  // 13
// browser, including the application HTML, runtime config, code, and       // 6  // 14
// static files.                                                            // 7  // 15
//                                                                          // 8  // 16
// This hash *must* change if any resources seen by the browser             // 9  // 17
// change, and ideally *doesn't* change for any server-only changes         // 10
// (but the second is a performance enhancement, not a hard                 // 11
// requirement).                                                            // 12
                                                                            // 13
WebAppHashing.calculateClientHash =                                         // 14
  function (manifest, includeFilter, runtimeConfigOverride) {               // 15
  var hash = crypto.createHash('sha1');                                     // 16
                                                                            // 17
  // Omit the old hashed client values in the new hash. These may be        // 18
  // modified in the new boilerplate.                                       // 19
  var runtimeCfg = _.omit(__meteor_runtime_config__,                        // 20
    ['autoupdateVersion', 'autoupdateVersionRefreshable',                   // 21
     'autoupdateVersionCordova']);                                          // 22
                                                                            // 23
  if (runtimeConfigOverride) {                                              // 24
    runtimeCfg = runtimeConfigOverride;                                     // 25
  }                                                                         // 26
                                                                            // 27
  hash.update(JSON.stringify(runtimeCfg, 'utf8'));                          // 28
                                                                            // 29
  _.each(manifest, function (resource) {                                    // 30
      if ((! includeFilter || includeFilter(resource.type)) &&              // 31
          (resource.where === 'client' || resource.where === 'internal')) {       // 40
      hash.update(resource.path);                                           // 33
      hash.update(resource.hash);                                           // 34
    }                                                                       // 35
  });                                                                       // 36
  return hash.digest('hex');                                                // 37
};                                                                          // 38
                                                                            // 39
                                                                            // 40
//////////////////////////////////////////////////////////////////////////////    // 49
                                                                                  // 50
}).call(this);                                                                    // 51
                                                                                  // 52
////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['webapp-hashing'] = {
  WebAppHashing: WebAppHashing
};

})();

//# sourceMappingURL=webapp-hashing.js.map
