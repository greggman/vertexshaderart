requirejs([
    './strings',
  ], function(
    strings) {
  var $ = document.querySelector.bind(document);
  var c = $("#c");
  var template = $("#template").text;

  db = db.filter(function(art) {
    return !art.private;
  });

  // var fiveDaysInMs = 1000 * 60 * 60 * 24 * 5;
  // var fiveDaysInHours = 24 * 5;
  var ageBonusInHours = 24 * 2;
  // var oneDayInHours = 24;

  var now = 1447660163874; //Date.now(); A date a few mins after the newest entry in test data
  var hourElem = $("#hour");

  function getNow() {
    var timeAdjust = hourElem.value - 400;
    return now + (timeAdjust * 60 * 60 * 1000);
  }

  function rank(art) {
    var dob = Date.parse(art.modifiedAt);
    var age = getNow() - dob;
    var hoursOld = age / 1000 / 60 / 60;
    var agePenalty = Math.max(1, Math.log(hoursOld));
    var points = 1 + art.likes * 1 + art.views * 0 + Math.max(0, ageBonusInHours - hoursOld);
    var score = points / agePenalty;
    return score;
  }

//  // HN
//  // Score = (P-1) / (T+2)^G
//  var gravity = 1.8;
//  function rank(art) {
//    var dob = Date.parse(art.modifiedAt);
//    var age = getNow() - dob;
//    var hours = age / 1000 / 60 / 60;
//    var points = art.likes * 100 + art.views * 0;
//    var score = points;
//    return points / Math.pow(hours + 2, gravity);
//  }

// reddit
//  function rank(art) {
//    var score = art.likes * 10 + art.views;
//    var order = Math.log(Math.max(Math.abs(score), 1), 10);
//    var sign = Math.sign(score);
//    var seconds = now * 0.001 - 1134028003;
//
//    return Math.round(order + sign * seconds / 45000, 7);
//  }

  function sortFn(a, b) {
    return rank(b) - rank(a);
  }

  function born(art) {
    var dob = Date.parse(art.modifiedAt);
    return dob <= getNow();
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function lerp(a, b, l) {
    return a + (b - a) * clamp(l, 0, 1);
  }

  var fiveDays = 1000 * 60 * 60 * 24;
  function simulateLikesAndViews(art) {
    var dob = Date.parse(art.modifiedAt);
    var age = getNow() - dob;
    var l   = age / fiveDays;
    art.likes = lerp(0, art.likes, l) | 0;
    art.views = lerp(0, art.views, l) | 0;
  }

  function pad(v, len) {
    return strings.padLeft(v, len, "0");
  }

  function dob(a, b) {
    return Date.parse(a.modifiedAt) - Date.parse(b.modifiedAt);
  }

  function rgb(r, g, b) {
    return "rgb("
      + r + ","
      + b + ","
      + g + ")";
  }

  function stampId(art, ndx) {
    art.ndx = ndx;
    var r = (ndx * 37 % 256);
    var g = (ndx * 57 % 256);
    var b = (ndx * 113 % 256);
    art.backgroundColor = rgb(r, b, g);
    art.color = rgb((r + 128) % 256, (g + 128) % 256, (b + 128) % 256);
  }

  // var specials = {
  //   "91": "red",
  //   "93": "green",
  //   "94": "blue",
  //   "96": "purple",
  //   "98": "yellow",
  // };

  function sort(db) {
    var num = db.length;
    db = JSON.parse(JSON.stringify(db));
    db.sort(dob);
    db.forEach(stampId);
    db = db.filter(born).sort(sortFn);
    db.forEach(simulateLikesAndViews);

    c.innerHTML = "";
    db.forEach(function(art, line) {
      var dob = Date.parse(art.modifiedAt);
      var age = getNow() - dob;
      var numHours = age / 1000 / 60 / 60 | 0;
      var days = numHours / 24 | 0;
      var hours = numHours % 24;
      art.age = pad(days, 2) + ":" + pad(hours, 2);
      var l   = age / fiveDays;
      var div = document.createElement("div");
      div.innerHTML = strings.replaceParams(template, [art, {line: line}]);
      c.appendChild(div);
      var color = "hsla(" + (lerp(0, 240, l) | 0) + ", 100%, 80%, 1)";
      //div.style.backgroundColor = art.backgroundColor;
      //div.style.color = art.color;
      div.querySelector(".age").style.backgroundColor = color;
      var level = art.ndx / num * 100 | 0;
      div.querySelector(".username").style.backgroundColor = "hsla(0, 0%, " + level + "%, 1)";
      div.querySelector(".username").style.color = "hsla(0, 0%, " + ((level + 50) % 100) + "%, 1)";
      div.querySelector(".color").style.backgroundColor = art.color;
//      var bk = specials[art.ndx];
//      if (bk) {
//        div.querySelector(".views").style.backgroundColor = bk;
//      }
    });
  }

  sort(db);

  hourElem.addEventListener('input', function() {
    sort(db);
  });

});



