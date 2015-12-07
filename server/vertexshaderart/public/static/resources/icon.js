requirejs([
    '../../src/js/misc',
  ], function(
    misc) {
  "use strict";

  var q = misc.parseUrlQuery();
  var c = document.getElementById("c");

  if (q.width) {
    c.width = parseInt(q.width);
  }
  if (q.height) {
    c.height = parseInt(q.height);
  }
  var scale = Math.max(c.width / 64, c.height / 64);

  var ctx = c.getContext("2d");
  ctx.fillStyle = q.backgroundColor || "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.translate(c.width / 2, c.height / 2);
  ctx.scale(scale, scale);

  function drawShape() {
    var sides = 1;
    var radius = 30;

    ctx.beginPath();
    for (var ii = 0; ii <= sides; ++ii) {
      var a = ii / sides * Math.PI * 2.3;
      var r = ii ? radius : radius * 0.3
      var x = Math.cos(a) * r;
      var y = Math.sin(a) * r;
      (ii === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, y);
    }
    ctx.stroke();
  }

  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  var shapes = 25;
  for (var ii = 0; ii < shapes; ++ii) {
    var l = ii / shapes;
    ctx.save();
    var a = l * Math.PI * 2;
    ctx.rotate(a);
    ctx.strokeStyle = "hsla(" + (l * 360) + ",100%,50%,1)";
    drawShape();
    ctx.restore();
  }
});
