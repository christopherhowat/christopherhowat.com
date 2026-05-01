(function () {
  const VERT = `#version 300 es
layout(location=0) in vec4 a_position;
void main() { gl_Position = a_position; }`;

  const FRAG = `#version 300 es
precision mediump float;
#define PI 3.14159265358979

uniform float u_time;
uniform vec2  u_resolution;
uniform float u_pixelRatio;
uniform vec4  u_colorBack;
uniform vec4  u_colorFront;
uniform float u_pxSize;
uniform float u_offsetX;
uniform float u_offsetY;

out vec4 fragColor;

const int bayer4x4[16] = int[16](
   0, 8, 2,10,
  12, 4,14, 6,
   3,11, 1, 9,
  15, 7,13, 5
);

float getBayer4(vec2 uv) {
  ivec2 pos = ivec2(fract(uv / 4.0) * 4.0);
  return float(bayer4x4[pos.y * 4 + pos.x]) / 16.0;
}

void main() {
  float t = 0.5 * u_time;
  float pxSize = u_pxSize * u_pixelRatio;

  vec2 pxSizeUV = (gl_FragCoord.xy - 0.5 * u_resolution) / pxSize;
  vec2 cellUV   = (floor(pxSizeUV) + 0.5) * pxSize;
  vec2 normUV   = cellUV / u_resolution;

  vec2 shapeUV  = normUV;
  shapeUV += vec2(-u_offsetX, u_offsetY);
  shapeUV *= u_resolution / u_pixelRatio;
  shapeUV += 0.5;
  shapeUV *= 0.003;

  for (float i = 1.0; i < 6.0; i++) {
    shapeUV.x += 0.6 / i * cos(i * 2.5 * shapeUV.y + t);
    shapeUV.y += 0.6 / i * cos(i * 1.5 * shapeUV.x + t);
  }
  float shape = 0.15 / max(0.001, abs(sin(t - shapeUV.y - shapeUV.x)));
  shape = smoothstep(0.02, 1.0, shape);

  float dithering = getBayer4(pxSizeUV);
  dithering -= 0.5;
  float res = step(0.5, shape + dithering);

  vec3  fg  = u_colorFront.rgb;
  float fgA = u_colorFront.a;
  vec3  bg  = u_colorBack.rgb;
  float bgA = u_colorBack.a;

  vec3  color   = fg * res + bg  * (1.0 - res);
  float opacity = fgA * res + bgA * (1.0 - res);
  fragColor = vec4(color, opacity);
}`;

  function hexToRgba(hex) {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.slice(0,2),16)/255,
      parseInt(hex.slice(2,4),16)/255,
      parseInt(hex.slice(4,6),16)/255,
      1.0
    ];
  }

  const canvas = document.getElementById('dither-bg');
  if (!canvas) return;
  const pr = window.devicePixelRatio || 1;
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false });
  if (!gl) return;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1,  1,-1, -1, 1,
     1,-1,  1, 1, -1, 1
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const uTime    = gl.getUniformLocation(prog, 'u_time');
  const uRes     = gl.getUniformLocation(prog, 'u_resolution');
  const uPR      = gl.getUniformLocation(prog, 'u_pixelRatio');
  const uBack    = gl.getUniformLocation(prog, 'u_colorBack');
  const uFront   = gl.getUniformLocation(prog, 'u_colorFront');
  const uPxSize  = gl.getUniformLocation(prog, 'u_pxSize');
  const uOffsetX = gl.getUniformLocation(prog, 'u_offsetX');
  const uOffsetY = gl.getUniformLocation(prog, 'u_offsetY');

  gl.uniform4fv(uBack,  hexToRgba('#FFF3E5'));
  gl.uniform4fv(uFront, hexToRgba('#e03b22'));
  gl.uniform1f(uPxSize,   2.8);
  gl.uniform1f(uOffsetX, -1.0);
  gl.uniform1f(uOffsetY, -1.0);
  gl.uniform1f(uPR, pr);

  function resize() {
    const w = canvas.offsetWidth  * pr;
    const h = canvas.offsetHeight * pr;
    canvas.width  = Math.round(w);
    canvas.height = Math.round(h);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  const speed = 0.15;
  const start = performance.now();
  let rafId = null;
  let visible = false;

  function loop(now) {
    gl.uniform1f(uTime, (now - start) / 1000 * speed);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // Only animate while the canvas is in the viewport
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !document.hidden) startLoop();
    else stopLoop();
  }, { threshold: 0 }).observe(canvas);

  // Also pause when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else if (visible) startLoop();
  });
})();
