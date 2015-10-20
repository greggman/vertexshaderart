(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var OAuth1Binding = Package.oauth1.OAuth1Binding;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var _ = Package.underscore._;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;

/* Package-scope variables */
var Twitter;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/twitter/twitter_server.js                                                                  //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
Twitter = {};                                                                                          // 1
                                                                                                       // 2
var urls = {                                                                                           // 3
  requestToken: "https://api.twitter.com/oauth/request_token",                                         // 4
  authorize: "https://api.twitter.com/oauth/authorize",                                                // 5
  accessToken: "https://api.twitter.com/oauth/access_token",                                           // 6
  authenticate: "https://api.twitter.com/oauth/authenticate"                                           // 7
};                                                                                                     // 8
                                                                                                       // 9
                                                                                                       // 10
// https://dev.twitter.com/docs/api/1.1/get/account/verify_credentials                                 // 11
Twitter.whitelistedFields = ['profile_image_url', 'profile_image_url_https', 'lang'];                  // 12
                                                                                                       // 13
OAuth.registerService('twitter', 1, urls, function(oauthBinding) {                                     // 14
  var identity = oauthBinding.get('https://api.twitter.com/1.1/account/verify_credentials.json').data;
                                                                                                       // 16
  var serviceData = {                                                                                  // 17
    id: identity.id_str,                                                                               // 18
    screenName: identity.screen_name,                                                                  // 19
    accessToken: OAuth.sealSecret(oauthBinding.accessToken),                                           // 20
    accessTokenSecret: OAuth.sealSecret(oauthBinding.accessTokenSecret)                                // 21
  };                                                                                                   // 22
                                                                                                       // 23
  // include helpful fields from twitter                                                               // 24
  var fields = _.pick(identity, Twitter.whitelistedFields);                                            // 25
  _.extend(serviceData, fields);                                                                       // 26
                                                                                                       // 27
  return {                                                                                             // 28
    serviceData: serviceData,                                                                          // 29
    options: {                                                                                         // 30
      profile: {                                                                                       // 31
        name: identity.name                                                                            // 32
      }                                                                                                // 33
    }                                                                                                  // 34
  };                                                                                                   // 35
});                                                                                                    // 36
                                                                                                       // 37
                                                                                                       // 38
Twitter.retrieveCredential = function(credentialToken, credentialSecret) {                             // 39
  return OAuth.retrieveCredential(credentialToken, credentialSecret);                                  // 40
};                                                                                                     // 41
                                                                                                       // 42
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.twitter = {
  Twitter: Twitter
};

})();

//# sourceMappingURL=twitter.js.map
