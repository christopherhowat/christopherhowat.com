// Pixel-grid mouse trail — faithful port of PT.BTp_3NCK.js (purduehackers.com)
(function () {
  const TEX_SIZE  = 512;
  const MAX_AGE   = 250;
  const RADIUS    = 0.055;  // tighter spread
  const INTENSITY = 0.2;
  const SMOOTHING = 0.9;
  const MIN_FORCE = 0.3;

  // Match GOL cell size (7px) — recalculate on resize
  let GRID = Math.round(Math.max(window.innerWidth, window.innerHeight) / 7);
  window.addEventListener('resize', () => {
    GRID = Math.round(Math.max(window.innerWidth, window.innerHeight) / 7);
  });

  const texCanvas = document.createElement('canvas');
  texCanvas.width = texCanvas.height = TEX_SIZE;
  const texCtx = texCanvas.getContext('2d');

  let pts = [], tForce = 0, lastPt = null;
  let mouseClientY = 0;
  const invertedSection = document.getElementById('experience');
  const ease  = t => Math.max(0, Math.min(1, t));
  const sLerp = (a, b, s) => b * s + a * (1 - s);

  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function coverUv(nx, ny) {
    const W = canvas.width, H = canvas.height, M = Math.max(W, H);
    const sx = W / M, sy = H / M;
    return {
      x: Math.max(0, Math.min(1, (nx - 0.5) * sx + 0.5)),
      y: Math.max(0, Math.min(1, (0.5 - ny) * sy + 0.5))
    };
  }

  function addTouch(nx, ny) {
    const uv = coverUv(nx, ny);
    if (lastPt) {
      const dx = lastPt.x - uv.x, dy = lastPt.y - uv.y;
      const dSq = dx*dx + dy*dy;
      const f = Math.max(MIN_FORCE, Math.min(dSq * 1e4, 1));
      tForce = sLerp(f, tForce, SMOOTHING);
      const steps = Math.ceil(dSq / Math.pow(RADIUS * 0.5, 2));
      for (let i = 1; i < steps; i++)
        pts.push({ x: lastPt.x - dx/steps*i, y: lastPt.y - dy/steps*i, age: 0, force: f });
    }
    pts.push({ x: uv.x, y: uv.y, age: 0, force: tForce });
    lastPt = { x: uv.x, y: uv.y };
  }

  function drawTouch(pt) {
    const px = pt.x * TEX_SIZE;
    const py = (1 - pt.y) * TEX_SIZE;
    let fade = pt.age < MAX_AGE * 0.3
      ? ease(pt.age / (MAX_AGE * 0.3))
      : ease(1 - (pt.age - MAX_AGE * 0.3) / (MAX_AGE * 0.7));
    fade *= pt.force;
    const r = TEX_SIZE * RADIUS * fade;
    if (r <= 0) return;
    texCtx.globalCompositeOperation = 'screen';
    const g = texCtx.createRadialGradient(px, py, Math.max(0, r*0.25), px, py, r);
    g.addColorStop(0, `rgba(255,255,255,${INTENSITY})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    texCtx.fillStyle = g;
    texCtx.beginPath();
    texCtx.arc(px, py, r, 0, Math.PI * 2);
    texCtx.fill();
  }

  function updateTexture(dt) {
    texCtx.globalCompositeOperation = 'source-over';
    texCtx.fillStyle = 'black';
    texCtx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    pts = pts.filter(p => { p.age += dt * 1000; return p.age < MAX_AGE; });
    if (!pts.length) tForce = 0;
    pts.forEach(drawTouch);
  }

  // Show everywhere except text links / buttons
  document.addEventListener('mousemove', e => {
    mouseClientY = e.clientY;
    if (e.target.closest('a:not(.project-card), button')) return;
    addTouch(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
  });

  let lastTime = performance.now();
  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    updateTexture(dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height, M = Math.max(W, H);
    const cellSize = M / GRID;
    const sx = W / M, sy = H / M;
    const pxData = texCtx.getImageData(0, 0, TEX_SIZE, TEX_SIZE).data;
    const invTop = invertedSection ? invertedSection.getBoundingClientRect().top : Infinity;
    const trailCol = mouseClientY >= invTop ? '#FFF3E5' : '#e03b22';
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const uvX = (c + 0.5) / GRID;
        const uvY = (r + 0.5) / GRID;
        const tx = Math.min(TEX_SIZE-1, Math.floor(uvX * TEX_SIZE));
        const ty = Math.min(TEX_SIZE-1, Math.floor((1 - uvY) * TEX_SIZE));
        const brightness = pxData[(ty * TEX_SIZE + tx) * 4] / 255;
        if (brightness > 0.05) {
          const screenX = ((uvX - 0.5) / sx + 0.5) * W;
          const screenY = (0.5 - (uvY - 0.5) / sy) * H;
          ctx.fillStyle = trailCol;
          ctx.fillRect(
            Math.round(screenX - cellSize / 2),
            Math.round(screenY - cellSize / 2),
            Math.ceil(cellSize),
            Math.ceil(cellSize)
          );
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
