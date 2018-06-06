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

  const silentMP3 = "data:audio/mp3;base64,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LpkVrc5yk0NnT5DN0r7ygGqp9SJxOeOSSTeJQgIRIKh6SBKLhsdFgnl4lic2AkshcfBYDR2PUjSDGiSttUZNSSMKkiMpyPz9XLaihbS6uJe0Qo39FI9RhJiijnMQAmqRJQnTnQQ9B6DATEFNRTMuOTkuNVW3U5Tx7Sg0GtNZay5wXQa29Bbl+W7LSqP/EUHXUMbiZZqWyph7iXH/eWVVovK8YFykUhfWpzKggb6B/o1f2ki9UxI8hDlinajtn1JsJGxmb0bOkuali0UaruYXWWcevHypyrfULvoUbdYW1ydMBPE6OqOplGZJbTRCQtDcrmVtVrK9TrpTM7lZijZ1rPtbwvvWbf69tPpZMVhe9GHEVuZt4rBdK5yT0a/ezMy4QrD60qtiTyZVsdUwnKE+b1TCOZnVrDRQnUywLHUnUVDV0sWVEFchCWZkNLiolpOD+bYTKfy5fmMlVyxZXCFrKmSTa5pRXM7w/+NoZPQfVjcEAGDPdiUsbg2ACN9MfSvcUWpFbTdensr6+XlZL8y/Po5TLn5WbBy75F8nmbTfY0s28yyHVD+sf9k12LpWSz6W5s3///z/+5XKktIqQbR9KBeCeS3IOBW1H8SjNCYt51CfMa4bXF+imtxZoDCxQn7gnVUpGN8+V2FLZxhxU7IrtJ0/pEusMbyRmzFckojzujKFkMshh9zKVEIefKGKtkQ47UVATb1NpRvVTEFNRTMuOTkuNVVVVVK4p5fWFEpWRCj+V5wkqN8pRbjZPAuJhHGS03lpEl5C+EiHGOknSnVMiqP1jOldLSGti0rTFErRp4SImoJTlbLYceic8+m2fv//q0Tj0SRezFPLbNGmJEStzv/5bZb/7LbLZTy2vlHFmJhICAxgUUkblWicXs5T5Wy+blS2y8tst/L/0WgkRAoSnKdtySvWwRrYL/MzNt5cdNuLmYmru702hWFoSR6KiC7/PHLEdTIeTAfhBKgfAiJ5ofbXWCcAkHREFxJcMjsfQmMAqHksE7TlQDYFhDCEGwVLOk1L5rDv50mqzbu1Jtsoa7Q7tlOaw7+d/+NoZPIbBjbsADzMbi1cbdSgGZ+gJsoa655Q1pH/DUGjUm1n5rDWEGdWNSaHeGqMxrDWGv/3ampNShrVh0mNasNZT5OU6J1zhpSwCYOBUAopIjCTonXvetz9xZoNJreumJdo0gxhIWZJ/O0NYEcfrmaKcMonqGGUfqwhq8tIavObpmTqJUiXMk/l2yO4uXrcznST43yaiTG4MYbp+IJWzK5rhxLvVMrzhL8izyJSbhelTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

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
    setTimeout(function() {
      errorCallback("no mic support on this browser/device");
    });
  }

  const audio = new Audio();
  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || noGetUserMedia;

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

  function isMic(src) {
    return src === 'mic';
  }

  function getMicSource(context, callback, errorCallback) {
    if (g_micSource) {
      setTimeout(function() {
        callback(g_micSource);
      });
    } else {
      getUserMedia.call(navigator, {audio:true}, function(stream) {
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
    }
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
        getMicSource(context, function(micSource) {
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
      return audio ? (audio.currentTime || 0) : 0;
    }

    function getDuration() {
      return audio ? (audio.duration || 0) : 0;
    }

    this.init = function() {
      audio.src = silentMP3;
      audio.play();
    };

    this.isPlaying = isPlaying;

    this.play = function() {
      if (canPlayHandled) {
        startPlaying(play, emit);
      } else {
        playRequested = true;
      }
    };
    this.stop = function() {
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
      return (source && source !== g_micSource) ? source.buffer.duration : 0;
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
        getMicSource(context, function(micSource) {
          source = micSource;
          emit('newSource', micSource);
        }, function(e) {
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

    this.init = function() {
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
    "create": createAudioStreamSource,
  };

}));
