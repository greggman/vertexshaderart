(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Accounts = Package['accounts-base'].Accounts;
var AccountsServer = Package['accounts-base'].AccountsServer;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var ServiceConfiguration;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// packages/service-configuration/packages/service-configuration.js                         //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
(function(){                                                                                // 1
                                                                                            // 2
////////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                    //    // 4
// packages/service-configuration/service_configuration_common.js                     //    // 5
//                                                                                    //    // 6
////////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                      //    // 8
if (typeof ServiceConfiguration === 'undefined') {                                    // 1  // 9
  ServiceConfiguration = {};                                                          // 2  // 10
}                                                                                     // 3  // 11
                                                                                      // 4  // 12
                                                                                      // 5  // 13
// Table containing documents with configuration options for each                     // 6  // 14
// login service                                                                      // 7  // 15
ServiceConfiguration.configurations = new Mongo.Collection(                           // 8  // 16
  "meteor_accounts_loginServiceConfiguration", {                                      // 9  // 17
    _preventAutopublish: true,                                                        // 10
    connection: Meteor.isClient ? Accounts.connection : Meteor.connection             // 11
  });                                                                                 // 12
// Leave this collection open in insecure mode. In theory, someone could              // 13
// hijack your oauth connect requests to a different endpoint or appId,               // 14
// but you did ask for 'insecure'. The advantage is that it is much                   // 15
// easier to write a configuration wizard that works only in insecure                 // 16
// mode.                                                                              // 17
                                                                                      // 18
                                                                                      // 19
// Thrown when trying to use a login service which is not configured                  // 20
ServiceConfiguration.ConfigError = function (serviceName) {                           // 21
  if (Meteor.isClient && !Accounts.loginServicesConfigured()) {                       // 22
    this.message = "Login service configuration not yet loaded";                      // 23
  } else if (serviceName) {                                                           // 24
    this.message = "Service " + serviceName + " not configured";                      // 25
  } else {                                                                            // 26
    this.message = "Service not configured";                                          // 27
  }                                                                                   // 28
};                                                                                    // 29
ServiceConfiguration.ConfigError.prototype = new Error();                             // 30
ServiceConfiguration.ConfigError.prototype.name = 'ServiceConfiguration.ConfigError';       // 39
                                                                                      // 32
////////////////////////////////////////////////////////////////////////////////////////    // 41
                                                                                            // 42
}).call(this);                                                                              // 43
                                                                                            // 44
                                                                                            // 45
                                                                                            // 46
                                                                                            // 47
                                                                                            // 48
                                                                                            // 49
(function(){                                                                                // 50
                                                                                            // 51
////////////////////////////////////////////////////////////////////////////////////////    // 52
//                                                                                    //    // 53
// packages/service-configuration/service_configuration_server.js                     //    // 54
//                                                                                    //    // 55
////////////////////////////////////////////////////////////////////////////////////////    // 56
                                                                                      //    // 57
// Only one configuration should ever exist for each service.                         // 1  // 58
// A unique index helps avoid various race conditions which could                     // 2  // 59
// otherwise lead to an inconsistent database state (when there are multiple          // 3  // 60
// configurations for a single service, which configuration is correct?)              // 4  // 61
try {                                                                                 // 5  // 62
    ServiceConfiguration.configurations._ensureIndex(                                 // 6  // 63
        { "service": 1 },                                                             // 7  // 64
        { unique: true }                                                              // 8  // 65
    );                                                                                // 9  // 66
} catch (err) {                                                                       // 10
    console.error(                                                                    // 11
        "The service-configuration package persists configuration in the " +          // 12
        "meteor_accounts_loginServiceConfiguration collection in MongoDB. As " +      // 13
        "each service should have exactly one configuration, Meteor " +               // 14
        "automatically creates a MongoDB index with a unique constraint on the " +    // 15
        " meteor_accounts_loginServiceConfiguration collection. The " +               // 16
        "_ensureIndex command which creates that index is failing.\n\n" +             // 17
        "Meteor versions before 1.0.4 did not create this index. If you recently " +  // 18
        "upgraded and are seeing this error message for the first time, please " +    // 19
        "check your meteor_accounts_loginServiceConfiguration collection for " +      // 20
        "multiple configuration entries for the same service and delete " +           // 21
        "configuration entries until there is no more than one configuration " +      // 22
        "entry per service.\n\n" +                                                    // 23
        "If the meteor_accounts_loginServiceConfiguration collection looks " +        // 24
        "fine, the _ensureIndex command is failing for some other reason.\n\n" +      // 25
        "For more information on this history of this issue, please see " +           // 26
        "https://github.com/meteor/meteor/pull/3514.\n"                               // 27
    );                                                                                // 28
    throw err;                                                                        // 29
}                                                                                     // 30
                                                                                      // 31
////////////////////////////////////////////////////////////////////////////////////////    // 89
                                                                                            // 90
}).call(this);                                                                              // 91
                                                                                            // 92
//////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['service-configuration'] = {
  ServiceConfiguration: ServiceConfiguration
};

})();

//# sourceMappingURL=service-configuration.js.map
