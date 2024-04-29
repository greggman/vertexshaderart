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
define([
    '3rdparty/audiostreamsource',
    '3rdparty/codemirror/lib/codemirror',
    '3rdparty/codemirror/addon/scroll/simplescrollbars',
    '3rdparty/colorutils',
    '3rdparty/cssparse',
    '3rdparty/glsl',
    '3rdparty/tweeny',
    '3rdparty/twgl-full',
    '3rdparty/notifier',
    './fullscreen',
    './io',
    './keyrouter',
    './listenermanager',
    './misc',
    './strings',
    './shaders',
    './typedarray-copyWithin-polyfill',
  ], function(
     audioStreamSource,
     CodeMirror,
     CodeMirrorSimpleScrollbars,
     colorUtils,
     cssParse,
     glsl,
     tweeny,
     twgl,
     Notifier,
     fullScreen,
     io,
     KeyRouter,
     ListenerManager,
     misc,
     strings,
     shaders,
     typedArrayCopyWithinPolyfill // eslint-disable-line
  ) {

  "use strict";



  // There's really no good way to tell which browsers fail.
  // Right now Safari doesn't expose AudioContext (it's still webkitAudioContext)
  // so my hope is whenever they get around to actually supporting the 3+ year old
  // standard that things will actually work.
  var shittyBrowser = false;// window.AudioContext === undefined && /iPhone|iPad|iPod/.test(navigator.userAgent);
  var isMobile = false;// window.navigator.userAgent.match(/Android|iPhone|iPad|iPod|Windows Phone/i);
  var $ = document.querySelector.bind(document);
  var gl;
  var m4 = twgl.m4;
  var s = {
    screenshotCanvas: document.createElement("canvas"),
    restoreKey: "restore",
    show: !isMobile,
    inIframe: window.self !== window.top,
    running: true, // true vs.stop has not been called (this is inside the website)
    trackNdx: 0,   // next track to play
    currentTrackNdx: 0,  // track currently playing
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
    audioStarted: false,
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
        var errors =  gl.getProgramInfoLog(prg);
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

      if (vsErrors === undefined &&
          fsErrors === undefined &&
          prgErrors === undefined) {
        // success!
        _emit('success', _src);
        if (_programInfo) {
          gl.deleteProgram(_programInfo.program);
        }
        _programInfo = twgl.createProgramInfoFromProgram(gl, _prg);
      } else {
        // failure
        _emit('failure', [
          vsErrors || '',
          fsErrors || '',
          prgErrors || '',
        ].join("\n"));
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

    this.on = function(event, handler) {
      _handlers[event] = handler;
    };

    // Haha! userData, just like C++. Grrr!
    this.compile = function(vsrc, fsrc, userData) {
      _queue = [{vsrc: vsrc, fsrc: fsrc, userData: userData}];
      _processQueue();
    };

    this.getProgramInfo = function() {
      return _programInfo;
    };

    this.clear = function() {
      _programInfo = undefined;
    };

    this.isProcessing = function() {
      return _processing;
    };
  }

  function HistoryTexture(gl, options) {
    var _width = options.width;
    var type  = options.type || gl.UNSIGNED_BYTE;
    var format = options.format || gl.RGBA;
    var Ctor  = twgl.getTypedArrayTypeForGLType(type);
    var numComponents = twgl.getNumComponentsForFormat(format);
    var size  = _width * numComponents;
    var _buffer = new Ctor(size);
    var _texSpec = {
      src: _buffer,
      height: 1,
      min: options.min || gl.LINEAR,
      mag: options.mag || gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
      format: format,
      auto: false,  // don't set tex params or call genmipmap
    };
    var _tex = twgl.createTexture(gl, _texSpec);

    var _length = options.length;
    var _historyAttachments = [
      {
        format: options.historyFormat || gl.RGBA,
        type: type,
        mag: options.mag || gl.LINEAR,
        min: options.min || gl.LINEAR,
        wrap: gl.CLAMP_TO_EDGE,
      },
    ];

    var _srcFBI = twgl.createFramebufferInfo(gl, _historyAttachments, _width, _length);
    var _dstFBI = twgl.createFramebufferInfo(gl, _historyAttachments, _width, _length);

    var _historyUniforms = {
      u_mix: 0,
      u_mult: 1,
      u_matrix: m4.identity(),
      u_texture: undefined,
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
      m4.translation(
          [0, -(_length - 0.5) / _length, 0],
          _historyUniforms.u_matrix);
      m4.scale(
          _historyUniforms.u_matrix,
          [1, 1 / _length, 1],
          _historyUniforms.u_matrix);

      twgl.setUniforms(s.historyProgramInfo, _historyUniforms);
      twgl.drawBufferInfo(gl, s.quadBufferInfo);
    };

    this.getTexture = function getTexture() {
      return _dstFBI.attachments[0];
    };
  }

  function CPUHistoryTexture(gl, options) {
    var _width = options.width;
    var type  = options.type || gl.UNSIGNED_BYTE;
    var format = options.format || gl.RGBA;
    var Ctor  = twgl.getTypedArrayTypeForGLType(type);
    var numComponents = twgl.getNumComponentsForFormat(format);
    var _length = options.length;
    var _rowSize = _width * numComponents;
    var _size  = _rowSize * _length;
    var _buffer = new Ctor(_size);
    var _texSpec = {
      src: _buffer,
      height: _length,
      min: options.min || gl.LINEAR,
      mag: options.mag || gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
      format: format,
      auto: false,  // don't set tex params or call genmipmap
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
    var testAttachments = [
      {
        format: gl.RGBA,
        type: gl.FLOAT,
        mag: gl.NEAREST,
        min: gl.NEAREST,
        wrap: gl.CLAMP_TO_EDGE,
      },
    ];
    var testFBI = twgl.createFramebufferInfo(gl, testAttachments, 1, 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, testFBI.framebuffer);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  var storage;
  if (!s.inIframe) {
    try {
      storage = window.localStorage;  // apparently you can get a security error for this
    } catch (e) { // eslint-disable-line
    }
  }
  storage = storage || {
    getItem: function() {},
    setItem: function() {},
    removeItem: function() {},
  };

  function toggleMusic(setPauseFn) {
    setPauseFn = setPauseFn || function() {};
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
    var playNodes = playElems.map(function(playElem) {
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
      backgroundColor: [0, 0, 0, 1],
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
      animRects: [],
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
      vsrc = vsrc.replace(mainRE, function(m) {
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

    on(fullScreenElem, 'click', function(/* e */) {
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
          shader: getShader("vs").trim(),
        },
        audio: {
          num: 5000,
          mode: "LINES",
          sound: "https://soundcloud.com/caseandpoint/case-point-upgrade-free-download",
          lineSize: "NATIVE",
          backgroundColor: [0, 0, 0, 1],
          shader: getShader("vs2").trim(),
        },
        audio2: {
          num: 16384,
          mode: "LINES",
          sound: "https://soundcloud.com/chibi-tech/lolitazia-season",
          lineSize: "NATIVE",
          backgroundColor: [0, 0, 0, 1],
          shader: getShader("vs3").trim(),
        },
        spiro: {
          num: 20000,
          mode: "LINES",
          sound: "",
          lineSize: "NATIVE",
          backgroundColor: [1, 1, 1, 1],
          shader: getShader("vs4").trim(),
        },
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
        u_matrix: m4.identity(),
      };

      var saveArt = function(e) {
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
        format: gl.ALPHA,
      });

      s.soundHistory = new HistoryTexture(gl, {
        width: s.numSoundSamples,
        length: s.numHistorySamples,
        format: gl.ALPHA,
      });

      if (s.canUseFloat && s.canRenderToFloat) {
        var floatFilter = s.canFilterFloat ? gl.LINEAR : gl.NEAREST;
        s.floatSoundHistory = new HistoryTexture(gl, {
          width: s.numSoundSamples,
          length: s.numHistorySamples,
          min: floatFilter,
          mag: floatFilter,
          format: gl.ALPHA,
          type: gl.FLOAT,
        });
      }

      s.touchColumns = 32;
      s.touchHistory = new (s.canRenderToFloat ? HistoryTexture : CPUHistoryTexture)(gl, {
        width: s.touchColumns,
        length: s.numHistorySamples,
        type: s.canUseFloat ? gl.FLOAT : gl.UNSIGNED_BYTE,
        min: gl.NEAREST,
        mag: gl.NEAREST,
      });

      var count = new Float32Array(g.maxCount);
      for (var ii = 0; ii < count.length; ++ii) {
        count[ii] = ii;
      }
      var arrays = {
        vertexId: { data: count, numComponents: 1 },
      };
      s.countBufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
      s.quadBufferInfo = twgl.createBufferInfoFromArrays(gl, {
        position: { numComponents: 2, data: [-1, -1, 1, -1, -1, 1, 1, 1] },
        texcoord: [0, 0, 1, 0, 0, 1, 1, 1],
        indices: [0, 1, 2, 2, 1, 3],
      });

      s.sc = new function() {
        //var _clientId;
        var _authToken;
        var _authTokenExpireTime;
        var log = function() {
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
            setTimeout(function() {
              callback(null, _authToken);
            });
            return;
          }
          const u = new URL('/token?format=json', window.location.href);
          //console.log(u.href);
          fetch(u.href)
            .then(res => res.json())
            .then(data => {
              log("response from token:", JSON.stringify(data));
              if (data.error) {
                callback(error);
                return;
              }
              _authToken = data.token;
              _authTokenExpireTime = data.expires_in + getCurrentTimeInSeconds() - 10;
              callback(null, _authToken);
            })
            .catch(err => {
              log("error:", err);
              callback(err);
            });
        };
        var sendJSON = function sendJSON(url, data, callback, options = {}) {
          getSoundCloudToken(function(error, token) {
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
          fetch(`/track_url?${new URLSearchParams({format: 'json', url}).toString()}`)
            .then(res => res.json())
            .then(data => {
              if (data.error) {
                throw data.error;
              }
              callback(null, data.url);
            })
            .catch(err => callback(err));
        };

        this.initialize = function(/*options*/) {
          //_clientId = options.client_id;
        };
        this.get = function(url, options, callback) {

          options = JSON.parse(JSON.stringify(options));
          var provideResult = function(fn) {
            //options.client_id = _clientId;
            options.format = "json";
            options["_status_code_map[302]"] = 200;
            var scUrl = "https://api.soundcloud.com" + url + misc.objectToSearchString(options);

            var handleResult = function(err, obj) {
              if (!err) {
                if (obj.status && obj.status.substr(0, 3) === "302" && obj.location) {
                  sendJSON(obj.location, {}, handleResult, { method: "GET"});
                  return;
                }
              }
              fn(obj, err);
            };

            sendJSON(scUrl, {}, handleResult, {
              method: "GET",
            });
          };

          if (callback) {
            provideResult(callback);
          } else {
            return {
              then: function(fn) {
                provideResult(fn);
                return {
                  catch: function() {
                  },
                };
              },
            };
          }
        };
      }();

      var longName = "This is a really long name that might mess up formatting so let's use it to test that long names don't totally mess up formatting just so we have some idea of how messed up things can get if we don't set any limits";
      var music = [
        {
          title: q.long ? longName : "DOCTOR VOX - Level Up [Argofox]",
          streamable: true,
          stream_url: "/static/resources/sounds/DOCTOR VOX - Level Up - lofi.mp3",
          permalink_url: "http://soundcloud.com/argofox",
          user: {
            username: q.long ? longName : "Argofox Creative Commons",
            permalink_url: "http://soundcloud.com/argofox",
          },
        },
        {
          title: q.long ? longName : "Cab Calloway/Andrews Sisters Mashup",
          streamable: true,
          stream_url: "/static/resources/sounds/doin' the rumba 4 - lofi.mp3",
          permalink_url: "https://soundcloud.com/ecklecticmick/doin-the-rumba",
          user: {
            username: q.long ? longName : "DJ Ecklectic Mick",
            permalink_url: "https://soundcloud.com/ecklecticmick",
          },
        },
        {
          title: q.long ? longName : "Oh The Bass! (feat Fab Marq )",
          streamable: true,
          stream_url: "/static/resources/sounds/Oh The Bass! - lofi.mp3",
          permalink_url: "https://soundcloud.com/djloveboat/oh-the-bass-feat-fab-marq",
          user: {
            username: q.long ? longName : "djloveboat",
            permalink_url: "https://soundcloud.com/djloveboat",
          },
        },
      ];

      if (!s.sc || shittyBrowser || isMobile || q.local) {
        s.sc = new function() {
          function noop() {
          }
          this.initialize = noop;
          this.get = function(url, options, callback) {

            var provideResult = function(fn) {
              setTimeout(function() {
                fn(randomElement(music));
              }, 1);
            };

            if (callback) {
              provideResult(callback);
            } else {
              return {
                then: function(fn) {
                  provideResult(fn);
                  return {
                    catch: function() {
                    },
                  };
                },
              };
            }
          };
        }();
      }

      s.sc.initialize({
        client_id: g.soundCloudClientId,
      });

      s.streamSource = audioStreamSource.create({
        context: s.context,
        autoPlay: true,
        crossOrigin: "anonymous",
      });

      s.programManager = new ProgramManager(gl);

      s.editorElem = editorElem;
      s.cm = CodeMirror(editorElem, {  // eslint-disable-line
        value: "",
        theme: "blackboard",
        mode: "x-text/x-glsl",
        lineNumbers: false,
        scrollbarStyle: "overlay",
      });
    }

    s.streamSource.on('error', function(e) {
      e = e || "music error";
      console.error(e);
      setPlayState();
      var tracks = s.playlist.splice(s.currentTrackNdx, 1);
      s.trackNdx = s.currentTrackNdx;
      var msg = (tracks && tracks.length) ? (isMic(tracks[0]) ? "" : tracks[0].title) : "";
      setSoundSuccessState(false, "Error streaming music: " + msg + " : " + e.toString());
      playNextTrack();
    });
    s.streamSource.on('newSource', function(source) {
      if (!s.running) {
        s.streamSource.stop();
        return;
      }
      source.connect(s.analyser);
      setPlayState();
      setSoundSuccessState(true);
    });
    s.streamSource.on('ended', function() {
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
        g.restoreCleared = true;  // just in case
        storage.setItem(s.restoreKey, JSON.stringify({
          pathname: window.location.pathname,
          settings: settings,
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
    on(window, 'resize', function() {
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
      var w = ctx.canvas.width  / gl.canvas.width;
      var h = ctx.canvas.height / gl.canvas.height;
      var scale = Math.max(w, h);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.save();
      ctx.translate(ctx.canvas.width / 2 , ctx.canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(gl.canvas.width / -2, gl.canvas.height / -2);
      ctx.drawImage(gl.canvas, 0, 0);
      ctx.restore();
      return {
        width: ctx.canvas.width,
        height: ctx.canvas.height,
        dataURL: ctx.canvas.toDataURL.apply(ctx.canvas, arguments),
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
      container: document.body,
    });
    function addNotification(msg) {
      notifier.add({text: msg});
    }

    function setSoundSource(src) {
      console.log("soundSoundSource:", src);
      if (isMic(src)) {
        s.streamSource.setSource(src);
      } else {
        s.sc.getRealStreamURL(src, function(err, url) {
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

    playElems.forEach(function(playElem) {
      on(playElem, 'click', function() {
        toggleMusic(setMusicPause);
        setPlayState();
      });
    });

    function setPlayState() {
      playNodes.forEach(function(playNode) {
        playNode.nodeValue = s.streamSource.isPlaying() ? _pauseIcon : _playIcon;
      });
    }

    function setLockState() {
      lockElem.dataset.tooltip = s.lockMusic ? "unlock music" : "lock music";
      lockElemImg.src = "/static/resources/images/" + (s.lockMusic ? "lock.svg" : "unlock.svg");
    }

    on(lockElem, 'click', function() {
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
        var src = track.stream_url;// + '?client_id=' + g.soundCloudClientId;
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
        fetch(`/resolve?${new URLSearchParams({format: 'json', url})}`)
          .then(res => res.json())
          .then(result => {
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
          })
          .catch(err => {
            console.error("bad url:", url, err);
            setSoundSuccessState(false, "not a valid soundcloud url? " + (err.message ? err.message : ""));
          });
      }
    }

    on(soundElem, 'change', function(e) {
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
      "TRIANGLES": gl.TRIANGLES,
    };

    var validLineSizes = {
      "NATIVE": true,
      "CSS": true,
    };

    var saveElem = $("#save");

    function updateStop() {
      goIconElem.style.display   = !g.pause ? "none" : "inline-block";
      stopIconElem.style.display =  g.pause ? "none" : "inline-block";
    }

    on(stopElem, 'click', function() {
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
      g.errorLines.forEach(function(lineHandle) {
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
      var newShader  = settings.shader;
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

    s.programManager.on('success', function(e) {
      settings.shader = e.userData;
      setShaderSuccessStatus(true);
      clearLineErrors();
    });
    s.programManager.on('failure', function(errors) {
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
        startTime: g.time,
      };
      g.animRects.push(anim);
    }

    function clearVisualizers() {
      q.showHistory = false;
      q.showWave = false;
    }

    var uiModes = {
      '#ui-off': function(animate) {
        if (animate) {
          if (editorElem.style.display !== "none") {
            animateElemRect({
              from: editorElem,
              to: uimodeElem,
              duration: 0.5,
            });
          }
          if (commentAreaElem.style.display !== "none") {
            animateElemRect({
              from: commentAreaElem,
              to: uimodeElem,
              duration: 0.5,
            });
          }
        }
        editorElem.style.display = "none";
        commentAreaElem.style.display = "none";
        centerSizeElem.className = "";
        gl.canvas.style.width = "100%";
      },
      '#ui-one': function() {
        s.show = true;
        editorElem.style.display = "block";
        commentAreaElem.style.display = "none";
        editorWrapElem.style.flex = "1 0 100%";
        commentWrapElem.style.flex = "1 0 0";
        gl.canvas.style.width = "100%";
        centerSizeElem.className = "";
        s.cm.refresh();
      },
      '#ui-2v': function() {
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
      '#ui-ea': function() {
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
      '#ui-ae': function() {
        s.show = true;
        editorElem.style.display = "block";
        commentAreaElem.style.display = "none";
        editorWrapElem.style.flex = "0 0 50%";
        commentWrapElem.style.flex = "1 0 0";
        gl.canvas.style.width = "50%";
        art.className = "artleft";
        centerSizeElem.className = "editright";
        s.cm.refresh();
      },
    };

    function setUIMode(mode, animate) {
      mode = mode || '#ui-2v';
      uiModes[mode](animate);
    }

    Object.keys(uiModes).forEach(function(mode) {
      on($(mode), 'click', function() {
        s.uiMode = mode;
        setUIMode(mode);
      });
    });

    uimodeDropdownElem.style.display = "none";
    on(uimodeElem, 'click', function(e) {
      e.stopPropagation();
      uimodeDropdownElem.style.display = "";
      var id1;
      var id2;

      var closeDropdown = function(e) {
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

    on(numRangeElem, 'input', function(e) {
      var num = parseInt(e.target.value);
      numElem.value = num;
      settings.num = num;
    });

    var modeElem = $("#mode");
    on(modeElem, 'change', function(e) {
      settings.mode = e.target.value.toUpperCase();
      g.mode = validModes[settings.mode];
    });

    var sizeElem = $("#size");
    on(sizeElem, 'change', function(e) {
      settings.lineSize = e.target.value.toUpperCase();
    });

    var timeElem = $("#time");
    on(timeElem, 'click', function(/* e */) {
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
    on(showsoundtextureElem, 'click', function(e) {
      e.stopPropagation();
      clearVisualizers();
      hideHelp();
      q.showHistory = true;
    });

    var showwaveElem = $("#showwave");
    on(showwaveElem, 'click', function(e) {
      e.stopPropagation();
      clearVisualizers();
      hideHelp();
      q.showWave = true;
    });

    function showHelp() {
      helpDialogElem.style.display = (helpDialogElem.style.display !== "") ? "" : "none";
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
      if (!haveBG ||
          !bgIsArray ||
          !bgLenIs4 ||
          !bgAllNum) {
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
        } catch (e) {  // eslint-disable-line
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

      setTimeout(function() {
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
        on($("#start"), 'click', function() {
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
        Array.prototype.forEach.call(document.querySelectorAll("a"), function(a) {
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
        pixels = (l * soundTime.clientWidth) | 0;
      }
      if (pixels !== g.soundTimePixelWidth) {
        g.soundTimePixelWidth = pixels;
        soundTime.style.background = "linear-gradient(90deg, rgba(30,30,30,0.7) " + (l * 100).toFixed(2) + "%, rgba(0,0,0,0.7) " + (l * 100). toFixed(2) + "%)";
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
      _dontUseDirectly_pointSize: 1,
    };

    var historyUniforms = {
      u_mix: 0,
      u_matrix: m4.identity(),
      u_texture: undefined,
    };

    function renderScene(volumeHistoryTex, touchHistoryTex, soundHistoryTex, floatSoundHistoryTex, time, lineSize, mouse) {
      twgl.bindFramebufferInfo(gl);

      var size = lineSize === "NATIVE" ? 1 : (window.devicePixelRatio || 1);
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
      var to   = animRect.to;

      var left   = lerp(from.left,   to.left,   l);
      var top    = lerp(from.top,    to.top,    l);
      var right  = lerp(from.right,  to.right,  l);
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
      if (!g.requestId && (force || !g.wasRendered || (s.running && !g.pause)) || g.animRects.length) {
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
      x = x *  2 - 1;
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
      var y = (e.clientY - rect.top ) / h;

      g.mouse[0] = x *  2 - 1;
      g.mouse[1] = y * -2 + 1;
      addTouchPosition(0, x, y);
    }

    function recordMouseDown(/* e */) {
      addTouchPressure(0, 1);
    }

    function recordMouseUp(/* e */) {
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
        var y = (t.clientY - rect.top)  / h;
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
    on(window, 'mousemove', function() {
      // don't unhide on mousemove because some pieces take mouse movement
      if (!s.uiHidden) {
        recordInputAndMakeUIVisible(5);
      }
    });

    this.stop = function(keepMusic) {
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
    this.getSettings = function() {
      return JSON.parse(JSON.stringify(settings));
    };
    this.getSets = function() {
      return s.sets;
    };
    this.markAsSaved = markAsSaved;
    this.markAsSaving = markAsSaving;
    this.isSaveable = function() {
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
      screenshotURL: '/static/resources/images/heart-liked.svg',
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
    shader: [
      "// -----[ shader missing! ] -----",
      "",
      "#define NUM 15.0",
      "void main() {",
      "  gl_PointSize = 64.0;",
      "  float col = mod(vertexId, NUM + 1.0);",
      "  float row = mod(floor(vertexId / NUM), NUM + 1.0); ",
      "  float x = col / NUM * 2.0 - 1.0;",
      "  float y = row / NUM * 2.0 - 1.0;",
      "  gl_Position = vec4(x, y, 0, 1);",
      "  v_color = vec4(fract(time + col / NUM + row / NUM), 0, 0, 1);",
      "}",
    ].join("\n"),
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
    markAsSaving: markAsSaving,
  };
});
