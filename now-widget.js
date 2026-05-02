/* now-widget.js — scrolling ticker: location · weather · time · Spotify */
(function () {
  const LAT = 55.8617;
  const LON = -4.2583;
  const SPOTIFY_URL = 'https://spotify-api-eight-ochre.vercel.app/api/now-playing';

  function toDMS(val, pos, neg) {
    const abs = Math.abs(val);
    const d = Math.floor(abs);
    const mFull = (abs - d) * 60;
    const m = Math.floor(mFull);
    const s = Math.round((mFull - m) * 60);
    return (val >= 0 ? pos : neg) + ' ' + d + '° ' + m + "' " + s + '"';
  }

  function ukTime() {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
  }

  async function fetchTemp() {
    try {
      const r = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=' + LAT +
        '&longitude=' + LON + '&current=temperature_2m'
      );
      const d = await r.json();
      return Math.round(d.current.temperature_2m) + '°C';
    } catch (_) { return null; }
  }

  async function fetchSpotify() {
    try {
      const r = await fetch(SPOTIFY_URL);
      const d = await r.json();
      if (d.isPlaying && d.title) return 'Now playing: ' + d.title + ' — ' + d.artist;
    } catch (_) {}
    return null;
  }

  // Build the ticker DOM once — 6 copies for seamless loop, items tagged with data-key
  function buildTicker(items) {
    const inner = document.getElementById('now-ticker-inner');
    if (!inner) return;

    const sep = () => { const s = document.createElement('span'); s.className = 'sep'; s.textContent = '·'; return s; };

    const COPIES = 6;
    inner.innerHTML = '';

    for (let c = 0; c < COPIES; c++) {
      items.forEach((item, i) => {
        const span = document.createElement('span');
        span.dataset.key = item.key;
        if (item.hidden) span.hidden = true;
        span.textContent = item.value;
        inner.appendChild(span);
        inner.appendChild(sep());
      });
    }
  }

  // Update only the text/visibility of existing spans — animation never resets
  function updateTicker(items) {
    const inner = document.getElementById('now-ticker-inner');
    if (!inner) return;
    items.forEach(item => {
      inner.querySelectorAll('[data-key="' + item.key + '"]').forEach(el => {
        el.textContent = item.value;
        el.hidden = !!item.hidden;
      });
    });
  }

  function initHover() {
    const ticker = document.getElementById('now-ticker');
    const inner  = document.getElementById('now-ticker-inner');
    if (!ticker || !inner) return;

    ticker.addEventListener('mouseenter', () => {
      const anim = inner.getAnimations()[0];
      if (anim) anim.updatePlaybackRate(0.25);
    });
    ticker.addEventListener('mouseleave', () => {
      const anim = inner.getAnimations()[0];
      if (anim) anim.updatePlaybackRate(1);
    });
  }

  function makeItems(temp, spotify) {
    const coords = toDMS(LAT, 'N', 'S') + '  ' + toDMS(LON, 'E', 'W');
    return [
      { key: 'coords',   value: coords },
      { key: 'location', value: 'Glasgow, Scotland' },
      { key: 'temp',     value: temp || '',  hidden: !temp },
      { key: 'time',     value: ukTime() },
      { key: 'spotify',  value: spotify || '', hidden: !spotify },
    ];
  }

  async function init() {
    const inner = document.getElementById('now-ticker-inner');
    if (!inner) return;

    const [temp, spotify] = await Promise.all([fetchTemp(), fetchSpotify()]);
    buildTicker(makeItems(temp, spotify));
    initHover();

    // Update time + Spotify every 30s — no DOM rebuild, animation keeps rolling
    setInterval(async () => {
      const track = await fetchSpotify();
      updateTicker(makeItems(temp, track));
    }, 30000);
  }

  init();
})();
