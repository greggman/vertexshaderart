(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var _ = Package.underscore._;

/* Package-scope variables */
var Spiderable;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/spiderable/spiderable.js                                                                               //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
Spiderable = {};                                                                                                   // 1
                                                                                                                   // 2
                                                                                                                   // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/spiderable/spiderable_server.js                                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var fs = Npm.require('fs');                                                                                        // 1
var child_process = Npm.require('child_process');                                                                  // 2
var querystring = Npm.require('querystring');                                                                      // 3
var urlParser = Npm.require('url');                                                                                // 4
                                                                                                                   // 5
// list of bot user agents that we want to serve statically, but do                                                // 6
// not obey the _escaped_fragment_ protocol. The page is served                                                    // 7
// statically to any client whos user agent matches any of these                                                   // 8
// regexps. Users may modify this array.                                                                           // 9
//                                                                                                                 // 10
// An original goal with the spiderable package was to avoid doing                                                 // 11
// user-agent based tests. But the reality is not enough bots support                                              // 12
// the _escaped_fragment_ protocol, so we need to hardcode a list                                                  // 13
// here. I shed a silent tear.                                                                                     // 14
Spiderable.userAgentRegExps = [                                                                                    // 15
  /^facebookexternalhit/i,                                                                                         // 16
  /^linkedinbot/i,                                                                                                 // 17
  /^twitterbot/i,                                                                                                  // 18
  /^slackbot-linkexpanding/i                                                                                       // 19
];                                                                                                                 // 20
                                                                                                                   // 21
// how long to let phantomjs run before we kill it (and send down the                                              // 22
// regular page instead). Users may modify this number.                                                            // 23
Spiderable.requestTimeoutMs = 15*1000;                                                                             // 24
// maximum size of result HTML. node's default is 200k which is too                                                // 25
// small for our docs.                                                                                             // 26
var MAX_BUFFER = 5*1024*1024; // 5MB                                                                               // 27
                                                                                                                   // 28
// Exported for tests.                                                                                             // 29
Spiderable._urlForPhantom = function (siteAbsoluteUrl, requestUrl) {                                               // 30
  // reassembling url without escaped fragment if exists                                                           // 31
  var parsedUrl = urlParser.parse(requestUrl);                                                                     // 32
  var parsedQuery = querystring.parse(parsedUrl.query);                                                            // 33
  var escapedFragment = parsedQuery['_escaped_fragment_'];                                                         // 34
  delete parsedQuery['_escaped_fragment_'];                                                                        // 35
                                                                                                                   // 36
  var parsedAbsoluteUrl = urlParser.parse(siteAbsoluteUrl);                                                        // 37
  // If the ROOT_URL contains a path, Meteor strips that path off of the                                           // 38
  // request's URL before we see it. So we concatenate the pathname from                                           // 39
  // the request's URL with the root URL's pathname to get the full                                                // 40
  // pathname.                                                                                                     // 41
  if (parsedUrl.pathname.charAt(0) === "/") {                                                                      // 42
    parsedUrl.pathname = parsedUrl.pathname.substring(1);                                                          // 43
  }                                                                                                                // 44
  parsedAbsoluteUrl.pathname = urlParser.resolve(parsedAbsoluteUrl.pathname,                                       // 45
                                                 parsedUrl.pathname);                                              // 46
  parsedAbsoluteUrl.query = parsedQuery;                                                                           // 47
  // `url.format` will only use `query` if `search` is absent                                                      // 48
  parsedAbsoluteUrl.search = null;                                                                                 // 49
                                                                                                                   // 50
  if (escapedFragment !== undefined && escapedFragment !== null && escapedFragment.length > 0) {                   // 51
    parsedAbsoluteUrl.hash = '!' + decodeURIComponent(escapedFragment);                                            // 52
  }                                                                                                                // 53
                                                                                                                   // 54
  return urlParser.format(parsedAbsoluteUrl);                                                                      // 55
};                                                                                                                 // 56
                                                                                                                   // 57
var PHANTOM_SCRIPT = Assets.getText("phantom_script.js");                                                          // 58
                                                                                                                   // 59
WebApp.connectHandlers.use(function (req, res, next) {                                                             // 60
  // _escaped_fragment_ comes from Google's AJAX crawling spec:                                                    // 61
  // https://developers.google.com/webmasters/ajax-crawling/docs/specification                                     // 62
  if (/\?.*_escaped_fragment_=/.test(req.url) ||                                                                   // 63
      _.any(Spiderable.userAgentRegExps, function (re) {                                                           // 64
        return re.test(req.headers['user-agent']); })) {                                                           // 65
                                                                                                                   // 66
    var url = Spiderable._urlForPhantom(Meteor.absoluteUrl(), req.url);                                            // 67
                                                                                                                   // 68
    // This string is going to be put into a bash script, so it's important                                        // 69
    // that 'url' (which comes from the network) can neither exploit phantomjs                                     // 70
    // or the bash script. JSON stringification should prevent it from                                             // 71
    // exploiting phantomjs, and since the output of JSON.stringify shouldn't                                      // 72
    // be able to contain newlines, it should be unable to exploit bash as                                         // 73
    // well.                                                                                                       // 74
    var phantomScript = "var url = " + JSON.stringify(url) + ";" +                                                 // 75
          PHANTOM_SCRIPT;                                                                                          // 76
                                                                                                                   // 77
    // Allow override of phantomjs args via env var                                                                // 78
    // We use one env var to try to keep env-var explosion under control.                                          // 79
    // We're not going to document this unless it is actually needed;                                              // 80
    // (if you find yourself needing this please let us know the use case!)                                        // 81
    var phantomJsArgs = process.env.METEOR_PKG_SPIDERABLE_PHANTOMJS_ARGS || '';                                    // 82
                                                                                                                   // 83
    // Default image loading to off (we don't need images)                                                         // 84
    if (phantomJsArgs.indexOf("--load-images=") === -1) {                                                          // 85
      phantomJsArgs += " --load-images=no";                                                                        // 86
    }                                                                                                              // 87
                                                                                                                   // 88
    // POODLE means SSLv3 is being turned off everywhere.                                                          // 89
    // phantomjs currently defaults to SSLv3, and won't use TLS.                                                   // 90
    // Use --ssl-protocol to set the default to TLSv1                                                              // 91
    // (another option would be 'any', but really, we want to say >= TLSv1)                                        // 92
    // More info: https://groups.google.com/forum/#!topic/meteor-core/uZhT3AHwpsI                                  // 93
    if (phantomJsArgs.indexOf("--ssl-protocol=") === -1) {                                                         // 94
      phantomJsArgs += " --ssl-protocol=TLSv1";                                                                    // 95
    }                                                                                                              // 96
                                                                                                                   // 97
    // Run phantomjs.                                                                                              // 98
    //                                                                                                             // 99
    // Use '/dev/stdin' to avoid writing to a temporary file. We can't                                             // 100
    // just omit the file, as PhantomJS takes that to mean 'use a                                                  // 101
    // REPL' and exits as soon as stdin closes.                                                                    // 102
    //                                                                                                             // 103
    // However, Node 0.8 broke the ability to open /dev/stdin in the                                               // 104
    // subprocess, so we can't just write our string to the process's stdin                                        // 105
    // directly; see https://gist.github.com/3751746 for the gory details. We                                      // 106
    // work around this with a bash heredoc. (We previous used a "cat |"                                           // 107
    // instead, but that meant we couldn't use exec and had to manage several                                      // 108
    // processes.)                                                                                                 // 109
    child_process.execFile(                                                                                        // 110
      '/bin/bash',                                                                                                 // 111
      ['-c',                                                                                                       // 112
       ("exec phantomjs " + phantomJsArgs + " /dev/stdin <<'END'\n" +                                              // 113
        phantomScript + "END\n")],                                                                                 // 114
      {timeout: Spiderable.requestTimeoutMs, maxBuffer: MAX_BUFFER},                                               // 115
      function (error, stdout, stderr) {                                                                           // 116
        if (!error && /<html/i.test(stdout)) {                                                                     // 117
          res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});                                        // 118
          res.end(stdout);                                                                                         // 119
        } else {                                                                                                   // 120
          // phantomjs failed. Don't send the error, instead send the                                              // 121
          // normal page.                                                                                          // 122
          if (error && error.code === 127)                                                                         // 123
            Meteor._debug("spiderable: phantomjs not installed. Download and install from http://phantomjs.org/");
          else                                                                                                     // 125
            Meteor._debug("spiderable: phantomjs failed at " + url + ":", error, "\nstderr:", stderr, "\nstdout:", stdout);
                                                                                                                   // 127
          next();                                                                                                  // 128
        }                                                                                                          // 129
      });                                                                                                          // 130
  } else {                                                                                                         // 131
    next();                                                                                                        // 132
  }                                                                                                                // 133
});                                                                                                                // 134
                                                                                                                   // 135
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.spiderable = {
  Spiderable: Spiderable
};

})();

//# sourceMappingURL=spiderable.js.map
