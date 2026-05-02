// Film grain — inline SVG with feTurbulence rect covering full viewport
(function () {
  const NS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(NS, 'svg');
  svg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:20001;opacity:0.23;';

  const defs   = document.createElementNS(NS, 'defs');
  const filter = document.createElementNS(NS, 'filter');
  filter.setAttribute('id', 'grain-f');
  filter.setAttribute('x', '0%');
  filter.setAttribute('y', '0%');
  filter.setAttribute('width', '100%');
  filter.setAttribute('height', '100%');

  const turb = document.createElementNS(NS, 'feTurbulence');
  turb.setAttribute('type', 'fractalNoise');
  turb.setAttribute('baseFrequency', '0.65');
  turb.setAttribute('numOctaves', '3');
  turb.setAttribute('seed', '0');
  turb.setAttribute('stitchTiles', 'stitch');

  const cm = document.createElementNS(NS, 'feColorMatrix');
  cm.setAttribute('type', 'saturate');
  cm.setAttribute('values', '0');

  filter.appendChild(turb);
  filter.appendChild(cm);
  defs.appendChild(filter);

  const rect = document.createElementNS(NS, 'rect');
  rect.setAttribute('width', '100%');
  rect.setAttribute('height', '100%');
  rect.setAttribute('filter', 'url(#grain-f)');

  svg.appendChild(defs);
  svg.appendChild(rect);
  document.body.appendChild(svg);

  // Flicker by advancing the seed — skip on touch-only devices (no benefit, costs GPU)
  // Run at ~10fps (every 6 frames) instead of 15fps to reduce SVG filter repaint cost
  if (window.matchMedia('(pointer: fine)').matches) {
    let seed = 0, frame = 0;
    (function tick() {
      if (++frame % 6 === 0) turb.setAttribute('seed', seed = (seed + 1) % 999);
      requestAnimationFrame(tick);
    })();
  }
})();
