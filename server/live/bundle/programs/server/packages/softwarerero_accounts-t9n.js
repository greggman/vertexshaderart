(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;

/* Package-scope variables */
var __coffeescriptShare, T9n;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero_accounts-t9n/packages/softwarerero_accounts-t9n.js                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
(function () {                                                                                                         // 1
                                                                                                                       // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n.coffee.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
                                                                                                                       // 10
                                                                                                                       // 11
Meteor.startup(function() {                                                                                            // 12
  if (Meteor.isClient) {                                                                                               // 13
    return UI.registerHelper('t9n', function(x, params) {                                                              // 14
      return T9n.get(x, true, params.hash);                                                                            // 15
    });                                                                                                                // 16
  }                                                                                                                    // 17
});                                                                                                                    // 18
                                                                                                                       // 19
T9n = (function() {                                                                                                    // 20
  function T9n() {}                                                                                                    // 21
                                                                                                                       // 22
  T9n.maps = {};                                                                                                       // 23
                                                                                                                       // 24
  T9n.defaultLanguage = 'en';                                                                                          // 25
                                                                                                                       // 26
  T9n.language = '';                                                                                                   // 27
                                                                                                                       // 28
  T9n.dep = new Deps.Dependency();                                                                                     // 29
                                                                                                                       // 30
  T9n.depLanguage = new Deps.Dependency();                                                                             // 31
                                                                                                                       // 32
  T9n.missingPrefix = ">";                                                                                             // 33
                                                                                                                       // 34
  T9n.missingPostfix = "<";                                                                                            // 35
                                                                                                                       // 36
  T9n.map = function(language, map) {                                                                                  // 37
    if (!this.maps[language]) {                                                                                        // 38
      this.maps[language] = {};                                                                                        // 39
    }                                                                                                                  // 40
    this.registerMap(language, '', false, map);                                                                        // 41
    return this.dep.changed();                                                                                         // 42
  };                                                                                                                   // 43
                                                                                                                       // 44
  T9n.get = function(label, markIfMissing, args) {                                                                     // 45
    var ret, _ref, _ref1;                                                                                              // 46
    if (markIfMissing == null) {                                                                                       // 47
      markIfMissing = true;                                                                                            // 48
    }                                                                                                                  // 49
    if (args == null) {                                                                                                // 50
      args = {};                                                                                                       // 51
    }                                                                                                                  // 52
    this.dep.depend();                                                                                                 // 53
    this.depLanguage.depend();                                                                                         // 54
    if (typeof label !== 'string') {                                                                                   // 55
      return '';                                                                                                       // 56
    }                                                                                                                  // 57
    ret = ((_ref = this.maps[this.language]) != null ? _ref[label] : void 0) || ((_ref1 = this.maps[this.defaultLanguage]) != null ? _ref1[label] : void 0) || (markIfMissing ? this.missingPrefix + label + this.missingPostfix : label);
    if (Object.keys(args).length === 0) {                                                                              // 59
      return ret;                                                                                                      // 60
    } else {                                                                                                           // 61
      return this.replaceParams(ret, args);                                                                            // 62
    }                                                                                                                  // 63
  };                                                                                                                   // 64
                                                                                                                       // 65
  T9n.registerMap = function(language, prefix, dot, map) {                                                             // 66
    var key, value, _results;                                                                                          // 67
    if (typeof map === 'string') {                                                                                     // 68
      return this.maps[language][prefix] = map;                                                                        // 69
    } else if (typeof map === 'object') {                                                                              // 70
      if (dot) {                                                                                                       // 71
        prefix = prefix + '.';                                                                                         // 72
      }                                                                                                                // 73
      _results = [];                                                                                                   // 74
      for (key in map) {                                                                                               // 75
        value = map[key];                                                                                              // 76
        _results.push(this.registerMap(language, prefix + key, true, value));                                          // 77
      }                                                                                                                // 78
      return _results;                                                                                                 // 79
    }                                                                                                                  // 80
  };                                                                                                                   // 81
                                                                                                                       // 82
  T9n.getLanguage = function() {                                                                                       // 83
    this.depLanguage.depend();                                                                                         // 84
    return this.language;                                                                                              // 85
  };                                                                                                                   // 86
                                                                                                                       // 87
  T9n.getLanguages = function() {                                                                                      // 88
    this.dep.depend();                                                                                                 // 89
    return Object.keys(this.maps).sort();                                                                              // 90
  };                                                                                                                   // 91
                                                                                                                       // 92
  T9n.setLanguage = function(language) {                                                                               // 93
    if (!this.maps[language] || this.language === language) {                                                          // 94
      return;                                                                                                          // 95
    }                                                                                                                  // 96
    this.language = language;                                                                                          // 97
    return this.depLanguage.changed();                                                                                 // 98
  };                                                                                                                   // 99
                                                                                                                       // 100
  T9n.replaceParams = function(str, args) {                                                                            // 101
    var key, re, value;                                                                                                // 102
    for (key in args) {                                                                                                // 103
      value = args[key];                                                                                               // 104
      re = new RegExp("@{" + key + "}", 'g');                                                                          // 105
      str = str.replace(re, value);                                                                                    // 106
    }                                                                                                                  // 107
    return str;                                                                                                        // 108
  };                                                                                                                   // 109
                                                                                                                       // 110
  return T9n;                                                                                                          // 111
                                                                                                                       // 112
})();                                                                                                                  // 113
                                                                                                                       // 114
this.T9n = T9n;                                                                                                        // 115
                                                                                                                       // 116
this.t9n = function(x, includePrefix, params) {                                                                        // 117
  return T9n.get(x);                                                                                                   // 118
};                                                                                                                     // 119
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 121
}).call(this);                                                                                                         // 122
                                                                                                                       // 123
                                                                                                                       // 124
                                                                                                                       // 125
                                                                                                                       // 126
                                                                                                                       // 127
                                                                                                                       // 128
(function () {                                                                                                         // 129
                                                                                                                       // 130
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/ar.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var ar;                                                                                                                // 138
                                                                                                                       // 139
ar = {                                                                                                                 // 140
  add: "اضف",                                                                                                          // 141
  and: "و",                                                                                                            // 142
  back: "رجوع",                                                                                                        // 143
  changePassword: "غير كلمة السر",                                                                                     // 144
  choosePassword: "اختر كلمة السر",                                                                                    // 145
  clickAgree: "بفتح حسابك انت توافق على",                                                                              // 146
  configure: "تعديل",                                                                                                  // 147
  createAccount: "افتح حساب جديد",                                                                                     // 148
  currentPassword: "كلمة السر الحالية",                                                                                // 149
  dontHaveAnAccount: "ليس عندك حساب؟",                                                                                 // 150
  email: "البريد الالكترونى",                                                                                          // 151
  emailAddress: "البريد الالكترونى",                                                                                   // 152
  emailResetLink: "اعادة تعيين البريد الالكترونى",                                                                     // 153
  forgotPassword: "نسيت كلمة السر؟",                                                                                   // 154
  ifYouAlreadyHaveAnAccount: "اذا كان عندك حساب",                                                                      // 155
  newPassword: "كلمة السر الجديدة",                                                                                    // 156
  newPasswordAgain: "كلمة السر الجديدة مرة اخرى",                                                                      // 157
  optional: "اختيارى",                                                                                                 // 158
  OR: "او",                                                                                                            // 159
  password: "كلمة السر",                                                                                               // 160
  passwordAgain: "كلمة السر مرة اخرى",                                                                                 // 161
  privacyPolicy: "سياسة الخصوصية",                                                                                     // 162
  remove: "ازالة",                                                                                                     // 163
  resetYourPassword: "اعادة تعيين كلمة السر",                                                                          // 164
  setPassword: "تعيين كلمة السر",                                                                                      // 165
  sign: "تسجيل",                                                                                                       // 166
  signIn: "تسجيل الدخول",                                                                                              // 167
  signin: "تسجيل الدخول",                                                                                              // 168
  signOut: "تسجيل الخروج",                                                                                             // 169
  signUp: "افتح حساب جديد",                                                                                            // 170
  signupCode: "رمز التسجيل",                                                                                           // 171
  signUpWithYourEmailAddress: "سجل ببريدك الالكترونى",                                                                 // 172
  terms: "شروط الاستخدام",                                                                                             // 173
  updateYourPassword: "جدد كلمة السر",                                                                                 // 174
  username: "اسم المستخدم",                                                                                            // 175
  usernameOrEmail: "اسم المستخدم او البريد الالكترونى",                                                                // 176
  "with": "مع",                                                                                                        // 177
  info: {                                                                                                              // 178
    emailSent: "تم ارسال البريد الالكترونى",                                                                           // 179
    emailVerified: "تم تأكيد البريد الالكترونى",                                                                       // 180
    passwordChanged: "تم تغيير كلمة السر",                                                                             // 181
    passwordReset: "تم اعادة تعيين كلمة السر"                                                                          // 182
  },                                                                                                                   // 183
  error: {                                                                                                             // 184
    emailRequired: "البريد الالكترونى مطلوب",                                                                          // 185
    minChar: "سبعة حروف هو الحد الادنى لكلمة السر",                                                                    // 186
    pwdsDontMatch: "كلمتين السر لا يتطابقان",                                                                          // 187
    pwOneDigit: "كلمة السر يجب ان تحتوى على رقم واحد على الاقل",                                                       // 188
    pwOneLetter: "كلمة السر تحتاج الى حرف اخر",                                                                        // 189
    signInRequired: "عليك بتسجبل الدخول لفعل ذلك",                                                                     // 190
    signupCodeIncorrect: "رمز التسجيل غير صحيح",                                                                       // 191
    signupCodeRequired: "رمز التسجيل مطلوب",                                                                           // 192
    usernameIsEmail: "اسم المستخدم لا يمكن ان يكون بريد الكترونى",                                                     // 193
    usernameRequired: "اسم المستخدم مطلوب",                                                                            // 194
    accounts: {                                                                                                        // 195
      "Email already exists.": "البريد الالكترونى مسجل",                                                               // 196
      "Email doesn't match the criteria.": "البريد الالكترونى لا يتوافق مع الشروط",                                    // 197
      "Invalid login token": "رمز الدخول غير صالح",                                                                    // 198
      "Login forbidden": "تسجيل الدخول غير مسموح",                                                                     // 199
      "Service unknown": "خدمة غير معروفة",                                                                            // 200
      "Unrecognized options for login request": "اختيارات غير معلومة عند تسجيل الدخول",                                // 201
      "User validation failed": "تأكيد المستخدم فشل",                                                                  // 202
      "Username already exists.": "اسم المستخدم مسجل",                                                                 // 203
      "You are not logged in.": "لم تسجل دخولك",                                                                       // 204
      "You've been logged out by the server. Please log in again.": "لقد تم تسجيل خروجك من قبل الخادم. قم بتسجيل الدخول مجددا.",
      "Your session has expired. Please log in again.": "لقد انتهت جلستك. قم بتسجيل الدخول مجددا.",                    // 206
      "No matching login attempt found": "لم نجد محاولة دخول مطابقة",                                                  // 207
      "Password is old. Please reset your password.": "كلمة السر قديمة. قم باعادة تعيين كلمة السر.",                   // 208
      "Incorrect password": "كلمة السر غير صحيحة.",                                                                    // 209
      "Invalid email": "البريد الالكترونى غير صالح",                                                                   // 210
      "Must be logged in": "يجب ان تسجل دخولك",                                                                        // 211
      "Need to set a username or email": "يجب تعيين اسم مستخدم او بريد الكترونى",                                      // 212
      "old password format": "صيغة كلمة السر القديمة",                                                                 // 213
      "Password may not be empty": "كلمة السر لا يمكن ان تترك فارغة",                                                  // 214
      "Signups forbidden": "فتح الحسابات غير مسموح",                                                                   // 215
      "Token expired": "انتهى زمن الرمز",                                                                              // 216
      "Token has invalid email address": "الرمز يحتوى على بريد الكترونى غير صالح",                                     // 217
      "User has no password set": "المستخدم لم يقم بتعيين كلمة سر",                                                    // 218
      "User not found": "اسم المستخدم غير موجود",                                                                      // 219
      "Verify email link expired": "انتهى زمن رابط تأكيد البريد الالكترونى",                                           // 220
      "Verify email link is for unknown address": "رابط تأكيد البريد الالكترونى ينتمى الى بريد الكترونى غير معروف",    // 221
      "Match failed": "المطابقة فشلت",                                                                                 // 222
      "Unknown error": "خطأ غير معروف"                                                                                 // 223
    }                                                                                                                  // 224
  }                                                                                                                    // 225
};                                                                                                                     // 226
                                                                                                                       // 227
T9n.map("ar", ar);                                                                                                     // 228
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 230
}).call(this);                                                                                                         // 231
                                                                                                                       // 232
                                                                                                                       // 233
                                                                                                                       // 234
                                                                                                                       // 235
                                                                                                                       // 236
                                                                                                                       // 237
(function () {                                                                                                         // 238
                                                                                                                       // 239
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/zh_cn.coffee.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var zh_cn;                                                                                                             // 247
                                                                                                                       // 248
zh_cn = {                                                                                                              // 249
  add: "添加",                                                                                                           // 250
  and: "和",                                                                                                            // 251
  back: "返回",                                                                                                          // 252
  changePassword: "修改密码",                                                                                              // 253
  choosePassword: "新密码",                                                                                               // 254
  clickAgree: "点击注册表示您同意",                                                                                             // 255
  configure: "配置",                                                                                                     // 256
  createAccount: "创建账户",                                                                                               // 257
  currentPassword: "当前密码",                                                                                             // 258
  dontHaveAnAccount: "没有账户？",                                                                                          // 259
  email: "电子邮箱",                                                                                                       // 260
  emailAddress: "电邮地址",                                                                                                // 261
  emailResetLink: "邮件重置链接",                                                                                            // 262
  forgotPassword: "忘记密码？",                                                                                             // 263
  ifYouAlreadyHaveAnAccount: "如果您已有账户",                                                                                // 264
  newPassword: "新密码",                                                                                                  // 265
  newPasswordAgain: "再输一遍新密码",                                                                                         // 266
  optional: "可选的",                                                                                                     // 267
  OR: "或",                                                                                                             // 268
  password: "密码",                                                                                                      // 269
  passwordAgain: "再输一遍密码",                                                                                             // 270
  privacyPolicy: "隐私条例",                                                                                               // 271
  remove: "移除",                                                                                                        // 272
  resetYourPassword: "重置您的密码",                                                                                         // 273
  setPassword: "设置密码",                                                                                                 // 274
  sign: "登",                                                                                                           // 275
  signIn: "登录",                                                                                                        // 276
  signin: "登录",                                                                                                        // 277
  signOut: "登出",                                                                                                       // 278
  signUp: "注册",                                                                                                        // 279
  signupCode: "注册码",                                                                                                   // 280
  signUpWithYourEmailAddress: "用您的电子邮件地址注册",                                                                           // 281
  terms: "使用条例",                                                                                                       // 282
  updateYourPassword: "更新您的密码",                                                                                        // 283
  username: "用户名",                                                                                                     // 284
  usernameOrEmail: "用户名或电子邮箱",                                                                                         // 285
  "with": "与",                                                                                                         // 286
  info: {                                                                                                              // 287
    emailSent: "邮件已发出",                                                                                                // 288
    emailVerified: "邮件验证成功",                                                                                           // 289
    passwordChanged: "密码修改成功",                                                                                         // 290
    passwordReset: "密码重置成功"                                                                                            // 291
  },                                                                                                                   // 292
  error: {                                                                                                             // 293
    emailRequired: "必须填写电子邮件",                                                                                         // 294
    minChar: "密码至少7个字符长",                                                                                              // 295
    pwdsDontMatch: "两次密码不一致",                                                                                          // 296
    pwOneDigit: "密码中至少有一位数字",                                                                                          // 297
    pwOneLetter: "密码中至少有一位字母",                                                                                         // 298
    signInRequired: "您必须登录后才能查看",                                                                                      // 299
    signupCodeIncorrect: "注册码错误",                                                                                      // 300
    signupCodeRequired: "必须有注册码",                                                                                      // 301
    usernameIsEmail: "是用户名而不是电子邮件地址",                                                                                  // 302
    usernameRequired: "必须填写用户名。",                                                                                      // 303
    accounts: {                                                                                                        // 304
      "Email already exists.": "该电子邮件地址已被使用。",                                                                         // 305
      "Email doesn't match the criteria.": "错误的的电子邮件地址。",                                                              // 306
      "Invalid login token": "登录密匙错误",                                                                                 // 307
      "Login forbidden": "登录被阻止",                                                                                      // 308
      "Service unknown": "未知服务",                                                                                       // 309
      "Unrecognized options for login request": "登录请求存在无法识别的选项",                                                       // 310
      "User validation failed": "用户验证失败",                                                                              // 311
      "Username already exists.": "用户名已被占用。",                                                                          // 312
      "You are not logged in.": "您还没有登录。",                                                                             // 313
      "You've been logged out by the server. Please log in again.": "您被服务器登出了。请重新登录。",                                 // 314
      "Your session has expired. Please log in again.": "会话过期，请重新登录。",                                                 // 315
      "No matching login attempt found": "未发现对应登录请求",                                                                  // 316
      "Password is old. Please reset your password.": "密码过于老了，请重置您的密码。",                                               // 317
      "Incorrect password": "错误的密码",                                                                                   // 318
      "Invalid email": "不合法的电子邮件地址",                                                                                   // 319
      "Must be logged in": "必须先登录",                                                                                    // 320
      "Need to set a username or email": "必须设置用户名或电子邮件地址",                                                             // 321
      "old password format": "较老的密码格式",                                                                                // 322
      "Password may not be empty": "密码不应该为空",                                                                          // 323
      "Signups forbidden": "注册被禁止",                                                                                    // 324
      "Token expired": "密匙过期",                                                                                         // 325
      "Token has invalid email address": "密匙对应的电子邮箱地址不合法",                                                             // 326
      "User has no password set": "用户没有密码",                                                                            // 327
      "User not found": "未找到该用户",                                                                                      // 328
      "Verify email link expired": "激活验证邮件的链接已过期",                                                                     // 329
      "Verify email link is for unknown address": "验证邮件的链接去向未知地址",                                                     // 330
      "Match failed": "匹配失败",                                                                                          // 331
      "Unknown error": "未知错误"                                                                                          // 332
    }                                                                                                                  // 333
  }                                                                                                                    // 334
};                                                                                                                     // 335
                                                                                                                       // 336
T9n.map("zh_cn", zh_cn);                                                                                               // 337
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 339
}).call(this);                                                                                                         // 340
                                                                                                                       // 341
                                                                                                                       // 342
                                                                                                                       // 343
                                                                                                                       // 344
                                                                                                                       // 345
                                                                                                                       // 346
(function () {                                                                                                         // 347
                                                                                                                       // 348
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/ca.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var ca;                                                                                                                // 356
                                                                                                                       // 357
ca = {                                                                                                                 // 358
  add: "afegir",                                                                                                       // 359
  and: "i",                                                                                                            // 360
  back: "enrere",                                                                                                      // 361
  changePassword: "Canviar contrasenya",                                                                               // 362
  choosePassword: "Escollir contrasenya",                                                                              // 363
  clickAgree: "Al fer clic a Subscriure aproves la",                                                                   // 364
  configure: "Disposició",                                                                                             // 365
  createAccount: "Crear compte",                                                                                       // 366
  currentPassword: "Contrasenya actual",                                                                               // 367
  dontHaveAnAccount: "No tens un compte?",                                                                             // 368
  email: "Correu",                                                                                                     // 369
  emailAddress: "Adreça de correu",                                                                                    // 370
  emailResetLink: "Reiniciar correu",                                                                                  // 371
  forgotPassword: "Has oblidat la contrasenya?",                                                                       // 372
  ifYouAlreadyHaveAnAccount: "Si ja tens un compte",                                                                   // 373
  newPassword: "Nova contrasenya",                                                                                     // 374
  newPasswordAgain: "Nova contrasenya (repetir)",                                                                      // 375
  optional: "Opcional",                                                                                                // 376
  OR: "O",                                                                                                             // 377
  password: "Contrasenya",                                                                                             // 378
  passwordAgain: "Contrasenya (repetir)",                                                                              // 379
  privacyPolicy: "Política de Privacitat",                                                                             // 380
  remove: "eliminar",                                                                                                  // 381
  resetYourPassword: "Resetejar la teva contrasenya",                                                                  // 382
  setPassword: "Definir contrasenya",                                                                                  // 383
  sign: "Signar",                                                                                                      // 384
  signIn: "Entrar",                                                                                                    // 385
  signin: "entrar",                                                                                                    // 386
  signOut: "Sortir",                                                                                                   // 387
  signUp: "Subscriure",                                                                                                // 388
  signupCode: "Còdi de subscripció",                                                                                   // 389
  signUpWithYourEmailAddress: "Subscriure amb el teu correu",                                                          // 390
  terms: "Termes d'ús",                                                                                                // 391
  updateYourPassword: "Actualitzar la teva contrasenya",                                                               // 392
  username: "Usuari",                                                                                                  // 393
  usernameOrEmail: "Usuari o correu",                                                                                  // 394
  "with": "amb",                                                                                                       // 395
  info: {                                                                                                              // 396
    emailSent: "Correu enviat",                                                                                        // 397
    emailVerified: "Correu verificat",                                                                                 // 398
    passwordChanged: "Contrasenya canviada",                                                                           // 399
    passwordReset: "Reiniciar contrasenya"                                                                             // 400
  },                                                                                                                   // 401
  error: {                                                                                                             // 402
    emailRequired: "Es requereix el correu.",                                                                          // 403
    minChar: "7 caràcters mínim.",                                                                                     // 404
    pwdsDontMatch: "Les contrasenyes no coincideixen",                                                                 // 405
    pwOneDigit: "mínim un dígit.",                                                                                     // 406
    pwOneLetter: "mínim una lletra.",                                                                                  // 407
    signInRequired: "Has d'iniciar sessió per a fer això.",                                                            // 408
    signupCodeIncorrect: "El còdi de subscripció no coincideix.",                                                      // 409
    signupCodeRequired: "Es requereix el còdi de subscripció.",                                                        // 410
    usernameIsEmail: "L'usuari no pot ser el correu.",                                                                 // 411
    usernameRequired: "Es requereix un usuari.",                                                                       // 412
    accounts: {                                                                                                        // 413
      "Email already exists.": "El correu ja existeix.",                                                               // 414
      "Email doesn't match the criteria.": "El correu no coincideix amb els criteris.",                                // 415
      "User validation failed": "No s'ha pogut validar l'usuari",                                                      // 416
      "Username already exists.": "L'usuari ja existeix.",                                                             // 417
      "You've been logged out by the server. Please log in again.": "Has estat desconnectat pel servidor. Si us plau, entra de nou.",
      "Your session has expired. Please log in again.": "La teva sessió ha expirat. Si us plau, entra de nou.",        // 419
      "Incorrect password": "Contrasenya invàlida",                                                                    // 420
      "Must be logged in": "Has d'entrar",                                                                             // 421
      "Need to set a username or email": "Has d'especificar un usuari o un correu",                                    // 422
      "Signups forbidden": "Registre prohibit",                                                                        // 423
      "Token expired": "Token expirat",                                                                                // 424
      "Token has invalid email address": "Token conté un correu invàlid",                                              // 425
      "User has no password set": "Usuari no té contrasenya",                                                          // 426
      "User not found": "Usuari no trobat",                                                                            // 427
      "Verify email link expired": "L'enllaç per a verificar el correu ha expirat",                                    // 428
      "Verify email link is for unknown address": "L'enllaç per a verificar el correu conté una adreça desconeguda"    // 429
    }                                                                                                                  // 430
  }                                                                                                                    // 431
};                                                                                                                     // 432
                                                                                                                       // 433
T9n.map("ca", ca);                                                                                                     // 434
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 436
}).call(this);                                                                                                         // 437
                                                                                                                       // 438
                                                                                                                       // 439
                                                                                                                       // 440
                                                                                                                       // 441
                                                                                                                       // 442
                                                                                                                       // 443
(function () {                                                                                                         // 444
                                                                                                                       // 445
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/cs.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var cs;                                                                                                                // 453
                                                                                                                       // 454
cs = {                                                                                                                 // 455
  add: "přidat",                                                                                                       // 456
  and: "a",                                                                                                            // 457
  back: "zpět",                                                                                                        // 458
  changePassword: "Změnte heslo",                                                                                      // 459
  choosePassword: "Zvolte heslo",                                                                                      // 460
  clickAgree: "Stiskem tlačítka Registrovat souhlasíte s",                                                             // 461
  configure: "Nastavit",                                                                                               // 462
  createAccount: "Vytvořit účet",                                                                                      // 463
  currentPassword: "Současné heslo",                                                                                   // 464
  dontHaveAnAccount: "Nemáte účet?",                                                                                   // 465
  email: "Email",                                                                                                      // 466
  emailAddress: "Emailová adresa",                                                                                     // 467
  emailResetLink: "Odkaz na reset emailu",                                                                             // 468
  forgotPassword: "Zapomenuté heslo?",                                                                                 // 469
  ifYouAlreadyHaveAnAccount: "Pokud již máte účet",                                                                    // 470
  newPassword: "Nové heslo",                                                                                           // 471
  newPasswordAgain: "Nové heslo (zopakovat)",                                                                          // 472
  optional: "Volitelný",                                                                                               // 473
  OR: "nebo",                                                                                                          // 474
  password: "Heslo",                                                                                                   // 475
  passwordAgain: "Heslo (zopakovat)",                                                                                  // 476
  privacyPolicy: "Nastavení soukromí",                                                                                 // 477
  remove: "odstranit",                                                                                                 // 478
  resetYourPassword: "Resetovat heslo",                                                                                // 479
  setPassword: "Nastavit heslo",                                                                                       // 480
  sign: "Přihlášení",                                                                                                  // 481
  signIn: "Přihlásit se",                                                                                              // 482
  signin: "přihlásit se",                                                                                              // 483
  signOut: "Odhlásit se",                                                                                              // 484
  signUp: "Registrovat",                                                                                               // 485
  signupCode: "Registrační kód",                                                                                       // 486
  signUpWithYourEmailAddress: "Registrovat se emailovou adresou",                                                      // 487
  terms: "Podmínky použití",                                                                                           // 488
  updateYourPassword: "Aktualizujte si své heslo",                                                                     // 489
  username: "Uživatelské jméno",                                                                                       // 490
  usernameOrEmail: "Uživatelské jméno nebo email",                                                                     // 491
  "with": "s",                                                                                                         // 492
  info: {                                                                                                              // 493
    emailSent: "Email odeslán",                                                                                        // 494
    emailVerified: "Email ověřen",                                                                                     // 495
    passwordChanged: "Heslo změněno",                                                                                  // 496
    passwordReset: "Heslo resetováno"                                                                                  // 497
  },                                                                                                                   // 498
  error: {                                                                                                             // 499
    emailRequired: "Email je povinný.",                                                                                // 500
    minChar: "minimální délka hesla je 7 znaků.",                                                                      // 501
    pwdsDontMatch: "Hesla nesouhlasí",                                                                                 // 502
    pwOneDigit: "Heslo musí obsahovat alespoň jednu číslici.",                                                         // 503
    pwOneLetter: "Heslo musí obsahovat alespoň 1 slovo.",                                                              // 504
    signInRequired: "Musíte být příhlášeni.",                                                                          // 505
    signupCodeIncorrect: "Registrační kód je chybný.",                                                                 // 506
    signupCodeRequired: "Registrační kód je povinný.",                                                                 // 507
    usernameIsEmail: "Uživatelské jméno nemůže být emailová adresa.",                                                  // 508
    usernameRequired: "Uživatelské jméno je povinné."                                                                  // 509
  },                                                                                                                   // 510
  accounts: {                                                                                                          // 511
    "A login handler should return a result or undefined": "Přihlašovací rutina musí vracet výsledek nebo undefined",  // 512
    "Email already exists.": "Email již existuje.",                                                                    // 513
    "Email doesn't match the criteria.": "Email nesplňuje požadavky.",                                                 // 514
    "Invalid login token": "Neplatný přihlašovací token",                                                              // 515
    "Login forbidden": "Přihlášení je zakázáno",                                                                       // 516
    "Service unknown": "Neznámá služba",                                                                               // 517
    "Unrecognized options for login request": "Nerozpoznaná volba přihlašovacího požadavku",                           // 518
    "User validation failed": "Validace uživatele selhala",                                                            // 519
    "Username already exists.": "Uživatelské jméno již existuje.",                                                     // 520
    "You are not logged in.": "Nejste přihlášený.",                                                                    // 521
    "You've been logged out by the server. Please log in again.": "Byl jste odhlášen. Prosím přihlašte se znovu.",     // 522
    "Your session has expired. Please log in again.": "Vaše připojení vypršelo. Prosím přihlašte se znovu.",           // 523
    "No matching login attempt found": "Nenalezen odpovídající způsob přihlášení",                                     // 524
    "Password is old. Please reset your password.": "Heslo je staré. Prosíme nastavte si ho znovu.",                   // 525
    "Incorrect password": "Chybné heslo",                                                                              // 526
    "Invalid email": "Neplatný email",                                                                                 // 527
    "Must be logged in": "Uživatel musí být přihlášen",                                                                // 528
    "Need to set a username or email": "Je třeba zadat uživatelské jméno nebo email",                                  // 529
    "old password format": "starý formát hesla",                                                                       // 530
    "Password may not be empty": "Heslo nemůže být prázdné",                                                           // 531
    "Signups forbidden": "Registrace je zakázaná",                                                                     // 532
    "Token expired": "Token vypršel",                                                                                  // 533
    "Token has invalid email address": "Token má neplatnou emailovou adresu",                                          // 534
    "User has no password set": "Uživatel nemá nastavené heslo",                                                       // 535
    "User not found": "Uživatel nenalezen",                                                                            // 536
    "Verify email link expired": "Odkaz pro ověření emailu vypršel",                                                   // 537
    "Verify email link is for unknown address": "Odkaz pro ověření emailu má neznámou adresu",                         // 538
    "Match failed": "Nesouhlasí",                                                                                      // 539
    "Unknown error": "Neznámá chyba"                                                                                   // 540
  }                                                                                                                    // 541
};                                                                                                                     // 542
                                                                                                                       // 543
T9n.map("cs", cs);                                                                                                     // 544
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 546
}).call(this);                                                                                                         // 547
                                                                                                                       // 548
                                                                                                                       // 549
                                                                                                                       // 550
                                                                                                                       // 551
                                                                                                                       // 552
                                                                                                                       // 553
(function () {                                                                                                         // 554
                                                                                                                       // 555
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/da.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var da;                                                                                                                // 563
                                                                                                                       // 564
da = {                                                                                                                 // 565
  add: "tilføj",                                                                                                       // 566
  and: "og",                                                                                                           // 567
  back: "tilbage",                                                                                                     // 568
  changePassword: "Skift kodeord",                                                                                     // 569
  choosePassword: "Vælg kodeord",                                                                                      // 570
  clickAgree: "Ved at klikke på tilmeld accepterer du vores",                                                          // 571
  configure: "Konfigurer",                                                                                             // 572
  createAccount: "Opret konto",                                                                                        // 573
  currentPassword: "Nuværende kodeord",                                                                                // 574
  dontHaveAnAccount: "Har du ikke en konto?",                                                                          // 575
  email: "E-mail",                                                                                                     // 576
  emailAddress: "E-mail adresse",                                                                                      // 577
  emailResetLink: "Nulstil E-mail Link",                                                                               // 578
  forgotPassword: "Glemt kodeord?",                                                                                    // 579
  ifYouAlreadyHaveAnAccount: "Hvis jeg allerede har en konto",                                                         // 580
  newPassword: "Nyt kodeord",                                                                                          // 581
  newPasswordAgain: "Nyt kodeord (igen)",                                                                              // 582
  optional: "Frivilligt",                                                                                              // 583
  OR: "eller",                                                                                                         // 584
  password: "Kodeord",                                                                                                 // 585
  passwordAgain: "Kodeord (igen)",                                                                                     // 586
  privacyPolicy: "Privatlivspolitik",                                                                                  // 587
  remove: "fjern",                                                                                                     // 588
  resetYourPassword: "Nulstil dit kodeord",                                                                            // 589
  setPassword: "Sæt kodeord",                                                                                          // 590
  sign: "Log",                                                                                                         // 591
  signIn: "Log ind",                                                                                                   // 592
  signin: "Log ind",                                                                                                   // 593
  signOut: "Log ud",                                                                                                   // 594
  signUp: "Tilmeld",                                                                                                   // 595
  signupCode: "Tilmeldingskode",                                                                                       // 596
  signUpWithYourEmailAddress: "Tilmeld med din e-mail adresse",                                                        // 597
  terms: "Betingelser for brug",                                                                                       // 598
  updateYourPassword: "Skift dit kodeord",                                                                             // 599
  username: "Brugernavn",                                                                                              // 600
  usernameOrEmail: "Brugernavn eller e-mail",                                                                          // 601
  "with": "med",                                                                                                       // 602
  info: {                                                                                                              // 603
    emailSent: "E-mail sendt",                                                                                         // 604
    emailVerified: "Email verificeret",                                                                                // 605
    passwordChanged: "Password ændret",                                                                                // 606
    passwordReset: "Password reset"                                                                                    // 607
  },                                                                                                                   // 608
  error: {                                                                                                             // 609
    emailRequired: "E-mail er påkrævet.",                                                                              // 610
    minChar: "Kodeordet skal være mindst 7 tegn.",                                                                     // 611
    pwdsDontMatch: "De to kodeord er ikke ens.",                                                                       // 612
    pwOneDigit: "Kodeord kræver mindste et tal.",                                                                      // 613
    pwOneLetter: "Kodeord kræver mindst et bogstav.",                                                                  // 614
    signInRequired: "Du skal være logget ind for at kunne gøre det.",                                                  // 615
    signupCodeIncorrect: "Tilmeldingskode er forkert.",                                                                // 616
    signupCodeRequired: "Tilmeldingskode er påkrævet.",                                                                // 617
    usernameIsEmail: "Brugernavn kan ikke være en e-mail adresse.",                                                    // 618
    usernameRequired: "Brugernavn skal udfyldes.",                                                                     // 619
    accounts: {                                                                                                        // 620
      "Email already exists.": "E-mail findes allerede.",                                                              // 621
      "Email doesn't match the criteria.": "E-mail modsvarer ikke kriteriet.",                                         // 622
      "Invalid login token": "Invalid log ind token",                                                                  // 623
      "Login forbidden": "Log ind forbudt",                                                                            // 624
      "Service unknown": "Service ukendt",                                                                             // 625
      "Unrecognized options for login request": "Ukendte options for login forsøg",                                    // 626
      "User validation failed": "Bruger validering fejlede",                                                           // 627
      "Username already exists.": "Brugernavn findes allerede.",                                                       // 628
      "You are not logged in.": "Du er ikke logget ind.",                                                              // 629
      "You've been logged out by the server. Please log in again.": "Du er blevet logget af serveren. Log ind igen.",  // 630
      "Your session has expired. Please log in again.": "Din session er udløbet. Log ind igen.",                       // 631
      "No matching login attempt found": "Der fandtes ingen login forsøg",                                             // 632
      "Password is old. Please reset your password.": "Kodeordet er for gammelt. Du skal resette det.",                // 633
      "Incorrect password": "Forkert kodeord",                                                                         // 634
      "Invalid email": "Invalid e-mail",                                                                               // 635
      "Must be logged in": "Du skal være logget ind",                                                                  // 636
      "Need to set a username or email": "Du skal angive enten brugernavn eller e-mail",                               // 637
      "old password format": "gammelt kodeord format",                                                                 // 638
      "Password may not be empty": "Kodeord skal være udfyldt",                                                        // 639
      "Signups forbidden": "Tilmeldinger forbudt",                                                                     // 640
      "Token expired": "Token udløbet",                                                                                // 641
      "Token has invalid email address": "Token har en invalid e-mail adresse",                                        // 642
      "User has no password set": "Bruger har ikke angivet noget kodeord",                                             // 643
      "User not found": "Bruger ej fundet",                                                                            // 644
      "Verify email link expired": "Verify email link expired",                                                        // 645
      "Verify email link is for unknown address": "Verificer e-mail link for ukendt adresse",                          // 646
      "Match failed": "Match fejlede",                                                                                 // 647
      "Unknown error": "Ukendt fejl"                                                                                   // 648
    }                                                                                                                  // 649
  }                                                                                                                    // 650
};                                                                                                                     // 651
                                                                                                                       // 652
T9n.map("da", da);                                                                                                     // 653
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 655
}).call(this);                                                                                                         // 656
                                                                                                                       // 657
                                                                                                                       // 658
                                                                                                                       // 659
                                                                                                                       // 660
                                                                                                                       // 661
                                                                                                                       // 662
(function () {                                                                                                         // 663
                                                                                                                       // 664
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/de.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var de;                                                                                                                // 672
                                                                                                                       // 673
de = {                                                                                                                 // 674
  add: "hinzufügen",                                                                                                   // 675
  and: "und",                                                                                                          // 676
  back: "zurück",                                                                                                      // 677
  changePassword: "Passwort ändern",                                                                                   // 678
  choosePassword: "Passwort auswählen",                                                                                // 679
  clickAgree: "Durch die Registrierung akzeptieren Sie unsere",                                                        // 680
  configure: "Konfigurieren",                                                                                          // 681
  createAccount: "Konto erstellen",                                                                                    // 682
  currentPassword: "Aktuelles Passwort",                                                                               // 683
  dontHaveAnAccount: "Noch kein Konto?",                                                                               // 684
  email: "E-Mail",                                                                                                     // 685
  emailAddress: "E-Mail Adresse",                                                                                      // 686
  emailResetLink: "Senden",                                                                                            // 687
  forgotPassword: "Passwort vergessen?",                                                                               // 688
  ifYouAlreadyHaveAnAccount: "Falls Sie ein Konto haben, bitte hier",                                                  // 689
  newPassword: "Neues Passwort",                                                                                       // 690
  newPasswordAgain: "Neues Passwort (wiederholen)",                                                                    // 691
  optional: "Optional",                                                                                                // 692
  OR: "ODER",                                                                                                          // 693
  password: "Passwort",                                                                                                // 694
  passwordAgain: "Passwort (wiederholen)",                                                                             // 695
  privacyPolicy: "Datenschutzerklärung",                                                                               // 696
  remove: "entfernen",                                                                                                 // 697
  resetYourPassword: "Passwort zurücksetzen",                                                                          // 698
  setPassword: "Passwort festlegen",                                                                                   // 699
  sign: "Anmelden",                                                                                                    // 700
  signIn: "Anmelden",                                                                                                  // 701
  signin: "anmelden",                                                                                                  // 702
  signOut: "Abmelden",                                                                                                 // 703
  signUp: "Registrieren",                                                                                              // 704
  signupCode: "Registrierungscode",                                                                                    // 705
  signUpWithYourEmailAddress: "Mit E-Mail registrieren",                                                               // 706
  terms: "Geschäftsbedingungen",                                                                                       // 707
  updateYourPassword: "Passwort aktualisieren",                                                                        // 708
  username: "Benutzername",                                                                                            // 709
  usernameOrEmail: "Benutzername oder E-Mail",                                                                         // 710
  "with": "mit",                                                                                                       // 711
  info: {                                                                                                              // 712
    emailSent: "E-Mail gesendet",                                                                                      // 713
    emailVerified: "E-Mail verifiziert",                                                                               // 714
    PasswordChanged: "Passwort geändert",                                                                              // 715
    PasswordReset: "Passwort zurückgesetzt"                                                                            // 716
  },                                                                                                                   // 717
  error: {                                                                                                             // 718
    emailRequired: "E-Mail benötigt.",                                                                                 // 719
    minChar: "Passwort muss mindestens 7 Zeichen lang sein.",                                                          // 720
    pwdsDontMatch: "Passwörter stimmen nicht überein.",                                                                // 721
    pwOneDigit: "Passwort muss mindestens eine Ziffer enthalten.",                                                     // 722
    pwOneLetter: "Passwort muss mindestens einen Buchstaben enthalten.",                                               // 723
    signInRequired: "Sie müssen sich anmelden.",                                                                       // 724
    signupCodeIncorrect: "Registrierungscode ungültig.",                                                               // 725
    signupCodeRequired: "Registrierungscode benötigt.",                                                                // 726
    usernameIsEmail: "Benutzername darf keine E-Mail Adresse sein.",                                                   // 727
    usernameRequired: "Benutzername benötigt.",                                                                        // 728
    accounts: {                                                                                                        // 729
      "Email already exists.": "Die E-Mail Adresse wird bereits verwendet.",                                           // 730
      "Email doesn't match the criteria.": "E-Mail Adresse erfüllt die Anforderungen nicht.",                          // 731
      "Invalid login token": "Ungültiger Login-Token",                                                                 // 732
      "Login forbidden": "Anmeldedaten ungültig",                                                                      // 733
      "Service unknown": "Dienst unbekannt",                                                                           // 734
      "Unrecognized options for login request": "Unbekannte Optionen für Login Request",                               // 735
      "User validation failed": "Die Benutzerdaten sind nicht korrekt",                                                // 736
      "Username already exists.": "Der Benutzer existiert bereits.",                                                   // 737
      "You are not logged in.": "Sie sind nicht eingeloggt.",                                                          // 738
      "You've been logged out by the server. Please log in again.": "Der Server hat Dich ausgeloggt. Bitte melde Dich erneut an.",
      "Your session has expired. Please log in again.": "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      "No matching login attempt found": "Kein passender Loginversuch gefunden.",                                      // 741
      "Password is old. Please reset your password.": "Passwort ist abgelaufen. Bitte setzen Sie es zurück.",          // 742
      "Incorrect password": "Falsches Passwort",                                                                       // 743
      "Invalid email": "Ungültige E-Mail Adresse",                                                                     // 744
      "Must be logged in": "Sie müssen sich anmelden",                                                                 // 745
      "Need to set a username or email": "Benutzername oder E-Mail Adresse müssen angegeben werden",                   // 746
      "Password may not be empty": "Das Passwort darf nicht leer sein",                                                // 747
      "Signups forbidden": "Anmeldungen sind nicht erlaubt",                                                           // 748
      "Token expired": "Token ist abgelaufen",                                                                         // 749
      "Token has invalid email address": "E-Mail Adresse passt nicht zum Token",                                       // 750
      "User has no password set": "Kein Passwort für den Benutzer angegeben",                                          // 751
      "User not found": "Benutzer nicht gefunden",                                                                     // 752
      "Verify email link expired": "Link zur E-Mail Verifizierung ist abgelaufen",                                     // 753
      "Verify email link is for unknown address": "Link zur Verifizierung ist für eine unbekannte E-Mail Adresse",     // 754
      "Match failed": "Abgleich fehlgeschlagen",                                                                       // 755
      "Unknown error": "Unbekannter Fehler"                                                                            // 756
    }                                                                                                                  // 757
  }                                                                                                                    // 758
};                                                                                                                     // 759
                                                                                                                       // 760
T9n.map("de", de);                                                                                                     // 761
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 763
}).call(this);                                                                                                         // 764
                                                                                                                       // 765
                                                                                                                       // 766
                                                                                                                       // 767
                                                                                                                       // 768
                                                                                                                       // 769
                                                                                                                       // 770
(function () {                                                                                                         // 771
                                                                                                                       // 772
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/el.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var el;                                                                                                                // 780
                                                                                                                       // 781
el = {                                                                                                                 // 782
  add: "προσθέστε",                                                                                                    // 783
  and: "και",                                                                                                          // 784
  back: "πίσω",                                                                                                        // 785
  changePassword: "Αλλαγή Κωδικού",                                                                                    // 786
  choosePassword: "Επιλογή Κωδικού",                                                                                   // 787
  clickAgree: "Πατώντας Εγγραφή, συμφωνείτε σε",                                                                       // 788
  configure: "Διαμόρφωση",                                                                                             // 789
  createAccount: "Δημιουργία Λογαριασμού",                                                                             // 790
  currentPassword: "Τρέχων Κωδικός",                                                                                   // 791
  dontHaveAnAccount: "Δεν έχετε λογαριασμό;",                                                                          // 792
  email: "Email",                                                                                                      // 793
  emailAddress: "Ηλεκτρονική Διεύθυνση",                                                                               // 794
  emailResetLink: "Αποστολή Συνδέσμου Επαναφοράς",                                                                     // 795
  forgotPassword: "Ξεχάσατε τον κωδικό;",                                                                              // 796
  ifYouAlreadyHaveAnAccount: "Αν έχετε ήδη λογαριασμό",                                                                // 797
  newPassword: "Νέος Κωδικός",                                                                                         // 798
  newPasswordAgain: "Νέος Κωδικός (ξανά)",                                                                             // 799
  optional: "Προαιρετικά",                                                                                             // 800
  OR: "Ή",                                                                                                             // 801
  password: "Κωδικός",                                                                                                 // 802
  passwordAgain: "Κωδικός (ξανά)",                                                                                     // 803
  privacyPolicy: "Πολιτική Απορρήτου",                                                                                 // 804
  remove: "αφαιρέστε",                                                                                                 // 805
  resetYourPassword: "Επαναφορά κωδικού",                                                                              // 806
  setPassword: "Ορίστε Κωδικό",                                                                                        // 807
  sign: "Σύνδεση",                                                                                                     // 808
  signIn: "Είσοδος",                                                                                                   // 809
  signin: "συνδεθείτε",                                                                                                // 810
  signOut: "Αποσύνδεση",                                                                                               // 811
  signUp: "Εγγραφή",                                                                                                   // 812
  signupCode: "Κώδικας Εγγραφής",                                                                                      // 813
  signUpWithYourEmailAddress: "Εγγραφή με την ηλεκτρονική σας διεύθυνση",                                              // 814
  terms: "Όροι Χρήσης",                                                                                                // 815
  updateYourPassword: "Ανανεώστε τον κωδικό σας",                                                                      // 816
  username: "Όνομα χρήστη",                                                                                            // 817
  usernameOrEmail: "Όνομα χρήστη ή email",                                                                             // 818
  "with": "με",                                                                                                        // 819
  info: {                                                                                                              // 820
    emailSent: "Το Email στάλθηκε",                                                                                    // 821
    emailVerified: "Το Email επιβεβαιώθηκε",                                                                           // 822
    passwordChanged: "Ο Κωδικός άλλαξε",                                                                               // 823
    passwordReset: "Ο Κωδικός επαναφέρθηκε"                                                                            // 824
  },                                                                                                                   // 825
  error: {                                                                                                             // 826
    emailRequired: "Το Email απαιτείται.",                                                                             // 827
    minChar: "7 χαρακτήρες τουλάχιστον.",                                                                              // 828
    pwdsDontMatch: "Οι κωδικοί δεν ταιριάζουν",                                                                        // 829
    pwOneDigit: "Ο κωδικός πρέπει να έχει τουλάχιστον ένα ψηφίο.",                                                     // 830
    pwOneLetter: "Ο κωδικός πρέπει να έχει τουλάχιστον ένα γράμμα.",                                                   // 831
    signInRequired: "Πρέπει να είστε συνδεδεμένος για να πραγματοποιήσετε αυτή την ενέργεια.",                         // 832
    signupCodeIncorrect: "Ο κώδικας εγγραφής δεν είναι σωστός.",                                                       // 833
    signupCodeRequired: "Ο κώδικας εγγραφής απαιτείται.",                                                              // 834
    usernameIsEmail: "Το όνομα χρήστη δεν μπορεί να είναι μια διεύθυνση email.",                                       // 835
    usernameRequired: "Το όνομα χρήστη απαιτείται.",                                                                   // 836
    accounts: {                                                                                                        // 837
      "Email already exists.": "Αυτό το email υπάρχει ήδη.",                                                           // 838
      "Email doesn't match the criteria.": "Το email δεν ταιριάζει με τα κριτήρια.",                                   // 839
      "Invalid login token": "Άκυρο διακριτικό σύνδεσης",                                                              // 840
      "Login forbidden": "Η είσοδος απαγορεύεται",                                                                     // 841
      "Service unknown": "Άγνωστη υπηρεσία",                                                                           // 842
      "Unrecognized options for login request": "Μη αναγνωρίσιμες επιλογές για αίτημα εισόδου",                        // 843
      "User validation failed": "Η επικύρωση του χρήστη απέτυχε",                                                      // 844
      "Username already exists.": "Αυτό το όνομα χρήστη υπάρχει ήδη.",                                                 // 845
      "You are not logged in.": "Δεν είστε συνδεδεμένος.",                                                             // 846
      "You've been logged out by the server. Please log in again.": "Αποσυνδεθήκατε από τον διακομιστή. Παρακαλούμε συνδεθείτε ξανά.",
      "Your session has expired. Please log in again.": "Η συνεδρία έληξε. Παρακαλούμε συνδεθείτε ξανά.",              // 848
      "No matching login attempt found": "Δεν βρέθηκε καμία απόπειρα σύνδεσης που να ταιριάζει",                       // 849
      "Password is old. Please reset your password.": "Ο κωδικός είναι παλιός. Παρακαλούμε επαναφέρετε τον κωδικό σας.",
      "Incorrect password": "Εσφαλμένος κωδικός",                                                                      // 851
      "Invalid email": "Εσφαλμένο email",                                                                              // 852
      "Must be logged in": "Πρέπει να είστε συνδεδεμένος",                                                             // 853
      "Need to set a username or email": "Χρειάζεται να ορίσετε όνομα χρήστη ή email",                                 // 854
      "old password format": "κωδικός παλιάς μορφής",                                                                  // 855
      "Password may not be empty": "Ο κωδικός δεν μπορεί να είναι άδειος",                                             // 856
      "Signups forbidden": "Οι εγγραφές απαγορεύονται",                                                                // 857
      "Token expired": "Το διακριτικό σύνδεσης έληξε",                                                                 // 858
      "Token has invalid email address": "Το διακριτικό σύνδεσης έχει άκυρη διεύθυνση email",                          // 859
      "User has no password set": "Ο χρήστης δεν έχει ορίσει κωδικό",                                                  // 860
      "User not found": "Ο χρήστης δεν βρέθηκε",                                                                       // 861
      "Verify email link expired": "Ο σύνδεσμος επαλήθευσης του email έληξε",                                          // 862
      "Verify email link is for unknown address": "Ο σύνδεσμος επαλήθευσης του email είναι για άγνωστη διεύθυνση",     // 863
      "Match failed": "Η αντιστοίχηση απέτυχε",                                                                        // 864
      "Unknown error": "Άγνωστο σφάλμα"                                                                                // 865
    }                                                                                                                  // 866
  }                                                                                                                    // 867
};                                                                                                                     // 868
                                                                                                                       // 869
T9n.map("el", el);                                                                                                     // 870
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 872
}).call(this);                                                                                                         // 873
                                                                                                                       // 874
                                                                                                                       // 875
                                                                                                                       // 876
                                                                                                                       // 877
                                                                                                                       // 878
                                                                                                                       // 879
(function () {                                                                                                         // 880
                                                                                                                       // 881
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/en.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var en;                                                                                                                // 889
                                                                                                                       // 890
en = {                                                                                                                 // 891
  add: "add",                                                                                                          // 892
  and: "and",                                                                                                          // 893
  back: "back",                                                                                                        // 894
  changePassword: "Change Password",                                                                                   // 895
  choosePassword: "Choose a Password",                                                                                 // 896
  clickAgree: "By clicking Register, you agree to our",                                                                // 897
  configure: "Configure",                                                                                              // 898
  createAccount: "Create an Account",                                                                                  // 899
  currentPassword: "Current Password",                                                                                 // 900
  dontHaveAnAccount: "Don't have an account?",                                                                         // 901
  email: "Email",                                                                                                      // 902
  emailAddress: "Email Address",                                                                                       // 903
  emailResetLink: "Email Reset Link",                                                                                  // 904
  forgotPassword: "Forgot your password?",                                                                             // 905
  ifYouAlreadyHaveAnAccount: "If you already have an account",                                                         // 906
  newPassword: "New Password",                                                                                         // 907
  newPasswordAgain: "New Password (again)",                                                                            // 908
  optional: "Optional",                                                                                                // 909
  OR: "OR",                                                                                                            // 910
  password: "Password",                                                                                                // 911
  passwordAgain: "Password (again)",                                                                                   // 912
  privacyPolicy: "Privacy Policy",                                                                                     // 913
  remove: "remove",                                                                                                    // 914
  resetYourPassword: "Reset your password",                                                                            // 915
  setPassword: "Set Password",                                                                                         // 916
  sign: "Sign",                                                                                                        // 917
  signIn: "Sign In",                                                                                                   // 918
  signin: "sign in",                                                                                                   // 919
  signOut: "Sign Out",                                                                                                 // 920
  signUp: "Register",                                                                                                  // 921
  signupCode: "Registration Code",                                                                                     // 922
  signUpWithYourEmailAddress: "Register with your email address",                                                      // 923
  terms: "Terms of Use",                                                                                               // 924
  updateYourPassword: "Update your password",                                                                          // 925
  username: "Username",                                                                                                // 926
  usernameOrEmail: "Username or email",                                                                                // 927
  "with": "with",                                                                                                      // 928
  info: {                                                                                                              // 929
    emailSent: "Email sent",                                                                                           // 930
    emailVerified: "Email verified",                                                                                   // 931
    passwordChanged: "Password changed",                                                                               // 932
    passwordReset: "Password reset"                                                                                    // 933
  },                                                                                                                   // 934
  error: {                                                                                                             // 935
    emailRequired: "Email is required.",                                                                               // 936
    minChar: "7 character minimum password.",                                                                          // 937
    pwdsDontMatch: "Passwords don't match",                                                                            // 938
    pwOneDigit: "Password must have at least one digit.",                                                              // 939
    pwOneLetter: "Password requires 1 letter.",                                                                        // 940
    signInRequired: "You must be signed in to do that.",                                                               // 941
    signupCodeIncorrect: "Registration code is incorrect.",                                                            // 942
    signupCodeRequired: "Registration code is required.",                                                              // 943
    usernameIsEmail: "Username cannot be an email address.",                                                           // 944
    usernameRequired: "Username is required.",                                                                         // 945
    accounts: {                                                                                                        // 946
      "Email already exists.": "Email already exists.",                                                                // 947
      "Email doesn't match the criteria.": "Email doesn't match the criteria.",                                        // 948
      "Invalid login token": "Invalid login token",                                                                    // 949
      "Login forbidden": "Login forbidden",                                                                            // 950
      "Service unknown": "Service unknown",                                                                            // 951
      "Unrecognized options for login request": "Unrecognized options for login request",                              // 952
      "User validation failed": "User validation failed",                                                              // 953
      "Username already exists.": "Username already exists.",                                                          // 954
      "You are not logged in.": "You are not logged in.",                                                              // 955
      "You've been logged out by the server. Please log in again.": "You've been logged out by the server. Please log in again.",
      "Your session has expired. Please log in again.": "Your session has expired. Please log in again.",              // 957
      "No matching login attempt found": "No matching login attempt found",                                            // 958
      "Password is old. Please reset your password.": "Password is old. Please reset your password.",                  // 959
      "Incorrect password": "Incorrect password",                                                                      // 960
      "Invalid email": "Invalid email",                                                                                // 961
      "Must be logged in": "Must be logged in",                                                                        // 962
      "Need to set a username or email": "Need to set a username or email",                                            // 963
      "old password format": "old password format",                                                                    // 964
      "Password may not be empty": "Password may not be empty",                                                        // 965
      "Signups forbidden": "Signups forbidden",                                                                        // 966
      "Token expired": "Token expired",                                                                                // 967
      "Token has invalid email address": "Token has invalid email address",                                            // 968
      "User has no password set": "User has no password set",                                                          // 969
      "User not found": "User not found",                                                                              // 970
      "Verify email link expired": "Verify email link expired",                                                        // 971
      "Verify email link is for unknown address": "Verify email link is for unknown address",                          // 972
      "Match failed": "Match failed",                                                                                  // 973
      "Unknown error": "Unknown error"                                                                                 // 974
    }                                                                                                                  // 975
  }                                                                                                                    // 976
};                                                                                                                     // 977
                                                                                                                       // 978
T9n.map("en", en);                                                                                                     // 979
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 981
}).call(this);                                                                                                         // 982
                                                                                                                       // 983
                                                                                                                       // 984
                                                                                                                       // 985
                                                                                                                       // 986
                                                                                                                       // 987
                                                                                                                       // 988
(function () {                                                                                                         // 989
                                                                                                                       // 990
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/es.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var es;                                                                                                                // 998
                                                                                                                       // 999
es = {                                                                                                                 // 1000
  add: "agregar",                                                                                                      // 1001
  and: "y",                                                                                                            // 1002
  back: "atrás",                                                                                                       // 1003
  changePassword: "Cambiar contraseña",                                                                                // 1004
  choosePassword: "Eligir contraseña",                                                                                 // 1005
  clickAgree: "Al hacer clic en Sucribir apruebas la",                                                                 // 1006
  configure: "Disposición",                                                                                            // 1007
  createAccount: "Crear cuenta",                                                                                       // 1008
  currentPassword: "Contraseña actual",                                                                                // 1009
  dontHaveAnAccount: "No tienes una cuenta?",                                                                          // 1010
  email: "Email",                                                                                                      // 1011
  emailAddress: "Dirección de email",                                                                                  // 1012
  emailResetLink: "Reiniciar email",                                                                                   // 1013
  forgotPassword: "Olvidó su contraseña?",                                                                             // 1014
  ifYouAlreadyHaveAnAccount: "Si ya tiene una cuenta",                                                                 // 1015
  newPassword: "Nueva contraseña",                                                                                     // 1016
  newPasswordAgain: "Nueva contraseña (repetir)",                                                                      // 1017
  optional: "Opcional",                                                                                                // 1018
  OR: "O",                                                                                                             // 1019
  password: "Contraseña",                                                                                              // 1020
  passwordAgain: "Contraseña (repetir)",                                                                               // 1021
  privacyPolicy: "Póliza de Privacidad",                                                                               // 1022
  remove: "remover",                                                                                                   // 1023
  resetYourPassword: "Resetear tu contraseña",                                                                         // 1024
  setPassword: "Definir contraseña",                                                                                   // 1025
  sign: "Ingresar",                                                                                                    // 1026
  signIn: "Entrar",                                                                                                    // 1027
  signin: "entrar",                                                                                                    // 1028
  signOut: "Salir",                                                                                                    // 1029
  signUp: "Registrarse",                                                                                               // 1030
  signupCode: "Código de registro",                                                                                    // 1031
  signUpWithYourEmailAddress: "Registrarse con tu email",                                                              // 1032
  terms: "Términos de uso",                                                                                            // 1033
  updateYourPassword: "Actualizar tu contraseña",                                                                      // 1034
  username: "Usuario",                                                                                                 // 1035
  usernameOrEmail: "Usuario o email",                                                                                  // 1036
  "with": "con",                                                                                                       // 1037
  info: {                                                                                                              // 1038
    emailSent: "Email enviado",                                                                                        // 1039
    emailVerified: "Email verificado",                                                                                 // 1040
    passwordChanged: "Contraseña cambiada",                                                                            // 1041
    passwordReset: "Resetear contraseña"                                                                               // 1042
  },                                                                                                                   // 1043
  error: {                                                                                                             // 1044
    emailRequired: "El email es requerido.",                                                                           // 1045
    minChar: "7 caracteres mínimo.",                                                                                   // 1046
    pwdsDontMatch: "Las contraseñas no coinciden",                                                                     // 1047
    pwOneDigit: "mínimo un dígito.",                                                                                   // 1048
    pwOneLetter: "mínimo una letra.",                                                                                  // 1049
    signInRequired: "Debes iniciar sesión para hacer eso.",                                                            // 1050
    signupCodeIncorrect: "El código de suscripción no coincide.",                                                      // 1051
    signupCodeRequired: "Se requiere el código de suscripción.",                                                       // 1052
    usernameIsEmail: "El usuario no puede ser el email.",                                                              // 1053
    usernameRequired: "Se requiere un usuario.",                                                                       // 1054
    accounts: {                                                                                                        // 1055
      "Email already exists.": "El email ya existe.",                                                                  // 1056
      "Email doesn't match the criteria.": "El email no coincide con los criterios.",                                  // 1057
      "User validation failed": "No se ha podido validar el usuario",                                                  // 1058
      "Username already exists.": "El usuario ya existe.",                                                             // 1059
      "You've been logged out by the server. Please log in again.": "Has sido desconectado por el servidor. Por favor ingresa de nuevo.",
      "Your session has expired. Please log in again.": "Tu sesión ha expirado. Por favor ingresa de nuevo.",          // 1061
      "Incorrect password": "Contraseña inválida",                                                                     // 1062
      "Must be logged in": "Debes ingresar",                                                                           // 1063
      "Need to set a username or email": "Tienes que especificar un usuario o un email",                               // 1064
      "Signups forbidden": "Registro prohibido",                                                                       // 1065
      "Token expired": "Token expirado",                                                                               // 1066
      "Token has invalid email address": "Token contiene un email inválido",                                           // 1067
      "User has no password set": "Usuario no tiene contraseña",                                                       // 1068
      "User not found": "Usuario no encontrado",                                                                       // 1069
      "Verify email link expired": "El enlace para verificar el email ha expirado",                                    // 1070
      "Verify email link is for unknown address": "El enlace para verificar el email contiene una dirección desconocida"
    }                                                                                                                  // 1072
  }                                                                                                                    // 1073
};                                                                                                                     // 1074
                                                                                                                       // 1075
T9n.map("es", es);                                                                                                     // 1076
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1078
}).call(this);                                                                                                         // 1079
                                                                                                                       // 1080
                                                                                                                       // 1081
                                                                                                                       // 1082
                                                                                                                       // 1083
                                                                                                                       // 1084
                                                                                                                       // 1085
(function () {                                                                                                         // 1086
                                                                                                                       // 1087
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/es_ES.coffee.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var es_ES;                                                                                                             // 1095
                                                                                                                       // 1096
es_ES = {                                                                                                              // 1097
  add: "agregar",                                                                                                      // 1098
  and: "y",                                                                                                            // 1099
  back: "atrás",                                                                                                       // 1100
  changePassword: "Cambiar Contraseña",                                                                                // 1101
  choosePassword: "Eligir Contraseña",                                                                                 // 1102
  clickAgree: "Si haces clic en Crear Cuenta estás de acuerdo con la",                                                 // 1103
  configure: "Configurar",                                                                                             // 1104
  createAccount: "Crear cuenta",                                                                                       // 1105
  currentPassword: "Contraseña actual",                                                                                // 1106
  dontHaveAnAccount: "¿No estás registrado?",                                                                          // 1107
  email: "Email",                                                                                                      // 1108
  emailAddress: "Dirección de email",                                                                                  // 1109
  emailResetLink: "Restaurar email",                                                                                   // 1110
  forgotPassword: "¿Has olvidado tu contraseña?",                                                                      // 1111
  ifYouAlreadyHaveAnAccount: "Ya tienes una cuenta, ",                                                                 // 1112
  newPassword: "Nueva Contraseña",                                                                                     // 1113
  newPasswordAgain: "Nueva Contraseña (repetición)",                                                                   // 1114
  optional: "Opcional",                                                                                                // 1115
  OR: "O",                                                                                                             // 1116
  password: "Contraseña",                                                                                              // 1117
  passwordAgain: "Contraseña (repetición)",                                                                            // 1118
  privacyPolicy: "Póliza de Privacidad",                                                                               // 1119
  remove: "remover",                                                                                                   // 1120
  resetYourPassword: "Recuperar tu contraseña",                                                                        // 1121
  setPassword: "Definir Contraseña",                                                                                   // 1122
  sign: "Entrar",                                                                                                      // 1123
  signIn: "Entrar",                                                                                                    // 1124
  signin: "entra",                                                                                                     // 1125
  signOut: "Salir",                                                                                                    // 1126
  signUp: "Regístrate",                                                                                                // 1127
  signupCode: "Código para registrarte",                                                                               // 1128
  signUpWithYourEmailAddress: "Regístrate con tu email",                                                               // 1129
  terms: "Términos de Uso",                                                                                            // 1130
  updateYourPassword: "Actualizar tu contraseña",                                                                      // 1131
  username: "Usuario",                                                                                                 // 1132
  usernameOrEmail: "Usuario o email",                                                                                  // 1133
  "with": "con",                                                                                                       // 1134
  info: {                                                                                                              // 1135
    emailSent: "Email enviado",                                                                                        // 1136
    emailVerified: "Email verificado",                                                                                 // 1137
    passwordChanged: "Contraseña cambiado",                                                                            // 1138
    passwordReset: "Resetar Contraseña"                                                                                // 1139
  },                                                                                                                   // 1140
  error: {                                                                                                             // 1141
    emailRequired: "El email es necesario.",                                                                           // 1142
    minChar: "7 carácteres mínimo.",                                                                                   // 1143
    pwdsDontMatch: "Contraseñas no coninciden",                                                                        // 1144
    pwOneDigit: "mínimo un dígito.",                                                                                   // 1145
    pwOneLetter: "mínimo una letra.",                                                                                  // 1146
    signInRequired: "Debes iniciar sesión para esta opción.",                                                          // 1147
    signupCodeIncorrect: "Código de registro inválido.",                                                               // 1148
    signupCodeRequired: "Se requiere un código de registro.",                                                          // 1149
    usernameIsEmail: "El usuario no puede ser una dirección de correo.",                                               // 1150
    usernameRequired: "Se quiere nombre de usuario.",                                                                  // 1151
    accounts: {                                                                                                        // 1152
      "Email already exists.": "El correo ya existe.",                                                                 // 1153
      "Email doesn't match the criteria.": "El correo no coincide.",                                                   // 1154
      "User validation failed": "No hemos podido verificar el usuario",                                                // 1155
      "Username already exists.": "Este usuario ya existe.",                                                           // 1156
      "You've been logged out by the server. Please log in again.": "Has sido desconectado por el servidor. Por favor inicia sesión de nuevo.",
      "Your session has expired. Please log in again.": "Tu session ha expirado. Por favor inicia sesión de nuevo.",   // 1158
      "Incorrect password": "Contraseña inválida",                                                                     // 1159
      "Must be logged in": "Debes iniciar sesión",                                                                     // 1160
      "Need to set a username or email": "Debes especificar un usuario o email",                                       // 1161
      "Signups forbidden": "Los registros no están permitidos en este momento",                                        // 1162
      "Token expired": "El token ha expirado",                                                                         // 1163
      "Token has invalid email address": "EL token contiene un email inválido",                                        // 1164
      "User has no password set": "El usuario no tiene contraseña",                                                    // 1165
      "User not found": "Usuario no encontrado",                                                                       // 1166
      "Verify email link expired": "El enlace para verificar el email ha expierado",                                   // 1167
      "Verify email link is for unknown address": "El enlace para verificar el email está asociado a una dirección desconocida"
    }                                                                                                                  // 1169
  }                                                                                                                    // 1170
};                                                                                                                     // 1171
                                                                                                                       // 1172
T9n.map("es_ES", es_ES);                                                                                               // 1173
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1175
}).call(this);                                                                                                         // 1176
                                                                                                                       // 1177
                                                                                                                       // 1178
                                                                                                                       // 1179
                                                                                                                       // 1180
                                                                                                                       // 1181
                                                                                                                       // 1182
(function () {                                                                                                         // 1183
                                                                                                                       // 1184
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/fa.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var fa;                                                                                                                // 1192
                                                                                                                       // 1193
fa = {                                                                                                                 // 1194
  add: "افزودن",                                                                                                       // 1195
  and: "و",                                                                                                            // 1196
  back: "برگشت",                                                                                                       // 1197
  changePassword: "تعویض گذرواژه",                                                                                     // 1198
  choosePassword: "انتخاب یک گذرواژه",                                                                                 // 1199
  clickAgree: "با انتخاب ثبت‌نام، شما موافق هستید با",                                                                 // 1200
  configure: "پیکربندی",                                                                                               // 1201
  createAccount: "ایجاد یک حساب",                                                                                      // 1202
  currentPassword: "گذرواژه کنونی",                                                                                    // 1203
  dontHaveAnAccount: "یک حساب ندارید؟",                                                                                // 1204
  email: "رایانامه",                                                                                                   // 1205
  emailAddress: "آدرس رایانامه",                                                                                       // 1206
  emailResetLink: "پیوند بازنشانی رایانامه",                                                                           // 1207
  forgotPassword: "گذرواژه‌تان را فراموش کرده‌اید؟",                                                                   // 1208
  ifYouAlreadyHaveAnAccount: "اگر هم‌اکنون یک حساب دارید",                                                             // 1209
  newPassword: "گذرواژه جدید",                                                                                         // 1210
  newPasswordAgain: "گذرواژه جدید (تکرار)",                                                                            // 1211
  optional: "اختيارى",                                                                                                 // 1212
  OR: "یا",                                                                                                            // 1213
  password: "گذرواژه",                                                                                                 // 1214
  passwordAgain: "گذرواژه (دوباره)",                                                                                   // 1215
  privacyPolicy: "حریم خصوصی",                                                                                         // 1216
  remove: "حذف",                                                                                                       // 1217
  resetYourPassword: "بازنشانی گذرواژه شما",                                                                           // 1218
  setPassword: "تنظیم گذرواژه",                                                                                        // 1219
  sign: "نشان",                                                                                                        // 1220
  signIn: "ورود",                                                                                                      // 1221
  signin: "ورود",                                                                                                      // 1222
  signOut: "خروج",                                                                                                     // 1223
  signUp: "ثبت‌نام",                                                                                                   // 1224
  signupCode: "کد ثبت‌نام",                                                                                            // 1225
  signUpWithYourEmailAddress: "با آدرس رایانامه‌تان ثبت‌نام کنید",                                                     // 1226
  terms: "قوانین استفاده",                                                                                             // 1227
  updateYourPassword: "گذرواژه‌تان را به روز کنید",                                                                    // 1228
  username: "نام کاربری",                                                                                              // 1229
  usernameOrEmail: "نام کاربری یا رایانامه",                                                                           // 1230
  "with": "با",                                                                                                        // 1231
  info: {                                                                                                              // 1232
    emailSent: "رایانامه ارسال شد",                                                                                    // 1233
    emailVerified: "رایانامه تایید شد",                                                                                // 1234
    passwordChanged: "گذرواژه تغییر کرد",                                                                              // 1235
    passwordReset: "گذرواژه بازنشانی شد"                                                                               // 1236
  },                                                                                                                   // 1237
  error: {                                                                                                             // 1238
    emailRequired: "رایانامه ضروری است.",                                                                              // 1239
    minChar: "گذرواژه حداقل ۷ کاراکتر.",                                                                               // 1240
    pwdsDontMatch: "گذرواژه‌ها تطابق ندارند",                                                                          // 1241
    pwOneDigit: "گذرواژه باید لااقل یک رقم داشته باشد.",                                                               // 1242
    pwOneLetter: "گذرواژه یک حرف نیاز دارد.",                                                                          // 1243
    signInRequired: "برای انجام آن باید وارد شوید.",                                                                   // 1244
    signupCodeIncorrect: "کد ثبت‌نام نادرست است.",                                                                     // 1245
    signupCodeRequired: "کد ثبت‌نام ضروری است.",                                                                       // 1246
    usernameIsEmail: "نام کاربری نمی‌توان آدرس رایانامه باشد.",                                                        // 1247
    usernameRequired: "نام کاربری ضروری است.",                                                                         // 1248
    accounts: {                                                                                                        // 1249
      "Email already exists.": "رایانامه هم‌اکنون وجود دارد.",                                                         // 1250
      "Email doesn't match the criteria.": "رایانامه با ضوابط تطابق ندارد.",                                           // 1251
      "Invalid login token": "علامت ورود نامعتبر است",                                                                 // 1252
      "Login forbidden": "ورود ممنوع است",                                                                             // 1253
      "Service unknown": "سرویس ناشناس",                                                                               // 1254
      "Unrecognized options for login request": "گزینه‌های نامشخص برای درخواست ورود",                                  // 1255
      "User validation failed": "اعتبارسنجی کاربر ناموفق",                                                             // 1256
      "Username already exists.": "نام کاربری هم‌اکنون وجود دارد.",                                                    // 1257
      "You are not logged in.": "شما وارد نشده‌اید.",                                                                  // 1258
      "You've been logged out by the server. Please log in again.": "شما توسط سرور خارج شده‌اید. لطفأ دوباره وارد شوید.",
      "Your session has expired. Please log in again.": "جلسه شما منقضی شده است. لطفا دوباره وارد شوید.",              // 1260
      "No matching login attempt found": "تلاش ورود مطابق یافت نشد",                                                   // 1261
      "Password is old. Please reset your password.": "گذرواژه قدیمی است. لطفأ گذرواژه‌تان را بازتنظیم کنید.",         // 1262
      "Incorrect password": "گذرواژه نادرست",                                                                          // 1263
      "Invalid email": "رایانامه نامعتبر",                                                                             // 1264
      "Must be logged in": "باید وارد شوید",                                                                           // 1265
      "Need to set a username or email": "یک نام کاربری یا ایمیل باید تنظیم شود",                                      // 1266
      "old password format": "قالب گذرواژه قدیمی",                                                                     // 1267
      "Password may not be empty": "گذرواژه نمی‌تواند خالی باشد",                                                      // 1268
      "Signups forbidden": "ثبت‌نام ممنوع",                                                                            // 1269
      "Token expired": "علامت رمز منقظی شده است",                                                                      // 1270
      "Token has invalid email address": "علامت رمز دارای آدرس رایانامه نامعتبر است",                                  // 1271
      "User has no password set": "کاربر گذرواژه‌ای تنظیم نکرده است",                                                  // 1272
      "User not found": "کاربر یافت نشد",                                                                              // 1273
      "Verify email link expired": "پیوند تایید رایانامه منقضی شده است",                                               // 1274
      "Verify email link is for unknown address": "پیوند تایید رایانامه برای آدرس ناشناخته است",                       // 1275
      "Match failed": "تطابق ناموفق",                                                                                  // 1276
      "Unknown error": "خطای ناشناخته"                                                                                 // 1277
    }                                                                                                                  // 1278
  }                                                                                                                    // 1279
};                                                                                                                     // 1280
                                                                                                                       // 1281
T9n.map("fa", fa);                                                                                                     // 1282
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1284
}).call(this);                                                                                                         // 1285
                                                                                                                       // 1286
                                                                                                                       // 1287
                                                                                                                       // 1288
                                                                                                                       // 1289
                                                                                                                       // 1290
                                                                                                                       // 1291
(function () {                                                                                                         // 1292
                                                                                                                       // 1293
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/fr.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var fr;                                                                                                                // 1301
                                                                                                                       // 1302
fr = {                                                                                                                 // 1303
  add: "Ajouter",                                                                                                      // 1304
  and: "et",                                                                                                           // 1305
  back: "retour",                                                                                                      // 1306
  changePassword: "Modifier le mot de passe",                                                                          // 1307
  choosePassword: "Choisir le mot de passe",                                                                           // 1308
  clickAgree: "En cliquant sur S'enregistrer, vous acceptez notre",                                                    // 1309
  configure: "Configurer",                                                                                             // 1310
  createAccount: "Créer un compte",                                                                                    // 1311
  currentPassword: "Mot de passe actuel",                                                                              // 1312
  dontHaveAnAccount: "Vous n'avez pas de compte ?",                                                                    // 1313
  email: "Email",                                                                                                      // 1314
  emailAddress: "Adresse Email",                                                                                       // 1315
  emailResetLink: "Envoyer le mail de réinitialisation",                                                               // 1316
  forgotPassword: "Vous avez oublié votre mot de passe ?",                                                             // 1317
  ifYouAlreadyHaveAnAccount: "Si vous avez déjà un compte",                                                            // 1318
  newPassword: "Nouveau mot de passe",                                                                                 // 1319
  newPasswordAgain: "Confirmer le nouveau mot de passe",                                                               // 1320
  optional: "Optionnel",                                                                                               // 1321
  OR: "OU",                                                                                                            // 1322
  password: "Mot de passe",                                                                                            // 1323
  passwordAgain: "Confirmer le mot de passe",                                                                          // 1324
  privacyPolicy: "Politique de confidentialité",                                                                       // 1325
  remove: "Supprimer",                                                                                                 // 1326
  resetYourPassword: "Reinitialiser votre mot de passe",                                                               // 1327
  setPassword: "Spécifier le mot de passe",                                                                            // 1328
  sign: "S'enregistrer",                                                                                               // 1329
  signIn: "Se Connecter",                                                                                              // 1330
  signin: "se connecter",                                                                                              // 1331
  signOut: "Se Deconnecter",                                                                                           // 1332
  signUp: "S'enregistrer",                                                                                             // 1333
  signupCode: "Code d'inscription",                                                                                    // 1334
  signUpWithYourEmailAddress: "S'enregistrer avec votre adresse email",                                                // 1335
  terms: "Conditions d'utilisation",                                                                                   // 1336
  updateYourPassword: "Mettre à jour le mot de passe",                                                                 // 1337
  username: "Nom d'utilisateur",                                                                                       // 1338
  usernameOrEmail: "Nom d'utilisateur ou email",                                                                       // 1339
  "with": "avec",                                                                                                      // 1340
  info: {                                                                                                              // 1341
    emailSent: "Email envoyé",                                                                                         // 1342
    emailVerified: "Email verifié",                                                                                    // 1343
    passwordChanged: "Mot de passe modifié",                                                                           // 1344
    passwordReset: "Mot de passe réinitialisé"                                                                         // 1345
  },                                                                                                                   // 1346
  error: {                                                                                                             // 1347
    emailRequired: "Un email est requis.",                                                                             // 1348
    minChar: "Votre mot de passe doit contenir au minimum 7 caractères.",                                              // 1349
    pwdsDontMatch: "Les mots de passe ne correspondent pas",                                                           // 1350
    pwOneDigit: "Votre mot de passe doit contenir au moins un chiffre.",                                               // 1351
    pwOneLetter: "Votre mot de passe doit contenir au moins une lettre.",                                              // 1352
    signInRequired: "Vous devez être connecté pour continuer.",                                                        // 1353
    signupCodeIncorrect: "Le code d'enregistrement est incorrect.",                                                    // 1354
    signupCodeRequired: "Un code d'inscription est requis.",                                                           // 1355
    usernameIsEmail: "Le nom d'utilisateur ne peut être le même que l'adresse email.",                                 // 1356
    usernameRequired: "Un nom d'utilisateur est requis.",                                                              // 1357
    accounts: {                                                                                                        // 1358
      "Email already exists.": "Adresse email déjà utilisée.",                                                         // 1359
      "Email doesn't match the criteria.": "Adresse email ne correspond pas aux critères.",                            // 1360
      "Invalid login token": "Jeton d'authentification invalide",                                                      // 1361
      "Login forbidden": "Authentification interdite",                                                                 // 1362
      "Service unknown": "Service inconnu",                                                                            // 1363
      "Unrecognized options for login request": "Options inconnues pour la requête d'authentification",                // 1364
      "User validation failed": "Echec de la validation de l'utilisateur",                                             // 1365
      "Username already exists.": "Nom d'utilisateur déjà utilisé.",                                                   // 1366
      "You are not logged in.": "Vous n'êtes pas authentifié.",                                                        // 1367
      "You've been logged out by the server. Please log in again.": "Vous avez été déconnecté par le serveur. Veuillez vous reconnecter.",
      "Your session has expired. Please log in again.": "Votre session a expiré. Veuillez vous reconnecter.",          // 1369
      "No matching login attempt found": "Aucune tentative d'authentification ne correspond",                          // 1370
      "Password is old. Please reset your password.": "Votre mot de passe est trop ancien. Veuillez le modifier.",     // 1371
      "Incorrect password": "Mot de passe incorrect",                                                                  // 1372
      "Invalid email": "Email invalide",                                                                               // 1373
      "Must be logged in": "Vous devez être connecté",                                                                 // 1374
      "Need to set a username or email": "Vous devez renseigner un nom d'utilisateur ou une adresse email",            // 1375
      "old password format": "Ancien format de mot de passe",                                                          // 1376
      "Password may not be empty": "Le mot de passe ne peut être vide",                                                // 1377
      "Signups forbidden": "La création de compte est interdite",                                                      // 1378
      "Token expired": "Jeton expiré",                                                                                 // 1379
      "Token has invalid email address": "Le jeton contient une adresse email invalide",                               // 1380
      "User has no password set": "L'utilisateur n'a pas de mot de passe",                                             // 1381
      "User not found": "Utilisateur inconnu",                                                                         // 1382
      "Verify email link expired": "Lien de vérification d'email expiré",                                              // 1383
      "Verify email link is for unknown address": "Le lien de vérification d'email réfère à une adresse inconnue",     // 1384
      "Match failed": "La correspondance a échoué",                                                                    // 1385
      "Unknown error": "Erreur inconnue"                                                                               // 1386
    }                                                                                                                  // 1387
  }                                                                                                                    // 1388
};                                                                                                                     // 1389
                                                                                                                       // 1390
T9n.map("fr", fr);                                                                                                     // 1391
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1393
}).call(this);                                                                                                         // 1394
                                                                                                                       // 1395
                                                                                                                       // 1396
                                                                                                                       // 1397
                                                                                                                       // 1398
                                                                                                                       // 1399
                                                                                                                       // 1400
(function () {                                                                                                         // 1401
                                                                                                                       // 1402
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/he.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var he;                                                                                                                // 1410
                                                                                                                       // 1411
he = {                                                                                                                 // 1412
  add: "הוסף",                                                                                                         // 1413
  and: "ו",                                                                                                            // 1414
  back: "חזרה",                                                                                                        // 1415
  changePassword: "שינוי סיסמא",                                                                                       // 1416
  choosePassword: "בחירת סיסמא",                                                                                       // 1417
  clickAgree: "על ידי לחיצה על הירשם, הינך מסכים",                                                                     // 1418
  configure: "הגדרות",                                                                                                 // 1419
  createAccount: "הוספת חשבון",                                                                                        // 1420
  currentPassword: "סיסמא נוכחית",                                                                                     // 1421
  dontHaveAnAccount: "אין לך חשבון?",                                                                                  // 1422
  email: "דוא\"ל",                                                                                                     // 1423
  emailAddress: "דוא\"ל",                                                                                              // 1424
  emailResetLink: "שלח קישור לאיפוס סיסמא",                                                                            // 1425
  forgotPassword: "שכחת סיסמא?",                                                                                       // 1426
  ifYouAlreadyHaveAnAccount: "אם יש לך חשבון",                                                                         // 1427
  newPassword: "סיסמא חדשה",                                                                                           // 1428
  newPasswordAgain: "סיסמא חדשה (שוב)",                                                                                // 1429
  optional: "רשות",                                                                                                    // 1430
  OR: "או",                                                                                                            // 1431
  password: "סיסמא",                                                                                                   // 1432
  passwordAgain: "סיסמא (שוב)",                                                                                        // 1433
  privacyPolicy: "למדיניות הפרטיות",                                                                                   // 1434
  remove: "הסרה",                                                                                                      // 1435
  resetYourPassword: "איפוס סיסמא",                                                                                    // 1436
  setPassword: "עדכון סיסמא",                                                                                          // 1437
  signIn: "כניסה",                                                                                                     // 1438
  signin: "כניסה",                                                                                                     // 1439
  signOut: "יציאה",                                                                                                    // 1440
  signUp: "הרשמה לחשבון",                                                                                              // 1441
  signupCode: "קוד הרשמה",                                                                                             // 1442
  signUpWithYourEmailAddress: "הירשם באמצעות הדוא\"ל",                                                                 // 1443
  terms: "לתנאי השימוש",                                                                                               // 1444
  updateYourPassword: "עדכון סיסמא",                                                                                   // 1445
  username: "שם משתמש",                                                                                                // 1446
  usernameOrEmail: "שם משמש או דוא\"ל",                                                                                // 1447
  "with": "עם",                                                                                                        // 1448
  info: {                                                                                                              // 1449
    emailSent: "נשלחה הודעה לדוא\"ל",                                                                                  // 1450
    emailVerified: "כתובת הדוא\"ל וודאה בהצלחה",                                                                       // 1451
    passwordChanged: "סיסמתך שונתה בהצלחה",                                                                            // 1452
    passwordReset: "סיסמתך אופסה בהצלחה"                                                                               // 1453
  },                                                                                                                   // 1454
  error: {                                                                                                             // 1455
    emailRequired: "חובה להזין כתובת דוא\"ל",                                                                          // 1456
    minChar: "חובה להזין סיסמא בעלת 7 תווים לפחות.",                                                                   // 1457
    pwdsDontMatch: "הסיסמאות אינן זהות.",                                                                              // 1458
    pwOneDigit: "הסיסמא חייבת לכלול ספרה אחת לפחות.",                                                                  // 1459
    pwOneLetter: "הסיסמא חייבת לכלול אות אחת לפחות.",                                                                  // 1460
    signInRequired: "חובה להיכנס למערכת כדי לבצע פעולה זו.",                                                           // 1461
    signupCodeIncorrect: "קוד ההרשמה שגוי.",                                                                           // 1462
    signupCodeRequired: "חובה להזין את קוד ההרשמה.",                                                                   // 1463
    usernameIsEmail: "של המשתמש לא יכול להיות כתובת דוא\"ל.",                                                          // 1464
    usernameRequired: "חובה להזין שם משתמש.",                                                                          // 1465
    accounts: {                                                                                                        // 1466
      "Email already exists.": "הדוא\"ל כבר רשום לחשבון.",                                                             // 1467
      "Email doesn't match the criteria.": "הדוא\"ל לא מקיים את הקריטריונים.",                                         // 1468
      "Invalid login token": "Token כניסה שגוי",                                                                       // 1469
      "Login forbidden": "הכניסה נאסרה",                                                                               // 1470
      "Service unknown": "Service לא ידוע",                                                                            // 1471
      "Unrecognized options for login request": "נסיון הכניסה כלל אופציות לא מזוהות",                                  // 1472
      "User validation failed": "אימות המשתמש נכשל",                                                                   // 1473
      "Username already exists.": "שם המשתמש כבר קיים.",                                                               // 1474
      "You are not logged in.": "לא נכנסת לחשבון.",                                                                    // 1475
      "You've been logged out by the server. Please log in again.": "השרת הוציא אותך מהמערכת. נא להיכנס לחשבונך שוב.",
      "Your session has expired. Please log in again.": "ה-session שלך פג תוקף. נא להיכנס לחשבונך שוב.",               // 1477
      "No matching login attempt found": "לא נמצא נסיון כניסה מתאים",                                                  // 1478
      "Password is old. Please reset your password.": "סיסמתך ישנה. נא להחליך אותה.",                                  // 1479
      "Incorrect password": "סיסמא שגויה",                                                                             // 1480
      "Invalid email": "דוא\"ל שגוי",                                                                                  // 1481
      "Must be logged in": "חובה להיכנס למערכת כדי לבצע פעולה זו.",                                                    // 1482
      "Need to set a username or email": "חובה להגדיר שם משתמש או דוא\"ל",                                             // 1483
      "old password format": "פורמט סיסמא ישן",                                                                        // 1484
      "Password may not be empty": "הסיסמא לא יכולה להיות ריקה",                                                       // 1485
      "Signups forbidden": "אסור להירשם",                                                                              // 1486
      "Token expired": "ה-token פג תוקף",                                                                              // 1487
      "Token has invalid email address": "ה-token מכיל כתובת דוא\"ל שגוייה",                                           // 1488
      "User has no password set": "למשתמש אין סיסמא",                                                                  // 1489
      "User not found": "המשתמש לא נמצא",                                                                              // 1490
      "Verify email link expired": "קישור וידוי הדוא\"ל פג תוקף",                                                      // 1491
      "Verify email link is for unknown address": "קישור וידוי הדוא\"ל הוא לכתובת לא ידועה",                           // 1492
      "Match failed": "ההתאמה נכשלה",                                                                                  // 1493
      "Unknown error": "שגיאה לא ידועה"                                                                                // 1494
    }                                                                                                                  // 1495
  }                                                                                                                    // 1496
};                                                                                                                     // 1497
                                                                                                                       // 1498
T9n.map("he", he);                                                                                                     // 1499
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1501
}).call(this);                                                                                                         // 1502
                                                                                                                       // 1503
                                                                                                                       // 1504
                                                                                                                       // 1505
                                                                                                                       // 1506
                                                                                                                       // 1507
                                                                                                                       // 1508
(function () {                                                                                                         // 1509
                                                                                                                       // 1510
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/hr.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var hr;                                                                                                                // 1518
                                                                                                                       // 1519
hr = {                                                                                                                 // 1520
  add: "dodaj",                                                                                                        // 1521
  and: "i",                                                                                                            // 1522
  back: "nazad",                                                                                                       // 1523
  changePassword: "Promjeni zaporku",                                                                                  // 1524
  choosePassword: "Izaberi zaporku",                                                                                   // 1525
  clickAgree: "Klikom na Registracija, prihvatate naše",                                                               // 1526
  configure: "Podesi",                                                                                                 // 1527
  createAccount: "Napravite račun",                                                                                    // 1528
  currentPassword: "Trenutna zaporka",                                                                                 // 1529
  dontHaveAnAccount: "Vi nemate račun?",                                                                               // 1530
  email: "Email",                                                                                                      // 1531
  emailAddress: "Email adresa",                                                                                        // 1532
  emailResetLink: "Email reset link",                                                                                  // 1533
  forgotPassword: "Zaboravili ste zaporku?",                                                                           // 1534
  ifYouAlreadyHaveAnAccount: "Ako već imate račun",                                                                    // 1535
  newPassword: "Nova zaporka",                                                                                         // 1536
  newPasswordAgain: "Nova zaporka (ponovno)",                                                                          // 1537
  optional: "neobavezno",                                                                                              // 1538
  OR: "ili",                                                                                                           // 1539
  password: "Zaporka",                                                                                                 // 1540
  passwordAgain: "Zaporka (ponovno)",                                                                                  // 1541
  privacyPolicy: "Izjava o privatnosti",                                                                               // 1542
  remove: "ukloni",                                                                                                    // 1543
  resetYourPassword: "Resetirajte",                                                                                    // 1544
  setPassword: "Postavite zaporku",                                                                                    // 1545
  sign: "Prijava",                                                                                                     // 1546
  signIn: "Prijavi se",                                                                                                // 1547
  signin: "prijavi se",                                                                                                // 1548
  signOut: "Odjavi se",                                                                                                // 1549
  signUp: "Registracija",                                                                                              // 1550
  signupCode: "Registracijski kod",                                                                                    // 1551
  signUpWithYourEmailAddress: "Registrirajte se sa vašom email adresom",                                               // 1552
  terms: "Uslovi korištenja",                                                                                          // 1553
  updateYourPassword: "Ažurirajte lozinku",                                                                            // 1554
  username: "Korisničko ime",                                                                                          // 1555
  usernameOrEmail: "Korisničko ime ili lozinka",                                                                       // 1556
  "with": "sa",                                                                                                        // 1557
  info: {                                                                                                              // 1558
    emailSent: "Email je poslan",                                                                                      // 1559
    emailVerified: "Email je verificiran",                                                                             // 1560
    passwordChanged: "Zaproka promjenjena",                                                                            // 1561
    passwordReset: "Zaporka resetirana"                                                                                // 1562
  },                                                                                                                   // 1563
  error: {                                                                                                             // 1564
    emailRequired: "Email je potreban.",                                                                               // 1565
    minChar: "Zaporka mora sadržavati više od 7 znakova.",                                                             // 1566
    pwdsDontMatch: "Zaporke se ne poklapaju.",                                                                         // 1567
    pwOneDigit: "Zaporka mora sadržavati barem jednu brojku.",                                                         // 1568
    pwOneLetter: "Zaporka mora sadržavati barem jedno slovo.",                                                         // 1569
    signInRequired: "Morate biti prijavljeni za to.",                                                                  // 1570
    signupCodeIncorrect: "Registracijski kod je netočan.",                                                             // 1571
    signupCodeRequired: "Registracijski kod je potreban.",                                                             // 1572
    usernameIsEmail: "Korisničko ime ne može biti email.",                                                             // 1573
    usernameRequired: "Korisničko ime je potrebno.",                                                                   // 1574
    accounts: {                                                                                                        // 1575
      "Email already exists.": "Email već postoji.",                                                                   // 1576
      "Email doesn't match the criteria.": "Email ne zadovoljava kriterij.",                                           // 1577
      "Invalid login token": "Nevažeći  token za prijavu",                                                             // 1578
      "Login forbidden": "Prijava zabranjena",                                                                         // 1579
      "Service unknown": "Servis nepoznat",                                                                            // 1580
      "Unrecognized options for login request": "Neprepoznate opcije zahtjeva za prijavu",                             // 1581
      "User validation failed": "Provjera valjanosti za korisnika neuspješna.",                                        // 1582
      "Username already exists.": "Korisnik već postoji.",                                                             // 1583
      "You are not logged in.": "Niste prijavljeni.",                                                                  // 1584
      "You've been logged out by the server. Please log in again.": "Odjavljeni ste sa servera. Molimo Vas ponovno se prijavite.",
      "Your session has expired. Please log in again.": "Vaša sesija je istekla. Molimo prijavite se ponovno.",        // 1586
      "No matching login attempt found": "Pokušaj prijave se ne podudara sa podatcima u bazi.",                        // 1587
      "Password is old. Please reset your password.": "Zaporka je stara. Molimo resetujte zaporku.",                   // 1588
      "Incorrect password": "Netočna zaporka",                                                                         // 1589
      "Invalid email": "Nevažeći email",                                                                               // 1590
      "Must be logged in": "Morate biti prijavljeni",                                                                  // 1591
      "Need to set a username or email": "Morate postaviti korisničko ime ili email",                                  // 1592
      "old password format": "stari format zaporke",                                                                   // 1593
      "Password may not be empty": "Zaporka ne može biti prazna",                                                      // 1594
      "Signups forbidden": "Prijave zabranjenje",                                                                      // 1595
      "Token expired": "Token je istekao",                                                                             // 1596
      "Token has invalid email address": "Token ima nevažeću email adresu",                                            // 1597
      "User has no password set": "Korisnik nema postavljenu zaporku",                                                 // 1598
      "User not found": "Korisnik nije pronađen",                                                                      // 1599
      "Verify email link expired": "Link za verifikaciju emaila je istekao",                                           // 1600
      "Verify email link is for unknown address": "Link za verifikaciju emaila je za nepoznatu adresu",                // 1601
      "Match failed": "Usporedba neuspjela",                                                                           // 1602
      "Unknown error": "Nepoznata pogreška"                                                                            // 1603
    }                                                                                                                  // 1604
  }                                                                                                                    // 1605
};                                                                                                                     // 1606
                                                                                                                       // 1607
T9n.map("hr", hr);                                                                                                     // 1608
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1610
}).call(this);                                                                                                         // 1611
                                                                                                                       // 1612
                                                                                                                       // 1613
                                                                                                                       // 1614
                                                                                                                       // 1615
                                                                                                                       // 1616
                                                                                                                       // 1617
(function () {                                                                                                         // 1618
                                                                                                                       // 1619
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/hu.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var hu;                                                                                                                // 1627
                                                                                                                       // 1628
hu = {                                                                                                                 // 1629
  add: "hozzáadás",                                                                                                    // 1630
  and: "és",                                                                                                           // 1631
  back: "vissza",                                                                                                      // 1632
  changePassword: "Jelszó megváltoztatása",                                                                            // 1633
  choosePassword: "Válassz egy jelszót",                                                                               // 1634
  clickAgree: "A regisztráció gombra kattintva egyetértesz a mi",                                                      // 1635
  configure: "Beállítás",                                                                                              // 1636
  createAccount: "Felhasználó létrehozása",                                                                            // 1637
  currentPassword: "Jelenlegi jelszó",                                                                                 // 1638
  dontHaveAnAccount: "Nincs még felhasználód?",                                                                        // 1639
  email: "Email",                                                                                                      // 1640
  emailAddress: "Email cím",                                                                                           // 1641
  emailResetLink: "Visszaállító link küldése",                                                                         // 1642
  forgotPassword: "Elfelejtetted a jelszavadat?",                                                                      // 1643
  ifYouAlreadyHaveAnAccount: "Ha már van felhasználód, ",                                                              // 1644
  newPassword: "Új jelszó",                                                                                            // 1645
  newPasswordAgain: "Új jelszó (ismét)",                                                                               // 1646
  optional: "Opcionális",                                                                                              // 1647
  OR: "VAGY",                                                                                                          // 1648
  password: "Jelszó",                                                                                                  // 1649
  passwordAgain: "Jelszó (ismét)",                                                                                     // 1650
  privacyPolicy: "Adatvédelmi irányelvek",                                                                             // 1651
  remove: "eltávolítás",                                                                                               // 1652
  resetYourPassword: "Jelszó visszaállítása",                                                                          // 1653
  setPassword: "Jelszó beállítása",                                                                                    // 1654
  sign: "Bejelentkezés",                                                                                               // 1655
  signIn: "Bejelentkezés",                                                                                             // 1656
  signin: "jelentkezz be",                                                                                             // 1657
  signOut: "Kijelentkezés",                                                                                            // 1658
  signUp: "Regisztráció",                                                                                              // 1659
  signupCode: "Regisztrációs kód",                                                                                     // 1660
  signUpWithYourEmailAddress: "Regisztráció email címmel",                                                             // 1661
  terms: "Használati feltételek",                                                                                      // 1662
  updateYourPassword: "Jelszó módosítása",                                                                             // 1663
  username: "Felhasználónév",                                                                                          // 1664
  usernameOrEmail: "Felhasználónév vagy email",                                                                        // 1665
  "with": "-",                                                                                                         // 1666
  info: {                                                                                                              // 1667
    emailSent: "Email elküldve",                                                                                       // 1668
    emailVerified: "Email cím igazolva",                                                                               // 1669
    passwordChanged: "Jelszó megváltoztatva",                                                                          // 1670
    passwordReset: "Jelszó visszaállítva"                                                                              // 1671
  },                                                                                                                   // 1672
  error: {                                                                                                             // 1673
    emailRequired: "Email cím megadása kötelező.",                                                                     // 1674
    minChar: "A jelszónak legalább 7 karakter hoszúnak kell lennie.",                                                  // 1675
    pwdsDontMatch: "A jelszavak nem egyeznek",                                                                         // 1676
    pwOneDigit: "A jelszónak legalább egy számjegyet tartalmaznia kell.",                                              // 1677
    pwOneLetter: "A jelszónak legalább egy betűt tartalmaznia kell.",                                                  // 1678
    signInRequired: "A művelet végrehajtásához be kell jelentkezned.",                                                 // 1679
    signupCodeIncorrect: "A regisztrációs kód hibás.",                                                                 // 1680
    signupCodeRequired: "A regisztrációs kód megadása kötelező.",                                                      // 1681
    usernameIsEmail: "A felhasználónév nem lehet egy email cím.",                                                      // 1682
    usernameRequired: "Felhasználónév megadása kötelező.",                                                             // 1683
    accounts: {                                                                                                        // 1684
      "Email already exists.": "A megadott email cím már létezik.",                                                    // 1685
      "Email doesn't match the criteria.": "Email cím nem felel meg a feltételeknek.",                                 // 1686
      "Invalid login token": "Érvénytelen belépési token",                                                             // 1687
      "Login forbidden": "Belépés megtagadva",                                                                         // 1688
      "Service unknown": "Ismeretlen szolgáltatás",                                                                    // 1689
      "Unrecognized options for login request": "Ismeretlen beállítások a belépési kérelemhez",                        // 1690
      "User validation failed": "Felhasználó azonosítás sikertelen",                                                   // 1691
      "Username already exists.": "A felhasználónév már létezik.",                                                     // 1692
      "You are not logged in.": "Nem vagy bejelentkezve.",                                                             // 1693
      "You've been logged out by the server. Please log in again.": "A szerver kijelentkeztetett. Kérjük, jelentkezz be újra.",
      "Your session has expired. Please log in again.": "A munkamenet lejárt. Kérjük, jelentkezz be újra.",            // 1695
      "No matching login attempt found": "Nem található megegyező belépési próbálkozás",                               // 1696
      "Password is old. Please reset your password.": "A jelszó túl régi. Kérjük, változtasd meg a jelszavad.",        // 1697
      "Incorrect password": "Helytelen jelszó",                                                                        // 1698
      "Invalid email": "Érvénytelen email cím",                                                                        // 1699
      "Must be logged in": "A művelet végrehajtásához bejelentkezés szükséges",                                        // 1700
      "Need to set a username or email": "Felhasználónév vagy email cím beállítása kötelező",                          // 1701
      "old password format": "régi jelszó formátum",                                                                   // 1702
      "Password may not be empty": "A jelszó nem lehet üres",                                                          // 1703
      "Signups forbidden": "Regisztráció megtagadva",                                                                  // 1704
      "Token expired": "Token lejárt",                                                                                 // 1705
      "Token has invalid email address": "A token érvénytelen email címet tartalmaz",                                  // 1706
      "User has no password set": "A felhasználóhoz nincs jelszó beállítva",                                           // 1707
      "User not found": "Felhasználó nem található",                                                                   // 1708
      "Verify email link expired": "Igazoló email link lejárt",                                                        // 1709
      "Verify email link is for unknown address": "Az igazoló email link ismeretlen címhez tartozik",                  // 1710
      "Match failed": "Megegyeztetés sikertelen",                                                                      // 1711
      "Unknown error": "Ismeretlen hiba"                                                                               // 1712
    }                                                                                                                  // 1713
  }                                                                                                                    // 1714
};                                                                                                                     // 1715
                                                                                                                       // 1716
T9n.map("hu", hu);                                                                                                     // 1717
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1719
}).call(this);                                                                                                         // 1720
                                                                                                                       // 1721
                                                                                                                       // 1722
                                                                                                                       // 1723
                                                                                                                       // 1724
                                                                                                                       // 1725
                                                                                                                       // 1726
(function () {                                                                                                         // 1727
                                                                                                                       // 1728
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/id.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var id;                                                                                                                // 1736
                                                                                                                       // 1737
id = {                                                                                                                 // 1738
  add: "tambah",                                                                                                       // 1739
  and: "dan",                                                                                                          // 1740
  back: "kembali",                                                                                                     // 1741
  changePassword: "Ganti Password",                                                                                    // 1742
  choosePassword: "Masukkan Password",                                                                                 // 1743
  clickAgree: "Dengan anda mendaftar, anda setuju dengan",                                                             // 1744
  configure: "Mengaturkan",                                                                                            // 1745
  createAccount: "Buat Account",                                                                                       // 1746
  currentPassword: "Password Anda Saat Ini",                                                                           // 1747
  dontHaveAnAccount: "Tidak punya account?",                                                                           // 1748
  email: "Email",                                                                                                      // 1749
  emailAddress: "Alamat Email",                                                                                        // 1750
  emailResetLink: "Link untuk Email Reset",                                                                            // 1751
  forgotPassword: "Lupa password?",                                                                                    // 1752
  ifYouAlreadyHaveAnAccount: "Jika anda belum punya account",                                                          // 1753
  newPassword: "Password Baru",                                                                                        // 1754
  newPasswordAgain: "Password Baru (ulang)",                                                                           // 1755
  optional: "Opsional",                                                                                                // 1756
  OR: "ATAU",                                                                                                          // 1757
  password: "Password",                                                                                                // 1758
  passwordAgain: "Password (ulang)",                                                                                   // 1759
  privacyPolicy: "Kebijakan Privasi",                                                                                  // 1760
  remove: "hapus",                                                                                                     // 1761
  resetYourPassword: "Reset password anda",                                                                            // 1762
  setPassword: "Masukkan Password",                                                                                    // 1763
  sign: "Sign",                                                                                                        // 1764
  signIn: "Sign In",                                                                                                   // 1765
  signin: "sign in",                                                                                                   // 1766
  signOut: "Sign Out",                                                                                                 // 1767
  signUp: "Mendaftar",                                                                                                 // 1768
  signupCode: "Kode Registrasi",                                                                                       // 1769
  signUpWithYourEmailAddress: "Mendaftar dengan alamat email anda",                                                    // 1770
  terms: "Persyaratan Layanan",                                                                                        // 1771
  updateYourPassword: "Perbarui password anda",                                                                        // 1772
  username: "Username",                                                                                                // 1773
  usernameOrEmail: "Username atau email",                                                                              // 1774
  "with": "dengan",                                                                                                    // 1775
  info: {                                                                                                              // 1776
    emailSent: "Email terkirim",                                                                                       // 1777
    emailVerified: "Email diverifikasi",                                                                               // 1778
    passwordChanged: "Password terganti",                                                                              // 1779
    passwordReset: "Password direset"                                                                                  // 1780
  },                                                                                                                   // 1781
  error: {                                                                                                             // 1782
    emailRequired: "Alamat email dibutuhkan.",                                                                         // 1783
    minChar: "Minimum password 7 karakter.",                                                                           // 1784
    pwdsDontMatch: "Password yang diulang tidak sama.",                                                                // 1785
    pwOneDigit: "Password harus ada minimum 1 angka.",                                                                 // 1786
    pwOneLetter: "Password harus ada minimum 1 huruf.",                                                                // 1787
    signInRequired: "Anda harus sign in untuk melakukan itu.",                                                         // 1788
    signupCodeIncorrect: "Kode registrasi salah.",                                                                     // 1789
    signupCodeRequired: "Kode registrasi dibutuhkan.",                                                                 // 1790
    usernameIsEmail: "Username anda tidak bisa sama dengan email address.",                                            // 1791
    usernameRequired: "Username dibutuhkan.",                                                                          // 1792
    accounts: {                                                                                                        // 1793
      "Email already exists.": "Alamat email sudah dipakai.",                                                          // 1794
      "Email doesn't match the criteria.": "Alamat email tidak sesuai dengan kriteria.",                               // 1795
      "Invalid login token": "Login token tidak valid",                                                                // 1796
      "Login forbidden": "Login dilarang",                                                                             // 1797
      "Service unknown": "Layanan unknown",                                                                            // 1798
      "Unrecognized options for login request": "Options tidak tersedia untuk permintaan login",                       // 1799
      "User validation failed": "Validasi user gagal",                                                                 // 1800
      "Username already exists.": "Username sudah dipakai.",                                                           // 1801
      "You are not logged in.": "Anda belum login.",                                                                   // 1802
      "You've been logged out by the server. Please log in again.": "Anda belum dilogout oleh server. Silahkan coba login lagi.",
      "Your session has expired. Please log in again.": "Session anda telah kedaluarsa. Silahkan coba login lagi.",    // 1804
      "No matching login attempt found": "Usaha login tidak ditemukan.",                                               // 1805
      "Password is old. Please reset your password.": "Password anda terlalu tua. Silahkan ganti password anda.",      // 1806
      "Incorrect password": "Password salah",                                                                          // 1807
      "Invalid email": "Alamat email tidak valid",                                                                     // 1808
      "Must be logged in": "Anda harus login",                                                                         // 1809
      "Need to set a username or email": "Anda harus masukkan username atau email",                                    // 1810
      "old password format": "format password lama",                                                                   // 1811
      "Password may not be empty": "Password tidak boleh kosong",                                                      // 1812
      "Signups forbidden": "Signup dilarang",                                                                          // 1813
      "Token expired": "Token telah kedaluarsa",                                                                       // 1814
      "Token has invalid email address": "Token memberikan alamat email yang tidak valid",                             // 1815
      "User has no password set": "User belum memasukkan password",                                                    // 1816
      "User not found": "User tidak ditemukan",                                                                        // 1817
      "Verify email link expired": "Link untuk verifikasi alamat email telah kedaluarsa",                              // 1818
      "Verify email link is for unknown address": "Link untuk verifikasi alamat email memberikan alamat email yang tidak dikenalkan",
      "Match failed": "Mencocokan gagal",                                                                              // 1820
      "Unknown error": "Error tidak dikenalkan"                                                                        // 1821
    }                                                                                                                  // 1822
  }                                                                                                                    // 1823
};                                                                                                                     // 1824
                                                                                                                       // 1825
T9n.map("id", id);                                                                                                     // 1826
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1828
}).call(this);                                                                                                         // 1829
                                                                                                                       // 1830
                                                                                                                       // 1831
                                                                                                                       // 1832
                                                                                                                       // 1833
                                                                                                                       // 1834
                                                                                                                       // 1835
(function () {                                                                                                         // 1836
                                                                                                                       // 1837
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/it.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var it;                                                                                                                // 1845
                                                                                                                       // 1846
it = {                                                                                                                 // 1847
  add: "aggiungi",                                                                                                     // 1848
  and: "e",                                                                                                            // 1849
  back: "indietro",                                                                                                    // 1850
  changePassword: "Cambia Password",                                                                                   // 1851
  choosePassword: "Scegli una Password",                                                                               // 1852
  clickAgree: "Cliccando Registrati, accetti la nostra",                                                               // 1853
  configure: "Configura",                                                                                              // 1854
  createAccount: "Crea un Account",                                                                                    // 1855
  currentPassword: "Password Corrente",                                                                                // 1856
  dontHaveAnAccount: "Non hai un account?",                                                                            // 1857
  email: "Email",                                                                                                      // 1858
  emailAddress: "Indirizzo Email",                                                                                     // 1859
  emailResetLink: "Invia Link di Reset",                                                                               // 1860
  forgotPassword: "Hai dimenticato la password?",                                                                      // 1861
  ifYouAlreadyHaveAnAccount: "Se hai già un account",                                                                  // 1862
  newPassword: "Nuova Password",                                                                                       // 1863
  newPasswordAgain: "Nuova Password (di nuovo)",                                                                       // 1864
  optional: "Opzionale",                                                                                               // 1865
  OR: "OPPURE",                                                                                                        // 1866
  password: "Password",                                                                                                // 1867
  passwordAgain: "Password (di nuovo)",                                                                                // 1868
  privacyPolicy: "Privacy Policy",                                                                                     // 1869
  remove: "rimuovi",                                                                                                   // 1870
  resetYourPassword: "Reimposta la password",                                                                          // 1871
  setPassword: "Imposta Password",                                                                                     // 1872
  sign: "Accedi",                                                                                                      // 1873
  signIn: "Accedi",                                                                                                    // 1874
  signin: "accedi",                                                                                                    // 1875
  signOut: "Esci",                                                                                                     // 1876
  signUp: "Registrati",                                                                                                // 1877
  signupCode: "Codice di Registrazione",                                                                               // 1878
  signUpWithYourEmailAddress: "Registrati con il tuo indirizzo email",                                                 // 1879
  terms: "Termini di Servizio",                                                                                        // 1880
  updateYourPassword: "Aggiorna la password",                                                                          // 1881
  username: "Username",                                                                                                // 1882
  usernameOrEmail: "Nome utente o email",                                                                              // 1883
  "with": "con",                                                                                                       // 1884
  info: {                                                                                                              // 1885
    emailSent: "Email inviata",                                                                                        // 1886
    emailVerified: "Email verificata",                                                                                 // 1887
    passwordChanged: "Password cambiata",                                                                              // 1888
    passwordReset: "Password reimpostata"                                                                              // 1889
  },                                                                                                                   // 1890
  error: {                                                                                                             // 1891
    emailRequired: "L'Email è obbligatoria.",                                                                          // 1892
    minChar: "La Password deve essere di almeno 7 caratteri.",                                                         // 1893
    pwdsDontMatch: "Le Password non corrispondono",                                                                    // 1894
    pwOneDigit: "La Password deve contenere almeno un numero.",                                                        // 1895
    pwOneLetter: "La Password deve contenere 1 lettera.",                                                              // 1896
    signInRequired: "Per fare questo devi accedere.",                                                                  // 1897
    signupCodeIncorrect: "Codice di Registrazione errato.",                                                            // 1898
    signupCodeRequired: "Il Codice di Registrazione è obbligatorio.",                                                  // 1899
    usernameIsEmail: "Il Nome Utente non può essere un indirizzo email.",                                              // 1900
    usernameRequired: "Il Nome utente è obbligatorio.",                                                                // 1901
    accounts: {                                                                                                        // 1902
      "Email already exists.": "Indirizzo email già esistente.",                                                       // 1903
      "Email doesn't match the criteria.": "L'indirizzo email non soddisfa i requisiti.",                              // 1904
      "Invalid login token": "Codice di accesso non valido",                                                           // 1905
      "Login forbidden": "Accesso non consentito",                                                                     // 1906
      "Service unknown": "Servizio sconosciuto",                                                                       // 1907
      "Unrecognized options for login request": "Opzioni per la richiesta di accesso non ricunosciute",                // 1908
      "User validation failed": "Validazione utente fallita",                                                          // 1909
      "Username already exists.": "Nome utente già esistente.",                                                        // 1910
      "You are not logged in.": "Non hai effettuato l'accesso.",                                                       // 1911
      "You've been logged out by the server. Please log in again.": "Sei stato disconnesso dal server. Per favore accedi di nuovo.",
      "Your session has expired. Please log in again.": "La tua sessione è scaduta. Per favore accedi di nuovo.",      // 1913
      "No matching login attempt found": "Tentativo di accesso corrispondente non trovato",                            // 1914
      "Password is old. Please reset your password.": "La password è vecchia. Per favore reimposta la tua password.",  // 1915
      "Incorrect password": "Password non corretta",                                                                   // 1916
      "Invalid email": "Email non valida",                                                                             // 1917
      "Must be logged in": "Devi aver eseguito l'accesso",                                                             // 1918
      "Need to set a username or email": "È necessario specificare un nome utente o un indirizzo email",               // 1919
      "old password format": "vecchio formato password",                                                               // 1920
      "Password may not be empty": "La password non può essere vuota",                                                 // 1921
      "Signups forbidden": "Registrazioni non consentite",                                                             // 1922
      "Token expired": "Codice scaduto",                                                                               // 1923
      "Token has invalid email address": "Il codice ha un indirizzo email non valido",                                 // 1924
      "User has no password set": "L'utente non ha una password impostata",                                            // 1925
      "User not found": "Utente non trovato",                                                                          // 1926
      "Verify email link expired": "Link per la verifica dell'email scaduto",                                          // 1927
      "Verify email link is for unknown address": "Il link per la verifica dell'email fa riferimento ad un indirizzo sconosciuto",
      "Match failed": "Riscontro fallito",                                                                             // 1929
      "Unknown error": "Errore Sconosciuto"                                                                            // 1930
    }                                                                                                                  // 1931
  }                                                                                                                    // 1932
};                                                                                                                     // 1933
                                                                                                                       // 1934
T9n.map("it", it);                                                                                                     // 1935
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 1937
}).call(this);                                                                                                         // 1938
                                                                                                                       // 1939
                                                                                                                       // 1940
                                                                                                                       // 1941
                                                                                                                       // 1942
                                                                                                                       // 1943
                                                                                                                       // 1944
(function () {                                                                                                         // 1945
                                                                                                                       // 1946
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/ja.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var ja;                                                                                                                // 1954
                                                                                                                       // 1955
ja = {                                                                                                                 // 1956
  add: "足す",                                                                                                           // 1957
  and: "と",                                                                                                            // 1958
  back: "戻る",                                                                                                          // 1959
  changePassword: "パスワードを変更する",                                                                                        // 1960
  choosePassword: "パスワードを選ぶ",                                                                                          // 1961
  clickAgree: "「登録」をクリックすると同意したことになります",                                                                               // 1962
  configure: "設定する",                                                                                                   // 1963
  createAccount: "アカウントを作る",                                                                                           // 1964
  currentPassword: "現在のパスワード",                                                                                         // 1965
  dontHaveAnAccount: "アカウントをお持ちでは無いですか？",                                                                              // 1966
  email: "Eメール",                                                                                                       // 1967
  emailAddress: "Eメールアドレス",                                                                                            // 1968
  emailResetLink: "Eメールリセットリンク",                                                                                       // 1969
  forgotPassword: "パスワードをお忘れですか？",                                                                                     // 1970
  ifYouAlreadyHaveAnAccount: "もしも既にアカウントをお持ちなら",                                                                       // 1971
  newPassword: "新パスワード",                                                                                               // 1972
  newPasswordAgain: "新パスワード(確認)",                                                                                      // 1973
  optional: "オプション",                                                                                                   // 1974
  OR: "または",                                                                                                           // 1975
  password: "パスワード",                                                                                                   // 1976
  passwordAgain: "パスワード(確認)",                                                                                          // 1977
  privacyPolicy: "プライバシーポリシー",                                                                                         // 1978
  remove: "削除する",                                                                                                      // 1979
  resetYourPassword: "パスワードをリセットする",                                                                                   // 1980
  setPassword: "パスワードを設定する",                                                                                           // 1981
  sign: "サイン",                                                                                                         // 1982
  signIn: "サインインする",                                                                                                   // 1983
  signin: "サインイン",                                                                                                     // 1984
  signOut: "サインアウトする",                                                                                                 // 1985
  signUp: "登録する",                                                                                                      // 1986
  signupCode: "レジストレーションコード",                                                                                          // 1987
  signUpWithYourEmailAddress: "Eメールアドレスで登録する",                                                                         // 1988
  terms: "利用条件",                                                                                                       // 1989
  updateYourPassword: "パスワードを更新する",                                                                                    // 1990
  username: "ユーザー名",                                                                                                   // 1991
  usernameOrEmail: "ユーザー名またはEメール",                                                                                     // 1992
  "with": "with",                                                                                                      // 1993
  info: {                                                                                                              // 1994
    emailSent: "Eメールを送りました",                                                                                           // 1995
    emailVerified: "Eメールが確認されました",                                                                                     // 1996
    passwordChanged: "パスワードが変更されました",                                                                                  // 1997
    passwordReset: "パスワードがリセットされました"                                                                                   // 1998
  },                                                                                                                   // 1999
  error: {                                                                                                             // 2000
    emailRequired: "Eメールが必要です",                                                                                        // 2001
    minChar: "パスワードには最低7文字必要です",                                                                                       // 2002
    pwdsDontMatch: "パスワードが違います",                                                                                       // 2003
    pwOneDigit: "パスワードは少なくとも1つ数字を含む必要があります",                                                                           // 2004
    pwOneLetter: "パスワードは少なく遠m1つアルファベットを含む必要があります",                                                                     // 2005
    signInRequired: "その操作にはサインインが必要です",                                                                                // 2006
    signupCodeIncorrect: "レジストレーションコードが間違っています",                                                                       // 2007
    signupCodeRequired: "レジストレーションコードが必要です",                                                                           // 2008
    usernameIsEmail: "ユーザー名にEメールアドレスは使えません",                                                                           // 2009
    usernameRequired: "ユーザー名が必要です",                                                                                    // 2010
    accounts: {                                                                                                        // 2011
      "Email already exists.": "そのEメールは既に登録されています",                                                                    // 2012
      "Email doesn't match the criteria.": "Eメールが基準を満たしていません",                                                         // 2013
      "Invalid login token": "無効なログイントークンです",                                                                          // 2014
      "Login forbidden": "ログインが許可されません",                                                                               // 2015
      "Service unknown": "サービスが不明です",                                                                                  // 2016
      "Unrecognized options for login request": "ログインリクエストのオプションが認識できません",                                             // 2017
      "User validation failed": "ユーザー確認できません",                                                                         // 2018
      "Username already exists.": "そのユーザー名は既に使われています",                                                                 // 2019
      "You are not logged in.": "ログインしていません",                                                                          // 2020
      "You've been logged out by the server. Please log in again.": "ログアウトされました。再度ログインしてください",                         // 2021
      "Your session has expired. Please log in again.": "セッションが切れました。再度ログインしてください",                                    // 2022
      "No matching login attempt found": "対応のログイン試行が見つかりません",                                                          // 2023
      "Password is old. Please reset your password.": "パスワードが古くなりました。パスワードをリセットしてください",                                // 2024
      "Incorrect password": "パスワードが正しくありません",                                                                          // 2025
      "Invalid email": "Eメールが無効です",                                                                                    // 2026
      "Must be logged in": "ログインが必要です",                                                                                // 2027
      "Need to set a username or email": "ユーザー名かEメールを設定する必要があります",                                                     // 2028
      "old password format": "パスワード形式が古いものです",                                                                         // 2029
      "Password may not be empty": "パスワードが入力されていないようです",                                                               // 2030
      "Signups forbidden": "サインアップが禁止されています",                                                                          // 2031
      "Token expired": "トークンが切れました",                                                                                   // 2032
      "Token has invalid email address": "トークンが無効なEメールアドレスを含んでいます",                                                    // 2033
      "User has no password set": "パスワードが設定されていません",                                                                   // 2034
      "User not found": "ユーザーが見つかりません",                                                                                // 2035
      "Verify email link expired": "Eメールリンクが切れたか確認する",                                                                 // 2036
      "Verify email link is for unknown address": "Eメールリンクが不明なアドレス用か確認する",                                             // 2037
      "Match failed": "一致しませんでした",                                                                                     // 2038
      "Unknown error": "不明なエラー"                                                                                        // 2039
    }                                                                                                                  // 2040
  }                                                                                                                    // 2041
};                                                                                                                     // 2042
                                                                                                                       // 2043
T9n.map("ja", ja);                                                                                                     // 2044
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2046
}).call(this);                                                                                                         // 2047
                                                                                                                       // 2048
                                                                                                                       // 2049
                                                                                                                       // 2050
                                                                                                                       // 2051
                                                                                                                       // 2052
                                                                                                                       // 2053
(function () {                                                                                                         // 2054
                                                                                                                       // 2055
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/kh.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var kh;                                                                                                                // 2063
                                                                                                                       // 2064
kh = {                                                                                                                 // 2065
  add: "បន្ថែម",                                                                                                       // 2066
  and: "និង",                                                                                                          // 2067
  back: "ត្រឡប់ក្រោយ",                                                                                                 // 2068
  changePassword: "ផ្លាស់ប្តូរពាក្យសម្ងាត់",                                                                           // 2069
  choosePassword: "ជ្រើសពាក្យសម្ងាត់",                                                                                 // 2070
  clickAgree: "សូមចុះឈ្មោះ បើអ្នកយល់ព្រម",                                                                             // 2071
  configure: "កំណត់រចនាសម្ព័ន្ធ",                                                                                      // 2072
  createAccount: "បង្កើតគណនី",                                                                                         // 2073
  currentPassword: "ពាក្យសម្ងាត់បច្ចុប្បន្ន",                                                                          // 2074
  dontHaveAnAccount: "មិនមានគណនីទេឬ?",                                                                                 // 2075
  email: "អ៊ីម៉ែល",                                                                                                    // 2076
  emailAddress: "អាសយដ្ឋានអ៊ីម៉ែល",                                                                                    // 2077
  emailResetLink: "អ៊ីម៉ែលតំណភ្ជាប់ សម្រាប់កំណត់ឡើងវិញ",                                                               // 2078
  forgotPassword: "ភ្លេចពាក្យសម្ងាត់?",                                                                                // 2079
  ifYouAlreadyHaveAnAccount: "បើអ្នកមានគណនីមួយរួចទៅហើយ",                                                               // 2080
  newPassword: "ពាក្យសម្ងាត់ថ្មី",                                                                                     // 2081
  newPasswordAgain: "ពាក្យសម្ងាត់ថ្មី (ម្ដងទៀត)",                                                                      // 2082
  optional: "ជម្រើស",                                                                                                  // 2083
  OR: "ឬ",                                                                                                             // 2084
  password: "ពាក្យសម្ងាត់",                                                                                            // 2085
  passwordAgain: "ពាក្យសម្ងាត់ (ម្ដងទៀត)",                                                                             // 2086
  privacyPolicy: "គោលការណ៍ភាពឯកជន",                                                                                    // 2087
  remove: "លុប",                                                                                                       // 2088
  resetYourPassword: "កំណត់ពាក្យសម្ងាត់ឡើងវិញ",                                                                        // 2089
  setPassword: "កំណត់ពាក្យសម្ងាត់",                                                                                    // 2090
  sign: "ចូលគណនី",                                                                                                     // 2091
  signIn: "ពិនិត្យចូល",                                                                                                // 2092
  signin: "ចូល",                                                                                                       // 2093
  signOut: "ចាកចេញ",                                                                                                   // 2094
  signUp: "ចុះឈ្មោះ",                                                                                                  // 2095
  signupCode: "លេខ​កូដចុះឈ្មោះ",                                                                                       // 2096
  signUpWithYourEmailAddress: "ចុះឈ្មោះជាមួយអាសយដ្ឋានអ៊ីមែល",                                                          // 2097
  terms: "លក្ខខណ្ឌនៃការប្រើប្រាស់",                                                                                    // 2098
  updateYourPassword: "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់",                                                                // 2099
  username: "ឈ្មោះអ្នកប្រើ",                                                                                           // 2100
  usernameOrEmail: "ឈ្មោះអ្នកប្រើ ឬអ៊ីម៉ែល",                                                                           // 2101
  "with": "ជាមួយនឹង",                                                                                                  // 2102
  info: {                                                                                                              // 2103
    emailSent: "អ៊ីម៉ែលដែលបានផ្ញើរ",                                                                                   // 2104
    emailVerified: "អ៊ីម៉ែលបានផ្ទៀងផ្ទាត់",                                                                            // 2105
    passwordChanged: "ពាក្យសម្ងាត់បាន​ផ្លាស់ប្តូរ",                                                                    // 2106
    passwordReset: "កំណត់ពាក្យសម្ងាត់ឡើងវិញ"                                                                           // 2107
  },                                                                                                                   // 2108
  error: {                                                                                                             // 2109
    emailRequired: "អ៊ីម៉ែលត្រូវបានទាមទារ",                                                                            // 2110
    minChar: "ពាក្យសម្ងាត់អប្បបរមា ៧ តួអក្សរលេខ",                                                                      // 2111
    pwdsDontMatch: "ពាក្យសម្ងាត់មិនត្រូវគ្នា",                                                                         // 2112
    pwOneDigit: "ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ ១ តួលេខ",                                                           // 2113
    pwOneLetter: "ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ ១ តួអក្សរ​",                                                       // 2114
    signInRequired: "អ្នកត្រូវតែបានចូលគណនី ដើម្បីធ្វើការងារផ្សេងៗ",                                                    // 2115
    signupCodeIncorrect: "លេខកូដការចុះឈ្មោះមិនត្រឹមត្រូវ",                                                             // 2116
    signupCodeRequired: "លេខកូដការចុះឈ្មោះត្រូវបានទាមទារ",                                                             // 2117
    usernameIsEmail: "ឈ្មោះអ្នកប្រើមិនអាចជាអាសយដ្ឋានអ៊ីមែល",                                                           // 2118
    usernameRequired: "ឈ្មោះអ្នកប្រើត្រូវបានទាមទារ",                                                                   // 2119
    accounts: {                                                                                                        // 2120
      "Email already exists.": "អ៊ីម៉ែលមានរួចហើយ",                                                                     // 2121
      "Email doesn't match the criteria.": "អ៊ីម៉ែលមិនផ្គូផ្គងនឹងលក្ខណៈវិនិច្ឆ័យ",                                     // 2122
      "Invalid login token": "សញ្ញាសម្ងាត់ចូលមិនត្រឹមត្រូវ",                                                           // 2123
      "Login forbidden": "បានហាមឃាត់ការចូល",                                                                           // 2124
      "Service unknown": "សេវាមិនស្គាល់",                                                                              // 2125
      "Unrecognized options for login request": "មិនស្គាល់ជម្រើសសម្រាប់សំណើកត់ត្រាចូល",                                // 2126
      "User validation failed": "សុពលភាពរបស់អ្នកប្រើបានបរាជ័យ",                                                        // 2127
      "Username already exists.": "ឈ្មោះអ្នកប្រើមាន​រួចហើយ",                                                           // 2128
      "You are not logged in.": "អ្នកមិនបានចូលគណនីទេ",                                                                 // 2129
      "You've been logged out by the server. Please log in again.": "អ្នកបានចាកចេញ ពីគណនី, សូមចូលម្តងទៀត",             // 2130
      "Your session has expired. Please log in again.": "សុពលភាពរបស់អ្នកបានផុតកំណត់, សូមចូលម្តងទៀត",                   // 2131
      "No matching login attempt found": "គ្មានការផ្គូផ្គងចូលត្រូវបានរកឃើញ",                                           // 2132
      "Password is old. Please reset your password.": "ពាក្យសម្ងាត់គឺចាស់,​ សូមកំណត់ពាក្យសម្ងាត់ឡើងវិញ",               // 2133
      "Incorrect password": "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ",                                                               // 2134
      "Invalid email": "អ៊ីម៉ែលមិនត្រឹមត្រូវ",                                                                         // 2135
      "Must be logged in": "ត្រូវតែចូលគណនី",                                                                           // 2136
      "Need to set a username or email": "ត្រូវកំណត់ឈ្មោះអ្នកប្រើ​ ឬអ៊ីម៉ែល",                                          // 2137
      "old password format": "ទ្រង់ទ្រាយពាក្យសម្ងាត់ចាស់",                                                             // 2138
      "Password may not be empty": "ពាក្យសម្ងាត់ប្រហែលជាមិនអាចទទេ",                                                    // 2139
      "Signups forbidden": "ការចូលត្រូវបានហាមឃាត់",                                                                    // 2140
      "Token expired": "សញ្ញាសម្ងាត់ផុតកំណត់",                                                                         // 2141
      "Token has invalid email address": "សញ្ញាសម្ងាត់ដែលមានអាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ",                             // 2142
      "User has no password set": "អ្នកប្រើមិនមានសំណុំពាក្យសម្ងាត់",                                                   // 2143
      "User not found": "រកមិនឃើញអ្នកប្រើ",                                                                            // 2144
      "Verify email link expired": "ផ្ទៀងផ្ទាត់តំណភ្ជាប់អ៊ីម៉ែលផុតកំណត់",                                              // 2145
      "Verify email link is for unknown address": "ផ្ទៀងផ្ទាត់តំណភ្ជាប់អ៊ីម៉ែល គឺសម្រាប់អាសយដ្ឋានមិនស្គាល់",           // 2146
      "Match failed": "ការផ្ទៀងផ្ទាត់បានបរាជ័យ",                                                                       // 2147
      "Unknown error": "មិនស្គាល់កំហុស"                                                                                // 2148
    }                                                                                                                  // 2149
  }                                                                                                                    // 2150
};                                                                                                                     // 2151
                                                                                                                       // 2152
T9n.map("kh", kh);                                                                                                     // 2153
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2155
}).call(this);                                                                                                         // 2156
                                                                                                                       // 2157
                                                                                                                       // 2158
                                                                                                                       // 2159
                                                                                                                       // 2160
                                                                                                                       // 2161
                                                                                                                       // 2162
(function () {                                                                                                         // 2163
                                                                                                                       // 2164
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/ko.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var ko;                                                                                                                // 2172
                                                                                                                       // 2173
ko = {                                                                                                                 // 2174
  add: "추가",                                                                                                           // 2175
  and: "그리고",                                                                                                          // 2176
  back: "뒤로",                                                                                                          // 2177
  changePassword: "비밀번호 변경",                                                                                           // 2178
  choosePassword: "비밀번호 선택",                                                                                           // 2179
  clickAgree: "클릭함으로써 위 약관을 동의합니다",                                                                                    // 2180
  configure: "설정",                                                                                                     // 2181
  createAccount: "계정 생성",                                                                                              // 2182
  currentPassword: "현재 비밀번호",                                                                                          // 2183
  dontHaveAnAccount: "계정이 없으세요?",                                                                                      // 2184
  email: "이메일",                                                                                                        // 2185
  emailAddress: "이메일 주소",                                                                                              // 2186
  emailResetLink: "이메일 리셋 링크",                                                                                         // 2187
  forgotPassword: "비밀번호를 잊으셨나요?",                                                                                      // 2188
  ifYouAlreadyHaveAnAccount: "이미 계정이 있으시면",                                                                            // 2189
  newPassword: "새 비밀번호",                                                                                               // 2190
  newPasswordAgain: "새 비밀번호(확인)",                                                                                      // 2191
  optional: "선택",                                                                                                      // 2192
  OR: "혹은",                                                                                                            // 2193
  password: "비밀번호",                                                                                                    // 2194
  passwordAgain: "비밀번호 (확인)",                                                                                          // 2195
  privacyPolicy: "개인정보보호정책",                                                                                           // 2196
  remove: "삭제",                                                                                                        // 2197
  resetYourPassword: "비밀번호 초기화",                                                                                       // 2198
  setPassword: "비밀번호 선택",                                                                                              // 2199
  sign: "로그인",                                                                                                         // 2200
  signIn: "로그인",                                                                                                       // 2201
  signin: "로그인",                                                                                                       // 2202
  signOut: "로그아웃",                                                                                                     // 2203
  signUp: "회원가입",                                                                                                      // 2204
  signupCode: "회원가입 코드",                                                                                               // 2205
  signUpWithYourEmailAddress: "이메일로 가입하기",                                                                             // 2206
  terms: "약관",                                                                                                         // 2207
  updateYourPassword: "비밀번호 업데이트",                                                                                     // 2208
  username: "아이디",                                                                                                     // 2209
  usernameOrEmail: "아이디 혹은 이메일",                                                                                       // 2210
  "with": "와",                                                                                                         // 2211
  info: {                                                                                                              // 2212
    emailSent: "이메일 발송",                                                                                               // 2213
    emailVerified: "이메일 인증성공",                                                                                         // 2214
    passwordChanged: "비밀번호 변경됨",                                                                                       // 2215
    passwordReset: "비밀번호 리셋",                                                                                          // 2216
    error: {                                                                                                           // 2217
      emailRequired: "이메일이 필요합니다.",                                                                                    // 2218
      minChar: "비밀번호는 최소 7자 이상입니다.",                                                                                   // 2219
      pwdsDontMatch: "비밀번호가 맞지않습니다",                                                                                   // 2220
      pwOneDigit: "비밀번호에 숫자 하나이상이 필요합니다.",                                                                             // 2221
      pwOneLetter: "비밀번호에 문자 하나이상이 필요합니다.",                                                                            // 2222
      signInRequired: "로그인이 필요한 서비스입니다.",                                                                              // 2223
      signupCodeIncorrect: "가입 코드가 맞지않습니다.",                                                                           // 2224
      signupCodeRequired: "가입 코드가 필요합니다.",                                                                             // 2225
      usernameIsEmail: "아이디와 이메일은 달라야합니다.",                                                                            // 2226
      usernameRequired: "아이디가 필요합니다.",                                                                                 // 2227
      accounts: {                                                                                                      // 2228
        "Email already exists.": "중복된 이메일입니다.",                                                                        // 2229
        "Email doesn't match the criteria.": "이메일이 요구조건에 맞지않습니다.",                                                     // 2230
        "Invalid login token": "잘못된 로그인 토큰",                                                                           // 2231
        "Login forbidden": "Login forbidden",                                                                          // 2232
        "Service unknown": "Service unknown",                                                                          // 2233
        "Unrecognized options for login request": "Unrecognized options for login request",                            // 2234
        "User validation failed": "인증 실패",                                                                             // 2235
        "Username already exists.": "중복된 아이디입니다.",                                                                     // 2236
        "You are not logged in.": "로그인 상태가 아닙니다.",                                                                     // 2237
        "You've been logged out by the server. Please log in again.": "서버에 의해 로그아웃되셨습니다 다시 로그인해주세요.",                  // 2238
        "Your session has expired. Please log in again.": "세션이 만료되었습니다 다시 로그인해주세요.",                                   // 2239
        "No matching login attempt found": "No matching login attempt found",                                          // 2240
        "Password is old. Please reset your password.": "오래된 비밀번호 입니다 변경해주세요.",                                        // 2241
        "Incorrect password": "잘못된 비밀번호 입니다",                                                                          // 2242
        "Invalid email": "잘못된 이메일 입니다",                                                                                // 2243
        "Must be logged in": "로그인이 필요합니다",                                                                             // 2244
        "Need to set a username or email": "아이디나 이메일을 입력해주세요",                                                         // 2245
        "old password format": "old password format",                                                                  // 2246
        "Password may not be empty": "비밀번호를 입력해주세요",                                                                   // 2247
        "Signups forbidden": "가입이 거부되었습니다",                                                                            // 2248
        "Token expired": "Token expired",                                                                              // 2249
        "Token has invalid email address": "Token has invalid email address",                                          // 2250
        "User has no password set": "User has no password set",                                                        // 2251
        "User not found": "사용자를 찾을수 없습니다",                                                                             // 2252
        "Verify email link expired": "확인 코드가 만료됬습니다",                                                                  // 2253
        "Verify email link is for unknown address": "Verify email link is for unknown address",                        // 2254
        "Match failed": "매치되지 않습니다",                                                                                   // 2255
        "Unknown error": "Unknown error"                                                                               // 2256
      }                                                                                                                // 2257
    }                                                                                                                  // 2258
  }                                                                                                                    // 2259
};                                                                                                                     // 2260
                                                                                                                       // 2261
T9n.map("ko", ko);                                                                                                     // 2262
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2264
}).call(this);                                                                                                         // 2265
                                                                                                                       // 2266
                                                                                                                       // 2267
                                                                                                                       // 2268
                                                                                                                       // 2269
                                                                                                                       // 2270
                                                                                                                       // 2271
(function () {                                                                                                         // 2272
                                                                                                                       // 2273
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/pl.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var pl;                                                                                                                // 2281
                                                                                                                       // 2282
pl = {                                                                                                                 // 2283
  add: "dodaj",                                                                                                        // 2284
  and: "i",                                                                                                            // 2285
  back: "powrót",                                                                                                      // 2286
  changePassword: "Zmień hasło",                                                                                       // 2287
  choosePassword: "Wybierz hasło",                                                                                     // 2288
  clickAgree: "Klikając na Zarejestruj się zgadzasz się z naszą",                                                      // 2289
  configure: "Konfiguruj",                                                                                             // 2290
  createAccount: "Utwórz konto",                                                                                       // 2291
  currentPassword: "Aktualne hasło",                                                                                   // 2292
  dontHaveAnAccount: "Nie masz konta?",                                                                                // 2293
  email: "E-mail",                                                                                                     // 2294
  emailAddress: "Adres e-mail",                                                                                        // 2295
  emailResetLink: "Wyślij e-mail z linkiem do zmiany hasła",                                                           // 2296
  forgotPassword: "Zapomniałeś hasła?",                                                                                // 2297
  ifYouAlreadyHaveAnAccount: "Jeżeli już masz konto",                                                                  // 2298
  newPassword: "Nowe hasło",                                                                                           // 2299
  newPasswordAgain: "Nowe hasło (powtórz)",                                                                            // 2300
  optional: "Nieobowiązkowe",                                                                                          // 2301
  OR: "LUB",                                                                                                           // 2302
  password: "Hasło",                                                                                                   // 2303
  passwordAgain: "Hasło (powtórz)",                                                                                    // 2304
  privacyPolicy: "polityką prywatności",                                                                               // 2305
  remove: "usuń",                                                                                                      // 2306
  resetYourPassword: "Ustaw nowe hasło",                                                                               // 2307
  setPassword: "Ustaw hasło",                                                                                          // 2308
  sign: "Podpisz",                                                                                                     // 2309
  signIn: "Zaloguj się",                                                                                               // 2310
  signin: "zaloguj się",                                                                                               // 2311
  signOut: "Wyloguj się",                                                                                              // 2312
  signUp: "Zarejestruj się",                                                                                           // 2313
  signupCode: "Kod rejestracji",                                                                                       // 2314
  signUpWithYourEmailAddress: "Zarejestruj się używając adresu e-mail",                                                // 2315
  terms: "warunkami korzystania z serwisu",                                                                            // 2316
  updateYourPassword: "Zaktualizuj swoje hasło",                                                                       // 2317
  username: "Nazwa użytkownika",                                                                                       // 2318
  usernameOrEmail: "Nazwa użytkownika lub adres e-mail",                                                               // 2319
  "with": "z",                                                                                                         // 2320
  info: {                                                                                                              // 2321
    emailSent: "Adres e-mail wysłany",                                                                                 // 2322
    emailVerified: "Adres e-mail zweryfikowany",                                                                       // 2323
    passwordChanged: "Hasło zmienione",                                                                                // 2324
    passwordReset: "Hasło wyzerowane"                                                                                  // 2325
  },                                                                                                                   // 2326
  error: {                                                                                                             // 2327
    emailRequired: "Wymagany jest adres e-mail.",                                                                      // 2328
    minChar: "7 znaków to minimalna długość hasła.",                                                                   // 2329
    pwdsDontMatch: "Hasła są różne",                                                                                   // 2330
    pwOneDigit: "Hasło musi zawierać przynajmniej jedną cyfrę.",                                                       // 2331
    pwOneLetter: "Hasło musi zawierać 1 literę.",                                                                      // 2332
    signInRequired: "Musisz być zalogowany, aby to zrobić.",                                                           // 2333
    signupCodeIncorrect: "Kod rejestracji jest nieprawidłowy.",                                                        // 2334
    signupCodeRequired: "Wymagany jest kod rejestracji.",                                                              // 2335
    usernameIsEmail: "Adres e-mail nie może być nazwą użytkownika.",                                                   // 2336
    usernameRequired: "Wymagana jest nazwa użytkownika.",                                                              // 2337
    accounts: {                                                                                                        // 2338
      "Email already exists.": "Adres e-mail już istnieje.",                                                           // 2339
      "Email doesn't match the criteria.": "Adres e-mail nie spełnia kryteriów.",                                      // 2340
      "Invalid login token": "Błędny token logowania",                                                                 // 2341
      "Login forbidden": "Logowanie zabronione",                                                                       // 2342
      "Service unknown": "Nieznana usługa",                                                                            // 2343
      "Unrecognized options for login request": "Nieznane parametry w żądaniu logowania",                              // 2344
      "User validation failed": "Niepoprawna nazwa użytkownika",                                                       // 2345
      "Username already exists.": "Nazwa użytkownika już istnieje.",                                                   // 2346
      "You are not logged in.": "Nie jesteś zalogowany.",                                                              // 2347
      "You've been logged out by the server. Please log in again.": "Zostałeś wylogowane przez serwer. Zaloguj się ponownie.",
      "Your session has expired. Please log in again.": "Twoja sesja wygasła. Zaloguj się ponownie.",                  // 2349
      "No matching login attempt found": "Nie dopasowano danych logowania",                                            // 2350
      "Password is old. Please reset your password.": "Hasło jest stare. Proszę wyzerować hasło.",                     // 2351
      "Incorrect password": "Niepoprawne hasło",                                                                       // 2352
      "Invalid email": "Błędny adres e-mail",                                                                          // 2353
      "Must be logged in": "Musisz być zalogowany",                                                                    // 2354
      "Need to set a username or email": "Wymagane ustawienie nazwy użytkownika lub adresu e-mail",                    // 2355
      "old password format": "stary format hasła",                                                                     // 2356
      "Password may not be empty": "Hasło nie może być puste",                                                         // 2357
      "Signups forbidden": "Rejestracja zabroniona",                                                                   // 2358
      "Token expired": "Token wygasł",                                                                                 // 2359
      "Token has invalid email address": "Token ma niewłaściwy adres e-mail",                                          // 2360
      "User has no password set": "Użytkownik nie ma ustawionego hasła",                                               // 2361
      "User not found": "Nie znaleziono użytkownika",                                                                  // 2362
      "Verify email link expired": "Link weryfikacyjny wygasł",                                                        // 2363
      "Verify email link is for unknown address": "Link weryfikacyjny jest dla nieznanego adresu",                     // 2364
      "Match failed": "Błędne dopasowanie",                                                                            // 2365
      "Unknown error": "Nieznany błąd"                                                                                 // 2366
    }                                                                                                                  // 2367
  }                                                                                                                    // 2368
};                                                                                                                     // 2369
                                                                                                                       // 2370
T9n.map("pl", pl);                                                                                                     // 2371
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2373
}).call(this);                                                                                                         // 2374
                                                                                                                       // 2375
                                                                                                                       // 2376
                                                                                                                       // 2377
                                                                                                                       // 2378
                                                                                                                       // 2379
                                                                                                                       // 2380
(function () {                                                                                                         // 2381
                                                                                                                       // 2382
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/pt.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var pt;                                                                                                                // 2390
                                                                                                                       // 2391
pt = {                                                                                                                 // 2392
  add: "Adicionar",                                                                                                    // 2393
  and: "e",                                                                                                            // 2394
  back: "Voltar",                                                                                                      // 2395
  changePassword: "Alterar senha",                                                                                     // 2396
  choosePassword: "Escolha uma senha",                                                                                 // 2397
  clickAgree: "Ao clicar em Criar Conta, você estará reconhecendo que aceita nossos Termos de Uso",                    // 2398
  configure: "Configurar",                                                                                             // 2399
  createAccount: "Criar Conta",                                                                                        // 2400
  currentPassword: "Senha Atual",                                                                                      // 2401
  dontHaveAnAccount: "Não tem conta?",                                                                                 // 2402
  email: "E-mail",                                                                                                     // 2403
  emailAddress: "Endereço de e-mail",                                                                                  // 2404
  emailResetLink: "E-mail com link para gerar Nova Senha",                                                             // 2405
  forgotPassword: "Esqueceu sua senha?",                                                                               // 2406
  ifYouAlreadyHaveAnAccount: "Se você já tem uma conta",                                                               // 2407
  newPassword: "Nova Senha",                                                                                           // 2408
  newPasswordAgain: "Nova Senha (novamente)",                                                                          // 2409
  optional: "Opcional",                                                                                                // 2410
  OR: "OU",                                                                                                            // 2411
  password: "Senha",                                                                                                   // 2412
  passwordAgain: "Senha (novamente)",                                                                                  // 2413
  privacyPolicy: "Política de Privacidade",                                                                            // 2414
  remove: "remover",                                                                                                   // 2415
  resetYourPassword: "Gerar nova senha",                                                                               // 2416
  setPassword: "Cadastrar Senha",                                                                                      // 2417
  sign: "Entrar",                                                                                                      // 2418
  signIn: "Entrar",                                                                                                    // 2419
  signin: "entrar",                                                                                                    // 2420
  signOut: "Sair",                                                                                                     // 2421
  signUp: "Criar conta",                                                                                               // 2422
  signupCode: "Código de Registro",                                                                                    // 2423
  signUpWithYourEmailAddress: "Criar conta utilizando seu endereço de e-mail",                                         // 2424
  terms: "Termos de Uso",                                                                                              // 2425
  updateYourPassword: "Atualizar senha",                                                                               // 2426
  username: "Nome de usuário",                                                                                         // 2427
  usernameOrEmail: "Usuário ou e-mail",                                                                                // 2428
  "with": "com",                                                                                                       // 2429
  info: {                                                                                                              // 2430
    emailSent: "E-mail enviado",                                                                                       // 2431
    emailVerified: "E-mail verificado",                                                                                // 2432
    passwordChanged: "Senha atualizada",                                                                               // 2433
    passwordReset: "Senha alterada"                                                                                    // 2434
  },                                                                                                                   // 2435
  error: {                                                                                                             // 2436
    emailRequired: "E-mail é obrigatório.",                                                                            // 2437
    minChar: "Senha requer um mínimo de 7 caracteres.",                                                                // 2438
    pwdsDontMatch: "Senhas não coincidem",                                                                             // 2439
    pwOneDigit: "A Senha deve conter pelo menos um dígito.",                                                           // 2440
    pwOneLetter: "A Senha deve conter pelo menos uma letra.",                                                          // 2441
    signInRequired: "Você precisa estar logado para fazer isso.",                                                      // 2442
    signupCodeIncorrect: "Código de acesso incorreto.",                                                                // 2443
    signupCodeRequired: "É necessário um código de acesso.",                                                           // 2444
    usernameIsEmail: "Nome de usuário não pode ser um endereço de e-mail.",                                            // 2445
    usernameRequired: "Nome de usuário é obrigatório.",                                                                // 2446
    accounts: {                                                                                                        // 2447
      "Email already exists.": "E-mail já existe.",                                                                    // 2448
      "Email doesn't match the criteria.": "E-mail inválido.",                                                         // 2449
      "Invalid login token": "Token de login inválido",                                                                // 2450
      "Login forbidden": "Login não permitido",                                                                        // 2451
      "Service unknown": "Serviço desconhecido",                                                                       // 2452
      "Unrecognized options for login request": "Opções desconhecidas para solicitação de login",                      // 2453
      "User validation failed": "Validação de usuário falhou",                                                         // 2454
      "Username already exists.": "Nome de usuário já existe.",                                                        // 2455
      "You are not logged in.": "Você não está logado.",                                                               // 2456
      "You've been logged out by the server. Please log in again.": "Você foi desconectado pelo servidor. Por favor, efetue login novamente.",
      "Your session has expired. Please log in again.": "Sua sessão expirou. Por favor, efetue login novamente.",      // 2458
      "No matching login attempt found": "Não foi encontrada nenhuma tentativa de login que coincida.",                // 2459
      "Password is old. Please reset your password.": "Senha expirou. Por favor, cadastre uma nova senha.",            // 2460
      "Incorrect password": "Senha incorreta",                                                                         // 2461
      "Invalid email": "E-mail inválido",                                                                              // 2462
      "Must be logged in": "É necessário efetuar login",                                                               // 2463
      "Need to set a username or email": "É necessário configurar um Nome de Usuário ou E-mail",                       // 2464
      "old password format": "Formato de senha antigo",                                                                // 2465
      "Password may not be empty": "Senha não pode estar em branco",                                                   // 2466
      "Signups forbidden": "Não permitido Criar Conta",                                                                // 2467
      "Token expired": "Token expirou",                                                                                // 2468
      "Token has invalid email address": "Token tem endereço de e-mail inválido",                                      // 2469
      "User has no password set": "Usuário não possui senha cadastrada",                                               // 2470
      "User not found": "Usuário não encontrado",                                                                      // 2471
      "Verify email link expired": "O link de verificação de e-mail expirou",                                          // 2472
      "Verify email link is for unknown address": "O link de verificação de e-mail está configurado para um endereço desconhecido",
      "Match failed": "Senhas não coincidem",                                                                          // 2474
      "Unknown error": "Erro desconhecido"                                                                             // 2475
    }                                                                                                                  // 2476
  }                                                                                                                    // 2477
};                                                                                                                     // 2478
                                                                                                                       // 2479
T9n.map("pt", pt);                                                                                                     // 2480
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2482
}).call(this);                                                                                                         // 2483
                                                                                                                       // 2484
                                                                                                                       // 2485
                                                                                                                       // 2486
                                                                                                                       // 2487
                                                                                                                       // 2488
                                                                                                                       // 2489
(function () {                                                                                                         // 2490
                                                                                                                       // 2491
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/pt_PT.coffee.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var pt_PT;                                                                                                             // 2499
                                                                                                                       // 2500
pt_PT = {                                                                                                              // 2501
  add: "adicionar",                                                                                                    // 2502
  and: "e",                                                                                                            // 2503
  back: "voltar",                                                                                                      // 2504
  changePassword: "Alterar palavra-passe",                                                                             // 2505
  choosePassword: "Escolha uma palavra-passe",                                                                         // 2506
  clickAgree: "Ao clicar em Registar, está a aceitar os nossos",                                                       // 2507
  configure: "Configurar",                                                                                             // 2508
  createAccount: "Criar uma Conta",                                                                                    // 2509
  currentPassword: "Palavra-passe Atual",                                                                              // 2510
  dontHaveAnAccount: "Não tem conta?",                                                                                 // 2511
  email: "E-mail",                                                                                                     // 2512
  emailAddress: "Endereço de e-mail",                                                                                  // 2513
  emailResetLink: "Enviar e-mail para redefinir a palavra-passe",                                                      // 2514
  forgotPassword: "Esqueci-me da palavra-passe",                                                                       // 2515
  ifYouAlreadyHaveAnAccount: "Se já tem uma conta",                                                                    // 2516
  newPassword: "Nova Palavra-passe",                                                                                   // 2517
  newPasswordAgain: "Nova Palavra-passe (novamente)",                                                                  // 2518
  optional: "Opcional",                                                                                                // 2519
  OR: "OU",                                                                                                            // 2520
  password: "Palavra-passe",                                                                                           // 2521
  passwordAgain: "Palavra-passe (novamente)",                                                                          // 2522
  privacyPolicy: "Política de Privacidade",                                                                            // 2523
  remove: "remover",                                                                                                   // 2524
  resetYourPassword: "Redefinir a palavra-passe",                                                                      // 2525
  setPassword: "Definir Palavra-passe",                                                                                // 2526
  sign: "Iniciar",                                                                                                     // 2527
  signIn: "Iniciar Sessão",                                                                                            // 2528
  signin: "iniciar sessão",                                                                                            // 2529
  signOut: "Sair",                                                                                                     // 2530
  signUp: "Criar conta",                                                                                               // 2531
  signupCode: "Código de Registo",                                                                                     // 2532
  signUpWithYourEmailAddress: "Registar com o endereço de e-mail",                                                     // 2533
  terms: "Termos de Uso",                                                                                              // 2534
  updateYourPassword: "Alterar a palavra-passe",                                                                       // 2535
  username: "Nome do ulilizador",                                                                                      // 2536
  usernameOrEmail: "Ulilizador ou e-mail",                                                                             // 2537
  "with": "com",                                                                                                       // 2538
  info: {                                                                                                              // 2539
    emailSent: "E-mail enviado",                                                                                       // 2540
    emailVerified: "E-mail verificado",                                                                                // 2541
    passwordChanged: "Palavra-passe alterada",                                                                         // 2542
    passwordReset: "Palavra-passe redefinida"                                                                          // 2543
  },                                                                                                                   // 2544
  error: {                                                                                                             // 2545
    emailRequired: "O e-mail é obrigatório.",                                                                          // 2546
    minChar: "A palavra-passe tem de ter no mínimo 7 caracteres.",                                                     // 2547
    pwdsDontMatch: "As palavra-passes não coincidem",                                                                  // 2548
    pwOneDigit: "A palavra-passe tem de conter pelo menos um dígito.",                                                 // 2549
    pwOneLetter: "A palavra-passe tem de conter pelo menos uma letra.",                                                // 2550
    signInRequired: "É necessário iniciar sessão para fazer isso.",                                                    // 2551
    signupCodeIncorrect: "Código de registo incorreto.",                                                               // 2552
    signupCodeRequired: "É necessário um código de registo.",                                                          // 2553
    usernameIsEmail: "O nome do utilizador não pode ser um endereço de e-mail.",                                       // 2554
    usernameRequired: "O nome de usuário é obrigatório.",                                                              // 2555
    accounts: {                                                                                                        // 2556
      "Email already exists.": "O e-mail já existe.",                                                                  // 2557
      "Email doesn't match the criteria.": "E-mail inválido.",                                                         // 2558
      "Invalid login token": "Token de início de sessão inválido",                                                     // 2559
      "Login forbidden": "Início de sessão impedido",                                                                  // 2560
      "Service unknown": "Serviço desconhecido",                                                                       // 2561
      "Unrecognized options for login request": "Pedido de início de sessão com opções não reconhecidas",              // 2562
      "User validation failed": "A validação do utilizador falhou",                                                    // 2563
      "Username already exists.": "O nome do utilizador já existe.",                                                   // 2564
      "You are not logged in.": "Não tem sessão iniciada.",                                                            // 2565
      "You've been logged out by the server. Please log in again.": "Sessão terminada pelo servidor. Por favor, inicie sessão novamente.",
      "Your session has expired. Please log in again.": "A sua sessão expirou. Por favor, inicie sessão novamente.",   // 2567
      "No matching login attempt found": "Não foi encontrada nenhuma tentativa de início de sessão que coincida.",     // 2568
      "Password is old. Please reset your password.": "A palavra-passe é antiga. Por favor, redefina a sua palavra-passe.",
      "Incorrect password": "Palavra-passe incorreta",                                                                 // 2570
      "Invalid email": "E-mail inválido",                                                                              // 2571
      "Must be logged in": "É necessário iniciar sessão",                                                              // 2572
      "Need to set a username or email": "É necessário definir um nome de utilizador ou e-mail",                       // 2573
      "old password format": "Formato de palavra-passe antigo",                                                        // 2574
      "Password may not be empty": "A palavra-passe não pode estar em branco",                                         // 2575
      "Signups forbidden": "Criação de contas proibida",                                                               // 2576
      "Token expired": "O token expirou",                                                                              // 2577
      "Token has invalid email address": "O token tem um endereço de e-mail inválido",                                 // 2578
      "User has no password set": "O utilizador não defeniu a palavra-passe",                                          // 2579
      "User not found": "Utilizador não encontrado",                                                                   // 2580
      "Verify email link expired": "O link de verificação de e-mail expirou",                                          // 2581
      "Verify email link is for unknown address": "O link de verificação de e-mail está definido para um endereço desconhecido",
      "Match failed": "Comparação falhou",                                                                             // 2583
      "Unknown error": "Erro desconhecido"                                                                             // 2584
    }                                                                                                                  // 2585
  }                                                                                                                    // 2586
};                                                                                                                     // 2587
                                                                                                                       // 2588
T9n.map("pt_PT", pt_PT);                                                                                               // 2589
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2591
}).call(this);                                                                                                         // 2592
                                                                                                                       // 2593
                                                                                                                       // 2594
                                                                                                                       // 2595
                                                                                                                       // 2596
                                                                                                                       // 2597
                                                                                                                       // 2598
(function () {                                                                                                         // 2599
                                                                                                                       // 2600
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/ro.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var ro;                                                                                                                // 2608
                                                                                                                       // 2609
ro = {                                                                                                                 // 2610
  add: "adaugă",                                                                                                       // 2611
  and: "și",                                                                                                           // 2612
  back: "înapoi",                                                                                                      // 2613
  changePassword: "Schimbare parolă",                                                                                  // 2614
  choosePassword: "Alege o parolă",                                                                                    // 2615
  clickAgree: "Click pe Register, sunteți de acord",                                                                   // 2616
  configure: "Configurare",                                                                                            // 2617
  createAccount: "Creați un cont",                                                                                     // 2618
  currentPassword: "Parola curentă",                                                                                   // 2619
  dontHaveAnAccount: "Nu ai un cont?",                                                                                 // 2620
  email: "E-mail",                                                                                                     // 2621
  emailAddress: "Adresa de e-mail",                                                                                    // 2622
  emailResetLink: "Link de resetare parolă",                                                                           // 2623
  forgotPassword: "Ți-ai uitat parola?",                                                                               // 2624
  ifYouAlreadyHaveAnAccount: "Dacă ai deja un cont",                                                                   // 2625
  newPassword: "Parolă nouă",                                                                                          // 2626
  newPasswordAgain: "Parolă nouă (din nou)",                                                                           // 2627
  optional: "Opțional",                                                                                                // 2628
  OR: "SAU",                                                                                                           // 2629
  password: "Parolă",                                                                                                  // 2630
  passwordAgain: "Parolă (din nou)",                                                                                   // 2631
  privacyPolicy: "Politica de confidentialitate",                                                                      // 2632
  remove: "Elimină",                                                                                                   // 2633
  resetYourPassword: "Schimbati parola",                                                                               // 2634
  setPassword: "Setati parola",                                                                                        // 2635
  sign: "Înregistrează",                                                                                               // 2636
  signIn: "Autentificare",                                                                                             // 2637
  signin: "Autentificare",                                                                                             // 2638
  signOut: "Deconectare",                                                                                              // 2639
  signUp: "Înregistrare",                                                                                              // 2640
  signupCode: "Codul de înregistrare",                                                                                 // 2641
  signUpWithYourEmailAddress: "Înregistrați-vă adresa de e-mail",                                                      // 2642
  terms: "Condiții de utilizare",                                                                                      // 2643
  updateYourPassword: "Actualizați parola dvs.",                                                                       // 2644
  username: "Nume utilizator",                                                                                         // 2645
  usernameOrEmail: "Nume utilizator sau e-mail",                                                                       // 2646
  "with": "cu",                                                                                                        // 2647
  info: {                                                                                                              // 2648
    emailSent: "Email trimis",                                                                                         // 2649
    emailVerified: "Email verificat",                                                                                  // 2650
    passwordChanged: "Parola a fost schimbata",                                                                        // 2651
    passwordReset: "Resetare parola"                                                                                   // 2652
  },                                                                                                                   // 2653
  error: {                                                                                                             // 2654
    emailRequired: "Introduceti Email-ul.",                                                                            // 2655
    minChar: "Parolă minima de 7 caractere ",                                                                          // 2656
    pwdsDontMatch: "Parolele nu se potrivesc",                                                                         // 2657
    pwOneDigit: "Parola trebuie să contină cel puțin o cifră.",                                                        // 2658
    pwOneLetter: "Parola necesită o scrisoare.",                                                                       // 2659
    signInRequired: "Autentificare.",                                                                                  // 2660
    signupCodeIncorrect: "Codul de înregistrare este incorectă.",                                                      // 2661
    signupCodeRequired: "Aveti nevoie de cod de înregistrare.",                                                        // 2662
    usernameIsEmail: "Numele de utilizator nu poate fi o adresă de e-mail.",                                           // 2663
    usernameRequired: "Introduceti numele de utilizator.",                                                             // 2664
    accounts: {                                                                                                        // 2665
      "Email already exists.": "E-mail există deja.",                                                                  // 2666
      "Email doesn't match the criteria.": "E-mail nu se potrivește cu criteriile.",                                   // 2667
      "Invalid login token": "Token invalid",                                                                          // 2668
      "Login forbidden": "Autentificare interzisă",                                                                    // 2669
      "Service unknown": "Service necunoscut",                                                                         // 2670
      "Unrecognized options for login request": "Opțiuni nerecunoscute de cerere de conectare",                        // 2671
      "User validation failed": "Validare utilizator nereușit",                                                        // 2672
      "Username already exists.": "Numele de utilizator existent.",                                                    // 2673
      "You are not logged in.": "Nu sunteti autentificat.",                                                            // 2674
      "You've been logged out by the server. Please log in again.": "Ați fost deconectat de către server rugam sa va logati din nou.",
      "Your session has expired. Please log in again.": "Sesiunea a expirat rugam sa va logati din nou.",              // 2676
      "No matching login attempt found": "Autentificare nereusită",                                                    // 2677
      "Password is old. Please reset your password.": "Parola expirata, Vă rugăm să resetati parola.",                 // 2678
      "Incorrect password": "Parola incorectă",                                                                        // 2679
      "Invalid email": "E-mail invalid",                                                                               // 2680
      "Must be logged in": "Trebuie sa fii logat",                                                                     // 2681
      "Need to set a username or email": "Adaugati un nume utilizator sau un e-mail",                                  // 2682
      "old password format": "Parola cu format vechi",                                                                 // 2683
      "Password may not be empty": "Parola nu poate fi gol",                                                           // 2684
      "Signups forbidden": "Înscrieri interzisă",                                                                      // 2685
      "Token expired": "Token expirat",                                                                                // 2686
      "Token has invalid email address": "Token are adresă de email invalidă",                                         // 2687
      "User has no password set": "Utilizator nu are parola setată",                                                   // 2688
      "User not found": "Utilizator nu a fost găsit",                                                                  // 2689
      "Verify email link expired": "Link-ul de e-mail a expirat",                                                      // 2690
      "Verify email link is for unknown address": "Link-ul de e-mail nu corespunde",                                   // 2691
      "Match failed": "Potrivire nereușită",                                                                           // 2692
      "Unknown error": "Eroare necunoscută"                                                                            // 2693
    }                                                                                                                  // 2694
  }                                                                                                                    // 2695
};                                                                                                                     // 2696
                                                                                                                       // 2697
T9n.map("ro", ro);                                                                                                     // 2698
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2700
}).call(this);                                                                                                         // 2701
                                                                                                                       // 2702
                                                                                                                       // 2703
                                                                                                                       // 2704
                                                                                                                       // 2705
                                                                                                                       // 2706
                                                                                                                       // 2707
(function () {                                                                                                         // 2708
                                                                                                                       // 2709
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/ru.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var ru;                                                                                                                // 2717
                                                                                                                       // 2718
ru = {                                                                                                                 // 2719
  add: "добавить",                                                                                                     // 2720
  and: "и",                                                                                                            // 2721
  back: "назад",                                                                                                       // 2722
  changePassword: "Сменить пароль",                                                                                    // 2723
  choosePassword: "Придумайте пароль",                                                                                 // 2724
  clickAgree: "Нажав на Регистрация вы соглашаетесь с условиями",                                                      // 2725
  configure: "Конфигурировать",                                                                                        // 2726
  createAccount: "Создать аккаунт",                                                                                    // 2727
  currentPassword: "Текущий пароль",                                                                                   // 2728
  dontHaveAnAccount: "Нет аккаунта?",                                                                                  // 2729
  email: "Email",                                                                                                      // 2730
  emailAddress: "Email",                                                                                               // 2731
  emailResetLink: "Отправить ссылку для сброса",                                                                       // 2732
  forgotPassword: "Забыли пароль?",                                                                                    // 2733
  ifYouAlreadyHaveAnAccount: "Если у вас уже есть аккаунт",                                                            // 2734
  newPassword: "Новый пароль",                                                                                         // 2735
  newPasswordAgain: "Новый пароль (еще раз)",                                                                          // 2736
  optional: "Необязательно",                                                                                           // 2737
  OR: "ИЛИ",                                                                                                           // 2738
  password: "Пароль",                                                                                                  // 2739
  passwordAgain: "Пароль (еще раз)",                                                                                   // 2740
  privacyPolicy: "Политики безопасности",                                                                              // 2741
  remove: "Удалить",                                                                                                   // 2742
  resetYourPassword: "Сбросить пароль",                                                                                // 2743
  setPassword: "Установить пароль",                                                                                    // 2744
  sign: "Подпись",                                                                                                     // 2745
  signIn: "Войти",                                                                                                     // 2746
  signin: "войти",                                                                                                     // 2747
  signOut: "Выйти",                                                                                                    // 2748
  signUp: "Регистрация",                                                                                               // 2749
  signupCode: "Регистрационный код",                                                                                   // 2750
  signUpWithYourEmailAddress: "Зарегистрируйтесь с вашим email адресом",                                               // 2751
  terms: "Условиями пользования",                                                                                      // 2752
  updateYourPassword: "Обновить пароль",                                                                               // 2753
  username: "Имя пользователя",                                                                                        // 2754
  usernameOrEmail: "Имя пользователя или email",                                                                       // 2755
  "with": "с",                                                                                                         // 2756
  info: {                                                                                                              // 2757
    emailSent: "Email отправлен",                                                                                      // 2758
    emailVerified: "Email прошел проверку",                                                                            // 2759
    passwordChanged: "Пароль изменен",                                                                                 // 2760
    passwordReset: "Пароль сброшен"                                                                                    // 2761
  },                                                                                                                   // 2762
  error: {                                                                                                             // 2763
    emailRequired: "Email обязательно.",                                                                               // 2764
    minChar: "Минимальное кол-во символов для пароля 7.",                                                              // 2765
    pwdsDontMatch: "Пароли не совпадают",                                                                              // 2766
    pwOneDigit: "В пароле должна быть хотя бы одна цифра.",                                                            // 2767
    pwOneLetter: "В пароле должна быть хотя бы одна буква.",                                                           // 2768
    signInRequired: "Необходимо войти для чтобы продолжить.",                                                          // 2769
    signupCodeIncorrect: "Неправильный регистрационный код.",                                                          // 2770
    signupCodeRequired: "Необходим регистрациооный код.",                                                              // 2771
    usernameIsEmail: "Имя пользователя не может быть адресом email.",                                                  // 2772
    usernameRequired: "Имя пользователя обязательно.",                                                                 // 2773
    accounts: {                                                                                                        // 2774
      "Email already exists.": "Email уже существует",                                                                 // 2775
      "Email doesn't match the criteria.": "Email не соответствует критериям.",                                        // 2776
      "Invalid login token": "Неверный токен для входа",                                                               // 2777
      "Login forbidden": "Вход запрещен",                                                                              // 2778
      "Service unknown": "Cервис неизвестен",                                                                          // 2779
      "Unrecognized options for login request": "Неизвестные параметры для запроса входа",                             // 2780
      "User validation failed": "Проверка пользователя неудалась",                                                     // 2781
      "Username already exists.": "Пользователь существует.",                                                          // 2782
      "You are not logged in.": "Вы не вошли.",                                                                        // 2783
      "You've been logged out by the server. Please log in again.": "Сервер инициировал выход. Пожалуйста войдите еще раз.",
      "Your session has expired. Please log in again.": "Ваша сессия устарела. Пожалуйста войдите еще раз.",           // 2785
      "No matching login attempt found": "Не было найдено соответствующей попытки войти",                              // 2786
      "Password is old. Please reset your password.": "Пароль устарел. Пожалуйста сбросьте Ваш пароль.",               // 2787
      "Incorrect password": "Неправильный пароль",                                                                     // 2788
      "Invalid email": "Несуществующий Email",                                                                         // 2789
      "Must be logged in": "Необходимо войти",                                                                         // 2790
      "Need to set a username or email": "Необходимо имя пользователя или email",                                      // 2791
      "old password format": "старый формат пароля",                                                                   // 2792
      "Password may not be empty": "Пароль не может быть пустым",                                                      // 2793
      "Signups forbidden": "Регистрация отключена",                                                                    // 2794
      "Token expired": "Время действия токена истекло",                                                                // 2795
      "Token has invalid email address": "У токена неправильный email адрес",                                          // 2796
      "User has no password set": "У пользователя не установлен пароль",                                               // 2797
      "User not found": "Пользователь не найден",                                                                      // 2798
      "Verify email link expired": "Ссылка подтверждения email устарела",                                              // 2799
      "Verify email link is for unknown address": "Ссылка подтверждения email для неизвестного адреса",                // 2800
      "Match failed": "Не совпадают",                                                                                  // 2801
      "Unknown error": "Неизвестная ошибка"                                                                            // 2802
    }                                                                                                                  // 2803
  }                                                                                                                    // 2804
};                                                                                                                     // 2805
                                                                                                                       // 2806
T9n.map("ru", ru);                                                                                                     // 2807
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2809
}).call(this);                                                                                                         // 2810
                                                                                                                       // 2811
                                                                                                                       // 2812
                                                                                                                       // 2813
                                                                                                                       // 2814
                                                                                                                       // 2815
                                                                                                                       // 2816
(function () {                                                                                                         // 2817
                                                                                                                       // 2818
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/sl.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var sl;                                                                                                                // 2826
                                                                                                                       // 2827
sl = {                                                                                                                 // 2828
  add: "dodaj",                                                                                                        // 2829
  and: "in",                                                                                                           // 2830
  back: "nazaj",                                                                                                       // 2831
  changePassword: "Spremeni geslo",                                                                                    // 2832
  choosePassword: "Izberi geslo",                                                                                      // 2833
  clickAgree: "S klikom na Registracija se strinjaš",                                                                  // 2834
  configure: "Nastavi",                                                                                                // 2835
  createAccount: "Nova registracija",                                                                                  // 2836
  currentPassword: "Trenutno geslo",                                                                                   // 2837
  dontHaveAnAccount: "Nisi registriran(a)?",                                                                           // 2838
  email: "Email",                                                                                                      // 2839
  emailAddress: "Email naslov",                                                                                        // 2840
  emailResetLink: "Pošlji ponastavitveno povezavo",                                                                    // 2841
  forgotPassword: "Pozabljeno geslo?",                                                                                 // 2842
  ifYouAlreadyHaveAnAccount: "Če si že registriran(a),",                                                               // 2843
  newPassword: "Novo geslo",                                                                                           // 2844
  newPasswordAgain: "Novo geslo (ponovno)",                                                                            // 2845
  optional: "Po želji",                                                                                                // 2846
  OR: "ALI",                                                                                                           // 2847
  password: "Geslo",                                                                                                   // 2848
  passwordAgain: "Geslo (ponovno)",                                                                                    // 2849
  privacyPolicy: "z našimi pogoji uporabe",                                                                            // 2850
  remove: "briši",                                                                                                     // 2851
  resetYourPassword: "Ponastavi geslo",                                                                                // 2852
  setPassword: "Nastavi geslo",                                                                                        // 2853
  sign: "Prijava",                                                                                                     // 2854
  signIn: "Prijava",                                                                                                   // 2855
  signin: "se prijavi",                                                                                                // 2856
  signOut: "Odjava",                                                                                                   // 2857
  signUp: "Registracija",                                                                                              // 2858
  signupCode: "Prijavna koda",                                                                                         // 2859
  signUpWithYourEmailAddress: "Prijava z email naslovom",                                                              // 2860
  terms: "Pogoji uporabe",                                                                                             // 2861
  updateYourPassword: "Spremeni geslo",                                                                                // 2862
  username: "Uporabniško ime",                                                                                         // 2863
  usernameOrEmail: "Uporabniško ime ali email",                                                                        // 2864
  "with": "z",                                                                                                         // 2865
  info: {                                                                                                              // 2866
    emailSent: "E-pošta poslana",                                                                                      // 2867
    emailVerified: "Email naslov preverjen",                                                                           // 2868
    passwordChanged: "Geslo spremenjeno",                                                                              // 2869
    passwordReset: "Geslo ponastavljeno"                                                                               // 2870
  },                                                                                                                   // 2871
  error: {                                                                                                             // 2872
    emailRequired: "Email je obvezen vnos.",                                                                           // 2873
    minChar: "Geslo mora imeti vsaj sedem znakov.",                                                                    // 2874
    pwdsDontMatch: "Gesli se ne ujemata",                                                                              // 2875
    pwOneDigit: "V geslu mora biti vsaj ena številka.",                                                                // 2876
    pwOneLetter: "V geslu mora biti vsaj ena črka.",                                                                   // 2877
    signInRequired: "Za to moraš biti prijavljen(a).",                                                                 // 2878
    signupCodeIncorrect: "Prijavna koda je napačna.",                                                                  // 2879
    signupCodeRequired: "Prijavna koda je obvezen vnos.",                                                              // 2880
    usernameIsEmail: "Uporabniško ime ne more biti email naslov.",                                                     // 2881
    usernameRequired: "Uporabniško ime je obvezen vnos.",                                                              // 2882
    accounts: {                                                                                                        // 2883
      "Email already exists.": "Email že obstaja.",                                                                    // 2884
      "Email doesn't match the criteria.": "Email ne odgovarja kriterijem.",                                           // 2885
      "Invalid login token": "Napačen prijavni žeton",                                                                 // 2886
      "Login forbidden": "Prijava ni dovoljena",                                                                       // 2887
      "Service unknown": "Neznana storitev",                                                                           // 2888
      "Unrecognized options for login request": "Neznane možnosti v prijavnem zahtevku",                               // 2889
      "User validation failed": "Preverjanje uporabnika neuspešno",                                                    // 2890
      "Username already exists.": "Uporabniško ime že obstaja",                                                        // 2891
      "You are not logged in.": "Nisi prijavljen(a).",                                                                 // 2892
      "You've been logged out by the server. Please log in again.": "Odjavljen(a) si s strežnika. Ponovi prijavo.",    // 2893
      "Your session has expired. Please log in again.": "Seja je potekla. Ponovi prijavo.",                            // 2894
      "No matching login attempt found": "Prijava ne obstaja",                                                         // 2895
      "Password is old. Please reset your password.": "Geslo je staro. Zamenjaj ga.",                                  // 2896
      "Incorrect password": "Napačno geslo",                                                                           // 2897
      "Invalid email": "Napačen email",                                                                                // 2898
      "Must be logged in": "Moraš biti prijavljane(a)",                                                                // 2899
      "Need to set a username or email": "Prijava ali email sta obvezna",                                              // 2900
      "old password format": "stara oblika gesla",                                                                     // 2901
      "Password may not be empty": "Geslo ne sme biti prazno",                                                         // 2902
      "Signups forbidden": "Prijave onemogočene",                                                                      // 2903
      "Token expired": "Žeton je potekel",                                                                             // 2904
      "Token has invalid email address": "Žeton vsebuje napačen email",                                                // 2905
      "User has no password set": "Uporabnik nima gesla",                                                              // 2906
      "User not found": "Uporabnik ne obstaja",                                                                        // 2907
      "Verify email link expired": "Povezava za potrditev je potekla",                                                 // 2908
      "Verify email link is for unknown address": "Povezava za potrditev vsebuje neznan naslov",                       // 2909
      "Match failed": "Prijava neuspešna",                                                                             // 2910
      "Unknown error": "Neznana napaka"                                                                                // 2911
    }                                                                                                                  // 2912
  }                                                                                                                    // 2913
};                                                                                                                     // 2914
                                                                                                                       // 2915
T9n.map("sl", sl);                                                                                                     // 2916
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 2918
}).call(this);                                                                                                         // 2919
                                                                                                                       // 2920
                                                                                                                       // 2921
                                                                                                                       // 2922
                                                                                                                       // 2923
                                                                                                                       // 2924
                                                                                                                       // 2925
(function () {                                                                                                         // 2926
                                                                                                                       // 2927
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/sv.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var sv;                                                                                                                // 2935
                                                                                                                       // 2936
sv = {                                                                                                                 // 2937
  add: "lägg till",                                                                                                    // 2938
  and: "och",                                                                                                          // 2939
  back: "tillbaka",                                                                                                    // 2940
  changePassword: "Ändra lösenord",                                                                                    // 2941
  choosePassword: "Välj lösenord",                                                                                     // 2942
  clickAgree: "När du väljer att skapa ett konto så godkänner du också vår",                                           // 2943
  configure: "Konfigurera",                                                                                            // 2944
  createAccount: "Skapa ett konto",                                                                                    // 2945
  currentPassword: "Nuvarande lösenord",                                                                               // 2946
  dontHaveAnAccount: "Har du inget konto?",                                                                            // 2947
  email: "E-postadress",                                                                                               // 2948
  emailAddress: "E-postadress",                                                                                        // 2949
  emailResetLink: "Återställningslänk för e-post",                                                                     // 2950
  forgotPassword: "Glömt ditt lösenord?",                                                                              // 2951
  ifYouAlreadyHaveAnAccount: "Om du redan har ett konto",                                                              // 2952
  newPassword: "Nytt lösenord",                                                                                        // 2953
  newPasswordAgain: "Nytt lösenord (upprepa)",                                                                         // 2954
  optional: "Valfri",                                                                                                  // 2955
  OR: "ELLER",                                                                                                         // 2956
  password: "Lösenord",                                                                                                // 2957
  passwordAgain: "Lösenord (upprepa)",                                                                                 // 2958
  privacyPolicy: "integritetspolicy",                                                                                  // 2959
  remove: "ta bort",                                                                                                   // 2960
  resetYourPassword: "Återställ ditt lösenord",                                                                        // 2961
  setPassword: "Välj lösenord",                                                                                        // 2962
  sign: "Logga",                                                                                                       // 2963
  signIn: "Logga in",                                                                                                  // 2964
  signin: "logga in",                                                                                                  // 2965
  signOut: "Logga ut",                                                                                                 // 2966
  signUp: "Skapa konto",                                                                                               // 2967
  signupCode: "Registreringskod",                                                                                      // 2968
  signUpWithYourEmailAddress: "Skapa ett konto med din e-postadress",                                                  // 2969
  terms: "användarvillkor",                                                                                            // 2970
  updateYourPassword: "Uppdatera ditt lösenord",                                                                       // 2971
  username: "Användarnamn",                                                                                            // 2972
  usernameOrEmail: "Användarnamn eller e-postadress",                                                                  // 2973
  "with": "med",                                                                                                       // 2974
  info: {                                                                                                              // 2975
    emailSent: "E-post skickades",                                                                                     // 2976
    emailVerified: "E-post verifierades",                                                                              // 2977
    passwordChanged: "Lösenordet har ändrats",                                                                         // 2978
    passwordReset: "Återställ lösenordet"                                                                              // 2979
  },                                                                                                                   // 2980
  error: {                                                                                                             // 2981
    emailRequired: "Det krävs en e-postaddress.",                                                                      // 2982
    minChar: "Det krävs minst 7 tecken i ditt lösenord.",                                                              // 2983
    pwdsDontMatch: "Lösenorden matchar inte.",                                                                         // 2984
    pwOneDigit: "Lösenordet måste ha minst 1 siffra.",                                                                 // 2985
    pwOneLetter: "Lösenordet måste ha minst 1 bokstav.",                                                               // 2986
    signInRequired: "Inloggning krävs här.",                                                                           // 2987
    signupCodeIncorrect: "Registreringskoden är felaktig.",                                                            // 2988
    signupCodeRequired: "Det krävs en registreringskod.",                                                              // 2989
    usernameIsEmail: "Användarnamnet kan inte vara en e-postadress.",                                                  // 2990
    usernameRequired: "Det krävs ett användarnamn.",                                                                   // 2991
    accounts: {                                                                                                        // 2992
      "Email already exists.": "E-postadressen finns redan.",                                                          // 2993
      "Email doesn't match the criteria.": "E-postadressen uppfyller inte kriterierna.",                               // 2994
      "Invalid login token": "Felaktig login-token",                                                                   // 2995
      "Login forbidden": "Inloggning tillåts ej",                                                                      // 2996
      "Service unknown": "Okänd service",                                                                              // 2997
      "Unrecognized options for login request": "Okända val för inloggningsförsöket",                                  // 2998
      "User validation failed": "Validering av användare misslyckades",                                                // 2999
      "Username already exists.": "Användarnamn finns redan.",                                                         // 3000
      "You are not logged in.": "Du är inte inloggad.",                                                                // 3001
      "You've been logged out by the server. Please log in again.": "Du har loggats ut av servern. Vänligen logga in igen.",
      "Your session has expired. Please log in again.": "Din session har gått ut. Vänligen ligga in igen.",            // 3003
      "No matching login attempt found": "Inget matchande loginförsök kunde hittas",                                   // 3004
      "Password is old. Please reset your password.": "Ditt lösenord är gammalt. Vänligen återställ ditt lösenord.",   // 3005
      "Incorrect password": "Felaktigt lösenord",                                                                      // 3006
      "Invalid email": "Ogiltig e-postadress",                                                                         // 3007
      "Must be logged in": "Måste vara inloggad",                                                                      // 3008
      "Need to set a username or email": "Ett användarnamn eller en e-postadress krävs.",                              // 3009
      "old password format": "gammalt lösenordsformat",                                                                // 3010
      "Password may not be empty": "Lösenordet får inte vara tomt",                                                    // 3011
      "Signups forbidden": "Registrering förbjuden",                                                                   // 3012
      "Token expired": "Token har gått ut",                                                                            // 3013
      "Token has invalid email address": "Token har ogiltig e-postadress",                                             // 3014
      "User has no password set": "Användaren har inget lösenord",                                                     // 3015
      "User not found": "Användaren hittades inte",                                                                    // 3016
      "Verify email link expired": "Länken för att verifera e-postadress har gått ut",                                 // 3017
      "Verify email link is for unknown address": "Länken för att verifiera e-postadress är för en okänd adress.",     // 3018
      "Match failed": "Matchning misslyckades",                                                                        // 3019
      "Unknown error": "Okänt fel"                                                                                     // 3020
    }                                                                                                                  // 3021
  }                                                                                                                    // 3022
};                                                                                                                     // 3023
                                                                                                                       // 3024
T9n.map("sv", sv);                                                                                                     // 3025
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 3027
}).call(this);                                                                                                         // 3028
                                                                                                                       // 3029
                                                                                                                       // 3030
                                                                                                                       // 3031
                                                                                                                       // 3032
                                                                                                                       // 3033
                                                                                                                       // 3034
(function () {                                                                                                         // 3035
                                                                                                                       // 3036
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/tr.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var tr;                                                                                                                // 3044
                                                                                                                       // 3045
tr = {                                                                                                                 // 3046
  add: "ekle",                                                                                                         // 3047
  and: "ve",                                                                                                           // 3048
  back: "geri",                                                                                                        // 3049
  changePassword: "Şifre Değiştir",                                                                                    // 3050
  choosePassword: "Şifre Belirle",                                                                                     // 3051
  clickAgree: "Kayıta tıklayarak kabul etmiş olacağınız",                                                              // 3052
  configure: "Yapılandır",                                                                                             // 3053
  createAccount: "Hesap Oluştur",                                                                                      // 3054
  currentPassword: "Mevcut Şifre",                                                                                     // 3055
  dontHaveAnAccount: "Hesabın yok mu?",                                                                                // 3056
  email: "Eposta",                                                                                                     // 3057
  emailAddress: "Eposta Adresi",                                                                                       // 3058
  emailResetLink: "Email Reset Link",                                                                                  // 3059
  forgotPassword: "Şifreni mi unuttun?",                                                                               // 3060
  ifYouAlreadyHaveAnAccount: "Zaten bir hesabın varsa",                                                                // 3061
  newPassword: "Yeni Şifre",                                                                                           // 3062
  newPasswordAgain: "Yeni Şifre (tekrar)",                                                                             // 3063
  optional: "İsteğe Bağlı",                                                                                            // 3064
  OR: "VEYA",                                                                                                          // 3065
  password: "Şifre",                                                                                                   // 3066
  passwordAgain: "Şifre (tekrar)",                                                                                     // 3067
  privacyPolicy: "Gizlilik Politikası",                                                                                // 3068
  remove: "kaldır",                                                                                                    // 3069
  resetYourPassword: "Şifreni sıfırla",                                                                                // 3070
  setPassword: "Şifre Belirle",                                                                                        // 3071
  sign: "Giriş",                                                                                                       // 3072
  signIn: "Giriş",                                                                                                     // 3073
  signin: "Giriş",                                                                                                     // 3074
  signOut: "Çıkış",                                                                                                    // 3075
  signUp: "Kayıt",                                                                                                     // 3076
  signupCode: "Kayıt Kodu",                                                                                            // 3077
  signUpWithYourEmailAddress: "Eposta adresin ile kaydol",                                                             // 3078
  terms: "Kullanım Şartları",                                                                                          // 3079
  updateYourPassword: "Şifreni güncelle",                                                                              // 3080
  username: "Kullanıcı adı",                                                                                           // 3081
  usernameOrEmail: "Kullanıcı adı veya şifre",                                                                         // 3082
  "with": "için",                                                                                                      // 3083
  info: {                                                                                                              // 3084
    emailSent: "Eposta iletildi",                                                                                      // 3085
    emailVerified: "Eposta doğrulandı",                                                                                // 3086
    passwordChanged: "Şifre değişti",                                                                                  // 3087
    passwordReset: "Şifre sıfırlandı"                                                                                  // 3088
  },                                                                                                                   // 3089
  error: {                                                                                                             // 3090
    emailRequired: "Eposta gerekli.",                                                                                  // 3091
    minChar: "En az 7 karakterli şifre.",                                                                              // 3092
    pwdsDontMatch: "Şifreler uyuşmuyor",                                                                               // 3093
    pwOneDigit: "Şifre en az bir rakam içermeli.",                                                                     // 3094
    pwOneLetter: "Şifre bir harf gerektiriyor.",                                                                       // 3095
    signInRequired: "Bunun için önce giriş yapmış olmalısın.",                                                         // 3096
    signupCodeIncorrect: "Kayıt kodu hatalı.",                                                                         // 3097
    signupCodeRequired: "Kayıt kodu gerekli.",                                                                         // 3098
    usernameIsEmail: "Kullanıcı adı bir eposta adresi olamaz.",                                                        // 3099
    usernameRequired: "Kullanıcı adı gerekli.",                                                                        // 3100
    accounts: {                                                                                                        // 3101
      "Email already exists.": "Eposta zaten kayıtlı.",                                                                // 3102
      "Email doesn't match the criteria.": "Eposta kriterleri karşılamıyor.",                                          // 3103
      "Invalid login token": "Geçersiz giriş işaretçisi",                                                              // 3104
      "Login forbidden": "Girişe izin verilmiyor",                                                                     // 3105
      "Service unknown": "Servis tanınmıyor",                                                                          // 3106
      "Unrecognized options for login request": "Giriş isteği için tanınmayan seçenekler",                             // 3107
      "User validation failed": "Kullanıcı doğrulama başarısız",                                                       // 3108
      "Username already exists.": "Kullanıcı adı zaten kayıtlı.",                                                      // 3109
      "You are not logged in.": "Kullanıcı girişi yapmadın.",                                                          // 3110
      "You've been logged out by the server. Please log in again.": "Sunucu tarafından çıkarıldın. Lütfen tekrar kullanıcı girişi yap.",
      "Your session has expired. Please log in again.": "Oturumun zaman aşımına uğradı. Lütfen tekrar kullanıcı girişi yap.",
      "No matching login attempt found": "Eşleşen bir giriş teşebbüsü bulunamadı",                                     // 3113
      "Password is old. Please reset your password.": "Şifre eski. Lütfen şifreni sıfırla.",                           // 3114
      "Incorrect password": "Hatalı şifre",                                                                            // 3115
      "Invalid email": "Hatalı eposta",                                                                                // 3116
      "Must be logged in": "Giriş yapmış olmalısın",                                                                   // 3117
      "Need to set a username or email": "Kullanıcı adı veya eposta tanımlamalısın",                                   // 3118
      "old password format": "eski şifre biçimi",                                                                      // 3119
      "Password may not be empty": "Şifre boş bırakılamaz",                                                            // 3120
      "Signups forbidden": "Kayıt yapmaya izin verilmiyor",                                                            // 3121
      "Token expired": "İşaretçinin süresi geçti",                                                                     // 3122
      "Token has invalid email address": "İşaretçide geçersiz eposta adresi var",                                      // 3123
      "User has no password set": "Kullanıcının şifresi tanımlanmamış",                                                // 3124
      "User not found": "Kullanıcı bulunamadı",                                                                        // 3125
      "Verify email link expired": "Eposta doğrulama bağlantısı zaman aşımına uğradı",                                 // 3126
      "Verify email link is for unknown address": "Eposta doğrulama bağlantısı bilinmeyen bir adres içeriyor",         // 3127
      "Match failed": "Eşleşme başarısız",                                                                             // 3128
      "Unknown error": "Bilinmeyen hata"                                                                               // 3129
    }                                                                                                                  // 3130
  }                                                                                                                    // 3131
};                                                                                                                     // 3132
                                                                                                                       // 3133
T9n.map("tr", tr);                                                                                                     // 3134
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 3136
}).call(this);                                                                                                         // 3137
                                                                                                                       // 3138
                                                                                                                       // 3139
                                                                                                                       // 3140
                                                                                                                       // 3141
                                                                                                                       // 3142
                                                                                                                       // 3143
(function () {                                                                                                         // 3144
                                                                                                                       // 3145
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/uk.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var uk;                                                                                                                // 3153
                                                                                                                       // 3154
uk = {                                                                                                                 // 3155
  add: "додати",                                                                                                       // 3156
  and: "та",                                                                                                           // 3157
  back: "назад",                                                                                                       // 3158
  changePassword: "Змінити пароль",                                                                                    // 3159
  choosePassword: "Придумайте пароль",                                                                                 // 3160
  clickAgree: "Натиснувши на Реєстрація ви погоджуєтеся з умовами",                                                    // 3161
  configure: "Налаштувати",                                                                                            // 3162
  createAccount: "Створити аккаунт",                                                                                   // 3163
  currentPassword: "Діючий пароль",                                                                                    // 3164
  dontHaveAnAccount: "Немає аккаунта?",                                                                                // 3165
  email: "Email",                                                                                                      // 3166
  emailAddress: "Email",                                                                                               // 3167
  emailResetLink: "Отримати посилання для оновлення паролю",                                                           // 3168
  forgotPassword: "Забули пароль?",                                                                                    // 3169
  ifYouAlreadyHaveAnAccount: "Якщо у вас вже є аккаунт:",                                                              // 3170
  newPassword: "Новий пароль",                                                                                         // 3171
  newPasswordAgain: "Новий пароль (ще раз)",                                                                           // 3172
  optional: "Необов’язково",                                                                                           // 3173
  OR: "АБО",                                                                                                           // 3174
  password: "Пароль",                                                                                                  // 3175
  passwordAgain: "Пароль (ще раз)",                                                                                    // 3176
  privacyPolicy: "Політики безпеки",                                                                                   // 3177
  remove: "Видалити",                                                                                                  // 3178
  resetYourPassword: "Відновити пароль",                                                                               // 3179
  setPassword: "Встановити пароль",                                                                                    // 3180
  sign: "Підпис",                                                                                                      // 3181
  signIn: "Увійти",                                                                                                    // 3182
  signin: "увійти",                                                                                                    // 3183
  signOut: "Вийти",                                                                                                    // 3184
  signUp: "Зареєструватися",                                                                                           // 3185
  signupCode: "Реєстраційний код",                                                                                     // 3186
  signUpWithYourEmailAddress: "Зареєструйтесь з вашою email адресою",                                                  // 3187
  terms: "Умовами користування",                                                                                       // 3188
  updateYourPassword: "Оновити пароль",                                                                                // 3189
  username: "Ім’я користувача",                                                                                        // 3190
  usernameOrEmail: "Ім’я користувача або email",                                                                       // 3191
  "with": "з",                                                                                                         // 3192
  info: {                                                                                                              // 3193
    emailSent: "Email відправлено",                                                                                    // 3194
    emailVerified: "Email пройшов перевірку",                                                                          // 3195
    passwordChanged: "Пароль змінено",                                                                                 // 3196
    passwordReset: "Пароль скинуто"                                                                                    // 3197
  },                                                                                                                   // 3198
  error: {                                                                                                             // 3199
    emailRequired: "Email є обов’язковим.",                                                                            // 3200
    minChar: "Мінімальна кіл-ть символів для паролю 7.",                                                               // 3201
    pwdsDontMatch: "Паролі не співпадають",                                                                            // 3202
    pwOneDigit: "Пароль повинен містити хоча б одну цифру.",                                                           // 3203
    pwOneLetter: "Пароль повинен містити хоча б одну букву.",                                                          // 3204
    signInRequired: "Для продовження необхідно увійти.",                                                               // 3205
    signupCodeIncorrect: "Невірний реєстраційний код.",                                                                // 3206
    signupCodeRequired: "Необхідний реєстраційний код.",                                                               // 3207
    usernameIsEmail: "Ім’я користувача не може бути email адресою.",                                                   // 3208
    usernameRequired: "Ім’я користувача є обов’язковим.",                                                              // 3209
    accounts: {                                                                                                        // 3210
      "Email already exists.": "Email вже існує",                                                                      // 3211
      "Email doesn't match the criteria.": "Email відповідає критеріям.",                                              // 3212
      "Invalid login token": "Невірний токен для входу",                                                               // 3213
      "Login forbidden": "Вхід заборонено",                                                                            // 3214
      "Service unknown": "Невідомий сервіс",                                                                           // 3215
      "Unrecognized options for login request": "Невідомі параметри для запиту входу",                                 // 3216
      "User validation failed": "Перевірка користувача не вдалася",                                                    // 3217
      "Username already exists.": "Користувач існує.",                                                                 // 3218
      "You are not logged in.": "Ви не ввійшли.",                                                                      // 3219
      "You've been logged out by the server. Please log in again.": "Сервер ініціював вихід. Будь ласка увійдіть ще раз.",
      "Your session has expired. Please log in again.": "Ваша сесія застаріла. Будь ласка увійдіть ще раз.",           // 3221
      "No matching login attempt found": "Не було знайдено відповідної спроби увійти",                                 // 3222
      "Password is old. Please reset your password.": "Пароль застарів. Будь ласка, скиньте Ваш пароль.",              // 3223
      "Incorrect password": "Невірний пароль",                                                                         // 3224
      "Invalid email": "Неіснуючий Email",                                                                             // 3225
      "Must be logged in": "Необхідно увійти",                                                                         // 3226
      "Need to set a username or email": "Необхідно ім’я користувача або email",                                       // 3227
      "old password format": "старий формат паролю",                                                                   // 3228
      "Password may not be empty": "Пароль не може бути пустим",                                                       // 3229
      "Signups forbidden": "Реєстрацію відключено",                                                                    // 3230
      "Token expired": "Час дії токена вичерпано",                                                                     // 3231
      "Token has invalid email address": "Невірна email адреса для токена",                                            // 3232
      "User has no password set": "У користувача не встановлено пароль",                                               // 3233
      "User not found": "Користувач не знайдений",                                                                     // 3234
      "Verify email link expired": "Посилання підтвердження email застаріло",                                          // 3235
      "Verify email link is for unknown address": "Посилання підтвердження email для невідомої адреси",                // 3236
      "Match failed": "Не співпадають",                                                                                // 3237
      "Unknown error": "Невідома помилка"                                                                              // 3238
    }                                                                                                                  // 3239
  }                                                                                                                    // 3240
};                                                                                                                     // 3241
                                                                                                                       // 3242
T9n.map("uk", uk);                                                                                                     // 3243
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 3245
}).call(this);                                                                                                         // 3246
                                                                                                                       // 3247
                                                                                                                       // 3248
                                                                                                                       // 3249
                                                                                                                       // 3250
                                                                                                                       // 3251
                                                                                                                       // 3252
(function () {                                                                                                         // 3253
                                                                                                                       // 3254
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/vi.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var vi;                                                                                                                // 3262
                                                                                                                       // 3263
vi = {                                                                                                                 // 3264
  add: "thêm",                                                                                                         // 3265
  and: "và",                                                                                                           // 3266
  back: "trở lại",                                                                                                     // 3267
  changePassword: "Đổi mật khẩu",                                                                                      // 3268
  choosePassword: "Chọn một mật khẩu",                                                                                 // 3269
  clickAgree: "Bằng cách nhấn vào Đăng ký, bạn đã đồng ý với",                                                         // 3270
  configure: "Cấu hình",                                                                                               // 3271
  createAccount: "Tạo Tài khoản",                                                                                      // 3272
  currentPassword: "Mật khẩu hiện tại",                                                                                // 3273
  dontHaveAnAccount: "Chưa có tài khoản?",                                                                             // 3274
  email: "Email",                                                                                                      // 3275
  emailAddress: "Địa chỉ Email",                                                                                       // 3276
  emailResetLink: "Gửi",                                                                                               // 3277
  forgotPassword: "Quên mật khẩu?",                                                                                    // 3278
  ifYouAlreadyHaveAnAccount: "Nếu bạn đã có tài khoản",                                                                // 3279
  newPassword: "Mật khẩu mới",                                                                                         // 3280
  newPasswordAgain: "Mật khẩu mới (nhập lại)",                                                                         // 3281
  optional: "Tùy chọn",                                                                                                // 3282
  OR: "Hoặc",                                                                                                          // 3283
  password: "Mật khẩu",                                                                                                // 3284
  passwordAgain: "Mật khẩu (nhập lại)",                                                                                // 3285
  privacyPolicy: "Chính sách bảo mật",                                                                                 // 3286
  remove: "xóa",                                                                                                       // 3287
  resetYourPassword: "Lấy lại mật khẩu",                                                                               // 3288
  setPassword: "Thiết lập mật khẩu",                                                                                   // 3289
  sign: "Ký",                                                                                                          // 3290
  signIn: "Đăng nhập",                                                                                                 // 3291
  signin: "đăng nhập",                                                                                                 // 3292
  signOut: "Đăng xuất",                                                                                                // 3293
  signUp: "Đăng ký",                                                                                                   // 3294
  signupCode: "Mã đăng ký",                                                                                            // 3295
  signUpWithYourEmailAddress: "Đăng ký với email của bạn",                                                             // 3296
  terms: "Điều khoản sử dụng",                                                                                         // 3297
  updateYourPassword: "Cập nhật mật khẩu",                                                                             // 3298
  username: "Tên đăng nhập",                                                                                           // 3299
  usernameOrEmail: "Tên đăng nhập hoặc email",                                                                         // 3300
  "with": "với",                                                                                                       // 3301
  info: {                                                                                                              // 3302
    emailSent: "Email đã được gửi đi!",                                                                                // 3303
    emailVerified: "Email đã được xác minh",                                                                           // 3304
    passwordChanged: "Đã đổi mật khẩu",                                                                                // 3305
    passwordReset: "Lất lại mật khẩu"                                                                                  // 3306
  },                                                                                                                   // 3307
  error: {                                                                                                             // 3308
    emailRequired: "Email phải có.",                                                                                   // 3309
    minChar: "Mật khẩu phải có ít nhất 7 ký tự.",                                                                      // 3310
    pwdsDontMatch: "Mật khẩu không giống nhau",                                                                        // 3311
    pwOneDigit: "Mật khẩu phải có ít nhất 1 chữ số.",                                                                  // 3312
    pwOneLetter: "Mật khẩu phải có 1 ký tự chữ.",                                                                      // 3313
    signInRequired: "Phải đăng nhập.",                                                                                 // 3314
    signupCodeIncorrect: "Mã số đăng ký sai.",                                                                         // 3315
    signupCodeRequired: "Phải có mã số đăng ký.",                                                                      // 3316
    usernameIsEmail: "Tên đăng nhập không thể là địa chỉ email.",                                                      // 3317
    usernameRequired: "Phải có tên đăng nhập.",                                                                        // 3318
    accounts: {                                                                                                        // 3319
      "A login handler should return a result or undefined": "Bộ xử lý đăng nhập phải trả về một kết quả hoặc undefined",
      "Email already exists.": "Email đã tồn tại.",                                                                    // 3321
      "Email doesn't match the criteria.": "Email không phù hợp.",                                                     // 3322
      "Invalid login token": "Mã đăng nhập không đúng",                                                                // 3323
      "Login forbidden": "Đăng nhập bị cấm",                                                                           // 3324
      "Service unknown": "Chưa biết Dịch vụ",                                                                          // 3325
      "Unrecognized options for login request": "Tùy chọn không được công nhận đối với yêu cầu đăng nhập",             // 3326
      "User validation failed": "Xác nhận người dùng thất bại",                                                        // 3327
      "Username already exists.": "Tên đăng nhập đã tồn tại.",                                                         // 3328
      "You are not logged in.": "Bạn chưa đăng nhập.",                                                                 // 3329
      "You've been logged out by the server. Please log in again.": "Bạn đã bị đăng xuất bởi máy chủ. Vui lòng đăng nhập lại.",
      "Your session has expired. Please log in again.": "Thời gian đăng nhập đã hết. Vui lòng đăng nhập lại.",         // 3331
      "No matching login attempt found": "Không tìm thấy đăng nhập phù hợp",                                           // 3332
      "Password is old. Please reset your password.": "Mật khẩu đã cũ. Vui lòng lấy lại mật khẩu.",                    // 3333
      "Incorrect password": "Mật khẩu sai",                                                                            // 3334
      "Invalid email": "Email sai",                                                                                    // 3335
      "Must be logged in": "Phải đăng nhập",                                                                           // 3336
      "Need to set a username or email": "Phải điền tên đăng nhập hoặc email",                                         // 3337
      "old password format": "định dạng mật khẩu cũ",                                                                  // 3338
      "Password may not be empty": "mật khẩu không được để trống",                                                     // 3339
      "Signups forbidden": "Đăng ký đã bị cấm",                                                                        // 3340
      "Token expired": "Hết phiên đăng nhập",                                                                          // 3341
      "Token has invalid email address": "Phiên đăng nhập chứa địa chỉ email sai",                                     // 3342
      "User has no password set": "Người dùng chưa có mật khẩu",                                                       // 3343
      "User not found": "Không tìm thấy người dùng",                                                                   // 3344
      "Verify email link expired": "Đường dẫn xác nhận email đã hết hạn",                                              // 3345
      "Verify email link is for unknown address": "Đường dẫn xác nhận email là cho địa chỉ chưa xác định",             // 3346
      "Match failed": "Không đúng",                                                                                    // 3347
      "Unknown error": "Lỗi chưa được biết"                                                                            // 3348
    }                                                                                                                  // 3349
  }                                                                                                                    // 3350
};                                                                                                                     // 3351
                                                                                                                       // 3352
T9n.map("vi", vi);                                                                                                     // 3353
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 3355
}).call(this);                                                                                                         // 3356
                                                                                                                       // 3357
                                                                                                                       // 3358
                                                                                                                       // 3359
                                                                                                                       // 3360
                                                                                                                       // 3361
                                                                                                                       // 3362
(function () {                                                                                                         // 3363
                                                                                                                       // 3364
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/no_NB.coffee.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var no_NB;                                                                                                             // 3372
                                                                                                                       // 3373
no_NB = {                                                                                                              // 3374
  add: "legg til",                                                                                                     // 3375
  and: "og",                                                                                                           // 3376
  back: "tilbake",                                                                                                     // 3377
  changePassword: "Bytt passord",                                                                                      // 3378
  choosePassword: "Velg passord",                                                                                      // 3379
  clickAgree: "Ved å klikke meld på godtar du vår",                                                                    // 3380
  configure: "Konfigurer",                                                                                             // 3381
  createAccount: "Oprett konto",                                                                                       // 3382
  currentPassword: "Nåværende passord",                                                                                // 3383
  dontHaveAnAccount: "Har du ikke en konto?",                                                                          // 3384
  email: "E-post",                                                                                                     // 3385
  emailAddress: "E-postadresse",                                                                                       // 3386
  emailResetLink: "Epost nullstillingslenke",                                                                          // 3387
  forgotPassword: "Glemt passord?",                                                                                    // 3388
  ifYouAlreadyHaveAnAccount: "Hvis du allerede har en konto",                                                          // 3389
  newPassword: "Nytt passord",                                                                                         // 3390
  newPasswordAgain: "Gjengi nytt passord",                                                                             // 3391
  optional: "Frivillig",                                                                                               // 3392
  OR: "eller",                                                                                                         // 3393
  password: "Passord",                                                                                                 // 3394
  passwordAgain: "Gjengi passord",                                                                                     // 3395
  privacyPolicy: "Personvern",                                                                                         // 3396
  remove: "fjern",                                                                                                     // 3397
  resetYourPassword: "Nullstill passord",                                                                              // 3398
  setPassword: "Sett passord",                                                                                         // 3399
  sign: "Logg",                                                                                                        // 3400
  signIn: "Logg inn",                                                                                                  // 3401
  signin: "Logg inn",                                                                                                  // 3402
  signOut: "Logg ut",                                                                                                  // 3403
  signUp: "Meld på",                                                                                                   // 3404
  signupCode: "Påmeldingskode",                                                                                        // 3405
  signUpWithYourEmailAddress: "Meld på med din e-postadresse",                                                         // 3406
  terms: "Betingelser for bruk",                                                                                       // 3407
  updateYourPassword: "Oppdater passord",                                                                              // 3408
  username: "Brukernavn",                                                                                              // 3409
  usernameOrEmail: "Brukernavn eller e-epost",                                                                         // 3410
  "with": "med",                                                                                                       // 3411
  info: {                                                                                                              // 3412
    emailSent: "E-post sendt",                                                                                         // 3413
    emailVerified: "E-post bekreftet",                                                                                 // 3414
    passwordChanged: "Passord endret",                                                                                 // 3415
    passwordReset: "Passord nullstillt"                                                                                // 3416
  },                                                                                                                   // 3417
  error: {                                                                                                             // 3418
    emailRequired: "E-post obligatorisk.",                                                                             // 3419
    minChar: "Passordet må ha minst 7 tegn.",                                                                          // 3420
    pwdsDontMatch: "Passordene er ikke like.",                                                                         // 3421
    pwOneDigit: "Passordet må ha minst ett tall.",                                                                     // 3422
    pwOneLetter: "Passordet må ha minst en bokstav.",                                                                  // 3423
    signInRequired: "Du må være logget inn for å gjøre dette.",                                                        // 3424
    signupCodeIncorrect: "Påmelding gikk galt.",                                                                       // 3425
    signupCodeRequired: "Påmeldingskode kreves.",                                                                      // 3426
    usernameIsEmail: "Brukernavn kan ikke være en e-postadresse.",                                                     // 3427
    usernameRequired: "Brukernavn må utfylles.",                                                                       // 3428
    accounts: {                                                                                                        // 3429
      "Email already exists.": "E-postadressen finnes allerede.",                                                      // 3430
      "Email doesn't match the criteria.": "E-postadressen møter ikke kriteriet.",                                     // 3431
      "Invalid login token": "Ugyldig innloggingstegn",                                                                // 3432
      "Login forbidden": "Innlogging forbudt",                                                                         // 3433
      "Service unknown": "Ukjent tjeneste",                                                                            // 3434
      "Unrecognized options for login request": "Ukjendte valg ved innloggingsforsøk",                                 // 3435
      "User validation failed": "Brukergodkjenning gikk galt",                                                         // 3436
      "Username already exists.": "Brukernavnet finnes allerede.",                                                     // 3437
      "You are not logged in.": "Du er ikke logget inn.",                                                              // 3438
      "You've been logged out by the server. Please log in again.": "Tjeneren loggt deg ut. Logg inn på ny.",          // 3439
      "Your session has expired. Please log in again.": "Din økt er utløpt. Logg inn på ny.",                          // 3440
      "No matching login attempt found": "Fant ingen samsvarende innloggingsførsøk",                                   // 3441
      "Password is old. Please reset your password.": "Passordet er for gammelt. Nullstill passordet ditt.",           // 3442
      "Incorrect password": "Feil passord",                                                                            // 3443
      "Invalid email": "Ugyldig e-postadresse",                                                                        // 3444
      "Must be logged in": "Du må være innlogget",                                                                     // 3445
      "Need to set a username or email": "Oppgi brukernavn eller e-postadresse",                                       // 3446
      "old password format": "gammelt passordformat",                                                                  // 3447
      "Password may not be empty": "Passord må være utfyllt",                                                          // 3448
      "Signups forbidden": "Påmeldinger ikke tillatt",                                                                 // 3449
      "Token expired": "Økten er utløpt",                                                                              // 3450
      "Token has invalid email address": "Innloggingstegnet har ugyldig e-postadresse",                                // 3451
      "User has no password set": "Brukeren har ikke angitt passord",                                                  // 3452
      "User not found": "Bruker ikke funnet",                                                                          // 3453
      "Verify email link expired": "Lenke for e-postbekreftelse er utløpt",                                            // 3454
      "Verify email link is for unknown address": "Lenke for e-postbekreftelse er for en ukjent adresse",              // 3455
      "Match failed": "Ikke samsvar",                                                                                  // 3456
      "Unknown error": "Ukjent feil"                                                                                   // 3457
    }                                                                                                                  // 3458
  }                                                                                                                    // 3459
};                                                                                                                     // 3460
                                                                                                                       // 3461
T9n.map("no_NB", no_NB);                                                                                               // 3462
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 3464
}).call(this);                                                                                                         // 3465
                                                                                                                       // 3466
                                                                                                                       // 3467
                                                                                                                       // 3468
                                                                                                                       // 3469
                                                                                                                       // 3470
                                                                                                                       // 3471
(function () {                                                                                                         // 3472
                                                                                                                       // 3473
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/nl.coffee.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var nl;                                                                                                                // 3481
                                                                                                                       // 3482
nl = {                                                                                                                 // 3483
  add: "toevoegen",                                                                                                    // 3484
  and: "en",                                                                                                           // 3485
  back: "terug",                                                                                                       // 3486
  changePassword: "Wachtwoord wijzigen",                                                                               // 3487
  choosePassword: "Wachtwoord kiezen",                                                                                 // 3488
  clickAgree: "Door te registreren accepteer je onze",                                                                 // 3489
  configure: "Configureer",                                                                                            // 3490
  createAccount: "Account aanmaken",                                                                                   // 3491
  currentPassword: "Huidige wachtwoord",                                                                               // 3492
  dontHaveAnAccount: "Nog geen account?",                                                                              // 3493
  email: "E-mail",                                                                                                     // 3494
  emailAddress: "E-mailadres",                                                                                         // 3495
  emailResetLink: "Verzenden",                                                                                         // 3496
  forgotPassword: "Wachtwoord vergeten?",                                                                              // 3497
  ifYouAlreadyHaveAnAccount: "Heb je al een account?",                                                                 // 3498
  newPassword: "Nieuwe wachtwoord",                                                                                    // 3499
  newPasswordAgain: "Nieuwe wachtwoord (herhalen)",                                                                    // 3500
  optional: "Optioneel",                                                                                               // 3501
  OR: "OF",                                                                                                            // 3502
  password: "Wachtwoord",                                                                                              // 3503
  passwordAgain: "Wachtwoord (herhalen)",                                                                              // 3504
  privacyPolicy: "privacyverklaring",                                                                                  // 3505
  remove: "verwijderen",                                                                                               // 3506
  resetYourPassword: "Wachtwoord resetten",                                                                            // 3507
  setPassword: "Wachtwoord instellen",                                                                                 // 3508
  sign: "Aanmelden",                                                                                                   // 3509
  signIn: "Aanmelden",                                                                                                 // 3510
  signin: "aanmelden",                                                                                                 // 3511
  signOut: "Afmelden",                                                                                                 // 3512
  signUp: "Registreren",                                                                                               // 3513
  signupCode: "Registratiecode",                                                                                       // 3514
  signUpWithYourEmailAddress: "Met e-mailadres registreren",                                                           // 3515
  terms: "gebruiksvoorwaarden",                                                                                        // 3516
  updateYourPassword: "Wachtwoord veranderen",                                                                         // 3517
  username: "Gebruikersnaam",                                                                                          // 3518
  usernameOrEmail: "Gebruikersnaam of e-mailadres",                                                                    // 3519
  "with": "met",                                                                                                       // 3520
  info: {                                                                                                              // 3521
    emailSent: "E-mail verzonden",                                                                                     // 3522
    emailVerified: "E-mail geverifieerd",                                                                              // 3523
    PasswordChanged: "Wachtwoord gewijzigd",                                                                           // 3524
    PasswordReset: "Wachtwoord gereset"                                                                                // 3525
  },                                                                                                                   // 3526
  error: {                                                                                                             // 3527
    emailRequired: "E-mailadres is verplicht",                                                                         // 3528
    minChar: "Wachtwoord moet tenminste 7 tekens lang zijn.",                                                          // 3529
    pwdsDontMatch: "Wachtwoorden zijn niet gelijk.",                                                                   // 3530
    pwOneDigit: "Wachtwoord moet tenminste 1 cijfer bevatten.",                                                        // 3531
    pwOneLetter: "Wachtwoord moet tenminste 1 letter bevatten.",                                                       // 3532
    signInRequired: "Je moet aangemeld zijn.",                                                                         // 3533
    signupCodeIncorrect: "Registratiecode is ongeldig.",                                                               // 3534
    signupCodeRequired: "Registratiecode is verplicht.",                                                               // 3535
    usernameIsEmail: "Gebruikersnaam is gelijk aan e-mail.",                                                           // 3536
    usernameRequired: "Gebruikersnaam is verplicht.",                                                                  // 3537
    accounts: {                                                                                                        // 3538
      "Email already exists.": "Dit e-mailadres is al in gebruik.",                                                    // 3539
      "Email doesn't match the criteria.": "e-mail voldoet niet aan de voorwaarden.",                                  // 3540
      "Invalid login token": "Ongeldig inlogtoken",                                                                    // 3541
      "Login forbidden": "Aanmelding geweigerd",                                                                       // 3542
      "Service unknown": "Sevice onbekend",                                                                            // 3543
      "Unrecognized options for login request": "Onbekende optie voor inlogverzoek",                                   // 3544
      "User validation failed": "Gebruikersvalidatie mislukt",                                                         // 3545
      "Username already exists.": "Gebruikersnaam bestaat al.",                                                        // 3546
      "You are not logged in.": "Je bent niet ingelogd.",                                                              // 3547
      "You've been logged out by the server. Please log in again.": "Je bent door de server afgemeld. Meld a.u.b. opnieuw aan.",
      "Your session has expired. Please log in again.": "Je sessie is verlopen. Meld a.u.b. opnieuw aan.",             // 3549
      "No matching login attempt found": "Geen overeenkomstig inlogverzoek gevonden.",                                 // 3550
      "Password is old. Please reset your Password.": "Wachtwoord is verlopen. Reset a.u.b. uw wachtwoord.",           // 3551
      "Incorrect Password": "Onjuist wachtwoord",                                                                      // 3552
      "Invalid email": "Ongeldig e-mailadres",                                                                         // 3553
      "Must be logged in": "Je moet aangemeld zijn",                                                                   // 3554
      "Need to set a username or email": "Gebruikersnaam of e-mailadres moet ingesteld zijn",                          // 3555
      "Password may not be empty": "Wachtwoord mag niet leeg zijn",                                                    // 3556
      "Signups forbidden": "Registratie verboden",                                                                     // 3557
      "Token expired": "Token is verlopen",                                                                            // 3558
      "Token has invalid email address": "Token heeft ongeldig e-mailadres",                                           // 3559
      "User has no Password set": "Geen wachtwoord ingesteld voor gebruiker",                                          // 3560
      "User not found": "Gebruiker niet gevonden",                                                                     // 3561
      "Verify email link expired": "Verificatielink is verlopen",                                                      // 3562
      "Verify email link is for unknown address": "Verificatielink is voor onbekend e-mailadres",                      // 3563
      "Match failed": "Geen match",                                                                                    // 3564
      "Unknown error": "Onbekende fout"                                                                                // 3565
    }                                                                                                                  // 3566
  }                                                                                                                    // 3567
};                                                                                                                     // 3568
                                                                                                                       // 3569
T9n.map("nl", nl);                                                                                                     // 3570
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 3572
}).call(this);                                                                                                         // 3573
                                                                                                                       // 3574
                                                                                                                       // 3575
                                                                                                                       // 3576
                                                                                                                       // 3577
                                                                                                                       // 3578
                                                                                                                       // 3579
(function () {                                                                                                         // 3580
                                                                                                                       // 3581
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/zh_tw.coffee.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var zh_tw;                                                                                                             // 3589
                                                                                                                       // 3590
zh_tw = {                                                                                                              // 3591
  add: "添加",                                                                                                           // 3592
  and: "和",                                                                                                            // 3593
  back: "返回",                                                                                                          // 3594
  changePassword: "修改密碼",                                                                                              // 3595
  choosePassword: "選擇密碼",                                                                                              // 3596
  clickAgree: "點擊註冊, 您同意我們的",                                                                                          // 3597
  configure: "配置",                                                                                                     // 3598
  createAccount: "建立帳號",                                                                                               // 3599
  currentPassword: "當前密碼",                                                                                             // 3600
  dontHaveAnAccount: "還沒有賬戶?",                                                                                         // 3601
  email: "電子郵箱",                                                                                                       // 3602
  emailAddress: "電郵地址",                                                                                                // 3603
  emailResetLink: "電子郵件重設連結",                                                                                          // 3604
  forgotPassword: "忘記密碼?",                                                                                             // 3605
  ifYouAlreadyHaveAnAccount: "如果您已有賬戶",                                                                                // 3606
  newPassword: "新密碼",                                                                                                  // 3607
  newPasswordAgain: "新密碼 (重新輸入)",                                                                                      // 3608
  optional: "可選的",                                                                                                     // 3609
  OR: "或",                                                                                                             // 3610
  password: "密碼",                                                                                                      // 3611
  passwordAgain: "密碼 (重新輸入)",                                                                                          // 3612
  privacyPolicy: "隱私政策",                                                                                               // 3613
  remove: "刪除",                                                                                                        // 3614
  resetYourPassword: "重置您的密碼",                                                                                         // 3615
  setPassword: "設置密碼",                                                                                                 // 3616
  sign: "登",                                                                                                           // 3617
  signIn: "登入",                                                                                                        // 3618
  signin: "登入",                                                                                                        // 3619
  signOut: "登出",                                                                                                       // 3620
  signUp: "註冊",                                                                                                        // 3621
  signupCode: "註冊碼",                                                                                                   // 3622
  signUpWithYourEmailAddress: "使用您的電郵地址註冊",                                                                            // 3623
  terms: "使用條款",                                                                                                       // 3624
  updateYourPassword: "更新您的密碼",                                                                                        // 3625
  username: "用戶名",                                                                                                     // 3626
  usernameOrEmail: "用戶名或電子郵箱",                                                                                         // 3627
  "with": "與",                                                                                                         // 3628
  info: {                                                                                                              // 3629
    emailSent: "郵件已發送",                                                                                                // 3630
    emailVerified: "郵件已驗證",                                                                                            // 3631
    passwordChanged: "密碼已修改",                                                                                          // 3632
    passwordReset: "密碼重置"                                                                                              // 3633
  },                                                                                                                   // 3634
  error: {                                                                                                             // 3635
    emailRequired: "必須填寫電子郵件。",                                                                                        // 3636
    minChar: "密碼至少需要7個字符。",                                                                                            // 3637
    pwdsDontMatch: "密碼不一致。",                                                                                           // 3638
    pwOneDigit: "密碼必須至少有一位數字。",                                                                                        // 3639
    pwOneLetter: "密碼必須至少有一位字母。",                                                                                       // 3640
    signInRequired: "您必須先登錄才能繼續。",                                                                                     // 3641
    signupCodeIncorrect: "註冊碼錯誤。",                                                                                     // 3642
    signupCodeRequired: "必須有註冊碼。",                                                                                     // 3643
    usernameIsEmail: "用戶名不能為電郵地址。",                                                                                    // 3644
    usernameRequired: "必須有用戶名。",                                                                                       // 3645
    accounts: {                                                                                                        // 3646
      "Email already exists.": "電郵地址已被使用。",                                                                            // 3647
      "Email doesn't match the criteria.": "電郵地址不符合條件。",                                                               // 3648
      "Invalid login token": "無效的登錄令牌",                                                                                // 3649
      "Login forbidden": "禁止登錄",                                                                                       // 3650
      "Service unknown": "未知服務",                                                                                       // 3651
      "Unrecognized options for login request": "無法識別的登錄請求選項",                                                         // 3652
      "User validation failed": "用戶驗證失敗",                                                                              // 3653
      "Username already exists.": "用戶名已經存在。",                                                                          // 3654
      "You are not logged in.": "您尚未登入。",                                                                              // 3655
      "You've been logged out by the server. Please log in again.": "你已被伺服器登出，請重新登入。",                                 // 3656
      "Your session has expired. Please log in again.": "您的協定已過期，請重新登入。",                                              // 3657
      "No matching login attempt found": "沒有找到匹配的登入請求",                                                                // 3658
      "Password is old. Please reset your password.": "密碼是舊的。請重置您的密碼。",                                                // 3659
      "Incorrect password": "密碼不正確",                                                                                   // 3660
      "Invalid email": "無效的電子郵件",                                                                                      // 3661
      "Must be logged in": "必須先登入",                                                                                    // 3662
      "Need to set a username or email": "必須設置用戶名或電郵地址",                                                               // 3663
      "old password format": "舊密碼格式",                                                                                  // 3664
      "Password may not be empty": "密碼不能為空的",                                                                          // 3665
      "Signups forbidden": "註冊被禁止",                                                                                    // 3666
      "Token expired": "密匙過期",                                                                                         // 3667
      "Token has invalid email address": "密匙具有無效的電郵地址",                                                                // 3668
      "User has no password set": "用戶沒有設置密碼",                                                                          // 3669
      "User not found": "找不到用戶",                                                                                       // 3670
      "Verify email link expired": "驗證電郵連結已過期",                                                                        // 3671
      "Verify email link is for unknown address": "驗證電郵連結是未知的地址",                                                      // 3672
      "Match failed": "匹配失敗",                                                                                          // 3673
      "Unknown error": "未知錯誤"                                                                                          // 3674
    }                                                                                                                  // 3675
  }                                                                                                                    // 3676
};                                                                                                                     // 3677
                                                                                                                       // 3678
T9n.map("zh_tw", zh_tw);                                                                                               // 3679
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 3681
}).call(this);                                                                                                         // 3682
                                                                                                                       // 3683
                                                                                                                       // 3684
                                                                                                                       // 3685
                                                                                                                       // 3686
                                                                                                                       // 3687
                                                                                                                       // 3688
(function () {                                                                                                         // 3689
                                                                                                                       // 3690
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/softwarerero:accounts-t9n/t9n/zh_hk.coffee.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var zh_hk;                                                                                                             // 3698
                                                                                                                       // 3699
zh_hk = {                                                                                                              // 3700
  add: "新增",                                                                                                           // 3701
  and: "和",                                                                                                            // 3702
  back: "返回",                                                                                                          // 3703
  changePassword: "修改密碼",                                                                                              // 3704
  choosePassword: "選擇密碼",                                                                                              // 3705
  clickAgree: "點擊註冊, 您同意我們的",                                                                                          // 3706
  configure: "設定",                                                                                                     // 3707
  createAccount: "建立帳號",                                                                                               // 3708
  currentPassword: "現有密碼",                                                                                             // 3709
  dontHaveAnAccount: "還沒有賬號？",                                                                                         // 3710
  email: "電郵",                                                                                                         // 3711
  emailAddress: "電郵地址",                                                                                                // 3712
  emailResetLink: "重設電郵連結",                                                                                            // 3713
  forgotPassword: "忘記密碼?",                                                                                             // 3714
  ifYouAlreadyHaveAnAccount: "如果已有賬號",                                                                                 // 3715
  newPassword: "新密碼",                                                                                                  // 3716
  newPasswordAgain: "新密碼 (重新輸入)",                                                                                      // 3717
  optional: "可選填",                                                                                                     // 3718
  OR: "或",                                                                                                             // 3719
  password: "密碼",                                                                                                      // 3720
  passwordAgain: "密碼（重新輸入）",                                                                                           // 3721
  privacyPolicy: "私隱條款",                                                                                               // 3722
  remove: "刪除",                                                                                                        // 3723
  resetYourPassword: "重置密碼",                                                                                           // 3724
  setPassword: "設定密碼",                                                                                                 // 3725
  sign: "登",                                                                                                           // 3726
  signIn: "登入",                                                                                                        // 3727
  signin: "登入",                                                                                                        // 3728
  signOut: "登出",                                                                                                       // 3729
  signUp: "註冊",                                                                                                        // 3730
  signupCode: "註冊碼",                                                                                                   // 3731
  signUpWithYourEmailAddress: "使用您的電郵地址註冊",                                                                            // 3732
  terms: "使用條款",                                                                                                       // 3733
  updateYourPassword: "更新您的密碼",                                                                                        // 3734
  username: "用戶名",                                                                                                     // 3735
  usernameOrEmail: "用戶名或電子郵箱",                                                                                         // 3736
  "with": "與",                                                                                                         // 3737
  info: {                                                                                                              // 3738
    emailSent: "已發送郵件",                                                                                                // 3739
    emailVerified: "已驗證郵件",                                                                                            // 3740
    passwordChanged: "已修改密碼",                                                                                          // 3741
    passwordReset: "密碼重置"                                                                                              // 3742
  },                                                                                                                   // 3743
  error: {                                                                                                             // 3744
    emailRequired: "必須填寫電子郵件。",                                                                                        // 3745
    minChar: "密碼至少需要 7 個字符。",                                                                                          // 3746
    pwdsDontMatch: "密碼不一致。",                                                                                           // 3747
    pwOneDigit: "密碼必須至少包括一個數字。",                                                                                       // 3748
    pwOneLetter: "密碼必須至少有包括一個字符。",                                                                                     // 3749
    signInRequired: "您必須先登錄才能繼續。",                                                                                     // 3750
    signupCodeIncorrect: "註冊碼不符。",                                                                                     // 3751
    signupCodeRequired: "必須有註冊碼。",                                                                                     // 3752
    usernameIsEmail: "用戶名不能設為電郵地址。",                                                                                   // 3753
    usernameRequired: "必須有用戶名。",                                                                                       // 3754
    accounts: {                                                                                                        // 3755
      "Email already exists.": "電郵地址已在本服務登記使用。",                                                                       // 3756
      "Email doesn't match the criteria.": "電郵地址不符合條件。",                                                               // 3757
      "Invalid login token": "無效的登錄編碼",                                                                                // 3758
      "Login forbidden": "禁止登錄",                                                                                       // 3759
      "Service unknown": "未知服務",                                                                                       // 3760
      "Unrecognized options for login request": "無法識別的登錄請求",                                                           // 3761
      "User validation failed": "用戶驗證失敗",                                                                              // 3762
      "Username already exists.": "用戶名已存在。",                                                                           // 3763
      "You are not logged in.": "您尚未登入。",                                                                              // 3764
      "You've been logged out by the server. Please log in again.": "您已被強制登出，請重新登入。",                                  // 3765
      "Your session has expired. Please log in again.": "閒置時間過長，請重新登入。",                                               // 3766
      "No matching login attempt found": "沒有找到匹配的登入請求",                                                                // 3767
      "Password is old. Please reset your password.": "密碼已失效，請重置。",                                                    // 3768
      "Incorrect password": "密碼不正確",                                                                                   // 3769
      "Invalid email": "無效的電子郵件",                                                                                      // 3770
      "Must be logged in": "必須先登入",                                                                                    // 3771
      "Need to set a username or email": "必須設置用戶名或電郵地址",                                                               // 3772
      "old password format": "舊密碼格式",                                                                                  // 3773
      "Password may not be empty": "密碼不能為空",                                                                           // 3774
      "Signups forbidden": "註冊被禁止",                                                                                    // 3775
      "Token expired": "編碼已經過期",                                                                                       // 3776
      "Token has invalid email address": "編碼中的電郵地址無效",                                                                 // 3777
      "User has no password set": "用戶尚未設置密碼",                                                                          // 3778
      "User not found": "找不到用戶",                                                                                       // 3779
      "Verify email link expired": "驗證電郵連結已過期",                                                                        // 3780
      "Verify email link is for unknown address": "驗證電郵連結是未知的地址",                                                      // 3781
      "Match failed": "無法配對",                                                                                          // 3782
      "Unknown error": "無法確認的系統問題"                                                                                     // 3783
    }                                                                                                                  // 3784
  }                                                                                                                    // 3785
};                                                                                                                     // 3786
                                                                                                                       // 3787
T9n.map("zh_hk", zh_hk);                                                                                               // 3788
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       // 3790
}).call(this);                                                                                                         // 3791
                                                                                                                       // 3792
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['softwarerero:accounts-t9n'] = {
  T9n: T9n
};

})();

//# sourceMappingURL=softwarerero_accounts-t9n.js.map
