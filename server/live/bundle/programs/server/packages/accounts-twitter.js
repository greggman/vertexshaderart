(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Accounts = Package['accounts-base'].Accounts;
var AccountsServer = Package['accounts-base'].AccountsServer;
var Twitter = Package.twitter.Twitter;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/accounts-twitter/packages/accounts-twitter.js                                                    //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
(function(){                                                                                                 // 1
                                                                                                             // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                                     //    // 4
// packages/accounts-twitter/twitter.js                                                                //    // 5
//                                                                                                     //    // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                                       //    // 8
Accounts.oauth.registerService('twitter');                                                             // 1  // 9
                                                                                                       // 2  // 10
if (Meteor.isClient) {                                                                                 // 3  // 11
  Meteor.loginWithTwitter = function(options, callback) {                                              // 4  // 12
    // support a callback without options                                                              // 5  // 13
    if (! callback && typeof options === "function") {                                                 // 6  // 14
      callback = options;                                                                              // 7  // 15
      options = null;                                                                                  // 8  // 16
    }                                                                                                  // 9  // 17
                                                                                                       // 10
    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);       // 19
    Twitter.requestCredential(options, credentialRequestCompleteCallback);                             // 12
  };                                                                                                   // 13
} else {                                                                                               // 14
  var autopublishedFields = _.map(                                                                     // 15
    // don't send access token. https://dev.twitter.com/discussions/5025                               // 16
    Twitter.whitelistedFields.concat(['id', 'screenName']),                                            // 17
    function (subfield) { return 'services.twitter.' + subfield; });                                   // 18
                                                                                                       // 19
  Accounts.addAutopublishFields({                                                                      // 20
    forLoggedInUser: autopublishedFields,                                                              // 21
    forOtherUsers: autopublishedFields                                                                 // 22
  });                                                                                                  // 23
}                                                                                                      // 24
                                                                                                       // 25
/////////////////////////////////////////////////////////////////////////////////////////////////////////    // 34
                                                                                                             // 35
}).call(this);                                                                                               // 36
                                                                                                             // 37
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-twitter'] = {};

})();

//# sourceMappingURL=accounts-twitter.js.map
