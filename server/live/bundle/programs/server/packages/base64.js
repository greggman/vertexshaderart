(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var Base64;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
// packages/base64/packages/base64.js                                                          //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                               //
(function(){                                                                                   // 1
                                                                                               // 2
//////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                      //     // 4
// packages/base64/base64.js                                                            //     // 5
//                                                                                      //     // 6
//////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                        //     // 8
// Base 64 encoding                                                                     // 1   // 9
                                                                                        // 2   // 10
var BASE_64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";        // 11
                                                                                        // 4   // 12
var BASE_64_VALS = {};                                                                  // 5   // 13
                                                                                        // 6   // 14
for (var i = 0; i < BASE_64_CHARS.length; i++) {                                        // 7   // 15
  BASE_64_VALS[BASE_64_CHARS.charAt(i)] = i;                                            // 8   // 16
};                                                                                      // 9   // 17
                                                                                        // 10  // 18
Base64 = {};                                                                            // 11  // 19
                                                                                        // 12  // 20
Base64.encode = function (array) {                                                      // 13  // 21
                                                                                        // 14  // 22
  if (typeof array === "string") {                                                      // 15  // 23
    var str = array;                                                                    // 16  // 24
    array = Base64.newBinary(str.length);                                               // 17  // 25
    for (var i = 0; i < str.length; i++) {                                              // 18  // 26
      var ch = str.charCodeAt(i);                                                       // 19  // 27
      if (ch > 0xFF) {                                                                  // 20  // 28
        throw new Error(                                                                // 21  // 29
          "Not ascii. Base64.encode can only take ascii strings.");                     // 22  // 30
      }                                                                                 // 23  // 31
      array[i] = ch;                                                                    // 24  // 32
    }                                                                                   // 25  // 33
  }                                                                                     // 26  // 34
                                                                                        // 27  // 35
  var answer = [];                                                                      // 28  // 36
  var a = null;                                                                         // 29  // 37
  var b = null;                                                                         // 30  // 38
  var c = null;                                                                         // 31  // 39
  var d = null;                                                                         // 32  // 40
  for (var i = 0; i < array.length; i++) {                                              // 33  // 41
    switch (i % 3) {                                                                    // 34  // 42
    case 0:                                                                             // 35  // 43
      a = (array[i] >> 2) & 0x3F;                                                       // 36  // 44
      b = (array[i] & 0x03) << 4;                                                       // 37  // 45
      break;                                                                            // 38  // 46
    case 1:                                                                             // 39  // 47
      b = b | (array[i] >> 4) & 0xF;                                                    // 40  // 48
      c = (array[i] & 0xF) << 2;                                                        // 41  // 49
      break;                                                                            // 42  // 50
    case 2:                                                                             // 43  // 51
      c = c | (array[i] >> 6) & 0x03;                                                   // 44  // 52
      d = array[i] & 0x3F;                                                              // 45  // 53
      answer.push(getChar(a));                                                          // 46  // 54
      answer.push(getChar(b));                                                          // 47  // 55
      answer.push(getChar(c));                                                          // 48  // 56
      answer.push(getChar(d));                                                          // 49  // 57
      a = null;                                                                         // 50  // 58
      b = null;                                                                         // 51  // 59
      c = null;                                                                         // 52  // 60
      d = null;                                                                         // 53  // 61
      break;                                                                            // 54  // 62
    }                                                                                   // 55  // 63
  }                                                                                     // 56  // 64
  if (a != null) {                                                                      // 57  // 65
    answer.push(getChar(a));                                                            // 58  // 66
    answer.push(getChar(b));                                                            // 59  // 67
    if (c == null)                                                                      // 60  // 68
      answer.push('=');                                                                 // 61  // 69
    else                                                                                // 62  // 70
      answer.push(getChar(c));                                                          // 63  // 71
    if (d == null)                                                                      // 64  // 72
      answer.push('=');                                                                 // 65  // 73
  }                                                                                     // 66  // 74
  return answer.join("");                                                               // 67  // 75
};                                                                                      // 68  // 76
                                                                                        // 69  // 77
var getChar = function (val) {                                                          // 70  // 78
  return BASE_64_CHARS.charAt(val);                                                     // 71  // 79
};                                                                                      // 72  // 80
                                                                                        // 73  // 81
var getVal = function (ch) {                                                            // 74  // 82
  if (ch === '=') {                                                                     // 75  // 83
    return -1;                                                                          // 76  // 84
  }                                                                                     // 77  // 85
  return BASE_64_VALS[ch];                                                              // 78  // 86
};                                                                                      // 79  // 87
                                                                                        // 80  // 88
// XXX This is a weird place for this to live, but it's used both by                    // 81  // 89
// this package and 'ejson', and we can't put it in 'ejson' without                     // 82  // 90
// introducing a circular dependency. It should probably be in its own                  // 83  // 91
// package or as a helper in a package that both 'base64' and 'ejson'                   // 84  // 92
// use.                                                                                 // 85  // 93
Base64.newBinary = function (len) {                                                     // 86  // 94
  if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined') {        // 87  // 95
    var ret = [];                                                                       // 88  // 96
    for (var i = 0; i < len; i++) {                                                     // 89  // 97
      ret.push(0);                                                                      // 90  // 98
    }                                                                                   // 91  // 99
    ret.$Uint8ArrayPolyfill = true;                                                     // 92  // 100
    return ret;                                                                         // 93  // 101
  }                                                                                     // 94  // 102
  return new Uint8Array(new ArrayBuffer(len));                                          // 95  // 103
};                                                                                      // 96  // 104
                                                                                        // 97  // 105
Base64.decode = function (str) {                                                        // 98  // 106
  var len = Math.floor((str.length*3)/4);                                               // 99  // 107
  if (str.charAt(str.length - 1) == '=') {                                              // 100
    len--;                                                                              // 101
    if (str.charAt(str.length - 2) == '=')                                              // 102
      len--;                                                                            // 103
  }                                                                                     // 104
  var arr = Base64.newBinary(len);                                                      // 105
                                                                                        // 106
  var one = null;                                                                       // 107
  var two = null;                                                                       // 108
  var three = null;                                                                     // 109
                                                                                        // 110
  var j = 0;                                                                            // 111
                                                                                        // 112
  for (var i = 0; i < str.length; i++) {                                                // 113
    var c = str.charAt(i);                                                              // 114
    var v = getVal(c);                                                                  // 115
    switch (i % 4) {                                                                    // 116
    case 0:                                                                             // 117
      if (v < 0)                                                                        // 118
        throw new Error('invalid base64 string');                                       // 119
      one = v << 2;                                                                     // 120
      break;                                                                            // 121
    case 1:                                                                             // 122
      if (v < 0)                                                                        // 123
        throw new Error('invalid base64 string');                                       // 124
      one = one | (v >> 4);                                                             // 125
      arr[j++] = one;                                                                   // 126
      two = (v & 0x0F) << 4;                                                            // 127
      break;                                                                            // 128
    case 2:                                                                             // 129
      if (v >= 0) {                                                                     // 130
        two = two | (v >> 2);                                                           // 131
        arr[j++] = two;                                                                 // 132
        three = (v & 0x03) << 6;                                                        // 133
      }                                                                                 // 134
      break;                                                                            // 135
    case 3:                                                                             // 136
      if (v >= 0) {                                                                     // 137
        arr[j++] = three | v;                                                           // 138
      }                                                                                 // 139
      break;                                                                            // 140
    }                                                                                   // 141
  }                                                                                     // 142
  return arr;                                                                           // 143
};                                                                                      // 144
                                                                                        // 145
//////////////////////////////////////////////////////////////////////////////////////////     // 154
                                                                                               // 155
}).call(this);                                                                                 // 156
                                                                                               // 157
/////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.base64 = {
  Base64: Base64
};

})();

//# sourceMappingURL=base64.js.map
