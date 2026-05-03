/* now-widget.js — two-strip RAF marquee (Henry Codes pattern) */
(function () {
  const SPOTIFY_URL = 'https://spotify-api-eight-ochre.vercel.app/api/now-playing';
  const COORDS      = "55°51'33.2\"N  4°17'46.1\"W";
  const COPIES      = 3; // copies per strip — keeps each strip wider than any viewport

  let lastTrack = null; // keeps last known track in memory across polls

  function ukTime() {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
  }

  async function fetchTemp() {
    try {
      const r = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=55.8617' +
        '&longitude=-4.2583&current=temperature_2m'
      );
      const d = await r.json();
      return Math.round(d.current.temperature_2m) + '°C';
    } catch (_) { return null; }
  }

  async function fetchSpotify() {
    try {
      const r = await fetch(SPOTIFY_URL);
      const d = await r.json();
      if (d.title && d.artist) {
        const label = d.isPlaying ? 'Now playing' : 'Last played';
        lastTrack = { text: label + ': ' + d.title + ' — ' + d.artist, url: d.url };
      }
    } catch (_) {}
    return lastTrack; // null only on very first load if Spotify has never been polled
  }

  function makeItems(temp, spotify) {
    const locBlock = temp
      ? temp + ' @ ' + COORDS + ' (Glasgow, Scotland)'
      : COORDS + ' (Glasgow, Scotland)';
    return [
      { key: 'location', value: locBlock },
      { key: 'time',     value: ukTime() },
      { key: 'spotify',  value: spotify ? spotify.text : '',
                         url:   spotify ? spotify.url  : null, hidden: !spotify },
    ];
  }

  function makeStrip(items) {
    const strip = document.createElement('div');
    strip.className = 'ticker-strip';
    for (let i = 0; i < COPIES; i++) {
      items.forEach(item => {
        if (item.hidden) return;
        const el = item.key === 'spotify'
          ? document.createElement('a')
          : document.createElement('span');
        el.dataset.key = item.key;
        el.textContent = item.value;
        if (item.key === 'spotify' && item.url) {
          el.href = item.url;
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
        }
        strip.appendChild(el);
        const sep = document.createElement('span');
        sep.className = 'sep';
        sep.textContent = '·';
        strip.appendChild(sep);
      });
    }
    return strip;
  }

  function applyItems(strip, items) {
    items.forEach(item => {
      strip.querySelectorAll('[data-key="' + item.key + '"]').forEach(el => {
        if (item.hidden) {
          el.hidden = true;
        } else {
          el.hidden = false;
          el.textContent = item.value;
          if (item.key === 'spotify') el.href = item.url || '';
        }
      });
    });
  }

  function startTicker(items) {
    const ticker = document.getElementById('now-ticker');
    if (!ticker) return null;

    // Runner wraps both strips — we translate the runner (1 write/frame, not 2)
    const runner = document.createElement('div');
    runner.id = 'ticker-runner';
    const stripA = makeStrip(items);
    const stripB = makeStrip(items);
    runner.appendChild(stripA);
    runner.appendChild(stripB);
    ticker.appendChild(runner);

    const BASE_SPEED = 0.6;
    const SLOW_SPEED = 0.12;
    let speed         = BASE_SPEED;
    let targetSpeed   = BASE_SPEED;
    let pos           = 0;
    let stripWidth    = 0;
    let pendingUpdate = null;

    ticker.addEventListener('mouseenter', () => { targetSpeed = SLOW_SPEED; });
    ticker.addEventListener('mouseleave',  () => { targetSpeed = BASE_SPEED; });

    function measureWidth() {
      const w = stripA.offsetWidth;
      if (w > 0) stripWidth = w;
    }

    function tick() {
      if (stripWidth === 0) { measureWidth(); requestAnimationFrame(tick); return; }

      speed += (targetSpeed - speed) * 0.08;
      pos   -= speed;

      if (pos <= -stripWidth) {
        pos += stripWidth;
        if (pendingUpdate) {
          applyItems(stripA, pendingUpdate);
          applyItems(stripB, pendingUpdate);
          pendingUpdate = null;
          measureWidth();
        }
      }

      runner.style.transform = 'translate3d(' + pos + 'px, 0, 0)';
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    window.addEventListener('resize', measureWidth);

    return {
      updateTime: function () {
        const t = ukTime();
        applyItems(stripA, [{ key: 'time', value: t }]);
        applyItems(stripB, [{ key: 'time', value: t }]);
      },
      queueUpdate: function (newItems) {
        pendingUpdate = newItems;
      },
    };
  }

  async function init() {
    const [temp, spotify] = await Promise.all([fetchTemp(), fetchSpotify()]);
    const ticker = startTicker(makeItems(temp, spotify));
    if (!ticker) return;
    setInterval(() => ticker.updateTime(), 1000);
    setInterval(async () => {
      const track = await fetchSpotify();
      ticker.queueUpdate(makeItems(temp, track));
    }, 30000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
