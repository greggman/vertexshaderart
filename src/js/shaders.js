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
"use strict";

define(function() {
  return {
  // ===========================================================
  "vs-header": `
attribute float vertexId;

uniform vec2 mouse;
uniform vec2 resolution;
uniform vec4 background;
uniform float time;
uniform float vertexCount;
uniform sampler2D volume;
uniform sampler2D sound;
uniform sampler2D floatSound;
uniform sampler2D touch;
uniform vec2 soundRes;
uniform float _dontUseDirectly_pointSize;

varying vec4 v_color;
  `,
  // ===========================================================
  "vs": `
#define PI radians(180.)
#define NUM_SEGMENTS 21.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)
#define STEP 5.0

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);
  float count = floor(vertexId / NUM_POINTS);
  float offset = count * 0.02;
  float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;
  float radius = 0.2;
  float c = cos(angle + time) * radius;
  float s = sin(angle + time) * radius;
  float orbitAngle = count * 0.01;
  float oC = cos(orbitAngle + time * count * 0.01) * sin(orbitAngle);
  float oS = sin(orbitAngle + time * count * 0.01) * sin(orbitAngle);

  vec2 aspect = vec2(1, resolution.x / resolution.y);
  vec2 xy = vec2(
      oC + c,
      oS + s);
  gl_Position = vec4(xy * aspect + mouse * 0.1, 0, 1);

  float hue = (time * 0.01 + count * 1.001);
  v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);
}
  `,
  // ===========================================================
  "vs2": `
#define PI radians(180.)
#define NUM_SEGMENTS 4.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)
#define STEP 5.0

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);
  float count = floor(vertexId / NUM_POINTS);
  float snd = texture2D(sound, vec2(fract(count / 128.0), fract(count / 20000.0))).a;
  float offset = count * 0.02;
  float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;
  float radius = 0.2 * pow(snd, 5.0);
  float c = cos(angle + time) * radius;
  float s = sin(angle + time) * radius;
  float orbitAngle =  count * 0.0;
  float innerRadius = count * 0.001;
  float oC = cos(orbitAngle + time * 0.4 + count * 0.1) * innerRadius;
  float oS = sin(orbitAngle + time + count * 0.1) * innerRadius;

  vec2 aspect = vec2(1, resolution.x / resolution.y);
  vec2 xy = vec2(
      oC + c,
      oS + s);
  gl_Position = vec4(xy * aspect + mouse * 0.1, 0, 1);

  float hue = (time * 0.01 + count * 1.001);
  v_color = vec4(hsv2rgb(vec3(hue, 1, 1)), 1);
}
  `,
  // ===========================================================
  "vs3": `
#define NUM_SEGMENTS 128.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)

vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float numLinesDown = floor(vertexCount / NUM_POINTS);
  // produces 0,1, 1,2, 2,3, ...
  float point = floor(mod(vertexId, NUM_POINTS) / 2.0) + mod(vertexId, 2.0);
  // line count
  float count = floor(vertexId / NUM_POINTS);

  float u = point / NUM_SEGMENTS;  // 0 <-> 1 across line
  float v = count / numLinesDown;  // 0 <-> 1 by line
  float invV = 1.0 - v;

  // Only use the left most 1/4th of the sound texture
  // because there's no action on the right
  float historyX = u * 0.25;
  // Match each line to a specific row in the sound texture
  float historyV = (v * numLinesDown + 0.5) / soundRes.y;
  float snd = texture2D(sound, vec2(historyX, historyV)).a;

  float x = u * 2.0 - 1.0;
  float y = v * 2.0 - 1.0;
  vec2 xy = vec2(
      x * mix(0.5, 1.0, invV),
      y + pow(snd, 5.0) * 1.0) / (v + 0.5);
  gl_Position = vec4(xy * 0.5, 0, 1);

  float hue = u;
  float sat = invV;
  float val = invV;
  v_color = mix(vec4(hsv2rgb(vec3(hue, sat, val)), 1), background, v * v);
}
  `,
  // ===========================================================
  "vs4": `
#define PI radians(180.)
#define NUM_SEGMENTS 2.0
#define NUM_POINTS (NUM_SEGMENTS * 2.0)
#define STEP 1.0

void main() {
  float point = mod(floor(vertexId / 2.0) + mod(vertexId, 2.0) * STEP, NUM_SEGMENTS);
  float count = floor(vertexId / NUM_POINTS);
  float offset = count * sin(time * 0.01) + 5.0;
  float angle = point * PI * 2.0 / NUM_SEGMENTS + offset;
  float radius = pow(count * 0.00014, 1.0);
  float c = cos(angle + time) * radius;
  float s = sin(angle + time) * radius;
  float orbitAngle =  pow(count * 0.025, 0.8);
  float innerRadius = pow(count * 0.0005, 1.2);
  float oC = cos(orbitAngle + count * 0.0001) * innerRadius;
  float oS = sin(orbitAngle + count * 0.0001) * innerRadius;

  vec2 aspect = vec2(1, resolution.x / resolution.y);
  vec2 xy = vec2(
      oC + c,
      oS + s);
  gl_Position = vec4(xy * aspect + mouse * 0.1, 0, 1);

  float b = 1.0 - pow(sin(count * 0.4) * 0.5 + 0.5, 10.0);
  b = 0.0;mix(0.0, 0.7, b);
  v_color = vec4(b, b, b, 1);
}
  `,
  // ===========================================================
  "wave-vs": `
vec3 hsv2rgb(vec3 c) {
  c = vec3(c.x, clamp(c.yz, 0.0, 1.0));
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float select(float v, float t) {
  return step(t * 0.9, v) * step(v, t * 1.1);
}

void main() {
  float GRID_YOFF = 1./40.;
  float GRID_DOWN = 17.;
  float GRID_ACROSS = 64.0;
  float NUM_PER_DOWN = GRID_DOWN * 2.;
  float NUM_PER_ACROSS = GRID_ACROSS * 2.;
  float NUM_PER_GRID = NUM_PER_DOWN + NUM_PER_ACROSS;
  float NUM_GRIDS = 4.;
  float NUM_GRID_TOTAL = NUM_PER_GRID * NUM_GRIDS;
  float NUM_POINTS = (vertexCount - NUM_GRID_TOTAL) / 4.;
  float NUM_SEGMENTS = NUM_POINTS / 2.;


  float id = vertexId - NUM_GRID_TOTAL;

  // produces 0,1, 1,2, 2,3, ...
  float point = floor(mod(id, NUM_POINTS) / 2.0) + mod(id, 2.0);
  // line count
  float grid = floor(id / NUM_POINTS);

  float u = point / (NUM_SEGMENTS - 1.);    // 0 <-> 1 across line
  float v = grid / NUM_GRIDS;      // 0 <-> 1 by line

  float snd0 = texture2D(sound, vec2(u * 1., 0)).a;
  float snd1 = texture2D(sound, vec2(u * 0.5, 0)).a;
  float snd2 = texture2D(sound, vec2(u * 0.25, 0)).a;
  float snd3 = texture2D(sound, vec2(u * 0.125, 0)).a;

  float s =
    snd0 * select(grid, 0.) +
    snd1 * select(grid, 1.) +
    snd2 * select(grid, 2.) +
    snd3 * select(grid, 3.) +
    0.;

  float x = u * 2.0 - 1.0;
  float y = v * 2.0 - 1.0;
  vec2 xy = vec2(
      x,
      s * 0.4 + y + GRID_YOFF);
  gl_Position = vec4(xy, 0, 1);

  float hue = grid * 0.25;
  float sat = 1.0;
  float val = 1.0;

  if (id < 0.0) {
    if (vertexId < NUM_PER_DOWN * NUM_GRIDS) {
      float hgx = mod(vertexId, 2.0);
      float hgy = mod(floor(vertexId / 2.), GRID_DOWN);
      float hgId = floor(vertexId / NUM_PER_DOWN);
      gl_Position = vec4(
        hgx * 2. - 1.,
        hgy / (GRID_DOWN - 1.) * 0.4 +
        (hgId / NUM_GRIDS * 2. - 1.) + GRID_YOFF,
        0.1,
        1);

      hue = hgId * 0.25;
      sat = 0.5;
      val = 0.3;
    } else {
      float vid = vertexId - NUM_PER_DOWN * NUM_GRIDS;
      float vgy = mod(vid, 2.0);
      float vgx = mod(floor(vid / 2.), GRID_ACROSS);
      float vgId = floor(vid / NUM_PER_ACROSS);
      gl_Position = vec4(
        ((vgx / GRID_ACROSS) * 2. - 1.) * pow(2., vgId),
        vgy * 0.4 +
        (vgId / NUM_GRIDS * 2. - 1.) + GRID_YOFF,
        0.1,
        1);

      hue = vgId * 0.25;
      sat = 0.5;
      val = 0.3;

    }
  }

  v_color = vec4(hsv2rgb(vec3(hue, sat, val)), 1);
}
  `,
  // ===========================================================
  "fs": `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
  `,
  // ===========================================================
  "history-vs": `
attribute vec4 position;
attribute vec2 texcoord;
uniform mat4 u_matrix;
varying vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * position;
  v_texcoord = texcoord;
}
  `,
  // ===========================================================
  "history-fs": `
precision mediump float;

uniform sampler2D u_texture;
uniform float u_mix;
uniform float u_mult;
varying vec2 v_texcoord;

void main() {
  vec4 color = texture2D(u_texture, v_texcoord);
  gl_FragColor = mix(color.aaaa, color.rgba, u_mix) * u_mult;
}
  `,
  // ===========================================================
  "rect-vs": `
attribute vec4 position;
uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * position;
}
  `,
  // ===========================================================
  "rect-fs": `
precision mediump float;

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
  `,
  };
});

