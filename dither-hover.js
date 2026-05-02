/* dither-hover.js — Bayer-dither flash on project card hover
   Loads a crossOrigin copy of each image so getImageData works on the live site. */
(function () {
  const BAYER = [
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5]
  ];
  const ON  = [224,  59,  34, 255]; // #e03b22 — red
  const OFF = [255, 243, 229, 255]; // #FFF3E5 — cream
  const BLOCK = 4;

  function buildDither(img, dispW, dispH) {
    const dw = Math.max(1, Math.round(dispW / BLOCK));
    const dh = Math.max(1, Math.round(dispH / BLOCK));
    const off = document.createElement('canvas');
    off.width = dw; off.height = dh;
    const oc = off.getContext('2d');
    oc.drawImage(img, 0, 0, dw, dh);
    const src = oc.getImageData(0, 0, dw, dh).data;
    const out = new Uint8ClampedArray(dw * dh * 4);
    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const i = (y * dw + x) * 4;
        const lum = src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114;
        const thr = (BAYER[y & 3][x & 3] / 16) * 255;
        const col = lum > thr ? ON : OFF;
        out[i] = col[0]; out[i+1] = col[1]; out[i+2] = col[2]; out[i+3] = 255;
      }
    }
    return { imageData: new ImageData(out, dw, dh), dw, dh };
  }

  function setup(wrap) {
    const img = wrap.querySelector('img');
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;' +
      'opacity:0;pointer-events:none;z-index:1;' +
      'image-rendering:pixelated;image-rendering:crisp-edges;';
    wrap.appendChild(canvas);

    let cache = null;
    let fadeTimer = null;

    function applyDither(corsImg) {
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      if (!w || !h) return;
      try {
        cache = buildDither(corsImg, w, h);
        canvas.width  = cache.dw;
        canvas.height = cache.dh;
        canvas.getContext('2d').putImageData(cache.imageData, 0, 0);
      } catch (_) {
        // Silently fails on file:// — works fine on the live site
      }
    }

    function loadCORSAndDither() {
      if (cache) return;
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith('data:')) return;
      // Re-request with crossOrigin so getImageData is allowed
      const corsImg = new Image();
      corsImg.crossOrigin = 'anonymous';
      corsImg.onload = () => applyDither(corsImg);
      corsImg.src = src;
    }

    function flash() {
      if (!cache) { loadCORSAndDither(); return; } // trigger load on first hover if not ready
      clearTimeout(fadeTimer);
      canvas.style.transition = 'none';
      canvas.style.opacity = '1';
      canvas.getBoundingClientRect(); // force reflow so snap commits before fade
      fadeTimer = setTimeout(() => {
        canvas.style.transition = 'opacity 0.45s ease';
        canvas.style.opacity = '0';
      }, 60);
    }

    // Pre-load CORS copy as cards scroll into view
    const observe = () => {
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
          if (!entries[0].isIntersecting) return;
          io.disconnect();
          if (img.complete && img.naturalWidth) loadCORSAndDither();
          else img.addEventListener('load', loadCORSAndDither, { once: true });
        }, { rootMargin: '300px' });
        io.observe(wrap);
      } else {
        if (img.complete && img.naturalWidth) loadCORSAndDither();
        else img.addEventListener('load', loadCORSAndDither, { once: true });
      }
    };

    observe();
    wrap.addEventListener('mouseenter', flash);
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
