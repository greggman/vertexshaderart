define([], function() {
  var copyWithinPolyfill = function(dst, src, length) {
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
  var typedArrays = [
    window.Int8Array,
    window.Int16Array,
    window.Int32Array,
    window.Uint8Array,
    window.Uint16Array,
    window.Uint32Array,
    window.Float32Array,
    window.Float64Array,
  ];

  typedArrays.forEach(function(ctor) {
    if (!ctor.prototype.copyWithin) {
      ctor.prototype.copyWithin = copyWithinPolyfill;
    }
  });

  return {}; // nothing
});


