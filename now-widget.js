/* now-widget.js — CSS-animation ticker with RAF hover slow-down */
(function () {
  const SPOTIFY_URL = 'https://spotify-api-eight-ochre.vercel.app/api/now-playing';
  const COORDS = "55°51'33.2\"N  4°17'46.1\"W";
  const COPIES  = 6; // duplicated copies so the strip never visibly ends

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
      if (d.isPlaying && d.title)
        return { text: 'Now playing: ' + d.title + ' — ' + d.artist, url: d.url };
    } catch (_) {}
    return null;
  }

  function makeItems(temp, spotify) {
    const locBlock = temp
      ? temp + ' @ ' + COORDS + ' (Glasgow, Scotland)'
      : COORDS + ' (Glasgow, Scotland)';
    return [
      { key: 'location', value: locBlock },
      { key: 'time',     value: ukTime() },
      { key: 'spotify',  value: spotify ? spotify.text : '',
                         url:   spotify ? spotify.url  : null,      hidden: !spotify },
    ];
  }

  function buildInner(inner, items) {
    inner.innerHTML = '';
    for (let i = 0; i < COPIES * 2; i++) {
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
        inner.appendChild(el);
        const sep = document.createElement('span');
        sep.className = 'sep';
        sep.textContent = '·';
        inner.appendChild(sep);
      });
    }
  }

  function applyItems(inner, items) {
    items.forEach(item => {
      inner.querySelectorAll('[data-key="' + item.key + '"]').forEach(el => {
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
    const inner = document.getElementById('now-ticker-inner');
    const ticker = document.getElementById('now-ticker');
    if (!inner || !ticker) return null;

    buildInner(inner, items);

    // Hover slow-down — desktop only (getAnimations may be empty on mobile/Safari)
    const anim = inner.getAnimations()[0];
    if (anim) {
      const BASE_RATE = 1;
      const SLOW_RATE = 0.2;
      let currentRate = BASE_RATE;
      let targetRate  = BASE_RATE;

      ticker.addEventListener('mouseenter', () => { targetRate = SLOW_RATE; });
      ticker.addEventListener('mouseleave',  () => { targetRate = BASE_RATE; });

      (function raf() {
        currentRate += (targetRate - currentRate) * 0.06;
        if (Math.abs(currentRate - anim.playbackRate) > 0.001) {
          anim.updatePlaybackRate(currentRate);
        }
        requestAnimationFrame(raf);
      })();
    }

    return {
      updateTime: function () {
        applyItems(inner, [{ key: 'time', value: ukTime() }]);
      },
      updateSpotify: function (newItems) {
        // Apply off-screen — safe because content repeats; no visible jump
        applyItems(inner, newItems);
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
      ticker.updateSpotify(makeItems(temp, track));
    }, 30000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
