(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var Random;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                         //
// packages/random/packages/random.js                                                      //
//                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////
                                                                                           //
(function(){                                                                               // 1
                                                                                           // 2
//////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                  //     // 4
// packages/random/random.js                                                        //     // 5
//                                                                                  //     // 6
//////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                    //     // 8
// We use cryptographically strong PRNGs (crypto.getRandomBytes() on the server,    // 1   // 9
// window.crypto.getRandomValues() in the browser) when available. If these         // 2   // 10
// PRNGs fail, we fall back to the Alea PRNG, which is not cryptographically        // 3   // 11
// strong, and we seed it with various sources such as the date, Math.random,       // 4   // 12
// and window size on the client.  When using crypto.getRandomValues(), our         // 5   // 13
// primitive is hexString(), from which we construct fraction(). When using         // 6   // 14
// window.crypto.getRandomValues() or alea, the primitive is fraction and we use    // 7   // 15
// that to construct hex string.                                                    // 8   // 16
                                                                                    // 9   // 17
if (Meteor.isServer)                                                                // 10  // 18
  var nodeCrypto = Npm.require('crypto');                                           // 11  // 19
                                                                                    // 12  // 20
// see http://baagoe.org/en/wiki/Better_random_numbers_for_javascript               // 13  // 21
// for a full discussion and Alea implementation.                                   // 14  // 22
var Alea = function () {                                                            // 15  // 23
  function Mash() {                                                                 // 16  // 24
    var n = 0xefc8249d;                                                             // 17  // 25
                                                                                    // 18  // 26
    var mash = function(data) {                                                     // 19  // 27
      data = data.toString();                                                       // 20  // 28
      for (var i = 0; i < data.length; i++) {                                       // 21  // 29
        n += data.charCodeAt(i);                                                    // 22  // 30
        var h = 0.02519603282416938 * n;                                            // 23  // 31
        n = h >>> 0;                                                                // 24  // 32
        h -= n;                                                                     // 25  // 33
        h *= n;                                                                     // 26  // 34
        n = h >>> 0;                                                                // 27  // 35
        h -= n;                                                                     // 28  // 36
        n += h * 0x100000000; // 2^32                                               // 29  // 37
      }                                                                             // 30  // 38
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32                           // 31  // 39
    };                                                                              // 32  // 40
                                                                                    // 33  // 41
    mash.version = 'Mash 0.9';                                                      // 34  // 42
    return mash;                                                                    // 35  // 43
  }                                                                                 // 36  // 44
                                                                                    // 37  // 45
  return (function (args) {                                                         // 38  // 46
    var s0 = 0;                                                                     // 39  // 47
    var s1 = 0;                                                                     // 40  // 48
    var s2 = 0;                                                                     // 41  // 49
    var c = 1;                                                                      // 42  // 50
                                                                                    // 43  // 51
    if (args.length == 0) {                                                         // 44  // 52
      args = [+new Date];                                                           // 45  // 53
    }                                                                               // 46  // 54
    var mash = Mash();                                                              // 47  // 55
    s0 = mash(' ');                                                                 // 48  // 56
    s1 = mash(' ');                                                                 // 49  // 57
    s2 = mash(' ');                                                                 // 50  // 58
                                                                                    // 51  // 59
    for (var i = 0; i < args.length; i++) {                                         // 52  // 60
      s0 -= mash(args[i]);                                                          // 53  // 61
      if (s0 < 0) {                                                                 // 54  // 62
        s0 += 1;                                                                    // 55  // 63
      }                                                                             // 56  // 64
      s1 -= mash(args[i]);                                                          // 57  // 65
      if (s1 < 0) {                                                                 // 58  // 66
        s1 += 1;                                                                    // 59  // 67
      }                                                                             // 60  // 68
      s2 -= mash(args[i]);                                                          // 61  // 69
      if (s2 < 0) {                                                                 // 62  // 70
        s2 += 1;                                                                    // 63  // 71
      }                                                                             // 64  // 72
    }                                                                               // 65  // 73
    mash = null;                                                                    // 66  // 74
                                                                                    // 67  // 75
    var random = function() {                                                       // 68  // 76
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32                   // 69  // 77
      s0 = s1;                                                                      // 70  // 78
      s1 = s2;                                                                      // 71  // 79
      return s2 = t - (c = t | 0);                                                  // 72  // 80
    };                                                                              // 73  // 81
    random.uint32 = function() {                                                    // 74  // 82
      return random() * 0x100000000; // 2^32                                        // 75  // 83
    };                                                                              // 76  // 84
    random.fract53 = function() {                                                   // 77  // 85
      return random() +                                                             // 78  // 86
        (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53                // 79  // 87
    };                                                                              // 80  // 88
    random.version = 'Alea 0.9';                                                    // 81  // 89
    random.args = args;                                                             // 82  // 90
    return random;                                                                  // 83  // 91
                                                                                    // 84  // 92
  } (Array.prototype.slice.call(arguments)));                                       // 85  // 93
};                                                                                  // 86  // 94
                                                                                    // 87  // 95
var UNMISTAKABLE_CHARS = "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz";        // 96
var BASE64_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" +         // 89  // 97
  "0123456789-_";                                                                   // 90  // 98
                                                                                    // 91  // 99
// If seeds are provided, then the alea PRNG will be used, since cryptographic      // 92  // 100
// PRNGs (Node crypto and window.crypto.getRandomValues) don't allow us to          // 93  // 101
// specify seeds. The caller is responsible for making sure to provide a seed       // 94  // 102
// for alea if a csprng is not available.                                           // 95  // 103
var RandomGenerator = function (seedArray) {                                        // 96  // 104
  var self = this;                                                                  // 97  // 105
  if (seedArray !== undefined)                                                      // 98  // 106
    self.alea = Alea.apply(null, seedArray);                                        // 99  // 107
};                                                                                  // 100
                                                                                    // 101
RandomGenerator.prototype.fraction = function () {                                  // 102
  var self = this;                                                                  // 103
  if (self.alea) {                                                                  // 104
    return self.alea();                                                             // 105
  } else if (nodeCrypto) {                                                          // 106
    var numerator = parseInt(self.hexString(8), 16);                                // 107
    return numerator * 2.3283064365386963e-10; // 2^-32                             // 108
  } else if (typeof window !== "undefined" && window.crypto &&                      // 109
             window.crypto.getRandomValues) {                                       // 110
    var array = new Uint32Array(1);                                                 // 111
    window.crypto.getRandomValues(array);                                           // 112
    return array[0] * 2.3283064365386963e-10; // 2^-32                              // 113
  } else {                                                                          // 114
    throw new Error('No random generator available');                               // 115
  }                                                                                 // 116
};                                                                                  // 117
                                                                                    // 118
RandomGenerator.prototype.hexString = function (digits) {                           // 119
  var self = this;                                                                  // 120
  if (nodeCrypto && ! self.alea) {                                                  // 121
    var numBytes = Math.ceil(digits / 2);                                           // 122
    var bytes;                                                                      // 123
    // Try to get cryptographically strong randomness. Fall back to                 // 124
    // non-cryptographically strong if not available.                               // 125
    try {                                                                           // 126
      bytes = nodeCrypto.randomBytes(numBytes);                                     // 127
    } catch (e) {                                                                   // 128
      // XXX should re-throw any error except insufficient entropy                  // 129
      bytes = nodeCrypto.pseudoRandomBytes(numBytes);                               // 130
    }                                                                               // 131
    var result = bytes.toString("hex");                                             // 132
    // If the number of digits is odd, we'll have generated an extra 4 bits         // 133
    // of randomness, so we need to trim the last digit.                            // 134
    return result.substring(0, digits);                                             // 135
  } else {                                                                          // 136
    var hexDigits = [];                                                             // 137
    for (var i = 0; i < digits; ++i) {                                              // 138
      hexDigits.push(self.choice("0123456789abcdef"));                              // 139
    }                                                                               // 140
    return hexDigits.join('');                                                      // 141
  }                                                                                 // 142
};                                                                                  // 143
                                                                                    // 144
RandomGenerator.prototype._randomString = function (charsCount,                     // 145
                                                    alphabet) {                     // 146
  var self = this;                                                                  // 147
  var digits = [];                                                                  // 148
  for (var i = 0; i < charsCount; i++) {                                            // 149
    digits[i] = self.choice(alphabet);                                              // 150
  }                                                                                 // 151
  return digits.join("");                                                           // 152
};                                                                                  // 153
                                                                                    // 154
RandomGenerator.prototype.id = function (charsCount) {                              // 155
  var self = this;                                                                  // 156
  // 17 characters is around 96 bits of entropy, which is the amount of             // 157
  // state in the Alea PRNG.                                                        // 158
  if (charsCount === undefined)                                                     // 159
    charsCount = 17;                                                                // 160
                                                                                    // 161
  return self._randomString(charsCount, UNMISTAKABLE_CHARS);                        // 162
};                                                                                  // 163
                                                                                    // 164
RandomGenerator.prototype.secret = function (charsCount) {                          // 165
  var self = this;                                                                  // 166
  // Default to 256 bits of entropy, or 43 characters at 6 bits per                 // 167
  // character.                                                                     // 168
  if (charsCount === undefined)                                                     // 169
    charsCount = 43;                                                                // 170
  return self._randomString(charsCount, BASE64_CHARS);                              // 171
};                                                                                  // 172
                                                                                    // 173
RandomGenerator.prototype.choice = function (arrayOrString) {                       // 174
  var index = Math.floor(this.fraction() * arrayOrString.length);                   // 175
  if (typeof arrayOrString === "string")                                            // 176
    return arrayOrString.substr(index, 1);                                          // 177
  else                                                                              // 178
    return arrayOrString[index];                                                    // 179
};                                                                                  // 180
                                                                                    // 181
// instantiate RNG.  Heuristically collect entropy from various sources when a      // 182
// cryptographic PRNG isn't available.                                              // 183
                                                                                    // 184
// client sources                                                                   // 185
var height = (typeof window !== 'undefined' && window.innerHeight) ||               // 186
      (typeof document !== 'undefined'                                              // 187
       && document.documentElement                                                  // 188
       && document.documentElement.clientHeight) ||                                 // 189
      (typeof document !== 'undefined'                                              // 190
       && document.body                                                             // 191
       && document.body.clientHeight) ||                                            // 192
      1;                                                                            // 193
                                                                                    // 194
var width = (typeof window !== 'undefined' && window.innerWidth) ||                 // 195
      (typeof document !== 'undefined'                                              // 196
       && document.documentElement                                                  // 197
       && document.documentElement.clientWidth) ||                                  // 198
      (typeof document !== 'undefined'                                              // 199
       && document.body                                                             // 200
       && document.body.clientWidth) ||                                             // 201
      1;                                                                            // 202
                                                                                    // 203
var agent = (typeof navigator !== 'undefined' && navigator.userAgent) || "";        // 204
                                                                                    // 205
if (nodeCrypto ||                                                                   // 206
    (typeof window !== "undefined" &&                                               // 207
     window.crypto && window.crypto.getRandomValues))                               // 208
  Random = new RandomGenerator();                                                   // 209
else                                                                                // 210
  Random = new RandomGenerator([new Date(), height, width, agent, Math.random()]);  // 211
                                                                                    // 212
Random.createWithSeeds = function () {                                              // 213
  if (arguments.length === 0) {                                                     // 214
    throw new Error('No seeds were provided');                                      // 215
  }                                                                                 // 216
  return new RandomGenerator(arguments);                                            // 217
};                                                                                  // 218
                                                                                    // 219
//////////////////////////////////////////////////////////////////////////////////////     // 228
                                                                                           // 229
}).call(this);                                                                             // 230
                                                                                           // 231
                                                                                           // 232
                                                                                           // 233
                                                                                           // 234
                                                                                           // 235
                                                                                           // 236
(function(){                                                                               // 237
                                                                                           // 238
//////////////////////////////////////////////////////////////////////////////////////     // 239
//                                                                                  //     // 240
// packages/random/deprecated.js                                                    //     // 241
//                                                                                  //     // 242
//////////////////////////////////////////////////////////////////////////////////////     // 243
                                                                                    //     // 244
// Before this package existed, we used to use this Meteor.uuid()                   // 1   // 245
// implementing the RFC 4122 v4 UUID. It is no longer documented                    // 2   // 246
// and will go away.                                                                // 3   // 247
// XXX COMPAT WITH 0.5.6                                                            // 4   // 248
Meteor.uuid = function () {                                                         // 5   // 249
  var HEX_DIGITS = "0123456789abcdef";                                              // 6   // 250
  var s = [];                                                                       // 7   // 251
  for (var i = 0; i < 36; i++) {                                                    // 8   // 252
    s[i] = Random.choice(HEX_DIGITS);                                               // 9   // 253
  }                                                                                 // 10  // 254
  s[14] = "4";                                                                      // 11  // 255
  s[19] = HEX_DIGITS.substr((parseInt(s[19],16) & 0x3) | 0x8, 1);                   // 12  // 256
  s[8] = s[13] = s[18] = s[23] = "-";                                               // 13  // 257
                                                                                    // 14  // 258
  var uuid = s.join("");                                                            // 15  // 259
  return uuid;                                                                      // 16  // 260
};                                                                                  // 17  // 261
                                                                                    // 18  // 262
//////////////////////////////////////////////////////////////////////////////////////     // 263
                                                                                           // 264
}).call(this);                                                                             // 265
                                                                                           // 266
/////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.random = {
  Random: Random
};

})();

//# sourceMappingURL=random.js.map
