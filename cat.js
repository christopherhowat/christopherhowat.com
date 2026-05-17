/* cat.js — Peanut sprite animation
   All frames rendered as pixel-art fillRect arrays.
   Palette: k=black  d=dark-orange  l=light-orange  w=off-white
*/
(function () {

  // ── Unified palette ──────────────────────────────────────────────────
  const PALETTE = { k:'#000000', d:'#c4321d', l:'#e03b22', w:'#efefff' };

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
    "        kdddllldddldddddllddddldddwwwwwwkkwwwwwwwwkddllddllllllllwwwwwkkdlwwwwwkk          ",
    "        kdddllldddlddddddddlllddwwwwwwwwkkwwwwwwwwkddllddlllllllwwwwwwkkkkkkkkkkk          ",
    "        kdddllldddldddddddlllddwwwwwwwwwkkwwwwwwwwkklllddlllllllwwwwwwk                    ",
    "        kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk                    ",
  ];

  // ── Bat frames (two-frame swipe animation) ───────────────────────────
  const BAT = [
    // Frame 1 — paw raised
    [
      "                                                                 kkk  kkk                  ",
      "                                                                 kldkkddk                  ",
      "                                                                 kldddddk                  ",
      "                                                                 kldddddk                  ",
      "                                                                kdlldkkkkk                 ",
      "                                                               kddllllllddk                ",
      "                                                             kkdddlllllllldk               ",
      "                                                            kkkllllllllllldk               ",
      "                                                           kkkdllllllllllllk               ",
      "                                                           kkddlllddlllllllk               ",
      "                                                          kddddllldddddllklk               ",
      "                                kkkkkkkkkkkkkkk          kdddddllddddddllklkk              ",
      "                           kkkkkdddddddddddddddkkkkkkkkkkkdddddlldddlllllllldkk            ",
      "                         kkddddldddddddlddddldddddlddddddddlllllllllllllwwwldkk            ",
      "                        kddllddllddddlllddddllddddldddlldddlwwwwwllllwwwwwwwwdk            ",
      "                       kkddllddllddddlllddddllldddldddlldddlwwwwwllllwwwwwwwwwk            ",
      "                      kddddllddlldlllldddddlllddllldddlldddlwwwwwllllwwwwwwwwwk            ",
      "                     kdddllllddlldlllldddddlldddllldddlldddlwwwwwwwwwwwwwwwwwk             ",
      "                    kddddldlllllldlllldddddlldddlllddllllldlwwwwwwwwwwwwwwwkk              ",
      "     kkkkk         kkddddldlllllldlllllddddlldddlllddllllldlwwwwwwwwkkkkkkk                ",
      "    kdddddkk    kkkdlddddddlllllldlllllddddlldddlllddlllllllllwwwwwwk                      ",
      "    kddddddk   kkldddddddddlllllldlllllddddlldddlllddlllllllllwwwwwwk                      ",
      "    kddddddkkkkkkldddddddkdlllllldlllllddddlldddlllddlllllllllwwwwwwk                      ",
      "    kddddddddddddlldddddkkdddllllldddllddddlldddlllddlllllllllwwwwwwk                      ",
      "    kdddddddlldddldddkkk kddddddddddddlldddllddllllddlddddllllwwwwwwk                      ",
      "     kkdddddllddddkkk    kdddddddddddddddllllllllllllddddddlllwwwwdkk    kkkkkk            ",
      "       kkkkkkkkkkk        kdddddllllldddldklllllllllddddddddwwwwwwkkkkkkkwwwwwk            ",
      "                          kddddlllllllllldklllllllldddllddddwwwwwlkldllldwwwwwk            ",
      "                          kkddddddlllddddkklllllllldddllllddwwwwwkllddlddwwwwwk            ",
      "                           kkddddddddddddkkwwlllllwkddllllllwwwwkllddllddkkkkkk            ",
      "                           kkkkdlllllllllkkwwlllllwkddddddllwwwkklddllkkkk                 ",
      "                           kdkkddllllllldkwwwwwwwwwkddddddlddkkkkkkkkk                     ",
      "                          kddddkldddddddkkkkkkkkkkkkdllllldkk                              ",
      "                         kkddddkdlllllddkk         kddddddd                                ",
      "                         kkddddkdllllldkkk         kddddkkk                                ",
      "                         kkddddkkdddddkk           kdlllk                                  ",
      "                         kkddddkklllldk            kllldk                                  ",
      "                         kkdddddkwwwwwk             kwwdk                                  ",
      "                          kkwwwwkwwwwwk             kwwlk                                  ",
      "                           kwwwwkwwwwwk             kwwwk                                  ",
      "                           kwwwwkkkwwwkkk           kwwwkkk                                ",
      "                           klwwwwwkwwwwwk           kwwwwwk                                ",
      "                            kwwwwwkwwwwwk           kwwwwwk                                ",
      "                             kkkkkkkkkkkk            kkkkk                                 ",
    ],
    // Frame 2 — paw extended
    [
      "                                                                 k  kkkk                   ",
      "                                                                klkkkddk                   ",
      "                                                                klkkdddk                   ",
      "                                                                kllkdddk                   ",
      "                                                               kkllllddk                   ",
      "                                                              kddllkkklk                   ",
      "                                                             kdddlllllldk                  ",
      "                                                            kllddllllllldk                 ",
      "                                                           klllllllllllllk                 ",
      "                                                          kklllllllllllllk      kkkk       ",
      "                                                         kkddlllldlllllllk     kwwwk       ",
      "                                kkkkkkkkkkkkk           kddddlllldddddlklkkk   kwwwk       ",
      "                          kkkkkdddddddlddddllkkkkkkkkkkkdddddlllddlllllkllddk kwwwwk       ",
      "                        kkdddlldddddddlddddllddddldddllddllllllllllllllwwdddkkwwwwwk       ",
      "                       kdddldlldddddddlddddllddddldddllddllllllllllwwwwwwwwdkkddwwk        ",
      "                      kdddlldllldddllllddddllddddldddllddllwwwwwlllwwwwwwwwwkddwdk         ",
      "                      kdddlldllldddllllddddllddddldddllddllwwwwwlllwwwwwwwwkkdddk          ",
      "                   kkkddlllldllldllllddddllllddllldddllddllwwwwwwwwwwwwwwwkklllk           ",
      "                  kkdddlldlllllldllllddddllldddllldllllldllwwwwwwwwwwwwwwkllllk            ",
      "                kkdddddlddlllllldllllldddllldddllldlllllddlwwwwwwwwwwkkkkdlddk             ",
      "    kkkkk       dddlddddddlllllldllllldddllldddlllddlllldllwwwwwwwwwkkldddddk              ",
      "   kdddddk    kkdddldddddddllllldllllldddllldddlllddlllllllllwwwwwkkklllddlk               ",
      "   kddddddkkkkkdlddldddddddllllldllllldddllldddllldllllllllllwwwwwkdddllkkk                ",
      "   kdddddddlllddllldddddddddddlllddllldddllldddlllddlllllllllwwwwwkdddkk                   ",
      "   kdddddddlllddldddkkkkkdddddddlllllldddllldllllldllllllllllwwwwwkddkk                    ",
      "   kkkkddddlllddddkk   kkddddddddddllldddllllllllllllllddddllwwwwdkkk                      ",
      "       kkkkkkkkkk       kkdlllllddddllllllllllllllllldddddddlwwwwkk                        ",
      "                        kkddlllllddddllllllllllllllllddlldddlwwwkk                         ",
      "                        kkdddllllldddklllllllllllllllddlldddlwwlk                          ",
      "                         kdllddddllllkwwwwwwlllllwwllddllllllwkkk                          ",
      "                         kdllldddddddkwwwwwwlllllwwwdddlllllllkkk                          ",
      "                        kdlddlllldddkdwwwwwwwwwwwwwwddddddddllk                            ",
      "                       kddlllddlllddkkkkkkkkkkkkkkkkkkdllllllk                             ",
      "                       kdldllllddddkdddk             kdlllldk                              ",
      "                       kwwldddddddkkddkk             kkdddddk                              ",
      "                       kwwwldkkkkddddkk               kdddlldk                             ",
      "                       kwwwwkk kkddddkk               kdlllldk                             ",
      "                       kwwwwk  kddddk                 kdwwlldk                             ",
      "                        kwwwk  kwwwdk                  kkwwwdk                             ",
      "                        kwwwwk kwwwwk                   kwwwwkkkk                          ",
      "                        kwwwwk kwwwwdk                  kwwwwdddk                          ",
      "                         kwwwk kwwwwwkk                 kwwwwwwlk                          ",
      "                          kkk   kwwwwwwk                 kwwwwwlk                          ",
      "                                 kkkkkk                   kkkkkk                           ",
    ],
  ];

  // ── Canvas dimensions ────────────────────────────────────────────────
  const CANVAS_W = FRAME_W * WALK_SCALE;   // 182
  const CANVAS_H = 90;

  // ── Timing ───────────────────────────────────────────────────────────
  const FRAME_MS        = 120;   // walk animation frame interval
  const BAT_FRAME_MS    = 80;    // each bat frame lasts this long
  const BAT_COOLDOWN_MS = 2000;  // ignore mouse for this long after batting
  const WALK_SPD        = 120;   // px/sec at a 1000px-wide stage (scales with stage width)
  const SIT_DIST        = 20;    // px — close enough to sit
  const ATTRACT_DIST    = 280;   // px — mouse must be within this to attract her
  const BAT_DIST        = 90;    // px — close enough to start swiping
  const EYELINE_Y       = 80;    // px above cat centre — ignore mouse higher than this

  // Mobile idle wander: sit 8–20 s, then stroll to a new spot
  const WANDER_MIN_MS   = 8000;
  const WANDER_MAX_MS   = 20000;

  // True when the primary input is touch / coarse pointer (i.e. mobile/tablet)
  const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches;

  // ── Draw helper (works for walk and sit frames) ───────────────────────
  function drawFrame (ctx, rows, scale) {
    const fh = rows.length;
    const fw = rows.reduce((m, r) => Math.max(m, r.length), 0);
    const dw = fw * scale;
    const dh = fh * scale;
    const dx = Math.round((CANVAS_W - dw) / 2);
    const dy = CANVAS_H - dh;   // bottom-align
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
    const canvas     = document.getElementById('cat-canvas');
    const fakeCursor = document.getElementById('fake-cursor');
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    const stage = canvas.parentElement;

    // ── Mobile idle mode — no mouse tracking, just sleep and wander ──────
    if (IS_MOBILE) {
      canvas.width  = CANVAS_W;
      canvas.height = CANVAS_H;
      stage.style.height = CANVAS_H + 'px';

      let catX        = Math.round(stage.offsetWidth * 0.38 - CANVAS_W / 2);
      let restX       = catX;
      let animIdx     = 0;
      let lastAt      = 0;
      let facingRight = true;
      let sitUntil    = 0;   // timestamp when she'll next decide to wander
      let state       = 'sit';

      window.addEventListener('resize', () => {
        catX = Math.max(0, Math.min(catX, stage.offsetWidth - CANVAS_W));
      });

      function setFacing (right) {
        if (right !== facingRight) {
          facingRight = right;
          canvas.style.transform = right ? '' : 'scaleX(-1)';
        }
      }

      function pickRestSpot () {
        const pad = CANVAS_W;
        return Math.round(pad + Math.random() * (stage.offsetWidth - pad * 2));
      }

      function scheduleWander (now) {
        const delay = WANDER_MIN_MS + Math.random() * (WANDER_MAX_MS - WANDER_MIN_MS);
        sitUntil = now + delay;
      }

      let prevNow = 0;
      function mobileTick (now) {
        const dt = prevNow ? Math.min((now - prevNow) / 1000, 0.1) : 1 / 60;
        prevNow = now;
        if (lastAt === 0) { lastAt = now; scheduleWander(now); }

        switch (state) {
          case 'sit':
            drawFrame(ctx, SIT, SIT_SCALE);
            if (now >= sitUntil) {
              restX = pickRestSpot();
              state = 'walk_to_rest';
              animIdx = 0; lastAt = now;
            }
            break;

          case 'walk_to_rest': {
            const dx = restX - catX;
            const d  = Math.abs(dx);
            if (d < SIT_DIST) {
              catX = restX; state = 'sit';
              drawFrame(ctx, SIT, SIT_SCALE);
              scheduleWander(now);
            } else {
              const spd = WALK_SPD * dt * (stage.offsetWidth / 1000);
              if (now - lastAt > FRAME_MS) { animIdx = (animIdx + 1) % WALK.length; lastAt = now; }
              catX += Math.sign(dx) * Math.min(spd, d);
              setFacing(dx >= 0);
              drawFrame(ctx, WALK[animIdx], WALK_SCALE);
            }
            break;
          }
        }

        canvas.style.left = Math.round(catX) + 'px';
        requestAnimationFrame(mobileTick);
      }

      drawFrame(ctx, SIT, SIT_SCALE);
      canvas.style.left = Math.round(catX) + 'px';
      requestAnimationFrame(mobileTick);
      return;   // ← skip the desktop init below
    }

    // ── Desktop mouse-tracking mode ──────────────────────────────────────

    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;
    stage.style.height = CANVAS_H + 'px';

    // Starting home position
    let homeX = Math.round(stage.offsetWidth * 0.38 - CANVAS_W / 2);
    window.addEventListener('resize', () => {
      homeX = Math.round(stage.offsetWidth * 0.38 - CANVAS_W / 2);
    });

    let catX             = homeX;
    let restX            = homeX;   // where she's heading when wandering
    let animIdx          = 0;
    let batPhase         = 0;       // 0 = frame 1 showing, 1 = frame 2 showing
    let lastAt           = 0;
    let facingRight      = true;
    let lastMdx          = 0;       // direction to mouse at moment of bat
    let batCooldownUntil = 0;       // timestamp; ignore mouse before this

    // States: 'sit' | 'walk_to_mouse' | 'bat' | 'walk_to_rest'
    let state = 'sit';

    let mouseClientX = -9999;
    let mouseClientY = -9999;
    document.addEventListener('mousemove', e => {
      mouseClientX = e.clientX;
      mouseClientY = e.clientY;
      // Keep fake cursor in sync while it's visible
      if (fakeCursor && fakeCursor.style.display !== 'none') {
        fakeCursor.style.left = e.clientX + 'px';
        fakeCursor.style.top  = e.clientY + 'px';
      }
    });

    function setFacing (right) {
      if (right !== facingRight) {
        facingRight = right;
        canvas.style.transform = facingRight ? '' : 'scaleX(-1)';
      }
    }

    function pickRestSpot () {
      const pad = CANVAS_W;
      return Math.round(pad + Math.random() * (stage.offsetWidth - pad * 2));
    }

    // Pick a rest spot on the opposite side of the stage from batMdx
    function pickRestSpotAway (batMdx) {
      const pad = CANVAS_W;
      const w   = stage.offsetWidth;
      if (batMdx >= 0) {
        // mouse was to the right — run to the left portion
        const hi = Math.max(pad + 10, Math.floor(w * 0.35));
        return Math.round(pad + Math.random() * (hi - pad));
      } else {
        // mouse was to the left — run to the right portion
        const lo = Math.floor(w * 0.65);
        return Math.round(lo + Math.random() * Math.max(10, w - pad - lo));
      }
    }

    // Show pixel cursor (hides real cursor); call before entering bat state
    function showFakeCursor () {
      if (!fakeCursor) return;
      fakeCursor.style.transition = 'none';
      fakeCursor.style.opacity    = '1';
      fakeCursor.style.left       = mouseClientX + 'px';
      fakeCursor.style.top        = mouseClientY + 'px';
      fakeCursor.style.display    = 'block';
      document.body.classList.add('cat-active');
    }

    // Fling the fake cursor away in the direction the cat batted, then restore
    function repulseCursor (batMdx) {
      if (!fakeCursor) return;
      const flyX = Math.sign(batMdx || 1) * 220;
      const flyY = -70;
      // Snap to current mouse position first (no transition)
      fakeCursor.style.transition = 'none';
      fakeCursor.style.left       = mouseClientX + 'px';
      fakeCursor.style.top        = mouseClientY + 'px';
      // Force reflow so the snap is committed before we add the transition
      void fakeCursor.offsetWidth;
      // Now animate it flying away
      fakeCursor.style.transition = 'transform 400ms ease-out, opacity 400ms ease-out';
      fakeCursor.style.transform  = `translate(${flyX}px, ${flyY}px)`;
      fakeCursor.style.opacity    = '0';

      setTimeout(() => {
        if (!fakeCursor) return;
        fakeCursor.style.display   = 'none';
        fakeCursor.style.transition = 'none';
        fakeCursor.style.transform  = 'none';
        fakeCursor.style.opacity    = '1';
        document.body.classList.remove('cat-active');
      }, 450);
    }

    let prevNow = 0;
    function tick (now) {
      const dt        = prevNow ? Math.min((now - prevNow) / 1000, 0.1) : 1 / 60;
      prevNow = now;
      const spd       = WALK_SPD * dt * (stage.offsetWidth / 1000);
      const sr        = stage.getBoundingClientRect();
      const catVX     = sr.left + catX + CANVAS_W / 2;
      const catVY     = sr.top  + CANVAS_H / 2;
      const mdx       = mouseClientX - catVX;
      const mdy       = mouseClientY - catVY;
      const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const inCooldown = now < batCooldownUntil;

      switch (state) {

        case 'sit':
          drawFrame(ctx, SIT, SIT_SCALE);
          if (!inCooldown && mouseDist < ATTRACT_DIST && mdy > -EYELINE_Y
              && (facingRight ? mdx > 0 : mdx < 0)) {
            state = 'walk_to_mouse'; animIdx = 0; lastAt = now;
          }
          break;

        case 'walk_to_mouse': {
          if (mouseDist > ATTRACT_DIST || mdy < -EYELINE_Y) {
            // Mouse left or went too high — wander somewhere new
            state = 'walk_to_rest'; restX = pickRestSpot(); animIdx = 0; lastAt = now;
            break;
          }
          if (mouseDist < BAT_DIST) {
            lastMdx = mdx;
            showFakeCursor();
            state = 'bat'; batPhase = 0; lastAt = now;
            break;
          }
          // Walk toward mouse
          const tx = mouseClientX - sr.left - CANVAS_W / 2;
          const dx = tx - catX;
          const d  = Math.abs(dx);
          if (now - lastAt > FRAME_MS) { animIdx = (animIdx + 1) % WALK.length; lastAt = now; }
          catX += Math.sign(dx) * Math.min(spd, d);
          setFacing(dx >= 0);
          drawFrame(ctx, WALK[animIdx], WALK_SCALE);
          break;
        }

        case 'bat':
          setFacing(lastMdx >= 0);
          if (batPhase === 0) {
            // Show frame 1 for BAT_FRAME_MS, then advance to frame 2
            drawFrame(ctx, BAT[0], WALK_SCALE);
            if (now - lastAt > BAT_FRAME_MS) { batPhase = 1; lastAt = now; }
          } else {
            // Show frame 2 for BAT_FRAME_MS, then bat is done — walk away
            drawFrame(ctx, BAT[1], WALK_SCALE);
            if (now - lastAt > BAT_FRAME_MS) {
              batCooldownUntil = now + BAT_COOLDOWN_MS;
              repulseCursor(lastMdx);
              restX = pickRestSpotAway(lastMdx); animIdx = 0; lastAt = now;
              state = 'walk_to_rest';
            }
          }
          break;

        case 'walk_to_rest': {
          if (!inCooldown && mouseDist < ATTRACT_DIST && mdy > -EYELINE_Y) {
            state = 'walk_to_mouse'; animIdx = 0; lastAt = now;
            break;
          }
          const dx = restX - catX;
          const d  = Math.abs(dx);
          if (d < SIT_DIST) {
            catX = restX; state = 'sit';
            drawFrame(ctx, SIT, SIT_SCALE);
          } else {
            if (now - lastAt > FRAME_MS) { animIdx = (animIdx + 1) % WALK.length; lastAt = now; }
            catX += Math.sign(dx) * Math.min(spd, d);
            setFacing(dx >= 0);
            drawFrame(ctx, WALK[animIdx], WALK_SCALE);
          }
          break;
        }
      }

      canvas.style.left = Math.round(catX) + 'px';
      requestAnimationFrame(tick);
    }

    drawFrame(ctx, SIT, SIT_SCALE);
    canvas.style.left = Math.round(catX) + 'px';
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
