(function () {
  const FRAME_COUNT = 6;
  const FRAME_MS    = 200; // matches original GIF timing (5fps)

  const canvas = document.createElement('canvas');
  canvas.width  = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  const link = document.querySelector("link[rel='icon']");
  if (!link || !ctx) return;

  // Preload all frames
  let loaded = 0;
  const frames = [];

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.onload = function () {
      loaded++;
      if (loaded === FRAME_COUNT) startAnimation();
    };
    img.src = 'favicon-frames/frame' + i + '.png';
    frames.push(img);
  }

  function startAnimation() {
    let current = 0;
    setInterval(function () {
      if (document.hidden) return; // skip when tab not visible
      ctx.clearRect(0, 0, 32, 32);
      ctx.drawImage(frames[current], 0, 0, 32, 32);
      link.href = canvas.toDataURL('image/png');
      current = (current + 1) % FRAME_COUNT;
    }, FRAME_MS);
  }
})();
