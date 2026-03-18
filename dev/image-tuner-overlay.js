/**
 * Magnolia Image Tuner Overlay
 * Dev tool — local only. Does nothing on production.
 * Usage: Add <script src="dev/image-tuner-overlay.js"></script> before </body>
 */
(function () {
  'use strict';

  // ── LOCALHOST GUARD ──────────────────────────────────────────────────────────
  // Must be file://, localhost, or 127.0.0.1. Exit immediately on production.
  const proto = location.protocol;
  const host  = location.hostname;
  if (proto !== 'file:' && host !== 'localhost' && host !== '127.0.0.1') return;

  // ── CONSTANTS ────────────────────────────────────────────────────────────────
  const LS_KEY = 'magnolia-tuner-config';

  // ── STATE ────────────────────────────────────────────────────────────────────
  let tunerActive = false;
  let activePanel = null;
  let activeImg   = null;

  // ── CONFIG STORAGE ───────────────────────────────────────────────────────────
  function loadConfig() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveConfig(cfg) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(cfg)); } catch (e) {}
  }
  function updateConfig(id, vals) {
    const cfg = loadConfig();
    cfg[id] = Object.assign(cfg[id] || {}, vals);
    saveConfig(cfg);
  }

  // ── APPLY SAVED STYLES ───────────────────────────────────────────────────────
  // Called on every page load so tuned values persist even with tuner off.
  function applyToImage(img, vals) {
    if (vals.scale    !== undefined) img.style.transform      = 'scale(' + vals.scale + ')';
    img.style.transformOrigin = 'center';
    if (vals.objectFit !== undefined) img.style.objectFit      = vals.objectFit;
    if (vals.posX !== undefined && vals.posY !== undefined)
      img.style.objectPosition = vals.posX + '% ' + vals.posY + '%';
    if (vals.borderRadius !== undefined)
      img.style.borderRadius = vals.borderRadius > 0 ? vals.borderRadius + 'px' : '';
    // Resize the parent container (the direct wrapper div with inline width/height)
    const container = img.parentElement;
    if (container) {
      if (vals.cw !== undefined) container.style.width  = vals.cw + 'px';
      if (vals.ch !== undefined) container.style.height = vals.ch + 'px';
    }
  }

  function applyAllSaved() {
    // Only restores image transforms (scale, fit, position, radius) — NOT container
    // dimensions (cw/ch). Container sizing comes from hardcoded HTML; restoring stale
    // W/H values from a previous session can break layout (e.g. after an image swap).
    const cfg = loadConfig();
    document.querySelectorAll('img[data-tuner-id]').forEach(function (img) {
      const id = img.dataset.tunerId;
      if (cfg[id]) {
        var v = cfg[id];
        if (v.scale    !== undefined) img.style.transform      = 'scale(' + v.scale + ')';
        img.style.transformOrigin = 'center';
        if (v.objectFit !== undefined) img.style.objectFit      = v.objectFit;
        if (v.posX !== undefined && v.posY !== undefined)
          img.style.objectPosition = v.posX + '% ' + v.posY + '%';
        if (v.borderRadius !== undefined)
          img.style.borderRadius = v.borderRadius > 0 ? v.borderRadius + 'px' : '';
      }
    });
  }

  // Apply immediately (static images) + after brief delay (JS-rendered images)
  applyAllSaved();
  setTimeout(applyAllSaved, 100);
  setTimeout(applyAllSaved, 500);

  // ── INJECT CSS ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'tuner-overlay-styles';
  style.textContent = [
    /* highlight mode: dashed outline + crosshair on hoverable images */
    '.tuner-overlay-highlight img[data-tuner-id] { cursor:crosshair!important; }',
    '.tuner-overlay-highlight img[data-tuner-id]:hover { outline:2px dashed #4a9fd4!important; outline-offset:2px!important; }',

    /* toggle button */
    '.tuner-toggle-btn {',
    '  position:fixed; bottom:20px; right:20px; z-index:99999;',
    '  background:#3D4466; color:#fff; border:none; border-radius:8px;',
    '  padding:9px 14px; font-size:13px; font-weight:700; cursor:pointer;',
    '  box-shadow:0 2px 12px rgba(0,0,0,0.3); transition:background 0.15s;',
    '  font-family:system-ui,-apple-system,sans-serif; line-height:1;',
    '}',
    '.tuner-toggle-btn:hover { background:#535c8a; }',
    '.tuner-toggle-btn.tuner-active { background:#E8836A; }',
    '.tuner-toggle-btn.tuner-active:hover { background:#d96e54; }',

    /* panel */
    '.tuner-panel {',
    '  position:fixed; z-index:100000; width:300px;',
    '  background:#1e2235; color:#e0e4f0; border-radius:10px;',
    '  box-shadow:0 8px 32px rgba(0,0,0,0.55);',
    '  font-family:system-ui,-apple-system,sans-serif; font-size:13px;',
    '  overflow:hidden; user-select:none;',
    '}',
    '.tuner-panel-header {',
    '  background:#2a2f4a; padding:10px 12px;',
    '  display:flex; align-items:center; gap:8px; cursor:grab;',
    '  border-bottom:1px solid rgba(255,255,255,0.07);',
    '}',
    '.tuner-panel-header:active { cursor:grabbing; }',
    '.tuner-panel-title { flex:1; font-size:10px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; color:#8898c4; }',
    '.tuner-panel-close { background:none; border:none; color:#667; cursor:pointer; font-size:15px; line-height:1; padding:0 2px; }',
    '.tuner-panel-close:hover { color:#fff; }',
    '.tuner-panel-body { padding:12px; display:flex; flex-direction:column; gap:8px; max-height:80vh; overflow-y:auto; }',
    '.tuner-meta-filename { font-size:10px; color:#7ec8e3; font-family:monospace; word-break:break-all; }',
    '.tuner-meta-id { font-size:10px; color:#5a6888; margin-top:1px; }',

    /* controls */
    '.tuner-ctrl-row { display:flex; align-items:center; gap:6px; }',
    '.tuner-ctrl-label { width:46px; font-size:10px; color:#7a88a8; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; flex-shrink:0; }',
    '.tuner-ctrl-row input[type="range"] { flex:1; min-width:0; height:3px; accent-color:#E8836A; cursor:pointer; }',
    '.tuner-ctrl-val { width:38px; font-size:11px; font-family:monospace; color:#b8f0a0; text-align:right; flex-shrink:0; }',
    '.tuner-fit-toggle { display:flex; border-radius:4px; overflow:hidden; border:1px solid #3a405a; flex-shrink:0; }',
    '.tuner-fit-btn { padding:3px 9px; font-size:10px; font-weight:700; border:none; background:#252b45; color:#556; cursor:pointer; transition:background 0.1s,color 0.1s; }',
    '.tuner-fit-btn + .tuner-fit-btn { border-left:1px solid #3a405a; }',
    '.tuner-fit-btn.tuner-fit-active { background:#3D4466; color:#fff; }',

    /* dimension inputs */
    '.tuner-dim-row { display:flex; align-items:center; gap:5px; flex-wrap:wrap; }',
    '.tuner-dim-label { font-size:10px; color:#7a88a8; font-weight:700; text-transform:uppercase; }',
    '.tuner-dim-input { width:52px; padding:3px 5px; background:#252b45; border:1px solid #3a405a; border-radius:4px; color:#e0e4f0; font-size:11px; font-family:monospace; text-align:right; }',
    '.tuner-dim-input:focus { outline:none; border-color:#E8836A; }',
    '.tuner-sep { color:#3a405a; }',

    /* CSS output block */
    '.tuner-css-block { background:#141825; border-radius:6px; padding:8px 10px; font-size:10px; font-family:monospace; line-height:1.7; color:#7ec8e3; white-space:pre; overflow-x:auto; }',
    '.tuner-css-val { color:#b8f0a0; }',

    /* buttons */
    '.tuner-btn-row { display:flex; gap:6px; }',
    '.tuner-btn { flex:1; padding:6px 8px; border-radius:5px; border:none; cursor:pointer; font-size:11px; font-weight:700; transition:background 0.12s; font-family:system-ui,sans-serif; }',
    '.tuner-btn-copy { background:#3D4466; color:#fff; }',
    '.tuner-btn-copy:hover { background:#535c8a; }',
    '.tuner-btn-copy.tuner-copied { background:#4a9e6b; }',
    '.tuner-btn-reset { background:#252b45; color:#778; border:1px solid #3a405a; }',
    '.tuner-btn-reset:hover { background:#2e3555; color:#ccc; }',
    '.tuner-divider { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:2px 0; }',
    '.tuner-export-row { display:flex; gap:6px; }',
    '.tuner-btn-export { background:#E8836A; color:#fff; }',
    '.tuner-btn-export:hover { background:#d96e54; }',
    '.tuner-btn-import { background:#252b45; color:#aaa; border:1px solid #3a405a; }',
    '.tuner-btn-import:hover { background:#2e3555; }',
  ].join('\n');
  (document.head || document.documentElement).appendChild(style);

  // ── TOGGLE BUTTON ────────────────────────────────────────────────────────────
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'tuner-toggle-btn';
  toggleBtn.textContent = '🎛 Tuner';
  document.body.appendChild(toggleBtn);

  function setTunerMode(on) {
    tunerActive = on;
    document.documentElement.classList.toggle('tuner-overlay-highlight', on);
    toggleBtn.classList.toggle('tuner-active', on);
    toggleBtn.textContent = on ? '🎛 On' : '🎛 Tuner';
    if (!on) closePanel();
  }

  toggleBtn.addEventListener('click', function () { setTunerMode(!tunerActive); });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      setTunerMode(!tunerActive);
    }
  });

  // ── IMAGE CLICK — open panel ─────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    if (!tunerActive) return;
    const img = e.target.closest('img[data-tuner-id]');
    if (!img) return;
    e.preventDefault();
    e.stopPropagation();
    openPanel(img, e.clientX, e.clientY);
  }, true);

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function getImageVals(img) {
    const id  = img.dataset.tunerId;
    const cfg = loadConfig();
    if (cfg[id]) return Object.assign({}, cfg[id]);

    // Fall back to reading inline styles
    const t   = img.style.transform || '';
    const m   = t.match(/scale\(([\d.]+)\)/);
    const scale = m ? parseFloat(m[1]) : 1;
    const fit = img.style.objectFit || 'contain';
    const pos = img.style.objectPosition || '50% 50%';
    const parts = pos.split(' ');
    const posX = parseFloat(parts[0]) || 50;
    const posY = parseFloat(parts[1]) || 50;
    const br   = img.style.borderRadius ? parseFloat(img.style.borderRadius) : 0;
    const cont = img.parentElement;
    const cw   = cont ? (parseInt(cont.style.width)  || cont.offsetWidth  || 400) : 400;
    const ch   = cont ? (parseInt(cont.style.height) || cont.offsetHeight || 300) : 300;
    return { scale, posX, posY, objectFit: fit, borderRadius: br, cw, ch };
  }

  function buildCSS(vals) {
    var lines = [
      'transform: scale(' + parseFloat(vals.scale).toFixed(2) + ');',
      'transform-origin: center;',
      'object-fit: ' + vals.objectFit + ';',
      'object-position: ' + vals.posX + '% ' + vals.posY + '%;',
    ];
    if (vals.borderRadius > 0) lines.push('border-radius: ' + vals.borderRadius + 'px;');
    return lines.join('\n');
  }

  function buildCSSHighlighted(vals) {
    function row(p, v) {
      return '<span style="color:#7ec8e3">' + p + '</span>: <span class="tuner-css-val">' + v + '</span>;';
    }
    var rows = [
      row('transform', 'scale(' + parseFloat(vals.scale).toFixed(2) + ')'),
      row('transform-origin', 'center'),
      row('object-fit', vals.objectFit),
      row('object-position', vals.posX + '% ' + vals.posY + '%'),
    ];
    if (vals.borderRadius > 0) rows.push(row('border-radius', vals.borderRadius + 'px'));
    return rows.join('\n');
  }

  // ── OPEN PANEL ───────────────────────────────────────────────────────────────
  function openPanel(img, clickX, clickY) {
    closePanel();
    activeImg = img;

    const id      = img.dataset.tunerId || '';
    const page    = img.dataset.tunerPage || '';
    const section = img.dataset.tunerSection || '';
    const src     = img.getAttribute('src') || '';
    const filename = src.split('/').pop();
    const vals    = getImageVals(img);

    const panel = document.createElement('div');
    panel.className = 'tuner-panel';

    // Position panel — right of click if room, else left; keep in viewport
    const panelW = 308;
    let px = clickX + 20;
    if (px + panelW > window.innerWidth - 10) px = Math.max(10, clickX - panelW - 20);
    let py = Math.max(10, Math.min(clickY - 40, window.innerHeight - 640));

    panel.style.cssText = 'left:' + px + 'px; top:' + py + 'px;';
    panel.innerHTML = [
      '<div class="tuner-panel-header" id="tuner-drag-handle">',
      '  <span class="tuner-panel-title">Image Tuner</span>',
      '  <button class="tuner-panel-close" id="tuner-close">✕</button>',
      '</div>',
      '<div class="tuner-panel-body">',
      '  <div class="tuner-meta-filename">' + filename + '</div>',
      id ? '  <div class="tuner-meta-id">' + id + (page ? ' · ' + page : '') + (section ? ' · ' + section : '') + '</div>' : '',
      '  <div class="tuner-ctrl-row">',
      '    <span class="tuner-ctrl-label">Scale</span>',
      '    <input type="range" min="0.5" max="3.0" step="0.05" value="' + vals.scale + '" id="tuner-scale">',
      '    <span class="tuner-ctrl-val" id="tuner-v-scale">' + parseFloat(vals.scale).toFixed(2) + '</span>',
      '  </div>',
      '  <div class="tuner-ctrl-row">',
      '    <span class="tuner-ctrl-label">Pos X</span>',
      '    <input type="range" min="0" max="100" step="1" value="' + vals.posX + '" id="tuner-posx">',
      '    <span class="tuner-ctrl-val" id="tuner-v-posx">' + vals.posX + '%</span>',
      '  </div>',
      '  <div class="tuner-ctrl-row">',
      '    <span class="tuner-ctrl-label">Pos Y</span>',
      '    <input type="range" min="0" max="100" step="1" value="' + vals.posY + '" id="tuner-posy">',
      '    <span class="tuner-ctrl-val" id="tuner-v-posy">' + vals.posY + '%</span>',
      '  </div>',
      '  <div class="tuner-ctrl-row">',
      '    <span class="tuner-ctrl-label">Fit</span>',
      '    <div class="tuner-fit-toggle">',
      '      <button class="tuner-fit-btn' + (vals.objectFit === 'contain' ? ' tuner-fit-active' : '') + '" data-fit="contain">contain</button>',
      '      <button class="tuner-fit-btn' + (vals.objectFit === 'cover'   ? ' tuner-fit-active' : '') + '" data-fit="cover">cover</button>',
      '    </div>',
      '  </div>',
      '  <div class="tuner-ctrl-row">',
      '    <span class="tuner-ctrl-label">Radius</span>',
      '    <input type="range" min="0" max="50" step="1" value="' + vals.borderRadius + '" id="tuner-radius">',
      '    <span class="tuner-ctrl-val" id="tuner-v-radius">' + vals.borderRadius + 'px</span>',
      '  </div>',
      '  <div class="tuner-dim-row">',
      '    <span class="tuner-dim-label">W</span>',
      '    <input class="tuner-dim-input" type="number" min="10" max="1200" step="10" value="' + vals.cw + '" id="tuner-cw">',
      '    <span class="tuner-sep">×</span>',
      '    <span class="tuner-dim-label">H</span>',
      '    <input class="tuner-dim-input" type="number" min="10" max="1200" step="10" value="' + vals.ch + '" id="tuner-ch">',
      '    <span class="tuner-dim-label" style="font-weight:400;opacity:0.5">px</span>',
      '  </div>',
      '  <hr class="tuner-divider">',
      '  <div class="tuner-css-block" id="tuner-css-out">' + buildCSSHighlighted(vals) + '</div>',
      '  <div class="tuner-btn-row">',
      '    <button class="tuner-btn tuner-btn-copy" id="tuner-copy">Copy CSS</button>',
      '    <button class="tuner-btn tuner-btn-reset" id="tuner-reset">Reset</button>',
      '  </div>',
      '  <hr class="tuner-divider">',
      '  <div class="tuner-export-row">',
      '    <button class="tuner-btn tuner-btn-export" id="tuner-export">Export JSON</button>',
      '    <button class="tuner-btn tuner-btn-import" id="tuner-import">Import JSON</button>',
      '  </div>',
      '</div>',
    ].join('\n');

    document.body.appendChild(panel);
    activePanel = panel;

    // Working copy of vals for this panel session
    var pv = Object.assign({}, vals);

    function liveUpdate() {
      applyToImage(activeImg, pv);
      // Save src/page/section alongside tuning vals so export works across pages
      updateConfig(id, Object.assign({}, pv, {
        src: src,
        page: page,
        section: section,
      }));
      panel.querySelector('#tuner-css-out').innerHTML = buildCSSHighlighted(pv);
    }

    panel.querySelector('#tuner-scale').addEventListener('input', function (e) {
      pv.scale = parseFloat(e.target.value);
      panel.querySelector('#tuner-v-scale').textContent = parseFloat(pv.scale).toFixed(2);
      liveUpdate();
    });
    panel.querySelector('#tuner-posx').addEventListener('input', function (e) {
      pv.posX = parseInt(e.target.value);
      panel.querySelector('#tuner-v-posx').textContent = pv.posX + '%';
      liveUpdate();
    });
    panel.querySelector('#tuner-posy').addEventListener('input', function (e) {
      pv.posY = parseInt(e.target.value);
      panel.querySelector('#tuner-v-posy').textContent = pv.posY + '%';
      liveUpdate();
    });
    panel.querySelectorAll('.tuner-fit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pv.objectFit = btn.dataset.fit;
        panel.querySelectorAll('.tuner-fit-btn').forEach(function (b) {
          b.classList.toggle('tuner-fit-active', b === btn);
        });
        liveUpdate();
      });
    });
    panel.querySelector('#tuner-radius').addEventListener('input', function (e) {
      pv.borderRadius = parseInt(e.target.value);
      panel.querySelector('#tuner-v-radius').textContent = pv.borderRadius + 'px';
      liveUpdate();
    });
    panel.querySelector('#tuner-cw').addEventListener('input', function (e) {
      pv.cw = Math.max(10, Math.min(1200, parseInt(e.target.value) || 10));
      liveUpdate();
    });
    panel.querySelector('#tuner-ch').addEventListener('input', function (e) {
      pv.ch = Math.max(10, Math.min(1200, parseInt(e.target.value) || 10));
      liveUpdate();
    });
    panel.querySelector('#tuner-close').addEventListener('click', closePanel);

    panel.querySelector('#tuner-reset').addEventListener('click', function () {
      // Remove saved entry so the page reverts to its hardcoded values on reload
      var cfg = loadConfig();
      delete cfg[id];
      saveConfig(cfg);
      // Restore to what the HTML had before this session
      pv = Object.assign({}, vals);
      // Revert inline styles to empty so hardcoded ones show through
      activeImg.style.transform       = '';
      activeImg.style.objectFit       = '';
      activeImg.style.objectPosition  = '';
      activeImg.style.borderRadius    = '';
      var cont = activeImg.parentElement;
      if (cont) { cont.style.width = ''; cont.style.height = ''; }
      // Sync sliders back to original vals
      panel.querySelector('#tuner-scale').value = vals.scale;
      panel.querySelector('#tuner-v-scale').textContent = parseFloat(vals.scale).toFixed(2);
      panel.querySelector('#tuner-posx').value = vals.posX;
      panel.querySelector('#tuner-v-posx').textContent = vals.posX + '%';
      panel.querySelector('#tuner-posy').value = vals.posY;
      panel.querySelector('#tuner-v-posy').textContent = vals.posY + '%';
      panel.querySelector('#tuner-radius').value = vals.borderRadius;
      panel.querySelector('#tuner-v-radius').textContent = vals.borderRadius + 'px';
      panel.querySelectorAll('.tuner-fit-btn').forEach(function (b) {
        b.classList.toggle('tuner-fit-active', b.dataset.fit === vals.objectFit);
      });
      panel.querySelector('#tuner-css-out').innerHTML = buildCSSHighlighted(pv);
    });

    panel.querySelector('#tuner-copy').addEventListener('click', function () {
      var btn = panel.querySelector('#tuner-copy');
      navigator.clipboard.writeText(buildCSS(pv)).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('tuner-copied');
        setTimeout(function () { btn.textContent = 'Copy CSS'; btn.classList.remove('tuner-copied'); }, 1600);
      });
    });

    panel.querySelector('#tuner-export').addEventListener('click', exportJSON);
    panel.querySelector('#tuner-import').addEventListener('click', importJSON);

    makeDraggable(panel, panel.querySelector('#tuner-drag-handle'));
  }

  // ── CLOSE PANEL ──────────────────────────────────────────────────────────────
  function closePanel() {
    if (activePanel) { activePanel.remove(); activePanel = null; }
    activeImg = null;
  }

  // Click outside panel + not on an image: close
  document.addEventListener('click', function (e) {
    if (!activePanel) return;
    if (!activePanel.contains(e.target) && !e.target.closest('img[data-tuner-id]')) {
      closePanel();
    }
  });

  // ── DRAG ─────────────────────────────────────────────────────────────────────
  function makeDraggable(el, handle) {
    var startX, startY, startL, startT;
    handle.addEventListener('mousedown', function (e) {
      startX = e.clientX; startY = e.clientY;
      startL = parseInt(el.style.left) || 0;
      startT = parseInt(el.style.top)  || 0;
      function onMove(m) {
        el.style.left = (startL + m.clientX - startX) + 'px';
        el.style.top  = (startT + m.clientY - startY) + 'px';
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
      e.preventDefault();
    });
  }

  // ── EXPORT JSON ──────────────────────────────────────────────────────────────
  // Exports ALL images from localStorage (all pages), in magnolia-image-config.json format.
  function exportJSON() {
    var cfg = loadConfig();
    var out = { images: {} };

    // Build a map of tuner-id → DOM metadata for images on the current page
    var domMeta = {};
    document.querySelectorAll('img[data-tuner-id]').forEach(function (img) {
      domMeta[img.dataset.tunerId] = {
        src:     img.getAttribute('src') || '',
        page:    img.dataset.tunerPage    || '',
        section: img.dataset.tunerSection || '',
      };
    });

    Object.keys(cfg).forEach(function (id) {
      var stored = cfg[id];
      // src stored in config (saved during liveUpdate), or fall back to DOM
      var src = stored.src || (domMeta[id] && domMeta[id].src) || '';
      if (!src) return; // skip entries with no known path

      out.images[src] = {
        scale:           parseFloat(parseFloat(stored.scale || 1).toFixed(2)),
        objectPositionX: stored.posX     !== undefined ? stored.posX     : 50,
        objectPositionY: stored.posY     !== undefined ? stored.posY     : 50,
        objectFit:       stored.objectFit  || 'contain',
        borderRadius:    stored.borderRadius || 0,
        containerWidth:  stored.cw || (domMeta[id] ? parseInt(domMeta[id].cw) : 400) || 400,
        containerHeight: stored.ch || (domMeta[id] ? parseInt(domMeta[id].ch) : 300) || 300,
        page:    stored.page    || (domMeta[id] && domMeta[id].page)    || '',
        section: stored.section || (domMeta[id] && domMeta[id].section) || '',
        id: id,
      };
    });

    var json = JSON.stringify(out, null, 2);
    var url  = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    var a    = document.createElement('a');
    a.href     = url;
    a.download = 'magnolia-image-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── IMPORT JSON ──────────────────────────────────────────────────────────────
  function importJSON() {
    var input   = document.createElement('input');
    input.type  = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var json = JSON.parse(ev.target.result);
          if (!json.images) throw new Error('Missing "images" key');
          var cfg = loadConfig();
          Object.keys(json.images).forEach(function (src) {
            var vals = json.images[src];
            var id   = vals.id;
            if (!id) return;
            cfg[id] = {
              scale:        vals.scale,
              posX:         vals.objectPositionX,
              posY:         vals.objectPositionY,
              objectFit:    vals.objectFit,
              borderRadius: vals.borderRadius,
              cw:           vals.containerWidth,
              ch:           vals.containerHeight,
              src:          src,
              page:         vals.page    || '',
              section:      vals.section || '',
            };
          });
          saveConfig(cfg);
          applyAllSaved();
          // Re-open panel for active image with refreshed values
          if (activeImg) {
            var px = parseInt(activePanel && activePanel.style.left) || 100;
            var py = parseInt(activePanel && activePanel.style.top)  || 100;
            openPanel(activeImg, px, py);
          }
          alert('Import applied to this page. Reload other pages to see their updated values.');
        } catch (err) {
          alert('Invalid JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

})();
