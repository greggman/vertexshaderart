define([], function() {
  function removeCommentHeader(s) {
    return (s.substr(0, 2) === "//") ? s.substr(2) : s;
  }

  function removeComments(s) {
    var ndx = s.indexOf("//");
    return ndx >= 0 ? s.substr(0, ndx) : s;
  }

  var noCommaNeeded = {
    '{': true,
    '[': true,
    ',': true,
  };
  function addCommas(s) {
    var last = s.trim().substr(-1);
    return noCommaNeeded[last] ? s : (s + ",");
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
    var after  = s.substr(colon + 1).trim();
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
      var str = m[1].split('\n')
        .map(removeCommentHeader)
        .map(removeComments)
        .map(addQuotes)
        .map(addCommas)
        .map(trim)
        .join("")
        .replace(/,\}/g, '}')
        .replace(/,\]/g, ']')
        .replace(/\},$/, '}');
      try {
        obj = JSON.parse(str);
      } catch (e) {
        console.error("could not parse settings:" + str);
      }
    }
    return obj;
  }
  return parseSettings;
});

