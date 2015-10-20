(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var _ = Package.underscore._;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;

/* Package-scope variables */
var Google;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/google/google_server.js                                                             //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
Google = {};                                                                                    // 1
                                                                                                // 2
// https://developers.google.com/accounts/docs/OAuth2Login#userinfocall                         // 3
Google.whitelistedFields = ['id', 'email', 'verified_email', 'name', 'given_name',              // 4
                   'family_name', 'picture', 'locale', 'timezone', 'gender'];                   // 5
                                                                                                // 6
                                                                                                // 7
OAuth.registerService('google', 2, null, function(query) {                                      // 8
                                                                                                // 9
  var response = getTokens(query);                                                              // 10
  var expiresAt = (+new Date) + (1000 * parseInt(response.expiresIn, 10));                      // 11
  var accessToken = response.accessToken;                                                       // 12
  var idToken = response.idToken;                                                               // 13
  var scopes = getScopes(accessToken);                                                          // 14
  var identity = getIdentity(accessToken);                                                      // 15
                                                                                                // 16
  var serviceData = {                                                                           // 17
    accessToken: accessToken,                                                                   // 18
    idToken: idToken,                                                                           // 19
    expiresAt: expiresAt,                                                                       // 20
    scope: scopes                                                                               // 21
  };                                                                                            // 22
                                                                                                // 23
  var fields = _.pick(identity, Google.whitelistedFields);                                      // 24
  _.extend(serviceData, fields);                                                                // 25
                                                                                                // 26
  // only set the token in serviceData if it's there. this ensures                              // 27
  // that we don't lose old ones (since we only get this on the first                           // 28
  // log in attempt)                                                                            // 29
  if (response.refreshToken)                                                                    // 30
    serviceData.refreshToken = response.refreshToken;                                           // 31
                                                                                                // 32
  return {                                                                                      // 33
    serviceData: serviceData,                                                                   // 34
    options: {profile: {name: identity.name}}                                                   // 35
  };                                                                                            // 36
});                                                                                             // 37
                                                                                                // 38
// returns an object containing:                                                                // 39
// - accessToken                                                                                // 40
// - expiresIn: lifetime of token in seconds                                                    // 41
// - refreshToken, if this is the first authorization request                                   // 42
var getTokens = function (query) {                                                              // 43
  var config = ServiceConfiguration.configurations.findOne({service: 'google'});                // 44
  if (!config)                                                                                  // 45
    throw new ServiceConfiguration.ConfigError();                                               // 46
                                                                                                // 47
  var response;                                                                                 // 48
  try {                                                                                         // 49
    response = HTTP.post(                                                                       // 50
      "https://accounts.google.com/o/oauth2/token", {params: {                                  // 51
        code: query.code,                                                                       // 52
        client_id: config.clientId,                                                             // 53
        client_secret: OAuth.openSecret(config.secret),                                         // 54
        redirect_uri: OAuth._redirectUri('google', config),                                     // 55
        grant_type: 'authorization_code'                                                        // 56
      }});                                                                                      // 57
  } catch (err) {                                                                               // 58
    throw _.extend(new Error("Failed to complete OAuth handshake with Google. " + err.message),
                   {response: err.response});                                                   // 60
  }                                                                                             // 61
                                                                                                // 62
  if (response.data.error) { // if the http response was a json object with an error attribute  // 63
    throw new Error("Failed to complete OAuth handshake with Google. " + response.data.error);  // 64
  } else {                                                                                      // 65
    return {                                                                                    // 66
      accessToken: response.data.access_token,                                                  // 67
      refreshToken: response.data.refresh_token,                                                // 68
      expiresIn: response.data.expires_in,                                                      // 69
      idToken: response.data.id_token                                                           // 70
    };                                                                                          // 71
  }                                                                                             // 72
};                                                                                              // 73
                                                                                                // 74
var getIdentity = function (accessToken) {                                                      // 75
  try {                                                                                         // 76
    return HTTP.get(                                                                            // 77
      "https://www.googleapis.com/oauth2/v1/userinfo",                                          // 78
      {params: {access_token: accessToken}}).data;                                              // 79
  } catch (err) {                                                                               // 80
    throw _.extend(new Error("Failed to fetch identity from Google. " + err.message),           // 81
                   {response: err.response});                                                   // 82
  }                                                                                             // 83
};                                                                                              // 84
                                                                                                // 85
var getScopes = function (accessToken) {                                                        // 86
  try {                                                                                         // 87
    return HTTP.get(                                                                            // 88
      "https://www.googleapis.com/oauth2/v1/tokeninfo",                                         // 89
      {params: {access_token: accessToken}}).data.scope.split(' ');                             // 90
  } catch (err) {                                                                               // 91
    throw _.extend(new Error("Failed to fetch tokeninfo from Google. " + err.message),          // 92
                   {response: err.response});                                                   // 93
  }                                                                                             // 94
};                                                                                              // 95
                                                                                                // 96
Google.retrieveCredential = function(credentialToken, credentialSecret) {                       // 97
  return OAuth.retrieveCredential(credentialToken, credentialSecret);                           // 98
};                                                                                              // 99
                                                                                                // 100
//////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.google = {
  Google: Google
};

})();

//# sourceMappingURL=google.js.map
