(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;

/* Package-scope variables */
var Github;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/github/github_server.js                                                                //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
Github = {};                                                                                       // 1
                                                                                                   // 2
OAuth.registerService('github', 2, null, function(query) {                                         // 3
                                                                                                   // 4
  var accessToken = getAccessToken(query);                                                         // 5
  var identity = getIdentity(accessToken);                                                         // 6
  var emails = getEmails(accessToken);                                                             // 7
  var primaryEmail = _.findWhere(emails, {primary: true});                                         // 8
                                                                                                   // 9
  return {                                                                                         // 10
    serviceData: {                                                                                 // 11
      id: identity.id,                                                                             // 12
      accessToken: OAuth.sealSecret(accessToken),                                                  // 13
      email: identity.email || (primaryEmail && primaryEmail.email) || '',                         // 14
      username: identity.login,                                                                    // 15
      emails: emails                                                                               // 16
    },                                                                                             // 17
    options: {profile: {name: identity.name}}                                                      // 18
  };                                                                                               // 19
});                                                                                                // 20
                                                                                                   // 21
// http://developer.github.com/v3/#user-agent-required                                             // 22
var userAgent = "Meteor";                                                                          // 23
if (Meteor.release)                                                                                // 24
  userAgent += "/" + Meteor.release;                                                               // 25
                                                                                                   // 26
var getAccessToken = function (query) {                                                            // 27
  var config = ServiceConfiguration.configurations.findOne({service: 'github'});                   // 28
  if (!config)                                                                                     // 29
    throw new ServiceConfiguration.ConfigError();                                                  // 30
                                                                                                   // 31
  var response;                                                                                    // 32
  try {                                                                                            // 33
    response = HTTP.post(                                                                          // 34
      "https://github.com/login/oauth/access_token", {                                             // 35
        headers: {                                                                                 // 36
          Accept: 'application/json',                                                              // 37
          "User-Agent": userAgent                                                                  // 38
        },                                                                                         // 39
        params: {                                                                                  // 40
          code: query.code,                                                                        // 41
          client_id: config.clientId,                                                              // 42
          client_secret: OAuth.openSecret(config.secret),                                          // 43
          redirect_uri: OAuth._redirectUri('github', config),                                      // 44
          state: query.state                                                                       // 45
        }                                                                                          // 46
      });                                                                                          // 47
  } catch (err) {                                                                                  // 48
    throw _.extend(new Error("Failed to complete OAuth handshake with Github. " + err.message),    // 49
                   {response: err.response});                                                      // 50
  }                                                                                                // 51
  if (response.data.error) { // if the http response was a json object with an error attribute     // 52
    throw new Error("Failed to complete OAuth handshake with GitHub. " + response.data.error);     // 53
  } else {                                                                                         // 54
    return response.data.access_token;                                                             // 55
  }                                                                                                // 56
};                                                                                                 // 57
                                                                                                   // 58
var getIdentity = function (accessToken) {                                                         // 59
  try {                                                                                            // 60
    return HTTP.get(                                                                               // 61
      "https://api.github.com/user", {                                                             // 62
        headers: {"User-Agent": userAgent}, // http://developer.github.com/v3/#user-agent-required
        params: {access_token: accessToken}                                                        // 64
      }).data;                                                                                     // 65
  } catch (err) {                                                                                  // 66
    throw _.extend(new Error("Failed to fetch identity from Github. " + err.message),              // 67
                   {response: err.response});                                                      // 68
  }                                                                                                // 69
};                                                                                                 // 70
                                                                                                   // 71
var getEmails = function (accessToken) {                                                           // 72
  try {                                                                                            // 73
    return HTTP.get(                                                                               // 74
      "https://api.github.com/user/emails", {                                                      // 75
        headers: {"User-Agent": userAgent}, // http://developer.github.com/v3/#user-agent-required
        params: {access_token: accessToken}                                                        // 77
      }).data;                                                                                     // 78
  } catch (err) {                                                                                  // 79
    return [];                                                                                     // 80
  }                                                                                                // 81
};                                                                                                 // 82
                                                                                                   // 83
Github.retrieveCredential = function(credentialToken, credentialSecret) {                          // 84
  return OAuth.retrieveCredential(credentialToken, credentialSecret);                              // 85
};                                                                                                 // 86
                                                                                                   // 87
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.github = {
  Github: Github
};

})();

//# sourceMappingURL=github.js.map
