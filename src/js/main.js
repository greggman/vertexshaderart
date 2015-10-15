requirejs([
    '../3rdparty/audiostreamsource',
    '../3rdparty/codemirror/lib/codemirror',
    '../3rdparty/colorutils',
    '../3rdparty/cssparse',
    '../3rdparty/glsl',
    '../3rdparty/twgl-full',
    '../3rdparty/notifier',
    './misc',
    './strings',
  ], function(
     audioStreamSource,
     CodeMirror,
     colorUtils,
     cssParse,
     glsl,
     twgl,
     Notifier,
     misc,
     strings
  ) {

  "use strict";

  var isMobile = window.navigator.userAgent.match(/Android|iPhone|iPad|iPod|Windows Phone/i);
  var $ = document.querySelector.bind(document);
  var gl = twgl.getWebGLContext(document.getElementById("c"), { alpha: false });
  if (!gl) {
    $("#nogl").style.display = "";
    return;
  }
  var m4 = twgl.m4;
  var _pauseIcon = "❚❚";
  var _playIcon = "▶";
  var editorElem = $("#editor");
  var soundElem = $("#sound");
  var soundLinkElem = $("#soundLink")
  var soundLinkNode = misc.createTextNode(soundLinkElem);
  var soundcloudElem = $("#soundcloud");
  var bandLinkElem = $("#bandLink");
  var bandLinkNode = misc.createTextNode(bandLinkElem);
  var playElem = $("#play");
  var playNode = misc.createTextNode(playElem, _playIcon);
  var restoreKey = "restore";

  var historyProgramInfo = twgl.createProgramInfo(gl, ["history-vs", "history-fs"]);

  var storage = window.localStorage || {
    getItem: function() {},
    setItem: function() {},
  };

  var g = {
    maxCount: 100000,
    mode: gl.LINES,
    time: 0,
    mouse: [0, 0],
    shaderSuccess: false,
    vsHeader: $("#vs-header").text,
    fSource: $("#fs").text,
    errorLines: [],
    show: true,
    soundCloudClientId: '3f4914e324f9caeb23c521f0f1835a60',
  };
  g.errorLineNumberOffset = -g.vsHeader.split("\n").length;

  var q = misc.parseUrlQuery();
  var sets = {
    default: {
      num: 10000,
      mode: "LINES",
      sound: "",
      lineSize: "NATIVE",
      backgroundColor: [0, 0, 0, 1],
      shader: $("#vs").text.trim(),
    },
    audio: {
      num: 5000,
      mode: "LINES",
      sound: "https://soundcloud.com/caseandpoint/case-point-upgrade-free-download",
      lineSize: "NATIVE",
      backgroundColor: [0, 0, 0, 1],
      shader: $("#vs2").text.trim(),
    },
    audio2: {
      num: 16384,
      mode: "LINES",
      sound: "https://soundcloud.com/chibi-tech/lolitazia-season",
      lineSize: "NATIVE",
      backgroundColor: [0, 0, 0, 1],
      shader: $("#vs3").text.trim(),
    },
  };
  var settings = sets[q.settings];
  if (!settings) {
    settings = sets.default;
  }

  var restoreStr = storage.getItem(restoreKey);
  if (restoreStr) {
    try {
      var restore = JSON.parse(restoreStr);
      if (restore.pathname === window.location.pathname) {
        settings = restore.settings;
      }
    } catch (e) {
    }
  }

  function clearRestore() {
    if (!document.hidden && !g.restoreCleared) {
      g.restoreCleared = true;
      storage.removeItem(restoreKey);
    }
  }

  var origSettings = JSON.parse(JSON.stringify(settings));

  window.addEventListener('beforeunload', function() {
    if (!misc.deepCompare(settings, origSettings)) {
      g.restoreCleared = true;  // just in case
      storage.setItem(restoreKey, JSON.stringify({
        pathname: window.location.pathname,
        settings: settings,
      }));
    }
  });
  document.addEventListener('visibilitychange', clearRestore);
  clearRestore();

  var sc = window.SC;
  if (!sc || q.local) {
    sc = new function() {
      function noop() {
        console.log("noop");
      };
      this.initialize = noop;
      this.get = function(url, options) {
        return {
          then: function(fn) {
            setTimeout(function() {
              fn({
                streamable: true,
                stream_url: "/src/sounds/DOCTOR VOX - Level Up - lofi.mp3",
              });
            }, 1);
            return {
              catch: function() {
              },
            };
          },
        };
      }
    }
  }

  var notifier = new Notifier({
    timeout: 7.5,
    container: document.body,
  });
  function addNotification(msg) {
    notifier.add({text: msg});
  }

  // There's really no good way to tell which browsers fail.
  // Right now Safari doesn't expose AudioContext (it's still webkitAudioContext)
  // so my hope is whenever they get around to actually supporting the 3+ year old
  // standard that things will actually work.
  var shittyBrowser = window.AudioContext === undefined && /iPhone|iPad|iPod/.test(navigator.userAgent);
  var context = new (window.AudioContext || window.webkitAudioContext)();
  var analyser = context.createAnalyser();
  analyser.connect(context.destination);

  var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  var soundTexBuffer = new Uint8Array(Math.min(maxTextureSize, analyser.frequencyBinCount));
  var soundTexSpec = {
    src: soundTexBuffer,
    height: 1,
    min: gl.LINEAR,
    mag: gl.LINEAR,
    wrap: gl.CLAMP_TO_EDGE,
    format: gl.ALPHA,
  }
  var soundTex = twgl.createTexture(gl, soundTexSpec);
  var numHistorySamples = 60 * 4; // 4 seconds
  var historyAttachments = [
    {
      format: gl.RGBA,
      mag: gl.LINEAR,
      min: gl.LINEAR,
      wrap: gl.CLAMP_TO_EDGE,
    },
  ];
  if (q.showHistory) {
    console.log("history size:", soundTexBuffer.length, numHistorySamples);
  }

  var historySrcFBI = twgl.createFramebufferInfo(gl, historyAttachments, soundTexBuffer.length, numHistorySamples);
  var historyDstFBI = twgl.createFramebufferInfo(gl, historyAttachments, soundTexBuffer.length, numHistorySamples);

  sc.initialize({
    client_id: g.soundCloudClientId,
  });

  g.streamSource = audioStreamSource.create({
    context: context,
    loop: true,
    autoPlay: true,
    crossOrigin: "anonymous",
  });
  g.streamSource.on('error', function(e) {
    console.error(e);
    setPlayState();
    setSoundSuccessState(false, e.toString());
  });
  g.streamSource.on('newSource', function(source) {
    source.connect(analyser);
    setPlayState();
    setSoundSuccessState(true);
  });
  g.streamSource.on('clickToStart', function() {
    if (!g.startMobileSound) {
      if (!g.waitMobileSound) {
        g.waitMobileSound = true;
        $("#startSound").style.display = "";
        $("#startSound").addEventListener('click', function() {
          $("#startSound").style.display = "none";
          g.streamSource.play();
        });
      }
    }
  });

  function setSoundSource(src) {
    g.streamSource.setSource(src);
  }

  playElem.addEventListener('click', function() {
    if (g.streamSource.isPlaying()) {
      g.streamSource.stop();
    } else {
      g.streamSource.play();
    }
    setPlayState();
  });

  function setPlayState() {
    playNode.nodeValue = g.streamSource.isPlaying() ? _pauseIcon : _playIcon;
  }

  function setLinkOrHide(elem, link) {
    elem.style.display = link ? "inline-block" : "none";
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
    soundLinkNode.nodeValue = options.title || "";
    bandLinkNode.nodeValue = options.user.username || "";
    if (cm) {
      cm.refresh();
    }
  }
  setSoundLink();

  function setSoundUrl(url) {
    if (!url) {
      g.streamSource.stop();
      setPlayState();
      setSoundLink();
      return;
    }
    sc.get("/resolve", { url: url })
    .then(function(result) {
      if (result.streamable && result.stream_url) {
        var src = result.stream_url + '?client_id=' + g.soundCloudClientId;
        setSoundSource(src);
        setSoundLink(result);
      } else {
        console.error("not streamable:", url);
        setSoundSuccessState(false, "not streamable according to soundcloud");
      }
    })
    .catch(function(e) {
      console.error("bad url:", url, e);
      setSoundSuccessState(false, "not a valid soundcloud url?");
    });
  }

  soundElem.addEventListener('change', function(e) {
    var url = e.target.value.trim();
    if (url != settings.sound) {
      settings.sound = url;
      setSoundUrl(url);
    }
  });

  var validModes = {
    "LINES": gl.LINES,
    "LINE_STRIP": gl.LINE_STRIP,
    "LINE_LOOP": gl.LINE_LOOP,
    "POINTS": gl.POINTS,
    "TRI_STRIP": gl.TRIANGLE_STRIP,
    "TRI_FAN": gl.TRIANGLE_FAN,
    "TRIANGLES": gl.TRIANGLS,
  };

  var validLineSizes = {
    "NATIVE": true,
    "CSS": true,
  }

  var saveElem = $("#save");
  saveElem.addEventListener('click', function() {
    console.log("save");
  });

  function setSoundSuccessState(success, msg) {
    soundElem.style.borderColor = success ? "" : "red";
    if (!success && msg) {
      addNotification(msg);
    }
  }

  setShaderSuccessStatus(false);

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
    }
  };

  function setShaderSuccessStatus(success) {
    editorElem.style.borderColor = success ? "" : "red";
    saveElem.disabled = !success;
    g.shaderSuccess = success;
  }

  function clearLineErrors() {
    g.errorLines.forEach(function(lineHandle) {
      cm.doc.removeLineClass(lineHandle, "background", "errorLine");
    });
    g.errorLines = [];
  }

  var programManager = new ProgramManager(gl);
  programManager.on('success', function(e) {
    setShaderSuccessStatus(true);
    settings.shader = e.userData;
    clearLineErrors();
  });
  programManager.on('failure', function(errors) {
    setShaderSuccessStatus(false);

    clearLineErrors();

    var errorRE = /ERROR\:\s*0\:(\d+)/g;
    do {
      var m = errorRE.exec(errors);
      if (m) {
        var lineNum = parseInt(m[1]);
        if (!isNaN(lineNum) && lineNum > 0) {
          lineNum += g.errorLineNumberOffset;
          var lineHandle = cm.doc.getLineHandle(lineNum);
          if (lineHandle) {
            g.errorLines.push(lineHandle);
            cm.doc.addLineClass(lineHandle, "background", "errorLine");
          }
        }
      }
    } while (m);
  });

  function clamp(min, max, v) {
    return Math.min(max, Math.max(min, v));
  }

  var hideElem = $("#hide");
  var hideNode = misc.createTextNode(hideElem, "hide");
  function showCode(show) {
    g.show = show;
    hideNode.nodeValue = g.show ? "hide" : "show";
    editorElem.style.display = g.show ? "block" : "none";
    if (cm) {
      cm.refresh();
    }
  }
  hideElem.addEventListener('click', function() {
    showCode(!g.show);
  });
  if (isMobile) {
    showCode(false);
  }

  var colorElem = $("#background");
  colorElem.addEventListener('change', function(e) {
    settings.backgroundColor = cssParse.parseCSSColor(e.target.value, true);
  });

  var numElem = $("#num");
  var numRangeElem = $("#numRange");

  function handleNumEdit(e) {
    var num = clamp(1, g.maxCount, parseInt(e.target.value)) | 0;
    numRangeElem.value = num;
    settings.num = num;
  }
  numElem.addEventListener('change', handleNumEdit);
  numElem.addEventListener('input', handleNumEdit);

  numRangeElem.addEventListener('input', function(e) {
    var num = parseInt(e.target.value);
    numElem.value = num;
    settings.num = num;
  });

  var modeElem = $("#mode");
  modeElem.addEventListener('change', function(e) {
    settings.mode = e.target.value.toUpperCase();
    g.mode = validModes[settings.mode];
  });

  var sizeElem = $("#size");
  sizeElem.addEventListener('change', function(e) {
    settings.lineSize = e.target.value.toUpperCase();
  });

  var timeElem = $("#time");
  timeElem.addEventListener('click', function(e) {
    g.time = 0;
  });

  var helpElem = $("#help");
  var helpDialogElem = $("#helpDialog");
  helpElem.addEventListener('click', function(e) {
    helpDialogElem.style.display = "";
  });
  helpDialogElem.addEventListener('click', function(e) {
    helpDialogElem.style.display = "none";
  });

  window.addEventListener('mousemove', function(e) {
    g.mouse = [
      e.clientX / window.innerWidth  *  2 - 1,
      e.clientY / window.innerHeight * -2 + 1,
    ];
  });

  function isAllNumbers(array) {
    for (var ii = 0; ii < array.length; ++ii) {
      if (typeof array[ii] !== 'number') {
        return false;
      }
    }
    return true;
  }

  var cm = CodeMirror(editorElem, {
    value: "",
    theme: "blackboard",
    mode: "x-text/x-glsl",
    lineNumbers: true,
  });
  cm.refresh();

  var count = new Float32Array(g.maxCount);
  for (var ii = 0; ii < count.length; ++ii) {
    count[ii] = ii;
  }
  var arrays = {
    vertexId: { data: count, numComponents: 1 },
  };
  var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  var quadBufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 2, data: [-1, -1, 1, -1, -1, 1, 1, 1] },
    texcoord: [0, 0, 1, 0, 0, 1, 1, 1],
    indices: [0, 1, 2, 2, 1, 3],
  });

  function getMode(mode) {
    var m = modes[mode];
    return m === undefined ? gl.LINES : m;
  }

  var mainRE = /(void[\s\S]+main[\s\S]*\([\s\S]*\)[\s\S]*\{)/g;
  function tryNewProgram(text) {
    var vsrc = g.vsHeader + text;
    vsrc = vsrc.replace(mainRE, function(m) {
      return m + "gl_PointSize=1.0;";
    });
    var lastBraceNdx = vsrc.lastIndexOf("}");
    if (lastBraceNdx >= 0) {
      var before = vsrc.substr(0, lastBraceNdx);
      var after = vsrc.substr(lastBraceNdx);
      vsrc = before + ";gl_PointSize *= _dontUseDirectly_pointSize;" + after;
    }
    programManager.compile(vsrc, g.fSource, text);
  }

  var oldText;
  var oldTrimmedText;

  var lineCommentRE = /\/\/.*/g;
  var blockCommentRE = /\/\*[\s\S]*?\*\//g;
  var whiteSpaceRE = /[ \t][ \t]+/g
  var eolRE = /\n\n+/g
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
      oldText = text;
      oldTrimmedText = trimmedText;
      tryNewProgram(text);
    }
  }

  cm.on('change', handleChange);

  function validateSettings(settings) {
    settings.num = clamp(1, g.maxCount, (settings.num || 10000) | 0);
    if (validModes[settings.mode] === undefined) {
      settings.mode = "LINES";
    }
    if (validLineSizes[settings.lineSize] === undefined) {
      settings.lineSize = "NATIVE";
    }
    if (!settings.backgroundColor ||
        !Array.isArray(settings.backgroundColor) ||
        !settings.backgroundColor.length != 4 ||
        !isAllNumbers(settings.backgroundColor)) {
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

  function setSettings(settings) {
    validateSettings(settings);
    setUISettings(settings);

    g.mode = validModes[settings.mode];
    //shader// test bad

    setSoundUrl(settings.sound);
    cm.doc.setValue(settings.shader);

    // not needed because cm.doc.setValue will trigger change event
    //tryNewProgram(settings.shader);
  }
  setSettings(settings);

  var uniforms = {
    time: 0,
    resolution: [1, 1],
    mouse: [0, 0],
    sound: undefined,
    soundRes: [soundTexBuffer.length, numHistorySamples],
    _dontUseDirectly_pointSize: 1,
  };

  var historyUniforms = {
    u_matrix: m4.identity(),
    u_texture: undefined,
  }

  function renderScene(soundHistoryTex, time, lineSize) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var size = lineSize === "NATIVE" ? 1 : (window.devicePixelRatio || 1);
    gl.lineWidth(size);

    gl.clearColor.apply(gl, settings.backgroundColor);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var programInfo = programManager.getProgramInfo();
    if (programInfo) {

      uniforms.time = time;
      uniforms.resolution[0] = gl.canvas.width;
      uniforms.resolution[1] = gl.canvas.height;
      uniforms.mouse[0] = g.mouse[0];
      uniforms.mouse[1] = g.mouse[1];
      uniforms._dontUseDirectly_pointSize = size;
      uniforms.sound = soundHistoryTex;

      gl.useProgram(programInfo.program);
      twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, g.mode, bufferInfo, settings.num);
    }
  }

  function updateSoundHistory() {
    // Swap src & dst
    var temp = historySrcFBI;
    historySrcFBI = historyDstFBI;
    historyDstFBI = temp;

    // draw to test
    gl.bindFramebuffer(gl.FRAMEBUFFER, historyDstFBI.framebuffer);
    gl.viewport(0, 0, soundTexBuffer.length, numHistorySamples);

    // Copy audio data to Nx1 texture
    analyser.getByteFrequencyData(soundTexBuffer);
//  analyser.getByteTimeDomainData(soundTexBuffer);
    twgl.setTextureFromArray(gl, soundTex, soundTexSpec.src, soundTexSpec);

    gl.useProgram(historyProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, historyProgramInfo, quadBufferInfo);

    // copy from historySrc to historyDst one pixel down
    historyUniforms.u_texture = historySrcFBI.attachments[0];
    m4.translation([0, 2 / numHistorySamples, 0], historyUniforms.u_matrix);

    twgl.setUniforms(historyProgramInfo, historyUniforms);
    twgl.drawBufferInfo(gl, gl.TRIANGLES, quadBufferInfo);

    // copy audio data into top row of historyDst
    historyUniforms.u_texture = soundTex;
    m4.translation(
        [0, -(numHistorySamples - 0.5) / numHistorySamples, 0],
        historyUniforms.u_matrix)
    m4.scale(
        historyUniforms.u_matrix,
        [1, 1 / numHistorySamples, 1],
        historyUniforms.u_matrix);

    twgl.setUniforms(historyProgramInfo, historyUniforms);
    twgl.drawBufferInfo(gl, gl.TRIANGLES, quadBufferInfo);
  }

  function renderSoundHistory() {
    gl.useProgram(historyProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, historyProgramInfo, quadBufferInfo);
    m4.identity(historyUniforms.u_matrix);
    historyUniforms.u_texture = historyDstFBI.attachments[0];
    //historyUniforms.u_texture = soundTex;
    twgl.setUniforms(historyProgramInfo, historyUniforms);
    twgl.drawBufferInfo(gl, gl.TRIANGLES, quadBufferInfo);
  }

  function render(time) {
    time *= 0.001;
    var now = time;
    var elapsed = now - (g.then || 0);
    g.then = now;
    g.time += elapsed;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    updateSoundHistory();

    renderScene(historyDstFBI.attachments[0], g.time, settings.lineSize);

    if (q.showHistory) {
      renderSoundHistory();
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
});
