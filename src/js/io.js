/*
 * Copyright 2014, Gregg Tavares.
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

/**
 * Misc IO functions
 * @module IO
 */
define(function() {
  //var log = function() { };
  //var log = console.log.bind(console);

  /**
   * @typedef {Object} Request~Options
   * @memberOf module:IO
   * @property {number?} timeout. Timeout in ms to abort.
   *        Default = no-timeout
   * @property {string?} method default = POST.
   * @property {string?} inMimeType default = text/plain
   * @property {Object{key,value}} headers
   */

  /**
   * Make an http request request
   * @memberOf module:IO
   * @param {string} url url to request.
   * @param {string?} content to send.
   * @param {!function(error, string, xml)} callback Function to
   *        call on success or failure. If successful error will
   *        be null, object will be result from request.
   * @param {module:IO~Request~Options?} options
   */
  var request = function(url, content, callback, options) {
    content = content || "";
    options = options || { };
    const reqOptions = {
      method: options.method || 'POST',
      headers: {
        'Content-Type': options.mimeType || 'text/plain',
      },
    };

    if (options.headers) {
      Object.assign(reqOptions.headers, options.headers);
    }
    if (options.body) {
      reqOptions.body = options.body;
    }

    let resolve;
    let reject;
    const p = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    if (options.timeout) {
      setTimeout(() => reject('timeout'), options.timeout);
    }

    fetch(url, reqOptions)
      .then(res => res.text())
      .then(resolve)
      .catch(reject);

    p.then(data => callback(null, data))
     .catch(err => callback(err));

  };

  /**
   * sends a JSON 'POST' request, returns JSON repsonse
   * @memberOf module:IO
   * @param {string} url url to POST to.
   * @param {Object=} jsonObject JavaScript object on which to
   *        call JSON.stringify.
   * @param {!function(error, object)} callback Function to call
   *        on success or failure. If successful error will be
   *        null, object will be json result from request.
   * @param {module:IO~Request~Options?} options
   */
  var sendJSON = function(url, jsonObject, callback, options) {
    options = JSON.parse(JSON.stringify(options || {}));
    options.headers = options.headers || {};
    options.headers["Content-type"] = "application/json";
    return request(
      url,
      JSON.stringify(jsonObject),
      function(err, content) {
        if (err) {
          return callback(err);
        }
        try {
          var json = JSON.parse(content);
        } catch (e) {
          return callback(e);
        }
        return callback(null, json);
      },
      options);
  };

  var makeMethodFunc = function(method) {
    return function(url, content, callback, options) {
      options = JSON.parse(JSON.stringify(options || {}));
      options.method = method;
      return request(url, content, callback, options);
    };
  };

  return {
    get: makeMethodFunc("GET"),
    post: makeMethodFunc("POST"),
    "delete": makeMethodFunc("DELETE"),
    put: makeMethodFunc("PUT"),
    request: request,
    sendJSON: sendJSON,
  };
});


