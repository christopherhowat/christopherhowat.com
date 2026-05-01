(function () {
  const BLOCK = 20; // px, square block size
  const SPEED = 10; // ms between each block appearing

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  document.querySelectorAll('.project-img-wrap').forEach(wrap => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden;';
    wrap.appendChild(overlay);

    let spans = [], timers = [], built = false;

    function build() {
      overlay.innerHTML = '';
      spans = [];
      const W = wrap.offsetWidth;
      const H = wrap.offsetHeight;
      const B = BLOCK;
      const positions = [];

      // Top row
      for (let x = 0; x < W; x += B)       positions.push([x, 0]);
      // Right col (skip top-right corner already in top row)
      for (let y = B; y < H; y += B)        positions.push([W - B, y]);
      // Bottom row (skip bottom-right corner)
      for (let x = 0; x < W - B; x += B)   positions.push([x, H - B]);
      // Left col (skip top-left and bottom-left corners)
      for (let y = B; y < H - B; y += B)   positions.push([0, y]);

      positions.forEach(([x, y]) => {
        const s = document.createElement('span');
        s.style.cssText =
          'display:block;position:absolute;background:#e03b22;opacity:0;' +
          'left:' + x + 'px;top:' + y + 'px;width:' + B + 'px;height:' + B + 'px;';
        overlay.appendChild(s);
        spans.push(s);
      });
      built = true;
    }

    wrap.addEventListener('mouseenter', () => {
      if (!built) build();
      timers.forEach(clearTimeout); timers = [];
      spans.forEach(s => { s.style.opacity = '0'; });
      // Re-shuffle on every hover so the pattern is different each time
      timers = shuffle(spans).map((s, i) =>
        setTimeout(() => { s.style.opacity = '1'; }, i * SPEED)
      );
    });

    wrap.addEventListener('mouseleave', () => {
      timers.forEach(clearTimeout); timers = [];
      spans.forEach(s => { s.style.opacity = '0'; });
    });
  });
})();
