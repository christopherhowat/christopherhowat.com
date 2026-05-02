/* dither-hover.js
   On hover: Bayer-dithered version (red + cream) sweeps down over the card.
   On leave: sweeps back up.
   Uses a crossOrigin re-fetch so getImageData works on the live site. */
(function () {
  const BAYER = [
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5]
  ];
  const ON  = [255, 243, 229, 255]; // #FFF3E5 — cream
  const OFF = [224,  59,  34, 255]; // #e03b22 — red
  const BLOCK    = 2;   // canvas px per screen block (lower = finer dither)
  const SWEEP_IN  = 380; // ms for hover sweep
  const SWEEP_OUT = 260; // ms for leave sweep

  function buildDither(img, dispW, dispH, block, posX, posY, invert) {
    block = block || BLOCK;
    posX = posX !== undefined ? posX : 0.5;
    posY = posY !== undefined ? posY : 0.5;
    invert = !!invert;
    const dw = Math.max(1, Math.round(dispW / block));
    const dh = Math.max(1, Math.round(dispH / block));
    const off = document.createElement('canvas');
    off.width = dw; off.height = dh;
    const oc = off.getContext('2d');
    // Replicate object-fit: cover with the correct object-position
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const scale = Math.max(dw / nw, dh / nh);
    const scaledW = nw * scale;
    const scaledH = nh * scale;
    const dx = (dw - scaledW) * posX;
    const dy = (dh - scaledH) * posY;

    const filter = img.dataset.ditherFilter || 'contrast(200%) brightness(105%)';
    oc.filter = filter;
    oc.drawImage(img, dx, dy, scaledW, scaledH);
    const src = oc.getImageData(0, 0, dw, dh).data;
    const out = new Uint8ClampedArray(dw * dh * 4);
    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const i = (y * dw + x) * 4;
        const lum = src[i] * 0.299 + src[i+1] * 0.587 + src[i+2] * 0.114;
        const thr = (BAYER[y & 3][x & 3] / 16) * 255;
        const col = (lum > thr) !== invert ? ON : OFF;
        out[i] = col[0]; out[i+1] = col[1]; out[i+2] = col[2]; out[i+3] = 255;
      }
    }
    return { imageData: new ImageData(out, dw, dh), dw, dh };
  }

  function easeInOut(t) {
    return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  }

  function setup(wrap) {
    const img = wrap.querySelector('img');
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:1;' +
      'image-rendering:pixelated;image-rendering:crisp-edges;';
    wrap.appendChild(canvas);

    let cache  = null;
    let ctx    = null;
    let rafId  = null;
    let progress = 0; // 0 = fully hidden, 1 = fully revealed (in canvas row units, normalised)

    function draw(rows) {
      if (!cache || !ctx) return;
      ctx.clearRect(0, 0, cache.dw, cache.dh);
      if (rows > 0) {
        ctx.putImageData(cache.imageData, 0, 0, 0, 0, cache.dw, Math.ceil(rows));
      }
    }

    function sweepTo(target, duration) {
      if (rafId) cancelAnimationFrame(rafId);
      const startProgress = progress;
      const startTime = performance.now();
      const delta = target - startProgress;
      if (Math.abs(delta) < 0.001) return;

      function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        progress = startProgress + delta * easeInOut(t);
        draw(progress * cache.dh);
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          progress = target;
          draw(progress * cache.dh);
          rafId = null;
        }
      }
      rafId = requestAnimationFrame(step);
    }

    function loadCORSAndDither() {
      if (cache) return;
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith('data:')) return;

      const corsImg = new Image();
      corsImg.crossOrigin = 'anonymous';
      // Read object-position from the real DOM img before loading CORS copy
      const kwMap = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
      const parsePct = v => v in kwMap ? kwMap[v] : parseFloat(v) / 100;
      const objPos = window.getComputedStyle(img).objectPosition.split(' ');
      const posX = parsePct(objPos[0]);
      const posY = parsePct(objPos[1] || objPos[0]);

      corsImg.onload = () => {
        const w = wrap.offsetWidth;
        const h = wrap.offsetHeight;
        if (!w || !h) return;
        try {
          const block = img.dataset.ditherBlock ? parseInt(img.dataset.ditherBlock) : undefined;
          cache  = buildDither(corsImg, w, h, block, posX, posY, img.hasAttribute('data-dither-invert'));
          canvas.width  = cache.dw;
          canvas.height = cache.dh;
          ctx = canvas.getContext('2d');
        } catch (_) {
          // Silently fails on file:// — works on live site
        }
      };
      corsImg.src = src;
    }

    wrap.addEventListener('mouseenter', () => {
      if (!cache) { loadCORSAndDither(); return; }
      sweepTo(1, SWEEP_IN);
    });

    wrap.addEventListener('mouseleave', () => {
      if (!cache) return;
      sweepTo(0, SWEEP_OUT);
    });

    // Pre-load CORS copy as the card nears the viewport
    const kick = () => {
      if (img.complete && img.naturalWidth) loadCORSAndDither();
      else img.addEventListener('load', loadCORSAndDither, { once: true });
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        io.disconnect(); kick();
      }, { rootMargin: '300px' });
      io.observe(wrap);
    } else {
      kick();
    }
  }

  function init() {
    document.querySelectorAll('.project-img-wrap').forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
