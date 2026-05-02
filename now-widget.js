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
      if (d.isPlaying && d.title) return 'Now playing: ' + d.title + ' — ' + d.artist + ' ▶';
    } catch (_) {}
    return null;
  }

  function buildItems(temp, spotify) {
    const coords = toDMS(LAT, 'N', 'S') + '  ' + toDMS(LON, 'E', 'W');
    const items = [coords, 'Glasgow, Scotland'];
    if (temp) items.push(temp);
    items.push(ukTime());
    if (spotify) items.push(spotify);
    return items;
  }

  function renderTicker(items) {
    const inner = document.getElementById('now-ticker-inner');
    if (!inner) return;

    const sep = '<span class="sep">·</span>';
    const content = items.map(i => '<span>' + i + '</span>').join(sep);
    // Duplicate for seamless loop
    inner.innerHTML = content + sep + content + sep;
  }

  async function init() {
    const inner = document.getElementById('now-ticker-inner');
    if (!inner) return;

    const [temp, spotify] = await Promise.all([fetchTemp(), fetchSpotify()]);
    renderTicker(buildItems(temp, spotify));

    // Keep clock ticking — rebuild ticker every 30s
    setInterval(async () => {
      const track = await fetchSpotify();
      renderTicker(buildItems(temp, track));
    }, 30000);
  }

  init();
})();
