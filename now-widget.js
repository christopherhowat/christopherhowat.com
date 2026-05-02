/* now-widget.js — two-strip infinite ticker */
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
      if (d.isPlaying && d.title)
        return { text: 'Now playing: ' + d.title + ' — ' + d.artist, url: d.url };
    } catch (_) {}
    return null;
  }

  function makeItems(temp, spotify) {
    const coords = toDMS(LAT, 'N', 'S') + '  ' + toDMS(LON, 'E', 'W');
    return [
      { key: 'coords',   value: coords },
      { key: 'location', value: 'Glasgow, Scotland' },
      { key: 'temp',     value: temp || '',                          hidden: !temp },
      { key: 'time',     value: ukTime() },
      { key: 'spotify',  value: spotify ? spotify.text : '',
                         url:   spotify ? spotify.url  : null,       hidden: !spotify },
    ];
  }

  function makeStrip(items) {
    const strip = document.createElement('div');
    strip.className = 'ticker-strip';
    items.forEach(item => {
      const el = item.key === 'spotify'
        ? document.createElement('a')
        : document.createElement('span');
      el.dataset.key = item.key;
      el.textContent = item.value;
      if (item.hidden) el.hidden = true;
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
    return strip;
  }

  function applyItems(strip, items) {
    items.forEach(item => {
      strip.querySelectorAll('[data-key="' + item.key + '"]').forEach(el => {
        el.textContent = item.value;
        el.hidden = !!item.hidden;
        if (item.key === 'spotify') el.href = item.url || '';
      });
    });
  }

  function startTicker(items) {
    const runner = document.getElementById('ticker-runner');
    const ticker = document.getElementById('now-ticker');
    if (!runner || !ticker) return null;

    const BASE_SPEED = 0.4;
    const SLOW_SPEED = 0.1;
    let speed  = BASE_SPEED;
    let target = BASE_SPEED;
    let pendingItems = null;

    ticker.addEventListener('mouseenter', () => { target = SLOW_SPEED; });
    ticker.addEventListener('mouseleave',  () => { target = BASE_SPEED; });

    const stripA = makeStrip(items);
    const stripB = makeStrip(items);
    runner.appendChild(stripA);
    runner.appendChild(stripB);

    let pos = 0;

    function tick() {
      // Always measure the current leading strip (children[0] changes after each swap)
      const lead = runner.children[0];
      if (!lead || lead.offsetWidth === 0) { requestAnimationFrame(tick); return; }
      const stripWidth = lead.offsetWidth;

      speed += (target - speed) * 0.08;
      pos -= speed;

      if (pos <= -stripWidth) {
        pos += stripWidth;
        // Update the back strip (children[1]) with any pending content — it's off-screen
        if (pendingItems && runner.children[1]) {
          applyItems(runner.children[1], pendingItems);
          pendingItems = null;
        }
        // Rotate: move the front strip to the back
        runner.appendChild(runner.children[0]);
      }

      runner.style.transform = 'translateX(' + pos + 'px)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    return {
      updateTime: function () {
        const t = ukTime();
        applyItems(stripA, [{ key: 'time', value: t }]);
        applyItems(stripB, [{ key: 'time', value: t }]);
      },
      queueSpotify: function (newItems) {
        pendingItems = newItems;
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
      ticker.queueSpotify(makeItems(temp, track));
    }, 30000);
  }

  init();
})();
