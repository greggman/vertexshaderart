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
  //var shittyBrowser = window.AudioContext === undefined && /iPhone|iPad|iPod/.test(navigator.userAgent);
  var shittyBrowser = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);

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
    console.log("using streaming audio");
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
    var handleEnded = function handleEnded() {
      emit('ended');
    };
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('canplay', handleCanplay);
    audio.addEventListener('ended', handleEnded);

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
      if (source) {
        source.disconnect();
      }
      if (isPlaying()) {
        audio.pause();
      }
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

    function getCurrentTime() {
      return audio.currentTime || 0;
    }

    function getDuration() {
      return audio.duration || 0;
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
      return source ? source.buffer.duration : 0;
    }

    function getCurrentTime() {
      if (source && playing) {
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
    "create": createAudioStreamSource,
  };

}));
