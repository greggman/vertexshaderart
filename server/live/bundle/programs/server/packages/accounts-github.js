(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Accounts = Package['accounts-base'].Accounts;
var AccountsServer = Package['accounts-base'].AccountsServer;
var Github = Package.github.Github;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/accounts-github/packages/accounts-github.js                                                      //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
(function(){                                                                                                 // 1
                                                                                                             // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                                     //    // 4
// packages/accounts-github/github.js                                                                  //    // 5
//                                                                                                     //    // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                                       //    // 8
Accounts.oauth.registerService('github');                                                              // 1  // 9
                                                                                                       // 2  // 10
if (Meteor.isClient) {                                                                                 // 3  // 11
  Meteor.loginWithGithub = function(options, callback) {                                               // 4  // 12
    // support a callback without options                                                              // 5  // 13
    if (! callback && typeof options === "function") {                                                 // 6  // 14
      callback = options;                                                                              // 7  // 15
      options = null;                                                                                  // 8  // 16
    }                                                                                                  // 9  // 17
                                                                                                       // 10
    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);       // 19
    Github.requestCredential(options, credentialRequestCompleteCallback);                              // 12
  };                                                                                                   // 13
} else {                                                                                               // 14
  Accounts.addAutopublishFields({                                                                      // 15
    // not sure whether the github api can be used from the browser,                                   // 16
    // thus not sure if we should be sending access tokens; but we do it                               // 17
    // for all other oauth2 providers, and it may come in handy.                                       // 18
    forLoggedInUser: ['services.github'],                                                              // 19
    forOtherUsers: ['services.github.username']                                                        // 20
  });                                                                                                  // 21
}                                                                                                      // 22
                                                                                                       // 23
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 32
                                                                                                             // 33
}).call(this);                                                                                               // 34
                                                                                                             // 35
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-github'] = {};

})();

//# sourceMappingURL=accounts-github.js.map
