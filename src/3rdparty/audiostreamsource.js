// @license audiosteamsource.js 0.0.2 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
// Available via the MIT license.
// see: http://github.com/greggman/audiostreamsource.js for details

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.audioStreamSource = factory();
    }
}(this, function () {

  // There's really no good way to tell which browsers fail.
  // Right now Safari doesn't expose AudioContext (it's still webkitAudioContext)
  // so my hope is whenever they get around to actually supporting the 3+ year old
  // standard that things will actually work.
  var shittyBrowser = window.AudioContext === undefined && /iPhone|iPad|iPod/.test(navigator.userAgent);

  function addEventEmitter(self) {
    var _handlers = {};
    self.on = function(event, handler) {
      _handlers[event] = handler;
    };

    return emit = function(event) {
      var handler = _handlers[event];
      if (handler) {
        handler.apply(null, Array.prototype.slice.call(arguments, 1));
      }
    };
  }

  function startPlaying(playFn, emitFn) {
    playFn();
  }

  function StreamedAudioSource(options) {
    var emit = addEventEmitter(this);
    var self = this;
    var context = options.context;
    var autoPlay = options.autoPlay;
    var audio = new Audio();
    var source;
    var canPlayHandled = false;
    var handleAudioError = function handleAudioError(e) {
      emit('error', e);
    };
    var handleCanplay = function handleCanplay() {
      if (!canPlayHandled) {
        canPlayHandled = true;
        if (source) {
          source.disconnect();
        }
        if (autoPlay) {
          startPlaying(play, emit);
        }
        if (!source) {
          source = context.createMediaElementSource(audio);
        }
        emit('newSource', source);
      }
    }
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('canplay', handleCanplay);

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

    audio.loop = options.loop;
    audio.autoplay = options.autoPlay;
    if (options.crossOrigin !== undefined) {
      audio.crossOrigin = "anonymous";
    }

    function setSource(src) {
      canPlayHandled = false;
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
      audio.play();
      audio.currentTime = 0;
    }

    function isPlaying() {
      return !audio.paused;
    }

    this.isPlaying = isPlaying;

    this.play = function() {
      startPlaying(play, emit);
    };
    this.stop = function() {
      audio.pause();
    };
    this.setSource = setSource;
    this.getSource = getSource;
  }

  function NonStreamedAudioSource(options) {
    var emit = addEventEmitter(this);
    var self = this;
    var context = options.context;
    var loop = options.loop;
    var autoPlay = options.autoPlay;
    var crossOrigin = options.crossOrigin;
    var source;
    var playing = false;
    // shitty browsers (eg, Safari) can't stream into the WebAudio API

    function play() {
      if (source) {
        source.start(0);
      }
      playing = true;
    }

    function stop() {
      if (source) {
        source.stop(0);
      }
      playing = false;
    }

    function isPlaying() {
      return playing;
    }

    function setSource(src, lofiSrc) {
      if (source) {
        stop();
        source.disconnect();
        source = undefined;
      }
      var req = new XMLHttpRequest();
      req.open("GET", lofiSrc || src, true);
      req.responseType = "arraybuffer";
      if (crossOrigin !== undefined) {
        req.withCredentials = true;
      }
      req.addEventListener('error', function(e) {
        emit('error', e);
      });
      req.addEventListener('load', function() {
        context.decodeAudioData(req.response, function (decodedBuffer) {
          source = context.createBufferSource();
          source.buffer = decodedBuffer;
          source.loop = loop;
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

    if (options.src) {
      setSource(options.src, options.lofiSrc);
    }

    this.getSource = getSource;
    this.setSource = setSource;
    this.play = play;
    this.stop = stop;
    this.isPlaying = isPlaying;
  }

  function createAudioStreamSource(options) {
    return new (shittyBrowser ? NonStreamedAudioSource : StreamedAudioSource)(options);
  }

  return {
    "create": createAudioStreamSource,
  };

}));
