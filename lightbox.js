(function () {
  var images = [];
  var current = 0;
  var overlay = null;
  var lbImg = null;
  var btnPrev = null;
  var btnNext = null;

  function getGrain() {
    var f = document.getElementById('grain-f');
    return f ? f.closest('svg') : null;
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:10000',
      'background:rgba(0,0,0,0.92)',
      'display:none', 'align-items:center', 'justify-content:center',
      'cursor:zoom-out'
    ].join(';');

    lbImg = document.createElement('img');
    lbImg.style.cssText = [
      'max-width:90vw', 'max-height:90vh',
      'object-fit:contain', 'cursor:default',
      'user-select:none', 'display:block'
    ].join(';');
    lbImg.addEventListener('click', function (e) { e.stopPropagation(); });

    var btnStyle = [
      'position:absolute', 'top:50%', 'transform:translateY(-50%)',
      'background:none', 'border:1px solid rgba(255,255,255,0.25)',
      'color:#fff', 'width:44px', 'height:44px',
      'display:flex', 'align-items:center', 'justify-content:center',
      'cursor:pointer', 'border-radius:2px', 'transition:border-color 0.15s',
      'padding:0'
    ].join(';');

    btnPrev = document.createElement('button');
    btnPrev.style.cssText = btnStyle + ';left:1.25rem';
    btnPrev.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    btnPrev.setAttribute('aria-label', 'Previous image');

    btnNext = document.createElement('button');
    btnNext.style.cssText = btnStyle + ';right:1.25rem';
    btnNext.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    btnNext.setAttribute('aria-label', 'Next image');

    var btnClose = document.createElement('button');
    btnClose.style.cssText = [
      'position:absolute', 'top:1.25rem', 'right:1.25rem',
      'background:none', 'border:1px solid rgba(255,255,255,0.25)',
      'color:#fff', 'width:36px', 'height:36px',
      'display:flex', 'align-items:center', 'justify-content:center',
      'cursor:pointer', 'border-radius:2px', 'padding:0'
    ].join(';');
    btnClose.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    btnClose.setAttribute('aria-label', 'Close');

    overlay.appendChild(lbImg);
    overlay.appendChild(btnPrev);
    overlay.appendChild(btnNext);
    overlay.appendChild(btnClose);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', close);
    btnClose.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    btnPrev.addEventListener('click', function (e) { e.stopPropagation(); navigate(-1); });
    btnNext.addEventListener('click', function (e) { e.stopPropagation(); navigate(1); });
    document.addEventListener('keydown', onKey);
  }

  function open(index) {
    current = index;
    if (!overlay) buildOverlay();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    var grain = getGrain();
    if (grain) grain.style.display = 'none';
    show();
  }

  function close() {
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    var grain = getGrain();
    if (grain) grain.style.display = '';
  }

  function navigate(dir) {
    current = (current + dir + images.length) % images.length;
    show();
  }

  function show() {
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt || '';
    var multiple = images.length > 1;
    btnPrev.style.display = multiple ? 'flex' : 'none';
    btnNext.style.display = multiple ? 'flex' : 'none';
  }

  function onKey(e) {
    if (!overlay || overlay.style.display === 'none') return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); navigate(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
    if (e.key === 'Escape')     close();
  }

  function init() {
    // Select all images inside the project page content area
    var candidates = Array.from(
      document.querySelectorAll('.project-page img')
    );
    if (!candidates.length) return;
    images = candidates;
    images.forEach(function (img, i) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () { open(i); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
