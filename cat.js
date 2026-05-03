/* cat.js — Peanut sprite animation
   All frames rendered as pixel-art fillRect arrays.
   Palette: k=black  d=dark-orange  l=light-orange  w=off-white
*/
(function () {

  // ── Unified palette ──────────────────────────────────────────────────
  const PALETTE = { k:'#000000', d:'#db7b00', l:'#fca230', w:'#efefff' };

  // ── Walk frames (91×44 px source, quantised pixel art) ───────────────
  const WALK_SCALE = 2;
  const FRAME_W    = 91;

  const WALK = [
    // Frame 0
    [
      "                                                                 k  kkkk",
      "                                                                klkkkddk",
      "                                                                kllddddk",
      "                                                                kllddddk",
      "                                                               kkllkkkkk",
      "                                                              kddllkkkkk",
      "                                                             kdddlllllldk",
      "                                                            kllddllllllldk",
      "                                                           klllllllllllllk",
      "                                                          kklllllllllllllk",
      "                                                         kkddlllldlllllllk",
      "                                kkkkkkkkkkkkk           kddddlllldddddlklkkk",
      "                          kkkkkdddddddlddddllkkkkkkkkkkkdddddlllddlllllkllddk",
      "                        kkdddlldddddddlddddllddddldddllddllllllllllllllwwdddk",
      "                       kdddldlldddddddlddddllddddldddllddllllllllllwwwwwwwwdk",
      "                      kdddlldllldddllllddddllddddldddllddllwwwwwlllwwwwwwwwwk",
      "                      kdddlldllldddllllddddllddddldddllddllwwwwwlllwwwwwwwwwk",
      "                   kkkddlllldllldllllddddllllddllldddllddllwwwwwwwwwwwwwwwkk",
      "                  kkdddlldlllllldllllddddllldddllldllllldllwwwwwwwwwwwwwwk",
      "                kkdddddlddlllllldllllldddllldddllldlllllddlwwwwwwwkkkkkkk",
      "    kkkkk       dddlddddddlllllldllllldddllldddlllddlllldllwwwwwwwk",
      "   kdddddk    kkdddldddddddllllldllllldddllldddlllddlllllllllwwwwwk",
      "   kddddddkkkkkdlddldddddddllllldllllldddllldddllldllllllllllwwwwwk",
      "   kdddddddlllddllldddddddddddlllddllldddllldddlllddlllllllllwwwwwk",
      "   kdddddddlllddldddkkkkkdddddddlllllldddllldllllldllllllllllwwwwwk",
      "   kkkkddddlllddddkk   kkddddddddddllldddllllllllllllllddddllwwwwdk",
      "       kkkkkkkkkk       kkdlllllddddllllllllllllllllldddddddlwwwwk",
      "                        kkddlllllddddllllllllllllllllddlldddlwwwk",
      "                        kkdddllllldddklllllllllllllllddlldddlwwlk",
      "                         kdllddddllllkwwwwwwlllllwwllddllllllwkkk",
      "                         kdllldddddddkwwwwwwlllllwwwdddlllllllkkkk",
      "                        kdlddlllldddkdwwwwwwwwwwwwwwddddddddllkdddkk",
      "                       kddlllddlllddkkkkkkkkkkkkkkkkkkdllllllkdddddk",
      "                       kdldllllddddkdddk             kdlllldkdddddlk",
      "                       kwwldddddddkkddkk             kkdddddkkkkklwwk",
      "                       kwwwldkkkkddddkk               kdddlldk  kwwwk",
      "                       kwwwwkk kkddddkk               kdlllldk  kwwwk",
      "                       kwwwwk  kddddk                 kdwwlldk  kwwwk",
      "                        kwwwk  kwwwdk                  kkwwwdk  kwwwk",
      "                        kwwwwk kwwwwk                   kwwwwkkkkwwwk",
      "                        kwwwwk kwwwwdk                  kwwwwdddkwwwk",
      "                         kwwwk kwwwwwkk                 kwwwwwwlkkkk",
      "                          kkk   kwwwwwwk                 kwwwwwlk",
      "                                 kkkkkk                   kkkkkk"
    ],
    // Frame 1
    [
      "                                                                 kkk  kkk",
      "                                                                 kldkkddk",
      "                                                                 kldddddk",
      "                                                                 kldddddk",
      "                                                                kdlldkkkkk",
      "                                                               kddllllllddk",
      "                                                             kkdddlllllllldk",
      "                                                            kkkllllllllllldk",
      "                                                           kkkdllllllllllllk",
      "                                                           kkddlllddlllllllk",
      "                                                          kddddllldddddllllk",
      "                                kkkkkkkkkkkkkkk          kdddddllddddddllklkk",
      "                           kkkkkdddddddddddddddkkkkkkkkkkkdddddlldddlllllklldkk",
      "                         kkddddldddddddlddddldddddlddddddddlllllllllllllwwwldkk",
      "                        kddllddllddddlllddddllddddldddlldddlwwwwwllllwwwwwwwwdk",
      "                       kkddllddllddddlllddddllldddldddlldddlwwwwwllllwwwwwwwwwk",
      "                      kddddllddlldlllldddddlllddllldddlldddlwwwwwllllwwwwwwwwwk",
      "                     kdddllllddlldlllldddddlldddllldddlldddlwwwwwwwwwwwwwwwwwk",
      "                    kddddldlllllldlllldddddlldddlllddllllldlwwwwwwwwwwwwwwwkk",
      "     kkkkk         kkddddldlllllldlllllddddlldddlllddllllldlwwwwwwwdkkkkkkk",
      "    kdddddkk    kkkdlddddddlllllldlllllddddlldddlllddlllllllllwwwwwdk",
      "    kddddddk   kkldddddddddlllllldlllllddddlldddlllddlllllllllwwwwwdk",
      "    kddddddkkkkkkldddddddkdlllllldlllllddddlldddlllddlllllllllwwwwwdk",
      "    kddddddddddddlldddddkkdddllllldddllddddlldddlllddlllllllllwwwwwdk",
      "    kdddddddlldddldddkkk kddddddddddddlldddllddllllddlddddllllwwwwwdk",
      "     kkdddddllddddkkk    kdddddddddddddddllllllllllllddddddlllwwwwdkk",
      "       kkkkkkkkkkk        kdddddllllldddldklllllllllddddddddwwwwwwk",
      "                          kddddlllllllllldklllllllldddllddddwwwwwlk",
      "                          kkddddddlllddddkklllllllldddllllddwwwwwk",
      "                           kkddddddddddddkkwwlllllwkddllllllwwwwkk",
      "                           kkkkdlllllllllkkwwlllllwkddddddllwwwkkkk",
      "                           kdkkddllllllldkwwwwwwwwwkddddddlddkkkkddk",
      "                          kddddkldddddddkkkkkkkkkkkkdllllldkkkddddddk",
      "                         kkddddkdlllllddkk         kddddddd kkddddddk",
      "                         kkddddkdllllldkkk         kddddkkk kkddddddk",
      "                         kkddddkkdddddkk           kdlllk    kkkdddllk",
      "                         kkddddkklllldk            kllldk      kkdlwwkk",
      "                         kkdddddkwwwwwd             kwwdk        klwwwkkk",
      "                          kkwwwwkwwwwwwkkk          kwwlk         kwwwwwdk",
      "                           kwwwwklwwwwwdddk         kwwwk         kdwwwwdk",
      "                           kwwwwkkdwwwwwwwk         kwwwkkk       kkwwwwdk",
      "                           klwwwwwdkkwwwwwk         kwwwwwk         kkkkk",
      "                            kwwwwwdkkkkkkk          kwwwwwk",
      "                             kkkkkk                  kkkkk"
    ],
    // Frame 2
    [
      "",
      "                                                                k   kkk",
      "                                                               klkkkddk",
      "                                                               kldddddk",
      "                                                               kldddddk",
      "                                                              kdldkkkkk",
      "                                                              kdldddddk",
      "                                                            kkddlllllldkk",
      "                                                          kkdlldlllllllddk",
      "                                                          kddllllllllllldk",
      "                                                         kkddllllllllllldk",
      "                                                        kddddllldddddllldk",
      "                              kkkkkkkkkkkkkkk           kddddllldddddlkldkk",
      "                         kkkkkdddddddddddddddkkkkkkkkkkkdddddlldddllllkldddk",
      "                       kkddddldddddddlddddlldddddddddddddlllllllllllllwwlddk",
      "                      kddllddllddddlllddddllldddllddlldddlwwwwwllllwwwwwwwwk",
      "    kkkk             kkddllddllddddlllddddllldddllddlldddlwwwwwlllwwwwwwwwwk",
      "   kkdddkk         kkddllllddllddllldddddlllldllllddlldddlwwwwwwwwwwwwwwwwk",
      "   kddddddk       kddddllllddllddllldddddlllldllllddlldddlwwwwwwwwwwwwwwwk",
      "   kddddddk      kddddllkdlllllddllldddddlllddlllldllllddlwwwwwwwwwwwwwwk",
      "   kddddddk     kdddddddkdlllllddllllddddlllddlllldllllddlwwwwwwwkkkkkkk",
      "    kdddddkkk  kddlddddkddlllllddllllddddlllddlllldllllllllllwwwwk",
      "    kddddddddkkdldldddkkddlllllddllllddddlllddlllldllllllllllwwwwk",
      "     kkdddllddddllddddkkdddllllddllllddddlllddlllldllllllllllwwwwk",
      "      kkkklldddllddkkk kddddddlllddllldddlllddlllldllllllllllwwwwk",
      "          dddddddkk    kddddddddddddlldddllldllllldlllddddlllwwwdk",
      "          kkkkkk       kdddddddlllddddddlllllllllllllddddddlwwwwk",
      "                       kkddddlllllldddlldlllllllllllddlldddlwwwk",
      "                       kdkddllllllllllllklllllllllllddlllllddlwk",
      "                       kdkddllllllllllddklllllllllllddllllddddwk",
      "                      kkddkkdddlllddddddkwwwllllwwwlddllddllldwk",
      "                     kkdddkkdddddddlllddkwwwwwwwwwwddddlddlldddk",
      "                    kkddddddklllllllllddkwwwwwwwwwwwdkddlllddlddk",
      "                    kkddddddkkdlllldddddkkkkkkkkkkkkkkkkllddllldkk",
      "                   kkdddddddddddddddlldkk           kddkkkdlllwwdk",
      "                   kwwwwdddkkkkklllllldk            kdddkkkkdwwwdk",
      "                   kwwwwkkk    kllllddkk            kddddddkkkwwk",
      "                   kwwwwk      kdlddllkk             kdwwwlkddwwk",
      "                   kwwwkk      kddllllkk             kkwwwlkkwwwk",
      "                   kwwwk       kkllllllkkkk           kdwwlkkwwwk",
      "                   kwwwk         kwwwwwwwwwk           kwwwkklwwk",
      "                   kwwwk          kwwwwwwwwk           kwwwwwkkk",
      "                    kkk            kkwwwwwwk            kwwwwdk",
      "                                     kkkkkk              kkkkkk"
    ],
    // Frame 3
    [
      "                                                                kkk  kdk",
      "                                                                klk kddk",
      "                                                                kldkdddk",
      "                                                               kkldddddk",
      "                                                              kddldkkkkk",
      "                                                             kdddlllllldk",
      "                                                            kllldllllllldk",
      "                                                           kdllllllllllllk",
      "                                                          kkdllllllllllllk",
      "                                                         kkkdlllldlllllllk",
      "                              kkkkkkkkkkkkkkk           kddddlllldddddlklkkk",
      "                         kkkkkdddddddddddddddkkkkkkkkkkkdddddlldddlllllkllllk",
      "                        kddddldddddddddddddlddddddddddddddlllllllllllllwwlddk",
      "                       kkddddlddddddddlddddlddddddddddddddlllllllllllllwwlllk",
      "                      kddllddllddddllllddddllddddldddlldddlwwwwwlllwwwwwwwwwk",
      "    kkkkk             kddllddllddddllllddddllddddldddlldddlwwwwwlllwwwwwwwwwk",
      "   kddddk          kkkdllllddllddllldddddllllddllldddlldddlwwwwwwwwwwwwwwwwk",
      "   kdddddk        kddddlkllllllddllldddddllldddllldlllllddlwwwwwwwwwwwwwwkk",
      "   kdddddk      kkddddddkllllllddllldddddllldddllldlllllddlwwwwwwwwkkkkkk",
      "   kdddddk    kkddlddddkkllllllddllllldddllldddllldlllllddlwwwwwwwkk",
      "   kdddddkkk  kdldldddkkdllllllddllllldddllldddllldlllllllllllwwwwk",
      "   kkdddddddkkkdldldddkkdddllllddllllldddllldddllldllllllllllllwwwk",
      "     kddddlldddllldkkk kdddllllddllllldddllldddllldllllllllllllwwwk",
      "     kkkkdlldddddldk   kdddddllldddllldddllldddllldlllllllllllllwwk",
      "      kkkkddddddkkk    kdddddddllllllldddllldllllldlllllllldddlwwlk",
      "          kkkkkk       kddllllldddllllllllllllllllllllllldddddlwwk",
      "                       kdddllllddddllllllllllllllllllllldddddddlwk",
      "                       kdddlllllddddlllllllllllllllllllddddllddllk",
      "                       kkdddlllllddddlllllllllllllllllldddlllllldk",
      "                       kkdldddddlllldkwwwwwwlllllwwwwwwdddllldddllk",
      "                        kdllllldddddkkwwwwwwlllllwwwwwwlddllldddlldk",
      "                        kddllllddddkkdwwwwwwwwwwwwwwwwwwdddlddllldddk",
      "                        klldddlllldkkkkkkkkkkkkkkkkkkkkkkkdddlldddlldk",
      "                       kdllldddddddkdddkk         kdddddkkkkdlldddllllk",
      "                       kdlllllldddkdddkk          kkdddkkk wkddddlllwwdkk",
      "                       kddddllkkkkdddkk           kkddddkk   kkkdllwwwwwkk",
      "                       kkddddk kdddddkk            kkddldk      kkkwwwwwwwk",
      "                       kwwlllk kdwwwwwk            kkdwwdk         klwwwwwk",
      "                       kwwwwwk  kwwwwwkkk         kkkwwwdk          kkwwwwk",
      "                       kwwwwwkk kwwwwwwwwk       kkwwwwkk             kkkk",
      "                        kwwwwdkk kkwwwwwwk       kwwwwkk",
      "                         kwwwwwk   kkkkkk        kkwwkk",
      "                         kwwwwwk                   kkk",
      "                          kkkkk"
    ]
  ];

  // ── Sit frame (pixel arrays, 26×56 source) ───────────────────────────
  const SIT_SCALE = 2;

  const SIT = [
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                                                           ",
    "                                                        kk             kk                  ",
    "                                                       kddk           kddk                 ",
    "                                                       kddk           kddk                 ",
    "                                                       klllkk        kkllk                 ",
    "                                                       klllddk      kllllk                 ",
    "                                                       klllldkkkkkkklllllk                 ",
    "                                                       klllldddldlldlllllk                 ",
    "                                kkkkkkkkkkk            kllllldlldlldlllllk                 ",
    "                             kkkdddddddddddk           kllllldlldlldlllllk                 ",
    "                           kkdddddddddddlllkkkkkk      kllllldlldlldlllllk                 ",
    "                          kdddddlldddddllldddlllkk    klllllllllllllllllllkk               ",
    "                         kddlddddlddddlllldddlllddkkkkdllllllllllllllllllllk               ",
    "                        kdddlddddddddlllddddlllldddldklllllllllllllllllllllk               ",
    "                       kddddllddlldddllldddllldddddldklllllllllllllllllllllk               ",
    "                      kdddddlldddddddlllddlllldddllldkllllllkkkllllllkkklddk               ",
    "                      kdddddllllddddllllddlllldddllldkddddlllllllllllllllddk               ",
    "                      kdddddddlllddddlllddllllddlllldkddddlllwwwwdddwwwllddk               ",
    "                     kddddddddddllldddllddllllddlllldkddddllwwwwwwdwwwwwlddk               ",
    "                    kddlllllddddlllllddlddllllddlllldkddddlwwwwwwwwwwwwwlddk               ",
    "                   kdddlllllllldddlldddlllllllddllllllkkdwwwwwwwllwllwwwwkk                ",
    "                  klddddllllllllddddlddlllllllldllllllkkkkwwwwwwwwwwwwwwwkk                ",
    "         kkkkkkkkkdlddddllllllllllddlddlllllllllllllddddkkkwwwwwwwwwwwwwkkkkkk             ",
    "        kddddllldddlddddlllllddllllkkkkkllllllllllldddllddkkkkkkkkkkkkkkdlwwwkk            ",
    "        kddlllldddllddddlllllddldddddddkkldllllllllddlllddlllllllwwwwwkddlwwwwkk           ",
    "        kdddllldddlddkkdllddddldddwwwwwwkkwwwwwwwwkddllddllllllllwwwwwkkdlwwwwwkk          ",
    "        kdddllldddldkkkkdddlllddwwwwwwwwkkwwwwwwwwkddllddlllllllwwwwwwkkkkkkkkkkk          ",
    "        kdddllldddldk  kddlllddwwwwwwwwwkkwwwwwwwwkklllddlllllllwwwwwwk                    ",
    "         kkkkkkkkkkkk   kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk                    ",
  ];


  // ── Canvas dimensions ────────────────────────────────────────────────
  const CANVAS_W = FRAME_W * WALK_SCALE;   // 182
  const CANVAS_H = 90;

  // ── Timing ───────────────────────────────────────────────────────────
  const FRAME_MS = 100;
  const WALK_SPD = 3.5;
  const SIT_MS   = 4000;

  // ── Draw helper (works for walk and sit frames) ───────────────────────
  function drawFrame (ctx, rows, scale) {
    const fh = rows.length;
    const fw = rows.reduce((m, r) => Math.max(m, r.length), 0);
    const dw = fw * scale;
    const dh = fh * scale;
    const dx = Math.round((CANVAS_W - dw) / 2);
    const dy = CANVAS_H - dh;   // bottom-align (clips above if oversized)
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    for (let y = 0; y < fh; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        if (c === ' ') continue;
        ctx.fillStyle = PALETTE[c];
        ctx.fillRect(dx + x * scale, dy + y * scale, scale, scale);
      }
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init () {
    const canvas = document.getElementById('cat-canvas');
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    const stage = canvas.parentElement;

    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;
    stage.style.height = CANVAS_H + 'px';

    let x       = -CANVAS_W;
    let animIdx = 0;
    let lastAt  = 0;
    let state   = 'walk';
    let sitAt   = 0;
    let restX   = 0;

    function recalc () {
      restX = Math.round(stage.offsetWidth * 0.38 - CANVAS_W / 2);
    }
    recalc();
    window.addEventListener('resize', recalc);

    function tick (now) {
      switch (state) {

        case 'walk':
          if (now - lastAt > FRAME_MS) {
            animIdx = (animIdx + 1) % WALK.length;
            lastAt  = now;
          }
          x += WALK_SPD;
          if (x >= restX) {
            x = restX; state = 'sit'; sitAt = now;
            drawFrame(ctx, SIT, SIT_SCALE);
          } else {
            drawFrame(ctx, WALK[animIdx], WALK_SCALE);
          }
          break;

        case 'sit':
          if (now - sitAt > SIT_MS) {
            state = 'leave'; lastAt = now; animIdx = 0;
          }
          break;

        case 'leave':
          if (now - lastAt > FRAME_MS) {
            animIdx = (animIdx + 1) % WALK.length;
            lastAt  = now;
          }
          x += WALK_SPD;
          drawFrame(ctx, WALK[animIdx], WALK_SCALE);
          if (x > stage.offsetWidth + CANVAS_W) {
            x = -CANVAS_W; state = 'walk'; animIdx = 0;
          }
          break;
      }

      canvas.style.left = Math.round(x) + 'px';
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
