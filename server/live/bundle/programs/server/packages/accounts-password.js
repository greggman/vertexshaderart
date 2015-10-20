(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var NpmModuleBcrypt = Package['npm-bcrypt'].NpmModuleBcrypt;
var Accounts = Package['accounts-base'].Accounts;
var AccountsServer = Package['accounts-base'].AccountsServer;
var SRP = Package.srp.SRP;
var SHA256 = Package.sha.SHA256;
var EJSON = Package.ejson.EJSON;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var Random = Package.random.Random;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/accounts-password/packages/accounts-password.js                                                //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
(function(){                                                                                               // 1
                                                                                                           // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////      // 3
//                                                                                                 //      // 4
// packages/accounts-password/email_templates.js                                                   //      // 5
//                                                                                                 //      // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////      // 7
                                                                                                   //      // 8
/**                                                                                                // 1    // 9
 * @summary Options to customize emails sent from the Accounts system.                             // 2    // 10
 * @locus Server                                                                                   // 3    // 11
 */                                                                                                // 4    // 12
Accounts.emailTemplates = {                                                                        // 5    // 13
  from: "Meteor Accounts <no-reply@meteor.com>",                                                   // 6    // 14
  siteName: Meteor.absoluteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),                   // 7    // 15
                                                                                                   // 8    // 16
  resetPassword: {                                                                                 // 9    // 17
    subject: function(user) {                                                                      // 10   // 18
      return "How to reset your password on " + Accounts.emailTemplates.siteName;                  // 11   // 19
    },                                                                                             // 12   // 20
    text: function(user, url) {                                                                    // 13   // 21
      var greeting = (user.profile && user.profile.name) ?                                         // 14   // 22
            ("Hello " + user.profile.name + ",") : "Hello,";                                       // 15   // 23
      return greeting + "\n"                                                                       // 16   // 24
        + "\n"                                                                                     // 17   // 25
        + "To reset your password, simply click the link below.\n"                                 // 18   // 26
        + "\n"                                                                                     // 19   // 27
        + url + "\n"                                                                               // 20   // 28
        + "\n"                                                                                     // 21   // 29
        + "Thanks.\n";                                                                             // 22   // 30
    }                                                                                              // 23   // 31
  },                                                                                               // 24   // 32
  verifyEmail: {                                                                                   // 25   // 33
    subject: function(user) {                                                                      // 26   // 34
      return "How to verify email address on " + Accounts.emailTemplates.siteName;                 // 27   // 35
    },                                                                                             // 28   // 36
    text: function(user, url) {                                                                    // 29   // 37
      var greeting = (user.profile && user.profile.name) ?                                         // 30   // 38
            ("Hello " + user.profile.name + ",") : "Hello,";                                       // 31   // 39
      return greeting + "\n"                                                                       // 32   // 40
        + "\n"                                                                                     // 33   // 41
        + "To verify your account email, simply click the link below.\n"                           // 34   // 42
        + "\n"                                                                                     // 35   // 43
        + url + "\n"                                                                               // 36   // 44
        + "\n"                                                                                     // 37   // 45
        + "Thanks.\n";                                                                             // 38   // 46
    }                                                                                              // 39   // 47
  },                                                                                               // 40   // 48
  enrollAccount: {                                                                                 // 41   // 49
    subject: function(user) {                                                                      // 42   // 50
      return "An account has been created for you on " + Accounts.emailTemplates.siteName;         // 43   // 51
    },                                                                                             // 44   // 52
    text: function(user, url) {                                                                    // 45   // 53
      var greeting = (user.profile && user.profile.name) ?                                         // 46   // 54
            ("Hello " + user.profile.name + ",") : "Hello,";                                       // 47   // 55
      return greeting + "\n"                                                                       // 48   // 56
        + "\n"                                                                                     // 49   // 57
        + "To start using the service, simply click the link below.\n"                             // 50   // 58
        + "\n"                                                                                     // 51   // 59
        + url + "\n"                                                                               // 52   // 60
        + "\n"                                                                                     // 53   // 61
        + "Thanks.\n";                                                                             // 54   // 62
    }                                                                                              // 55   // 63
  }                                                                                                // 56   // 64
};                                                                                                 // 57   // 65
                                                                                                   // 58   // 66
/////////////////////////////////////////////////////////////////////////////////////////////////////      // 67
                                                                                                           // 68
}).call(this);                                                                                             // 69
                                                                                                           // 70
                                                                                                           // 71
                                                                                                           // 72
                                                                                                           // 73
                                                                                                           // 74
                                                                                                           // 75
(function(){                                                                                               // 76
                                                                                                           // 77
/////////////////////////////////////////////////////////////////////////////////////////////////////      // 78
//                                                                                                 //      // 79
// packages/accounts-password/password_server.js                                                   //      // 80
//                                                                                                 //      // 81
/////////////////////////////////////////////////////////////////////////////////////////////////////      // 82
                                                                                                   //      // 83
/// BCRYPT                                                                                         // 1    // 84
                                                                                                   // 2    // 85
var bcrypt = NpmModuleBcrypt;                                                                      // 3    // 86
var bcryptHash = Meteor.wrapAsync(bcrypt.hash);                                                    // 4    // 87
var bcryptCompare = Meteor.wrapAsync(bcrypt.compare);                                              // 5    // 88
                                                                                                   // 6    // 89
// User records have a 'services.password.bcrypt' field on them to hold                            // 7    // 90
// their hashed passwords (unless they have a 'services.password.srp'                              // 8    // 91
// field, in which case they will be upgraded to bcrypt the next time                              // 9    // 92
// they log in).                                                                                   // 10   // 93
//                                                                                                 // 11   // 94
// When the client sends a password to the server, it can either be a                              // 12   // 95
// string (the plaintext password) or an object with keys 'digest' and                             // 13   // 96
// 'algorithm' (must be "sha-256" for now). The Meteor client always sends                         // 14   // 97
// password objects { digest: *, algorithm: "sha-256" }, but DDP clients                           // 15   // 98
// that don't have access to SHA can just send plaintext passwords as                              // 16   // 99
// strings.                                                                                        // 17   // 100
//                                                                                                 // 18   // 101
// When the server receives a plaintext password as a string, it always                            // 19   // 102
// hashes it with SHA256 before passing it into bcrypt. When the server                            // 20   // 103
// receives a password as an object, it asserts that the algorithm is                              // 21   // 104
// "sha-256" and then passes the digest to bcrypt.                                                 // 22   // 105
                                                                                                   // 23   // 106
                                                                                                   // 24   // 107
Accounts._bcryptRounds = 10;                                                                       // 25   // 108
                                                                                                   // 26   // 109
// Given a 'password' from the client, extract the string that we should                           // 27   // 110
// bcrypt. 'password' can be one of:                                                               // 28   // 111
//  - String (the plaintext password)                                                              // 29   // 112
//  - Object with 'digest' and 'algorithm' keys. 'algorithm' must be "sha-256".                    // 30   // 113
//                                                                                                 // 31   // 114
var getPasswordString = function (password) {                                                      // 32   // 115
  if (typeof password === "string") {                                                              // 33   // 116
    password = SHA256(password);                                                                   // 34   // 117
  } else { // 'password' is an object                                                              // 35   // 118
    if (password.algorithm !== "sha-256") {                                                        // 36   // 119
      throw new Error("Invalid password hash algorithm. " +                                        // 37   // 120
                      "Only 'sha-256' is allowed.");                                               // 38   // 121
    }                                                                                              // 39   // 122
    password = password.digest;                                                                    // 40   // 123
  }                                                                                                // 41   // 124
  return password;                                                                                 // 42   // 125
};                                                                                                 // 43   // 126
                                                                                                   // 44   // 127
// Use bcrypt to hash the password for storage in the database.                                    // 45   // 128
// `password` can be a string (in which case it will be run through                                // 46   // 129
// SHA256 before bcrypt) or an object with properties `digest` and                                 // 47   // 130
// `algorithm` (in which case we bcrypt `password.digest`).                                        // 48   // 131
//                                                                                                 // 49   // 132
var hashPassword = function (password) {                                                           // 50   // 133
  password = getPasswordString(password);                                                          // 51   // 134
  return bcryptHash(password, Accounts._bcryptRounds);                                             // 52   // 135
};                                                                                                 // 53   // 136
                                                                                                   // 54   // 137
// Check whether the provided password matches the bcrypt'ed password in                           // 55   // 138
// the database user record. `password` can be a string (in which case                             // 56   // 139
// it will be run through SHA256 before bcrypt) or an object with                                  // 57   // 140
// properties `digest` and `algorithm` (in which case we bcrypt                                    // 58   // 141
// `password.digest`).                                                                             // 59   // 142
//                                                                                                 // 60   // 143
Accounts._checkPassword = function (user, password) {                                              // 61   // 144
  var result = {                                                                                   // 62   // 145
    userId: user._id                                                                               // 63   // 146
  };                                                                                               // 64   // 147
                                                                                                   // 65   // 148
  password = getPasswordString(password);                                                          // 66   // 149
                                                                                                   // 67   // 150
  if (! bcryptCompare(password, user.services.password.bcrypt)) {                                  // 68   // 151
    result.error = new Meteor.Error(403, "Incorrect password");                                    // 69   // 152
  }                                                                                                // 70   // 153
                                                                                                   // 71   // 154
  return result;                                                                                   // 72   // 155
};                                                                                                 // 73   // 156
var checkPassword = Accounts._checkPassword;                                                       // 74   // 157
                                                                                                   // 75   // 158
///                                                                                                // 76   // 159
/// LOGIN                                                                                          // 77   // 160
///                                                                                                // 78   // 161
                                                                                                   // 79   // 162
Accounts._findUserByQuery = function (query) {                                                     // 80   // 163
  var user = null;                                                                                 // 81   // 164
                                                                                                   // 82   // 165
  if (query.id) {                                                                                  // 83   // 166
    user = Meteor.users.findOne({ _id: query.id });                                                // 84   // 167
  } else {                                                                                         // 85   // 168
    var fieldName;                                                                                 // 86   // 169
    var fieldValue;                                                                                // 87   // 170
    if (query.username) {                                                                          // 88   // 171
      fieldName = 'username';                                                                      // 89   // 172
      fieldValue = query.username;                                                                 // 90   // 173
    } else if (query.email) {                                                                      // 91   // 174
      fieldName = 'emails.address';                                                                // 92   // 175
      fieldValue = query.email;                                                                    // 93   // 176
    } else {                                                                                       // 94   // 177
      throw new Error("shouldn't happen (validation missed something)");                           // 95   // 178
    }                                                                                              // 96   // 179
    var selector = {};                                                                             // 97   // 180
    selector[fieldName] = fieldValue;                                                              // 98   // 181
    user = Meteor.users.findOne(selector);                                                         // 99   // 182
    // If user is not found, try a case insensitive lookup                                         // 100  // 183
    if (!user) {                                                                                   // 101  // 184
      selector = selectorForFastCaseInsensitiveLookup(fieldName, fieldValue);                      // 102  // 185
      var candidateUsers = Meteor.users.find(selector).fetch();                                    // 103  // 186
      // No match if multiple candidates are found                                                 // 104  // 187
      if (candidateUsers.length === 1) {                                                           // 105  // 188
        user = candidateUsers[0];                                                                  // 106  // 189
      }                                                                                            // 107  // 190
    }                                                                                              // 108  // 191
  }                                                                                                // 109  // 192
                                                                                                   // 110  // 193
  return user;                                                                                     // 111  // 194
};                                                                                                 // 112  // 195
                                                                                                   // 113  // 196
/**                                                                                                // 114  // 197
 * @summary Finds the user with the specified username.                                            // 115  // 198
 * First tries to match username case sensitively; if that fails, it                               // 116  // 199
 * tries case insensitively; but if more than one user matches the case                            // 117  // 200
 * insensitive search, it returns null.                                                            // 118  // 201
 * @locus Server                                                                                   // 119  // 202
 * @param {String} username The username to look for                                               // 120  // 203
 * @returns {Object} A user if found, else null                                                    // 121  // 204
 */                                                                                                // 122  // 205
Accounts.findUserByUsername = function (username) {                                                // 123  // 206
  return Accounts._findUserByQuery({                                                               // 124  // 207
    username: username                                                                             // 125  // 208
  });                                                                                              // 126  // 209
};                                                                                                 // 127  // 210
                                                                                                   // 128  // 211
/**                                                                                                // 129  // 212
 * @summary Finds the user with the specified email.                                               // 130  // 213
 * First tries to match email case sensitively; if that fails, it                                  // 131  // 214
 * tries case insensitively; but if more than one user matches the case                            // 132  // 215
 * insensitive search, it returns null.                                                            // 133  // 216
 * @locus Server                                                                                   // 134  // 217
 * @param {String} email The email address to look for                                             // 135  // 218
 * @returns {Object} A user if found, else null                                                    // 136  // 219
 */                                                                                                // 137  // 220
Accounts.findUserByEmail = function (email) {                                                      // 138  // 221
  return Accounts._findUserByQuery({                                                               // 139  // 222
    email: email                                                                                   // 140  // 223
  });                                                                                              // 141  // 224
};                                                                                                 // 142  // 225
                                                                                                   // 143  // 226
// Generates a MongoDB selector that can be used to perform a fast case                            // 144  // 227
// insensitive lookup for the given fieldName and string. Since MongoDB does                       // 145  // 228
// not support case insensitive indexes, and case insensitive regex queries                        // 146  // 229
// are slow, we construct a set of prefix selectors for all permutations of                        // 147  // 230
// the first 4 characters ourselves. We first attempt to matching against                          // 148  // 231
// these, and because 'prefix expression' regex queries do use indexes (see                        // 149  // 232
// http://docs.mongodb.org/v2.6/reference/operator/query/regex/#index-use),                        // 150  // 233
// this has been found to greatly improve performance (from 1200ms to 5ms in a                     // 151  // 234
// test with 1.000.000 users).                                                                     // 152  // 235
var selectorForFastCaseInsensitiveLookup = function (fieldName, string) {                          // 153  // 236
  // Performance seems to improve up to 4 prefix characters                                        // 154  // 237
  var prefix = string.substring(0, Math.min(string.length, 4));                                    // 155  // 238
  var orClause = _.map(generateCasePermutationsForString(prefix),                                  // 156  // 239
    function (prefixPermutation) {                                                                 // 157  // 240
      var selector = {};                                                                           // 158  // 241
      selector[fieldName] =                                                                        // 159  // 242
        new RegExp('^' + Meteor._escapeRegExp(prefixPermutation));                                 // 160  // 243
      return selector;                                                                             // 161  // 244
    });                                                                                            // 162  // 245
  var caseInsensitiveClause = {};                                                                  // 163  // 246
  caseInsensitiveClause[fieldName] =                                                               // 164  // 247
    new RegExp('^' + Meteor._escapeRegExp(string) + '$', 'i')                                      // 165  // 248
  return {$and: [{$or: orClause}, caseInsensitiveClause]};                                         // 166  // 249
}                                                                                                  // 167  // 250
                                                                                                   // 168  // 251
// Generates permutations of all case variations of a given string.                                // 169  // 252
var generateCasePermutationsForString = function (string) {                                        // 170  // 253
  var permutations = [''];                                                                         // 171  // 254
  for (var i = 0; i < string.length; i++) {                                                        // 172  // 255
    var ch = string.charAt(i);                                                                     // 173  // 256
    permutations = _.flatten(_.map(permutations, function (prefix) {                               // 174  // 257
      var lowerCaseChar = ch.toLowerCase();                                                        // 175  // 258
      var upperCaseChar = ch.toUpperCase();                                                        // 176  // 259
      // Don't add unneccesary permutations when ch is not a letter                                // 177  // 260
      if (lowerCaseChar === upperCaseChar) {                                                       // 178  // 261
        return [prefix + ch];                                                                      // 179  // 262
      } else {                                                                                     // 180  // 263
        return [prefix + lowerCaseChar, prefix + upperCaseChar];                                   // 181  // 264
      }                                                                                            // 182  // 265
    }));                                                                                           // 183  // 266
  }                                                                                                // 184  // 267
  return permutations;                                                                             // 185  // 268
}                                                                                                  // 186  // 269
                                                                                                   // 187  // 270
var checkForCaseInsensitiveDuplicates = function (fieldName, displayName, fieldValue, ownUserId) {         // 271
  // Some tests need the ability to add users with the same case insensitive                       // 189  // 272
  // value, hence the _skipCaseInsensitiveChecksForTest check                                      // 190  // 273
  var skipCheck = _.has(Accounts._skipCaseInsensitiveChecksForTest, fieldValue);                   // 191  // 274
                                                                                                   // 192  // 275
  if (fieldValue && !skipCheck) {                                                                  // 193  // 276
    var matchedUsers = Meteor.users.find(                                                          // 194  // 277
      selectorForFastCaseInsensitiveLookup(fieldName, fieldValue)).fetch();                        // 195  // 278
                                                                                                   // 196  // 279
    if (matchedUsers.length > 0 &&                                                                 // 197  // 280
        // If we don't have a userId yet, any match we find is a duplicate                         // 198  // 281
        (!ownUserId ||                                                                             // 199  // 282
        // Otherwise, check to see if there are multiple matches or a match                        // 200  // 283
        // that is not us                                                                          // 201  // 284
        (matchedUsers.length > 1 || matchedUsers[0]._id !== ownUserId))) {                         // 202  // 285
      throw new Meteor.Error(403, displayName + " already exists.");                               // 203  // 286
    }                                                                                              // 204  // 287
  }                                                                                                // 205  // 288
};                                                                                                 // 206  // 289
                                                                                                   // 207  // 290
// XXX maybe this belongs in the check package                                                     // 208  // 291
var NonEmptyString = Match.Where(function (x) {                                                    // 209  // 292
  check(x, String);                                                                                // 210  // 293
  return x.length > 0;                                                                             // 211  // 294
});                                                                                                // 212  // 295
                                                                                                   // 213  // 296
var userQueryValidator = Match.Where(function (user) {                                             // 214  // 297
  check(user, {                                                                                    // 215  // 298
    id: Match.Optional(NonEmptyString),                                                            // 216  // 299
    username: Match.Optional(NonEmptyString),                                                      // 217  // 300
    email: Match.Optional(NonEmptyString)                                                          // 218  // 301
  });                                                                                              // 219  // 302
  if (_.keys(user).length !== 1)                                                                   // 220  // 303
    throw new Match.Error("User property must have exactly one field");                            // 221  // 304
  return true;                                                                                     // 222  // 305
});                                                                                                // 223  // 306
                                                                                                   // 224  // 307
var passwordValidator = Match.OneOf(                                                               // 225  // 308
  String,                                                                                          // 226  // 309
  { digest: String, algorithm: String }                                                            // 227  // 310
);                                                                                                 // 228  // 311
                                                                                                   // 229  // 312
// Handler to login with a password.                                                               // 230  // 313
//                                                                                                 // 231  // 314
// The Meteor client sets options.password to an object with keys                                  // 232  // 315
// 'digest' (set to SHA256(password)) and 'algorithm' ("sha-256").                                 // 233  // 316
//                                                                                                 // 234  // 317
// For other DDP clients which don't have access to SHA, the handler                               // 235  // 318
// also accepts the plaintext password in options.password as a string.                            // 236  // 319
//                                                                                                 // 237  // 320
// (It might be nice if servers could turn the plaintext password                                  // 238  // 321
// option off. Or maybe it should be opt-in, not opt-out?                                          // 239  // 322
// Accounts.config option?)                                                                        // 240  // 323
//                                                                                                 // 241  // 324
// Note that neither password option is secure without SSL.                                        // 242  // 325
//                                                                                                 // 243  // 326
Accounts.registerLoginHandler("password", function (options) {                                     // 244  // 327
  if (! options.password || options.srp)                                                           // 245  // 328
    return undefined; // don't handle                                                              // 246  // 329
                                                                                                   // 247  // 330
  check(options, {                                                                                 // 248  // 331
    user: userQueryValidator,                                                                      // 249  // 332
    password: passwordValidator                                                                    // 250  // 333
  });                                                                                              // 251  // 334
                                                                                                   // 252  // 335
                                                                                                   // 253  // 336
  var user = Accounts._findUserByQuery(options.user);                                              // 254  // 337
  if (!user)                                                                                       // 255  // 338
    throw new Meteor.Error(403, "User not found");                                                 // 256  // 339
                                                                                                   // 257  // 340
  if (!user.services || !user.services.password ||                                                 // 258  // 341
      !(user.services.password.bcrypt || user.services.password.srp))                              // 259  // 342
    throw new Meteor.Error(403, "User has no password set");                                       // 260  // 343
                                                                                                   // 261  // 344
  if (!user.services.password.bcrypt) {                                                            // 262  // 345
    if (typeof options.password === "string") {                                                    // 263  // 346
      // The client has presented a plaintext password, and the user is                            // 264  // 347
      // not upgraded to bcrypt yet. We don't attempt to tell the client                           // 265  // 348
      // to upgrade to bcrypt, because it might be a standalone DDP                                // 266  // 349
      // client doesn't know how to do such a thing.                                               // 267  // 350
      var verifier = user.services.password.srp;                                                   // 268  // 351
      var newVerifier = SRP.generateVerifier(options.password, {                                   // 269  // 352
        identity: verifier.identity, salt: verifier.salt});                                        // 270  // 353
                                                                                                   // 271  // 354
      if (verifier.verifier !== newVerifier.verifier) {                                            // 272  // 355
        return {                                                                                   // 273  // 356
          userId: user._id,                                                                        // 274  // 357
          error: new Meteor.Error(403, "Incorrect password")                                       // 275  // 358
        };                                                                                         // 276  // 359
      }                                                                                            // 277  // 360
                                                                                                   // 278  // 361
      return {userId: user._id};                                                                   // 279  // 362
    } else {                                                                                       // 280  // 363
      // Tell the client to use the SRP upgrade process.                                           // 281  // 364
      throw new Meteor.Error(400, "old password format", EJSON.stringify({                         // 282  // 365
        format: 'srp',                                                                             // 283  // 366
        identity: user.services.password.srp.identity                                              // 284  // 367
      }));                                                                                         // 285  // 368
    }                                                                                              // 286  // 369
  }                                                                                                // 287  // 370
                                                                                                   // 288  // 371
  return checkPassword(                                                                            // 289  // 372
    user,                                                                                          // 290  // 373
    options.password                                                                               // 291  // 374
  );                                                                                               // 292  // 375
});                                                                                                // 293  // 376
                                                                                                   // 294  // 377
// Handler to login using the SRP upgrade path. To use this login                                  // 295  // 378
// handler, the client must provide:                                                               // 296  // 379
//   - srp: H(identity + ":" + password)                                                           // 297  // 380
//   - password: a string or an object with properties 'digest' and 'algorithm'                    // 298  // 381
//                                                                                                 // 299  // 382
// We use `options.srp` to verify that the client knows the correct                                // 300  // 383
// password without doing a full SRP flow. Once we've checked that, we                             // 301  // 384
// upgrade the user to bcrypt and remove the SRP information from the                              // 302  // 385
// user document.                                                                                  // 303  // 386
//                                                                                                 // 304  // 387
// The client ends up using this login handler after trying the normal                             // 305  // 388
// login handler (above), which throws an error telling the client to                              // 306  // 389
// try the SRP upgrade path.                                                                       // 307  // 390
//                                                                                                 // 308  // 391
// XXX COMPAT WITH 0.8.1.3                                                                         // 309  // 392
Accounts.registerLoginHandler("password", function (options) {                                     // 310  // 393
  if (!options.srp || !options.password)                                                           // 311  // 394
    return undefined; // don't handle                                                              // 312  // 395
                                                                                                   // 313  // 396
  check(options, {                                                                                 // 314  // 397
    user: userQueryValidator,                                                                      // 315  // 398
    srp: String,                                                                                   // 316  // 399
    password: passwordValidator                                                                    // 317  // 400
  });                                                                                              // 318  // 401
                                                                                                   // 319  // 402
  var user = Accounts._findUserByQuery(options.user);                                              // 320  // 403
  if (!user)                                                                                       // 321  // 404
    throw new Meteor.Error(403, "User not found");                                                 // 322  // 405
                                                                                                   // 323  // 406
  // Check to see if another simultaneous login has already upgraded                               // 324  // 407
  // the user record to bcrypt.                                                                    // 325  // 408
  if (user.services && user.services.password && user.services.password.bcrypt)                    // 326  // 409
    return checkPassword(user, options.password);                                                  // 327  // 410
                                                                                                   // 328  // 411
  if (!(user.services && user.services.password && user.services.password.srp))                    // 329  // 412
    throw new Meteor.Error(403, "User has no password set");                                       // 330  // 413
                                                                                                   // 331  // 414
  var v1 = user.services.password.srp.verifier;                                                    // 332  // 415
  var v2 = SRP.generateVerifier(                                                                   // 333  // 416
    null,                                                                                          // 334  // 417
    {                                                                                              // 335  // 418
      hashedIdentityAndPassword: options.srp,                                                      // 336  // 419
      salt: user.services.password.srp.salt                                                        // 337  // 420
    }                                                                                              // 338  // 421
  ).verifier;                                                                                      // 339  // 422
  if (v1 !== v2)                                                                                   // 340  // 423
    return {                                                                                       // 341  // 424
      userId: user._id,                                                                            // 342  // 425
      error: new Meteor.Error(403, "Incorrect password")                                           // 343  // 426
    };                                                                                             // 344  // 427
                                                                                                   // 345  // 428
  // Upgrade to bcrypt on successful login.                                                        // 346  // 429
  var salted = hashPassword(options.password);                                                     // 347  // 430
  Meteor.users.update(                                                                             // 348  // 431
    user._id,                                                                                      // 349  // 432
    {                                                                                              // 350  // 433
      $unset: { 'services.password.srp': 1 },                                                      // 351  // 434
      $set: { 'services.password.bcrypt': salted }                                                 // 352  // 435
    }                                                                                              // 353  // 436
  );                                                                                               // 354  // 437
                                                                                                   // 355  // 438
  return {userId: user._id};                                                                       // 356  // 439
});                                                                                                // 357  // 440
                                                                                                   // 358  // 441
                                                                                                   // 359  // 442
///                                                                                                // 360  // 443
/// CHANGING                                                                                       // 361  // 444
///                                                                                                // 362  // 445
                                                                                                   // 363  // 446
/**                                                                                                // 364  // 447
 * @summary Change a user's username. Use this instead of updating the                             // 365  // 448
 * database directly. The operation will fail if there is an existing user                         // 366  // 449
 * with a username only differing in case.                                                         // 367  // 450
 * @locus Server                                                                                   // 368  // 451
 * @param {String} userId The ID of the user to update.                                            // 369  // 452
 * @param {String} newUsername A new username for the user.                                        // 370  // 453
 */                                                                                                // 371  // 454
Accounts.setUsername = function (userId, newUsername) {                                            // 372  // 455
  check(userId, NonEmptyString);                                                                   // 373  // 456
  check(newUsername, NonEmptyString);                                                              // 374  // 457
                                                                                                   // 375  // 458
  var user = Meteor.users.findOne(userId);                                                         // 376  // 459
  if (!user)                                                                                       // 377  // 460
    throw new Meteor.Error(403, "User not found");                                                 // 378  // 461
                                                                                                   // 379  // 462
  var oldUsername = user.username;                                                                 // 380  // 463
                                                                                                   // 381  // 464
  // Perform a case insensitive check fro duplicates before update                                 // 382  // 465
  checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);                // 383  // 466
                                                                                                   // 384  // 467
  Meteor.users.update({_id: user._id}, {$set: {username: newUsername}});                           // 385  // 468
                                                                                                   // 386  // 469
  // Perform another check after update, in case a matching user has been                          // 387  // 470
  // inserted in the meantime                                                                      // 388  // 471
  try {                                                                                            // 389  // 472
    checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);              // 390  // 473
  } catch (ex) {                                                                                   // 391  // 474
    // Undo update if the check fails                                                              // 392  // 475
    Meteor.users.update({_id: user._id}, {$set: {username: oldUsername}});                         // 393  // 476
    throw ex;                                                                                      // 394  // 477
  }                                                                                                // 395  // 478
};                                                                                                 // 396  // 479
                                                                                                   // 397  // 480
// Let the user change their own password if they know the old                                     // 398  // 481
// password. `oldPassword` and `newPassword` should be objects with keys                           // 399  // 482
// `digest` and `algorithm` (representing the SHA256 of the password).                             // 400  // 483
//                                                                                                 // 401  // 484
// XXX COMPAT WITH 0.8.1.3                                                                         // 402  // 485
// Like the login method, if the user hasn't been upgraded from SRP to                             // 403  // 486
// bcrypt yet, then this method will throw an 'old password format'                                // 404  // 487
// error. The client should call the SRP upgrade login handler and then                            // 405  // 488
// retry this method again.                                                                        // 406  // 489
//                                                                                                 // 407  // 490
// UNLIKE the login method, there is no way to avoid getting SRP upgrade                           // 408  // 491
// errors thrown. The reasoning for this is that clients using this                                // 409  // 492
// method directly will need to be updated anyway because we no longer                             // 410  // 493
// support the SRP flow that they would have been doing to use this                                // 411  // 494
// method previously.                                                                              // 412  // 495
Meteor.methods({changePassword: function (oldPassword, newPassword) {                              // 413  // 496
  check(oldPassword, passwordValidator);                                                           // 414  // 497
  check(newPassword, passwordValidator);                                                           // 415  // 498
                                                                                                   // 416  // 499
  if (!this.userId)                                                                                // 417  // 500
    throw new Meteor.Error(401, "Must be logged in");                                              // 418  // 501
                                                                                                   // 419  // 502
  var user = Meteor.users.findOne(this.userId);                                                    // 420  // 503
  if (!user)                                                                                       // 421  // 504
    throw new Meteor.Error(403, "User not found");                                                 // 422  // 505
                                                                                                   // 423  // 506
  if (!user.services || !user.services.password ||                                                 // 424  // 507
      (!user.services.password.bcrypt && !user.services.password.srp))                             // 425  // 508
    throw new Meteor.Error(403, "User has no password set");                                       // 426  // 509
                                                                                                   // 427  // 510
  if (! user.services.password.bcrypt) {                                                           // 428  // 511
    throw new Meteor.Error(400, "old password format", EJSON.stringify({                           // 429  // 512
      format: 'srp',                                                                               // 430  // 513
      identity: user.services.password.srp.identity                                                // 431  // 514
    }));                                                                                           // 432  // 515
  }                                                                                                // 433  // 516
                                                                                                   // 434  // 517
  var result = checkPassword(user, oldPassword);                                                   // 435  // 518
  if (result.error)                                                                                // 436  // 519
    throw result.error;                                                                            // 437  // 520
                                                                                                   // 438  // 521
  var hashed = hashPassword(newPassword);                                                          // 439  // 522
                                                                                                   // 440  // 523
  // It would be better if this removed ALL existing tokens and replaced                           // 441  // 524
  // the token for the current connection with a new one, but that would                           // 442  // 525
  // be tricky, so we'll settle for just replacing all tokens other than                           // 443  // 526
  // the one for the current connection.                                                           // 444  // 527
  var currentToken = Accounts._getLoginToken(this.connection.id);                                  // 445  // 528
  Meteor.users.update(                                                                             // 446  // 529
    { _id: this.userId },                                                                          // 447  // 530
    {                                                                                              // 448  // 531
      $set: { 'services.password.bcrypt': hashed },                                                // 449  // 532
      $pull: {                                                                                     // 450  // 533
        'services.resume.loginTokens': { hashedToken: { $ne: currentToken } }                      // 451  // 534
      },                                                                                           // 452  // 535
      $unset: { 'services.password.reset': 1 }                                                     // 453  // 536
    }                                                                                              // 454  // 537
  );                                                                                               // 455  // 538
                                                                                                   // 456  // 539
  return {passwordChanged: true};                                                                  // 457  // 540
}});                                                                                               // 458  // 541
                                                                                                   // 459  // 542
                                                                                                   // 460  // 543
// Force change the users password.                                                                // 461  // 544
                                                                                                   // 462  // 545
/**                                                                                                // 463  // 546
 * @summary Forcibly change the password for a user.                                               // 464  // 547
 * @locus Server                                                                                   // 465  // 548
 * @param {String} userId The id of the user to update.                                            // 466  // 549
 * @param {String} newPassword A new password for the user.                                        // 467  // 550
 * @param {Object} [options]                                                                       // 468  // 551
 * @param {Object} options.logout Logout all current connections with this userId (default: true)  // 469  // 552
 */                                                                                                // 470  // 553
Accounts.setPassword = function (userId, newPlaintextPassword, options) {                          // 471  // 554
  options = _.extend({logout: true}, options);                                                     // 472  // 555
                                                                                                   // 473  // 556
  var user = Meteor.users.findOne(userId);                                                         // 474  // 557
  if (!user)                                                                                       // 475  // 558
    throw new Meteor.Error(403, "User not found");                                                 // 476  // 559
                                                                                                   // 477  // 560
  var update = {                                                                                   // 478  // 561
    $unset: {                                                                                      // 479  // 562
      'services.password.srp': 1, // XXX COMPAT WITH 0.8.1.3                                       // 480  // 563
      'services.password.reset': 1                                                                 // 481  // 564
    },                                                                                             // 482  // 565
    $set: {'services.password.bcrypt': hashPassword(newPlaintextPassword)}                         // 483  // 566
  };                                                                                               // 484  // 567
                                                                                                   // 485  // 568
  if (options.logout) {                                                                            // 486  // 569
    update.$unset['services.resume.loginTokens'] = 1;                                              // 487  // 570
  }                                                                                                // 488  // 571
                                                                                                   // 489  // 572
  Meteor.users.update({_id: user._id}, update);                                                    // 490  // 573
};                                                                                                 // 491  // 574
                                                                                                   // 492  // 575
                                                                                                   // 493  // 576
///                                                                                                // 494  // 577
/// RESETTING VIA EMAIL                                                                            // 495  // 578
///                                                                                                // 496  // 579
                                                                                                   // 497  // 580
// Method called by a user to request a password reset email. This is                              // 498  // 581
// the start of the reset process.                                                                 // 499  // 582
Meteor.methods({forgotPassword: function (options) {                                               // 500  // 583
  check(options, {email: String});                                                                 // 501  // 584
                                                                                                   // 502  // 585
  var user = Meteor.users.findOne({"emails.address": options.email});                              // 503  // 586
  if (!user)                                                                                       // 504  // 587
    throw new Meteor.Error(403, "User not found");                                                 // 505  // 588
                                                                                                   // 506  // 589
  Accounts.sendResetPasswordEmail(user._id, options.email);                                        // 507  // 590
}});                                                                                               // 508  // 591
                                                                                                   // 509  // 592
// send the user an email with a link that when opened allows the user                             // 510  // 593
// to set a new password, without the old password.                                                // 511  // 594
                                                                                                   // 512  // 595
/**                                                                                                // 513  // 596
 * @summary Send an email with a link the user can use to reset their password.                    // 514  // 597
 * @locus Server                                                                                   // 515  // 598
 * @param {String} userId The id of the user to send email to.                                     // 516  // 599
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
 */                                                                                                // 518  // 601
Accounts.sendResetPasswordEmail = function (userId, email) {                                       // 519  // 602
  // Make sure the user exists, and email is one of their addresses.                               // 520  // 603
  var user = Meteor.users.findOne(userId);                                                         // 521  // 604
  if (!user)                                                                                       // 522  // 605
    throw new Error("Can't find user");                                                            // 523  // 606
  // pick the first email if we weren't passed an email.                                           // 524  // 607
  if (!email && user.emails && user.emails[0])                                                     // 525  // 608
    email = user.emails[0].address;                                                                // 526  // 609
  // make sure we have a valid email                                                               // 527  // 610
  if (!email || !_.contains(_.pluck(user.emails || [], 'address'), email))                         // 528  // 611
    throw new Error("No such email for user.");                                                    // 529  // 612
                                                                                                   // 530  // 613
  var token = Random.secret();                                                                     // 531  // 614
  var when = new Date();                                                                           // 532  // 615
  var tokenRecord = {                                                                              // 533  // 616
    token: token,                                                                                  // 534  // 617
    email: email,                                                                                  // 535  // 618
    when: when                                                                                     // 536  // 619
  };                                                                                               // 537  // 620
  Meteor.users.update(userId, {$set: {                                                             // 538  // 621
    "services.password.reset": tokenRecord                                                         // 539  // 622
  }});                                                                                             // 540  // 623
  // before passing to template, update user object with new token                                 // 541  // 624
  Meteor._ensure(user, 'services', 'password').reset = tokenRecord;                                // 542  // 625
                                                                                                   // 543  // 626
  var resetPasswordUrl = Accounts.urls.resetPassword(token);                                       // 544  // 627
                                                                                                   // 545  // 628
  var options = {                                                                                  // 546  // 629
    to: email,                                                                                     // 547  // 630
    from: Accounts.emailTemplates.resetPassword.from                                               // 548  // 631
      ? Accounts.emailTemplates.resetPassword.from(user)                                           // 549  // 632
      : Accounts.emailTemplates.from,                                                              // 550  // 633
    subject: Accounts.emailTemplates.resetPassword.subject(user)                                   // 551  // 634
  };                                                                                               // 552  // 635
                                                                                                   // 553  // 636
  if (typeof Accounts.emailTemplates.resetPassword.text === 'function') {                          // 554  // 637
    options.text =                                                                                 // 555  // 638
      Accounts.emailTemplates.resetPassword.text(user, resetPasswordUrl);                          // 556  // 639
  }                                                                                                // 557  // 640
                                                                                                   // 558  // 641
  if (typeof Accounts.emailTemplates.resetPassword.html === 'function')                            // 559  // 642
    options.html =                                                                                 // 560  // 643
      Accounts.emailTemplates.resetPassword.html(user, resetPasswordUrl);                          // 561  // 644
                                                                                                   // 562  // 645
  if (typeof Accounts.emailTemplates.headers === 'object') {                                       // 563  // 646
    options.headers = Accounts.emailTemplates.headers;                                             // 564  // 647
  }                                                                                                // 565  // 648
                                                                                                   // 566  // 649
  Email.send(options);                                                                             // 567  // 650
};                                                                                                 // 568  // 651
                                                                                                   // 569  // 652
// send the user an email informing them that their account was created, with                      // 570  // 653
// a link that when opened both marks their email as verified and forces them                      // 571  // 654
// to choose their password. The email must be one of the addresses in the                         // 572  // 655
// user's emails field, or undefined to pick the first email automatically.                        // 573  // 656
//                                                                                                 // 574  // 657
// This is not called automatically. It must be called manually if you                             // 575  // 658
// want to use enrollment emails.                                                                  // 576  // 659
                                                                                                   // 577  // 660
/**                                                                                                // 578  // 661
 * @summary Send an email with a link the user can use to set their initial password.              // 579  // 662
 * @locus Server                                                                                   // 580  // 663
 * @param {String} userId The id of the user to send email to.                                     // 581  // 664
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
 */                                                                                                // 583  // 666
Accounts.sendEnrollmentEmail = function (userId, email) {                                          // 584  // 667
  // XXX refactor! This is basically identical to sendResetPasswordEmail.                          // 585  // 668
                                                                                                   // 586  // 669
  // Make sure the user exists, and email is in their addresses.                                   // 587  // 670
  var user = Meteor.users.findOne(userId);                                                         // 588  // 671
  if (!user)                                                                                       // 589  // 672
    throw new Error("Can't find user");                                                            // 590  // 673
  // pick the first email if we weren't passed an email.                                           // 591  // 674
  if (!email && user.emails && user.emails[0])                                                     // 592  // 675
    email = user.emails[0].address;                                                                // 593  // 676
  // make sure we have a valid email                                                               // 594  // 677
  if (!email || !_.contains(_.pluck(user.emails || [], 'address'), email))                         // 595  // 678
    throw new Error("No such email for user.");                                                    // 596  // 679
                                                                                                   // 597  // 680
  var token = Random.secret();                                                                     // 598  // 681
  var when = new Date();                                                                           // 599  // 682
  var tokenRecord = {                                                                              // 600  // 683
    token: token,                                                                                  // 601  // 684
    email: email,                                                                                  // 602  // 685
    when: when                                                                                     // 603  // 686
  };                                                                                               // 604  // 687
  Meteor.users.update(userId, {$set: {                                                             // 605  // 688
    "services.password.reset": tokenRecord                                                         // 606  // 689
  }});                                                                                             // 607  // 690
                                                                                                   // 608  // 691
  // before passing to template, update user object with new token                                 // 609  // 692
  Meteor._ensure(user, 'services', 'password').reset = tokenRecord;                                // 610  // 693
                                                                                                   // 611  // 694
  var enrollAccountUrl = Accounts.urls.enrollAccount(token);                                       // 612  // 695
                                                                                                   // 613  // 696
  var options = {                                                                                  // 614  // 697
    to: email,                                                                                     // 615  // 698
    from: Accounts.emailTemplates.enrollAccount.from                                               // 616  // 699
      ? Accounts.emailTemplates.enrollAccount.from(user)                                           // 617  // 700
      : Accounts.emailTemplates.from,                                                              // 618  // 701
    subject: Accounts.emailTemplates.enrollAccount.subject(user)                                   // 619  // 702
  };                                                                                               // 620  // 703
                                                                                                   // 621  // 704
  if (typeof Accounts.emailTemplates.enrollAccount.text === 'function') {                          // 622  // 705
    options.text =                                                                                 // 623  // 706
      Accounts.emailTemplates.enrollAccount.text(user, enrollAccountUrl);                          // 624  // 707
  }                                                                                                // 625  // 708
                                                                                                   // 626  // 709
  if (typeof Accounts.emailTemplates.enrollAccount.html === 'function')                            // 627  // 710
    options.html =                                                                                 // 628  // 711
      Accounts.emailTemplates.enrollAccount.html(user, enrollAccountUrl);                          // 629  // 712
                                                                                                   // 630  // 713
  if (typeof Accounts.emailTemplates.headers === 'object') {                                       // 631  // 714
    options.headers = Accounts.emailTemplates.headers;                                             // 632  // 715
  }                                                                                                // 633  // 716
                                                                                                   // 634  // 717
  Email.send(options);                                                                             // 635  // 718
};                                                                                                 // 636  // 719
                                                                                                   // 637  // 720
                                                                                                   // 638  // 721
// Take token from sendResetPasswordEmail or sendEnrollmentEmail, change                           // 639  // 722
// the users password, and log them in.                                                            // 640  // 723
Meteor.methods({resetPassword: function (token, newPassword) {                                     // 641  // 724
  var self = this;                                                                                 // 642  // 725
  return Accounts._loginMethod(                                                                    // 643  // 726
    self,                                                                                          // 644  // 727
    "resetPassword",                                                                               // 645  // 728
    arguments,                                                                                     // 646  // 729
    "password",                                                                                    // 647  // 730
    function () {                                                                                  // 648  // 731
      check(token, String);                                                                        // 649  // 732
      check(newPassword, passwordValidator);                                                       // 650  // 733
                                                                                                   // 651  // 734
      var user = Meteor.users.findOne({                                                            // 652  // 735
        "services.password.reset.token": token});                                                  // 653  // 736
      if (!user)                                                                                   // 654  // 737
        throw new Meteor.Error(403, "Token expired");                                              // 655  // 738
      var email = user.services.password.reset.email;                                              // 656  // 739
      if (!_.include(_.pluck(user.emails || [], 'address'), email))                                // 657  // 740
        return {                                                                                   // 658  // 741
          userId: user._id,                                                                        // 659  // 742
          error: new Meteor.Error(403, "Token has invalid email address")                          // 660  // 743
        };                                                                                         // 661  // 744
                                                                                                   // 662  // 745
      var hashed = hashPassword(newPassword);                                                      // 663  // 746
                                                                                                   // 664  // 747
      // NOTE: We're about to invalidate tokens on the user, who we might be                       // 665  // 748
      // logged in as. Make sure to avoid logging ourselves out if this                            // 666  // 749
      // happens. But also make sure not to leave the connection in a state                        // 667  // 750
      // of having a bad token set if things fail.                                                 // 668  // 751
      var oldToken = Accounts._getLoginToken(self.connection.id);                                  // 669  // 752
      Accounts._setLoginToken(user._id, self.connection, null);                                    // 670  // 753
      var resetToOldToken = function () {                                                          // 671  // 754
        Accounts._setLoginToken(user._id, self.connection, oldToken);                              // 672  // 755
      };                                                                                           // 673  // 756
                                                                                                   // 674  // 757
      try {                                                                                        // 675  // 758
        // Update the user record by:                                                              // 676  // 759
        // - Changing the password to the new one                                                  // 677  // 760
        // - Forgetting about the reset token that was just used                                   // 678  // 761
        // - Verifying their email, since they got the password reset via email.                   // 679  // 762
        var affectedRecords = Meteor.users.update(                                                 // 680  // 763
          {                                                                                        // 681  // 764
            _id: user._id,                                                                         // 682  // 765
            'emails.address': email,                                                               // 683  // 766
            'services.password.reset.token': token                                                 // 684  // 767
          },                                                                                       // 685  // 768
          {$set: {'services.password.bcrypt': hashed,                                              // 686  // 769
                  'emails.$.verified': true},                                                      // 687  // 770
           $unset: {'services.password.reset': 1,                                                  // 688  // 771
                    'services.password.srp': 1}});                                                 // 689  // 772
        if (affectedRecords !== 1)                                                                 // 690  // 773
          return {                                                                                 // 691  // 774
            userId: user._id,                                                                      // 692  // 775
            error: new Meteor.Error(403, "Invalid email")                                          // 693  // 776
          };                                                                                       // 694  // 777
      } catch (err) {                                                                              // 695  // 778
        resetToOldToken();                                                                         // 696  // 779
        throw err;                                                                                 // 697  // 780
      }                                                                                            // 698  // 781
                                                                                                   // 699  // 782
      // Replace all valid login tokens with new ones (changing                                    // 700  // 783
      // password should invalidate existing sessions).                                            // 701  // 784
      Accounts._clearAllLoginTokens(user._id);                                                     // 702  // 785
                                                                                                   // 703  // 786
      return {userId: user._id};                                                                   // 704  // 787
    }                                                                                              // 705  // 788
  );                                                                                               // 706  // 789
}});                                                                                               // 707  // 790
                                                                                                   // 708  // 791
///                                                                                                // 709  // 792
/// EMAIL VERIFICATION                                                                             // 710  // 793
///                                                                                                // 711  // 794
                                                                                                   // 712  // 795
                                                                                                   // 713  // 796
// send the user an email with a link that when opened marks that                                  // 714  // 797
// address as verified                                                                             // 715  // 798
                                                                                                   // 716  // 799
/**                                                                                                // 717  // 800
 * @summary Send an email with a link the user can use verify their email address.                 // 718  // 801
 * @locus Server                                                                                   // 719  // 802
 * @param {String} userId The id of the user to send email to.                                     // 720  // 803
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first unverified email in the list.
 */                                                                                                // 722  // 805
Accounts.sendVerificationEmail = function (userId, address) {                                      // 723  // 806
  // XXX Also generate a link using which someone can delete this                                  // 724  // 807
  // account if they own said address but weren't those who created                                // 725  // 808
  // this account.                                                                                 // 726  // 809
                                                                                                   // 727  // 810
  // Make sure the user exists, and address is one of their addresses.                             // 728  // 811
  var user = Meteor.users.findOne(userId);                                                         // 729  // 812
  if (!user)                                                                                       // 730  // 813
    throw new Error("Can't find user");                                                            // 731  // 814
  // pick the first unverified address if we weren't passed an address.                            // 732  // 815
  if (!address) {                                                                                  // 733  // 816
    var email = _.find(user.emails || [],                                                          // 734  // 817
                       function (e) { return !e.verified; });                                      // 735  // 818
    address = (email || {}).address;                                                               // 736  // 819
  }                                                                                                // 737  // 820
  // make sure we have a valid address                                                             // 738  // 821
  if (!address || !_.contains(_.pluck(user.emails || [], 'address'), address))                     // 739  // 822
    throw new Error("No such email address for user.");                                            // 740  // 823
                                                                                                   // 741  // 824
                                                                                                   // 742  // 825
  var tokenRecord = {                                                                              // 743  // 826
    token: Random.secret(),                                                                        // 744  // 827
    address: address,                                                                              // 745  // 828
    when: new Date()};                                                                             // 746  // 829
  Meteor.users.update(                                                                             // 747  // 830
    {_id: userId},                                                                                 // 748  // 831
    {$push: {'services.email.verificationTokens': tokenRecord}});                                  // 749  // 832
                                                                                                   // 750  // 833
  // before passing to template, update user object with new token                                 // 751  // 834
  Meteor._ensure(user, 'services', 'email');                                                       // 752  // 835
  if (!user.services.email.verificationTokens) {                                                   // 753  // 836
    user.services.email.verificationTokens = [];                                                   // 754  // 837
  }                                                                                                // 755  // 838
  user.services.email.verificationTokens.push(tokenRecord);                                        // 756  // 839
                                                                                                   // 757  // 840
  var verifyEmailUrl = Accounts.urls.verifyEmail(tokenRecord.token);                               // 758  // 841
                                                                                                   // 759  // 842
  var options = {                                                                                  // 760  // 843
    to: address,                                                                                   // 761  // 844
    from: Accounts.emailTemplates.verifyEmail.from                                                 // 762  // 845
      ? Accounts.emailTemplates.verifyEmail.from(user)                                             // 763  // 846
      : Accounts.emailTemplates.from,                                                              // 764  // 847
    subject: Accounts.emailTemplates.verifyEmail.subject(user)                                     // 765  // 848
  };                                                                                               // 766  // 849
                                                                                                   // 767  // 850
  if (typeof Accounts.emailTemplates.verifyEmail.text === 'function') {                            // 768  // 851
    options.text =                                                                                 // 769  // 852
      Accounts.emailTemplates.verifyEmail.text(user, verifyEmailUrl);                              // 770  // 853
  }                                                                                                // 771  // 854
                                                                                                   // 772  // 855
  if (typeof Accounts.emailTemplates.verifyEmail.html === 'function')                              // 773  // 856
    options.html =                                                                                 // 774  // 857
      Accounts.emailTemplates.verifyEmail.html(user, verifyEmailUrl);                              // 775  // 858
                                                                                                   // 776  // 859
  if (typeof Accounts.emailTemplates.headers === 'object') {                                       // 777  // 860
    options.headers = Accounts.emailTemplates.headers;                                             // 778  // 861
  }                                                                                                // 779  // 862
                                                                                                   // 780  // 863
  Email.send(options);                                                                             // 781  // 864
};                                                                                                 // 782  // 865
                                                                                                   // 783  // 866
// Take token from sendVerificationEmail, mark the email as verified,                              // 784  // 867
// and log them in.                                                                                // 785  // 868
Meteor.methods({verifyEmail: function (token) {                                                    // 786  // 869
  var self = this;                                                                                 // 787  // 870
  return Accounts._loginMethod(                                                                    // 788  // 871
    self,                                                                                          // 789  // 872
    "verifyEmail",                                                                                 // 790  // 873
    arguments,                                                                                     // 791  // 874
    "password",                                                                                    // 792  // 875
    function () {                                                                                  // 793  // 876
      check(token, String);                                                                        // 794  // 877
                                                                                                   // 795  // 878
      var user = Meteor.users.findOne(                                                             // 796  // 879
        {'services.email.verificationTokens.token': token});                                       // 797  // 880
      if (!user)                                                                                   // 798  // 881
        throw new Meteor.Error(403, "Verify email link expired");                                  // 799  // 882
                                                                                                   // 800  // 883
      var tokenRecord = _.find(user.services.email.verificationTokens,                             // 801  // 884
                               function (t) {                                                      // 802  // 885
                                 return t.token == token;                                          // 803  // 886
                               });                                                                 // 804  // 887
      if (!tokenRecord)                                                                            // 805  // 888
        return {                                                                                   // 806  // 889
          userId: user._id,                                                                        // 807  // 890
          error: new Meteor.Error(403, "Verify email link expired")                                // 808  // 891
        };                                                                                         // 809  // 892
                                                                                                   // 810  // 893
      var emailsRecord = _.find(user.emails, function (e) {                                        // 811  // 894
        return e.address == tokenRecord.address;                                                   // 812  // 895
      });                                                                                          // 813  // 896
      if (!emailsRecord)                                                                           // 814  // 897
        return {                                                                                   // 815  // 898
          userId: user._id,                                                                        // 816  // 899
          error: new Meteor.Error(403, "Verify email link is for unknown address")                 // 817  // 900
        };                                                                                         // 818  // 901
                                                                                                   // 819  // 902
      // By including the address in the query, we can use 'emails.$' in the                       // 820  // 903
      // modifier to get a reference to the specific object in the emails                          // 821  // 904
      // array. See                                                                                // 822  // 905
      // http://www.mongodb.org/display/DOCS/Updating/#Updating-The%24positionaloperator)          // 823  // 906
      // http://www.mongodb.org/display/DOCS/Updating#Updating-%24pull                             // 824  // 907
      Meteor.users.update(                                                                         // 825  // 908
        {_id: user._id,                                                                            // 826  // 909
         'emails.address': tokenRecord.address},                                                   // 827  // 910
        {$set: {'emails.$.verified': true},                                                        // 828  // 911
         $pull: {'services.email.verificationTokens': {address: tokenRecord.address}}});           // 829  // 912
                                                                                                   // 830  // 913
      return {userId: user._id};                                                                   // 831  // 914
    }                                                                                              // 832  // 915
  );                                                                                               // 833  // 916
}});                                                                                               // 834  // 917
                                                                                                   // 835  // 918
/**                                                                                                // 836  // 919
 * @summary Add an email address for a user. Use this instead of directly                          // 837  // 920
 * updating the database. The operation will fail if there is a different user                     // 838  // 921
 * with an email only differing in case. If the specified user has an existing                     // 839  // 922
 * email only differing in case however, we replace it.                                            // 840  // 923
 * @locus Server                                                                                   // 841  // 924
 * @param {String} userId The ID of the user to update.                                            // 842  // 925
 * @param {String} newEmail A new email address for the user.                                      // 843  // 926
 * @param {Boolean} [verified] Optional - whether the new email address should                     // 844  // 927
 * be marked as verified. Defaults to false.                                                       // 845  // 928
 */                                                                                                // 846  // 929
Accounts.addEmail = function (userId, newEmail, verified) {                                        // 847  // 930
  check(userId, NonEmptyString);                                                                   // 848  // 931
  check(newEmail, NonEmptyString);                                                                 // 849  // 932
  check(verified, Match.Optional(Boolean));                                                        // 850  // 933
                                                                                                   // 851  // 934
  if (_.isUndefined(verified)) {                                                                   // 852  // 935
    verified = false;                                                                              // 853  // 936
  }                                                                                                // 854  // 937
                                                                                                   // 855  // 938
  var user = Meteor.users.findOne(userId);                                                         // 856  // 939
  if (!user)                                                                                       // 857  // 940
    throw new Meteor.Error(403, "User not found");                                                 // 858  // 941
                                                                                                   // 859  // 942
  // Allow users to change their own email to a version with a different case                      // 860  // 943
                                                                                                   // 861  // 944
  // We don't have to call checkForCaseInsensitiveDuplicates to do a case                          // 862  // 945
  // insensitive check across all emails in the database here because: (1) if                      // 863  // 946
  // there is no case-insensitive duplicate between this user and other users,                     // 864  // 947
  // then we are OK and (2) if this would create a conflict with other users                       // 865  // 948
  // then there would already be a case-insensitive duplicate and we can't fix                     // 866  // 949
  // that in this code anyway.                                                                     // 867  // 950
  var caseInsensitiveRegExp =                                                                      // 868  // 951
    new RegExp('^' + Meteor._escapeRegExp(newEmail) + '$', 'i');                                   // 869  // 952
                                                                                                   // 870  // 953
  var didUpdateOwnEmail = _.any(user.emails, function(email, index) {                              // 871  // 954
    if (caseInsensitiveRegExp.test(email.address)) {                                               // 872  // 955
      Meteor.users.update({                                                                        // 873  // 956
        _id: user._id,                                                                             // 874  // 957
        'emails.address': email.address                                                            // 875  // 958
      }, {$set: {                                                                                  // 876  // 959
        'emails.$.address': newEmail,                                                              // 877  // 960
        'emails.$.verified': verified                                                              // 878  // 961
      }});                                                                                         // 879  // 962
      return true;                                                                                 // 880  // 963
    }                                                                                              // 881  // 964
                                                                                                   // 882  // 965
    return false;                                                                                  // 883  // 966
  });                                                                                              // 884  // 967
                                                                                                   // 885  // 968
  // In the other updates below, we have to do another call to                                     // 886  // 969
  // checkForCaseInsensitiveDuplicates to make sure that no conflicting values                     // 887  // 970
  // were added to the database in the meantime. We don't have to do this for                      // 888  // 971
  // the case where the user is updating their email address to one that is the                    // 889  // 972
  // same as before, but only different because of capitalization. Read the                        // 890  // 973
  // big comment above to understand why.                                                          // 891  // 974
                                                                                                   // 892  // 975
  if (didUpdateOwnEmail) {                                                                         // 893  // 976
    return;                                                                                        // 894  // 977
  }                                                                                                // 895  // 978
                                                                                                   // 896  // 979
  // Perform a case insensitive check for duplicates before update                                 // 897  // 980
  checkForCaseInsensitiveDuplicates('emails.address', 'Email', newEmail, user._id);                // 898  // 981
                                                                                                   // 899  // 982
  Meteor.users.update({                                                                            // 900  // 983
    _id: user._id                                                                                  // 901  // 984
  }, {                                                                                             // 902  // 985
    $addToSet: {                                                                                   // 903  // 986
      emails: {                                                                                    // 904  // 987
        address: newEmail,                                                                         // 905  // 988
        verified: verified                                                                         // 906  // 989
      }                                                                                            // 907  // 990
    }                                                                                              // 908  // 991
  });                                                                                              // 909  // 992
                                                                                                   // 910  // 993
  // Perform another check after update, in case a matching user has been                          // 911  // 994
  // inserted in the meantime                                                                      // 912  // 995
  try {                                                                                            // 913  // 996
    checkForCaseInsensitiveDuplicates('emails.address', 'Email', newEmail, user._id);              // 914  // 997
  } catch (ex) {                                                                                   // 915  // 998
    // Undo update if the check fails                                                              // 916  // 999
    Meteor.users.update({_id: user._id},                                                           // 917  // 1000
      {$pull: {emails: {address: newEmail}}});                                                     // 918  // 1001
    throw ex;                                                                                      // 919  // 1002
  }                                                                                                // 920  // 1003
}                                                                                                  // 921  // 1004
                                                                                                   // 922  // 1005
/**                                                                                                // 923  // 1006
 * @summary Remove an email address for a user. Use this instead of updating                       // 924  // 1007
 * the database directly.                                                                          // 925  // 1008
 * @locus Server                                                                                   // 926  // 1009
 * @param {String} userId The ID of the user to update.                                            // 927  // 1010
 * @param {String} email The email address to remove.                                              // 928  // 1011
 */                                                                                                // 929  // 1012
Accounts.removeEmail = function (userId, email) {                                                  // 930  // 1013
  check(userId, NonEmptyString);                                                                   // 931  // 1014
  check(email, NonEmptyString);                                                                    // 932  // 1015
                                                                                                   // 933  // 1016
  var user = Meteor.users.findOne(userId);                                                         // 934  // 1017
  if (!user)                                                                                       // 935  // 1018
    throw new Meteor.Error(403, "User not found");                                                 // 936  // 1019
                                                                                                   // 937  // 1020
  Meteor.users.update({_id: user._id},                                                             // 938  // 1021
    {$pull: {emails: {address: email}}});                                                          // 939  // 1022
}                                                                                                  // 940  // 1023
                                                                                                   // 941  // 1024
///                                                                                                // 942  // 1025
/// CREATING USERS                                                                                 // 943  // 1026
///                                                                                                // 944  // 1027
                                                                                                   // 945  // 1028
// Shared createUser function called from the createUser method, both                              // 946  // 1029
// if originates in client or server code. Calls user provided hooks,                              // 947  // 1030
// does the actual user insertion.                                                                 // 948  // 1031
//                                                                                                 // 949  // 1032
// returns the user id                                                                             // 950  // 1033
var createUser = function (options) {                                                              // 951  // 1034
  // Unknown keys allowed, because a onCreateUserHook can take arbitrary                           // 952  // 1035
  // options.                                                                                      // 953  // 1036
  check(options, Match.ObjectIncluding({                                                           // 954  // 1037
    username: Match.Optional(String),                                                              // 955  // 1038
    email: Match.Optional(String),                                                                 // 956  // 1039
    password: Match.Optional(passwordValidator)                                                    // 957  // 1040
  }));                                                                                             // 958  // 1041
                                                                                                   // 959  // 1042
  var username = options.username;                                                                 // 960  // 1043
  var email = options.email;                                                                       // 961  // 1044
  if (!username && !email)                                                                         // 962  // 1045
    throw new Meteor.Error(400, "Need to set a username or email");                                // 963  // 1046
                                                                                                   // 964  // 1047
  var user = {services: {}};                                                                       // 965  // 1048
  if (options.password) {                                                                          // 966  // 1049
    var hashed = hashPassword(options.password);                                                   // 967  // 1050
    user.services.password = { bcrypt: hashed };                                                   // 968  // 1051
  }                                                                                                // 969  // 1052
                                                                                                   // 970  // 1053
  if (username)                                                                                    // 971  // 1054
    user.username = username;                                                                      // 972  // 1055
  if (email)                                                                                       // 973  // 1056
    user.emails = [{address: email, verified: false}];                                             // 974  // 1057
                                                                                                   // 975  // 1058
  // Perform a case insensitive check before insert                                                // 976  // 1059
  checkForCaseInsensitiveDuplicates('username', 'Username', username);                             // 977  // 1060
  checkForCaseInsensitiveDuplicates('emails.address', 'Email', email);                             // 978  // 1061
                                                                                                   // 979  // 1062
  var userId = Accounts.insertUserDoc(options, user);                                              // 980  // 1063
  // Perform another check after insert, in case a matching user has been                          // 981  // 1064
  // inserted in the meantime                                                                      // 982  // 1065
  try {                                                                                            // 983  // 1066
    checkForCaseInsensitiveDuplicates('username', 'Username', username, userId);                   // 984  // 1067
    checkForCaseInsensitiveDuplicates('emails.address', 'Email', email, userId);                   // 985  // 1068
  } catch (ex) {                                                                                   // 986  // 1069
    // Remove inserted user if the check fails                                                     // 987  // 1070
    Meteor.users.remove(userId);                                                                   // 988  // 1071
    throw ex;                                                                                      // 989  // 1072
  }                                                                                                // 990  // 1073
  return userId;                                                                                   // 991  // 1074
};                                                                                                 // 992  // 1075
                                                                                                   // 993  // 1076
// method for create user. Requests come from the client.                                          // 994  // 1077
Meteor.methods({createUser: function (options) {                                                   // 995  // 1078
  var self = this;                                                                                 // 996  // 1079
  return Accounts._loginMethod(                                                                    // 997  // 1080
    self,                                                                                          // 998  // 1081
    "createUser",                                                                                  // 999  // 1082
    arguments,                                                                                     // 1000
    "password",                                                                                    // 1001
    function () {                                                                                  // 1002
      // createUser() above does more checking.                                                    // 1003
      check(options, Object);                                                                      // 1004
      if (Accounts._options.forbidClientAccountCreation)                                           // 1005
        return {                                                                                   // 1006
          error: new Meteor.Error(403, "Signups forbidden")                                        // 1007
        };                                                                                         // 1008
                                                                                                   // 1009
      // Create user. result contains id and token.                                                // 1010
      var userId = createUser(options);                                                            // 1011
      // safety belt. createUser is supposed to throw on error. send 500 error                     // 1012
      // instead of sending a verification email with empty userid.                                // 1013
      if (! userId)                                                                                // 1014
        throw new Error("createUser failed to insert new user");                                   // 1015
                                                                                                   // 1016
      // If `Accounts._options.sendVerificationEmail` is set, register                             // 1017
      // a token to verify the user's primary email, and send it to                                // 1018
      // that address.                                                                             // 1019
      if (options.email && Accounts._options.sendVerificationEmail)                                // 1020
        Accounts.sendVerificationEmail(userId, options.email);                                     // 1021
                                                                                                   // 1022
      // client gets logged in as the new user afterwards.                                         // 1023
      return {userId: userId};                                                                     // 1024
    }                                                                                              // 1025
  );                                                                                               // 1026
}});                                                                                               // 1027
                                                                                                   // 1028
// Create user directly on the server.                                                             // 1029
//                                                                                                 // 1030
// Unlike the client version, this does not log you in as this user                                // 1031
// after creation.                                                                                 // 1032
//                                                                                                 // 1033
// returns userId or throws an error if it can't create                                            // 1034
//                                                                                                 // 1035
// XXX add another argument ("server options") that gets sent to onCreateUser,                     // 1036
// which is always empty when called from the createUser method? eg, "admin:                       // 1037
// true", which we want to prevent the client from setting, but which a custom                     // 1038
// method calling Accounts.createUser could set?                                                   // 1039
//                                                                                                 // 1040
Accounts.createUser = function (options, callback) {                                               // 1041
  options = _.clone(options);                                                                      // 1042
                                                                                                   // 1043
  // XXX allow an optional callback?                                                               // 1044
  if (callback) {                                                                                  // 1045
    throw new Error("Accounts.createUser with callback not supported on the server yet.");         // 1046
  }                                                                                                // 1047
                                                                                                   // 1048
  return createUser(options);                                                                      // 1049
};                                                                                                 // 1050
                                                                                                   // 1051
///                                                                                                // 1052
/// PASSWORD-SPECIFIC INDEXES ON USERS                                                             // 1053
///                                                                                                // 1054
Meteor.users._ensureIndex('services.email.verificationTokens.token',                               // 1055
                          {unique: 1, sparse: 1});                                                 // 1056
Meteor.users._ensureIndex('services.password.reset.token',                                         // 1057
                          {unique: 1, sparse: 1});                                                 // 1058
                                                                                                   // 1059
/////////////////////////////////////////////////////////////////////////////////////////////////////      // 1143
                                                                                                           // 1144
}).call(this);                                                                                             // 1145
                                                                                                           // 1146
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['accounts-password'] = {};

})();

//# sourceMappingURL=accounts-password.js.map
