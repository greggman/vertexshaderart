(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Random = Package.random.Random;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;

(function(){

/////////////////////////////////////////////////////////////////////////////
//                                                                         //
// packages/oauth2/packages/oauth2.js                                      //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////
                                                                           //
(function(){                                                               // 1
                                                                           // 2
///////////////////////////////////////////////////////////////////////    // 3
//                                                                   //    // 4
// packages/oauth2/oauth2_server.js                                  //    // 5
//                                                                   //    // 6
///////////////////////////////////////////////////////////////////////    // 7
                                                                     //    // 8
// connect middleware                                                // 1  // 9
OAuth._requestHandlers['2'] = function (service, query, res) {       // 2  // 10
  // check if user authorized access                                 // 3  // 11
  if (!query.error) {                                                // 4  // 12
    // Prepare the login results before returning.                   // 5  // 13
                                                                     // 6  // 14
    // Run service-specific handler.                                 // 7  // 15
    var oauthResult = service.handleOauthRequest(query);             // 8  // 16
    var credentialSecret = Random.secret();                          // 9  // 17
                                                                     // 10
    var credentialToken = OAuth._credentialTokenFromQuery(query);    // 11
                                                                     // 12
    // Store the login result so it can be retrieved in another      // 13
    // browser tab by the result handler                             // 14
    OAuth._storePendingCredential(credentialToken, {                 // 15
      serviceName: service.serviceName,                              // 16
      serviceData: oauthResult.serviceData,                          // 17
      options: oauthResult.options                                   // 18
    }, credentialSecret);                                            // 19
  }                                                                  // 20
                                                                     // 21
  // Either close the window, redirect, or render nothing            // 22
  // if all else fails                                               // 23
  OAuth._renderOauthResults(res, query, credentialSecret);           // 24
};                                                                   // 25
                                                                     // 26
///////////////////////////////////////////////////////////////////////    // 35
                                                                           // 36
}).call(this);                                                             // 37
                                                                           // 38
/////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.oauth2 = {};

})();

//# sourceMappingURL=oauth2.js.map
