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


define([], function() {

  function easeInQuad(pos) {
    return Math.pow(pos, 2);
  }

  function easeOutQuad(pos) {
    return -(Math.pow((pos - 1), 2) - 1);
  }

  function easeInOutQuad(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos,2);
    }
    return -0.5 * ((pos -= 2) * pos - 2);
  }

  function easeInCubic(pos) {
    return Math.pow(pos, 3);
  }

  function easeOutCubic(pos) {
    return (Math.pow((pos - 1), 3) + 1);
  }

  function easeInOutCubic(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 3);
    }
    return 0.5 * (Math.pow((pos - 2), 3) + 2);
  }

  function easeInQuart(pos) {
    return Math.pow(pos, 4);
  }

  function easeOutQuart(pos) {
    return -(Math.pow((pos - 1), 4) - 1);
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
    return (Math.pow((pos - 1), 5) + 1);
  }

  function easeInOutQuint(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 5);
    }
    return 0.5 * (Math.pow((pos - 2), 5) + 2);
  }

  function easeInSine(pos) {
    return -Math.cos(pos * (Math.PI / 2)) + 1;
  }

  function easeOutSine(pos) {
    return Math.sin(pos * (Math.PI / 2));
  }

  function easeInOutSine(pos) {
    return (-0.5 * (Math.cos(Math.PI * pos) - 1));
  }

  function easeInExpo(pos) {
    return (pos === 0) ? 0 : Math.pow(2, 10 * (pos - 1));
  }

  function easeOutExpo(pos) {
    return (pos === 1) ? 1 : -Math.pow(2, -10 * pos) + 1;
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
    return -(Math.sqrt(1 - (pos * pos)) - 1);
  }

  function easeOutCirc(pos) {
    return Math.sqrt(1 - Math.pow((pos - 1), 2));
  }

  function easeInOutCirc(pos) {
    if ((pos /= 0.5) < 1) {
      return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
    }
    return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
  }

  function easeOutBounce(pos) {
    if ((pos) < (1 / 2.75)) {
      return (7.5625 * pos * pos);
    } else if (pos < (2 / 2.75)) {
      return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
    } else if (pos < (2.5 / 2.75)) {
      return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
    } else {
      return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
    }
  }

  function easeInBack(pos) {
    var s = 1.70158;
    return (pos) * pos * ((s + 1) * pos - s);
  }

  function easeOutBack(pos) {
    var s = 1.70158;
    return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
  }

  function easeInOutBack(pos) {
    var s = 1.70158;
    if ((pos /= 0.5) < 1) {
      return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
    }
    return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
  }

  function elastic(pos) {
    return -1 * Math.pow(4,-8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
  }

  function swingFromTo(pos) {
    var s = 1.70158;
    return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
                                0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
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
    if (pos < (1 / 2.75)) {
      return (7.5625 * pos * pos);
    } else if (pos < (2 / 2.75)) {
      return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
    } else if (pos < (2.5 / 2.75)) {
      return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
    } else {
      return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
    }
  }

  function bouncePast(pos) {
    if (pos < (1 / 2.75)) {
      return (7.5625 * pos * pos);
    } else if (pos < (2 / 2.75)) {
      return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
    } else if (pos < (2.5 / 2.75)) {
      return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
    } else {
      return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
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
    boomerangSmooth: boomerangSmooth,
  };

  var Tweener = function(target, duration, from, to) {
     this.setup(target, duration, from, to);
  };

  var isSpecial = function() {
    var specials = {
      ease: true,             // ease func
      onFinish: true,
      onStart: true,
      onReverseStart: true,
      onReverseFinish: true,
      onUpdate: true,
      paused: true,
      delay: true,
      startRelative: true,         // use start values relative to when this tween starts (is this overkill? maybe you should use an onFinish and setup a new tween)
      endRelative: true,           // use end values relative to when this tween ends
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

  Tweener.prototype.setup = function(target, duration, from, to) {
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
     Object.keys(keys).forEach(function(key) {
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
       starts[ii]  = copyValue(from[prop] !== undefined ? from[prop] : target[prop]);
       ends[ii]    = copyValue(to[prop]   !== undefined ? to[prop]   : target[prop]);
       var v = starts[ii];
       var lerpFn = numberLerp;
       if (Array.isArray(v)) {
         lerpFn = arrayLerp;
       }
       lerpFns[ii] = lerpFn;
     }

     this.target   = target;
     this.props    = props;
     this.starts   = starts;
     this.ends     = ends;
     this.lerpFns  = lerpFns;
     this.running  = !specials.paused;
     this.duration = duration || 1;
     this.delay    = specials.delay || 0;
     this.easeFn   = specials.ease || linear;
     this.speed    = specials.speed || 1;
     this.direction = specials.reverse ? -1 : 1;
     this.timer    = 0;
     this.options  = specials;
     this.onStart  = specials.onStart;
     this.onFinish = specials.onFinish;
     this.onReverseStart  = specials.onReverseStart;
     this.onReverseFinish = specials.onReverseFinish;
     this.onUpdate = specials.onUpdate;
  };

  Tweener.prototype.update = function(deltaTime) {
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
       var target   = this.target;
       var props    = this.props;
       var starts   = this.starts;
       var ends     = this.ends;
       var lerpFns  = this.lerpFns;
       var easeFn   = this.easeFn;
       // clamp because we let it overflow. See above
       var pos      = Math.max(0, Math.min(time / this.duration, 1));
       var numProps = props.length;
       for (var ii = 0; ii < numProps; ++ii) {
         var prop  = props[ii];
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
  }

  Tweener.prototype.isFinished = function() {
     return this.timer - this.delay >= this.duration;
  };

  var TweenManager = function() {
     this.tweeners = [];
     this.newTweeners = [];
  };

  TweenManager.prototype.haveTweens = function() {
    return this.tweeners.length + this.newTweeners.length;
  };

  TweenManager.prototype.update = function(deltaTime) {
    // TODO: optimize? We can keep the arrays around, track highest used, put Tweeners on free list,
    //   use loop so we're not creating a new closure every time?
    if (this.newTweeners.length) {
      this.tweeners = this.tweeners.concat(this.newTweeners);
      this.newTweeners = [];
    }
    this.tweeners = this.tweeners.filter(function(tweener) {
      return tweener.update(deltaTime);
    });
  };

  TweenManager.prototype.addTweener = function(tweener) {
    this.newTweeners.push(tweener);
    return tweener;
  }

  TweenManager.prototype.to = function(target, duration, to) {
    return this.addTweener(new Tweener(target, duration, to));
  }

  TweenManager.prototype.from = function(target, duration, from) {
    return this.addTweener(new Tweener(target, duration, from, {}));
  }

  TweenManager.prototype.fromTo = function(target, duration, from, to) {
    return this.addTweener(new Tweener(target, duration, from, to));
  }

  // thinking out loud, in the past an animation would have been just a lot of points
  // with linear interpolation.
  var Timeline = function() {
    this.tweeners = [];
  };

  return {
    "TweenManager": TweenManager,
    "fn": easeFunctions,
  };
});

