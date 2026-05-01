/**
 * Conway's Game of Life — WebGL2
 * Ping-pong framebuffer simulation with swappable seed patterns.
 */

// ── Pattern definitions ───────────────────────────────────────────────────────

const PATTERNS = {

  'Gosper Glider Gun': function (cols, rows) {
    const data = new Uint8Array(cols * rows);
    const cells = [
      [1,5],[1,6],[2,5],[2,6],
      [11,5],[11,6],[11,7],[12,4],[12,8],[13,3],[13,9],[14,3],[14,9],
      [15,6],[16,4],[16,8],[17,5],[17,6],[17,7],[18,6],
      [21,3],[21,4],[21,5],[22,3],[22,4],[22,5],
      [23,2],[23,6],[25,1],[25,2],[25,6],[25,7],
      [35,3],[35,4],[36,3],[36,4]
    ];
    const ox = 5, oy = 10;
    for (const [px, py] of cells) {
      const col = ox + px, row = oy + py;
      if (col >= 0 && col < cols && row >= 0 && row < rows)
        data[row * cols + col] = 255;
    }
    return data;
  },

  'Random Soup': function (cols, rows) {
    const data = new Uint8Array(cols * rows);
    for (let i = 0; i < data.length; i++)
      data[i] = Math.random() < 0.3 ? 255 : 0;
    return data;
  },

  'R-Pentominoes': function (cols, rows) {
    const data  = new Uint8Array(cols * rows);
    const shape = [[1,0],[2,0],[0,1],[1,1],[1,2]]; // R-pentomino
    for (let i = 0; i < 20; i++) {
      const ox = 2 + Math.floor(Math.random() * (cols - 6));
      const oy = 2 + Math.floor(Math.random() * (rows - 6));
      for (const [dx, dy] of shape) {
        const col = ox + dx, row = oy + dy;
        if (col >= 0 && col < cols && row >= 0 && row < rows)
          data[row * cols + col] = 255;
      }
    }
    return data;
  },

  'Acorn': function (cols, rows) {
    const data  = new Uint8Array(cols * rows);
    const shape = [[1,0],[3,1],[0,2],[1,2],[4,2],[5,2],[6,2]];
    const ox = Math.floor((cols - 7) / 2);
    const oy = Math.floor((rows - 3) / 2);
    for (const [dx, dy] of shape) {
      const col = ox + dx, row = oy + dy;
      if (col >= 0 && col < cols && row >= 0 && row < rows)
        data[row * cols + col] = 255;
    }
    return data;
  },

  'Gliders': function (cols, rows) {
    const data = new Uint8Array(cols * rows);
    const variants = [
      [[1,0],[2,1],[0,2],[1,2],[2,2]], // SE
      [[1,0],[0,1],[0,2],[1,2],[2,2]], // SW
      [[0,0],[1,0],[2,0],[2,1],[1,2]], // NE
      [[0,0],[1,0],[2,0],[0,1],[1,2]], // NW
    ];
    for (let i = 0; i < 16; i++) {
      const v  = variants[i % variants.length];
      const ox = 2 + Math.floor(Math.random() * (cols - 6));
      const oy = 2 + Math.floor(Math.random() * (rows - 6));
      for (const [dx, dy] of v) {
        const col = ox + dx, row = oy + dy;
        if (col >= 0 && col < cols && row >= 0 && row < rows)
          data[row * cols + col] = 255;
      }
    }
    return data;
  },

  // ── Quieter options ───────────────────────────────────────────────────────

  // 4 gliders — one from each corner heading toward centre. Sparse and clean.
  'Corner Gliders': function (cols, rows) {
    const data = new Uint8Array(cols * rows);
    const pad  = 4;
    const seeds = [
      { shape: [[1,0],[2,1],[0,2],[1,2],[2,2]], ox: pad,        oy: pad },        // SE
      { shape: [[1,0],[0,1],[0,2],[1,2],[2,2]], ox: cols-pad-3, oy: pad },        // SW
      { shape: [[0,0],[1,0],[2,0],[2,1],[1,2]], ox: pad,        oy: rows-pad-3 }, // NE
      { shape: [[0,0],[1,0],[2,0],[0,1],[1,2]], ox: cols-pad-3, oy: rows-pad-3 }, // NW
    ];
    for (const { shape, ox, oy } of seeds) {
      for (const [dx, dy] of shape) {
        const col = ox + dx, row = oy + dy;
        if (col >= 0 && col < cols && row >= 0 && row < rows)
          data[row * cols + col] = 255;
      }
    }
    return data;
  },

  // Pulsars — beautiful period-3 oscillators that stay in one spot.
  'Pulsars': function (cols, rows) {
    const data  = new Uint8Array(cols * rows);
    const shape = [
      [2,0],[3,0],[4,0],[8,0],[9,0],[10,0],
      [0,2],[5,2],[7,2],[12,2],
      [0,3],[5,3],[7,3],[12,3],
      [0,4],[5,4],[7,4],[12,4],
      [2,5],[3,5],[4,5],[8,5],[9,5],[10,5],
      [2,7],[3,7],[4,7],[8,7],[9,7],[10,7],
      [0,8],[5,8],[7,8],[12,8],
      [0,9],[5,9],[7,9],[12,9],
      [0,10],[5,10],[7,10],[12,10],
      [2,12],[3,12],[4,12],[8,12],[9,12],[10,12],
    ];
    // Place 2 pulsars side by side with some breathing room
    const positions = [
      { ox: Math.floor(cols * 0.2) - 6, oy: Math.floor(rows / 2) - 6 },
      { ox: Math.floor(cols * 0.7) - 6, oy: Math.floor(rows / 2) - 6 },
    ];
    for (const { ox, oy } of positions) {
      for (const [dx, dy] of shape) {
        const col = ox + dx, row = oy + dy;
        if (col >= 0 && col < cols && row >= 0 && row < rows)
          data[row * cols + col] = 255;
      }
    }
    return data;
  },

  // Lightweight spaceships — small ships gliding horizontally across the grid.
  'Spaceships': function (cols, rows) {
    const data  = new Uint8Array(cols * rows);
    // LWSS going right
    const lwssR = [[1,0],[2,0],[3,0],[4,0],[0,1],[4,1],[4,2],[0,3],[3,3]];
    // LWSS going left (mirrored)
    const lwssL = lwssR.map(([dx, dy]) => [4 - dx, dy]);
    const step  = Math.floor(rows / 7);
    for (let i = 0; i < 6; i++) {
      const goRight = i % 2 === 0;
      const shape   = goRight ? lwssR : lwssL;
      const ox      = goRight ? 2 : cols - 7;
      const oy      = step + i * step;
      for (const [dx, dy] of shape) {
        const col = ox + dx, row = oy + dy;
        if (col >= 0 && col < cols && row >= 0 && row < rows)
          data[row * cols + col] = 255;
      }
    }
    return data;
  },

  // Just 4 R-pentominoes — activity without covering the whole screen.
  'Few Pentominoes': function (cols, rows) {
    const data  = new Uint8Array(cols * rows);
    const shape = [[1,0],[2,0],[0,1],[1,1],[1,2]];
    const positions = [
      { ox: Math.floor(cols * 0.2), oy: Math.floor(rows * 0.25) },
      { ox: Math.floor(cols * 0.7), oy: Math.floor(rows * 0.25) },
      { ox: Math.floor(cols * 0.2), oy: Math.floor(rows * 0.65) },
      { ox: Math.floor(cols * 0.7), oy: Math.floor(rows * 0.65) },
    ];
    for (const { ox, oy } of positions) {
      for (const [dx, dy] of shape) {
        const col = ox + dx, row = oy + dy;
        if (col >= 0 && col < cols && row >= 0 && row < rows)
          data[row * cols + col] = 255;
      }
    }
    return data;
  },

};

const PATTERN_NAMES = Object.keys(PATTERNS);

// ── Shaders ───────────────────────────────────────────────────────────────────

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const SIM_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uState;
uniform ivec2 uGridSize;
out vec4 outColor;
int cell(ivec2 c) {
  if (c.x < 0 || c.y < 0 || c.x >= uGridSize.x || c.y >= uGridSize.y) return 0;
  return int(texelFetch(uState, c, 0).r > 0.5);
}
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  int n =
    cell(c+ivec2(-1,-1))+cell(c+ivec2(0,-1))+cell(c+ivec2(1,-1))+
    cell(c+ivec2(-1, 0))+                     cell(c+ivec2(1, 0))+
    cell(c+ivec2(-1, 1))+cell(c+ivec2(0, 1))+cell(c+ivec2(1, 1));
  int alive = cell(c);
  int next  = (alive==1) ? int(n==2||n==3) : int(n==3);
  outColor  = vec4(float(next),0.0,0.0,1.0);
}`;

const DRAW_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uState;
uniform ivec2 uGridSize;
uniform float uCellPx;
uniform vec3  uCellColor;
out vec4 outColor;
void main() {
  ivec2 cell = ivec2(floor(gl_FragCoord.xy / uCellPx));
  int x = cell.x;
  int y = (uGridSize.y - 1) - cell.y;
  if (x<0||y<0||x>=uGridSize.x||y>=uGridSize.y) { outColor=vec4(0); return; }
  float alive = texelFetch(uState, ivec2(x,y), 0).r;
  outColor = vec4(uCellColor, step(0.5, alive));
}`;

// ── WebGL helpers ─────────────────────────────────────────────────────────────

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function linkProgram(gl, vSrc, fSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER,   vSrc));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, fSrc));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}
function makeTexture(gl, w, h, data) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, data ?? null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}
function makeFBO(gl, tex) {
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    throw new Error('Incomplete framebuffer');
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return fbo;
}

// ── Main init ─────────────────────────────────────────────────────────────────

function initGOL(canvas) {
  const cols    = parseInt(canvas.dataset.cols     || '80');
  const rows    = parseInt(canvas.dataset.rows     || '60');
  const cellPx  = parseInt(canvas.dataset.cellSize || '10');
  const speedMs = parseInt(canvas.dataset.speedMs  || '100');
  const rgb     = (canvas.dataset.color || '0,0,0').split(',').map(Number);
  const color   = [rgb[0]/255, rgb[1]/255, rgb[2]/255];

  const dpr  = Math.min(2, window.devicePixelRatio || 1);
  const cssW = cols * cellPx, cssH = rows * cellPx;
  canvas.style.width  = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width  = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);

  const gl = canvas.getContext('webgl2', {
    alpha: true, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, powerPreference: 'low-power'
  });
  if (!gl) throw new Error('WebGL2 not supported');

  const simProg  = linkProgram(gl, VERT, SIM_FRAG);
  const drawProg = linkProgram(gl, VERT, DRAW_FRAG);
  const uSim  = { state: gl.getUniformLocation(simProg,  'uState'), grid: gl.getUniformLocation(simProg,  'uGridSize') };
  const uDraw = { state: gl.getUniformLocation(drawProg, 'uState'), grid: gl.getUniformLocation(drawProg, 'uGridSize'),
                  cellPx: gl.getUniformLocation(drawProg, 'uCellPx'), color: gl.getUniformLocation(drawProg, 'uCellColor') };

  let texA = makeTexture(gl, cols, rows, PATTERNS['Gosper Glider Gun'](cols, rows));
  let texB = makeTexture(gl, cols, rows, null);
  let fboA = makeFBO(gl, texA);
  let fboB = makeFBO(gl, texB);
  const vao = gl.createVertexArray();

  function uploadPattern(name) {
    const data = (PATTERNS[name] || PATTERNS['Gosper Glider Gun'])(cols, rows);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, data);
    gl.bindTexture(gl.TEXTURE_2D, texB);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, cols, rows, 0, gl.RED, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  function simulate() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboB);
    gl.viewport(0, 0, cols, rows);
    gl.disable(gl.BLEND);
    gl.useProgram(simProg);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.uniform1i(uSim.state, 0);
    gl.uniform2i(uSim.grid, cols, rows);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    [texA, texB] = [texB, texA];
    [fboA, fboB] = [fboB, fboA];
  }

  function draw() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(drawProg);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.uniform1i(uDraw.state, 0);
    gl.uniform2i(uDraw.grid, cols, rows);
    gl.uniform1f(uDraw.cellPx, cellPx * dpr);
    gl.uniform3f(uDraw.color, color[0], color[1], color[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  draw();
  let timerId = null;
  let paused = document.hidden, offscreen = false;

  function loop() {
    if (!paused && !offscreen) { simulate(); draw(); }
    timerId = setTimeout(loop, speedMs);
  }
  timerId = setTimeout(loop, speedMs);
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });
  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(e => { offscreen = !e[0].isIntersecting; }, { threshold: 0 }).observe(canvas);
  }

  return {
    reset(name) { uploadPattern(name); draw(); },
    destroy() {
      clearTimeout(timerId);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(texA); gl.deleteTexture(texB);
      gl.deleteFramebuffer(fboA); gl.deleteFramebuffer(fboB);
      gl.deleteProgram(simProg); gl.deleteProgram(drawProg);
    }
  };
}

// ── Auto-init ─────────────────────────────────────────────────────────────────

let _gol = null;

document.querySelectorAll('canvas[data-gol]').forEach(canvas => {
  if (_gol) _gol.destroy();
  _gol = initGOL(canvas);
});

window.GOL_PATTERN_NAMES = PATTERN_NAMES;
window.golSetPattern = function (name) { if (_gol) _gol.reset(name); };
