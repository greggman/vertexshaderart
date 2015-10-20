(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var Email, EmailTest, EmailInternals;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/email/packages/email.js                                                                               //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
(function(){                                                                                                      // 1
                                                                                                                  // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                                         //     // 4
// packages/email/email.js                                                                                 //     // 5
//                                                                                                         //     // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                                           //     // 8
var Future = Npm.require('fibers/future');                                                                 // 1   // 9
var urlModule = Npm.require('url');                                                                        // 2   // 10
                                                                                                           // 3   // 11
Email = {};                                                                                                // 4   // 12
EmailTest = {};                                                                                            // 5   // 13
                                                                                                           // 6   // 14
EmailInternals = {                                                                                         // 7   // 15
  NpmModules: {                                                                                            // 8   // 16
    mailcomposer: {                                                                                        // 9   // 17
      version: Npm.require('mailcomposer/package.json').version,                                           // 10  // 18
      module: Npm.require('mailcomposer')                                                                  // 11  // 19
    }                                                                                                      // 12  // 20
  }                                                                                                        // 13  // 21
};                                                                                                         // 14  // 22
                                                                                                           // 15  // 23
var MailComposer = EmailInternals.NpmModules.mailcomposer.module.MailComposer;                             // 16  // 24
                                                                                                           // 17  // 25
var makePool = function (mailUrlString) {                                                                  // 18  // 26
  var mailUrl = urlModule.parse(mailUrlString);                                                            // 19  // 27
  if (mailUrl.protocol !== 'smtp:')                                                                        // 20  // 28
    throw new Error("Email protocol in $MAIL_URL (" +                                                      // 21  // 29
                    mailUrlString + ") must be 'smtp'");                                                   // 22  // 30
                                                                                                           // 23  // 31
  var port = +(mailUrl.port);                                                                              // 24  // 32
  var auth = false;                                                                                        // 25  // 33
  if (mailUrl.auth) {                                                                                      // 26  // 34
    var parts = mailUrl.auth.split(':', 2);                                                                // 27  // 35
    auth = {user: parts[0] && decodeURIComponent(parts[0]),                                                // 28  // 36
            pass: parts[1] && decodeURIComponent(parts[1])};                                               // 29  // 37
  }                                                                                                        // 30  // 38
                                                                                                           // 31  // 39
  var simplesmtp = Npm.require('simplesmtp');                                                              // 32  // 40
  var pool = simplesmtp.createClientPool(                                                                  // 33  // 41
    port,  // Defaults to 25                                                                               // 34  // 42
    mailUrl.hostname,  // Defaults to "localhost"                                                          // 35  // 43
    { secureConnection: (port === 465),                                                                    // 36  // 44
      // XXX allow maxConnections to be configured?                                                        // 37  // 45
      auth: auth });                                                                                       // 38  // 46
                                                                                                           // 39  // 47
  pool._future_wrapped_sendMail = _.bind(Future.wrap(pool.sendMail), pool);                                // 40  // 48
  return pool;                                                                                             // 41  // 49
};                                                                                                         // 42  // 50
                                                                                                           // 43  // 51
var getPool = _.once(function () {                                                                         // 44  // 52
  // We delay this check until the first call to Email.send, in case someone                               // 45  // 53
  // set process.env.MAIL_URL in startup code.                                                             // 46  // 54
  var url = process.env.MAIL_URL;                                                                          // 47  // 55
  if (! url)                                                                                               // 48  // 56
    return null;                                                                                           // 49  // 57
  return makePool(url);                                                                                    // 50  // 58
});                                                                                                        // 51  // 59
                                                                                                           // 52  // 60
var next_devmode_mail_id = 0;                                                                              // 53  // 61
var output_stream = process.stdout;                                                                        // 54  // 62
                                                                                                           // 55  // 63
// Testing hooks                                                                                           // 56  // 64
EmailTest.overrideOutputStream = function (stream) {                                                       // 57  // 65
  next_devmode_mail_id = 0;                                                                                // 58  // 66
  output_stream = stream;                                                                                  // 59  // 67
};                                                                                                         // 60  // 68
                                                                                                           // 61  // 69
EmailTest.restoreOutputStream = function () {                                                              // 62  // 70
  output_stream = process.stdout;                                                                          // 63  // 71
};                                                                                                         // 64  // 72
                                                                                                           // 65  // 73
var devModeSend = function (mc) {                                                                          // 66  // 74
  var devmode_mail_id = next_devmode_mail_id++;                                                            // 67  // 75
                                                                                                           // 68  // 76
  var stream = output_stream;                                                                              // 69  // 77
                                                                                                           // 70  // 78
  // This approach does not prevent other writers to stdout from interleaving.                             // 71  // 79
  stream.write("====== BEGIN MAIL #" + devmode_mail_id + " ======\n");                                     // 72  // 80
  stream.write("(Mail not sent; to enable sending, set the MAIL_URL " +                                    // 73  // 81
               "environment variable.)\n");                                                                // 74  // 82
  mc.streamMessage();                                                                                      // 75  // 83
  mc.pipe(stream, {end: false});                                                                           // 76  // 84
  var future = new Future;                                                                                 // 77  // 85
  mc.on('end', function () {                                                                               // 78  // 86
    stream.write("====== END MAIL #" + devmode_mail_id + " ======\n");                                     // 79  // 87
    future['return']();                                                                                    // 80  // 88
  });                                                                                                      // 81  // 89
  future.wait();                                                                                           // 82  // 90
};                                                                                                         // 83  // 91
                                                                                                           // 84  // 92
var smtpSend = function (pool, mc) {                                                                       // 85  // 93
  pool._future_wrapped_sendMail(mc).wait();                                                                // 86  // 94
};                                                                                                         // 87  // 95
                                                                                                           // 88  // 96
/**                                                                                                        // 89  // 97
 * Mock out email sending (eg, during a test.) This is private for now.                                    // 90  // 98
 *                                                                                                         // 91  // 99
 * f receives the arguments to Email.send and should return true to go                                     // 92  // 100
 * ahead and send the email (or at least, try subsequent hooks), or                                        // 93  // 101
 * false to skip sending.                                                                                  // 94  // 102
 */                                                                                                        // 95  // 103
var sendHooks = [];                                                                                        // 96  // 104
EmailTest.hookSend = function (f) {                                                                        // 97  // 105
  sendHooks.push(f);                                                                                       // 98  // 106
};                                                                                                         // 99  // 107
                                                                                                           // 100
// Old comment below                                                                                       // 101
/**                                                                                                        // 102
 * Send an email.                                                                                          // 103
 *                                                                                                         // 104
 * Connects to the mail server configured via the MAIL_URL environment                                     // 105
 * variable. If unset, prints formatted message to stdout. The "from" option                               // 106
 * is required, and at least one of "to", "cc", and "bcc" must be provided;                                // 107
 * all other options are optional.                                                                         // 108
 *                                                                                                         // 109
 * @param options                                                                                          // 110
 * @param options.from {String} RFC5322 "From:" address                                                    // 111
 * @param options.to {String|String[]} RFC5322 "To:" address[es]                                           // 112
 * @param options.cc {String|String[]} RFC5322 "Cc:" address[es]                                           // 113
 * @param options.bcc {String|String[]} RFC5322 "Bcc:" address[es]                                         // 114
 * @param options.replyTo {String|String[]} RFC5322 "Reply-To:" address[es]                                // 115
 * @param options.subject {String} RFC5322 "Subject:" line                                                 // 116
 * @param options.text {String} RFC5322 mail body (plain text)                                             // 117
 * @param options.html {String} RFC5322 mail body (HTML)                                                   // 118
 * @param options.headers {Object} custom RFC5322 headers (dictionary)                                     // 119
 */                                                                                                        // 120
                                                                                                           // 121
// New API doc comment below                                                                               // 122
/**                                                                                                        // 123
 * @summary Send an email. Throws an `Error` on failure to contact mail server                             // 124
 * or if mail server returns an error. All fields should match                                             // 125
 * [RFC5322](http://tools.ietf.org/html/rfc5322) specification.                                            // 126
 * @locus Server                                                                                           // 127
 * @param {Object} options                                                                                 // 128
 * @param {String} options.from "From:" address (required)                                                 // 129
 * @param {String|String[]} options.to,cc,bcc,replyTo                                                      // 130
 *   "To:", "Cc:", "Bcc:", and "Reply-To:" addresses                                                       // 131
 * @param {String} [options.subject]  "Subject:" line                                                      // 132
 * @param {String} [options.text|html] Mail body (in plain text and/or HTML)                               // 133
 * @param {Object} [options.headers] Dictionary of custom headers                                          // 134
 * @param {Object[]} [options.attachments] Array of attachment objects, as                                 // 135
 * described in the [mailcomposer documentation](https://github.com/andris9/mailcomposer#add-attachments).        // 144
 * @param {MailComposer} [options.mailComposer] A [MailComposer](https://github.com/andris9/mailcomposer)  // 137
 * object representing the message to be sent. Overrides all other options. You                            // 138
 * can access the `mailcomposer` npm module at                                                             // 139
 * `EmailInternals.NpmModules.mailcomposer.module`.                                                        // 140
 */                                                                                                        // 141
Email.send = function (options) {                                                                          // 142
  for (var i = 0; i < sendHooks.length; i++)                                                               // 143
    if (! sendHooks[i](options))                                                                           // 144
      return;                                                                                              // 145
                                                                                                           // 146
  var mc;                                                                                                  // 147
  if (options.mailComposer) {                                                                              // 148
    mc = options.mailComposer;                                                                             // 149
  } else {                                                                                                 // 150
    mc = new MailComposer();                                                                               // 151
                                                                                                           // 152
    // setup message data                                                                                  // 153
    mc.setMessageOption({                                                                                  // 154
      from: options.from,                                                                                  // 155
      to: options.to,                                                                                      // 156
      cc: options.cc,                                                                                      // 157
      bcc: options.bcc,                                                                                    // 158
      replyTo: options.replyTo,                                                                            // 159
      subject: options.subject,                                                                            // 160
      text: options.text,                                                                                  // 161
      html: options.html                                                                                   // 162
    });                                                                                                    // 163
                                                                                                           // 164
    _.each(options.headers, function (value, name) {                                                       // 165
      mc.addHeader(name, value);                                                                           // 166
    });                                                                                                    // 167
                                                                                                           // 168
    _.each(options.attachments, function(attachment){                                                      // 169
      mc.addAttachment(attachment);                                                                        // 170
    });                                                                                                    // 171
  }                                                                                                        // 172
                                                                                                           // 173
  var pool = getPool();                                                                                    // 174
  if (pool) {                                                                                              // 175
    smtpSend(pool, mc);                                                                                    // 176
  } else {                                                                                                 // 177
    devModeSend(mc);                                                                                       // 178
  }                                                                                                        // 179
};                                                                                                         // 180
                                                                                                           // 181
/////////////////////////////////////////////////////////////////////////////////////////////////////////////     // 190
                                                                                                                  // 191
}).call(this);                                                                                                    // 192
                                                                                                                  // 193
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.email = {
  Email: Email,
  EmailInternals: EmailInternals,
  EmailTest: EmailTest
};

})();

//# sourceMappingURL=email.js.map
