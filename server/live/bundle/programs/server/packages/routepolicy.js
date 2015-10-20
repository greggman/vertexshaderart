(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var RoutePolicyTest, RoutePolicy;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/routepolicy/packages/routepolicy.js                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
(function(){                                                                                                          // 1
                                                                                                                      // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                             //     // 4
// packages/routepolicy/routepolicy.js                                                                         //     // 5
//                                                                                                             //     // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                               //     // 8
// In addition to listing specific files to be cached, the browser                                             // 1   // 9
// application cache manifest allows URLs to be designated as NETWORK                                          // 2   // 10
// (always fetched from the Internet) and FALLBACK (which we use to                                            // 3   // 11
// serve app HTML on arbitrary URLs).                                                                          // 4   // 12
//                                                                                                             // 5   // 13
// The limitation of the manifest file format is that the designations                                         // 6   // 14
// are by prefix only: if "/foo" is declared NETWORK then "/foobar"                                            // 7   // 15
// will also be treated as a network route.                                                                    // 8   // 16
//                                                                                                             // 9   // 17
// RoutePolicy is a low-level API for declaring the route type of URL prefixes:                                // 10  // 18
//                                                                                                             // 11  // 19
// "network": for network routes that should not conflict with static                                          // 12  // 20
// resources.  (For example, if "/sockjs/" is a network route, we                                              // 13  // 21
// shouldn't have "/sockjs/red-sock.jpg" as a static resource).                                                // 14  // 22
//                                                                                                             // 15  // 23
// "static-online": for static resources which should not be cached in                                         // 16  // 24
// the app cache.  This is implemented by also adding them to the                                              // 17  // 25
// NETWORK section (as otherwise the browser would receive app HTML                                            // 18  // 26
// for them because of the FALLBACK section), but static-online routes                                         // 19  // 27
// don't need to be checked for conflict with static resources.                                                // 20  // 28
                                                                                                               // 21  // 29
// The route policy is a singleton in a running application, but we                                            // 22  // 30
// can't unit test the real singleton because messing with the real                                            // 23  // 31
// routes would break tinytest... so allow policy instances to be                                              // 24  // 32
// constructed for testing.                                                                                    // 25  // 33
                                                                                                               // 26  // 34
RoutePolicyTest = {};                                                                                          // 27  // 35
                                                                                                               // 28  // 36
var RoutePolicyConstructor = RoutePolicyTest.Constructor = function () {                                       // 29  // 37
  var self = this;                                                                                             // 30  // 38
  self.urlPrefixTypes = {};                                                                                    // 31  // 39
};                                                                                                             // 32  // 40
                                                                                                               // 33  // 41
_.extend(RoutePolicyConstructor.prototype, {                                                                   // 34  // 42
                                                                                                               // 35  // 43
  urlPrefixMatches: function (urlPrefix, url) {                                                                // 36  // 44
    return url.substr(0, urlPrefix.length) === urlPrefix;                                                      // 37  // 45
  },                                                                                                           // 38  // 46
                                                                                                               // 39  // 47
  checkType: function (type) {                                                                                 // 40  // 48
    if (! _.contains(['network', 'static-online'], type))                                                      // 41  // 49
      return 'the route type must be "network" or "static-online"';                                            // 42  // 50
    return null;                                                                                               // 43  // 51
  },                                                                                                           // 44  // 52
                                                                                                               // 45  // 53
  checkUrlPrefix: function (urlPrefix, type) {                                                                 // 46  // 54
    var self = this;                                                                                           // 47  // 55
                                                                                                               // 48  // 56
    if (urlPrefix.charAt(0) !== '/')                                                                           // 49  // 57
      return 'a route URL prefix must begin with a slash';                                                     // 50  // 58
                                                                                                               // 51  // 59
    if (urlPrefix === '/')                                                                                     // 52  // 60
      return 'a route URL prefix cannot be /';                                                                 // 53  // 61
                                                                                                               // 54  // 62
    var existingType = self.urlPrefixTypes[urlPrefix];                                                         // 55  // 63
    if (existingType && existingType !== type)                                                                 // 56  // 64
      return 'the route URL prefix ' + urlPrefix + ' has already been declared to be of type ' + existingType;        // 65
                                                                                                               // 58  // 66
    return null;                                                                                               // 59  // 67
  },                                                                                                           // 60  // 68
                                                                                                               // 61  // 69
  checkForConflictWithStatic: function (urlPrefix, type, _testManifest) {                                      // 62  // 70
    var self = this;                                                                                           // 63  // 71
    if (type === 'static-online')                                                                              // 64  // 72
      return null;                                                                                             // 65  // 73
    if (!Package.webapp || !Package.webapp.WebApp                                                              // 66  // 74
        || !Package.webapp.WebApp.clientPrograms                                                               // 67  // 75
        || !Package.webapp.WebApp.clientPrograms[Package.webapp.WebApp.defaultArch].manifest) {                // 68  // 76
      // Hack: If we don't have a manifest, deal with it                                                       // 69  // 77
      // gracefully. This lets us load livedata into a nodejs                                                  // 70  // 78
      // environment that doesn't have a HTTP server (eg, a                                                    // 71  // 79
      // command-line tool).                                                                                   // 72  // 80
      return null;                                                                                             // 73  // 81
    }                                                                                                          // 74  // 82
    var manifest = _testManifest ||                                                                            // 75  // 83
      Package.webapp.WebApp.clientPrograms[Package.webapp.WebApp.defaultArch].manifest;                        // 76  // 84
    var conflict = _.find(manifest, function (resource) {                                                      // 77  // 85
      return (resource.type === 'static' &&                                                                    // 78  // 86
              resource.where === 'client' &&                                                                   // 79  // 87
              self.urlPrefixMatches(urlPrefix, resource.url));                                                 // 80  // 88
    });                                                                                                        // 81  // 89
    if (conflict)                                                                                              // 82  // 90
      return ('static resource ' + conflict.url + ' conflicts with ' +                                         // 83  // 91
              type + ' route ' + urlPrefix);                                                                   // 84  // 92
    else                                                                                                       // 85  // 93
      return null;                                                                                             // 86  // 94
  },                                                                                                           // 87  // 95
                                                                                                               // 88  // 96
  declare: function (urlPrefix, type) {                                                                        // 89  // 97
    var self = this;                                                                                           // 90  // 98
    var problem = self.checkType(type) ||                                                                      // 91  // 99
                  self.checkUrlPrefix(urlPrefix, type) ||                                                      // 92  // 100
                  self.checkForConflictWithStatic(urlPrefix, type);                                            // 93  // 101
    if (problem)                                                                                               // 94  // 102
      throw new Error(problem);                                                                                // 95  // 103
    // TODO overlapping prefixes, e.g. /foo/ and /foo/bar/                                                     // 96  // 104
    self.urlPrefixTypes[urlPrefix] = type;                                                                     // 97  // 105
  },                                                                                                           // 98  // 106
                                                                                                               // 99  // 107
  isValidUrl: function (url) {                                                                                 // 100
    return url.charAt(0) === '/';                                                                              // 101
  },                                                                                                           // 102
                                                                                                               // 103
  classify: function (url) {                                                                                   // 104
    var self = this;                                                                                           // 105
    if (url.charAt(0) !== '/')                                                                                 // 106
      throw new Error('url must be a relative URL: ' + url);                                                   // 107
    var prefix = _.find(_.keys(self.urlPrefixTypes), function (_prefix) {                                      // 108
      return self.urlPrefixMatches(_prefix, url);                                                              // 109
    });                                                                                                        // 110
    if (prefix)                                                                                                // 111
      return self.urlPrefixTypes[prefix];                                                                      // 112
    else                                                                                                       // 113
      return null;                                                                                             // 114
  },                                                                                                           // 115
                                                                                                               // 116
  urlPrefixesFor: function (type) {                                                                            // 117
    var self = this;                                                                                           // 118
    var prefixes = [];                                                                                         // 119
    _.each(self.urlPrefixTypes, function (_type, _prefix) {                                                    // 120
      if (_type === type)                                                                                      // 121
        prefixes.push(_prefix);                                                                                // 122
    });                                                                                                        // 123
    return prefixes.sort();                                                                                    // 124
  }                                                                                                            // 125
});                                                                                                            // 126
                                                                                                               // 127
RoutePolicy = new RoutePolicyConstructor();                                                                    // 128
                                                                                                               // 129
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 138
                                                                                                                      // 139
}).call(this);                                                                                                        // 140
                                                                                                                      // 141
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.routepolicy = {
  RoutePolicy: RoutePolicy,
  RoutePolicyTest: RoutePolicyTest
};

})();

//# sourceMappingURL=routepolicy.js.map
