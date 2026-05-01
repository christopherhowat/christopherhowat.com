(function () {
  const COLS = 10;
  const ROWS = 5;

  // Rain: each column starts slightly after the previous,
  // and within each column pixels drop top→bottom
  const COL_WEIGHT = 2; // 2 * 15ms = 30ms between columns
  const ROW_WEIGHT = 4; // 4 * 15ms = 60ms between rows within a column

  document.querySelectorAll('.pixel-btn').forEach(btn => {
    const label = document.createElement('span');
    label.className = 'pixel-btn__label';
    while (btn.firstChild) label.appendChild(btn.firstChild);

    const pixelsEl = document.createElement('span');
    pixelsEl.className = 'pixel-btn__pixels';
    pixelsEl.setAttribute('aria-hidden', 'true');

    // Add pixels in grid order (row-major) so CSS grid places them correctly
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const pixel = document.createElement('span');
        pixel.className = 'pixel-btn__pixel';
        pixel.style.setProperty('--i', c * COL_WEIGHT + r * ROW_WEIGHT);
        pixelsEl.appendChild(pixel);
      }
    }

    btn.appendChild(pixelsEl);
    btn.appendChild(label);
  });
})();
