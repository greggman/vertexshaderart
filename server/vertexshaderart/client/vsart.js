(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["vsart"] = factory();
	else
		root["vsart"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// This is CodeMirror (http://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .

(function (global, factory) {
   true ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.CodeMirror = factory();
})(this, function () {
  'use strict';

  // Kludges for bugs and behavior differences that can't be feature
  // detected are enabled based on userAgent etc sniffing.

  var userAgent = navigator.userAgent;
  var platform = navigator.platform;

  var gecko = /gecko\/\d/i.test(userAgent);
  var ie_upto10 = /MSIE \d/.test(userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
  var edge = /Edge\/(\d+)/.exec(userAgent);
  var ie = ie_upto10 || ie_11up || edge;
  var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : +(edge || ie_11up)[1]);
  var webkit = !edge && /WebKit\//.test(userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
  var chrome = !edge && /Chrome\//.test(userAgent);
  var presto = /Opera\//.test(userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
  var phantom = /PhantomJS/.test(userAgent);

  var ios = !edge && /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent);
  var android = /Android/.test(userAgent);
  // This is woefully incomplete. Suggestions for alternative methods welcome.
  var mobile = ios || android || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
  var mac = ios || /Mac/.test(platform);
  var chromeOS = /\bCrOS\b/.test(userAgent);
  var windows = /win/i.test(platform);

  var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);
  if (presto_version) {
    presto_version = Number(presto_version[1]);
  }
  if (presto_version && presto_version >= 15) {
    presto = false;webkit = true;
  }
  // Some browsers use the wrong event properties to signal cmd/ctrl on OS X
  var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
  var captureRightClick = gecko || ie && ie_version >= 9;

  function classTest(cls) {
    return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*");
  }

  var rmClass = function (node, cls) {
    var current = node.className;
    var match = classTest(cls).exec(current);
    if (match) {
      var after = current.slice(match.index + match[0].length);
      node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
    }
  };

  function removeChildren(e) {
    for (var count = e.childNodes.length; count > 0; --count) {
      e.removeChild(e.firstChild);
    }
    return e;
  }

  function removeChildrenAndAdd(parent, e) {
    return removeChildren(parent).appendChild(e);
  }

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);
    if (className) {
      e.className = className;
    }
    if (style) {
      e.style.cssText = style;
    }
    if (typeof content == "string") {
      e.appendChild(document.createTextNode(content));
    } else if (content) {
      for (var i = 0; i < content.length; ++i) {
        e.appendChild(content[i]);
      }
    }
    return e;
  }
  // wrapper for elt, which removes the elt from the accessibility tree
  function eltP(tag, content, className, style) {
    var e = elt(tag, content, className, style);
    e.setAttribute("role", "presentation");
    return e;
  }

  var range;
  if (document.createRange) {
    range = function (node, start, end, endNode) {
      var r = document.createRange();
      r.setEnd(endNode || node, end);
      r.setStart(node, start);
      return r;
    };
  } else {
    range = function (node, start, end) {
      var r = document.body.createTextRange();
      try {
        r.moveToElementText(node.parentNode);
      } catch (e) {
        return r;
      }
      r.collapse(true);
      r.moveEnd("character", end);
      r.moveStart("character", start);
      return r;
    };
  }

  function contains(parent, child) {
    if (child.nodeType == 3) // Android browser always returns false when child is a textnode
      {
        child = child.parentNode;
      }
    if (parent.contains) {
      return parent.contains(child);
    }
    do {
      if (child.nodeType == 11) {
        child = child.host;
      }
      if (child == parent) {
        return true;
      }
    } while (child = child.parentNode);
  }

  function activeElt() {
    // IE and Edge may throw an "Unspecified Error" when accessing document.activeElement.
    // IE < 10 will throw when accessed while the page is loading or in an iframe.
    // IE > 9 and Edge will throw when accessed in an iframe if document.body is unavailable.
    var activeElement;
    try {
      activeElement = document.activeElement;
    } catch (e) {
      activeElement = document.body || null;
    }
    while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
      activeElement = activeElement.shadowRoot.activeElement;
    }
    return activeElement;
  }

  function addClass(node, cls) {
    var current = node.className;
    if (!classTest(cls).test(current)) {
      node.className += (current ? " " : "") + cls;
    }
  }
  function joinClasses(a, b) {
    var as = a.split(" ");
    for (var i = 0; i < as.length; i++) {
      if (as[i] && !classTest(as[i]).test(b)) {
        b += " " + as[i];
      }
    }
    return b;
  }

  var selectInput = function (node) {
    node.select();
  };
  if (ios) // Mobile Safari apparently has a bug where select() is broken.
    {
      selectInput = function (node) {
        node.selectionStart = 0;node.selectionEnd = node.value.length;
      };
    } else if (ie) // Suppress mysterious IE10 errors
    {
      selectInput = function (node) {
        try {
          node.select();
        } catch (_e) {}
      };
    }

  function bind(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
      return f.apply(null, args);
    };
  }

  function copyObj(obj, target, overwrite) {
    if (!target) {
      target = {};
    }
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop))) {
        target[prop] = obj[prop];
      }
    }
    return target;
  }

  // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.
  function countColumn(string, end, tabSize, startIndex, startValue) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);
      if (end == -1) {
        end = string.length;
      }
    }
    for (var i = startIndex || 0, n = startValue || 0;;) {
      var nextTab = string.indexOf("\t", i);
      if (nextTab < 0 || nextTab >= end) {
        return n + (end - i);
      }
      n += nextTab - i;
      n += tabSize - n % tabSize;
      i = nextTab + 1;
    }
  }

  var Delayed = function () {
    this.id = null;
  };
  Delayed.prototype.set = function (ms, f) {
    clearTimeout(this.id);
    this.id = setTimeout(f, ms);
  };

  function indexOf(array, elt) {
    for (var i = 0; i < array.length; ++i) {
      if (array[i] == elt) {
        return i;
      }
    }
    return -1;
  }

  // Number of pixels added to scroller and sizer to hide scrollbar
  var scrollerGap = 30;

  // Returned or thrown by various protocols to signal 'I'm not
  // handling this'.
  var Pass = { toString: function () {
      return "CodeMirror.Pass";
    }

    // Reused option objects for setSelection & friends
  };var sel_dontScroll = { scroll: false };
  var sel_mouse = { origin: "*mouse" };
  var sel_move = { origin: "+move" };
  // The inverse of countColumn -- find the offset that corresponds to
  // a particular column.
  function findColumn(string, goal, tabSize) {
    for (var pos = 0, col = 0;;) {
      var nextTab = string.indexOf("\t", pos);
      if (nextTab == -1) {
        nextTab = string.length;
      }
      var skipped = nextTab - pos;
      if (nextTab == string.length || col + skipped >= goal) {
        return pos + Math.min(skipped, goal - col);
      }
      col += nextTab - pos;
      col += tabSize - col % tabSize;
      pos = nextTab + 1;
      if (col >= goal) {
        return pos;
      }
    }
  }

  var spaceStrs = [""];
  function spaceStr(n) {
    while (spaceStrs.length <= n) {
      spaceStrs.push(lst(spaceStrs) + " ");
    }
    return spaceStrs[n];
  }

  function lst(arr) {
    return arr[arr.length - 1];
  }

  function map(array, f) {
    var out = [];
    for (var i = 0; i < array.length; i++) {
      out[i] = f(array[i], i);
    }
    return out;
  }

  function insertSorted(array, value, score) {
    var pos = 0,
        priority = score(value);
    while (pos < array.length && score(array[pos]) <= priority) {
      pos++;
    }
    array.splice(pos, 0, value);
  }

  function nothing() {}

  function createObj(base, props) {
    var inst;
    if (Object.create) {
      inst = Object.create(base);
    } else {
      nothing.prototype = base;
      inst = new nothing();
    }
    if (props) {
      copyObj(props, inst);
    }
    return inst;
  }

  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  function isWordCharBasic(ch) {
    return (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch))
    );
  }
  function isWordChar(ch, helper) {
    if (!helper) {
      return isWordCharBasic(ch);
    }
    if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) {
      return true;
    }
    return helper.test(ch);
  }

  function isEmpty(obj) {
    for (var n in obj) {
      if (obj.hasOwnProperty(n) && obj[n]) {
        return false;
      }
    }
    return true;
  }

  // Extending unicode characters. A series of a non-extending char +
  // any number of extending chars is treated as a single unit as far
  // as editing and measuring is concerned. This is not fully correct,
  // since some scripts/fonts/browsers also treat other configurations
  // of code points as a group.
  var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
  function isExtendingChar(ch) {
    return ch.charCodeAt(0) >= 768 && extendingChars.test(ch);
  }

  // Returns a number from the range [`0`; `str.length`] unless `pos` is outside that range.
  function skipExtendingChars(str, pos, dir) {
    while ((dir < 0 ? pos > 0 : pos < str.length) && isExtendingChar(str.charAt(pos))) {
      pos += dir;
    }
    return pos;
  }

  // Returns the value from the range [`from`; `to`] that satisfies
  // `pred` and is closest to `from`. Assumes that at least `to`
  // satisfies `pred`. Supports `from` being greater than `to`.
  function findFirst(pred, from, to) {
    // At any point we are certain `to` satisfies `pred`, don't know
    // whether `from` does.
    var dir = from > to ? -1 : 1;
    for (;;) {
      if (from == to) {
        return from;
      }
      var midF = (from + to) / 2,
          mid = dir < 0 ? Math.ceil(midF) : Math.floor(midF);
      if (mid == from) {
        return pred(mid) ? from : to;
      }
      if (pred(mid)) {
        to = mid;
      } else {
        from = mid + dir;
      }
    }
  }

  // The display handles the DOM integration, both for input reading
  // and content drawing. It holds references to DOM nodes and
  // display-related state.

  function Display(place, doc, input) {
    var d = this;
    this.input = input;

    // Covers bottom-right square when both scrollbars are present.
    d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
    d.scrollbarFiller.setAttribute("cm-not-content", "true");
    // Covers bottom of gutter when coverGutterNextToScrollbar is on
    // and h scrollbar is present.
    d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
    d.gutterFiller.setAttribute("cm-not-content", "true");
    // Will contain the actual code, positioned to cover the viewport.
    d.lineDiv = eltP("div", null, "CodeMirror-code");
    // Elements are added to these to represent selection and cursors.
    d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
    d.cursorDiv = elt("div", null, "CodeMirror-cursors");
    // A visibility: hidden element used to find the size of things.
    d.measure = elt("div", null, "CodeMirror-measure");
    // When lines outside of the viewport are measured, they are drawn in this.
    d.lineMeasure = elt("div", null, "CodeMirror-measure");
    // Wraps everything that needs to exist inside the vertically-padded coordinate system
    d.lineSpace = eltP("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv], null, "position: relative; outline: none");
    var lines = eltP("div", [d.lineSpace], "CodeMirror-lines");
    // Moved around its parent to cover visible view.
    d.mover = elt("div", [lines], null, "position: relative");
    // Set to the height of the document, allowing scrolling.
    d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
    d.sizerWidth = null;
    // Behavior of elts with overflow: auto and padding is
    // inconsistent across browsers. This is used to ensure the
    // scrollable area is big enough.
    d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
    // Will contain the gutters, if any.
    d.gutters = elt("div", null, "CodeMirror-gutters");
    d.lineGutter = null;
    // Actual scrollable element.
    d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
    d.scroller.setAttribute("tabIndex", "-1");
    // The element in which the editor lives.
    d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

    // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
    if (ie && ie_version < 8) {
      d.gutters.style.zIndex = -1;d.scroller.style.paddingRight = 0;
    }
    if (!webkit && !(gecko && mobile)) {
      d.scroller.draggable = true;
    }

    if (place) {
      if (place.appendChild) {
        place.appendChild(d.wrapper);
      } else {
        place(d.wrapper);
      }
    }

    // Current rendered range (may be bigger than the view window).
    d.viewFrom = d.viewTo = doc.first;
    d.reportedViewFrom = d.reportedViewTo = doc.first;
    // Information about the rendered lines.
    d.view = [];
    d.renderedView = null;
    // Holds info about a single rendered line when it was rendered
    // for measurement, while not in view.
    d.externalMeasured = null;
    // Empty space (in pixels) above the view
    d.viewOffset = 0;
    d.lastWrapHeight = d.lastWrapWidth = 0;
    d.updateLineNumbers = null;

    d.nativeBarWidth = d.barHeight = d.barWidth = 0;
    d.scrollbarsClipped = false;

    // Used to only resize the line number gutter when necessary (when
    // the amount of lines crosses a boundary that makes its width change)
    d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
    // Set to true when a non-horizontal-scrolling line widget is
    // added. As an optimization, line widget aligning is skipped when
    // this is false.
    d.alignWidgets = false;

    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;

    // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.
    d.maxLine = null;
    d.maxLineLength = 0;
    d.maxLineChanged = false;

    // Used for measuring wheel scrolling granularity
    d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;

    // True when shift is held down.
    d.shift = false;

    // Used to track whether anything happened since the context menu
    // was opened.
    d.selForContextMenu = null;

    d.activeTouch = null;

    input.init(d);
  }

  // Find the line object corresponding to the given line number.
  function getLine(doc, n) {
    n -= doc.first;
    if (n < 0 || n >= doc.size) {
      throw new Error("There is no line " + (n + doc.first) + " in the document.");
    }
    var chunk = doc;
    while (!chunk.lines) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i],
            sz = child.chunkSize();
        if (n < sz) {
          chunk = child;break;
        }
        n -= sz;
      }
    }
    return chunk.lines[n];
  }

  // Get the part of a document between two positions, as an array of
  // strings.
  function getBetween(doc, start, end) {
    var out = [],
        n = start.line;
    doc.iter(start.line, end.line + 1, function (line) {
      var text = line.text;
      if (n == end.line) {
        text = text.slice(0, end.ch);
      }
      if (n == start.line) {
        text = text.slice(start.ch);
      }
      out.push(text);
      ++n;
    });
    return out;
  }
  // Get the lines between from and to, as array of strings.
  function getLines(doc, from, to) {
    var out = [];
    doc.iter(from, to, function (line) {
      out.push(line.text);
    }); // iter aborts when callback returns truthy value
    return out;
  }

  // Update the height of a line, propagating the height change
  // upwards to parent nodes.
  function updateLineHeight(line, height) {
    var diff = height - line.height;
    if (diff) {
      for (var n = line; n; n = n.parent) {
        n.height += diff;
      }
    }
  }

  // Given a line object, find its line number by walking up through
  // its parent links.
  function lineNo(line) {
    if (line.parent == null) {
      return null;
    }
    var cur = line.parent,
        no = indexOf(cur.lines, line);
    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0;; ++i) {
        if (chunk.children[i] == cur) {
          break;
        }
        no += chunk.children[i].chunkSize();
      }
    }
    return no + cur.first;
  }

  // Find the line at the given vertical position, using the height
  // information in the document tree.
  function lineAtHeight(chunk, h) {
    var n = chunk.first;
    outer: do {
      for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
        var child = chunk.children[i$1],
            ch = child.height;
        if (h < ch) {
          chunk = child;continue outer;
        }
        h -= ch;
        n += child.chunkSize();
      }
      return n;
    } while (!chunk.lines);
    var i = 0;
    for (; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i],
          lh = line.height;
      if (h < lh) {
        break;
      }
      h -= lh;
    }
    return n + i;
  }

  function isLine(doc, l) {
    return l >= doc.first && l < doc.first + doc.size;
  }

  function lineNumberFor(options, i) {
    return String(options.lineNumberFormatter(i + options.firstLineNumber));
  }

  // A Pos instance represents a position within the text.
  function Pos(line, ch, sticky) {
    if (sticky === void 0) sticky = null;

    if (!(this instanceof Pos)) {
      return new Pos(line, ch, sticky);
    }
    this.line = line;
    this.ch = ch;
    this.sticky = sticky;
  }

  // Compare two positions, return 0 if they are the same, a negative
  // number when a is less, and a positive number otherwise.
  function cmp(a, b) {
    return a.line - b.line || a.ch - b.ch;
  }

  function equalCursorPos(a, b) {
    return a.sticky == b.sticky && cmp(a, b) == 0;
  }

  function copyPos(x) {
    return Pos(x.line, x.ch);
  }
  function maxPos(a, b) {
    return cmp(a, b) < 0 ? b : a;
  }
  function minPos(a, b) {
    return cmp(a, b) < 0 ? a : b;
  }

  // Most of the external API clips given positions to make sure they
  // actually exist within the document.
  function clipLine(doc, n) {
    return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1));
  }
  function clipPos(doc, pos) {
    if (pos.line < doc.first) {
      return Pos(doc.first, 0);
    }
    var last = doc.first + doc.size - 1;
    if (pos.line > last) {
      return Pos(last, getLine(doc, last).text.length);
    }
    return clipToLen(pos, getLine(doc, pos.line).text.length);
  }
  function clipToLen(pos, linelen) {
    var ch = pos.ch;
    if (ch == null || ch > linelen) {
      return Pos(pos.line, linelen);
    } else if (ch < 0) {
      return Pos(pos.line, 0);
    } else {
      return pos;
    }
  }
  function clipPosArray(doc, array) {
    var out = [];
    for (var i = 0; i < array.length; i++) {
      out[i] = clipPos(doc, array[i]);
    }
    return out;
  }

  // Optimize some code when these features are not used.
  var sawReadOnlySpans = false;
  var sawCollapsedSpans = false;
  function seeReadOnlySpans() {
    sawReadOnlySpans = true;
  }

  function seeCollapsedSpans() {
    sawCollapsedSpans = true;
  }

  // TEXTMARKER SPANS

  function MarkedSpan(marker, from, to) {
    this.marker = marker;
    this.from = from;this.to = to;
  }

  // Search an array of spans for a span matching the given marker.
  function getMarkedSpanFor(spans, marker) {
    if (spans) {
      for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if (span.marker == marker) {
          return span;
        }
      }
    }
  }
  // Remove a span from an array, returning undefined if no spans are
  // left (we don't store arrays for lines without spans).
  function removeMarkedSpan(spans, span) {
    var r;
    for (var i = 0; i < spans.length; ++i) {
      if (spans[i] != span) {
        (r || (r = [])).push(spans[i]);
      }
    }
    return r;
  }
  // Add a span to a line.
  function addMarkedSpan(line, span) {
    line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
    span.marker.attachLine(line);
  }

  // Used for the algorithm that adjusts markers for a change in the
  // document. These functions cut an array of spans at a given
  // character position, returning an array of remaining chunks (or
  // undefined if nothing remains).
  function markedSpansBefore(old, startCh, isInsert) {
    var nw;
    if (old) {
      for (var i = 0; i < old.length; ++i) {
        var span = old[i],
            marker = span.marker;
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
        if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
          var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);(nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
        }
      }
    }
    return nw;
  }
  function markedSpansAfter(old, endCh, isInsert) {
    var nw;
    if (old) {
      for (var i = 0; i < old.length; ++i) {
        var span = old[i],
            marker = span.marker;
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
        if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
          var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);(nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh, span.to == null ? null : span.to - endCh));
        }
      }
    }
    return nw;
  }

  // Given a change object, compute the new set of marker spans that
  // cover the line in which the change took place. Removes spans
  // entirely within the change, reconnects spans belonging to the
  // same marker that appear on both sides of the change, and cuts off
  // spans partially within the change. Returns an array of span
  // arrays with one element for each line in (after) the change.
  function stretchSpansOverChange(doc, change) {
    if (change.full) {
      return null;
    }
    var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
    var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
    if (!oldFirst && !oldLast) {
      return null;
    }

    var startCh = change.from.ch,
        endCh = change.to.ch,
        isInsert = cmp(change.from, change.to) == 0;
    // Get the spans that 'stick out' on both sides
    var first = markedSpansBefore(oldFirst, startCh, isInsert);
    var last = markedSpansAfter(oldLast, endCh, isInsert);

    // Next, merge those two ends
    var sameLine = change.text.length == 1,
        offset = lst(change.text).length + (sameLine ? startCh : 0);
    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];
        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);
          if (!found) {
            span.to = startCh;
          } else if (sameLine) {
            span.to = found.to == null ? null : found.to + offset;
          }
        }
      }
    }
    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i$1 = 0; i$1 < last.length; ++i$1) {
        var span$1 = last[i$1];
        if (span$1.to != null) {
          span$1.to += offset;
        }
        if (span$1.from == null) {
          var found$1 = getMarkedSpanFor(first, span$1.marker);
          if (!found$1) {
            span$1.from = offset;
            if (sameLine) {
              (first || (first = [])).push(span$1);
            }
          }
        } else {
          span$1.from += offset;
          if (sameLine) {
            (first || (first = [])).push(span$1);
          }
        }
      }
    }
    // Make sure we didn't create any zero-length spans
    if (first) {
      first = clearEmptySpans(first);
    }
    if (last && last != first) {
      last = clearEmptySpans(last);
    }

    var newMarkers = [first];
    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = change.text.length - 2,
          gapMarkers;
      if (gap > 0 && first) {
        for (var i$2 = 0; i$2 < first.length; ++i$2) {
          if (first[i$2].to == null) {
            (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker, null, null));
          }
        }
      }
      for (var i$3 = 0; i$3 < gap; ++i$3) {
        newMarkers.push(gapMarkers);
      }
      newMarkers.push(last);
    }
    return newMarkers;
  }

  // Remove spans that are empty and don't have a clearWhenEmpty
  // option of false.
  function clearEmptySpans(spans) {
    for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false) {
        spans.splice(i--, 1);
      }
    }
    if (!spans.length) {
      return null;
    }
    return spans;
  }

  // Used to 'clip' out readOnly ranges when making a change.
  function removeReadOnlyRanges(doc, from, to) {
    var markers = null;
    doc.iter(from.line, to.line + 1, function (line) {
      if (line.markedSpans) {
        for (var i = 0; i < line.markedSpans.length; ++i) {
          var mark = line.markedSpans[i].marker;
          if (mark.readOnly && (!markers || indexOf(markers, mark) == -1)) {
            (markers || (markers = [])).push(mark);
          }
        }
      }
    });
    if (!markers) {
      return null;
    }
    var parts = [{ from: from, to: to }];
    for (var i = 0; i < markers.length; ++i) {
      var mk = markers[i],
          m = mk.find(0);
      for (var j = 0; j < parts.length; ++j) {
        var p = parts[j];
        if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) {
          continue;
        }
        var newParts = [j, 1],
            dfrom = cmp(p.from, m.from),
            dto = cmp(p.to, m.to);
        if (dfrom < 0 || !mk.inclusiveLeft && !dfrom) {
          newParts.push({ from: p.from, to: m.from });
        }
        if (dto > 0 || !mk.inclusiveRight && !dto) {
          newParts.push({ from: m.to, to: p.to });
        }
        parts.splice.apply(parts, newParts);
        j += newParts.length - 3;
      }
    }
    return parts;
  }

  // Connect or disconnect spans from a line.
  function detachMarkedSpans(line) {
    var spans = line.markedSpans;
    if (!spans) {
      return;
    }
    for (var i = 0; i < spans.length; ++i) {
      spans[i].marker.detachLine(line);
    }
    line.markedSpans = null;
  }
  function attachMarkedSpans(line, spans) {
    if (!spans) {
      return;
    }
    for (var i = 0; i < spans.length; ++i) {
      spans[i].marker.attachLine(line);
    }
    line.markedSpans = spans;
  }

  // Helpers used when computing which overlapping collapsed span
  // counts as the larger one.
  function extraLeft(marker) {
    return marker.inclusiveLeft ? -1 : 0;
  }
  function extraRight(marker) {
    return marker.inclusiveRight ? 1 : 0;
  }

  // Returns a number indicating which of two overlapping collapsed
  // spans is larger (and thus includes the other). Falls back to
  // comparing ids when the spans cover exactly the same range.
  function compareCollapsedMarkers(a, b) {
    var lenDiff = a.lines.length - b.lines.length;
    if (lenDiff != 0) {
      return lenDiff;
    }
    var aPos = a.find(),
        bPos = b.find();
    var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
    if (fromCmp) {
      return -fromCmp;
    }
    var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
    if (toCmp) {
      return toCmp;
    }
    return b.id - a.id;
  }

  // Find out whether a line ends or starts in a collapsed span. If
  // so, return the marker for that span.
  function collapsedSpanAtSide(line, start) {
    var sps = sawCollapsedSpans && line.markedSpans,
        found;
    if (sps) {
      for (var sp = void 0, i = 0; i < sps.length; ++i) {
        sp = sps[i];
        if (sp.marker.collapsed && (start ? sp.from : sp.to) == null && (!found || compareCollapsedMarkers(found, sp.marker) < 0)) {
          found = sp.marker;
        }
      }
    }
    return found;
  }
  function collapsedSpanAtStart(line) {
    return collapsedSpanAtSide(line, true);
  }
  function collapsedSpanAtEnd(line) {
    return collapsedSpanAtSide(line, false);
  }

  // Test whether there exists a collapsed span that partially
  // overlaps (covers the start or end, but not both) of a new span.
  // Such overlap is not allowed.
  function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
    var line = getLine(doc, lineNo);
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) {
      for (var i = 0; i < sps.length; ++i) {
        var sp = sps[i];
        if (!sp.marker.collapsed) {
          continue;
        }
        var found = sp.marker.find(0);
        var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
        var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
        if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) {
          continue;
        }
        if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) || fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0)) {
          return true;
        }
      }
    }
  }

  // A visual line is a line as drawn on the screen. Folding, for
  // example, can cause multiple logical lines to appear on the same
  // visual line. This finds the start of the visual line that the
  // given line is part of (usually that is the line itself).
  function visualLine(line) {
    var merged;
    while (merged = collapsedSpanAtStart(line)) {
      line = merged.find(-1, true).line;
    }
    return line;
  }

  function visualLineEnd(line) {
    var merged;
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
    }
    return line;
  }

  // Returns an array of logical lines that continue the visual line
  // started by the argument, or undefined if there are no such lines.
  function visualLineContinued(line) {
    var merged, lines;
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;(lines || (lines = [])).push(line);
    }
    return lines;
  }

  // Get the line number of the start of the visual line that the
  // given line number is part of.
  function visualLineNo(doc, lineN) {
    var line = getLine(doc, lineN),
        vis = visualLine(line);
    if (line == vis) {
      return lineN;
    }
    return lineNo(vis);
  }

  // Get the line number of the start of the next visual line after
  // the given line.
  function visualLineEndNo(doc, lineN) {
    if (lineN > doc.lastLine()) {
      return lineN;
    }
    var line = getLine(doc, lineN),
        merged;
    if (!lineIsHidden(doc, line)) {
      return lineN;
    }
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
    }
    return lineNo(line) + 1;
  }

  // Compute whether a line is hidden. Lines count as hidden when they
  // are part of a visual line that starts with another line, or when
  // they are entirely covered by collapsed, non-widget span.
  function lineIsHidden(doc, line) {
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) {
      for (var sp = void 0, i = 0; i < sps.length; ++i) {
        sp = sps[i];
        if (!sp.marker.collapsed) {
          continue;
        }
        if (sp.from == null) {
          return true;
        }
        if (sp.marker.widgetNode) {
          continue;
        }
        if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp)) {
          return true;
        }
      }
    }
  }
  function lineIsHiddenInner(doc, line, span) {
    if (span.to == null) {
      var end = span.marker.find(1, true);
      return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker));
    }
    if (span.marker.inclusiveRight && span.to == line.text.length) {
      return true;
    }
    for (var sp = void 0, i = 0; i < line.markedSpans.length; ++i) {
      sp = line.markedSpans[i];
      if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to && (sp.to == null || sp.to != span.from) && (sp.marker.inclusiveLeft || span.marker.inclusiveRight) && lineIsHiddenInner(doc, line, sp)) {
        return true;
      }
    }
  }

  // Find the height above the given line.
  function heightAtLine(lineObj) {
    lineObj = visualLine(lineObj);

    var h = 0,
        chunk = lineObj.parent;
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i];
      if (line == lineObj) {
        break;
      } else {
        h += line.height;
      }
    }
    for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
      for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
        var cur = p.children[i$1];
        if (cur == chunk) {
          break;
        } else {
          h += cur.height;
        }
      }
    }
    return h;
  }

  // Compute the character length of a line, taking into account
  // collapsed ranges (see markText) that might hide parts, and join
  // other lines onto it.
  function lineLength(line) {
    if (line.height == 0) {
      return 0;
    }
    var len = line.text.length,
        merged,
        cur = line;
    while (merged = collapsedSpanAtStart(cur)) {
      var found = merged.find(0, true);
      cur = found.from.line;
      len += found.from.ch - found.to.ch;
    }
    cur = line;
    while (merged = collapsedSpanAtEnd(cur)) {
      var found$1 = merged.find(0, true);
      len -= cur.text.length - found$1.from.ch;
      cur = found$1.to.line;
      len += cur.text.length - found$1.to.ch;
    }
    return len;
  }

  // Find the longest line in the document.
  function findMaxLine(cm) {
    var d = cm.display,
        doc = cm.doc;
    d.maxLine = getLine(doc, doc.first);
    d.maxLineLength = lineLength(d.maxLine);
    d.maxLineChanged = true;
    doc.iter(function (line) {
      var len = lineLength(line);
      if (len > d.maxLineLength) {
        d.maxLineLength = len;
        d.maxLine = line;
      }
    });
  }

  // BIDI HELPERS

  function iterateBidiSections(order, from, to, f) {
    if (!order) {
      return f(from, to, "ltr", 0);
    }
    var found = false;
    for (var i = 0; i < order.length; ++i) {
      var part = order[i];
      if (part.from < to && part.to > from || from == to && part.to == from) {
        f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr", i);
        found = true;
      }
    }
    if (!found) {
      f(from, to, "ltr");
    }
  }

  var bidiOther = null;
  function getBidiPartAt(order, ch, sticky) {
    var found;
    bidiOther = null;
    for (var i = 0; i < order.length; ++i) {
      var cur = order[i];
      if (cur.from < ch && cur.to > ch) {
        return i;
      }
      if (cur.to == ch) {
        if (cur.from != cur.to && sticky == "before") {
          found = i;
        } else {
          bidiOther = i;
        }
      }
      if (cur.from == ch) {
        if (cur.from != cur.to && sticky != "before") {
          found = i;
        } else {
          bidiOther = i;
        }
      }
    }
    return found != null ? found : bidiOther;
  }

  // Bidirectional ordering algorithm
  // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
  // that this (partially) implements.

  // One-char codes used for character types:
  // L (L):   Left-to-Right
  // R (R):   Right-to-Left
  // r (AL):  Right-to-Left Arabic
  // 1 (EN):  European Number
  // + (ES):  European Number Separator
  // % (ET):  European Number Terminator
  // n (AN):  Arabic Number
  // , (CS):  Common Number Separator
  // m (NSM): Non-Spacing Mark
  // b (BN):  Boundary Neutral
  // s (B):   Paragraph Separator
  // t (S):   Segment Separator
  // w (WS):  Whitespace
  // N (ON):  Other Neutrals

  // Returns null if characters are ordered as they appear
  // (left-to-right), or an array of sections ({from, to, level}
  // objects) in the order in which they occur visually.
  var bidiOrdering = function () {
    // Character types for codepoints 0 to 0xff
    var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
    // Character types for codepoints 0x600 to 0x6f9
    var arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";
    function charType(code) {
      if (code <= 0xf7) {
        return lowTypes.charAt(code);
      } else if (0x590 <= code && code <= 0x5f4) {
        return "R";
      } else if (0x600 <= code && code <= 0x6f9) {
        return arabicTypes.charAt(code - 0x600);
      } else if (0x6ee <= code && code <= 0x8ac) {
        return "r";
      } else if (0x2000 <= code && code <= 0x200b) {
        return "w";
      } else if (code == 0x200c) {
        return "b";
      } else {
        return "L";
      }
    }

    var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
    var isNeutral = /[stwN]/,
        isStrong = /[LRr]/,
        countsAsLeft = /[Lb1n]/,
        countsAsNum = /[1n]/;

    function BidiSpan(level, from, to) {
      this.level = level;
      this.from = from;this.to = to;
    }

    return function (str, direction) {
      var outerType = direction == "ltr" ? "L" : "R";

      if (str.length == 0 || direction == "ltr" && !bidiRE.test(str)) {
        return false;
      }
      var len = str.length,
          types = [];
      for (var i = 0; i < len; ++i) {
        types.push(charType(str.charCodeAt(i)));
      }

      // W1. Examine each non-spacing mark (NSM) in the level run, and
      // change the type of the NSM to the type of the previous
      // character. If the NSM is at the start of the level run, it will
      // get the type of sor.
      for (var i$1 = 0, prev = outerType; i$1 < len; ++i$1) {
        var type = types[i$1];
        if (type == "m") {
          types[i$1] = prev;
        } else {
          prev = type;
        }
      }

      // W2. Search backwards from each instance of a European number
      // until the first strong type (R, L, AL, or sor) is found. If an
      // AL is found, change the type of the European number to Arabic
      // number.
      // W3. Change all ALs to R.
      for (var i$2 = 0, cur = outerType; i$2 < len; ++i$2) {
        var type$1 = types[i$2];
        if (type$1 == "1" && cur == "r") {
          types[i$2] = "n";
        } else if (isStrong.test(type$1)) {
          cur = type$1;if (type$1 == "r") {
            types[i$2] = "R";
          }
        }
      }

      // W4. A single European separator between two European numbers
      // changes to a European number. A single common separator between
      // two numbers of the same type changes to that type.
      for (var i$3 = 1, prev$1 = types[0]; i$3 < len - 1; ++i$3) {
        var type$2 = types[i$3];
        if (type$2 == "+" && prev$1 == "1" && types[i$3 + 1] == "1") {
          types[i$3] = "1";
        } else if (type$2 == "," && prev$1 == types[i$3 + 1] && (prev$1 == "1" || prev$1 == "n")) {
          types[i$3] = prev$1;
        }
        prev$1 = type$2;
      }

      // W5. A sequence of European terminators adjacent to European
      // numbers changes to all European numbers.
      // W6. Otherwise, separators and terminators change to Other
      // Neutral.
      for (var i$4 = 0; i$4 < len; ++i$4) {
        var type$3 = types[i$4];
        if (type$3 == ",") {
          types[i$4] = "N";
        } else if (type$3 == "%") {
          var end = void 0;
          for (end = i$4 + 1; end < len && types[end] == "%"; ++end) {}
          var replace = i$4 && types[i$4 - 1] == "!" || end < len && types[end] == "1" ? "1" : "N";
          for (var j = i$4; j < end; ++j) {
            types[j] = replace;
          }
          i$4 = end - 1;
        }
      }

      // W7. Search backwards from each instance of a European number
      // until the first strong type (R, L, or sor) is found. If an L is
      // found, then change the type of the European number to L.
      for (var i$5 = 0, cur$1 = outerType; i$5 < len; ++i$5) {
        var type$4 = types[i$5];
        if (cur$1 == "L" && type$4 == "1") {
          types[i$5] = "L";
        } else if (isStrong.test(type$4)) {
          cur$1 = type$4;
        }
      }

      // N1. A sequence of neutrals takes the direction of the
      // surrounding strong text if the text on both sides has the same
      // direction. European and Arabic numbers act as if they were R in
      // terms of their influence on neutrals. Start-of-level-run (sor)
      // and end-of-level-run (eor) are used at level run boundaries.
      // N2. Any remaining neutrals take the embedding direction.
      for (var i$6 = 0; i$6 < len; ++i$6) {
        if (isNeutral.test(types[i$6])) {
          var end$1 = void 0;
          for (end$1 = i$6 + 1; end$1 < len && isNeutral.test(types[end$1]); ++end$1) {}
          var before = (i$6 ? types[i$6 - 1] : outerType) == "L";
          var after = (end$1 < len ? types[end$1] : outerType) == "L";
          var replace$1 = before == after ? before ? "L" : "R" : outerType;
          for (var j$1 = i$6; j$1 < end$1; ++j$1) {
            types[j$1] = replace$1;
          }
          i$6 = end$1 - 1;
        }
      }

      // Here we depart from the documented algorithm, in order to avoid
      // building up an actual levels array. Since there are only three
      // levels (0, 1, 2) in an implementation that doesn't take
      // explicit embedding into account, we can build up the order on
      // the fly, without following the level-based algorithm.
      var order = [],
          m;
      for (var i$7 = 0; i$7 < len;) {
        if (countsAsLeft.test(types[i$7])) {
          var start = i$7;
          for (++i$7; i$7 < len && countsAsLeft.test(types[i$7]); ++i$7) {}
          order.push(new BidiSpan(0, start, i$7));
        } else {
          var pos = i$7,
              at = order.length;
          for (++i$7; i$7 < len && types[i$7] != "L"; ++i$7) {}
          for (var j$2 = pos; j$2 < i$7;) {
            if (countsAsNum.test(types[j$2])) {
              if (pos < j$2) {
                order.splice(at, 0, new BidiSpan(1, pos, j$2));
              }
              var nstart = j$2;
              for (++j$2; j$2 < i$7 && countsAsNum.test(types[j$2]); ++j$2) {}
              order.splice(at, 0, new BidiSpan(2, nstart, j$2));
              pos = j$2;
            } else {
              ++j$2;
            }
          }
          if (pos < i$7) {
            order.splice(at, 0, new BidiSpan(1, pos, i$7));
          }
        }
      }
      if (direction == "ltr") {
        if (order[0].level == 1 && (m = str.match(/^\s+/))) {
          order[0].from = m[0].length;
          order.unshift(new BidiSpan(0, 0, m[0].length));
        }
        if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
          lst(order).to -= m[0].length;
          order.push(new BidiSpan(0, len - m[0].length, len));
        }
      }

      return direction == "rtl" ? order.reverse() : order;
    };
  }();

  // Get the bidi ordering for the given line (and cache it). Returns
  // false for lines that are fully left-to-right, and an array of
  // BidiSpan objects otherwise.
  function getOrder(line, direction) {
    var order = line.order;
    if (order == null) {
      order = line.order = bidiOrdering(line.text, direction);
    }
    return order;
  }

  // EVENT HANDLING

  // Lightweight event framework. on/off also work on DOM nodes,
  // registering native DOM handlers.

  var noHandlers = [];

  var on = function (emitter, type, f) {
    if (emitter.addEventListener) {
      emitter.addEventListener(type, f, false);
    } else if (emitter.attachEvent) {
      emitter.attachEvent("on" + type, f);
    } else {
      var map = emitter._handlers || (emitter._handlers = {});
      map[type] = (map[type] || noHandlers).concat(f);
    }
  };

  function getHandlers(emitter, type) {
    return emitter._handlers && emitter._handlers[type] || noHandlers;
  }

  function off(emitter, type, f) {
    if (emitter.removeEventListener) {
      emitter.removeEventListener(type, f, false);
    } else if (emitter.detachEvent) {
      emitter.detachEvent("on" + type, f);
    } else {
      var map = emitter._handlers,
          arr = map && map[type];
      if (arr) {
        var index = indexOf(arr, f);
        if (index > -1) {
          map[type] = arr.slice(0, index).concat(arr.slice(index + 1));
        }
      }
    }
  }

  function signal(emitter, type /*, values...*/) {
    var handlers = getHandlers(emitter, type);
    if (!handlers.length) {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < handlers.length; ++i) {
      handlers[i].apply(null, args);
    }
  }

  // The DOM events that CodeMirror handles can be overridden by
  // registering a (non-DOM) handler on the editor for the event name,
  // and preventDefault-ing the event in that handler.
  function signalDOMEvent(cm, e, override) {
    if (typeof e == "string") {
      e = { type: e, preventDefault: function () {
          this.defaultPrevented = true;
        } };
    }
    signal(cm, override || e.type, cm, e);
    return e_defaultPrevented(e) || e.codemirrorIgnore;
  }

  function signalCursorActivity(cm) {
    var arr = cm._handlers && cm._handlers.cursorActivity;
    if (!arr) {
      return;
    }
    var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
    for (var i = 0; i < arr.length; ++i) {
      if (indexOf(set, arr[i]) == -1) {
        set.push(arr[i]);
      }
    }
  }

  function hasHandler(emitter, type) {
    return getHandlers(emitter, type).length > 0;
  }

  // Add on and off methods to a constructor's prototype, to make
  // registering events on such objects more convenient.
  function eventMixin(ctor) {
    ctor.prototype.on = function (type, f) {
      on(this, type, f);
    };
    ctor.prototype.off = function (type, f) {
      off(this, type, f);
    };
  }

  // Due to the fact that we still support jurassic IE versions, some
  // compatibility wrappers are needed.

  function e_preventDefault(e) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }
  function e_stopPropagation(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  }
  function e_defaultPrevented(e) {
    return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false;
  }
  function e_stop(e) {
    e_preventDefault(e);e_stopPropagation(e);
  }

  function e_target(e) {
    return e.target || e.srcElement;
  }
  function e_button(e) {
    var b = e.which;
    if (b == null) {
      if (e.button & 1) {
        b = 1;
      } else if (e.button & 2) {
        b = 3;
      } else if (e.button & 4) {
        b = 2;
      }
    }
    if (mac && e.ctrlKey && b == 1) {
      b = 3;
    }
    return b;
  }

  // Detect drag-and-drop
  var dragAndDrop = function () {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie && ie_version < 9) {
      return false;
    }
    var div = elt('div');
    return "draggable" in div || "dragDrop" in div;
  }();

  var zwspSupported;
  function zeroWidthElement(measure) {
    if (zwspSupported == null) {
      var test = elt("span", "\u200b");
      removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
      if (measure.firstChild.offsetHeight != 0) {
        zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8);
      }
    }
    var node = zwspSupported ? elt("span", "\u200b") : elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
    node.setAttribute("cm-text", "");
    return node;
  }

  // Feature-detect IE's crummy client rect reporting for bidi text
  var badBidiRects;
  function hasBadBidiRects(measure) {
    if (badBidiRects != null) {
      return badBidiRects;
    }
    var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
    var r0 = range(txt, 0, 1).getBoundingClientRect();
    var r1 = range(txt, 1, 2).getBoundingClientRect();
    removeChildren(measure);
    if (!r0 || r0.left == r0.right) {
      return false;
    } // Safari returns null in some cases (#2780)
    return badBidiRects = r1.right - r0.right < 3;
  }

  // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.
  var splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? function (string) {
    var pos = 0,
        result = [],
        l = string.length;
    while (pos <= l) {
      var nl = string.indexOf("\n", pos);
      if (nl == -1) {
        nl = string.length;
      }
      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");
      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }
    return result;
  } : function (string) {
    return string.split(/\r\n?|\n/);
  };

  var hasSelection = window.getSelection ? function (te) {
    try {
      return te.selectionStart != te.selectionEnd;
    } catch (e) {
      return false;
    }
  } : function (te) {
    var range;
    try {
      range = te.ownerDocument.selection.createRange();
    } catch (e) {}
    if (!range || range.parentElement() != te) {
      return false;
    }
    return range.compareEndPoints("StartToEnd", range) != 0;
  };

  var hasCopyEvent = function () {
    var e = elt("div");
    if ("oncopy" in e) {
      return true;
    }
    e.setAttribute("oncopy", "return;");
    return typeof e.oncopy == "function";
  }();

  var badZoomedRects = null;
  function hasBadZoomedRects(measure) {
    if (badZoomedRects != null) {
      return badZoomedRects;
    }
    var node = removeChildrenAndAdd(measure, elt("span", "x"));
    var normal = node.getBoundingClientRect();
    var fromRange = range(node, 0, 1).getBoundingClientRect();
    return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1;
  }

  var modes = {};
  var mimeModes = {};
  // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)
  function defineMode(name, mode) {
    if (arguments.length > 2) {
      mode.dependencies = Array.prototype.slice.call(arguments, 2);
    }
    modes[name] = mode;
  }

  function defineMIME(mime, spec) {
    mimeModes[mime] = spec;
  }

  // Given a MIME type, a {name, ...options} config object, or a name
  // string, return a mode config object.
  function resolveMode(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
      spec = mimeModes[spec];
    } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
      var found = mimeModes[spec.name];
      if (typeof found == "string") {
        found = { name: found };
      }
      spec = createObj(found, spec);
      spec.name = found.name;
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
      return resolveMode("application/xml");
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) {
      return resolveMode("application/json");
    }
    if (typeof spec == "string") {
      return { name: spec };
    } else {
      return spec || { name: "null" };
    }
  }

  // Given a mode spec (anything that resolveMode accepts), find and
  // initialize an actual mode object.
  function getMode(options, spec) {
    spec = resolveMode(spec);
    var mfactory = modes[spec.name];
    if (!mfactory) {
      return getMode(options, "text/plain");
    }
    var modeObj = mfactory(options, spec);
    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];
      for (var prop in exts) {
        if (!exts.hasOwnProperty(prop)) {
          continue;
        }
        if (modeObj.hasOwnProperty(prop)) {
          modeObj["_" + prop] = modeObj[prop];
        }
        modeObj[prop] = exts[prop];
      }
    }
    modeObj.name = spec.name;
    if (spec.helperType) {
      modeObj.helperType = spec.helperType;
    }
    if (spec.modeProps) {
      for (var prop$1 in spec.modeProps) {
        modeObj[prop$1] = spec.modeProps[prop$1];
      }
    }

    return modeObj;
  }

  // This can be used to attach properties to mode objects from
  // outside the actual mode definition.
  var modeExtensions = {};
  function extendMode(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : modeExtensions[mode] = {};
    copyObj(properties, exts);
  }

  function copyState(mode, state) {
    if (state === true) {
      return state;
    }
    if (mode.copyState) {
      return mode.copyState(state);
    }
    var nstate = {};
    for (var n in state) {
      var val = state[n];
      if (val instanceof Array) {
        val = val.concat([]);
      }
      nstate[n] = val;
    }
    return nstate;
  }

  // Given a mode and a state (for that mode), find the inner mode and
  // state at the position that the state refers to.
  function innerMode(mode, state) {
    var info;
    while (mode.innerMode) {
      info = mode.innerMode(state);
      if (!info || info.mode == mode) {
        break;
      }
      state = info.state;
      mode = info.mode;
    }
    return info || { mode: mode, state: state };
  }

  function startState(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true;
  }

  // STRING STREAM

  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.

  var StringStream = function (string, tabSize, lineOracle) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
    this.lineOracle = lineOracle;
  };

  StringStream.prototype.eol = function () {
    return this.pos >= this.string.length;
  };
  StringStream.prototype.sol = function () {
    return this.pos == this.lineStart;
  };
  StringStream.prototype.peek = function () {
    return this.string.charAt(this.pos) || undefined;
  };
  StringStream.prototype.next = function () {
    if (this.pos < this.string.length) {
      return this.string.charAt(this.pos++);
    }
  };
  StringStream.prototype.eat = function (match) {
    var ch = this.string.charAt(this.pos);
    var ok;
    if (typeof match == "string") {
      ok = ch == match;
    } else {
      ok = ch && (match.test ? match.test(ch) : match(ch));
    }
    if (ok) {
      ++this.pos;return ch;
    }
  };
  StringStream.prototype.eatWhile = function (match) {
    var start = this.pos;
    while (this.eat(match)) {}
    return this.pos > start;
  };
  StringStream.prototype.eatSpace = function () {
    var this$1 = this;

    var start = this.pos;
    while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) {
      ++this$1.pos;
    }
    return this.pos > start;
  };
  StringStream.prototype.skipToEnd = function () {
    this.pos = this.string.length;
  };
  StringStream.prototype.skipTo = function (ch) {
    var found = this.string.indexOf(ch, this.pos);
    if (found > -1) {
      this.pos = found;return true;
    }
  };
  StringStream.prototype.backUp = function (n) {
    this.pos -= n;
  };
  StringStream.prototype.column = function () {
    if (this.lastColumnPos < this.start) {
      this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
      this.lastColumnPos = this.start;
    }
    return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
  };
  StringStream.prototype.indentation = function () {
    return countColumn(this.string, null, this.tabSize) - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
  };
  StringStream.prototype.match = function (pattern, consume, caseInsensitive) {
    if (typeof pattern == "string") {
      var cased = function (str) {
        return caseInsensitive ? str.toLowerCase() : str;
      };
      var substr = this.string.substr(this.pos, pattern.length);
      if (cased(substr) == cased(pattern)) {
        if (consume !== false) {
          this.pos += pattern.length;
        }
        return true;
      }
    } else {
      var match = this.string.slice(this.pos).match(pattern);
      if (match && match.index > 0) {
        return null;
      }
      if (match && consume !== false) {
        this.pos += match[0].length;
      }
      return match;
    }
  };
  StringStream.prototype.current = function () {
    return this.string.slice(this.start, this.pos);
  };
  StringStream.prototype.hideFirstChars = function (n, inner) {
    this.lineStart += n;
    try {
      return inner();
    } finally {
      this.lineStart -= n;
    }
  };
  StringStream.prototype.lookAhead = function (n) {
    var oracle = this.lineOracle;
    return oracle && oracle.lookAhead(n);
  };
  StringStream.prototype.baseToken = function () {
    var oracle = this.lineOracle;
    return oracle && oracle.baseToken(this.pos);
  };

  var SavedContext = function (state, lookAhead) {
    this.state = state;
    this.lookAhead = lookAhead;
  };

  var Context = function (doc, state, line, lookAhead) {
    this.state = state;
    this.doc = doc;
    this.line = line;
    this.maxLookAhead = lookAhead || 0;
    this.baseTokens = null;
    this.baseTokenPos = 1;
  };

  Context.prototype.lookAhead = function (n) {
    var line = this.doc.getLine(this.line + n);
    if (line != null && n > this.maxLookAhead) {
      this.maxLookAhead = n;
    }
    return line;
  };

  Context.prototype.baseToken = function (n) {
    var this$1 = this;

    if (!this.baseTokens) {
      return null;
    }
    while (this.baseTokens[this.baseTokenPos] <= n) {
      this$1.baseTokenPos += 2;
    }
    var type = this.baseTokens[this.baseTokenPos + 1];
    return { type: type && type.replace(/( |^)overlay .*/, ""),
      size: this.baseTokens[this.baseTokenPos] - n };
  };

  Context.prototype.nextLine = function () {
    this.line++;
    if (this.maxLookAhead > 0) {
      this.maxLookAhead--;
    }
  };

  Context.fromSaved = function (doc, saved, line) {
    if (saved instanceof SavedContext) {
      return new Context(doc, copyState(doc.mode, saved.state), line, saved.lookAhead);
    } else {
      return new Context(doc, copyState(doc.mode, saved), line);
    }
  };

  Context.prototype.save = function (copy) {
    var state = copy !== false ? copyState(this.doc.mode, this.state) : this.state;
    return this.maxLookAhead > 0 ? new SavedContext(state, this.maxLookAhead) : state;
  };

  // Compute a style array (an array starting with a mode generation
  // -- for invalidation -- followed by pairs of end positions and
  // style strings), which is used to highlight the tokens on the
  // line.
  function highlightLine(cm, line, context, forceToEnd) {
    // A styles array always starts with a number identifying the
    // mode/overlays that it is based on (for easy invalidation).
    var st = [cm.state.modeGen],
        lineClasses = {};
    // Compute the base array of styles
    runMode(cm, line.text, cm.doc.mode, context, function (end, style) {
      return st.push(end, style);
    }, lineClasses, forceToEnd);
    var state = context.state;

    // Run overlays, adjust style array.
    var loop = function (o) {
      context.baseTokens = st;
      var overlay = cm.state.overlays[o],
          i = 1,
          at = 0;
      context.state = true;
      runMode(cm, line.text, overlay.mode, context, function (end, style) {
        var start = i;
        // Ensure there's a token end at the current position, and that i points at it
        while (at < end) {
          var i_end = st[i];
          if (i_end > end) {
            st.splice(i, 1, end, st[i + 1], i_end);
          }
          i += 2;
          at = Math.min(end, i_end);
        }
        if (!style) {
          return;
        }
        if (overlay.opaque) {
          st.splice(start, i - start, end, "overlay " + style);
          i = start + 2;
        } else {
          for (; start < i; start += 2) {
            var cur = st[start + 1];
            st[start + 1] = (cur ? cur + " " : "") + "overlay " + style;
          }
        }
      }, lineClasses);
      context.state = state;
      context.baseTokens = null;
      context.baseTokenPos = 1;
    };

    for (var o = 0; o < cm.state.overlays.length; ++o) loop(o);

    return { styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null };
  }

  function getLineStyles(cm, line, updateFrontier) {
    if (!line.styles || line.styles[0] != cm.state.modeGen) {
      var context = getContextBefore(cm, lineNo(line));
      var resetState = line.text.length > cm.options.maxHighlightLength && copyState(cm.doc.mode, context.state);
      var result = highlightLine(cm, line, context);
      if (resetState) {
        context.state = resetState;
      }
      line.stateAfter = context.save(!resetState);
      line.styles = result.styles;
      if (result.classes) {
        line.styleClasses = result.classes;
      } else if (line.styleClasses) {
        line.styleClasses = null;
      }
      if (updateFrontier === cm.doc.highlightFrontier) {
        cm.doc.modeFrontier = Math.max(cm.doc.modeFrontier, ++cm.doc.highlightFrontier);
      }
    }
    return line.styles;
  }

  function getContextBefore(cm, n, precise) {
    var doc = cm.doc,
        display = cm.display;
    if (!doc.mode.startState) {
      return new Context(doc, true, n);
    }
    var start = findStartLine(cm, n, precise);
    var saved = start > doc.first && getLine(doc, start - 1).stateAfter;
    var context = saved ? Context.fromSaved(doc, saved, start) : new Context(doc, startState(doc.mode), start);

    doc.iter(start, n, function (line) {
      processLine(cm, line.text, context);
      var pos = context.line;
      line.stateAfter = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo ? context.save() : null;
      context.nextLine();
    });
    if (precise) {
      doc.modeFrontier = context.line;
    }
    return context;
  }

  // Lightweight form of highlight -- proceed over this line and
  // update state, but don't save a style array. Used for lines that
  // aren't currently visible.
  function processLine(cm, text, context, startAt) {
    var mode = cm.doc.mode;
    var stream = new StringStream(text, cm.options.tabSize, context);
    stream.start = stream.pos = startAt || 0;
    if (text == "") {
      callBlankLine(mode, context.state);
    }
    while (!stream.eol()) {
      readToken(mode, stream, context.state);
      stream.start = stream.pos;
    }
  }

  function callBlankLine(mode, state) {
    if (mode.blankLine) {
      return mode.blankLine(state);
    }
    if (!mode.innerMode) {
      return;
    }
    var inner = innerMode(mode, state);
    if (inner.mode.blankLine) {
      return inner.mode.blankLine(inner.state);
    }
  }

  function readToken(mode, stream, state, inner) {
    for (var i = 0; i < 10; i++) {
      if (inner) {
        inner[0] = innerMode(mode, state).mode;
      }
      var style = mode.token(stream, state);
      if (stream.pos > stream.start) {
        return style;
      }
    }
    throw new Error("Mode " + mode.name + " failed to advance stream.");
  }

  var Token = function (stream, type, state) {
    this.start = stream.start;this.end = stream.pos;
    this.string = stream.current();
    this.type = type || null;
    this.state = state;
  };

  // Utility for getTokenAt and getLineTokens
  function takeToken(cm, pos, precise, asArray) {
    var doc = cm.doc,
        mode = doc.mode,
        style;
    pos = clipPos(doc, pos);
    var line = getLine(doc, pos.line),
        context = getContextBefore(cm, pos.line, precise);
    var stream = new StringStream(line.text, cm.options.tabSize, context),
        tokens;
    if (asArray) {
      tokens = [];
    }
    while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
      stream.start = stream.pos;
      style = readToken(mode, stream, context.state);
      if (asArray) {
        tokens.push(new Token(stream, style, copyState(doc.mode, context.state)));
      }
    }
    return asArray ? tokens : new Token(stream, style, context.state);
  }

  function extractLineClasses(type, output) {
    if (type) {
      for (;;) {
        var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
        if (!lineClass) {
          break;
        }
        type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
        var prop = lineClass[1] ? "bgClass" : "textClass";
        if (output[prop] == null) {
          output[prop] = lineClass[2];
        } else if (!new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)").test(output[prop])) {
          output[prop] += " " + lineClass[2];
        }
      }
    }
    return type;
  }

  // Run the given mode's parser over a line, calling f for each token.
  function runMode(cm, text, mode, context, f, lineClasses, forceToEnd) {
    var flattenSpans = mode.flattenSpans;
    if (flattenSpans == null) {
      flattenSpans = cm.options.flattenSpans;
    }
    var curStart = 0,
        curStyle = null;
    var stream = new StringStream(text, cm.options.tabSize, context),
        style;
    var inner = cm.options.addModeClass && [null];
    if (text == "") {
      extractLineClasses(callBlankLine(mode, context.state), lineClasses);
    }
    while (!stream.eol()) {
      if (stream.pos > cm.options.maxHighlightLength) {
        flattenSpans = false;
        if (forceToEnd) {
          processLine(cm, text, context, stream.pos);
        }
        stream.pos = text.length;
        style = null;
      } else {
        style = extractLineClasses(readToken(mode, stream, context.state, inner), lineClasses);
      }
      if (inner) {
        var mName = inner[0].name;
        if (mName) {
          style = "m-" + (style ? mName + " " + style : mName);
        }
      }
      if (!flattenSpans || curStyle != style) {
        while (curStart < stream.start) {
          curStart = Math.min(stream.start, curStart + 5000);
          f(curStart, curStyle);
        }
        curStyle = style;
      }
      stream.start = stream.pos;
    }
    while (curStart < stream.pos) {
      // Webkit seems to refuse to render text nodes longer than 57444
      // characters, and returns inaccurate measurements in nodes
      // starting around 5000 chars.
      var pos = Math.min(stream.pos, curStart + 5000);
      f(pos, curStyle);
      curStart = pos;
    }
  }

  // Finds the line to start with when starting a parse. Tries to
  // find a line with a stateAfter, so that it can start with a
  // valid state. If that fails, it returns the line with the
  // smallest indentation, which tends to need the least context to
  // parse correctly.
  function findStartLine(cm, n, precise) {
    var minindent,
        minline,
        doc = cm.doc;
    var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);
    for (var search = n; search > lim; --search) {
      if (search <= doc.first) {
        return doc.first;
      }
      var line = getLine(doc, search - 1),
          after = line.stateAfter;
      if (after && (!precise || search + (after instanceof SavedContext ? after.lookAhead : 0) <= doc.modeFrontier)) {
        return search;
      }
      var indented = countColumn(line.text, null, cm.options.tabSize);
      if (minline == null || minindent > indented) {
        minline = search - 1;
        minindent = indented;
      }
    }
    return minline;
  }

  function retreatFrontier(doc, n) {
    doc.modeFrontier = Math.min(doc.modeFrontier, n);
    if (doc.highlightFrontier < n - 10) {
      return;
    }
    var start = doc.first;
    for (var line = n - 1; line > start; line--) {
      var saved = getLine(doc, line).stateAfter;
      // change is on 3
      // state on line 1 looked ahead 2 -- so saw 3
      // test 1 + 2 < 3 should cover this
      if (saved && (!(saved instanceof SavedContext) || line + saved.lookAhead < n)) {
        start = line + 1;
        break;
      }
    }
    doc.highlightFrontier = Math.min(doc.highlightFrontier, start);
  }

  // LINE DATA STRUCTURE

  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).
  var Line = function (text, markedSpans, estimateHeight) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight ? estimateHeight(this) : 1;
  };

  Line.prototype.lineNo = function () {
    return lineNo(this);
  };
  eventMixin(Line);

  // Change the content (text, markers) of a line. Automatically
  // invalidates cached information and tries to re-estimate the
  // line's height.
  function updateLine(line, text, markedSpans, estimateHeight) {
    line.text = text;
    if (line.stateAfter) {
      line.stateAfter = null;
    }
    if (line.styles) {
      line.styles = null;
    }
    if (line.order != null) {
      line.order = null;
    }
    detachMarkedSpans(line);
    attachMarkedSpans(line, markedSpans);
    var estHeight = estimateHeight ? estimateHeight(line) : 1;
    if (estHeight != line.height) {
      updateLineHeight(line, estHeight);
    }
  }

  // Detach a line from the document tree and its markers.
  function cleanUpLine(line) {
    line.parent = null;
    detachMarkedSpans(line);
  }

  // Convert a style as returned by a mode (either null, or a string
  // containing one or more styles) to a CSS style. This is cached,
  // and also looks for line-wide styles.
  var styleToClassCache = {};
  var styleToClassCacheWithMode = {};
  function interpretTokenStyle(style, options) {
    if (!style || /^\s*$/.test(style)) {
      return null;
    }
    var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
    return cache[style] || (cache[style] = style.replace(/\S+/g, "cm-$&"));
  }

  // Render the DOM representation of the text of a line. Also builds
  // up a 'line map', which points at the DOM nodes that represent
  // specific stretches of text, and is used by the measuring code.
  // The returned object contains the DOM node, this map, and
  // information about line-wide styles that were set by the mode.
  function buildLineContent(cm, lineView) {
    // The padding-right forces the element to have a 'border', which
    // is needed on Webkit to be able to get line-level bounding
    // rectangles for it (in measureChar).
    var content = eltP("span", null, null, webkit ? "padding-right: .1px" : null);
    var builder = { pre: eltP("pre", [content], "CodeMirror-line"), content: content,
      col: 0, pos: 0, cm: cm,
      trailingSpace: false,
      splitSpaces: (ie || webkit) && cm.getOption("lineWrapping") };
    lineView.measure = {};

    // Iterate over the logical lines that make up this visual line.
    for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
      var line = i ? lineView.rest[i - 1] : lineView.line,
          order = void 0;
      builder.pos = 0;
      builder.addToken = buildToken;
      // Optionally wire in some hacks into the token-rendering
      // algorithm, to deal with browser quirks.
      if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line, cm.doc.direction))) {
        builder.addToken = buildTokenBadBidi(builder.addToken, order);
      }
      builder.map = [];
      var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
      insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));
      if (line.styleClasses) {
        if (line.styleClasses.bgClass) {
          builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
        }
        if (line.styleClasses.textClass) {
          builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "");
        }
      }

      // Ensure at least a single node is present, for measuring.
      if (builder.map.length == 0) {
        builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));
      }

      // Store the map and a cache object for the current logical line
      if (i == 0) {
        lineView.measure.map = builder.map;
        lineView.measure.cache = {};
      } else {
        ;(lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);(lineView.measure.caches || (lineView.measure.caches = [])).push({});
      }
    }

    // See issue #2901
    if (webkit) {
      var last = builder.content.lastChild;
      if (/\bcm-tab\b/.test(last.className) || last.querySelector && last.querySelector(".cm-tab")) {
        builder.content.className = "cm-tab-wrap-hack";
      }
    }

    signal(cm, "renderLine", cm, lineView.line, builder.pre);
    if (builder.pre.className) {
      builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");
    }

    return builder;
  }

  function defaultSpecialCharPlaceholder(ch) {
    var token = elt("span", "\u2022", "cm-invalidchar");
    token.title = "\\u" + ch.charCodeAt(0).toString(16);
    token.setAttribute("aria-label", token.title);
    return token;
  }

  // Build up the DOM representation for a single token, and add it to
  // the line map. Takes care to render special characters separately.
  function buildToken(builder, text, style, startStyle, endStyle, title, css) {
    if (!text) {
      return;
    }
    var displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text;
    var special = builder.cm.state.specialChars,
        mustWrap = false;
    var content;
    if (!special.test(text)) {
      builder.col += text.length;
      content = document.createTextNode(displayText);
      builder.map.push(builder.pos, builder.pos + text.length, content);
      if (ie && ie_version < 9) {
        mustWrap = true;
      }
      builder.pos += text.length;
    } else {
      content = document.createDocumentFragment();
      var pos = 0;
      while (true) {
        special.lastIndex = pos;
        var m = special.exec(text);
        var skipped = m ? m.index - pos : text.length - pos;
        if (skipped) {
          var txt = document.createTextNode(displayText.slice(pos, pos + skipped));
          if (ie && ie_version < 9) {
            content.appendChild(elt("span", [txt]));
          } else {
            content.appendChild(txt);
          }
          builder.map.push(builder.pos, builder.pos + skipped, txt);
          builder.col += skipped;
          builder.pos += skipped;
        }
        if (!m) {
          break;
        }
        pos += skipped + 1;
        var txt$1 = void 0;
        if (m[0] == "\t") {
          var tabSize = builder.cm.options.tabSize,
              tabWidth = tabSize - builder.col % tabSize;
          txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
          txt$1.setAttribute("role", "presentation");
          txt$1.setAttribute("cm-text", "\t");
          builder.col += tabWidth;
        } else if (m[0] == "\r" || m[0] == "\n") {
          txt$1 = content.appendChild(elt("span", m[0] == "\r" ? "\u240d" : "\u2424", "cm-invalidchar"));
          txt$1.setAttribute("cm-text", m[0]);
          builder.col += 1;
        } else {
          txt$1 = builder.cm.options.specialCharPlaceholder(m[0]);
          txt$1.setAttribute("cm-text", m[0]);
          if (ie && ie_version < 9) {
            content.appendChild(elt("span", [txt$1]));
          } else {
            content.appendChild(txt$1);
          }
          builder.col += 1;
        }
        builder.map.push(builder.pos, builder.pos + 1, txt$1);
        builder.pos++;
      }
    }
    builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32;
    if (style || startStyle || endStyle || mustWrap || css) {
      var fullStyle = style || "";
      if (startStyle) {
        fullStyle += startStyle;
      }
      if (endStyle) {
        fullStyle += endStyle;
      }
      var token = elt("span", [content], fullStyle, css);
      if (title) {
        token.title = title;
      }
      return builder.content.appendChild(token);
    }
    builder.content.appendChild(content);
  }

  function splitSpaces(text, trailingBefore) {
    if (text.length > 1 && !/  /.test(text)) {
      return text;
    }
    var spaceBefore = trailingBefore,
        result = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32)) {
        ch = "\u00a0";
      }
      result += ch;
      spaceBefore = ch == " ";
    }
    return result;
  }

  // Work around nonsense dimensions being reported for stretches of
  // right-to-left text.
  function buildTokenBadBidi(inner, order) {
    return function (builder, text, style, startStyle, endStyle, title, css) {
      style = style ? style + " cm-force-border" : "cm-force-border";
      var start = builder.pos,
          end = start + text.length;
      for (;;) {
        // Find the part that overlaps with the start of this text
        var part = void 0;
        for (var i = 0; i < order.length; i++) {
          part = order[i];
          if (part.to > start && part.from <= start) {
            break;
          }
        }
        if (part.to >= end) {
          return inner(builder, text, style, startStyle, endStyle, title, css);
        }
        inner(builder, text.slice(0, part.to - start), style, startStyle, null, title, css);
        startStyle = null;
        text = text.slice(part.to - start);
        start = part.to;
      }
    };
  }

  function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
    var widget = !ignoreWidget && marker.widgetNode;
    if (widget) {
      builder.map.push(builder.pos, builder.pos + size, widget);
    }
    if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
      if (!widget) {
        widget = builder.content.appendChild(document.createElement("span"));
      }
      widget.setAttribute("cm-marker", marker.id);
    }
    if (widget) {
      builder.cm.display.input.setUneditable(widget);
      builder.content.appendChild(widget);
    }
    builder.pos += size;
    builder.trailingSpace = false;
  }

  // Outputs a number of spans to make up a line, taking highlighting
  // and marked text into account.
  function insertLineContent(line, builder, styles) {
    var spans = line.markedSpans,
        allText = line.text,
        at = 0;
    if (!spans) {
      for (var i$1 = 1; i$1 < styles.length; i$1 += 2) {
        builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1 + 1], builder.cm.options));
      }
      return;
    }

    var len = allText.length,
        pos = 0,
        i = 1,
        text = "",
        style,
        css;
    var nextChange = 0,
        spanStyle,
        spanEndStyle,
        spanStartStyle,
        title,
        collapsed;
    for (;;) {
      if (nextChange == pos) {
        // Update current marker set
        spanStyle = spanEndStyle = spanStartStyle = title = css = "";
        collapsed = null;nextChange = Infinity;
        var foundBookmarks = [],
            endStyles = void 0;
        for (var j = 0; j < spans.length; ++j) {
          var sp = spans[j],
              m = sp.marker;
          if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
            foundBookmarks.push(m);
          } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
            if (sp.to != null && sp.to != pos && nextChange > sp.to) {
              nextChange = sp.to;
              spanEndStyle = "";
            }
            if (m.className) {
              spanStyle += " " + m.className;
            }
            if (m.css) {
              css = (css ? css + ";" : "") + m.css;
            }
            if (m.startStyle && sp.from == pos) {
              spanStartStyle += " " + m.startStyle;
            }
            if (m.endStyle && sp.to == nextChange) {
              (endStyles || (endStyles = [])).push(m.endStyle, sp.to);
            }
            if (m.title && !title) {
              title = m.title;
            }
            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0)) {
              collapsed = sp;
            }
          } else if (sp.from > pos && nextChange > sp.from) {
            nextChange = sp.from;
          }
        }
        if (endStyles) {
          for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2) {
            if (endStyles[j$1 + 1] == nextChange) {
              spanEndStyle += " " + endStyles[j$1];
            }
          }
        }

        if (!collapsed || collapsed.from == pos) {
          for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2) {
            buildCollapsedSpan(builder, 0, foundBookmarks[j$2]);
          }
        }
        if (collapsed && (collapsed.from || 0) == pos) {
          buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos, collapsed.marker, collapsed.from == null);
          if (collapsed.to == null) {
            return;
          }
          if (collapsed.to == pos) {
            collapsed = false;
          }
        }
      }
      if (pos >= len) {
        break;
      }

      var upto = Math.min(len, nextChange);
      while (true) {
        if (text) {
          var end = pos + text.length;
          if (!collapsed) {
            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle, spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title, css);
          }
          if (end >= upto) {
            text = text.slice(upto - pos);pos = upto;break;
          }
          pos = end;
          spanStartStyle = "";
        }
        text = allText.slice(at, at = styles[i++]);
        style = interpretTokenStyle(styles[i++], builder.cm.options);
      }
    }
  }

  // These objects are used to represent the visible (currently drawn)
  // part of the document. A LineView may correspond to multiple
  // logical lines, if those are connected by collapsed ranges.
  function LineView(doc, line, lineN) {
    // The starting line
    this.line = line;
    // Continuing lines, if any
    this.rest = visualLineContinued(line);
    // Number of logical lines in this visual line
    this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
    this.node = this.text = null;
    this.hidden = lineIsHidden(doc, line);
  }

  // Create a range of LineView objects for the given lines.
  function buildViewArray(cm, from, to) {
    var array = [],
        nextPos;
    for (var pos = from; pos < to; pos = nextPos) {
      var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
      nextPos = pos + view.size;
      array.push(view);
    }
    return array;
  }

  var operationGroup = null;

  function pushOperation(op) {
    if (operationGroup) {
      operationGroup.ops.push(op);
    } else {
      op.ownsGroup = operationGroup = {
        ops: [op],
        delayedCallbacks: []
      };
    }
  }

  function fireCallbacksForOps(group) {
    // Calls delayed callbacks and cursorActivity handlers until no
    // new ones appear
    var callbacks = group.delayedCallbacks,
        i = 0;
    do {
      for (; i < callbacks.length; i++) {
        callbacks[i].call(null);
      }
      for (var j = 0; j < group.ops.length; j++) {
        var op = group.ops[j];
        if (op.cursorActivityHandlers) {
          while (op.cursorActivityCalled < op.cursorActivityHandlers.length) {
            op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm);
          }
        }
      }
    } while (i < callbacks.length);
  }

  function finishOperation(op, endCb) {
    var group = op.ownsGroup;
    if (!group) {
      return;
    }

    try {
      fireCallbacksForOps(group);
    } finally {
      operationGroup = null;
      endCb(group);
    }
  }

  var orphanDelayedCallbacks = null;

  // Often, we want to signal events at a point where we are in the
  // middle of some work, but don't want the handler to start calling
  // other methods on the editor, which might be in an inconsistent
  // state or simply not expect any other events to happen.
  // signalLater looks whether there are any handlers, and schedules
  // them to be executed when the last operation ends, or, if no
  // operation is active, when a timeout fires.
  function signalLater(emitter, type /*, values...*/) {
    var arr = getHandlers(emitter, type);
    if (!arr.length) {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 2),
        list;
    if (operationGroup) {
      list = operationGroup.delayedCallbacks;
    } else if (orphanDelayedCallbacks) {
      list = orphanDelayedCallbacks;
    } else {
      list = orphanDelayedCallbacks = [];
      setTimeout(fireOrphanDelayed, 0);
    }
    var loop = function (i) {
      list.push(function () {
        return arr[i].apply(null, args);
      });
    };

    for (var i = 0; i < arr.length; ++i) loop(i);
  }

  function fireOrphanDelayed() {
    var delayed = orphanDelayedCallbacks;
    orphanDelayedCallbacks = null;
    for (var i = 0; i < delayed.length; ++i) {
      delayed[i]();
    }
  }

  // When an aspect of a line changes, a string is added to
  // lineView.changes. This updates the relevant part of the line's
  // DOM structure.
  function updateLineForChanges(cm, lineView, lineN, dims) {
    for (var j = 0; j < lineView.changes.length; j++) {
      var type = lineView.changes[j];
      if (type == "text") {
        updateLineText(cm, lineView);
      } else if (type == "gutter") {
        updateLineGutter(cm, lineView, lineN, dims);
      } else if (type == "class") {
        updateLineClasses(cm, lineView);
      } else if (type == "widget") {
        updateLineWidgets(cm, lineView, dims);
      }
    }
    lineView.changes = null;
  }

  // Lines with gutter elements, widgets or a background class need to
  // be wrapped, and have the extra elements added to the wrapper div
  function ensureLineWrapped(lineView) {
    if (lineView.node == lineView.text) {
      lineView.node = elt("div", null, null, "position: relative");
      if (lineView.text.parentNode) {
        lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
      }
      lineView.node.appendChild(lineView.text);
      if (ie && ie_version < 8) {
        lineView.node.style.zIndex = 2;
      }
    }
    return lineView.node;
  }

  function updateLineBackground(cm, lineView) {
    var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
    if (cls) {
      cls += " CodeMirror-linebackground";
    }
    if (lineView.background) {
      if (cls) {
        lineView.background.className = cls;
      } else {
        lineView.background.parentNode.removeChild(lineView.background);lineView.background = null;
      }
    } else if (cls) {
      var wrap = ensureLineWrapped(lineView);
      lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
      cm.display.input.setUneditable(lineView.background);
    }
  }

  // Wrapper around buildLineContent which will reuse the structure
  // in display.externalMeasured when possible.
  function getLineContent(cm, lineView) {
    var ext = cm.display.externalMeasured;
    if (ext && ext.line == lineView.line) {
      cm.display.externalMeasured = null;
      lineView.measure = ext.measure;
      return ext.built;
    }
    return buildLineContent(cm, lineView);
  }

  // Redraw the line's text. Interacts with the background and text
  // classes because the mode may output tokens that influence these
  // classes.
  function updateLineText(cm, lineView) {
    var cls = lineView.text.className;
    var built = getLineContent(cm, lineView);
    if (lineView.text == lineView.node) {
      lineView.node = built.pre;
    }
    lineView.text.parentNode.replaceChild(built.pre, lineView.text);
    lineView.text = built.pre;
    if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
      lineView.bgClass = built.bgClass;
      lineView.textClass = built.textClass;
      updateLineClasses(cm, lineView);
    } else if (cls) {
      lineView.text.className = cls;
    }
  }

  function updateLineClasses(cm, lineView) {
    updateLineBackground(cm, lineView);
    if (lineView.line.wrapClass) {
      ensureLineWrapped(lineView).className = lineView.line.wrapClass;
    } else if (lineView.node != lineView.text) {
      lineView.node.className = "";
    }
    var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
    lineView.text.className = textClass || "";
  }

  function updateLineGutter(cm, lineView, lineN, dims) {
    if (lineView.gutter) {
      lineView.node.removeChild(lineView.gutter);
      lineView.gutter = null;
    }
    if (lineView.gutterBackground) {
      lineView.node.removeChild(lineView.gutterBackground);
      lineView.gutterBackground = null;
    }
    if (lineView.line.gutterClass) {
      var wrap = ensureLineWrapped(lineView);
      lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass, "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + dims.gutterTotalWidth + "px");
      cm.display.input.setUneditable(lineView.gutterBackground);
      wrap.insertBefore(lineView.gutterBackground, lineView.text);
    }
    var markers = lineView.line.gutterMarkers;
    if (cm.options.lineNumbers || markers) {
      var wrap$1 = ensureLineWrapped(lineView);
      var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px");
      cm.display.input.setUneditable(gutterWrap);
      wrap$1.insertBefore(gutterWrap, lineView.text);
      if (lineView.line.gutterClass) {
        gutterWrap.className += " " + lineView.line.gutterClass;
      }
      if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"])) {
        lineView.lineNumber = gutterWrap.appendChild(elt("div", lineNumberFor(cm.options, lineN), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + cm.display.lineNumInnerWidth + "px"));
      }
      if (markers) {
        for (var k = 0; k < cm.options.gutters.length; ++k) {
          var id = cm.options.gutters[k],
              found = markers.hasOwnProperty(id) && markers[id];
          if (found) {
            gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " + dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"));
          }
        }
      }
    }
  }

  function updateLineWidgets(cm, lineView, dims) {
    if (lineView.alignable) {
      lineView.alignable = null;
    }
    for (var node = lineView.node.firstChild, next = void 0; node; node = next) {
      next = node.nextSibling;
      if (node.className == "CodeMirror-linewidget") {
        lineView.node.removeChild(node);
      }
    }
    insertLineWidgets(cm, lineView, dims);
  }

  // Build a line's DOM representation from scratch
  function buildLineElement(cm, lineView, lineN, dims) {
    var built = getLineContent(cm, lineView);
    lineView.text = lineView.node = built.pre;
    if (built.bgClass) {
      lineView.bgClass = built.bgClass;
    }
    if (built.textClass) {
      lineView.textClass = built.textClass;
    }

    updateLineClasses(cm, lineView);
    updateLineGutter(cm, lineView, lineN, dims);
    insertLineWidgets(cm, lineView, dims);
    return lineView.node;
  }

  // A lineView may contain multiple logical lines (when merged by
  // collapsed spans). The widgets for all of them need to be drawn.
  function insertLineWidgets(cm, lineView, dims) {
    insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);
    if (lineView.rest) {
      for (var i = 0; i < lineView.rest.length; i++) {
        insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false);
      }
    }
  }

  function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
    if (!line.widgets) {
      return;
    }
    var wrap = ensureLineWrapped(lineView);
    for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
      var widget = ws[i],
          node = elt("div", [widget.node], "CodeMirror-linewidget");
      if (!widget.handleMouseEvents) {
        node.setAttribute("cm-ignore-events", "true");
      }
      positionLineWidget(widget, node, lineView, dims);
      cm.display.input.setUneditable(node);
      if (allowAbove && widget.above) {
        wrap.insertBefore(node, lineView.gutter || lineView.text);
      } else {
        wrap.appendChild(node);
      }
      signalLater(widget, "redraw");
    }
  }

  function positionLineWidget(widget, node, lineView, dims) {
    if (widget.noHScroll) {
      ;(lineView.alignable || (lineView.alignable = [])).push(node);
      var width = dims.wrapperWidth;
      node.style.left = dims.fixedPos + "px";
      if (!widget.coverGutter) {
        width -= dims.gutterTotalWidth;
        node.style.paddingLeft = dims.gutterTotalWidth + "px";
      }
      node.style.width = width + "px";
    }
    if (widget.coverGutter) {
      node.style.zIndex = 5;
      node.style.position = "relative";
      if (!widget.noHScroll) {
        node.style.marginLeft = -dims.gutterTotalWidth + "px";
      }
    }
  }

  function widgetHeight(widget) {
    if (widget.height != null) {
      return widget.height;
    }
    var cm = widget.doc.cm;
    if (!cm) {
      return 0;
    }
    if (!contains(document.body, widget.node)) {
      var parentStyle = "position: relative;";
      if (widget.coverGutter) {
        parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;";
      }
      if (widget.noHScroll) {
        parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;";
      }
      removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
    }
    return widget.height = widget.node.parentNode.offsetHeight;
  }

  // Return true when the given mouse event happened in a widget
  function eventInWidget(display, e) {
    for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
      if (!n || n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true" || n.parentNode == display.sizer && n != display.mover) {
        return true;
      }
    }
  }

  // POSITION MEASUREMENT

  function paddingTop(display) {
    return display.lineSpace.offsetTop;
  }
  function paddingVert(display) {
    return display.mover.offsetHeight - display.lineSpace.offsetHeight;
  }
  function paddingH(display) {
    if (display.cachedPaddingH) {
      return display.cachedPaddingH;
    }
    var e = removeChildrenAndAdd(display.measure, elt("pre", "x"));
    var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
    var data = { left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight) };
    if (!isNaN(data.left) && !isNaN(data.right)) {
      display.cachedPaddingH = data;
    }
    return data;
  }

  function scrollGap(cm) {
    return scrollerGap - cm.display.nativeBarWidth;
  }
  function displayWidth(cm) {
    return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth;
  }
  function displayHeight(cm) {
    return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight;
  }

  // Ensure the lineView.wrapping.heights array is populated. This is
  // an array of bottom offsets for the lines that make up a drawn
  // line. When lineWrapping is on, there might be more than one
  // height.
  function ensureLineHeights(cm, lineView, rect) {
    var wrapping = cm.options.lineWrapping;
    var curWidth = wrapping && displayWidth(cm);
    if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
      var heights = lineView.measure.heights = [];
      if (wrapping) {
        lineView.measure.width = curWidth;
        var rects = lineView.text.firstChild.getClientRects();
        for (var i = 0; i < rects.length - 1; i++) {
          var cur = rects[i],
              next = rects[i + 1];
          if (Math.abs(cur.bottom - next.bottom) > 2) {
            heights.push((cur.bottom + next.top) / 2 - rect.top);
          }
        }
      }
      heights.push(rect.bottom - rect.top);
    }
  }

  // Find a line map (mapping character offsets to text nodes) and a
  // measurement cache for the given line number. (A line view might
  // contain multiple lines when collapsed ranges are present.)
  function mapFromLineView(lineView, line, lineN) {
    if (lineView.line == line) {
      return { map: lineView.measure.map, cache: lineView.measure.cache };
    }
    for (var i = 0; i < lineView.rest.length; i++) {
      if (lineView.rest[i] == line) {
        return { map: lineView.measure.maps[i], cache: lineView.measure.caches[i] };
      }
    }
    for (var i$1 = 0; i$1 < lineView.rest.length; i$1++) {
      if (lineNo(lineView.rest[i$1]) > lineN) {
        return { map: lineView.measure.maps[i$1], cache: lineView.measure.caches[i$1], before: true };
      }
    }
  }

  // Render a line into the hidden node display.externalMeasured. Used
  // when measurement is needed for a line that's not in the viewport.
  function updateExternalMeasurement(cm, line) {
    line = visualLine(line);
    var lineN = lineNo(line);
    var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
    view.lineN = lineN;
    var built = view.built = buildLineContent(cm, view);
    view.text = built.pre;
    removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
    return view;
  }

  // Get a {top, bottom, left, right} box (in line-local coordinates)
  // for a given character.
  function measureChar(cm, line, ch, bias) {
    return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias);
  }

  // Find a line view that corresponds to the given line number.
  function findViewForLine(cm, lineN) {
    if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo) {
      return cm.display.view[findViewIndex(cm, lineN)];
    }
    var ext = cm.display.externalMeasured;
    if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size) {
      return ext;
    }
  }

  // Measurement can be split in two steps, the set-up work that
  // applies to the whole line, and the measurement of the actual
  // character. Functions like coordsChar, that need to do a lot of
  // measurements in a row, can thus ensure that the set-up work is
  // only done once.
  function prepareMeasureForLine(cm, line) {
    var lineN = lineNo(line);
    var view = findViewForLine(cm, lineN);
    if (view && !view.text) {
      view = null;
    } else if (view && view.changes) {
      updateLineForChanges(cm, view, lineN, getDimensions(cm));
      cm.curOp.forceUpdate = true;
    }
    if (!view) {
      view = updateExternalMeasurement(cm, line);
    }

    var info = mapFromLineView(view, line, lineN);
    return {
      line: line, view: view, rect: null,
      map: info.map, cache: info.cache, before: info.before,
      hasHeights: false
    };
  }

  // Given a prepared measurement object, measures the position of an
  // actual character (or fetches it from the cache).
  function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
    if (prepared.before) {
      ch = -1;
    }
    var key = ch + (bias || ""),
        found;
    if (prepared.cache.hasOwnProperty(key)) {
      found = prepared.cache[key];
    } else {
      if (!prepared.rect) {
        prepared.rect = prepared.view.text.getBoundingClientRect();
      }
      if (!prepared.hasHeights) {
        ensureLineHeights(cm, prepared.view, prepared.rect);
        prepared.hasHeights = true;
      }
      found = measureCharInner(cm, prepared, ch, bias);
      if (!found.bogus) {
        prepared.cache[key] = found;
      }
    }
    return { left: found.left, right: found.right,
      top: varHeight ? found.rtop : found.top,
      bottom: varHeight ? found.rbottom : found.bottom };
  }

  var nullRect = { left: 0, right: 0, top: 0, bottom: 0 };

  function nodeAndOffsetInLineMap(map, ch, bias) {
    var node, start, end, collapse, mStart, mEnd;
    // First, search the line map for the text node corresponding to,
    // or closest to, the target character.
    for (var i = 0; i < map.length; i += 3) {
      mStart = map[i];
      mEnd = map[i + 1];
      if (ch < mStart) {
        start = 0;end = 1;
        collapse = "left";
      } else if (ch < mEnd) {
        start = ch - mStart;
        end = start + 1;
      } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
        end = mEnd - mStart;
        start = end - 1;
        if (ch >= mEnd) {
          collapse = "right";
        }
      }
      if (start != null) {
        node = map[i + 2];
        if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right")) {
          collapse = bias;
        }
        if (bias == "left" && start == 0) {
          while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
            node = map[(i -= 3) + 2];
            collapse = "left";
          }
        }
        if (bias == "right" && start == mEnd - mStart) {
          while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
            node = map[(i += 3) + 2];
            collapse = "right";
          }
        }
        break;
      }
    }
    return { node: node, start: start, end: end, collapse: collapse, coverStart: mStart, coverEnd: mEnd };
  }

  function getUsefulRect(rects, bias) {
    var rect = nullRect;
    if (bias == "left") {
      for (var i = 0; i < rects.length; i++) {
        if ((rect = rects[i]).left != rect.right) {
          break;
        }
      }
    } else {
      for (var i$1 = rects.length - 1; i$1 >= 0; i$1--) {
        if ((rect = rects[i$1]).left != rect.right) {
          break;
        }
      }
    }
    return rect;
  }

  function measureCharInner(cm, prepared, ch, bias) {
    var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
    var node = place.node,
        start = place.start,
        end = place.end,
        collapse = place.collapse;

    var rect;
    if (node.nodeType == 3) {
      // If it is a text node, use a range to retrieve the coordinates.
      for (var i$1 = 0; i$1 < 4; i$1++) {
        // Retry a maximum of 4 times when nonsense rectangles are returned
        while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) {
          --start;
        }
        while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) {
          ++end;
        }
        if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart) {
          rect = node.parentNode.getBoundingClientRect();
        } else {
          rect = getUsefulRect(range(node, start, end).getClientRects(), bias);
        }
        if (rect.left || rect.right || start == 0) {
          break;
        }
        end = start;
        start = start - 1;
        collapse = "right";
      }
      if (ie && ie_version < 11) {
        rect = maybeUpdateRectForZooming(cm.display.measure, rect);
      }
    } else {
      // If it is a widget, simply get the box for the whole widget.
      if (start > 0) {
        collapse = bias = "right";
      }
      var rects;
      if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1) {
        rect = rects[bias == "right" ? rects.length - 1 : 0];
      } else {
        rect = node.getBoundingClientRect();
      }
    }
    if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
      var rSpan = node.parentNode.getClientRects()[0];
      if (rSpan) {
        rect = { left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom };
      } else {
        rect = nullRect;
      }
    }

    var rtop = rect.top - prepared.rect.top,
        rbot = rect.bottom - prepared.rect.top;
    var mid = (rtop + rbot) / 2;
    var heights = prepared.view.measure.heights;
    var i = 0;
    for (; i < heights.length - 1; i++) {
      if (mid < heights[i]) {
        break;
      }
    }
    var top = i ? heights[i - 1] : 0,
        bot = heights[i];
    var result = { left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
      right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
      top: top, bottom: bot };
    if (!rect.left && !rect.right) {
      result.bogus = true;
    }
    if (!cm.options.singleCursorHeightPerLine) {
      result.rtop = rtop;result.rbottom = rbot;
    }

    return result;
  }

  // Work around problem with bounding client rects on ranges being
  // returned incorrectly when zoomed on IE10 and below.
  function maybeUpdateRectForZooming(measure, rect) {
    if (!window.screen || screen.logicalXDPI == null || screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure)) {
      return rect;
    }
    var scaleX = screen.logicalXDPI / screen.deviceXDPI;
    var scaleY = screen.logicalYDPI / screen.deviceYDPI;
    return { left: rect.left * scaleX, right: rect.right * scaleX,
      top: rect.top * scaleY, bottom: rect.bottom * scaleY };
  }

  function clearLineMeasurementCacheFor(lineView) {
    if (lineView.measure) {
      lineView.measure.cache = {};
      lineView.measure.heights = null;
      if (lineView.rest) {
        for (var i = 0; i < lineView.rest.length; i++) {
          lineView.measure.caches[i] = {};
        }
      }
    }
  }

  function clearLineMeasurementCache(cm) {
    cm.display.externalMeasure = null;
    removeChildren(cm.display.lineMeasure);
    for (var i = 0; i < cm.display.view.length; i++) {
      clearLineMeasurementCacheFor(cm.display.view[i]);
    }
  }

  function clearCaches(cm) {
    clearLineMeasurementCache(cm);
    cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
    if (!cm.options.lineWrapping) {
      cm.display.maxLineChanged = true;
    }
    cm.display.lineNumChars = null;
  }

  function pageScrollX() {
    // Work around https://bugs.chromium.org/p/chromium/issues/detail?id=489206
    // which causes page_Offset and bounding client rects to use
    // different reference viewports and invalidate our calculations.
    if (chrome && android) {
      return -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft));
    }
    return window.pageXOffset || (document.documentElement || document.body).scrollLeft;
  }
  function pageScrollY() {
    if (chrome && android) {
      return -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop));
    }
    return window.pageYOffset || (document.documentElement || document.body).scrollTop;
  }

  function widgetTopHeight(lineObj) {
    var height = 0;
    if (lineObj.widgets) {
      for (var i = 0; i < lineObj.widgets.length; ++i) {
        if (lineObj.widgets[i].above) {
          height += widgetHeight(lineObj.widgets[i]);
        }
      }
    }
    return height;
  }

  // Converts a {top, bottom, left, right} box from line-local
  // coordinates into another coordinate system. Context may be one of
  // "line", "div" (display.lineDiv), "local"./null (editor), "window",
  // or "page".
  function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
    if (!includeWidgets) {
      var height = widgetTopHeight(lineObj);
      rect.top += height;rect.bottom += height;
    }
    if (context == "line") {
      return rect;
    }
    if (!context) {
      context = "local";
    }
    var yOff = heightAtLine(lineObj);
    if (context == "local") {
      yOff += paddingTop(cm.display);
    } else {
      yOff -= cm.display.viewOffset;
    }
    if (context == "page" || context == "window") {
      var lOff = cm.display.lineSpace.getBoundingClientRect();
      yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
      var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
      rect.left += xOff;rect.right += xOff;
    }
    rect.top += yOff;rect.bottom += yOff;
    return rect;
  }

  // Coverts a box from "div" coords to another coordinate system.
  // Context may be "window", "page", "div", or "local"./null.
  function fromCoordSystem(cm, coords, context) {
    if (context == "div") {
      return coords;
    }
    var left = coords.left,
        top = coords.top;
    // First move into "page" coordinate system
    if (context == "page") {
      left -= pageScrollX();
      top -= pageScrollY();
    } else if (context == "local" || !context) {
      var localBox = cm.display.sizer.getBoundingClientRect();
      left += localBox.left;
      top += localBox.top;
    }

    var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
    return { left: left - lineSpaceBox.left, top: top - lineSpaceBox.top };
  }

  function charCoords(cm, pos, context, lineObj, bias) {
    if (!lineObj) {
      lineObj = getLine(cm.doc, pos.line);
    }
    return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context);
  }

  // Returns a box for a given cursor position, which may have an
  // 'other' property containing the position of the secondary cursor
  // on a bidi boundary.
  // A cursor Pos(line, char, "before") is on the same visual line as `char - 1`
  // and after `char - 1` in writing order of `char - 1`
  // A cursor Pos(line, char, "after") is on the same visual line as `char`
  // and before `char` in writing order of `char`
  // Examples (upper-case letters are RTL, lower-case are LTR):
  //     Pos(0, 1, ...)
  //     before   after
  // ab     a|b     a|b
  // aB     a|B     aB|
  // Ab     |Ab     A|b
  // AB     B|A     B|A
  // Every position after the last character on a line is considered to stick
  // to the last character on the line.
  function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
    lineObj = lineObj || getLine(cm.doc, pos.line);
    if (!preparedMeasure) {
      preparedMeasure = prepareMeasureForLine(cm, lineObj);
    }
    function get(ch, right) {
      var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
      if (right) {
        m.left = m.right;
      } else {
        m.right = m.left;
      }
      return intoCoordSystem(cm, lineObj, m, context);
    }
    var order = getOrder(lineObj, cm.doc.direction),
        ch = pos.ch,
        sticky = pos.sticky;
    if (ch >= lineObj.text.length) {
      ch = lineObj.text.length;
      sticky = "before";
    } else if (ch <= 0) {
      ch = 0;
      sticky = "after";
    }
    if (!order) {
      return get(sticky == "before" ? ch - 1 : ch, sticky == "before");
    }

    function getBidi(ch, partPos, invert) {
      var part = order[partPos],
          right = part.level == 1;
      return get(invert ? ch - 1 : ch, right != invert);
    }
    var partPos = getBidiPartAt(order, ch, sticky);
    var other = bidiOther;
    var val = getBidi(ch, partPos, sticky == "before");
    if (other != null) {
      val.other = getBidi(ch, other, sticky != "before");
    }
    return val;
  }

  // Used to cheaply estimate the coordinates for a position. Used for
  // intermediate scroll updates.
  function estimateCoords(cm, pos) {
    var left = 0;
    pos = clipPos(cm.doc, pos);
    if (!cm.options.lineWrapping) {
      left = charWidth(cm.display) * pos.ch;
    }
    var lineObj = getLine(cm.doc, pos.line);
    var top = heightAtLine(lineObj) + paddingTop(cm.display);
    return { left: left, right: left, top: top, bottom: top + lineObj.height };
  }

  // Positions returned by coordsChar contain some extra information.
  // xRel is the relative x position of the input coordinates compared
  // to the found position (so xRel > 0 means the coordinates are to
  // the right of the character position, for example). When outside
  // is true, that means the coordinates lie outside the line's
  // vertical range.
  function PosWithInfo(line, ch, sticky, outside, xRel) {
    var pos = Pos(line, ch, sticky);
    pos.xRel = xRel;
    if (outside) {
      pos.outside = true;
    }
    return pos;
  }

  // Compute the character position closest to the given coordinates.
  // Input must be lineSpace-local ("div" coordinate system).
  function coordsChar(cm, x, y) {
    var doc = cm.doc;
    y += cm.display.viewOffset;
    if (y < 0) {
      return PosWithInfo(doc.first, 0, null, true, -1);
    }
    var lineN = lineAtHeight(doc, y),
        last = doc.first + doc.size - 1;
    if (lineN > last) {
      return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, null, true, 1);
    }
    if (x < 0) {
      x = 0;
    }

    var lineObj = getLine(doc, lineN);
    for (;;) {
      var found = coordsCharInner(cm, lineObj, lineN, x, y);
      var merged = collapsedSpanAtEnd(lineObj);
      var mergedPos = merged && merged.find(0, true);
      if (merged && (found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0)) {
        lineN = lineNo(lineObj = mergedPos.to.line);
      } else {
        return found;
      }
    }
  }

  function wrappedLineExtent(cm, lineObj, preparedMeasure, y) {
    y -= widgetTopHeight(lineObj);
    var end = lineObj.text.length;
    var begin = findFirst(function (ch) {
      return measureCharPrepared(cm, preparedMeasure, ch - 1).bottom <= y;
    }, end, 0);
    end = findFirst(function (ch) {
      return measureCharPrepared(cm, preparedMeasure, ch).top > y;
    }, begin, end);
    return { begin: begin, end: end };
  }

  function wrappedLineExtentChar(cm, lineObj, preparedMeasure, target) {
    if (!preparedMeasure) {
      preparedMeasure = prepareMeasureForLine(cm, lineObj);
    }
    var targetTop = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, target), "line").top;
    return wrappedLineExtent(cm, lineObj, preparedMeasure, targetTop);
  }

  // Returns true if the given side of a box is after the given
  // coordinates, in top-to-bottom, left-to-right order.
  function boxIsAfter(box, x, y, left) {
    return box.bottom <= y ? false : box.top > y ? true : (left ? box.left : box.right) > x;
  }

  function coordsCharInner(cm, lineObj, lineNo, x, y) {
    // Move y into line-local coordinate space
    y -= heightAtLine(lineObj);
    var preparedMeasure = prepareMeasureForLine(cm, lineObj);
    // When directly calling `measureCharPrepared`, we have to adjust
    // for the widgets at this line.
    var widgetHeight = widgetTopHeight(lineObj);
    var begin = 0,
        end = lineObj.text.length,
        ltr = true;

    var order = getOrder(lineObj, cm.doc.direction);
    // If the line isn't plain left-to-right text, first figure out
    // which bidi section the coordinates fall into.
    if (order) {
      var part = (cm.options.lineWrapping ? coordsBidiPartWrapped : coordsBidiPart)(cm, lineObj, lineNo, preparedMeasure, order, x, y);
      ltr = part.level != 1;
      // The awkward -1 offsets are needed because findFirst (called
      // on these below) will treat its first bound as inclusive,
      // second as exclusive, but we want to actually address the
      // characters in the part's range
      begin = ltr ? part.from : part.to - 1;
      end = ltr ? part.to : part.from - 1;
    }

    // A binary search to find the first character whose bounding box
    // starts after the coordinates. If we run across any whose box wrap
    // the coordinates, store that.
    var chAround = null,
        boxAround = null;
    var ch = findFirst(function (ch) {
      var box = measureCharPrepared(cm, preparedMeasure, ch);
      box.top += widgetHeight;box.bottom += widgetHeight;
      if (!boxIsAfter(box, x, y, false)) {
        return false;
      }
      if (box.top <= y && box.left <= x) {
        chAround = ch;
        boxAround = box;
      }
      return true;
    }, begin, end);

    var baseX,
        sticky,
        outside = false;
    // If a box around the coordinates was found, use that
    if (boxAround) {
      // Distinguish coordinates nearer to the left or right side of the box
      var atLeft = x - boxAround.left < boxAround.right - x,
          atStart = atLeft == ltr;
      ch = chAround + (atStart ? 0 : 1);
      sticky = atStart ? "after" : "before";
      baseX = atLeft ? boxAround.left : boxAround.right;
    } else {
      // (Adjust for extended bound, if necessary.)
      if (!ltr && (ch == end || ch == begin)) {
        ch++;
      }
      // To determine which side to associate with, get the box to the
      // left of the character and compare it's vertical position to the
      // coordinates
      sticky = ch == 0 ? "after" : ch == lineObj.text.length ? "before" : measureCharPrepared(cm, preparedMeasure, ch - (ltr ? 1 : 0)).bottom + widgetHeight <= y == ltr ? "after" : "before";
      // Now get accurate coordinates for this place, in order to get a
      // base X position
      var coords = cursorCoords(cm, Pos(lineNo, ch, sticky), "line", lineObj, preparedMeasure);
      baseX = coords.left;
      outside = y < coords.top || y >= coords.bottom;
    }

    ch = skipExtendingChars(lineObj.text, ch, 1);
    return PosWithInfo(lineNo, ch, sticky, outside, x - baseX);
  }

  function coordsBidiPart(cm, lineObj, lineNo, preparedMeasure, order, x, y) {
    // Bidi parts are sorted left-to-right, and in a non-line-wrapping
    // situation, we can take this ordering to correspond to the visual
    // ordering. This finds the first part whose end is after the given
    // coordinates.
    var index = findFirst(function (i) {
      var part = order[i],
          ltr = part.level != 1;
      return boxIsAfter(cursorCoords(cm, Pos(lineNo, ltr ? part.to : part.from, ltr ? "before" : "after"), "line", lineObj, preparedMeasure), x, y, true);
    }, 0, order.length - 1);
    var part = order[index];
    // If this isn't the first part, the part's start is also after
    // the coordinates, and the coordinates aren't on the same line as
    // that start, move one part back.
    if (index > 0) {
      var ltr = part.level != 1;
      var start = cursorCoords(cm, Pos(lineNo, ltr ? part.from : part.to, ltr ? "after" : "before"), "line", lineObj, preparedMeasure);
      if (boxIsAfter(start, x, y, true) && start.top > y) {
        part = order[index - 1];
      }
    }
    return part;
  }

  function coordsBidiPartWrapped(cm, lineObj, _lineNo, preparedMeasure, order, x, y) {
    // In a wrapped line, rtl text on wrapping boundaries can do things
    // that don't correspond to the ordering in our `order` array at
    // all, so a binary search doesn't work, and we want to return a
    // part that only spans one line so that the binary search in
    // coordsCharInner is safe. As such, we first find the extent of the
    // wrapped line, and then do a flat search in which we discard any
    // spans that aren't on the line.
    var ref = wrappedLineExtent(cm, lineObj, preparedMeasure, y);
    var begin = ref.begin;
    var end = ref.end;
    if (/\s/.test(lineObj.text.charAt(end - 1))) {
      end--;
    }
    var part = null,
        closestDist = null;
    for (var i = 0; i < order.length; i++) {
      var p = order[i];
      if (p.from >= end || p.to <= begin) {
        continue;
      }
      var ltr = p.level != 1;
      var endX = measureCharPrepared(cm, preparedMeasure, ltr ? Math.min(end, p.to) - 1 : Math.max(begin, p.from)).right;
      // Weigh against spans ending before this, so that they are only
      // picked if nothing ends after
      var dist = endX < x ? x - endX + 1e9 : endX - x;
      if (!part || closestDist > dist) {
        part = p;
        closestDist = dist;
      }
    }
    if (!part) {
      part = order[order.length - 1];
    }
    // Clip the part to the wrapped line.
    if (part.from < begin) {
      part = { from: begin, to: part.to, level: part.level };
    }
    if (part.to > end) {
      part = { from: part.from, to: end, level: part.level };
    }
    return part;
  }

  var measureText;
  // Compute the default text height.
  function textHeight(display) {
    if (display.cachedTextHeight != null) {
      return display.cachedTextHeight;
    }
    if (measureText == null) {
      measureText = elt("pre");
      // Measure a bunch of lines, for browsers that compute
      // fractional heights.
      for (var i = 0; i < 49; ++i) {
        measureText.appendChild(document.createTextNode("x"));
        measureText.appendChild(elt("br"));
      }
      measureText.appendChild(document.createTextNode("x"));
    }
    removeChildrenAndAdd(display.measure, measureText);
    var height = measureText.offsetHeight / 50;
    if (height > 3) {
      display.cachedTextHeight = height;
    }
    removeChildren(display.measure);
    return height || 1;
  }

  // Compute the default character width.
  function charWidth(display) {
    if (display.cachedCharWidth != null) {
      return display.cachedCharWidth;
    }
    var anchor = elt("span", "xxxxxxxxxx");
    var pre = elt("pre", [anchor]);
    removeChildrenAndAdd(display.measure, pre);
    var rect = anchor.getBoundingClientRect(),
        width = (rect.right - rect.left) / 10;
    if (width > 2) {
      display.cachedCharWidth = width;
    }
    return width || 10;
  }

  // Do a bulk-read of the DOM positions and sizes needed to draw the
  // view, so that we don't interleave reading and writing to the DOM.
  function getDimensions(cm) {
    var d = cm.display,
        left = {},
        width = {};
    var gutterLeft = d.gutters.clientLeft;
    for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
      left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft;
      width[cm.options.gutters[i]] = n.clientWidth;
    }
    return { fixedPos: compensateForHScroll(d),
      gutterTotalWidth: d.gutters.offsetWidth,
      gutterLeft: left,
      gutterWidth: width,
      wrapperWidth: d.wrapper.clientWidth };
  }

  // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
  // but using getBoundingClientRect to get a sub-pixel-accurate
  // result.
  function compensateForHScroll(display) {
    return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left;
  }

  // Returns a function that estimates the height of a line, to use as
  // first approximation until the line becomes visible (and is thus
  // properly measurable).
  function estimateHeight(cm) {
    var th = textHeight(cm.display),
        wrapping = cm.options.lineWrapping;
    var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
    return function (line) {
      if (lineIsHidden(cm.doc, line)) {
        return 0;
      }

      var widgetsHeight = 0;
      if (line.widgets) {
        for (var i = 0; i < line.widgets.length; i++) {
          if (line.widgets[i].height) {
            widgetsHeight += line.widgets[i].height;
          }
        }
      }

      if (wrapping) {
        return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;
      } else {
        return widgetsHeight + th;
      }
    };
  }

  function estimateLineHeights(cm) {
    var doc = cm.doc,
        est = estimateHeight(cm);
    doc.iter(function (line) {
      var estHeight = est(line);
      if (estHeight != line.height) {
        updateLineHeight(line, estHeight);
      }
    });
  }

  // Given a mouse event, find the corresponding position. If liberal
  // is false, it checks whether a gutter or scrollbar was clicked,
  // and returns null if it was. forRect is used by rectangular
  // selections, and tries to estimate a character position even for
  // coordinates beyond the right of the text.
  function posFromMouse(cm, e, liberal, forRect) {
    var display = cm.display;
    if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") {
      return null;
    }

    var x,
        y,
        space = display.lineSpace.getBoundingClientRect();
    // Fails unpredictably on IE[67] when mouse is dragged around quickly.
    try {
      x = e.clientX - space.left;y = e.clientY - space.top;
    } catch (e) {
      return null;
    }
    var coords = coordsChar(cm, x, y),
        line;
    if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
      var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
      coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
    }
    return coords;
  }

  // Find the view element corresponding to a given line. Return null
  // when the line isn't visible.
  function findViewIndex(cm, n) {
    if (n >= cm.display.viewTo) {
      return null;
    }
    n -= cm.display.viewFrom;
    if (n < 0) {
      return null;
    }
    var view = cm.display.view;
    for (var i = 0; i < view.length; i++) {
      n -= view[i].size;
      if (n < 0) {
        return i;
      }
    }
  }

  function updateSelection(cm) {
    cm.display.input.showSelection(cm.display.input.prepareSelection());
  }

  function prepareSelection(cm, primary) {
    if (primary === void 0) primary = true;

    var doc = cm.doc,
        result = {};
    var curFragment = result.cursors = document.createDocumentFragment();
    var selFragment = result.selection = document.createDocumentFragment();

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      if (!primary && i == doc.sel.primIndex) {
        continue;
      }
      var range = doc.sel.ranges[i];
      if (range.from().line >= cm.display.viewTo || range.to().line < cm.display.viewFrom) {
        continue;
      }
      var collapsed = range.empty();
      if (collapsed || cm.options.showCursorWhenSelecting) {
        drawSelectionCursor(cm, range.head, curFragment);
      }
      if (!collapsed) {
        drawSelectionRange(cm, range, selFragment);
      }
    }
    return result;
  }

  // Draws a cursor for the given range
  function drawSelectionCursor(cm, head, output) {
    var pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);

    var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
    cursor.style.left = pos.left + "px";
    cursor.style.top = pos.top + "px";
    cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

    if (pos.other) {
      // Secondary cursor, shown when on a 'jump' in bi-directional text
      var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      otherCursor.style.display = "";
      otherCursor.style.left = pos.other.left + "px";
      otherCursor.style.top = pos.other.top + "px";
      otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
    }
  }

  function cmpCoords(a, b) {
    return a.top - b.top || a.left - b.left;
  }

  // Draws the given range as a highlighted selection
  function drawSelectionRange(cm, range, output) {
    var display = cm.display,
        doc = cm.doc;
    var fragment = document.createDocumentFragment();
    var padding = paddingH(cm.display),
        leftSide = padding.left;
    var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;
    var docLTR = doc.direction == "ltr";

    function add(left, top, width, bottom) {
      if (top < 0) {
        top = 0;
      }
      top = Math.round(top);
      bottom = Math.round(bottom);
      fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (width == null ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px"));
    }

    function drawForLine(line, fromArg, toArg) {
      var lineObj = getLine(doc, line);
      var lineLen = lineObj.text.length;
      var start, end;
      function coords(ch, bias) {
        return charCoords(cm, Pos(line, ch), "div", lineObj, bias);
      }

      function wrapX(pos, dir, side) {
        var extent = wrappedLineExtentChar(cm, lineObj, null, pos);
        var prop = dir == "ltr" == (side == "after") ? "left" : "right";
        var ch = side == "after" ? extent.begin : extent.end - (/\s/.test(lineObj.text.charAt(extent.end - 1)) ? 2 : 1);
        return coords(ch, prop)[prop];
      }

      var order = getOrder(lineObj, doc.direction);
      iterateBidiSections(order, fromArg || 0, toArg == null ? lineLen : toArg, function (from, to, dir, i) {
        var ltr = dir == "ltr";
        var fromPos = coords(from, ltr ? "left" : "right");
        var toPos = coords(to - 1, ltr ? "right" : "left");

        var openStart = fromArg == null && from == 0,
            openEnd = toArg == null && to == lineLen;
        var first = i == 0,
            last = !order || i == order.length - 1;
        if (toPos.top - fromPos.top <= 3) {
          // Single line
          var openLeft = (docLTR ? openStart : openEnd) && first;
          var openRight = (docLTR ? openEnd : openStart) && last;
          var left = openLeft ? leftSide : (ltr ? fromPos : toPos).left;
          var right = openRight ? rightSide : (ltr ? toPos : fromPos).right;
          add(left, fromPos.top, right - left, fromPos.bottom);
        } else {
          // Multiple lines
          var topLeft, topRight, botLeft, botRight;
          if (ltr) {
            topLeft = docLTR && openStart && first ? leftSide : fromPos.left;
            topRight = docLTR ? rightSide : wrapX(from, dir, "before");
            botLeft = docLTR ? leftSide : wrapX(to, dir, "after");
            botRight = docLTR && openEnd && last ? rightSide : toPos.right;
          } else {
            topLeft = !docLTR ? leftSide : wrapX(from, dir, "before");
            topRight = !docLTR && openStart && first ? rightSide : fromPos.right;
            botLeft = !docLTR && openEnd && last ? leftSide : toPos.left;
            botRight = !docLTR ? rightSide : wrapX(to, dir, "after");
          }
          add(topLeft, fromPos.top, topRight - topLeft, fromPos.bottom);
          if (fromPos.bottom < toPos.top) {
            add(leftSide, fromPos.bottom, null, toPos.top);
          }
          add(botLeft, toPos.top, botRight - botLeft, toPos.bottom);
        }

        if (!start || cmpCoords(fromPos, start) < 0) {
          start = fromPos;
        }
        if (cmpCoords(toPos, start) < 0) {
          start = toPos;
        }
        if (!end || cmpCoords(fromPos, end) < 0) {
          end = fromPos;
        }
        if (cmpCoords(toPos, end) < 0) {
          end = toPos;
        }
      });
      return { start: start, end: end };
    }

    var sFrom = range.from(),
        sTo = range.to();
    if (sFrom.line == sTo.line) {
      drawForLine(sFrom.line, sFrom.ch, sTo.ch);
    } else {
      var fromLine = getLine(doc, sFrom.line),
          toLine = getLine(doc, sTo.line);
      var singleVLine = visualLine(fromLine) == visualLine(toLine);
      var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
      var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
      if (singleVLine) {
        if (leftEnd.top < rightStart.top - 2) {
          add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
          add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
        } else {
          add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
        }
      }
      if (leftEnd.bottom < rightStart.top) {
        add(leftSide, leftEnd.bottom, null, rightStart.top);
      }
    }

    output.appendChild(fragment);
  }

  // Cursor-blinking
  function restartBlink(cm) {
    if (!cm.state.focused) {
      return;
    }
    var display = cm.display;
    clearInterval(display.blinker);
    var on = true;
    display.cursorDiv.style.visibility = "";
    if (cm.options.cursorBlinkRate > 0) {
      display.blinker = setInterval(function () {
        return display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden";
      }, cm.options.cursorBlinkRate);
    } else if (cm.options.cursorBlinkRate < 0) {
      display.cursorDiv.style.visibility = "hidden";
    }
  }

  function ensureFocus(cm) {
    if (!cm.state.focused) {
      cm.display.input.focus();onFocus(cm);
    }
  }

  function delayBlurEvent(cm) {
    cm.state.delayingBlurEvent = true;
    setTimeout(function () {
      if (cm.state.delayingBlurEvent) {
        cm.state.delayingBlurEvent = false;
        onBlur(cm);
      }
    }, 100);
  }

  function onFocus(cm, e) {
    if (cm.state.delayingBlurEvent) {
      cm.state.delayingBlurEvent = false;
    }

    if (cm.options.readOnly == "nocursor") {
      return;
    }
    if (!cm.state.focused) {
      signal(cm, "focus", cm, e);
      cm.state.focused = true;
      addClass(cm.display.wrapper, "CodeMirror-focused");
      // This test prevents this from firing when a context
      // menu is closed (since the input reset would kill the
      // select-all detection hack)
      if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
        cm.display.input.reset();
        if (webkit) {
          setTimeout(function () {
            return cm.display.input.reset(true);
          }, 20);
        } // Issue #1730
      }
      cm.display.input.receivedFocus();
    }
    restartBlink(cm);
  }
  function onBlur(cm, e) {
    if (cm.state.delayingBlurEvent) {
      return;
    }

    if (cm.state.focused) {
      signal(cm, "blur", cm, e);
      cm.state.focused = false;
      rmClass(cm.display.wrapper, "CodeMirror-focused");
    }
    clearInterval(cm.display.blinker);
    setTimeout(function () {
      if (!cm.state.focused) {
        cm.display.shift = false;
      }
    }, 150);
  }

  // Read the actual heights of the rendered lines, and update their
  // stored heights to match.
  function updateHeightsInViewport(cm) {
    var display = cm.display;
    var prevBottom = display.lineDiv.offsetTop;
    for (var i = 0; i < display.view.length; i++) {
      var cur = display.view[i],
          height = void 0;
      if (cur.hidden) {
        continue;
      }
      if (ie && ie_version < 8) {
        var bot = cur.node.offsetTop + cur.node.offsetHeight;
        height = bot - prevBottom;
        prevBottom = bot;
      } else {
        var box = cur.node.getBoundingClientRect();
        height = box.bottom - box.top;
      }
      var diff = cur.line.height - height;
      if (height < 2) {
        height = textHeight(display);
      }
      if (diff > .005 || diff < -.005) {
        updateLineHeight(cur.line, height);
        updateWidgetHeight(cur.line);
        if (cur.rest) {
          for (var j = 0; j < cur.rest.length; j++) {
            updateWidgetHeight(cur.rest[j]);
          }
        }
      }
    }
  }

  // Read and store the height of line widgets associated with the
  // given line.
  function updateWidgetHeight(line) {
    if (line.widgets) {
      for (var i = 0; i < line.widgets.length; ++i) {
        line.widgets[i].height = line.widgets[i].node.parentNode.offsetHeight;
      }
    }
  }

  // Compute the lines that are visible in a given viewport (defaults
  // the the current scroll position). viewport may contain top,
  // height, and ensure (see op.scrollToPos) properties.
  function visibleLines(display, doc, viewport) {
    var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
    top = Math.floor(top - paddingTop(display));
    var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

    var from = lineAtHeight(doc, top),
        to = lineAtHeight(doc, bottom);
    // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
    // forces those lines into the viewport (if possible).
    if (viewport && viewport.ensure) {
      var ensureFrom = viewport.ensure.from.line,
          ensureTo = viewport.ensure.to.line;
      if (ensureFrom < from) {
        from = ensureFrom;
        to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
      } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
        from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
        to = ensureTo;
      }
    }
    return { from: from, to: Math.max(to, from + 1) };
  }

  // Re-align line numbers and gutter marks to compensate for
  // horizontal scrolling.
  function alignHorizontally(cm) {
    var display = cm.display,
        view = display.view;
    if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) {
      return;
    }
    var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
    var gutterW = display.gutters.offsetWidth,
        left = comp + "px";
    for (var i = 0; i < view.length; i++) {
      if (!view[i].hidden) {
        if (cm.options.fixedGutter) {
          if (view[i].gutter) {
            view[i].gutter.style.left = left;
          }
          if (view[i].gutterBackground) {
            view[i].gutterBackground.style.left = left;
          }
        }
        var align = view[i].alignable;
        if (align) {
          for (var j = 0; j < align.length; j++) {
            align[j].style.left = left;
          }
        }
      }
    }
    if (cm.options.fixedGutter) {
      display.gutters.style.left = comp + gutterW + "px";
    }
  }

  // Used to ensure that the line number gutter is still the right
  // size for the current document size. Returns true when an update
  // is needed.
  function maybeUpdateLineNumberWidth(cm) {
    if (!cm.options.lineNumbers) {
      return false;
    }
    var doc = cm.doc,
        last = lineNumberFor(cm.options, doc.first + doc.size - 1),
        display = cm.display;
    if (last.length != display.lineNumChars) {
      var test = display.measure.appendChild(elt("div", [elt("div", last)], "CodeMirror-linenumber CodeMirror-gutter-elt"));
      var innerW = test.firstChild.offsetWidth,
          padding = test.offsetWidth - innerW;
      display.lineGutter.style.width = "";
      display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
      display.lineNumWidth = display.lineNumInnerWidth + padding;
      display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
      display.lineGutter.style.width = display.lineNumWidth + "px";
      updateGutterSpace(cm);
      return true;
    }
    return false;
  }

  // SCROLLING THINGS INTO VIEW

  // If an editor sits on the top or bottom of the window, partially
  // scrolled out of view, this ensures that the cursor is visible.
  function maybeScrollWindow(cm, rect) {
    if (signalDOMEvent(cm, "scrollCursorIntoView")) {
      return;
    }

    var display = cm.display,
        box = display.sizer.getBoundingClientRect(),
        doScroll = null;
    if (rect.top + box.top < 0) {
      doScroll = true;
    } else if (rect.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) {
      doScroll = false;
    }
    if (doScroll != null && !phantom) {
      var scrollNode = elt("div", "\u200b", null, "position: absolute;\n                         top: " + (rect.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (rect.bottom - rect.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + rect.left + "px; width: " + Math.max(2, rect.right - rect.left) + "px;");
      cm.display.lineSpace.appendChild(scrollNode);
      scrollNode.scrollIntoView(doScroll);
      cm.display.lineSpace.removeChild(scrollNode);
    }
  }

  // Scroll a given position into view (immediately), verifying that
  // it actually became visible (as line heights are accurately
  // measured, the position of something may 'drift' during drawing).
  function scrollPosIntoView(cm, pos, end, margin) {
    if (margin == null) {
      margin = 0;
    }
    var rect;
    if (!cm.options.lineWrapping && pos == end) {
      // Set pos and end to the cursor positions around the character pos sticks to
      // If pos.sticky == "before", that is around pos.ch - 1, otherwise around pos.ch
      // If pos == Pos(_, 0, "before"), pos and end are unchanged
      pos = pos.ch ? Pos(pos.line, pos.sticky == "before" ? pos.ch - 1 : pos.ch, "after") : pos;
      end = pos.sticky == "before" ? Pos(pos.line, pos.ch + 1, "before") : pos;
    }
    for (var limit = 0; limit < 5; limit++) {
      var changed = false;
      var coords = cursorCoords(cm, pos);
      var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
      rect = { left: Math.min(coords.left, endCoords.left),
        top: Math.min(coords.top, endCoords.top) - margin,
        right: Math.max(coords.left, endCoords.left),
        bottom: Math.max(coords.bottom, endCoords.bottom) + margin };
      var scrollPos = calculateScrollPos(cm, rect);
      var startTop = cm.doc.scrollTop,
          startLeft = cm.doc.scrollLeft;
      if (scrollPos.scrollTop != null) {
        updateScrollTop(cm, scrollPos.scrollTop);
        if (Math.abs(cm.doc.scrollTop - startTop) > 1) {
          changed = true;
        }
      }
      if (scrollPos.scrollLeft != null) {
        setScrollLeft(cm, scrollPos.scrollLeft);
        if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) {
          changed = true;
        }
      }
      if (!changed) {
        break;
      }
    }
    return rect;
  }

  // Scroll a given set of coordinates into view (immediately).
  function scrollIntoView(cm, rect) {
    var scrollPos = calculateScrollPos(cm, rect);
    if (scrollPos.scrollTop != null) {
      updateScrollTop(cm, scrollPos.scrollTop);
    }
    if (scrollPos.scrollLeft != null) {
      setScrollLeft(cm, scrollPos.scrollLeft);
    }
  }

  // Calculate a new scroll position needed to scroll the given
  // rectangle into view. Returns an object with scrollTop and
  // scrollLeft properties. When these are undefined, the
  // vertical/horizontal position does not need to be adjusted.
  function calculateScrollPos(cm, rect) {
    var display = cm.display,
        snapMargin = textHeight(cm.display);
    if (rect.top < 0) {
      rect.top = 0;
    }
    var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
    var screen = displayHeight(cm),
        result = {};
    if (rect.bottom - rect.top > screen) {
      rect.bottom = rect.top + screen;
    }
    var docBottom = cm.doc.height + paddingVert(display);
    var atTop = rect.top < snapMargin,
        atBottom = rect.bottom > docBottom - snapMargin;
    if (rect.top < screentop) {
      result.scrollTop = atTop ? 0 : rect.top;
    } else if (rect.bottom > screentop + screen) {
      var newTop = Math.min(rect.top, (atBottom ? docBottom : rect.bottom) - screen);
      if (newTop != screentop) {
        result.scrollTop = newTop;
      }
    }

    var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
    var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
    var tooWide = rect.right - rect.left > screenw;
    if (tooWide) {
      rect.right = rect.left + screenw;
    }
    if (rect.left < 10) {
      result.scrollLeft = 0;
    } else if (rect.left < screenleft) {
      result.scrollLeft = Math.max(0, rect.left - (tooWide ? 0 : 10));
    } else if (rect.right > screenw + screenleft - 3) {
      result.scrollLeft = rect.right + (tooWide ? 0 : 10) - screenw;
    }
    return result;
  }

  // Store a relative adjustment to the scroll position in the current
  // operation (to be applied when the operation finishes).
  function addToScrollTop(cm, top) {
    if (top == null) {
      return;
    }
    resolveScrollToPos(cm);
    cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
  }

  // Make sure that at the end of the operation the current cursor is
  // shown.
  function ensureCursorVisible(cm) {
    resolveScrollToPos(cm);
    var cur = cm.getCursor();
    cm.curOp.scrollToPos = { from: cur, to: cur, margin: cm.options.cursorScrollMargin };
  }

  function scrollToCoords(cm, x, y) {
    if (x != null || y != null) {
      resolveScrollToPos(cm);
    }
    if (x != null) {
      cm.curOp.scrollLeft = x;
    }
    if (y != null) {
      cm.curOp.scrollTop = y;
    }
  }

  function scrollToRange(cm, range) {
    resolveScrollToPos(cm);
    cm.curOp.scrollToPos = range;
  }

  // When an operation has its scrollToPos property set, and another
  // scroll action is applied before the end of the operation, this
  // 'simulates' scrolling that position into view in a cheap way, so
  // that the effect of intermediate scroll commands is not ignored.
  function resolveScrollToPos(cm) {
    var range = cm.curOp.scrollToPos;
    if (range) {
      cm.curOp.scrollToPos = null;
      var from = estimateCoords(cm, range.from),
          to = estimateCoords(cm, range.to);
      scrollToCoordsRange(cm, from, to, range.margin);
    }
  }

  function scrollToCoordsRange(cm, from, to, margin) {
    var sPos = calculateScrollPos(cm, {
      left: Math.min(from.left, to.left),
      top: Math.min(from.top, to.top) - margin,
      right: Math.max(from.right, to.right),
      bottom: Math.max(from.bottom, to.bottom) + margin
    });
    scrollToCoords(cm, sPos.scrollLeft, sPos.scrollTop);
  }

  // Sync the scrollable area and scrollbars, ensure the viewport
  // covers the visible area.
  function updateScrollTop(cm, val) {
    if (Math.abs(cm.doc.scrollTop - val) < 2) {
      return;
    }
    if (!gecko) {
      updateDisplaySimple(cm, { top: val });
    }
    setScrollTop(cm, val, true);
    if (gecko) {
      updateDisplaySimple(cm);
    }
    startWorker(cm, 100);
  }

  function setScrollTop(cm, val, forceScroll) {
    val = Math.min(cm.display.scroller.scrollHeight - cm.display.scroller.clientHeight, val);
    if (cm.display.scroller.scrollTop == val && !forceScroll) {
      return;
    }
    cm.doc.scrollTop = val;
    cm.display.scrollbars.setScrollTop(val);
    if (cm.display.scroller.scrollTop != val) {
      cm.display.scroller.scrollTop = val;
    }
  }

  // Sync scroller and scrollbar, ensure the gutter elements are
  // aligned.
  function setScrollLeft(cm, val, isScroller, forceScroll) {
    val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);
    if ((isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) && !forceScroll) {
      return;
    }
    cm.doc.scrollLeft = val;
    alignHorizontally(cm);
    if (cm.display.scroller.scrollLeft != val) {
      cm.display.scroller.scrollLeft = val;
    }
    cm.display.scrollbars.setScrollLeft(val);
  }

  // SCROLLBARS

  // Prepare DOM reads needed to update the scrollbars. Done in one
  // shot to minimize update/measure roundtrips.
  function measureForScrollbars(cm) {
    var d = cm.display,
        gutterW = d.gutters.offsetWidth;
    var docH = Math.round(cm.doc.height + paddingVert(cm.display));
    return {
      clientHeight: d.scroller.clientHeight,
      viewHeight: d.wrapper.clientHeight,
      scrollWidth: d.scroller.scrollWidth, clientWidth: d.scroller.clientWidth,
      viewWidth: d.wrapper.clientWidth,
      barLeft: cm.options.fixedGutter ? gutterW : 0,
      docHeight: docH,
      scrollHeight: docH + scrollGap(cm) + d.barHeight,
      nativeBarWidth: d.nativeBarWidth,
      gutterWidth: gutterW
    };
  }

  var NativeScrollbars = function (place, scroll, cm) {
    this.cm = cm;
    var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    place(vert);place(horiz);

    on(vert, "scroll", function () {
      if (vert.clientHeight) {
        scroll(vert.scrollTop, "vertical");
      }
    });
    on(horiz, "scroll", function () {
      if (horiz.clientWidth) {
        scroll(horiz.scrollLeft, "horizontal");
      }
    });

    this.checkedZeroWidth = false;
    // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
    if (ie && ie_version < 8) {
      this.horiz.style.minHeight = this.vert.style.minWidth = "18px";
    }
  };

  NativeScrollbars.prototype.update = function (measure) {
    var needsH = measure.scrollWidth > measure.clientWidth + 1;
    var needsV = measure.scrollHeight > measure.clientHeight + 1;
    var sWidth = measure.nativeBarWidth;

    if (needsV) {
      this.vert.style.display = "block";
      this.vert.style.bottom = needsH ? sWidth + "px" : "0";
      var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
      // A bug in IE8 can cause this value to be negative, so guard it.
      this.vert.firstChild.style.height = Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
    } else {
      this.vert.style.display = "";
      this.vert.firstChild.style.height = "0";
    }

    if (needsH) {
      this.horiz.style.display = "block";
      this.horiz.style.right = needsV ? sWidth + "px" : "0";
      this.horiz.style.left = measure.barLeft + "px";
      var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
      this.horiz.firstChild.style.width = Math.max(0, measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
    } else {
      this.horiz.style.display = "";
      this.horiz.firstChild.style.width = "0";
    }

    if (!this.checkedZeroWidth && measure.clientHeight > 0) {
      if (sWidth == 0) {
        this.zeroWidthHack();
      }
      this.checkedZeroWidth = true;
    }

    return { right: needsV ? sWidth : 0, bottom: needsH ? sWidth : 0 };
  };

  NativeScrollbars.prototype.setScrollLeft = function (pos) {
    if (this.horiz.scrollLeft != pos) {
      this.horiz.scrollLeft = pos;
    }
    if (this.disableHoriz) {
      this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz");
    }
  };

  NativeScrollbars.prototype.setScrollTop = function (pos) {
    if (this.vert.scrollTop != pos) {
      this.vert.scrollTop = pos;
    }
    if (this.disableVert) {
      this.enableZeroWidthBar(this.vert, this.disableVert, "vert");
    }
  };

  NativeScrollbars.prototype.zeroWidthHack = function () {
    var w = mac && !mac_geMountainLion ? "12px" : "18px";
    this.horiz.style.height = this.vert.style.width = w;
    this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none";
    this.disableHoriz = new Delayed();
    this.disableVert = new Delayed();
  };

  NativeScrollbars.prototype.enableZeroWidthBar = function (bar, delay, type) {
    bar.style.pointerEvents = "auto";
    function maybeDisable() {
      // To find out whether the scrollbar is still visible, we
      // check whether the element under the pixel in the bottom
      // right corner of the scrollbar box is the scrollbar box
      // itself (when the bar is still visible) or its filler child
      // (when the bar is hidden). If it is still visible, we keep
      // it enabled, if it's hidden, we disable pointer events.
      var box = bar.getBoundingClientRect();
      var elt = type == "vert" ? document.elementFromPoint(box.right - 1, (box.top + box.bottom) / 2) : document.elementFromPoint((box.right + box.left) / 2, box.bottom - 1);
      if (elt != bar) {
        bar.style.pointerEvents = "none";
      } else {
        delay.set(1000, maybeDisable);
      }
    }
    delay.set(1000, maybeDisable);
  };

  NativeScrollbars.prototype.clear = function () {
    var parent = this.horiz.parentNode;
    parent.removeChild(this.horiz);
    parent.removeChild(this.vert);
  };

  var NullScrollbars = function () {};

  NullScrollbars.prototype.update = function () {
    return { bottom: 0, right: 0 };
  };
  NullScrollbars.prototype.setScrollLeft = function () {};
  NullScrollbars.prototype.setScrollTop = function () {};
  NullScrollbars.prototype.clear = function () {};

  function updateScrollbars(cm, measure) {
    if (!measure) {
      measure = measureForScrollbars(cm);
    }
    var startWidth = cm.display.barWidth,
        startHeight = cm.display.barHeight;
    updateScrollbarsInner(cm, measure);
    for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
      if (startWidth != cm.display.barWidth && cm.options.lineWrapping) {
        updateHeightsInViewport(cm);
      }
      updateScrollbarsInner(cm, measureForScrollbars(cm));
      startWidth = cm.display.barWidth;startHeight = cm.display.barHeight;
    }
  }

  // Re-synchronize the fake scrollbars with the actual size of the
  // content.
  function updateScrollbarsInner(cm, measure) {
    var d = cm.display;
    var sizes = d.scrollbars.update(measure);

    d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
    d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";
    d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent";

    if (sizes.right && sizes.bottom) {
      d.scrollbarFiller.style.display = "block";
      d.scrollbarFiller.style.height = sizes.bottom + "px";
      d.scrollbarFiller.style.width = sizes.right + "px";
    } else {
      d.scrollbarFiller.style.display = "";
    }
    if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
      d.gutterFiller.style.display = "block";
      d.gutterFiller.style.height = sizes.bottom + "px";
      d.gutterFiller.style.width = measure.gutterWidth + "px";
    } else {
      d.gutterFiller.style.display = "";
    }
  }

  var scrollbarModel = { "native": NativeScrollbars, "null": NullScrollbars };

  function initScrollbars(cm) {
    if (cm.display.scrollbars) {
      cm.display.scrollbars.clear();
      if (cm.display.scrollbars.addClass) {
        rmClass(cm.display.wrapper, cm.display.scrollbars.addClass);
      }
    }

    cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function (node) {
      cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
      // Prevent clicks in the scrollbars from killing focus
      on(node, "mousedown", function () {
        if (cm.state.focused) {
          setTimeout(function () {
            return cm.display.input.focus();
          }, 0);
        }
      });
      node.setAttribute("cm-not-content", "true");
    }, function (pos, axis) {
      if (axis == "horizontal") {
        setScrollLeft(cm, pos);
      } else {
        updateScrollTop(cm, pos);
      }
    }, cm);
    if (cm.display.scrollbars.addClass) {
      addClass(cm.display.wrapper, cm.display.scrollbars.addClass);
    }
  }

  // Operations are used to wrap a series of changes to the editor
  // state in such a way that each change won't have to update the
  // cursor and display (which would be awkward, slow, and
  // error-prone). Instead, display updates are batched and then all
  // combined and executed at once.

  var nextOpId = 0;
  // Start a new operation.
  function startOperation(cm) {
    cm.curOp = {
      cm: cm,
      viewChanged: false, // Flag that indicates that lines might need to be redrawn
      startHeight: cm.doc.height, // Used to detect need to update scrollbar
      forceUpdate: false, // Used to force a redraw
      updateInput: null, // Whether to reset the input textarea
      typing: false, // Whether this reset should be careful to leave existing text (for compositing)
      changeObjs: null, // Accumulated changes, for firing change events
      cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
      cursorActivityCalled: 0, // Tracks which cursorActivity handlers have been called already
      selectionChanged: false, // Whether the selection needs to be redrawn
      updateMaxLine: false, // Set when the widest line needs to be determined anew
      scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
      scrollToPos: null, // Used to scroll to a specific position
      focus: false,
      id: ++nextOpId // Unique ID
    };
    pushOperation(cm.curOp);
  }

  // Finish an operation, updating the display and signalling delayed events
  function endOperation(cm) {
    var op = cm.curOp;
    finishOperation(op, function (group) {
      for (var i = 0; i < group.ops.length; i++) {
        group.ops[i].cm.curOp = null;
      }
      endOperations(group);
    });
  }

  // The DOM updates done when an operation finishes are batched so
  // that the minimum number of relayouts are required.
  function endOperations(group) {
    var ops = group.ops;
    for (var i = 0; i < ops.length; i++) // Read DOM
    {
      endOperation_R1(ops[i]);
    }
    for (var i$1 = 0; i$1 < ops.length; i$1++) // Write DOM (maybe)
    {
      endOperation_W1(ops[i$1]);
    }
    for (var i$2 = 0; i$2 < ops.length; i$2++) // Read DOM
    {
      endOperation_R2(ops[i$2]);
    }
    for (var i$3 = 0; i$3 < ops.length; i$3++) // Write DOM (maybe)
    {
      endOperation_W2(ops[i$3]);
    }
    for (var i$4 = 0; i$4 < ops.length; i$4++) // Read DOM
    {
      endOperation_finish(ops[i$4]);
    }
  }

  function endOperation_R1(op) {
    var cm = op.cm,
        display = cm.display;
    maybeClipScrollbars(cm);
    if (op.updateMaxLine) {
      findMaxLine(cm);
    }

    op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null || op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom || op.scrollToPos.to.line >= display.viewTo) || display.maxLineChanged && cm.options.lineWrapping;
    op.update = op.mustUpdate && new DisplayUpdate(cm, op.mustUpdate && { top: op.scrollTop, ensure: op.scrollToPos }, op.forceUpdate);
  }

  function endOperation_W1(op) {
    op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
  }

  function endOperation_R2(op) {
    var cm = op.cm,
        display = cm.display;
    if (op.updatedDisplay) {
      updateHeightsInViewport(cm);
    }

    op.barMeasure = measureForScrollbars(cm);

    // If the max line changed since it was last measured, measure it,
    // and ensure the document's width matches it.
    // updateDisplay_W2 will use these properties to do the actual resizing
    if (display.maxLineChanged && !cm.options.lineWrapping) {
      op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
      cm.display.sizerWidth = op.adjustWidthTo;
      op.barMeasure.scrollWidth = Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
      op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
    }

    if (op.updatedDisplay || op.selectionChanged) {
      op.preparedSelection = display.input.prepareSelection();
    }
  }

  function endOperation_W2(op) {
    var cm = op.cm;

    if (op.adjustWidthTo != null) {
      cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
      if (op.maxScrollLeft < cm.doc.scrollLeft) {
        setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true);
      }
      cm.display.maxLineChanged = false;
    }

    var takeFocus = op.focus && op.focus == activeElt();
    if (op.preparedSelection) {
      cm.display.input.showSelection(op.preparedSelection, takeFocus);
    }
    if (op.updatedDisplay || op.startHeight != cm.doc.height) {
      updateScrollbars(cm, op.barMeasure);
    }
    if (op.updatedDisplay) {
      setDocumentHeight(cm, op.barMeasure);
    }

    if (op.selectionChanged) {
      restartBlink(cm);
    }

    if (cm.state.focused && op.updateInput) {
      cm.display.input.reset(op.typing);
    }
    if (takeFocus) {
      ensureFocus(op.cm);
    }
  }

  function endOperation_finish(op) {
    var cm = op.cm,
        display = cm.display,
        doc = cm.doc;

    if (op.updatedDisplay) {
      postUpdateDisplay(cm, op.update);
    }

    // Abort mouse wheel delta measurement, when scrolling explicitly
    if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos)) {
      display.wheelStartX = display.wheelStartY = null;
    }

    // Propagate the scroll position to the actual DOM scroller
    if (op.scrollTop != null) {
      setScrollTop(cm, op.scrollTop, op.forceScroll);
    }

    if (op.scrollLeft != null) {
      setScrollLeft(cm, op.scrollLeft, true, true);
    }
    // If we need to scroll a specific position into view, do so.
    if (op.scrollToPos) {
      var rect = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from), clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
      maybeScrollWindow(cm, rect);
    }

    // Fire events for markers that are hidden/unidden by editing or
    // undoing
    var hidden = op.maybeHiddenMarkers,
        unhidden = op.maybeUnhiddenMarkers;
    if (hidden) {
      for (var i = 0; i < hidden.length; ++i) {
        if (!hidden[i].lines.length) {
          signal(hidden[i], "hide");
        }
      }
    }
    if (unhidden) {
      for (var i$1 = 0; i$1 < unhidden.length; ++i$1) {
        if (unhidden[i$1].lines.length) {
          signal(unhidden[i$1], "unhide");
        }
      }
    }

    if (display.wrapper.offsetHeight) {
      doc.scrollTop = cm.display.scroller.scrollTop;
    }

    // Fire change events, and delayed event handlers
    if (op.changeObjs) {
      signal(cm, "changes", cm, op.changeObjs);
    }
    if (op.update) {
      op.update.finish();
    }
  }

  // Run the given function in an operation
  function runInOp(cm, f) {
    if (cm.curOp) {
      return f();
    }
    startOperation(cm);
    try {
      return f();
    } finally {
      endOperation(cm);
    }
  }
  // Wraps a function in an operation. Returns the wrapped function.
  function operation(cm, f) {
    return function () {
      if (cm.curOp) {
        return f.apply(cm, arguments);
      }
      startOperation(cm);
      try {
        return f.apply(cm, arguments);
      } finally {
        endOperation(cm);
      }
    };
  }
  // Used to add methods to editor and doc instances, wrapping them in
  // operations.
  function methodOp(f) {
    return function () {
      if (this.curOp) {
        return f.apply(this, arguments);
      }
      startOperation(this);
      try {
        return f.apply(this, arguments);
      } finally {
        endOperation(this);
      }
    };
  }
  function docMethodOp(f) {
    return function () {
      var cm = this.cm;
      if (!cm || cm.curOp) {
        return f.apply(this, arguments);
      }
      startOperation(cm);
      try {
        return f.apply(this, arguments);
      } finally {
        endOperation(cm);
      }
    };
  }

  // Updates the display.view data structure for a given change to the
  // document. From and to are in pre-change coordinates. Lendiff is
  // the amount of lines added or subtracted by the change. This is
  // used for changes that span multiple lines, or change the way
  // lines are divided into visual lines. regLineChange (below)
  // registers single-line changes.
  function regChange(cm, from, to, lendiff) {
    if (from == null) {
      from = cm.doc.first;
    }
    if (to == null) {
      to = cm.doc.first + cm.doc.size;
    }
    if (!lendiff) {
      lendiff = 0;
    }

    var display = cm.display;
    if (lendiff && to < display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers > from)) {
      display.updateLineNumbers = from;
    }

    cm.curOp.viewChanged = true;

    if (from >= display.viewTo) {
      // Change after
      if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo) {
        resetView(cm);
      }
    } else if (to <= display.viewFrom) {
      // Change before
      if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
        resetView(cm);
      } else {
        display.viewFrom += lendiff;
        display.viewTo += lendiff;
      }
    } else if (from <= display.viewFrom && to >= display.viewTo) {
      // Full overlap
      resetView(cm);
    } else if (from <= display.viewFrom) {
      // Top overlap
      var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cut) {
        display.view = display.view.slice(cut.index);
        display.viewFrom = cut.lineN;
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    } else if (to >= display.viewTo) {
      // Bottom overlap
      var cut$1 = viewCuttingPoint(cm, from, from, -1);
      if (cut$1) {
        display.view = display.view.slice(0, cut$1.index);
        display.viewTo = cut$1.lineN;
      } else {
        resetView(cm);
      }
    } else {
      // Gap in the middle
      var cutTop = viewCuttingPoint(cm, from, from, -1);
      var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cutTop && cutBot) {
        display.view = display.view.slice(0, cutTop.index).concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN)).concat(display.view.slice(cutBot.index));
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    }

    var ext = display.externalMeasured;
    if (ext) {
      if (to < ext.lineN) {
        ext.lineN += lendiff;
      } else if (from < ext.lineN + ext.size) {
        display.externalMeasured = null;
      }
    }
  }

  // Register a change to a single line. Type must be one of "text",
  // "gutter", "class", "widget"
  function regLineChange(cm, line, type) {
    cm.curOp.viewChanged = true;
    var display = cm.display,
        ext = cm.display.externalMeasured;
    if (ext && line >= ext.lineN && line < ext.lineN + ext.size) {
      display.externalMeasured = null;
    }

    if (line < display.viewFrom || line >= display.viewTo) {
      return;
    }
    var lineView = display.view[findViewIndex(cm, line)];
    if (lineView.node == null) {
      return;
    }
    var arr = lineView.changes || (lineView.changes = []);
    if (indexOf(arr, type) == -1) {
      arr.push(type);
    }
  }

  // Clear the view.
  function resetView(cm) {
    cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
    cm.display.view = [];
    cm.display.viewOffset = 0;
  }

  function viewCuttingPoint(cm, oldN, newN, dir) {
    var index = findViewIndex(cm, oldN),
        diff,
        view = cm.display.view;
    if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size) {
      return { index: index, lineN: newN };
    }
    var n = cm.display.viewFrom;
    for (var i = 0; i < index; i++) {
      n += view[i].size;
    }
    if (n != oldN) {
      if (dir > 0) {
        if (index == view.length - 1) {
          return null;
        }
        diff = n + view[index].size - oldN;
        index++;
      } else {
        diff = n - oldN;
      }
      oldN += diff;newN += diff;
    }
    while (visualLineNo(cm.doc, newN) != newN) {
      if (index == (dir < 0 ? 0 : view.length - 1)) {
        return null;
      }
      newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
      index += dir;
    }
    return { index: index, lineN: newN };
  }

  // Force the view to cover a given range, adding empty view element
  // or clipping off existing ones as needed.
  function adjustView(cm, from, to) {
    var display = cm.display,
        view = display.view;
    if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
      display.view = buildViewArray(cm, from, to);
      display.viewFrom = from;
    } else {
      if (display.viewFrom > from) {
        display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);
      } else if (display.viewFrom < from) {
        display.view = display.view.slice(findViewIndex(cm, from));
      }
      display.viewFrom = from;
      if (display.viewTo < to) {
        display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));
      } else if (display.viewTo > to) {
        display.view = display.view.slice(0, findViewIndex(cm, to));
      }
    }
    display.viewTo = to;
  }

  // Count the number of lines in the view whose DOM representation is
  // out of date (or nonexistent).
  function countDirtyView(cm) {
    var view = cm.display.view,
        dirty = 0;
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (!lineView.hidden && (!lineView.node || lineView.changes)) {
        ++dirty;
      }
    }
    return dirty;
  }

  // HIGHLIGHT WORKER

  function startWorker(cm, time) {
    if (cm.doc.highlightFrontier < cm.display.viewTo) {
      cm.state.highlight.set(time, bind(highlightWorker, cm));
    }
  }

  function highlightWorker(cm) {
    var doc = cm.doc;
    if (doc.highlightFrontier >= cm.display.viewTo) {
      return;
    }
    var end = +new Date() + cm.options.workTime;
    var context = getContextBefore(cm, doc.highlightFrontier);
    var changedLines = [];

    doc.iter(context.line, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function (line) {
      if (context.line >= cm.display.viewFrom) {
        // Visible
        var oldStyles = line.styles;
        var resetState = line.text.length > cm.options.maxHighlightLength ? copyState(doc.mode, context.state) : null;
        var highlighted = highlightLine(cm, line, context, true);
        if (resetState) {
          context.state = resetState;
        }
        line.styles = highlighted.styles;
        var oldCls = line.styleClasses,
            newCls = highlighted.classes;
        if (newCls) {
          line.styleClasses = newCls;
        } else if (oldCls) {
          line.styleClasses = null;
        }
        var ischange = !oldStyles || oldStyles.length != line.styles.length || oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);
        for (var i = 0; !ischange && i < oldStyles.length; ++i) {
          ischange = oldStyles[i] != line.styles[i];
        }
        if (ischange) {
          changedLines.push(context.line);
        }
        line.stateAfter = context.save();
        context.nextLine();
      } else {
        if (line.text.length <= cm.options.maxHighlightLength) {
          processLine(cm, line.text, context);
        }
        line.stateAfter = context.line % 5 == 0 ? context.save() : null;
        context.nextLine();
      }
      if (+new Date() > end) {
        startWorker(cm, cm.options.workDelay);
        return true;
      }
    });
    doc.highlightFrontier = context.line;
    doc.modeFrontier = Math.max(doc.modeFrontier, context.line);
    if (changedLines.length) {
      runInOp(cm, function () {
        for (var i = 0; i < changedLines.length; i++) {
          regLineChange(cm, changedLines[i], "text");
        }
      });
    }
  }

  // DISPLAY DRAWING

  var DisplayUpdate = function (cm, viewport, force) {
    var display = cm.display;

    this.viewport = viewport;
    // Store some values that we'll need later (but don't want to force a relayout for)
    this.visible = visibleLines(display, cm.doc, viewport);
    this.editorIsHidden = !display.wrapper.offsetWidth;
    this.wrapperHeight = display.wrapper.clientHeight;
    this.wrapperWidth = display.wrapper.clientWidth;
    this.oldDisplayWidth = displayWidth(cm);
    this.force = force;
    this.dims = getDimensions(cm);
    this.events = [];
  };

  DisplayUpdate.prototype.signal = function (emitter, type) {
    if (hasHandler(emitter, type)) {
      this.events.push(arguments);
    }
  };
  DisplayUpdate.prototype.finish = function () {
    var this$1 = this;

    for (var i = 0; i < this.events.length; i++) {
      signal.apply(null, this$1.events[i]);
    }
  };

  function maybeClipScrollbars(cm) {
    var display = cm.display;
    if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
      display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
      display.heightForcer.style.height = scrollGap(cm) + "px";
      display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
      display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
      display.scrollbarsClipped = true;
    }
  }

  function selectionSnapshot(cm) {
    if (cm.hasFocus()) {
      return null;
    }
    var active = activeElt();
    if (!active || !contains(cm.display.lineDiv, active)) {
      return null;
    }
    var result = { activeElt: active };
    if (window.getSelection) {
      var sel = window.getSelection();
      if (sel.anchorNode && sel.extend && contains(cm.display.lineDiv, sel.anchorNode)) {
        result.anchorNode = sel.anchorNode;
        result.anchorOffset = sel.anchorOffset;
        result.focusNode = sel.focusNode;
        result.focusOffset = sel.focusOffset;
      }
    }
    return result;
  }

  function restoreSelection(snapshot) {
    if (!snapshot || !snapshot.activeElt || snapshot.activeElt == activeElt()) {
      return;
    }
    snapshot.activeElt.focus();
    if (snapshot.anchorNode && contains(document.body, snapshot.anchorNode) && contains(document.body, snapshot.focusNode)) {
      var sel = window.getSelection(),
          range = document.createRange();
      range.setEnd(snapshot.anchorNode, snapshot.anchorOffset);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      sel.extend(snapshot.focusNode, snapshot.focusOffset);
    }
  }

  // Does the actual updating of the line display. Bails out
  // (returning false) when there is nothing to be done and forced is
  // false.
  function updateDisplayIfNeeded(cm, update) {
    var display = cm.display,
        doc = cm.doc;

    if (update.editorIsHidden) {
      resetView(cm);
      return false;
    }

    // Bail out if the visible area is already rendered and nothing changed.
    if (!update.force && update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) && display.renderedView == display.view && countDirtyView(cm) == 0) {
      return false;
    }

    if (maybeUpdateLineNumberWidth(cm)) {
      resetView(cm);
      update.dims = getDimensions(cm);
    }

    // Compute a suitable new viewport (from & to)
    var end = doc.first + doc.size;
    var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
    var to = Math.min(end, update.visible.to + cm.options.viewportMargin);
    if (display.viewFrom < from && from - display.viewFrom < 20) {
      from = Math.max(doc.first, display.viewFrom);
    }
    if (display.viewTo > to && display.viewTo - to < 20) {
      to = Math.min(end, display.viewTo);
    }
    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }

    var different = from != display.viewFrom || to != display.viewTo || display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
    adjustView(cm, from, to);

    display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
    // Position the mover div to align with the current scroll position
    cm.display.mover.style.top = display.viewOffset + "px";

    var toUpdate = countDirtyView(cm);
    if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo)) {
      return false;
    }

    // For big changes, we hide the enclosing element during the
    // update, since that speeds up the operations on most browsers.
    var selSnapshot = selectionSnapshot(cm);
    if (toUpdate > 4) {
      display.lineDiv.style.display = "none";
    }
    patchDisplay(cm, display.updateLineNumbers, update.dims);
    if (toUpdate > 4) {
      display.lineDiv.style.display = "";
    }
    display.renderedView = display.view;
    // There might have been a widget with a focused element that got
    // hidden or updated, if so re-focus it.
    restoreSelection(selSnapshot);

    // Prevent selection and cursors from interfering with the scroll
    // width and height.
    removeChildren(display.cursorDiv);
    removeChildren(display.selectionDiv);
    display.gutters.style.height = display.sizer.style.minHeight = 0;

    if (different) {
      display.lastWrapHeight = update.wrapperHeight;
      display.lastWrapWidth = update.wrapperWidth;
      startWorker(cm, 400);
    }

    display.updateLineNumbers = null;

    return true;
  }

  function postUpdateDisplay(cm, update) {
    var viewport = update.viewport;

    for (var first = true;; first = false) {
      if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
        // Clip forced viewport to actual scrollable area.
        if (viewport && viewport.top != null) {
          viewport = { top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top) };
        }
        // Updated line heights might result in the drawn area not
        // actually covering the viewport. Keep looping until it does.
        update.visible = visibleLines(cm.display, cm.doc, viewport);
        if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo) {
          break;
        }
      }
      if (!updateDisplayIfNeeded(cm, update)) {
        break;
      }
      updateHeightsInViewport(cm);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      updateScrollbars(cm, barMeasure);
      setDocumentHeight(cm, barMeasure);
      update.force = false;
    }

    update.signal(cm, "update", cm);
    if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
      update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
      cm.display.reportedViewFrom = cm.display.viewFrom;cm.display.reportedViewTo = cm.display.viewTo;
    }
  }

  function updateDisplaySimple(cm, viewport) {
    var update = new DisplayUpdate(cm, viewport);
    if (updateDisplayIfNeeded(cm, update)) {
      updateHeightsInViewport(cm);
      postUpdateDisplay(cm, update);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      updateScrollbars(cm, barMeasure);
      setDocumentHeight(cm, barMeasure);
      update.finish();
    }
  }

  // Sync the actual display DOM structure with display.view, removing
  // nodes for lines that are no longer in view, and creating the ones
  // that are not there yet, and updating the ones that are out of
  // date.
  function patchDisplay(cm, updateNumbersFrom, dims) {
    var display = cm.display,
        lineNumbers = cm.options.lineNumbers;
    var container = display.lineDiv,
        cur = container.firstChild;

    function rm(node) {
      var next = node.nextSibling;
      // Works around a throw-scroll bug in OS X Webkit
      if (webkit && mac && cm.display.currentWheelTarget == node) {
        node.style.display = "none";
      } else {
        node.parentNode.removeChild(node);
      }
      return next;
    }

    var view = display.view,
        lineN = display.viewFrom;
    // Loop over the elements in the view, syncing cur (the DOM nodes
    // in display.lineDiv) with the view as we go.
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (lineView.hidden) {} else if (!lineView.node || lineView.node.parentNode != container) {
        // Not drawn yet
        var node = buildLineElement(cm, lineView, lineN, dims);
        container.insertBefore(node, cur);
      } else {
        // Already drawn
        while (cur != lineView.node) {
          cur = rm(cur);
        }
        var updateNumber = lineNumbers && updateNumbersFrom != null && updateNumbersFrom <= lineN && lineView.lineNumber;
        if (lineView.changes) {
          if (indexOf(lineView.changes, "gutter") > -1) {
            updateNumber = false;
          }
          updateLineForChanges(cm, lineView, lineN, dims);
        }
        if (updateNumber) {
          removeChildren(lineView.lineNumber);
          lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
        }
        cur = lineView.node.nextSibling;
      }
      lineN += lineView.size;
    }
    while (cur) {
      cur = rm(cur);
    }
  }

  function updateGutterSpace(cm) {
    var width = cm.display.gutters.offsetWidth;
    cm.display.sizer.style.marginLeft = width + "px";
  }

  function setDocumentHeight(cm, measure) {
    cm.display.sizer.style.minHeight = measure.docHeight + "px";
    cm.display.heightForcer.style.top = measure.docHeight + "px";
    cm.display.gutters.style.height = measure.docHeight + cm.display.barHeight + scrollGap(cm) + "px";
  }

  // Rebuild the gutter elements, ensure the margin to the left of the
  // code matches their width.
  function updateGutters(cm) {
    var gutters = cm.display.gutters,
        specs = cm.options.gutters;
    removeChildren(gutters);
    var i = 0;
    for (; i < specs.length; ++i) {
      var gutterClass = specs[i];
      var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));
      if (gutterClass == "CodeMirror-linenumbers") {
        cm.display.lineGutter = gElt;
        gElt.style.width = (cm.display.lineNumWidth || 1) + "px";
      }
    }
    gutters.style.display = i ? "" : "none";
    updateGutterSpace(cm);
  }

  // Make sure the gutters options contains the element
  // "CodeMirror-linenumbers" when the lineNumbers option is true.
  function setGuttersForLineNumbers(options) {
    var found = indexOf(options.gutters, "CodeMirror-linenumbers");
    if (found == -1 && options.lineNumbers) {
      options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]);
    } else if (found > -1 && !options.lineNumbers) {
      options.gutters = options.gutters.slice(0);
      options.gutters.splice(found, 1);
    }
  }

  var wheelSamples = 0;
  var wheelPixelsPerUnit = null;
  // Fill in a browser-detected starting value on browsers where we
  // know one. These don't have to be accurate -- the result of them
  // being wrong would just be a slight flicker on the first wheel
  // scroll (if it is large enough).
  if (ie) {
    wheelPixelsPerUnit = -.53;
  } else if (gecko) {
    wheelPixelsPerUnit = 15;
  } else if (chrome) {
    wheelPixelsPerUnit = -.7;
  } else if (safari) {
    wheelPixelsPerUnit = -1 / 3;
  }

  function wheelEventDelta(e) {
    var dx = e.wheelDeltaX,
        dy = e.wheelDeltaY;
    if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) {
      dx = e.detail;
    }
    if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) {
      dy = e.detail;
    } else if (dy == null) {
      dy = e.wheelDelta;
    }
    return { x: dx, y: dy };
  }
  function wheelEventPixels(e) {
    var delta = wheelEventDelta(e);
    delta.x *= wheelPixelsPerUnit;
    delta.y *= wheelPixelsPerUnit;
    return delta;
  }

  function onScrollWheel(cm, e) {
    var delta = wheelEventDelta(e),
        dx = delta.x,
        dy = delta.y;

    var display = cm.display,
        scroll = display.scroller;
    // Quit if there's nothing to scroll here
    var canScrollX = scroll.scrollWidth > scroll.clientWidth;
    var canScrollY = scroll.scrollHeight > scroll.clientHeight;
    if (!(dx && canScrollX || dy && canScrollY)) {
      return;
    }

    // Webkit browsers on OS X abort momentum scrolls when the target
    // of the scroll event is removed from the scrollable element.
    // This hack (see related code in patchDisplay) makes sure the
    // element is kept around.
    if (dy && mac && webkit) {
      outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
        for (var i = 0; i < view.length; i++) {
          if (view[i].node == cur) {
            cm.display.currentWheelTarget = cur;
            break outer;
          }
        }
      }
    }

    // On some browsers, horizontal scrolling will cause redraws to
    // happen before the gutter has been realigned, causing it to
    // wriggle around in a most unseemly way. When we have an
    // estimated pixels/delta value, we just handle horizontal
    // scrolling entirely here. It'll be slightly off from native, but
    // better than glitching out.
    if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
      if (dy && canScrollY) {
        updateScrollTop(cm, Math.max(0, scroll.scrollTop + dy * wheelPixelsPerUnit));
      }
      setScrollLeft(cm, Math.max(0, scroll.scrollLeft + dx * wheelPixelsPerUnit));
      // Only prevent default scrolling if vertical scrolling is
      // actually possible. Otherwise, it causes vertical scroll
      // jitter on OSX trackpads when deltaX is small and deltaY
      // is large (issue #3579)
      if (!dy || dy && canScrollY) {
        e_preventDefault(e);
      }
      display.wheelStartX = null; // Abort measurement, if in progress
      return;
    }

    // 'Project' the visible viewport to cover the area that is being
    // scrolled into view (if we know enough to estimate it).
    if (dy && wheelPixelsPerUnit != null) {
      var pixels = dy * wheelPixelsPerUnit;
      var top = cm.doc.scrollTop,
          bot = top + display.wrapper.clientHeight;
      if (pixels < 0) {
        top = Math.max(0, top + pixels - 50);
      } else {
        bot = Math.min(cm.doc.height, bot + pixels + 50);
      }
      updateDisplaySimple(cm, { top: top, bottom: bot });
    }

    if (wheelSamples < 20) {
      if (display.wheelStartX == null) {
        display.wheelStartX = scroll.scrollLeft;display.wheelStartY = scroll.scrollTop;
        display.wheelDX = dx;display.wheelDY = dy;
        setTimeout(function () {
          if (display.wheelStartX == null) {
            return;
          }
          var movedX = scroll.scrollLeft - display.wheelStartX;
          var movedY = scroll.scrollTop - display.wheelStartY;
          var sample = movedY && display.wheelDY && movedY / display.wheelDY || movedX && display.wheelDX && movedX / display.wheelDX;
          display.wheelStartX = display.wheelStartY = null;
          if (!sample) {
            return;
          }
          wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
          ++wheelSamples;
        }, 200);
      } else {
        display.wheelDX += dx;display.wheelDY += dy;
      }
    }
  }

  // Selection objects are immutable. A new one is created every time
  // the selection changes. A selection is one or more non-overlapping
  // (and non-touching) ranges, sorted, and an integer that indicates
  // which one is the primary selection (the one that's scrolled into
  // view, that getCursor returns, etc).
  var Selection = function (ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  };

  Selection.prototype.primary = function () {
    return this.ranges[this.primIndex];
  };

  Selection.prototype.equals = function (other) {
    var this$1 = this;

    if (other == this) {
      return true;
    }
    if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) {
      return false;
    }
    for (var i = 0; i < this.ranges.length; i++) {
      var here = this$1.ranges[i],
          there = other.ranges[i];
      if (!equalCursorPos(here.anchor, there.anchor) || !equalCursorPos(here.head, there.head)) {
        return false;
      }
    }
    return true;
  };

  Selection.prototype.deepCopy = function () {
    var this$1 = this;

    var out = [];
    for (var i = 0; i < this.ranges.length; i++) {
      out[i] = new Range(copyPos(this$1.ranges[i].anchor), copyPos(this$1.ranges[i].head));
    }
    return new Selection(out, this.primIndex);
  };

  Selection.prototype.somethingSelected = function () {
    var this$1 = this;

    for (var i = 0; i < this.ranges.length; i++) {
      if (!this$1.ranges[i].empty()) {
        return true;
      }
    }
    return false;
  };

  Selection.prototype.contains = function (pos, end) {
    var this$1 = this;

    if (!end) {
      end = pos;
    }
    for (var i = 0; i < this.ranges.length; i++) {
      var range = this$1.ranges[i];
      if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0) {
        return i;
      }
    }
    return -1;
  };

  var Range = function (anchor, head) {
    this.anchor = anchor;this.head = head;
  };

  Range.prototype.from = function () {
    return minPos(this.anchor, this.head);
  };
  Range.prototype.to = function () {
    return maxPos(this.anchor, this.head);
  };
  Range.prototype.empty = function () {
    return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
  };

  // Take an unsorted, potentially overlapping set of ranges, and
  // build a selection out of it. 'Consumes' ranges array (modifying
  // it).
  function normalizeSelection(ranges, primIndex) {
    var prim = ranges[primIndex];
    ranges.sort(function (a, b) {
      return cmp(a.from(), b.from());
    });
    primIndex = indexOf(ranges, prim);
    for (var i = 1; i < ranges.length; i++) {
      var cur = ranges[i],
          prev = ranges[i - 1];
      if (cmp(prev.to(), cur.from()) >= 0) {
        var from = minPos(prev.from(), cur.from()),
            to = maxPos(prev.to(), cur.to());
        var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
        if (i <= primIndex) {
          --primIndex;
        }
        ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
      }
    }
    return new Selection(ranges, primIndex);
  }

  function simpleSelection(anchor, head) {
    return new Selection([new Range(anchor, head || anchor)], 0);
  }

  // Compute the position of the end of a change (its 'to' property
  // refers to the pre-change end).
  function changeEnd(change) {
    if (!change.text) {
      return change.to;
    }
    return Pos(change.from.line + change.text.length - 1, lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0));
  }

  // Adjust a position to refer to the post-change position of the
  // same text, or the end of the change if the change covers it.
  function adjustForChange(pos, change) {
    if (cmp(pos, change.from) < 0) {
      return pos;
    }
    if (cmp(pos, change.to) <= 0) {
      return changeEnd(change);
    }

    var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1,
        ch = pos.ch;
    if (pos.line == change.to.line) {
      ch += changeEnd(change).ch - change.to.ch;
    }
    return Pos(line, ch);
  }

  function computeSelAfterChange(doc, change) {
    var out = [];
    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      out.push(new Range(adjustForChange(range.anchor, change), adjustForChange(range.head, change)));
    }
    return normalizeSelection(out, doc.sel.primIndex);
  }

  function offsetPos(pos, old, nw) {
    if (pos.line == old.line) {
      return Pos(nw.line, pos.ch - old.ch + nw.ch);
    } else {
      return Pos(nw.line + (pos.line - old.line), pos.ch);
    }
  }

  // Used by replaceSelections to allow moving the selection to the
  // start or around the replaced test. Hint may be "start" or "around".
  function computeReplacedSel(doc, changes, hint) {
    var out = [];
    var oldPrev = Pos(doc.first, 0),
        newPrev = oldPrev;
    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var from = offsetPos(change.from, oldPrev, newPrev);
      var to = offsetPos(changeEnd(change), oldPrev, newPrev);
      oldPrev = change.to;
      newPrev = to;
      if (hint == "around") {
        var range = doc.sel.ranges[i],
            inv = cmp(range.head, range.anchor) < 0;
        out[i] = new Range(inv ? to : from, inv ? from : to);
      } else {
        out[i] = new Range(from, from);
      }
    }
    return new Selection(out, doc.sel.primIndex);
  }

  // Used to get the editor into a consistent state again when options change.

  function loadMode(cm) {
    cm.doc.mode = getMode(cm.options, cm.doc.modeOption);
    resetModeState(cm);
  }

  function resetModeState(cm) {
    cm.doc.iter(function (line) {
      if (line.stateAfter) {
        line.stateAfter = null;
      }
      if (line.styles) {
        line.styles = null;
      }
    });
    cm.doc.modeFrontier = cm.doc.highlightFrontier = cm.doc.first;
    startWorker(cm, 100);
    cm.state.modeGen++;
    if (cm.curOp) {
      regChange(cm);
    }
  }

  // DOCUMENT DATA STRUCTURE

  // By default, updates that start and end at the beginning of a line
  // are treated specially, in order to make the association of line
  // widgets and marker elements with the text behave more intuitive.
  function isWholeLineUpdate(doc, change) {
    return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" && (!doc.cm || doc.cm.options.wholeLineUpdateBefore);
  }

  // Perform a change on the document data structure.
  function updateDoc(doc, change, markedSpans, estimateHeight) {
    function spansFor(n) {
      return markedSpans ? markedSpans[n] : null;
    }
    function update(line, text, spans) {
      updateLine(line, text, spans, estimateHeight);
      signalLater(line, "change", line, change);
    }
    function linesFor(start, end) {
      var result = [];
      for (var i = start; i < end; ++i) {
        result.push(new Line(text[i], spansFor(i), estimateHeight));
      }
      return result;
    }

    var from = change.from,
        to = change.to,
        text = change.text;
    var firstLine = getLine(doc, from.line),
        lastLine = getLine(doc, to.line);
    var lastText = lst(text),
        lastSpans = spansFor(text.length - 1),
        nlines = to.line - from.line;

    // Adjust the line structure
    if (change.full) {
      doc.insert(0, linesFor(0, text.length));
      doc.remove(text.length, doc.size - text.length);
    } else if (isWholeLineUpdate(doc, change)) {
      // This is a whole-line replace. Treated specially to make
      // sure line objects move the way they are supposed to.
      var added = linesFor(0, text.length - 1);
      update(lastLine, lastLine.text, lastSpans);
      if (nlines) {
        doc.remove(from.line, nlines);
      }
      if (added.length) {
        doc.insert(from.line, added);
      }
    } else if (firstLine == lastLine) {
      if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
      } else {
        var added$1 = linesFor(1, text.length - 1);
        added$1.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight));
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        doc.insert(from.line + 1, added$1);
      }
    } else if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
      doc.remove(from.line + 1, nlines);
    } else {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
      var added$2 = linesFor(1, text.length - 1);
      if (nlines > 1) {
        doc.remove(from.line + 1, nlines - 1);
      }
      doc.insert(from.line + 1, added$2);
    }

    signalLater(doc, "change", doc, change);
  }

  // Call f for all linked documents.
  function linkedDocs(doc, f, sharedHistOnly) {
    function propagate(doc, skip, sharedHist) {
      if (doc.linked) {
        for (var i = 0; i < doc.linked.length; ++i) {
          var rel = doc.linked[i];
          if (rel.doc == skip) {
            continue;
          }
          var shared = sharedHist && rel.sharedHist;
          if (sharedHistOnly && !shared) {
            continue;
          }
          f(rel.doc, shared);
          propagate(rel.doc, doc, shared);
        }
      }
    }
    propagate(doc, null, true);
  }

  // Attach a document to an editor.
  function attachDoc(cm, doc) {
    if (doc.cm) {
      throw new Error("This document is already in use.");
    }
    cm.doc = doc;
    doc.cm = cm;
    estimateLineHeights(cm);
    loadMode(cm);
    setDirectionClass(cm);
    if (!cm.options.lineWrapping) {
      findMaxLine(cm);
    }
    cm.options.mode = doc.modeOption;
    regChange(cm);
  }

  function setDirectionClass(cm) {
    ;(cm.doc.direction == "rtl" ? addClass : rmClass)(cm.display.lineDiv, "CodeMirror-rtl");
  }

  function directionChanged(cm) {
    runInOp(cm, function () {
      setDirectionClass(cm);
      regChange(cm);
    });
  }

  function History(startGen) {
    // Arrays of change events and selections. Doing something adds an
    // event to done and clears undo. Undoing moves events from done
    // to undone, redoing moves them in the other direction.
    this.done = [];this.undone = [];
    this.undoDepth = Infinity;
    // Used to track when changes can be merged into a single undo
    // event
    this.lastModTime = this.lastSelTime = 0;
    this.lastOp = this.lastSelOp = null;
    this.lastOrigin = this.lastSelOrigin = null;
    // Used by the isClean() method
    this.generation = this.maxGeneration = startGen || 1;
  }

  // Create a history change event from an updateDoc-style change
  // object.
  function historyChangeFromChange(doc, change) {
    var histChange = { from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to) };
    attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    linkedDocs(doc, function (doc) {
      return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    }, true);
    return histChange;
  }

  // Pop all selection events off the end of a history array. Stop at
  // a change event.
  function clearSelectionEvents(array) {
    while (array.length) {
      var last = lst(array);
      if (last.ranges) {
        array.pop();
      } else {
        break;
      }
    }
  }

  // Find the top change event in the history. Pop off selection
  // events that are in the way.
  function lastChangeEvent(hist, force) {
    if (force) {
      clearSelectionEvents(hist.done);
      return lst(hist.done);
    } else if (hist.done.length && !lst(hist.done).ranges) {
      return lst(hist.done);
    } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
      hist.done.pop();
      return lst(hist.done);
    }
  }

  // Register a change in the history. Merges changes that are within
  // a single operation, or are close together with an origin that
  // allows merging (starting with "+") into a single event.
  function addChangeToHistory(doc, change, selAfter, opId) {
    var hist = doc.history;
    hist.undone.length = 0;
    var time = +new Date(),
        cur;
    var last;

    if ((hist.lastOp == opId || hist.lastOrigin == change.origin && change.origin && (change.origin.charAt(0) == "+" && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay || change.origin.charAt(0) == "*")) && (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
      // Merge this change into the last event
      last = lst(cur.changes);
      if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
        // Optimized case for simple insertion -- don't want to add
        // new changesets for every character typed
        last.to = changeEnd(change);
      } else {
        // Add new sub-event
        cur.changes.push(historyChangeFromChange(doc, change));
      }
    } else {
      // Can not be merged, start a new event.
      var before = lst(hist.done);
      if (!before || !before.ranges) {
        pushSelectionToHistory(doc.sel, hist.done);
      }
      cur = { changes: [historyChangeFromChange(doc, change)],
        generation: hist.generation };
      hist.done.push(cur);
      while (hist.done.length > hist.undoDepth) {
        hist.done.shift();
        if (!hist.done[0].ranges) {
          hist.done.shift();
        }
      }
    }
    hist.done.push(selAfter);
    hist.generation = ++hist.maxGeneration;
    hist.lastModTime = hist.lastSelTime = time;
    hist.lastOp = hist.lastSelOp = opId;
    hist.lastOrigin = hist.lastSelOrigin = change.origin;

    if (!last) {
      signal(doc, "historyAdded");
    }
  }

  function selectionEventCanBeMerged(doc, origin, prev, sel) {
    var ch = origin.charAt(0);
    return ch == "*" || ch == "+" && prev.ranges.length == sel.ranges.length && prev.somethingSelected() == sel.somethingSelected() && new Date() - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500);
  }

  // Called whenever the selection changes, sets the new selection as
  // the pending selection in the history, and pushes the old pending
  // selection into the 'done' array when it was significantly
  // different (in number of selected ranges, emptiness, or time).
  function addSelectionToHistory(doc, sel, opId, options) {
    var hist = doc.history,
        origin = options && options.origin;

    // A new event is started when the previous origin does not match
    // the current, or the origins don't allow matching. Origins
    // starting with * are always merged, those starting with + are
    // merged when similar and close together in time.
    if (opId == hist.lastSelOp || origin && hist.lastSelOrigin == origin && (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin || selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))) {
      hist.done[hist.done.length - 1] = sel;
    } else {
      pushSelectionToHistory(sel, hist.done);
    }

    hist.lastSelTime = +new Date();
    hist.lastSelOrigin = origin;
    hist.lastSelOp = opId;
    if (options && options.clearRedo !== false) {
      clearSelectionEvents(hist.undone);
    }
  }

  function pushSelectionToHistory(sel, dest) {
    var top = lst(dest);
    if (!(top && top.ranges && top.equals(sel))) {
      dest.push(sel);
    }
  }

  // Used to store marked span information in the history.
  function attachLocalSpans(doc, change, from, to) {
    var existing = change["spans_" + doc.id],
        n = 0;
    doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function (line) {
      if (line.markedSpans) {
        (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
      }
      ++n;
    });
  }

  // When un/re-doing restores text containing marked spans, those
  // that have been explicitly cleared should not be restored.
  function removeClearedSpans(spans) {
    if (!spans) {
      return null;
    }
    var out;
    for (var i = 0; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) {
        if (!out) {
          out = spans.slice(0, i);
        }
      } else if (out) {
        out.push(spans[i]);
      }
    }
    return !out ? spans : out.length ? out : null;
  }

  // Retrieve and filter the old marked spans stored in a change event.
  function getOldSpans(doc, change) {
    var found = change["spans_" + doc.id];
    if (!found) {
      return null;
    }
    var nw = [];
    for (var i = 0; i < change.text.length; ++i) {
      nw.push(removeClearedSpans(found[i]));
    }
    return nw;
  }

  // Used for un/re-doing changes from the history. Combines the
  // result of computing the existing spans with the set of spans that
  // existed in the history (so that deleting around a span and then
  // undoing brings back the span).
  function mergeOldSpans(doc, change) {
    var old = getOldSpans(doc, change);
    var stretched = stretchSpansOverChange(doc, change);
    if (!old) {
      return stretched;
    }
    if (!stretched) {
      return old;
    }

    for (var i = 0; i < old.length; ++i) {
      var oldCur = old[i],
          stretchCur = stretched[i];
      if (oldCur && stretchCur) {
        spans: for (var j = 0; j < stretchCur.length; ++j) {
          var span = stretchCur[j];
          for (var k = 0; k < oldCur.length; ++k) {
            if (oldCur[k].marker == span.marker) {
              continue spans;
            }
          }
          oldCur.push(span);
        }
      } else if (stretchCur) {
        old[i] = stretchCur;
      }
    }
    return old;
  }

  // Used both to provide a JSON-safe object in .getHistory, and, when
  // detaching a document, to split the history in two
  function copyHistoryArray(events, newGroup, instantiateSel) {
    var copy = [];
    for (var i = 0; i < events.length; ++i) {
      var event = events[i];
      if (event.ranges) {
        copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
        continue;
      }
      var changes = event.changes,
          newChanges = [];
      copy.push({ changes: newChanges });
      for (var j = 0; j < changes.length; ++j) {
        var change = changes[j],
            m = void 0;
        newChanges.push({ from: change.from, to: change.to, text: change.text });
        if (newGroup) {
          for (var prop in change) {
            if (m = prop.match(/^spans_(\d+)$/)) {
              if (indexOf(newGroup, Number(m[1])) > -1) {
                lst(newChanges)[prop] = change[prop];
                delete change[prop];
              }
            }
          }
        }
      }
    }
    return copy;
  }

  // The 'scroll' parameter given to many of these indicated whether
  // the new cursor position should be scrolled into view after
  // modifying the selection.

  // If shift is held or the extend flag is set, extends a range to
  // include a given position (and optionally a second position).
  // Otherwise, simply returns the range between the given positions.
  // Used for cursor motion and such.
  function extendRange(range, head, other, extend) {
    if (extend) {
      var anchor = range.anchor;
      if (other) {
        var posBefore = cmp(head, anchor) < 0;
        if (posBefore != cmp(other, anchor) < 0) {
          anchor = head;
          head = other;
        } else if (posBefore != cmp(head, other) < 0) {
          head = other;
        }
      }
      return new Range(anchor, head);
    } else {
      return new Range(other || head, head);
    }
  }

  // Extend the primary selection range, discard the rest.
  function extendSelection(doc, head, other, options, extend) {
    if (extend == null) {
      extend = doc.cm && (doc.cm.display.shift || doc.extend);
    }
    setSelection(doc, new Selection([extendRange(doc.sel.primary(), head, other, extend)], 0), options);
  }

  // Extend all selections (pos is an array of selections with length
  // equal the number of selections)
  function extendSelections(doc, heads, options) {
    var out = [];
    var extend = doc.cm && (doc.cm.display.shift || doc.extend);
    for (var i = 0; i < doc.sel.ranges.length; i++) {
      out[i] = extendRange(doc.sel.ranges[i], heads[i], null, extend);
    }
    var newSel = normalizeSelection(out, doc.sel.primIndex);
    setSelection(doc, newSel, options);
  }

  // Updates a single range in the selection.
  function replaceOneSelection(doc, i, range, options) {
    var ranges = doc.sel.ranges.slice(0);
    ranges[i] = range;
    setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options);
  }

  // Reset the selection to a single range.
  function setSimpleSelection(doc, anchor, head, options) {
    setSelection(doc, simpleSelection(anchor, head), options);
  }

  // Give beforeSelectionChange handlers a change to influence a
  // selection update.
  function filterSelectionChange(doc, sel, options) {
    var obj = {
      ranges: sel.ranges,
      update: function (ranges) {
        var this$1 = this;

        this.ranges = [];
        for (var i = 0; i < ranges.length; i++) {
          this$1.ranges[i] = new Range(clipPos(doc, ranges[i].anchor), clipPos(doc, ranges[i].head));
        }
      },
      origin: options && options.origin
    };
    signal(doc, "beforeSelectionChange", doc, obj);
    if (doc.cm) {
      signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
    }
    if (obj.ranges != sel.ranges) {
      return normalizeSelection(obj.ranges, obj.ranges.length - 1);
    } else {
      return sel;
    }
  }

  function setSelectionReplaceHistory(doc, sel, options) {
    var done = doc.history.done,
        last = lst(done);
    if (last && last.ranges) {
      done[done.length - 1] = sel;
      setSelectionNoUndo(doc, sel, options);
    } else {
      setSelection(doc, sel, options);
    }
  }

  // Set a new selection.
  function setSelection(doc, sel, options) {
    setSelectionNoUndo(doc, sel, options);
    addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
  }

  function setSelectionNoUndo(doc, sel, options) {
    if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange")) {
      sel = filterSelectionChange(doc, sel, options);
    }

    var bias = options && options.bias || (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
    setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

    if (!(options && options.scroll === false) && doc.cm) {
      ensureCursorVisible(doc.cm);
    }
  }

  function setSelectionInner(doc, sel) {
    if (sel.equals(doc.sel)) {
      return;
    }

    doc.sel = sel;

    if (doc.cm) {
      doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = true;
      signalCursorActivity(doc.cm);
    }
    signalLater(doc, "cursorActivity", doc);
  }

  // Verify that the selection does not partially select any atomic
  // marked ranges.
  function reCheckSelection(doc) {
    setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false));
  }

  // Return a selection that does not partially select any atomic
  // ranges.
  function skipAtomicInSelection(doc, sel, bias, mayClear) {
    var out;
    for (var i = 0; i < sel.ranges.length; i++) {
      var range = sel.ranges[i];
      var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
      var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear);
      var newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear);
      if (out || newAnchor != range.anchor || newHead != range.head) {
        if (!out) {
          out = sel.ranges.slice(0, i);
        }
        out[i] = new Range(newAnchor, newHead);
      }
    }
    return out ? normalizeSelection(out, sel.primIndex) : sel;
  }

  function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
    var line = getLine(doc, pos.line);
    if (line.markedSpans) {
      for (var i = 0; i < line.markedSpans.length; ++i) {
        var sp = line.markedSpans[i],
            m = sp.marker;
        if ((sp.from == null || (m.inclusiveLeft ? sp.from <= pos.ch : sp.from < pos.ch)) && (sp.to == null || (m.inclusiveRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
          if (mayClear) {
            signal(m, "beforeCursorEnter");
            if (m.explicitlyCleared) {
              if (!line.markedSpans) {
                break;
              } else {
                --i;continue;
              }
            }
          }
          if (!m.atomic) {
            continue;
          }

          if (oldPos) {
            var near = m.find(dir < 0 ? 1 : -1),
                diff = void 0;
            if (dir < 0 ? m.inclusiveRight : m.inclusiveLeft) {
              near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null);
            }
            if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0)) {
              return skipAtomicInner(doc, near, pos, dir, mayClear);
            }
          }

          var far = m.find(dir < 0 ? -1 : 1);
          if (dir < 0 ? m.inclusiveLeft : m.inclusiveRight) {
            far = movePos(doc, far, dir, far.line == pos.line ? line : null);
          }
          return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null;
        }
      }
    }
    return pos;
  }

  // Ensure a given position is not inside an atomic range.
  function skipAtomic(doc, pos, oldPos, bias, mayClear) {
    var dir = bias || 1;
    var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, dir, true) || skipAtomicInner(doc, pos, oldPos, -dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true);
    if (!found) {
      doc.cantEdit = true;
      return Pos(doc.first, 0);
    }
    return found;
  }

  function movePos(doc, pos, dir, line) {
    if (dir < 0 && pos.ch == 0) {
      if (pos.line > doc.first) {
        return clipPos(doc, Pos(pos.line - 1));
      } else {
        return null;
      }
    } else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length) {
      if (pos.line < doc.first + doc.size - 1) {
        return Pos(pos.line + 1, 0);
      } else {
        return null;
      }
    } else {
      return new Pos(pos.line, pos.ch + dir);
    }
  }

  function selectAll(cm) {
    cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);
  }

  // UPDATING

  // Allow "beforeChange" event handlers to influence a change
  function filterChange(doc, change, update) {
    var obj = {
      canceled: false,
      from: change.from,
      to: change.to,
      text: change.text,
      origin: change.origin,
      cancel: function () {
        return obj.canceled = true;
      }
    };
    if (update) {
      obj.update = function (from, to, text, origin) {
        if (from) {
          obj.from = clipPos(doc, from);
        }
        if (to) {
          obj.to = clipPos(doc, to);
        }
        if (text) {
          obj.text = text;
        }
        if (origin !== undefined) {
          obj.origin = origin;
        }
      };
    }
    signal(doc, "beforeChange", doc, obj);
    if (doc.cm) {
      signal(doc.cm, "beforeChange", doc.cm, obj);
    }

    if (obj.canceled) {
      return null;
    }
    return { from: obj.from, to: obj.to, text: obj.text, origin: obj.origin };
  }

  // Apply a change to a document, and add it to the document's
  // history, and propagating it to all linked documents.
  function makeChange(doc, change, ignoreReadOnly) {
    if (doc.cm) {
      if (!doc.cm.curOp) {
        return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
      }
      if (doc.cm.state.suppressEdits) {
        return;
      }
    }

    if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
      change = filterChange(doc, change, true);
      if (!change) {
        return;
      }
    }

    // Possibly split or suppress the update based on the presence
    // of read-only spans in its range.
    var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
    if (split) {
      for (var i = split.length - 1; i >= 0; --i) {
        makeChangeInner(doc, { from: split[i].from, to: split[i].to, text: i ? [""] : change.text, origin: change.origin });
      }
    } else {
      makeChangeInner(doc, change);
    }
  }

  function makeChangeInner(doc, change) {
    if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) {
      return;
    }
    var selAfter = computeSelAfterChange(doc, change);
    addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);

    makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
    var rebased = [];

    linkedDocs(doc, function (doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }
      makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
    });
  }

  // Revert a change stored in a document's history.
  function makeChangeFromHistory(doc, type, allowSelectionOnly) {
    if (doc.cm && doc.cm.state.suppressEdits && !allowSelectionOnly) {
      return;
    }

    var hist = doc.history,
        event,
        selAfter = doc.sel;
    var source = type == "undo" ? hist.done : hist.undone,
        dest = type == "undo" ? hist.undone : hist.done;

    // Verify that there is a useable event (so that ctrl-z won't
    // needlessly clear selection events)
    var i = 0;
    for (; i < source.length; i++) {
      event = source[i];
      if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges) {
        break;
      }
    }
    if (i == source.length) {
      return;
    }
    hist.lastOrigin = hist.lastSelOrigin = null;

    for (;;) {
      event = source.pop();
      if (event.ranges) {
        pushSelectionToHistory(event, dest);
        if (allowSelectionOnly && !event.equals(doc.sel)) {
          setSelection(doc, event, { clearRedo: false });
          return;
        }
        selAfter = event;
      } else {
        break;
      }
    }

    // Build up a reverse change object to add to the opposite history
    // stack (redo when undoing, and vice versa).
    var antiChanges = [];
    pushSelectionToHistory(selAfter, dest);
    dest.push({ changes: antiChanges, generation: hist.generation });
    hist.generation = event.generation || ++hist.maxGeneration;

    var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

    var loop = function (i) {
      var change = event.changes[i];
      change.origin = type;
      if (filter && !filterChange(doc, change, false)) {
        source.length = 0;
        return {};
      }

      antiChanges.push(historyChangeFromChange(doc, change));

      var after = i ? computeSelAfterChange(doc, change) : lst(source);
      makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
      if (!i && doc.cm) {
        doc.cm.scrollIntoView({ from: change.from, to: changeEnd(change) });
      }
      var rebased = [];

      // Propagate to the linked documents
      linkedDocs(doc, function (doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }
        makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
      });
    };

    for (var i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
      var returned = loop(i$1);

      if (returned) return returned.v;
    }
  }

  // Sub-views need their line numbers shifted when text is added
  // above or below them in the parent document.
  function shiftDoc(doc, distance) {
    if (distance == 0) {
      return;
    }
    doc.first += distance;
    doc.sel = new Selection(map(doc.sel.ranges, function (range) {
      return new Range(Pos(range.anchor.line + distance, range.anchor.ch), Pos(range.head.line + distance, range.head.ch));
    }), doc.sel.primIndex);
    if (doc.cm) {
      regChange(doc.cm, doc.first, doc.first - distance, distance);
      for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++) {
        regLineChange(doc.cm, l, "gutter");
      }
    }
  }

  // More lower-level change function, handling only a single document
  // (not linked ones).
  function makeChangeSingleDoc(doc, change, selAfter, spans) {
    if (doc.cm && !doc.cm.curOp) {
      return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);
    }

    if (change.to.line < doc.first) {
      shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
      return;
    }
    if (change.from.line > doc.lastLine()) {
      return;
    }

    // Clip the change to the size of this doc
    if (change.from.line < doc.first) {
      var shift = change.text.length - 1 - (doc.first - change.from.line);
      shiftDoc(doc, shift);
      change = { from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
        text: [lst(change.text)], origin: change.origin };
    }
    var last = doc.lastLine();
    if (change.to.line > last) {
      change = { from: change.from, to: Pos(last, getLine(doc, last).text.length),
        text: [change.text[0]], origin: change.origin };
    }

    change.removed = getBetween(doc, change.from, change.to);

    if (!selAfter) {
      selAfter = computeSelAfterChange(doc, change);
    }
    if (doc.cm) {
      makeChangeSingleDocInEditor(doc.cm, change, spans);
    } else {
      updateDoc(doc, change, spans);
    }
    setSelectionNoUndo(doc, selAfter, sel_dontScroll);
  }

  // Handle the interaction of a change to a document with the editor
  // that this document is part of.
  function makeChangeSingleDocInEditor(cm, change, spans) {
    var doc = cm.doc,
        display = cm.display,
        from = change.from,
        to = change.to;

    var recomputeMaxLength = false,
        checkWidthStart = from.line;
    if (!cm.options.lineWrapping) {
      checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
      doc.iter(checkWidthStart, to.line + 1, function (line) {
        if (line == display.maxLine) {
          recomputeMaxLength = true;
          return true;
        }
      });
    }

    if (doc.sel.contains(change.from, change.to) > -1) {
      signalCursorActivity(cm);
    }

    updateDoc(doc, change, spans, estimateHeight(cm));

    if (!cm.options.lineWrapping) {
      doc.iter(checkWidthStart, from.line + change.text.length, function (line) {
        var len = lineLength(line);
        if (len > display.maxLineLength) {
          display.maxLine = line;
          display.maxLineLength = len;
          display.maxLineChanged = true;
          recomputeMaxLength = false;
        }
      });
      if (recomputeMaxLength) {
        cm.curOp.updateMaxLine = true;
      }
    }

    retreatFrontier(doc, from.line);
    startWorker(cm, 400);

    var lendiff = change.text.length - (to.line - from.line) - 1;
    // Remember that these lines changed, for updating the display
    if (change.full) {
      regChange(cm);
    } else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change)) {
      regLineChange(cm, from.line, "text");
    } else {
      regChange(cm, from.line, to.line + 1, lendiff);
    }

    var changesHandler = hasHandler(cm, "changes"),
        changeHandler = hasHandler(cm, "change");
    if (changeHandler || changesHandler) {
      var obj = {
        from: from, to: to,
        text: change.text,
        removed: change.removed,
        origin: change.origin
      };
      if (changeHandler) {
        signalLater(cm, "change", cm, obj);
      }
      if (changesHandler) {
        (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj);
      }
    }
    cm.display.selForContextMenu = null;
  }

  function replaceRange(doc, code, from, to, origin) {
    if (!to) {
      to = from;
    }
    if (cmp(to, from) < 0) {
      var assign;
      assign = [to, from], from = assign[0], to = assign[1], assign;
    }
    if (typeof code == "string") {
      code = doc.splitLines(code);
    }
    makeChange(doc, { from: from, to: to, text: code, origin: origin });
  }

  // Rebasing/resetting history to deal with externally-sourced changes

  function rebaseHistSelSingle(pos, from, to, diff) {
    if (to < pos.line) {
      pos.line += diff;
    } else if (from < pos.line) {
      pos.line = from;
      pos.ch = 0;
    }
  }

  // Tries to rebase an array of history events given a change in the
  // document. If the change touches the same lines as the event, the
  // event, and everything 'behind' it, is discarded. If the change is
  // before the event, the event's positions are updated. Uses a
  // copy-on-write scheme for the positions, to avoid having to
  // reallocate them all on every rebase, but also avoid problems with
  // shared position objects being unsafely updated.
  function rebaseHistArray(array, from, to, diff) {
    for (var i = 0; i < array.length; ++i) {
      var sub = array[i],
          ok = true;
      if (sub.ranges) {
        if (!sub.copied) {
          sub = array[i] = sub.deepCopy();sub.copied = true;
        }
        for (var j = 0; j < sub.ranges.length; j++) {
          rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
          rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
        }
        continue;
      }
      for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
        var cur = sub.changes[j$1];
        if (to < cur.from.line) {
          cur.from = Pos(cur.from.line + diff, cur.from.ch);
          cur.to = Pos(cur.to.line + diff, cur.to.ch);
        } else if (from <= cur.to.line) {
          ok = false;
          break;
        }
      }
      if (!ok) {
        array.splice(0, i + 1);
        i = 0;
      }
    }
  }

  function rebaseHist(hist, change) {
    var from = change.from.line,
        to = change.to.line,
        diff = change.text.length - (to - from) - 1;
    rebaseHistArray(hist.done, from, to, diff);
    rebaseHistArray(hist.undone, from, to, diff);
  }

  // Utility for applying a change to a line by handle or number,
  // returning the number and optionally registering the line as
  // changed.
  function changeLine(doc, handle, changeType, op) {
    var no = handle,
        line = handle;
    if (typeof handle == "number") {
      line = getLine(doc, clipLine(doc, handle));
    } else {
      no = lineNo(handle);
    }
    if (no == null) {
      return null;
    }
    if (op(line, no) && doc.cm) {
      regLineChange(doc.cm, no, changeType);
    }
    return line;
  }

  // The document is represented as a BTree consisting of leaves, with
  // chunk of lines in them, and branches, with up to ten leaves or
  // other branch nodes below them. The top node is always a branch
  // node, and is the document object itself (meaning it has
  // additional methods and properties).
  //
  // All nodes have parent links. The tree is used both to go from
  // line numbers to line objects, and to go from objects to numbers.
  // It also indexes by height, and is used to convert between height
  // and line object, and to find the total height of the document.
  //
  // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html

  function LeafChunk(lines) {
    var this$1 = this;

    this.lines = lines;
    this.parent = null;
    var height = 0;
    for (var i = 0; i < lines.length; ++i) {
      lines[i].parent = this$1;
      height += lines[i].height;
    }
    this.height = height;
  }

  LeafChunk.prototype = {
    chunkSize: function chunkSize() {
      return this.lines.length;
    },

    // Remove the n lines at offset 'at'.
    removeInner: function removeInner(at, n) {
      var this$1 = this;

      for (var i = at, e = at + n; i < e; ++i) {
        var line = this$1.lines[i];
        this$1.height -= line.height;
        cleanUpLine(line);
        signalLater(line, "delete");
      }
      this.lines.splice(at, n);
    },

    // Helper used to collapse a small branch into a single leaf.
    collapse: function collapse(lines) {
      lines.push.apply(lines, this.lines);
    },

    // Insert the given array of lines at offset 'at', count them as
    // having the given height.
    insertInner: function insertInner(at, lines, height) {
      var this$1 = this;

      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
      for (var i = 0; i < lines.length; ++i) {
        lines[i].parent = this$1;
      }
    },

    // Used to iterate over a part of the tree.
    iterN: function iterN(at, n, op) {
      var this$1 = this;

      for (var e = at + n; at < e; ++at) {
        if (op(this$1.lines[at])) {
          return true;
        }
      }
    }
  };

  function BranchChunk(children) {
    var this$1 = this;

    this.children = children;
    var size = 0,
        height = 0;
    for (var i = 0; i < children.length; ++i) {
      var ch = children[i];
      size += ch.chunkSize();height += ch.height;
      ch.parent = this$1;
    }
    this.size = size;
    this.height = height;
    this.parent = null;
  }

  BranchChunk.prototype = {
    chunkSize: function chunkSize() {
      return this.size;
    },

    removeInner: function removeInner(at, n) {
      var this$1 = this;

      this.size -= n;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();
        if (at < sz) {
          var rm = Math.min(n, sz - at),
              oldHeight = child.height;
          child.removeInner(at, rm);
          this$1.height -= oldHeight - child.height;
          if (sz == rm) {
            this$1.children.splice(i--, 1);child.parent = null;
          }
          if ((n -= rm) == 0) {
            break;
          }
          at = 0;
        } else {
          at -= sz;
        }
      }
      // If the result is smaller than 25 lines, ensure that it is a
      // single leaf node.
      if (this.size - n < 25 && (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },

    collapse: function collapse(lines) {
      var this$1 = this;

      for (var i = 0; i < this.children.length; ++i) {
        this$1.children[i].collapse(lines);
      }
    },

    insertInner: function insertInner(at, lines, height) {
      var this$1 = this;

      this.size += lines.length;
      this.height += height;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();
        if (at <= sz) {
          child.insertInner(at, lines, height);
          if (child.lines && child.lines.length > 50) {
            // To avoid memory thrashing when child.lines is huge (e.g. first view of a large file), it's never spliced.
            // Instead, small slices are taken. They're taken in order because sequential memory accesses are fastest.
            var remaining = child.lines.length % 25 + 25;
            for (var pos = remaining; pos < child.lines.length;) {
              var leaf = new LeafChunk(child.lines.slice(pos, pos += 25));
              child.height -= leaf.height;
              this$1.children.splice(++i, 0, leaf);
              leaf.parent = this$1;
            }
            child.lines = child.lines.slice(0, remaining);
            this$1.maybeSpill();
          }
          break;
        }
        at -= sz;
      }
    },

    // When a node has grown, check whether it should be split.
    maybeSpill: function maybeSpill() {
      if (this.children.length <= 10) {
        return;
      }
      var me = this;
      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);
        if (!me.parent) {
          // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }
        sibling.parent = me.parent;
      } while (me.children.length > 10);
      me.parent.maybeSpill();
    },

    iterN: function iterN(at, n, op) {
      var this$1 = this;

      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();
        if (at < sz) {
          var used = Math.min(n, sz - at);
          if (child.iterN(at, used, op)) {
            return true;
          }
          if ((n -= used) == 0) {
            break;
          }
          at = 0;
        } else {
          at -= sz;
        }
      }
    }

    // Line widgets are block elements displayed above or below a line.

  };var LineWidget = function (doc, node, options) {
    var this$1 = this;

    if (options) {
      for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
          this$1[opt] = options[opt];
        }
      }
    }
    this.doc = doc;
    this.node = node;
  };

  LineWidget.prototype.clear = function () {
    var this$1 = this;

    var cm = this.doc.cm,
        ws = this.line.widgets,
        line = this.line,
        no = lineNo(line);
    if (no == null || !ws) {
      return;
    }
    for (var i = 0; i < ws.length; ++i) {
      if (ws[i] == this$1) {
        ws.splice(i--, 1);
      }
    }
    if (!ws.length) {
      line.widgets = null;
    }
    var height = widgetHeight(this);
    updateLineHeight(line, Math.max(0, line.height - height));
    if (cm) {
      runInOp(cm, function () {
        adjustScrollWhenAboveVisible(cm, line, -height);
        regLineChange(cm, no, "widget");
      });
      signalLater(cm, "lineWidgetCleared", cm, this, no);
    }
  };

  LineWidget.prototype.changed = function () {
    var this$1 = this;

    var oldH = this.height,
        cm = this.doc.cm,
        line = this.line;
    this.height = null;
    var diff = widgetHeight(this) - oldH;
    if (!diff) {
      return;
    }
    updateLineHeight(line, line.height + diff);
    if (cm) {
      runInOp(cm, function () {
        cm.curOp.forceUpdate = true;
        adjustScrollWhenAboveVisible(cm, line, diff);
        signalLater(cm, "lineWidgetChanged", cm, this$1, lineNo(line));
      });
    }
  };
  eventMixin(LineWidget);

  function adjustScrollWhenAboveVisible(cm, line, diff) {
    if (heightAtLine(line) < (cm.curOp && cm.curOp.scrollTop || cm.doc.scrollTop)) {
      addToScrollTop(cm, diff);
    }
  }

  function addLineWidget(doc, handle, node, options) {
    var widget = new LineWidget(doc, node, options);
    var cm = doc.cm;
    if (cm && widget.noHScroll) {
      cm.display.alignWidgets = true;
    }
    changeLine(doc, handle, "widget", function (line) {
      var widgets = line.widgets || (line.widgets = []);
      if (widget.insertAt == null) {
        widgets.push(widget);
      } else {
        widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget);
      }
      widget.line = line;
      if (cm && !lineIsHidden(doc, line)) {
        var aboveVisible = heightAtLine(line) < doc.scrollTop;
        updateLineHeight(line, line.height + widgetHeight(widget));
        if (aboveVisible) {
          addToScrollTop(cm, widget.height);
        }
        cm.curOp.forceUpdate = true;
      }
      return true;
    });
    signalLater(cm, "lineWidgetAdded", cm, widget, typeof handle == "number" ? handle : lineNo(handle));
    return widget;
  }

  // TEXTMARKERS

  // Created with markText and setBookmark methods. A TextMarker is a
  // handle that can be used to clear or find a marked position in the
  // document. Line objects hold arrays (markedSpans) containing
  // {from, to, marker} object pointing to such marker objects, and
  // indicating that such a marker is present on that line. Multiple
  // lines may point to the same marker when it spans across lines.
  // The spans will have null for their from/to properties when the
  // marker continues beyond the start/end of the line. Markers have
  // links back to the lines they currently touch.

  // Collapsed markers have unique ids, in order to be able to order
  // them, which is needed for uniquely determining an outer marker
  // when they overlap (they may nest, but not partially overlap).
  var nextMarkerId = 0;

  var TextMarker = function (doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
    this.id = ++nextMarkerId;
  };

  // Clear the marker.
  TextMarker.prototype.clear = function () {
    var this$1 = this;

    if (this.explicitlyCleared) {
      return;
    }
    var cm = this.doc.cm,
        withOp = cm && !cm.curOp;
    if (withOp) {
      startOperation(cm);
    }
    if (hasHandler(this, "clear")) {
      var found = this.find();
      if (found) {
        signalLater(this, "clear", found.from, found.to);
      }
    }
    var min = null,
        max = null;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this$1.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this$1);
      if (cm && !this$1.collapsed) {
        regLineChange(cm, lineNo(line), "text");
      } else if (cm) {
        if (span.to != null) {
          max = lineNo(line);
        }
        if (span.from != null) {
          min = lineNo(line);
        }
      }
      line.markedSpans = removeMarkedSpan(line.markedSpans, span);
      if (span.from == null && this$1.collapsed && !lineIsHidden(this$1.doc, line) && cm) {
        updateLineHeight(line, textHeight(cm.display));
      }
    }
    if (cm && this.collapsed && !cm.options.lineWrapping) {
      for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
        var visual = visualLine(this$1.lines[i$1]),
            len = lineLength(visual);
        if (len > cm.display.maxLineLength) {
          cm.display.maxLine = visual;
          cm.display.maxLineLength = len;
          cm.display.maxLineChanged = true;
        }
      }
    }

    if (min != null && cm && this.collapsed) {
      regChange(cm, min, max + 1);
    }
    this.lines.length = 0;
    this.explicitlyCleared = true;
    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;
      if (cm) {
        reCheckSelection(cm.doc);
      }
    }
    if (cm) {
      signalLater(cm, "markerCleared", cm, this, min, max);
    }
    if (withOp) {
      endOperation(cm);
    }
    if (this.parent) {
      this.parent.clear();
    }
  };

  // Find the position of the marker in the document. Returns a {from,
  // to} object by default. Side can be passed to get a specific side
  // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
  // Pos objects returned contain a line object, rather than a line
  // number (used to prevent looking up the same line twice).
  TextMarker.prototype.find = function (side, lineObj) {
    var this$1 = this;

    if (side == null && this.type == "bookmark") {
      side = 1;
    }
    var from, to;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this$1.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this$1);
      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);
        if (side == -1) {
          return from;
        }
      }
      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);
        if (side == 1) {
          return to;
        }
      }
    }
    return from && { from: from, to: to };
  };

  // Signals that the marker's widget changed, and surrounding layout
  // should be recomputed.
  TextMarker.prototype.changed = function () {
    var this$1 = this;

    var pos = this.find(-1, true),
        widget = this,
        cm = this.doc.cm;
    if (!pos || !cm) {
      return;
    }
    runInOp(cm, function () {
      var line = pos.line,
          lineN = lineNo(pos.line);
      var view = findViewForLine(cm, lineN);
      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }
      cm.curOp.updateMaxLine = true;
      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        var oldHeight = widget.height;
        widget.height = null;
        var dHeight = widgetHeight(widget) - oldHeight;
        if (dHeight) {
          updateLineHeight(line, line.height + dHeight);
        }
      }
      signalLater(cm, "markerChanged", cm, this$1);
    });
  };

  TextMarker.prototype.attachLine = function (line) {
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1) {
        (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this);
      }
    }
    this.lines.push(line);
  };

  TextMarker.prototype.detachLine = function (line) {
    this.lines.splice(indexOf(this.lines, line), 1);
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;(op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  };
  eventMixin(TextMarker);

  // Create a marker, wire it up to the right lines, and
  function markText(doc, from, to, options, type) {
    // Shared markers (across linked documents) are handled separately
    // (markTextShared will call out to this again, once per
    // document).
    if (options && options.shared) {
      return markTextShared(doc, from, to, options, type);
    }
    // Ensure we are in an operation.
    if (doc.cm && !doc.cm.curOp) {
      return operation(doc.cm, markText)(doc, from, to, options, type);
    }

    var marker = new TextMarker(doc, type),
        diff = cmp(from, to);
    if (options) {
      copyObj(options, marker, false);
    }
    // Don't connect empty markers unless clearWhenEmpty is false
    if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false) {
      return marker;
    }
    if (marker.replacedWith) {
      // Showing up as a widget implies collapsed (widget replaces text)
      marker.collapsed = true;
      marker.widgetNode = eltP("span", [marker.replacedWith], "CodeMirror-widget");
      if (!options.handleMouseEvents) {
        marker.widgetNode.setAttribute("cm-ignore-events", "true");
      }
      if (options.insertLeft) {
        marker.widgetNode.insertLeft = true;
      }
    }
    if (marker.collapsed) {
      if (conflictingCollapsedRange(doc, from.line, from, to, marker) || from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker)) {
        throw new Error("Inserting collapsed marker partially overlapping an existing one");
      }
      seeCollapsedSpans();
    }

    if (marker.addToHistory) {
      addChangeToHistory(doc, { from: from, to: to, origin: "markText" }, doc.sel, NaN);
    }

    var curLine = from.line,
        cm = doc.cm,
        updateMaxLine;
    doc.iter(curLine, to.line + 1, function (line) {
      if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine) {
        updateMaxLine = true;
      }
      if (marker.collapsed && curLine != from.line) {
        updateLineHeight(line, 0);
      }
      addMarkedSpan(line, new MarkedSpan(marker, curLine == from.line ? from.ch : null, curLine == to.line ? to.ch : null));
      ++curLine;
    });
    // lineIsHidden depends on the presence of the spans, so needs a second pass
    if (marker.collapsed) {
      doc.iter(from.line, to.line + 1, function (line) {
        if (lineIsHidden(doc, line)) {
          updateLineHeight(line, 0);
        }
      });
    }

    if (marker.clearOnEnter) {
      on(marker, "beforeCursorEnter", function () {
        return marker.clear();
      });
    }

    if (marker.readOnly) {
      seeReadOnlySpans();
      if (doc.history.done.length || doc.history.undone.length) {
        doc.clearHistory();
      }
    }
    if (marker.collapsed) {
      marker.id = ++nextMarkerId;
      marker.atomic = true;
    }
    if (cm) {
      // Sync editor state
      if (updateMaxLine) {
        cm.curOp.updateMaxLine = true;
      }
      if (marker.collapsed) {
        regChange(cm, from.line, to.line + 1);
      } else if (marker.className || marker.title || marker.startStyle || marker.endStyle || marker.css) {
        for (var i = from.line; i <= to.line; i++) {
          regLineChange(cm, i, "text");
        }
      }
      if (marker.atomic) {
        reCheckSelection(cm.doc);
      }
      signalLater(cm, "markerAdded", cm, marker);
    }
    return marker;
  }

  // SHARED TEXTMARKERS

  // A shared marker spans multiple linked documents. It is
  // implemented as a meta-marker-object controlling multiple normal
  // markers.
  var SharedTextMarker = function (markers, primary) {
    var this$1 = this;

    this.markers = markers;
    this.primary = primary;
    for (var i = 0; i < markers.length; ++i) {
      markers[i].parent = this$1;
    }
  };

  SharedTextMarker.prototype.clear = function () {
    var this$1 = this;

    if (this.explicitlyCleared) {
      return;
    }
    this.explicitlyCleared = true;
    for (var i = 0; i < this.markers.length; ++i) {
      this$1.markers[i].clear();
    }
    signalLater(this, "clear");
  };

  SharedTextMarker.prototype.find = function (side, lineObj) {
    return this.primary.find(side, lineObj);
  };
  eventMixin(SharedTextMarker);

  function markTextShared(doc, from, to, options, type) {
    options = copyObj(options);
    options.shared = false;
    var markers = [markText(doc, from, to, options, type)],
        primary = markers[0];
    var widget = options.widgetNode;
    linkedDocs(doc, function (doc) {
      if (widget) {
        options.widgetNode = widget.cloneNode(true);
      }
      markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
      for (var i = 0; i < doc.linked.length; ++i) {
        if (doc.linked[i].isParent) {
          return;
        }
      }
      primary = lst(markers);
    });
    return new SharedTextMarker(markers, primary);
  }

  function findSharedMarkers(doc) {
    return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function (m) {
      return m.parent;
    });
  }

  function copySharedMarkers(doc, markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i],
          pos = marker.find();
      var mFrom = doc.clipPos(pos.from),
          mTo = doc.clipPos(pos.to);
      if (cmp(mFrom, mTo)) {
        var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
        marker.markers.push(subMark);
        subMark.parent = marker;
      }
    }
  }

  function detachSharedMarkers(markers) {
    var loop = function (i) {
      var marker = markers[i],
          linked = [marker.primary.doc];
      linkedDocs(marker.primary.doc, function (d) {
        return linked.push(d);
      });
      for (var j = 0; j < marker.markers.length; j++) {
        var subMarker = marker.markers[j];
        if (indexOf(linked, subMarker.doc) == -1) {
          subMarker.parent = null;
          marker.markers.splice(j--, 1);
        }
      }
    };

    for (var i = 0; i < markers.length; i++) loop(i);
  }

  var nextDocId = 0;
  var Doc = function (text, mode, firstLine, lineSep, direction) {
    if (!(this instanceof Doc)) {
      return new Doc(text, mode, firstLine, lineSep, direction);
    }
    if (firstLine == null) {
      firstLine = 0;
    }

    BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
    this.first = firstLine;
    this.scrollTop = this.scrollLeft = 0;
    this.cantEdit = false;
    this.cleanGeneration = 1;
    this.modeFrontier = this.highlightFrontier = firstLine;
    var start = Pos(firstLine, 0);
    this.sel = simpleSelection(start);
    this.history = new History(null);
    this.id = ++nextDocId;
    this.modeOption = mode;
    this.lineSep = lineSep;
    this.direction = direction == "rtl" ? "rtl" : "ltr";
    this.extend = false;

    if (typeof text == "string") {
      text = this.splitLines(text);
    }
    updateDoc(this, { from: start, to: start, text: text });
    setSelection(this, simpleSelection(start), sel_dontScroll);
  };

  Doc.prototype = createObj(BranchChunk.prototype, {
    constructor: Doc,
    // Iterate over the document. Supports two forms -- with only one
    // argument, it calls that for each line in the document. With
    // three, it iterates over the range given by the first two (with
    // the second being non-inclusive).
    iter: function (from, to, op) {
      if (op) {
        this.iterN(from - this.first, to - from, op);
      } else {
        this.iterN(this.first, this.first + this.size, from);
      }
    },

    // Non-public interface for adding and removing lines.
    insert: function (at, lines) {
      var height = 0;
      for (var i = 0; i < lines.length; ++i) {
        height += lines[i].height;
      }
      this.insertInner(at - this.first, lines, height);
    },
    remove: function (at, n) {
      this.removeInner(at - this.first, n);
    },

    // From here, the methods are part of the public interface. Most
    // are also available from CodeMirror (editor) instances.

    getValue: function (lineSep) {
      var lines = getLines(this, this.first, this.first + this.size);
      if (lineSep === false) {
        return lines;
      }
      return lines.join(lineSep || this.lineSeparator());
    },
    setValue: docMethodOp(function (code) {
      var top = Pos(this.first, 0),
          last = this.first + this.size - 1;
      makeChange(this, { from: top, to: Pos(last, getLine(this, last).text.length),
        text: this.splitLines(code), origin: "setValue", full: true }, true);
      if (this.cm) {
        scrollToCoords(this.cm, 0, 0);
      }
      setSelection(this, simpleSelection(top), sel_dontScroll);
    }),
    replaceRange: function (code, from, to, origin) {
      from = clipPos(this, from);
      to = to ? clipPos(this, to) : from;
      replaceRange(this, code, from, to, origin);
    },
    getRange: function (from, to, lineSep) {
      var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
      if (lineSep === false) {
        return lines;
      }
      return lines.join(lineSep || this.lineSeparator());
    },

    getLine: function (line) {
      var l = this.getLineHandle(line);return l && l.text;
    },

    getLineHandle: function (line) {
      if (isLine(this, line)) {
        return getLine(this, line);
      }
    },
    getLineNumber: function (line) {
      return lineNo(line);
    },

    getLineHandleVisualStart: function (line) {
      if (typeof line == "number") {
        line = getLine(this, line);
      }
      return visualLine(line);
    },

    lineCount: function () {
      return this.size;
    },
    firstLine: function () {
      return this.first;
    },
    lastLine: function () {
      return this.first + this.size - 1;
    },

    clipPos: function (pos) {
      return clipPos(this, pos);
    },

    getCursor: function (start) {
      var range = this.sel.primary(),
          pos;
      if (start == null || start == "head") {
        pos = range.head;
      } else if (start == "anchor") {
        pos = range.anchor;
      } else if (start == "end" || start == "to" || start === false) {
        pos = range.to();
      } else {
        pos = range.from();
      }
      return pos;
    },
    listSelections: function () {
      return this.sel.ranges;
    },
    somethingSelected: function () {
      return this.sel.somethingSelected();
    },

    setCursor: docMethodOp(function (line, ch, options) {
      setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
    }),
    setSelection: docMethodOp(function (anchor, head, options) {
      setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options);
    }),
    extendSelection: docMethodOp(function (head, other, options) {
      extendSelection(this, clipPos(this, head), other && clipPos(this, other), options);
    }),
    extendSelections: docMethodOp(function (heads, options) {
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    extendSelectionsBy: docMethodOp(function (f, options) {
      var heads = map(this.sel.ranges, f);
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    setSelections: docMethodOp(function (ranges, primary, options) {
      var this$1 = this;

      if (!ranges.length) {
        return;
      }
      var out = [];
      for (var i = 0; i < ranges.length; i++) {
        out[i] = new Range(clipPos(this$1, ranges[i].anchor), clipPos(this$1, ranges[i].head));
      }
      if (primary == null) {
        primary = Math.min(ranges.length - 1, this.sel.primIndex);
      }
      setSelection(this, normalizeSelection(out, primary), options);
    }),
    addSelection: docMethodOp(function (anchor, head, options) {
      var ranges = this.sel.ranges.slice(0);
      ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
      setSelection(this, normalizeSelection(ranges, ranges.length - 1), options);
    }),

    getSelection: function (lineSep) {
      var this$1 = this;

      var ranges = this.sel.ranges,
          lines;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
        lines = lines ? lines.concat(sel) : sel;
      }
      if (lineSep === false) {
        return lines;
      } else {
        return lines.join(lineSep || this.lineSeparator());
      }
    },
    getSelections: function (lineSep) {
      var this$1 = this;

      var parts = [],
          ranges = this.sel.ranges;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
        if (lineSep !== false) {
          sel = sel.join(lineSep || this$1.lineSeparator());
        }
        parts[i] = sel;
      }
      return parts;
    },
    replaceSelection: function (code, collapse, origin) {
      var dup = [];
      for (var i = 0; i < this.sel.ranges.length; i++) {
        dup[i] = code;
      }
      this.replaceSelections(dup, collapse, origin || "+input");
    },
    replaceSelections: docMethodOp(function (code, collapse, origin) {
      var this$1 = this;

      var changes = [],
          sel = this.sel;
      for (var i = 0; i < sel.ranges.length; i++) {
        var range = sel.ranges[i];
        changes[i] = { from: range.from(), to: range.to(), text: this$1.splitLines(code[i]), origin: origin };
      }
      var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
      for (var i$1 = changes.length - 1; i$1 >= 0; i$1--) {
        makeChange(this$1, changes[i$1]);
      }
      if (newSel) {
        setSelectionReplaceHistory(this, newSel);
      } else if (this.cm) {
        ensureCursorVisible(this.cm);
      }
    }),
    undo: docMethodOp(function () {
      makeChangeFromHistory(this, "undo");
    }),
    redo: docMethodOp(function () {
      makeChangeFromHistory(this, "redo");
    }),
    undoSelection: docMethodOp(function () {
      makeChangeFromHistory(this, "undo", true);
    }),
    redoSelection: docMethodOp(function () {
      makeChangeFromHistory(this, "redo", true);
    }),

    setExtending: function (val) {
      this.extend = val;
    },
    getExtending: function () {
      return this.extend;
    },

    historySize: function () {
      var hist = this.history,
          done = 0,
          undone = 0;
      for (var i = 0; i < hist.done.length; i++) {
        if (!hist.done[i].ranges) {
          ++done;
        }
      }
      for (var i$1 = 0; i$1 < hist.undone.length; i$1++) {
        if (!hist.undone[i$1].ranges) {
          ++undone;
        }
      }
      return { undo: done, redo: undone };
    },
    clearHistory: function () {
      this.history = new History(this.history.maxGeneration);
    },

    markClean: function () {
      this.cleanGeneration = this.changeGeneration(true);
    },
    changeGeneration: function (forceSplit) {
      if (forceSplit) {
        this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null;
      }
      return this.history.generation;
    },
    isClean: function (gen) {
      return this.history.generation == (gen || this.cleanGeneration);
    },

    getHistory: function () {
      return { done: copyHistoryArray(this.history.done),
        undone: copyHistoryArray(this.history.undone) };
    },
    setHistory: function (histData) {
      var hist = this.history = new History(this.history.maxGeneration);
      hist.done = copyHistoryArray(histData.done.slice(0), null, true);
      hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
    },

    setGutterMarker: docMethodOp(function (line, gutterID, value) {
      return changeLine(this, line, "gutter", function (line) {
        var markers = line.gutterMarkers || (line.gutterMarkers = {});
        markers[gutterID] = value;
        if (!value && isEmpty(markers)) {
          line.gutterMarkers = null;
        }
        return true;
      });
    }),

    clearGutter: docMethodOp(function (gutterID) {
      var this$1 = this;

      this.iter(function (line) {
        if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
          changeLine(this$1, line, "gutter", function () {
            line.gutterMarkers[gutterID] = null;
            if (isEmpty(line.gutterMarkers)) {
              line.gutterMarkers = null;
            }
            return true;
          });
        }
      });
    }),

    lineInfo: function (line) {
      var n;
      if (typeof line == "number") {
        if (!isLine(this, line)) {
          return null;
        }
        n = line;
        line = getLine(this, line);
        if (!line) {
          return null;
        }
      } else {
        n = lineNo(line);
        if (n == null) {
          return null;
        }
      }
      return { line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
        textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
        widgets: line.widgets };
    },

    addLineClass: docMethodOp(function (handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
        var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";
        if (!line[prop]) {
          line[prop] = cls;
        } else if (classTest(cls).test(line[prop])) {
          return false;
        } else {
          line[prop] += " " + cls;
        }
        return true;
      });
    }),
    removeLineClass: docMethodOp(function (handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
        var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";
        var cur = line[prop];
        if (!cur) {
          return false;
        } else if (cls == null) {
          line[prop] = null;
        } else {
          var found = cur.match(classTest(cls));
          if (!found) {
            return false;
          }
          var end = found.index + found[0].length;
          line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
        }
        return true;
      });
    }),

    addLineWidget: docMethodOp(function (handle, node, options) {
      return addLineWidget(this, handle, node, options);
    }),
    removeLineWidget: function (widget) {
      widget.clear();
    },

    markText: function (from, to, options) {
      return markText(this, clipPos(this, from), clipPos(this, to), options, options && options.type || "range");
    },
    setBookmark: function (pos, options) {
      var realOpts = { replacedWith: options && (options.nodeType == null ? options.widget : options),
        insertLeft: options && options.insertLeft,
        clearWhenEmpty: false, shared: options && options.shared,
        handleMouseEvents: options && options.handleMouseEvents };
      pos = clipPos(this, pos);
      return markText(this, pos, pos, realOpts, "bookmark");
    },
    findMarksAt: function (pos) {
      pos = clipPos(this, pos);
      var markers = [],
          spans = getLine(this, pos.line).markedSpans;
      if (spans) {
        for (var i = 0; i < spans.length; ++i) {
          var span = spans[i];
          if ((span.from == null || span.from <= pos.ch) && (span.to == null || span.to >= pos.ch)) {
            markers.push(span.marker.parent || span.marker);
          }
        }
      }
      return markers;
    },
    findMarks: function (from, to, filter) {
      from = clipPos(this, from);to = clipPos(this, to);
      var found = [],
          lineNo = from.line;
      this.iter(from.line, to.line + 1, function (line) {
        var spans = line.markedSpans;
        if (spans) {
          for (var i = 0; i < spans.length; i++) {
            var span = spans[i];
            if (!(span.to != null && lineNo == from.line && from.ch >= span.to || span.from == null && lineNo != from.line || span.from != null && lineNo == to.line && span.from >= to.ch) && (!filter || filter(span.marker))) {
              found.push(span.marker.parent || span.marker);
            }
          }
        }
        ++lineNo;
      });
      return found;
    },
    getAllMarks: function () {
      var markers = [];
      this.iter(function (line) {
        var sps = line.markedSpans;
        if (sps) {
          for (var i = 0; i < sps.length; ++i) {
            if (sps[i].from != null) {
              markers.push(sps[i].marker);
            }
          }
        }
      });
      return markers;
    },

    posFromIndex: function (off) {
      var ch,
          lineNo = this.first,
          sepSize = this.lineSeparator().length;
      this.iter(function (line) {
        var sz = line.text.length + sepSize;
        if (sz > off) {
          ch = off;return true;
        }
        off -= sz;
        ++lineNo;
      });
      return clipPos(this, Pos(lineNo, ch));
    },
    indexFromPos: function (coords) {
      coords = clipPos(this, coords);
      var index = coords.ch;
      if (coords.line < this.first || coords.ch < 0) {
        return 0;
      }
      var sepSize = this.lineSeparator().length;
      this.iter(this.first, coords.line, function (line) {
        // iter aborts when callback returns a truthy value
        index += line.text.length + sepSize;
      });
      return index;
    },

    copy: function (copyHistory) {
      var doc = new Doc(getLines(this, this.first, this.first + this.size), this.modeOption, this.first, this.lineSep, this.direction);
      doc.scrollTop = this.scrollTop;doc.scrollLeft = this.scrollLeft;
      doc.sel = this.sel;
      doc.extend = false;
      if (copyHistory) {
        doc.history.undoDepth = this.history.undoDepth;
        doc.setHistory(this.getHistory());
      }
      return doc;
    },

    linkedDoc: function (options) {
      if (!options) {
        options = {};
      }
      var from = this.first,
          to = this.first + this.size;
      if (options.from != null && options.from > from) {
        from = options.from;
      }
      if (options.to != null && options.to < to) {
        to = options.to;
      }
      var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep, this.direction);
      if (options.sharedHist) {
        copy.history = this.history;
      }(this.linked || (this.linked = [])).push({ doc: copy, sharedHist: options.sharedHist });
      copy.linked = [{ doc: this, isParent: true, sharedHist: options.sharedHist }];
      copySharedMarkers(copy, findSharedMarkers(this));
      return copy;
    },
    unlinkDoc: function (other) {
      var this$1 = this;

      if (other instanceof CodeMirror) {
        other = other.doc;
      }
      if (this.linked) {
        for (var i = 0; i < this.linked.length; ++i) {
          var link = this$1.linked[i];
          if (link.doc != other) {
            continue;
          }
          this$1.linked.splice(i, 1);
          other.unlinkDoc(this$1);
          detachSharedMarkers(findSharedMarkers(this$1));
          break;
        }
      }
      // If the histories were shared, split them again
      if (other.history == this.history) {
        var splitIds = [other.id];
        linkedDocs(other, function (doc) {
          return splitIds.push(doc.id);
        }, true);
        other.history = new History(null);
        other.history.done = copyHistoryArray(this.history.done, splitIds);
        other.history.undone = copyHistoryArray(this.history.undone, splitIds);
      }
    },
    iterLinkedDocs: function (f) {
      linkedDocs(this, f);
    },

    getMode: function () {
      return this.mode;
    },
    getEditor: function () {
      return this.cm;
    },

    splitLines: function (str) {
      if (this.lineSep) {
        return str.split(this.lineSep);
      }
      return splitLinesAuto(str);
    },
    lineSeparator: function () {
      return this.lineSep || "\n";
    },

    setDirection: docMethodOp(function (dir) {
      if (dir != "rtl") {
        dir = "ltr";
      }
      if (dir == this.direction) {
        return;
      }
      this.direction = dir;
      this.iter(function (line) {
        return line.order = null;
      });
      if (this.cm) {
        directionChanged(this.cm);
      }
    })
  });

  // Public alias.
  Doc.prototype.eachLine = Doc.prototype.iter;

  // Kludge to work around strange IE behavior where it'll sometimes
  // re-fire a series of drag-related events right after the drop (#1551)
  var lastDrop = 0;

  function onDrop(e) {
    var cm = this;
    clearDragCursor(cm);
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) {
      return;
    }
    e_preventDefault(e);
    if (ie) {
      lastDrop = +new Date();
    }
    var pos = posFromMouse(cm, e, true),
        files = e.dataTransfer.files;
    if (!pos || cm.isReadOnly()) {
      return;
    }
    // Might be a file drop, in which case we simply extract the text
    // and insert it.
    if (files && files.length && window.FileReader && window.File) {
      var n = files.length,
          text = Array(n),
          read = 0;
      var loadFile = function (file, i) {
        if (cm.options.allowDropFileTypes && indexOf(cm.options.allowDropFileTypes, file.type) == -1) {
          return;
        }

        var reader = new FileReader();
        reader.onload = operation(cm, function () {
          var content = reader.result;
          if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) {
            content = "";
          }
          text[i] = content;
          if (++read == n) {
            pos = clipPos(cm.doc, pos);
            var change = { from: pos, to: pos,
              text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
              origin: "paste" };
            makeChange(cm.doc, change);
            setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
          }
        });
        reader.readAsText(file);
      };
      for (var i = 0; i < n; ++i) {
        loadFile(files[i], i);
      }
    } else {
      // Normal drop
      // Don't do a replace if the drop happened inside of the selected text.
      if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
        cm.state.draggingText(e);
        // Ensure the editor is re-focused
        setTimeout(function () {
          return cm.display.input.focus();
        }, 20);
        return;
      }
      try {
        var text$1 = e.dataTransfer.getData("Text");
        if (text$1) {
          var selected;
          if (cm.state.draggingText && !cm.state.draggingText.copy) {
            selected = cm.listSelections();
          }
          setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
          if (selected) {
            for (var i$1 = 0; i$1 < selected.length; ++i$1) {
              replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag");
            }
          }
          cm.replaceSelection(text$1, "around", "paste");
          cm.display.input.focus();
        }
      } catch (e) {}
    }
  }

  function onDragStart(cm, e) {
    if (ie && (!cm.state.draggingText || +new Date() - lastDrop < 100)) {
      e_stop(e);return;
    }
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) {
      return;
    }

    e.dataTransfer.setData("Text", cm.getSelection());
    e.dataTransfer.effectAllowed = "copyMove";

    // Use dummy image instead of default browsers image.
    // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
    if (e.dataTransfer.setDragImage && !safari) {
      var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      if (presto) {
        img.width = img.height = 1;
        cm.display.wrapper.appendChild(img);
        // Force a relayout, or Opera won't use our image for some obscure reason
        img._top = img.offsetTop;
      }
      e.dataTransfer.setDragImage(img, 0, 0);
      if (presto) {
        img.parentNode.removeChild(img);
      }
    }
  }

  function onDragOver(cm, e) {
    var pos = posFromMouse(cm, e);
    if (!pos) {
      return;
    }
    var frag = document.createDocumentFragment();
    drawSelectionCursor(cm, pos, frag);
    if (!cm.display.dragCursor) {
      cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
      cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
    }
    removeChildrenAndAdd(cm.display.dragCursor, frag);
  }

  function clearDragCursor(cm) {
    if (cm.display.dragCursor) {
      cm.display.lineSpace.removeChild(cm.display.dragCursor);
      cm.display.dragCursor = null;
    }
  }

  // These must be handled carefully, because naively registering a
  // handler for each editor will cause the editors to never be
  // garbage collected.

  function forEachCodeMirror(f) {
    if (!document.getElementsByClassName) {
      return;
    }
    var byClass = document.getElementsByClassName("CodeMirror");
    for (var i = 0; i < byClass.length; i++) {
      var cm = byClass[i].CodeMirror;
      if (cm) {
        f(cm);
      }
    }
  }

  var globalsRegistered = false;
  function ensureGlobalHandlers() {
    if (globalsRegistered) {
      return;
    }
    registerGlobalHandlers();
    globalsRegistered = true;
  }
  function registerGlobalHandlers() {
    // When the window resizes, we need to refresh active editors.
    var resizeTimer;
    on(window, "resize", function () {
      if (resizeTimer == null) {
        resizeTimer = setTimeout(function () {
          resizeTimer = null;
          forEachCodeMirror(onResize);
        }, 100);
      }
    });
    // When the window loses focus, we want to show the editor as blurred
    on(window, "blur", function () {
      return forEachCodeMirror(onBlur);
    });
  }
  // Called when the window resizes
  function onResize(cm) {
    var d = cm.display;
    if (d.lastWrapHeight == d.wrapper.clientHeight && d.lastWrapWidth == d.wrapper.clientWidth) {
      return;
    }
    // Might be a text scaling operation, clear size caches.
    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
    d.scrollbarsClipped = false;
    cm.setSize();
  }

  var keyNames = {
    3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
    19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
    36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
    46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod",
    106: "*", 107: "=", 109: "-", 110: ".", 111: "/", 127: "Delete",
    173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
    221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
    63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"

    // Number keys
  };for (var i = 0; i < 10; i++) {
    keyNames[i + 48] = keyNames[i + 96] = String(i);
  }
  // Alphabetic keys
  for (var i$1 = 65; i$1 <= 90; i$1++) {
    keyNames[i$1] = String.fromCharCode(i$1);
  }
  // Function keys
  for (var i$2 = 1; i$2 <= 12; i$2++) {
    keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2;
  }

  var keyMap = {};

  keyMap.basic = {
    "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
    "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
    "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
    "Tab": "defaultTab", "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
    "Esc": "singleSelection"
    // Note that the save and find-related commands aren't defined by
    // default. User code or addons can define them. Unknown commands
    // are simply ignored.
  };keyMap.pcDefault = {
    "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Up": "goLineUp", "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
    "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
    fallthrough: "basic"
    // Very basic readline/emacs-style bindings, which are standard on Mac.
  };keyMap.emacsy = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars",
    "Ctrl-O": "openLine"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart", "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight", "Cmd-Left": "goLineLeft", "Cmd-Right": "goLineRight", "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
    "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delWrappedLineLeft", "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection", "Ctrl-Up": "goDocStart", "Ctrl-Down": "goDocEnd",
    fallthrough: ["basic", "emacsy"]
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

  // KEYMAP DISPATCH

  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/);
    name = parts[parts.length - 1];
    var alt, ctrl, shift, cmd;
    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) {
        cmd = true;
      } else if (/^a(lt)?$/i.test(mod)) {
        alt = true;
      } else if (/^(c|ctrl|control)$/i.test(mod)) {
        ctrl = true;
      } else if (/^s(hift)?$/i.test(mod)) {
        shift = true;
      } else {
        throw new Error("Unrecognized modifier name: " + mod);
      }
    }
    if (alt) {
      name = "Alt-" + name;
    }
    if (ctrl) {
      name = "Ctrl-" + name;
    }
    if (cmd) {
      name = "Cmd-" + name;
    }
    if (shift) {
      name = "Shift-" + name;
    }
    return name;
  }

  // This is a kludge to keep keymaps mostly working as raw objects
  // (backwards compatibility) while at the same time support features
  // like normalization and multi-stroke key bindings. It compiles a
  // new normalized keymap, and then updates the old object to reflect
  // this.
  function normalizeKeyMap(keymap) {
    var copy = {};
    for (var keyname in keymap) {
      if (keymap.hasOwnProperty(keyname)) {
        var value = keymap[keyname];
        if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) {
          continue;
        }
        if (value == "...") {
          delete keymap[keyname];continue;
        }

        var keys = map(keyname.split(" "), normalizeKeyName);
        for (var i = 0; i < keys.length; i++) {
          var val = void 0,
              name = void 0;
          if (i == keys.length - 1) {
            name = keys.join(" ");
            val = value;
          } else {
            name = keys.slice(0, i + 1).join(" ");
            val = "...";
          }
          var prev = copy[name];
          if (!prev) {
            copy[name] = val;
          } else if (prev != val) {
            throw new Error("Inconsistent bindings for " + name);
          }
        }
        delete keymap[keyname];
      }
    }
    for (var prop in copy) {
      keymap[prop] = copy[prop];
    }
    return keymap;
  }

  function lookupKey(key, map, handle, context) {
    map = getKeyMap(map);
    var found = map.call ? map.call(key, context) : map[key];
    if (found === false) {
      return "nothing";
    }
    if (found === "...") {
      return "multi";
    }
    if (found != null && handle(found)) {
      return "handled";
    }

    if (map.fallthrough) {
      if (Object.prototype.toString.call(map.fallthrough) != "[object Array]") {
        return lookupKey(key, map.fallthrough, handle, context);
      }
      for (var i = 0; i < map.fallthrough.length; i++) {
        var result = lookupKey(key, map.fallthrough[i], handle, context);
        if (result) {
          return result;
        }
      }
    }
  }

  // Modifier key presses don't count as 'real' key presses for the
  // purpose of keymap fallthrough.
  function isModifierKey(value) {
    var name = typeof value == "string" ? value : keyNames[value.keyCode];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
  }

  function addModifierNames(name, event, noShift) {
    var base = name;
    if (event.altKey && base != "Alt") {
      name = "Alt-" + name;
    }
    if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") {
      name = "Ctrl-" + name;
    }
    if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") {
      name = "Cmd-" + name;
    }
    if (!noShift && event.shiftKey && base != "Shift") {
      name = "Shift-" + name;
    }
    return name;
  }

  // Look up the name of a key as indicated by an event object.
  function keyName(event, noShift) {
    if (presto && event.keyCode == 34 && event["char"]) {
      return false;
    }
    var name = keyNames[event.keyCode];
    if (name == null || event.altGraphKey) {
      return false;
    }
    return addModifierNames(name, event, noShift);
  }

  function getKeyMap(val) {
    return typeof val == "string" ? keyMap[val] : val;
  }

  // Helper for deleting text near the selection(s), used to implement
  // backspace, delete, and similar functionality.
  function deleteNearSelection(cm, compute) {
    var ranges = cm.doc.sel.ranges,
        kill = [];
    // Build up a set of ranges to kill first, merging overlapping
    // ranges.
    for (var i = 0; i < ranges.length; i++) {
      var toKill = compute(ranges[i]);
      while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
        var replaced = kill.pop();
        if (cmp(replaced.from, toKill.from) < 0) {
          toKill.from = replaced.from;
          break;
        }
      }
      kill.push(toKill);
    }
    // Next, remove those actual ranges.
    runInOp(cm, function () {
      for (var i = kill.length - 1; i >= 0; i--) {
        replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
      }
      ensureCursorVisible(cm);
    });
  }

  function moveCharLogically(line, ch, dir) {
    var target = skipExtendingChars(line.text, ch + dir, dir);
    return target < 0 || target > line.text.length ? null : target;
  }

  function moveLogically(line, start, dir) {
    var ch = moveCharLogically(line, start.ch, dir);
    return ch == null ? null : new Pos(start.line, ch, dir < 0 ? "after" : "before");
  }

  function endOfLine(visually, cm, lineObj, lineNo, dir) {
    if (visually) {
      var order = getOrder(lineObj, cm.doc.direction);
      if (order) {
        var part = dir < 0 ? lst(order) : order[0];
        var moveInStorageOrder = dir < 0 == (part.level == 1);
        var sticky = moveInStorageOrder ? "after" : "before";
        var ch;
        // With a wrapped rtl chunk (possibly spanning multiple bidi parts),
        // it could be that the last bidi part is not on the last visual line,
        // since visual lines contain content order-consecutive chunks.
        // Thus, in rtl, we are looking for the first (content-order) character
        // in the rtl chunk that is on the last line (that is, the same line
        // as the last (content-order) character).
        if (part.level > 0 || cm.doc.direction == "rtl") {
          var prep = prepareMeasureForLine(cm, lineObj);
          ch = dir < 0 ? lineObj.text.length - 1 : 0;
          var targetTop = measureCharPrepared(cm, prep, ch).top;
          ch = findFirst(function (ch) {
            return measureCharPrepared(cm, prep, ch).top == targetTop;
          }, dir < 0 == (part.level == 1) ? part.from : part.to - 1, ch);
          if (sticky == "before") {
            ch = moveCharLogically(lineObj, ch, 1);
          }
        } else {
          ch = dir < 0 ? part.to : part.from;
        }
        return new Pos(lineNo, ch, sticky);
      }
    }
    return new Pos(lineNo, dir < 0 ? lineObj.text.length : 0, dir < 0 ? "before" : "after");
  }

  function moveVisually(cm, line, start, dir) {
    var bidi = getOrder(line, cm.doc.direction);
    if (!bidi) {
      return moveLogically(line, start, dir);
    }
    if (start.ch >= line.text.length) {
      start.ch = line.text.length;
      start.sticky = "before";
    } else if (start.ch <= 0) {
      start.ch = 0;
      start.sticky = "after";
    }
    var partPos = getBidiPartAt(bidi, start.ch, start.sticky),
        part = bidi[partPos];
    if (cm.doc.direction == "ltr" && part.level % 2 == 0 && (dir > 0 ? part.to > start.ch : part.from < start.ch)) {
      // Case 1: We move within an ltr part in an ltr editor. Even with wrapped lines,
      // nothing interesting happens.
      return moveLogically(line, start, dir);
    }

    var mv = function (pos, dir) {
      return moveCharLogically(line, pos instanceof Pos ? pos.ch : pos, dir);
    };
    var prep;
    var getWrappedLineExtent = function (ch) {
      if (!cm.options.lineWrapping) {
        return { begin: 0, end: line.text.length };
      }
      prep = prep || prepareMeasureForLine(cm, line);
      return wrappedLineExtentChar(cm, line, prep, ch);
    };
    var wrappedLineExtent = getWrappedLineExtent(start.sticky == "before" ? mv(start, -1) : start.ch);

    if (cm.doc.direction == "rtl" || part.level == 1) {
      var moveInStorageOrder = part.level == 1 == dir < 0;
      var ch = mv(start, moveInStorageOrder ? 1 : -1);
      if (ch != null && (!moveInStorageOrder ? ch >= part.from && ch >= wrappedLineExtent.begin : ch <= part.to && ch <= wrappedLineExtent.end)) {
        // Case 2: We move within an rtl part or in an rtl editor on the same visual line
        var sticky = moveInStorageOrder ? "before" : "after";
        return new Pos(start.line, ch, sticky);
      }
    }

    // Case 3: Could not move within this bidi part in this visual line, so leave
    // the current bidi part

    var searchInVisualLine = function (partPos, dir, wrappedLineExtent) {
      var getRes = function (ch, moveInStorageOrder) {
        return moveInStorageOrder ? new Pos(start.line, mv(ch, 1), "before") : new Pos(start.line, ch, "after");
      };

      for (; partPos >= 0 && partPos < bidi.length; partPos += dir) {
        var part = bidi[partPos];
        var moveInStorageOrder = dir > 0 == (part.level != 1);
        var ch = moveInStorageOrder ? wrappedLineExtent.begin : mv(wrappedLineExtent.end, -1);
        if (part.from <= ch && ch < part.to) {
          return getRes(ch, moveInStorageOrder);
        }
        ch = moveInStorageOrder ? part.from : mv(part.to, -1);
        if (wrappedLineExtent.begin <= ch && ch < wrappedLineExtent.end) {
          return getRes(ch, moveInStorageOrder);
        }
      }
    };

    // Case 3a: Look for other bidi parts on the same visual line
    var res = searchInVisualLine(partPos + dir, dir, wrappedLineExtent);
    if (res) {
      return res;
    }

    // Case 3b: Look for other bidi parts on the next visual line
    var nextCh = dir > 0 ? wrappedLineExtent.end : mv(wrappedLineExtent.begin, -1);
    if (nextCh != null && !(dir > 0 && nextCh == line.text.length)) {
      res = searchInVisualLine(dir > 0 ? 0 : bidi.length - 1, dir, getWrappedLineExtent(nextCh));
      if (res) {
        return res;
      }
    }

    // Case 4: Nowhere to move
    return null;
  }

  // Commands are parameter-less actions that can be performed on an
  // editor, mostly used for keybindings.
  var commands = {
    selectAll: selectAll,
    singleSelection: function (cm) {
      return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll);
    },
    killLine: function (cm) {
      return deleteNearSelection(cm, function (range) {
        if (range.empty()) {
          var len = getLine(cm.doc, range.head.line).text.length;
          if (range.head.ch == len && range.head.line < cm.lastLine()) {
            return { from: range.head, to: Pos(range.head.line + 1, 0) };
          } else {
            return { from: range.head, to: Pos(range.head.line, len) };
          }
        } else {
          return { from: range.from(), to: range.to() };
        }
      });
    },
    deleteLine: function (cm) {
      return deleteNearSelection(cm, function (range) {
        return {
          from: Pos(range.from().line, 0),
          to: clipPos(cm.doc, Pos(range.to().line + 1, 0))
        };
      });
    },
    delLineLeft: function (cm) {
      return deleteNearSelection(cm, function (range) {
        return {
          from: Pos(range.from().line, 0), to: range.from()
        };
      });
    },
    delWrappedLineLeft: function (cm) {
      return deleteNearSelection(cm, function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var leftPos = cm.coordsChar({ left: 0, top: top }, "div");
        return { from: leftPos, to: range.from() };
      });
    },
    delWrappedLineRight: function (cm) {
      return deleteNearSelection(cm, function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var rightPos = cm.coordsChar({ left: cm.display.lineDiv.offsetWidth + 100, top: top }, "div");
        return { from: range.from(), to: rightPos };
      });
    },
    undo: function (cm) {
      return cm.undo();
    },
    redo: function (cm) {
      return cm.redo();
    },
    undoSelection: function (cm) {
      return cm.undoSelection();
    },
    redoSelection: function (cm) {
      return cm.redoSelection();
    },
    goDocStart: function (cm) {
      return cm.extendSelection(Pos(cm.firstLine(), 0));
    },
    goDocEnd: function (cm) {
      return cm.extendSelection(Pos(cm.lastLine()));
    },
    goLineStart: function (cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineStart(cm, range.head.line);
      }, { origin: "+move", bias: 1 });
    },
    goLineStartSmart: function (cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineStartSmart(cm, range.head);
      }, { origin: "+move", bias: 1 });
    },
    goLineEnd: function (cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineEnd(cm, range.head.line);
      }, { origin: "+move", bias: -1 });
    },
    goLineRight: function (cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        return cm.coordsChar({ left: cm.display.lineDiv.offsetWidth + 100, top: top }, "div");
      }, sel_move);
    },
    goLineLeft: function (cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        return cm.coordsChar({ left: 0, top: top }, "div");
      }, sel_move);
    },
    goLineLeftSmart: function (cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        var pos = cm.coordsChar({ left: 0, top: top }, "div");
        if (pos.ch < cm.getLine(pos.line).search(/\S/)) {
          return lineStartSmart(cm, range.head);
        }
        return pos;
      }, sel_move);
    },
    goLineUp: function (cm) {
      return cm.moveV(-1, "line");
    },
    goLineDown: function (cm) {
      return cm.moveV(1, "line");
    },
    goPageUp: function (cm) {
      return cm.moveV(-1, "page");
    },
    goPageDown: function (cm) {
      return cm.moveV(1, "page");
    },
    goCharLeft: function (cm) {
      return cm.moveH(-1, "char");
    },
    goCharRight: function (cm) {
      return cm.moveH(1, "char");
    },
    goColumnLeft: function (cm) {
      return cm.moveH(-1, "column");
    },
    goColumnRight: function (cm) {
      return cm.moveH(1, "column");
    },
    goWordLeft: function (cm) {
      return cm.moveH(-1, "word");
    },
    goGroupRight: function (cm) {
      return cm.moveH(1, "group");
    },
    goGroupLeft: function (cm) {
      return cm.moveH(-1, "group");
    },
    goWordRight: function (cm) {
      return cm.moveH(1, "word");
    },
    delCharBefore: function (cm) {
      return cm.deleteH(-1, "char");
    },
    delCharAfter: function (cm) {
      return cm.deleteH(1, "char");
    },
    delWordBefore: function (cm) {
      return cm.deleteH(-1, "word");
    },
    delWordAfter: function (cm) {
      return cm.deleteH(1, "word");
    },
    delGroupBefore: function (cm) {
      return cm.deleteH(-1, "group");
    },
    delGroupAfter: function (cm) {
      return cm.deleteH(1, "group");
    },
    indentAuto: function (cm) {
      return cm.indentSelection("smart");
    },
    indentMore: function (cm) {
      return cm.indentSelection("add");
    },
    indentLess: function (cm) {
      return cm.indentSelection("subtract");
    },
    insertTab: function (cm) {
      return cm.replaceSelection("\t");
    },
    insertSoftTab: function (cm) {
      var spaces = [],
          ranges = cm.listSelections(),
          tabSize = cm.options.tabSize;
      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].from();
        var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
        spaces.push(spaceStr(tabSize - col % tabSize));
      }
      cm.replaceSelections(spaces);
    },
    defaultTab: function (cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection("add");
      } else {
        cm.execCommand("insertTab");
      }
    },
    // Swap the two chars left and right of each selection's head.
    // Move cursor behind the two swapped characters afterwards.
    //
    // Doesn't consider line feeds a character.
    // Doesn't scan more than one line above to find a character.
    // Doesn't do anything on an empty line.
    // Doesn't do anything with non-empty selections.
    transposeChars: function (cm) {
      return runInOp(cm, function () {
        var ranges = cm.listSelections(),
            newSel = [];
        for (var i = 0; i < ranges.length; i++) {
          if (!ranges[i].empty()) {
            continue;
          }
          var cur = ranges[i].head,
              line = getLine(cm.doc, cur.line).text;
          if (line) {
            if (cur.ch == line.length) {
              cur = new Pos(cur.line, cur.ch - 1);
            }
            if (cur.ch > 0) {
              cur = new Pos(cur.line, cur.ch + 1);
              cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2), Pos(cur.line, cur.ch - 2), cur, "+transpose");
            } else if (cur.line > cm.doc.first) {
              var prev = getLine(cm.doc, cur.line - 1).text;
              if (prev) {
                cur = new Pos(cur.line, 1);
                cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() + prev.charAt(prev.length - 1), Pos(cur.line - 1, prev.length - 1), cur, "+transpose");
              }
            }
          }
          newSel.push(new Range(cur, cur));
        }
        cm.setSelections(newSel);
      });
    },
    newlineAndIndent: function (cm) {
      return runInOp(cm, function () {
        var sels = cm.listSelections();
        for (var i = sels.length - 1; i >= 0; i--) {
          cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input");
        }
        sels = cm.listSelections();
        for (var i$1 = 0; i$1 < sels.length; i$1++) {
          cm.indentLine(sels[i$1].from().line, null, true);
        }
        ensureCursorVisible(cm);
      });
    },
    openLine: function (cm) {
      return cm.replaceSelection("\n", "start");
    },
    toggleOverwrite: function (cm) {
      return cm.toggleOverwrite();
    }
  };

  function lineStart(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLine(line);
    if (visual != line) {
      lineN = lineNo(visual);
    }
    return endOfLine(true, cm, visual, lineN, 1);
  }
  function lineEnd(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLineEnd(line);
    if (visual != line) {
      lineN = lineNo(visual);
    }
    return endOfLine(true, cm, line, lineN, -1);
  }
  function lineStartSmart(cm, pos) {
    var start = lineStart(cm, pos.line);
    var line = getLine(cm.doc, start.line);
    var order = getOrder(line, cm.doc.direction);
    if (!order || order[0].level == 0) {
      var firstNonWS = Math.max(0, line.text.search(/\S/));
      var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
      return Pos(start.line, inWS ? 0 : firstNonWS, start.sticky);
    }
    return start;
  }

  // Run a handler that was bound to a key.
  function doHandleBinding(cm, bound, dropShift) {
    if (typeof bound == "string") {
      bound = commands[bound];
      if (!bound) {
        return false;
      }
    }
    // Ensure previous input has been read, so that the handler sees a
    // consistent view of the document
    cm.display.input.ensurePolled();
    var prevShift = cm.display.shift,
        done = false;
    try {
      if (cm.isReadOnly()) {
        cm.state.suppressEdits = true;
      }
      if (dropShift) {
        cm.display.shift = false;
      }
      done = bound(cm) != Pass;
    } finally {
      cm.display.shift = prevShift;
      cm.state.suppressEdits = false;
    }
    return done;
  }

  function lookupKeyForEditor(cm, name, handle) {
    for (var i = 0; i < cm.state.keyMaps.length; i++) {
      var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
      if (result) {
        return result;
      }
    }
    return cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm) || lookupKey(name, cm.options.keyMap, handle, cm);
  }

  // Note that, despite the name, this function is also used to check
  // for bound mouse clicks.

  var stopSeq = new Delayed();
  function dispatchKey(cm, name, e, handle) {
    var seq = cm.state.keySeq;
    if (seq) {
      if (isModifierKey(name)) {
        return "handled";
      }
      stopSeq.set(50, function () {
        if (cm.state.keySeq == seq) {
          cm.state.keySeq = null;
          cm.display.input.reset();
        }
      });
      name = seq + " " + name;
    }
    var result = lookupKeyForEditor(cm, name, handle);

    if (result == "multi") {
      cm.state.keySeq = name;
    }
    if (result == "handled") {
      signalLater(cm, "keyHandled", cm, name, e);
    }

    if (result == "handled" || result == "multi") {
      e_preventDefault(e);
      restartBlink(cm);
    }

    if (seq && !result && /\'$/.test(name)) {
      e_preventDefault(e);
      return true;
    }
    return !!result;
  }

  // Handle a key from the keydown event.
  function handleKeyBinding(cm, e) {
    var name = keyName(e, true);
    if (!name) {
      return false;
    }

    if (e.shiftKey && !cm.state.keySeq) {
      // First try to resolve full name (including 'Shift-'). Failing
      // that, see if there is a cursor-motion command (starting with
      // 'go') bound to the keyname without 'Shift-'.
      return dispatchKey(cm, "Shift-" + name, e, function (b) {
        return doHandleBinding(cm, b, true);
      }) || dispatchKey(cm, name, e, function (b) {
        if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion) {
          return doHandleBinding(cm, b);
        }
      });
    } else {
      return dispatchKey(cm, name, e, function (b) {
        return doHandleBinding(cm, b);
      });
    }
  }

  // Handle a key from the keypress event
  function handleCharBinding(cm, e, ch) {
    return dispatchKey(cm, "'" + ch + "'", e, function (b) {
      return doHandleBinding(cm, b, true);
    });
  }

  var lastStoppedKey = null;
  function onKeyDown(e) {
    var cm = this;
    cm.curOp.focus = activeElt();
    if (signalDOMEvent(cm, e)) {
      return;
    }
    // IE does strange things with escape.
    if (ie && ie_version < 11 && e.keyCode == 27) {
      e.returnValue = false;
    }
    var code = e.keyCode;
    cm.display.shift = code == 16 || e.shiftKey;
    var handled = handleKeyBinding(cm, e);
    if (presto) {
      lastStoppedKey = handled ? code : null;
      // Opera has no cut event... we try to at least catch the key combo
      if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey)) {
        cm.replaceSelection("", null, "cut");
      }
    }

    // Turn mouse into crosshair when Alt is held on Mac.
    if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className)) {
      showCrossHair(cm);
    }
  }

  function showCrossHair(cm) {
    var lineDiv = cm.display.lineDiv;
    addClass(lineDiv, "CodeMirror-crosshair");

    function up(e) {
      if (e.keyCode == 18 || !e.altKey) {
        rmClass(lineDiv, "CodeMirror-crosshair");
        off(document, "keyup", up);
        off(document, "mouseover", up);
      }
    }
    on(document, "keyup", up);
    on(document, "mouseover", up);
  }

  function onKeyUp(e) {
    if (e.keyCode == 16) {
      this.doc.sel.shift = false;
    }
    signalDOMEvent(this, e);
  }

  function onKeyPress(e) {
    var cm = this;
    if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) {
      return;
    }
    var keyCode = e.keyCode,
        charCode = e.charCode;
    if (presto && keyCode == lastStoppedKey) {
      lastStoppedKey = null;e_preventDefault(e);return;
    }
    if (presto && (!e.which || e.which < 10) && handleKeyBinding(cm, e)) {
      return;
    }
    var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
    // Some browsers fire keypress events for backspace
    if (ch == "\x08") {
      return;
    }
    if (handleCharBinding(cm, e, ch)) {
      return;
    }
    cm.display.input.onKeyPress(e);
  }

  var DOUBLECLICK_DELAY = 400;

  var PastClick = function (time, pos, button) {
    this.time = time;
    this.pos = pos;
    this.button = button;
  };

  PastClick.prototype.compare = function (time, pos, button) {
    return this.time + DOUBLECLICK_DELAY > time && cmp(pos, this.pos) == 0 && button == this.button;
  };

  var lastClick;
  var lastDoubleClick;
  function clickRepeat(pos, button) {
    var now = +new Date();
    if (lastDoubleClick && lastDoubleClick.compare(now, pos, button)) {
      lastClick = lastDoubleClick = null;
      return "triple";
    } else if (lastClick && lastClick.compare(now, pos, button)) {
      lastDoubleClick = new PastClick(now, pos, button);
      lastClick = null;
      return "double";
    } else {
      lastClick = new PastClick(now, pos, button);
      lastDoubleClick = null;
      return "single";
    }
  }

  // A mouse down can be a single click, double click, triple click,
  // start of selection drag, start of text drag, new cursor
  // (ctrl-click), rectangle drag (alt-drag), or xwin
  // middle-click-paste. Or it might be a click on something we should
  // not interfere with, such as a scrollbar or widget.
  function onMouseDown(e) {
    var cm = this,
        display = cm.display;
    if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch()) {
      return;
    }
    display.input.ensurePolled();
    display.shift = e.shiftKey;

    if (eventInWidget(display, e)) {
      if (!webkit) {
        // Briefly turn off draggability, to allow widgets to do
        // normal dragging things.
        display.scroller.draggable = false;
        setTimeout(function () {
          return display.scroller.draggable = true;
        }, 100);
      }
      return;
    }
    if (clickInGutter(cm, e)) {
      return;
    }
    var pos = posFromMouse(cm, e),
        button = e_button(e),
        repeat = pos ? clickRepeat(pos, button) : "single";
    window.focus();

    // #3261: make sure, that we're not starting a second selection
    if (button == 1 && cm.state.selectingText) {
      cm.state.selectingText(e);
    }

    if (pos && handleMappedButton(cm, button, pos, repeat, e)) {
      return;
    }

    if (button == 1) {
      if (pos) {
        leftButtonDown(cm, pos, repeat, e);
      } else if (e_target(e) == display.scroller) {
        e_preventDefault(e);
      }
    } else if (button == 2) {
      if (pos) {
        extendSelection(cm.doc, pos);
      }
      setTimeout(function () {
        return display.input.focus();
      }, 20);
    } else if (button == 3) {
      if (captureRightClick) {
        onContextMenu(cm, e);
      } else {
        delayBlurEvent(cm);
      }
    }
  }

  function handleMappedButton(cm, button, pos, repeat, event) {
    var name = "Click";
    if (repeat == "double") {
      name = "Double" + name;
    } else if (repeat == "triple") {
      name = "Triple" + name;
    }
    name = (button == 1 ? "Left" : button == 2 ? "Middle" : "Right") + name;

    return dispatchKey(cm, addModifierNames(name, event), event, function (bound) {
      if (typeof bound == "string") {
        bound = commands[bound];
      }
      if (!bound) {
        return false;
      }
      var done = false;
      try {
        if (cm.isReadOnly()) {
          cm.state.suppressEdits = true;
        }
        done = bound(cm, pos) != Pass;
      } finally {
        cm.state.suppressEdits = false;
      }
      return done;
    });
  }

  function configureMouse(cm, repeat, event) {
    var option = cm.getOption("configureMouse");
    var value = option ? option(cm, repeat, event) : {};
    if (value.unit == null) {
      var rect = chromeOS ? event.shiftKey && event.metaKey : event.altKey;
      value.unit = rect ? "rectangle" : repeat == "single" ? "char" : repeat == "double" ? "word" : "line";
    }
    if (value.extend == null || cm.doc.extend) {
      value.extend = cm.doc.extend || event.shiftKey;
    }
    if (value.addNew == null) {
      value.addNew = mac ? event.metaKey : event.ctrlKey;
    }
    if (value.moveOnDrag == null) {
      value.moveOnDrag = !(mac ? event.altKey : event.ctrlKey);
    }
    return value;
  }

  function leftButtonDown(cm, pos, repeat, event) {
    if (ie) {
      setTimeout(bind(ensureFocus, cm), 0);
    } else {
      cm.curOp.focus = activeElt();
    }

    var behavior = configureMouse(cm, repeat, event);

    var sel = cm.doc.sel,
        contained;
    if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() && repeat == "single" && (contained = sel.contains(pos)) > -1 && (cmp((contained = sel.ranges[contained]).from(), pos) < 0 || pos.xRel > 0) && (cmp(contained.to(), pos) > 0 || pos.xRel < 0)) {
      leftButtonStartDrag(cm, event, pos, behavior);
    } else {
      leftButtonSelect(cm, event, pos, behavior);
    }
  }

  // Start a text drag. When it ends, see if any dragging actually
  // happen, and treat as a click if it didn't.
  function leftButtonStartDrag(cm, event, pos, behavior) {
    var display = cm.display,
        moved = false;
    var dragEnd = operation(cm, function (e) {
      if (webkit) {
        display.scroller.draggable = false;
      }
      cm.state.draggingText = false;
      off(document, "mouseup", dragEnd);
      off(document, "mousemove", mouseMove);
      off(display.scroller, "dragstart", dragStart);
      off(display.scroller, "drop", dragEnd);
      if (!moved) {
        e_preventDefault(e);
        if (!behavior.addNew) {
          extendSelection(cm.doc, pos, null, null, behavior.extend);
        }
        // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)
        if (webkit || ie && ie_version == 9) {
          setTimeout(function () {
            document.body.focus();display.input.focus();
          }, 20);
        } else {
          display.input.focus();
        }
      }
    });
    var mouseMove = function (e2) {
      moved = moved || Math.abs(event.clientX - e2.clientX) + Math.abs(event.clientY - e2.clientY) >= 10;
    };
    var dragStart = function () {
      return moved = true;
    };
    // Let the drag handler handle this.
    if (webkit) {
      display.scroller.draggable = true;
    }
    cm.state.draggingText = dragEnd;
    dragEnd.copy = !behavior.moveOnDrag;
    // IE's approach to draggable
    if (display.scroller.dragDrop) {
      display.scroller.dragDrop();
    }
    on(document, "mouseup", dragEnd);
    on(document, "mousemove", mouseMove);
    on(display.scroller, "dragstart", dragStart);
    on(display.scroller, "drop", dragEnd);

    delayBlurEvent(cm);
    setTimeout(function () {
      return display.input.focus();
    }, 20);
  }

  function rangeForUnit(cm, pos, unit) {
    if (unit == "char") {
      return new Range(pos, pos);
    }
    if (unit == "word") {
      return cm.findWordAt(pos);
    }
    if (unit == "line") {
      return new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0)));
    }
    var result = unit(cm, pos);
    return new Range(result.from, result.to);
  }

  // Normal selection, as opposed to text dragging.
  function leftButtonSelect(cm, event, start, behavior) {
    var display = cm.display,
        doc = cm.doc;
    e_preventDefault(event);

    var ourRange,
        ourIndex,
        startSel = doc.sel,
        ranges = startSel.ranges;
    if (behavior.addNew && !behavior.extend) {
      ourIndex = doc.sel.contains(start);
      if (ourIndex > -1) {
        ourRange = ranges[ourIndex];
      } else {
        ourRange = new Range(start, start);
      }
    } else {
      ourRange = doc.sel.primary();
      ourIndex = doc.sel.primIndex;
    }

    if (behavior.unit == "rectangle") {
      if (!behavior.addNew) {
        ourRange = new Range(start, start);
      }
      start = posFromMouse(cm, event, true, true);
      ourIndex = -1;
    } else {
      var range = rangeForUnit(cm, start, behavior.unit);
      if (behavior.extend) {
        ourRange = extendRange(ourRange, range.anchor, range.head, behavior.extend);
      } else {
        ourRange = range;
      }
    }

    if (!behavior.addNew) {
      ourIndex = 0;
      setSelection(doc, new Selection([ourRange], 0), sel_mouse);
      startSel = doc.sel;
    } else if (ourIndex == -1) {
      ourIndex = ranges.length;
      setSelection(doc, normalizeSelection(ranges.concat([ourRange]), ourIndex), { scroll: false, origin: "*mouse" });
    } else if (ranges.length > 1 && ranges[ourIndex].empty() && behavior.unit == "char" && !behavior.extend) {
      setSelection(doc, normalizeSelection(ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0), { scroll: false, origin: "*mouse" });
      startSel = doc.sel;
    } else {
      replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
    }

    var lastPos = start;
    function extendTo(pos) {
      if (cmp(lastPos, pos) == 0) {
        return;
      }
      lastPos = pos;

      if (behavior.unit == "rectangle") {
        var ranges = [],
            tabSize = cm.options.tabSize;
        var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
        var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
        var left = Math.min(startCol, posCol),
            right = Math.max(startCol, posCol);
        for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line)); line <= end; line++) {
          var text = getLine(doc, line).text,
              leftPos = findColumn(text, left, tabSize);
          if (left == right) {
            ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos)));
          } else if (text.length > leftPos) {
            ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))));
          }
        }
        if (!ranges.length) {
          ranges.push(new Range(start, start));
        }
        setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex), { origin: "*mouse", scroll: false });
        cm.scrollIntoView(pos);
      } else {
        var oldRange = ourRange;
        var range = rangeForUnit(cm, pos, behavior.unit);
        var anchor = oldRange.anchor,
            head;
        if (cmp(range.anchor, anchor) > 0) {
          head = range.head;
          anchor = minPos(oldRange.from(), range.anchor);
        } else {
          head = range.anchor;
          anchor = maxPos(oldRange.to(), range.head);
        }
        var ranges$1 = startSel.ranges.slice(0);
        ranges$1[ourIndex] = bidiSimplify(cm, new Range(clipPos(doc, anchor), head));
        setSelection(doc, normalizeSelection(ranges$1, ourIndex), sel_mouse);
      }
    }

    var editorSize = display.wrapper.getBoundingClientRect();
    // Used to ensure timeout re-tries don't fire when another extend
    // happened in the meantime (clearTimeout isn't reliable -- at
    // least on Chrome, the timeouts still happen even when cleared,
    // if the clear happens after their scheduled firing time).
    var counter = 0;

    function extend(e) {
      var curCount = ++counter;
      var cur = posFromMouse(cm, e, true, behavior.unit == "rectangle");
      if (!cur) {
        return;
      }
      if (cmp(cur, lastPos) != 0) {
        cm.curOp.focus = activeElt();
        extendTo(cur);
        var visible = visibleLines(display, doc);
        if (cur.line >= visible.to || cur.line < visible.from) {
          setTimeout(operation(cm, function () {
            if (counter == curCount) {
              extend(e);
            }
          }), 150);
        }
      } else {
        var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
        if (outside) {
          setTimeout(operation(cm, function () {
            if (counter != curCount) {
              return;
            }
            display.scroller.scrollTop += outside;
            extend(e);
          }), 50);
        }
      }
    }

    function done(e) {
      cm.state.selectingText = false;
      counter = Infinity;
      e_preventDefault(e);
      display.input.focus();
      off(document, "mousemove", move);
      off(document, "mouseup", up);
      doc.history.lastSelOrigin = null;
    }

    var move = operation(cm, function (e) {
      if (!e_button(e)) {
        done(e);
      } else {
        extend(e);
      }
    });
    var up = operation(cm, done);
    cm.state.selectingText = up;
    on(document, "mousemove", move);
    on(document, "mouseup", up);
  }

  // Used when mouse-selecting to adjust the anchor to the proper side
  // of a bidi jump depending on the visual position of the head.
  function bidiSimplify(cm, range) {
    var anchor = range.anchor;
    var head = range.head;
    var anchorLine = getLine(cm.doc, anchor.line);
    if (cmp(anchor, head) == 0 && anchor.sticky == head.sticky) {
      return range;
    }
    var order = getOrder(anchorLine);
    if (!order) {
      return range;
    }
    var index = getBidiPartAt(order, anchor.ch, anchor.sticky),
        part = order[index];
    if (part.from != anchor.ch && part.to != anchor.ch) {
      return range;
    }
    var boundary = index + (part.from == anchor.ch == (part.level != 1) ? 0 : 1);
    if (boundary == 0 || boundary == order.length) {
      return range;
    }

    // Compute the relative visual position of the head compared to the
    // anchor (<0 is to the left, >0 to the right)
    var leftSide;
    if (head.line != anchor.line) {
      leftSide = (head.line - anchor.line) * (cm.doc.direction == "ltr" ? 1 : -1) > 0;
    } else {
      var headIndex = getBidiPartAt(order, head.ch, head.sticky);
      var dir = headIndex - index || (head.ch - anchor.ch) * (part.level == 1 ? -1 : 1);
      if (headIndex == boundary - 1 || headIndex == boundary) {
        leftSide = dir < 0;
      } else {
        leftSide = dir > 0;
      }
    }

    var usePart = order[boundary + (leftSide ? -1 : 0)];
    var from = leftSide == (usePart.level == 1);
    var ch = from ? usePart.from : usePart.to,
        sticky = from ? "after" : "before";
    return anchor.ch == ch && anchor.sticky == sticky ? range : new Range(new Pos(anchor.line, ch, sticky), head);
  }

  // Determines whether an event happened in the gutter, and fires the
  // handlers for the corresponding event.
  function gutterEvent(cm, e, type, prevent) {
    var mX, mY;
    if (e.touches) {
      mX = e.touches[0].clientX;
      mY = e.touches[0].clientY;
    } else {
      try {
        mX = e.clientX;mY = e.clientY;
      } catch (e) {
        return false;
      }
    }
    if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) {
      return false;
    }
    if (prevent) {
      e_preventDefault(e);
    }

    var display = cm.display;
    var lineBox = display.lineDiv.getBoundingClientRect();

    if (mY > lineBox.bottom || !hasHandler(cm, type)) {
      return e_defaultPrevented(e);
    }
    mY -= lineBox.top - display.viewOffset;

    for (var i = 0; i < cm.options.gutters.length; ++i) {
      var g = display.gutters.childNodes[i];
      if (g && g.getBoundingClientRect().right >= mX) {
        var line = lineAtHeight(cm.doc, mY);
        var gutter = cm.options.gutters[i];
        signal(cm, type, cm, line, gutter, e);
        return e_defaultPrevented(e);
      }
    }
  }

  function clickInGutter(cm, e) {
    return gutterEvent(cm, e, "gutterClick", true);
  }

  // CONTEXT MENU HANDLING

  // To make the context menu work, we need to briefly unhide the
  // textarea (making it as unobtrusive as possible) to let the
  // right-click take effect on it.
  function onContextMenu(cm, e) {
    if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) {
      return;
    }
    if (signalDOMEvent(cm, e, "contextmenu")) {
      return;
    }
    cm.display.input.onContextMenu(e);
  }

  function contextMenuInGutter(cm, e) {
    if (!hasHandler(cm, "gutterContextMenu")) {
      return false;
    }
    return gutterEvent(cm, e, "gutterContextMenu", false);
  }

  function themeChanged(cm) {
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    clearCaches(cm);
  }

  var Init = { toString: function () {
      return "CodeMirror.Init";
    } };

  var defaults = {};
  var optionHandlers = {};

  function defineOptions(CodeMirror) {
    var optionHandlers = CodeMirror.optionHandlers;

    function option(name, deflt, handle, notOnInit) {
      CodeMirror.defaults[name] = deflt;
      if (handle) {
        optionHandlers[name] = notOnInit ? function (cm, val, old) {
          if (old != Init) {
            handle(cm, val, old);
          }
        } : handle;
      }
    }

    CodeMirror.defineOption = option;

    // Passed to option handlers when there is no old value.
    CodeMirror.Init = Init;

    // These two are, on init, called from the constructor because they
    // have to be initialized before the editor can start at all.
    option("value", "", function (cm, val) {
      return cm.setValue(val);
    }, true);
    option("mode", null, function (cm, val) {
      cm.doc.modeOption = val;
      loadMode(cm);
    }, true);

    option("indentUnit", 2, loadMode, true);
    option("indentWithTabs", false);
    option("smartIndent", true);
    option("tabSize", 4, function (cm) {
      resetModeState(cm);
      clearCaches(cm);
      regChange(cm);
    }, true);
    option("lineSeparator", null, function (cm, val) {
      cm.doc.lineSep = val;
      if (!val) {
        return;
      }
      var newBreaks = [],
          lineNo = cm.doc.first;
      cm.doc.iter(function (line) {
        for (var pos = 0;;) {
          var found = line.text.indexOf(val, pos);
          if (found == -1) {
            break;
          }
          pos = found + val.length;
          newBreaks.push(Pos(lineNo, found));
        }
        lineNo++;
      });
      for (var i = newBreaks.length - 1; i >= 0; i--) {
        replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length));
      }
    });
    option("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g, function (cm, val, old) {
      cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");
      if (old != Init) {
        cm.refresh();
      }
    });
    option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function (cm) {
      return cm.refresh();
    }, true);
    option("electricChars", true);
    option("inputStyle", mobile ? "contenteditable" : "textarea", function () {
      throw new Error("inputStyle can not (yet) be changed in a running editor"); // FIXME
    }, true);
    option("spellcheck", false, function (cm, val) {
      return cm.getInputField().spellcheck = val;
    }, true);
    option("rtlMoveVisually", !windows);
    option("wholeLineUpdateBefore", true);

    option("theme", "default", function (cm) {
      themeChanged(cm);
      guttersChanged(cm);
    }, true);
    option("keyMap", "default", function (cm, val, old) {
      var next = getKeyMap(val);
      var prev = old != Init && getKeyMap(old);
      if (prev && prev.detach) {
        prev.detach(cm, next);
      }
      if (next.attach) {
        next.attach(cm, prev || null);
      }
    });
    option("extraKeys", null);
    option("configureMouse", null);

    option("lineWrapping", false, wrappingChanged, true);
    option("gutters", [], function (cm) {
      setGuttersForLineNumbers(cm.options);
      guttersChanged(cm);
    }, true);
    option("fixedGutter", true, function (cm, val) {
      cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
      cm.refresh();
    }, true);
    option("coverGutterNextToScrollbar", false, function (cm) {
      return updateScrollbars(cm);
    }, true);
    option("scrollbarStyle", "native", function (cm) {
      initScrollbars(cm);
      updateScrollbars(cm);
      cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
      cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
    }, true);
    option("lineNumbers", false, function (cm) {
      setGuttersForLineNumbers(cm.options);
      guttersChanged(cm);
    }, true);
    option("firstLineNumber", 1, guttersChanged, true);
    option("lineNumberFormatter", function (integer) {
      return integer;
    }, guttersChanged, true);
    option("showCursorWhenSelecting", false, updateSelection, true);

    option("resetSelectionOnContextMenu", true);
    option("lineWiseCopyCut", true);
    option("pasteLinesPerSelection", true);

    option("readOnly", false, function (cm, val) {
      if (val == "nocursor") {
        onBlur(cm);
        cm.display.input.blur();
      }
      cm.display.input.readOnlyChanged(val);
    });
    option("disableInput", false, function (cm, val) {
      if (!val) {
        cm.display.input.reset();
      }
    }, true);
    option("dragDrop", true, dragDropChanged);
    option("allowDropFileTypes", null);

    option("cursorBlinkRate", 530);
    option("cursorScrollMargin", 0);
    option("cursorHeight", 1, updateSelection, true);
    option("singleCursorHeightPerLine", true, updateSelection, true);
    option("workTime", 100);
    option("workDelay", 100);
    option("flattenSpans", true, resetModeState, true);
    option("addModeClass", false, resetModeState, true);
    option("pollInterval", 100);
    option("undoDepth", 200, function (cm, val) {
      return cm.doc.history.undoDepth = val;
    });
    option("historyEventDelay", 1250);
    option("viewportMargin", 10, function (cm) {
      return cm.refresh();
    }, true);
    option("maxHighlightLength", 10000, resetModeState, true);
    option("moveInputWithCursor", true, function (cm, val) {
      if (!val) {
        cm.display.input.resetPosition();
      }
    });

    option("tabindex", null, function (cm, val) {
      return cm.display.input.getField().tabIndex = val || "";
    });
    option("autofocus", null);
    option("direction", "ltr", function (cm, val) {
      return cm.doc.setDirection(val);
    }, true);
  }

  function guttersChanged(cm) {
    updateGutters(cm);
    regChange(cm);
    alignHorizontally(cm);
  }

  function dragDropChanged(cm, value, old) {
    var wasOn = old && old != Init;
    if (!value != !wasOn) {
      var funcs = cm.display.dragFunctions;
      var toggle = value ? on : off;
      toggle(cm.display.scroller, "dragstart", funcs.start);
      toggle(cm.display.scroller, "dragenter", funcs.enter);
      toggle(cm.display.scroller, "dragover", funcs.over);
      toggle(cm.display.scroller, "dragleave", funcs.leave);
      toggle(cm.display.scroller, "drop", funcs.drop);
    }
  }

  function wrappingChanged(cm) {
    if (cm.options.lineWrapping) {
      addClass(cm.display.wrapper, "CodeMirror-wrap");
      cm.display.sizer.style.minWidth = "";
      cm.display.sizerWidth = null;
    } else {
      rmClass(cm.display.wrapper, "CodeMirror-wrap");
      findMaxLine(cm);
    }
    estimateLineHeights(cm);
    regChange(cm);
    clearCaches(cm);
    setTimeout(function () {
      return updateScrollbars(cm);
    }, 100);
  }

  // A CodeMirror instance represents an editor. This is the object
  // that user code is usually dealing with.

  function CodeMirror(place, options) {
    var this$1 = this;

    if (!(this instanceof CodeMirror)) {
      return new CodeMirror(place, options);
    }

    this.options = options = options ? copyObj(options) : {};
    // Determine effective options based on given values and defaults.
    copyObj(defaults, options, false);
    setGuttersForLineNumbers(options);

    var doc = options.value;
    if (typeof doc == "string") {
      doc = new Doc(doc, options.mode, null, options.lineSeparator, options.direction);
    }
    this.doc = doc;

    var input = new CodeMirror.inputStyles[options.inputStyle](this);
    var display = this.display = new Display(place, doc, input);
    display.wrapper.CodeMirror = this;
    updateGutters(this);
    themeChanged(this);
    if (options.lineWrapping) {
      this.display.wrapper.className += " CodeMirror-wrap";
    }
    initScrollbars(this);

    this.state = {
      keyMaps: [], // stores maps added by addKeyMap
      overlays: [], // highlighting overlays, as added by addOverlay
      modeGen: 0, // bumped when mode/overlay changes, used to invalidate highlighting info
      overwrite: false,
      delayingBlurEvent: false,
      focused: false,
      suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
      pasteIncoming: false, cutIncoming: false, // help recognize paste/cut edits in input.poll
      selectingText: false,
      draggingText: false,
      highlight: new Delayed(), // stores highlight worker timeout
      keySeq: null, // Unfinished key sequence
      specialChars: null
    };

    if (options.autofocus && !mobile) {
      display.input.focus();
    }

    // Override magic textarea content restore that IE sometimes does
    // on our hidden textarea on reload
    if (ie && ie_version < 11) {
      setTimeout(function () {
        return this$1.display.input.reset(true);
      }, 20);
    }

    registerEventHandlers(this);
    ensureGlobalHandlers();

    startOperation(this);
    this.curOp.forceUpdate = true;
    attachDoc(this, doc);

    if (options.autofocus && !mobile || this.hasFocus()) {
      setTimeout(bind(onFocus, this), 20);
    } else {
      onBlur(this);
    }

    for (var opt in optionHandlers) {
      if (optionHandlers.hasOwnProperty(opt)) {
        optionHandlers[opt](this$1, options[opt], Init);
      }
    }
    maybeUpdateLineNumberWidth(this);
    if (options.finishInit) {
      options.finishInit(this);
    }
    for (var i = 0; i < initHooks.length; ++i) {
      initHooks[i](this$1);
    }
    endOperation(this);
    // Suppress optimizelegibility in Webkit, since it breaks text
    // measuring on line wrapping boundaries.
    if (webkit && options.lineWrapping && getComputedStyle(display.lineDiv).textRendering == "optimizelegibility") {
      display.lineDiv.style.textRendering = "auto";
    }
  }

  // The default configuration options.
  CodeMirror.defaults = defaults;
  // Functions to run when options are changed.
  CodeMirror.optionHandlers = optionHandlers;

  // Attach the necessary event handlers when initializing the editor
  function registerEventHandlers(cm) {
    var d = cm.display;
    on(d.scroller, "mousedown", operation(cm, onMouseDown));
    // Older IE's will not fire a second mousedown for a double click
    if (ie && ie_version < 11) {
      on(d.scroller, "dblclick", operation(cm, function (e) {
        if (signalDOMEvent(cm, e)) {
          return;
        }
        var pos = posFromMouse(cm, e);
        if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) {
          return;
        }
        e_preventDefault(e);
        var word = cm.findWordAt(pos);
        extendSelection(cm.doc, word.anchor, word.head);
      }));
    } else {
      on(d.scroller, "dblclick", function (e) {
        return signalDOMEvent(cm, e) || e_preventDefault(e);
      });
    }
    // Some browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for these browsers.
    if (!captureRightClick) {
      on(d.scroller, "contextmenu", function (e) {
        return onContextMenu(cm, e);
      });
    }

    // Used to suppress mouse event handling when a touch happens
    var touchFinished,
        prevTouch = { end: 0 };
    function finishTouch() {
      if (d.activeTouch) {
        touchFinished = setTimeout(function () {
          return d.activeTouch = null;
        }, 1000);
        prevTouch = d.activeTouch;
        prevTouch.end = +new Date();
      }
    }
    function isMouseLikeTouchEvent(e) {
      if (e.touches.length != 1) {
        return false;
      }
      var touch = e.touches[0];
      return touch.radiusX <= 1 && touch.radiusY <= 1;
    }
    function farAway(touch, other) {
      if (other.left == null) {
        return true;
      }
      var dx = other.left - touch.left,
          dy = other.top - touch.top;
      return dx * dx + dy * dy > 20 * 20;
    }
    on(d.scroller, "touchstart", function (e) {
      if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e) && !clickInGutter(cm, e)) {
        d.input.ensurePolled();
        clearTimeout(touchFinished);
        var now = +new Date();
        d.activeTouch = { start: now, moved: false,
          prev: now - prevTouch.end <= 300 ? prevTouch : null };
        if (e.touches.length == 1) {
          d.activeTouch.left = e.touches[0].pageX;
          d.activeTouch.top = e.touches[0].pageY;
        }
      }
    });
    on(d.scroller, "touchmove", function () {
      if (d.activeTouch) {
        d.activeTouch.moved = true;
      }
    });
    on(d.scroller, "touchend", function (e) {
      var touch = d.activeTouch;
      if (touch && !eventInWidget(d, e) && touch.left != null && !touch.moved && new Date() - touch.start < 300) {
        var pos = cm.coordsChar(d.activeTouch, "page"),
            range;
        if (!touch.prev || farAway(touch, touch.prev)) // Single tap
          {
            range = new Range(pos, pos);
          } else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
          {
            range = cm.findWordAt(pos);
          } else // Triple tap
          {
            range = new Range(Pos(pos.line, 0), clipPos(cm.doc, Pos(pos.line + 1, 0)));
          }
        cm.setSelection(range.anchor, range.head);
        cm.focus();
        e_preventDefault(e);
      }
      finishTouch();
    });
    on(d.scroller, "touchcancel", finishTouch);

    // Sync scrolling between fake scrollbars and real scrollable
    // area, ensure viewport is updated when scrolling.
    on(d.scroller, "scroll", function () {
      if (d.scroller.clientHeight) {
        updateScrollTop(cm, d.scroller.scrollTop);
        setScrollLeft(cm, d.scroller.scrollLeft, true);
        signal(cm, "scroll", cm);
      }
    });

    // Listen to wheel events in order to try and update the viewport on time.
    on(d.scroller, "mousewheel", function (e) {
      return onScrollWheel(cm, e);
    });
    on(d.scroller, "DOMMouseScroll", function (e) {
      return onScrollWheel(cm, e);
    });

    // Prevent wrapper from ever scrolling
    on(d.wrapper, "scroll", function () {
      return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0;
    });

    d.dragFunctions = {
      enter: function (e) {
        if (!signalDOMEvent(cm, e)) {
          e_stop(e);
        }
      },
      over: function (e) {
        if (!signalDOMEvent(cm, e)) {
          onDragOver(cm, e);e_stop(e);
        }
      },
      start: function (e) {
        return onDragStart(cm, e);
      },
      drop: operation(cm, onDrop),
      leave: function (e) {
        if (!signalDOMEvent(cm, e)) {
          clearDragCursor(cm);
        }
      }
    };

    var inp = d.input.getField();
    on(inp, "keyup", function (e) {
      return onKeyUp.call(cm, e);
    });
    on(inp, "keydown", operation(cm, onKeyDown));
    on(inp, "keypress", operation(cm, onKeyPress));
    on(inp, "focus", function (e) {
      return onFocus(cm, e);
    });
    on(inp, "blur", function (e) {
      return onBlur(cm, e);
    });
  }

  var initHooks = [];
  CodeMirror.defineInitHook = function (f) {
    return initHooks.push(f);
  };

  // Indent the given line. The how parameter can be "smart",
  // "add"/null, "subtract", or "prev". When aggressive is false
  // (typically set to true for forced single-line indents), empty
  // lines are not indented, and places where the mode returns Pass
  // are left alone.
  function indentLine(cm, n, how, aggressive) {
    var doc = cm.doc,
        state;
    if (how == null) {
      how = "add";
    }
    if (how == "smart") {
      // Fall back to "prev" when the mode doesn't have an indentation
      // method.
      if (!doc.mode.indent) {
        how = "prev";
      } else {
        state = getContextBefore(cm, n).state;
      }
    }

    var tabSize = cm.options.tabSize;
    var line = getLine(doc, n),
        curSpace = countColumn(line.text, null, tabSize);
    if (line.stateAfter) {
      line.stateAfter = null;
    }
    var curSpaceString = line.text.match(/^\s*/)[0],
        indentation;
    if (!aggressive && !/\S/.test(line.text)) {
      indentation = 0;
      how = "not";
    } else if (how == "smart") {
      indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
      if (indentation == Pass || indentation > 150) {
        if (!aggressive) {
          return;
        }
        how = "prev";
      }
    }
    if (how == "prev") {
      if (n > doc.first) {
        indentation = countColumn(getLine(doc, n - 1).text, null, tabSize);
      } else {
        indentation = 0;
      }
    } else if (how == "add") {
      indentation = curSpace + cm.options.indentUnit;
    } else if (how == "subtract") {
      indentation = curSpace - cm.options.indentUnit;
    } else if (typeof how == "number") {
      indentation = curSpace + how;
    }
    indentation = Math.max(0, indentation);

    var indentString = "",
        pos = 0;
    if (cm.options.indentWithTabs) {
      for (var i = Math.floor(indentation / tabSize); i; --i) {
        pos += tabSize;indentString += "\t";
      }
    }
    if (pos < indentation) {
      indentString += spaceStr(indentation - pos);
    }

    if (indentString != curSpaceString) {
      replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
      line.stateAfter = null;
      return true;
    } else {
      // Ensure that, if the cursor was in the whitespace at the start
      // of the line, it is moved to the end of that space.
      for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
        var range = doc.sel.ranges[i$1];
        if (range.head.line == n && range.head.ch < curSpaceString.length) {
          var pos$1 = Pos(n, curSpaceString.length);
          replaceOneSelection(doc, i$1, new Range(pos$1, pos$1));
          break;
        }
      }
    }
  }

  // This will be set to a {lineWise: bool, text: [string]} object, so
  // that, when pasting, we know what kind of selections the copied
  // text was made out of.
  var lastCopied = null;

  function setLastCopied(newLastCopied) {
    lastCopied = newLastCopied;
  }

  function applyTextInput(cm, inserted, deleted, sel, origin) {
    var doc = cm.doc;
    cm.display.shift = false;
    if (!sel) {
      sel = doc.sel;
    }

    var paste = cm.state.pasteIncoming || origin == "paste";
    var textLines = splitLinesAuto(inserted),
        multiPaste = null;
    // When pasing N lines into N selections, insert one line per selection
    if (paste && sel.ranges.length > 1) {
      if (lastCopied && lastCopied.text.join("\n") == inserted) {
        if (sel.ranges.length % lastCopied.text.length == 0) {
          multiPaste = [];
          for (var i = 0; i < lastCopied.text.length; i++) {
            multiPaste.push(doc.splitLines(lastCopied.text[i]));
          }
        }
      } else if (textLines.length == sel.ranges.length && cm.options.pasteLinesPerSelection) {
        multiPaste = map(textLines, function (l) {
          return [l];
        });
      }
    }

    var updateInput;
    // Normal behavior is to insert the new text into every selection
    for (var i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
      var range = sel.ranges[i$1];
      var from = range.from(),
          to = range.to();
      if (range.empty()) {
        if (deleted && deleted > 0) // Handle deletion
          {
            from = Pos(from.line, from.ch - deleted);
          } else if (cm.state.overwrite && !paste) // Handle overwrite
          {
            to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));
          } else if (lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == inserted) {
          from = to = Pos(from.line, 0);
        }
      }
      updateInput = cm.curOp.updateInput;
      var changeEvent = { from: from, to: to, text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
        origin: origin || (paste ? "paste" : cm.state.cutIncoming ? "cut" : "+input") };
      makeChange(cm.doc, changeEvent);
      signalLater(cm, "inputRead", cm, changeEvent);
    }
    if (inserted && !paste) {
      triggerElectric(cm, inserted);
    }

    ensureCursorVisible(cm);
    cm.curOp.updateInput = updateInput;
    cm.curOp.typing = true;
    cm.state.pasteIncoming = cm.state.cutIncoming = false;
  }

  function handlePaste(e, cm) {
    var pasted = e.clipboardData && e.clipboardData.getData("Text");
    if (pasted) {
      e.preventDefault();
      if (!cm.isReadOnly() && !cm.options.disableInput) {
        runInOp(cm, function () {
          return applyTextInput(cm, pasted, 0, null, "paste");
        });
      }
      return true;
    }
  }

  function triggerElectric(cm, inserted) {
    // When an 'electric' character is inserted, immediately trigger a reindent
    if (!cm.options.electricChars || !cm.options.smartIndent) {
      return;
    }
    var sel = cm.doc.sel;

    for (var i = sel.ranges.length - 1; i >= 0; i--) {
      var range = sel.ranges[i];
      if (range.head.ch > 100 || i && sel.ranges[i - 1].head.line == range.head.line) {
        continue;
      }
      var mode = cm.getModeAt(range.head);
      var indented = false;
      if (mode.electricChars) {
        for (var j = 0; j < mode.electricChars.length; j++) {
          if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
            indented = indentLine(cm, range.head.line, "smart");
            break;
          }
        }
      } else if (mode.electricInput) {
        if (mode.electricInput.test(getLine(cm.doc, range.head.line).text.slice(0, range.head.ch))) {
          indented = indentLine(cm, range.head.line, "smart");
        }
      }
      if (indented) {
        signalLater(cm, "electricInput", cm, range.head.line);
      }
    }
  }

  function copyableRanges(cm) {
    var text = [],
        ranges = [];
    for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
      var line = cm.doc.sel.ranges[i].head.line;
      var lineRange = { anchor: Pos(line, 0), head: Pos(line + 1, 0) };
      ranges.push(lineRange);
      text.push(cm.getRange(lineRange.anchor, lineRange.head));
    }
    return { text: text, ranges: ranges };
  }

  function disableBrowserMagic(field, spellcheck) {
    field.setAttribute("autocorrect", "off");
    field.setAttribute("autocapitalize", "off");
    field.setAttribute("spellcheck", !!spellcheck);
  }

  function hiddenTextarea() {
    var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none");
    var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    // The textarea is kept positioned near the cursor to prevent the
    // fact that it'll be scrolled into view on input from scrolling
    // our fake cursor out of view. On webkit, when wrap=off, paste is
    // very slow. So make the area wide instead.
    if (webkit) {
      te.style.width = "1000px";
    } else {
      te.setAttribute("wrap", "off");
    }
    // If border: 0; -- iOS fails to open keyboard (issue #1287)
    if (ios) {
      te.style.border = "1px solid black";
    }
    disableBrowserMagic(te);
    return div;
  }

  // The publicly visible API. Note that methodOp(f) means
  // 'wrap f in an operation, performed on its `this` parameter'.

  // This is not the complete set of editor methods. Most of the
  // methods defined on the Doc type are also injected into
  // CodeMirror.prototype, for backwards compatibility and
  // convenience.

  function addEditorMethods(CodeMirror) {
    var optionHandlers = CodeMirror.optionHandlers;

    var helpers = CodeMirror.helpers = {};

    CodeMirror.prototype = {
      constructor: CodeMirror,
      focus: function () {
        window.focus();this.display.input.focus();
      },

      setOption: function (option, value) {
        var options = this.options,
            old = options[option];
        if (options[option] == value && option != "mode") {
          return;
        }
        options[option] = value;
        if (optionHandlers.hasOwnProperty(option)) {
          operation(this, optionHandlers[option])(this, value, old);
        }
        signal(this, "optionChange", this, option);
      },

      getOption: function (option) {
        return this.options[option];
      },
      getDoc: function () {
        return this.doc;
      },

      addKeyMap: function (map, bottom) {
        this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map));
      },
      removeKeyMap: function (map) {
        var maps = this.state.keyMaps;
        for (var i = 0; i < maps.length; ++i) {
          if (maps[i] == map || maps[i].name == map) {
            maps.splice(i, 1);
            return true;
          }
        }
      },

      addOverlay: methodOp(function (spec, options) {
        var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
        if (mode.startState) {
          throw new Error("Overlays may not be stateful.");
        }
        insertSorted(this.state.overlays, { mode: mode, modeSpec: spec, opaque: options && options.opaque,
          priority: options && options.priority || 0 }, function (overlay) {
          return overlay.priority;
        });
        this.state.modeGen++;
        regChange(this);
      }),
      removeOverlay: methodOp(function (spec) {
        var this$1 = this;

        var overlays = this.state.overlays;
        for (var i = 0; i < overlays.length; ++i) {
          var cur = overlays[i].modeSpec;
          if (cur == spec || typeof spec == "string" && cur.name == spec) {
            overlays.splice(i, 1);
            this$1.state.modeGen++;
            regChange(this$1);
            return;
          }
        }
      }),

      indentLine: methodOp(function (n, dir, aggressive) {
        if (typeof dir != "string" && typeof dir != "number") {
          if (dir == null) {
            dir = this.options.smartIndent ? "smart" : "prev";
          } else {
            dir = dir ? "add" : "subtract";
          }
        }
        if (isLine(this.doc, n)) {
          indentLine(this, n, dir, aggressive);
        }
      }),
      indentSelection: methodOp(function (how) {
        var this$1 = this;

        var ranges = this.doc.sel.ranges,
            end = -1;
        for (var i = 0; i < ranges.length; i++) {
          var range = ranges[i];
          if (!range.empty()) {
            var from = range.from(),
                to = range.to();
            var start = Math.max(end, from.line);
            end = Math.min(this$1.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
            for (var j = start; j < end; ++j) {
              indentLine(this$1, j, how);
            }
            var newRanges = this$1.doc.sel.ranges;
            if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0) {
              replaceOneSelection(this$1.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll);
            }
          } else if (range.head.line > end) {
            indentLine(this$1, range.head.line, how, true);
            end = range.head.line;
            if (i == this$1.doc.sel.primIndex) {
              ensureCursorVisible(this$1);
            }
          }
        }
      }),

      // Fetch the parser token for a given character. Useful for hacks
      // that want to inspect the mode state (say, for completion).
      getTokenAt: function (pos, precise) {
        return takeToken(this, pos, precise);
      },

      getLineTokens: function (line, precise) {
        return takeToken(this, Pos(line), precise, true);
      },

      getTokenTypeAt: function (pos) {
        pos = clipPos(this.doc, pos);
        var styles = getLineStyles(this, getLine(this.doc, pos.line));
        var before = 0,
            after = (styles.length - 1) / 2,
            ch = pos.ch;
        var type;
        if (ch == 0) {
          type = styles[2];
        } else {
          for (;;) {
            var mid = before + after >> 1;
            if ((mid ? styles[mid * 2 - 1] : 0) >= ch) {
              after = mid;
            } else if (styles[mid * 2 + 1] < ch) {
              before = mid + 1;
            } else {
              type = styles[mid * 2 + 2];break;
            }
          }
        }
        var cut = type ? type.indexOf("overlay ") : -1;
        return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1);
      },

      getModeAt: function (pos) {
        var mode = this.doc.mode;
        if (!mode.innerMode) {
          return mode;
        }
        return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode;
      },

      getHelper: function (pos, type) {
        return this.getHelpers(pos, type)[0];
      },

      getHelpers: function (pos, type) {
        var this$1 = this;

        var found = [];
        if (!helpers.hasOwnProperty(type)) {
          return found;
        }
        var help = helpers[type],
            mode = this.getModeAt(pos);
        if (typeof mode[type] == "string") {
          if (help[mode[type]]) {
            found.push(help[mode[type]]);
          }
        } else if (mode[type]) {
          for (var i = 0; i < mode[type].length; i++) {
            var val = help[mode[type][i]];
            if (val) {
              found.push(val);
            }
          }
        } else if (mode.helperType && help[mode.helperType]) {
          found.push(help[mode.helperType]);
        } else if (help[mode.name]) {
          found.push(help[mode.name]);
        }
        for (var i$1 = 0; i$1 < help._global.length; i$1++) {
          var cur = help._global[i$1];
          if (cur.pred(mode, this$1) && indexOf(found, cur.val) == -1) {
            found.push(cur.val);
          }
        }
        return found;
      },

      getStateAfter: function (line, precise) {
        var doc = this.doc;
        line = clipLine(doc, line == null ? doc.first + doc.size - 1 : line);
        return getContextBefore(this, line + 1, precise).state;
      },

      cursorCoords: function (start, mode) {
        var pos,
            range = this.doc.sel.primary();
        if (start == null) {
          pos = range.head;
        } else if (typeof start == "object") {
          pos = clipPos(this.doc, start);
        } else {
          pos = start ? range.from() : range.to();
        }
        return cursorCoords(this, pos, mode || "page");
      },

      charCoords: function (pos, mode) {
        return charCoords(this, clipPos(this.doc, pos), mode || "page");
      },

      coordsChar: function (coords, mode) {
        coords = fromCoordSystem(this, coords, mode || "page");
        return coordsChar(this, coords.left, coords.top);
      },

      lineAtHeight: function (height, mode) {
        height = fromCoordSystem(this, { top: height, left: 0 }, mode || "page").top;
        return lineAtHeight(this.doc, height + this.display.viewOffset);
      },
      heightAtLine: function (line, mode, includeWidgets) {
        var end = false,
            lineObj;
        if (typeof line == "number") {
          var last = this.doc.first + this.doc.size - 1;
          if (line < this.doc.first) {
            line = this.doc.first;
          } else if (line > last) {
            line = last;end = true;
          }
          lineObj = getLine(this.doc, line);
        } else {
          lineObj = line;
        }
        return intoCoordSystem(this, lineObj, { top: 0, left: 0 }, mode || "page", includeWidgets || end).top + (end ? this.doc.height - heightAtLine(lineObj) : 0);
      },

      defaultTextHeight: function () {
        return textHeight(this.display);
      },
      defaultCharWidth: function () {
        return charWidth(this.display);
      },

      getViewport: function () {
        return { from: this.display.viewFrom, to: this.display.viewTo };
      },

      addWidget: function (pos, node, scroll, vert, horiz) {
        var display = this.display;
        pos = cursorCoords(this, clipPos(this.doc, pos));
        var top = pos.bottom,
            left = pos.left;
        node.style.position = "absolute";
        node.setAttribute("cm-ignore-events", "true");
        this.display.input.setUneditable(node);
        display.sizer.appendChild(node);
        if (vert == "over") {
          top = pos.top;
        } else if (vert == "above" || vert == "near") {
          var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
              hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
          // Default to positioning above (if specified and possible); otherwise default to positioning below
          if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight) {
            top = pos.top - node.offsetHeight;
          } else if (pos.bottom + node.offsetHeight <= vspace) {
            top = pos.bottom;
          }
          if (left + node.offsetWidth > hspace) {
            left = hspace - node.offsetWidth;
          }
        }
        node.style.top = top + "px";
        node.style.left = node.style.right = "";
        if (horiz == "right") {
          left = display.sizer.clientWidth - node.offsetWidth;
          node.style.right = "0px";
        } else {
          if (horiz == "left") {
            left = 0;
          } else if (horiz == "middle") {
            left = (display.sizer.clientWidth - node.offsetWidth) / 2;
          }
          node.style.left = left + "px";
        }
        if (scroll) {
          scrollIntoView(this, { left: left, top: top, right: left + node.offsetWidth, bottom: top + node.offsetHeight });
        }
      },

      triggerOnKeyDown: methodOp(onKeyDown),
      triggerOnKeyPress: methodOp(onKeyPress),
      triggerOnKeyUp: onKeyUp,
      triggerOnMouseDown: methodOp(onMouseDown),

      execCommand: function (cmd) {
        if (commands.hasOwnProperty(cmd)) {
          return commands[cmd].call(null, this);
        }
      },

      triggerElectric: methodOp(function (text) {
        triggerElectric(this, text);
      }),

      findPosH: function (from, amount, unit, visually) {
        var this$1 = this;

        var dir = 1;
        if (amount < 0) {
          dir = -1;amount = -amount;
        }
        var cur = clipPos(this.doc, from);
        for (var i = 0; i < amount; ++i) {
          cur = findPosH(this$1.doc, cur, dir, unit, visually);
          if (cur.hitSide) {
            break;
          }
        }
        return cur;
      },

      moveH: methodOp(function (dir, unit) {
        var this$1 = this;

        this.extendSelectionsBy(function (range) {
          if (this$1.display.shift || this$1.doc.extend || range.empty()) {
            return findPosH(this$1.doc, range.head, dir, unit, this$1.options.rtlMoveVisually);
          } else {
            return dir < 0 ? range.from() : range.to();
          }
        }, sel_move);
      }),

      deleteH: methodOp(function (dir, unit) {
        var sel = this.doc.sel,
            doc = this.doc;
        if (sel.somethingSelected()) {
          doc.replaceSelection("", null, "+delete");
        } else {
          deleteNearSelection(this, function (range) {
            var other = findPosH(doc, range.head, dir, unit, false);
            return dir < 0 ? { from: other, to: range.head } : { from: range.head, to: other };
          });
        }
      }),

      findPosV: function (from, amount, unit, goalColumn) {
        var this$1 = this;

        var dir = 1,
            x = goalColumn;
        if (amount < 0) {
          dir = -1;amount = -amount;
        }
        var cur = clipPos(this.doc, from);
        for (var i = 0; i < amount; ++i) {
          var coords = cursorCoords(this$1, cur, "div");
          if (x == null) {
            x = coords.left;
          } else {
            coords.left = x;
          }
          cur = findPosV(this$1, coords, dir, unit);
          if (cur.hitSide) {
            break;
          }
        }
        return cur;
      },

      moveV: methodOp(function (dir, unit) {
        var this$1 = this;

        var doc = this.doc,
            goals = [];
        var collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
        doc.extendSelectionsBy(function (range) {
          if (collapse) {
            return dir < 0 ? range.from() : range.to();
          }
          var headPos = cursorCoords(this$1, range.head, "div");
          if (range.goalColumn != null) {
            headPos.left = range.goalColumn;
          }
          goals.push(headPos.left);
          var pos = findPosV(this$1, headPos, dir, unit);
          if (unit == "page" && range == doc.sel.primary()) {
            addToScrollTop(this$1, charCoords(this$1, pos, "div").top - headPos.top);
          }
          return pos;
        }, sel_move);
        if (goals.length) {
          for (var i = 0; i < doc.sel.ranges.length; i++) {
            doc.sel.ranges[i].goalColumn = goals[i];
          }
        }
      }),

      // Find the word at the given position (as returned by coordsChar).
      findWordAt: function (pos) {
        var doc = this.doc,
            line = getLine(doc, pos.line).text;
        var start = pos.ch,
            end = pos.ch;
        if (line) {
          var helper = this.getHelper(pos, "wordChars");
          if ((pos.sticky == "before" || end == line.length) && start) {
            --start;
          } else {
            ++end;
          }
          var startChar = line.charAt(start);
          var check = isWordChar(startChar, helper) ? function (ch) {
            return isWordChar(ch, helper);
          } : /\s/.test(startChar) ? function (ch) {
            return (/\s/.test(ch)
            );
          } : function (ch) {
            return !/\s/.test(ch) && !isWordChar(ch);
          };
          while (start > 0 && check(line.charAt(start - 1))) {
            --start;
          }
          while (end < line.length && check(line.charAt(end))) {
            ++end;
          }
        }
        return new Range(Pos(pos.line, start), Pos(pos.line, end));
      },

      toggleOverwrite: function (value) {
        if (value != null && value == this.state.overwrite) {
          return;
        }
        if (this.state.overwrite = !this.state.overwrite) {
          addClass(this.display.cursorDiv, "CodeMirror-overwrite");
        } else {
          rmClass(this.display.cursorDiv, "CodeMirror-overwrite");
        }

        signal(this, "overwriteToggle", this, this.state.overwrite);
      },
      hasFocus: function () {
        return this.display.input.getField() == activeElt();
      },
      isReadOnly: function () {
        return !!(this.options.readOnly || this.doc.cantEdit);
      },

      scrollTo: methodOp(function (x, y) {
        scrollToCoords(this, x, y);
      }),
      getScrollInfo: function () {
        var scroller = this.display.scroller;
        return { left: scroller.scrollLeft, top: scroller.scrollTop,
          height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
          width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
          clientHeight: displayHeight(this), clientWidth: displayWidth(this) };
      },

      scrollIntoView: methodOp(function (range, margin) {
        if (range == null) {
          range = { from: this.doc.sel.primary().head, to: null };
          if (margin == null) {
            margin = this.options.cursorScrollMargin;
          }
        } else if (typeof range == "number") {
          range = { from: Pos(range, 0), to: null };
        } else if (range.from == null) {
          range = { from: range, to: null };
        }
        if (!range.to) {
          range.to = range.from;
        }
        range.margin = margin || 0;

        if (range.from.line != null) {
          scrollToRange(this, range);
        } else {
          scrollToCoordsRange(this, range.from, range.to, range.margin);
        }
      }),

      setSize: methodOp(function (width, height) {
        var this$1 = this;

        var interpret = function (val) {
          return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val;
        };
        if (width != null) {
          this.display.wrapper.style.width = interpret(width);
        }
        if (height != null) {
          this.display.wrapper.style.height = interpret(height);
        }
        if (this.options.lineWrapping) {
          clearLineMeasurementCache(this);
        }
        var lineNo = this.display.viewFrom;
        this.doc.iter(lineNo, this.display.viewTo, function (line) {
          if (line.widgets) {
            for (var i = 0; i < line.widgets.length; i++) {
              if (line.widgets[i].noHScroll) {
                regLineChange(this$1, lineNo, "widget");break;
              }
            }
          }
          ++lineNo;
        });
        this.curOp.forceUpdate = true;
        signal(this, "refresh", this);
      }),

      operation: function (f) {
        return runInOp(this, f);
      },
      startOperation: function () {
        return startOperation(this);
      },
      endOperation: function () {
        return endOperation(this);
      },

      refresh: methodOp(function () {
        var oldHeight = this.display.cachedTextHeight;
        regChange(this);
        this.curOp.forceUpdate = true;
        clearCaches(this);
        scrollToCoords(this, this.doc.scrollLeft, this.doc.scrollTop);
        updateGutterSpace(this);
        if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5) {
          estimateLineHeights(this);
        }
        signal(this, "refresh", this);
      }),

      swapDoc: methodOp(function (doc) {
        var old = this.doc;
        old.cm = null;
        attachDoc(this, doc);
        clearCaches(this);
        this.display.input.reset();
        scrollToCoords(this, doc.scrollLeft, doc.scrollTop);
        this.curOp.forceScroll = true;
        signalLater(this, "swapDoc", this, old);
        return old;
      }),

      getInputField: function () {
        return this.display.input.getField();
      },
      getWrapperElement: function () {
        return this.display.wrapper;
      },
      getScrollerElement: function () {
        return this.display.scroller;
      },
      getGutterElement: function () {
        return this.display.gutters;
      }
    };
    eventMixin(CodeMirror);

    CodeMirror.registerHelper = function (type, name, value) {
      if (!helpers.hasOwnProperty(type)) {
        helpers[type] = CodeMirror[type] = { _global: [] };
      }
      helpers[type][name] = value;
    };
    CodeMirror.registerGlobalHelper = function (type, name, predicate, value) {
      CodeMirror.registerHelper(type, name, value);
      helpers[type]._global.push({ pred: predicate, val: value });
    };
  }

  // Used for horizontal relative motion. Dir is -1 or 1 (left or
  // right), unit can be "char", "column" (like char, but doesn't
  // cross line boundaries), "word" (across next word), or "group" (to
  // the start of next group of word or non-word-non-whitespace
  // chars). The visually param controls whether, in right-to-left
  // text, direction 1 means to move towards the next index in the
  // string, or towards the character to the right of the current
  // position. The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosH(doc, pos, dir, unit, visually) {
    var oldPos = pos;
    var origDir = dir;
    var lineObj = getLine(doc, pos.line);
    function findNextLine() {
      var l = pos.line + dir;
      if (l < doc.first || l >= doc.first + doc.size) {
        return false;
      }
      pos = new Pos(l, pos.ch, pos.sticky);
      return lineObj = getLine(doc, l);
    }
    function moveOnce(boundToLine) {
      var next;
      if (visually) {
        next = moveVisually(doc.cm, lineObj, pos, dir);
      } else {
        next = moveLogically(lineObj, pos, dir);
      }
      if (next == null) {
        if (!boundToLine && findNextLine()) {
          pos = endOfLine(visually, doc.cm, lineObj, pos.line, dir);
        } else {
          return false;
        }
      } else {
        pos = next;
      }
      return true;
    }

    if (unit == "char") {
      moveOnce();
    } else if (unit == "column") {
      moveOnce(true);
    } else if (unit == "word" || unit == "group") {
      var sawType = null,
          group = unit == "group";
      var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
      for (var first = true;; first = false) {
        if (dir < 0 && !moveOnce(!first)) {
          break;
        }
        var cur = lineObj.text.charAt(pos.ch) || "\n";
        var type = isWordChar(cur, helper) ? "w" : group && cur == "\n" ? "n" : !group || /\s/.test(cur) ? null : "p";
        if (group && !first && !type) {
          type = "s";
        }
        if (sawType && sawType != type) {
          if (dir < 0) {
            dir = 1;moveOnce();pos.sticky = "after";
          }
          break;
        }

        if (type) {
          sawType = type;
        }
        if (dir > 0 && !moveOnce(!first)) {
          break;
        }
      }
    }
    var result = skipAtomic(doc, pos, oldPos, origDir, true);
    if (equalCursorPos(oldPos, result)) {
      result.hitSide = true;
    }
    return result;
  }

  // For relative vertical movement. Dir may be -1 or 1. Unit can be
  // "page" or "line". The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosV(cm, pos, dir, unit) {
    var doc = cm.doc,
        x = pos.left,
        y;
    if (unit == "page") {
      var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      var moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3);
      y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount;
    } else if (unit == "line") {
      y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
    }
    var target;
    for (;;) {
      target = coordsChar(cm, x, y);
      if (!target.outside) {
        break;
      }
      if (dir < 0 ? y <= 0 : y >= doc.height) {
        target.hitSide = true;break;
      }
      y += dir * 5;
    }
    return target;
  }

  // CONTENTEDITABLE INPUT STYLE

  var ContentEditableInput = function (cm) {
    this.cm = cm;
    this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
    this.polling = new Delayed();
    this.composing = null;
    this.gracePeriod = false;
    this.readDOMTimeout = null;
  };

  ContentEditableInput.prototype.init = function (display) {
    var this$1 = this;

    var input = this,
        cm = input.cm;
    var div = input.div = display.lineDiv;
    disableBrowserMagic(div, cm.options.spellcheck);

    on(div, "paste", function (e) {
      if (signalDOMEvent(cm, e) || handlePaste(e, cm)) {
        return;
      }
      // IE doesn't fire input events, so we schedule a read for the pasted content in this way
      if (ie_version <= 11) {
        setTimeout(operation(cm, function () {
          return this$1.updateFromDOM();
        }), 20);
      }
    });

    on(div, "compositionstart", function (e) {
      this$1.composing = { data: e.data, done: false };
    });
    on(div, "compositionupdate", function (e) {
      if (!this$1.composing) {
        this$1.composing = { data: e.data, done: false };
      }
    });
    on(div, "compositionend", function (e) {
      if (this$1.composing) {
        if (e.data != this$1.composing.data) {
          this$1.readFromDOMSoon();
        }
        this$1.composing.done = true;
      }
    });

    on(div, "touchstart", function () {
      return input.forceCompositionEnd();
    });

    on(div, "input", function () {
      if (!this$1.composing) {
        this$1.readFromDOMSoon();
      }
    });

    function onCopyCut(e) {
      if (signalDOMEvent(cm, e)) {
        return;
      }
      if (cm.somethingSelected()) {
        setLastCopied({ lineWise: false, text: cm.getSelections() });
        if (e.type == "cut") {
          cm.replaceSelection("", null, "cut");
        }
      } else if (!cm.options.lineWiseCopyCut) {
        return;
      } else {
        var ranges = copyableRanges(cm);
        setLastCopied({ lineWise: true, text: ranges.text });
        if (e.type == "cut") {
          cm.operation(function () {
            cm.setSelections(ranges.ranges, 0, sel_dontScroll);
            cm.replaceSelection("", null, "cut");
          });
        }
      }
      if (e.clipboardData) {
        e.clipboardData.clearData();
        var content = lastCopied.text.join("\n");
        // iOS exposes the clipboard API, but seems to discard content inserted into it
        e.clipboardData.setData("Text", content);
        if (e.clipboardData.getData("Text") == content) {
          e.preventDefault();
          return;
        }
      }
      // Old-fashioned briefly-focus-a-textarea hack
      var kludge = hiddenTextarea(),
          te = kludge.firstChild;
      cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
      te.value = lastCopied.text.join("\n");
      var hadFocus = document.activeElement;
      selectInput(te);
      setTimeout(function () {
        cm.display.lineSpace.removeChild(kludge);
        hadFocus.focus();
        if (hadFocus == div) {
          input.showPrimarySelection();
        }
      }, 50);
    }
    on(div, "copy", onCopyCut);
    on(div, "cut", onCopyCut);
  };

  ContentEditableInput.prototype.prepareSelection = function () {
    var result = prepareSelection(this.cm, false);
    result.focus = this.cm.state.focused;
    return result;
  };

  ContentEditableInput.prototype.showSelection = function (info, takeFocus) {
    if (!info || !this.cm.display.view.length) {
      return;
    }
    if (info.focus || takeFocus) {
      this.showPrimarySelection();
    }
    this.showMultipleSelections(info);
  };

  ContentEditableInput.prototype.showPrimarySelection = function () {
    var sel = window.getSelection(),
        cm = this.cm,
        prim = cm.doc.sel.primary();
    var from = prim.from(),
        to = prim.to();

    if (cm.display.viewTo == cm.display.viewFrom || from.line >= cm.display.viewTo || to.line < cm.display.viewFrom) {
      sel.removeAllRanges();
      return;
    }

    var curAnchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
    var curFocus = domToPos(cm, sel.focusNode, sel.focusOffset);
    if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad && cmp(minPos(curAnchor, curFocus), from) == 0 && cmp(maxPos(curAnchor, curFocus), to) == 0) {
      return;
    }

    var view = cm.display.view;
    var start = from.line >= cm.display.viewFrom && posToDOM(cm, from) || { node: view[0].measure.map[2], offset: 0 };
    var end = to.line < cm.display.viewTo && posToDOM(cm, to);
    if (!end) {
      var measure = view[view.length - 1].measure;
      var map = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
      end = { node: map[map.length - 1], offset: map[map.length - 2] - map[map.length - 3] };
    }

    if (!start || !end) {
      sel.removeAllRanges();
      return;
    }

    var old = sel.rangeCount && sel.getRangeAt(0),
        rng;
    try {
      rng = range(start.node, start.offset, end.offset, end.node);
    } catch (e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible
    if (rng) {
      if (!gecko && cm.state.focused) {
        sel.collapse(start.node, start.offset);
        if (!rng.collapsed) {
          sel.removeAllRanges();
          sel.addRange(rng);
        }
      } else {
        sel.removeAllRanges();
        sel.addRange(rng);
      }
      if (old && sel.anchorNode == null) {
        sel.addRange(old);
      } else if (gecko) {
        this.startGracePeriod();
      }
    }
    this.rememberSelection();
  };

  ContentEditableInput.prototype.startGracePeriod = function () {
    var this$1 = this;

    clearTimeout(this.gracePeriod);
    this.gracePeriod = setTimeout(function () {
      this$1.gracePeriod = false;
      if (this$1.selectionChanged()) {
        this$1.cm.operation(function () {
          return this$1.cm.curOp.selectionChanged = true;
        });
      }
    }, 20);
  };

  ContentEditableInput.prototype.showMultipleSelections = function (info) {
    removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
    removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
  };

  ContentEditableInput.prototype.rememberSelection = function () {
    var sel = window.getSelection();
    this.lastAnchorNode = sel.anchorNode;this.lastAnchorOffset = sel.anchorOffset;
    this.lastFocusNode = sel.focusNode;this.lastFocusOffset = sel.focusOffset;
  };

  ContentEditableInput.prototype.selectionInEditor = function () {
    var sel = window.getSelection();
    if (!sel.rangeCount) {
      return false;
    }
    var node = sel.getRangeAt(0).commonAncestorContainer;
    return contains(this.div, node);
  };

  ContentEditableInput.prototype.focus = function () {
    if (this.cm.options.readOnly != "nocursor") {
      if (!this.selectionInEditor()) {
        this.showSelection(this.prepareSelection(), true);
      }
      this.div.focus();
    }
  };
  ContentEditableInput.prototype.blur = function () {
    this.div.blur();
  };
  ContentEditableInput.prototype.getField = function () {
    return this.div;
  };

  ContentEditableInput.prototype.supportsTouch = function () {
    return true;
  };

  ContentEditableInput.prototype.receivedFocus = function () {
    var input = this;
    if (this.selectionInEditor()) {
      this.pollSelection();
    } else {
      runInOp(this.cm, function () {
        return input.cm.curOp.selectionChanged = true;
      });
    }

    function poll() {
      if (input.cm.state.focused) {
        input.pollSelection();
        input.polling.set(input.cm.options.pollInterval, poll);
      }
    }
    this.polling.set(this.cm.options.pollInterval, poll);
  };

  ContentEditableInput.prototype.selectionChanged = function () {
    var sel = window.getSelection();
    return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset || sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset;
  };

  ContentEditableInput.prototype.pollSelection = function () {
    if (this.readDOMTimeout != null || this.gracePeriod || !this.selectionChanged()) {
      return;
    }
    var sel = window.getSelection(),
        cm = this.cm;
    // On Android Chrome (version 56, at least), backspacing into an
    // uneditable block element will put the cursor in that element,
    // and then, because it's not editable, hide the virtual keyboard.
    // Because Android doesn't allow us to actually detect backspace
    // presses in a sane way, this code checks for when that happens
    // and simulates a backspace press in this case.
    if (android && chrome && this.cm.options.gutters.length && isInGutter(sel.anchorNode)) {
      this.cm.triggerOnKeyDown({ type: "keydown", keyCode: 8, preventDefault: Math.abs });
      this.blur();
      this.focus();
      return;
    }
    if (this.composing) {
      return;
    }
    this.rememberSelection();
    var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
    var head = domToPos(cm, sel.focusNode, sel.focusOffset);
    if (anchor && head) {
      runInOp(cm, function () {
        setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);
        if (anchor.bad || head.bad) {
          cm.curOp.selectionChanged = true;
        }
      });
    }
  };

  ContentEditableInput.prototype.pollContent = function () {
    if (this.readDOMTimeout != null) {
      clearTimeout(this.readDOMTimeout);
      this.readDOMTimeout = null;
    }

    var cm = this.cm,
        display = cm.display,
        sel = cm.doc.sel.primary();
    var from = sel.from(),
        to = sel.to();
    if (from.ch == 0 && from.line > cm.firstLine()) {
      from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length);
    }
    if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine()) {
      to = Pos(to.line + 1, 0);
    }
    if (from.line < display.viewFrom || to.line > display.viewTo - 1) {
      return false;
    }

    var fromIndex, fromLine, fromNode;
    if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
      fromLine = lineNo(display.view[0].line);
      fromNode = display.view[0].node;
    } else {
      fromLine = lineNo(display.view[fromIndex].line);
      fromNode = display.view[fromIndex - 1].node.nextSibling;
    }
    var toIndex = findViewIndex(cm, to.line);
    var toLine, toNode;
    if (toIndex == display.view.length - 1) {
      toLine = display.viewTo - 1;
      toNode = display.lineDiv.lastChild;
    } else {
      toLine = lineNo(display.view[toIndex + 1].line) - 1;
      toNode = display.view[toIndex + 1].node.previousSibling;
    }

    if (!fromNode) {
      return false;
    }
    var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
    var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));
    while (newText.length > 1 && oldText.length > 1) {
      if (lst(newText) == lst(oldText)) {
        newText.pop();oldText.pop();toLine--;
      } else if (newText[0] == oldText[0]) {
        newText.shift();oldText.shift();fromLine++;
      } else {
        break;
      }
    }

    var cutFront = 0,
        cutEnd = 0;
    var newTop = newText[0],
        oldTop = oldText[0],
        maxCutFront = Math.min(newTop.length, oldTop.length);
    while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront)) {
      ++cutFront;
    }
    var newBot = lst(newText),
        oldBot = lst(oldText);
    var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0), oldBot.length - (oldText.length == 1 ? cutFront : 0));
    while (cutEnd < maxCutEnd && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
      ++cutEnd;
    }
    // Try to move start of change to start of selection if ambiguous
    if (newText.length == 1 && oldText.length == 1 && fromLine == from.line) {
      while (cutFront && cutFront > from.ch && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
        cutFront--;
        cutEnd++;
      }
    }

    newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "");
    newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");

    var chFrom = Pos(fromLine, cutFront);
    var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);
    if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
      replaceRange(cm.doc, newText, chFrom, chTo, "+input");
      return true;
    }
  };

  ContentEditableInput.prototype.ensurePolled = function () {
    this.forceCompositionEnd();
  };
  ContentEditableInput.prototype.reset = function () {
    this.forceCompositionEnd();
  };
  ContentEditableInput.prototype.forceCompositionEnd = function () {
    if (!this.composing) {
      return;
    }
    clearTimeout(this.readDOMTimeout);
    this.composing = null;
    this.updateFromDOM();
    this.div.blur();
    this.div.focus();
  };
  ContentEditableInput.prototype.readFromDOMSoon = function () {
    var this$1 = this;

    if (this.readDOMTimeout != null) {
      return;
    }
    this.readDOMTimeout = setTimeout(function () {
      this$1.readDOMTimeout = null;
      if (this$1.composing) {
        if (this$1.composing.done) {
          this$1.composing = null;
        } else {
          return;
        }
      }
      this$1.updateFromDOM();
    }, 80);
  };

  ContentEditableInput.prototype.updateFromDOM = function () {
    var this$1 = this;

    if (this.cm.isReadOnly() || !this.pollContent()) {
      runInOp(this.cm, function () {
        return regChange(this$1.cm);
      });
    }
  };

  ContentEditableInput.prototype.setUneditable = function (node) {
    node.contentEditable = "false";
  };

  ContentEditableInput.prototype.onKeyPress = function (e) {
    if (e.charCode == 0) {
      return;
    }
    e.preventDefault();
    if (!this.cm.isReadOnly()) {
      operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0);
    }
  };

  ContentEditableInput.prototype.readOnlyChanged = function (val) {
    this.div.contentEditable = String(val != "nocursor");
  };

  ContentEditableInput.prototype.onContextMenu = function () {};
  ContentEditableInput.prototype.resetPosition = function () {};

  ContentEditableInput.prototype.needsContentAttribute = true;

  function posToDOM(cm, pos) {
    var view = findViewForLine(cm, pos.line);
    if (!view || view.hidden) {
      return null;
    }
    var line = getLine(cm.doc, pos.line);
    var info = mapFromLineView(view, line, pos.line);

    var order = getOrder(line, cm.doc.direction),
        side = "left";
    if (order) {
      var partPos = getBidiPartAt(order, pos.ch);
      side = partPos % 2 ? "right" : "left";
    }
    var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
    result.offset = result.collapse == "right" ? result.end : result.start;
    return result;
  }

  function isInGutter(node) {
    for (var scan = node; scan; scan = scan.parentNode) {
      if (/CodeMirror-gutter-wrapper/.test(scan.className)) {
        return true;
      }
    }
    return false;
  }

  function badPos(pos, bad) {
    if (bad) {
      pos.bad = true;
    }return pos;
  }

  function domTextBetween(cm, from, to, fromLine, toLine) {
    var text = "",
        closing = false,
        lineSep = cm.doc.lineSeparator();
    function recognizeMarker(id) {
      return function (marker) {
        return marker.id == id;
      };
    }
    function close() {
      if (closing) {
        text += lineSep;
        closing = false;
      }
    }
    function addText(str) {
      if (str) {
        close();
        text += str;
      }
    }
    function walk(node) {
      if (node.nodeType == 1) {
        var cmText = node.getAttribute("cm-text");
        if (cmText != null) {
          addText(cmText || node.textContent.replace(/\u200b/g, ""));
          return;
        }
        var markerID = node.getAttribute("cm-marker"),
            range;
        if (markerID) {
          var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));
          if (found.length && (range = found[0].find(0))) {
            addText(getBetween(cm.doc, range.from, range.to).join(lineSep));
          }
          return;
        }
        if (node.getAttribute("contenteditable") == "false") {
          return;
        }
        var isBlock = /^(pre|div|p)$/i.test(node.nodeName);
        if (isBlock) {
          close();
        }
        for (var i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }
        if (isBlock) {
          closing = true;
        }
      } else if (node.nodeType == 3) {
        addText(node.nodeValue);
      }
    }
    for (;;) {
      walk(from);
      if (from == to) {
        break;
      }
      from = from.nextSibling;
    }
    return text;
  }

  function domToPos(cm, node, offset) {
    var lineNode;
    if (node == cm.display.lineDiv) {
      lineNode = cm.display.lineDiv.childNodes[offset];
      if (!lineNode) {
        return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true);
      }
      node = null;offset = 0;
    } else {
      for (lineNode = node;; lineNode = lineNode.parentNode) {
        if (!lineNode || lineNode == cm.display.lineDiv) {
          return null;
        }
        if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) {
          break;
        }
      }
    }
    for (var i = 0; i < cm.display.view.length; i++) {
      var lineView = cm.display.view[i];
      if (lineView.node == lineNode) {
        return locateNodeInLineView(lineView, node, offset);
      }
    }
  }

  function locateNodeInLineView(lineView, node, offset) {
    var wrapper = lineView.text.firstChild,
        bad = false;
    if (!node || !contains(wrapper, node)) {
      return badPos(Pos(lineNo(lineView.line), 0), true);
    }
    if (node == wrapper) {
      bad = true;
      node = wrapper.childNodes[offset];
      offset = 0;
      if (!node) {
        var line = lineView.rest ? lst(lineView.rest) : lineView.line;
        return badPos(Pos(lineNo(line), line.text.length), bad);
      }
    }

    var textNode = node.nodeType == 3 ? node : null,
        topNode = node;
    if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
      textNode = node.firstChild;
      if (offset) {
        offset = textNode.nodeValue.length;
      }
    }
    while (topNode.parentNode != wrapper) {
      topNode = topNode.parentNode;
    }
    var measure = lineView.measure,
        maps = measure.maps;

    function find(textNode, topNode, offset) {
      for (var i = -1; i < (maps ? maps.length : 0); i++) {
        var map = i < 0 ? measure.map : maps[i];
        for (var j = 0; j < map.length; j += 3) {
          var curNode = map[j + 2];
          if (curNode == textNode || curNode == topNode) {
            var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
            var ch = map[j] + offset;
            if (offset < 0 || curNode != textNode) {
              ch = map[j + (offset ? 1 : 0)];
            }
            return Pos(line, ch);
          }
        }
      }
    }
    var found = find(textNode, topNode, offset);
    if (found) {
      return badPos(found, bad);
    }

    // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems
    for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
      found = find(after, after.firstChild, 0);
      if (found) {
        return badPos(Pos(found.line, found.ch - dist), bad);
      } else {
        dist += after.textContent.length;
      }
    }
    for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
      found = find(before, before.firstChild, -1);
      if (found) {
        return badPos(Pos(found.line, found.ch + dist$1), bad);
      } else {
        dist$1 += before.textContent.length;
      }
    }
  }

  // TEXTAREA INPUT STYLE

  var TextareaInput = function (cm) {
    this.cm = cm;
    // See input.poll and input.reset
    this.prevInput = "";

    // Flag that indicates whether we expect input to appear real soon
    // now (after some event like 'keypress' or 'input') and are
    // polling intensively.
    this.pollingFast = false;
    // Self-resetting timeout for the poller
    this.polling = new Delayed();
    // Used to work around IE issue with selection being forgotten when focus moves away from textarea
    this.hasSelection = false;
    this.composing = null;
  };

  TextareaInput.prototype.init = function (display) {
    var this$1 = this;

    var input = this,
        cm = this.cm;

    // Wraps and hides input textarea
    var div = this.wrapper = hiddenTextarea();
    // The semihidden textarea that is focused when the editor is
    // focused, and receives input.
    var te = this.textarea = div.firstChild;
    display.wrapper.insertBefore(div, display.wrapper.firstChild);

    // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)
    if (ios) {
      te.style.width = "0px";
    }

    on(te, "input", function () {
      if (ie && ie_version >= 9 && this$1.hasSelection) {
        this$1.hasSelection = null;
      }
      input.poll();
    });

    on(te, "paste", function (e) {
      if (signalDOMEvent(cm, e) || handlePaste(e, cm)) {
        return;
      }

      cm.state.pasteIncoming = true;
      input.fastPoll();
    });

    function prepareCopyCut(e) {
      if (signalDOMEvent(cm, e)) {
        return;
      }
      if (cm.somethingSelected()) {
        setLastCopied({ lineWise: false, text: cm.getSelections() });
      } else if (!cm.options.lineWiseCopyCut) {
        return;
      } else {
        var ranges = copyableRanges(cm);
        setLastCopied({ lineWise: true, text: ranges.text });
        if (e.type == "cut") {
          cm.setSelections(ranges.ranges, null, sel_dontScroll);
        } else {
          input.prevInput = "";
          te.value = ranges.text.join("\n");
          selectInput(te);
        }
      }
      if (e.type == "cut") {
        cm.state.cutIncoming = true;
      }
    }
    on(te, "cut", prepareCopyCut);
    on(te, "copy", prepareCopyCut);

    on(display.scroller, "paste", function (e) {
      if (eventInWidget(display, e) || signalDOMEvent(cm, e)) {
        return;
      }
      cm.state.pasteIncoming = true;
      input.focus();
    });

    // Prevent normal selection in the editor (we handle our own)
    on(display.lineSpace, "selectstart", function (e) {
      if (!eventInWidget(display, e)) {
        e_preventDefault(e);
      }
    });

    on(te, "compositionstart", function () {
      var start = cm.getCursor("from");
      if (input.composing) {
        input.composing.range.clear();
      }
      input.composing = {
        start: start,
        range: cm.markText(start, cm.getCursor("to"), { className: "CodeMirror-composing" })
      };
    });
    on(te, "compositionend", function () {
      if (input.composing) {
        input.poll();
        input.composing.range.clear();
        input.composing = null;
      }
    });
  };

  TextareaInput.prototype.prepareSelection = function () {
    // Redraw the selection and/or cursor
    var cm = this.cm,
        display = cm.display,
        doc = cm.doc;
    var result = prepareSelection(cm);

    // Move the hidden textarea near the cursor to prevent scrolling artifacts
    if (cm.options.moveInputWithCursor) {
      var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
      var wrapOff = display.wrapper.getBoundingClientRect(),
          lineOff = display.lineDiv.getBoundingClientRect();
      result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10, headPos.top + lineOff.top - wrapOff.top));
      result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10, headPos.left + lineOff.left - wrapOff.left));
    }

    return result;
  };

  TextareaInput.prototype.showSelection = function (drawn) {
    var cm = this.cm,
        display = cm.display;
    removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
    removeChildrenAndAdd(display.selectionDiv, drawn.selection);
    if (drawn.teTop != null) {
      this.wrapper.style.top = drawn.teTop + "px";
      this.wrapper.style.left = drawn.teLeft + "px";
    }
  };

  // Reset the input to correspond to the selection (or to be empty,
  // when not typing and nothing is selected)
  TextareaInput.prototype.reset = function (typing) {
    if (this.contextMenuPending || this.composing) {
      return;
    }
    var cm = this.cm;
    if (cm.somethingSelected()) {
      this.prevInput = "";
      var content = cm.getSelection();
      this.textarea.value = content;
      if (cm.state.focused) {
        selectInput(this.textarea);
      }
      if (ie && ie_version >= 9) {
        this.hasSelection = content;
      }
    } else if (!typing) {
      this.prevInput = this.textarea.value = "";
      if (ie && ie_version >= 9) {
        this.hasSelection = null;
      }
    }
  };

  TextareaInput.prototype.getField = function () {
    return this.textarea;
  };

  TextareaInput.prototype.supportsTouch = function () {
    return false;
  };

  TextareaInput.prototype.focus = function () {
    if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
      try {
        this.textarea.focus();
      } catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM
    }
  };

  TextareaInput.prototype.blur = function () {
    this.textarea.blur();
  };

  TextareaInput.prototype.resetPosition = function () {
    this.wrapper.style.top = this.wrapper.style.left = 0;
  };

  TextareaInput.prototype.receivedFocus = function () {
    this.slowPoll();
  };

  // Poll for input changes, using the normal rate of polling. This
  // runs as long as the editor is focused.
  TextareaInput.prototype.slowPoll = function () {
    var this$1 = this;

    if (this.pollingFast) {
      return;
    }
    this.polling.set(this.cm.options.pollInterval, function () {
      this$1.poll();
      if (this$1.cm.state.focused) {
        this$1.slowPoll();
      }
    });
  };

  // When an event has just come in that is likely to add or change
  // something in the input textarea, we poll faster, to ensure that
  // the change appears on the screen quickly.
  TextareaInput.prototype.fastPoll = function () {
    var missed = false,
        input = this;
    input.pollingFast = true;
    function p() {
      var changed = input.poll();
      if (!changed && !missed) {
        missed = true;input.polling.set(60, p);
      } else {
        input.pollingFast = false;input.slowPoll();
      }
    }
    input.polling.set(20, p);
  };

  // Read input from the textarea, and update the document to match.
  // When something is selected, it is present in the textarea, and
  // selected (unless it is huge, in which case a placeholder is
  // used). When nothing is selected, the cursor sits after previously
  // seen text (can be empty), which is stored in prevInput (we must
  // not reset the textarea when typing, because that breaks IME).
  TextareaInput.prototype.poll = function () {
    var this$1 = this;

    var cm = this.cm,
        input = this.textarea,
        prevInput = this.prevInput;
    // Since this is called a *lot*, try to bail out as cheaply as
    // possible when it is clear that nothing happened. hasSelection
    // will be the case when there is a lot of text in the textarea,
    // in which case reading its value would be expensive.
    if (this.contextMenuPending || !cm.state.focused || hasSelection(input) && !prevInput && !this.composing || cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq) {
      return false;
    }

    var text = input.value;
    // If nothing changed, bail.
    if (text == prevInput && !cm.somethingSelected()) {
      return false;
    }
    // Work around nonsensical selection resetting in IE9/10, and
    // inexplicable appearance of private area unicode characters on
    // some key combos in Mac (#2689).
    if (ie && ie_version >= 9 && this.hasSelection === text || mac && /[\uf700-\uf7ff]/.test(text)) {
      cm.display.input.reset();
      return false;
    }

    if (cm.doc.sel == cm.display.selForContextMenu) {
      var first = text.charCodeAt(0);
      if (first == 0x200b && !prevInput) {
        prevInput = "\u200b";
      }
      if (first == 0x21da) {
        this.reset();return this.cm.execCommand("undo");
      }
    }
    // Find the part of the input that is actually new
    var same = 0,
        l = Math.min(prevInput.length, text.length);
    while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) {
      ++same;
    }

    runInOp(cm, function () {
      applyTextInput(cm, text.slice(same), prevInput.length - same, null, this$1.composing ? "*compose" : null);

      // Don't leave long text in the textarea, since it makes further polling slow
      if (text.length > 1000 || text.indexOf("\n") > -1) {
        input.value = this$1.prevInput = "";
      } else {
        this$1.prevInput = text;
      }

      if (this$1.composing) {
        this$1.composing.range.clear();
        this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"), { className: "CodeMirror-composing" });
      }
    });
    return true;
  };

  TextareaInput.prototype.ensurePolled = function () {
    if (this.pollingFast && this.poll()) {
      this.pollingFast = false;
    }
  };

  TextareaInput.prototype.onKeyPress = function () {
    if (ie && ie_version >= 9) {
      this.hasSelection = null;
    }
    this.fastPoll();
  };

  TextareaInput.prototype.onContextMenu = function (e) {
    var input = this,
        cm = input.cm,
        display = cm.display,
        te = input.textarea;
    var pos = posFromMouse(cm, e),
        scrollPos = display.scroller.scrollTop;
    if (!pos || presto) {
      return;
    } // Opera is difficult.

    // Reset the current text selection only if the click is done outside of the selection
    // and 'resetSelectionOnContextMenu' option is true.
    var reset = cm.options.resetSelectionOnContextMenu;
    if (reset && cm.doc.sel.contains(pos) == -1) {
      operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);
    }

    var oldCSS = te.style.cssText,
        oldWrapperCSS = input.wrapper.style.cssText;
    input.wrapper.style.cssText = "position: absolute";
    var wrapperBox = input.wrapper.getBoundingClientRect();
    te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
    var oldScrollY;
    if (webkit) {
      oldScrollY = window.scrollY;
    } // Work around Chrome issue (#2712)
    display.input.focus();
    if (webkit) {
      window.scrollTo(null, oldScrollY);
    }
    display.input.reset();
    // Adds "Select all" to context menu in FF
    if (!cm.somethingSelected()) {
      te.value = input.prevInput = " ";
    }
    input.contextMenuPending = true;
    display.selForContextMenu = cm.doc.sel;
    clearTimeout(display.detectingSelectAll);

    // Select-all will be greyed out if there's nothing to select, so
    // this adds a zero-width space so that we can later check whether
    // it got selected.
    function prepareSelectAllHack() {
      if (te.selectionStart != null) {
        var selected = cm.somethingSelected();
        var extval = "\u200b" + (selected ? te.value : "");
        te.value = "\u21da"; // Used to catch context-menu undo
        te.value = extval;
        input.prevInput = selected ? "" : "\u200b";
        te.selectionStart = 1;te.selectionEnd = extval.length;
        // Re-set this, in case some other handler touched the
        // selection in the meantime.
        display.selForContextMenu = cm.doc.sel;
      }
    }
    function rehide() {
      input.contextMenuPending = false;
      input.wrapper.style.cssText = oldWrapperCSS;
      te.style.cssText = oldCSS;
      if (ie && ie_version < 9) {
        display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos);
      }

      // Try to detect the user choosing select-all
      if (te.selectionStart != null) {
        if (!ie || ie && ie_version < 9) {
          prepareSelectAllHack();
        }
        var i = 0,
            poll = function () {
          if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 && te.selectionEnd > 0 && input.prevInput == "\u200b") {
            operation(cm, selectAll)(cm);
          } else if (i++ < 10) {
            display.detectingSelectAll = setTimeout(poll, 500);
          } else {
            display.selForContextMenu = null;
            display.input.reset();
          }
        };
        display.detectingSelectAll = setTimeout(poll, 200);
      }
    }

    if (ie && ie_version >= 9) {
      prepareSelectAllHack();
    }
    if (captureRightClick) {
      e_stop(e);
      var mouseup = function () {
        off(window, "mouseup", mouseup);
        setTimeout(rehide, 20);
      };
      on(window, "mouseup", mouseup);
    } else {
      setTimeout(rehide, 50);
    }
  };

  TextareaInput.prototype.readOnlyChanged = function (val) {
    if (!val) {
      this.reset();
    }
    this.textarea.disabled = val == "nocursor";
  };

  TextareaInput.prototype.setUneditable = function () {};

  TextareaInput.prototype.needsContentAttribute = false;

  function fromTextArea(textarea, options) {
    options = options ? copyObj(options) : {};
    options.value = textarea.value;
    if (!options.tabindex && textarea.tabIndex) {
      options.tabindex = textarea.tabIndex;
    }
    if (!options.placeholder && textarea.placeholder) {
      options.placeholder = textarea.placeholder;
    }
    // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.
    if (options.autofocus == null) {
      var hasFocus = activeElt();
      options.autofocus = hasFocus == textarea || textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {
      textarea.value = cm.getValue();
    }

    var realSubmit;
    if (textarea.form) {
      on(textarea.form, "submit", save);
      // Deplorable hack to make the submit method do the right thing.
      if (!options.leaveSubmitMethodAlone) {
        var form = textarea.form;
        realSubmit = form.submit;
        try {
          var wrappedSubmit = form.submit = function () {
            save();
            form.submit = realSubmit;
            form.submit();
            form.submit = wrappedSubmit;
          };
        } catch (e) {}
      }
    }

    options.finishInit = function (cm) {
      cm.save = save;
      cm.getTextArea = function () {
        return textarea;
      };
      cm.toTextArea = function () {
        cm.toTextArea = isNaN; // Prevent this from being ran twice
        save();
        textarea.parentNode.removeChild(cm.getWrapperElement());
        textarea.style.display = "";
        if (textarea.form) {
          off(textarea.form, "submit", save);
          if (typeof textarea.form.submit == "function") {
            textarea.form.submit = realSubmit;
          }
        }
      };
    };

    textarea.style.display = "none";
    var cm = CodeMirror(function (node) {
      return textarea.parentNode.insertBefore(node, textarea.nextSibling);
    }, options);
    return cm;
  }

  function addLegacyProps(CodeMirror) {
    CodeMirror.off = off;
    CodeMirror.on = on;
    CodeMirror.wheelEventPixels = wheelEventPixels;
    CodeMirror.Doc = Doc;
    CodeMirror.splitLines = splitLinesAuto;
    CodeMirror.countColumn = countColumn;
    CodeMirror.findColumn = findColumn;
    CodeMirror.isWordChar = isWordCharBasic;
    CodeMirror.Pass = Pass;
    CodeMirror.signal = signal;
    CodeMirror.Line = Line;
    CodeMirror.changeEnd = changeEnd;
    CodeMirror.scrollbarModel = scrollbarModel;
    CodeMirror.Pos = Pos;
    CodeMirror.cmpPos = cmp;
    CodeMirror.modes = modes;
    CodeMirror.mimeModes = mimeModes;
    CodeMirror.resolveMode = resolveMode;
    CodeMirror.getMode = getMode;
    CodeMirror.modeExtensions = modeExtensions;
    CodeMirror.extendMode = extendMode;
    CodeMirror.copyState = copyState;
    CodeMirror.startState = startState;
    CodeMirror.innerMode = innerMode;
    CodeMirror.commands = commands;
    CodeMirror.keyMap = keyMap;
    CodeMirror.keyName = keyName;
    CodeMirror.isModifierKey = isModifierKey;
    CodeMirror.lookupKey = lookupKey;
    CodeMirror.normalizeKeyMap = normalizeKeyMap;
    CodeMirror.StringStream = StringStream;
    CodeMirror.SharedTextMarker = SharedTextMarker;
    CodeMirror.TextMarker = TextMarker;
    CodeMirror.LineWidget = LineWidget;
    CodeMirror.e_preventDefault = e_preventDefault;
    CodeMirror.e_stopPropagation = e_stopPropagation;
    CodeMirror.e_stop = e_stop;
    CodeMirror.addClass = addClass;
    CodeMirror.contains = contains;
    CodeMirror.rmClass = rmClass;
    CodeMirror.keyNames = keyNames;
  }

  // EDITOR CONSTRUCTOR

  defineOptions(CodeMirror);

  addEditorMethods(CodeMirror);

  // Set up methods on CodeMirror's prototype to redirect to the editor's document.
  var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");
  for (var prop in Doc.prototype) {
    if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0) {
      CodeMirror.prototype[prop] = function (method) {
        return function () {
          return method.apply(this.doc, arguments);
        };
      }(Doc.prototype[prop]);
    }
  }

  eventMixin(Doc);

  // INPUT HANDLING

  CodeMirror.inputStyles = { "textarea": TextareaInput, "contenteditable": ContentEditableInput

    // MODE DEFINITION AND QUERYING

    // Extra arguments are stored as the mode's dependencies, which is
    // used by (legacy) mechanisms like loadmode.js to automatically
    // load a mode. (Preferred mechanism is the require/define calls.)
  };CodeMirror.defineMode = function (name /*, mode, …*/) {
    if (!CodeMirror.defaults.mode && name != "null") {
      CodeMirror.defaults.mode = name;
    }
    defineMode.apply(this, arguments);
  };

  CodeMirror.defineMIME = defineMIME;

  // Minimal default mode.
  CodeMirror.defineMode("null", function () {
    return { token: function (stream) {
        return stream.skipToEnd();
      } };
  });
  CodeMirror.defineMIME("text/plain", "null");

  // EXTENSIONS

  CodeMirror.defineExtension = function (name, func) {
    CodeMirror.prototype[name] = func;
  };
  CodeMirror.defineDocExtension = function (name, func) {
    Doc.prototype[name] = func;
  };

  CodeMirror.fromTextArea = fromTextArea;

  addLegacyProps(CodeMirror);

  CodeMirror.version = "5.31.0";

  return CodeMirror;
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(0), __webpack_require__(3), __webpack_require__(4), __webpack_require__(5), __webpack_require__(6), __webpack_require__(7), __webpack_require__(8), __webpack_require__(9), __webpack_require__(10), __webpack_require__(11), __webpack_require__(12), __webpack_require__(13), __webpack_require__(14), __webpack_require__(15), __webpack_require__(16), __webpack_require__(17)], __WEBPACK_AMD_DEFINE_RESULT__ = function (audioStreamSource, CodeMirror, CodeMirrorSimpleScrollbars, colorUtils, cssParse, glsl, tweeny, twgl, Notifier, fullScreen, io, KeyRouter, ListenerManager, misc, strings, shaders, typedArrayCopyWithinPolyfill // eslint-disable-line
) {

  "use strict";

  // There's really no good way to tell which browsers fail.
  // Right now Safari doesn't expose AudioContext (it's still webkitAudioContext)
  // so my hope is whenever they get around to actually supporting the 3+ year old
  // standard that things will actually work.

  var shittyBrowser = false; // window.AudioContext === undefined && /iPhone|iPad|iPod/.test(navigator.userAgent);
  var isMobile = false; // window.navigator.userAgent.match(/Android|iPhone|iPad|iPod|Windows Phone/i);
  var $ = document.querySelector.bind(document);
  var gl;
  var m4 = twgl.m4;
  var s = {
    screenshotCanvas: document.createElement("canvas"),
    restoreKey: "restore",
    show: !isMobile,
    inIframe: window.self !== window.top,
    running: true, // true vs.stop has not been called (this is inside the website)
    trackNdx: 0, // next track to play
    currentTrackNdx: 0, // track currently playing
    playlist: [],
    // if true music will repeat whatever playlist is currently running
    // instead of replacing it with the one from settings
    lockMusic: false,
    // set to false to just once, not interrupt music
    // This is used because then the route changes like from "/new/" to "/art/id"
    // meteor will re-render the scene with the new route.
    // but for us it's not really a new route.
    interruptMusic: true,
    // true of we already started the audio system and don't need
    // a gesture to start it.
    audioStarted: false
  };
  s.screenshotCanvas.width = 600;
  s.screenshotCanvas.height = 336;

  function getShader(id) {
    return shaders[id];
  }

  function randomElement(array) {
    return array[Math.random() * array.length | 0];
  }

  function ProgramManager(gl) {
    var _handlers = {};
    var _programInfo;
    var _queue = [];
    var _timeout = 500;
    var _vs;
    var _fs;
    var _prg;
    var _src;
    var _processing;

    function _emit(event) {
      var handler = _handlers[event];
      if (handler) {
        handler.apply(null, Array.prototype.slice.call(arguments, 1));
      }
    }

    function _compileShader(type, src) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    }

    function _linkProgram(vs, fs) {
      var prg = gl.createProgram();
      gl.attachShader(prg, vs);
      gl.attachShader(prg, fs);
      gl.linkProgram(prg);
      return prg;
    }

    function _getShaderResults(shader) {
      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!success) {
        var errors = gl.getShaderInfoLog(shader);
        console.error(errors);
        return errors;
      }
    }

    function _getProgramResults(prg) {
      var success = gl.getProgramParameter(prg, gl.LINK_STATUS);
      if (!success) {
        var errors = gl.getProgramInfoLog(prg);
        console.error(errors);
        return errors;
      }
    }

    function _checkResults() {
      _processing = false;

      var vsErrors = _getShaderResults(_vs);
      var fsErrors = _getShaderResults(_fs);
      var prgErrors = _getProgramResults(_prg);

      // We don't need the shaders. If successful
      // they are linked in the program. In failure
      // we'll make new ones anyway.
      gl.deleteShader(_fs);
      gl.deleteShader(_vs);

      if (vsErrors === undefined && fsErrors === undefined && prgErrors === undefined) {
        // success!
        _emit('success', _src);
        if (_programInfo) {
          gl.deleteProgram(_programInfo.program);
        }
        _programInfo = twgl.createProgramInfoFromProgram(gl, _prg);
      } else {
        // failure
        _emit('failure', [vsErrors || '', fsErrors || '', prgErrors || ''].join("\n"));
        gl.deleteProgram(_prg);
      }
      _processQueue();
    }

    function _processQueue() {
      if (_processing || !_queue.length) {
        return;
      }
      _processing = true;
      _src = _queue.shift();
      _vs = _compileShader(gl.VERTEX_SHADER, _src.vsrc);
      _fs = _compileShader(gl.FRAGMENT_SHADER, _src.fsrc);
      _prg = _linkProgram(_vs, _fs);
      // make sure the GPU driver executes this commands now.
      gl.flush();
      // check the results some time later.
      // this gives us a chance at async compilcation.
      setTimeout(_checkResults, _timeout);
    }

    this.on = function (event, handler) {
      _handlers[event] = handler;
    };

    // Haha! userData, just like C++. Grrr!
    this.compile = function (vsrc, fsrc, userData) {
      _queue = [{ vsrc: vsrc, fsrc: fsrc, userData: userData }];
      _processQueue();
    };

    this.getProgramInfo = function () {
      return _programInfo;
    };

    this.clear = function () {
      _programInfo = undefined;
    };

    this.isProcessing = function () {
      return _processing;
    };
  }

  function HistoryTexture(gl, options) {
    var _width = options.width;
    var type = options.type || gl.UNSIGNED_BYTE;
    var format = options.format || gl.RGBA;
    var Ctor = twgl.getTypedArrayTypeForGLType(type);
    var numComponents = twgl.getNumComponentsForFormat(format);
    var size = _width * numComponents;
    var _buffer = new Ctor(size);
    var _texSpec = {
      src: _buffer,
      height: 1,
      min: options.min || gl.LINEAR,
      mag: options.mag || gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
      format: format,
      auto: false // don't set tex params or call genmipmap
    };
    var _tex = twgl.createTexture(gl, _texSpec);

    var _length = options.length;
    var _historyAttachments = [{
      format: options.historyFormat || gl.RGBA,
      type: type,
      mag: options.mag || gl.LINEAR,
      min: options.min || gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE
    }];

    var _srcFBI = twgl.createFramebufferInfo(gl, _historyAttachments, _width, _length);
    var _dstFBI = twgl.createFramebufferInfo(gl, _historyAttachments, _width, _length);

    var _historyUniforms = {
      u_mix: 0,
      u_mult: 1,
      u_matrix: m4.identity(),
      u_texture: undefined
    };

    this.buffer = _buffer;

    this.update = function update() {
      var temp = _srcFBI;
      _srcFBI = _dstFBI;
      _dstFBI = temp;

      twgl.setTextureFromArray(gl, _tex, _texSpec.src, _texSpec);

      gl.useProgram(s.historyProgramInfo.program);
      twgl.bindFramebufferInfo(gl, _dstFBI);

      // copy from historySrc to historyDst one pixel down
      m4.translation([0, 2 / _length, 0], _historyUniforms.u_matrix);
      _historyUniforms.u_mix = 1;
      _historyUniforms.u_texture = _srcFBI.attachments[0];

      twgl.setUniforms(s.historyProgramInfo, _historyUniforms);
      twgl.drawBufferInfo(gl, s.quadBufferInfo);

      // copy audio data into top row of historyDst
      _historyUniforms.u_mix = format === gl.ALPHA ? 0 : 1;
      _historyUniforms.u_texture = _tex;
      m4.translation([0, -(_length - 0.5) / _length, 0], _historyUniforms.u_matrix);
      m4.scale(_historyUniforms.u_matrix, [1, 1 / _length, 1], _historyUniforms.u_matrix);

      twgl.setUniforms(s.historyProgramInfo, _historyUniforms);
      twgl.drawBufferInfo(gl, s.quadBufferInfo);
    };

    this.getTexture = function getTexture() {
      return _dstFBI.attachments[0];
    };
  }

  function CPUHistoryTexture(gl, options) {
    var _width = options.width;
    var type = options.type || gl.UNSIGNED_BYTE;
    var format = options.format || gl.RGBA;
    var Ctor = twgl.getTypedArrayTypeForGLType(type);
    var numComponents = twgl.getNumComponentsForFormat(format);
    var _length = options.length;
    var _rowSize = _width * numComponents;
    var _size = _rowSize * _length;
    var _buffer = new Ctor(_size);
    var _texSpec = {
      src: _buffer,
      height: _length,
      min: options.min || gl.LINEAR,
      mag: options.mag || gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
      format: format,
      auto: false // don't set tex params or call genmipmap
    };
    var _tex = twgl.createTexture(gl, _texSpec);

    this.buffer = _buffer;

    this.update = function update() {
      // Upload the latest
      twgl.setTextureFromArray(gl, _tex, _texSpec.src, _texSpec);

      // scroll the data
      _buffer.copyWithin(_rowSize, 0, _size - _rowSize);
    };

    this.getTexture = function getTexture() {
      return _tex;
    };
  }

  function checkCanUseFloat(gl) {
    return gl.getExtension("OES_texture_float") ? true : false;
  }

  function checkCanRenderToFloat(gl) {
    // Can we render to float?
    var testAttachments = [{
      format: gl.RGBA,
      type: gl.FLOAT,
      mag: gl.NEAREST,
      min: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE
    }];
    var testFBI = twgl.createFramebufferInfo(gl, testAttachments, 1, 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, testFBI.framebuffer);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  var storage;
  if (!s.inIframe) {
    try {
      storage = window.localStorage; // apparently you can get a security error for this
    } catch (e) {// eslint-disable-line
    }
  }
  storage = storage || {
    getItem: function () {},
    setItem: function () {},
    removeItem: function () {}
  };

  function toggleMusic(setPauseFn) {
    setPauseFn = setPauseFn || function () {};
    if (!s.streamSource) {
      return false;
    }

    if (s.streamSource.isPlaying()) {
      s.streamSource.stop();
      if (s.inIframe) {
        setPauseFn(true);
      }
    } else {
      s.streamSource.play();
      var source = s.streamSource.getSource();
      if (source) {
        source.connect(s.analyser);
      }
      if (s.inIframe) {
        setPauseFn(false);
      }
    }
  }

  function getMusicState() {
    return s.streamSource ? s.streamSource.isPlaying() : false;
  }

  function isMic(track) {
    return track === 'mic' || track === 'feedback';
  }

  function VS() {
    var _pauseIcon = "❚❚";
    var _playIcon = "▶";
    var editorElem = $("#editor");
    var editorWrapElem = $("#editorWrap");
    // var artElem = $("#art");
    var commentAreaElem = $("#commentarea");
    var centerSizeElem = $("#centerSize");
    var commentWrapElem = $("#commentWrap");
    var uimodeElem = $("#uimode");
    var uimodeDropdownElem = $("#toolbar .uimodedropdown");
    var savingElem = $("#saving");
    var stopElem = $("#stop");
    var stopIconElem = $("#stop .stop-icon");
    var goIconElem = $("#stop .go-icon");
    var soundElem = $("#sound");
    var soundTime = $("#soundTime");
    var soundLinkElem = $("#soundLink");
    var soundLinkNode = misc.createTextNode(soundLinkElem);
    var soundcloudElem = $("#soundcloud");
    var bandLinkElem = $("#bandLink");
    var bandLinkNode = misc.createTextNode(bandLinkElem);
    var soundTimeElem = $("#soundTime");
    var lockElem = $("#toolbar .playlock");
    var lockElemImg = $("#toolbar .playlock img");
    var playElems = Array.prototype.slice.call(document.querySelectorAll(".play"));
    var playNodes = playElems.map(function (playElem) {
      var pn = misc.createTextNode(playElem, _playIcon);
      return pn;
    });
    var fullScreenElem = $("#vsa .fullscreen");
    // var playElem2 = $("#vsa .play");
    var listenerManager = new ListenerManager();
    var on = listenerManager.on.bind(listenerManager);
    var remove = listenerManager.remove.bind(listenerManager);
    var settings = {
      lineSize: 1,
      backgroundColor: [0, 0, 0, 1]
    };

    if (s.inIframe) {
      $("#loading").style.display = "";
    }

    var g = {
      maxCount: 100000,
      mode: undefined, //gl.LINES,
      time: 0,
      mouse: [0, 0],
      shaderSuccess: false,
      vsHeader: getShader("vs-header"),
      fSource: getShader("fs"),
      errorLines: [],
      soundCloudClientId: '3f4914e324f9caeb23c521f0f1835a60',
      origSettings: { shader: "" },
      pauseOnBlur: window.location.hostname === "localhost",
      saveable: false,
      pause: false,
      touches: [],
      animRects: []
    };
    g.errorLineNumberOffset = -g.vsHeader.split("\n").length;

    var q = misc.parseUrlQuery();
    if (q.pauseOnBlur !== undefined) {
      g.pauseOnBlur = q.pauseOnBlur.toLowerCase() === "true";
    }
    if (q.pause) {
      g.pauseOnBlur = true;
      g.pause = true;
    }

    if (q.mobile) {
      isMobile = true;
      s.show = true;
    }

    if (s.inIframe) {
      $("#uicontainer").className = "iframe";
    }

    var mainRE = /(void[ \t\n\r]+main[ \t\n\r]*\([ \t\n\r]*\)[ \t\n\r]\{)/g;
    function applyTemplateToShader(src) {
      var vsrc = g.vsHeader + src;
      vsrc = vsrc.replace(mainRE, function (m) {
        return m + "gl_PointSize=1.0;";
      });
      var lastBraceNdx = vsrc.lastIndexOf("}");
      if (lastBraceNdx >= 0) {
        var before = vsrc.substr(0, lastBraceNdx);
        var after = vsrc.substr(lastBraceNdx);
        vsrc = before + ";gl_PointSize = max(0., gl_PointSize*_dontUseDirectly_pointSize);" + after;
      }
      return vsrc;
    }

    on(fullScreenElem, 'click', function () /* e */{
      if (fullScreen.isFullScreen()) {
        fullScreen.cancelFullScreen();
      } else {
        fullScreen.requestFullScreen(document.body);
      }
    });

    if (gl) {
      editorElem.parentNode.insertBefore(s.editorElem, editorElem);
      editorElem.parentNode.removeChild(editorElem);
      editorElem = s.editorElem;
    } else {
      gl = twgl.getWebGLContext(document.createElement("canvas"), { alpha: false });
      if (!gl) {
        $("#nogl").style.display = "";
        return;
      }

      s.canUseFloat = checkCanUseFloat(gl);
      s.canFilterFloat = s.canUseFloat && gl.getExtension("OES_texture_float_linear");
      s.canRenderToFloat = checkCanRenderToFloat(gl);
      console.log("can " + (s.canUseFloat ? "" : "not ") + "use floating point textures");
      console.log("can " + (s.canRenderToFloat ? "" : "not ") + "render to floating point textures");
      if (s.canUseFloat) {
        console.log("can " + (s.canFilterFloat ? "" : "not ") + "filter floating point textures");
      }

      s.sets = {
        default: {
          num: 10000,
          mode: "LINES",
          sound: "",
          lineSize: "NATIVE",
          backgroundColor: [0, 0, 0, 1],
          shader: getShader("vs").trim()
        },
        audio: {
          num: 5000,
          mode: "LINES",
          sound: "https://soundcloud.com/caseandpoint/case-point-upgrade-free-download",
          lineSize: "NATIVE",
          backgroundColor: [0, 0, 0, 1],
          shader: getShader("vs2").trim()
        },
        audio2: {
          num: 16384,
          mode: "LINES",
          sound: "https://soundcloud.com/chibi-tech/lolitazia-season",
          lineSize: "NATIVE",
          backgroundColor: [0, 0, 0, 1],
          shader: getShader("vs3").trim()
        },
        spiro: {
          num: 20000,
          mode: "LINES",
          sound: "",
          lineSize: "NATIVE",
          backgroundColor: [1, 1, 1, 1],
          shader: getShader("vs4").trim()
        }
      };

      g.mode = gl.LINES;
      s.context = new (window.AudioContext || window.webkitAudioContext)();
      s.analyser = s.context.createAnalyser();
      s.gainNode = s.context.createGain();
      s.processor = s.context.createScriptProcessor(1024, 1, 1);
      s.analyser.connect(s.gainNode);
      s.gainNode.connect(s.context.destination);
      s.analyser.connect(s.processor);
      s.processor.onaudioprocess = saveMaxSample;
      s.processor.connect(s.context.destination);

      function saveMaxSample(e) {
        const buf = e.inputBuffer.getChannelData(0);
        const len = buf.length;
        var last = buf[0];
        var max = buf[0];
        var maxDif = 0;
        var sum = 0;
        for (var ii = 1; ii < len; ++ii) {
          var v = buf[ii];
          if (v > max) {
            v = max;
          }
          var dif = Math.abs(v - last);
          if (dif > maxDif) {
            maxDif = dif;
          }
          sum += v * v;
        }
        s.maxSample = max;
        s.maxDif = maxDif;
        s.sum = Math.sqrt(sum / len);
      }

      s.rectProgramInfo = twgl.createProgramInfo(gl, [getShader("rect-vs"), getShader("rect-fs")]);
      s.historyProgramInfo = twgl.createProgramInfo(gl, [getShader("history-vs"), getShader("history-fs")]);
      s.waveProgramInfo = twgl.createProgramInfo(gl, [applyTemplateToShader(getShader("wave-vs")), getShader("fs")]);

      s.rectUniforms = {
        u_color: [0, 0, 0, 0.7],
        u_matrix: m4.identity()
      };

      var saveArt = function (e) {
        e.preventDefault();
        if (g.saveFn) {
          g.saveFn();
        }
      };

      s.keyRouter = new KeyRouter();
      if (navigator.platform.match("Mac")) {
        s.keyRouter.on(83, 'm', saveArt);
      } else {
        s.keyRouter.on(83, 'c', saveArt);
      }

      var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      s.numSoundSamples = Math.min(maxTextureSize, s.analyser.frequencyBinCount);
      s.numHistorySamples = 60 * 4; // 4 seconds;

      s.volumeHistory = new HistoryTexture(gl, {
        width: 4,
        length: s.numHistorySamples,
        format: gl.ALPHA
      });

      s.soundHistory = new HistoryTexture(gl, {
        width: s.numSoundSamples,
        length: s.numHistorySamples,
        format: gl.ALPHA
      });

      if (s.canUseFloat && s.canRenderToFloat) {
        var floatFilter = s.canFilterFloat ? gl.LINEAR : gl.NEAREST;
        s.floatSoundHistory = new HistoryTexture(gl, {
          width: s.numSoundSamples,
          length: s.numHistorySamples,
          min: floatFilter,
          mag: floatFilter,
          format: gl.ALPHA,
          type: gl.FLOAT
        });
      }

      s.touchColumns = 32;
      s.touchHistory = new (s.canRenderToFloat ? HistoryTexture : CPUHistoryTexture)(gl, {
        width: s.touchColumns,
        length: s.numHistorySamples,
        type: s.canUseFloat ? gl.FLOAT : gl.UNSIGNED_BYTE,
        min: gl.NEAREST,
        mag: gl.NEAREST
      });

      var count = new Float32Array(g.maxCount);
      for (var ii = 0; ii < count.length; ++ii) {
        count[ii] = ii;
      }
      var arrays = {
        vertexId: { data: count, numComponents: 1 }
      };
      s.countBufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
      s.quadBufferInfo = twgl.createBufferInfoFromArrays(gl, {
        position: { numComponents: 2, data: [-1, -1, 1, -1, -1, 1, 1, 1] },
        texcoord: [0, 0, 1, 0, 0, 1, 1, 1],
        indices: [0, 1, 2, 2, 1, 3]
      });

      s.sc = new function () {
        //var _clientId;
        var _authToken;
        var _authTokenExpireTime;
        var log = function () {
          console.log.apply(console, arguments);
        };
        var getCurrentTimeInSeconds = function getCurrentTimeInSeconds() {
          return Date.now() * 0.001;
        };
        var isSoundCloudTokenValid = function isSoundCloudTokenValid() {
          if (!_authToken) {
            return false;
          }
          return getCurrentTimeInSeconds() > _authTokenExpireTime;
        };
        var getSoundCloudToken = function getSoundCloudToken(callback) {
          if (isSoundCloudTokenValid()) {
            log("have existing token:", _authToken);
            setTimeout(function () {
              callback(null, _authToken);
            });
            return;
          }
          const u = new URL('/token?format=json', window.location.href);
          //console.log(u.href);
          fetch(u.href).then(res => res.json()).then(data => {
            log("response from token:", JSON.stringify(data));
            if (data.error) {
              callback(error);
              return;
            }
            _authToken = data.token;
            _authTokenExpireTime = data.expires_in + getCurrentTimeInSeconds() - 10;
            callback(null, _authToken);
          }).catch(err => {
            log("error:", err);
            callback(err);
          });
        };
        var sendJSON = function sendJSON(url, data, callback, options = {}) {
          getSoundCloudToken(function (error, token) {
            console.log("gsct:", error, token);
            if (error) {
              callback(error);
              return;
            }
            const newOptions = Object.assign({}, options);
            newOptions.headers = Object.assign({}, options.headers || {});
            newOptions.headers.Authorization = `OAuth ${token}`;
            io.sendJSON(url, data, callback, newOptions);
          });
        };
        this.getRealStreamURL = function sendHEAD(url, callback) {
          fetch(`/track_url?${new URLSearchParams({ format: 'json', url }).toString()}`).then(res => res.json()).then(data => {
            if (data.error) {
              throw data.error;
            }
            callback(null, data.url);
          }).catch(err => callback(err));
        };

        this.initialize = function () /*options*/{
          //_clientId = options.client_id;
        };
        this.get = function (url, options, callback) {

          options = JSON.parse(JSON.stringify(options));
          var provideResult = function (fn) {
            //options.client_id = _clientId;
            options.format = "json";
            options["_status_code_map[302]"] = 200;
            var scUrl = "https://api.soundcloud.com" + url + misc.objectToSearchString(options);

            var handleResult = function (err, obj) {
              if (!err) {
                if (obj.status && obj.status.substr(0, 3) === "302" && obj.location) {
                  sendJSON(obj.location, {}, handleResult, { method: "GET" });
                  return;
                }
              }
              fn(obj, err);
            };

            sendJSON(scUrl, {}, handleResult, {
              method: "GET"
            });
          };

          if (callback) {
            provideResult(callback);
          } else {
            return {
              then: function (fn) {
                provideResult(fn);
                return {
                  catch: function () {}
                };
              }
            };
          }
        };
      }();

      var longName = "This is a really long name that might mess up formatting so let's use it to test that long names don't totally mess up formatting just so we have some idea of how messed up things can get if we don't set any limits";
      var music = [{
        title: q.long ? longName : "DOCTOR VOX - Level Up [Argofox]",
        streamable: true,
        stream_url: "/static/resources/sounds/DOCTOR VOX - Level Up - lofi.mp3",
        permalink_url: "http://soundcloud.com/argofox",
        user: {
          username: q.long ? longName : "Argofox Creative Commons",
          permalink_url: "http://soundcloud.com/argofox"
        }
      }, {
        title: q.long ? longName : "Cab Calloway/Andrews Sisters Mashup",
        streamable: true,
        stream_url: "/static/resources/sounds/doin' the rumba 4 - lofi.mp3",
        permalink_url: "https://soundcloud.com/ecklecticmick/doin-the-rumba",
        user: {
          username: q.long ? longName : "DJ Ecklectic Mick",
          permalink_url: "https://soundcloud.com/ecklecticmick"
        }
      }, {
        title: q.long ? longName : "Oh The Bass! (feat Fab Marq )",
        streamable: true,
        stream_url: "/static/resources/sounds/Oh The Bass! - lofi.mp3",
        permalink_url: "https://soundcloud.com/djloveboat/oh-the-bass-feat-fab-marq",
        user: {
          username: q.long ? longName : "djloveboat",
          permalink_url: "https://soundcloud.com/djloveboat"
        }
      }];

      if (!s.sc || shittyBrowser || isMobile || q.local) {
        s.sc = new function () {
          function noop() {}
          this.initialize = noop;
          this.get = function (url, options, callback) {

            var provideResult = function (fn) {
              setTimeout(function () {
                fn(randomElement(music));
              }, 1);
            };

            if (callback) {
              provideResult(callback);
            } else {
              return {
                then: function (fn) {
                  provideResult(fn);
                  return {
                    catch: function () {}
                  };
                }
              };
            }
          };
        }();
      }

      s.sc.initialize({
        client_id: g.soundCloudClientId
      });

      s.streamSource = audioStreamSource.create({
        context: s.context,
        autoPlay: true,
        crossOrigin: "anonymous"
      });

      s.programManager = new ProgramManager(gl);

      s.editorElem = editorElem;
      s.cm = CodeMirror(editorElem, { // eslint-disable-line
        value: "",
        theme: "blackboard",
        mode: "x-text/x-glsl",
        lineNumbers: false,
        scrollbarStyle: "overlay"
      });
    }

    s.streamSource.on('error', function (e) {
      e = e || "music error";
      console.error(e);
      setPlayState();
      var tracks = s.playlist.splice(s.currentTrackNdx, 1);
      s.trackNdx = s.currentTrackNdx;
      var msg = tracks && tracks.length ? isMic(tracks[0]) ? "" : tracks[0].title : "";
      setSoundSuccessState(false, "Error streaming music: " + msg + " : " + e.toString());
      playNextTrack();
    });
    s.streamSource.on('newSource', function (source) {
      if (!s.running) {
        s.streamSource.stop();
        return;
      }
      source.connect(s.analyser);
      setPlayState();
      setSoundSuccessState(true);
    });
    s.streamSource.on('ended', function () {
      playNextTrack();
    });

    // Replace the canvas in the DOM with ours
    var c = document.getElementById("c");
    c.parentNode.insertBefore(gl.canvas, c);
    c.parentNode.removeChild(c);

    function clearRestore() {
      if (!document.hidden && !g.restoreCleared) {
        g.restoreCleared = true;
        storage.removeItem(s.restoreKey);
      }
    }

    function saveRestoreSettings() {
      if (!misc.deepCompare(settings, g.origSettings)) {
        g.restoreCleared = true; // just in case
        storage.setItem(s.restoreKey, JSON.stringify({
          pathname: window.location.pathname,
          settings: settings
        }));
      }
    }

    function confirmUnload(e) {
      console.log("checking unload");
      if (!misc.deepCompare(settings, g.origSettings)) {
        console.log("need confirmation");
        saveRestoreSettings();
        var msg = "Local Changes Present: Leave?";
        e.returnValue = msg;
        return msg;
      }
    }

    function handleKeyDown(e) {
      clearVisualizers();
      if (s.keyRouter.handleKeyDown(e)) {
        // a handler was called
      }
    }

    on(window, 'click', clearVisualizers);
    on(window, 'keydown', handleKeyDown);
    on(window, 'beforeunload', confirmUnload);
    on(document, 'visibilitychange', clearRestore);
    on(window, 'resize', function () {
      queueRender(true);
    });

    function takeScreenshot() {
      var volumeHistoryTex = s.volumeHistory.getTexture();
      var touchHistoryTex = s.touchHistory.getTexture();
      var historyTex = s.soundHistory.getTexture();
      var floatHistoryTex = s.floatSoundHistory ? s.floatSoundHistory.getTexture() : historyTex;
      gl.canvas.width = s.screenshotCanvas.width * 2;
      gl.canvas.height = s.screenshotCanvas.height * 2;
      renderScene(volumeHistoryTex, touchHistoryTex, historyTex, floatHistoryTex, g.time, settings.lineSize, g.mouse);
      var ctx = s.screenshotCanvas.getContext("2d");
      var w = ctx.canvas.width / gl.canvas.width;
      var h = ctx.canvas.height / gl.canvas.height;
      var scale = Math.max(w, h);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.save();
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(gl.canvas.width / -2, gl.canvas.height / -2);
      ctx.drawImage(gl.canvas, 0, 0);
      ctx.restore();
      return {
        width: ctx.canvas.width,
        height: ctx.canvas.height,
        dataURL: ctx.canvas.toDataURL.apply(ctx.canvas, arguments)
      };
    }

    //$("#gallery").addEventListener('click', function() {
    //   var shot = takeScreenshot();
    //   var img = new Image();
    //   img.src = shot.dataURL;
    //   img.style.position = "absolute";
    //   img.style.left = "0";
    //   img.style.top = "0";
    //   img.style.zIndex = 200;
    //   document.body.appendChild(img);
    //});

    var notifier = new Notifier({
      timeout: 7.5,
      container: document.body
    });
    function addNotification(msg) {
      notifier.add({ text: msg });
    }

    function setSoundSource(src) {
      console.log("soundSoundSource:", src);
      if (isMic(src)) {
        s.streamSource.setSource(src);
      } else {
        s.sc.getRealStreamURL(src, function (err, url) {
          if (err) {
            console.log(err);
            return;
          }
          console.log('headurl:', url);
          s.streamSource.setSource(url);
        });
      }
    }

    function setMusicPause(pause) {
      g.pause = pause;
      if (!pause) {
        queueRender();
      }
    }

    playElems.forEach(function (playElem) {
      on(playElem, 'click', function () {
        toggleMusic(setMusicPause);
        setPlayState();
      });
    });

    function setPlayState() {
      playNodes.forEach(function (playNode) {
        playNode.nodeValue = s.streamSource.isPlaying() ? _pauseIcon : _playIcon;
      });
    }

    function setLockState() {
      lockElem.dataset.tooltip = s.lockMusic ? "unlock music" : "lock music";
      lockElemImg.src = "/static/resources/images/" + (s.lockMusic ? "lock.svg" : "unlock.svg");
    }

    on(lockElem, 'click', function () {
      s.lockMusic = !s.lockMusic;
      setLockState();
    });

    function showOrHide(elem, show) {
      elem.style.display = show ? "inline-block" : "none";
    }

    function setLinkOrHide(elem, link) {
      showOrHide(elem, link);
      if (link) {
        elem.href = link;
      }
    }

    function setSoundLink(options) {
      options = options || {};
      options.user = options.user || {};
      setLinkOrHide(soundLinkElem, options.permalink_url);
      setLinkOrHide(bandLinkElem, options.user.permalink_url);
      setLinkOrHide(soundcloudElem, options.permalink_url);
      setLinkOrHide(soundTimeElem, options.permalink_url);
      soundLinkNode.nodeValue = options.title || "";
      bandLinkNode.nodeValue = options.user.username || "";
      if (s.cm) {
        s.cm.refresh();
      }
    }
    setSoundLink();

    function isStreamable(track) {
      return track.streamable && track.stream_url;
    }

    function playNextTrack() {
      if (!s.playlist.length) {
        return;
      }

      s.currentTrackNdx = s.trackNdx % s.playlist.length;
      s.trackNdx = (s.trackNdx + 1) % s.playlist.length;
      var track = s.playlist[s.currentTrackNdx];
      if (isMic(track)) {
        setSoundSource('mic');
        setSoundLink();
        s.gainNode.gain.value = track === 'feedback' ? 1 : 0;
      } else {
        var src = track.stream_url; // + '?client_id=' + g.soundCloudClientId;
        setSoundSource(src);
        setSoundLink(track);
        s.gainNode.gain.value = 1;
      }
    }

    function setSoundUrl(url, byUser) {
      if (!byUser && (s.lockMusic || s.interruptMusic === false)) {
        s.interruptMusic = true;
        var track = s.playlist[s.currentTrackNdx];
        if (track) {
          setSoundLink(isMic(track) ? undefined : track);
        }
        return;
      }
      s.setSoundUrlByUser = byUser;
      if (!url) {
        s.streamSource.stop();
        setPlayState();
        setSoundLink();
        return;
      } else if (isMic(url)) {
        s.trackNdx = 0;
        s.playlist = [url];
        playNextTrack();
      } else {
        fetch(`/resolve?${new URLSearchParams({ format: 'json', url })}`).then(res => res.json()).then(result => {
          var tracks = result.kind === "playlist" ? result.tracks : [result];
          s.trackNdx = 0;
          s.playlist = [];
          if (Array.isArray(tracks)) {
            s.playlist = tracks.filter(isStreamable);
          }

          if (!s.playlist.length) {
            console.error("no streamable tracks");
            setSoundSuccessState(false, "not streamable according to soundcloud");
          } else {
            playNextTrack();
          }
        }).catch(err => {
          console.error("bad url:", url, err);
          setSoundSuccessState(false, "not a valid soundcloud url? " + (err.message ? err.message : ""));
        });
      }
    }

    on(soundElem, 'change', function (e) {
      var url = e.target.value.trim();
      if (url !== settings.sound) {
        settings.sound = url;
        setSoundUrl(url, true);
      }
    });

    var validModes = {
      "LINES": gl.LINES,
      "LINE_STRIP": gl.LINE_STRIP,
      "LINE_LOOP": gl.LINE_LOOP,
      "POINTS": gl.POINTS,
      "TRI_STRIP": gl.TRIANGLE_STRIP,
      "TRI_FAN": gl.TRIANGLE_FAN,
      "TRIANGLES": gl.TRIANGLES
    };

    var validLineSizes = {
      "NATIVE": true,
      "CSS": true
    };

    var saveElem = $("#save");

    function updateStop() {
      goIconElem.style.display = !g.pause ? "none" : "inline-block";
      stopIconElem.style.display = g.pause ? "none" : "inline-block";
    }

    on(stopElem, 'click', function () {
      g.pause = !g.pause;
      updateStop();
      if (!g.pause) {
        queueRender();
      }
    });

    function setSoundSuccessState(success, msg) {
      soundElem.style.borderColor = success ? "" : "red";
      if (!success && msg) {
        addNotification(msg);
      }
    }

    //setShaderSuccessStatus(false);

    function setShaderSuccessStatus(success) {
      var same = isSettingsSameAsOriginalSansWhitespace();
      editorElem.style.borderColor = success ? "" : "red";
      g.saveable = success && !same;
      saveElem.disabled = !g.saveable;
      g.shaderSuccess = success;
    }

    function clearLineErrors() {
      g.errorLines.forEach(function (lineHandle) {
        s.cm.doc.removeLineClass(lineHandle, "background", "errorLine");
      });
      g.errorLines = [];
    }

    // var whitespaceRE = /\s\s\s*/g;
    function collapseWhitespace(s) {
      return s.replace(/\s\s*/g, ' ');
    }

    function isSettingsSameAsOriginalSansWhitespace() {
      var origShader = g.origSettings.shader;
      var newShader = settings.shader;
      if (!origShader || !newShader) {
        return true;
      }
      g.origSettings.shader = collapseWhitespace(g.origSettings.shader);
      settings.shader = collapseWhitespace(settings.shader);
      var same = misc.deepCompare(settings, g.origSettings);
      g.origSettings.shader = origShader;
      settings.shader = newShader;
      return same;
    }

    s.programManager.on('success', function (e) {
      settings.shader = e.userData;
      setShaderSuccessStatus(true);
      clearLineErrors();
    });
    s.programManager.on('failure', function (errors) {
      setShaderSuccessStatus(false);

      clearLineErrors();

      var errorRE = /ERROR:\s*0:(\d+)/g;
      do {
        var m = errorRE.exec(errors);
        if (m) {
          var lineNum = parseInt(m[1]);
          if (!isNaN(lineNum) && lineNum > 0) {
            lineNum += g.errorLineNumberOffset;
            var lineHandle = s.cm.doc.getLineHandle(lineNum);
            if (lineHandle) {
              g.errorLines.push(lineHandle);
              s.cm.doc.addLineClass(lineHandle, "background", "errorLine");
            }
          }
        }
      } while (m);
    });

    function clamp(min, max, v) {
      return Math.min(max, Math.max(min, v));
    }

    function lerp(s, e, l) {
      return s + (e - s) * l;
    }

    // function lerp01(s, e, l) {
    //   return s + (e - s) * clamp(0, 1, l);
    // }

    function animateElemRect(options) {
      if (!s.running || g.pause) {
        return;
      }
      var fromRect = options.from.getBoundingClientRect();
      var toRect = options.to.getBoundingClientRect();
      var anim = {
        from: fromRect,
        to: toRect,
        fromColor: options.fromColor,
        toColor: options.toColor,
        duration: options.duration,
        startTime: g.time
      };
      g.animRects.push(anim);
    }

    function clearVisualizers() {
      q.showHistory = false;
      q.showWave = false;
    }

    var uiModes = {
      '#ui-off': function (animate) {
        if (animate) {
          if (editorElem.style.display !== "none") {
            animateElemRect({
              from: editorElem,
              to: uimodeElem,
              duration: 0.5
            });
          }
          if (commentAreaElem.style.display !== "none") {
            animateElemRect({
              from: commentAreaElem,
              to: uimodeElem,
              duration: 0.5
            });
          }
        }
        editorElem.style.display = "none";
        commentAreaElem.style.display = "none";
        centerSizeElem.className = "";
        gl.canvas.style.width = "100%";
      },
      '#ui-one': function () {
        s.show = true;
        editorElem.style.display = "block";
        commentAreaElem.style.display = "none";
        editorWrapElem.style.flex = "1 0 100%";
        commentWrapElem.style.flex = "1 0 0";
        gl.canvas.style.width = "100%";
        centerSizeElem.className = "";
        s.cm.refresh();
      },
      '#ui-2v': function () {
        s.show = true;
        centerSizeElem.style.flexFlow = "row";
        centerSizeElem.style.webkitFlexFlow = "row";
        editorElem.style.display = "block";
        commentAreaElem.style.display = "block";
        editorWrapElem.style.flex = "1 0 50%";
        commentWrapElem.style.flex = "1 0 50%";
        gl.canvas.style.width = "100%";
        centerSizeElem.className = "";
        s.cm.refresh();
      },
      '#ui-ea': function () {
        s.show = true;
        editorElem.style.display = "block";
        commentAreaElem.style.display = "none";
        editorWrapElem.style.flex = "0 0 50%";
        commentWrapElem.style.flex = "1 0 0";
        gl.canvas.style.width = "50%";
        art.className = "artright";
        centerSizeElem.className = "editleft";
        s.cm.refresh();
      },
      '#ui-ae': function () {
        s.show = true;
        editorElem.style.display = "block";
        commentAreaElem.style.display = "none";
        editorWrapElem.style.flex = "0 0 50%";
        commentWrapElem.style.flex = "1 0 0";
        gl.canvas.style.width = "50%";
        art.className = "artleft";
        centerSizeElem.className = "editright";
        s.cm.refresh();
      }
    };

    function setUIMode(mode, animate) {
      mode = mode || '#ui-2v';
      uiModes[mode](animate);
    }

    Object.keys(uiModes).forEach(function (mode) {
      on($(mode), 'click', function () {
        s.uiMode = mode;
        setUIMode(mode);
      });
    });

    uimodeDropdownElem.style.display = "none";
    on(uimodeElem, 'click', function (e) {
      e.stopPropagation();
      uimodeDropdownElem.style.display = "";
      var id1;
      var id2;

      var closeDropdown = function (e) {
        e.stopPropagation();
        remove(id1);
        remove(id2);
        uimodeDropdownElem.style.display = "none";
      };

      id1 = on(window.document, 'click', closeDropdown);
      id2 = on(window.document, 'keypress', closeDropdown);
    });

    function updateBackgroundColor(e) {
      settings.backgroundColor = cssParse.parseCSSColor(e.target.value, true);
    }
    var colorElem = $("#background");
    on(colorElem, 'change', updateBackgroundColor);
    on(colorElem, 'input', updateBackgroundColor);

    var numElem = $("#num");
    var numRangeElem = $("#numRange");

    function handleNumEdit(e) {
      var num = clamp(1, g.maxCount, parseInt(e.target.value)) | 0;
      numRangeElem.value = num;
      settings.num = num;
    }
    on(numElem, 'change', handleNumEdit);
    on(numElem, 'input', handleNumEdit);

    on(numRangeElem, 'input', function (e) {
      var num = parseInt(e.target.value);
      numElem.value = num;
      settings.num = num;
    });

    var modeElem = $("#mode");
    on(modeElem, 'change', function (e) {
      settings.mode = e.target.value.toUpperCase();
      g.mode = validModes[settings.mode];
    });

    var sizeElem = $("#size");
    on(sizeElem, 'change', function (e) {
      settings.lineSize = e.target.value.toUpperCase();
    });

    var timeElem = $("#time");
    on(timeElem, 'click', function () /* e */{
      g.time = 0;
    });

    var helpElem = $("#help");
    var helpDialogElem = $("#helpDialog");
    on(helpElem, 'click', showHelp);
    on(helpDialogElem, 'click', hideHelp);

    function hideHelp() {
      helpDialogElem.style.display = "none";
    }

    var showsoundtextureElem = $("#showsoundtexture");
    on(showsoundtextureElem, 'click', function (e) {
      e.stopPropagation();
      clearVisualizers();
      hideHelp();
      q.showHistory = true;
    });

    var showwaveElem = $("#showwave");
    on(showwaveElem, 'click', function (e) {
      e.stopPropagation();
      clearVisualizers();
      hideHelp();
      q.showWave = true;
    });

    function showHelp() {
      helpDialogElem.style.display = helpDialogElem.style.display !== "" ? "" : "none";
    }

    s.keyRouter.on(112, showHelp);

    function isAllNumbers0to1(array) {
      for (var ii = 0; ii < array.length; ++ii) {
        var v = array[ii];
        if (typeof v !== 'number') {
          return false;
        }
        if (v < 0 || v > 1) {
          return false;
        }
      }
      return true;
    }

    s.cm.refresh();

    // function getMode(mode) {
    //   var m = modes[mode];
    //   return m === undefined ? gl.LINES : m;
    // }

    function tryNewProgram(text) {
      var vsrc = applyTemplateToShader(text);
      setShaderSuccessStatus(false);
      s.programManager.compile(vsrc, g.fSource, text);
    }

    // var oldText;
    var oldTrimmedText;

    var lineCommentRE = /\/\/.*/g;
    var blockCommentRE = /\/\*[\s\S]*?\*\//g;
    var whiteSpaceRE = /[ \t][ \t]+/g;
    var eolRE = /\n\n+/g;
    function trimShaderText(text) {
      text = text.replace(lineCommentRE, '');
      text = text.replace(blockCommentRE, '');
      text = text.replace(whiteSpaceRE, ' ');
      text = text.replace(eolRE, "\n");
      return text;
    }

    function handleChange(cm) {
      var text = cm.doc.getValue();
      var trimmedText = trimShaderText(text);
      if (trimmedText !== oldTrimmedText) {
        oldTrimmedText = trimmedText;
        tryNewProgram(text);
      } else {
        // The text is functionally equivalent
        // If it was okay before it should be ok now
        if (g.saveable) {
          settings.shader = text;
        }
      }
    }
    s.cm.on('change', handleChange);
    s.cm.on('cursorActivity', recordInputAndMakeUIVisible);

    function validateSettings(settings) {
      settings.num = clamp(1, g.maxCount, (settings.num || 10000) | 0);
      if (validModes[settings.mode] === undefined) {
        settings.mode = "LINES";
      }
      if (validLineSizes[settings.lineSize] === undefined) {
        settings.lineSize = "NATIVE";
      }

      var haveBG = !!settings.backgroundColor;
      var bgIsArray = Array.isArray(settings.backgroundColor);
      var bgLenIs4 = settings.backgroundColor.length === 4;
      var bgAllNum = isAllNumbers0to1(settings.backgroundColor);
      if (!haveBG || !bgIsArray || !bgLenIs4 || !bgAllNum) {
        settings.backgroundColor = [0, 0, 0, 1];
      }
    }

    function setUISettings(settings) {
      colorElem.value = colorUtils.makeCSSColorFromRgb01Array(settings.backgroundColor);
      numElem.value = settings.num;
      numRangeElem.value = settings.num;
      modeElem.value = settings.mode;
      sizeElem.value = settings.lineSize;
      soundElem.value = settings.sound;
    }

    function markAsSaved() {
      g.origSettings = JSON.parse(JSON.stringify(settings));
      savingElem.style.display = "none";
      setShaderSuccessStatus(true);
    }

    function markAsSaving() {
      savingElem.style.display = "";
    }

    function restoreSettings(settings) {
      var restoreStr = storage.getItem(s.restoreKey);
      if (restoreStr) {
        try {
          var restore = JSON.parse(restoreStr);
          if (restore.pathname === window.location.pathname) {
            if (restore.settings.shader) {
              settings = restore.settings;
            }
          }
        } catch (e) {// eslint-disable-line
        }
      }
      clearRestore();
      return settings;
    }

    function stopTheMusic() {
      if (s.streamSource.isPlaying()) {
        s.streamSource.stop();
      }
    }

    function playSoundToGetMobileAudioStarted() {
      var source = s.context.createOscillator();
      var gain = s.context.createGain();
      source.frequency.value = 1;
      source.connect(gain);
      gain.gain.value = 0;
      gain.connect(s.context.destination);
      source.start(0);

      s.streamSource.init();

      setTimeout(function () {
        source.disconnect();
      }, 100);
    }

    function setSettings(settings, options) {
      options = options || {};
      settings = JSON.parse(JSON.stringify(settings));

      var uiMode = s.uiMode || options.uiMode;

      $("#uicontainer").style.display = "block";

      s.running = true;
      if (!s.audioStarted) {
        if (options.screenshotURL) {
          $("#screenshot").style.backgroundImage = 'url(' + options.screenshotURL + ')';
        }

        $("#loading").style.display = "none";
        $("#start").style.display = "";
        if (settings.sound && (isMobile || shittyBrowser)) {
          $("#start>div").style.width = "90%";
          $("#badaudio").style.display = "";
        }
        on($("#start"), 'click', function () {
          function startIt() {
            s.audioStarted = true;
            $("#start").style.display = "none";
            $("#screenshot").style.display = "none";
            setUIMode(uiMode);
            realSetSettings(settings, options);
          }
          if (s.context.resume) {
            s.context.resume().then(startIt);
            playSoundToGetMobileAudioStarted();
          } else {
            playSoundToGetMobileAudioStarted();
            startIt();
          }
        });
      } else {
        $("#start").style.display = "none";
        $("#screenshot").style.display = "none";
        setUIMode(uiMode);
        realSetSettings(settings, options);
      }
    }

    function realSetSettings(_settings, options) {
      options = options || {};
      g.saveFn = options.saveFn;
      g.restoreCleared = false;
      settings = restoreSettings(_settings);
      settings = JSON.parse(JSON.stringify(settings));
      validateSettings(settings);
      setUISettings(settings);

      g.time = 0;
      g.mode = validModes[settings.mode];
      //shader// test bad

      setSoundUrl(q.sound || settings.sound);
      s.cm.doc.setValue(settings.shader);
      updateStop();
      setPlayState();
      setLockState();

      // not needed because s.cm.doc.setValue will trigger change event
      //tryNewProgram(settings.shader);
      markAsSaved();

      queueRender(true);
      $("#vsa a").href = window.location.href;
      if (s.inIframe) {
        Array.prototype.forEach.call(document.querySelectorAll("a"), function (a) {
          a.target = "_blank";
          on(a, 'click', stopTheMusic);
        });

        $("#loading").style.display = "none";
        s.streamSource.play();
        setPlayState();
        setSoundSuccessState(true);
      }
    }

    function setOptions(options) {
      options = options || {};
      if (options.interruptMusic === false) {
        s.interruptMusic = false;
      }
    }

    function updateSoundTime() {
      var pixels = 0;
      var duration = s.streamSource.getDuration();
      if (duration) {
        var currentTime = s.streamSource.getCurrentTime();
        var l = currentTime / duration;
        pixels = l * soundTime.clientWidth | 0;
      }
      if (pixels !== g.soundTimePixelWidth) {
        g.soundTimePixelWidth = pixels;
        soundTime.style.background = "linear-gradient(90deg, rgba(30,30,30,0.7) " + (l * 100).toFixed(2) + "%, rgba(0,0,0,0.7) " + (l * 100).toFixed(2) + "%)";
      }
    }

    var uniforms = {
      time: 0,
      vertexCount: 0,
      resolution: [1, 1],
      background: [0, 0, 0, 1],
      mouse: [0, 0],
      sound: undefined,
      floatSound: undefined,
      soundRes: [s.numSoundSamples, s.numHistorySamples],
      _dontUseDirectly_pointSize: 1
    };

    var historyUniforms = {
      u_mix: 0,
      u_matrix: m4.identity(),
      u_texture: undefined
    };

    function renderScene(volumeHistoryTex, touchHistoryTex, soundHistoryTex, floatSoundHistoryTex, time, lineSize, mouse) {
      twgl.bindFramebufferInfo(gl);

      var size = lineSize === "NATIVE" ? 1 : window.devicePixelRatio || 1;
      gl.lineWidth(size);

      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor.apply(gl, q.showWave ? [0, 0, 0, 1] : settings.backgroundColor);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      var programInfo = q.showWave ? s.waveProgramInfo : s.programManager.getProgramInfo();
      if (programInfo) {
        g.wasRendered = true;

        var num = q.showWave ? 7000 : settings.num;
        var mode = q.showWave ? gl.LINES : g.mode;
        uniforms.time = time;
        uniforms.vertexCount = num;
        uniforms.resolution[0] = gl.canvas.width;
        uniforms.resolution[1] = gl.canvas.height;
        uniforms.background[0] = settings.backgroundColor[0];
        uniforms.background[1] = settings.backgroundColor[1];
        uniforms.background[2] = settings.backgroundColor[2];
        uniforms.background[3] = settings.backgroundColor[3];
        uniforms.mouse[0] = mouse[0];
        uniforms.mouse[1] = mouse[1];
        uniforms._dontUseDirectly_pointSize = size;
        uniforms.volume = volumeHistoryTex;
        uniforms.sound = soundHistoryTex;
        uniforms.floatSound = floatSoundHistoryTex;
        uniforms.touch = touchHistoryTex;

        gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(gl, programInfo, s.countBufferInfo);
        twgl.setUniforms(programInfo, uniforms);
        twgl.drawBufferInfo(gl, s.countBufferInfo, mode, num);
      }
    }

    function updateSoundAndTouchHistory() {
      // Copy audio data to Nx1 texture
      s.analyser.getByteFrequencyData(s.soundHistory.buffer);

      // should we do this in a shader?
      {
        const buf = s.soundHistory.buffer;
        const len = buf.length;
        var max = 0;
        for (let ii = 0; ii < len; ++ii) {
          const v = buf[ii];
          if (v > max) {
            max = v;
          }
        }
        s.volumeHistory.buffer[3] = max;
      }
      s.volumeHistory.buffer[0] = Math.abs(s.maxSample) * 255;
      s.volumeHistory.buffer[1] = s.sum * 255;
      s.volumeHistory.buffer[2] = s.maxDif * 127;

      if (s.floatSoundHistory) {
        s.analyser.getFloatFrequencyData(s.floatSoundHistory.buffer);
      }

      // Update time
      for (let ii = 0; ii < s.touchColumns; ++ii) {
        var offset = ii * 4;
        s.touchHistory.buffer[offset + 3] = g.time;
      }

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

      twgl.setBuffersAndAttributes(gl, s.historyProgramInfo, s.quadBufferInfo);

      s.volumeHistory.update();
      s.soundHistory.update();
      if (s.floatSoundHistory) {
        s.floatSoundHistory.update();
      }
      s.touchHistory.update();
    }

    function renderHistory(tex, mix, mult) {
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.useProgram(s.historyProgramInfo.program);
      twgl.setBuffersAndAttributes(gl, s.historyProgramInfo, s.quadBufferInfo);
      m4.identity(historyUniforms.u_matrix);
      historyUniforms.u_mult = mult;
      historyUniforms.u_mix = mix;
      historyUniforms.u_texture = tex;
      twgl.setUniforms(s.historyProgramInfo, historyUniforms);
      twgl.drawBufferInfo(gl, s.quadBufferInfo);
    }

    function renderAnimRect(animRect) {
      var l = (g.time - animRect.startTime) / animRect.duration;
      if (l > 1) {
        return true;
      }

      l = tweeny.fn.easeInCubic(l);
      var from = animRect.from;
      var to = animRect.to;

      var left = lerp(from.left, to.left, l);
      var top = lerp(from.top, to.top, l);
      var right = lerp(from.right, to.right, l);
      var bottom = lerp(from.bottom, to.bottom, l);

      var mat = s.rectUniforms.u_matrix;
      m4.identity(mat);
      m4.ortho(0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1, mat);
      m4.translate(mat, [left, top, 0], mat);
      m4.scale(mat, [right - left, bottom - top, 1], mat);
      m4.translate(mat, [0.5, 0.5, 0], mat);
      m4.scale(mat, [0.5, 0.5, 1], mat);

      twgl.setUniforms(s.rectProgramInfo, s.rectUniforms);
      twgl.drawBufferInfo(gl, s.quadBufferInfo);
    }

    function renderAnimRects() {
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.useProgram(s.rectProgramInfo.program);
      twgl.setBuffersAndAttributes(gl, s.rectProgramInfo, s.quadBufferInfo);
      for (var ii = 0; ii < g.animRects.length;) {
        if (renderAnimRect(g.animRects[ii])) {
          g.animRects.splice(ii, 1);
        } else {
          ++ii;
        }
      }
    }

    function render(time) {
      g.requestId = undefined;
      time *= 0.001;
      var now = time;
      var elapsed = now - (g.then || 0);
      g.then = now;
      g.time += elapsed;

      twgl.resizeCanvasToDisplaySize(gl.canvas);

      updateSoundAndTouchHistory();

      var volumeHistoryTex = s.volumeHistory.getTexture();
      var touchHistoryTex = s.touchHistory.getTexture();
      var historyTex = s.soundHistory.getTexture();
      var floatHistoryTex = s.floatSoundHistory ? s.floatSoundHistory.getTexture() : historyTex;
      renderScene(volumeHistoryTex, touchHistoryTex, historyTex, floatHistoryTex, g.time, settings.lineSize, g.mouse);

      if (q.showVolume) {
        renderHistory(s.volumeHistory.getTexture(), 0, 1);
      } else if (q.showHistory) {
        renderHistory(s.soundHistory.getTexture(), 0, 1);
      } else if (q.showFloatHistory && s.floatSoundHistory) {
        renderHistory(s.floatSoundHistory.getTexture(), 0, -0.005);
      } else if (q.showTouchHistory) {
        renderHistory(s.touchHistory.getTexture(), 1, 1);
      }

      updateSoundTime();

      renderAnimRects();

      queueRender();
    }

    function queueRender(force) {
      if (!g.requestId && (force || !g.wasRendered || s.running && !g.pause) || g.animRects.length) {
        g.requestId = requestAnimationFrame(render);
      }
    }

    function stopRender() {
      if (g.requestId) {
        cancelAnimationFrame(g.requestId);
        g.requestId = undefined;
      }
    }

    function pauseOnBlur() {
      if (g.pauseOnBlur) {
        stopRender();
      }
    }

    function unpauseOnFocus() {
      if (g.pauseOnBlur && s.running) {
        queueRender();
      }
    }

    on(window, 'blur', pauseOnBlur);
    on(window, 'focus', unpauseOnFocus);

    function addTouchPosition(column, x, y) {
      x = x * 2 - 1;
      y = y * -2 + 1;

      if (!s.canUseFloat) {
        x = Math.max(0, x * 255 | 0);
        y = Math.max(0, y * 255 | 0);
      }
      var offset = column * 4;
      s.touchHistory.buffer[offset + 0] = x;
      s.touchHistory.buffer[offset + 1] = y;
    }

    function addTouchPressure(column, pressure) {
      if (!s.canUseFloat) {
        pressure = Math.max(0, pressure * 255 | 0);
      }
      var offset = column * 4;
      s.touchHistory.buffer[offset + 2] = pressure;
    }

    function recordMouseMove(e) {
      var rect = gl.canvas.getBoundingClientRect();
      var w = gl.canvas.clientWidth;
      var h = gl.canvas.clientHeight;
      var x = (e.clientX - rect.left) / w;
      var y = (e.clientY - rect.top) / h;

      g.mouse[0] = x * 2 - 1;
      g.mouse[1] = y * -2 + 1;
      addTouchPosition(0, x, y);
    }

    function recordMouseDown() /* e */{
      addTouchPressure(0, 1);
    }

    function recordMouseUp() /* e */{
      addTouchPressure(0, 0);
    }

    on(window, 'mousemove', recordMouseMove);
    on(window, 'mousedown', recordMouseDown);
    on(window, 'mouseup', recordMouseUp);

    function getTouchIndex(t) {
      var id = t.identifer;
      var ndx = g.touches.indexOf(id);
      if (ndx < 0) {
        // Find empty slot
        for (var ii = 0; ii < g.touches.length; ++ii) {
          if (g.touches[ii] === undefined) {
            break;
          }
        }
        if (ii === 32) {
          console.error("too many touches :(");
          g.touches = [];
          ii = 0;
        }
        ndx = ii;
        g.touches[ndx] = id;
      }
      return ndx;
    }

    function recordTouchStart(e) {
      var rect = gl.canvas.getBoundingClientRect();
      for (var ii = 0; ii < e.touches.length; ++ii) {
        var t = e.touches[ii];
        var w = gl.canvas.clientWidth;
        var h = gl.canvas.clientHeight;
        var x = (t.clientX - rect.left) / w;
        var y = (t.clientY - rect.top) / h;
        var ndx = getTouchIndex(t);
        addTouchPosition(ndx, x, y);
        addTouchPressure(ndx, t.force || 1);
      }
    }

    function recordTouchCancel(e) {
      for (var ii = 0; ii < e.touches.length; ++ii) {
        var t = e.touches[ii];
        var ndx = getTouchIndex(t);
        g.touches[ndx] = undefined;
        addTouchPressure(ndx, 0);
      }
    }

    function recordTouchEnd(e) {
      recordTouchCancel(e);
    }

    function recordTouchMove(e) {
      e.preventDefault();
      recordTouchStart(e);
      return false;
    }

    var touchTarget = window;
    on(touchTarget, 'touchstart', recordTouchStart);
    on(touchTarget, 'touchend', recordTouchEnd);
    on(touchTarget, 'touchcancel', recordTouchCancel);
    on(touchTarget, 'touchmove', recordTouchMove);

    function makeUIVisible() {
      if (s.uiHidden) {
        s.uiHidden = false;
        setUIMode(s.uiMode, true);
      }
    }

    function checkHideUI() {
      var elapsedTime = (Date.now() - g.lastInputTimestamp) * 0.001;
      if (!g.lastInputTimestamp || elapsedTime > 15) {
        if (!s.uiHidden) {
          s.uiHidden = true;
          setUIMode('#ui-off', true);
        }
      }
      setHideUITimeout();
    }

    function clearHideUITimeout() {
      if (g.hideUITimeoutId) {
        clearTimeout(g.hideUITimeoutId);
        g.hideUITimeoutId = undefined;
      }
    }

    function setHideUITimeout(seconds) {
      seconds = seconds || 15;
      clearHideUITimeout();
      // Don't set if user has manually set mode
      if (!s.uiMode) {
        g.hideUITimeoutId = setTimeout(checkHideUI, seconds * 1000);
      }
    }

    function recordInputAndMakeUIVisible() {
      g.lastInputTimestamp = Date.now();
      makeUIVisible();
    }

    setHideUITimeout(5);

    on(window, 'mousedown', recordInputAndMakeUIVisible);
    on(window, 'keypress', recordInputAndMakeUIVisible);
    on(window, 'wheel', recordInputAndMakeUIVisible);
    on(window, 'mousemove', function () {
      // don't unhide on mousemove because some pieces take mouse movement
      if (!s.uiHidden) {
        recordInputAndMakeUIVisible(5);
      }
    });

    this.stop = function (keepMusic) {
      clearHideUITimeout();
      s.running = false;
      stopRender();
      if (!keepMusic && s.interruptMusic !== false && !s.lockMusic && s.streamSource.isPlaying()) {
        s.streamSource.stop();
      }
      s.programManager.clear();
      listenerManager.removeAll();
      clearLineErrors();
      s.cm.off('change', handleChange);
      s.cm.off('cursorActivity', recordInputAndMakeUIVisible);
      gl.canvas.parentNode.removeChild(gl.canvas);
      saveRestoreSettings();
    };

    this.takeScreenshot = takeScreenshot;
    this.setOptions = setOptions;
    this.setSettings = setSettings;
    this.getSettings = function () {
      return JSON.parse(JSON.stringify(settings));
    };
    this.getSets = function () {
      return s.sets;
    };
    this.markAsSaved = markAsSaved;
    this.markAsSaving = markAsSaving;
    this.isSaveable = function () {
      return g.saveable;
    };
  }

  var vs;

  function init() {
    if (!vs) {
      vs = new VS();
    }
  }

  function start() {
    init();

    var q = misc.parseUrlQuery();
    var settings = s.sets[q.settings];
    if (!settings) {
      settings = s.sets.default;
    }

    vs.setSettings(settings, {
      screenshotURL: '/static/resources/images/heart-liked.svg'
    });
  }

  function stop(keepMusic) {
    if (vs) {
      vs.stop(keepMusic);
    }
  }

  function setSettings(settings, options) {
    vs = new VS(); //init();

    if (!settings) {
      // pick a random settings
      var sets = vs.getSets();
      var keys = Object.keys(sets);
      var ndx = Math.random() * keys.length | 0;
      settings = sets[keys[ndx]];
    }

    vs.setSettings(settings, options);
  }

  function getSettings() {
    init();
    return vs.getSettings();
  }

  function takeScreenshot() {
    init();
    return vs.takeScreenshot.apply(vs, arguments);
  }

  function markAsSaved() {
    init();
    vs.markAsSaved();
  }

  function markAsSaving() {
    init();
    vs.markAsSaving();
  }

  function isSaveable() {
    init();
    return vs.isSaveable();
  }

  function setOptions(options) {
    init();
    vs.setOptions(options);
  }

  var missingSettings = {
    num: 256,
    mode: "POINTS",
    sound: "",
    lineSize: "NATIVE",
    backgroundColor: [0, 0, 0, 1],
    shader: ["// -----[ shader missing! ] -----", "", "#define NUM 15.0", "void main() {", "  gl_PointSize = 64.0;", "  float col = mod(vertexId, NUM + 1.0);", "  float row = mod(floor(vertexId / NUM), NUM + 1.0); ", "  float x = col / NUM * 2.0 - 1.0;", "  float y = row / NUM * 2.0 - 1.0;", "  gl_Position = vec4(x, y, 0, 1);", "  v_color = vec4(fract(time + col / NUM + row / NUM), 0, 0, 1);", "}"].join("\n")
  };

  return {
    start: start,
    stop: stop,
    toggleMusic: toggleMusic,
    getMusicState: getMusicState,
    isSaveable: isSaveable,
    getSettings: getSettings,
    setSettings: setSettings,
    setOptions: setOptions,
    takeScreenshot: takeScreenshot,
    missingSettings: missingSettings,
    markAsSaved: markAsSaved,
    markAsSaving: markAsSaving
  };
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// @license audiosteamsource.js 0.0.2 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
// Available via the MIT license.
// see: http://github.com/greggman/audiostreamsource.js for details

(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.audioStreamSource = factory();
  }
})(this, function () {

  const silentMP3 = "data:audio/mp3;base64,/+NoZAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAGAAAL0AAqKioqKioqKioqKioqKioqVVVVVVVVVVVVVVVVVVVVVVWAgICAgICAgICAgICAgICAqqqqqqqqqqqqqqqqqqqqqqrV1dXV1dXV1dXV1dXV1dXV1f////////////////////8AAAA5TEFNRTMuOTlyASgAAAAAAAAAABQwJALoLgAAMAAAC9DctZBxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+NoZAAcpjb4ADzMmBisbfwAAJkwfv4b9eOhFnXPDGGBnFzMsmASBNF0CDjkMQn5L15lIOcbW+OQ0FA3oez2nYDkNA0EMUCscJUPbjocJE4hhoHXCVlcKyJtgNNzgV3pjV7O8TjJr53AIJ7/ZMHJ297j296Ts8Ls8mT29MQMQgghh6cZd9yERHPJ7n3uTsmnpNNiEeIeLu9iH397u2MQ399b3fgwghzAAhEPsRjwA1sOTt4IuXpBIPKMUYfY692HGGQOKL52EgSBIH/NODxgSDzdXv0TrhIMBAEczM2hABoDQGik8HsD58JDJAHwSyYeUqZvGCyqwewrLn1f6v/6nPqed1P6N/6nd/+hP////q6E7KLdCHOdCVOdtKUpzb95vZZ23bcvLb9GFkVKtn77a+52JCinN2WNxn5weQmcaxYsXvsVX/JwTCevxYcCABAGikmVudr7yVyfEwSBIf/ZIItUPE2SgUlXKMxhdjtOctxjAx0Xonj5WxWZZw56YWHw9sT6FvMB1Diy2V2YL63wm1dvU8abS3mFdQAKFMIGIKhUEm0uvoPSil8hOFBISZ8h/+NoZFMYVjcKADxsiiD8bgwAAN8wQhDqVaX2L1tJN9NT/MRJknllxsynrlIZZlY+RvPUmIZkwWZwWMGc1Yza6dDaXQROL8lI43icf6sFNO2YSvgVtk9onpoBzKx3RKYmSkjmI/QCIJb5baLUBPYOyaRe4dvUFYaxIWQwExQ8vZVk8xOijP6R8/LNN/Uy/aIqPm87HOna5fTqxty97czy8/s8v/7PvCz9TangqJMUbBhIIgNAr0Y8YiSw2tun8FTZdViw1ywQ0mopFYzzQ4K/Cyn7KN6ynuuENT7FFSq8plpJsbaZXjbZ4CuUMax+G4uVIqjuL5gp2eCW1tVB/neXt4f5vn4pUcr1pQDbT/4YoU8WqviPigQTMrUNfoaZTi3pdfUqEdziw8wUtCpWFb4j4eRbRNBczzuHa7ZDHWvYxs14atL3s222KZ7HbiJiEt/eXM3ls1TDZfuofUC4e9nDI7kJQuI+ILgNVQfp5bv2eO8y77bvP/b/787tft2eN1jJzprLQNtb6tQY7DRblbPx1ji+7bjaPUixQcr7IT0EaCrjStWXXWmPqI0xxC0sKhWL/+NoZKcX8jcOKDzMbiLEbgwAAV8URUOR7gxhQVzFeHMrh5ePi+vV0N3juIS0H/qn67b1peRkO7NVFJKykUh2Ncz7NVynmMiu+iSM9Eet0Ssnaq7231RzMNURGIIsBw6c6Dy6TyYhu+rnr+Cn1dHkVqhS2jccmFhUrApVwok89Z37BCeyXmiuK/ERC5PyKhi4NplOpcPkqjC6Gyq1iAuLLlxQlQMpMC9psl7I/V6GKBUo05TykRhdUJVMQf/TBA4C6c4bKryet7OWNK2GeGk3qFDwh4GMsY+Ala6HfDw8Z2FnXDA3wYcRgebVD9gpEXZ/oW/cezFnIeEpgQjLtRBsPN23ht+KiZeI23Sou6WKTvGjXmqWS/rb/pRYdk90rluA4OHQnAecg3A+O6EEgNBEPDOObv4sqvEg8pC2vve9O/5rf/y977t77XW339nM683eo6/GvuvgDgmCQnPzy+wJqtrnjA/UaerehLZUL5NVozzGgTJa15McHSrieeNkc+PTMcDokLCOOBZLRyWCEbmsBbMREICCfD6VCyUywIx4kHdwqFQpFX//fT////////+l/+NoZPUdSjcIAD0Mdim0bgQAEx+k/umvQjrMyLYsgVjMzEDztAUGBMcSHCshBnIWzA0hzP0ZpUXZiFXovdPz+/819qmezeOkLpkVrc5yk0NnT5DN0r7ygGqp9SJxOeOSSTeJQgIRIKh6SBKLhsdFgnl4lic2AkshcfBYDR2PUjSDGiSttUZNSSMKkiMpyPz9XLaihbS6uJe0Qo39FI9RhJiijnMQAmqRJQnTnQQ9B6DATEFNRTMuOTkuNVW3U5Tx7Sg0GtNZay5wXQa29Bbl+W7LSqP/EUHXUMbiZZqWyph7iXH/eWVVovK8YFykUhfWpzKggb6B/o1f2ki9UxI8hDlinajtn1JsJGxmb0bOkuali0UaruYXWWcevHypyrfULvoUbdYW1ydMBPE6OqOplGZJbTRCQtDcrmVtVrK9TrpTM7lZijZ1rPtbwvvWbf69tPpZMVhe9GHEVuZt4rBdK5yT0a/ezMy4QrD60qtiTyZVsdUwnKE+b1TCOZnVrDRQnUywLHUnUVDV0sWVEFchCWZkNLiolpOD+bYTKfy5fmMlVyxZXCFrKmSTa5pRXM7w/+NoZPQfVjcEAGDPdiUsbg2ACN9MfSvcUWpFbTdensr6+XlZL8y/Po5TLn5WbBy75F8nmbTfY0s28yyHVD+sf9k12LpWSz6W5s3///z/+5XKktIqQbR9KBeCeS3IOBW1H8SjNCYt51CfMa4bXF+imtxZoDCxQn7gnVUpGN8+V2FLZxhxU7IrtJ0/pEusMbyRmzFckojzujKFkMshh9zKVEIefKGKtkQ47UVATb1NpRvVTEFNRTMuOTkuNVVVVVK4p5fWFEpWRCj+V5wkqN8pRbjZPAuJhHGS03lpEl5C+EiHGOknSnVMiqP1jOldLSGti0rTFErRp4SImoJTlbLYceic8+m2fv//q0Tj0SRezFPLbNGmJEStzv/5bZb/7LbLZTy2vlHFmJhICAxgUUkblWicXs5T5Wy+blS2y8tst/L/0WgkRAoSnKdtySvWwRrYL/MzNt5cdNuLmYmru702hWFoSR6KiC7/PHLEdTIeTAfhBKgfAiJ5ofbXWCcAkHREFxJcMjsfQmMAqHksE7TlQDYFhDCEGwVLOk1L5rDv50mqzbu1Jtsoa7Q7tlOaw7+d/+NoZPIbBjbsADzMbi1cbdSgGZ+gJsoa655Q1pH/DUGjUm1n5rDWEGdWNSaHeGqMxrDWGv/3ampNShrVh0mNasNZT5OU6J1zhpSwCYOBUAopIjCTonXvetz9xZoNJreumJdo0gxhIWZJ/O0NYEcfrmaKcMonqGGUfqwhq8tIavObpmTqJUiXMk/l2yO4uXrcznST43yaiTG4MYbp+IJWzK5rhxLvVMrzhL8izyJSbhelTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

  // There's really no good way to tell which browsers fail.
  // Right now Safari doesn't expose AudioContext (it's still webkitAudioContext)
  // so my hope is whenever they get around to actually supporting the 3+ year old
  // standard that things will actually work.
  //var shittyBrowser = window.AudioContext === undefined && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const shittyBrowser = false; // /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  // var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  let g_micSource;
  let g_audioSource;

  function noGetUserMedia(options, successCallback, errorCallback) {
    setTimeout(function () {
      errorCallback("no mic support on this browser/device");
    });
  }

  const audio = new Audio();
  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || noGetUserMedia;

  function addEventEmitter(self) {
    var _handlers = {};
    self.on = function (event, handler) {
      _handlers[event] = handler;
    };

    return emit = function (event) {
      var handler = _handlers[event];
      if (handler) {
        handler.apply(null, Array.prototype.slice.call(arguments, 1));
      }
    };
  }

  function startPlaying(playFn, emitFn) {
    playFn();
  }

  function isMic(src) {
    return src === 'mic';
  }

  function getMicSource(context, callback, errorCallback) {
    if (g_micSource) {
      setTimeout(function () {
        callback(g_micSource);
      });
    } else {
      getUserMedia.call(navigator, { audio: true }, function (stream) {
        g_micSource = context.createMediaStreamSource(stream);
        callback(g_micSource);
      }, errorCallback);
    }
  }

  function StreamedAudioSource(options) {
    console.log("using streaming audio");
    const emit = addEventEmitter(this);
    const self = this;
    const context = options.context;
    const autoPlay = options.autoPlay;
    let source;
    let canPlayHandled = false;
    let playRequested = false;
    const handleAudioError = function handleAudioError(e) {
      emit('error', e);
    };
    const handleCanplay = function handleCanplay(unused, micSource) {
      if (!canPlayHandled) {
        canPlayHandled = true;
        if (source) {
          source.disconnect();
        }
        if (micSource) {
          source = micSource;
        } else {
          if (autoPlay || playRequested) {
            startPlaying(play, emit);
          }
          if (!g_audioSource) {
            g_audioSource = context.createMediaElementSource(audio);
          }
          source = g_audioSource;
        }
        emit('newSource', source);
      }
    };
    const handleEnded = function handleEnded() {
      emit('ended');
    };

    function showEvent(e) {
      console.log("got event:", e.type);
    }

    //[
    //  "abort",
    //  "canplaythrough",
    //  "durationchange",
    //  "emptied",
    //  "encrypted ",
    //  "ended",
    //  "interruptbegin",
    //  "interruptend",
    //  "loadeddata",
    //  "loadedmetadata",
    //  "loadstart",
    //  "mozaudioavailable",
    //  "pause",
    //  "play",
    //  "playing",
    //  "progress",
    //  "ratechange",
    //  "seeked",
    //  "seeking",
    //  "stalled",
    //  "suspend",
    //  "timeupdate",
    //  "volumechange",
    //  "waiting",
    //].forEach(function(event) {
    //  audio.addEventListener(event, showEvent);
    //});

    function setSource(src) {
      canPlayHandled = false;
      if (source) {
        source.disconnect();
      }
      if (isPlaying()) {
        audio.pause();
      }
      if (audio) {
        audio.removeEventListener('error', handleAudioError);
        audio.removeEventListener('canplay', handleCanplay);
        audio.removeEventListener('ended', handleEnded);
      }

      if (isMic(src)) {
        getMicSource(context, function (micSource) {
          handleCanplay(null, micSource);
        }, handleAudioError);
        return;
      }

      audio.loop = options.loop;
      audio.autoplay = options.autoPlay;
      if (options.crossOrigin !== undefined) {
        audio.crossOrigin = "anonymous";
      }
      audio.addEventListener('error', handleAudioError);
      audio.addEventListener('canplay', handleCanplay);
      audio.addEventListener('ended', handleEnded);
      audio.src = src;
      audio.load();
    }

    function getSource() {
      return source;
    }

    if (options.src) {
      setSource(options.src);
    }

    function play() {
      playRequested = false;
      if (audio) {
        audio.play();
        audio.currentTime = 0;
      }
    }

    function isPlaying() {
      return audio && !audio.paused;
    }

    function getCurrentTime() {
      return audio ? audio.currentTime || 0 : 0;
    }

    function getDuration() {
      return audio ? audio.duration || 0 : 0;
    }

    this.init = function () {
      audio.src = silentMP3;
      audio.play();
    };

    this.isPlaying = isPlaying;

    this.play = function () {
      if (canPlayHandled) {
        startPlaying(play, emit);
      } else {
        playRequested = true;
      }
    };
    this.stop = function () {
      if (audio) {
        audio.pause();
      }
    };
    this.setSource = setSource;
    this.getSource = getSource;
    this.getDuration = getDuration;
    this.getCurrentTime = getCurrentTime;
  }

  function NonStreamedAudioSource(options) {
    console.log("using NON-streaming audio");
    var emit = addEventEmitter(this);
    var self = this;
    var context = options.context;
    var loop = options.loop;
    var autoPlay = options.autoPlay;
    var crossOrigin = options.crossOrigin;
    var source;
    var playing = false;
    var startTime = Date.now();
    var stopTime = Date.now();
    var dataBuffer;
    var started;
    // shitty browsers (eg, Safari) can't stream into the WebAudio API

    function createBufferSource() {
      source = context.createBufferSource();
      source.buffer = dataBuffer;
      source.loop = loop;
      started = false;
    }

    function play() {
      if (source && source === g_micSource) {
        return;
      }
      if (dataBuffer) {
        if (started) {
          createBufferSource();
          emit('newSource', source);
        }
        started = true;
        source.start(0);
        source.onended = handleEnded;
        startTime = Date.now();
        playing = true;
      }
    }

    function stop() {
      if (source && source === g_micSource) {
        return;
      }
      if (source && playing) {
        source.onended = undefined;
        source.stop(0);
        stopTime = Date.now();
      }
      playing = false;
    }

    function isPlaying() {
      return playing;
    }

    function getDuration() {
      return source && source !== g_micSource ? source.buffer.duration : 0;
    }

    function getCurrentTime() {
      if (source && source !== g_micSource && playing) {
        var elapsedTime = (Date.now() - startTime) * 0.001;
        return elapsedTime % source.buffer.duration;
      } else {
        return 0;
      }
    }

    function handleEnded() {
      emit('ended');
    };

    function setSource(src, lofiSrc) {
      if (source) {
        stop();
        source.disconnect();
        source = undefined;
      }

      if (isMic(src)) {
        getMicSource(context, function (micSource) {
          source = micSource;
          emit('newSource', micSource);
        }, function (e) {
          emit('error', e);
        });
        return;
      }

      var req = new XMLHttpRequest();
      req.open("GET", lofiSrc || src, true);
      req.responseType = "arraybuffer";
      if (crossOrigin !== undefined) {
        req.withCredentials = true;
      }
      req.addEventListener('error', function (e) {
        emit('error', e);
      });
      req.addEventListener('load', function () {
        context.decodeAudioData(req.response, function (decodedBuffer) {
          dataBuffer = decodedBuffer;
          createBufferSource();
          if (autoPlay) {
            startPlaying(play, emit);
          }
          emit('newSource', source);
        });
      });
      req.send();
    }

    function getSource() {
      return source;
    }

    this.init = function () {
      audio.src = silentMP3;
      audio.play();
    };

    if (options.src) {
      setSource(options.src, options.lofiSrc);
    }

    this.getSource = getSource;
    this.setSource = setSource;
    this.play = play;
    this.stop = stop;
    this.isPlaying = isPlaying;
    this.getDuration = getDuration;
    this.getCurrentTime = getCurrentTime;
  }

  function createAudioStreamSource(options) {
    return new (shittyBrowser ? NonStreamedAudioSource : StreamedAudioSource)(options);
  }

  return {
    "create": createAudioStreamSource
  };
});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
  if (true) // CommonJS
    mod(__webpack_require__(0));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  function Bar(cls, orientation, scroll) {
    this.orientation = orientation;
    this.scroll = scroll;
    this.screen = this.total = this.size = 1;
    this.pos = 0;

    this.node = document.createElement("div");
    this.node.className = cls + "-" + orientation;
    this.inner = this.node.appendChild(document.createElement("div"));

    var self = this;
    CodeMirror.on(this.inner, "mousedown", function (e) {
      if (e.which != 1) return;
      CodeMirror.e_preventDefault(e);
      var axis = self.orientation == "horizontal" ? "pageX" : "pageY";
      var start = e[axis],
          startpos = self.pos;
      function done() {
        CodeMirror.off(document, "mousemove", move);
        CodeMirror.off(document, "mouseup", done);
      }
      function move(e) {
        if (e.which != 1) return done();
        self.moveTo(startpos + (e[axis] - start) * (self.total / self.size));
      }
      CodeMirror.on(document, "mousemove", move);
      CodeMirror.on(document, "mouseup", done);
    });

    CodeMirror.on(this.node, "click", function (e) {
      CodeMirror.e_preventDefault(e);
      var innerBox = self.inner.getBoundingClientRect(),
          where;
      if (self.orientation == "horizontal") where = e.clientX < innerBox.left ? -1 : e.clientX > innerBox.right ? 1 : 0;else where = e.clientY < innerBox.top ? -1 : e.clientY > innerBox.bottom ? 1 : 0;
      self.moveTo(self.pos + where * self.screen);
    });

    function onWheel(e) {
      var moved = CodeMirror.wheelEventPixels(e)[self.orientation == "horizontal" ? "x" : "y"];
      var oldPos = self.pos;
      self.moveTo(self.pos + moved);
      if (self.pos != oldPos) CodeMirror.e_preventDefault(e);
    }
    CodeMirror.on(this.node, "mousewheel", onWheel);
    CodeMirror.on(this.node, "DOMMouseScroll", onWheel);
  }

  Bar.prototype.setPos = function (pos, force) {
    if (pos < 0) pos = 0;
    if (pos > this.total - this.screen) pos = this.total - this.screen;
    if (!force && pos == this.pos) return false;
    this.pos = pos;
    this.inner.style[this.orientation == "horizontal" ? "left" : "top"] = pos * (this.size / this.total) + "px";
    return true;
  };

  Bar.prototype.moveTo = function (pos) {
    if (this.setPos(pos)) this.scroll(pos, this.orientation);
  };

  var minButtonSize = 10;

  Bar.prototype.update = function (scrollSize, clientSize, barSize) {
    var sizeChanged = this.screen != clientSize || this.total != scrollSize || this.size != barSize;
    if (sizeChanged) {
      this.screen = clientSize;
      this.total = scrollSize;
      this.size = barSize;
    }

    var buttonSize = this.screen * (this.size / this.total);
    if (buttonSize < minButtonSize) {
      this.size -= minButtonSize - buttonSize;
      buttonSize = minButtonSize;
    }
    this.inner.style[this.orientation == "horizontal" ? "width" : "height"] = buttonSize + "px";
    this.setPos(this.pos, sizeChanged);
  };

  function SimpleScrollbars(cls, place, scroll) {
    this.addClass = cls;
    this.horiz = new Bar(cls, "horizontal", scroll);
    place(this.horiz.node);
    this.vert = new Bar(cls, "vertical", scroll);
    place(this.vert.node);
    this.width = null;
  }

  SimpleScrollbars.prototype.update = function (measure) {
    if (this.width == null) {
      var style = window.getComputedStyle ? window.getComputedStyle(this.horiz.node) : this.horiz.node.currentStyle;
      if (style) this.width = parseInt(style.height);
    }
    var width = this.width || 0;

    var needsH = measure.scrollWidth > measure.clientWidth + 1;
    var needsV = measure.scrollHeight > measure.clientHeight + 1;
    this.vert.node.style.display = needsV ? "block" : "none";
    this.horiz.node.style.display = needsH ? "block" : "none";

    if (needsV) {
      this.vert.update(measure.scrollHeight, measure.clientHeight, measure.viewHeight - (needsH ? width : 0));
      this.vert.node.style.bottom = needsH ? width + "px" : "0";
    }
    if (needsH) {
      this.horiz.update(measure.scrollWidth, measure.clientWidth, measure.viewWidth - (needsV ? width : 0) - measure.barLeft);
      this.horiz.node.style.right = needsV ? width + "px" : "0";
      this.horiz.node.style.left = measure.barLeft + "px";
    }

    return { right: needsV ? width : 0, bottom: needsH ? width : 0 };
  };

  SimpleScrollbars.prototype.setScrollTop = function (pos) {
    this.vert.setPos(pos);
  };

  SimpleScrollbars.prototype.setScrollLeft = function (pos) {
    this.horiz.setPos(pos);
  };

  SimpleScrollbars.prototype.clear = function () {
    var parent = this.horiz.node.parentNode;
    parent.removeChild(this.horiz.node);
    parent.removeChild(this.vert.node);
  };

  CodeMirror.scrollbarModel.simple = function (place, scroll) {
    return new SimpleScrollbars("CodeMirror-simplescroll", place, scroll);
  };
  CodeMirror.scrollbarModel.overlay = function (place, scroll) {
    return new SimpleScrollbars("CodeMirror-overlayscroll", place, scroll);
  };
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
  /**
   * Converts an RGB color value to HSV. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes r, g, and b are contained in the set [0, 1] and
   * returns h, s, and v in the set [0, 1].
   *
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @return {number[]} The HSV representation
   */
  var rgb01ToHsv = function (r, g, b) {
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h;
    var s;
    var v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);break;
        case g:
          h = (b - r) / d + 2;break;
        case b:
          h = (r - g) / d + 4;break;
      }
      h /= 6;
    }

    return [h, s, v];
  };

  /**
   * Converts an RGB color value to HSV. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and v in the set [0, 1].
   *
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @return {number[]} The HSV representation
   */
  var rgb255ToHsv = function (r, g, b) {
    return rgb01ToHsv(r / 255, g / 255, b / 255);
  };

  /**
   * Converts an HSV color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes h, s, and v are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 1].
   *
   * @param {number} h The hue
   * @param {number} s The saturation
   * @param {number} v The value
   * @return {number[]} The RGB representation
   */
  var hsvToRgb01 = function (h, s, v) {
    var r;
    var g;
    var b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        r = v, g = t, b = p;break;
      case 1:
        r = q, g = v, b = p;break;
      case 2:
        r = p, g = v, b = t;break;
      case 3:
        r = p, g = q, b = v;break;
      case 4:
        r = t, g = p, b = v;break;
      case 5:
        r = v, g = p, b = q;break;
    }

    return [r, g, b];
  };

  /**
   * Converts an HSV color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
   * Assumes h, s, and v are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param {number} h The hue
   * @param {number} s The saturation
   * @param {number} v The value
   * @return {number[]} The RGB representation
   */
  var hsvToRgb255 = function (h, s, v) {
    var c = hsvToRgb01(h, s, v);
    return [c[0] * 255 | 0, c[1] * 255 | 0, c[2] * 255 | 0];
  };

  /**
   * Computes the perceived brightness of an RGB color
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @return {number} The perceived brightness 0-1
   */
  var rgb01Brightness = function (r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  /**
   * Computes the perceived brightness of an RGB color
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @return {number} The perceived brightness 0-1
   */
  var rgb255Brightness = function (r, g, b) {
    return rgb01Brightness(r / 255, g / 255, b / 255);
  };

  /**
   * Converts RGBA 0-1 array to css string
   * @param {number[]} c color to convert RGB or RGBA
   * @returns {string} css string for color
   */
  var makeCSSColorFromRgba01Array = function (c) {
    return makeCSSColorFromRgba01(c[0], c[1], c[2], c[3]);
  };

  /**
   * Converts RGBA 0-255 array to css string
   * @param {number[]} c color to convert RGB or RGBA
   * @returns {string} css string for color
   */
  var makeCSSColorFromRgba255Array = function (c) {
    return makeCSSColorFromRgba255(c[0], c[1], c[2], c[3]);
  };

  /**
   * Converts RGBA 0-1 color to css string
   *
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @param {number?} a The alpha color value
   * @returns {string} css string for color
   */
  var makeCSSColorFromRgba01 = function (r, g, b, a) {
    if (a === undefined) {
      a = 1;
    }
    return makeCSSColorFromRgba255(r * 255 | 0, g * 255 | 0, b * 255 | 0, a * 255 | 0);
  };

  /**
   * Converts RGBA 0-255 color to css string
   *
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @param {number?} a The alpha color value
   * @returns {string} css string for color
   */
  var makeCSSColorFromRgba255 = function (r, g, b, a) {
    if (a === undefined) {
      a = 255;
    }
    return "rgba(" + r + "," + g + "," + b + "," + a / 255 + ")";
  };

  /**
   * Converts RGB 0-1 array to css string
   * @param {number[]} c color to convert RGB
   * @returns {string} css string for color
   */
  var makeCSSColorFromRgb01Array = function (c) {
    return makeCSSColorFromRgb01.apply(null, c);
  };

  /**
   * Converts RGB 0-255 array to css string
   * @param {number[]} c color to convert RGB
   * @returns {string} css string for color
   */
  var makeCSSColorFromRgb255Array = function (c) {
    return makeCSSColorFromRgb255.apply(null, c);
  };

  /**
   * Converts RGB 0-1 color to css string
   *
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @returns {string} css string for color
   */
  var makeCSSColorFromRgb01 = function (r, g, b) {
    return makeCSSColorFromRgb255(r * 255 | 0, g * 255 | 0, b * 255 | 0);
  };

  var zeros = "00000000";
  var paddedHex = function (h, padding) {
    var s = h.toString(16);
    return zeros.substr(0, padding - s.length) + s;
  };

  /**
   * Converts RGB 0-255 color to css string
   *
   * @param {number} r The red color value
   * @param {number} g The green color value
   * @param {number} b The blue color value
   * @returns {string} css string for color
   */
  var makeCSSColorFromRgb255 = function (r, g, b) {
    return "#" + paddedHex(r, 2) + paddedHex(g, 2) + paddedHex(b, 2);
  };

  return {
    hsvToRgb01: hsvToRgb01,
    hsvToRgb255: hsvToRgb255,
    makeCSSColorFromRgba01: makeCSSColorFromRgba01,
    makeCSSColorFromRgba255: makeCSSColorFromRgba255,
    makeCSSColorFromRgba01Array: makeCSSColorFromRgba01Array,
    makeCSSColorFromRgba255Array: makeCSSColorFromRgba255Array,
    makeCSSColorFromRgb01: makeCSSColorFromRgb01,
    makeCSSColorFromRgb255: makeCSSColorFromRgb255,
    makeCSSColorFromRgb01Array: makeCSSColorFromRgb01Array,
    makeCSSColorFromRgb255Array: makeCSSColorFromRgb255Array,
    rgb01Brightness: rgb01Brightness,
    rgb01ToHsv: rgb01ToHsv,
    rgb255Brightness: rgb255Brightness,
    rgb255ToHsv: rgb255ToHsv
  };
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



/**
 * Functions for parsing CSS
 *
 * @module CSSParse
 */

!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {

  var s_colorData = {
    aliceblue: 0xfff0f8ff,
    antiquewhite: 0xfffaebd7,
    aqua: 0xff00ffff,
    aquamarine: 0xff7fffd4,
    azure: 0xfff0ffff,
    beige: 0xfff5f5dc,
    bisque: 0xffffe4c4,
    black: 0xff000000,
    blanchedalmond: 0xffffebcd,
    blue: 0xff0000ff,
    blueviolet: 0xff8a2be2,
    brown: 0xffa52a2a,
    burlywood: 0xffdeb887,
    cadetblue: 0xff5f9ea0,
    chartreuse: 0xff7fff00,
    chocolate: 0xffd2691e,
    coral: 0xffff7f50,
    cornflowerblue: 0xff6495ed,
    cornsilk: 0xfffff8dc,
    crimson: 0xffdc143c,
    cyan: 0xff00ffff,
    darkblue: 0xff00008b,
    darkcyan: 0xff008b8b,
    darkgoldenrod: 0xffb8860b,
    darkgray: 0xffa9a9a9,
    darkgrey: 0xffa9a9a9,
    darkgreen: 0xff006400,
    darkkhaki: 0xffbdb76b,
    darkmagenta: 0xff8b008b,
    darkolivegreen: 0xff556b2f,
    darkorange: 0xffff8c00,
    darkorchid: 0xff9932cc,
    darkred: 0xff8b0000,
    darksalmon: 0xffe9967a,
    darkseagreen: 0xff8fbc8f,
    darkslateblue: 0xff483d8b,
    darkslategray: 0xff2f4f4f,
    darkslategrey: 0xff2f4f4f,
    darkturquoise: 0xff00ced1,
    darkviolet: 0xff9400d3,
    deeppink: 0xffff1493,
    deepskyblue: 0xff00bfff,
    dimgray: 0xff696969,
    dimgrey: 0xff696969,
    dodgerblue: 0xff1e90ff,
    firebrick: 0xffb22222,
    floralwhite: 0xfffffaf0,
    forestgreen: 0xff228b22,
    fuchsia: 0xffff00ff,
    gainsboro: 0xffdcdcdc,
    ghostwhite: 0xfff8f8ff,
    gold: 0xffffd700,
    goldenrod: 0xffdaa520,
    gray: 0xff808080,
    grey: 0xff808080,
    green: 0xff008000,
    greenyellow: 0xffadff2f,
    honeydew: 0xfff0fff0,
    hotpink: 0xffff69b4,
    indianred: 0xffcd5c5c,
    indigo: 0xff4b0082,
    ivory: 0xfffffff0,
    khaki: 0xfff0e68c,
    lavender: 0xffe6e6fa,
    lavenderblush: 0xfffff0f5,
    lawngreen: 0xff7cfc00,
    lemonchiffon: 0xfffffacd,
    lightblue: 0xffadd8e6,
    lightcoral: 0xfff08080,
    lightcyan: 0xffe0ffff,
    lightgoldenrodyellow: 0xfffafad2,
    lightgray: 0xffd3d3d3,
    lightgrey: 0xffd3d3d3,
    lightgreen: 0xff90ee90,
    lightpink: 0xffffb6c1,
    lightsalmon: 0xffffa07a,
    lightseagreen: 0xff20b2aa,
    lightskyblue: 0xff87cefa,
    lightslateblue: 0xff8470ff,
    lightslategray: 0xff778899,
    lightslategrey: 0xff778899,
    lightsteelblue: 0xffb0c4de,
    lightyellow: 0xffffffe0,
    lime: 0xff00ff00,
    limegreen: 0xff32cd32,
    linen: 0xfffaf0e6,
    magenta: 0xffff00ff,
    maroon: 0xff800000,
    mediumaquamarine: 0xff66cdaa,
    mediumblue: 0xff0000cd,
    mediumorchid: 0xffba55d3,
    mediumpurple: 0xff9370db,
    mediumseagreen: 0xff3cb371,
    mediumslateblue: 0xff7b68ee,
    mediumspringgreen: 0xff00fa9a,
    mediumturquoise: 0xff48d1cc,
    mediumvioletred: 0xffc71585,
    midnightblue: 0xff191970,
    mintcream: 0xfff5fffa,
    mistyrose: 0xffffe4e1,
    moccasin: 0xffffe4b5,
    navajowhite: 0xffffdead,
    navy: 0xff000080,
    oldlace: 0xfffdf5e6,
    olive: 0xff808000,
    olivedrab: 0xff6b8e23,
    orange: 0xffffa500,
    orangered: 0xffff4500,
    orchid: 0xffda70d6,
    palegoldenrod: 0xffeee8aa,
    palegreen: 0xff98fb98,
    paleturquoise: 0xffafeeee,
    palevioletred: 0xffdb7093,
    papayawhip: 0xffffefd5,
    peachpuff: 0xffffdab9,
    peru: 0xffcd853f,
    pink: 0xffffc0cb,
    plum: 0xffdda0dd,
    powderblue: 0xffb0e0e6,
    purple: 0xff800080,
    red: 0xffff0000,
    rosybrown: 0xffbc8f8f,
    royalblue: 0xff4169e1,
    saddlebrown: 0xff8b4513,
    salmon: 0xfffa8072,
    sandybrown: 0xfff4a460,
    seagreen: 0xff2e8b57,
    seashell: 0xfffff5ee,
    sienna: 0xffa0522d,
    silver: 0xffc0c0c0,
    skyblue: 0xff87ceeb,
    slateblue: 0xff6a5acd,
    slategray: 0xff708090,
    slategrey: 0xff708090,
    snow: 0xfffffafa,
    springgreen: 0xff00ff7f,
    steelblue: 0xff4682b4,
    tan: 0xffd2b48c,
    teal: 0xff008080,
    thistle: 0xffd8bfd8,
    tomato: 0xffff6347,
    transparent: 0x00000000,
    turquoise: 0xff40e0d0,
    violet: 0xffee82ee,
    violetred: 0xffd02090,
    wheat: 0xfff5deb3,
    white: 0xffffffff,
    whitesmoke: 0xfff5f5f5,
    yellow: 0xffffff00,
    yellowgreen: 0xff9acd32
  };

  var s_hexrrggbbRE = /\s*#([0-9a-fA-F][0-9a-fA-F])([0-9a-fA-F][0-9a-fA-F])([0-9a-fA-F][0-9a-fA-F])\s*/;
  var s_hexrgbRE = /\s*#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])\s*/;
  var s_rgbRE = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*/;
  var s_rgbaRE = /\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(.+)\)\s*/;
  var s_nameRE = /\s*(\w+)\s*/;

  /**
   * given a CSS color string, returns an array of 4 integers
   * `[r, g, b, a]` in the range 0 to 255.
   *
   * Examples of css colors
   *
   *     name:         red,              green,            purple
   *     #RGB:         #F00,             #0F0,             #F0F
   *     #RRGGBB       #FF0000,          #00FF00,          #FF00FF
   *     rgb(r,g,b)    rgb(255,0,0)      rgb(0,255,0),     rgb(255,0,255)
   *     rgba(r,g,b,a) rgba(255,0,0,1.0) rgba(0,255,0,1.0) rgba(255,0,255,1.0)
   *
   *
   * @memberOf module:CSSParse
   * @param {string} s css color
   * @param {boolean?} opt_0to1 if true the values will be 0 to 1
   *        instead of 0 to 255 which is useful for WebGL.
   * @return {number[]} array of numbers `[r, g, b, a]` that match
   *         color.
   */
  var parseCSSColor = function (s, opt_0to1) {

    var m;
    var c;
    m = s_hexrrggbbRE.exec(s);
    if (m) {
      c = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16), 255];
    } else if (m = s_hexrgbRE.exec(s)) {
      var r = parseInt(m[1], 16);
      var g = parseInt(m[2], 16);
      var b = parseInt(m[3], 16);
      c = [r * 16 + r, g * 16 + g, b * 16 + b, 255];
    } else if (m = s_rgbRE.exec(s)) {
      c = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), 255];
    } else if (m = s_rgbaRE.exec(s)) {
      c = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), Math.floor(parseFloat(m[4]) * 255)];
    } else if (m = s_nameRE.exec(s)) {
      var name = m[1].toLowerCase();
      var color = s_colorData[name];
      if (color !== undefined) {
        c = [color >> 16 & 0xFF, color >> 8 & 0xFF, color >> 0 & 0xFF, color >> 24 & 0xFF];
      }
    }

    if (!c) {
      console.error("unsupported color format: " + s);
    }

    if (opt_0to1) {
      c[0] = c[0] / 255;
      c[1] = c[1] / 255;
      c[2] = c[2] / 255;
      c[3] = c[3] / 255;
    }

    return c;
  };

  /*
  var res = [
      "#1af",
      " #1af ",
      "#12abef",
      " #12abef ",
      "rgb(30,100,255)",
      " rgb( 30 , 100 , 255 ) ",
      "rgba(30,100,255,0.5)",
      " rgba( 30 , 100 , 255 , 0.5 ) ",
      "green",
      " purple ",
  ];
  console.log("here!");
  for (var ii = 0; ii < res.length; ++ii) {
    var a = parseCSSColor(res[ii]);
    console.log("" + ii + ": " + a);
  }
  */

  return {
    parseCSSColor: parseCSSColor
  };
}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(0)], __WEBPACK_AMD_DEFINE_RESULT__ = function (CodeMirror) {
  "use strict";

  CodeMirror.defineMode("glsl", function (config, parserConfig) {
    var indentUnit = config.indentUnit,
        keywords = parserConfig.keywords || {},
        builtins = parserConfig.builtins || {},
        blockKeywords = parserConfig.blockKeywords || {},
        atoms = parserConfig.atoms || {},
        hooks = parserConfig.hooks || {},
        multiLineStrings = parserConfig.multiLineStrings;
    var isOperatorChar = /[+\-*&%=<>!?|\/]/;

    var curPunc;

    function tokenBase(stream, state) {
      var ch = stream.next();
      if (hooks[ch]) {
        var result = hooks[ch](stream, state);
        if (result !== false) return result;
      }
      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
        curPunc = ch;
        return "bracket";
      }
      if (/\d/.test(ch)) {
        stream.eatWhile(/[\w\.]/);
        return "number";
      }
      if (ch == "/") {
        if (stream.eat("*")) {
          state.tokenize = tokenComment;
          return tokenComment(stream, state);
        }
        if (stream.eat("/")) {
          stream.skipToEnd();
          return "comment";
        }
      }
      if (isOperatorChar.test(ch)) {
        stream.eatWhile(isOperatorChar);
        return "operator";
      }
      stream.eatWhile(/[\w\$_]/);
      var cur = stream.current();
      if (keywords.propertyIsEnumerable(cur)) {
        if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
        return "keyword";
      }
      if (builtins.propertyIsEnumerable(cur)) {
        return "builtin";
      }
      if (atoms.propertyIsEnumerable(cur)) return "atom";
      return "word";
    }

    function tokenString(quote) {
      return function (stream, state) {
        var escaped = false,
            next,
            end = false;
        while ((next = stream.next()) != null) {
          if (next == quote && !escaped) {
            end = true;break;
          }
          escaped = !escaped && next == "\\";
        }
        if (end || !(escaped || multiLineStrings)) state.tokenize = tokenBase;
        return "string";
      };
    }

    function tokenComment(stream, state) {
      var maybeEnd = false,
          ch;
      while (ch = stream.next()) {
        if (ch == "/" && maybeEnd) {
          state.tokenize = tokenBase;
          break;
        }
        maybeEnd = ch == "*";
      }
      return "comment";
    }

    function Context(indented, column, type, align, prev) {
      this.indented = indented;
      this.column = column;
      this.type = type;
      this.align = align;
      this.prev = prev;
    }
    function pushContext(state, col, type) {
      return state.context = new Context(state.indented, col, type, null, state.context);
    }
    function popContext(state) {
      var t = state.context.type;
      if (t == ")" || t == "]" || t == "}") state.indented = state.context.indented;
      return state.context = state.context.prev;
    }

    // Interface

    return {
      startState: function (basecolumn) {
        return {
          tokenize: null,
          context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
          indented: 0,
          startOfLine: true
        };
      },

      token: function (stream, state) {
        var ctx = state.context;
        if (stream.sol()) {
          if (ctx.align == null) ctx.align = false;
          state.indented = stream.indentation();
          state.startOfLine = true;
        }
        if (stream.eatSpace()) return null;
        curPunc = null;
        var style = (state.tokenize || tokenBase)(stream, state);
        if (style == "comment" || style == "meta") return style;
        if (ctx.align == null) ctx.align = true;

        if ((curPunc == ";" || curPunc == ":") && ctx.type == "statement") popContext(state);else if (curPunc == "{") pushContext(state, stream.column(), "}");else if (curPunc == "[") pushContext(state, stream.column(), "]");else if (curPunc == "(") pushContext(state, stream.column(), ")");else if (curPunc == "}") {
          while (ctx.type == "statement") ctx = popContext(state);
          if (ctx.type == "}") ctx = popContext(state);
          while (ctx.type == "statement") ctx = popContext(state);
        } else if (curPunc == ctx.type) popContext(state);else if (ctx.type == "}" || ctx.type == "top" || ctx.type == "statement" && curPunc == "newstatement") pushContext(state, stream.column(), "statement");
        state.startOfLine = false;
        return style;
      },

      indent: function (state, textAfter) {
        if (state.tokenize != tokenBase && state.tokenize != null) return 0;
        var firstChar = textAfter && textAfter.charAt(0),
            ctx = state.context,
            closing = firstChar == ctx.type;
        if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : indentUnit);else if (ctx.align) return ctx.column + (closing ? 0 : 1);else return ctx.indented + (closing ? 0 : indentUnit);
      },

      electricChars: "{}"
    };
  });

  (function () {
    function words(str) {
      var obj = {},
          words = str.split(" ");
      for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
      return obj;
    }
    var glslKeywords = "attribute const uniform varying break continue " + "do for while if else in out inout float int void bool true false " + "lowp mediump highp precision invariant discard return mat2 mat3 " + "mat4 vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 sampler2D " + "samplerCube struct gl_FragCoord gl_FragColor";
    var glslBuiltins = "radians degrees sin cos tan asin acos atan pow " + "exp log exp2 log2 sqrt inversesqrt abs sign floor ceil fract mod " + "min max clamp mix step smoothstep length distance dot cross " + "normalize faceforward reflect refract matrixCompMult lessThan " + "lessThanEqual greaterThan greaterThanEqual equal notEqual any all " + "not dFdx dFdy fwidth texture2D texture2DProj texture2DLod " + "texture2DProjLod textureCube textureCubeLod";

    function cppHook(stream, state) {
      if (!state.startOfLine) return false;
      stream.skipToEnd();
      return "meta";
    }

    // C#-style strings where "" escapes a quote.
    function tokenAtString(stream, state) {
      var next;
      while ((next = stream.next()) != null) {
        if (next == '"' && !stream.eat('"')) {
          state.tokenize = null;
          break;
        }
      }
      return "string";
    }

    CodeMirror.defineMIME("x-text/x-glsl", {
      name: "glsl",
      keywords: words(glslKeywords),
      builtins: words(glslBuiltins),
      blockKeywords: words("case do else for if switch while struct"),
      atoms: words("null"),
      hooks: { "#": cppHook }
    });
  })();
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*!
 * Some equations are adapted from Thomas Fuchs' [Scripty2](https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/penner.js).
 *
 * Based on Easing Equations (c) 2003 [Robert Penner](http://www.robertpenner.com/), all rights reserved. This work is [subject to terms](http://www.robertpenner.com/easing_terms_of_use.html).
 */

/*!
 *  TERMS OF USE - EASING EQUATIONS
 *  Open source under the BSD License.
 *  Easing Equations (c) 2003 Robert Penner, all rights reserved.
 */

!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {

  function easeInQuad(pos) {
    return Math.pow(pos, 2);
  }

  function easeOutQuad(pos) {
    return -(Math.pow(pos - 1, 2) - 1);
  }

  function easeInOutQuad(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 2);
    }
    return -0.5 * ((pos -= 2) * pos - 2);
  }

  function easeInCubic(pos) {
    return Math.pow(pos, 3);
  }

  function easeOutCubic(pos) {
    return Math.pow(pos - 1, 3) + 1;
  }

  function easeInOutCubic(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 3);
    }
    return 0.5 * (Math.pow(pos - 2, 3) + 2);
  }

  function easeInQuart(pos) {
    return Math.pow(pos, 4);
  }

  function easeOutQuart(pos) {
    return -(Math.pow(pos - 1, 4) - 1);
  }

  function easeInOutQuart(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 4);
    }
    return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
  }

  function easeInQuint(pos) {
    return Math.pow(pos, 5);
  }

  function easeOutQuint(pos) {
    return Math.pow(pos - 1, 5) + 1;
  }

  function easeInOutQuint(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 5);
    }
    return 0.5 * (Math.pow(pos - 2, 5) + 2);
  }

  function easeInSine(pos) {
    return -Math.cos(pos * (Math.PI / 2)) + 1;
  }

  function easeOutSine(pos) {
    return Math.sin(pos * (Math.PI / 2));
  }

  function easeInOutSine(pos) {
    return -0.5 * (Math.cos(Math.PI * pos) - 1);
  }

  function easeInExpo(pos) {
    return pos === 0 ? 0 : Math.pow(2, 10 * (pos - 1));
  }

  function easeOutExpo(pos) {
    return pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1;
  }

  function easeInOutExpo(pos) {
    if (pos === 0) {
      return 0;
    }
    if (pos === 1) {
      return 1;
    }
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(2, 10 * (pos - 1));
    }
    return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
  }

  function easeInCirc(pos) {
    return -(Math.sqrt(1 - pos * pos) - 1);
  }

  function easeOutCirc(pos) {
    return Math.sqrt(1 - Math.pow(pos - 1, 2));
  }

  function easeInOutCirc(pos) {
    if ((pos /= 0.5) < 1) {
      return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
    }
    return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
  }

  function easeOutBounce(pos) {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    } else if (pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    } else {
      return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
    }
  }

  function easeInBack(pos) {
    var s = 1.70158;
    return pos * pos * ((s + 1) * pos - s);
  }

  function easeOutBack(pos) {
    var s = 1.70158;
    return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
  }

  function easeInOutBack(pos) {
    var s = 1.70158;
    if ((pos /= 0.5) < 1) {
      return 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s));
    }
    return 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
  }

  function elastic(pos) {
    return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
  }

  function swingFromTo(pos) {
    var s = 1.70158;
    return (pos /= 0.5) < 1 ? 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s)) : 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
  }

  function swingFrom(pos) {
    var s = 1.70158;
    return pos * pos * ((s + 1) * pos - s);
  }

  function swingTo(pos) {
    var s = 1.70158;
    return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
  }

  function bounce(pos) {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    } else if (pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    } else {
      return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
    }
  }

  function bouncePast(pos) {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 2 - (7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75);
    } else if (pos < 2.5 / 2.75) {
      return 2 - (7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375);
    } else {
      return 2 - (7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375);
    }
  }

  function easeFromTo(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 4);
    }
    return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
  }

  function easeFrom(pos) {
    return Math.pow(pos, 4);
  }

  function easeTo(pos) {
    return Math.pow(pos, 0.25);
  }

  function linear(pos) {
    return pos;
  }

  // goes from 0->1->0 again
  function boomerang(pos) {
    return Math.sin(pos * Math.PI);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // goes from 0->1->0 again
  function boomerangSmooth(pos) {
    pos = Math.sin(lerp(-Math.PI * 0.5, Math.PI * 0.5, pos)) * 0.5 + 0.5;
    return Math.sin(pos * Math.PI);
  }

  // goes from 0->1->0 again
  function bounceBack(pos) {
    var level = 1 + (pos * 4 | 0) % 4;
    return Math.sin(pos * Math.PI * 4) / (level * level);
  }

  var easeFunctions = {
    easeInQuad: easeInQuad,
    easeOutQuad: easeOutQuad,
    easeInOutQuad: easeInOutQuad,
    easeInCubic: easeInCubic,
    easeOutCubic: easeOutCubic,
    easeInOutCubic: easeInOutCubic,
    easeInQuart: easeInQuart,
    easeOutQuart: easeOutQuart,
    easeInOutQuart: easeInOutQuart,
    easeInQuint: easeInQuint,
    easeOutQuint: easeOutQuint,
    easeInOutQuint: easeInOutQuint,
    easeInSine: easeInSine,
    easeOutSine: easeOutSine,
    easeInOutSine: easeInOutSine,
    easeInExpo: easeInExpo,
    easeOutExpo: easeOutExpo,
    easeInOutExpo: easeInOutExpo,
    easeInCirc: easeInCirc,
    easeOutCirc: easeOutCirc,
    easeInOutCirc: easeInOutCirc,
    easeOutBounce: easeOutBounce,
    easeInBack: easeInBack,
    easeOutBack: easeOutBack,
    easeInOutBack: easeInOutBack,
    elastic: elastic,
    swingFromTo: swingFromTo,
    swingFrom: swingFrom,
    swingTo: swingTo,
    bounce: bounce,
    bouncePast: bouncePast,
    easeFromTo: easeFromTo,
    easeFrom: easeFrom,
    easeTo: easeTo,
    linear: linear,
    bounceBack: bounceBack,
    boomerang: boomerang,
    boomerangSmooth: boomerangSmooth
  };

  var Tweener = function (target, duration, from, to) {
    this.setup(target, duration, from, to);
  };

  var isSpecial = function () {
    var specials = {
      ease: true, // ease func
      onFinish: true,
      onStart: true,
      onReverseStart: true,
      onReverseFinish: true,
      onUpdate: true,
      paused: true,
      delay: true,
      startRelative: true, // use start values relative to when this tween starts (is this overkill? maybe you should use an onFinish and setup a new tween)
      endRelative: true // use end values relative to when this tween ends
    };

    return function isSpecial(prop) {
      return specials[prop];
    };
  }();

  var emptyObj = {};

  function numberLerp(dst, start, end, lerp) {
    return start + (end - start) * lerp;
  }

  function arrayLerp(dst, start, end, lerp) {
    var len = start.length;
    for (var ii = 0; ii < len; ++ii) {
      dst[ii] = start[ii] + (end[ii] - start[ii]) * lerp;
    }
    return dst;
  }

  function copyValue(v) {
    return Array.isArray(v) ? v.slice() : v;
  }

  Tweener.prototype.setup = function (target, duration, from, to) {
    if (!to) {
      to = from;
      from = emptyObj;
    }
    var keys = {};
    function addKey(key) {
      keys[key] = true;
    };
    Object.keys(to).forEach(addKey);
    Object.keys(from).forEach(addKey);
    var props = [];
    var specials = {};
    Object.keys(keys).forEach(function (key) {
      if (isSpecial(key)) {
        specials[key] = to[key] !== undefined ? to[key] : from[key];
      } else {
        props.push(key);
      }
    });
    var numProps = props.length;
    var starts = [];
    var ends = [];
    var lerpFns = [];

    for (var ii = 0; ii < numProps; ++ii) {
      var prop = props[ii];
      starts[ii] = copyValue(from[prop] !== undefined ? from[prop] : target[prop]);
      ends[ii] = copyValue(to[prop] !== undefined ? to[prop] : target[prop]);
      var v = starts[ii];
      var lerpFn = numberLerp;
      if (Array.isArray(v)) {
        lerpFn = arrayLerp;
      }
      lerpFns[ii] = lerpFn;
    }

    this.target = target;
    this.props = props;
    this.starts = starts;
    this.ends = ends;
    this.lerpFns = lerpFns;
    this.running = !specials.paused;
    this.duration = duration || 1;
    this.delay = specials.delay || 0;
    this.easeFn = specials.ease || linear;
    this.speed = specials.speed || 1;
    this.direction = specials.reverse ? -1 : 1;
    this.timer = 0;
    this.options = specials;
    this.onStart = specials.onStart;
    this.onFinish = specials.onFinish;
    this.onReverseStart = specials.onReverseStart;
    this.onReverseFinish = specials.onReverseFinish;
    this.onUpdate = specials.onUpdate;
  };

  Tweener.prototype.update = function (deltaTime) {
    if (!this.running) {
      return true;
    }
    // let timer overflow so we can tell
    // how much into next tween to start
    var oldTime = this.timer - this.delay;
    var actualSpeed = this.speed * this.direction * deltaTime;
    this.timer += actualSpeed;
    var time = this.timer - this.delay;

    // Need to handle last/first frames
    var starting = false;
    var finishing = false;

    if (actualSpeed > 0) {
      if (oldTime <= 0 && time > 0) {
        starting = true;
      }
      if (oldTime < this.duration && time >= this.duration) {
        finishing = true;
      }
    } else {
      if (oldTime >= this.duration && time < this.duration) {
        starting = true;
      }
      if (oldTime > 0 && time <= 0) {
        finishing = true;
      }
    }

    if (time >= 0) {
      var target = this.target;
      var props = this.props;
      var starts = this.starts;
      var ends = this.ends;
      var lerpFns = this.lerpFns;
      var easeFn = this.easeFn;
      // clamp because we let it overflow. See above
      var pos = Math.max(0, Math.min(time / this.duration, 1));
      var numProps = props.length;
      for (var ii = 0; ii < numProps; ++ii) {
        var prop = props[ii];
        target[prop] = lerpFns[ii](target[prop], starts[ii], ends[ii], easeFn(pos));
      }

      if (this.onUpdate) {
        this.onUpdate(this);
      }
    }

    if (actualSpeed > 0) {
      if (starting && this.onStart) {
        this.onStart(this);
      }
      if (finishing && this.onFinish) {
        this.onFinish(this);
      }
    } else {
      if (starting && this.onReverseStart) {
        this.onReverseStart(this);
      }
      if (finishing && this.onReverseFinish) {
        this.onReverseFinish(this);
      }
    }

    return time < this.duration;
  };

  Tweener.prototype.isFinished = function () {
    return this.timer - this.delay >= this.duration;
  };

  var TweenManager = function () {
    this.tweeners = [];
    this.newTweeners = [];
  };

  TweenManager.prototype.haveTweens = function () {
    return this.tweeners.length + this.newTweeners.length;
  };

  TweenManager.prototype.update = function (deltaTime) {
    // TODO: optimize? We can keep the arrays around, track highest used, put Tweeners on free list,
    //   use loop so we're not creating a new closure every time?
    if (this.newTweeners.length) {
      this.tweeners = this.tweeners.concat(this.newTweeners);
      this.newTweeners = [];
    }
    this.tweeners = this.tweeners.filter(function (tweener) {
      return tweener.update(deltaTime);
    });
  };

  TweenManager.prototype.addTweener = function (tweener) {
    this.newTweeners.push(tweener);
    return tweener;
  };

  TweenManager.prototype.to = function (target, duration, to) {
    return this.addTweener(new Tweener(target, duration, to));
  };

  TweenManager.prototype.from = function (target, duration, from) {
    return this.addTweener(new Tweener(target, duration, from, {}));
  };

  TweenManager.prototype.fromTo = function (target, duration, from, to) {
    return this.addTweener(new Tweener(target, duration, from, to));
  };

  // thinking out loud, in the past an animation would have been just a lot of points
  // with linear interpolation.
  var Timeline = function () {
    this.tweeners = [];
  };

  return {
    "TweenManager": TweenManager,
    "fn": easeFunctions
  };
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * @license twgl.js 4.0.0 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
 * Available via the MIT license.
 * see: http://github.com/greggman/twgl.js for details
 */
(function webpackUniversalModuleDefinition(root, factory) {
  if (true) module.exports = factory();else if (typeof define === 'function' && define.amd) define([], factory);else if (typeof exports === 'object') exports["twgl"] = factory();else root["twgl"] = factory();
})(this, function () {
  return (/******/function (modules) {
      // webpackBootstrap
      /******/ // The module cache
      /******/var installedModules = {};
      /******/
      /******/ // The require function
      /******/function __webpack_require__(moduleId) {
        /******/
        /******/ // Check if module is in cache
        /******/if (installedModules[moduleId]) {
          /******/return installedModules[moduleId].exports;
          /******/
        }
        /******/ // Create a new module (and put it into the cache)
        /******/var module = installedModules[moduleId] = {
          /******/i: moduleId,
          /******/l: false,
          /******/exports: {}
          /******/ };
        /******/
        /******/ // Execute the module function
        /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        /******/
        /******/ // Flag the module as loaded
        /******/module.l = true;
        /******/
        /******/ // Return the exports of the module
        /******/return module.exports;
        /******/
      }
      /******/
      /******/
      /******/ // expose the modules object (__webpack_modules__)
      /******/__webpack_require__.m = modules;
      /******/
      /******/ // expose the module cache
      /******/__webpack_require__.c = installedModules;
      /******/
      /******/ // define getter function for harmony exports
      /******/__webpack_require__.d = function (exports, name, getter) {
        /******/if (!__webpack_require__.o(exports, name)) {
          /******/Object.defineProperty(exports, name, {
            /******/configurable: false,
            /******/enumerable: true,
            /******/get: getter
            /******/ });
          /******/
        }
        /******/
      };
      /******/
      /******/ // getDefaultExport function for compatibility with non-harmony modules
      /******/__webpack_require__.n = function (module) {
        /******/var getter = module && module.__esModule ?
        /******/function getDefault() {
          return module['default'];
        } :
        /******/function getModuleExports() {
          return module;
        };
        /******/__webpack_require__.d(getter, 'a', getter);
        /******/return getter;
        /******/
      };
      /******/
      /******/ // Object.prototype.hasOwnProperty.call
      /******/__webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
      };
      /******/
      /******/ // __webpack_public_path__
      /******/__webpack_require__.p = "";
      /******/
      /******/ // Load entry module and return exports
      /******/return __webpack_require__(__webpack_require__.s = 7);
      /******/
    }(
    /************************************************************************/
    /******/[
    /* 0 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      /**
       * Copy an object 1 level deep
       * @param {object} src object to copy
       * @return {object} the copy
       */
      function shallowCopy(src) {
        var dst = {};
        Object.keys(src).forEach(function (key) {
          dst[key] = src[key];
        });
        return dst;
      }

      /**
       * Copy named properties
       *
       * @param {string[]} names names of properties to copy
       * @param {object} src object to copy properties from
       * @param {object} dst object to copy properties to
       */
      function copyNamedProperties(names, src, dst) {
        names.forEach(function (name) {
          var value = src[name];
          if (value !== undefined) {
            dst[name] = value;
          }
        });
      }

      /**
       * Copies properties from source to dest only if a matching key is in dest
       *
       * @param {Object.<string, ?>} src the source
       * @param {Object.<string, ?>} dst the dest
       */
      function copyExistingProperties(src, dst) {
        Object.keys(dst).forEach(function (key) {
          if (dst.hasOwnProperty(key) && src.hasOwnProperty(key)) {
            dst[key] = src[key];
          }
        });
      }

      /**
       * Gets the gl version as a number
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @return {number} version of gl
       */
      //function getVersionAsNumber(gl) {
      //  return parseFloat(gl.getParameter(gl.VERSION).substr(6));
      //}

      /**
       * Check if context is WebGL 2.0
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @return {bool} true if it's WebGL 2.0
       * @memberOf module:twgl
       */
      function isWebGL2(gl) {
        // This is the correct check but it's slow
        //  return gl.getParameter(gl.VERSION).indexOf("WebGL 2.0") === 0;
        // This might also be the correct check but I'm assuming it's slow-ish
        // return gl instanceof WebGL2RenderingContext;
        return !!gl.texStorage2D;
      }

      /**
       * Check if context is WebGL 1.0
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @return {bool} true if it's WebGL 1.0
       * @memberOf module:twgl
       */
      function isWebGL1(gl) {
        // This is the correct check but it's slow
        //const version = getVersionAsNumber(gl);
        //return version <= 1.0 && version > 0.0;  // because as of 2016/5 Edge returns 0.96
        // This might also be the correct check but I'm assuming it's slow-ish
        // return gl instanceof WebGLRenderingContext;
        return !gl.texStorage2D;
      }

      var error = window.console && window.console.error && typeof window.console.error === "function" ? window.console.error.bind(window.console) : function () {};

      var warn = window.console && window.console.warn && typeof window.console.warn === "function" ? window.console.warn.bind(window.console) : function () {};

      exports.copyExistingProperties = copyExistingProperties;
      exports.copyNamedProperties = copyNamedProperties;
      exports.shallowCopy = shallowCopy;
      exports.isWebGL1 = isWebGL1;
      exports.isWebGL2 = isWebGL2;
      exports.error = error;
      exports.warn = warn;

      /***/
    },
    /* 1 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      /**
       * Low level shader typed array related functions
       *
       * You should generally not need to use these functions. They are provided
       * for those cases where you're doing something out of the ordinary
       * and you need lower level access.
       *
       * For backward compatibily they are available at both `twgl.typedArray` and `twgl`
       * itself
       *
       * See {@link module:twgl} for core functions
       *
       * @module twgl/typedArray
       */

      // make sure we don't see a global gl
      var gl = undefined; // eslint-disable-line

      /* DataType */
      var BYTE = 0x1400;
      var UNSIGNED_BYTE = 0x1401;
      var SHORT = 0x1402;
      var UNSIGNED_SHORT = 0x1403;
      var INT = 0x1404;
      var UNSIGNED_INT = 0x1405;
      var FLOAT = 0x1406;
      var UNSIGNED_SHORT_4_4_4_4 = 0x8033;
      var UNSIGNED_SHORT_5_5_5_1 = 0x8034;
      var UNSIGNED_SHORT_5_6_5 = 0x8363;
      var HALF_FLOAT = 0x140B;
      var UNSIGNED_INT_2_10_10_10_REV = 0x8368;
      var UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
      var UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
      var FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
      var UNSIGNED_INT_24_8 = 0x84FA;

      var glTypeToTypedArray = {};
      {
        var tt = glTypeToTypedArray;
        tt[BYTE] = Int8Array;
        tt[UNSIGNED_BYTE] = Uint8Array;
        tt[SHORT] = Int16Array;
        tt[UNSIGNED_SHORT] = Uint16Array;
        tt[INT] = Int32Array;
        tt[UNSIGNED_INT] = Uint32Array;
        tt[FLOAT] = Float32Array;
        tt[UNSIGNED_SHORT_4_4_4_4] = Uint16Array;
        tt[UNSIGNED_SHORT_5_5_5_1] = Uint16Array;
        tt[UNSIGNED_SHORT_5_6_5] = Uint16Array;
        tt[HALF_FLOAT] = Uint16Array;
        tt[UNSIGNED_INT_2_10_10_10_REV] = Uint32Array;
        tt[UNSIGNED_INT_10F_11F_11F_REV] = Uint32Array;
        tt[UNSIGNED_INT_5_9_9_9_REV] = Uint32Array;
        tt[FLOAT_32_UNSIGNED_INT_24_8_REV] = Uint32Array;
        tt[UNSIGNED_INT_24_8] = Uint32Array;
      }

      /**
       * Get the GL type for a typedArray
       * @param {ArrayBuffer|ArrayBufferView} typedArray a typedArray
       * @return {number} the GL type for array. For example pass in an `Int8Array` and `gl.BYTE` will
       *   be returned. Pass in a `Uint32Array` and `gl.UNSIGNED_INT` will be returned
       * @memberOf module:twgl/typedArray
       */
      function getGLTypeForTypedArray(typedArray) {
        if (typedArray instanceof Int8Array) {
          return BYTE;
        } // eslint-disable-line
        if (typedArray instanceof Uint8Array) {
          return UNSIGNED_BYTE;
        } // eslint-disable-line
        if (typedArray instanceof Uint8ClampedArray) {
          return UNSIGNED_BYTE;
        } // eslint-disable-line
        if (typedArray instanceof Int16Array) {
          return SHORT;
        } // eslint-disable-line
        if (typedArray instanceof Uint16Array) {
          return UNSIGNED_SHORT;
        } // eslint-disable-line
        if (typedArray instanceof Int32Array) {
          return INT;
        } // eslint-disable-line
        if (typedArray instanceof Uint32Array) {
          return UNSIGNED_INT;
        } // eslint-disable-line
        if (typedArray instanceof Float32Array) {
          return FLOAT;
        } // eslint-disable-line
        throw "unsupported typed array type";
      }

      /**
       * Get the GL type for a typedArray type
       * @param {ArrayBufferViewType} typedArrayType a typedArray constructor
       * @return {number} the GL type for type. For example pass in `Int8Array` and `gl.BYTE` will
       *   be returned. Pass in `Uint32Array` and `gl.UNSIGNED_INT` will be returned
       * @memberOf module:twgl/typedArray
       */
      function getGLTypeForTypedArrayType(typedArrayType) {
        if (typedArrayType === Int8Array) {
          return BYTE;
        } // eslint-disable-line
        if (typedArrayType === Uint8Array) {
          return UNSIGNED_BYTE;
        } // eslint-disable-line
        if (typedArrayType === Uint8ClampedArray) {
          return UNSIGNED_BYTE;
        } // eslint-disable-line
        if (typedArrayType === Int16Array) {
          return SHORT;
        } // eslint-disable-line
        if (typedArrayType === Uint16Array) {
          return UNSIGNED_SHORT;
        } // eslint-disable-line
        if (typedArrayType === Int32Array) {
          return INT;
        } // eslint-disable-line
        if (typedArrayType === Uint32Array) {
          return UNSIGNED_INT;
        } // eslint-disable-line
        if (typedArrayType === Float32Array) {
          return FLOAT;
        } // eslint-disable-line
        throw "unsupported typed array type";
      }

      /**
       * Get the typed array constructor for a given GL type
       * @param {number} type the GL type. (eg: `gl.UNSIGNED_INT`)
       * @return {function} the constructor for a the corresponding typed array. (eg. `Uint32Array`).
       * @memberOf module:twgl/typedArray
       */
      function getTypedArrayTypeForGLType(type) {
        var CTOR = glTypeToTypedArray[type];
        if (!CTOR) {
          throw "unknown gl type";
        }
        return CTOR;
      }

      var isArrayBuffer = window.SharedArrayBuffer ? function isArrayBufferOrSharedArrayBuffer(a) {
        return a && a.buffer && (a.buffer instanceof ArrayBuffer || a.buffer instanceof window.SharedArrayBuffer);
      } : function isArrayBuffer(a) {
        return a && a.buffer && a.buffer instanceof ArrayBuffer;
      };

      exports.getGLTypeForTypedArray = getGLTypeForTypedArray;
      exports.getGLTypeForTypedArrayType = getGLTypeForTypedArrayType;
      exports.getTypedArrayTypeForGLType = getTypedArrayTypeForGLType;
      exports.isArrayBuffer = isArrayBuffer;

      /***/
    },
    /* 2 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.bindUniformBlock = exports.setBlockUniforms = exports.setUniformBlock = exports.setUniforms = exports.setBuffersAndAttributes = exports.setAttributes = exports.bindTransformFeedbackInfo = exports.createTransformFeedbackInfo = exports.createTransformFeedback = exports.createUniformBlockInfo = exports.createUniformBlockInfoFromProgram = exports.createUniformBlockSpecFromProgram = exports.createUniformSetters = exports.createProgramInfoFromProgram = exports.createProgramInfo = exports.createProgramFromSources = exports.createProgramFromScripts = exports.createProgram = exports.createAttributeSetters = undefined;

      var _utils = __webpack_require__(0);

      var utils = _interopRequireWildcard(_utils);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * Low level shader program related functions
       *
       * You should generally not need to use these functions. They are provided
       * for those cases where you're doing something out of the ordinary
       * and you need lower level access.
       *
       * For backward compatibily they are available at both `twgl.programs` and `twgl`
       * itself
       *
       * See {@link module:twgl} for core functions
       *
       * @module twgl/programs
       */

      var error = utils.error; /*
                                * Copyright 2015, Gregg Tavares.
                                * All rights reserved.
                                *
                                * Redistribution and use in source and binary forms, with or without
                                * modification, are permitted provided that the following conditions are
                                * met:
                                *
                                *     * Redistributions of source code must retain the above copyright
                                * notice, this list of conditions and the following disclaimer.
                                *     * Redistributions in binary form must reproduce the above
                                * copyright notice, this list of conditions and the following disclaimer
                                * in the documentation and/or other materials provided with the
                                * distribution.
                                *     * Neither the name of Gregg Tavares. nor the names of his
                                * contributors may be used to endorse or promote products derived from
                                * this software without specific prior written permission.
                                *
                                * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
                                * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
                                * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
                                * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
                                * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
                                * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
                                * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
                                * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
                                * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
                                * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                */

      var warn = utils.warn;

      var FLOAT = 0x1406;
      var FLOAT_VEC2 = 0x8B50;
      var FLOAT_VEC3 = 0x8B51;
      var FLOAT_VEC4 = 0x8B52;
      var INT = 0x1404;
      var INT_VEC2 = 0x8B53;
      var INT_VEC3 = 0x8B54;
      var INT_VEC4 = 0x8B55;
      var BOOL = 0x8B56;
      var BOOL_VEC2 = 0x8B57;
      var BOOL_VEC3 = 0x8B58;
      var BOOL_VEC4 = 0x8B59;
      var FLOAT_MAT2 = 0x8B5A;
      var FLOAT_MAT3 = 0x8B5B;
      var FLOAT_MAT4 = 0x8B5C;
      var SAMPLER_2D = 0x8B5E;
      var SAMPLER_CUBE = 0x8B60;
      var SAMPLER_3D = 0x8B5F;
      var SAMPLER_2D_SHADOW = 0x8B62;
      var FLOAT_MAT2x3 = 0x8B65;
      var FLOAT_MAT2x4 = 0x8B66;
      var FLOAT_MAT3x2 = 0x8B67;
      var FLOAT_MAT3x4 = 0x8B68;
      var FLOAT_MAT4x2 = 0x8B69;
      var FLOAT_MAT4x3 = 0x8B6A;
      var SAMPLER_2D_ARRAY = 0x8DC1;
      var SAMPLER_2D_ARRAY_SHADOW = 0x8DC4;
      var SAMPLER_CUBE_SHADOW = 0x8DC5;
      var UNSIGNED_INT = 0x1405;
      var UNSIGNED_INT_VEC2 = 0x8DC6;
      var UNSIGNED_INT_VEC3 = 0x8DC7;
      var UNSIGNED_INT_VEC4 = 0x8DC8;
      var INT_SAMPLER_2D = 0x8DCA;
      var INT_SAMPLER_3D = 0x8DCB;
      var INT_SAMPLER_CUBE = 0x8DCC;
      var INT_SAMPLER_2D_ARRAY = 0x8DCF;
      var UNSIGNED_INT_SAMPLER_2D = 0x8DD2;
      var UNSIGNED_INT_SAMPLER_3D = 0x8DD3;
      var UNSIGNED_INT_SAMPLER_CUBE = 0x8DD4;
      var UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;

      var TEXTURE_2D = 0x0DE1;
      var TEXTURE_CUBE_MAP = 0x8513;
      var TEXTURE_3D = 0x806F;
      var TEXTURE_2D_ARRAY = 0x8C1A;

      var typeMap = {};

      /**
       * Returns the corresponding bind point for a given sampler type
       */
      function getBindPointForSamplerType(gl, type) {
        return typeMap[type].bindPoint;
      }

      // This kind of sucks! If you could compose functions as in `var fn = gl[name];`
      // this code could be a lot smaller but that is sadly really slow (T_T)

      function floatSetter(gl, location) {
        return function (v) {
          gl.uniform1f(location, v);
        };
      }

      function floatArraySetter(gl, location) {
        return function (v) {
          gl.uniform1fv(location, v);
        };
      }

      function floatVec2Setter(gl, location) {
        return function (v) {
          gl.uniform2fv(location, v);
        };
      }

      function floatVec3Setter(gl, location) {
        return function (v) {
          gl.uniform3fv(location, v);
        };
      }

      function floatVec4Setter(gl, location) {
        return function (v) {
          gl.uniform4fv(location, v);
        };
      }

      function intSetter(gl, location) {
        return function (v) {
          gl.uniform1i(location, v);
        };
      }

      function intArraySetter(gl, location) {
        return function (v) {
          gl.uniform1iv(location, v);
        };
      }

      function intVec2Setter(gl, location) {
        return function (v) {
          gl.uniform2iv(location, v);
        };
      }

      function intVec3Setter(gl, location) {
        return function (v) {
          gl.uniform3iv(location, v);
        };
      }

      function intVec4Setter(gl, location) {
        return function (v) {
          gl.uniform4iv(location, v);
        };
      }

      function uintSetter(gl, location) {
        return function (v) {
          gl.uniform1ui(location, v);
        };
      }

      function uintArraySetter(gl, location) {
        return function (v) {
          gl.uniform1uiv(location, v);
        };
      }

      function uintVec2Setter(gl, location) {
        return function (v) {
          gl.uniform2uiv(location, v);
        };
      }

      function uintVec3Setter(gl, location) {
        return function (v) {
          gl.uniform3uiv(location, v);
        };
      }

      function uintVec4Setter(gl, location) {
        return function (v) {
          gl.uniform4uiv(location, v);
        };
      }

      function floatMat2Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix2fv(location, false, v);
        };
      }

      function floatMat3Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix3fv(location, false, v);
        };
      }

      function floatMat4Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix4fv(location, false, v);
        };
      }

      function floatMat23Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix2x3fv(location, false, v);
        };
      }

      function floatMat32Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix3x2fv(location, false, v);
        };
      }

      function floatMat24Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix2x4fv(location, false, v);
        };
      }

      function floatMat42Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix4x2fv(location, false, v);
        };
      }

      function floatMat34Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix3x4fv(location, false, v);
        };
      }

      function floatMat43Setter(gl, location) {
        return function (v) {
          gl.uniformMatrix4x3fv(location, false, v);
        };
      }

      function samplerSetter(gl, type, unit, location) {
        var bindPoint = getBindPointForSamplerType(gl, type);
        return utils.isWebGL2(gl) ? function (textureOrPair) {
          var texture = void 0;
          var sampler = void 0;
          if (textureOrPair instanceof WebGLTexture) {
            texture = textureOrPair;
            sampler = null;
          } else {
            texture = textureOrPair.texture;
            sampler = textureOrPair.sampler;
          }
          gl.uniform1i(location, unit);
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(bindPoint, texture);
          gl.bindSampler(unit, sampler);
        } : function (texture) {
          gl.uniform1i(location, unit);
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(bindPoint, texture);
        };
      }

      function samplerArraySetter(gl, type, unit, location, size) {
        var bindPoint = getBindPointForSamplerType(gl, type);
        var units = new Int32Array(size);
        for (var ii = 0; ii < size; ++ii) {
          units[ii] = unit + ii;
        }

        return utils.isWebGL2(gl) ? function (textures) {
          gl.uniform1iv(location, units);
          textures.forEach(function (textureOrPair, index) {
            gl.activeTexture(gl.TEXTURE0 + units[index]);
            var texture = void 0;
            var sampler = void 0;
            if (textureOrPair instanceof WebGLTexture) {
              texture = textureOrPair;
              sampler = null;
            } else {
              texture = textureOrPair.texture;
              sampler = textureOrPair.sampler;
            }
            gl.bindSampler(unit, sampler);
            gl.bindTexture(bindPoint, texture);
          });
        } : function (textures) {
          gl.uniform1iv(location, units);
          textures.forEach(function (texture, index) {
            gl.activeTexture(gl.TEXTURE0 + units[index]);
            gl.bindTexture(bindPoint, texture);
          });
        };
      }

      typeMap[FLOAT] = { Type: Float32Array, size: 4, setter: floatSetter, arraySetter: floatArraySetter };
      typeMap[FLOAT_VEC2] = { Type: Float32Array, size: 8, setter: floatVec2Setter };
      typeMap[FLOAT_VEC3] = { Type: Float32Array, size: 12, setter: floatVec3Setter };
      typeMap[FLOAT_VEC4] = { Type: Float32Array, size: 16, setter: floatVec4Setter };
      typeMap[INT] = { Type: Int32Array, size: 4, setter: intSetter, arraySetter: intArraySetter };
      typeMap[INT_VEC2] = { Type: Int32Array, size: 8, setter: intVec2Setter };
      typeMap[INT_VEC3] = { Type: Int32Array, size: 12, setter: intVec3Setter };
      typeMap[INT_VEC4] = { Type: Int32Array, size: 16, setter: intVec4Setter };
      typeMap[UNSIGNED_INT] = { Type: Uint32Array, size: 4, setter: uintSetter, arraySetter: uintArraySetter };
      typeMap[UNSIGNED_INT_VEC2] = { Type: Uint32Array, size: 8, setter: uintVec2Setter };
      typeMap[UNSIGNED_INT_VEC3] = { Type: Uint32Array, size: 12, setter: uintVec3Setter };
      typeMap[UNSIGNED_INT_VEC4] = { Type: Uint32Array, size: 16, setter: uintVec4Setter };
      typeMap[BOOL] = { Type: Uint32Array, size: 4, setter: intSetter, arraySetter: intArraySetter };
      typeMap[BOOL_VEC2] = { Type: Uint32Array, size: 8, setter: intVec2Setter };
      typeMap[BOOL_VEC3] = { Type: Uint32Array, size: 12, setter: intVec3Setter };
      typeMap[BOOL_VEC4] = { Type: Uint32Array, size: 16, setter: intVec4Setter };
      typeMap[FLOAT_MAT2] = { Type: Float32Array, size: 16, setter: floatMat2Setter };
      typeMap[FLOAT_MAT3] = { Type: Float32Array, size: 36, setter: floatMat3Setter };
      typeMap[FLOAT_MAT4] = { Type: Float32Array, size: 64, setter: floatMat4Setter };
      typeMap[FLOAT_MAT2x3] = { Type: Float32Array, size: 24, setter: floatMat23Setter };
      typeMap[FLOAT_MAT2x4] = { Type: Float32Array, size: 32, setter: floatMat24Setter };
      typeMap[FLOAT_MAT3x2] = { Type: Float32Array, size: 24, setter: floatMat32Setter };
      typeMap[FLOAT_MAT3x4] = { Type: Float32Array, size: 48, setter: floatMat34Setter };
      typeMap[FLOAT_MAT4x2] = { Type: Float32Array, size: 32, setter: floatMat42Setter };
      typeMap[FLOAT_MAT4x3] = { Type: Float32Array, size: 48, setter: floatMat43Setter };
      typeMap[SAMPLER_2D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D };
      typeMap[SAMPLER_CUBE] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP };
      typeMap[SAMPLER_3D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D };
      typeMap[SAMPLER_2D_SHADOW] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D };
      typeMap[SAMPLER_2D_ARRAY] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY };
      typeMap[SAMPLER_2D_ARRAY_SHADOW] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY };
      typeMap[SAMPLER_CUBE_SHADOW] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP };
      typeMap[INT_SAMPLER_2D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D };
      typeMap[INT_SAMPLER_3D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D };
      typeMap[INT_SAMPLER_CUBE] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP };
      typeMap[INT_SAMPLER_2D_ARRAY] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY };
      typeMap[UNSIGNED_INT_SAMPLER_2D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D };
      typeMap[UNSIGNED_INT_SAMPLER_3D] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D };
      typeMap[UNSIGNED_INT_SAMPLER_CUBE] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP };
      typeMap[UNSIGNED_INT_SAMPLER_2D_ARRAY] = { Type: null, size: 0, setter: samplerSetter, arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY };

      function floatAttribSetter(gl, index) {
        return function (b) {
          gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
          gl.enableVertexAttribArray(index);
          gl.vertexAttribPointer(index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
          if (b.divisor !== undefined) {
            gl.vertexAttribDivisor(index, b.divisor);
          }
        };
      }

      function intAttribSetter(gl, index) {
        return function (b) {
          gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
          gl.enableVertexAttribArray(index);
          gl.vertexAttribIPointer(index, b.numComponents || b.size, b.type || gl.INT, b.stride || 0, b.offset || 0);
          if (b.divisor !== undefined) {
            gl.vertexAttribDivisor(index, b.divisor);
          }
        };
      }

      function matAttribSetter(gl, index, typeInfo) {
        var defaultSize = typeInfo.size;
        var count = typeInfo.count;

        return function (b) {
          gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
          var numComponents = b.size || b.numComponents || defaultSize;
          var size = numComponents / count;
          var type = b.type || gl.FLOAT;
          var typeInfo = typeMap[type];
          var stride = typeInfo.size * numComponents;
          var normalize = b.normalize || false;
          var offset = b.offset || 0;
          var rowOffset = stride / count;
          for (var i = 0; i < count; ++i) {
            gl.enableVertexAttribArray(index + i);
            gl.vertexAttribPointer(index + i, size, type, normalize, stride, offset + rowOffset * i);
            if (b.divisor !== undefined) {
              gl.vertexAttribDivisor(index + i, b.divisor);
            }
          }
        };
      }

      var attrTypeMap = {};
      attrTypeMap[FLOAT] = { size: 4, setter: floatAttribSetter };
      attrTypeMap[FLOAT_VEC2] = { size: 8, setter: floatAttribSetter };
      attrTypeMap[FLOAT_VEC3] = { size: 12, setter: floatAttribSetter };
      attrTypeMap[FLOAT_VEC4] = { size: 16, setter: floatAttribSetter };
      attrTypeMap[INT] = { size: 4, setter: intAttribSetter };
      attrTypeMap[INT_VEC2] = { size: 8, setter: intAttribSetter };
      attrTypeMap[INT_VEC3] = { size: 12, setter: intAttribSetter };
      attrTypeMap[INT_VEC4] = { size: 16, setter: intAttribSetter };
      attrTypeMap[UNSIGNED_INT] = { size: 4, setter: intAttribSetter };
      attrTypeMap[UNSIGNED_INT_VEC2] = { size: 8, setter: intAttribSetter };
      attrTypeMap[UNSIGNED_INT_VEC3] = { size: 12, setter: intAttribSetter };
      attrTypeMap[UNSIGNED_INT_VEC4] = { size: 16, setter: intAttribSetter };
      attrTypeMap[BOOL] = { size: 4, setter: intAttribSetter };
      attrTypeMap[BOOL_VEC2] = { size: 8, setter: intAttribSetter };
      attrTypeMap[BOOL_VEC3] = { size: 12, setter: intAttribSetter };
      attrTypeMap[BOOL_VEC4] = { size: 16, setter: intAttribSetter };
      attrTypeMap[FLOAT_MAT2] = { size: 4, setter: matAttribSetter, count: 2 };
      attrTypeMap[FLOAT_MAT3] = { size: 9, setter: matAttribSetter, count: 3 };
      attrTypeMap[FLOAT_MAT4] = { size: 16, setter: matAttribSetter, count: 4 };

      // make sure we don't see a global gl
      var gl = undefined; // eslint-disable-line

      /**
       * Error Callback
       * @callback ErrorCallback
       * @param {string} msg error message.
       * @param {number} [lineOffset] amount to add to line number
       * @memberOf module:twgl
       */

      function addLineNumbers(src, lineOffset) {
        lineOffset = lineOffset || 0;
        ++lineOffset;

        return src.split("\n").map(function (line, ndx) {
          return ndx + lineOffset + ": " + line;
        }).join("\n");
      }

      var spaceRE = /^[ \t]*\n/;

      /**
       * Loads a shader.
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
       * @param {string} shaderSource The shader source.
       * @param {number} shaderType The type of shader.
       * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors.
       * @return {WebGLShader} The created shader.
       */
      function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
        var errFn = opt_errorCallback || error;
        // Create the shader object
        var shader = gl.createShader(shaderType);

        // Remove the first end of line because WebGL 2.0 requires
        // #version 300 es
        // as the first line. No whitespace allowed before that line
        // so
        //
        // <script>
        // #version 300 es
        // </script>
        //
        // Has one line before it which is invalid according to GLSL ES 3.00
        //
        var lineOffset = 0;
        if (spaceRE.test(shaderSource)) {
          lineOffset = 1;
          shaderSource = shaderSource.replace(spaceRE, '');
        }

        // Load the shader source
        gl.shaderSource(shader, shaderSource);

        // Compile the shader
        gl.compileShader(shader);

        // Check the compile status
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
          // Something went wrong during compilation; get the error
          var lastError = gl.getShaderInfoLog(shader);
          errFn(addLineNumbers(shaderSource, lineOffset) + "\n*** Error compiling shader: " + lastError);
          gl.deleteShader(shader);
          return null;
        }

        return shader;
      }

      /**
       * @typedef {Object} ProgramOptions
       * @property {function(string)} [errorCallback] callback for errors
       * @property {Object.<string,number>} [attribLocations] a attribute name to location map
       * @property {(module:twgl.BufferInfo|Object.<string,module:twgl.AttribInfo>|string[])} [transformFeedbackVaryings] If passed
       *   a BufferInfo will use the attribs names inside. If passed an object of AttribInfos will use the names from that object. Otherwise
       *   you can pass an array of names.
       * @property {number} [transformFeedbackMode] the mode to pass `gl.transformFeedbackVaryings`. Defaults to `SEPARATE_ATTRIBS`.
       * @memberOf module:twgl
       */

      /**
       * Gets the program options based on all these optional arguments
       * @param {module:twgl.ProgramOptions|string[]} [opt_attribs] Options for the program or an array of attribs names. Locations will be assigned by index if not passed in
       * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
       * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
       *        on error. If you want something else pass an callback. It's passed an error message.
       * @return {module:twgl.ProgramOptions} an instance of ProgramOptions based on the arguments pased on
       */
      function getProgramOptions(opt_attribs, opt_locations, opt_errorCallback) {
        var transformFeedbackVaryings = void 0;
        if (typeof opt_locations === 'function') {
          opt_errorCallback = opt_locations;
          opt_locations = undefined;
        }
        if (typeof opt_attribs === 'function') {
          opt_errorCallback = opt_attribs;
          opt_attribs = undefined;
        } else if (opt_attribs && !Array.isArray(opt_attribs)) {
          // If we have an errorCallback we can just return this object
          // Otherwise we need to construct one with default errorCallback
          if (opt_attribs.errorCallback) {
            return opt_attribs;
          }
          var opt = opt_attribs;
          opt_errorCallback = opt.errorCallback;
          opt_attribs = opt.attribLocations;
          transformFeedbackVaryings = opt.transformFeedbackVaryings;
        }

        var options = {
          errorCallback: opt_errorCallback || error,
          transformFeedbackVaryings: transformFeedbackVaryings
        };

        if (opt_attribs) {
          var attribLocations = {};
          if (Array.isArray(opt_attribs)) {
            opt_attribs.forEach(function (attrib, ndx) {
              attribLocations[attrib] = opt_locations ? opt_locations[ndx] : ndx;
            });
          } else {
            attribLocations = opt_attribs;
          }
          options.attribLocations = attribLocations;
        }

        return options;
      }

      var defaultShaderType = ["VERTEX_SHADER", "FRAGMENT_SHADER"];

      function getShaderTypeFromScriptType(scriptType) {
        if (scriptType.indexOf("frag") >= 0) {
          return gl.FRAGMENT_SHADER;
        } else if (scriptType.indexOf("vert") >= 0) {
          return gl.VERTEX_SHADER;
        }
        return undefined;
      }

      function deleteShaders(gl, shaders) {
        shaders.forEach(function (shader) {
          gl.deleteShader(shader);
        });
      }

      /**
       * Creates a program, attaches (and/or compiles) shaders, binds attrib locations, links the
       * program and calls useProgram.
       *
       * NOTE: There are 4 signatures for this function
       *
       *     twgl.createProgram(gl, [vs, fs], options);
       *     twgl.createProgram(gl, [vs, fs], opt_errFunc);
       *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_errFunc);
       *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
       *
       * @param {WebGLShader[]|string[]} shaders The shaders to attach, or element ids for their source, or strings that contain their source
       * @param {module:twgl.ProgramOptions|string[]} [opt_attribs] Options for the program or an array of attribs names. Locations will be assigned by index if not passed in
       * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
       * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
       *        on error. If you want something else pass an callback. It's passed an error message.
       * @return {WebGLProgram?} the created program or null if error.
       * @memberOf module:twgl/programs
       */
      function createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
        var progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
        var realShaders = [];
        var newShaders = [];
        for (var ndx = 0; ndx < shaders.length; ++ndx) {
          var shader = shaders[ndx];
          if (typeof shader === 'string') {
            var elem = document.getElementById(shader);
            var src = elem ? elem.text : shader;
            var type = gl[defaultShaderType[ndx]];
            if (elem && elem.type) {
              type = getShaderTypeFromScriptType(elem.type) || type;
            }
            shader = loadShader(gl, src, type, progOptions.errorCallback);
            newShaders.push(shader);
          }
          if (shader instanceof WebGLShader) {
            realShaders.push(shader);
          }
        }

        if (realShaders.length !== shaders.length) {
          progOptions.errorCallback("not enough shaders for program");
          deleteShaders(gl, newShaders);
          return null;
        }

        var program = gl.createProgram();
        realShaders.forEach(function (shader) {
          gl.attachShader(program, shader);
        });
        if (progOptions.attribLocations) {
          Object.keys(progOptions.attribLocations).forEach(function (attrib) {
            gl.bindAttribLocation(program, progOptions.attribLocations[attrib], attrib);
          });
        }
        var varyings = progOptions.transformFeedbackVaryings;
        if (varyings) {
          if (varyings.attribs) {
            varyings = varyings.attribs;
          }
          if (!Array.isArray(varyings)) {
            varyings = Object.keys(varyings);
          }
          gl.transformFeedbackVaryings(program, varyings, progOptions.transformFeedbackMode || gl.SEPARATE_ATTRIBS);
        }
        gl.linkProgram(program);

        // Check the link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
          // something went wrong with the link
          var lastError = gl.getProgramInfoLog(program);
          progOptions.errorCallback("Error in program linking:" + lastError);

          gl.deleteProgram(program);
          deleteShaders(gl, newShaders);
          return null;
        }
        return program;
      }

      /**
       * Loads a shader from a script tag.
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
       * @param {string} scriptId The id of the script tag.
       * @param {number} [opt_shaderType] The type of shader. If not passed in it will
       *     be derived from the type of the script tag.
       * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors.
       * @return {WebGLShader?} The created shader or null if error.
       */
      function createShaderFromScript(gl, scriptId, opt_shaderType, opt_errorCallback) {
        var shaderSource = "";
        var shaderScript = document.getElementById(scriptId);
        if (!shaderScript) {
          throw "*** Error: unknown script element" + scriptId;
        }
        shaderSource = shaderScript.text;

        var shaderType = opt_shaderType || getShaderTypeFromScriptType(shaderScript.type);
        if (!shaderType) {
          throw "*** Error: unknown shader type";
        }

        return loadShader(gl, shaderSource, shaderType, opt_errorCallback);
      }

      /**
       * Creates a program from 2 script tags.
       *
       * NOTE: There are 4 signatures for this function
       *
       *     twgl.createProgramFromScripts(gl, [vs, fs], opt_options);
       *     twgl.createProgramFromScripts(gl, [vs, fs], opt_errFunc);
       *     twgl.createProgramFromScripts(gl, [vs, fs], opt_attribs, opt_errFunc);
       *     twgl.createProgramFromScripts(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext
       *        to use.
       * @param {string[]} shaderScriptIds Array of ids of the script
       *        tags for the shaders. The first is assumed to be the
       *        vertex shader, the second the fragment shader.
       * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
       * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
       * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
       *        on error. If you want something else pass an callback. It's passed an error message.
       * @return {WebGLProgram} The created program.
       * @memberOf module:twgl/programs
       */
      function createProgramFromScripts(gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
        var progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
        var shaders = [];
        for (var ii = 0; ii < shaderScriptIds.length; ++ii) {
          var shader = createShaderFromScript(gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], progOptions.errorCallback);
          if (!shader) {
            return null;
          }
          shaders.push(shader);
        }
        return createProgram(gl, shaders, progOptions);
      }

      /**
       * Creates a program from 2 sources.
       *
       * NOTE: There are 4 signatures for this function
       *
       *     twgl.createProgramFromSource(gl, [vs, fs], opt_options);
       *     twgl.createProgramFromSource(gl, [vs, fs], opt_errFunc);
       *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_errFunc);
       *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext
       *        to use.
       * @param {string[]} shaderSources Array of sources for the
       *        shaders. The first is assumed to be the vertex shader,
       *        the second the fragment shader.
       * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
       * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
       * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
       *        on error. If you want something else pass an callback. It's passed an error message.
       * @return {WebGLProgram} The created program.
       * @memberOf module:twgl/programs
       */
      function createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
        var progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
        var shaders = [];
        for (var ii = 0; ii < shaderSources.length; ++ii) {
          var shader = loadShader(gl, shaderSources[ii], gl[defaultShaderType[ii]], progOptions.errorCallback);
          if (!shader) {
            return null;
          }
          shaders.push(shader);
        }
        return createProgram(gl, shaders, progOptions);
      }

      /**
       * Creates setter functions for all uniforms of a shader
       * program.
       *
       * @see {@link module:twgl.setUniforms}
       *
       * @param {WebGLProgram} program the program to create setters for.
       * @returns {Object.<string, function>} an object with a setter by name for each uniform
       * @memberOf module:twgl/programs
       */
      function createUniformSetters(gl, program) {
        var textureUnit = 0;

        /**
         * Creates a setter for a uniform of the given program with it's
         * location embedded in the setter.
         * @param {WebGLProgram} program
         * @param {WebGLUniformInfo} uniformInfo
         * @returns {function} the created setter.
         */
        function createUniformSetter(program, uniformInfo) {
          var location = gl.getUniformLocation(program, uniformInfo.name);
          var isArray = uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]";
          var type = uniformInfo.type;
          var typeInfo = typeMap[type];
          if (!typeInfo) {
            throw "unknown type: 0x" + type.toString(16); // we should never get here.
          }
          var setter = void 0;
          if (typeInfo.bindPoint) {
            // it's a sampler
            var unit = textureUnit;
            textureUnit += uniformInfo.size;
            if (isArray) {
              setter = typeInfo.arraySetter(gl, type, unit, location, uniformInfo.size);
            } else {
              setter = typeInfo.setter(gl, type, unit, location, uniformInfo.size);
            }
          } else {
            if (typeInfo.arraySetter && isArray) {
              setter = typeInfo.arraySetter(gl, location);
            } else {
              setter = typeInfo.setter(gl, location);
            }
          }
          setter.location = location;
          return setter;
        }

        var uniformSetters = {};
        var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (var ii = 0; ii < numUniforms; ++ii) {
          var uniformInfo = gl.getActiveUniform(program, ii);
          if (!uniformInfo) {
            break;
          }
          var name = uniformInfo.name;
          // remove the array suffix.
          if (name.substr(-3) === "[0]") {
            name = name.substr(0, name.length - 3);
          }
          var setter = createUniformSetter(program, uniformInfo);
          uniformSetters[name] = setter;
        }
        return uniformSetters;
      }

      /**
       * @typedef {Object} TransformFeedbackInfo
       * @property {number} index index of transform feedback
       * @property {number} type GL type
       * @property {number} size 1 - 4
       * @memberOf module:twgl
       */

      /**
       * Create TransformFeedbackInfo for passing to bind/unbindTransformFeedbackInfo.
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
       * @param {WebGLProgram} program an existing WebGLProgram.
       * @return {Object<string, module:twgl.TransformFeedbackInfo>}
       * @memberOf module:twgl
       */
      function createTransformFeedbackInfo(gl, program) {
        var info = {};
        var numVaryings = gl.getProgramParameter(program, gl.TRANSFORM_FEEDBACK_VARYINGS);
        for (var ii = 0; ii < numVaryings; ++ii) {
          var varying = gl.getTransformFeedbackVarying(program, ii);
          info[varying.name] = {
            index: ii,
            type: varying.type,
            size: varying.size
          };
        }
        return info;
      }

      /**
       * Binds buffers for transform feedback.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
       * @param {(module:twgl.ProgramInfo|Object<string, module:twgl.TransformFeedbackInfo>)} transformFeedbackInfo A ProgramInfo or TransformFeedbackInfo.
       * @param {(module:twgl.BufferInfo|Object<string, module:twgl.AttribInfo>)} [bufferInfo] A BufferInfo or set of AttribInfos.
       * @memberOf module:twgl
       */
      function bindTransformFeedbackInfo(gl, transformFeedbackInfo, bufferInfo) {
        if (transformFeedbackInfo.transformFeedbackInfo) {
          transformFeedbackInfo = transformFeedbackInfo.transformFeedbackInfo;
        }
        if (bufferInfo.attribs) {
          bufferInfo = bufferInfo.attribs;
        }
        for (var name in bufferInfo) {
          var varying = transformFeedbackInfo[name];
          if (varying) {
            var buf = bufferInfo[name];
            if (buf.offset) {
              gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, varying.index, buf.buffer, buf.offset, buf.size);
            } else {
              gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, varying.index, buf.buffer);
            }
          }
        }
      }

      /**
       * Unbinds buffers afetr transform feedback.
       *
       * Buffers can not be bound to 2 bind points so if you try to bind a buffer used
       * in a transform feedback as an ARRAY_BUFFER for an attribute it will fail.
       *
       * This function unbinds all buffers that were bound with {@link module:twgl.bindTransformFeedbackInfo}.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
       * @param {(module:twgl.ProgramInfo|Object<string, module:twgl.TransformFeedbackInfo>)} transformFeedbackInfo A ProgramInfo or TransformFeedbackInfo.
       * @param {(module:twgl.BufferInfo|Object<string, module:twgl.AttribInfo>)} [bufferInfo] A BufferInfo or set of AttribInfos.
       */
      function unbindTransformFeedbackInfo(gl, transformFeedbackInfo, bufferInfo) {
        if (transformFeedbackInfo.transformFeedbackInfo) {
          transformFeedbackInfo = transformFeedbackInfo.transformFeedbackInfo;
        }
        if (bufferInfo.attribs) {
          bufferInfo = bufferInfo.attribs;
        }
        for (var name in bufferInfo) {
          var varying = transformFeedbackInfo[name];
          if (varying) {
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, varying.index, null);
          }
        }
      }

      /**
       * Creates a transform feedback and sets the buffers
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
       * @param {module:twgl.ProgramInfo} programInfo A ProgramInfo as returned from {@link module:twgl.createProgramInfo}
       * @param {(module:twgl.BufferInfo|Object<string, module:twgl.AttribInfo>)} [bufferInfo] A BufferInfo or set of AttribInfos.
       * @return {WebGLTransformFeedback} the created transform feedback
       * @memberOf module:twgl
       */
      function createTransformFeedback(gl, programInfo, bufferInfo) {
        var tf = gl.createTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
        gl.useProgram(programInfo.program);
        bindTransformFeedbackInfo(gl, programInfo, bufferInfo);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        // This is only needed because of a bug in Chrome 56. Will remove
        // when chrome fixes it.
        unbindTransformFeedbackInfo(gl, programInfo, bufferInfo);
        return tf;
      }

      /**
       * @typedef {Object} UniformData
       * @property {number} type The WebGL type enum for this uniform
       * @property {number} size The number of elements for this uniform
       * @property {number} blockNdx The block index this uniform appears in
       * @property {number} offset The byte offset in the block for this uniform's value
       * @memberOf module:twgl
       */

      /**
       * The specification for one UniformBlockObject
       *
       * @typedef {Object} BlockSpec
       * @property {number} index The index of the block.
       * @property {number} size The size in bytes needed for the block
       * @property {number[]} uniformIndices The indices of the uniforms used by the block. These indices
       *    correspond to entries in a UniformData array in the {@link module:twgl.UniformBlockSpec}.
       * @property {bool} usedByVertexShader Self explanitory
       * @property {bool} usedByFragmentShader Self explanitory
       * @property {bool} used Self explanitory
       * @memberOf module:twgl
       */

      /**
       * A `UniformBlockSpec` represents the data needed to create and bind
       * UniformBlockObjects for a given program
       *
       * @typedef {Object} UniformBlockSpec
       * @property {Object.<string, module:twgl.BlockSpec> blockSpecs The BlockSpec for each block by block name
       * @property {UniformData[]} uniformData An array of data for each uniform by uniform index.
       * @memberOf module:twgl
       */

      /**
       * Creates a UniformBlockSpec for the given program.
       *
       * A UniformBlockSpec represents the data needed to create and bind
       * UniformBlockObjects
       *
       * @param {WebGL2RenderingContext} gl A WebGL2 Rendering Context
       * @param {WebGLProgram} program A WebGLProgram for a successfully linked program
       * @return {module:twgl.UniformBlockSpec} The created UniformBlockSpec
       * @memberOf module:twgl/programs
       */
      function createUniformBlockSpecFromProgram(gl, program) {
        var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        var uniformData = [];
        var uniformIndices = [];

        for (var ii = 0; ii < numUniforms; ++ii) {
          uniformIndices.push(ii);
          uniformData.push({});
          var uniformInfo = gl.getActiveUniform(program, ii);
          if (!uniformInfo) {
            break;
          }
          // REMOVE [0]?
          uniformData[ii].name = uniformInfo.name;
        }

        [["UNIFORM_TYPE", "type"], ["UNIFORM_SIZE", "size"], // num elements
        ["UNIFORM_BLOCK_INDEX", "blockNdx"], ["UNIFORM_OFFSET", "offset"]].forEach(function (pair) {
          var pname = pair[0];
          var key = pair[1];
          gl.getActiveUniforms(program, uniformIndices, gl[pname]).forEach(function (value, ndx) {
            uniformData[ndx][key] = value;
          });
        });

        var blockSpecs = {};

        var numUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
        for (var _ii = 0; _ii < numUniformBlocks; ++_ii) {
          var name = gl.getActiveUniformBlockName(program, _ii);
          var blockSpec = {
            index: _ii,
            usedByVertexShader: gl.getActiveUniformBlockParameter(program, _ii, gl.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER),
            usedByFragmentShader: gl.getActiveUniformBlockParameter(program, _ii, gl.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER),
            size: gl.getActiveUniformBlockParameter(program, _ii, gl.UNIFORM_BLOCK_DATA_SIZE),
            uniformIndices: gl.getActiveUniformBlockParameter(program, _ii, gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES)
          };
          blockSpec.used = blockSpec.usedByVertexSahder || blockSpec.usedByFragmentShader;
          blockSpecs[name] = blockSpec;
        }

        return {
          blockSpecs: blockSpecs,
          uniformData: uniformData
        };
      }

      var arraySuffixRE = /\[\d+\]\.$/; // better way to check?

      /**
       * Represents a UniformBlockObject including an ArrayBuffer with all the uniform values
       * and a corresponding WebGLBuffer to hold those values on the GPU
       *
       * @typedef {Object} UniformBlockInfo
       * @property {string} name The name of the block
       * @property {ArrayBuffer} array The array buffer that contains the uniform values
       * @property {Float32Array} asFloat A float view on the array buffer. This is useful
       *    inspecting the contents of the buffer in the debugger.
       * @property {WebGLBuffer} buffer A WebGL buffer that will hold a copy of the uniform values for rendering.
       * @property {number} [offset] offset into buffer
       * @property {Object.<string, ArrayBufferView>} uniforms A uniform name to ArrayBufferView map.
       *   each Uniform has a correctly typed `ArrayBufferView` into array at the correct offset
       *   and length of that uniform. So for example a float uniform would have a 1 float `Float32Array`
       *   view. A single mat4 would have a 16 element `Float32Array` view. An ivec2 would have an
       *   `Int32Array` view, etc.
       * @memberOf module:twgl
       */

      /**
       * Creates a `UniformBlockInfo` for the specified block
       *
       * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
       * `UniformBlockInfo` is returned**. This is because when debugging GLSL
       * it is common to comment out large portions of a shader or for example set
       * the final output to a constant. When that happens blocks get optimized out.
       * If this function did not create dummy blocks your code would crash when debugging.
       *
       * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
       * @param {WebGLProgram} program A WebGLProgram
       * @param {module:twgl.UniformBlockSpec} uinformBlockSpec. A UniformBlockSpec as returned
       *     from {@link module:twgl.createUniformBlockSpecFromProgram}.
       * @param {string} blockName The name of the block.
       * @return {module:twgl.UniformBlockInfo} The created UniformBlockInfo
       * @memberOf module:twgl/programs
       */
      function createUniformBlockInfoFromProgram(gl, program, uniformBlockSpec, blockName) {
        var blockSpecs = uniformBlockSpec.blockSpecs;
        var uniformData = uniformBlockSpec.uniformData;
        var blockSpec = blockSpecs[blockName];
        if (!blockSpec) {
          warn("no uniform block object named:", blockName);
          return {
            name: blockName,
            uniforms: {}
          };
        }
        var array = new ArrayBuffer(blockSpec.size);
        var buffer = gl.createBuffer();
        var uniformBufferIndex = blockSpec.index;
        gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
        gl.uniformBlockBinding(program, blockSpec.index, uniformBufferIndex);

        var prefix = blockName + ".";
        if (arraySuffixRE.test(prefix)) {
          prefix = prefix.replace(arraySuffixRE, ".");
        }
        var uniforms = {};
        blockSpec.uniformIndices.forEach(function (uniformNdx) {
          var data = uniformData[uniformNdx];
          var typeInfo = typeMap[data.type];
          var Type = typeInfo.Type;
          var length = data.size * typeInfo.size;
          var name = data.name;
          if (name.substr(0, prefix.length) === prefix) {
            name = name.substr(prefix.length);
          }
          uniforms[name] = new Type(array, data.offset, length / Type.BYTES_PER_ELEMENT);
        });
        return {
          name: blockName,
          array: array,
          asFloat: new Float32Array(array), // for debugging
          buffer: buffer,
          uniforms: uniforms
        };
      }

      /**
       * Creates a `UniformBlockInfo` for the specified block
       *
       * Note: **If the blockName matches no existing blocks a warning is printed to the console and a dummy
       * `UniformBlockInfo` is returned**. This is because when debugging GLSL
       * it is common to comment out large portions of a shader or for example set
       * the final output to a constant. When that happens blocks get optimized out.
       * If this function did not create dummy blocks your code would crash when debugging.
       *
       * @param {WebGL2RenderingContext} gl A WebGL2RenderingContext
       * @param {module:twgl.ProgramInfo} programInfo a `ProgramInfo`
       *     as returned from {@link module:twgl.createProgramInfo}
       * @param {string} blockName The name of the block.
       * @return {module:twgl.UniformBlockInfo} The created UniformBlockInfo
       * @memberOf module:twgl/programs
       */
      function createUniformBlockInfo(gl, programInfo, blockName) {
        return createUniformBlockInfoFromProgram(gl, programInfo.program, programInfo.uniformBlockSpec, blockName);
      }

      /**
       * Binds a unform block to the matching uniform block point.
       * Matches by blocks by name so blocks must have the same name not just the same
       * structure.
       *
       * If you have changed any values and you upload the valus into the corresponding WebGLBuffer
       * call {@link module:twgl.setUniformBlock} instead.
       *
       * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
       * @param {(module:twgl.ProgramInfo|module:twgl.UniformBlockSpec)} programInfo a `ProgramInfo`
       *     as returned from {@link module:twgl.createProgramInfo} or or `UniformBlockSpec` as
       *     returned from {@link module:twgl.createUniformBlockSpecFromProgram}.
       * @param {module:twgl.UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
       *     {@link module:twgl.createUniformBlockInfo}.
       * @return {bool} true if buffer was bound. If the programInfo has no block with the same block name
       *     no buffer is bound.
       * @memberOf module:twgl/programs
       */
      function bindUniformBlock(gl, programInfo, uniformBlockInfo) {
        var uniformBlockSpec = programInfo.uniformBlockSpec || programInfo;
        var blockSpec = uniformBlockSpec.blockSpecs[uniformBlockInfo.name];
        if (blockSpec) {
          var bufferBindIndex = blockSpec.index;
          gl.bindBufferRange(gl.UNIFORM_BUFFER, bufferBindIndex, uniformBlockInfo.buffer, uniformBlockInfo.offset || 0, uniformBlockInfo.array.byteLength);
          return true;
        }
        return false;
      }

      /**
       * Uploads the current uniform values to the corresponding WebGLBuffer
       * and binds that buffer to the program's corresponding bind point for the uniform block object.
       *
       * If you haven't changed any values and you only need to bind the uniform block object
       * call {@link module:twgl.bindUniformBlock} instead.
       *
       * @param {WebGL2RenderingContext} gl A WebGL 2 rendering context.
       * @param {(module:twgl.ProgramInfo|module:twgl.UniformBlockSpec)} programInfo a `ProgramInfo`
       *     as returned from {@link module:twgl.createProgramInfo} or or `UniformBlockSpec` as
       *     returned from {@link module:twgl.createUniformBlockSpecFromProgram}.
       * @param {module:twgl.UniformBlockInfo} uniformBlockInfo a `UniformBlockInfo` as returned from
       *     {@link module:twgl.createUniformBlockInfo}.
       * @memberOf module:twgl/programs
       */
      function setUniformBlock(gl, programInfo, uniformBlockInfo) {
        if (bindUniformBlock(gl, programInfo, uniformBlockInfo)) {
          gl.bufferData(gl.UNIFORM_BUFFER, uniformBlockInfo.array, gl.DYNAMIC_DRAW);
        }
      }

      /**
       * Sets values of a uniform block object
       *
       * @param {module:twgl.UniformBlockInfo} uniformBlockInfo A UniformBlockInfo as returned by {@link module:twgl.createUniformBlockInfo}.
       * @param {Object.<string, ?>} values A uniform name to value map where the value is correct for the given
       *    type of uniform. So for example given a block like
       *
       *       uniform SomeBlock {
       *         float someFloat;
       *         vec2 someVec2;
       *         vec3 someVec3Array[2];
       *         int someInt;
       *       }
       *
       *  You can set the values of the uniform block with
       *
       *       twgl.setBlockUniforms(someBlockInfo, {
       *          someFloat: 12.3,
       *          someVec2: [1, 2],
       *          someVec3Array: [1, 2, 3, 4, 5, 6],
       *          someInt: 5,
       *       }
       *
       *  Arrays can be JavaScript arrays or typed arrays
       *
       *  Any name that doesn't match will be ignored
       * @memberOf module:twgl/programs
       */
      function setBlockUniforms(uniformBlockInfo, values) {
        var uniforms = uniformBlockInfo.uniforms;
        for (var name in values) {
          var array = uniforms[name];
          if (array) {
            var value = values[name];
            if (value.length) {
              array.set(value);
            } else {
              array[0] = value;
            }
          }
        }
      }

      /**
       * Set uniforms and binds related textures.
       *
       * example:
       *
       *     const programInfo = createProgramInfo(
       *         gl, ["some-vs", "some-fs"]);
       *
       *     const tex1 = gl.createTexture();
       *     const tex2 = gl.createTexture();
       *
       *     ... assume we setup the textures with data ...
       *
       *     const uniforms = {
       *       u_someSampler: tex1,
       *       u_someOtherSampler: tex2,
       *       u_someColor: [1,0,0,1],
       *       u_somePosition: [0,1,1],
       *       u_someMatrix: [
       *         1,0,0,0,
       *         0,1,0,0,
       *         0,0,1,0,
       *         0,0,0,0,
       *       ],
       *     };
       *
       *     gl.useProgram(program);
       *
       * This will automatically bind the textures AND set the
       * uniforms.
       *
       *     twgl.setUniforms(programInfo, uniforms);
       *
       * For the example above it is equivalent to
       *
       *     var texUnit = 0;
       *     gl.activeTexture(gl.TEXTURE0 + texUnit);
       *     gl.bindTexture(gl.TEXTURE_2D, tex1);
       *     gl.uniform1i(u_someSamplerLocation, texUnit++);
       *     gl.activeTexture(gl.TEXTURE0 + texUnit);
       *     gl.bindTexture(gl.TEXTURE_2D, tex2);
       *     gl.uniform1i(u_someSamplerLocation, texUnit++);
       *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
       *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
       *     gl.uniformMatrix4fv(u_someMatrix, false, [
       *         1,0,0,0,
       *         0,1,0,0,
       *         0,0,1,0,
       *         0,0,0,0,
       *       ]);
       *
       * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
       *
       *     const uniforms = {
       *       u_someSampler: tex1,
       *       u_someOtherSampler: tex2,
       *     };
       *
       *     const moreUniforms {
       *       u_someColor: [1,0,0,1],
       *       u_somePosition: [0,1,1],
       *       u_someMatrix: [
       *         1,0,0,0,
       *         0,1,0,0,
       *         0,0,1,0,
       *         0,0,0,0,
       *       ],
       *     };
       *
       *     twgl.setUniforms(programInfo, uniforms);
       *     twgl.setUniforms(programInfo, moreUniforms);
       *
       * You can also add WebGLSamplers to uniform samplers as in
       *
       *     const uniforms = {
       *       u_someSampler: {
       *         texture: someWebGLTexture,
       *         sampler: someWebGLSampler,
       *       },
       *     };
       *
       * In which case both the sampler and texture will be bound to the
       * same unit.
       *
       * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
       *        `createUniformSetters`.
       * @param {Object.<string, ?>} values an object with values for the
       *        uniforms.
       *   You can pass multiple objects by putting them in an array or by calling with more arguments.For example
       *
       *     const sharedUniforms = {
       *       u_fogNear: 10,
       *       u_projection: ...
       *       ...
       *     };
       *
       *     const localUniforms = {
       *       u_world: ...
       *       u_diffuseColor: ...
       *     };
       *
       *     twgl.setUniforms(programInfo, sharedUniforms, localUniforms);
       *
       *     // is the same as
       *
       *     twgl.setUniforms(programInfo, [sharedUniforms, localUniforms]);
       *
       *     // is the same as
       *
       *     twgl.setUniforms(programInfo, sharedUniforms);
       *     twgl.setUniforms(programInfo, localUniforms};
       *
       * @memberOf module:twgl/programs
       */
      function setUniforms(setters, values) {
        // eslint-disable-line
        var actualSetters = setters.uniformSetters || setters;
        var numArgs = arguments.length;
        for (var andx = 1; andx < numArgs; ++andx) {
          var vals = arguments[andx];
          if (Array.isArray(vals)) {
            var numValues = vals.length;
            for (var ii = 0; ii < numValues; ++ii) {
              setUniforms(actualSetters, vals[ii]);
            }
          } else {
            for (var name in vals) {
              var setter = actualSetters[name];
              if (setter) {
                setter(vals[name]);
              }
            }
          }
        }
      }

      /**
       * Creates setter functions for all attributes of a shader
       * program. You can pass this to {@link module:twgl.setBuffersAndAttributes} to set all your buffers and attributes.
       *
       * @see {@link module:twgl.setAttributes} for example
       * @param {WebGLProgram} program the program to create setters for.
       * @return {Object.<string, function>} an object with a setter for each attribute by name.
       * @memberOf module:twgl/programs
       */
      function createAttributeSetters(gl, program) {
        var attribSetters = {};

        var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var ii = 0; ii < numAttribs; ++ii) {
          var attribInfo = gl.getActiveAttrib(program, ii);
          if (!attribInfo) {
            break;
          }
          var index = gl.getAttribLocation(program, attribInfo.name);
          var typeInfo = attrTypeMap[attribInfo.type];
          var setter = typeInfo.setter(gl, index, typeInfo);
          setter.location = index;
          attribSetters[attribInfo.name] = setter;
        }

        return attribSetters;
      }

      /**
       * Sets attributes and binds buffers (deprecated... use {@link module:twgl.setBuffersAndAttributes})
       *
       * Example:
       *
       *     const program = createProgramFromScripts(
       *         gl, ["some-vs", "some-fs");
       *
       *     const attribSetters = createAttributeSetters(program);
       *
       *     const positionBuffer = gl.createBuffer();
       *     const texcoordBuffer = gl.createBuffer();
       *
       *     const attribs = {
       *       a_position: {buffer: positionBuffer, numComponents: 3},
       *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
       *     };
       *
       *     gl.useProgram(program);
       *
       * This will automatically bind the buffers AND set the
       * attributes.
       *
       *     setAttributes(attribSetters, attribs);
       *
       * Properties of attribs. For each attrib you can add
       * properties:
       *
       * *   type: the type of data in the buffer. Default = gl.FLOAT
       * *   normalize: whether or not to normalize the data. Default = false
       * *   stride: the stride. Default = 0
       * *   offset: offset into the buffer. Default = 0
       * *   divisor: the divisor for instances. Default = undefined
       *
       * For example if you had 3 value float positions, 2 value
       * float texcoord and 4 value uint8 colors you'd setup your
       * attribs like this
       *
       *     const attribs = {
       *       a_position: {buffer: positionBuffer, numComponents: 3},
       *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
       *       a_color: {
       *         buffer: colorBuffer,
       *         numComponents: 4,
       *         type: gl.UNSIGNED_BYTE,
       *         normalize: true,
       *       },
       *     };
       *
       * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
       * @param {Object.<string, module:twgl.AttribInfo>} buffers AttribInfos mapped by attribute name.
       * @memberOf module:twgl/programs
       * @deprecated use {@link module:twgl.setBuffersAndAttributes}
       */
      function setAttributes(setters, buffers) {
        for (var name in buffers) {
          var setter = setters[name];
          if (setter) {
            setter(buffers[name]);
          }
        }
      }

      /**
       * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
       *
       * Example:
       *
       *     const programInfo = createProgramInfo(
       *         gl, ["some-vs", "some-fs");
       *
       *     const arrays = {
       *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
       *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
       *     };
       *
       *     const bufferInfo = createBufferInfoFromArrays(gl, arrays);
       *
       *     gl.useProgram(programInfo.program);
       *
       * This will automatically bind the buffers AND set the
       * attributes.
       *
       *     setBuffersAndAttributes(gl, programInfo, bufferInfo);
       *
       * For the example above it is equivilent to
       *
       *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
       *     gl.enableVertexAttribArray(a_positionLocation);
       *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
       *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
       *     gl.enableVertexAttribArray(a_texcoordLocation);
       *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
       * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from {@link module:twgl.createProgrmaInfo} or Attribute setters as returned from {@link module:twgl.createAttributeSetters}
       * @param {(module:twgl.BufferInfo|module:twgl.vertexArrayInfo)} buffers a `BufferInfo` as returned from {@link module:twgl.createBufferInfoFromArrays}.
       *   or a `VertexArrayInfo` as returned from {@link module:twgl.createVertexArrayInfo}
       * @memberOf module:twgl/programs
       */
      function setBuffersAndAttributes(gl, programInfo, buffers) {
        if (buffers.vertexArrayObject) {
          gl.bindVertexArray(buffers.vertexArrayObject);
        } else {
          setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
          if (buffers.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
          }
        }
      }

      /**
       * @typedef {Object} ProgramInfo
       * @property {WebGLProgram} program A shader program
       * @property {Object<string, function>} uniformSetters object of setters as returned from createUniformSetters,
       * @property {Object<string, function>} attribSetters object of setters as returned from createAttribSetters,
       * @propetty {module:twgl.UniformBlockSpec} [uniformBlockSpace] a uniform block spec for making UniformBlockInfos with createUniformBlockInfo etc..
       * @property {Object<string, module:twgl.TransformFeedbackInfo>} [transformFeedbackInfo] info for transform feedbacks
       * @memberOf module:twgl
       */

      /**
       * Creates a ProgramInfo from an existing program.
       *
       * A ProgramInfo contains
       *
       *     programInfo = {
       *        program: WebGLProgram,
       *        uniformSetters: object of setters as returned from createUniformSetters,
       *        attribSetters: object of setters as returned from createAttribSetters,
       *     }
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext
       *        to use.
       * @param {WebGLProgram} program an existing WebGLProgram.
       * @return {module:twgl.ProgramInfo} The created ProgramInfo.
       * @memberOf module:twgl/programs
       */
      function createProgramInfoFromProgram(gl, program) {
        var uniformSetters = createUniformSetters(gl, program);
        var attribSetters = createAttributeSetters(gl, program);
        var programInfo = {
          program: program,
          uniformSetters: uniformSetters,
          attribSetters: attribSetters
        };

        if (utils.isWebGL2(gl)) {
          programInfo.uniformBlockSpec = createUniformBlockSpecFromProgram(gl, program);
          programInfo.transformFeedbackInfo = createTransformFeedbackInfo(gl, program);
        }

        return programInfo;
      }

      /**
       * Creates a ProgramInfo from 2 sources.
       *
       * A ProgramInfo contains
       *
       *     programInfo = {
       *        program: WebGLProgram,
       *        uniformSetters: object of setters as returned from createUniformSetters,
       *        attribSetters: object of setters as returned from createAttribSetters,
       *     }
       *
       * NOTE: There are 4 signatures for this function
       *
       *     twgl.createProgramInfo(gl, [vs, fs], options);
       *     twgl.createProgramInfo(gl, [vs, fs], opt_errFunc);
       *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_errFunc);
       *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext
       *        to use.
       * @param {string[]} shaderSources Array of sources for the
       *        shaders or ids. The first is assumed to be the vertex shader,
       *        the second the fragment shader.
       * @param {module:twgl.ProgramOptions|string[]} [opt_attribs] Options for the program or an array of attribs names. Locations will be assigned by index if not passed in
       * @param {number[]} [opt_locations] The locations for the attributes. A parallel array to opt_attribs letting you assign locations.
       * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
       *        on error. If you want something else pass an callback. It's passed an error message.
       * @return {module:twgl.ProgramInfo?} The created ProgramInfo or null if it failed to link or compile
       * @memberOf module:twgl/programs
       */
      function createProgramInfo(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
        var progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
        var good = true;
        shaderSources = shaderSources.map(function (source) {
          // Lets assume if there is no \n it's an id
          if (source.indexOf("\n") < 0) {
            var script = document.getElementById(source);
            if (!script) {
              progOptions.errorCallback("no element with id: " + source);
              good = false;
            } else {
              source = script.text;
            }
          }
          return source;
        });
        if (!good) {
          return null;
        }
        var program = createProgramFromSources(gl, shaderSources, progOptions);
        if (!program) {
          return null;
        }
        return createProgramInfoFromProgram(gl, program);
      }

      exports.createAttributeSetters = createAttributeSetters;
      exports.createProgram = createProgram;
      exports.createProgramFromScripts = createProgramFromScripts;
      exports.createProgramFromSources = createProgramFromSources;
      exports.createProgramInfo = createProgramInfo;
      exports.createProgramInfoFromProgram = createProgramInfoFromProgram;
      exports.createUniformSetters = createUniformSetters;
      exports.createUniformBlockSpecFromProgram = createUniformBlockSpecFromProgram;
      exports.createUniformBlockInfoFromProgram = createUniformBlockInfoFromProgram;
      exports.createUniformBlockInfo = createUniformBlockInfo;
      exports.createTransformFeedback = createTransformFeedback;
      exports.createTransformFeedbackInfo = createTransformFeedbackInfo;
      exports.bindTransformFeedbackInfo = bindTransformFeedbackInfo;
      exports.setAttributes = setAttributes;
      exports.setBuffersAndAttributes = setBuffersAndAttributes;
      exports.setUniforms = setUniforms;
      exports.setUniformBlock = setUniformBlock;
      exports.setBlockUniforms = setBlockUniforms;
      exports.bindUniformBlock = bindUniformBlock;

      /***/
    },
    /* 3 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      /**
       *
       * Vec3 math math functions.
       *
       * Almost all functions take an optional `dst` argument. If it is not passed in the
       * functions will create a new Vec3. In other words you can do this
       *
       *     var v = v3.cross(v1, v2);  // Creates a new Vec3 with the cross product of v1 x v2.
       *
       * or
       *
       *     var v3 = v3.create();
       *     v3.cross(v1, v2, v);  // Puts the cross product of v1 x v2 in v
       *
       * The first style is often easier but depending on where it's used it generates garbage where
       * as there is almost never allocation with the second style.
       *
       * It is always save to pass any vector as the destination. So for example
       *
       *     v3.cross(v1, v2, v1);  // Puts the cross product of v1 x v2 in v1
       *
       * @module twgl/v3
       */

      var VecType = Float32Array;

      /**
       * A JavaScript array with 3 values or a Float32Array with 3 values.
       * When created by the library will create the default type which is `Float32Array`
       * but can be set by calling {@link module:twgl/v3.setDefaultType}.
       * @typedef {(number[]|Float32Array)} Vec3
       * @memberOf module:twgl/v3
       */

      /**
       * Sets the type this library creates for a Vec3
       * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
       * @return {constructor} previous constructor for Vec3
       */
      function setDefaultType(ctor) {
        var oldType = VecType;
        VecType = ctor;
        return oldType;
      }

      /**
       * Creates a vec3; may be called with x, y, z to set initial values.
       * @return {Vec3} the created vector
       * @memberOf module:twgl/v3
       */
      function create(x, y, z) {
        var dst = new VecType(3);
        if (x) {
          dst[0] = x;
        }
        if (y) {
          dst[1] = y;
        }
        if (z) {
          dst[2] = z;
        }
        return dst;
      }

      /**
       * Adds two vectors; assumes a and b have the same dimension.
       * @param {module:twgl/v3.Vec3} a Operand vector.
       * @param {module:twgl/v3.Vec3} b Operand vector.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @memberOf module:twgl/v3
       */
      function add(a, b, dst) {
        dst = dst || new VecType(3);

        dst[0] = a[0] + b[0];
        dst[1] = a[1] + b[1];
        dst[2] = a[2] + b[2];

        return dst;
      }

      /**
       * Subtracts two vectors.
       * @param {module:twgl/v3.Vec3} a Operand vector.
       * @param {module:twgl/v3.Vec3} b Operand vector.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @memberOf module:twgl/v3
       */
      function subtract(a, b, dst) {
        dst = dst || new VecType(3);

        dst[0] = a[0] - b[0];
        dst[1] = a[1] - b[1];
        dst[2] = a[2] - b[2];

        return dst;
      }

      /**
       * Performs linear interpolation on two vectors.
       * Given vectors a and b and interpolation coefficient t, returns
       * (1 - t) * a + t * b.
       * @param {module:twgl/v3.Vec3} a Operand vector.
       * @param {module:twgl/v3.Vec3} b Operand vector.
       * @param {number} t Interpolation coefficient.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @memberOf module:twgl/v3
       */
      function lerp(a, b, t, dst) {
        dst = dst || new VecType(3);

        dst[0] = (1 - t) * a[0] + t * b[0];
        dst[1] = (1 - t) * a[1] + t * b[1];
        dst[2] = (1 - t) * a[2] + t * b[2];

        return dst;
      }

      /**
       * Mutiplies a vector by a scalar.
       * @param {module:twgl/v3.Vec3} v The vector.
       * @param {number} k The scalar.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @return {module:twgl/v3.Vec3} dst.
       * @memberOf module:twgl/v3
       */
      function mulScalar(v, k, dst) {
        dst = dst || new VecType(3);

        dst[0] = v[0] * k;
        dst[1] = v[1] * k;
        dst[2] = v[2] * k;

        return dst;
      }

      /**
       * Divides a vector by a scalar.
       * @param {module:twgl/v3.Vec3} v The vector.
       * @param {number} k The scalar.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @return {module:twgl/v3.Vec3} dst.
       * @memberOf module:twgl/v3
       */
      function divScalar(v, k, dst) {
        dst = dst || new VecType(3);

        dst[0] = v[0] / k;
        dst[1] = v[1] / k;
        dst[2] = v[2] / k;

        return dst;
      }

      /**
       * Computes the cross product of two vectors; assumes both vectors have
       * three entries.
       * @param {module:twgl/v3.Vec3} a Operand vector.
       * @param {module:twgl/v3.Vec3} b Operand vector.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @return {module:twgl/v3.Vec3} The vector a cross b.
       * @memberOf module:twgl/v3
       */
      function cross(a, b, dst) {
        dst = dst || new VecType(3);

        var t1 = a[2] * b[0] - a[0] * b[2];
        var t2 = a[0] * b[1] - a[1] * b[0];
        dst[0] = a[1] * b[2] - a[2] * b[1];
        dst[1] = t1;
        dst[2] = t2;

        return dst;
      }

      /**
       * Computes the dot product of two vectors; assumes both vectors have
       * three entries.
       * @param {module:twgl/v3.Vec3} a Operand vector.
       * @param {module:twgl/v3.Vec3} b Operand vector.
       * @return {number} dot product
       * @memberOf module:twgl/v3
       */
      function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      }

      /**
       * Computes the length of vector
       * @param {module:twgl/v3.Vec3} v vector.
       * @return {number} length of vector.
       * @memberOf module:twgl/v3
       */
      function length(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      }

      /**
       * Computes the square of the length of vector
       * @param {module:twgl/v3.Vec3} v vector.
       * @return {number} square of the length of vector.
       * @memberOf module:twgl/v3
       */
      function lengthSq(v) {
        return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
      }

      /**
       * Computes the distance between 2 points
       * @param {module:twgl/v3.Vec3} a vector.
       * @param {module:twgl/v3.Vec3} b vector.
       * @return {number} distance between a and b
       * @memberOf module:twgl/v3
       */
      function distance(a, b) {
        var dx = a[0] - b[0];
        var dy = a[1] - b[1];
        var dz = a[2] - b[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      }

      /**
       * Computes the square of the distance between 2 points
       * @param {module:twgl/v3.Vec3} a vector.
       * @param {module:twgl/v3.Vec3} b vector.
       * @return {number} square of the distance between a and b
       * @memberOf module:twgl/v3
       */
      function distanceSq(a, b) {
        var dx = a[0] - b[0];
        var dy = a[1] - b[1];
        var dz = a[2] - b[2];
        return dx * dx + dy * dy + dz * dz;
      }

      /**
       * Divides a vector by its Euclidean length and returns the quotient.
       * @param {module:twgl/v3.Vec3} a The vector.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @return {module:twgl/v3.Vec3} The normalized vector.
       * @memberOf module:twgl/v3
       */
      function normalize(a, dst) {
        dst = dst || new VecType(3);

        var lenSq = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
        var len = Math.sqrt(lenSq);
        if (len > 0.00001) {
          dst[0] = a[0] / len;
          dst[1] = a[1] / len;
          dst[2] = a[2] / len;
        } else {
          dst[0] = 0;
          dst[1] = 0;
          dst[2] = 0;
        }

        return dst;
      }

      /**
       * Negates a vector.
       * @param {module:twgl/v3.Vec3} v The vector.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @return {module:twgl/v3.Vec3} -v.
       * @memberOf module:twgl/v3
       */
      function negate(v, dst) {
        dst = dst || new VecType(3);

        dst[0] = -v[0];
        dst[1] = -v[1];
        dst[2] = -v[2];

        return dst;
      }

      /**
       * Copies a vector.
       * @param {module:twgl/v3.Vec3} v The vector.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @return {module:twgl/v3.Vec3} A copy of v.
       * @memberOf module:twgl/v3
       */
      function copy(v, dst) {
        dst = dst || new VecType(3);

        dst[0] = v[0];
        dst[1] = v[1];
        dst[2] = v[2];

        return dst;
      }

      /**
       * Multiplies a vector by another vector (component-wise); assumes a and
       * b have the same length.
       * @param {module:twgl/v3.Vec3} a Operand vector.
       * @param {module:twgl/v3.Vec3} b Operand vector.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @return {module:twgl/v3.Vec3} The vector of products of entries of a and
       *     b.
       * @memberOf module:twgl/v3
       */
      function multiply(a, b, dst) {
        dst = dst || new VecType(3);

        dst[0] = a[0] * b[0];
        dst[1] = a[1] * b[1];
        dst[2] = a[2] * b[2];

        return dst;
      }

      /**
       * Divides a vector by another vector (component-wise); assumes a and
       * b have the same length.
       * @param {module:twgl/v3.Vec3} a Operand vector.
       * @param {module:twgl/v3.Vec3} b Operand vector.
       * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
       * @return {module:twgl/v3.Vec3} The vector of quotients of entries of a and
       *     b.
       * @memberOf module:twgl/v3
       */
      function divide(a, b, dst) {
        dst = dst || new VecType(3);

        dst[0] = a[0] / b[0];
        dst[1] = a[1] / b[1];
        dst[2] = a[2] / b[2];

        return dst;
      }

      exports.add = add;
      exports.copy = copy;
      exports.create = create;
      exports.cross = cross;
      exports.distance = distance;
      exports.distanceSq = distanceSq;
      exports.divide = divide;
      exports.divScalar = divScalar;
      exports.dot = dot;
      exports.lerp = lerp;
      exports.length = length;
      exports.lengthSq = lengthSq;
      exports.mulScalar = mulScalar;
      exports.multiply = multiply;
      exports.negate = negate;
      exports.normalize = normalize;
      exports.setDefaultType = setDefaultType;
      exports.subtract = subtract;

      /***/
    },
    /* 4 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.getArray_ = exports.getNumComponents_ = exports.setAttributeDefaults_ = exports.setAttributePrefix = exports.setAttribInfoBufferFromArray = exports.createBufferInfoFromArrays = exports.createBufferFromTypedArray = exports.createBufferFromArray = exports.createBuffersFromArrays = exports.createAttribsFromArrays = undefined;

      var _typedarrays = __webpack_require__(1);

      var typedArrays = _interopRequireWildcard(_typedarrays);

      var _utils = __webpack_require__(0);

      var utils = _interopRequireWildcard(_utils);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * Low level attribute and buffer related functions
       *
       * You should generally not need to use these functions. They are provided
       * for those cases where you're doing something out of the ordinary
       * and you need lower level access.
       *
       * For backward compatibily they are available at both `twgl.attributes` and `twgl`
       * itself
       *
       * See {@link module:twgl} for core functions
       *
       * @module twgl/attributes
       */

      // make sure we don't see a global gl
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      var gl = undefined; // eslint-disable-line
      var defaults = {
        attribPrefix: ""
      };

      /**
       * Sets the default attrib prefix
       *
       * When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
       * as it makes it clear where they came from. But, when building geometry I prefer using unprefixed names.
       *
       * In otherwords I'll create arrays of geometry like this
       *
       *     var arrays = {
       *       position: ...
       *       normal: ...
       *       texcoord: ...
       *     };
       *
       * But need those mapped to attributes and my attributes start with `a_`.
       *
       * @deprecated see {@link module:twgl.setDefaults}
       * @param {string} prefix prefix for attribs
       * @memberOf module:twgl/attributes
       */
      function setAttributePrefix(prefix) {
        defaults.attribPrefix = prefix;
      }

      function setDefaults(newDefaults) {
        utils.copyExistingProperties(newDefaults, defaults);
      }

      function setBufferFromTypedArray(gl, type, buffer, array, drawType) {
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
      }

      /**
       * Given typed array creates a WebGLBuffer and copies the typed array
       * into it.
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|WebGLBuffer} typedArray the typed array. Note: If a WebGLBuffer is passed in it will just be returned. No action will be taken
       * @param {number} [type] the GL bind type for the buffer. Default = `gl.ARRAY_BUFFER`.
       * @param {number} [drawType] the GL draw type for the buffer. Default = 'gl.STATIC_DRAW`.
       * @return {WebGLBuffer} the created WebGLBuffer
       * @memberOf module:twgl/attributes
       */
      function createBufferFromTypedArray(gl, typedArray, type, drawType) {
        if (typedArray instanceof WebGLBuffer) {
          return typedArray;
        }
        type = type || gl.ARRAY_BUFFER;
        var buffer = gl.createBuffer();
        setBufferFromTypedArray(gl, type, buffer, typedArray, drawType);
        return buffer;
      }

      function isIndices(name) {
        return name === "indices";
      }

      // This is really just a guess. Though I can't really imagine using
      // anything else? Maybe for some compression?
      function getNormalizationForTypedArray(typedArray) {
        if (typedArray instanceof Int8Array) {
          return true;
        } // eslint-disable-line
        if (typedArray instanceof Uint8Array) {
          return true;
        } // eslint-disable-line
        return false;
      }

      // This is really just a guess. Though I can't really imagine using
      // anything else? Maybe for some compression?
      function getNormalizationForTypedArrayType(typedArrayType) {
        if (typedArrayType === Int8Array) {
          return true;
        } // eslint-disable-line
        if (typedArrayType === Uint8Array) {
          return true;
        } // eslint-disable-line
        return false;
      }

      function getArray(array) {
        return array.length ? array : array.data;
      }

      var texcoordRE = /coord|texture/i;
      var colorRE = /color|colour/i;

      function guessNumComponentsFromName(name, length) {
        var numComponents = void 0;
        if (texcoordRE.test(name)) {
          numComponents = 2;
        } else if (colorRE.test(name)) {
          numComponents = 4;
        } else {
          numComponents = 3; // position, normals, indices ...
        }

        if (length % numComponents > 0) {
          throw "Can not guess numComponents for attribute '" + name + "'. Tried " + numComponents + " but " + length + " values is not evenly divisible by " + numComponents + ". You should specify it.";
        }

        return numComponents;
      }

      function getNumComponents(array, arrayName) {
        return array.numComponents || array.size || guessNumComponentsFromName(arrayName, getArray(array).length);
      }

      function makeTypedArray(array, name) {
        if (typedArrays.isArrayBuffer(array)) {
          return array;
        }

        if (typedArrays.isArrayBuffer(array.data)) {
          return array.data;
        }

        if (Array.isArray(array)) {
          array = {
            data: array
          };
        }

        var Type = array.type;
        if (!Type) {
          if (isIndices(name)) {
            Type = Uint16Array;
          } else {
            Type = Float32Array;
          }
        }
        return new Type(array.data);
      }

      /**
       * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
       * for the attribute.
       *
       * @typedef {Object} AttribInfo
       * @property {number} [numComponents] the number of components for this attribute.
       * @property {number} [size] synonym for `numComponents`.
       * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
       * @property {boolean} [normalize] whether or not to normalize the data. Default = false
       * @property {number} [offset] offset into buffer in bytes. Default = 0
       * @property {number} [stride] the stride in bytes per element. Default = 0
       * @property {number} [divisor] the divisor in instances. Default = undefined. Note: undefined = don't call gl.vertexAttribDivisor
       *    where as anything else = do call it with this value
       * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
       * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
       * @memberOf module:twgl
       */

      /**
       * Use this type of array spec when TWGL can't guess the type or number of compoments of an array
       * @typedef {Object} FullArraySpec
       * @property {(number|number[]|ArrayBufferView)} data The data of the array. A number alone becomes the number of elements of type.
       * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
       *    If `coord` is in the name assumes `numComponents = 2`.
       *    If `color` is in the name assumes `numComponents = 4`.
       *    otherwise assumes `numComponents = 3`
       * @property {constructor} type The type. This is only used if `data` is a JavaScript array. It is the constructor for the typedarray. (eg. `Uint8Array`).
       * For example if you want colors in a `Uint8Array` you might have a `FullArraySpec` like `{ type: Uint8Array, data: [255,0,255,255, ...], }`.
       * @property {number} [size] synonym for `numComponents`.
       * @property {boolean} [normalize] normalize for `vertexAttribPointer`. Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
       * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
       * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
       * @property {number} [divisor] divisor for `vertexAttribDivisor`. Default = undefined. Note: undefined = don't call gl.vertexAttribDivisor
       *    where as anything else = do call it with this value
       * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array prefixed by the default attribPrefix.
       * @property {string} [name] synonym for `attrib`.
       * @property {string} [attribName] synonym for `attrib`.
       * @memberOf module:twgl
       */

      /**
       * An individual array in {@link module:twgl.Arrays}
       *
       * When passed to {@link module:twgl.createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBufferView`
       * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
       * be `Float32Array`. If an ArraySpec is a number it's the number of floats for an empty (zeroed) buffer.
       *
       * @typedef {(number|number[]|ArrayBufferView|module:twgl.FullArraySpec)} ArraySpec
       * @memberOf module:twgl
       */

      /**
       * This is a JavaScript object of arrays by name. The names should match your shader's attributes. If your
       * attributes have a common prefix you can specify it by calling {@link module:twgl.setAttributePrefix}.
       *
       *     Bare JavaScript Arrays
       *
       *         var arrays = {
       *            position: [-1, 1, 0],
       *            normal: [0, 1, 0],
       *            ...
       *         }
       *
       *     Bare TypedArrays
       *
       *         var arrays = {
       *            position: new Float32Array([-1, 1, 0]),
       *            color: new Uint8Array([255, 128, 64, 255]),
       *            ...
       *         }
       *
       * *   Will guess at `numComponents` if not specified based on name.
       *
       *     If `coord` is in the name assumes `numComponents = 2`
       *
       *     If `color` is in the name assumes `numComponents = 4`
       *
       *     otherwise assumes `numComponents = 3`
       *
       * Objects with various fields. See {@link module:twgl.FullArraySpec}.
       *
       *     var arrays = {
       *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
       *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
       *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
       *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
       *     };
       *
       * @typedef {Object.<string, module:twgl.ArraySpec>} Arrays
       * @memberOf module:twgl
       */

      /**
       * Creates a set of attribute data and WebGLBuffers from set of arrays
       *
       * Given
       *
       *      var arrays = {
       *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
       *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
       *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
       *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
       *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
       *      };
       *
       * returns something like
       *
       *      var attribs = {
       *        position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
       *        texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
       *        normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
       *        color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
       *      };
       *
       * notes:
       *
       * *   Arrays can take various forms
       *
       *     Bare JavaScript Arrays
       *
       *         var arrays = {
       *            position: [-1, 1, 0],
       *            normal: [0, 1, 0],
       *            ...
       *         }
       *
       *     Bare TypedArrays
       *
       *         var arrays = {
       *            position: new Float32Array([-1, 1, 0]),
       *            color: new Uint8Array([255, 128, 64, 255]),
       *            ...
       *         }
       *
       * *   Will guess at `numComponents` if not specified based on name.
       *
       *     If `coord` is in the name assumes `numComponents = 2`
       *
       *     If `color` is in the name assumes `numComponents = 4`
       *
       *     otherwise assumes `numComponents = 3`
       *
       * @param {WebGLRenderingContext} gl The webgl rendering context.
       * @param {module:twgl.Arrays} arrays The arrays
       * @return {Object.<string, module:twgl.AttribInfo>} the attribs
       * @memberOf module:twgl/attributes
       */
      function createAttribsFromArrays(gl, arrays) {
        var attribs = {};
        Object.keys(arrays).forEach(function (arrayName) {
          if (!isIndices(arrayName)) {
            var array = arrays[arrayName];
            var attribName = array.attrib || array.name || array.attribName || defaults.attribPrefix + arrayName;
            var buffer = void 0;
            var type = void 0;
            var normalization = void 0;
            var numComponents = void 0;
            var numValues = void 0;
            if (typeof array === "number" || typeof array.data === "number") {
              numValues = array.data || array;
              var arrayType = array.type || Float32Array;
              var numBytes = numValues * arrayType.BYTES_PER_ELEMENT;
              type = typedArrays.getGLTypeForTypedArrayType(arrayType);
              normalization = array.normalize !== undefined ? array.normalize : getNormalizationForTypedArrayType(arrayType);
              numComponents = array.numComponents || array.size || guessNumComponentsFromName(arrayName, numValues);
              buffer = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
              gl.bufferData(gl.ARRAY_BUFFER, numBytes, array.drawType || gl.STATIC_DRAW);
            } else {
              var typedArray = makeTypedArray(array, arrayName);
              buffer = createBufferFromTypedArray(gl, typedArray, undefined, array.drawType);
              type = typedArrays.getGLTypeForTypedArray(typedArray);
              normalization = array.normalize !== undefined ? array.normalize : getNormalizationForTypedArray(typedArray);
              numComponents = getNumComponents(array, arrayName);
              numValues = typedArray.length;
            }
            attribs[attribName] = {
              buffer: buffer,
              numComponents: numComponents,
              type: type,
              normalize: normalization,
              stride: array.stride || 0,
              offset: array.offset || 0,
              divisor: array.divisor === undefined ? undefined : array.divisor,
              drawType: array.drawType
            };
          }
        });
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return attribs;
      }

      /**
       * Sets the contents of a buffer attached to an attribInfo
       *
       * This is helper function to dynamically update a buffer.
       *
       * Let's say you make a bufferInfo
       *
       *     var arrays = {
       *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
       *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
       *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
       *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
       *     };
       *     var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
       *
       *  And you want to dynamically upate the positions. You could do this
       *
       *     // assuming arrays.position has already been updated with new data.
       *     twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, arrays.position);
       *
       * @param {WebGLRenderingContext} gl
       * @param {AttribInfo} attribInfo The attribInfo who's buffer contents to set. NOTE: If you have an attribute prefix
       *   the name of the attribute will include the prefix.
       * @param {ArraySpec} array Note: it is arguably ineffient to pass in anything but a typed array because anything
       *    else will have to be converted to a typed array before it can be used by WebGL. During init time that
       *    inefficiency is usually not important but if you're updating data dynamically best to be efficient.
       * @param {number} [offset] an optional offset into the buffer. This is only an offset into the WebGL buffer
       *    not the array. To pass in an offset into the array itself use a typed array and create an `ArrayBufferView`
       *    for the portion of the array you want to use.
       *
       *        var someArray = new Float32Array(1000); // an array with 1000 floats
       *        var someSubArray = new Float32Array(someArray.buffer, offsetInBytes, sizeInUnits); // a view into someArray
       *
       *    Now you can pass `someSubArray` into setAttribInfoBufferFromArray`
       * @memberOf module:twgl/attributes
       */
      function setAttribInfoBufferFromArray(gl, attribInfo, array, offset) {
        array = makeTypedArray(array);
        if (offset !== undefined) {
          gl.bindBuffer(gl.ARRAY_BUFFER, attribInfo.buffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, offset, array);
        } else {
          setBufferFromTypedArray(gl, gl.ARRAY_BUFFER, attribInfo.buffer, array, attribInfo.drawType);
        }
      }

      function getBytesPerValueForGLType(gl, type) {
        if (type === gl.BYTE) return 1; // eslint-disable-line
        if (type === gl.UNSIGNED_BYTE) return 1; // eslint-disable-line
        if (type === gl.SHORT) return 2; // eslint-disable-line
        if (type === gl.UNSIGNED_SHORT) return 2; // eslint-disable-line
        if (type === gl.INT) return 4; // eslint-disable-line
        if (type === gl.UNSIGNED_INT) return 4; // eslint-disable-line
        if (type === gl.FLOAT) return 4; // eslint-disable-line
        return 0;
      }

      /**
       * tries to get the number of elements from a set of arrays.
       */
      var positionKeys = ['position', 'positions', 'a_position'];
      function getNumElementsFromNonIndexedArrays(arrays) {
        var key = void 0;
        for (var _ii = 0; _ii < positionKeys.length; ++_ii) {
          key = positionKeys[_ii];
          if (key in arrays) {
            break;
          }
        }
        if (ii === positionKeys.length) {
          key = Object.keys(arrays)[0];
        }
        var array = arrays[key];
        var length = getArray(array).length;
        var numComponents = getNumComponents(array, key);
        var numElements = length / numComponents;
        if (length % numComponents > 0) {
          throw "numComponents " + numComponents + " not correct for length " + length;
        }
        return numElements;
      }

      function getNumElementsFromAttributes(gl, attribs) {
        var key = void 0;
        var ii = void 0;
        for (ii = 0; ii < positionKeys.length; ++ii) {
          key = positionKeys[ii];
          if (key in attribs) {
            break;
          }
          key = defaults.attribPrefix + key;
          if (key in attribs) {
            break;
          }
        }
        if (ii === positionKeys.length) {
          key = Object.keys(attribs)[0];
        }
        var attrib = attribs[key];
        gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
        var numBytes = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        var bytesPerValue = getBytesPerValueForGLType(gl, attrib.type);
        var totalElements = numBytes / bytesPerValue;
        var numComponents = attrib.numComponents || attrib.size;
        // TODO: check stride
        var numElements = totalElements / numComponents;
        if (numElements % 1 !== 0) {
          throw "numComponents " + numComponents + " not correct for length " + length;
        }
        return numElements;
      }

      /**
       * @typedef {Object} BufferInfo
       * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
       * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
       * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
       * @property {Object.<string, module:twgl.AttribInfo>} [attribs] The attribs approriate to call `setAttributes`
       * @memberOf module:twgl
       */

      /**
       * Creates a BufferInfo from an object of arrays.
       *
       * This can be passed to {@link module:twgl.setBuffersAndAttributes} and to
       * {@link module:twgl:drawBufferInfo}.
       *
       * Given an object like
       *
       *     var arrays = {
       *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
       *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
       *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
       *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
       *     };
       *
       *  Creates an BufferInfo like this
       *
       *     bufferInfo = {
       *       numElements: 4,        // or whatever the number of elements is
       *       indices: WebGLBuffer,  // this property will not exist if there are no indices
       *       attribs: {
       *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
       *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
       *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
       *       },
       *     };
       *
       *  The properties of arrays can be JavaScript arrays in which case the number of components
       *  will be guessed.
       *
       *     var arrays = {
       *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
       *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
       *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
       *        indices:  [0, 1, 2, 1, 2, 3],
       *     };
       *
       *  They can also by TypedArrays
       *
       *     var arrays = {
       *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
       *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
       *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
       *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
       *     };
       *
       *  Or augmentedTypedArrays
       *
       *     var positions = createAugmentedTypedArray(3, 4);
       *     var texcoords = createAugmentedTypedArray(2, 4);
       *     var normals   = createAugmentedTypedArray(3, 4);
       *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
       *
       *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
       *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
       *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
       *     indices.push([0, 1, 2, 1, 2, 3]);
       *
       *     var arrays = {
       *        position: positions,
       *        texcoord: texcoords,
       *        normal:   normals,
       *        indices:  indices,
       *     };
       *
       * For the last example it is equivalent to
       *
       *     var bufferInfo = {
       *       attribs: {
       *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
       *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
       *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
       *       },
       *       indices: gl.createBuffer(),
       *       numElements: 6,
       *     };
       *
       *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
       *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
       *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
       *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
       *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
       *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
       *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
       *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @param {module:twgl.Arrays} arrays Your data
       * @return {module:twgl.BufferInfo} A BufferInfo
       * @memberOf module:twgl/attributes
       */
      function createBufferInfoFromArrays(gl, arrays) {
        var bufferInfo = {
          attribs: createAttribsFromArrays(gl, arrays)
        };
        var indices = arrays.indices;
        if (indices) {
          var newIndices = makeTypedArray(indices, "indices");
          bufferInfo.indices = createBufferFromTypedArray(gl, newIndices, gl.ELEMENT_ARRAY_BUFFER);
          bufferInfo.numElements = newIndices.length;
          bufferInfo.elementType = typedArrays.getGLTypeForTypedArray(newIndices);
        } else {
          bufferInfo.numElements = getNumElementsFromAttributes(gl, bufferInfo.attribs);
        }

        return bufferInfo;
      }

      /**
       * Creates a buffer from an array, typed array, or array spec
       *
       * Given something like this
       *
       *     [1, 2, 3],
       *
       * or
       *
       *     new Uint16Array([1,2,3]);
       *
       * or
       *
       *     {
       *        data: [1, 2, 3],
       *        type: Uint8Array,
       *     }
       *
       * returns a WebGLBuffer that constains the given data.
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
       * @param {module:twgl.ArraySpec} array an array, typed array, or array spec.
       * @param {string} arrayName name of array. Used to guess the type if type can not be dervied other wise.
       * @return {WebGLBuffer} a WebGLBuffer containing the data in array.
       * @memberOf module:twgl/attributes
       */
      function createBufferFromArray(gl, array, arrayName) {
        var type = arrayName === "indices" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
        var typedArray = makeTypedArray(array, arrayName);
        return createBufferFromTypedArray(gl, typedArray, type);
      }

      /**
       * Creates buffers from arrays or typed arrays
       *
       * Given something like this
       *
       *     var arrays = {
       *        positions: [1, 2, 3],
       *        normals: [0, 0, 1],
       *     }
       *
       * returns something like
       *
       *     buffers = {
       *       positions: WebGLBuffer,
       *       normals: WebGLBuffer,
       *     }
       *
       * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
       * @param {module:twgl.Arrays} arrays
       * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
       * @memberOf module:twgl/attributes
       */
      function createBuffersFromArrays(gl, arrays) {
        var buffers = {};
        Object.keys(arrays).forEach(function (key) {
          buffers[key] = createBufferFromArray(gl, arrays[key], key);
        });

        // Ugh!
        if (arrays.indices) {
          buffers.numElements = arrays.indices.length;
          buffers.elementType = typedArrays.getGLTypeForTypedArray(makeTypedArray(arrays.indices), 'indices');
        } else {
          buffers.numElements = getNumElementsFromNonIndexedArrays(arrays);
        }

        return buffers;
      }

      exports.createAttribsFromArrays = createAttribsFromArrays;
      exports.createBuffersFromArrays = createBuffersFromArrays;
      exports.createBufferFromArray = createBufferFromArray;
      exports.createBufferFromTypedArray = createBufferFromTypedArray;
      exports.createBufferInfoFromArrays = createBufferInfoFromArrays;
      exports.setAttribInfoBufferFromArray = setAttribInfoBufferFromArray;
      exports.setAttributePrefix = setAttributePrefix;
      exports.setAttributeDefaults_ = setDefaults;
      exports.getNumComponents_ = getNumComponents;
      exports.getArray_ = getArray;

      /***/
    },
    /* 5 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.getBytesPerElementForInternalFormat = exports.getNumComponentsForFormat = exports.resizeTexture = exports.createTextures = exports.setDefaultTextureColor = exports.setTextureParameters = exports.setTextureFilteringForSize = exports.setTextureFromElement = exports.loadTextureFromUrl = exports.setTextureFromArray = exports.setEmptyTexture = exports.createTexture = exports.setSamplerParameters = exports.createSamplers = exports.createSampler = exports.setTextureDefaults_ = undefined;

      var _typedarrays = __webpack_require__(1);

      var typedArrays = _interopRequireWildcard(_typedarrays);

      var _utils = __webpack_require__(0);

      var utils = _interopRequireWildcard(_utils);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * Low level texture related functions
       *
       * You should generally not need to use these functions. They are provided
       * for those cases where you're doing something out of the ordinary
       * and you need lower level access.
       *
       * For backward compatibily they are available at both `twgl.textures` and `twgl`
       * itself
       *
       * See {@link module:twgl} for core functions
       *
       * @module twgl/textures
       */

      // make sure we don't see a global gl
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      var gl = undefined; // eslint-disable-line
      var defaults = {
        textureColor: new Uint8Array([128, 192, 255, 255]),
        textureOptions: {},
        crossOrigin: undefined
      };
      var isArrayBuffer = typedArrays.isArrayBuffer;

      // Should we make this on demand?
      var ctx = document.createElement("canvas").getContext("2d");

      /* PixelFormat */
      var ALPHA = 0x1906;
      var RGB = 0x1907;
      var RGBA = 0x1908;
      var LUMINANCE = 0x1909;
      var LUMINANCE_ALPHA = 0x190A;
      var DEPTH_COMPONENT = 0x1902;
      var DEPTH_STENCIL = 0x84F9;

      /* TextureWrapMode */
      var REPEAT = 0x2901; // eslint-disable-line
      var MIRRORED_REPEAT = 0x8370; // eslint-disable-line

      /* TextureMagFilter */
      var NEAREST = 0x2600; // eslint-disable-line

      /* TextureMinFilter */
      var NEAREST_MIPMAP_NEAREST = 0x2700; // eslint-disable-line
      var LINEAR_MIPMAP_NEAREST = 0x2701; // eslint-disable-line
      var NEAREST_MIPMAP_LINEAR = 0x2702; // eslint-disable-line
      var LINEAR_MIPMAP_LINEAR = 0x2703; // eslint-disable-line

      var R8 = 0x8229;
      var R8_SNORM = 0x8F94;
      var R16F = 0x822D;
      var R32F = 0x822E;
      var R8UI = 0x8232;
      var R8I = 0x8231;
      var RG16UI = 0x823A;
      var RG16I = 0x8239;
      var RG32UI = 0x823C;
      var RG32I = 0x823B;
      var RG8 = 0x822B;
      var RG8_SNORM = 0x8F95;
      var RG16F = 0x822F;
      var RG32F = 0x8230;
      var RG8UI = 0x8238;
      var RG8I = 0x8237;
      var R16UI = 0x8234;
      var R16I = 0x8233;
      var R32UI = 0x8236;
      var R32I = 0x8235;
      var RGB8 = 0x8051;
      var SRGB8 = 0x8C41;
      var RGB565 = 0x8D62;
      var RGB8_SNORM = 0x8F96;
      var R11F_G11F_B10F = 0x8C3A;
      var RGB9_E5 = 0x8C3D;
      var RGB16F = 0x881B;
      var RGB32F = 0x8815;
      var RGB8UI = 0x8D7D;
      var RGB8I = 0x8D8F;
      var RGB16UI = 0x8D77;
      var RGB16I = 0x8D89;
      var RGB32UI = 0x8D71;
      var RGB32I = 0x8D83;
      var RGBA8 = 0x8058;
      var SRGB8_ALPHA8 = 0x8C43;
      var RGBA8_SNORM = 0x8F97;
      var RGB5_A1 = 0x8057;
      var RGBA4 = 0x8056;
      var RGB10_A2 = 0x8059;
      var RGBA16F = 0x881A;
      var RGBA32F = 0x8814;
      var RGBA8UI = 0x8D7C;
      var RGBA8I = 0x8D8E;
      var RGB10_A2UI = 0x906F;
      var RGBA16UI = 0x8D76;
      var RGBA16I = 0x8D88;
      var RGBA32I = 0x8D82;
      var RGBA32UI = 0x8D70;

      var DEPTH_COMPONENT16 = 0x81A5;
      var DEPTH_COMPONENT24 = 0x81A6;
      var DEPTH_COMPONENT32F = 0x8CAC;
      var DEPTH32F_STENCIL8 = 0x8CAD;
      var DEPTH24_STENCIL8 = 0x88F0;

      /* DataType */
      var BYTE = 0x1400;
      var UNSIGNED_BYTE = 0x1401;
      var SHORT = 0x1402;
      var UNSIGNED_SHORT = 0x1403;
      var INT = 0x1404;
      var UNSIGNED_INT = 0x1405;
      var FLOAT = 0x1406;
      var UNSIGNED_SHORT_4_4_4_4 = 0x8033;
      var UNSIGNED_SHORT_5_5_5_1 = 0x8034;
      var UNSIGNED_SHORT_5_6_5 = 0x8363;
      var HALF_FLOAT = 0x140B;
      var HALF_FLOAT_OES = 0x8D61; // Thanks Khronos for making this different >:(
      var UNSIGNED_INT_2_10_10_10_REV = 0x8368;
      var UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
      var UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
      var FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
      var UNSIGNED_INT_24_8 = 0x84FA;

      var RG = 0x8227;
      var RG_INTEGER = 0x8228;
      var RED = 0x1903;
      var RED_INTEGER = 0x8D94;
      var RGB_INTEGER = 0x8D98;
      var RGBA_INTEGER = 0x8D99;

      var formatInfo = {};
      {
        // NOTE: this is named `numColorComponents` vs `numComponents` so we can let Uglify mangle
        // the name.
        var f = formatInfo;
        f[ALPHA] = { numColorComponents: 1 };
        f[LUMINANCE] = { numColorComponents: 1 };
        f[LUMINANCE_ALPHA] = { numColorComponents: 2 };
        f[RGB] = { numColorComponents: 3 };
        f[RGBA] = { numColorComponents: 4 };
        f[RED] = { numColorComponents: 1 };
        f[RED_INTEGER] = { numColorComponents: 1 };
        f[RG] = { numColorComponents: 2 };
        f[RG_INTEGER] = { numColorComponents: 2 };
        f[RGB] = { numColorComponents: 3 };
        f[RGB_INTEGER] = { numColorComponents: 3 };
        f[RGBA] = { numColorComponents: 4 };
        f[RGBA_INTEGER] = { numColorComponents: 4 };
        f[DEPTH_COMPONENT] = { numColorComponents: 1 };
        f[DEPTH_STENCIL] = { numColorComponents: 2 };
      }

      var textureInternalFormatInfo = {};
      {
        // NOTE: these properties need unique names so we can let Uglify mangle the name.
        var t = textureInternalFormatInfo;
        // unsized formats
        t[ALPHA] = { textureFormat: ALPHA, colorRenderable: true, textureFilterable: true, bytesPerElement: [1, 2, 2, 4], type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT] };
        t[LUMINANCE] = { textureFormat: LUMINANCE, colorRenderable: true, textureFilterable: true, bytesPerElement: [1, 2, 2, 4], type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT] };
        t[LUMINANCE_ALPHA] = { textureFormat: LUMINANCE_ALPHA, colorRenderable: true, textureFilterable: true, bytesPerElement: [2, 4, 4, 8], type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT] };
        t[RGB] = { textureFormat: RGB, colorRenderable: true, textureFilterable: true, bytesPerElement: [3, 6, 6, 12, 2], type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT, UNSIGNED_SHORT_5_6_5] };
        t[RGBA] = { textureFormat: RGBA, colorRenderable: true, textureFilterable: true, bytesPerElement: [4, 8, 8, 16, 2, 2], type: [UNSIGNED_BYTE, HALF_FLOAT, HALF_FLOAT_OES, FLOAT, UNSIGNED_SHORT_4_4_4_4, UNSIGNED_SHORT_5_5_5_1] };

        // sized formats
        t[R8] = { textureFormat: RED, colorRenderable: true, textureFilterable: true, bytesPerElement: 1, type: UNSIGNED_BYTE };
        t[R8_SNORM] = { textureFormat: RED, colorRenderable: false, textureFilterable: true, bytesPerElement: 1, type: BYTE };
        t[R16F] = { textureFormat: RED, colorRenderable: false, textureFilterable: true, bytesPerElement: [4, 2], type: [FLOAT, HALF_FLOAT] };
        t[R32F] = { textureFormat: RED, colorRenderable: false, textureFilterable: false, bytesPerElement: 4, type: FLOAT };
        t[R8UI] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 1, type: UNSIGNED_BYTE };
        t[R8I] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 1, type: BYTE };
        t[R16UI] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 2, type: UNSIGNED_SHORT };
        t[R16I] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 2, type: SHORT };
        t[R32UI] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: UNSIGNED_INT };
        t[R32I] = { textureFormat: RED_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: INT };
        t[RG8] = { textureFormat: RG, colorRenderable: true, textureFilterable: true, bytesPerElement: 2, type: UNSIGNED_BYTE };
        t[RG8_SNORM] = { textureFormat: RG, colorRenderable: false, textureFilterable: true, bytesPerElement: 2, type: BYTE };
        t[RG16F] = { textureFormat: RG, colorRenderable: false, textureFilterable: true, bytesPerElement: [8, 4], type: [FLOAT, HALF_FLOAT] };
        t[RG32F] = { textureFormat: RG, colorRenderable: false, textureFilterable: false, bytesPerElement: 8, type: FLOAT };
        t[RG8UI] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 2, type: UNSIGNED_BYTE };
        t[RG8I] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 2, type: BYTE };
        t[RG16UI] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: UNSIGNED_SHORT };
        t[RG16I] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: SHORT };
        t[RG32UI] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 8, type: UNSIGNED_INT };
        t[RG32I] = { textureFormat: RG_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 8, type: INT };
        t[RGB8] = { textureFormat: RGB, colorRenderable: true, textureFilterable: true, bytesPerElement: 3, type: UNSIGNED_BYTE };
        t[SRGB8] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: 3, type: UNSIGNED_BYTE };
        t[RGB565] = { textureFormat: RGB, colorRenderable: true, textureFilterable: true, bytesPerElement: [3, 2], type: [UNSIGNED_BYTE, UNSIGNED_SHORT_5_6_5] };
        t[RGB8_SNORM] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: 3, type: BYTE };
        t[R11F_G11F_B10F] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: [12, 6, 4], type: [FLOAT, HALF_FLOAT, UNSIGNED_INT_10F_11F_11F_REV] };
        t[RGB9_E5] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: [12, 6, 4], type: [FLOAT, HALF_FLOAT, UNSIGNED_INT_5_9_9_9_REV] };
        t[RGB16F] = { textureFormat: RGB, colorRenderable: false, textureFilterable: true, bytesPerElement: [12, 6], type: [FLOAT, HALF_FLOAT] };
        t[RGB32F] = { textureFormat: RGB, colorRenderable: false, textureFilterable: false, bytesPerElement: 12, type: FLOAT };
        t[RGB8UI] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: 3, type: UNSIGNED_BYTE };
        t[RGB8I] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: 3, type: BYTE };
        t[RGB16UI] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: 6, type: UNSIGNED_SHORT };
        t[RGB16I] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: 6, type: SHORT };
        t[RGB32UI] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: 12, type: UNSIGNED_INT };
        t[RGB32I] = { textureFormat: RGB_INTEGER, colorRenderable: false, textureFilterable: false, bytesPerElement: 12, type: INT };
        t[RGBA8] = { textureFormat: RGBA, colorRenderable: true, textureFilterable: true, bytesPerElement: 4, type: UNSIGNED_BYTE };
        t[SRGB8_ALPHA8] = { textureFormat: RGBA, colorRenderable: true, textureFilterable: true, bytesPerElement: 4, type: UNSIGNED_BYTE };
        t[RGBA8_SNORM] = { textureFormat: RGBA, colorRenderable: false, textureFilterable: true, bytesPerElement: 4, type: BYTE };
        t[RGB5_A1] = { textureFormat: RGBA, colorRenderable: true, textureFilterable: true, bytesPerElement: [4, 2, 4], type: [UNSIGNED_BYTE, UNSIGNED_SHORT_5_5_5_1, UNSIGNED_INT_2_10_10_10_REV] };
        t[RGBA4] = { textureFormat: RGBA, colorRenderable: true, textureFilterable: true, bytesPerElement: [4, 2], type: [UNSIGNED_BYTE, UNSIGNED_SHORT_4_4_4_4] };
        t[RGB10_A2] = { textureFormat: RGBA, colorRenderable: true, textureFilterable: true, bytesPerElement: 4, type: UNSIGNED_INT_2_10_10_10_REV };
        t[RGBA16F] = { textureFormat: RGBA, colorRenderable: false, textureFilterable: true, bytesPerElement: [16, 8], type: [FLOAT, HALF_FLOAT] };
        t[RGBA32F] = { textureFormat: RGBA, colorRenderable: false, textureFilterable: false, bytesPerElement: 16, type: FLOAT };
        t[RGBA8UI] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: UNSIGNED_BYTE };
        t[RGBA8I] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: BYTE };
        t[RGB10_A2UI] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: UNSIGNED_INT_2_10_10_10_REV };
        t[RGBA16UI] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 8, type: UNSIGNED_SHORT };
        t[RGBA16I] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 8, type: SHORT };
        t[RGBA32I] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 16, type: INT };
        t[RGBA32UI] = { textureFormat: RGBA_INTEGER, colorRenderable: true, textureFilterable: false, bytesPerElement: 16, type: UNSIGNED_INT };
        // Sized Internal
        t[DEPTH_COMPONENT16] = { textureFormat: DEPTH_COMPONENT, colorRenderable: true, textureFilterable: false, bytesPerElement: [2, 4], type: [UNSIGNED_SHORT, UNSIGNED_INT] };
        t[DEPTH_COMPONENT24] = { textureFormat: DEPTH_COMPONENT, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: UNSIGNED_INT };
        t[DEPTH_COMPONENT32F] = { textureFormat: DEPTH_COMPONENT, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: FLOAT };
        t[DEPTH24_STENCIL8] = { textureFormat: DEPTH_STENCIL, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: UNSIGNED_INT_24_8 };
        t[DEPTH32F_STENCIL8] = { textureFormat: DEPTH_STENCIL, colorRenderable: true, textureFilterable: false, bytesPerElement: 4, type: FLOAT_32_UNSIGNED_INT_24_8_REV };

        Object.keys(t).forEach(function (internalFormat) {
          var info = t[internalFormat];
          info.bytesPerElementMap = {};
          if (Array.isArray(info.bytesPerElement)) {
            info.bytesPerElement.forEach(function (bytesPerElement, ndx) {
              var type = info.type[ndx];
              info.bytesPerElementMap[type] = bytesPerElement;
            });
          } else {
            var type = info.type;
            info.bytesPerElementMap[type] = info.bytesPerElement;
          }
        });
      }

      /**
       * Gets the number of bytes per element for a given internalFormat / type
       * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
       * @param {number} type The type parameter for texImage2D etc..
       * @return {number} the number of bytes per element for the given internalFormat, type combo
       * @memberOf module:twgl/textures
       */
      function getBytesPerElementForInternalFormat(internalFormat, type) {
        var info = textureInternalFormatInfo[internalFormat];
        if (!info) {
          throw "unknown internal format";
        }
        var bytesPerElement = info.bytesPerElementMap[type];
        if (bytesPerElement === undefined) {
          throw "unknown internal format";
        }
        return bytesPerElement;
      }

      /**
       * Gets the format for a given internalFormat
       *
       * @param {number} internalFormat The internal format
       * @return {{format:number, type:number}} the corresponding format and type
       */
      function getFormatAndTypeForInternalFormat(internalFormat) {
        var info = textureInternalFormatInfo[internalFormat];
        if (!info) {
          throw "unknown internal format";
        }
        return {
          format: info.textureFormat,
          type: Array.isArray(info.type) ? info.type[0] : info.type
        };
      }

      /**
       * Returns true if value is power of 2
       * @param {number} value number to check.
       * @return true if value is power of 2
       */
      function isPowerOf2(value) {
        return (value & value - 1) === 0;
      }

      /**
       * Gets whether or not we can generate mips for the given format
       * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
       * @param {number} type The type parameter for texImage2D etc..
       * @return {boolean} true if we can generate mips
       */
      function canGenerateMipmap(gl, width, height, internalFormat /*, type */) {
        if (!utils.isWebGL2(gl)) {
          return isPowerOf2(width) && isPowerOf2(height);
        }
        var info = textureInternalFormatInfo[internalFormat];
        if (!info) {
          throw "unknown internal format";
        }
        return info.colorRenderable && info.textureFilterable;
      }

      /**
       * Gets whether or not we can generate mips for the given format
       * @param {number} internalFormat The internalFormat parameter from texImage2D etc..
       * @param {number} type The type parameter for texImage2D etc..
       * @return {boolean} true if we can generate mips
       */
      function canFilter(internalFormat /*, type */) {
        var info = textureInternalFormatInfo[internalFormat];
        if (!info) {
          throw "unknown internal format";
        }
        return info.textureFilterable;
      }

      /**
       * Gets the number of compontents for a given image format.
       * @param {number} format the format.
       * @return {number} the number of components for the format.
       * @memberOf module:twgl/textures
       */
      function getNumComponentsForFormat(format) {
        var info = formatInfo[format];
        if (!info) {
          throw "unknown format: " + format;
        }
        return info.numColorComponents;
      }

      /**
       * Gets the texture type for a given array type.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @return {number} the gl texture type
       */
      function getTextureTypeForArrayType(gl, src, defaultType) {
        if (isArrayBuffer(src)) {
          return typedArrays.getGLTypeForTypedArray(src);
        }
        return defaultType || gl.UNSIGNED_BYTE;
      }

      function guessDimensions(gl, target, width, height, numElements) {
        if (numElements % 1 !== 0) {
          throw "can't guess dimensions";
        }
        if (!width && !height) {
          var size = Math.sqrt(numElements / (target === gl.TEXTURE_CUBE_MAP ? 6 : 1));
          if (size % 1 === 0) {
            width = size;
            height = size;
          } else {
            width = numElements;
            height = 1;
          }
        } else if (!height) {
          height = numElements / width;
          if (height % 1) {
            throw "can't guess dimensions";
          }
        } else if (!width) {
          width = numElements / height;
          if (width % 1) {
            throw "can't guess dimensions";
          }
        }
        return {
          width: width,
          height: height
        };
      }

      /**
       * Sets the default texture color.
       *
       * The default texture color is used when loading textures from
       * urls. Because the URL will be loaded async we'd like to be
       * able to use the texture immediately. By putting a 1x1 pixel
       * color in the texture we can start using the texture before
       * the URL has loaded.
       *
       * @param {number[]} color Array of 4 values in the range 0 to 1
       * @deprecated see {@link module:twgl.setDefaults}
       * @memberOf module:twgl/textures
       */
      function setDefaultTextureColor(color) {
        defaults.textureColor = new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
      }

      function setDefaults(newDefaults) {
        utils.copyExistingProperties(newDefaults, defaults);
        if (newDefaults.textureColor) {
          setDefaultTextureColor(newDefaults.textureColor);
        }
      }

      /**
       * Gets a string for gl enum
       *
       * Note: Several enums are the same. Without more
       * context (which function) it's impossible to always
       * give the correct enum.
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @param {number} value the value of the enum you want to look up.
       */
      var glEnumToString = function () {
        var enums = void 0;

        function init(gl) {
          if (!enums) {
            enums = {};
            for (var key in gl) {
              if (typeof gl[key] === 'number') {
                enums[gl[key]] = key;
              }
            }
          }
        }

        return function glEnumToString(gl, value) {
          init(gl);
          return enums[value] || "0x" + value.toString(16);
        };
      }();

      /**
       * A function to generate the source for a texture.
       * @callback TextureFunc
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @param {module:twgl.TextureOptions} options the texture options
       * @return {*} Returns any of the things documentented for `src` for {@link module:twgl.TextureOptions}.
       * @memberOf module:twgl
       */

      /**
       * Texture options passed to most texture functions. Each function will use whatever options
       * are appropriate for its needs. This lets you pass the same options to all functions.
       *
       * @typedef {Object} TextureOptions
       * @property {number} [target] the type of texture `gl.TEXTURE_2D` or `gl.TEXTURE_CUBE_MAP`. Defaults to `gl.TEXTURE_2D`.
       * @property {number} [level] the mip level to affect. Defaults to 0. Note, if set auto will be considered false unless explicitly set to true.
       * @property {number} [width] the width of the texture. Only used if src is an array or typed array or null.
       * @property {number} [height] the height of a texture. Only used if src is an array or typed array or null.
       * @property {number} [depth] the depth of a texture. Only used if src is an array or type array or null and target is `TEXTURE_3D` .
       * @property {number} [min] the min filter setting (eg. `gl.LINEAR`). Defaults to `gl.NEAREST_MIPMAP_LINEAR`
       *     or if texture is not a power of 2 on both dimensions then defaults to `gl.LINEAR`.
       * @property {number} [mag] the mag filter setting (eg. `gl.LINEAR`). Defaults to `gl.LINEAR`
       * @property {number} [minMag] both the min and mag filter settings.
       * @property {number} [internalFormat] internal format for texture. Defaults to `gl.RGBA`
       * @property {number} [format] format for texture. Defaults to `gl.RGBA`.
       * @property {number} [type] type for texture. Defaults to `gl.UNSIGNED_BYTE` unless `src` is ArrayBufferView. If `src`
       *     is ArrayBufferView defaults to type that matches ArrayBufferView type.
       * @property {number} [wrap] Texture wrapping for both S and T (and R if TEXTURE_3D or WebGLSampler). Defaults to `gl.REPEAT` for 2D unless src is WebGL1 and src not npot and `gl.CLAMP_TO_EDGE` for cube
       * @property {number} [wrapS] Texture wrapping for S. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
       * @property {number} [wrapT] Texture wrapping for T. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
       * @property {number} [wrapR] Texture wrapping for R. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
       * @property {number} [minLod] TEXTURE_MIN_LOD setting
       * @property {number} [maxLod] TEXTURE_MAX_LOD setting
       * @property {number} [baseLevel] TEXTURE_BASE_LEVEL setting
       * @property {number} [maxLevel] TEXTURE_MAX_LEVEL setting
       * @property {number} [unpackAlignment] The `gl.UNPACK_ALIGNMENT` used when uploading an array. Defaults to 1.
       * @property {number} [premultiplyAlpha] Whether or not to premultiply alpha. Defaults to whatever the current setting is.
       *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
       *     the current setting for specific textures.
       * @property {number} [flipY] Whether or not to flip the texture vertically on upload. Defaults to whatever the current setting is.
       *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
       *     the current setting for specific textures.
       * @property {number} [colorspaceConversion] Whether or not to let the browser do colorspace conversion of the texture on upload. Defaults to whatever the current setting is.
       *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
       *     the current setting for specific textures.
       * @property {(number[]|ArrayBufferView)} color color used as temporary 1x1 pixel color for textures loaded async when src is a string.
       *    If it's a JavaScript array assumes color is 0 to 1 like most GL colors as in `[1, 0, 0, 1] = red=1, green=0, blue=0, alpha=0`.
       *    Defaults to `[0.5, 0.75, 1, 1]`. See {@link module:twgl.setDefaultTextureColor}. If `false` texture is set. Can be used to re-load a texture
       * @property {boolean} [auto] If `undefined` or `true`, in WebGL1, texture filtering is set automatically for non-power of 2 images and
       *    mips are generated for power of 2 images. In WebGL2 mips are generated if they can be. Note: if `level` is set above
       *    then then `auto` is assumed to be `false` unless explicity set to `true`.
       * @property {number[]} [cubeFaceOrder] The order that cube faces are pulled out of an img or set of images. The default is
       *
       *     [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
       *      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
       *      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
       *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
       *      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
       *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
       *
       * @property {(number[]|ArrayBufferView|HTMLCanvasElement|HTMLImageElement|HTMLVideoElement|string|string[]|module:twgl.TextureFunc)} [src] source for texture
       *
       *    If `string` then it's assumed to be a URL to an image. The image will be downloaded async. A usable
       *    1x1 pixel texture will be returned immediatley. The texture will be updated once the image has downloaded.
       *    If `target` is `gl.TEXTURE_CUBE_MAP` will attempt to divide image into 6 square pieces. 1x6, 6x1, 3x2, 2x3.
       *    The pieces will be uploaded in `cubeFaceOrder`
       *
       *    If `string[]` then it must have 6 entries, one for each face of a cube map. Target must be `gl.TEXTURE_CUBE_MAP`.
       *
       *    If `HTMLElement` then it wil be used immediately to create the contents of the texture. Examples `HTMLImageElement`,
       *    `HTMLCanvasElement`, `HTMLVideoElement`.
       *
       *    If `number[]` or `ArrayBufferView` it's assumed to be data for a texture. If `width` or `height` is
       *    not specified it is guessed as follows. First the number of elements is computed by `src.length / numComponents`
       *    where `numComponents` is derived from `format`. If `target` is `gl.TEXTURE_CUBE_MAP` then `numElements` is divided
       *    by 6. Then
       *
       *    *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer then width and height
       *        are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
       *
       *    *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
       *
       * If `number[]` will be converted to `type`.
       *
       * If `src` is a function it will be called with a `WebGLRenderingContext` and these options.
       * Whatever it returns is subject to these rules. So it can return a string url, an `HTMLElement`
       * an array etc...
       *
       * If `src` is undefined then an empty texture will be created of size `width` by `height`.
       *
       * @property {string} [crossOrigin] What to set the crossOrigin property of images when they are downloaded.
       *    default: undefined. Also see {@link module:twgl.setDefaults}.
       *
       * @memberOf module:twgl
       */

      // NOTE: While querying GL is considered slow it's not remotely as slow
      // as uploading a texture. On top of that you're unlikely to call this in
      // a perf critical loop. Even if upload a texture every frame that's unlikely
      // to be more than 1 or 2 textures a frame. In other words, the benefits of
      // making the API easy to use outweigh any supposed perf benefits
      var lastPackState = {};

      /**
       * Saves any packing state that will be set based on the options.
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       */
      function savePackState(gl, options) {
        if (options.colorspaceConversion !== undefined) {
          lastPackState.colorspaceConversion = gl.getParameter(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL);
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, options.colorspaceConversion);
        }
        if (options.premultiplyAlpha !== undefined) {
          lastPackState.premultiplyAlpha = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.premultiplyAlpha);
        }
        if (options.flipY !== undefined) {
          lastPackState.flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.flipY);
        }
      }

      /**
       * Restores any packing state that was set based on the options.
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       */
      function restorePackState(gl, options) {
        if (options.colorspaceConversion !== undefined) {
          gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, lastPackState.colorspaceConversion);
        }
        if (options.premultiplyAlpha !== undefined) {
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, lastPackState.premultiplyAlpha);
        }
        if (options.flipY !== undefined) {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, lastPackState.flipY);
        }
      }

      var WebGLSamplerCtor = window.WebGLSampler || function NotWebGLSampler() {};

      /**
       * Sets the parameters of a texture or sampler
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {number|WebGLSampler} target texture target or sampler
       * @param {function()} parameteriFn texParamteri or samplerParameteri fn
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       *   This is often the same options you passed in when you created the texture.
       */
      function setTextureSamplerParameters(gl, target, parameteriFn, options) {
        if (options.minMag) {
          parameteriFn.call(gl, target, gl.TEXTURE_MIN_FILTER, options.minMag);
          parameteriFn.call(gl, target, gl.TEXTURE_MAG_FILTER, options.minMag);
        }
        if (options.min) {
          parameteriFn.call(gl, target, gl.TEXTURE_MIN_FILTER, options.min);
        }
        if (options.mag) {
          parameteriFn.call(gl, target, gl.TEXTURE_MAG_FILTER, options.mag);
        }
        if (options.wrap) {
          parameteriFn.call(gl, target, gl.TEXTURE_WRAP_S, options.wrap);
          parameteriFn.call(gl, target, gl.TEXTURE_WRAP_T, options.wrap);
          if (target === gl.TEXTURE_3D || target instanceof WebGLSamplerCtor) {
            parameteriFn.call(gl, target, gl.TEXTURE_WRAP_R, options.wrap);
          }
        }
        if (options.wrapR) {
          parameteriFn.call(gl, target, gl.TEXTURE_WRAP_R, options.wrapR);
        }
        if (options.wrapS) {
          parameteriFn.call(gl, target, gl.TEXTURE_WRAP_S, options.wrapS);
        }
        if (options.wrapT) {
          parameteriFn.call(gl, target, gl.TEXTURE_WRAP_T, options.wrapT);
        }
        if (options.minLod) {
          parameteriFn.call(gl, target, gl.TEXTURE_MIN_LOD, options.minLod);
        }
        if (options.maxLod) {
          parameteriFn.call(gl, target, gl.TEXTURE_MAX_LOD, options.maxLod);
        }
        if (options.baseLevel) {
          parameteriFn.call(gl, target, gl.TEXTURE_BASE_LEVEL, options.baseLevel);
        }
        if (options.maxLevel) {
          parameteriFn.call(gl, target, gl.TEXTURE_MAX_LEVEL, options.maxLevel);
        }
      }

      /**
       * Sets the texture parameters of a texture.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       *   This is often the same options you passed in when you created the texture.
       * @memberOf module:twgl/textures
       */
      function setTextureParameters(gl, tex, options) {
        var target = options.target || gl.TEXTURE_2D;
        gl.bindTexture(target, tex);
        setTextureSamplerParameters(gl, target, gl.texParameteri, options);
      }

      /**
       * Sets the sampler parameters of a sampler.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLSampler} sampler the WebGLSampler to set parameters for
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       * @memberOf module:twgl/textures
       */
      function setSamplerParameters(gl, sampler, options) {
        setTextureSamplerParameters(gl, sampler, gl.samplerParameteri, options);
      }

      /**
       * Creates a new sampler object and sets parameters.
       *
       * Example:
       *
       *      const sampler = twgl.createSampler(gl, {
       *        minMag: gl.NEAREST,         // sets both TEXTURE_MIN_FILTER and TEXTURE_MAG_FILTER
       *        wrap: gl.CLAMP_TO_NEAREST,  // sets both TEXTURE_WRAP_S and TEXTURE_WRAP_T and TEXTURE_WRAP_R
       *      });
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per sampler.
       * @return {Object.<string,WebGLSampler>} the created samplers by name
       */
      function createSampler(gl, options) {
        var sampler = gl.createSampler();
        setSamplerParameters(gl, sampler, options);
        return sampler;
      }

      /**
       * Creates a multiple sampler objects and sets parameters on each.
       *
       * Example:
       *
       *      const samplers = twgl.createSamplers(gl, {
       *        nearest: {
       *          minMag: gl.NEAREST,
       *        },
       *        nearestClampS: {
       *          minMag: gl.NEAREST,
       *          wrapS: gl.CLAMP_TO_NEAREST,
       *        },
       *        linear: {
       *          minMag: gl.LINEAR,
       *        },
       *        nearestClamp: {
       *          minMag: gl.NEAREST,
       *          wrap: gl.CLAMP_TO_EDGE,
       *        },
       *        linearClamp: {
       *          minMag: gl.LINEAR,
       *          wrap: gl.CLAMP_TO_EDGE,
       *        },
       *        linearClampT: {
       *          minMag: gl.LINEAR,
       *          wrapT: gl.CLAMP_TO_EDGE,
       *        },
       *      });
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set on the sampler
       */
      function createSamplers(gl, samplerOptions) {
        var samplers = {};
        Object.keys(samplerOptions).forEach(function (name) {
          samplers[name] = createSampler(gl, samplerOptions[name]);
        });
        return samplers;
      }

      /**
       * Makes a 1x1 pixel
       * If no color is passed in uses the default color which can be set by calling `setDefaultTextureColor`.
       * @param {(number[]|ArrayBufferView)} [color] The color using 0-1 values
       * @return {Uint8Array} Unit8Array with color.
       */
      function make1Pixel(color) {
        color = color || defaults.textureColor;
        if (isArrayBuffer(color)) {
          return color;
        }
        return new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
      }

      /**
       * Sets filtering or generates mips for texture based on width or height
       * If width or height is not passed in uses `options.width` and//or `options.height`
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
       *   This is often the same options you passed in when you created the texture.
       * @param {number} [width] width of texture
       * @param {number} [height] height of texture
       * @param {number} [internalFormat] The internalFormat parameter from texImage2D etc..
       * @param {number} [type] The type parameter for texImage2D etc..
       * @memberOf module:twgl/textures
       */
      function setTextureFilteringForSize(gl, tex, options, width, height, internalFormat, type) {
        options = options || defaults.textureOptions;
        internalFormat = internalFormat || gl.RGBA;
        type = type || gl.UNSIGNED_BYTE;
        var target = options.target || gl.TEXTURE_2D;
        width = width || options.width;
        height = height || options.height;
        gl.bindTexture(target, tex);
        if (canGenerateMipmap(gl, width, height, internalFormat, type)) {
          gl.generateMipmap(target);
        } else {
          var filtering = canFilter(internalFormat, type) ? gl.LINEAR : gl.NEAREST;
          gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, filtering);
          gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, filtering);
          gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
      }

      function shouldAutomaticallySetTextureFilteringForSize(options) {
        return options.auto === true || options.auto === undefined && options.level === undefined;
      }

      /**
       * Gets an array of cubemap face enums
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       *   This is often the same options you passed in when you created the texture.
       * @return {number[]} cubemap face enums
       */
      function getCubeFaceOrder(gl, options) {
        options = options || {};
        return options.cubeFaceOrder || [gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
      }

      /**
       * @typedef {Object} FaceInfo
       * @property {number} face gl enum for texImage2D
       * @property {number} ndx face index (0 - 5) into source data
       * @ignore
       */

      /**
       * Gets an array of FaceInfos
       * There's a bug in some NVidia drivers that will crash the driver if
       * `gl.TEXTURE_CUBE_MAP_POSITIVE_X` is not uploaded first. So, we take
       * the user's desired order from his faces to WebGL and make sure we
       * do the faces in WebGL order
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       * @return {FaceInfo[]} cubemap face infos. Arguably the `face` property of each element is redundent but
       *    it's needed internally to sort the array of `ndx` properties by `face`.
       */
      function getCubeFacesWithNdx(gl, options) {
        var faces = getCubeFaceOrder(gl, options);
        // work around bug in NVidia drivers. We have to upload the first face first else the driver crashes :(
        var facesWithNdx = faces.map(function (face, ndx) {
          return { face: face, ndx: ndx };
        });
        facesWithNdx.sort(function (a, b) {
          return a.face - b.face;
        });
        return facesWithNdx;
      }

      /**
       * Set a texture from the contents of an element. Will also set
       * texture filtering or generate mips based on the dimensions of the element
       * unless `options.auto === false`. If `target === gl.TEXTURE_CUBE_MAP` will
       * attempt to slice image into 1x6, 2x3, 3x2, or 6x1 images, one for each face.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {HTMLElement} element a canvas, img, or video element.
       * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
       *   This is often the same options you passed in when you created the texture.
       * @memberOf module:twgl/textures
       * @kind function
       */
      function setTextureFromElement(gl, tex, element, options) {
        options = options || defaults.textureOptions;
        var target = options.target || gl.TEXTURE_2D;
        var level = options.level || 0;
        var width = element.width;
        var height = element.height;
        var internalFormat = options.internalFormat || options.format || gl.RGBA;
        var formatType = getFormatAndTypeForInternalFormat(internalFormat);
        var format = options.format || formatType.format;
        var type = options.type || formatType.type;
        savePackState(gl, options);
        gl.bindTexture(target, tex);
        if (target === gl.TEXTURE_CUBE_MAP) {
          // guess the parts
          var imgWidth = element.width;
          var imgHeight = element.height;
          var size = void 0;
          var slices = void 0;
          if (imgWidth / 6 === imgHeight) {
            // It's 6x1
            size = imgHeight;
            slices = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0];
          } else if (imgHeight / 6 === imgWidth) {
            // It's 1x6
            size = imgWidth;
            slices = [0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5];
          } else if (imgWidth / 3 === imgHeight / 2) {
            // It's 3x2
            size = imgWidth / 3;
            slices = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1];
          } else if (imgWidth / 2 === imgHeight / 3) {
            // It's 2x3
            size = imgWidth / 2;
            slices = [0, 0, 1, 0, 0, 1, 1, 1, 0, 2, 1, 2];
          } else {
            throw "can't figure out cube map from element: " + (element.src ? element.src : element.nodeName);
          }
          ctx.canvas.width = size;
          ctx.canvas.height = size;
          width = size;
          height = size;
          getCubeFacesWithNdx(gl, options).forEach(function (f) {
            var xOffset = slices[f.ndx * 2 + 0] * size;
            var yOffset = slices[f.ndx * 2 + 1] * size;
            ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
            gl.texImage2D(f.face, level, internalFormat, format, type, ctx.canvas);
          });
          // Free up the canvas memory
          ctx.canvas.width = 1;
          ctx.canvas.height = 1;
        } else if (target === gl.TEXTURE_3D) {
          var smallest = Math.min(element.width, element.height);
          var largest = Math.max(element.width, element.height);
          var depth = largest / smallest;
          if (depth % 1 !== 0) {
            throw "can not compute 3D dimensions of element";
          }
          var xMult = element.width === largest ? 1 : 0;
          var yMult = element.height === largest ? 1 : 0;
          gl.texImage3D(target, level, internalFormat, smallest, smallest, smallest, 0, format, type, null);
          // remove this is texSubImage3D gets width and height arguments
          ctx.canvas.width = smallest;
          ctx.canvas.height = smallest;
          for (var d = 0; d < depth; ++d) {
            //gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, d * smallest);
            //gl.texSubImage3D(target, 0, 0, 0, d, format, type, element);
            var srcX = d * smallest * xMult;
            var srcY = d * smallest * yMult;
            var srcW = smallest;
            var srcH = smallest;
            var dstX = 0;
            var dstY = 0;
            var dstW = smallest;
            var dstH = smallest;
            ctx.drawImage(element, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
            gl.texSubImage3D(target, level, 0, 0, d, smallest, smallest, 1, format, type, ctx.canvas);
          }
          ctx.canvas.width = 0;
          ctx.canvas.height = 0;
          //FIX (save state)
          gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
        } else {
          gl.texImage2D(target, level, internalFormat, format, type, element);
        }
        restorePackState(gl, options);
        if (shouldAutomaticallySetTextureFilteringForSize(options)) {
          setTextureFilteringForSize(gl, tex, options, width, height, internalFormat, type);
        }
        setTextureParameters(gl, tex, options);
      }

      function noop() {}

      /**
       * Loads an image
       * @param {string} url url to image
       * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
       *     if there was an error
       * @return {HTMLImageElement} the image being loaded.
       */
      function loadImage(url, crossOrigin, callback) {
        callback = callback || noop;
        var img = new Image();
        crossOrigin = crossOrigin !== undefined ? crossOrigin : defaults.crossOrigin;
        if (crossOrigin !== undefined) {
          img.crossOrigin = crossOrigin;
        }

        function clearEventHandlers() {
          img.removeEventListener('error', onError); // eslint-disable-line
          img.removeEventListener('load', onLoad); // eslint-disable-line
          img = null;
        }

        function onError() {
          var msg = "couldn't load image: " + url;
          utils.error(msg);
          callback(msg, img);
          clearEventHandlers();
        }

        function onLoad() {
          callback(null, img);
          clearEventHandlers();
        }

        img.addEventListener('error', onError);
        img.addEventListener('load', onLoad);
        img.src = url;
        return img;
      }

      /**
       * Sets a texture to a 1x1 pixel color. If `options.color === false` is nothing happens. If it's not set
       * the default texture color is used which can be set by calling `setDefaultTextureColor`.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
       *   This is often the same options you passed in when you created the texture.
       * @memberOf module:twgl/textures
       */
      function setTextureTo1PixelColor(gl, tex, options) {
        options = options || defaults.textureOptions;
        var target = options.target || gl.TEXTURE_2D;
        gl.bindTexture(target, tex);
        if (options.color === false) {
          return;
        }
        // Assume it's a URL
        // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.
        var color = make1Pixel(options.color);
        if (target === gl.TEXTURE_CUBE_MAP) {
          for (var ii = 0; ii < 6; ++ii) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
          }
        } else if (target === gl.TEXTURE_3D || target === gl.TEXTURE_2D_ARRAY) {
          gl.texImage3D(target, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
        } else {
          gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
        }
      }

      /**
       * The src image(s) used to create a texture.
       *
       * When you call {@link module:twgl.createTexture} or {@link module:twgl.createTextures}
       * you can pass in urls for images to load into the textures. If it's a single url
       * then this will be a single HTMLImageElement. If it's an array of urls used for a cubemap
       * this will be a corresponding array of images for the cubemap.
       *
       * @typedef {HTMLImageElement|HTMLImageElement[]} TextureSrc
       * @memberOf module:twgl
       */

      /**
       * A callback for when an image finished downloading and been uploaded into a texture
       * @callback TextureReadyCallback
       * @param {*} err If truthy there was an error.
       * @param {WebGLTexture} texture the texture.
       * @param {module:twgl.TextureSrc} souce image(s) used to as the src for the texture
       * @memberOf module:twgl
       */

      /**
       * A callback for when all images have finished downloading and been uploaded into their respective textures
       * @callback TexturesReadyCallback
       * @param {*} err If truthy there was an error.
       * @param {Object.<string, WebGLTexture>} textures the created textures by name. Same as returned by {@link module:twgl.createTextures}.
       * @param {Object.<string, module:twgl.TextureSrc>} sources the image(s) used for the texture by name.
       * @memberOf module:twgl
       */

      /**
       * A callback for when an image finished downloading and been uploaded into a texture
       * @callback CubemapReadyCallback
       * @param {*} err If truthy there was an error.
       * @param {WebGLTexture} tex the texture.
       * @param {HTMLImageElement[]} imgs the images for each face.
       * @memberOf module:twgl
       */

      /**
       * A callback for when an image finished downloading and been uploaded into a texture
       * @callback ThreeDReadyCallback
       * @param {*} err If truthy there was an error.
       * @param {WebGLTexture} tex the texture.
       * @param {HTMLImageElement[]} imgs the images for each slice.
       * @memberOf module:twgl
       */

      /**
       * Loads a texture from an image from a Url as specified in `options.src`
       * If `options.color !== false` will set the texture to a 1x1 pixel color so that the texture is
       * immediately useable. It will be updated with the contents of the image once the image has finished
       * downloading. Filtering options will be set as approriate for image unless `options.auto === false`.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
       * @param {module:twgl.TextureReadyCallback} [callback] A function to be called when the image has finished loading. err will
       *    be non null if there was an error.
       * @return {HTMLImageElement} the image being downloaded.
       * @memberOf module:twgl/textures
       */
      function loadTextureFromUrl(gl, tex, options, callback) {
        callback = callback || noop;
        options = options || defaults.textureOptions;
        setTextureTo1PixelColor(gl, tex, options);
        // Because it's async we need to copy the options.
        options = utils.shallowCopy(options);
        var img = loadImage(options.src, options.crossOrigin, function (err, img) {
          if (err) {
            callback(err, tex, img);
          } else {
            setTextureFromElement(gl, tex, img, options);
            callback(null, tex, img);
          }
        });
        return img;
      }

      /**
       * Loads a cubemap from 6 urls as specified in `options.src`. Will set the cubemap to a 1x1 pixel color
       * so that it is usable immediately unless `option.color === false`.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       * @param {module:twgl.CubemapReadyCallback} [callback] A function to be called when all the images have finished loading. err will
       *    be non null if there was an error.
       * @memberOf module:twgl/textures
       */
      function loadCubemapFromUrls(gl, tex, options, callback) {
        callback = callback || noop;
        var urls = options.src;
        if (urls.length !== 6) {
          throw "there must be 6 urls for a cubemap";
        }
        var level = options.level || 0;
        var internalFormat = options.internalFormat || options.format || gl.RGBA;
        var formatType = getFormatAndTypeForInternalFormat(internalFormat);
        var format = options.format || formatType.format;
        var type = options.type || gl.UNSIGNED_BYTE;
        var target = options.target || gl.TEXTURE_2D;
        if (target !== gl.TEXTURE_CUBE_MAP) {
          throw "target must be TEXTURE_CUBE_MAP";
        }
        setTextureTo1PixelColor(gl, tex, options);
        // Because it's async we need to copy the options.
        options = utils.shallowCopy(options);
        var numToLoad = 6;
        var errors = [];
        var faces = getCubeFaceOrder(gl, options);
        var imgs = void 0; // eslint-disable-line

        function uploadImg(faceTarget) {
          return function (err, img) {
            --numToLoad;
            if (err) {
              errors.push(err);
            } else {
              if (img.width !== img.height) {
                errors.push("cubemap face img is not a square: " + img.src);
              } else {
                savePackState(gl, options);
                gl.bindTexture(target, tex);

                // So assuming this is the first image we now have one face that's img sized
                // and 5 faces that are 1x1 pixel so size the other faces
                if (numToLoad === 5) {
                  // use the default order
                  getCubeFaceOrder(gl).forEach(function (otherTarget) {
                    // Should we re-use the same face or a color?
                    gl.texImage2D(otherTarget, level, internalFormat, format, type, img);
                  });
                } else {
                  gl.texImage2D(faceTarget, level, internalFormat, format, type, img);
                }

                restorePackState(gl, options);
                if (shouldAutomaticallySetTextureFilteringForSize(options)) {
                  gl.generateMipmap(target);
                }
              }
            }

            if (numToLoad === 0) {
              callback(errors.length ? errors : undefined, imgs, tex);
            }
          };
        }

        imgs = urls.map(function (url, ndx) {
          return loadImage(url, options.crossOrigin, uploadImg(faces[ndx]));
        });
      }

      /**
       * Loads a 2d array or 3d texture from urls as specified in `options.src`.
       * Will set the texture to a 1x1 pixel color
       * so that it is usable immediately unless `option.color === false`.
       *
       * If the width and height is not specified the width and height of the first
       * image loaded will be used. Note that since images are loaded async
       * which image downloads first is unknown.
       *
       * If an image is not the same size as the width and height it will be scaled
       * to that width and height.
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       * @param {module:twgl.ThreeDReadyCallback} [callback] A function to be called when all the images have finished loading. err will
       *    be non null if there was an error.
       * @memberOf module:twgl/textures
       */
      function loadSlicesFromUrls(gl, tex, options, callback) {
        callback = callback || noop;
        var urls = options.src;
        var internalFormat = options.internalFormat || options.format || gl.RGBA;
        var formatType = getFormatAndTypeForInternalFormat(internalFormat);
        var format = options.format || formatType.format;
        var type = options.type || gl.UNSIGNED_BYTE;
        var target = options.target || gl.TEXTURE_2D_ARRAY;
        if (target !== gl.TEXTURE_3D && target !== gl.TEXTURE_2D_ARRAY) {
          throw "target must be TEXTURE_3D or TEXTURE_2D_ARRAY";
        }
        setTextureTo1PixelColor(gl, tex, options);
        // Because it's async we need to copy the options.
        options = utils.shallowCopy(options);
        var numToLoad = urls.length;
        var errors = [];
        var imgs = void 0; // eslint-disable-line
        var level = options.level || 0;
        var width = options.width;
        var height = options.height;
        var depth = urls.length;
        var firstImage = true;

        function uploadImg(slice) {
          return function (err, img) {
            --numToLoad;
            if (err) {
              errors.push(err);
            } else {
              savePackState(gl, options);
              gl.bindTexture(target, tex);

              if (firstImage) {
                firstImage = false;
                width = options.width || img.width;
                height = options.height || img.height;
                gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, null);

                // put it in every slice otherwise some slices will be 0,0,0,0
                for (var s = 0; s < depth; ++s) {
                  gl.texSubImage3D(target, level, 0, 0, s, width, height, 1, format, type, img);
                }
              } else {
                var src = img;
                if (img.width !== width || img.height !== height) {
                  // Size the image to fix
                  src = ctx.canvas;
                  ctx.canvas.width = width;
                  ctx.canvas.height = height;
                  ctx.drawImage(img, 0, 0, width, height);
                }

                gl.texSubImage3D(target, level, 0, 0, slice, width, height, 1, format, type, src);

                // free the canvas memory
                if (src === ctx.canvas) {
                  ctx.canvas.width = 0;
                  ctx.canvas.height = 0;
                }
              }

              restorePackState(gl, options);
              if (shouldAutomaticallySetTextureFilteringForSize(options)) {
                gl.generateMipmap(target);
              }
            }

            if (numToLoad === 0) {
              callback(errors.length ? errors : undefined, imgs, tex);
            }
          };
        }

        imgs = urls.map(function (url, ndx) {
          return loadImage(url, options.crossOrigin, uploadImg(ndx));
        });
      }

      /**
       * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
       * guess the size. See {@link module:twgl.TextureOptions}.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {(number[]|ArrayBufferView)} src An array or typed arry with texture data.
       * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
       *   This is often the same options you passed in when you created the texture.
       * @memberOf module:twgl/textures
       */
      function setTextureFromArray(gl, tex, src, options) {
        options = options || defaults.textureOptions;
        var target = options.target || gl.TEXTURE_2D;
        gl.bindTexture(target, tex);
        var width = options.width;
        var height = options.height;
        var depth = options.depth;
        var level = options.level || 0;
        var internalFormat = options.internalFormat || options.format || gl.RGBA;
        var formatType = getFormatAndTypeForInternalFormat(internalFormat);
        var format = options.format || formatType.format;
        var type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
        if (!isArrayBuffer(src)) {
          var Type = typedArrays.getTypedArrayTypeForGLType(type);
          src = new Type(src);
        } else {
          if (src instanceof Uint8ClampedArray) {
            src = new Uint8Array(src.buffer);
          }
        }
        var bytesPerElement = getBytesPerElementForInternalFormat(internalFormat, type);
        var numElements = src.byteLength / bytesPerElement; // TODO: check UNPACK_ALIGNMENT?
        if (numElements % 1) {
          throw "length wrong size for format: " + glEnumToString(gl, format);
        }
        var dimensions = void 0;
        if (target === gl.TEXTURE_3D) {
          if (!width && !height && !depth) {
            var size = Math.cbrt(numElements);
            if (size % 1 !== 0) {
              throw "can't guess cube size of array of numElements: " + numElements;
            }
            width = size;
            height = size;
            depth = size;
          } else if (width && (!height || !depth)) {
            dimensions = guessDimensions(gl, target, height, depth, numElements / width);
            height = dimensions.width;
            depth = dimensions.height;
          } else if (height && (!width || !depth)) {
            dimensions = guessDimensions(gl, target, width, depth, numElements / height);
            width = dimensions.width;
            depth = dimensions.height;
          } else {
            dimensions = guessDimensions(gl, target, width, height, numElements / depth);
            width = dimensions.width;
            height = dimensions.height;
          }
        } else {
          dimensions = guessDimensions(gl, target, width, height, numElements);
          width = dimensions.width;
          height = dimensions.height;
        }
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, options.unpackAlignment || 1);
        savePackState(gl, options);
        if (target === gl.TEXTURE_CUBE_MAP) {
          var elementsPerElement = bytesPerElement / src.BYTES_PER_ELEMENT;
          var faceSize = numElements / 6 * elementsPerElement;

          getCubeFacesWithNdx(gl, options).forEach(function (f) {
            var offset = faceSize * f.ndx;
            var data = src.subarray(offset, offset + faceSize);
            gl.texImage2D(f.face, level, internalFormat, width, height, 0, format, type, data);
          });
        } else if (target === gl.TEXTURE_3D) {
          gl.texImage3D(target, level, internalFormat, width, height, depth, 0, format, type, src);
        } else {
          gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, src);
        }
        restorePackState(gl, options);
        return {
          width: width,
          height: height,
          depth: depth,
          type: type
        };
      }

      /**
       * Sets a texture with no contents of a certain size. In other words calls `gl.texImage2D` with `null`.
       * You must set `options.width` and `options.height`.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the WebGLTexture to set parameters for
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       * @memberOf module:twgl/textures
       */
      function setEmptyTexture(gl, tex, options) {
        var target = options.target || gl.TEXTURE_2D;
        gl.bindTexture(target, tex);
        var level = options.level || 0;
        var internalFormat = options.internalFormat || options.format || gl.RGBA;
        var formatType = getFormatAndTypeForInternalFormat(internalFormat);
        var format = options.format || formatType.format;
        var type = options.type || formatType.type;
        savePackState(gl, options);
        if (target === gl.TEXTURE_CUBE_MAP) {
          for (var ii = 0; ii < 6; ++ii) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, internalFormat, options.width, options.height, 0, format, type, null);
          }
        } else if (target === gl.TEXTURE_3D) {
          gl.texImage3D(target, level, internalFormat, options.width, options.height, options.depth, 0, format, type, null);
        } else {
          gl.texImage2D(target, level, internalFormat, options.width, options.height, 0, format, type, null);
        }
        restorePackState(gl, options);
      }

      /**
       * Creates a texture based on the options passed in.
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
       * @param {module:twgl.TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
       * @return {WebGLTexture} the created texture.
       * @memberOf module:twgl/textures
       */
      function createTexture(gl, options, callback) {
        callback = callback || noop;
        options = options || defaults.textureOptions;
        var tex = gl.createTexture();
        var target = options.target || gl.TEXTURE_2D;
        var width = options.width || 1;
        var height = options.height || 1;
        var internalFormat = options.internalFormat || gl.RGBA;
        var formatType = getFormatAndTypeForInternalFormat(internalFormat);
        var type = options.type || formatType.type;
        gl.bindTexture(target, tex);
        if (target === gl.TEXTURE_CUBE_MAP) {
          // this should have been the default for CUBEMAPS :(
          gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        var src = options.src;
        if (src) {
          if (typeof src === "function") {
            src = src(gl, options);
          }
          if (typeof src === "string") {
            loadTextureFromUrl(gl, tex, options, callback);
          } else if (isArrayBuffer(src) || Array.isArray(src) && (typeof src[0] === 'number' || Array.isArray(src[0]) || isArrayBuffer(src[0]))) {
            var dimensions = setTextureFromArray(gl, tex, src, options);
            width = dimensions.width;
            height = dimensions.height;
            type = dimensions.type;
          } else if (Array.isArray(src) && typeof src[0] === 'string') {
            if (target === gl.TEXTURE_CUBE_MAP) {
              loadCubemapFromUrls(gl, tex, options, callback);
            } else {
              loadSlicesFromUrls(gl, tex, options, callback);
            }
          } else if (src instanceof HTMLElement) {
            setTextureFromElement(gl, tex, src, options);
            width = src.width;
            height = src.height;
          } else {
            throw "unsupported src type";
          }
        } else {
          setEmptyTexture(gl, tex, options);
        }
        if (shouldAutomaticallySetTextureFilteringForSize(options)) {
          setTextureFilteringForSize(gl, tex, options, width, height, internalFormat, type);
        }
        setTextureParameters(gl, tex, options);
        return tex;
      }

      /**
       * Resizes a texture based on the options passed in.
       *
       * Note: This is not a generic resize anything function.
       * It's mostly used by {@link module:twgl.resizeFramebufferInfo}
       * It will use `options.src` if it exists to try to determine a `type`
       * otherwise it will assume `gl.UNSIGNED_BYTE`. No data is provided
       * for the texture. Texture parameters will be set accordingly
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {WebGLTexture} tex the texture to resize
       * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
       * @param {number} [width] the new width. If not passed in will use `options.width`
       * @param {number} [height] the new height. If not passed in will use `options.height`
       * @memberOf module:twgl/textures
       */
      function resizeTexture(gl, tex, options, width, height) {
        width = width || options.width;
        height = height || options.height;
        var target = options.target || gl.TEXTURE_2D;
        gl.bindTexture(target, tex);
        var level = options.level || 0;
        var internalFormat = options.internalFormat || options.format || gl.RGBA;
        var formatType = getFormatAndTypeForInternalFormat(internalFormat);
        var format = options.format || formatType.format;
        var type = void 0;
        var src = options.src;
        if (!src) {
          type = options.type || formatType.type;
        } else if (isArrayBuffer(src) || Array.isArray(src) && typeof src[0] === 'number') {
          type = options.type || getTextureTypeForArrayType(gl, src, formatType.type);
        } else {
          type = options.type || formatType.type;
        }
        if (target === gl.TEXTURE_CUBE_MAP) {
          for (var ii = 0; ii < 6; ++ii) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, level, format, width, height, 0, format, type, null);
          }
        } else {
          gl.texImage2D(target, level, format, width, height, 0, format, type, null);
        }
      }

      /**
       * Check if a src is an async request.
       * if src is a string we're going to download an image
       * if src is an array of strings we're going to download cubemap images
       * @param {*} src The src from a TextureOptions
       * @returns {bool} true if src is async.
       */
      function isAsyncSrc(src) {
        return typeof src === 'string' || Array.isArray(src) && typeof src[0] === 'string';
      }

      /**
       * Creates a bunch of textures based on the passed in options.
       *
       * Example:
       *
       *     const textures = twgl.createTextures(gl, {
       *       // a power of 2 image
       *       hftIcon: { src: "images/hft-icon-16.png", mag: gl.NEAREST },
       *       // a non-power of 2 image
       *       clover: { src: "images/clover.jpg" },
       *       // From a canvas
       *       fromCanvas: { src: ctx.canvas },
       *       // A cubemap from 6 images
       *       yokohama: {
       *         target: gl.TEXTURE_CUBE_MAP,
       *         src: [
       *           'images/yokohama/posx.jpg',
       *           'images/yokohama/negx.jpg',
       *           'images/yokohama/posy.jpg',
       *           'images/yokohama/negy.jpg',
       *           'images/yokohama/posz.jpg',
       *           'images/yokohama/negz.jpg',
       *         ],
       *       },
       *       // A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
       *       goldengate: {
       *         target: gl.TEXTURE_CUBE_MAP,
       *         src: 'images/goldengate.jpg',
       *       },
       *       // A 2x2 pixel texture from a JavaScript array
       *       checker: {
       *         mag: gl.NEAREST,
       *         min: gl.LINEAR,
       *         src: [
       *           255,255,255,255,
       *           192,192,192,255,
       *           192,192,192,255,
       *           255,255,255,255,
       *         ],
       *       },
       *       // a 1x2 pixel texture from a typed array.
       *       stripe: {
       *         mag: gl.NEAREST,
       *         min: gl.LINEAR,
       *         format: gl.LUMINANCE,
       *         src: new Uint8Array([
       *           255,
       *           128,
       *           255,
       *           128,
       *           255,
       *           128,
       *           255,
       *           128,
       *         ]),
       *         width: 1,
       *       },
       *     });
       *
       * Now
       *
       * *   `textures.hftIcon` will be a 2d texture
       * *   `textures.clover` will be a 2d texture
       * *   `textures.fromCanvas` will be a 2d texture
       * *   `textures.yohohama` will be a cubemap texture
       * *   `textures.goldengate` will be a cubemap texture
       * *   `textures.checker` will be a 2d texture
       * *   `textures.stripe` will be a 2d texture
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
       * @param {module:twgl.TexturesReadyCallback} [callback] A callback called when all textures have been downloaded.
       * @return {Object.<string,WebGLTexture>} the created textures by name
       * @memberOf module:twgl/textures
       */
      function createTextures(gl, textureOptions, callback) {
        callback = callback || noop;
        var numDownloading = 0;
        var errors = [];
        var textures = {};
        var images = {};

        function callCallbackIfReady() {
          if (numDownloading === 0) {
            setTimeout(function () {
              callback(errors.length ? errors : undefined, textures, images);
            }, 0);
          }
        }

        Object.keys(textureOptions).forEach(function (name) {
          var options = textureOptions[name];
          var onLoadFn = void 0;
          if (isAsyncSrc(options.src)) {
            onLoadFn = function onLoadFn(err, tex, img) {
              images[name] = img;
              --numDownloading;
              if (err) {
                errors.push(err);
              }
              callCallbackIfReady();
            };
            ++numDownloading;
          }
          textures[name] = createTexture(gl, options, onLoadFn);
        });

        // queue the callback if there are no images to download.
        // We do this because if your code is structured to wait for
        // images to download but then you comment out all the async
        // images your code would break.
        callCallbackIfReady();

        return textures;
      }

      // Using quotes prevents Uglify from changing the names.
      // No speed diff AFAICT.
      exports.setTextureDefaults_ = setDefaults;
      exports.createSampler = createSampler;
      exports.createSamplers = createSamplers;
      exports.setSamplerParameters = setSamplerParameters;
      exports.createTexture = createTexture;
      exports.setEmptyTexture = setEmptyTexture;
      exports.setTextureFromArray = setTextureFromArray;
      exports.loadTextureFromUrl = loadTextureFromUrl;
      exports.setTextureFromElement = setTextureFromElement;
      exports.setTextureFilteringForSize = setTextureFilteringForSize;
      exports.setTextureParameters = setTextureParameters;
      exports.setDefaultTextureColor = setDefaultTextureColor;
      exports.createTextures = createTextures;
      exports.resizeTexture = resizeTexture;
      exports.getNumComponentsForFormat = getNumComponentsForFormat;
      exports.getBytesPerElementForInternalFormat = getBytesPerElementForInternalFormat;

      /***/
    },
    /* 6 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.transpose = exports.translation = exports.translate = exports.transformPoint = exports.transformNormal = exports.transformDirection = exports.setTranslation = exports.setDefaultType = exports.setAxis = exports.scaling = exports.scale = exports.rotationZ = exports.rotationY = exports.rotationX = exports.rotateZ = exports.rotateY = exports.rotateX = exports.perspective = exports.ortho = exports.negate = exports.multiply = exports.lookAt = exports.inverse = exports.identity = exports.getTranslation = exports.getAxis = exports.frustum = exports.copy = exports.axisRotation = exports.axisRotate = undefined;

      var _v = __webpack_require__(3);

      var v3 = _interopRequireWildcard(_v);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * 4x4 Matrix math math functions.
       *
       * Almost all functions take an optional `dst` argument. If it is not passed in the
       * functions will create a new matrix. In other words you can do this
       *
       *     const mat = m4.translation([1, 2, 3]);  // Creates a new translation matrix
       *
       * or
       *
       *     const mat = m4.create();
       *     m4.translation([1, 2, 3], mat);  // Puts translation matrix in mat.
       *
       * The first style is often easier but depending on where it's used it generates garbage where
       * as there is almost never allocation with the second style.
       *
       * It is always save to pass any matrix as the destination. So for example
       *
       *     const mat = m4.identity();
       *     const trans = m4.translation([1, 2, 3]);
       *     m4.multiply(mat, trans, mat);  // Multiplies mat * trans and puts result in mat.
       *
       * @module twgl/m4
       */
      var MatType = Float32Array; /*
                                   * Copyright 2015, Gregg Tavares.
                                   * All rights reserved.
                                   *
                                   * Redistribution and use in source and binary forms, with or without
                                   * modification, are permitted provided that the following conditions are
                                   * met:
                                   *
                                   *     * Redistributions of source code must retain the above copyright
                                   * notice, this list of conditions and the following disclaimer.
                                   *     * Redistributions in binary form must reproduce the above
                                   * copyright notice, this list of conditions and the following disclaimer
                                   * in the documentation and/or other materials provided with the
                                   * distribution.
                                   *     * Neither the name of Gregg Tavares. nor the names of his
                                   * contributors may be used to endorse or promote products derived from
                                   * this software without specific prior written permission.
                                   *
                                   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
                                   * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
                                   * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
                                   * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
                                   * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
                                   * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
                                   * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
                                   * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
                                   * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                   * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
                                   * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                   */

      var tempV3a = v3.create();
      var tempV3b = v3.create();
      var tempV3c = v3.create();

      /**
       * A JavaScript array with 16 values or a Float32Array with 16 values.
       * When created by the library will create the default type which is `Float32Array`
       * but can be set by calling {@link module:twgl/m4.setDefaultType}.
       * @typedef {(number[]|Float32Array)} Mat4
       * @memberOf module:twgl/m4
       */

      /**
       * Sets the type this library creates for a Mat4
       * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
       * @return {constructor} previous constructor for Mat4
       */
      function setDefaultType(ctor) {
        var oldType = MatType;
        MatType = ctor;
        return oldType;
      }

      /**
       * Negates a matrix.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} -m.
       * @memberOf module:twgl/m4
       */
      function negate(m, dst) {
        dst = dst || new MatType(16);

        dst[0] = -m[0];
        dst[1] = -m[1];
        dst[2] = -m[2];
        dst[3] = -m[3];
        dst[4] = -m[4];
        dst[5] = -m[5];
        dst[6] = -m[6];
        dst[7] = -m[7];
        dst[8] = -m[8];
        dst[9] = -m[9];
        dst[10] = -m[10];
        dst[11] = -m[11];
        dst[12] = -m[12];
        dst[13] = -m[13];
        dst[14] = -m[14];
        dst[15] = -m[15];

        return dst;
      }

      /**
       * Copies a matrix.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {module:twgl/m4.Mat4} [dst] The matrix.
       * @return {module:twgl/m4.Mat4} A copy of m.
       * @memberOf module:twgl/m4
       */
      function copy(m, dst) {
        dst = dst || new MatType(16);

        dst[0] = m[0];
        dst[1] = m[1];
        dst[2] = m[2];
        dst[3] = m[3];
        dst[4] = m[4];
        dst[5] = m[5];
        dst[6] = m[6];
        dst[7] = m[7];
        dst[8] = m[8];
        dst[9] = m[9];
        dst[10] = m[10];
        dst[11] = m[11];
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];

        return dst;
      }

      /**
       * Creates an n-by-n identity matrix.
       *
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} An n-by-n identity matrix.
       * @memberOf module:twgl/m4
       */
      function identity(dst) {
        dst = dst || new MatType(16);

        dst[0] = 1;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 1;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
      }

      /**
       * Takes the transpose of a matrix.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The transpose of m.
       * @memberOf module:twgl/m4
       */
      function transpose(m, dst) {
        dst = dst || new MatType(16);
        if (dst === m) {
          var t = void 0;

          t = m[1];
          m[1] = m[4];
          m[4] = t;

          t = m[2];
          m[2] = m[8];
          m[8] = t;

          t = m[3];
          m[3] = m[12];
          m[12] = t;

          t = m[6];
          m[6] = m[9];
          m[9] = t;

          t = m[7];
          m[7] = m[13];
          m[13] = t;

          t = m[11];
          m[11] = m[14];
          m[14] = t;
          return dst;
        }

        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];

        dst[0] = m00;
        dst[1] = m10;
        dst[2] = m20;
        dst[3] = m30;
        dst[4] = m01;
        dst[5] = m11;
        dst[6] = m21;
        dst[7] = m31;
        dst[8] = m02;
        dst[9] = m12;
        dst[10] = m22;
        dst[11] = m32;
        dst[12] = m03;
        dst[13] = m13;
        dst[14] = m23;
        dst[15] = m33;

        return dst;
      }

      /**
       * Computes the inverse of a 4-by-4 matrix.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The inverse of m.
       * @memberOf module:twgl/m4
       */
      function inverse(m, dst) {
        dst = dst || new MatType(16);

        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        dst[0] = d * t0;
        dst[1] = d * t1;
        dst[2] = d * t2;
        dst[3] = d * t3;
        dst[4] = d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
        dst[5] = d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
        dst[6] = d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
        dst[7] = d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
        dst[8] = d * (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
        dst[9] = d * (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
        dst[10] = d * (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
        dst[11] = d * (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
        dst[12] = d * (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
        dst[13] = d * (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
        dst[14] = d * (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
        dst[15] = d * (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

        return dst;
      }

      /**
       * Multiplies two 4-by-4 matrices with a on the left and b on the right
       * @param {module:twgl/m4.Mat4} a The matrix on the left.
       * @param {module:twgl/m4.Mat4} b The matrix on the right.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The matrix product of a and b.
       * @memberOf module:twgl/m4
       */
      function multiply(a, b, dst) {
        dst = dst || new MatType(16);

        var a00 = a[0];
        var a01 = a[1];
        var a02 = a[2];
        var a03 = a[3];
        var a10 = a[4 + 0];
        var a11 = a[4 + 1];
        var a12 = a[4 + 2];
        var a13 = a[4 + 3];
        var a20 = a[8 + 0];
        var a21 = a[8 + 1];
        var a22 = a[8 + 2];
        var a23 = a[8 + 3];
        var a30 = a[12 + 0];
        var a31 = a[12 + 1];
        var a32 = a[12 + 2];
        var a33 = a[12 + 3];
        var b00 = b[0];
        var b01 = b[1];
        var b02 = b[2];
        var b03 = b[3];
        var b10 = b[4 + 0];
        var b11 = b[4 + 1];
        var b12 = b[4 + 2];
        var b13 = b[4 + 3];
        var b20 = b[8 + 0];
        var b21 = b[8 + 1];
        var b22 = b[8 + 2];
        var b23 = b[8 + 3];
        var b30 = b[12 + 0];
        var b31 = b[12 + 1];
        var b32 = b[12 + 2];
        var b33 = b[12 + 3];

        dst[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
        dst[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
        dst[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
        dst[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
        dst[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
        dst[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
        dst[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
        dst[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
        dst[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
        dst[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
        dst[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
        dst[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
        dst[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
        dst[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
        dst[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
        dst[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

        return dst;
      }

      /**
       * Sets the translation component of a 4-by-4 matrix to the given
       * vector.
       * @param {module:twgl/m4.Mat4} a The matrix.
       * @param {Vec3} v The vector.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} a once modified.
       * @memberOf module:twgl/m4
       */
      function setTranslation(a, v, dst) {
        dst = dst || identity();
        if (a !== dst) {
          dst[0] = a[0];
          dst[1] = a[1];
          dst[2] = a[2];
          dst[3] = a[3];
          dst[4] = a[4];
          dst[5] = a[5];
          dst[6] = a[6];
          dst[7] = a[7];
          dst[8] = a[8];
          dst[9] = a[9];
          dst[10] = a[10];
          dst[11] = a[11];
        }
        dst[12] = v[0];
        dst[13] = v[1];
        dst[14] = v[2];
        dst[15] = 1;
        return dst;
      }

      /**
       * Returns the translation component of a 4-by-4 matrix as a vector with 3
       * entries.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {Vec3} [dst] vector..
       * @return {Vec3} The translation component of m.
       * @memberOf module:twgl/m4
       */
      function getTranslation(m, dst) {
        dst = dst || v3.create();
        dst[0] = m[12];
        dst[1] = m[13];
        dst[2] = m[14];
        return dst;
      }

      /**
       * Returns an axis of a 4x4 matrix as a vector with 3 entries
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {number} axis The axis 0 = x, 1 = y, 2 = z;
       * @return {Vec3} [dst] vector.
       * @return {Vec3} The axis component of m.
       * @memberOf module:twgl/m4
       */
      function getAxis(m, axis, dst) {
        dst = dst || v3.create();
        var off = axis * 4;
        dst[0] = m[off + 0];
        dst[1] = m[off + 1];
        dst[2] = m[off + 2];
        return dst;
      }

      /**
       * Sets an axis of a 4x4 matrix as a vector with 3 entries
       * @param {Vec3} v the axis vector
       * @param {number} axis The axis  0 = x, 1 = y, 2 = z;
       * @param {module:twgl/m4.Mat4} [dst] The matrix to set. If none a new one is created
       * @return {module:twgl/m4.Mat4} dst
       * @memberOf module:twgl/m4
       */
      function setAxis(a, v, axis, dst) {
        if (dst !== a) {
          dst = copy(a, dst);
        }
        var off = axis * 4;
        dst[off + 0] = v[0];
        dst[off + 1] = v[1];
        dst[off + 2] = v[2];
        return dst;
      }

      /**
       * Computes a 4-by-4 perspective transformation matrix given the angular height
       * of the frustum, the aspect ratio, and the near and far clipping planes.  The
       * arguments define a frustum extending in the negative z direction.  The given
       * angle is the vertical angle of the frustum, and the horizontal angle is
       * determined to produce the given aspect ratio.  The arguments near and far are
       * the distances to the near and far clipping planes.  Note that near and far
       * are not z coordinates, but rather they are distances along the negative
       * z-axis.  The matrix generated sends the viewing frustum to the unit box.
       * We assume a unit box extending from -1 to 1 in the x and y dimensions and
       * from 0 to 1 in the z dimension.
       * @param {number} fieldOfViewYInRadians The camera angle from top to bottom (in radians).
       * @param {number} aspect The aspect ratio width / height.
       * @param {number} zNear The depth (negative z coordinate)
       *     of the near clipping plane.
       * @param {number} zFar The depth (negative z coordinate)
       *     of the far clipping plane.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The perspective matrix.
       * @memberOf module:twgl/m4
       */
      function perspective(fieldOfViewYInRadians, aspect, zNear, zFar, dst) {
        dst = dst || new MatType(16);

        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewYInRadians);
        var rangeInv = 1.0 / (zNear - zFar);

        dst[0] = f / aspect;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;

        dst[4] = 0;
        dst[5] = f;
        dst[6] = 0;
        dst[7] = 0;

        dst[8] = 0;
        dst[9] = 0;
        dst[10] = (zNear + zFar) * rangeInv;
        dst[11] = -1;

        dst[12] = 0;
        dst[13] = 0;
        dst[14] = zNear * zFar * rangeInv * 2;
        dst[15] = 0;

        return dst;
      }

      /**
       * Computes a 4-by-4 othogonal transformation matrix given the left, right,
       * bottom, and top dimensions of the near clipping plane as well as the
       * near and far clipping plane distances.
       * @param {number} left Left side of the near clipping plane viewport.
       * @param {number} right Right side of the near clipping plane viewport.
       * @param {number} top Top of the near clipping plane viewport.
       * @param {number} bottom Bottom of the near clipping plane viewport.
       * @param {number} near The depth (negative z coordinate)
       *     of the near clipping plane.
       * @param {number} far The depth (negative z coordinate)
       *     of the far clipping plane.
       * @param {module:twgl/m4.Mat4} [dst] Output matrix.
       * @return {module:twgl/m4.Mat4} The perspective matrix.
       * @memberOf module:twgl/m4
       */
      function ortho(left, right, bottom, top, near, far, dst) {
        dst = dst || new MatType(16);

        dst[0] = 2 / (right - left);
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;

        dst[4] = 0;
        dst[5] = 2 / (top - bottom);
        dst[6] = 0;
        dst[7] = 0;

        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 2 / (near - far);
        dst[11] = 0;

        dst[12] = (right + left) / (left - right);
        dst[13] = (top + bottom) / (bottom - top);
        dst[14] = (far + near) / (near - far);
        dst[15] = 1;

        return dst;
      }

      /**
       * Computes a 4-by-4 perspective transformation matrix given the left, right,
       * top, bottom, near and far clipping planes. The arguments define a frustum
       * extending in the negative z direction. The arguments near and far are the
       * distances to the near and far clipping planes. Note that near and far are not
       * z coordinates, but rather they are distances along the negative z-axis. The
       * matrix generated sends the viewing frustum to the unit box. We assume a unit
       * box extending from -1 to 1 in the x and y dimensions and from 0 to 1 in the z
       * dimension.
       * @param {number} left The x coordinate of the left plane of the box.
       * @param {number} right The x coordinate of the right plane of the box.
       * @param {number} bottom The y coordinate of the bottom plane of the box.
       * @param {number} top The y coordinate of the right plane of the box.
       * @param {number} near The negative z coordinate of the near plane of the box.
       * @param {number} far The negative z coordinate of the far plane of the box.
       * @param {module:twgl/m4.Mat4} [dst] Output matrix.
       * @return {module:twgl/m4.Mat4} The perspective projection matrix.
       * @memberOf module:twgl/m4
       */
      function frustum(left, right, bottom, top, near, far, dst) {
        dst = dst || new MatType(16);

        var dx = right - left;
        var dy = top - bottom;
        var dz = near - far;

        dst[0] = 2 * near / dx;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 2 * near / dy;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = (left + right) / dx;
        dst[9] = (top + bottom) / dy;
        dst[10] = far / dz;
        dst[11] = -1;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = near * far / dz;
        dst[15] = 0;

        return dst;
      }

      /**
       * Computes a 4-by-4 look-at transformation.
       *
       * This is a matrix which positions the camera itself. If you want
       * a view matrix (a matrix which moves things in front of the camera)
       * take the inverse of this.
       *
       * @param {Vec3} eye The position of the eye.
       * @param {Vec3} target The position meant to be viewed.
       * @param {Vec3} up A vector pointing up.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The look-at matrix.
       * @memberOf module:twgl/m4
       */
      function lookAt(eye, target, up, dst) {
        dst = dst || new MatType(16);

        var xAxis = tempV3a;
        var yAxis = tempV3b;
        var zAxis = tempV3c;

        v3.normalize(v3.subtract(eye, target, zAxis), zAxis);
        v3.normalize(v3.cross(up, zAxis, xAxis), xAxis);
        v3.normalize(v3.cross(zAxis, xAxis, yAxis), yAxis);

        dst[0] = xAxis[0];
        dst[1] = xAxis[1];
        dst[2] = xAxis[2];
        dst[3] = 0;
        dst[4] = yAxis[0];
        dst[5] = yAxis[1];
        dst[6] = yAxis[2];
        dst[7] = 0;
        dst[8] = zAxis[0];
        dst[9] = zAxis[1];
        dst[10] = zAxis[2];
        dst[11] = 0;
        dst[12] = eye[0];
        dst[13] = eye[1];
        dst[14] = eye[2];
        dst[15] = 1;

        return dst;
      }

      /**
       * Creates a 4-by-4 matrix which translates by the given vector v.
       * @param {Vec3} v The vector by
       *     which to translate.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The translation matrix.
       * @memberOf module:twgl/m4
       */
      function translation(v, dst) {
        dst = dst || new MatType(16);

        dst[0] = 1;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 1;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = v[0];
        dst[13] = v[1];
        dst[14] = v[2];
        dst[15] = 1;
        return dst;
      }

      /**
       * Modifies the given 4-by-4 matrix by translation by the given vector v.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {Vec3} v The vector by
       *     which to translate.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} m once modified.
       * @memberOf module:twgl/m4
       */
      function translate(m, v, dst) {
        dst = dst || new MatType(16);

        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];
        var m00 = m[0];
        var m01 = m[1];
        var m02 = m[2];
        var m03 = m[3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];

        if (m !== dst) {
          dst[0] = m00;
          dst[1] = m01;
          dst[2] = m02;
          dst[3] = m03;
          dst[4] = m10;
          dst[5] = m11;
          dst[6] = m12;
          dst[7] = m13;
          dst[8] = m20;
          dst[9] = m21;
          dst[10] = m22;
          dst[11] = m23;
        }

        dst[12] = m00 * v0 + m10 * v1 + m20 * v2 + m30;
        dst[13] = m01 * v0 + m11 * v1 + m21 * v2 + m31;
        dst[14] = m02 * v0 + m12 * v1 + m22 * v2 + m32;
        dst[15] = m03 * v0 + m13 * v1 + m23 * v2 + m33;

        return dst;
      }

      /**
       * Creates a 4-by-4 matrix which rotates around the x-axis by the given angle.
       * @param {number} angleInRadians The angle by which to rotate (in radians).
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The rotation matrix.
       * @memberOf module:twgl/m4
       */
      function rotationX(angleInRadians, dst) {
        dst = dst || new MatType(16);

        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[0] = 1;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = c;
        dst[6] = s;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = -s;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
      }

      /**
       * Modifies the given 4-by-4 matrix by a rotation around the x-axis by the given
       * angle.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {number} angleInRadians The angle by which to rotate (in radians).
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} m once modified.
       * @memberOf module:twgl/m4
       */
      function rotateX(m, angleInRadians, dst) {
        dst = dst || new MatType(16);

        var m10 = m[4];
        var m11 = m[5];
        var m12 = m[6];
        var m13 = m[7];
        var m20 = m[8];
        var m21 = m[9];
        var m22 = m[10];
        var m23 = m[11];
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[4] = c * m10 + s * m20;
        dst[5] = c * m11 + s * m21;
        dst[6] = c * m12 + s * m22;
        dst[7] = c * m13 + s * m23;
        dst[8] = c * m20 - s * m10;
        dst[9] = c * m21 - s * m11;
        dst[10] = c * m22 - s * m12;
        dst[11] = c * m23 - s * m13;

        if (m !== dst) {
          dst[0] = m[0];
          dst[1] = m[1];
          dst[2] = m[2];
          dst[3] = m[3];
          dst[12] = m[12];
          dst[13] = m[13];
          dst[14] = m[14];
          dst[15] = m[15];
        }

        return dst;
      }

      /**
       * Creates a 4-by-4 matrix which rotates around the y-axis by the given angle.
       * @param {number} angleInRadians The angle by which to rotate (in radians).
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The rotation matrix.
       * @memberOf module:twgl/m4
       */
      function rotationY(angleInRadians, dst) {
        dst = dst || new MatType(16);

        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[0] = c;
        dst[1] = 0;
        dst[2] = -s;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 1;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = s;
        dst[9] = 0;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
      }

      /**
       * Modifies the given 4-by-4 matrix by a rotation around the y-axis by the given
       * angle.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {number} angleInRadians The angle by which to rotate (in radians).
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} m once modified.
       * @memberOf module:twgl/m4
       */
      function rotateY(m, angleInRadians, dst) {
        dst = dst || new MatType(16);

        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[0] = c * m00 - s * m20;
        dst[1] = c * m01 - s * m21;
        dst[2] = c * m02 - s * m22;
        dst[3] = c * m03 - s * m23;
        dst[8] = c * m20 + s * m00;
        dst[9] = c * m21 + s * m01;
        dst[10] = c * m22 + s * m02;
        dst[11] = c * m23 + s * m03;

        if (m !== dst) {
          dst[4] = m[4];
          dst[5] = m[5];
          dst[6] = m[6];
          dst[7] = m[7];
          dst[12] = m[12];
          dst[13] = m[13];
          dst[14] = m[14];
          dst[15] = m[15];
        }

        return dst;
      }

      /**
       * Creates a 4-by-4 matrix which rotates around the z-axis by the given angle.
       * @param {number} angleInRadians The angle by which to rotate (in radians).
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The rotation matrix.
       * @memberOf module:twgl/m4
       */
      function rotationZ(angleInRadians, dst) {
        dst = dst || new MatType(16);

        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[0] = c;
        dst[1] = s;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = -s;
        dst[5] = c;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
      }

      /**
       * Modifies the given 4-by-4 matrix by a rotation around the z-axis by the given
       * angle.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {number} angleInRadians The angle by which to rotate (in radians).
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} m once modified.
       * @memberOf module:twgl/m4
       */
      function rotateZ(m, angleInRadians, dst) {
        dst = dst || new MatType(16);

        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[0] = c * m00 + s * m10;
        dst[1] = c * m01 + s * m11;
        dst[2] = c * m02 + s * m12;
        dst[3] = c * m03 + s * m13;
        dst[4] = c * m10 - s * m00;
        dst[5] = c * m11 - s * m01;
        dst[6] = c * m12 - s * m02;
        dst[7] = c * m13 - s * m03;

        if (m !== dst) {
          dst[8] = m[8];
          dst[9] = m[9];
          dst[10] = m[10];
          dst[11] = m[11];
          dst[12] = m[12];
          dst[13] = m[13];
          dst[14] = m[14];
          dst[15] = m[15];
        }

        return dst;
      }

      /**
       * Creates a 4-by-4 matrix which rotates around the given axis by the given
       * angle.
       * @param {Vec3} axis The axis
       *     about which to rotate.
       * @param {number} angleInRadians The angle by which to rotate (in radians).
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} A matrix which rotates angle radians
       *     around the axis.
       * @memberOf module:twgl/m4
       */
      function axisRotation(axis, angleInRadians, dst) {
        dst = dst || new MatType(16);

        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
        var n = Math.sqrt(x * x + y * y + z * z);
        x /= n;
        y /= n;
        z /= n;
        var xx = x * x;
        var yy = y * y;
        var zz = z * z;
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        var oneMinusCosine = 1 - c;

        dst[0] = xx + (1 - xx) * c;
        dst[1] = x * y * oneMinusCosine + z * s;
        dst[2] = x * z * oneMinusCosine - y * s;
        dst[3] = 0;
        dst[4] = x * y * oneMinusCosine - z * s;
        dst[5] = yy + (1 - yy) * c;
        dst[6] = y * z * oneMinusCosine + x * s;
        dst[7] = 0;
        dst[8] = x * z * oneMinusCosine + y * s;
        dst[9] = y * z * oneMinusCosine - x * s;
        dst[10] = zz + (1 - zz) * c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
      }

      /**
       * Modifies the given 4-by-4 matrix by rotation around the given axis by the
       * given angle.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {Vec3} axis The axis
       *     about which to rotate.
       * @param {number} angleInRadians The angle by which to rotate (in radians).
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} m once modified.
       * @memberOf module:twgl/m4
       */
      function axisRotate(m, axis, angleInRadians, dst) {
        dst = dst || new MatType(16);

        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
        var n = Math.sqrt(x * x + y * y + z * z);
        x /= n;
        y /= n;
        z /= n;
        var xx = x * x;
        var yy = y * y;
        var zz = z * z;
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        var oneMinusCosine = 1 - c;

        var r00 = xx + (1 - xx) * c;
        var r01 = x * y * oneMinusCosine + z * s;
        var r02 = x * z * oneMinusCosine - y * s;
        var r10 = x * y * oneMinusCosine - z * s;
        var r11 = yy + (1 - yy) * c;
        var r12 = y * z * oneMinusCosine + x * s;
        var r20 = x * z * oneMinusCosine + y * s;
        var r21 = y * z * oneMinusCosine - x * s;
        var r22 = zz + (1 - zz) * c;

        var m00 = m[0];
        var m01 = m[1];
        var m02 = m[2];
        var m03 = m[3];
        var m10 = m[4];
        var m11 = m[5];
        var m12 = m[6];
        var m13 = m[7];
        var m20 = m[8];
        var m21 = m[9];
        var m22 = m[10];
        var m23 = m[11];

        dst[0] = r00 * m00 + r01 * m10 + r02 * m20;
        dst[1] = r00 * m01 + r01 * m11 + r02 * m21;
        dst[2] = r00 * m02 + r01 * m12 + r02 * m22;
        dst[3] = r00 * m03 + r01 * m13 + r02 * m23;
        dst[4] = r10 * m00 + r11 * m10 + r12 * m20;
        dst[5] = r10 * m01 + r11 * m11 + r12 * m21;
        dst[6] = r10 * m02 + r11 * m12 + r12 * m22;
        dst[7] = r10 * m03 + r11 * m13 + r12 * m23;
        dst[8] = r20 * m00 + r21 * m10 + r22 * m20;
        dst[9] = r20 * m01 + r21 * m11 + r22 * m21;
        dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
        dst[11] = r20 * m03 + r21 * m13 + r22 * m23;

        if (m !== dst) {
          dst[12] = m[12];
          dst[13] = m[13];
          dst[14] = m[14];
          dst[15] = m[15];
        }

        return dst;
      }

      /**
       * Creates a 4-by-4 matrix which scales in each dimension by an amount given by
       * the corresponding entry in the given vector; assumes the vector has three
       * entries.
       * @param {Vec3} v A vector of
       *     three entries specifying the factor by which to scale in each dimension.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} The scaling matrix.
       * @memberOf module:twgl/m4
       */
      function scaling(v, dst) {
        dst = dst || new MatType(16);

        dst[0] = v[0];
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = v[1];
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = v[2];
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
      }

      /**
       * Modifies the given 4-by-4 matrix, scaling in each dimension by an amount
       * given by the corresponding entry in the given vector; assumes the vector has
       * three entries.
       * @param {module:twgl/m4.Mat4} m The matrix to be modified.
       * @param {Vec3} v A vector of three entries specifying the
       *     factor by which to scale in each dimension.
       * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
       * @return {module:twgl/m4.Mat4} m once modified.
       * @memberOf module:twgl/m4
       */
      function scale(m, v, dst) {
        dst = dst || new MatType(16);

        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];

        dst[0] = v0 * m[0 * 4 + 0];
        dst[1] = v0 * m[0 * 4 + 1];
        dst[2] = v0 * m[0 * 4 + 2];
        dst[3] = v0 * m[0 * 4 + 3];
        dst[4] = v1 * m[1 * 4 + 0];
        dst[5] = v1 * m[1 * 4 + 1];
        dst[6] = v1 * m[1 * 4 + 2];
        dst[7] = v1 * m[1 * 4 + 3];
        dst[8] = v2 * m[2 * 4 + 0];
        dst[9] = v2 * m[2 * 4 + 1];
        dst[10] = v2 * m[2 * 4 + 2];
        dst[11] = v2 * m[2 * 4 + 3];

        if (m !== dst) {
          dst[12] = m[12];
          dst[13] = m[13];
          dst[14] = m[14];
          dst[15] = m[15];
        }

        return dst;
      }

      /**
       * Takes a 4-by-4 matrix and a vector with 3 entries,
       * interprets the vector as a point, transforms that point by the matrix, and
       * returns the result as a vector with 3 entries.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {Vec3} v The point.
       * @param {Vec3} dst optional vec3 to store result
       * @return {Vec3} dst or new vec3 if not provided
       * @memberOf module:twgl/m4
       */
      function transformPoint(m, v, dst) {
        dst = dst || v3.create();
        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];
        var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];

        dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
        dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
        dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

        return dst;
      }

      /**
       * Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a
       * direction, transforms that direction by the matrix, and returns the result;
       * assumes the transformation of 3-dimensional space represented by the matrix
       * is parallel-preserving, i.e. any combination of rotation, scaling and
       * translation, but not a perspective distortion. Returns a vector with 3
       * entries.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {Vec3} v The direction.
       * @param {Vec3} dst optional Vec3 to store result
       * @return {Vec3} dst or new Vec3 if not provided
       * @memberOf module:twgl/m4
       */
      function transformDirection(m, v, dst) {
        dst = dst || v3.create();

        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];

        dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
        dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
        dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];

        return dst;
      }

      /**
       * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
       * as a normal to a surface, and computes a vector which is normal upon
       * transforming that surface by the matrix. The effect of this function is the
       * same as transforming v (as a direction) by the inverse-transpose of m.  This
       * function assumes the transformation of 3-dimensional space represented by the
       * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
       * translation, but not a perspective distortion.  Returns a vector with 3
       * entries.
       * @param {module:twgl/m4.Mat4} m The matrix.
       * @param {Vec3} v The normal.
       * @param {Vec3} [dst] The direction.
       * @return {Vec3} The transformed direction.
       * @memberOf module:twgl/m4
       */
      function transformNormal(m, v, dst) {
        dst = dst || v3.create();
        var mi = inverse(m);
        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];

        dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
        dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
        dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

        return dst;
      }

      exports.axisRotate = axisRotate;
      exports.axisRotation = axisRotation;
      exports.copy = copy;
      exports.frustum = frustum;
      exports.getAxis = getAxis;
      exports.getTranslation = getTranslation;
      exports.identity = identity;
      exports.inverse = inverse;
      exports.lookAt = lookAt;
      exports.multiply = multiply;
      exports.negate = negate;
      exports.ortho = ortho;
      exports.perspective = perspective;
      exports.rotateX = rotateX;
      exports.rotateY = rotateY;
      exports.rotateZ = rotateZ;
      exports.rotationX = rotationX;
      exports.rotationY = rotationY;
      exports.rotationZ = rotationZ;
      exports.scale = scale;
      exports.scaling = scaling;
      exports.setAxis = setAxis;
      exports.setDefaultType = setDefaultType;
      exports.setTranslation = setTranslation;
      exports.transformDirection = transformDirection;
      exports.transformNormal = transformNormal;
      exports.transformPoint = transformPoint;
      exports.translate = translate;
      exports.translation = translation;
      exports.transpose = transpose;

      /***/
    },
    /* 7 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.primitives = exports.v3 = exports.m4 = undefined;

      var _twgl = __webpack_require__(8);

      Object.keys(_twgl).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return _twgl[key];
          }
        });
      });

      var _m = __webpack_require__(6);

      var m4 = _interopRequireWildcard(_m);

      var _v = __webpack_require__(3);

      var v3 = _interopRequireWildcard(_v);

      var _primitives = __webpack_require__(12);

      var primitives = _interopRequireWildcard(_primitives);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      exports.m4 = m4;
      exports.v3 = v3;
      exports.primitives = primitives;

      /***/
    },
    /* 8 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.setDefaults = exports.resizeCanvasToDisplaySize = exports.isWebGL2 = exports.isWebGL1 = exports.getWebGLContext = exports.getContext = exports.addExtensionsToContext = undefined;

      var _attributes = __webpack_require__(4);

      Object.keys(_attributes).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return _attributes[key];
          }
        });
      });

      var _draw = __webpack_require__(9);

      Object.keys(_draw).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return _draw[key];
          }
        });
      });

      var _framebuffers = __webpack_require__(10);

      Object.keys(_framebuffers).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return _framebuffers[key];
          }
        });
      });

      var _programs = __webpack_require__(2);

      Object.keys(_programs).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return _programs[key];
          }
        });
      });

      var _textures = __webpack_require__(5);

      Object.keys(_textures).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return _textures[key];
          }
        });
      });

      var _typedarrays = __webpack_require__(1);

      Object.keys(_typedarrays).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return _typedarrays[key];
          }
        });
      });

      var _vertexArrays = __webpack_require__(11);

      Object.keys(_vertexArrays).forEach(function (key) {
        if (key === "default" || key === "__esModule") return;
        Object.defineProperty(exports, key, {
          enumerable: true,
          get: function get() {
            return _vertexArrays[key];
          }
        });
      });

      var attributes = _interopRequireWildcard(_attributes);

      var textures = _interopRequireWildcard(_textures);

      var _utils = __webpack_require__(0);

      var utils = _interopRequireWildcard(_utils);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * The main TWGL module.
       *
       * For most use cases you shouldn't need anything outside this module.
       * Exceptions between the stuff added to twgl-full (v3, m4, primitives)
       *
       * @module twgl
       * @borrows module:twgl/attributes.setAttribInfoBufferFromArray as setAttribInfoBufferFromArray
       * @borrows module:twgl/attributes.createBufferInfoFromArrays as createBufferInfoFromArrays
       * @borrows module:twgl/attributes.createVertexArrayInfo as createVertexArrayInfo
       * @borrows module:twgl/draw.drawBufferInfo as drawBufferInfo
       * @borrows module:twgl/draw.drawObjectList as drawObjectList
       * @borrows module:twgl/framebuffers.createFramebufferInfo as createFramebufferInfo
       * @borrows module:twgl/framebuffers.resizeFramebufferInfo as resizeFramebufferInfo
       * @borrows module:twgl/framebuffers.bindFramebufferInfo as bindFramebufferInfo
       * @borrows module:twgl/programs.createProgramInfo as createProgramInfo
       * @borrows module:twgl/programs.createUniformBlockInfo as createUniformBlockInfo
       * @borrows module:twgl/programs.bindUniformBlock as bindUniformBlock
       * @borrows module:twgl/programs.setUniformBlock as setUniformBlock
       * @borrows module:twgl/programs.setBlockUniforms as setBlockUniforms
       * @borrows module:twgl/programs.setUniforms as setUniforms
       * @borrows module:twgl/programs.setBuffersAndAttributes as setBuffersAndAttributes
       * @borrows module:twgl/textures.setTextureFromArray as setTextureFromArray
       * @borrows module:twgl/textures.createTexture as createTexture
       * @borrows module:twgl/textures.resizeTexture as resizeTexture
       * @borrows module:twgl/textures.createTextures as createTextures
       */

      // make sure we don't see a global gl
      var gl = undefined; // eslint-disable-line
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      var defaults = {
        addExtensionsToContext: true
      };

      /**
       * Various default settings for twgl.
       *
       * Note: You can call this any number of times. Example:
       *
       *     twgl.setDefaults({ textureColor: [1, 0, 0, 1] });
       *     twgl.setDefaults({ attribPrefix: 'a_' });
       *
       * is equivalent to
       *
       *     twgl.setDefaults({
       *       textureColor: [1, 0, 0, 1],
       *       attribPrefix: 'a_',
       *     });
       *
       * @typedef {Object} Defaults
       * @property {string} attribPrefix The prefix to stick on attributes
       *
       *   When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
       *   as it makes it clear where they came from. But, when building geometry I prefer using unprefixed names.
       *
       *   In otherwords I'll create arrays of geometry like this
       *
       *       const arrays = {
       *         position: ...
       *         normal: ...
       *         texcoord: ...
       *       };
       *
       *   But need those mapped to attributes and my attributes start with `a_`.
       *
       *   Default: `""`
       *
       * @property {number[]} textureColor Array of 4 values in the range 0 to 1
       *
       *   The default texture color is used when loading textures from
       *   urls. Because the URL will be loaded async we'd like to be
       *   able to use the texture immediately. By putting a 1x1 pixel
       *   color in the texture we can start using the texture before
       *   the URL has loaded.
       *
       *   Default: `[0.5, 0.75, 1, 1]`
       *
       * @property {string} crossOrigin
       *
       *   If not undefined sets the crossOrigin attribute on images
       *   that twgl creates when downloading images for textures.
       *
       *   Also see {@link module:twgl.TextureOptions}.
       *
       * @property {bool} addExtensionsToContext
       *
       *   If true, then, when twgl will try to add any supported WebGL extensions
       *   directly to the context under their normal GL names. For example
       *   if ANGLE_instances_arrays exists then twgl would enable it,
       *   add the functions `vertexAttribDivisor`, `drawArraysInstanced`,
       *   `drawElementsInstanced`, and the constant `VERTEX_ATTRIB_ARRAY_DIVISOR`
       *   to the `WebGLRenderingContext`.
       *
       * @memberOf module:twgl
       */

      /**
       * Sets various defaults for twgl.
       *
       * In the interest of terseness which is kind of the point
       * of twgl I've integrated a few of the older functions here
       *
       * @param {module:twgl.Defaults} newDefaults The default settings.
       * @memberOf module:twgl
       */
      function setDefaults(newDefaults) {
        utils.copyExistingProperties(newDefaults, defaults);
        attributes.setAttributeDefaults_(newDefaults); // eslint-disable-line
        textures.setTextureDefaults_(newDefaults); // eslint-disable-line
      }

      var prefixRE = /^(.*?)_/;
      function addExtensionToContext(gl, extensionName) {
        var ext = gl.getExtension(extensionName);
        if (ext) {
          var fnSuffix = prefixRE.exec(extensionName)[1];
          var enumSuffix = '_' + fnSuffix;
          for (var key in ext) {
            var value = ext[key];
            var isFunc = typeof value === 'function';
            var suffix = isFunc ? fnSuffix : enumSuffix;
            var name = key;
            // examples of where this is not true are WEBGL_compressed_texture_s3tc
            // and WEBGL_compressed_texture_pvrtc
            if (key.endsWith(suffix)) {
              name = key.substring(0, key.length - suffix.length);
            }
            if (gl[name] !== undefined) {
              if (!isFunc && gl[name] !== value) {
                console.warn(name, gl[name], value, key); // eslint-disable-line
              }
            } else {
              if (isFunc) {
                gl[name] = function (origFn) {
                  return function () {
                    return origFn.apply(ext, arguments);
                  };
                }(value);
              } else {
                gl[name] = value;
              }
            }
          }
        }
        return ext;
      }

      var supportedExtensions = ['ANGLE_instanced_arrays', 'EXT_blend_minmax', 'EXT_color_buffer_half_float', 'EXT_disjoint_timer_query', 'EXT_frag_depth', 'EXT_sRGB', 'EXT_shader_texture_lod', 'EXT_texture_filter_anisotropic', 'OES_element_index_uint', 'OES_standard_derivatives', 'OES_texture_float', 'OES_texture_float_linear', 'OES_texture_half_float', 'OES_texture_half_float_linear', 'OES_vertex_array_object', 'WEBGL_color_buffer_float', 'WEBGL_compressed_texture_atc', 'WEBGL_compressed_texture_etc1', 'WEBGL_compressed_texture_pvrtc', 'WEBGL_compressed_texture_s3tc', 'WEBGL_depth_texture', 'WEBGL_draw_buffers'];

      /**
       * Attempts to enable all of the following extensions
       * and add their functions and constants to the
       * `WebGLRenderingContext` using their normal non-extension like names.
       *
       *      ANGLE_instanced_arrays
       *      EXT_blend_minmax
       *      EXT_color_buffer_half_float
       *      EXT_disjoint_timer_query
       *      EXT_frag_depth
       *      EXT_sRGB
       *      EXT_shader_texture_lod
       *      EXT_texture_filter_anisotropic
       *      OES_element_index_uint
       *      OES_standard_derivatives
       *      OES_texture_float
       *      OES_texture_float_linear
       *      OES_texture_half_float
       *      OES_texture_half_float_linear
       *      OES_vertex_array_object
       *      WEBGL_color_buffer_float
       *      WEBGL_compressed_texture_atc
       *      WEBGL_compressed_texture_etc1
       *      WEBGL_compressed_texture_pvrtc
       *      WEBGL_compressed_texture_s3tc
       *      WEBGL_depth_texture
       *      WEBGL_draw_buffers
       *
       * For example if `ANGLE_instanced_arrays` exists then the functions
       * `drawArraysInstanced`, `drawElementsInstanced`, `vertexAttribDivisor`
       * and the constant `VERTEX_ATTRIB_ARRAY_DIVISOR` are added to the
       * `WebGLRenderingContext`.
       *
       * Note that if you want to know if the extension exists you should
       * probably call `gl.getExtension` for each extension. Alternatively
       * you can check for the existance of the functions or constants that
       * are expected to be added. For example
       *
       *    if (gl.drawBuffers) {
       *      // Either WEBGL_draw_buffers was enabled OR you're running in WebGL2
       *      ....
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @memberOf module:twgl
       */
      function addExtensionsToContext(gl) {
        for (var ii = 0; ii < supportedExtensions.length; ++ii) {
          addExtensionToContext(gl, supportedExtensions[ii]);
        }
      }

      /**
       * Creates a webgl context.
       * @param {HTMLCanvasElement} canvas The canvas tag to get
       *     context from. If one is not passed in one will be
       *     created.
       * @return {WebGLRenderingContext} The created context.
       */
      function create3DContext(canvas, opt_attribs) {
        var names = ["webgl", "experimental-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii) {
          context = canvas.getContext(names[ii], opt_attribs);
          if (context) {
            if (defaults.addExtensionsToContext) {
              addExtensionsToContext(context);
            }
            break;
          }
        }
        return context;
      }

      /**
       * Gets a WebGL1 context.
       *
       * Note: Will attempt to enable Vertex Array Objects
       * and add WebGL2 entry points. (unless you first set defaults with
       * `twgl.setDefaults({enableVertexArrayObjects: false})`;
       *
       * @param {HTMLCanvasElement} canvas a canvas element.
       * @param {WebGLContextCreationAttirbutes} [opt_attribs] optional webgl context creation attributes
       * @memberOf module:twgl
       */
      function getWebGLContext(canvas, opt_attribs) {
        var gl = create3DContext(canvas, opt_attribs);
        return gl;
      }

      /**
       * Creates a webgl context.
       *
       * Will return a WebGL2 context if possible.
       *
       * You can check if it's WebGL2 with
       *
       *     twgl.isWebGL2(gl);
       *
       * @param {HTMLCanvasElement} canvas The canvas tag to get
       *     context from. If one is not passed in one will be
       *     created.
       * @return {WebGLRenderingContext} The created context.
       */
      function createContext(canvas, opt_attribs) {
        var names = ["webgl2", "webgl", "experimental-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii) {
          context = canvas.getContext(names[ii], opt_attribs);
          if (context) {
            if (defaults.addExtensionsToContext) {
              addExtensionsToContext(context);
            }
            break;
          }
        }
        return context;
      }

      /**
       * Gets a WebGL context.  Will create a WebGL2 context if possible.
       *
       * You can check if it's WebGL2 with
       *
       *    function isWebGL2(gl) {
       *      return gl.getParameter(gl.VERSION).indexOf("WebGL 2.0 ") == 0;
       *    }
       *
       * Note: For a WebGL1 context will attempt to enable Vertex Array Objects
       * and add WebGL2 entry points. (unless you first set defaults with
       * `twgl.setDefaults({enableVertexArrayObjects: false})`;
       *
       * @param {HTMLCanvasElement} canvas a canvas element.
       * @param {WebGLContextCreationAttirbutes} [opt_attribs] optional webgl context creation attributes
       * @return {WebGLRenderingContext} The created context.
       * @memberOf module:twgl
       */
      function getContext(canvas, opt_attribs) {
        var gl = createContext(canvas, opt_attribs);
        return gl;
      }

      /**
       * Resize a canvas to match the size it's displayed.
       * @param {HTMLCanvasElement} canvas The canvas to resize.
       * @param {number} [multiplier] So you can pass in `window.devicePixelRatio` or other scale value if you want to.
       * @return {boolean} true if the canvas was resized.
       * @memberOf module:twgl
       */
      function resizeCanvasToDisplaySize(canvas, multiplier) {
        multiplier = multiplier || 1;
        multiplier = Math.max(0, multiplier);
        var width = canvas.clientWidth * multiplier | 0;
        var height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          return true;
        }
        return false;
      }

      var isWebGL1 = utils.isWebGL1;
      var isWebGL2 = utils.isWebGL2;

      exports.addExtensionsToContext = addExtensionsToContext;
      exports.getContext = getContext;
      exports.getWebGLContext = getWebGLContext;
      exports.isWebGL1 = isWebGL1;
      exports.isWebGL2 = isWebGL2;
      exports.resizeCanvasToDisplaySize = resizeCanvasToDisplaySize;
      exports.setDefaults = setDefaults;

      // function notPrivate(name) {
      //   return name[name.length - 1] !== '_';
      // }
      //
      // function copyPublicProperties(src, dst) {
      //   Object.keys(src).filter(notPrivate).forEach(function(key) {
      //     dst[key] = src[key];
      //   });
      //   return dst;
      // }

      /***/
    },
    /* 9 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.drawObjectList = exports.drawBufferInfo = undefined;

      var _programs = __webpack_require__(2);

      var programs = _interopRequireWildcard(_programs);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * Drawing related functions
       *
       * For backward compatibily they are available at both `twgl.draw` and `twgl`
       * itself
       *
       * See {@link module:twgl} for core functions
       *
       * @module twgl/draw
       */

      /**
       * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
       *
       * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
       * but calling this means if you switch from indexed data to non-indexed
       * data you don't have to remember to update your draw call.
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @param {(module:twgl.BufferInfo|module:twgl.VertexArrayInfo)} bufferInfo A BufferInfo as returned from {@link module:twgl.createBufferInfoFromArrays} or
       *   a VertexArrayInfo as returned from {@link module:twgl.createVertexArrayInfo}
       * @param {enum} [type] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...). Defaults to `gl.TRIANGLES`
       * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
       * @param {number} [offset] An optional offset. Defaults to 0.
       * @param {number} [instanceCount] An optional instanceCount. if set then `drawArraysInstanced` or `drawElementsInstanced` will be called
       * @memberOf module:twgl/draw
       */
      function drawBufferInfo(gl, bufferInfo, type, count, offset, instanceCount) {
        type = type === undefined ? gl.TRIANGLES : type;
        var indices = bufferInfo.indices;
        var elementType = bufferInfo.elementType;
        var numElements = count === undefined ? bufferInfo.numElements : count;
        offset = offset === undefined ? 0 : offset;
        if (elementType || indices) {
          if (instanceCount !== undefined) {
            gl.drawElementsInstanced(type, numElements, elementType === undefined ? gl.UNSIGNED_SHORT : bufferInfo.elementType, offset, instanceCount);
          } else {
            gl.drawElements(type, numElements, elementType === undefined ? gl.UNSIGNED_SHORT : bufferInfo.elementType, offset);
          }
        } else {
          if (instanceCount !== undefined) {
            gl.drawArraysInstanced(type, offset, numElements, instanceCount);
          } else {
            gl.drawArrays(type, offset, numElements);
          }
        }
      }

      /**
       * A DrawObject is useful for putting objects in to an array and passing them to {@link module:twgl.drawObjectList}.
       *
       * You need either a `BufferInfo` or a `VertexArrayInfo`.
       *
       * @typedef {Object} DrawObject
       * @property {boolean} [active] whether or not to draw. Default = `true` (must be `false` to be not true). In otherwords `undefined` = `true`
       * @property {number} [type] type to draw eg. `gl.TRIANGLES`, `gl.LINES`, etc...
       * @property {module:twgl.ProgramInfo} programInfo A ProgramInfo as returned from {@link module:twgl.createProgramInfo}
       * @property {module:twgl.BufferInfo} [bufferInfo] A BufferInfo as returned from {@link module:twgl.createBufferInfoFromArrays}
       * @property {module:twgl.VertexArrayInfo} [vertexArrayInfo] A VertexArrayInfo as returned from {@link module:twgl.createVertexArrayInfo}
       * @property {Object<string, ?>} uniforms The values for the uniforms.
       *   You can pass multiple objects by putting them in an array. For example
       *
       *     var sharedUniforms = {
       *       u_fogNear: 10,
       *       u_projection: ...
       *       ...
       *     };
       *
       *     var localUniforms = {
       *       u_world: ...
       *       u_diffuseColor: ...
       *     };
       *
       *     var drawObj = {
       *       ...
       *       uniforms: [sharedUniforms, localUniforms],
       *     };
       *
       * @property {number} [offset] the offset to pass to `gl.drawArrays` or `gl.drawElements`. Defaults to 0.
       * @property {number} [count] the count to pass to `gl.drawArrays` or `gl.drawElemnts`. Defaults to bufferInfo.numElements.
       * @property {number} [instanceCount] the number of instances. Defaults to undefined.
       * @memberOf module:twgl
       */

      /**
       * Draws a list of objects
       * @param {DrawObject[]} objectsToDraw an array of objects to draw.
       * @memberOf module:twgl/draw
       */
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      function drawObjectList(gl, objectsToDraw) {
        var lastUsedProgramInfo = null;
        var lastUsedBufferInfo = null;

        objectsToDraw.forEach(function (object) {
          if (object.active === false) {
            return;
          }

          var programInfo = object.programInfo;
          var bufferInfo = object.vertexArrayInfo || object.bufferInfo;
          var bindBuffers = false;
          var type = object.type === undefined ? gl.TRIANGLES : object.type;

          if (programInfo !== lastUsedProgramInfo) {
            lastUsedProgramInfo = programInfo;
            gl.useProgram(programInfo.program);

            // We have to rebind buffers when changing programs because we
            // only bind buffers the program uses. So if 2 programs use the same
            // bufferInfo but the 1st one uses only positions the when the
            // we switch to the 2nd one some of the attributes will not be on.
            bindBuffers = true;
          }

          // Setup all the needed attributes.
          if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
            if (lastUsedBufferInfo && lastUsedBufferInfo.vertexArrayObject && !bufferInfo.vertexArrayObject) {
              gl.bindVertexArray(null);
            }
            lastUsedBufferInfo = bufferInfo;
            programs.setBuffersAndAttributes(gl, programInfo, bufferInfo);
          }

          // Set the uniforms.
          programs.setUniforms(programInfo, object.uniforms);

          // Draw
          drawBufferInfo(gl, bufferInfo, type, object.count, object.offset, object.instanceCount);
        });

        if (lastUsedBufferInfo.vertexArrayObject) {
          gl.bindVertexArray(null);
        }
      }

      exports.drawBufferInfo = drawBufferInfo;
      exports.drawObjectList = drawObjectList;

      /***/
    },
    /* 10 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.resizeFramebufferInfo = exports.createFramebufferInfo = exports.bindFramebufferInfo = undefined;

      var _textures = __webpack_require__(5);

      var textures = _interopRequireWildcard(_textures);

      var _utils = __webpack_require__(0);

      var utils = _interopRequireWildcard(_utils);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * Framebuffer related functions
       *
       * For backward compatibily they are available at both `twgl.framebuffer` and `twgl`
       * itself
       *
       * See {@link module:twgl} for core functions
       *
       * @module twgl/framebuffers
       */

      // make sure we don't see a global gl
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      var gl = undefined; // eslint-disable-line

      var UNSIGNED_BYTE = 0x1401;

      /* PixelFormat */
      var DEPTH_COMPONENT = 0x1902;
      var RGBA = 0x1908;

      /* Framebuffer Object. */
      var RGBA4 = 0x8056;
      var RGB5_A1 = 0x8057;
      var RGB565 = 0x8D62;
      var DEPTH_COMPONENT16 = 0x81A5;
      var STENCIL_INDEX = 0x1901;
      var STENCIL_INDEX8 = 0x8D48;
      var DEPTH_STENCIL = 0x84F9;
      var COLOR_ATTACHMENT0 = 0x8CE0;
      var DEPTH_ATTACHMENT = 0x8D00;
      var STENCIL_ATTACHMENT = 0x8D20;
      var DEPTH_STENCIL_ATTACHMENT = 0x821A;

      /* TextureWrapMode */
      var REPEAT = 0x2901; // eslint-disable-line
      var CLAMP_TO_EDGE = 0x812F;
      var MIRRORED_REPEAT = 0x8370; // eslint-disable-line

      /* TextureMagFilter */
      var NEAREST = 0x2600; // eslint-disable-line
      var LINEAR = 0x2601;

      /* TextureMinFilter */
      var NEAREST_MIPMAP_NEAREST = 0x2700; // eslint-disable-line
      var LINEAR_MIPMAP_NEAREST = 0x2701; // eslint-disable-line
      var NEAREST_MIPMAP_LINEAR = 0x2702; // eslint-disable-line
      var LINEAR_MIPMAP_LINEAR = 0x2703; // eslint-disable-line

      /**
       * The options for a framebuffer attachment.
       *
       * Note: For a `format` that is a texture include all the texture
       * options from {@link module:twgl.TextureOptions} for example
       * `min`, `mag`, `clamp`, etc... Note that unlike {@link module:twgl.TextureOptions}
       * `auto` defaults to `false` for attachment textures but `min` and `mag` default
       * to `gl.LINEAR` and `wrap` defaults to `CLAMP_TO_EDGE`
       *
       * @typedef {Object} AttachmentOptions
       * @property {number} [attach] The attachment point. Defaults
       *   to `gl.COLOR_ATTACTMENT0 + ndx` unless type is a depth or stencil type
       *   then it's gl.DEPTH_ATTACHMENT or `gl.DEPTH_STENCIL_ATTACHMENT` depending
       *   on the format or attachment type.
       * @property {number} [format] The format. If one of `gl.RGBA4`,
       *   `gl.RGB565`, `gl.RGB5_A1`, `gl.DEPTH_COMPONENT16`,
       *   `gl.STENCIL_INDEX8` or `gl.DEPTH_STENCIL` then will create a
       *   renderbuffer. Otherwise will create a texture. Default = `gl.RGBA`
       * @property {number} [type] The type. Used for texture. Default = `gl.UNSIGNED_BYTE`.
       * @property {number} [target] The texture target for `gl.framebufferTexture2D`.
       *   Defaults to `gl.TEXTURE_2D`. Set to appropriate face for cube maps.
       * @property {number} [level] level for `gl.framebufferTexture2D`. Defaults to 0.
       * @property {WebGLObject} [attachment] An existing renderbuffer or texture.
       *    If provided will attach this Object. This allows you to share
       *    attachemnts across framebuffers.
       * @memberOf module:twgl
       */

      var defaultAttachments = [{ format: RGBA, type: UNSIGNED_BYTE, min: LINEAR, wrap: CLAMP_TO_EDGE }, { format: DEPTH_STENCIL }];

      var attachmentsByFormat = {};
      attachmentsByFormat[DEPTH_STENCIL] = DEPTH_STENCIL_ATTACHMENT;
      attachmentsByFormat[STENCIL_INDEX] = STENCIL_ATTACHMENT;
      attachmentsByFormat[STENCIL_INDEX8] = STENCIL_ATTACHMENT;
      attachmentsByFormat[DEPTH_COMPONENT] = DEPTH_ATTACHMENT;
      attachmentsByFormat[DEPTH_COMPONENT16] = DEPTH_ATTACHMENT;

      function getAttachmentPointForFormat(format) {
        return attachmentsByFormat[format];
      }

      var renderbufferFormats = {};
      renderbufferFormats[RGBA4] = true;
      renderbufferFormats[RGB5_A1] = true;
      renderbufferFormats[RGB565] = true;
      renderbufferFormats[DEPTH_STENCIL] = true;
      renderbufferFormats[DEPTH_COMPONENT16] = true;
      renderbufferFormats[STENCIL_INDEX] = true;
      renderbufferFormats[STENCIL_INDEX8] = true;

      function isRenderbufferFormat(format) {
        return renderbufferFormats[format];
      }

      /**
       * @typedef {Object} FramebufferInfo
       * @property {WebGLFramebuffer} framebuffer The WebGLFramebuffer for this framebufferInfo
       * @property {WebGLObject[]} attachments The created attachments in the same order as passed in to {@link module:twgl.createFramebufferInfo}.
       * @memberOf module:twgl
       */

      /**
       * Creates a framebuffer and attachments.
       *
       * This returns a {@link module:twgl.FramebufferInfo} because it needs to return the attachments as well as the framebuffer.
       *
       * The simplest usage
       *
       *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
       *     const fbi = twgl.createFramebufferInfo(gl);
       *
       * More complex usage
       *
       *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
       *     const attachments = [
       *       { format: RGB565, mag: NEAREST },
       *       { format: STENCIL_INDEX8 },
       *     ]
       *     const fbi = twgl.createFramebufferInfo(gl, attachments);
       *
       * Passing in a specific size
       *
       *     const width = 256;
       *     const height = 256;
       *     const fbi = twgl.createFramebufferInfo(gl, attachments, width, height);
       *
       * **Note!!** It is up to you to check if the framebuffer is renderable by calling `gl.checkFramebufferStatus`.
       * [WebGL only guarantees 3 combinations of attachments work](https://www.khronos.org/registry/webgl/specs/latest/1.0/#6.6).
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {module:twgl.AttachmentOptions[]} [attachments] which attachments to create. If not provided the default is a framebuffer with an
       *    `RGBA`, `UNSIGNED_BYTE` texture `COLOR_ATTACHMENT0` and a `DEPTH_STENCIL` renderbuffer `DEPTH_STENCIL_ATTACHMENT`.
       * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
       * @param {number} [height] the height for the attachments. Defautt = size of drawingBuffer
       * @return {module:twgl.FramebufferInfo} the framebuffer and attachments.
       * @memberOf module:twgl/framebuffers
       */
      function createFramebufferInfo(gl, attachments, width, height) {
        var target = gl.FRAMEBUFFER;
        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(target, fb);
        width = width || gl.drawingBufferWidth;
        height = height || gl.drawingBufferHeight;
        attachments = attachments || defaultAttachments;
        var colorAttachmentCount = 0;
        var framebufferInfo = {
          framebuffer: fb,
          attachments: [],
          width: width,
          height: height
        };
        attachments.forEach(function (attachmentOptions) {
          var attachment = attachmentOptions.attachment;
          var format = attachmentOptions.format;
          var attachmentPoint = getAttachmentPointForFormat(format);
          if (!attachmentPoint) {
            attachmentPoint = COLOR_ATTACHMENT0 + colorAttachmentCount++;
          }
          if (!attachment) {
            if (isRenderbufferFormat(format)) {
              attachment = gl.createRenderbuffer();
              gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
              gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
            } else {
              var textureOptions = utils.shallowCopy(attachmentOptions);
              textureOptions.width = width;
              textureOptions.height = height;
              if (textureOptions.auto === undefined) {
                textureOptions.auto = false;
                textureOptions.min = textureOptions.min || textureOptions.minMag || gl.LINEAR;
                textureOptions.mag = textureOptions.mag || textureOptions.minMag || gl.LINEAR;
                textureOptions.wrapS = textureOptions.wrapS || textureOptions.wrap || gl.CLAMP_TO_EDGE;
                textureOptions.wrapT = textureOptions.wrapT || textureOptions.wrap || gl.CLAMP_TO_EDGE;
              }
              attachment = textures.createTexture(gl, textureOptions);
            }
          }
          if (attachment instanceof WebGLRenderbuffer) {
            gl.framebufferRenderbuffer(target, attachmentPoint, gl.RENDERBUFFER, attachment);
          } else if (attachment instanceof WebGLTexture) {
            gl.framebufferTexture2D(target, attachmentPoint, attachmentOptions.texTarget || gl.TEXTURE_2D, attachment, attachmentOptions.level || 0);
          } else {
            throw "unknown attachment type";
          }
          framebufferInfo.attachments.push(attachment);
        });
        return framebufferInfo;
      }

      /**
       * Resizes the attachments of a framebuffer.
       *
       * You need to pass in the same `attachments` as you passed in {@link module:twgl.createFramebufferInfo}
       * because TWGL has no idea the format/type of each attachment.
       *
       * The simplest usage
       *
       *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
       *     const fbi = twgl.createFramebufferInfo(gl);
       *
       *     ...
       *
       *     function render() {
       *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
       *         // resize the attachments
       *         twgl.resizeFramebufferInfo(gl, fbi);
       *       }
       *
       * More complex usage
       *
       *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
       *     const attachments = [
       *       { format: RGB565, mag: NEAREST },
       *       { format: STENCIL_INDEX8 },
       *     ]
       *     const fbi = twgl.createFramebufferInfo(gl, attachments);
       *
       *     ...
       *
       *     function render() {
       *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
       *         // resize the attachments to match
       *         twgl.resizeFramebufferInfo(gl, fbi, attachments);
       *       }
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {module:twgl.FramebufferInfo} framebufferInfo a framebufferInfo as returned from {@link module:twgl.createFramebufferInfo}.
       * @param {module:twgl.AttachmentOptions[]} [attachments] the same attachments options as passed to {@link module:twgl.createFramebufferInfo}.
       * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
       * @param {number} [height] the height for the attachments. Defautt = size of drawingBuffer
       * @memberOf module:twgl/framebuffers
       */
      function resizeFramebufferInfo(gl, framebufferInfo, attachments, width, height) {
        width = width || gl.drawingBufferWidth;
        height = height || gl.drawingBufferHeight;
        framebufferInfo.width = width;
        framebufferInfo.height = height;
        attachments = attachments || defaultAttachments;
        attachments.forEach(function (attachmentOptions, ndx) {
          var attachment = framebufferInfo.attachments[ndx];
          var format = attachmentOptions.format;
          if (attachment instanceof WebGLRenderbuffer) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
            gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
          } else if (attachment instanceof WebGLTexture) {
            textures.resizeTexture(gl, attachment, attachmentOptions, width, height);
          } else {
            throw "unknown attachment type";
          }
        });
      }

      /**
       * Binds a framebuffer
       *
       * This function pretty much soley exists because I spent hours
       * trying to figure out why something I wrote wasn't working only
       * to realize I forget to set the viewport dimensions.
       * My hope is this function will fix that.
       *
       * It is effectively the same as
       *
       *     gl.bindFramebuffer(gl.FRAMEBUFFER, someFramebufferInfo.framebuffer);
       *     gl.viewport(0, 0, someFramebufferInfo.width, someFramebufferInfo.height);
       *
       * @param {WebGLRenderingContext} gl the WebGLRenderingContext
       * @param {module:twgl.FramebufferInfo} [framebufferInfo] a framebufferInfo as returned from {@link module:twgl.createFramebufferInfo}.
       *   If not passed will bind the canvas.
       * @param {number} [target] The target. If not passed `gl.FRAMEBUFFER` will be used.
       * @memberOf module:twgl/framebuffers
       */

      function bindFramebufferInfo(gl, framebufferInfo, target) {
        target = target || gl.FRAMEBUFFER;
        if (framebufferInfo) {
          gl.bindFramebuffer(target, framebufferInfo.framebuffer);
          gl.viewport(0, 0, framebufferInfo.width, framebufferInfo.height);
        } else {
          gl.bindFramebuffer(target, null);
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        }
      }

      exports.bindFramebufferInfo = bindFramebufferInfo;
      exports.createFramebufferInfo = createFramebufferInfo;
      exports.resizeFramebufferInfo = resizeFramebufferInfo;

      /***/
    },
    /* 11 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.createVAOFromBufferInfo = exports.createVAOAndSetAttributes = exports.createVertexArrayInfo = undefined;

      var _programs = __webpack_require__(2);

      var programs = _interopRequireWildcard(_programs);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      /**
       * vertex array object related functions
       *
       * You should generally not need to use these functions. They are provided
       * for those cases where you're doing something out of the ordinary
       * and you need lower level access.
       *
       * For backward compatibily they are available at both `twgl.attributes` and `twgl`
       * itself
       *
       * See {@link module:twgl} for core functions
       *
       * @module twgl/vertexArrays
       */

      /**
       * @typedef {Object} VertexArrayInfo
       * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
       * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
       * @property {WebGLVertexArrayObject} [vertexArrayObject] a vertex array object
       * @memberOf module:twgl
       */

      /**
       * Creates a VertexArrayInfo from a BufferInfo and one or more ProgramInfos
       *
       * This can be passed to {@link module:twgl.setBuffersAndAttributes} and to
       * {@link module:twgl:drawBufferInfo}.
       *
       * > **IMPORTANT:** Vertex Array Objects are **not** a direct analog for a BufferInfo. Vertex Array Objects
       *   assign buffers to specific attributes at creation time. That means they can only be used with programs
       *   who's attributes use the same attribute locations for the same purposes.
       *
       * > Bind your attribute locations by passing an array of attribute names to {@link module:twgl.createProgramInfo}
       *   or use WebGL 2's GLSL ES 3's `layout(location = <num>)` to make sure locations match.
       *
       * also
       *
       * > **IMPORTANT:** After calling twgl.setBuffersAndAttribute with a BufferInfo that uses a Vertex Array Object
       *   that Vertex Array Object will be bound. That means **ANY MANIPULATION OF ELEMENT_ARRAY_BUFFER or ATTRIBUTES**
       *   will affect the Vertex Array Object state.
       *
       * > Call `gl.bindVertexArray(null)` to get back manipulating the global attributes and ELEMENT_ARRAY_BUFFER.
       *
       * @param {WebGLRenderingContext} gl A WebGLRenderingContext
       * @param {module:twgl.ProgramInfo|module:twgl.ProgramInfo[]} programInfo a programInfo or array of programInfos
       * @param {module:twgl.BufferInfo} bufferInfo BufferInfo as returned from createBufferInfoFromArrays etc...
       *
       *    You need to make sure every attribute that will be used is bound. So for example assume shader 1
       *    uses attributes A, B, C and shader 2 uses attributes A, B, D. If you only pass in the programInfo
       *    for shader 1 then only attributes A, B, and C will have their attributes set because TWGL doesn't
       *    now attribute D's location.
       *
       *    So, you can pass in both shader 1 and shader 2's programInfo
       *
       * @return {module:twgl.VertexArrayInfo} The created VertexArrayInfo
       *
       * @memberOf module:twgl/vertexArrays
       */
      function createVertexArrayInfo(gl, programInfos, bufferInfo) {
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        if (!programInfos.length) {
          programInfos = [programInfos];
        }
        programInfos.forEach(function (programInfo) {
          programs.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        });
        gl.bindVertexArray(null);
        return {
          numElements: bufferInfo.numElements,
          elementType: bufferInfo.elementType,
          vertexArrayObject: vao
        };
      }

      /**
       * Creates a vertex array object and then sets the attributes on it
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
       * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
       * @param {Object.<string, module:twgl.AttribInfo>} attribs AttribInfos mapped by attribute name.
       * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
       * @memberOf module:twgl/vertexArrays
       */
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      function createVAOAndSetAttributes(gl, setters, attribs, indices) {
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        programs.setAttributes(setters, attribs);
        if (indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        }
        // We unbind this because otherwise any change to ELEMENT_ARRAY_BUFFER
        // like when creating buffers for other stuff will mess up this VAO's binding
        gl.bindVertexArray(null);
        return vao;
      }

      /**
       * Creates a vertex array object and then sets the attributes
       * on it
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext
       *        to use.
       * @param {Object.<string, function>| module:twgl.ProgramInfo} programInfo as returned from createProgramInfo or Attribute setters as returned from createAttributeSetters
       * @param {module:twgl.BufferInfo} bufferInfo BufferInfo as returned from createBufferInfoFromArrays etc...
       * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
       * @memberOf module:twgl/vertexArrays
       */
      function createVAOFromBufferInfo(gl, programInfo, bufferInfo) {
        return createVAOAndSetAttributes(gl, programInfo.attribSetters || programInfo, bufferInfo.attribs, bufferInfo.indices);
      }

      exports.createVertexArrayInfo = createVertexArrayInfo;
      exports.createVAOAndSetAttributes = createVAOAndSetAttributes;
      exports.createVAOFromBufferInfo = createVAOFromBufferInfo;

      /***/
    },
    /* 12 */
    /***/function (module, exports, __webpack_require__) {

      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.duplicateVertices = exports.concatVertices = exports.reorientVertices = exports.reorientPositions = exports.reorientNormals = exports.reorientDirections = exports.makeRandomVertexColors = exports.flattenNormals = exports.deindexVertices = exports.createDiscVertices = exports.createDiscBuffers = exports.createDiscBufferInfo = exports.createTorusVertices = exports.createTorusBuffers = exports.createTorusBufferInfo = exports.createCylinderVertices = exports.createCylinderBuffers = exports.createCylinderBufferInfo = exports.createCresentVertices = exports.createCresentBuffers = exports.createCresentBufferInfo = exports.createXYQuadVertices = exports.createXYQuadBuffers = exports.createXYQuadBufferInfo = exports.createTruncatedConeVertices = exports.createTruncatedConeBuffers = exports.createTruncatedConeBufferInfo = exports.createSphereVertices = exports.createSphereBuffers = exports.createSphereBufferInfo = exports.createPlaneVertices = exports.createPlaneBuffers = exports.createPlaneBufferInfo = exports.createCubeVertices = exports.createCubeBuffers = exports.createCubeBufferInfo = exports.createAugmentedTypedArray = exports.create3DFVertices = exports.create3DFBuffers = exports.create3DFBufferInfo = undefined;

      var _attributes = __webpack_require__(4);

      var attributes = _interopRequireWildcard(_attributes);

      var _utils = __webpack_require__(0);

      var utils = _interopRequireWildcard(_utils);

      var _typedarrays = __webpack_require__(1);

      var typedArrays = _interopRequireWildcard(_typedarrays);

      var _m = __webpack_require__(6);

      var m4 = _interopRequireWildcard(_m);

      var _v = __webpack_require__(3);

      var v3 = _interopRequireWildcard(_v);

      function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};if (obj != null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }newObj.default = obj;return newObj;
        }
      }

      var getArray = attributes.getArray_; // eslint-disable-line
      /*
       * Copyright 2015, Gregg Tavares.
       * All rights reserved.
       *
       * Redistribution and use in source and binary forms, with or without
       * modification, are permitted provided that the following conditions are
       * met:
       *
       *     * Redistributions of source code must retain the above copyright
       * notice, this list of conditions and the following disclaimer.
       *     * Redistributions in binary form must reproduce the above
       * copyright notice, this list of conditions and the following disclaimer
       * in the documentation and/or other materials provided with the
       * distribution.
       *     * Neither the name of Gregg Tavares. nor the names of his
       * contributors may be used to endorse or promote products derived from
       * this software without specific prior written permission.
       *
       * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
       * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
       * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
       * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
       * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
       * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
       * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
       * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
       * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
       * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
       * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
       */

      /**
       * Various functions to make simple primitives
       *
       * note: Most primitive functions come in 3 styles
       *
       * *  `createSomeShapeBufferInfo`
       *
       *    These functions are almost always the functions you want to call. They
       *    create vertices then make WebGLBuffers and create {@link module:twgl.AttribInfo}s
       *    returing a {@link module:twgl.BufferInfo} you can pass to {@link module:twgl.setBuffersAndAttributes}
       *    and {@link module:twgl.drawBufferInfo} etc...
       *
       * *  `createSomeShapeBuffers`
       *
       *    These create WebGLBuffers and put your data in them but nothing else.
       *    It's a shortcut to doing it yourself if you don't want to use
       *    the higher level functions.
       *
       * *  `createSomeShapeVertices`
       *
       *    These just create vertices, no buffers. This allows you to manipulate the vertices
       *    or add more data before generating a {@link module:twgl.BufferInfo}. Once you're finished
       *    manipulating the vertices call {@link module:twgl.createBufferInfoFromArrays}.
       *
       *    example:
       *
       *        const arrays = twgl.primitives.createPlaneArrays(1);
       *        twgl.primitives.reorientVertices(arrays, m4.rotationX(Math.PI * 0.5));
       *        const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
       *
       * @module twgl/primitives
       */
      var getNumComponents = attributes.getNumComponents_; // eslint-disable-line

      /**
       * Add `push` to a typed array. It just keeps a 'cursor'
       * and allows use to `push` values into the array so we
       * don't have to manually compute offsets
       * @param {TypedArray} typedArray TypedArray to augment
       * @param {number} numComponents number of components.
       */
      function augmentTypedArray(typedArray, numComponents) {
        var cursor = 0;
        typedArray.push = function () {
          for (var ii = 0; ii < arguments.length; ++ii) {
            var value = arguments[ii];
            if (value instanceof Array || typedArrays.isArrayBuffer(value)) {
              for (var jj = 0; jj < value.length; ++jj) {
                typedArray[cursor++] = value[jj];
              }
            } else {
              typedArray[cursor++] = value;
            }
          }
        };
        typedArray.reset = function (opt_index) {
          cursor = opt_index || 0;
        };
        typedArray.numComponents = numComponents;
        Object.defineProperty(typedArray, 'numElements', {
          get: function get() {
            return this.length / this.numComponents | 0;
          }
        });
        return typedArray;
      }

      /**
       * creates a typed array with a `push` function attached
       * so that you can easily *push* values.
       *
       * `push` can take multiple arguments. If an argument is an array each element
       * of the array will be added to the typed array.
       *
       * Example:
       *
       *     const array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
       *     array.push(1, 2, 3);
       *     array.push([4, 5, 6]);
       *     // array now contains [1, 2, 3, 4, 5, 6]
       *
       * Also has `numComponents` and `numElements` properties.
       *
       * @param {number} numComponents number of components
       * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
       * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
       * @return {ArrayBufferView} A typed array.
       * @memberOf module:twgl/primitives
       */
      function createAugmentedTypedArray(numComponents, numElements, opt_type) {
        var Type = opt_type || Float32Array;
        return augmentTypedArray(new Type(numComponents * numElements), numComponents);
      }

      function allButIndices(name) {
        return name !== "indices";
      }

      /**
       * Given indexed vertices creates a new set of vertices unindexed by expanding the indexed vertices.
       * @param {Object.<string, TypedArray>} vertices The indexed vertices to deindex
       * @return {Object.<string, TypedArray>} The deindexed vertices
       * @memberOf module:twgl/primitives
       */
      function deindexVertices(vertices) {
        var indices = vertices.indices;
        var newVertices = {};
        var numElements = indices.length;

        function expandToUnindexed(channel) {
          var srcBuffer = vertices[channel];
          var numComponents = srcBuffer.numComponents;
          var dstBuffer = createAugmentedTypedArray(numComponents, numElements, srcBuffer.constructor);
          for (var ii = 0; ii < numElements; ++ii) {
            var ndx = indices[ii];
            var offset = ndx * numComponents;
            for (var jj = 0; jj < numComponents; ++jj) {
              dstBuffer.push(srcBuffer[offset + jj]);
            }
          }
          newVertices[channel] = dstBuffer;
        }

        Object.keys(vertices).filter(allButIndices).forEach(expandToUnindexed);

        return newVertices;
      }

      /**
       * flattens the normals of deindexed vertices in place.
       * @param {Object.<string, TypedArray>} vertices The deindexed vertices who's normals to flatten
       * @return {Object.<string, TypedArray>} The flattened vertices (same as was passed in)
       * @memberOf module:twgl/primitives
       */
      function flattenNormals(vertices) {
        if (vertices.indices) {
          throw "can't flatten normals of indexed vertices. deindex them first";
        }

        var normals = vertices.normal;
        var numNormals = normals.length;
        for (var ii = 0; ii < numNormals; ii += 9) {
          // pull out the 3 normals for this triangle
          var nax = normals[ii + 0];
          var nay = normals[ii + 1];
          var naz = normals[ii + 2];

          var nbx = normals[ii + 3];
          var nby = normals[ii + 4];
          var nbz = normals[ii + 5];

          var ncx = normals[ii + 6];
          var ncy = normals[ii + 7];
          var ncz = normals[ii + 8];

          // add them
          var nx = nax + nbx + ncx;
          var ny = nay + nby + ncy;
          var nz = naz + nbz + ncz;

          // normalize them
          var length = Math.sqrt(nx * nx + ny * ny + nz * nz);

          nx /= length;
          ny /= length;
          nz /= length;

          // copy them back in
          normals[ii + 0] = nx;
          normals[ii + 1] = ny;
          normals[ii + 2] = nz;

          normals[ii + 3] = nx;
          normals[ii + 4] = ny;
          normals[ii + 5] = nz;

          normals[ii + 6] = nx;
          normals[ii + 7] = ny;
          normals[ii + 8] = nz;
        }

        return vertices;
      }

      function applyFuncToV3Array(array, matrix, fn) {
        var len = array.length;
        var tmp = new Float32Array(3);
        for (var ii = 0; ii < len; ii += 3) {
          fn(matrix, [array[ii], array[ii + 1], array[ii + 2]], tmp);
          array[ii] = tmp[0];
          array[ii + 1] = tmp[1];
          array[ii + 2] = tmp[2];
        }
      }

      function transformNormal(mi, v, dst) {
        dst = dst || v3.create();
        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];

        dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
        dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
        dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

        return dst;
      }

      /**
       * Reorients directions by the given matrix..
       * @param {number[]|TypedArray} array The array. Assumes value floats per element.
       * @param {Matrix} matrix A matrix to multiply by.
       * @return {number[]|TypedArray} the same array that was passed in
       * @memberOf module:twgl/primitives
       */
      function reorientDirections(array, matrix) {
        applyFuncToV3Array(array, matrix, m4.transformDirection);
        return array;
      }

      /**
       * Reorients normals by the inverse-transpose of the given
       * matrix..
       * @param {number[]|TypedArray} array The array. Assumes value floats per element.
       * @param {Matrix} matrix A matrix to multiply by.
       * @return {number[]|TypedArray} the same array that was passed in
       * @memberOf module:twgl/primitives
       */
      function reorientNormals(array, matrix) {
        applyFuncToV3Array(array, m4.inverse(matrix), transformNormal);
        return array;
      }

      /**
       * Reorients positions by the given matrix. In other words, it
       * multiplies each vertex by the given matrix.
       * @param {number[]|TypedArray} array The array. Assumes value floats per element.
       * @param {Matrix} matrix A matrix to multiply by.
       * @return {number[]|TypedArray} the same array that was passed in
       * @memberOf module:twgl/primitives
       */
      function reorientPositions(array, matrix) {
        applyFuncToV3Array(array, matrix, m4.transformPoint);
        return array;
      }

      /**
       * Reorients arrays by the given matrix. Assumes arrays have
       * names that contains 'pos' could be reoriented as positions,
       * 'binorm' or 'tan' as directions, and 'norm' as normals.
       *
       * @param {Object.<string, (number[]|TypedArray)>} arrays The vertices to reorient
       * @param {Matrix} matrix matrix to reorient by.
       * @return {Object.<string, (number[]|TypedArray)>} same arrays that were passed in.
       * @memberOf module:twgl/primitives
       */
      function reorientVertices(arrays, matrix) {
        Object.keys(arrays).forEach(function (name) {
          var array = arrays[name];
          if (name.indexOf("pos") >= 0) {
            reorientPositions(array, matrix);
          } else if (name.indexOf("tan") >= 0 || name.indexOf("binorm") >= 0) {
            reorientDirections(array, matrix);
          } else if (name.indexOf("norm") >= 0) {
            reorientNormals(array, matrix);
          }
        });
        return arrays;
      }

      /**
       * Creates XY quad BufferInfo
       *
       * The default with no parameters will return a 2x2 quad with values from -1 to +1.
       * If you want a unit quad with that goes from 0 to 1 you'd call it with
       *
       *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
       *
       * If you want a unit quad centered above 0,0 you'd call it with
       *
       *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
       * @param {number} [xOffset] the amount to offset the quad in X
       * @param {number} [yOffset] the amount to offset the quad in Y
       * @return {Object.<string, WebGLBuffer>} the created XY Quad BufferInfo
       * @memberOf module:twgl/primitives
       * @function createXYQuadBufferInfo
       */

      /**
       * Creates XY quad Buffers
       *
       * The default with no parameters will return a 2x2 quad with values from -1 to +1.
       * If you want a unit quad with that goes from 0 to 1 you'd call it with
       *
       *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
       *
       * If you want a unit quad centered above 0,0 you'd call it with
       *
       *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
       * @param {number} [xOffset] the amount to offset the quad in X
       * @param {number} [yOffset] the amount to offset the quad in Y
       * @return {module:twgl.BufferInfo} the created XY Quad buffers
       * @memberOf module:twgl/primitives
       * @function createXYQuadBuffers
       */

      /**
       * Creates XY quad vertices
       *
       * The default with no parameters will return a 2x2 quad with values from -1 to +1.
       * If you want a unit quad with that goes from 0 to 1 you'd call it with
       *
       *     twgl.primitives.createXYQuadVertices(1, 0.5, 0.5);
       *
       * If you want a unit quad centered above 0,0 you'd call it with
       *
       *     twgl.primitives.createXYQuadVertices(1, 0, 0.5);
       *
       * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
       * @param {number} [xOffset] the amount to offset the quad in X
       * @param {number} [yOffset] the amount to offset the quad in Y
       * @return {Object.<string, TypedArray> the created XY Quad vertices
       * @memberOf module:twgl/primitives
       */
      function createXYQuadVertices(size, xOffset, yOffset) {
        size = size || 2;
        xOffset = xOffset || 0;
        yOffset = yOffset || 0;
        size *= 0.5;
        return {
          position: {
            numComponents: 2,
            data: [xOffset + -1 * size, yOffset + -1 * size, xOffset + 1 * size, yOffset + -1 * size, xOffset + -1 * size, yOffset + 1 * size, xOffset + 1 * size, yOffset + 1 * size]
          },
          normal: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
          texcoord: [0, 0, 1, 0, 0, 1, 1, 1],
          indices: [0, 1, 2, 2, 1, 3]
        };
      }

      /**
       * Creates XZ plane BufferInfo.
       *
       * The created plane has position, normal, and texcoord data
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} [width] Width of the plane. Default = 1
       * @param {number} [depth] Depth of the plane. Default = 1
       * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
       * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
       * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
       * @return {@module:twgl.BufferInfo} The created plane BufferInfo.
       * @memberOf module:twgl/primitives
       * @function createPlaneBufferInfo
       */

      /**
       * Creates XZ plane buffers.
       *
       * The created plane has position, normal, and texcoord data
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} [width] Width of the plane. Default = 1
       * @param {number} [depth] Depth of the plane. Default = 1
       * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
       * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
       * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
       * @return {Object.<string, WebGLBuffer>} The created plane buffers.
       * @memberOf module:twgl/primitives
       * @function createPlaneBuffers
       */

      /**
       * Creates XZ plane vertices.
       *
       * The created plane has position, normal, and texcoord data
       *
       * @param {number} [width] Width of the plane. Default = 1
       * @param {number} [depth] Depth of the plane. Default = 1
       * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
       * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
       * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
       * @return {Object.<string, TypedArray>} The created plane vertices.
       * @memberOf module:twgl/primitives
       */
      function createPlaneVertices(width, depth, subdivisionsWidth, subdivisionsDepth, matrix) {
        width = width || 1;
        depth = depth || 1;
        subdivisionsWidth = subdivisionsWidth || 1;
        subdivisionsDepth = subdivisionsDepth || 1;
        matrix = matrix || m4.identity();

        var numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
        var positions = createAugmentedTypedArray(3, numVertices);
        var normals = createAugmentedTypedArray(3, numVertices);
        var texcoords = createAugmentedTypedArray(2, numVertices);

        for (var z = 0; z <= subdivisionsDepth; z++) {
          for (var x = 0; x <= subdivisionsWidth; x++) {
            var u = x / subdivisionsWidth;
            var v = z / subdivisionsDepth;
            positions.push(width * u - width * 0.5, 0, depth * v - depth * 0.5);
            normals.push(0, 1, 0);
            texcoords.push(u, v);
          }
        }

        var numVertsAcross = subdivisionsWidth + 1;
        var indices = createAugmentedTypedArray(3, subdivisionsWidth * subdivisionsDepth * 2, Uint16Array);

        for (var _z = 0; _z < subdivisionsDepth; _z++) {
          // eslint-disable-line
          for (var _x = 0; _x < subdivisionsWidth; _x++) {
            // eslint-disable-line
            // Make triangle 1 of quad.
            indices.push((_z + 0) * numVertsAcross + _x, (_z + 1) * numVertsAcross + _x, (_z + 0) * numVertsAcross + _x + 1);

            // Make triangle 2 of quad.
            indices.push((_z + 1) * numVertsAcross + _x, (_z + 1) * numVertsAcross + _x + 1, (_z + 0) * numVertsAcross + _x + 1);
          }
        }

        var arrays = reorientVertices({
          position: positions,
          normal: normals,
          texcoord: texcoords,
          indices: indices
        }, matrix);
        return arrays;
      }

      /**
       * Creates sphere BufferInfo.
       *
       * The created sphere has position, normal, and texcoord data
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} radius radius of the sphere.
       * @param {number} subdivisionsAxis number of steps around the sphere.
       * @param {number} subdivisionsHeight number of vertically on the sphere.
       * @param {number} [opt_startLatitudeInRadians] where to start the
       *     top of the sphere. Default = 0.
       * @param {number} [opt_endLatitudeInRadians] Where to end the
       *     bottom of the sphere. Default = Math.PI.
       * @param {number} [opt_startLongitudeInRadians] where to start
       *     wrapping the sphere. Default = 0.
       * @param {number} [opt_endLongitudeInRadians] where to end
       *     wrapping the sphere. Default = 2 * Math.PI.
       * @return {module:twgl.BufferInfo} The created sphere BufferInfo.
       * @memberOf module:twgl/primitives
       * @function createSphereBufferInfo
       */

      /**
       * Creates sphere buffers.
       *
       * The created sphere has position, normal, and texcoord data
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} radius radius of the sphere.
       * @param {number} subdivisionsAxis number of steps around the sphere.
       * @param {number} subdivisionsHeight number of vertically on the sphere.
       * @param {number} [opt_startLatitudeInRadians] where to start the
       *     top of the sphere. Default = 0.
       * @param {number} [opt_endLatitudeInRadians] Where to end the
       *     bottom of the sphere. Default = Math.PI.
       * @param {number} [opt_startLongitudeInRadians] where to start
       *     wrapping the sphere. Default = 0.
       * @param {number} [opt_endLongitudeInRadians] where to end
       *     wrapping the sphere. Default = 2 * Math.PI.
       * @return {Object.<string, WebGLBuffer>} The created sphere buffers.
       * @memberOf module:twgl/primitives
       * @function createSphereBuffers
       */

      /**
       * Creates sphere vertices.
       *
       * The created sphere has position, normal, and texcoord data
       *
       * @param {number} radius radius of the sphere.
       * @param {number} subdivisionsAxis number of steps around the sphere.
       * @param {number} subdivisionsHeight number of vertically on the sphere.
       * @param {number} [opt_startLatitudeInRadians] where to start the
       *     top of the sphere. Default = 0.
       * @param {number} [opt_endLatitudeInRadians] Where to end the
       *     bottom of the sphere. Default = Math.PI.
       * @param {number} [opt_startLongitudeInRadians] where to start
       *     wrapping the sphere. Default = 0.
       * @param {number} [opt_endLongitudeInRadians] where to end
       *     wrapping the sphere. Default = 2 * Math.PI.
       * @return {Object.<string, TypedArray>} The created sphere vertices.
       * @memberOf module:twgl/primitives
       */
      function createSphereVertices(radius, subdivisionsAxis, subdivisionsHeight, opt_startLatitudeInRadians, opt_endLatitudeInRadians, opt_startLongitudeInRadians, opt_endLongitudeInRadians) {
        if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
          throw Error('subdivisionAxis and subdivisionHeight must be > 0');
        }

        opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
        opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
        opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
        opt_endLongitudeInRadians = opt_endLongitudeInRadians || Math.PI * 2;

        var latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
        var longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

        // We are going to generate our sphere by iterating through its
        // spherical coordinates and generating 2 triangles for each quad on a
        // ring of the sphere.
        var numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
        var positions = createAugmentedTypedArray(3, numVertices);
        var normals = createAugmentedTypedArray(3, numVertices);
        var texcoords = createAugmentedTypedArray(2, numVertices);

        // Generate the individual vertices in our vertex buffer.
        for (var y = 0; y <= subdivisionsHeight; y++) {
          for (var x = 0; x <= subdivisionsAxis; x++) {
            // Generate a vertex based on its spherical coordinates
            var u = x / subdivisionsAxis;
            var v = y / subdivisionsHeight;
            var theta = longRange * u;
            var phi = latRange * v;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var ux = cosTheta * sinPhi;
            var uy = cosPhi;
            var uz = sinTheta * sinPhi;
            positions.push(radius * ux, radius * uy, radius * uz);
            normals.push(ux, uy, uz);
            texcoords.push(1 - u, v);
          }
        }

        var numVertsAround = subdivisionsAxis + 1;
        var indices = createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
        for (var _x2 = 0; _x2 < subdivisionsAxis; _x2++) {
          // eslint-disable-line
          for (var _y = 0; _y < subdivisionsHeight; _y++) {
            // eslint-disable-line
            // Make triangle 1 of quad.
            indices.push((_y + 0) * numVertsAround + _x2, (_y + 0) * numVertsAround + _x2 + 1, (_y + 1) * numVertsAround + _x2);

            // Make triangle 2 of quad.
            indices.push((_y + 1) * numVertsAround + _x2, (_y + 0) * numVertsAround + _x2 + 1, (_y + 1) * numVertsAround + _x2 + 1);
          }
        }

        return {
          position: positions,
          normal: normals,
          texcoord: texcoords,
          indices: indices
        };
      }

      /**
       * Array of the indices of corners of each face of a cube.
       * @type {Array.<number[]>}
       */
      var CUBE_FACE_INDICES = [[3, 7, 5, 1], // right
      [6, 2, 0, 4], // left
      [6, 7, 3, 2], // ??
      [0, 1, 5, 4], // ??
      [7, 6, 4, 5], // front
      [2, 3, 1, 0]];

      /**
       * Creates a BufferInfo for a cube.
       *
       * The cube is created around the origin. (-size / 2, size / 2).
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} [size] width, height and depth of the cube.
       * @return {module:twgl.BufferInfo} The created BufferInfo.
       * @memberOf module:twgl/primitives
       * @function createCubeBufferInfo
       */

      /**
       * Creates the buffers and indices for a cube.
       *
       * The cube is created around the origin. (-size / 2, size / 2).
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} [size] width, height and depth of the cube.
       * @return {Object.<string, WebGLBuffer>} The created buffers.
       * @memberOf module:twgl/primitives
       * @function createCubeBuffers
       */

      /**
       * Creates the vertices and indices for a cube.
       *
       * The cube is created around the origin. (-size / 2, size / 2).
       *
       * @param {number} [size] width, height and depth of the cube.
       * @return {Object.<string, TypedArray>} The created vertices.
       * @memberOf module:twgl/primitives
       */
      function createCubeVertices(size) {
        size = size || 1;
        var k = size / 2;

        var cornerVertices = [[-k, -k, -k], [+k, -k, -k], [-k, +k, -k], [+k, +k, -k], [-k, -k, +k], [+k, -k, +k], [-k, +k, +k], [+k, +k, +k]];

        var faceNormals = [[+1, +0, +0], [-1, +0, +0], [+0, +1, +0], [+0, -1, +0], [+0, +0, +1], [+0, +0, -1]];

        var uvCoords = [[1, 0], [0, 0], [0, 1], [1, 1]];

        var numVertices = 6 * 4;
        var positions = createAugmentedTypedArray(3, numVertices);
        var normals = createAugmentedTypedArray(3, numVertices);
        var texcoords = createAugmentedTypedArray(2, numVertices);
        var indices = createAugmentedTypedArray(3, 6 * 2, Uint16Array);

        for (var f = 0; f < 6; ++f) {
          var faceIndices = CUBE_FACE_INDICES[f];
          for (var v = 0; v < 4; ++v) {
            var position = cornerVertices[faceIndices[v]];
            var normal = faceNormals[f];
            var uv = uvCoords[v];

            // Each face needs all four vertices because the normals and texture
            // coordinates are not all the same.
            positions.push(position);
            normals.push(normal);
            texcoords.push(uv);
          }
          // Two triangles make a square face.
          var offset = 4 * f;
          indices.push(offset + 0, offset + 1, offset + 2);
          indices.push(offset + 0, offset + 2, offset + 3);
        }

        return {
          position: positions,
          normal: normals,
          texcoord: texcoords,
          indices: indices
        };
      }

      /**
       * Creates a BufferInfo for a truncated cone, which is like a cylinder
       * except that it has different top and bottom radii. A truncated cone
       * can also be used to create cylinders and regular cones. The
       * truncated cone will be created centered about the origin, with the
       * y axis as its vertical axis.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} bottomRadius Bottom radius of truncated cone.
       * @param {number} topRadius Top radius of truncated cone.
       * @param {number} height Height of truncated cone.
       * @param {number} radialSubdivisions The number of subdivisions around the
       *     truncated cone.
       * @param {number} verticalSubdivisions The number of subdivisions down the
       *     truncated cone.
       * @param {boolean} [opt_topCap] Create top cap. Default = true.
       * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
       * @return {module:twgl.BufferInfo} The created cone BufferInfo.
       * @memberOf module:twgl/primitives
       * @function createTruncatedConeBufferInfo
       */

      /**
       * Creates buffers for a truncated cone, which is like a cylinder
       * except that it has different top and bottom radii. A truncated cone
       * can also be used to create cylinders and regular cones. The
       * truncated cone will be created centered about the origin, with the
       * y axis as its vertical axis.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} bottomRadius Bottom radius of truncated cone.
       * @param {number} topRadius Top radius of truncated cone.
       * @param {number} height Height of truncated cone.
       * @param {number} radialSubdivisions The number of subdivisions around the
       *     truncated cone.
       * @param {number} verticalSubdivisions The number of subdivisions down the
       *     truncated cone.
       * @param {boolean} [opt_topCap] Create top cap. Default = true.
       * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
       * @return {Object.<string, WebGLBuffer>} The created cone buffers.
       * @memberOf module:twgl/primitives
       * @function createTruncatedConeBuffers
       */

      /**
       * Creates vertices for a truncated cone, which is like a cylinder
       * except that it has different top and bottom radii. A truncated cone
       * can also be used to create cylinders and regular cones. The
       * truncated cone will be created centered about the origin, with the
       * y axis as its vertical axis. .
       *
       * @param {number} bottomRadius Bottom radius of truncated cone.
       * @param {number} topRadius Top radius of truncated cone.
       * @param {number} height Height of truncated cone.
       * @param {number} radialSubdivisions The number of subdivisions around the
       *     truncated cone.
       * @param {number} verticalSubdivisions The number of subdivisions down the
       *     truncated cone.
       * @param {boolean} [opt_topCap] Create top cap. Default = true.
       * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
       * @return {Object.<string, TypedArray>} The created cone vertices.
       * @memberOf module:twgl/primitives
       */
      function createTruncatedConeVertices(bottomRadius, topRadius, height, radialSubdivisions, verticalSubdivisions, opt_topCap, opt_bottomCap) {
        if (radialSubdivisions < 3) {
          throw Error('radialSubdivisions must be 3 or greater');
        }

        if (verticalSubdivisions < 1) {
          throw Error('verticalSubdivisions must be 1 or greater');
        }

        var topCap = opt_topCap === undefined ? true : opt_topCap;
        var bottomCap = opt_bottomCap === undefined ? true : opt_bottomCap;

        var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

        var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
        var positions = createAugmentedTypedArray(3, numVertices);
        var normals = createAugmentedTypedArray(3, numVertices);
        var texcoords = createAugmentedTypedArray(2, numVertices);
        var indices = createAugmentedTypedArray(3, radialSubdivisions * (verticalSubdivisions + extra) * 2, Uint16Array);

        var vertsAroundEdge = radialSubdivisions + 1;

        // The slant of the cone is constant across its surface
        var slant = Math.atan2(bottomRadius - topRadius, height);
        var cosSlant = Math.cos(slant);
        var sinSlant = Math.sin(slant);

        var start = topCap ? -2 : 0;
        var end = verticalSubdivisions + (bottomCap ? 2 : 0);

        for (var yy = start; yy <= end; ++yy) {
          var v = yy / verticalSubdivisions;
          var y = height * v;
          var ringRadius = void 0;
          if (yy < 0) {
            y = 0;
            v = 1;
            ringRadius = bottomRadius;
          } else if (yy > verticalSubdivisions) {
            y = height;
            v = 1;
            ringRadius = topRadius;
          } else {
            ringRadius = bottomRadius + (topRadius - bottomRadius) * (yy / verticalSubdivisions);
          }
          if (yy === -2 || yy === verticalSubdivisions + 2) {
            ringRadius = 0;
            v = 0;
          }
          y -= height / 2;
          for (var ii = 0; ii < vertsAroundEdge; ++ii) {
            var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
            var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
            positions.push(sin * ringRadius, y, cos * ringRadius);
            normals.push(yy < 0 || yy > verticalSubdivisions ? 0 : sin * cosSlant, yy < 0 ? -1 : yy > verticalSubdivisions ? 1 : sinSlant, yy < 0 || yy > verticalSubdivisions ? 0 : cos * cosSlant);
            texcoords.push(ii / radialSubdivisions, 1 - v);
          }
        }

        for (var _yy = 0; _yy < verticalSubdivisions + extra; ++_yy) {
          // eslint-disable-line
          for (var _ii = 0; _ii < radialSubdivisions; ++_ii) {
            // eslint-disable-line
            indices.push(vertsAroundEdge * (_yy + 0) + 0 + _ii, vertsAroundEdge * (_yy + 0) + 1 + _ii, vertsAroundEdge * (_yy + 1) + 1 + _ii);
            indices.push(vertsAroundEdge * (_yy + 0) + 0 + _ii, vertsAroundEdge * (_yy + 1) + 1 + _ii, vertsAroundEdge * (_yy + 1) + 0 + _ii);
          }
        }

        return {
          position: positions,
          normal: normals,
          texcoord: texcoords,
          indices: indices
        };
      }

      /**
       * Expands RLE data
       * @param {number[]} rleData data in format of run-length, x, y, z, run-length, x, y, z
       * @param {number[]} [padding] value to add each entry with.
       * @return {number[]} the expanded rleData
       */
      function expandRLEData(rleData, padding) {
        padding = padding || [];
        var data = [];
        for (var ii = 0; ii < rleData.length; ii += 4) {
          var runLength = rleData[ii];
          var element = rleData.slice(ii + 1, ii + 4);
          element.push.apply(element, padding);
          for (var jj = 0; jj < runLength; ++jj) {
            data.push.apply(data, element);
          }
        }
        return data;
      }

      /**
       * Creates 3D 'F' BufferInfo.
       * An 'F' is useful because you can easily tell which way it is oriented.
       * The created 'F' has position, normal, texcoord, and color buffers.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @return {module:twgl.BufferInfo} The created BufferInfo.
       * @memberOf module:twgl/primitives
       * @function create3DFBufferInfo
       */

      /**
       * Creates 3D 'F' buffers.
       * An 'F' is useful because you can easily tell which way it is oriented.
       * The created 'F' has position, normal, texcoord, and color buffers.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @return {Object.<string, WebGLBuffer>} The created buffers.
       * @memberOf module:twgl/primitives
       * @function create3DFBuffers
       */

      /**
       * Creates 3D 'F' vertices.
       * An 'F' is useful because you can easily tell which way it is oriented.
       * The created 'F' has position, normal, texcoord, and color arrays.
       *
       * @return {Object.<string, TypedArray>} The created vertices.
       * @memberOf module:twgl/primitives
       */
      function create3DFVertices() {

        var positions = [
        // left column front
        0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

        // top rung front
        30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

        // middle rung front
        30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

        // left column back
        0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

        // top rung back
        30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

        // middle rung back
        30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

        // top
        0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

        // top rung front
        100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

        // under top rung
        30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

        // between top rung and middle
        30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

        // top of middle rung
        30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

        // front of middle rung
        67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

        // bottom of middle rung.
        30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

        // front of bottom
        30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

        // bottom
        0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

        // left side
        0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0];

        var texcoords = [
        // left column front
        0.22, 0.19, 0.22, 0.79, 0.34, 0.19, 0.22, 0.79, 0.34, 0.79, 0.34, 0.19,

        // top rung front
        0.34, 0.19, 0.34, 0.31, 0.62, 0.19, 0.34, 0.31, 0.62, 0.31, 0.62, 0.19,

        // middle rung front
        0.34, 0.43, 0.34, 0.55, 0.49, 0.43, 0.34, 0.55, 0.49, 0.55, 0.49, 0.43,

        // left column back
        0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

        // top rung back
        0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

        // middle rung back
        0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,

        // top
        0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

        // top rung front
        0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

        // under top rung
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

        // between top rung and middle
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

        // top of middle rung
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

        // front of middle rung
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

        // bottom of middle rung.
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

        // front of bottom
        0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

        // bottom
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

        // left side
        0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0];

        var normals = expandRLEData([
        // left column front
        // top rung front
        // middle rung front
        18, 0, 0, 1,

        // left column back
        // top rung back
        // middle rung back
        18, 0, 0, -1,

        // top
        6, 0, 1, 0,

        // top rung front
        6, 1, 0, 0,

        // under top rung
        6, 0, -1, 0,

        // between top rung and middle
        6, 1, 0, 0,

        // top of middle rung
        6, 0, 1, 0,

        // front of middle rung
        6, 1, 0, 0,

        // bottom of middle rung.
        6, 0, -1, 0,

        // front of bottom
        6, 1, 0, 0,

        // bottom
        6, 0, -1, 0,

        // left side
        6, -1, 0, 0]);

        var colors = expandRLEData([
        // left column front
        // top rung front
        // middle rung front
        18, 200, 70, 120,

        // left column back
        // top rung back
        // middle rung back
        18, 80, 70, 200,

        // top
        6, 70, 200, 210,

        // top rung front
        6, 200, 200, 70,

        // under top rung
        6, 210, 100, 70,

        // between top rung and middle
        6, 210, 160, 70,

        // top of middle rung
        6, 70, 180, 210,

        // front of middle rung
        6, 100, 70, 210,

        // bottom of middle rung.
        6, 76, 210, 100,

        // front of bottom
        6, 140, 210, 80,

        // bottom
        6, 90, 130, 110,

        // left side
        6, 160, 160, 220], [255]);

        var numVerts = positions.length / 3;

        var arrays = {
          position: createAugmentedTypedArray(3, numVerts),
          texcoord: createAugmentedTypedArray(2, numVerts),
          normal: createAugmentedTypedArray(3, numVerts),
          color: createAugmentedTypedArray(4, numVerts, Uint8Array),
          indices: createAugmentedTypedArray(3, numVerts / 3, Uint16Array)
        };

        arrays.position.push(positions);
        arrays.texcoord.push(texcoords);
        arrays.normal.push(normals);
        arrays.color.push(colors);

        for (var ii = 0; ii < numVerts; ++ii) {
          arrays.indices.push(ii);
        }

        return arrays;
      }

      /**
       * Creates cresent BufferInfo.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} verticalRadius The vertical radius of the cresent.
       * @param {number} outerRadius The outer radius of the cresent.
       * @param {number} innerRadius The inner radius of the cresent.
       * @param {number} thickness The thickness of the cresent.
       * @param {number} subdivisionsDown number of steps around the cresent.
       * @param {number} subdivisionsThick number of vertically on the cresent.
       * @param {number} [startOffset] Where to start arc. Default 0.
       * @param {number} [endOffset] Where to end arg. Default 1.
       * @return {module:twgl.BufferInfo} The created BufferInfo.
       * @memberOf module:twgl/primitives
       * @function createCresentBufferInfo
       */

      /**
       * Creates cresent buffers.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} verticalRadius The vertical radius of the cresent.
       * @param {number} outerRadius The outer radius of the cresent.
       * @param {number} innerRadius The inner radius of the cresent.
       * @param {number} thickness The thickness of the cresent.
       * @param {number} subdivisionsDown number of steps around the cresent.
       * @param {number} subdivisionsThick number of vertically on the cresent.
       * @param {number} [startOffset] Where to start arc. Default 0.
       * @param {number} [endOffset] Where to end arg. Default 1.
       * @return {Object.<string, WebGLBuffer>} The created buffers.
       * @memberOf module:twgl/primitives
       * @function createCresentBuffers
       */

      /**
       * Creates cresent vertices.
       *
       * @param {number} verticalRadius The vertical radius of the cresent.
       * @param {number} outerRadius The outer radius of the cresent.
       * @param {number} innerRadius The inner radius of the cresent.
       * @param {number} thickness The thickness of the cresent.
       * @param {number} subdivisionsDown number of steps around the cresent.
       * @param {number} subdivisionsThick number of vertically on the cresent.
       * @param {number} [startOffset] Where to start arc. Default 0.
       * @param {number} [endOffset] Where to end arg. Default 1.
       * @return {Object.<string, TypedArray>} The created vertices.
       * @memberOf module:twgl/primitives
       */
      function createCresentVertices(verticalRadius, outerRadius, innerRadius, thickness, subdivisionsDown, startOffset, endOffset) {
        if (subdivisionsDown <= 0) {
          throw Error('subdivisionDown must be > 0');
        }

        startOffset = startOffset || 0;
        endOffset = endOffset || 1;

        var subdivisionsThick = 2;

        var offsetRange = endOffset - startOffset;
        var numVertices = (subdivisionsDown + 1) * 2 * (2 + subdivisionsThick);
        var positions = createAugmentedTypedArray(3, numVertices);
        var normals = createAugmentedTypedArray(3, numVertices);
        var texcoords = createAugmentedTypedArray(2, numVertices);

        function lerp(a, b, s) {
          return a + (b - a) * s;
        }

        function createArc(arcRadius, x, normalMult, normalAdd, uMult, uAdd) {
          for (var z = 0; z <= subdivisionsDown; z++) {
            var uBack = x / (subdivisionsThick - 1);
            var v = z / subdivisionsDown;
            var xBack = (uBack - 0.5) * 2;
            var angle = (startOffset + v * offsetRange) * Math.PI;
            var s = Math.sin(angle);
            var c = Math.cos(angle);
            var radius = lerp(verticalRadius, arcRadius, s);
            var px = xBack * thickness;
            var py = c * verticalRadius;
            var pz = s * radius;
            positions.push(px, py, pz);
            var n = v3.add(v3.multiply([0, s, c], normalMult), normalAdd);
            normals.push(n);
            texcoords.push(uBack * uMult + uAdd, v);
          }
        }

        // Generate the individual vertices in our vertex buffer.
        for (var x = 0; x < subdivisionsThick; x++) {
          var uBack = (x / (subdivisionsThick - 1) - 0.5) * 2;
          createArc(outerRadius, x, [1, 1, 1], [0, 0, 0], 1, 0);
          createArc(outerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 0);
          createArc(innerRadius, x, [1, 1, 1], [0, 0, 0], 1, 0);
          createArc(innerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 1);
        }

        // Do outer surface.
        var indices = createAugmentedTypedArray(3, subdivisionsDown * 2 * (2 + subdivisionsThick), Uint16Array);

        function createSurface(leftArcOffset, rightArcOffset) {
          for (var z = 0; z < subdivisionsDown; ++z) {
            // Make triangle 1 of quad.
            indices.push(leftArcOffset + z + 0, leftArcOffset + z + 1, rightArcOffset + z + 0);

            // Make triangle 2 of quad.
            indices.push(leftArcOffset + z + 1, rightArcOffset + z + 1, rightArcOffset + z + 0);
          }
        }

        var numVerticesDown = subdivisionsDown + 1;
        // front
        createSurface(numVerticesDown * 0, numVerticesDown * 4);
        // right
        createSurface(numVerticesDown * 5, numVerticesDown * 7);
        // back
        createSurface(numVerticesDown * 6, numVerticesDown * 2);
        // left
        createSurface(numVerticesDown * 3, numVerticesDown * 1);

        return {
          position: positions,
          normal: normals,
          texcoord: texcoords,
          indices: indices
        };
      }

      /**
       * Creates cylinder BufferInfo. The cylinder will be created around the origin
       * along the y-axis.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} radius Radius of cylinder.
       * @param {number} height Height of cylinder.
       * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
       * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
       * @param {boolean} [topCap] Create top cap. Default = true.
       * @param {boolean} [bottomCap] Create bottom cap. Default = true.
       * @return {module:twgl.BufferInfo} The created BufferInfo.
       * @memberOf module:twgl/primitives
       * @function createCylinderBufferInfo
       */

      /**
       * Creates cylinder buffers. The cylinder will be created around the origin
       * along the y-axis.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} radius Radius of cylinder.
       * @param {number} height Height of cylinder.
       * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
       * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
       * @param {boolean} [topCap] Create top cap. Default = true.
       * @param {boolean} [bottomCap] Create bottom cap. Default = true.
       * @return {Object.<string, WebGLBuffer>} The created buffers.
       * @memberOf module:twgl/primitives
       * @function createCylinderBuffers
       */

      /**
       * Creates cylinder vertices. The cylinder will be created around the origin
       * along the y-axis.
       *
       * @param {number} radius Radius of cylinder.
       * @param {number} height Height of cylinder.
       * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
       * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
       * @param {boolean} [topCap] Create top cap. Default = true.
       * @param {boolean} [bottomCap] Create bottom cap. Default = true.
       * @return {Object.<string, TypedArray>} The created vertices.
       * @memberOf module:twgl/primitives
       */
      function createCylinderVertices(radius, height, radialSubdivisions, verticalSubdivisions, topCap, bottomCap) {
        return createTruncatedConeVertices(radius, radius, height, radialSubdivisions, verticalSubdivisions, topCap, bottomCap);
      }

      /**
       * Creates BufferInfo for a torus
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} radius radius of center of torus circle.
       * @param {number} thickness radius of torus ring.
       * @param {number} radialSubdivisions The number of subdivisions around the torus.
       * @param {number} bodySubdivisions The number of subdivisions around the body torus.
       * @param {boolean} [startAngle] start angle in radians. Default = 0.
       * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
       * @return {module:twgl.BufferInfo} The created BufferInfo.
       * @memberOf module:twgl/primitives
       * @function createTorusBufferInfo
       */

      /**
       * Creates buffers for a torus
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} radius radius of center of torus circle.
       * @param {number} thickness radius of torus ring.
       * @param {number} radialSubdivisions The number of subdivisions around the torus.
       * @param {number} bodySubdivisions The number of subdivisions around the body torus.
       * @param {boolean} [startAngle] start angle in radians. Default = 0.
       * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
       * @return {Object.<string, WebGLBuffer>} The created buffers.
       * @memberOf module:twgl/primitives
       * @function createTorusBuffers
       */

      /**
       * Creates vertices for a torus
       *
       * @param {number} radius radius of center of torus circle.
       * @param {number} thickness radius of torus ring.
       * @param {number} radialSubdivisions The number of subdivisions around the torus.
       * @param {number} bodySubdivisions The number of subdivisions around the body torus.
       * @param {boolean} [startAngle] start angle in radians. Default = 0.
       * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
       * @return {Object.<string, TypedArray>} The created vertices.
       * @memberOf module:twgl/primitives
       */
      function createTorusVertices(radius, thickness, radialSubdivisions, bodySubdivisions, startAngle, endAngle) {
        if (radialSubdivisions < 3) {
          throw Error('radialSubdivisions must be 3 or greater');
        }

        if (bodySubdivisions < 3) {
          throw Error('verticalSubdivisions must be 3 or greater');
        }

        startAngle = startAngle || 0;
        endAngle = endAngle || Math.PI * 2;
        var range = endAngle - startAngle;

        var radialParts = radialSubdivisions + 1;
        var bodyParts = bodySubdivisions + 1;
        var numVertices = radialParts * bodyParts;
        var positions = createAugmentedTypedArray(3, numVertices);
        var normals = createAugmentedTypedArray(3, numVertices);
        var texcoords = createAugmentedTypedArray(2, numVertices);
        var indices = createAugmentedTypedArray(3, radialSubdivisions * bodySubdivisions * 2, Uint16Array);

        for (var slice = 0; slice < bodyParts; ++slice) {
          var v = slice / bodySubdivisions;
          var sliceAngle = v * Math.PI * 2;
          var sliceSin = Math.sin(sliceAngle);
          var ringRadius = radius + sliceSin * thickness;
          var ny = Math.cos(sliceAngle);
          var y = ny * thickness;
          for (var ring = 0; ring < radialParts; ++ring) {
            var u = ring / radialSubdivisions;
            var ringAngle = startAngle + u * range;
            var xSin = Math.sin(ringAngle);
            var zCos = Math.cos(ringAngle);
            var x = xSin * ringRadius;
            var z = zCos * ringRadius;
            var nx = xSin * sliceSin;
            var nz = zCos * sliceSin;
            positions.push(x, y, z);
            normals.push(nx, ny, nz);
            texcoords.push(u, 1 - v);
          }
        }

        for (var _slice = 0; _slice < bodySubdivisions; ++_slice) {
          // eslint-disable-line
          for (var _ring = 0; _ring < radialSubdivisions; ++_ring) {
            // eslint-disable-line
            var nextRingIndex = 1 + _ring;
            var nextSliceIndex = 1 + _slice;
            indices.push(radialParts * _slice + _ring, radialParts * nextSliceIndex + _ring, radialParts * _slice + nextRingIndex);
            indices.push(radialParts * nextSliceIndex + _ring, radialParts * nextSliceIndex + nextRingIndex, radialParts * _slice + nextRingIndex);
          }
        }

        return {
          position: positions,
          normal: normals,
          texcoord: texcoords,
          indices: indices
        };
      }

      /**
       * Creates a disc BufferInfo. The disc will be in the xz plane, centered at
       * the origin. When creating, at least 3 divisions, or pie
       * pieces, need to be specified, otherwise the triangles making
       * up the disc will be degenerate. You can also specify the
       * number of radial pieces `stacks`. A value of 1 for
       * stacks will give you a simple disc of pie pieces.  If you
       * want to create an annulus you can set `innerRadius` to a
       * value > 0. Finally, `stackPower` allows you to have the widths
       * increase or decrease as you move away from the center. This
       * is particularly useful when using the disc as a ground plane
       * with a fixed camera such that you don't need the resolution
       * of small triangles near the perimeter. For example, a value
       * of 2 will produce stacks whose ouside radius increases with
       * the square of the stack index. A value of 1 will give uniform
       * stacks.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} radius Radius of the ground plane.
       * @param {number} divisions Number of triangles in the ground plane (at least 3).
       * @param {number} [stacks] Number of radial divisions (default=1).
       * @param {number} [innerRadius] Default 0.
       * @param {number} [stackPower] Power to raise stack size to for decreasing width.
       * @return {module:twgl.BufferInfo} The created BufferInfo.
       * @memberOf module:twgl/primitives
       * @function createDiscBufferInfo
       */

      /**
       * Creates disc buffers. The disc will be in the xz plane, centered at
       * the origin. When creating, at least 3 divisions, or pie
       * pieces, need to be specified, otherwise the triangles making
       * up the disc will be degenerate. You can also specify the
       * number of radial pieces `stacks`. A value of 1 for
       * stacks will give you a simple disc of pie pieces.  If you
       * want to create an annulus you can set `innerRadius` to a
       * value > 0. Finally, `stackPower` allows you to have the widths
       * increase or decrease as you move away from the center. This
       * is particularly useful when using the disc as a ground plane
       * with a fixed camera such that you don't need the resolution
       * of small triangles near the perimeter. For example, a value
       * of 2 will produce stacks whose ouside radius increases with
       * the square of the stack index. A value of 1 will give uniform
       * stacks.
       *
       * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
       * @param {number} radius Radius of the ground plane.
       * @param {number} divisions Number of triangles in the ground plane (at least 3).
       * @param {number} [stacks] Number of radial divisions (default=1).
       * @param {number} [innerRadius] Default 0.
       * @param {number} [stackPower] Power to raise stack size to for decreasing width.
       * @return {Object.<string, WebGLBuffer>} The created buffers.
       * @memberOf module:twgl/primitives
       * @function createDiscBuffers
       */

      /**
       * Creates disc vertices. The disc will be in the xz plane, centered at
       * the origin. When creating, at least 3 divisions, or pie
       * pieces, need to be specified, otherwise the triangles making
       * up the disc will be degenerate. You can also specify the
       * number of radial pieces `stacks`. A value of 1 for
       * stacks will give you a simple disc of pie pieces.  If you
       * want to create an annulus you can set `innerRadius` to a
       * value > 0. Finally, `stackPower` allows you to have the widths
       * increase or decrease as you move away from the center. This
       * is particularly useful when using the disc as a ground plane
       * with a fixed camera such that you don't need the resolution
       * of small triangles near the perimeter. For example, a value
       * of 2 will produce stacks whose ouside radius increases with
       * the square of the stack index. A value of 1 will give uniform
       * stacks.
       *
       * @param {number} radius Radius of the ground plane.
       * @param {number} divisions Number of triangles in the ground plane (at least 3).
       * @param {number} [stacks] Number of radial divisions (default=1).
       * @param {number} [innerRadius] Default 0.
       * @param {number} [stackPower] Power to raise stack size to for decreasing width.
       * @return {Object.<string, TypedArray>} The created vertices.
       * @memberOf module:twgl/primitives
       */
      function createDiscVertices(radius, divisions, stacks, innerRadius, stackPower) {
        if (divisions < 3) {
          throw Error('divisions must be at least 3');
        }

        stacks = stacks ? stacks : 1;
        stackPower = stackPower ? stackPower : 1;
        innerRadius = innerRadius ? innerRadius : 0;

        // Note: We don't share the center vertex because that would
        // mess up texture coordinates.
        var numVertices = (divisions + 1) * (stacks + 1);

        var positions = createAugmentedTypedArray(3, numVertices);
        var normals = createAugmentedTypedArray(3, numVertices);
        var texcoords = createAugmentedTypedArray(2, numVertices);
        var indices = createAugmentedTypedArray(3, stacks * divisions * 2, Uint16Array);

        var firstIndex = 0;
        var radiusSpan = radius - innerRadius;
        var pointsPerStack = divisions + 1;

        // Build the disk one stack at a time.
        for (var stack = 0; stack <= stacks; ++stack) {
          var stackRadius = innerRadius + radiusSpan * Math.pow(stack / stacks, stackPower);

          for (var i = 0; i <= divisions; ++i) {
            var theta = 2.0 * Math.PI * i / divisions;
            var x = stackRadius * Math.cos(theta);
            var z = stackRadius * Math.sin(theta);

            positions.push(x, 0, z);
            normals.push(0, 1, 0);
            texcoords.push(1 - i / divisions, stack / stacks);
            if (stack > 0 && i !== divisions) {
              // a, b, c and d are the indices of the vertices of a quad.  unless
              // the current stack is the one closest to the center, in which case
              // the vertices a and b connect to the center vertex.
              var a = firstIndex + (i + 1);
              var b = firstIndex + i;
              var c = firstIndex + i - pointsPerStack;
              var d = firstIndex + (i + 1) - pointsPerStack;

              // Make a quad of the vertices a, b, c, d.
              indices.push(a, b, c);
              indices.push(a, c, d);
            }
          }

          firstIndex += divisions + 1;
        }

        return {
          position: positions,
          normal: normals,
          texcoord: texcoords,
          indices: indices
        };
      }

      /**
       * creates a random integer between 0 and range - 1 inclusive.
       * @param {number} range
       * @return {number} random value between 0 and range - 1 inclusive.
       */
      function randInt(range) {
        return Math.random() * range | 0;
      }

      /**
       * Used to supply random colors
       * @callback RandomColorFunc
       * @param {number} ndx index of triangle/quad if unindexed or index of vertex if indexed
       * @param {number} channel 0 = red, 1 = green, 2 = blue, 3 = alpha
       * @return {number} a number from 0 to 255
       * @memberOf module:twgl/primitives
       */

      /**
       * @typedef {Object} RandomVerticesOptions
       * @property {number} [vertsPerColor] Defaults to 3 for non-indexed vertices
       * @property {module:twgl/primitives.RandomColorFunc} [rand] A function to generate random numbers
       * @memberOf module:twgl/primitives
       */

      /**
       * Creates an augmentedTypedArray of random vertex colors.
       * If the vertices are indexed (have an indices array) then will
       * just make random colors. Otherwise assumes they are triangles
       * and makes one random color for every 3 vertices.
       * @param {Object.<string, augmentedTypedArray>} vertices Vertices as returned from one of the createXXXVertices functions.
       * @param {module:twgl/primitives.RandomVerticesOptions} [options] options.
       * @return {Object.<string, augmentedTypedArray>} same vertices as passed in with `color` added.
       * @memberOf module:twgl/primitives
       */
      function makeRandomVertexColors(vertices, options) {
        options = options || {};
        var numElements = vertices.position.numElements;
        var vcolors = createAugmentedTypedArray(4, numElements, Uint8Array);
        var rand = options.rand || function (ndx, channel) {
          return channel < 3 ? randInt(256) : 255;
        };
        vertices.color = vcolors;
        if (vertices.indices) {
          // just make random colors if index
          for (var ii = 0; ii < numElements; ++ii) {
            vcolors.push(rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3));
          }
        } else {
          // make random colors per triangle
          var numVertsPerColor = options.vertsPerColor || 3;
          var numSets = numElements / numVertsPerColor;
          for (var _ii2 = 0; _ii2 < numSets; ++_ii2) {
            // eslint-disable-line
            var color = [rand(_ii2, 0), rand(_ii2, 1), rand(_ii2, 2), rand(_ii2, 3)];
            for (var jj = 0; jj < numVertsPerColor; ++jj) {
              vcolors.push(color);
            }
          }
        }
        return vertices;
      }

      /**
       * creates a function that calls fn to create vertices and then
       * creates a buffers for them
       */
      function createBufferFunc(fn) {
        return function (gl) {
          var arrays = fn.apply(this, Array.prototype.slice.call(arguments, 1));
          return attributes.createBuffersFromArrays(gl, arrays);
        };
      }

      /**
       * creates a function that calls fn to create vertices and then
       * creates a bufferInfo object for them
       */
      function createBufferInfoFunc(fn) {
        return function (gl) {
          var arrays = fn.apply(null, Array.prototype.slice.call(arguments, 1));
          return attributes.createBufferInfoFromArrays(gl, arrays);
        };
      }

      var arraySpecPropertyNames = ["numComponents", "size", "type", "normalize", "stride", "offset", "attrib", "name", "attribName"];

      /**
       * Copy elements from one array to another
       *
       * @param {Array|TypedArray} src source array
       * @param {Array|TypedArray} dst dest array
       * @param {number} dstNdx index in dest to copy src
       * @param {number} [offset] offset to add to copied values
       */
      function copyElements(src, dst, dstNdx, offset) {
        offset = offset || 0;
        var length = src.length;
        for (var ii = 0; ii < length; ++ii) {
          dst[dstNdx + ii] = src[ii] + offset;
        }
      }

      /**
       * Creates an array of the same time
       *
       * @param {(number[]|ArrayBufferView|module:twgl.FullArraySpec)} srcArray array who's type to copy
       * @param {number} length size of new array
       * @return {(number[]|ArrayBufferView|module:twgl.FullArraySpec)} array with same type as srcArray
       */
      function createArrayOfSameType(srcArray, length) {
        var arraySrc = getArray(srcArray);
        var newArray = new arraySrc.constructor(length);
        var newArraySpec = newArray;
        // If it appears to have been augmented make new one augemented
        if (arraySrc.numComponents && arraySrc.numElements) {
          augmentTypedArray(newArray, arraySrc.numComponents);
        }
        // If it was a fullspec make new one a fullspec
        if (srcArray.data) {
          newArraySpec = {
            data: newArray
          };
          utils.copyNamedProperties(arraySpecPropertyNames, srcArray, newArraySpec);
        }
        return newArraySpec;
      }

      /**
       * Concatinates sets of vertices
       *
       * Assumes the vertices match in composition. For example
       * if one set of vertices has positions, normals, and indices
       * all sets of vertices must have positions, normals, and indices
       * and of the same type.
       *
       * Example:
       *
       *      const cubeVertices = twgl.primtiives.createCubeVertices(2);
       *      const sphereVertices = twgl.primitives.createSphereVertices(1, 10, 10);
       *      // move the sphere 2 units up
       *      twgl.primitives.reorientVertices(
       *          sphereVertices, twgl.m4.translation([0, 2, 0]));
       *      // merge the sphere with the cube
       *      const cubeSphereVertices = twgl.primitives.concatVertices(
       *          [cubeVertices, sphereVertices]);
       *      // turn them into WebGL buffers and attrib data
       *      const bufferInfo = twgl.createBufferInfoFromArrays(gl, cubeSphereVertices);
       *
       * @param {module:twgl.Arrays[]} arrays Array of arrays of vertices
       * @return {module:twgl.Arrays} The concatinated vertices.
       * @memberOf module:twgl/primitives
       */
      function concatVertices(arrayOfArrays) {
        var names = {};
        var baseName = void 0;
        // get names of all arrays.
        // and numElements for each set of vertices

        var _loop = function _loop(ii) {
          var arrays = arrayOfArrays[ii];
          Object.keys(arrays).forEach(function (name) {
            // eslint-disable-line
            if (!names[name]) {
              names[name] = [];
            }
            if (!baseName && name !== 'indices') {
              baseName = name;
            }
            var arrayInfo = arrays[name];
            var numComponents = getNumComponents(arrayInfo, name);
            var array = getArray(arrayInfo);
            var numElements = array.length / numComponents;
            names[name].push(numElements);
          });
        };

        for (var ii = 0; ii < arrayOfArrays.length; ++ii) {
          _loop(ii);
        }

        // compute length of combined array
        // and return one for reference
        function getLengthOfCombinedArrays(name) {
          var length = 0;
          var arraySpec = void 0;
          for (var ii = 0; ii < arrayOfArrays.length; ++ii) {
            var _arrays = arrayOfArrays[ii];
            var arrayInfo = _arrays[name];
            var array = getArray(arrayInfo);
            length += array.length;
            if (!arraySpec || arrayInfo.data) {
              arraySpec = arrayInfo;
            }
          }
          return {
            length: length,
            spec: arraySpec
          };
        }

        function copyArraysToNewArray(name, base, newArray) {
          var baseIndex = 0;
          var offset = 0;
          for (var ii = 0; ii < arrayOfArrays.length; ++ii) {
            var _arrays2 = arrayOfArrays[ii];
            var arrayInfo = _arrays2[name];
            var array = getArray(arrayInfo);
            if (name === 'indices') {
              copyElements(array, newArray, offset, baseIndex);
              baseIndex += base[ii];
            } else {
              copyElements(array, newArray, offset);
            }
            offset += array.length;
          }
        }

        var base = names[baseName];

        var newArrays = {};
        Object.keys(names).forEach(function (name) {
          var info = getLengthOfCombinedArrays(name);
          var newArraySpec = createArrayOfSameType(info.spec, info.length);
          copyArraysToNewArray(name, base, getArray(newArraySpec));
          newArrays[name] = newArraySpec;
        });
        return newArrays;
      }

      /**
       * Creates a duplicate set of vertices
       *
       * This is useful for calling reorientVertices when you
       * also want to keep the original available
       *
       * @param {module:twgl.Arrays} arrays of vertices
       * @return {module:twgl.Arrays} The dupilicated vertices.
       * @memberOf module:twgl/primitives
       */
      function duplicateVertices(arrays) {
        var newArrays = {};
        Object.keys(arrays).forEach(function (name) {
          var arraySpec = arrays[name];
          var srcArray = getArray(arraySpec);
          var newArraySpec = createArrayOfSameType(arraySpec, srcArray.length);
          copyElements(srcArray, getArray(newArraySpec), 0);
          newArrays[name] = newArraySpec;
        });
        return newArrays;
      }

      var create3DFBufferInfo = createBufferInfoFunc(create3DFVertices);
      var create3DFBuffers = createBufferFunc(create3DFVertices);
      var createCubeBufferInfo = createBufferInfoFunc(createCubeVertices);
      var createCubeBuffers = createBufferFunc(createCubeVertices);
      var createPlaneBufferInfo = createBufferInfoFunc(createPlaneVertices);
      var createPlaneBuffers = createBufferFunc(createPlaneVertices);
      var createSphereBufferInfo = createBufferInfoFunc(createSphereVertices);
      var createSphereBuffers = createBufferFunc(createSphereVertices);
      var createTruncatedConeBufferInfo = createBufferInfoFunc(createTruncatedConeVertices);
      var createTruncatedConeBuffers = createBufferFunc(createTruncatedConeVertices);
      var createXYQuadBufferInfo = createBufferInfoFunc(createXYQuadVertices);
      var createXYQuadBuffers = createBufferFunc(createXYQuadVertices);
      var createCresentBufferInfo = createBufferInfoFunc(createCresentVertices);
      var createCresentBuffers = createBufferFunc(createCresentVertices);
      var createCylinderBufferInfo = createBufferInfoFunc(createCylinderVertices);
      var createCylinderBuffers = createBufferFunc(createCylinderVertices);
      var createTorusBufferInfo = createBufferInfoFunc(createTorusVertices);
      var createTorusBuffers = createBufferFunc(createTorusVertices);
      var createDiscBufferInfo = createBufferInfoFunc(createDiscVertices);
      var createDiscBuffers = createBufferFunc(createDiscVertices);

      exports.create3DFBufferInfo = create3DFBufferInfo;
      exports.create3DFBuffers = create3DFBuffers;
      exports.create3DFVertices = create3DFVertices;
      exports.createAugmentedTypedArray = createAugmentedTypedArray;
      exports.createCubeBufferInfo = createCubeBufferInfo;
      exports.createCubeBuffers = createCubeBuffers;
      exports.createCubeVertices = createCubeVertices;
      exports.createPlaneBufferInfo = createPlaneBufferInfo;
      exports.createPlaneBuffers = createPlaneBuffers;
      exports.createPlaneVertices = createPlaneVertices;
      exports.createSphereBufferInfo = createSphereBufferInfo;
      exports.createSphereBuffers = createSphereBuffers;
      exports.createSphereVertices = createSphereVertices;
      exports.createTruncatedConeBufferInfo = createTruncatedConeBufferInfo;
      exports.createTruncatedConeBuffers = createTruncatedConeBuffers;
      exports.createTruncatedConeVertices = createTruncatedConeVertices;
      exports.createXYQuadBufferInfo = createXYQuadBufferInfo;
      exports.createXYQuadBuffers = createXYQuadBuffers;
      exports.createXYQuadVertices = createXYQuadVertices;
      exports.createCresentBufferInfo = createCresentBufferInfo;
      exports.createCresentBuffers = createCresentBuffers;
      exports.createCresentVertices = createCresentVertices;
      exports.createCylinderBufferInfo = createCylinderBufferInfo;
      exports.createCylinderBuffers = createCylinderBuffers;
      exports.createCylinderVertices = createCylinderVertices;
      exports.createTorusBufferInfo = createTorusBufferInfo;
      exports.createTorusBuffers = createTorusBuffers;
      exports.createTorusVertices = createTorusVertices;
      exports.createDiscBufferInfo = createDiscBufferInfo;
      exports.createDiscBuffers = createDiscBuffers;
      exports.createDiscVertices = createDiscVertices;
      exports.deindexVertices = deindexVertices;
      exports.flattenNormals = flattenNormals;
      exports.makeRandomVertexColors = makeRandomVertexColors;
      exports.reorientDirections = reorientDirections;
      exports.reorientNormals = reorientNormals;
      exports.reorientPositions = reorientPositions;
      exports.reorientVertices = reorientVertices;
      exports.concatVertices = concatVertices;
      exports.duplicateVertices = duplicateVertices;

      /***/
    }]
    /******/)
  );
});

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {

  function Notifier(options) {
    var _timeout = options.timeout || 10;

    var _container = document.createElement("div");
    _container.className = "notifier";
    options.container.appendChild(_container);

    function removeMsg(div) {
      div.parentNode.removeChild(div);
    }

    this.add = function (options) {
      var msgDiv = document.createElement("div");
      if (options.html) {
        msgDiv.innerHTML = options.html;
      } else if (options.text) {
        msgDiv.appendChild(document.createTextNode(options.text));
      } else {
        throw "neither options.text nor options.html was set";
      }

      _container.insertBefore(msgDiv, _container.lastChild);
      var timeout = options.timeout || _timeout;
      if (timeout > 200) {
        throw "are you sure you want a timeout " + timeout + " seconds long?";
      }
      setTimeout(function () {
        removeMsg(msgDiv);
      }, timeout * 1000);

      return msgDiv;
    };
  }

  return Notifier;
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
  "use strict";

  var requestFullScreen = function (element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.mozRequestFullscreen) {
      element.mozRequestFullscreen();
    }
  };

  var noop = function () {};

  var cancelFullScreen = (document.exitFullscreen || document.exitFullScreen || document.msExitFullscreen || document.msExitFullScreen || document.webkitCancelFullscreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.mozCancelFullscreen || noop).bind(document);

  function isFullScreen() {
    var f = document.fullscreenElement || document.fullScreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.webkitIsFullScreen;
    return f !== undefined && f !== null && f !== false;
  }

  var onFullScreenChange = function (element, callback) {
    document.addEventListener('fullscreenchange', function () /*event*/{
      callback(isFullScreen());
    });
    element.addEventListener('webkitfullscreenchange', function () /*event*/{
      callback(isFullScreen());
    });
    document.addEventListener('mozfullscreenchange', function () /*event*/{
      callback(isFullScreen());
    });
  };

  function canGoFullScreen() {
    var body = window.document.body || {};
    var r = body.requestFullscreen || body.requestFullScreen || body.msRequestFullscreen || body.msRequestFullScreen || body.webkitRequestFullScreen || body.webkitRequestFullscreen || body.mozRequestFullScreen || body.mozRequestFullscreen;
    return r !== undefined && r !== null;
  }

  return {
    cancelFullScreen: cancelFullScreen,
    isFullScreen: isFullScreen,
    canGoFullScreen: canGoFullScreen,
    onFullScreenChange: onFullScreenChange,
    requestFullScreen: requestFullScreen
  };
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Misc IO functions
 * @module IO
 */
!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
  //var log = function() { };
  //var log = console.log.bind(console);

  /**
   * @typedef {Object} Request~Options
   * @memberOf module:IO
   * @property {number?} timeout. Timeout in ms to abort.
   *        Default = no-timeout
   * @property {string?} method default = POST.
   * @property {string?} inMimeType default = text/plain
   * @property {Object{key,value}} headers
   */

  /**
   * Make an http request request
   * @memberOf module:IO
   * @param {string} url url to request.
   * @param {string?} content to send.
   * @param {!function(error, string, xml)} callback Function to
   *        call on success or failure. If successful error will
   *        be null, object will be result from request.
   * @param {module:IO~Request~Options?} options
   */
  var request = function (url, content, callback, options) {
    content = content || "";
    options = options || {};
    const reqOptions = {
      method: options.method || 'POST',
      headers: {
        'Content-Type': options.mimeType || 'text/plain'
      }
    };

    if (options.headers) {
      Object.assign(reqOptions.headers, options.headers);
    }
    if (options.body) {
      reqOptions.body = options.body;
    }

    let resolve;
    let reject;
    const p = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    if (options.timeout) {
      setTimeout(() => reject('timeout'), options.timeout);
    }

    fetch(url, reqOptions).then(res => res.text()).then(resolve).catch(reject);

    p.then(data => callback(null, data)).catch(err => callback(err));
  };

  /**
   * sends a JSON 'POST' request, returns JSON repsonse
   * @memberOf module:IO
   * @param {string} url url to POST to.
   * @param {Object=} jsonObject JavaScript object on which to
   *        call JSON.stringify.
   * @param {!function(error, object)} callback Function to call
   *        on success or failure. If successful error will be
   *        null, object will be json result from request.
   * @param {module:IO~Request~Options?} options
   */
  var sendJSON = function (url, jsonObject, callback, options) {
    options = JSON.parse(JSON.stringify(options || {}));
    options.headers = options.headers || {};
    options.headers["Content-type"] = "application/json";
    return request(url, JSON.stringify(jsonObject), function (err, content) {
      if (err) {
        return callback(err);
      }
      try {
        var json = JSON.parse(content);
      } catch (e) {
        return callback(e);
      }
      return callback(null, json);
    }, options);
  };

  var makeMethodFunc = function (method) {
    return function (url, content, callback, options) {
      options = JSON.parse(JSON.stringify(options || {}));
      options.method = method;
      return request(url, content, callback, options);
    };
  };

  return {
    get: makeMethodFunc("GET"),
    post: makeMethodFunc("POST"),
    "delete": makeMethodFunc("DELETE"),
    put: makeMethodFunc("PUT"),
    request: request,
    sendJSON: sendJSON
  };
}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
  function getMods(e) {
    return '' + ( // this must be in alphabetical order
    e.altKey ? 'a' : '') + (e.ctrlKey ? 'c' : '') + (e.shiftKey ? 's' : '') + (e.metaKey ? 'm' : '');
  }

  function prepMods(mods) {
    var chars = Array.prototype.map.call(mods.toLowerCase(), function (c) {
      return c;
    });
    chars.sort();
    return chars.join("");
  }

  /**
   * Routes keys based on keycode and modifier
   */
  function KeyRouter() {
    this.handlers = {};
  }

  /**
   * Routes a key
   * @param {Event} e the key event
   * @return {bool} true if event was routed
   */
  KeyRouter.prototype.handleKeyDown = function (e) {
    var keyId = e.keyCode + ':' + getMods(e);
    var handler = this.handlers[keyId];
    if (handler) {
      handler(e);
      return true;
    }
    return false;
  };

  /**
   * @param {number} keyCode the keycode
   * @param {string} [mods] the modifiers where
   *   's' = shift, 'c' = ctrl, 'a' = alt, 'm' = meta (apple key, windows key)
   * @param {function(Event}) handler the funciton to call when key is pressed
   */
  KeyRouter.prototype.on = function (keyCode, mods, handler) {
    if (handler === undefined) {
      handler = mods;
      mods = '';
    }
    var keyId = keyCode + ':' + prepMods(mods);
    this.handlers[keyId] = handler;
  };

  return KeyRouter;
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
  "use strict";

  function ListenerManager() {
    var listeners = {};
    var nextId = 1;

    // Returns an id for the listener. This is easier IMO than
    // the normal remove listener which requires the same arguments as addListener
    this.on = function (elem /*, event, listener, useCapture */) {
      var args = Array.prototype.slice.call(arguments, 1);
      elem.addEventListener.apply(elem, args);
      var id = nextId++;
      listeners[id] = {
        elem: elem,
        args: args
      };
      return id;
    };

    this.remove = function (id) {
      var listener = listeners[id];
      if (listener) {
        delete listener[id];
        listener.elem.removeEventListener.apply(listener.elem, listener.args);
      }
    };

    this.removeAll = function () {
      var old = listeners;
      listeners = {};
      Object.keys(old).forEach(function (id) {
        var listener = old[id];
        listener.elem.removeEventListener.apply(listener.elem, listener.args);
      });
    };
  }

  return ListenerManager;
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @module Misc
 */

!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
  /**
   * Copies properties from obj to dst recursively.
   * @param {Object} obj Object with new settings.
   * @param {Object} dst Object to receive new settings.
   * @param {number?} opt_overwriteBehavior
   *     *   0/falsy = overwrite
   *
   *         src    = {foo:'bar'}
   *         dst    = {foo:'abc'}
   *         result = {foo:'bar'}
   *
   *     *   1 = don't overwrite but descend if deeper
   *
   *         src    = {foo:{bar:'moo','abc':def}}
   *         dst    = {foo:{bar:'ghi'}}
   *         result = {foo:{bar:'ghi','abc':def}}
   *
   *         'foo' exists but we still go deeper and apply 'abc'
   *
   *     *   2 = don't overwrite don't descend
   *
   *             src    = {foo:{bar:'moo','abc':def}}
   *             dst    = {foo:{bar:'ghi'}}
   *             result = {foo:{bar:'ghi'}}
   *
   *         'foo' exists so we don't go any deeper
   *
   */
  var copyProperties = function (src, dst, opt_overwriteBehavior) {
    Object.keys(src).forEach(function (key) {
      if (opt_overwriteBehavior === 2 && dst[key] !== undefined) {
        return;
      }
      var value = src[key];
      if (value instanceof Array) {
        var newDst = dst[key];
        if (!newDst) {
          newDst = [];
          dst[name] = newDst;
        }
        copyProperties(value, newDst, opt_overwriteBehavior);
      } else if (value instanceof Object && !(value instanceof Function) && !(value instanceof HTMLElement)) {
        var newDst2 = dst[key];
        if (!newDst2) {
          newDst2 = {};
          dst[key] = newDst2;
        }
        copyProperties(value, newDst2, opt_overwriteBehavior);
      } else {
        if (opt_overwriteBehavior === 1 && dst[key] !== undefined) {
          return;
        }
        dst[key] = value;
      }
    });
    return dst;
  };

  function searchStringToObject(str, opt_obj) {
    if (str[0] === '?') {
      str = str.substring(1);
    }
    var results = opt_obj || {};
    str.split("&").forEach(function (part) {
      var pair = part.split("=").map(decodeURIComponent);
      results[pair[0]] = pair[1] !== undefined ? pair[1] : true;
    });
    return results;
  }

  function objectToSearchString(obj) {
    return "?" + Object.keys(obj).filter(function (key) {
      return obj[key] !== undefined;
    }).map(function (key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
    }).join("&");
  }

  /**
   * Reads the query values from a URL like string.
   * @param {String} url URL like string eg. http://foo?key=value
   * @param {Object} [opt_obj] Object to attach key values to
   * @return {Object} Object with key values from URL
   * @memberOf module:Misc
   */
  var parseUrlQueryString = function (str, opt_obj) {
    var dst = opt_obj || {};
    try {
      var q = str.indexOf("?");
      var e = str.indexOf("#");
      if (e < 0) {
        e = str.length;
      }
      var query = str.substring(q + 1, e);
      searchStringToObject(query, dst);
    } catch (err) {
      console.error(err);
    }
    return dst;
  };

  /**
   * Reads the query values from the current URL.
   * @param {Object=} opt_obj Object to attach key values to
   * @return {Object} Object with key values from URL
   * @memberOf module:Misc
   */
  var parseUrlQuery = function (opt_obj) {
    return searchStringToObject(window.location.search, opt_obj);
  };

  /**
   * Read `settings` from URL. Assume settings it a
   * JSON like URL as in http://foo?settings={key:value},
   * Note that unlike real JSON we don't require quoting
   * keys if they are alpha_numeric.
   *
   * @param {Object=} opt_obj object to apply settings to.
   * @param {String=} opt_argumentName name of key for settings, default = 'settings'.
   * @return {Object} object with settings
   * @func applyUrlSettings
   * @memberOf module:Misc
   */
  var fixKeysRE = new RegExp("([a-zA-Z0-9_]+):", "g");

  var applyUrlSettings = function (opt_obj, opt_argumentName) {
    var argumentName = opt_argumentName || 'settings';
    var src = parseUrlQuery();
    var dst = opt_obj || {};
    var settingsStr = src[argumentName];
    if (settingsStr) {
      var json = settingsStr.replace(fixKeysRE, '"$1":');
      var settings = JSON.parse(json);
      copyProperties(settings, dst);
    }
    return dst;
  };

  /**
   * Gets a function checking for prefixed versions
   *
   * example:
   *
   *     var lockOrientation = misc.getFunctionByPrefix(window.screen, "lockOrientation");
   *
   * @param {object} obj object that has function
   * @param {string} funcName name of function
   * @return {function?} or undefined if it doesn't exist
   */
  var prefixes = ["", "moz", "webkit", "ms"];
  function getFunctionByPrefix(obj, funcName) {
    var capitalName = funcName.substr(0, 1).toUpperCase() + funcName.substr(1);
    for (var ii = 0; ii < prefixes.length; ++ii) {
      var prefix = prefixes[ii];
      var name = prefix + prefix ? capitalName : funcName;
      var func = obj[name];
      if (func) {
        return func.bind(obj);
      }
    }
  }

  /**
   * Creates an invisible iframe and sets the src
   * @param {string} src the source for the iframe
   * @return {HTMLIFrameElement} The iframe
   */
  function gotoIFrame(src) {
    var iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = src;
    document.body.appendChild(iframe);
    return iframe;
  }

  /**
   * get a random int
   * @param {number} value max value exclusive. 5 = random 0 to 4
   * @return {number} random int
   * @memberOf module:Misc
   */
  var randInt = function (value) {
    return Math.floor(Math.random() * value);
  };

  /**
   * get a random CSS color
   * @param {function(number): number?) opt_randFunc function to generate random numbers
   * @return {string} random css color
   * @memberOf module:Misc
   */
  var randCSSColor = function (opt_randFunc) {
    var randFunc = opt_randFunc || randInt;
    var strong = randFunc(3);
    var colors = [];
    for (var ii = 0; ii < 3; ++ii) {
      colors.push(randFunc(128) + (ii === strong ? 128 : 64));
    }
    return "rgb(" + colors.join(",") + ")";
  };

  /**
   * get a random 32bit color
   * @param {function(number): number?) opt_randFunc function to generate random numbers
   * @return {string} random 32bit color
   * @memberOf module:Misc
   */
  var rand32BitColor = function (opt_randFunc) {
    var randFunc = opt_randFunc || randInt;
    var strong = randFunc(3);
    var color = 0xFF;
    for (var ii = 0; ii < 3; ++ii) {
      color = color << 8 | randFunc(128) + (ii === strong ? 128 : 64);
    }
    return color;
  };

  /**
   * finds a CSS rule.
   * @param {string} selector
   * @return {Rule?} matching css rule
   * @memberOf module:Misc
   */
  var findCSSStyleRule = function (selector) {
    for (var ii = 0; ii < document.styleSheets.length; ++ii) {
      var styleSheet = document.styleSheets[ii];
      var rules = styleSheet.cssRules || styleSheet.rules;
      if (rules) {
        for (var rr = 0; rr < rules.length; ++rr) {
          var rule = rules[rr];
          if (rule.selectorText === selector) {
            return rule;
          }
        }
      }
    }
  };

  /**
   * Inserts a text node into an element
   * @param {HTMLElement} element element to have text node insert
   * @param {string} [text] text to insert
   * @return {HTMLTextNode} the created text node
   * @memberOf module:Misc
   */
  var createTextNode = function (element, text) {
    var txt = document.createTextNode(text || "");
    element.appendChild(txt);
    return txt;
  };

  /**
   * Returns the absolute position of an element for certain browsers.
   * @param {HTMLElement} element The element to get a position
   *        for.
   * @returns {Object} An object containing x and y as the
   *        absolute position of the given element.
   * @memberOf module:Misc
   */
  var getAbsolutePosition = function (element) {
    var r = { x: element.offsetLeft, y: element.offsetTop };
    if (element.offsetParent) {
      var tmp = getAbsolutePosition(element.offsetParent);
      r.x += tmp.x;
      r.y += tmp.y;
    }
    return r;
  };

  /**
   * Clamp value
   * @param {Number} v value to clamp
   * @param {Number} min min value to clamp to
   * @param {Number} max max value to clamp to
   * @returns {Number} v clamped to min and max.
   * @memberOf module:Misc
   */
  var clamp = function (v, min, max) {
    return Math.max(min, Math.min(max, v));
  };

  /**
   * Clamp in both positive and negative directions.
   * Same as clamp(v, -max, +max)
   *
   * @param {Number} v value to clamp
   * @param {Number} max max value to clamp to
   * @returns {Number} v clamped to -max and max.
   * @memberOf module:Misc
   */
  var clampPlusMinus = function (v, max) {
    return clamp(v, -max, max);
  };

  /**
   * Return sign of value
   *
   * @param {Number} v value
   * @returns {Number} -1 if v < 0, 1 if v > 0, 0 if v == 0
   * @memberOf module:Misc
   */
  var sign = function (v) {
    return v < 0 ? -1 : v > 0 ? 1 : 0;
  };

  /**
   * Takes which ever is closer to zero
   * In other words minToZero(-2, -1) = -1 and minToZero(2, 1) = 1
   *
   * @param {Number} v value to min
   * @param {Number} min min value to use if v is less then -min
   *        or greater than +min
   * @returns {Number} min or v, which ever is closer to zero
   * @memberOf module:Misc
   */
  var minToZero = function (v, min) {
    return Math.abs(v) < Math.abs(min) ? v : min;
  };

  /**
   * flips 0->max to max<-0 and 0->min to min->0
   * In otherwords
   *     max: 3, v: 2.7  =  0.3
   *     max: 3, v:-2.7  = -0.3
   *     max: 3, v: 0.2  =  2.8
   *     max: 3, v:-0.2  = -2.8
   *
   * @param {Number} v value to flip.
   * @param {Number} max range to flip inside.
   * @returns {Number} flipped value.
   * @memberOf module:Misc
   */
  var invertPlusMinusRange = function (v, max) {
    return sign(v) * (max - Math.min(max, Math.abs(v)));
  };

  /**
   * Convert degrees to radians
   *
   * @param {Number} d value in degrees
   * @returns {Number} d in radians
   * @memberOf module:Misc
   */
  var degToRad = function (d) {
    return d * Math.PI / 180;
  };

  /**
   * Converts radians to degrees
   * @param {Number} r value in radians
   * @returns {Number} r in degrees
   * @memberOf module:Misc
   */
  var radToDeg = function (r) {
    return r * 180 / Math.PI;
  };

  /**
   * Resizes a cavnas to match its CSS displayed size.
   * @param {Canvas} canvas canvas to resize.
   * @param {boolean?} useDevicePixelRatio if true canvas will be
   *        created to match devicePixelRatio.
   * @memberOf module:Misc
   */
  var resize = function (canvas, useDevicePixelRatio) {
    var mult = useDevicePixelRatio ? window.devicePixelRatio : 1;
    mult = mult || 1;
    var width = Math.floor(canvas.clientWidth * mult);
    var height = Math.floor(canvas.clientHeight * mult);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
  };

  /**
   * Copies all the src properties to the dst
   * @param {Object} src an object with some properties
   * @param {Object} dst an object to receive copes of the properties
   * @return returns the dst object.
   */
  function applyObject(src, dst) {
    Object.keys(src).forEach(function (key) {
      dst[key] = src[key];
    });
    return dst;
  }

  /**
   * Merges the proprties of all objects into a new object
   *
   * Example:
   *
   *     var a = { abc: "def" };
   *     var b = { xyz: "123" };
   *     var c = Misc.mergeObjects(a, b);
   *
   *     // c = { abc: "def", xyz: "123" };
   *
   * Later object properties take precedence
   *
   *     var a = { abc: "def" };
   *     var b = { abc: "123" };
   *     var c = Misc.mergeObjects(a, b);
   *
   *     // c = { abc: "123" };
   *
   * @param {...Object} object objects to merge.
   * @return an object containing the merged properties
   */
  function mergeObjects(object) {
    // eslint-disable-line
    var merged = {};
    Array.prototype.slice.call(arguments).forEach(function (src) {
      if (src) {
        applyObject(src, merged);
      }
    });
    return merged;
  }

  /**
   * Creates a random id
   * @param {number} [digits] number of digits. default 16
   */
  function makeRandomId(digits) {
    digits = digits || 16;
    var id = "";
    for (var ii = 0; ii < digits; ++ii) {
      id = id + (Math.random() * 16 | 0).toString(16);
    }
    return id;
  }

  /**
   * Applies an object of listeners to an emitter.
   *
   * Example:
   *
   *     applyListeners(someDivElement, {
   *       mousedown: someFunc1,
   *       mousemove: someFunc2,
   *       mouseup: someFunc3,
   *     });
   *
   * Which is the same as
   *
   *     someDivElement.addEventListener("mousedown", someFunc1);
   *     someDivElement.addEventListener("mousemove", someFunc2);
   *     someDivElement.addEventListener("mouseup", someFunc3);
   *
   * @param {Emitter} emitter some object that emits events and has a function `addEventListener`
   * @param {Object.<string, function>} listeners eventname function pairs.
   */
  function applyListeners(emitter, listeners) {
    Object.keys(listeners).forEach(function (name) {
      emitter.addEventListener(name, listeners[name]);
    });
  }

  function deepCompare(a, b) {
    // are they the same object?
    if (a === b) {
      return true;
    }
    // are they the same type?
    if (typeof a !== typeof b) {
      return false;
    }
    if (Array.isArray(a)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let ii = 0; ii < a.length; ++ii) {
        if (!deepCompare(a[ii], b[ii])) {
          return false;
        }
      }
      return true;
    }
    if (typeof a === "object") {
      var aKeys = Object.keys(a).sort();
      var bKeys = Object.keys(b).sort();
      if (!deepCompare(aKeys, bKeys)) {
        return false;
      }
      for (let ii = 0; ii < aKeys.length; ++ii) {
        var key = aKeys[ii];
        if (!deepCompare(a[key], b[key])) {
          return false;
        }
      }
      return true;
    }
    return a === b;
  }

  return {
    applyObject: applyObject,
    applyUrlSettings: applyUrlSettings,
    applyListeners: applyListeners,
    clamp: clamp,
    clampPlusMinus: clampPlusMinus,
    copyProperties: copyProperties,
    createTextNode: createTextNode,
    degToRad: degToRad,
    deepCompare: deepCompare,
    findCSSStyleRule: findCSSStyleRule,
    getAbsolutePosition: getAbsolutePosition,
    getFunctionByPrefix: getFunctionByPrefix,
    gotoIFrame: gotoIFrame,
    invertPlusMinusRange: invertPlusMinusRange,
    makeRandomId: makeRandomId,
    mergeObjects: mergeObjects,
    minToZero: minToZero,
    objectToSearchString: objectToSearchString,
    parseUrlQuery: parseUrlQuery,
    parseUrlQueryString: parseUrlQueryString,
    radToDeg: radToDeg,
    randInt: randInt,
    randCSSColor: randCSSColor,
    rand32BitColor: rand32BitColor,
    resize: resize,
    sign: sign,
    searchStringToObject: searchStringToObject
  };
}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
  "use strict";

  function removeCommentHeader(s) {
    return s.substr(0, 2) === "//" ? s.substr(2) : s;
  }

  function removeComments(s) {
    var ndx = s.indexOf("//");
    return ndx >= 0 ? s.substr(0, ndx) : s;
  }

  var noCommaNeeded = {
    '{': true,
    '[': true,
    ',': true
  };
  function addCommas(s) {
    var last = s.trim().substr(-1);
    return noCommaNeeded[last] ? s : s + ",";
  }

  function isQuote(s) {
    return s === "'" || s === '"';
  }

  function addQuotesIfNoQuotes(s) {
    var first = s.substr(0, 1);
    if (isQuote(first)) {
      return s;
    }
    return '"' + s.replace(/"/g, "\\\"") + '"';
  }

  function addQuotes(s) {
    var colon = s.indexOf(":");
    if (colon < 0) {
      return s;
    }
    var before = addQuotesIfNoQuotes(s.substr(0, colon).trim());
    var after = s.substr(colon + 1).trim();
    return before + ":" + after;
  }

  function trim(s) {
    return s.trim();
  }

  var settingsRE = /\/\/\s+settings\s*=\s*(\{\n[\s\S]*?\n\/\/\s+\})/m;
  function parseSettings(text) {
    var obj;
    var m = settingsRE.exec(text);
    if (m) {
      var str = m[1].split('\n').map(removeCommentHeader).map(removeComments).map(addQuotes).map(addCommas).map(trim).join("").replace(/,\}/g, '}').replace(/,\]/g, ']').replace(/\},$/, '}');
      try {
        obj = JSON.parse(str);
      } catch (e) {
        console.error("could not parse settings:" + str);
      }
    }
    return obj;
  }

  /**
   * Returns a padding string large enough for the given size.
   * @param {string} padChar character for padding string
   * @param {number} len minimum length of padding.
   * @returns {string} string with len or more of padChar.
   */
  var getPadding = function () {
    var paddingDb = {};

    return function (padChar, len) {
      var padStr = paddingDb[padChar];
      if (!padStr || padStr.length < len) {
        padStr = new Array(len + 1).join(padChar);
        paddingDb[padChar] = padStr;
      }
      return padStr;
    };
  }();

  /**
   * Turn an unknown object into a string if it's not already.
   * Do I really needs this? I could just always do .toString even
   * on a string.
   */
  var stringIt = function (str) {
    return typeof str === 'string' ? str : str.toString();
  };

  /**
   * Pad string on right
   * @param {string} str string to pad
   * @param {number} len number of characters to pad to
   * @param {string} padChar character to pad with
   * @returns {string} padded string.
   * @memberOf module:Strings
   */
  var padRight = function (str, len, padChar) {
    str = stringIt(str);
    if (str.length >= len) {
      return str;
    }
    var padStr = getPadding(padChar, len);
    return str + padStr.substr(str.length - len);
  };

  /**
   * Pad string on left
   * @param {string} str string to pad
   * @param {number} len number of characters to pad to
   * @param {string} padChar character to pad with
   * @returns {string} padded string.
   * @memberOf module:Strings
   */
  var padLeft = function (str, len, padChar) {
    str = stringIt(str);
    if (str.length >= len) {
      return str;
    }
    var padStr = getPadding(padChar, len);
    return padStr.substr(str.length - len) + str;
  };

  /**
   * Replace %(id)s in strings with values in objects(s)
   *
   * Given a string like `"Hello %(name)s from $(user.country)s"`
   * and an object like `{name:"Joe",user:{country:"USA"}}` would
   * return `"Hello Joe from USA"`.
   *
   * @function
   * @param {string} str string to do replacements in
   * @param {Object|Object[]} params one or more objects.
   * @returns {string} string with replaced parts
   * @memberOf module:Strings
   */
  var replaceParams = function () {
    var replaceParamsRE = /%\(([^)]+)\)s/g;

    return function (str, params) {
      if (!params.length) {
        params = [params];
      }

      return str.replace(replaceParamsRE, function (match, key) {
        var keys = key.split('.');
        for (var ii = 0; ii < params.length; ++ii) {
          var obj = params[ii];
          for (var jj = 0; jj < keys.length; ++jj) {
            var part = keys[jj];
            obj = obj[part];
            if (obj === undefined) {
              break;
            }
          }
          if (obj !== undefined) {
            return obj;
          }
        }
        console.error("unknown key: " + key);
        return "%(" + key + ")s";
      });
    };
  }();

  /**
   * True if string starts with prefix
   * @static
   * @param {String} str string to check for start
   * @param {String} prefix start value
   * @returns {Boolean} true if str starts with prefix
   * @memberOf module:Strings
   */
  var startsWith = function (str, start) {
    return str.length >= start.length && str.substr(0, start.length) === start;
  };

  /**
   * True if string ends with suffix
   * @param {String} str string to check for start
   * @param {String} suffix start value
   * @returns {Boolean} true if str starts with suffix
   * @memberOf module:Strings
   */
  var endsWith = function (str, end) {
    return str.length >= end.length && str.substring(str.length - end.length) === end;
  };

  /**
   * Make a string from unicode code points
   * @function
   * @param {Number} codePoint one or more code points
   * @returns {string} unicode string. Note a single code point
   *          can return a string with length > 1.
   * @memberOf module:Strings
   */
  var fromCodePoint = String.fromCodePoint ? String.fromCodePoint : function () {
    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;
    var fromCodePoint = function () {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return '';
      }
      var result = '';
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
        codePoint < 0 || // not a valid Unicode code point
        codePoint > 0x10FFFF || // not a valid Unicode code point
        floor(codePoint) !== codePoint // not an integer
        ) {
            throw new RangeError('Invalid code point: ' + codePoint);
          }
        if (codePoint <= 0xFFFF) {
          // BMP code point
          codeUnits.push(codePoint);
        } else {
          // Astral code point; split in surrogate halves
          // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          codePoint -= 0x10000;
          highSurrogate = (codePoint >> 10) + 0xD800;
          lowSurrogate = codePoint % 0x400 + 0xDC00;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 === length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    };
    return fromCodePoint;
  }();

  return {
    endsWith: endsWith,
    fromCodePoint: fromCodePoint,
    padLeft: padLeft,
    padRight: padRight,
    replaceParams: replaceParams,
    startsWith: startsWith,
    removeComments: removeComments,
    isQuote: isQuote,
    trim: trim,
    parseSettings: parseSettings
  };
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
  return {
    // ===========================================================
    "vs-header": `
attribute float vertexId;

uniform vec2 mouse;
uniform vec2 resolution;
uniform vec4 background;
uniform float time;
uniform float vertexCount;
uniform sampler2D volume;
uniform sampler2D sound;
uniform sampler2D floatSound;
uniform sampler2D touch;
uniform vec2 soundRes;
uniform float _dontUseDirectly_pointSize;

varying vec4 v_color;
  `,
    // ===========================================================
    "vs": `
#define PI radians(180.)
#define NUM_SEGMENTS 21.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)
#define STEP 5.0

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);
  float count = floor(vertexId / NUM_POINTS);
  float offset = count * 0.02;
  float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;
  float radius = 0.2;
  float c = cos(angle + time) * radius;
  float s = sin(angle + time) * radius;
  float orbitAngle = count * 0.01;
  float oC = cos(orbitAngle + time * count * 0.01) * sin(orbitAngle);
  float oS = sin(orbitAngle + time * count * 0.01) * sin(orbitAngle);

  vec2 aspect = vec2(1, resolution.x / resolution.y);
  vec2 xy = vec2(
      oC + c,
      oS + s);
  gl_Position = vec4(xy * aspect + mouse * 0.1, 0, 1);

  float hue = (time * 0.01 + count * 1.001);
  v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);
}
  `,
    // ===========================================================
    "vs2": `
#define PI radians(180.)
#define NUM_SEGMENTS 4.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)
#define STEP 5.0

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);
  float count = floor(vertexId / NUM_POINTS);
  float snd = texture2D(sound, vec2(fract(count / 128.0), fract(count / 20000.0))).a;
  float offset = count * 0.02;
  float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;
  float radius = 0.2 * pow(snd, 5.0);
  float c = cos(angle + time) * radius;
  float s = sin(angle + time) * radius;
  float orbitAngle =  count * 0.0;
  float innerRadius = count * 0.001;
  float oC = cos(orbitAngle + time * 0.4 + count * 0.1) * innerRadius;
  float oS = sin(orbitAngle + time + count * 0.1) * innerRadius;

  vec2 aspect = vec2(1, resolution.x / resolution.y);
  vec2 xy = vec2(
      oC + c,
      oS + s);
  gl_Position = vec4(xy * aspect + mouse * 0.1, 0, 1);

  float hue = (time * 0.01 + count * 1.001);
  v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);
}
  `,
    // ===========================================================
    "vs3": `
#define NUM_SEGMENTS 128.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float numLinesDown = floor(vertexCount / NUM_POINTS);
  // produces 0,1, 1,2, 2,3, ...
  float point = floor(mod(vertexId, NUM_POINTS) / 2.0) + mod(vertexId, 2.0);
  // line count
  float count = floor(vertexId / NUM_POINTS);

  float u = point / NUM_SEGMENTS;  // 0 <-> 1 across line
  float v = count / numLinesDown;  // 0 <-> 1 by line
  float invV = 1.0 - v;

  // Only use the left most 1/4th of the sound texture
  // because there's no action on the right
  float historyX = u * 0.25;
  // Match each line to a specific row in the sound texture
  float historyV = (v * numLinesDown + 0.5) / soundRes.y;
  float snd = texture2D(sound, vec2(historyX, historyV)).a;

  float x = u * 2.0 - 1.0;
  float y = v * 2.0 - 1.0;
  vec2 xy = vec2(
      x * mix(0.5, 1.0, invV),
      y + pow(snd, 5.0) * 1.0) / (v + 0.5);
  gl_Position = vec4(xy * 0.5, 0, 1);

  float hue = u;
  float sat = invV;
  float val = invV;
  v_color = mix(vec4(hsv2rgb(vec3(hue, sat, val)), 1), background, v * v);
}
  `,
    // ===========================================================
    "vs4": `
#define PI radians(180.)
#define NUM_SEGMENTS 2.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)
#define STEP 1.0

void main() {
  float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);
  float count = floor(vertexId / NUM_POINTS);
  float offset = count * sin(time * 0.01) + 5.0;
  float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;
  float radius = pow(count * 0.00014, 1.0);
  float c = cos(angle + time) * radius;
  float s = sin(angle + time) * radius;
  float orbitAngle =  pow(count * 0.025, 0.8);
  float innerRadius = pow(count * 0.0005, 1.2);
  float oC = cos(orbitAngle + count * 0.0001) * innerRadius;
  float oS = sin(orbitAngle + count * 0.0001) * innerRadius;

  vec2 aspect = vec2(1, resolution.x / resolution.y);
  vec2 xy = vec2(
      oC + c,
      oS + s);
  gl_Position = vec4(xy * aspect + mouse * 0.1, 0, 1);

  float b = 1.0 - pow(sin(count * 0.4) * 0.5 + 0.5, 10.0);
  b = 0.0;mix(0.0, 0.7, b);
  v_color = vec4(b, b, b, 1);
}
  `,
    // ===========================================================
    "wave-vs": `
vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float select(float v, float t) {
  return step(t * 0.9, v) * step(v, t * 1.1);
}

void main() {
  float GRID_YOFF = 1./40.;
  float GRID_DOWN = 17.;
  float GRID_ACROSS = 64.0;
  float NUM_PER_DOWN = GRID_DOWN * 2.;
  float NUM_PER_ACROSS = GRID_ACROSS * 2.;
  float NUM_PER_GRID = NUM_PER_DOWN + NUM_PER_ACROSS;
  float NUM_GRIDS = 4.;
  float NUM_GRID_TOTAL = NUM_PER_GRID * NUM_GRIDS;
  float NUM_POINTS = (vertexCount - NUM_GRID_TOTAL) / 4.;
  float NUM_SEGMENTS = NUM_POINTS / 2.;


  float id = vertexId - NUM_GRID_TOTAL;

  // produces 0,1, 1,2, 2,3, ...
  float point = floor(mod(id, NUM_POINTS) / 2.0) + mod(id, 2.0);
  // line count
  float grid = floor(id / NUM_POINTS);

  float u = point / (NUM_SEGMENTS - 1.);    // 0 <-> 1 across line
  float v = grid / NUM_GRIDS;      // 0 <-> 1 by line

  float snd0 = texture2D(sound, vec2(u * 1., 0)).a;
  float snd1 = texture2D(sound, vec2(u * 0.5, 0)).a;
  float snd2 = texture2D(sound, vec2(u * 0.25, 0)).a;
  float snd3 = texture2D(sound, vec2(u * 0.125, 0)).a;

  float s =
    snd0 * select(grid, 0.) +
    snd1 * select(grid, 1.) +
    snd2 * select(grid, 2.) +
    snd3 * select(grid, 3.) +
    0.;

  float x = u * 2.0 - 1.0;
  float y = v * 2.0 - 1.0;
  vec2 xy = vec2(
      x,
      s * 0.4 + y + GRID_YOFF);
  gl_Position = vec4(xy, 0, 1);

  float hue = grid * 0.25;
  float sat = 1.0;
  float val = 1.0;

  if (id < 0.0) {
    if (vertexId < NUM_PER_DOWN * NUM_GRIDS) {
      float hgx = mod(vertexId, 2.0);
      float hgy = mod(floor(vertexId / 2.), GRID_DOWN);
      float hgId = floor(vertexId / NUM_PER_DOWN);
      gl_Position = vec4(
        hgx * 2. - 1.,
        hgy / (GRID_DOWN - 1.) * 0.4 +
        (hgId / NUM_GRIDS * 2. - 1.) + GRID_YOFF,
        0.1,
        1);

      hue = hgId * 0.25;
      sat = 0.5;
      val = 0.3;
    } else {
      float vid = vertexId - NUM_PER_DOWN * NUM_GRIDS;
      float vgy = mod(vid, 2.0);
      float vgx = mod(floor(vid / 2.), GRID_ACROSS);
      float vgId = floor(vid / NUM_PER_ACROSS);
      gl_Position = vec4(
        ((vgx / GRID_ACROSS) * 2. - 1.) * pow(2., vgId),
        vgy * 0.4 +
        (vgId / NUM_GRIDS * 2. - 1.) + GRID_YOFF,
        0.1,
        1);

      hue = vgId * 0.25;
      sat = 0.5;
      val = 0.3;

    }
  }

  v_color = vec4(hsv2rgb(vec3(hue, sat, val)), 1);
}
  `,
    // ===========================================================
    "fs": `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
  `,
    // ===========================================================
    "history-vs": `
attribute vec4 position;
attribute vec2 texcoord;
uniform mat4 u_matrix;
varying vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * position;
  v_texcoord = texcoord;
}
  `,
    // ===========================================================
    "history-fs": `
precision mediump float;

uniform sampler2D u_texture;
uniform float u_mix;
uniform float u_mult;
varying vec2 v_texcoord;

void main() {
  vec4 color = texture2D(u_texture, v_texcoord);
  gl_FragColor = mix(color.aaaa, color.rgba, u_mix) * u_mult;
}
  `,
    // ===========================================================
    "rect-vs": `
attribute vec4 position;
uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * position;
}
  `,
    // ===========================================================
    "rect-fs": `
precision mediump float;

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
  `
  };
}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
  var copyWithinPolyfill = function (dst, src, length) {
    if (length === undefined) {
      length = this.length;
    }
    var srcEnd = src + length;
    var dstEnd = dst + length;
    if (src < dst) {
      // copy forward
      while (srcEnd > src) {
        this[--dstEnd] = this[--srcEnd];
      }
    } else {
      // copy backward
      while (src < srcEnd) {
        this[dst++] = this[src++];
      }
    }
  };

  // foo
  var typedArrays = [window.Int8Array, window.Int16Array, window.Int32Array, window.Uint8Array, window.Uint16Array, window.Uint32Array, window.Float32Array, window.Float64Array];

  typedArrays.forEach(function (ctor) {
    if (!ctor.prototype.copyWithin) {
      ctor.prototype.copyWithin = copyWithinPolyfill;
    }
  });

  return {}; // nothing
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ })
/******/ ]);
});