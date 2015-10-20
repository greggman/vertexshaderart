(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Random = Package.random.Random;
var Accounts = Package['accounts-base'].Accounts;
var AccountsServer = Package['accounts-base'].AccountsServer;
var Google = Package.google.Google;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/accounts-google/packages/accounts-google.js                                                      //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
(function(){                                                                                                 // 1
                                                                                                             // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                                     //    // 4
// packages/accounts-google/google.js                                                                  //    // 5
//                                                                                                     //    // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                                       //    // 8
Accounts.oauth.registerService('google');                                                              // 1  // 9
                                                                                                       // 2  // 10
if (Meteor.isClient) {                                                                                 // 3  // 11
  Meteor.loginWithGoogle = function(options, callback) {                                               // 4  // 12
    // support a callback without options                                                              // 5  // 13
    if (! callback && typeof options === "function") {                                                 // 6  // 14
      callback = options;                                                                              // 7  // 15
      options = null;                                                                                  // 8  // 16
    }                                                                                                  // 9  // 17
                                                                                                       // 10
    // Use Google's domain-specific login page if we want to restrict creation to                      // 11
    // a particular email domain. (Don't use it if restrictCreationByEmailDomain                       // 12
    // is a function.) Note that all this does is change Google's UI ---                               // 13
    // accounts-base/accounts_server.js still checks server-side that the server                       // 14
    // has the proper email address after the OAuth conversation.                                      // 15
    if (typeof Accounts._options.restrictCreationByEmailDomain === 'string') {                         // 16
      options = _.extend({}, options || {});                                                           // 17
      options.loginUrlParameters = _.extend({}, options.loginUrlParameters || {});                     // 18
      options.loginUrlParameters.hd = Accounts._options.restrictCreationByEmailDomain;                 // 19
    }                                                                                                  // 20
    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);       // 29
    Google.requestCredential(options, credentialRequestCompleteCallback);                              // 22
  };                                                                                                   // 23
} else {                                                                                               // 24
  Accounts.addAutopublishFields({                                                                      // 25
    forLoggedInUser: _.map(                                                                            // 26
      // publish access token since it can be used from the client (if                                 // 27
      // transmitted over ssl or on                                                                    // 28
      // localhost). https://developers.google.com/accounts/docs/OAuth2UserAgent                       // 29
      // refresh token probably shouldn't be sent down.                                                // 30
      Google.whitelistedFields.concat(['accessToken', 'expiresAt']), // don't publish refresh token    // 31
      function (subfield) { return 'services.google.' + subfield; }),                                  // 32
                                                                                                       // 33
    forOtherUsers: _.map(                                                                              // 34
      // even with autopublish, no legitimate web app should be                                        // 35
      // publishing all users' emails                                                                  // 36
      _.without(Google.whitelistedFields, 'email', 'verified_email'),                                  // 37
      function (subfield) { return 'services.google.' + subfield; })                                   // 38
  });                                                                                                  // 39
}                                                                                                      // 40
                                                                                                       // 41
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 50
                                                                                                             // 51
}).call(this);                                                                                               // 52
                                                                                                             // 53
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-google'] = {};

})();

//# sourceMappingURL=accounts-google.js.map
