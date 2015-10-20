(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;

/* Package-scope variables */
var HTML, IDENTITY, SLICE;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                           //
// packages/htmljs/packages/htmljs.js                                                        //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////
                                                                                             //
(function(){                                                                                 // 1
                                                                                             // 2
////////////////////////////////////////////////////////////////////////////////////////     // 3
//                                                                                    //     // 4
// packages/htmljs/preamble.js                                                        //     // 5
//                                                                                    //     // 6
////////////////////////////////////////////////////////////////////////////////////////     // 7
                                                                                      //     // 8
HTML = {};                                                                            // 1   // 9
                                                                                      // 2   // 10
IDENTITY = function (x) { return x; };                                                // 3   // 11
SLICE = Array.prototype.slice;                                                        // 4   // 12
                                                                                      // 5   // 13
////////////////////////////////////////////////////////////////////////////////////////     // 14
                                                                                             // 15
}).call(this);                                                                               // 16
                                                                                             // 17
                                                                                             // 18
                                                                                             // 19
                                                                                             // 20
                                                                                             // 21
                                                                                             // 22
(function(){                                                                                 // 23
                                                                                             // 24
////////////////////////////////////////////////////////////////////////////////////////     // 25
//                                                                                    //     // 26
// packages/htmljs/visitors.js                                                        //     // 27
//                                                                                    //     // 28
////////////////////////////////////////////////////////////////////////////////////////     // 29
                                                                                      //     // 30
////////////////////////////// VISITORS                                               // 1   // 31
                                                                                      // 2   // 32
// _assign is like _.extend or the upcoming Object.assign.                            // 3   // 33
// Copy src's own, enumerable properties onto tgt and return                          // 4   // 34
// tgt.                                                                               // 5   // 35
var _hasOwnProperty = Object.prototype.hasOwnProperty;                                // 6   // 36
var _assign = function (tgt, src) {                                                   // 7   // 37
  for (var k in src) {                                                                // 8   // 38
    if (_hasOwnProperty.call(src, k))                                                 // 9   // 39
      tgt[k] = src[k];                                                                // 10  // 40
  }                                                                                   // 11  // 41
  return tgt;                                                                         // 12  // 42
};                                                                                    // 13  // 43
                                                                                      // 14  // 44
HTML.Visitor = function (props) {                                                     // 15  // 45
  _assign(this, props);                                                               // 16  // 46
};                                                                                    // 17  // 47
                                                                                      // 18  // 48
HTML.Visitor.def = function (options) {                                               // 19  // 49
  _assign(this.prototype, options);                                                   // 20  // 50
};                                                                                    // 21  // 51
                                                                                      // 22  // 52
HTML.Visitor.extend = function (options) {                                            // 23  // 53
  var curType = this;                                                                 // 24  // 54
  var subType = function HTMLVisitorSubtype(/*arguments*/) {                          // 25  // 55
    HTML.Visitor.apply(this, arguments);                                              // 26  // 56
  };                                                                                  // 27  // 57
  subType.prototype = new curType;                                                    // 28  // 58
  subType.extend = curType.extend;                                                    // 29  // 59
  subType.def = curType.def;                                                          // 30  // 60
  if (options)                                                                        // 31  // 61
    _assign(subType.prototype, options);                                              // 32  // 62
  return subType;                                                                     // 33  // 63
};                                                                                    // 34  // 64
                                                                                      // 35  // 65
HTML.Visitor.def({                                                                    // 36  // 66
  visit: function (content/*, ...*/) {                                                // 37  // 67
    if (content == null)                                                              // 38  // 68
      // null or undefined.                                                           // 39  // 69
      return this.visitNull.apply(this, arguments);                                   // 40  // 70
                                                                                      // 41  // 71
    if (typeof content === 'object') {                                                // 42  // 72
      if (content.htmljsType) {                                                       // 43  // 73
        switch (content.htmljsType) {                                                 // 44  // 74
        case HTML.Tag.htmljsType:                                                     // 45  // 75
          return this.visitTag.apply(this, arguments);                                // 46  // 76
        case HTML.CharRef.htmljsType:                                                 // 47  // 77
          return this.visitCharRef.apply(this, arguments);                            // 48  // 78
        case HTML.Comment.htmljsType:                                                 // 49  // 79
          return this.visitComment.apply(this, arguments);                            // 50  // 80
        case HTML.Raw.htmljsType:                                                     // 51  // 81
          return this.visitRaw.apply(this, arguments);                                // 52  // 82
        default:                                                                      // 53  // 83
          throw new Error("Unknown htmljs type: " + content.htmljsType);              // 54  // 84
        }                                                                             // 55  // 85
      }                                                                               // 56  // 86
                                                                                      // 57  // 87
      if (HTML.isArray(content))                                                      // 58  // 88
        return this.visitArray.apply(this, arguments);                                // 59  // 89
                                                                                      // 60  // 90
      return this.visitObject.apply(this, arguments);                                 // 61  // 91
                                                                                      // 62  // 92
    } else if ((typeof content === 'string') ||                                       // 63  // 93
               (typeof content === 'boolean') ||                                      // 64  // 94
               (typeof content === 'number')) {                                       // 65  // 95
      return this.visitPrimitive.apply(this, arguments);                              // 66  // 96
                                                                                      // 67  // 97
    } else if (typeof content === 'function') {                                       // 68  // 98
      return this.visitFunction.apply(this, arguments);                               // 69  // 99
    }                                                                                 // 70  // 100
                                                                                      // 71  // 101
    throw new Error("Unexpected object in htmljs: " + content);                       // 72  // 102
                                                                                      // 73  // 103
  },                                                                                  // 74  // 104
  visitNull: function (nullOrUndefined/*, ...*/) {},                                  // 75  // 105
  visitPrimitive: function (stringBooleanOrNumber/*, ...*/) {},                       // 76  // 106
  visitArray: function (array/*, ...*/) {},                                           // 77  // 107
  visitComment: function (comment/*, ...*/) {},                                       // 78  // 108
  visitCharRef: function (charRef/*, ...*/) {},                                       // 79  // 109
  visitRaw: function (raw/*, ...*/) {},                                               // 80  // 110
  visitTag: function (tag/*, ...*/) {},                                               // 81  // 111
  visitObject: function (obj/*, ...*/) {                                              // 82  // 112
    throw new Error("Unexpected object in htmljs: " + obj);                           // 83  // 113
  },                                                                                  // 84  // 114
  visitFunction: function (fn/*, ...*/) {                                             // 85  // 115
    throw new Error("Unexpected function in htmljs: " + obj);                         // 86  // 116
  }                                                                                   // 87  // 117
});                                                                                   // 88  // 118
                                                                                      // 89  // 119
HTML.TransformingVisitor = HTML.Visitor.extend();                                     // 90  // 120
HTML.TransformingVisitor.def({                                                        // 91  // 121
  visitNull: IDENTITY,                                                                // 92  // 122
  visitPrimitive: IDENTITY,                                                           // 93  // 123
  visitArray: function (array/*, ...*/) {                                             // 94  // 124
    var argsCopy = SLICE.call(arguments);                                             // 95  // 125
    var result = array;                                                               // 96  // 126
    for (var i = 0; i < array.length; i++) {                                          // 97  // 127
      var oldItem = array[i];                                                         // 98  // 128
      argsCopy[0] = oldItem;                                                          // 99  // 129
      var newItem = this.visit.apply(this, argsCopy);                                 // 100
      if (newItem !== oldItem) {                                                      // 101
        // copy `array` on write                                                      // 102
        if (result === array)                                                         // 103
          result = array.slice();                                                     // 104
        result[i] = newItem;                                                          // 105
      }                                                                               // 106
    }                                                                                 // 107
    return result;                                                                    // 108
  },                                                                                  // 109
  visitComment: IDENTITY,                                                             // 110
  visitCharRef: IDENTITY,                                                             // 111
  visitRaw: IDENTITY,                                                                 // 112
  visitObject: IDENTITY,                                                              // 113
  visitFunction: IDENTITY,                                                            // 114
  visitTag: function (tag/*, ...*/) {                                                 // 115
    var oldChildren = tag.children;                                                   // 116
    var argsCopy = SLICE.call(arguments);                                             // 117
    argsCopy[0] = oldChildren;                                                        // 118
    var newChildren = this.visitChildren.apply(this, argsCopy);                       // 119
                                                                                      // 120
    var oldAttrs = tag.attrs;                                                         // 121
    argsCopy[0] = oldAttrs;                                                           // 122
    var newAttrs = this.visitAttributes.apply(this, argsCopy);                        // 123
                                                                                      // 124
    if (newAttrs === oldAttrs && newChildren === oldChildren)                         // 125
      return tag;                                                                     // 126
                                                                                      // 127
    var newTag = HTML.getTag(tag.tagName).apply(null, newChildren);                   // 128
    newTag.attrs = newAttrs;                                                          // 129
    return newTag;                                                                    // 130
  },                                                                                  // 131
  visitChildren: function (children/*, ...*/) {                                       // 132
    return this.visitArray.apply(this, arguments);                                    // 133
  },                                                                                  // 134
  // Transform the `.attrs` property of a tag, which may be a dictionary,             // 135
  // an array, or in some uses, a foreign object (such as                             // 136
  // a template tag).                                                                 // 137
  visitAttributes: function (attrs/*, ...*/) {                                        // 138
    if (HTML.isArray(attrs)) {                                                        // 139
      var argsCopy = SLICE.call(arguments);                                           // 140
      var result = attrs;                                                             // 141
      for (var i = 0; i < attrs.length; i++) {                                        // 142
        var oldItem = attrs[i];                                                       // 143
        argsCopy[0] = oldItem;                                                        // 144
        var newItem = this.visitAttributes.apply(this, argsCopy);                     // 145
        if (newItem !== oldItem) {                                                    // 146
          // copy on write                                                            // 147
          if (result === attrs)                                                       // 148
            result = attrs.slice();                                                   // 149
          result[i] = newItem;                                                        // 150
        }                                                                             // 151
      }                                                                               // 152
      return result;                                                                  // 153
    }                                                                                 // 154
                                                                                      // 155
    if (attrs && HTML.isConstructedObject(attrs)) {                                   // 156
      throw new Error("The basic HTML.TransformingVisitor does not support " +        // 157
                      "foreign objects in attributes.  Define a custom " +            // 158
                      "visitAttributes for this case.");                              // 159
    }                                                                                 // 160
                                                                                      // 161
    var oldAttrs = attrs;                                                             // 162
    var newAttrs = oldAttrs;                                                          // 163
    if (oldAttrs) {                                                                   // 164
      var attrArgs = [null, null];                                                    // 165
      attrArgs.push.apply(attrArgs, arguments);                                       // 166
      for (var k in oldAttrs) {                                                       // 167
        var oldValue = oldAttrs[k];                                                   // 168
        attrArgs[0] = k;                                                              // 169
        attrArgs[1] = oldValue;                                                       // 170
        var newValue = this.visitAttribute.apply(this, attrArgs);                     // 171
        if (newValue !== oldValue) {                                                  // 172
          // copy on write                                                            // 173
          if (newAttrs === oldAttrs)                                                  // 174
            newAttrs = _assign({}, oldAttrs);                                         // 175
          newAttrs[k] = newValue;                                                     // 176
        }                                                                             // 177
      }                                                                               // 178
    }                                                                                 // 179
                                                                                      // 180
    return newAttrs;                                                                  // 181
  },                                                                                  // 182
  // Transform the value of one attribute name/value in an                            // 183
  // attributes dictionary.                                                           // 184
  visitAttribute: function (name, value, tag/*, ...*/) {                              // 185
    var args = SLICE.call(arguments, 2);                                              // 186
    args[0] = value;                                                                  // 187
    return this.visit.apply(this, args);                                              // 188
  }                                                                                   // 189
});                                                                                   // 190
                                                                                      // 191
                                                                                      // 192
HTML.ToTextVisitor = HTML.Visitor.extend();                                           // 193
HTML.ToTextVisitor.def({                                                              // 194
  visitNull: function (nullOrUndefined) {                                             // 195
    return '';                                                                        // 196
  },                                                                                  // 197
  visitPrimitive: function (stringBooleanOrNumber) {                                  // 198
    var str = String(stringBooleanOrNumber);                                          // 199
    if (this.textMode === HTML.TEXTMODE.RCDATA) {                                     // 200
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');                        // 201
    } else if (this.textMode === HTML.TEXTMODE.ATTRIBUTE) {                           // 202
      // escape `&` and `"` this time, not `&` and `<`                                // 203
      return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');                      // 204
    } else {                                                                          // 205
      return str;                                                                     // 206
    }                                                                                 // 207
  },                                                                                  // 208
  visitArray: function (array) {                                                      // 209
    var parts = [];                                                                   // 210
    for (var i = 0; i < array.length; i++)                                            // 211
      parts.push(this.visit(array[i]));                                               // 212
    return parts.join('');                                                            // 213
  },                                                                                  // 214
  visitComment: function (comment) {                                                  // 215
    throw new Error("Can't have a comment here");                                     // 216
  },                                                                                  // 217
  visitCharRef: function (charRef) {                                                  // 218
    if (this.textMode === HTML.TEXTMODE.RCDATA ||                                     // 219
        this.textMode === HTML.TEXTMODE.ATTRIBUTE) {                                  // 220
      return charRef.html;                                                            // 221
    } else {                                                                          // 222
      return charRef.str;                                                             // 223
    }                                                                                 // 224
  },                                                                                  // 225
  visitRaw: function (raw) {                                                          // 226
    return raw.value;                                                                 // 227
  },                                                                                  // 228
  visitTag: function (tag) {                                                          // 229
    // Really we should just disallow Tags here.  However, at the                     // 230
    // moment it's useful to stringify any HTML we find.  In                          // 231
    // particular, when you include a template within `{{#markdown}}`,                // 232
    // we render the template as text, and since there's currently                    // 233
    // no way to make the template be *parsed* as text (e.g. `<template               // 234
    // type="text">`), we hackishly support HTML tags in markdown                     // 235
    // in templates by parsing them and stringifying them.                            // 236
    return this.visit(this.toHTML(tag));                                              // 237
  },                                                                                  // 238
  visitObject: function (x) {                                                         // 239
    throw new Error("Unexpected object in htmljs in toText: " + x);                   // 240
  },                                                                                  // 241
  toHTML: function (node) {                                                           // 242
    return HTML.toHTML(node);                                                         // 243
  }                                                                                   // 244
});                                                                                   // 245
                                                                                      // 246
                                                                                      // 247
                                                                                      // 248
HTML.ToHTMLVisitor = HTML.Visitor.extend();                                           // 249
HTML.ToHTMLVisitor.def({                                                              // 250
  visitNull: function (nullOrUndefined) {                                             // 251
    return '';                                                                        // 252
  },                                                                                  // 253
  visitPrimitive: function (stringBooleanOrNumber) {                                  // 254
    var str = String(stringBooleanOrNumber);                                          // 255
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');                          // 256
  },                                                                                  // 257
  visitArray: function (array) {                                                      // 258
    var parts = [];                                                                   // 259
    for (var i = 0; i < array.length; i++)                                            // 260
      parts.push(this.visit(array[i]));                                               // 261
    return parts.join('');                                                            // 262
  },                                                                                  // 263
  visitComment: function (comment) {                                                  // 264
    return '<!--' + comment.sanitizedValue + '-->';                                   // 265
  },                                                                                  // 266
  visitCharRef: function (charRef) {                                                  // 267
    return charRef.html;                                                              // 268
  },                                                                                  // 269
  visitRaw: function (raw) {                                                          // 270
    return raw.value;                                                                 // 271
  },                                                                                  // 272
  visitTag: function (tag) {                                                          // 273
    var attrStrs = [];                                                                // 274
                                                                                      // 275
    var tagName = tag.tagName;                                                        // 276
    var children = tag.children;                                                      // 277
                                                                                      // 278
    var attrs = tag.attrs;                                                            // 279
    if (attrs) {                                                                      // 280
      attrs = HTML.flattenAttributes(attrs);                                          // 281
      for (var k in attrs) {                                                          // 282
        if (k === 'value' && tagName === 'textarea') {                                // 283
          children = [attrs[k], children];                                            // 284
        } else {                                                                      // 285
          var v = this.toText(attrs[k], HTML.TEXTMODE.ATTRIBUTE);                     // 286
          attrStrs.push(' ' + k + '="' + v + '"');                                    // 287
        }                                                                             // 288
      }                                                                               // 289
    }                                                                                 // 290
                                                                                      // 291
    var startTag = '<' + tagName + attrStrs.join('') + '>';                           // 292
                                                                                      // 293
    var childStrs = [];                                                               // 294
    var content;                                                                      // 295
    if (tagName === 'textarea') {                                                     // 296
                                                                                      // 297
      for (var i = 0; i < children.length; i++)                                       // 298
        childStrs.push(this.toText(children[i], HTML.TEXTMODE.RCDATA));               // 299
                                                                                      // 300
      content = childStrs.join('');                                                   // 301
      if (content.slice(0, 1) === '\n')                                               // 302
        // TEXTAREA will absorb a newline, so if we see one, add                      // 303
        // another one.                                                               // 304
        content = '\n' + content;                                                     // 305
                                                                                      // 306
    } else {                                                                          // 307
      for (var i = 0; i < children.length; i++)                                       // 308
        childStrs.push(this.visit(children[i]));                                      // 309
                                                                                      // 310
      content = childStrs.join('');                                                   // 311
    }                                                                                 // 312
                                                                                      // 313
    var result = startTag + content;                                                  // 314
                                                                                      // 315
    if (children.length || ! HTML.isVoidElement(tagName)) {                           // 316
      // "Void" elements like BR are the only ones that don't get a close             // 317
      // tag in HTML5.  They shouldn't have contents, either, so we could             // 318
      // throw an error upon seeing contents here.                                    // 319
      result += '</' + tagName + '>';                                                 // 320
    }                                                                                 // 321
                                                                                      // 322
    return result;                                                                    // 323
  },                                                                                  // 324
  visitObject: function (x) {                                                         // 325
    throw new Error("Unexpected object in htmljs in toHTML: " + x);                   // 326
  },                                                                                  // 327
  toText: function (node, textMode) {                                                 // 328
    return HTML.toText(node, textMode);                                               // 329
  }                                                                                   // 330
});                                                                                   // 331
                                                                                      // 332
////////////////////////////////////////////////////////////////////////////////////////     // 363
                                                                                             // 364
}).call(this);                                                                               // 365
                                                                                             // 366
                                                                                             // 367
                                                                                             // 368
                                                                                             // 369
                                                                                             // 370
                                                                                             // 371
(function(){                                                                                 // 372
                                                                                             // 373
////////////////////////////////////////////////////////////////////////////////////////     // 374
//                                                                                    //     // 375
// packages/htmljs/html.js                                                            //     // 376
//                                                                                    //     // 377
////////////////////////////////////////////////////////////////////////////////////////     // 378
                                                                                      //     // 379
                                                                                      // 1   // 380
                                                                                      // 2   // 381
HTML.Tag = function () {};                                                            // 3   // 382
HTML.Tag.prototype.tagName = ''; // this will be set per Tag subclass                 // 4   // 383
HTML.Tag.prototype.attrs = null;                                                      // 5   // 384
HTML.Tag.prototype.children = Object.freeze ? Object.freeze([]) : [];                 // 6   // 385
HTML.Tag.prototype.htmljsType = HTML.Tag.htmljsType = ['Tag'];                        // 7   // 386
                                                                                      // 8   // 387
// Given "p" create the function `HTML.P`.                                            // 9   // 388
var makeTagConstructor = function (tagName) {                                         // 10  // 389
  // HTMLTag is the per-tagName constructor of a HTML.Tag subclass                    // 11  // 390
  var HTMLTag = function (/*arguments*/) {                                            // 12  // 391
    // Work with or without `new`.  If not called with `new`,                         // 13  // 392
    // perform instantiation by recursively calling this constructor.                 // 14  // 393
    // We can't pass varargs, so pass no args.                                        // 15  // 394
    var instance = (this instanceof HTML.Tag) ? this : new HTMLTag;                   // 16  // 395
                                                                                      // 17  // 396
    var i = 0;                                                                        // 18  // 397
    var attrs = arguments.length && arguments[0];                                     // 19  // 398
    if (attrs && (typeof attrs === 'object')) {                                       // 20  // 399
      // Treat vanilla JS object as an attributes dictionary.                         // 21  // 400
      if (! HTML.isConstructedObject(attrs)) {                                        // 22  // 401
        instance.attrs = attrs;                                                       // 23  // 402
        i++;                                                                          // 24  // 403
      } else if (attrs instanceof HTML.Attrs) {                                       // 25  // 404
        var array = attrs.value;                                                      // 26  // 405
        if (array.length === 1) {                                                     // 27  // 406
          instance.attrs = array[0];                                                  // 28  // 407
        } else if (array.length > 1) {                                                // 29  // 408
          instance.attrs = array;                                                     // 30  // 409
        }                                                                             // 31  // 410
        i++;                                                                          // 32  // 411
      }                                                                               // 33  // 412
    }                                                                                 // 34  // 413
                                                                                      // 35  // 414
                                                                                      // 36  // 415
    // If no children, don't create an array at all, use the prototype's              // 37  // 416
    // (frozen, empty) array.  This way we don't create an empty array                // 38  // 417
    // every time someone creates a tag without `new` and this constructor            // 39  // 418
    // calls itself with no arguments (above).                                        // 40  // 419
    if (i < arguments.length)                                                         // 41  // 420
      instance.children = SLICE.call(arguments, i);                                   // 42  // 421
                                                                                      // 43  // 422
    return instance;                                                                  // 44  // 423
  };                                                                                  // 45  // 424
  HTMLTag.prototype = new HTML.Tag;                                                   // 46  // 425
  HTMLTag.prototype.constructor = HTMLTag;                                            // 47  // 426
  HTMLTag.prototype.tagName = tagName;                                                // 48  // 427
                                                                                      // 49  // 428
  return HTMLTag;                                                                     // 50  // 429
};                                                                                    // 51  // 430
                                                                                      // 52  // 431
// Not an HTMLjs node, but a wrapper to pass multiple attrs dictionaries              // 53  // 432
// to a tag (for the purpose of implementing dynamic attributes).                     // 54  // 433
var Attrs = HTML.Attrs = function (/*attrs dictionaries*/) {                          // 55  // 434
  // Work with or without `new`.  If not called with `new`,                           // 56  // 435
  // perform instantiation by recursively calling this constructor.                   // 57  // 436
  // We can't pass varargs, so pass no args.                                          // 58  // 437
  var instance = (this instanceof Attrs) ? this : new Attrs;                          // 59  // 438
                                                                                      // 60  // 439
  instance.value = SLICE.call(arguments);                                             // 61  // 440
                                                                                      // 62  // 441
  return instance;                                                                    // 63  // 442
};                                                                                    // 64  // 443
                                                                                      // 65  // 444
////////////////////////////// KNOWN ELEMENTS                                         // 66  // 445
                                                                                      // 67  // 446
HTML.getTag = function (tagName) {                                                    // 68  // 447
  var symbolName = HTML.getSymbolName(tagName);                                       // 69  // 448
  if (symbolName === tagName) // all-caps tagName                                     // 70  // 449
    throw new Error("Use the lowercase or camelCase form of '" + tagName + "' here");        // 450
                                                                                      // 72  // 451
  if (! HTML[symbolName])                                                             // 73  // 452
    HTML[symbolName] = makeTagConstructor(tagName);                                   // 74  // 453
                                                                                      // 75  // 454
  return HTML[symbolName];                                                            // 76  // 455
};                                                                                    // 77  // 456
                                                                                      // 78  // 457
HTML.ensureTag = function (tagName) {                                                 // 79  // 458
  HTML.getTag(tagName); // don't return it                                            // 80  // 459
};                                                                                    // 81  // 460
                                                                                      // 82  // 461
HTML.isTagEnsured = function (tagName) {                                              // 83  // 462
  return HTML.isKnownElement(tagName);                                                // 84  // 463
};                                                                                    // 85  // 464
                                                                                      // 86  // 465
HTML.getSymbolName = function (tagName) {                                             // 87  // 466
  // "foo-bar" -> "FOO_BAR"                                                           // 88  // 467
  return tagName.toUpperCase().replace(/-/g, '_');                                    // 89  // 468
};                                                                                    // 90  // 469
                                                                                      // 91  // 470
HTML.knownElementNames = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo big blockquote body br button canvas caption center cite code col colgroup command data datagrid datalist dd del details dfn dir div dl dt em embed eventsource fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link main map mark menu meta meter nav noframes noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strike strong style sub summary sup table tbody td textarea tfoot th thead time title tr track tt u ul var video wbr'.split(' ');
// (we add the SVG ones below)                                                        // 93  // 472
                                                                                      // 94  // 473
HTML.knownSVGElementNames = 'altGlyph altGlyphDef altGlyphItem animate animateColor animateMotion animateTransform circle clipPath color-profile cursor defs desc ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph path pattern polygon polyline radialGradient rect set stop style svg switch symbol text textPath title tref tspan use view vkern'.split(' ');
// Append SVG element names to list of known element names                            // 96  // 475
HTML.knownElementNames = HTML.knownElementNames.concat(HTML.knownSVGElementNames);    // 97  // 476
                                                                                      // 98  // 477
HTML.voidElementNames = 'area base br col command embed hr img input keygen link meta param source track wbr'.split(' ');
                                                                                      // 100
// Speed up search through lists of known elements by creating internal "sets"        // 101
// of strings.                                                                        // 102
var YES = {yes:true};                                                                 // 103
var makeSet = function (array) {                                                      // 104
  var set = {};                                                                       // 105
  for (var i = 0; i < array.length; i++)                                              // 106
    set[array[i]] = YES;                                                              // 107
  return set;                                                                         // 108
};                                                                                    // 109
var voidElementSet = makeSet(HTML.voidElementNames);                                  // 110
var knownElementSet = makeSet(HTML.knownElementNames);                                // 111
var knownSVGElementSet = makeSet(HTML.knownSVGElementNames);                          // 112
                                                                                      // 113
HTML.isKnownElement = function (tagName) {                                            // 114
  return knownElementSet[tagName] === YES;                                            // 115
};                                                                                    // 116
                                                                                      // 117
HTML.isKnownSVGElement = function (tagName) {                                         // 118
  return knownSVGElementSet[tagName] === YES;                                         // 119
};                                                                                    // 120
                                                                                      // 121
HTML.isVoidElement = function (tagName) {                                             // 122
  return voidElementSet[tagName] === YES;                                             // 123
};                                                                                    // 124
                                                                                      // 125
                                                                                      // 126
// Ensure tags for all known elements                                                 // 127
for (var i = 0; i < HTML.knownElementNames.length; i++)                               // 128
  HTML.ensureTag(HTML.knownElementNames[i]);                                          // 129
                                                                                      // 130
                                                                                      // 131
var CharRef = HTML.CharRef = function (attrs) {                                       // 132
  if (! (this instanceof CharRef))                                                    // 133
    // called without `new`                                                           // 134
    return new CharRef(attrs);                                                        // 135
                                                                                      // 136
  if (! (attrs && attrs.html && attrs.str))                                           // 137
    throw new Error(                                                                  // 138
      "HTML.CharRef must be constructed with ({html:..., str:...})");                 // 139
                                                                                      // 140
  this.html = attrs.html;                                                             // 141
  this.str = attrs.str;                                                               // 142
};                                                                                    // 143
CharRef.prototype.htmljsType = CharRef.htmljsType = ['CharRef'];                      // 144
                                                                                      // 145
var Comment = HTML.Comment = function (value) {                                       // 146
  if (! (this instanceof Comment))                                                    // 147
    // called without `new`                                                           // 148
    return new Comment(value);                                                        // 149
                                                                                      // 150
  if (typeof value !== 'string')                                                      // 151
    throw new Error('HTML.Comment must be constructed with a string');                // 152
                                                                                      // 153
  this.value = value;                                                                 // 154
  // Kill illegal hyphens in comment value (no way to escape them in HTML)            // 155
  this.sanitizedValue = value.replace(/^-|--+|-$/g, '');                              // 156
};                                                                                    // 157
Comment.prototype.htmljsType = Comment.htmljsType = ['Comment'];                      // 158
                                                                                      // 159
var Raw = HTML.Raw = function (value) {                                               // 160
  if (! (this instanceof Raw))                                                        // 161
    // called without `new`                                                           // 162
    return new Raw(value);                                                            // 163
                                                                                      // 164
  if (typeof value !== 'string')                                                      // 165
    throw new Error('HTML.Raw must be constructed with a string');                    // 166
                                                                                      // 167
  this.value = value;                                                                 // 168
};                                                                                    // 169
Raw.prototype.htmljsType = Raw.htmljsType = ['Raw'];                                  // 170
                                                                                      // 171
                                                                                      // 172
HTML.isArray = function (x) {                                                         // 173
  // could change this to use the more convoluted Object.prototype.toString           // 174
  // approach that works when objects are passed between frames, but does             // 175
  // it matter?                                                                       // 176
  return (x instanceof Array);                                                        // 177
};                                                                                    // 178
                                                                                      // 179
HTML.isConstructedObject = function (x) {                                             // 180
  // Figure out if `x` is "an instance of some class" or just a plain                 // 181
  // object literal.  It correctly treats an object literal like                      // 182
  // `{ constructor: ... }` as an object literal.  It won't detect                    // 183
  // instances of classes that lack a `constructor` property (e.g.                    // 184
  // if you assign to a prototype when setting up the class as in:                    // 185
  // `Foo = function () { ... }; Foo.prototype = { ... }`, then                       // 186
  // `(new Foo).constructor` is `Object`, not `Foo`).                                 // 187
  return (x && (typeof x === 'object') &&                                             // 188
          (x.constructor !== Object) &&                                               // 189
          (typeof x.constructor === 'function') &&                                    // 190
          (x instanceof x.constructor));                                              // 191
};                                                                                    // 192
                                                                                      // 193
HTML.isNully = function (node) {                                                      // 194
  if (node == null)                                                                   // 195
    // null or undefined                                                              // 196
    return true;                                                                      // 197
                                                                                      // 198
  if (HTML.isArray(node)) {                                                           // 199
    // is it an empty array or an array of all nully items?                           // 200
    for (var i = 0; i < node.length; i++)                                             // 201
      if (! HTML.isNully(node[i]))                                                    // 202
        return false;                                                                 // 203
    return true;                                                                      // 204
  }                                                                                   // 205
                                                                                      // 206
  return false;                                                                       // 207
};                                                                                    // 208
                                                                                      // 209
HTML.isValidAttributeName = function (name) {                                         // 210
  return /^[:_A-Za-z][:_A-Za-z0-9.\-]*/.test(name);                                   // 211
};                                                                                    // 212
                                                                                      // 213
// If `attrs` is an array of attributes dictionaries, combines them                   // 214
// into one.  Removes attributes that are "nully."                                    // 215
HTML.flattenAttributes = function (attrs) {                                           // 216
  if (! attrs)                                                                        // 217
    return attrs;                                                                     // 218
                                                                                      // 219
  var isArray = HTML.isArray(attrs);                                                  // 220
  if (isArray && attrs.length === 0)                                                  // 221
    return null;                                                                      // 222
                                                                                      // 223
  var result = {};                                                                    // 224
  for (var i = 0, N = (isArray ? attrs.length : 1); i < N; i++) {                     // 225
    var oneAttrs = (isArray ? attrs[i] : attrs);                                      // 226
    if ((typeof oneAttrs !== 'object') ||                                             // 227
        HTML.isConstructedObject(oneAttrs))                                           // 228
      throw new Error("Expected plain JS object as attrs, found: " + oneAttrs);       // 229
    for (var name in oneAttrs) {                                                      // 230
      if (! HTML.isValidAttributeName(name))                                          // 231
        throw new Error("Illegal HTML attribute name: " + name);                      // 232
      var value = oneAttrs[name];                                                     // 233
      if (! HTML.isNully(value))                                                      // 234
        result[name] = value;                                                         // 235
    }                                                                                 // 236
  }                                                                                   // 237
                                                                                      // 238
  return result;                                                                      // 239
};                                                                                    // 240
                                                                                      // 241
                                                                                      // 242
                                                                                      // 243
////////////////////////////// TOHTML                                                 // 244
                                                                                      // 245
HTML.toHTML = function (content) {                                                    // 246
  return (new HTML.ToHTMLVisitor).visit(content);                                     // 247
};                                                                                    // 248
                                                                                      // 249
// Escaping modes for outputting text when generating HTML.                           // 250
HTML.TEXTMODE = {                                                                     // 251
  STRING: 1,                                                                          // 252
  RCDATA: 2,                                                                          // 253
  ATTRIBUTE: 3                                                                        // 254
};                                                                                    // 255
                                                                                      // 256
                                                                                      // 257
HTML.toText = function (content, textMode) {                                          // 258
  if (! textMode)                                                                     // 259
    throw new Error("textMode required for HTML.toText");                             // 260
  if (! (textMode === HTML.TEXTMODE.STRING ||                                         // 261
         textMode === HTML.TEXTMODE.RCDATA ||                                         // 262
         textMode === HTML.TEXTMODE.ATTRIBUTE))                                       // 263
    throw new Error("Unknown textMode: " + textMode);                                 // 264
                                                                                      // 265
  var visitor = new HTML.ToTextVisitor({textMode: textMode});;                        // 266
  return visitor.visit(content);                                                      // 267
};                                                                                    // 268
                                                                                      // 269
////////////////////////////////////////////////////////////////////////////////////////     // 649
                                                                                             // 650
}).call(this);                                                                               // 651
                                                                                             // 652
///////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.htmljs = {
  HTML: HTML
};

})();

//# sourceMappingURL=htmljs.js.map
