/*!
 * ui.js — DMR AYAKKABI Sevk & Cari Yönetimi arayüzü
 */
(function () {
  'use strict';

  var Core = window.Core;
  var XLSX = window.XLSXLite;
  var data = null;

  /* ------------------------------------------------------------------ */
  /* İkonlar                                                             */
  /* ------------------------------------------------------------------ */
  function ic(path, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + (extra || '') + '</svg>';
  }
  var ICONS = {
    grid: ic('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    box: ic('<path d="M21 8.5v7a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 15.5v-7a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8.5z"/><path d="m3.3 7.2 8.7 5 8.7-5"/><path d="M12 22V12"/>'),
    truck: ic('<path d="M14 17V5a1 1 0 0 0-1-1H2v12h12z"/><path d="M14 9h4l4 4v4h-8"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/>'),
    wallet: ic('<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7H5a2 2 0 0 0-2 2z"/><path d="M17 13h.01"/>'),
    users: ic('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    receipt: ic('<path d="M6 2h12a1 1 0 0 1 1 1v19l-3-2-2 2-2-2-2 2-2-2-3 2V3a1 1 0 0 1 1-1z"/><path d="M9 7h6M9 11h6M9 15h3"/>'),
    chart: ic('<path d="M3 3v18h18"/><path d="M7 15l3.5-4 3 2.5L19 7"/>'),
    settings: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.6.63 1.06 1.25 1.1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    save: ic('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>'),
    folder: ic('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    upload: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 9 5-5 5 5"/><path d="M12 4v12"/>'),
    download: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 11 5 5 5-5"/><path d="M12 16V4"/>'),
    trash: ic('<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/>'),
    edit: ic('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    print: ic('<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>'),
    x: ic('<path d="M18 6 6 18M6 6l12 12"/>'),
    check: ic('<path d="m20 6-11 11-5-5"/>'),
    alert: ic('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
    left: ic('<path d="m15 18-6-6 6-6"/>'),
    right: ic('<path d="m9 18 6-6-6-6"/>'),
    file: ic('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'),
    refresh: ic('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'),
    eye: ic('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: ic('<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m1 1 22 22"/>'),
    user: ic('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    image: ic('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>'),
    money: ic('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>'),
    arrowUp: ic('<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>'),
    arrowDown: ic('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
    lock: ic('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
    tag: ic('<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>'),
    archive: ic('<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>'),
    history: ic('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>'),
    shield: ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>')
  };

  /* ------------------------------------------------------------------ */
  /* Kısayollar                                                          */
  /* ------------------------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(v) {
    return String(v === null || v === undefined ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function nf0(v) { return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Core.num(v)); }
  function nf2(v) { return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Core.num(v)); }
  function nf1(v) { return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(Core.num(v)); }
  function money(v) { return nf2(v) + ' ' + (data && data.settings.para ? data.settings.para : '₺'); }
  function money0(v) { return nf0(v) + ' ' + (data && data.settings.para ? data.settings.para : '₺'); }
  function dateTR(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    return p[2] + '.' + p[1] + '.' + p[0];
  }
  function dateLong(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return d.getDate() + ' ' + aylar[d.getMonth()] + ' ' + d.getFullYear();
  }
  function timeTR(d) {
    if (!d) return '';
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function monthName(ym) {
    if (!ym) return '';
    var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    var p = ym.split('-');
    return aylar[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }

  /* ------------------------------------------------------------------ */
  /* Cari yardımcıları                                                   */
  /* ------------------------------------------------------------------ */
  function activeCari() {
    return S.ui.cariId ? Core.cariById(data, S.ui.cariId) : null;
  }
  function cariAdi(id) {
    var c = Core.cariById(data, id);
    return c ? c.ad : '';
  }
  function cariKisa(c) {
    if (!c) return 'Tüm cariler';
    return c.kod ? c.kod + ' · ' + c.ad : c.ad;
  }
  function cariOptions(selected, includeAll) {
    var html = includeAll ? '<option value="0"' + (!selected ? ' selected' : '') + '>Tüm cariler</option>' : '';
    data.cariler.forEach(function (c) {
      html += '<option value="' + c.id + '"' + (selected === c.id ? ' selected' : '') + '>' +
        esc(cariKisa(c)) + (c.aktif === false ? ' (pasif)' : '') + '</option>';
    });
    return html;
  }
  function setActiveCari(id) {
    S.ui.cariId = id || 0;
    S.ui.cart = [];
    S.ui.shipCariId = S.ui.cariId;
    S.ui.orderPage = 1;
    S.ui.ledgerPage = 1;
    S.ui.shipListPage = 1;
    try { localStorage.setItem('dmr:cari', String(S.ui.cariId)); } catch (e) { }
    updateChrome();
    renderView();
  }

  /* ------------------------------------------------------------------ */
  /* Marka                                                               */
  /* ------------------------------------------------------------------ */
  function markaAdi() { return (data && data.settings.markaAdi) || 'DMR'; }
  function markaAlt() { return (data && data.settings.markaAlt) || 'AYAKKABI'; }
  function markaKisa() { return (data && data.settings.markaKisa) || 'DMR'; }
  function markaLogo() { return (data && data.settings.logo) || ''; }
  function markaTam() { return (markaAdi() + ' ' + markaAlt()).trim(); }
  function brandMark(cls) {
    var logo = markaLogo();
    return '<div class="' + cls + '">' + (logo ? '<img src="' + esc(logo) + '" alt="">' : esc(markaKisa())) + '</div>';
  }

  /** Sevk ekranındaki aktif cari: seçili cari yoksa ekrandaki seçim, o da yoksa ilk cari. */
  function shipCariId() {
    if (S.ui.cariId) return S.ui.cariId;
    var id = S.ui.shipCariId || 0;    if (id && Core.cariById(data, id)) return id;
    return Core.defaultCariId(data);
  }
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms || 220);
    };
  }
  function download(bytes, filename) {
    var blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
  }
  function bytesToSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  }

  /* ------------------------------------------------------------------ */
  /* Durum                                                               */
  /* ------------------------------------------------------------------ */
  var S = {
    view: 'dashboard',
    user: null,
    onReady: null,
    file: { handle: null, name: '', dirty: false, lastSaved: null },
    autosave: true,
    readOnly: false,
    ui: {
      cariId: 0, shipCariId: 0,
      orderSearch: '', orderFilter: 'all', orderSortKey: 'sipno', orderSortDir: 'desc', orderPage: 1,
      ledgerSearch: '', ledgerType: 'all', ledgerFrom: '', ledgerTo: '', ledgerPage: 1,
      shipSearch: '', cart: [], shipTarih: Core.todayISO(), shipFisNo: null, shipAciklama: '',
      shipFaturaNo: '', shipFaturaTarih: '',
      shipListSearch: '', shipListPage: 1,
      reportMonth: Core.todayISO().slice(0, 7)
    },
    cacheTimer: null,
    saveTimer: null
  };
  var PAGE_SIZE = 30;

  /* ------------------------------------------------------------------ */
  /* IndexedDB (dosya tanıtıcısı + kurtarma önbelleği)                   */
  /* ------------------------------------------------------------------ */
  var DB_NAME = 'dmr-sevk';
  function idb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('no-idb'));
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore('kv'); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function idbGet(key) {
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('kv', 'readonly');
        var r = tx.objectStore('kv').get(key);
        r.onsuccess = function () { resolve(r.result); };
        r.onerror = function () { reject(r.error); };
      });
    }).catch(function () { return null; });
  }
  function idbSet(key, val) {
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('kv', 'readwrite');
        if (val === null || val === undefined) tx.objectStore('kv').delete(key);
        else tx.objectStore('kv').put(val, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    }).catch(function () { });
  }

  /** IndexedDB bazı tarayıcılarda file:// üzerinde yanıt vermez; uygulamayı kilitlemesin. */
  function withTimeout(promise, ms, fallback) {
    return Promise.race([
      Promise.resolve(promise).catch(function () { return fallback; }),
      new Promise(function (resolve) { setTimeout(function () { resolve(fallback); }, ms); })
    ]);
  }

  /* ------------------------------------------------------------------ */
  /* Bildirim / modal                                                    */
  /* ------------------------------------------------------------------ */
  function toast(msg, type) {
    var root = $('#toastRoot');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = (type === 'err' ? ICONS.alert : type === 'ok' ? ICONS.check : ICONS.file) + '<span>' + esc(msg) + '</span>';
    root.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .2s, transform .2s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(function () { el.remove(); }, 220);
    }, type === 'err' ? 5200 : 3200);
  }

  var lastFocus = null;
  function openModal(opts) {
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      '<div class="modal ' + (opts.size || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.title) + '">' +
      '  <div class="modal-head">' +
      '    <div><h2>' + esc(opts.title) + '</h2>' + (opts.subtitle ? '<p>' + esc(opts.subtitle) + '</p>' : '') + '</div>' +
      '    <button type="button" class="btn btn-icon" data-modal-close aria-label="Kapat">' + ICONS.x + '</button>' +
      '  </div>' +
      '  <div class="modal-body">' + (opts.body || '') + '</div>' +
      (opts.footer ? '  <div class="modal-foot">' + opts.footer + '</div>' : '') +
      '</div>';
    document.getElementById('modalRoot').appendChild(wrap);
    lastFocus = document.activeElement;

    function close() {
      if (wrap.dataset.closed) return;
      wrap.dataset.closed = '1';
      wrap.remove();
      document.removeEventListener('keydown', onKey);
      if (opts.onClose) opts.onClose();
      if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { }
    }
    function onKey(e) {
      if (e.key !== 'Escape') return;
      var hepsi = document.querySelectorAll('.modal-backdrop');
      if (hepsi.length && hepsi[hepsi.length - 1] !== wrap) return;
      e.preventDefault(); close();
    }
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap) close(); });
    $$('[data-modal-close]', wrap).forEach(function (b) { b.addEventListener('click', close); });
    setTimeout(function () {
      var first = wrap.querySelector('input:not([type=hidden]), select, textarea, button.btn-primary');
      if (first) first.focus();
    }, 30);
    if (opts.onMount) opts.onMount(wrap, close);
    return { el: wrap, close: close };
  }

  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      var m = openModal({
        title: opts.title || 'Emin misiniz?',
        subtitle: opts.subtitle || '',
        body: '<p style="margin:4px 0 2px;color:var(--ink-2);font-size:13.5px">' + (opts.html || esc(opts.message || '')) + '</p>',
        footer: '<button class="btn" data-no>Vazgeç</button>' +
          '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" data-yes>' + esc(opts.confirmText || 'Onayla') + '</button>',
        onMount: function (wrap, close) {
          wrap.querySelector('[data-no]').addEventListener('click', function () { resolve(false); close(); });
          wrap.querySelector('[data-yes]').addEventListener('click', function () { resolve(true); close(); });
        },
        onClose: function () { resolve(false); }
      });
      return m;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Dosya işlemleri                                                     */
  /* ------------------------------------------------------------------ */
  var XLSX_TYPES = [{
    description: 'Excel Çalışma Kitabı',
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
  }];
  var FS_OK = typeof window.showOpenFilePicker === 'function' && window.isSecureContext;

  function setDirty(dirty) {
    S.file.dirty = dirty;
    updateFileChip();
    if (dirty) {
      scheduleCache();
      if (S.autosave && S.file.handle) scheduleSave();
    }
  }

  function scheduleSave() {
    if (S.autoBlocked) return;
    clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(function () { saveFile().catch(function () { }); }, 700);
  }

  function scheduleCache() {
    clearTimeout(S.cacheTimer);
    S.cacheTimer = setTimeout(function () {
      if (!data) return;
      try {
        idbSet('cache', { at: new Date().toISOString(), data: data });
      } catch (e) { }
    }, 1200);
  }

  function writeBytes() {
    var wb = Core.buildWorkbook(data);
    return XLSX.writeWorkbook(wb, { title: 'DMR AYAKKABI — ' + (activeCari() ? activeCari().ad : 'Tüm cariler'), creator: 'DMR Sevk' });
  }

  function saveFile(opts) {
    opts = opts || {};
    if (!data) return Promise.resolve(false);
    var bytes;
    try { bytes = writeBytes(); }
    catch (e) { toast('Dosya oluşturulamadı: ' + e.message, 'err'); return Promise.resolve(false); }

    function done(name, handle) {
      S.file.name = name || S.file.name;
      if (handle) S.file.handle = handle;
      S.file.dirty = false;
      S.file.lastSaved = new Date();
      S.autoBlocked = false;
      updateFileChip();
      idbSet('cache', null);
      try { backupSnapshot(bytes); } catch (e) { }
      if (!opts.silent) toast('Excel dosyası kaydedildi', 'ok');
      return true;
    }

    if (S.file.handle && !opts.saveAs) {
      return S.file.handle.createWritable()
        .then(function (w) { return w.write(bytes).then(function () { return w.close(); }); })
        .then(function () { return done(S.file.handle.name, null); })
        .catch(function (err) {
          if (err && err.name === 'NotAllowedError') { toast('Dosyaya yazma izni verilmedi.', 'err'); return false; }
          S.autoBlocked = true;
          toast('Dosya kaydedilemedi. Excel dosyası açık olabilir; kapatıp "Kaydet" ile tekrar deneyin.', 'err');
          return false;
        });
    }

    if (FS_OK) {
      return window.showSaveFilePicker({
        suggestedName: S.file.name || 'DMR_VERI.xlsx',
        types: XLSX_TYPES
      }).then(function (handle) {
        return handle.createWritable()
          .then(function (w) { return w.write(bytes).then(function () { return w.close(); }); })
          .then(function () {
            idbSet('handle', handle);
            return done(handle.name, handle);
          });
      }).catch(function (err) {
        if (err && err.name === 'AbortError') return false;
        // Dosya seçici kullanılamıyorsa indirme moduna düş
        download(bytes, S.file.name || 'DMR_VERI.xlsx');
        return done(S.file.name || 'DMR_VERI.xlsx', null);
      });
    }

    download(bytes, S.file.name || 'DMR_VERI.xlsx');
    return Promise.resolve(done(S.file.name || 'DMR_VERI.xlsx', null));
  }

  function applyLoadedData(d, fileName, handle) {
    data = d;
    ['modeller', 'audit', 'trash', 'kullanicilar', 'cariler'].forEach(function (k) {
      if (!Array.isArray(data[k])) data[k] = [];
    });
    if (!data.modelImages || typeof data.modelImages !== 'object') data.modelImages = {};
    try { Core.markaMigrate(data); } catch (e) { }
    try { Matris.migrateMaster(data); } catch (e) { }
    try { Matris.ensureLines(data); } catch (e) { }
    try { Core.trashTemizle(data, 30); } catch (e) { }
    S.file.name = fileName || 'DMR_VERI.xlsx';
    S.file.handle = handle || null;
    S.file.dirty = false;
    S.file.lastSaved = new Date();
    S.ui.cart = [];
    var savedCari = 0;
    try { savedCari = parseInt(localStorage.getItem('dmr:cari'), 10) || 0; } catch (e) { }
    S.ui.cariId = (savedCari && Core.cariById(d, savedCari)) ? savedCari : (d.cariler[0] ? d.cariler[0].id : 0);
    S.ui.shipCariId = S.ui.cariId;
    S.ui.shipFisNo = Core.nextFisNo(data);
    S.ui.shipTarih = Core.todayISO();
    S.view = 'dashboard';
  }

  function readFileAsArrayBuffer(file) {
    return file.arrayBuffer();
  }

  async function openFromHandle(handle) {
    try {
      var perm = handle.queryPermission ? await handle.queryPermission({ mode: 'readwrite' }) : 'granted';
      if (perm === 'prompt') {
        perm = handle.requestPermission ? await handle.requestPermission({ mode: 'readwrite' }) : 'denied';
      }
      if (perm !== 'granted' && perm !== 'prompt') { toast('Dosya izni verilmedi.', 'err'); return false; }
      var file = await handle.getFile();
      var buf = await readFileAsArrayBuffer(file);
      var wb = await XLSX.readWorkbook(buf);
      var d = Core.readData(wb.sheets);
      applyLoadedData(d, file.name, handle);
      await withTimeout(idbSet('handle', handle), 900, null);
      idbSet('cache', null);
      beginSession();
      toast('Dosya açıldı: ' + file.name, 'ok');
      return true;
    } catch (err) {
      toast('Dosya açılamadı: ' + (err && err.message ? err.message : err), 'err');
      return false;
    }
  }

  async function pickOpen() {
    if (!FS_OK) { $('#fileInput').click(); return; }
    try {
      var handles = await window.showOpenFilePicker({ types: XLSX_TYPES, multiple: false });
      if (handles && handles[0]) await openFromHandle(handles[0]);
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      // Tarayıcı dosya seçiciyi engelliyorsa klasik dosya girişine düş
      toast('Dosya seçici açılamadı, dosya yükleme ekranına geçiliyor.', '');
      var inp = $('#fileInput');
      if (inp) inp.click();
    }
  }

  async function loadFromFileObject(file) {
    try {
      var buf = await readFileAsArrayBuffer(file);
      var wb = await XLSX.readWorkbook(buf);
      var d = Core.readData(wb.sheets);
      applyLoadedData(d, file.name, null);
      beginSession();
      toast('Dosya açıldı. Kaydetmek için "Kaydet" düğmesini kullanın.', 'ok');
    } catch (err) {
      toast('Bu dosya açılamadı: ' + err.message, 'err');
    }
  }

  async function newFile() {
    var d = Core.newData();
    var KORU = ['markaAdi', 'markaAlt', 'markaKisa', 'logo', 'dosyaAdi', 'firmaAdi', 'firmaAdres', 'firmaTel',
      'vergiDairesi', 'vergiNo', 'sevkBaslik', 'kagit', 'para', 'varsayilanAsorti'];
    if (data) {
      KORU.forEach(function (k) { if (data.settings[k] !== undefined) d.settings[k] = data.settings[k]; });
    }
    d.settings.sonFisNo = 0;
    d.settings.sonSiparisNo = 0;
    var dosya = String(d.settings.dosyaAdi || 'DMR_VERI').replace(/\.xlsx$/i, '') + '.xlsx';
    applyLoadedData(d, dosya, null);
    beginSession(async function () {
      setDirty(true);
      if (FS_OK) {
        var saved = await saveFile({ saveAs: true });
        if (!saved) toast('Dosya konumu seçilmedi. "Kaydet" ile daha sonra kaydedebilirsiniz.', '');
      }
    });
  }

  async function importLegacyFile(file) {
    try {
      var buf = await readFileAsArrayBuffer(file);
      var wb = await XLSX.readWorkbook(buf);
      var d = Core.importLegacy(wb.sheets);
      var info = {
        orders: d.orders.length,
        ledger: d.ledger.length,
        shipments: d.shipments.length,
        lines: d.lines.length,
        balance: Core.balance(d)
      };
      var ok = await confirmDialog({
        title: 'Eski Excel dosyası içe aktarılacak',
        html: '<div class="stack" style="display:grid;gap:6px;font-size:13px">' +
          '<div><b>' + info.orders + '</b> sipariş</div>' +
          '<div><b>' + info.ledger + '</b> cari hareket</div>' +
          '<div><b>' + info.shipments + '</b> sevk fişi</div>' +
          '<div>Devir bakiyesi: <b>' + money(info.balance) + '</b></div>' +
          '<p class="muted" style="margin:8px 0 0;font-size:12px">Veriler yeni Excel dosyasına aktarılır; eski dosyanız değişmez.</p></div>',
        confirmText: 'İçe aktar'
      });
      if (!ok) return;
      if (data) {
        ['markaAdi', 'markaAlt', 'markaKisa', 'logo', 'para', 'kagit', 'varsayilanAsorti', 'dosyaAdi'].forEach(function (k) {
          if (data.settings[k] !== undefined) d.settings[k] = data.settings[k];
        });
      }
      var yeniAd = String(d.settings.dosyaAdi || 'DMR_VERI').replace(/\.xlsx$/i, '') + '.xlsx';
      applyLoadedData(d, yeniAd, null);
      beginSession(async function () {
        setDirty(true);
        await saveFile({ saveAs: true });
      });
    } catch (err) {
      toast('İçe aktarma başarısız: ' + err.message, 'err');
    }
  }

  /** Eski bir Excel dosyasını mevcut veritabanına yeni cari olarak ekler. */
  async function importCariFile(file) {
    if (!isAdmin()) { toast('Bu işlem için yönetici yetkisi gerekli.', 'err'); return; }
    try {
      var buf = await readFileAsArrayBuffer(file);
      var wb = await XLSX.readWorkbook(buf);
      openImportCariModal(Core.importLegacy(wb.sheets), file.name);
    } catch (err) {
      toast('İçe aktarma başarısız: ' + err.message, 'err');
    }
  }

  function openImportCariModal(legacy, dosyaAdi) {
    var onerilen = (legacy.cariler[0] && legacy.cariler[0].ad) || String(dosyaAdi || '').replace(/\.xlsx$/i, '');
    var bakiye = Core.balance(legacy);
    var yeniKod = 'C' + (data.cariler.length + 1);
    var varMi = data.cariler.some(function (c) { return Core.normKey(c.ad) === Core.normKey(onerilen); });

    var m = openModal({
      title: 'Excel dosyasından cari aktar',
      subtitle: dosyaAdi || 'Seçilen dosya',
      body:
        '<div class="form-grid g2">' +
        '  <div class="field"><label for="ciAd">Cari adı *</label><input id="ciAd" class="input" value="' + esc(onerilen) + '"></div>' +
        '  <div class="field"><label for="ciKod">Kısa kod</label><input id="ciKod" class="input" value="' + esc(yeniKod) + '"></div>' +
        '</div>' +
        (varMi ? '<p class="muted small" style="margin:8px 0 0">Bu isimde bir cari var; aktarımda “(2)” eklenir. İsterseniz adı değiştirin.</p>' : '') +
        '<div class="help-note" style="margin-top:14px">' +
        '  <div><b>' + legacy.orders.length + '</b> sipariş · <b>' + legacy.ledger.length + '</b> cari hareket · <b>' + legacy.shipments.length + '</b> sevk fişi</div>' +
        '  <div style="margin-top:4px">Devir bakiyesi: <b>' + money(bakiye) + '</b></div>' +
        '</div>' +
        '<p class="muted small" style="margin:12px 0 0">Veriler mevcut veritabanına <b>eklenir</b>; diğer cariler ve kayıtlar korunur. Fiş numarası çakışırsa otomatik yeniden numaralanır.</p>',
      footer: '<button class="btn" data-modal-close>Vazgeç</button>' +
        '<button class="btn btn-primary" id="ciBtn">' + ICONS.check + ' Cariyi aktar</button>'
    });

    $('#ciBtn', m.el).addEventListener('click', function () {
      var ad = $('#ciAd', m.el).value.trim();
      if (!ad) { toast('Cari adı gerekli.', 'err'); return; }
      try {
        var res = Core.mergeLegacy(data, legacy, { cariAd: ad, kod: $('#ciKod', m.el).value.trim() });
        setDirty(true);
        m.close();
        setActiveCari(res.cari.id);
        toast(res.cari.ad + ' aktarıldı · ' + res.orders + ' sipariş, ' + res.ledger + ' hareket', 'ok');
      } catch (ex) { toast(ex.message, 'err'); }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Oturum / giriş                                                      */
  /* ------------------------------------------------------------------ */
  var SHA_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  /** Saf JS SHA-256 (crypto.subtle yoksa yedek). */
  function sha256HexSync(str) {
    function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
    var bytes = new TextEncoder().encode(String(str));
    var len = bytes.length;
    var total = ((len + 9 + 63) >> 6) << 6;
    var buf = new Uint8Array(total);
    buf.set(bytes);
    buf[len] = 0x80;
    var dv = new DataView(buf.buffer);
    var bits = len * 8;
    dv.setUint32(total - 4, bits >>> 0);
    dv.setUint32(total - 8, Math.floor(bits / 4294967296));

    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Uint32Array(64);

    for (var off = 0; off < total; off += 64) {
      for (var i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (i = 16; i < 64; i++) {
        var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + SHA_K[i] + w[i]) >>> 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(function (x) { return ('00000000' + x.toString(16)).slice(-8); }).join('');
  }

  function randomHex(n) {
    var out = '';
    try {
      var arr = new Uint8Array(n);
      (window.crypto || window.msCrypto).getRandomValues(arr);
      for (var i = 0; i < arr.length; i++) out += ('0' + arr[i].toString(16)).slice(-2);
    } catch (e) {
      for (var j = 0; j < n * 2; j++) out += Math.floor(Math.random() * 16).toString(16);
    }
    return out;
  }

  async function sha256Hex(text) {
    try {
      if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
        var data = new TextEncoder().encode(String(text));
        var buf = await window.crypto.subtle.digest('SHA-256', data);
        var bytes = new Uint8Array(buf);
        var hex = '';
        for (var i = 0; i < bytes.length; i++) hex += ('0' + bytes[i].toString(16)).slice(-2);
        return hex;
      }
    } catch (e) { }
    return sha256HexSync(text);
  }

  function sifreHash(kullanici, sifre, tuz) {
    return sha256Hex(String(tuz) + ':' + Core.normKey(kullanici) + ':' + String(sifre));
  }

  function isAdmin() {
    return !!(S.user && S.user.rol === 'YÖNETİCİ');
  }

  function sessionUser() {
    try {
      var raw = sessionStorage.getItem('dmr:oturum');
      if (!raw) return null;
      var s = JSON.parse(raw);
      var u = Core.kullaniciById(data, s.id);
      if (u && u.aktif !== false && Core.normKey(u.kullanici) === Core.normKey(s.kullanici)) return u;
    } catch (e) { }
    return null;
  }

  function setSession(u) {
    try {
      sessionStorage.setItem('dmr:oturum', JSON.stringify({ id: u.id, kullanici: u.kullanici }));
    } catch (e) { }
  }

  /** Veri yüklendikten sonra oturum kontrolü; gerekirse giriş ekranı. */
  function beginSession(onReady) {
    S.onReady = onReady || null;
    var u = sessionUser();
    if (u) {
      S.user = u;
      startApp();
      runOnReady();
      return;
    }
    if (!data.kullanicilar.length) { showFirstUser(); return; }
    showLogin();
  }

  function runOnReady() {
    var cb = S.onReady;
    S.onReady = null;
    if (cb) { try { cb(); } catch (e) { } }
  }

  function oturumAc(u) {
    S.user = u;
    setSession(u);
    u.sonGiris = Core.todayISO();
    startApp();
    runOnReady();
  }

  var HATIRLA_KEY = 'dmr:hatirla';

  function hatirlananKullanici() {
    try { return localStorage.getItem(HATIRLA_KEY) || ''; } catch (e) { return ''; }
  }

  function authShell(inner, opts) {
    opts = opts || {};
    var dosya = S.file.name || 'DMR_VERI.xlsx';
    document.getElementById('root').innerHTML =
      '<div class="auth-page">' +
      '  <div class="auth-panel">' +
      '    <aside class="auth-aside">' +
      '      <div class="auth-aside-top">' + brandMark('brand-mark auth-mark') + '<span>' + esc(markaTam()) + '</span></div>' +
      '      <h2>' + esc(opts.asideTitle || 'Sevk ve cari yönetimi') + '</h2>' +
      '      <p>' + esc(opts.asideText || 'Sipariş, sevk fişi ve cari hesap tek ekranda. Verileriniz kendi Excel dosyanızda saklanır.') + '</p>' +
      '      <ul class="auth-points">' +
      '        <li>' + ICONS.box + '<span>Sipariş ve kalan takibi</span></li>' +
      '        <li>' + ICONS.truck + '<span>A4 / A5 sevk fişi</span></li>' +
      '        <li>' + ICONS.wallet + '<span>Cari hesap ve ekstre</span></li>' +
      '      </ul>' +
      '      <div class="auth-aside-foot">' + ICONS.file + '<span>' + esc(dosya) + '</span></div>' +
      '      <i class="auth-orb o1"></i><i class="auth-orb o2"></i>' +
      '    </aside>' +
      '    <section class="auth-main">' +
      '      <div class="auth-mobile-brand">' + brandMark('brand-mark auth-mark') + '<b>' + esc(markaTam()) + '</b></div>' +
      inner +
      '      <div class="auth-main-foot">' + ICONS.lock + '<span>Veriler yalnızca seçtiğiniz Excel dosyasında tutulur.</span></div>' +
      '    </section>' +
      '  </div>' +
      '</div>';
  }

  function showLogin() {
    authShell(
      '<div class="auth-head"><h1>Tekrar hoş geldiniz</h1><p>Devam etmek için hesabınıza giriş yapın.</p></div>' +
      '<form id="loginForm" class="auth-form">' +
      '  <div class="auth-field"><label for="lgUser">Kullanıcı adı</label>' +
      '    <div class="auth-input">' + ICONS.user + '<input id="lgUser" class="input" autocomplete="username" spellcheck="false"></div></div>' +
      '  <div class="auth-field"><label for="lgPass">Şifre</label>' +
      '    <div class="auth-input">' + ICONS.lock + '<input id="lgPass" type="password" class="input" autocomplete="current-password">' +
      '      <button type="button" class="auth-eye" id="lgEye" aria-label="Şifreyi göster">' + ICONS.eye + '</button></div>' +
      '    <div class="auth-caps" id="lgCaps">' + ICONS.alert + ' Caps Lock açık</div></div>' +
      '  <div class="auth-row">' +
      '    <label class="auth-check"><input type="checkbox" id="lgRemember"><span class="box">' + ICONS.check + '</span>Beni hatırla</label>' +
      '    <span class="auth-hint">Yalnızca kullanıcı adı hatırlanır</span>' +
      '  </div>' +
      '  <div class="auth-err" id="lgErr"></div>' +
      '  <button class="btn btn-primary auth-submit" type="submit"><span>Giriş yap</span>' + ICONS.right + '</button>' +
      '</form>' +
      '<div class="auth-note">Şifrenizi unuttuysanız yöneticinize başvurun.</div>'
    );

    var hatirla = hatirlananKullanici();
    if (hatirla) {
      $('#lgUser').value = hatirla;
      $('#lgRemember').checked = true;
      $('#lgPass').focus();
    } else {
      $('#lgUser').focus();
    }

    $('#lgEye').addEventListener('click', function () {
      var p = $('#lgPass');
      var goster = p.type === 'password';
      p.type = goster ? 'text' : 'password';
      this.innerHTML = goster ? ICONS.eyeOff : ICONS.eye;
      this.setAttribute('aria-label', goster ? 'Şifreyi gizle' : 'Şifreyi göster');
    });

    $('#lgPass').addEventListener('keyup', function (e) {
      var on = !!(e.getModifierState && e.getModifierState('CapsLock'));
      $('#lgCaps').classList.toggle('show', on);
    });

    $('#loginForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var kadi = $('#lgUser').value.trim();
      var sifre = $('#lgPass').value;
      var u = Core.kullaniciBul(data, kadi);
      var err = $('#lgErr');
      if (!u) { err.textContent = 'Kullanıcı adı veya şifre hatalı.'; return; }
      if (u.aktif === false) { err.textContent = 'Bu kullanıcı pasif durumda.'; return; }
      var h = await sifreHash(u.kullanici, sifre, u.tuz);
      if (h !== u.sifre) { err.textContent = 'Kullanıcı adı veya şifre hatalı.'; return; }
      try {
        if ($('#lgRemember').checked) localStorage.setItem(HATIRLA_KEY, u.kullanici);
        else localStorage.removeItem(HATIRLA_KEY);
      } catch (ex) { }
      oturumAc(u);
    });
  }

  function showFirstUser() {
    authShell(
      '<div class="auth-head"><h1>Yönetici hesabı oluşturun</h1><p>İlk kurulum: bu dosya için yetkili kullanıcıyı belirleyin.</p></div>' +
      '<form id="firstForm" class="auth-form">' +
      '  <div class="auth-field"><label for="fuAd">Ad soyad</label><div class="auth-input">' + ICONS.user + '<input id="fuAd" class="input" required></div></div>' +
      '  <div class="auth-field"><label for="fuUser">Kullanıcı adı</label><div class="auth-input">' + ICONS.user + '<input id="fuUser" class="input" required autocomplete="username" spellcheck="false"></div></div>' +
      '  <div class="auth-field"><label for="fuPass">Şifre <span class="hint">en az 4 karakter</span></label><div class="auth-input">' + ICONS.lock + '<input id="fuPass" type="password" class="input" required autocomplete="new-password"></div></div>' +
      '  <div class="auth-field"><label for="fuPass2">Şifre (tekrar)</label><div class="auth-input">' + ICONS.lock + '<input id="fuPass2" type="password" class="input" required autocomplete="new-password"></div></div>' +
      '  <div class="auth-err" id="fuErr"></div>' +
      '  <button class="btn btn-primary auth-submit" type="submit"><span>Hesabı oluştur</span>' + ICONS.right + '</button>' +
      '</form>' +
      '<div class="auth-note">Bu bilgiler Excel dosyanızdaki KULLANICILAR sayfasında saklanır.</div>',
      {
        asideTitle: 'İlk kurulum',
        asideText: 'Bir yönetici hesabı oluşturun. Sonrasında Ayarlar bölümünden kullanıcı ekleyip yetki verebilirsiniz.'
      }
    );
    $('#fuAd').focus();
    $('#firstForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var ad = $('#fuAd').value.trim();
      var kadi = $('#fuUser').value.trim();
      var p1 = $('#fuPass').value, p2 = $('#fuPass2').value;
      var err = $('#fuErr');
      if (!ad || !kadi) { err.textContent = 'Ad ve kullanıcı adı zorunlu.'; return; }
      if (p1.length < 4) { err.textContent = 'Şifre en az 4 karakter olmalı.'; return; }
      if (p1 !== p2) { err.textContent = 'Şifreler birbiriyle uyuşmuyor.'; return; }
      var tuz = randomHex(16);
      var hash = await sifreHash(kadi, p1, tuz);
      try {
        var u = Core.addKullanici(data, { ad: ad, kullanici: kadi, tuz: tuz, sifre: hash, rol: 'YÖNETİCİ' });
        setDirty(true);
        oturumAc(u);
      } catch (ex) { err.textContent = ex.message; }
    });
  }

  function lockSession() {
    S.user = null;
    try { sessionStorage.removeItem('dmr:oturum'); } catch (e) { }
    showLogin();
  }

  /* ------------------------------------------------------------------ */
  /* Kabuk                                                               */
  /* ------------------------------------------------------------------ */
  var VIEWS = {
    dashboard: { title: 'Panel', sub: 'Günlük özet ve bekleyen işler' },
    orders: { title: 'Siparişler', sub: 'Model, adet ve kalan takibi' },
    ship: { title: 'Sevk İşlemi', sub: 'Sipariş seçip sevk fişi oluşturun' },
    ledger: { title: 'Cari Hesap', sub: 'Borç, alacak ve bakiye hareketleri' },
    shipments: { title: 'Sevk Fişleri', sub: 'Oluşturulan sevk fişleri' },
    cariler: { title: 'Cari Hesaplar', sub: 'Müşteri kartları, bakiyeler ve açık siparişler' },
    models: { title: 'Modeller', sub: 'Fiyat, maliyet, barkod ve model özeti' },
    reports: { title: 'Raporlar', sub: 'Aylık sevkiyat ve model özeti' },
    settings: { title: 'Ayarlar', sub: 'Firma bilgileri, dosya ve tercihler' }
  };

  function navItems() {
    var shipped = Core.shippedMap(data);
    var cid = S.ui.cariId;
    var open = data.orders.filter(function (o) {
      return (!cid || o.cariId === cid) && Core.orderInfo(data, o, shipped).kalan > 0;
    }).length;
    var ships = cid ? data.shipments.filter(function (s) { return s.cariId === cid; }).length : data.shipments.length;
    return [
      { key: 'dashboard', icon: 'grid', label: 'Panel' },
      { key: 'orders', icon: 'box', label: 'Siparişler', count: open },
      { key: 'ship', icon: 'truck', label: 'Sevk İşlemi' },
      { key: 'ledger', icon: 'wallet', label: 'Cari Hesap' },
      { key: 'shipments', icon: 'receipt', label: 'Sevk Fişleri', count: ships },
      { key: 'cariler', icon: 'users', label: 'Cariler', count: data.cariler.length },
      { key: 'models', icon: 'tag', label: 'Modeller' },
      { key: 'reports', icon: 'chart', label: 'Raporlar' },
      { key: 'settings', icon: 'settings', label: 'Ayarlar' }
    ];
  }

  function renderShell() {
    var nav = navItems().map(function (n) {
      return '<button class="nav-btn' + (S.view === n.key ? ' active' : '') + '" data-view="' + n.key + '">' +
        ICONS[n.icon] + '<span class="lbl">' + n.label + '</span>' +
        (n.count ? '<span class="nav-count">' + n.count + '</span>' : '') + '</button>';
    }).join('');

    document.getElementById('root').innerHTML =
      '<div class="app">' +
      '  <aside class="side">' +
      '    <div class="brand">' +
      brandMark('brand-mark') +
      '      <div class="brand-text"><b>' + esc(markaAdi()) + '</b><span>' + esc(markaAlt()) + '</span></div>' +
      '    </div>' +
      '    <nav class="nav" id="nav">' + nav + '</nav>' +
      '    <div class="side-foot">' +
      '      <div class="side-user" id="userChip"></div>' +
      '      <div class="filebox" id="fileChip"></div>' +
      '    </div>' +
      '  </aside>' +
      '  <main class="main">' +
      '    <div class="topbar"><div><h1 id="viewTitle"></h1><p class="sub" id="viewSub"></p></div>' +
      '      <div class="topbar-actions" id="viewActions"></div></div>' +
      '    <div class="content" id="view"></div>' +
      '  </main>' +
      '</div>';

    $('#nav').addEventListener('click', function (e) {
      var b = e.target.closest('[data-view]');
      if (!b) return;
      go(b.dataset.view);
    });
  }

  function updateUserChip() {
    var box = $('#userChip');
    if (!box) return;
    if (!S.user) { box.innerHTML = ''; return; }
    var ad = String(S.user.ad || S.user.kullanici || '');
    var parcalar = ad.trim().split(/\s+/);
    var ini = (parcalar[0] || '?').slice(0, 1) + (parcalar.length > 1 ? parcalar[parcalar.length - 1].slice(0, 1) : '');
    box.innerHTML =
      '<div class="su-row">' +
      '<div class="su-avatar">' + esc(ini.toLocaleUpperCase('tr-TR')) + '</div>' +
      '<div class="su-info"><b>' + esc(ad) + '</b><span>' + (S.user.rol === 'YÖNETİCİ' ? 'Yönetici' : 'Kullanıcı') + '</span></div>' +
      '<button class="su-lock" data-act="lock" title="Oturumu kilitle" aria-label="Oturumu kilitle">' + ICONS.lock + '</button>' +
      '</div>';
  }

  function updateFileChip() {
    var chip = $('#fileChip');
    if (!chip) return;
    var mode = S.file.handle ? 'Excel dosyasına bağlı' : (S.file.name ? 'Tarayıcı modu' : 'Dosya seçilmedi');
    var status = S.file.dirty ? 'Kaydedilmedi' : (S.file.lastSaved ? 'Kaydedildi ' + timeTR(S.file.lastSaved) : 'Hazır');
    chip.innerHTML =
      '<div class="fname">' + ICONS.file + '<span title="' + esc(S.file.name) + '">' + esc(S.file.name || 'DMR_VERI.xlsx') + '</span></div>' +
      '<div class="fstat"><i class="dot ' + (S.file.dirty ? 'dirty' : S.file.handle ? 'ok' : 'off') + '"></i>' + esc(status) + '</div>' +
      '<div class="fstat muted" style="margin-top:2px">' + esc(mode) + '</div>' +
      '<button class="fsave" data-act="save">' + (S.file.dirty ? 'Kaydet' : 'Excel\'e kaydet') + '</button>' +
      '<button class="fhelp" data-act="help">Kullanım kılavuzu</button>' +
      '<button class="fhelp" data-act="open-changelog" style="opacity:.7">Sürüm ' + SURUM + ' · yenilikler</button>';
  }

  function updateChrome() {
    var meta = VIEWS[S.view] || VIEWS.dashboard;
    try { document.title = markaTam() + ' · Sevk ve Cari Yönetimi'; } catch (e) { }
    var t = $('#viewTitle');
    if (t) t.textContent = meta.title;
    var s = $('#viewSub');
    if (s) {
      var cari = activeCari();
      var ek = (S.view === 'cariler' || S.view === 'settings') ? '' : ' · ' + (cari ? cari.ad : 'Tüm cariler');
      s.textContent = meta.sub + ek;
    }
    $$('#nav .nav-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.view === S.view); });

    // sayaçlar
    var shipped = Core.shippedMap(data);
    var cid = S.ui.cariId;
    var open = data.orders.filter(function (o) {
      return (!cid || o.cariId === cid) && Core.orderInfo(data, o, shipped).kalan > 0;
    }).length;
    var counts = {
      orders: open,
      shipments: cid ? data.shipments.filter(function (x) { return x.cariId === cid; }).length : data.shipments.length,
      cariler: data.cariler.length
    };
    $$('#nav .nav-btn').forEach(function (b) {
      var c = counts[b.dataset.view];
      var badge = b.querySelector('.nav-count');
      if (c) {
        if (!badge) { badge = document.createElement('span'); badge.className = 'nav-count'; b.appendChild(badge); }
        badge.textContent = c;
      } else if (badge) badge.remove();
    });

    var actions = [];
    if (S.view === 'dashboard') {
      actions.push(btn('Yeni sipariş', 'order-new', 'btn', 'plus'));
      actions.push(btn('Sevk fişi oluştur', 'go-ship', 'btn btn-primary', 'truck'));
    } else if (S.view === 'orders') {
      actions.push(btn('Yeni sipariş', 'order-new', 'btn btn-primary', 'plus'));
    } else if (S.view === 'cariler') {
      if (isAdmin()) actions.push(btn('Excel\'den aktar', 'import-cari', 'btn', 'upload'));
      actions.push(btn('Yeni cari', 'cari-new', 'btn btn-primary', 'plus'));
    } else if (S.view === 'models') {
      actions.push(btn('Yeni model', 'model-new', 'btn btn-primary', 'plus'));
    } else if (S.view === 'ledger') {
      actions.push(btn('Ekstre yazdır', 'print-ekstre', 'btn', 'print'));
      actions.push(btn('Hareket ekle', 'ledger-new', 'btn btn-primary', 'plus'));
    } else if (S.view === 'settings') {
      actions.push(btn('Yedek indir', 'backup', 'btn', 'download'));
    }

    var picker =
      '<div class="cari-pick">' +
      '<label for="cariSelect">Cari</label>' +
      '<select id="cariSelect" class="select cari-select" data-role="cari-select">' + cariOptions(S.ui.cariId, true) + '</select>' +
      '</div>';

    $('#viewActions').innerHTML = picker + actions.join('');
    updateFileChip();
    updateUserChip();
  }

  function btn(label, act, cls, icon) {
    return '<button class="' + cls + '" data-act="' + act + '">' + (icon ? ICONS[icon] : '') + '<span>' + label + '</span></button>';
  }

  function go(view) {
    if (!data) return;
    S.view = view;
    if (view === 'ship') {
      if (!S.ui.shipFisNo) S.ui.shipFisNo = Core.nextFisNo(data);
      if (!S.ui.shipTarih) S.ui.shipTarih = Core.todayISO();
      if (!S.ui.shipCariId) S.ui.shipCariId = shipCariId();
    }
    updateChrome();
    renderView();
  }

  function renderView() {
    var html = '';
    switch (S.view) {
      case 'orders': html = viewOrders(); break;
      case 'ship': html = viewShip(); break;
      case 'ledger': html = viewLedger(); break;
      case 'shipments': html = viewShipments(); break;
      case 'cariler': html = viewCariler(); break;
      case 'models': html = viewModels(); break;
      case 'reports': html = viewReports(); break;
      case 'settings': html = viewSettings(); break;
      default: html = viewDashboard();
    }
    $('#view').innerHTML = html;
    afterRender();
  }

  /* ------------------------------------------------------------------ */
  /* Olaylar                                                             */
  /* ------------------------------------------------------------------ */
  function bindGlobal() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-act]');
      if (!el) return;
      var act = el.dataset.act;
      var id = el.dataset.id ? parseInt(el.dataset.id, 10) : null;
      var ADMIN_ONLY = { 'new-file': 1, 'clear-all': 1, 'import-legacy': 1, 'import-cari': 1, 'user-new': 1, 'user-edit': 1, 'user-del': 1, 'user-pass': 1 };
      if (ADMIN_ONLY[act] && !isAdmin()) {
        toast('Bu işlem için yönetici yetkisi gerekli.', 'err');
        return;
      }
      switch (act) {
        case 'save': saveFile(); break;
        case 'order-new': openOrderForm(null); break;
        case 'order-edit': openOrderForm(findOrder(id)); break;
        case 'order-del': removeOrder(id); break;
        case 'order-ship': shipOrder(id); break;
        case 'go-ship': go('ship'); break;
        case 'ledger-new': openLedgerForm(null); break;
        case 'ledger-del': removeLedger(id); break;
        case 'print-ekstre': printEkstre(); break;
        case 'ship-print': printShipment(id); break;
        case 'ship-view': previewShipment(id); break;
        case 'ship-del': removeShipment(id); break;
        case 'backup': backup(); break;
        case 'import-legacy': $('#legacyInput').click(); break;
        case 'import-cari': $('#cariImportInput').click(); break;
        case 'open-file': pickOpen(); break;
        case 'save-as': saveFile({ saveAs: true }); break;
        case 'cart-add': addToCart(id); break;
        case 'cart-remove': removeFromCart(id); break;
        case 'cart-clear': S.ui.cart = []; renderView(); break;
        case 'ship-create': createShipmentFromCart(); break;
        case 'cari-new': openCariForm(null); break;
        case 'cari-edit': openCariForm(Core.cariById(data, id)); break;
        case 'cari-del': removeCari(id); break;
        case 'pick-cari': setActiveCari(id); break;
        case 'go-cariler': go('cariler'); break;
        case 'lock': lockSession(); break;
        case 'user-new': openUserForm(null); break;
        case 'user-edit': openUserForm(Core.kullaniciById(data, id)); break;
        case 'user-pass': openUserForm(Core.kullaniciById(data, id), true); break;
        case 'user-del': removeKullanici(id); break;
        case 'change-pass': openPasswordForm(); break;
        case 'model-new': openModelForm(null, el.dataset.model || ''); break;
        case 'color-new': openColorForm(null); break;
        case 'color-edit': openColorForm((data.renkler || []).filter(function (c) { return c.id === id; })[0]); break;
        case 'color-del': removeColorMaster(id); break;
        case 'sablon-new': openSablonForm(null); break;
        case 'sablon-edit': openSablonForm((data.asortiSablonlari || []).filter(function (t) { return t.id === id; })[0]); break;
        case 'sablon-del': removeSablonMaster(id); break;
        case 'model-edit': openModelForm(modelById(id)); break;
        case 'model-del': removeModel(id); break;
        case 'model-image': showModelImage(id); break;
        case 'order-copy': copyOrder(id); break;
        case 'cart-fill': fillCart(); break;
        case 'ship-invoice': openInvoiceForm(id); break;
        case 'open-trash': openTrash(); break;
        case 'open-audit': openAudit(); break;
        case 'open-backups': openBackups(); break;
        case 'open-health': openHealth(false); break;
        case 'open-changelog': openChangelog(); break;
        case 'go-models': go('models'); break;
        case 'backup-now':
          try { backupSnapshot(writeBytes(), true).then(function (ok) { toast(ok ? 'Yedek alındı' : 'Yedek alınamadı', ok ? 'ok' : 'err'); }); }
          catch (e) { toast('Yedek alınamadı: ' + e.message, 'err'); }
          break;
        case 'backup-file': yedekIndir(); break;
        case 'trash-restore': trashRestore(id); break;
        case 'trash-purge': trashPurge(id); break;
        case 'help': openHelp(); break;
      }
    });

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'fileInput' && t.files && t.files[0]) { loadFromFileObject(t.files[0]); t.value = ''; }
      if (t.id === 'legacyInput' && t.files && t.files[0]) { importLegacyFile(t.files[0]); t.value = ''; }
      if (t.id === 'cariImportInput' && t.files && t.files[0]) { importCariFile(t.files[0]); t.value = ''; }
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveFile();
      }
    });

    window.addEventListener('beforeunload', function (e) {
      if (data && S.file.dirty) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  function findOrder(id) { return data.orders.filter(function (o) { return o.id === id; })[0]; }
  function findShipment(id) { return data.shipments.filter(function (s) { return s.id === id; })[0]; }

  /* ------------------------------------------------------------------ */
  /* Uygulama başlangıcı                                                 */
  /* ------------------------------------------------------------------ */
  function startApp() {
    renderShell();
    updateChrome();
    renderView();
    if (data && data._upgraded) {
      data._upgraded = false;
      setDirty(true);
      setTimeout(showUpgradeNotice, 400);
    } else {
      setTimeout(function () { try { openHealth(true); } catch (e) { } }, 1100);
    }
  }

  function showUpgradeNotice() {
    var cari = data.cariler[0];
    var m = openModal({
      title: 'Dosyanız çoklu cari yapısına yükseltildi',
      subtitle: 'Mevcut kayıtlar korundu',
      body:
        '<div class="help-note" style="margin-top:0">' +
        '<p>Dosyanızda cari listesi yoktu. Tüm mevcut sipariş, sevk fişi ve cari hareketler <b>' + esc(cari ? cari.ad : 'ilk cari') + '</b> hesabına bağlandı.</p>' +
        '</div>' +
        '<p style="font-size:13px;color:var(--ink-2);margin:12px 0 0">Artık <b>Cariler</b> sayfasından yeni müşteri ekleyebilir, üstteki cari kutusundan hesaplar arasında geçiş yapabilirsiniz. Yeni yapı dosyaya kaydedilecek; yine de bir yedek almanız önerilir.</p>',
      footer: '<button class="btn" data-modal-close>Tamam</button>' +
        '<button class="btn btn-primary" id="btnUpgradeBackup">' + ICONS.download + ' Yedek indir</button>'
    });
    $('#btnUpgradeBackup', m.el).addEventListener('click', function () { backup(); });
  }

  // Dışa açılan küçük API (init ve test için)
  window.APP = {
    get data() { return data; },
    set data(v) { data = v; },
    S: S,
    startApp: startApp,
    renderShell: renderShell,
    renderView: renderView,
    updateChrome: updateChrome,
    openModal: openModal,
    toast: toast,
    saveFile: saveFile,
    setDirty: setDirty,
    previewShipment: previewShipment,
    printShipment: printShipment,
    shipmentDocHtml: shipmentDocHtml,
    ekstreDocHtml: ekstreDocHtml,
    buildBytes: writeBytes,
    readData: function (sheets) { return Core.readData(sheets); },
    beginSession: beginSession,
    showLogin: showLogin,
    showFirstUser: showFirstUser,
    lockSession: lockSession,
    sifreHash: sifreHash,
    openImportCariModal: openImportCariModal,
    openPalette: openPalette,
    openTrash: openTrash,
    openAudit: openAudit,
    openBackups: openBackups,
    openChangelog: openChangelog,
    openModelForm: openModelForm,
    money: money
  };

  /* ------------------------------------------------------------------ */
  /* Ortak parçalar                                                      */
  /* ------------------------------------------------------------------ */
  function thumbHtml(order, cls) {
    var img = data.images[order.id];
    if (img) return '<div class="thumb ' + (cls || '') + '" style="background-image:url(&quot;' + esc(img) + '&quot;)" role="img" aria-label="' + esc(order.model) + '"></div>';
    var initials = String(order.model || '?').trim().slice(0, 2).toLocaleUpperCase('tr-TR');
    return '<div class="thumb ' + (cls || '') + '">' + esc(initials) + '</div>';
  }

  function statusPill(info) {
    if (info.durum === 'TAMAMLANDI') return '<span class="pill ok">Tamamlandı</span>';
    if (info.durum === 'KISMİ') return '<span class="pill warn">Kısmi sevk</span>';
    return '<span class="pill info">Açık</span>';
  }

  function islemPill(islem) {
    var map = { 'SATIŞ': 'info', 'TAHSİLAT': 'ok', 'ALIŞ': 'warn', 'GELİR': 'ok', 'DİĞER': 'muted' };
    return '<span class="pill ' + (map[islem] || 'muted') + '">' + esc(islem || '—') + '</span>';
  }

  function emptyState(icon, title, text, actionHtml) {
    return '<div class="empty">' + ICONS[icon] + '<h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (actionHtml || '') + '</div>';
  }

  function pager(total, page, per, role) {
    var pages = Math.max(1, Math.ceil(total / per));
    page = Math.min(page, pages);
    if (total === 0) return '';
    return '<div class="pager"><span>' + nf0(total) + ' kayıt · sayfa ' + page + ' / ' + pages + '</span>' +
      '<div style="display:flex;gap:6px">' +
      '<button class="btn btn-sm" data-page="' + role + '" data-to="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>' + ICONS.left + ' Önceki</button>' +
      '<button class="btn btn-sm" data-page="' + role + '" data-to="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + '>Sonraki ' + ICONS.right + '</button>' +
      '</div></div>';
  }

  /* ------------------------------------------------------------------ */
  /* Panel                                                               */
  /* ------------------------------------------------------------------ */
  function monthlySeries(count, cid) {
    var out = [];
    var d = new Date();
    d.setDate(1);
    for (var i = count - 1; i >= 0; i--) {
      var x = new Date(d.getFullYear(), d.getMonth() - i, 1);
      var key = x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0');
      out.push({ key: key, label: monthName(key).split(' ')[0].slice(0, 3), tutar: 0, cift: 0 });
    }
    var idx = {};
    out.forEach(function (m) { idx[m.key] = m; });
    data.ledger.forEach(function (r) {
      if (cid && r.cariId !== cid) return;
      var m = idx[(r.tarih || '').slice(0, 7)];
      if (!m || r.islem !== 'SATIŞ') return;
      m.tutar += Core.num(r.tutar);
      m.cift += Core.num(r.cift);
    });
    return out;
  }

  function viewDashboard() {
    var cid = S.ui.cariId;
    var cari = activeCari();
    var st = Core.stats(data, cid);
    var shipped = Core.shippedMap(data);
    var pending = data.orders.map(function (o) { return { o: o, i: Core.orderInfo(data, o, shipped) }; })
      .filter(function (x) { return (!cid || x.o.cariId === cid) && x.i.kalan > 0; })
      .sort(function (a, b) { return b.i.kalanTutar - a.i.kalanTutar; })
      .slice(0, 6);
    var recent = Core.ledgerWithBalance(data, cid).reverse().slice(0, 7);
    var series = monthlySeries(6, cid);
    var max = Math.max.apply(null, series.map(function (m) { return m.tutar; }).concat([1]));

    var balLabel = st.balance >= 0 ? 'Müşteri borcu' : 'Müşteri alacağı (avans)';
    var kpiHtml =
      '<div class="kpi">' +
      '<div class="kpi-label">Açık sipariş</div>' +
      '<div class="kpi-value">' + nf0(st.openOrders) + '<small>/ ' + nf0(st.orderCount) + '</small></div>' +
      '<div class="kpi-foot">Kalan <b>' + nf0(st.remainingCift) + ' çift</b> · ' + money0(st.openValue) + '</div>' +
      '</div>' +
      '<div class="kpi warn">' +
      '<div class="kpi-label">Bu ay sevkiyat</div>' +
      '<div class="kpi-value">' + nf0(st.monthShipmentQty) + '<small>çift</small></div>' +
      '<div class="kpi-foot">' + money(st.monthShipment) + '</div>' +
      '</div>' +
      '<div class="kpi ' + (st.balance < 0 ? 'info' : 'danger') + '">' +
      '<div class="kpi-label">' + (cid ? 'Cari bakiye' : 'Toplam cari bakiye') + '</div>' +
      '<div class="kpi-value" style="color:' + (st.balance < 0 ? 'var(--alacak)' : 'var(--borc)') + '">' + nf2(st.balance) + '<small>' + (data.settings.para || '₺') + '</small></div>' +
      '<div class="kpi-foot">' + (cid ? balLabel : data.cariler.length + ' cari hesap') + '</div>' +
      '</div>' +
      '<div class="kpi info">' +
      '<div class="kpi-label">Bu ay tahsilat</div>' +
      '<div class="kpi-value">' + nf0(st.monthCollection) + '<small>' + (data.settings.para || '₺') + '</small></div>' +
      '<div class="kpi-foot">' + data.ledger.filter(function (r) {
        return r.islem === 'TAHSİLAT' && (!cid || r.cariId === cid) && (r.tarih || '').slice(0, 7) === Core.todayISO().slice(0, 7);
      }).length + ' tahsilat kaydı</div>' +
      '</div>';

    var pendingHtml = !data.orders.length
      ? '<tr><td colspan="5">' + emptyState('box', 'Henüz sipariş yok', 'İlk siparişi ekleyerek başlayın.',
        '<button class="btn btn-primary" data-act="order-new">' + ICONS.plus + ' Yeni sipariş</button>') + '</td></tr>'
      : (pending.length ? pending.map(function (x) {
        return '<tr>' +
          '<td><div class="cell-model">' + thumbHtml(x.o) + '<div style="min-width:0"><div class="mname">' + esc(x.o.model) + '</div><div class="mcolor">' + esc(x.o.renk || '—') + ' · #' + esc(x.o.sipno) + '</div></div></div></td>' +
          '<td class="right strong">' + nf0(x.i.kalan) + '</td>' +
          '<td class="right">' + nf1(x.i.kalanKoli) + '</td>' +
          '<td class="right strong">' + money(x.i.kalanTutar) + '</td>' +
          '<td class="right"><button class="btn btn-sm" data-act="order-ship" data-id="' + x.o.id + '">Sevk et</button></td>' +
          '</tr>';
      }).join('') : '<tr><td colspan="5">' + emptyState('check', 'Bekleyen sipariş yok', 'Tüm siparişlerin sevkiyatı tamamlanmış.', '') + '</td></tr>');

    var cariSatir = data.cariler.map(function (c) {
      var cs = Core.stats(data, c.id);
      return { c: c, bakiye: cs.balance, open: cs.openOrders, kalan: cs.remainingCift };
    }).sort(function (a, b) { return b.bakiye - a.bakiye; });

    var cariHtml = cariSatir.map(function (x) {
      return '<tr class="clickable" data-act="pick-cari" data-id="' + x.c.id + '">' +
        '<td><div class="strong">' + esc(x.c.ad) + '</div><div class="sub">' + esc(x.c.kod || '') + (x.c.tel ? ' · ' + esc(x.c.tel) : '') + '</div></td>' +
        '<td class="right">' + nf0(x.open) + '</td>' +
        '<td class="right">' + nf0(x.kalan) + '</td>' +
        '<td class="right strong" style="color:' + (x.bakiye < 0 ? 'var(--alacak)' : 'var(--borc)') + '">' + nf2(x.bakiye) + '</td>' +
        '</tr>';
    }).join('');

    var recentHtml = recent.length ? recent.map(function (r) {
      var tutar = Core.num(r.borc) > 0 ? r.borc : r.alacak;
      return '<div class="feed-item">' +
        '<div class="feed-dot ' + (Core.num(r.borc) > 0 ? 'borc' : 'alacak') + '"></div>' +
        '<div class="feed-main"><b>' + esc(r.aciklama || r.islem) + '</b><span>' +
        (!cid ? esc(cariAdi(r.cariId)) + ' · ' : '') + dateTR(r.tarih) + ' · ' + esc(r.islem) + (r.fisNo ? ' · Fiş ' + esc(r.fisNo) : '') + '</span></div>' +
        '<div class="feed-amt ' + (Core.num(r.borc) > 0 ? 'borc' : 'alacak') + '">' + (Core.num(r.borc) > 0 ? '+' : '−') + nf2(tutar) + '</div>' +
        '</div>';
    }).join('') : emptyState('wallet', 'Henüz hareket yok', 'Sevk fişi oluşturduğunuzda cari hesap burada görünür.', '');

    var barsHtml = series.map(function (m) {
      var h = Math.max(4, Math.round((m.tutar / max) * 100));
      return '<div class="bar-item" title="' + esc(m.label) + ': ' + money(m.tutar) + '">' +
        '<div class="bar-value">' + (m.tutar ? nf0(m.tutar / 1000) + 'b' : '') + '</div>' +
        '<div class="bar-track"><div class="bar-fill" style="height:' + h + '%"></div></div>' +
        '<div class="bar-label">' + esc(m.label) + '</div></div>';
    }).join('');

    var hasShipment = series.some(function (m) { return m.tutar > 0; });
    var chartBody = hasShipment ? '<div class="bars">' + barsHtml + '</div>'
      : emptyState('chart', 'Son 6 ayda sevkiyat yok', 'Sevk fişi oluşturduğunuzda aylık grafik burada görünür.', '');

    var solKart = cid
      ? '<div class="card">' +
        '  <div class="card-head"><div><h2>Sevkiyat bekleyen siparişler</h2><div class="sub">Kalan çifte göre en yüksek tutarlar</div></div>' +
        '    <button class="btn btn-sm" data-act="go-orders">Tümü ' + ICONS.right + '</button></div>' +
        '  <div class="card-body flush"><div class="table-wrap short"><table class="data"><thead><tr>' +
        '    <th>Model</th><th class="right">Kalan çift</th><th class="right">Koli</th><th class="right">Kalan tutar</th><th></th>' +
        '    </tr></thead><tbody>' + pendingHtml + '</tbody></table></div></div>' +
        '</div>'
      : '<div class="card">' +
        '  <div class="card-head"><div><h2>Cari bakiyeleri</h2><div class="sub">Bakiyeye göre sıralı</div></div>' +
        '    <button class="btn btn-sm" data-act="go-cariler">Cariler ' + ICONS.right + '</button></div>' +
        '  <div class="card-body flush"><div class="table-wrap short"><table class="data"><thead><tr>' +
        '    <th>Cari</th><th class="right">Açık sipariş</th><th class="right">Kalan çift</th><th class="right">Bakiye</th>' +
        '    </tr></thead><tbody>' + cariHtml + '</tbody></table></div></div>' +
        '</div>';

    return '<div class="kpis">' + kpiHtml + '</div>' +
      '<div class="grid-2">' + solKart +
      '  <div class="card">' +
      '    <div class="card-head"><div><h2>Son hareketler</h2><div class="sub">' + (cid ? esc(cari.ad) : 'Tüm cariler') + '</div></div>' +
      '      <button class="btn btn-sm" data-act="go-ledger">Cari hesap ' + ICONS.right + '</button></div>' +
      '    <div class="card-body flush"><div class="feed">' + recentHtml + '</div></div>' +
      '  </div>' +
      '</div>' +
      '<div class="card" style="margin-top:16px">' +
      '  <div class="card-head"><div><h2>Aylık sevkiyat</h2><div class="sub">Son 6 ay, sevk tutarı · ' + (cid ? esc(cari.ad) : 'tüm cariler') + '</div></div>' + (hasShipment ? '<span class="muted small">bin ' + (data.settings.para || '₺') + '</span>' : '') + '</div>' +
      '  <div class="card-body">' + chartBody + '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ */
  /* Siparişler                                                          */
  /* ------------------------------------------------------------------ */
  function filteredOrders() {
    var q = S.ui.orderSearch.toLocaleLowerCase('tr-TR').trim();
    var shipped = Core.shippedMap(data);
    var rows = data.orders.map(function (o) { return { o: o, i: Core.orderInfo(data, o, shipped) }; });

    if (S.ui.cariId) rows = rows.filter(function (x) { return x.o.cariId === S.ui.cariId; });

    if (q) {
      rows = rows.filter(function (x) {
        var o = x.o;
        return [o.model, o.renk, o.kod, o.grup, o.tur, o.sipno, o.not, cariAdi(o.cariId)].join(' ').toLocaleLowerCase('tr-TR').indexOf(q) >= 0;
      });
    }
    var f = S.ui.orderFilter;
    if (f === 'open') rows = rows.filter(function (x) { return x.i.kalan > 0 && x.i.giden === 0; });
    else if (f === 'partial') rows = rows.filter(function (x) { return x.i.kalan > 0 && x.i.giden > 0; });
    else if (f === 'done') rows = rows.filter(function (x) { return x.i.kalan <= 0; });
    else if (f === 'pending') rows = rows.filter(function (x) { return x.i.kalan > 0; });

    var key = S.ui.orderSortKey, dir = S.ui.orderSortDir === 'asc' ? 1 : -1;
    rows.sort(function (a, b) {
      var va, vb;
      if (key === 'kalan') { va = a.i.kalan; vb = b.i.kalan; }
      else if (key === 'tutar') { va = a.i.tutar; vb = b.i.tutar; }
      else if (key === 'model') { va = a.o.model; vb = b.o.model; }
      else if (key === 'tarih') { va = a.o.tarih; vb = b.o.tarih; }
      else if (key === 'adet') { va = Core.num(a.o.adet); vb = Core.num(b.o.adet); }
      else if (key === 'fiyat') { va = Core.num(a.o.fiyat); vb = Core.num(b.o.fiyat); }
      else { va = Core.num(a.o.sipno); vb = Core.num(b.o.sipno); }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return rows;
  }

  function sortHeader(key, label, cls) {
    var active = S.ui.orderSortKey === key;
    var arrow = active ? (S.ui.orderSortDir === 'asc' ? '▲' : '▼') : '';
    return '<th class="sortable ' + (cls || '') + '" data-sort="' + key + '">' + label + '<span class="arrow">' + arrow + '</span></th>';
  }

  function ordersTableHtml() {
    var rows = filteredOrders();
    var page = Math.min(S.ui.orderPage, Math.max(1, Math.ceil(rows.length / PAGE_SIZE)));
    var start = (page - 1) * PAGE_SIZE;
    var slice = rows.slice(start, start + PAGE_SIZE);

    if (!rows.length) {
      return emptyState('box', 'Sipariş bulunamadı', S.ui.orderSearch ? 'Aramanızla eşleşen sipariş yok.' : 'İlk siparişi ekleyerek başlayın.',
        S.ui.orderSearch ? '' : '<button class="btn btn-primary" data-act="order-new">' + ICONS.plus + ' Yeni sipariş</button>');
    }

    var body = slice.map(function (x) {
      var o = x.o, i = x.i;
      var pct = Math.min(100, Math.round((i.giden / Math.max(1, Core.num(o.adet))) * 100));
      var cariCell = S.ui.cariId ? '' : '<td class="sub nowrap">' + esc(cariAdi(o.cariId)) + '</td>';
      var ls = Matris.orderLinesOf(data, o.id);
      var alt = [o.renk, o.grup].filter(Boolean);
      if (ls.length > 1) alt.push(ls.length + ' satır');
      return '<tr>' +
        cariCell +
        '<td class="strong num">#' + esc(o.sipno) + '<div class="sub">' + dateTR(o.tarih) + '</div></td>' +
        '<td><div class="cell-model">' + thumbHtml(o) + '<div style="min-width:0"><div class="mname">' + esc(o.model) + '</div>' +
        '<div class="mcolor">' + esc(alt.join(' · ') || '—') + '</div></div></div></td>' +
        '<td class="right">' + nf0(o.asorti) + '</td>' +
        '<td class="right strong">' + nf0(o.adet) + '</td>' +
        '<td class="right">' + nf1(i.koli) + '</td>' +
        '<td><div class="strong num">' + nf0(i.kalan) + '</div><div class="progress' + (pct >= 100 ? ' full' : '') + '"><i style="width:' + pct + '%"></i></div><div class="sub">%' + pct + ' sevk</div></td>' +
        '<td class="right">' + nf2(o.fiyat) + '</td>' +
        '<td class="right strong">' + money(i.tutar) + '</td>' +
        '<td>' + statusPill(i) + '</td>' +
        '<td><div class="row-actions">' +
        (i.kalan > 0 ? '<button class="btn btn-icon" data-act="order-ship" data-id="' + o.id + '" title="Sevk et" aria-label="Sevk et">' + ICONS.truck + '</button>' : '') +
        '<button class="btn btn-icon" data-act="order-edit" data-id="' + o.id + '" title="Düzenle" aria-label="Düzenle">' + ICONS.edit + '</button>' +
        '<button class="btn btn-icon" data-act="order-copy" data-id="' + o.id + '" title="Kopyala" aria-label="Siparişi kopyala">' + ICONS.plus + '</button>' +
        '<button class="btn btn-icon danger" data-act="order-del" data-id="' + o.id + '" title="Sil" aria-label="Sil">' + ICONS.trash + '</button>' +
        '</div></td>' +
        '</tr>';
    }).join('');

    return '<div class="table-wrap"><table class="data"><thead><tr>' +
      (S.ui.cariId ? '' : '<th>Cari</th>') +
      sortHeader('sipno', 'Sip. No') +
      sortHeader('model', 'Model') +
      '<th class="right">Asorti</th>' +
      sortHeader('adet', 'Sipariş çift', 'right') +
      '<th class="right">Koli</th>' +
      sortHeader('kalan', 'Kalan', '') +
      sortHeader('fiyat', 'Fiyat', 'right') +
      sortHeader('tutar', 'Tutar', 'right') +
      '<th>Durum</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      pager(rows.length, page, PAGE_SIZE, 'orders');
  }

  function viewOrders() {
    var filters = [['all', 'Tümü'], ['pending', 'Bekleyen'], ['partial', 'Kısmi'], ['done', 'Tamamlanan']];
    return '<div class="card">' +
      '<div class="toolbar">' +
      '<div class="search grow"><label for="orderSearch" class="sr-only"></label>' + ICONS.search +
      '<input id="orderSearch" class="input" placeholder="Model, renk, kod veya sipariş no ara…" value="' + esc(S.ui.orderSearch) + '" data-role="order-search" autocomplete="off"></div>' +
      '<div class="seg">' + filters.map(function (f) {
        return '<button data-filter="' + f[0] + '" class="' + (S.ui.orderFilter === f[0] ? 'active' : '') + '">' + f[1] + '</button>';
      }).join('') + '</div>' +
      '</div>' +
      '<div id="ordersTable">' + ordersTableHtml() + '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ */
  /* Sevk işlemi                                                         */
  /* ------------------------------------------------------------------ */
  function lineSub(l) { return [l.renk, lineLabel(l)].filter(Boolean).join(' · ') || '—'; }

  function lineLabel(l) {
    if (!l) return '';
    if (l.mod === 'ACIK') return 'Açık' + (Core.num(l.beden) ? ' · ' + l.beden : '') + (Core.num(l.koliIci) ? ' · ' + nf0(l.koliIci) + "'lu" : '');
    if (l.mod === 'ESKI') return '';
    return 'Asortili';
  }

  function findLine(id) {
    var lid = Core.num(id);
    return (data.orderLines || []).filter(function (l) { return l.id === lid; })[0] || null;
  }

  function linePerBox(l) {
    if (!l) return 1;
    var p = Core.num(l.koliIci);
    if (p) return p;
    var o = findOrder(l.orderId);
    var k = o ? Core.modelKart(data, o.model) : null;
    var t = Matris.kartToplam(k);
    if (t) return t;
    return Core.num(l.koli) ? Core.num(l.cift) / Core.num(l.koli) : 1;
  }

  function normalizeCart() {
    var out = [];
    S.ui.cart.forEach(function (c) {
      if (c.lineId) { out.push(c); return; }
      var ls = Matris.orderLinesOf(data, c.orderId);
      if (ls.length === 1) out.push({ lineId: ls[0].id, orderId: c.orderId, cift: c.cift, koli: c.koli, fiyat: c.fiyat });
    });
    S.ui.cart = out;
  }

  function shipCandidates() {
    var q = S.ui.shipSearch.toLocaleLowerCase('tr-TR').trim();
    var scid = shipCariId();
    var out = [];
    data.orders.forEach(function (o) {
      if (o.cariId !== scid) return;
      Matris.orderLinesOf(data, o.id).forEach(function (l) {
        var i = Core.lineInfo(data, l);
        if (i.kalan <= 0) return;
        if (q) {
          var arama = [o.model, l.renk, l.beden, o.sipno, o.kod, lineLabel(l)].join(' ').toLocaleLowerCase('tr-TR');
          if (arama.indexOf(q) < 0) return;
        }
        out.push({ o: o, l: l, i: i });
      });
    });
    return out.sort(function (a, b) { return Core.num(b.i.kalan) - Core.num(a.i.kalan); });
  }

  function pickListHtml() {
    var list = shipCandidates();
    if (!list.length) return emptyState('check', 'Sevk bekleyen satır yok', 'Bu cari için kalanı olan renk/beden satırı bulunmuyor.', '');
    var inCart = {};
    S.ui.cart.forEach(function (c) { inCart[c.lineId] = true; });
    return list.slice(0, 80).map(function (x) {
      return '<div class="pick-item' + (inCart[x.l.id] ? ' disabled' : '') + '" data-act="cart-add" data-id="' + x.l.id + '">' +
        thumbHtml(x.o) +
        '<div class="info"><b>' + esc(x.o.model) + '</b>' +
        '<span>' + esc(lineSub(x.l)) + ' · kalan <b>' + nf0(x.i.kalan) + '</b> çift · ' + nf1(x.i.kalanKoli) + ' koli</span></div>' +
        '<span class="add">' + (inCart[x.l.id] ? ICONS.check : '+') + '</span>' +
        '</div>';
    }).join('');
  }

  function cartTotals() {
    var t = { koli: 0, cift: 0, tutar: 0 };
    S.ui.cart.forEach(function (c) {
      var l = findLine(c.lineId);
      if (!l) return;
      var o = findOrder(c.orderId) || findOrder(l.orderId);
      var cift = Core.num(c.cift);
      var per = linePerBox(l) || 1;
      t.cift += cift;
      t.koli += Core.num(c.koli) || cift / per;
      t.tutar += cift * Core.num(c.fiyat !== undefined && c.fiyat !== '' ? c.fiyat : (o ? o.fiyat : 0));
    });
    t.koli = Math.round(t.koli * 1000) / 1000;
    t.tutar = Core.round2(t.tutar);
    return t;
  }

  function cartHtml() {
    if (!S.ui.cart.length) {
      return emptyState('truck', 'Henüz sevk satırı yok', 'Soldaki listeden renk/beden satırı seçerek sevk fişine ekleyin.', '');
    }
    var rows = S.ui.cart.map(function (c) {
      var l = findLine(c.lineId);
      if (!l) return '';
      var o = findOrder(c.orderId) || findOrder(l.orderId);
      if (!o) return '';
      var info = Core.lineInfo(data, l);
      var per = linePerBox(l) || 1;
      var cift = Core.num(c.cift);
      var koli = Core.num(c.koli) || cift / per;
      var fiyat = Core.num(c.fiyat !== undefined && c.fiyat !== '' ? c.fiyat : o.fiyat);
      var hatali = cift > info.kalan + 0.001 || cift <= 0;
      return '<tr data-line="' + l.id + '"' + (hatali ? ' style="background:#fff5f5"' : '') + '>' +
        '<td><div class="cell-model">' + thumbHtml(o) + '<div style="min-width:0"><div class="mname">' + esc(o.model) + '</div>' +
        '<div class="mcolor">' + esc(lineSub(l)) + '</div></div></div></td>' +
        '<td class="right sub">' + nf0(info.kalan) + '</td>' +
        '<td class="right"><input class="input sm num" type="text" inputmode="decimal" data-cart="koli" data-id="' + l.id + '" value="' + esc(nf1(koli).replace('.', ',')) + '"></td>' +
        '<td class="right"><input class="input sm num" type="text" inputmode="decimal" data-cart="cift" data-id="' + l.id + '" value="' + esc(nf0(cift)) + '"></td>' +
        '<td class="right"><input class="input sm num" type="text" inputmode="decimal" data-cart="fiyat" data-id="' + l.id + '" value="' + esc(nf2(fiyat).replace('.', ',')) + '"></td>' +
        '<td class="right strong" data-line-tutar="' + l.id + '">' + money(cift * fiyat) + '</td>' +
        '<td class="right"><button class="btn btn-icon danger" data-act="cart-remove" data-id="' + l.id + '" title="Kaldır" aria-label="Kaldır">' + ICONS.x + '</button></td>' +
        '</tr>' +
        (hatali ? '<tr data-line-error="' + l.id + '"><td colspan="7" style="padding-top:0;color:var(--danger);font-size:11.5px;border-bottom:1px solid #eef2f6">' +
          (cift <= 0 ? 'Çift adedi sıfırdan büyük olmalı.' : 'Kalandan fazla: en fazla ' + nf0(info.kalan) + ' çift sevk edilebilir.') + '</td></tr>' : '');
    }).join('');

    var t = cartTotals();
    return '<div class="table-wrap" style="max-height:none"><table class="data line-table"><thead><tr>' +
      '<th>Model</th><th class="right">Kalan</th><th class="right">Koli</th><th class="right">Çift</th><th class="right">Fiyat</th><th class="right">Tutar</th><th></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="ship-summary">' +
      '<div><span>Koli</span><b>' + nf1(t.koli) + '</b></div>' +
      '<div><span>Çift</span><b>' + nf0(t.cift) + '</b></div>' +
      '<div><span>Tutar</span><b>' + money(t.tutar) + '</b></div>' +
      '<button class="btn btn-primary" data-act="ship-create">' + ICONS.check + ' Sevk fişini oluştur</button>' +
      '</div>';
  }

  function viewShip() {
    normalizeCart();
    if (!S.ui.shipFisNo) S.ui.shipFisNo = Core.nextFisNo(data);
    if (!S.ui.shipTarih) S.ui.shipTarih = Core.todayISO();
    var scid = shipCariId();
    S.ui.shipCariId = scid;
    var scari = Core.cariById(data, scid);
    var cariKilit = !!S.ui.cariId;
    return '<div class="ship-layout">' +
      '<div class="card">' +
      '  <div class="card-head"><div><h2>Sipariş seç</h2><div class="sub">' + esc(scari ? scari.ad : '') + ' · kalanı olan siparişler</div></div>' +
      '    <button class="btn btn-icon" data-act="cart-clear" title="Sepeti temizle" aria-label="Sepeti temizle">' + ICONS.refresh + '</button></div>' +
      '  <div class="toolbar" style="padding:10px 12px">' +
      '    <div class="search" style="flex:1">' + ICONS.search + '<input class="input" placeholder="Model ara…" data-role="ship-search" value="' + esc(S.ui.shipSearch) + '"></div>' +
      '  </div>' +
      '  <div class="pick-list" id="pickList">' + pickListHtml() + '</div>' +
      '</div>' +
      '<div>' +
      '  <div class="card">' +
      '    <div class="card-head"><div><h2>Sevk bilgileri</h2><div class="sub">' + esc(data.settings.firmaAdi) + '</div></div></div>' +
      '    <div class="card-body"><div class="form-grid g4">' +
      '      <div class="field span2"><label for="shipCari">Cari hesap</label>' +
      '        <select id="shipCari" class="select" data-role="ship-cari"' + (cariKilit ? ' disabled' : '') + '>' + cariOptions(scid, false) + '</select></div>' +
      '      <div class="field"><label for="shipTarih">Tarih</label><input id="shipTarih" type="date" class="input" value="' + esc(S.ui.shipTarih) + '"></div>' +
      '      <div class="field"><label for="shipFisNo">Fiş no</label><input id="shipFisNo" type="number" class="input num" min="1" value="' + esc(S.ui.shipFisNo) + '"></div>' +
      '      <div class="field span2"><label for="shipFaturaNo">Fatura no <span class="hint">(isteğe bağlı)</span></label><input id="shipFaturaNo" class="input" value="' + esc(S.ui.shipFaturaNo) + '"></div>' +
      '      <div class="field span2"><label for="shipFaturaTarih">Fatura tarihi</label><input id="shipFaturaTarih" type="date" class="input" value="' + esc(S.ui.shipFaturaTarih) + '"></div>' +
      '      <div class="field span4"><label for="shipAciklama">Açıklama <span class="hint">(isteğe bağlı)</span></label><input id="shipAciklama" class="input" placeholder="Örn. kargo / plaka / not" value="' + esc(S.ui.shipAciklama) + '"></div>' +
      '    </div></div>' +
      '  </div>' +
      '  <div class="card">' +
      '    <div class="card-head"><div><h2>Sevk edilecekler</h2><div class="sub" id="cartCount">' + S.ui.cart.length + ' satır</div></div>' +
      '      <button class="btn btn-sm" data-act="cart-fill" title="Bu cariye ait kalan siparişlerin tamamını sepete ekle">' + ICONS.plus + ' Tüm kalanları ekle</button></div>' +
      '    <div id="cartArea">' + cartHtml() + '</div>' +
      '  </div>' +
      '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------ */
  /* Cari hesap                                                          */
  /* ------------------------------------------------------------------ */
  function filteredLedger() {
    var q = S.ui.ledgerSearch.toLocaleLowerCase('tr-TR').trim();
    var rows = Core.ledgerWithBalance(data, S.ui.cariId);
    if (S.ui.ledgerType !== 'all') rows = rows.filter(function (r) { return r.islem === S.ui.ledgerType; });
    if (S.ui.ledgerFrom) rows = rows.filter(function (r) { return r.tarih >= S.ui.ledgerFrom; });
    if (S.ui.ledgerTo) rows = rows.filter(function (r) { return r.tarih <= S.ui.ledgerTo; });
    if (q) {
      rows = rows.filter(function (r) {
        return [r.aciklama, r.fisNo, r.sipno, r.kod, r.grup, r.islem, r.renk, cariAdi(r.cariId)].join(' ').toLocaleLowerCase('tr-TR').indexOf(q) >= 0;
      });
    }
    return rows;
  }

  function ledgerTableHtml() {
    var rows = filteredLedger().reverse();
    var page = Math.min(S.ui.ledgerPage, Math.max(1, Math.ceil(rows.length / PAGE_SIZE)));
    var slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (!rows.length) {
      return emptyState('wallet', 'Hareket bulunamadı', 'Sevk fişi oluşturun veya tahsilat ekleyin.',
        '<button class="btn btn-primary" data-act="ledger-new">' + ICONS.plus + ' Hareket ekle</button>');
    }

    var showCari = !S.ui.cariId;
    var body = slice.map(function (r) {
      var borc = Core.num(r.borc), alacak = Core.num(r.alacak);
      var balStyle = r.bakiye < 0 ? 'color:var(--alacak)' : '';
      return '<tr>' +
        '<td class="nowrap">' + dateTR(r.tarih) + '</td>' +
        '<td class="num nowrap">' + esc(r.fisNo || '—') + '</td>' +
        (showCari ? '<td class="sub nowrap">' + esc(cariAdi(r.cariId)) + '</td>' : '') +
        '<td>' + islemPill(r.islem) + '</td>' +
        '<td><div class="strong">' + esc(r.aciklama) + '</div>' +
        (r.renk || r.kod ? '<div class="sub">' + esc([r.renk, r.kod].filter(Boolean).join(' · ')) + '</div>' : '') + '</td>' +
        '<td class="right">' + (Core.num(r.koli) ? nf1(r.koli) : '—') + '</td>' +
        '<td class="right">' + (Core.num(r.cift) ? nf0(r.cift) : '—') + '</td>' +
        '<td class="right" style="color:var(--borc)">' + (borc ? nf2(borc) : '') + '</td>' +
        '<td class="right" style="color:var(--alacak)">' + (alacak ? nf2(alacak) : '') + '</td>' +
        '<td class="right strong" style="' + balStyle + '">' + nf2(r.bakiye) + '</td>' +
        '<td><div class="row-actions">' +
        (r.sevkId
          ? '<button class="btn btn-icon" data-act="ship-view" data-id="' + r.sevkId + '" title="Sevk fişini gör" aria-label="Sevk fişini gör">' + ICONS.receipt + '</button>'
          : '<button class="btn btn-icon" data-act="ledger-edit" data-id="' + r.id + '" title="Düzenle" aria-label="Düzenle">' + ICONS.edit + '</button>' +
          '<button class="btn btn-icon danger" data-act="ledger-del" data-id="' + r.id + '" title="Sil" aria-label="Sil">' + ICONS.trash + '</button>') +
        '</div></td></tr>';
    }).join('');

    var borcT = rows.reduce(function (a, r) { return a + Core.num(r.borc); }, 0);
    var alacakT = rows.reduce(function (a, r) { return a + Core.num(r.alacak); }, 0);

    return '<div class="table-wrap"><table class="data"><thead><tr>' +
      '<th>Tarih</th><th>Fiş</th>' + (showCari ? '<th>Cari</th>' : '') + '<th>İşlem</th><th>Açıklama</th><th class="right">Koli</th><th class="right">Çift</th>' +
      '<th class="right">Borç</th><th class="right">Alacak</th><th class="right">' + (showCari ? 'Cari bakiye' : 'Bakiye') + '</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody>' +
      '<tfoot><tr><td colspan="' + (showCari ? 7 : 6) + '">Filtre toplamı</td>' +
      '<td class="right" style="color:var(--borc)">' + nf2(borcT) + '</td>' +
      '<td class="right" style="color:var(--alacak)">' + nf2(alacakT) + '</td>' +
      '<td class="right">' + nf2(borcT - alacakT) + '</td><td></td></tr></tfoot></table></div>' +
      pager(rows.length, page, PAGE_SIZE, 'ledger');
  }

  function viewLedger() {
    var st = Core.stats(data, S.ui.cariId);
    var types = [['all', 'Tümü'], ['SATIŞ', 'Satış'], ['TAHSİLAT', 'Tahsilat'], ['ALIŞ', 'Alış'], ['GELİR', 'Gelir'], ['DEVRİ', 'Devir']];
    var kaynak = data.ledger.filter(function (r) { return !S.ui.cariId || r.cariId === S.ui.cariId; });
    var toplamBorc = kaynak.reduce(function (a, r) { return a + Core.num(r.borc); }, 0);
    var toplamAlacak = kaynak.reduce(function (a, r) { return a + Core.num(r.alacak); }, 0);

    return '<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))">' +
      '<div class="kpi danger"><div class="kpi-label">Toplam borç</div><div class="kpi-value" style="color:var(--borc)">' + nf2(toplamBorc) + '<small>' + (data.settings.para || '₺') + '</small></div><div class="kpi-foot">' + kaynak.filter(function (r) { return Core.num(r.borc) > 0; }).length + ' hareket</div></div>' +
      '<div class="kpi"><div class="kpi-label">Toplam alacak</div><div class="kpi-value" style="color:var(--alacak)">' + nf2(toplamAlacak) + '<small>' + (data.settings.para || '₺') + '</small></div><div class="kpi-foot">' + kaynak.filter(function (r) { return Core.num(r.alacak) > 0; }).length + ' hareket</div></div>' +
      '<div class="kpi ' + (st.balance < 0 ? 'info' : 'warn') + '"><div class="kpi-label">Güncel bakiye</div><div class="kpi-value">' + nf2(st.balance) + '<small>' + (data.settings.para || '₺') + '</small></div>' +
      '<div class="kpi-foot">' + (st.balance >= 0 ? 'Müşteri borcu' : 'Müşteri alacağı') + '</div></div>' +
      '</div>' +
      '<div class="card"><div class="toolbar">' +
      '<div class="search grow">' + ICONS.search + '<input class="input" placeholder="Açıklama, fiş no veya model ara…" data-role="ledger-search" value="' + esc(S.ui.ledgerSearch) + '"></div>' +
      '<div class="seg">' + types.map(function (t) {
        return '<button data-ledger-type="' + t[0] + '" class="' + (S.ui.ledgerType === t[0] ? 'active' : '') + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      '<input type="date" class="input" style="width:140px" data-role="ledger-from" value="' + esc(S.ui.ledgerFrom) + '" title="Başlangıç tarihi">' +
      '<input type="date" class="input" style="width:140px" data-role="ledger-to" value="' + esc(S.ui.ledgerTo) + '" title="Bitiş tarihi">' +
      '</div><div id="ledgerTable">' + ledgerTableHtml() + '</div></div>';
  }

function viewShipments() {
    var q = (S.ui.shipListSearch || '').toLocaleLowerCase('tr-TR').trim();
    var list = data.shipments.filter(function (s) { return !S.ui.cariId || s.cariId === S.ui.cariId; })
      .sort(function (a, b) { return Core.num(b.fisNo) - Core.num(a.fisNo); });
    if (q) {
      list = list.filter(function (s) {
        var models = Core.shipmentLines(data, s.id).map(function (l) { return l.model; }).join(' ');
        return [s.fisNo, s.aciklama, s.tarih, models, cariAdi(s.cariId)].join(' ').toLocaleLowerCase('tr-TR').indexOf(q) >= 0;
      });
    }

    var page = Math.min(S.ui.shipListPage || 1, Math.max(1, Math.ceil(list.length / PAGE_SIZE)));
    var pageRows = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    var showCari = !S.ui.cariId;
    var body = pageRows.length ? pageRows.map(function (s) {
      return '<tr>' +
        '<td class="strong num">#' + esc(s.fisNo) + '</td>' +
        '<td class="nowrap">' + dateTR(s.tarih) + '</td>' +
        '<td class="nowrap">' + (s.faturaNo ? '<div class="strong">' + esc(s.faturaNo) + '</div>' : '<span class="muted">—</span>') + (s.faturaTarih ? '<div class="sub">' + dateTR(s.faturaTarih) + '</div>' : '') + '</td>' +
        (showCari ? '<td class="sub nowrap">' + esc(cariAdi(s.cariId)) + '</td>' : '') +
        '<td>' + esc(cariAdi(s.cariId)) + (s.aciklama ? '<div class="sub">' + esc(s.aciklama) + '</div>' : '') + '</td>' +
        '<td class="right">' + nf1(s.koli) + '</td>' +
        '<td class="right strong">' + nf0(s.cift) + '</td>' +
        '<td class="right strong">' + money(s.tutar) + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="btn btn-icon" data-act="ship-view" data-id="' + s.id + '" title="Görüntüle" aria-label="Görüntüle">' + ICONS.eye + '</button>' +
        '<button class="btn btn-icon" data-act="ship-invoice" data-id="' + s.id + '" title="Fatura bilgisi" aria-label="Fatura bilgisi">' + ICONS.edit + '</button>' +
        '<button class="btn btn-icon" data-act="ship-print" data-id="' + s.id + '" title="Yazdır" aria-label="Yazdır">' + ICONS.print + '</button>' +
        '<button class="btn btn-icon danger" data-act="ship-del" data-id="' + s.id + '" title="Sil" aria-label="Sil">' + ICONS.trash + '</button>' +
        '</div></td></tr>';
    }).join('') : '<tr><td colspan="' + (showCari ? 9 : 8) + '">' + emptyState('receipt', 'Sevk fişi yok', 'Sevk İşlemi ekranından ilk fişi oluşturun.',
      '<button class="btn btn-primary" data-act="go-ship">' + ICONS.truck + ' Sevk işlemine git</button>') + '</td></tr>';

    return '<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))">' +
      '<div class="kpi"><div class="kpi-label">Sevk fişi</div><div class="kpi-value">' + nf0(list.length) + '</div><div class="kpi-foot">Listelenen fiş sayısı</div></div>' +
      '<div class="kpi info"><div class="kpi-label">Toplam çift</div><div class="kpi-value">' + nf0(list.reduce(function (a, s) { return a + Core.num(s.cift); }, 0)) + '</div><div class="kpi-foot">' + nf1(list.reduce(function (a, s) { return a + Core.num(s.koli); }, 0)) + ' koli</div></div>' +
      '<div class="kpi warn"><div class="kpi-label">Toplam tutar</div><div class="kpi-value">' + nf0(list.reduce(function (a, s) { return a + Core.num(s.tutar); }, 0)) + '<small>' + (data.settings.para || '₺') + '</small></div><div class="kpi-foot">Cari hesaba işlenen</div></div>' +
      '</div>' +
      '<div class="card">' +
      '<div class="toolbar"><div class="search grow">' + ICONS.search +
      '<input class="input" placeholder="Fiş no veya model ara…" data-role="ship-list-search" value="' + esc(S.ui.shipListSearch || '') + '"></div>' +
      '<span class="muted small">' + nf0(list.length) + ' fiş</span></div>' +
      '<div class="table-wrap"><table class="data"><thead><tr>' +
      '<th>Fiş no</th><th>Tarih</th><th>Fatura</th>' + (showCari ? '<th>Cari</th>' : '') + '<th>Cari / açıklama</th><th class="right">Koli</th><th class="right">Çift</th><th class="right">Tutar</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      pager(list.length, page, PAGE_SIZE, 'shipments') + '</div>';
  }

  /* ------------------------------------------------------------------ */
  /* Cariler                                                             */
  /* ------------------------------------------------------------------ */
  function viewCariler() {
    var toplamBakiye = Core.balance(data);
    var acikToplam = 0;
    var satirlar = data.cariler.map(function (c) {
      var st = Core.stats(data, c.id);
      acikToplam += st.openOrders;
      return { c: c, st: st };
    }).sort(function (a, b) { return b.st.balance - a.st.balance; });

    var body = satirlar.map(function (x) {
      var c = x.c, st = x.st;
      var secili = S.ui.cariId === c.id;
      return '<tr' + (secili ? ' style="background:var(--brand-soft)"' : '') + '>' +
        '<td><div class="strong">' + esc(c.ad) + '</div><div class="sub">' + esc(c.kod || '') + (c.aktif === false ? ' · <span class="pill muted">Pasif</span>' : '') + '</div></td>' +
        '<td><div class="sub">' + esc(c.tel || '—') + '</div><div class="sub">' + esc(c.adres || '') + '</div></td>' +
        '<td class="right">' + nf0(st.openOrders) + '</td>' +
        '<td class="right">' + nf0(st.remainingCift) + '</td>' +
        '<td class="right strong" style="color:' + (st.balance < 0 ? 'var(--alacak)' : 'var(--borc)') + '">' + nf2(st.balance) + ' ' + (data.settings.para || '₺') + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="btn btn-sm" data-act="pick-cari" data-id="' + c.id + '">' + (secili ? 'Seçili' : 'Seç') + '</button>' +
        '<button class="btn btn-icon" data-act="cari-edit" data-id="' + c.id + '" title="Düzenle" aria-label="Düzenle">' + ICONS.edit + '</button>' +
        '<button class="btn btn-icon danger" data-act="cari-del" data-id="' + c.id + '" title="Sil" aria-label="Sil">' + ICONS.trash + '</button>' +
        '</div></td></tr>';
    }).join('');

    return '<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))">' +
      '<div class="kpi"><div class="kpi-label">Cari hesap</div><div class="kpi-value">' + nf0(data.cariler.length) + '</div><div class="kpi-foot">' + nf0(acikToplam) + ' açık sipariş</div></div>' +
      '<div class="kpi ' + (toplamBakiye < 0 ? 'info' : 'danger') + '"><div class="kpi-label">Toplam bakiye</div><div class="kpi-value" style="color:' + (toplamBakiye < 0 ? 'var(--alacak)' : 'var(--borc)') + '">' + nf2(toplamBakiye) + '<small>' + (data.settings.para || '₺') + '</small></div><div class="kpi-foot">Tüm cariler</div></div>' +
      '<div class="kpi warn"><div class="kpi-label">Seçili cari</div><div class="kpi-value" style="font-size:19px">' + esc(activeCari() ? activeCari().ad : 'Tüm cariler') + '</div><div class="kpi-foot">Listeden seçerek filtreleyin</div></div>' +
      '</div>' +
      '<div class="card"><div class="table-wrap"><table class="data"><thead><tr>' +
      '<th>Cari</th><th>İletişim</th><th class="right">Açık sipariş</th><th class="right">Kalan çift</th><th class="right">Bakiye</th><th></th>' +
      '</tr></thead><tbody>' + (body || '<tr><td colspan="6">' + emptyState('users', 'Cari yok', 'Yeni cari ekleyin.', '') + '</td></tr>') + '</tbody></table></div></div>';
  }

  /* ------------------------------------------------------------------ */
  /* Raporlar                                                            */
  /* ------------------------------------------------------------------ */
  function viewReports() {
    var ay = S.ui.reportMonth;
    var cid = S.ui.cariId;
    var cari = activeCari();
    var rows = data.ledger.filter(function (r) {
      return (r.tarih || '').slice(0, 7) === ay && (!cid || r.cariId === cid);
    });
    var sevk = rows.filter(function (r) { return r.islem === 'SATIŞ'; });
    var tahsilat = rows.filter(function (r) { return r.islem === 'TAHSİLAT'; });
    var sevkAdet = sevk.reduce(function (a, r) { return a + Core.num(r.cift); }, 0);
    var sevkTutar = sevk.reduce(function (a, r) { return a + Core.num(r.tutar); }, 0);
    var tahsilatTutar = tahsilat.reduce(function (a, r) { return a + Core.num(r.tutar); }, 0);

    var groupKey = cid ? 'model' : 'cari';
    var groups = {};
    sevk.forEach(function (r) {
      var k = cid ? r.aciklama : String(r.cariId);
      groups[k] = groups[k] || { label: cid ? k : cariAdi(r.cariId), koli: 0, cift: 0, tutar: 0 };
      groups[k].cift += Core.num(r.cift);
      groups[k].tutar += Core.num(r.tutar);
      groups[k].koli += Core.num(r.koli);
    });
    var groupRows = Object.keys(groups).map(function (k) { return groups[k]; }).sort(function (a, b) { return b.tutar - a.tutar; });
    var groupTable = groupRows.length ? groupRows.map(function (m) {
      return '<tr><td class="strong">' + esc(m.label) + '</td><td class="right">' + nf1(m.koli) + '</td>' +
        '<td class="right">' + nf0(m.cift) + '</td><td class="right strong">' + money(m.tutar) + '</td></tr>';
    }).join('') : '<tr><td colspan="4">' + emptyState('chart', 'Bu ay sevkiyat yok', 'Seçtiğiniz ayda oluşturulmuş sevk fişi bulunmuyor.', '') + '</td></tr>';

    var shipped = Core.shippedMap(data);
    var kalanList = data.orders.map(function (o) { return { o: o, i: Core.orderInfo(data, o, shipped) }; })
      .filter(function (x) { return (!cid || x.o.cariId === cid) && x.i.kalan > 0; })
      .sort(function (a, b) { return b.i.kalan - a.i.kalan; });

    var kalanTable = kalanList.length ? kalanList.slice(0, 10).map(function (x) {
      return '<tr><td><div class="strong">' + esc(x.o.model) + '</div><div class="sub">' +
        esc(cid ? (x.o.renk || '') : cariAdi(x.o.cariId)) + ' · #' + esc(x.o.sipno) + '</div></td>' +
        '<td class="right">' + nf0(x.i.giden) + '</td>' +
        '<td class="right strong">' + nf0(x.i.kalan) + '</td><td class="right">' + money(x.i.kalanTutar) + '</td></tr>';
    }).join('') : '<tr><td colspan="4">' + emptyState('check', 'Bekleyen yok', 'Tüm siparişler sevk edilmiş.', '') + '</td></tr>';

    var kar = Core.profitReport(data, '', '', cid);
    var karRows = kar.slice().reverse().slice(0, 6);
    var karCard =
      '<div class="card" style="margin-top:16px"><div class="card-head"><div><h2>Kârlılık</h2>' +
      '<div class="sub">Sevk edilen satırlar · maliyet, model kartlarından</div></div>' +
      '<button class="btn btn-sm" data-act="go-models">' + ICONS.tag + ' Model kartları</button></div>' +
      (karRows.length
        ? '<div class="table-wrap"><table class="data"><thead><tr><th>Dönem</th><th class="right">Ciro</th><th class="right">Maliyet</th><th class="right">Kâr</th><th class="right">Marj</th><th class="right">Maliyetsiz satır</th></tr></thead><tbody>' +
        karRows.map(function (r) {
          return '<tr><td class="strong">' + monthName(r.ay) + '</td>' +
            '<td class="right">' + nf2(r.ciro) + '</td>' +
            '<td class="right">' + nf2(r.maliyet) + '</td>' +
            '<td class="right strong" style="color:' + (r.kar < 0 ? 'var(--alacak)' : 'var(--borc)') + '">' + nf2(r.kar) + '</td>' +
            '<td class="right">' + nf1(r.marj) + '%</td>' +
            '<td class="right sub">' + (r.maliyetsiz || '—') + '</td></tr>';
        }).join('') +
        '</tbody></table></div>'
        : '<div class="card-body"><p class="muted small" style="margin:0">Henüz sevk edilmiş satır yok. Sevk yaptıkça ciro ve kâr burada görünür.</p></div>') +
      '<p class="muted small" style="padding:10px 16px 12px;margin:0">Maliyeti girilmemiş modeller kâr hesabında 0 maliyetle görünür; doğru sonuç için <b>Modeller</b> ekranından maliyet girin.</p></div>';

    var beden = Core.sizeReport(data, ay, cid);
    var bedenCard = '<div class="card" style="margin-top:16px"><div class="card-head"><div><h2>Beden dökümü</h2>' +
      '<div class="sub">Sevk edilen · ' + monthName(ay) + (cid ? ' · ' + esc(cari.ad) : '') + '</div></div></div>' +
      (beden.rows.length
        ? '<div class="table-wrap"><table class="data"><thead><tr><th>Model / renk</th>' +
          beden.sizes.map(function (sz) { return '<th class="right">' + sz + '</th>'; }).join('') +
          '<th class="right">Toplam</th></tr></thead><tbody>' +
          beden.rows.map(function (r) {
            return '<tr><td><div class="strong">' + esc(r.model) + '</div><div class="sub">' + esc(r.renk || '—') + '</div></td>' +
              beden.sizes.map(function (sz) { return '<td class="right">' + (Core.num(r.map[sz]) ? nf0(r.map[sz]) : '—') + '</td>'; }).join('') +
              '<td class="right strong">' + nf0(r.toplam) + '</td></tr>';
          }).join('') +
          '</tbody><tfoot><tr><td>TOPLAM</td>' + beden.sizes.map(function (sz) { return '<td class="right">' + nf0(beden.totals[sz] || 0) + '</td>'; }).join('') +
          '<td class="right">' + nf0(beden.toplam) + '</td></tr></tfoot></table></div>'
        : '<div class="card-body"><p class="muted small" style="margin:0">Bu dönemde beden dökümü olan sevk yok. Renk/beden satırıyla sevk yapıldığında burada görünür.</p></div>') +
      '</div>';

    return '<div class="card"><div class="toolbar">' +
      '<div class="field" style="max-width:190px"><label for="reportMonth">Dönem</label>' +
      '<input id="reportMonth" type="month" class="input" data-role="report-month" value="' + esc(ay) + '"></div>' +
      '<div style="flex:1"></div>' +
      '<button class="btn" data-act="print-report">' + ICONS.print + ' Raporu yazdır</button>' +
      '</div>' +
      '<div class="card-body"><div class="kpis" style="margin:0">' +
      '<div class="kpi"><div class="kpi-label">Sevk edilen çift</div><div class="kpi-value">' + nf0(sevkAdet) + '</div><div class="kpi-foot">' + sevk.length + ' fiş satırı</div></div>' +
      '<div class="kpi info"><div class="kpi-label">Sevk tutarı</div><div class="kpi-value">' + nf0(sevkTutar) + '<small>' + (data.settings.para || '₺') + '</small></div><div class="kpi-foot">' + monthName(ay) + (cid ? ' · ' + esc(cari.ad) : '') + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">Tahsilat</div><div class="kpi-value" style="color:var(--alacak)">' + nf0(tahsilatTutar) + '<small>' + (data.settings.para || '₺') + '</small></div><div class="kpi-foot">' + tahsilat.length + ' tahsilat kaydı</div></div>' +
      '<div class="kpi warn"><div class="kpi-label">Bekleyen sipariş</div><div class="kpi-value">' + nf0(kalanList.length) + '</div><div class="kpi-foot">' + nf0(kalanList.reduce(function (a, x) { return a + x.i.kalan; }, 0)) + ' çift</div></div>' +
      '</div></div></div>' +
      '<div class="grid-2 even" style="margin-top:16px">' +
      '<div class="card"><div class="card-head"><div><h2>' + (groupKey === 'model' ? 'Model bazlı sevkiyat' : 'Cari bazlı sevkiyat') + '</h2><div class="sub">' + monthName(ay) + ' · ' + (cid ? esc(cari.ad) : 'tüm cariler') + '</div></div></div>' +
      '<div class="table-wrap"><table class="data"><thead><tr><th>' + (groupKey === 'model' ? 'Model' : 'Cari') + '</th><th class="right">Koli</th><th class="right">Çift</th><th class="right">Tutar</th></tr></thead><tbody>' + groupTable + '</tbody></table></div></div>' +
      '<div class="card"><div class="card-head"><div><h2>Bekleyen siparişler</h2><div class="sub">Kalan çifte göre ilk 10</div></div></div>' +
      '<div class="table-wrap"><table class="data"><thead><tr><th>Model</th><th class="right">Giden</th><th class="right">Kalan</th><th class="right">Tutar</th></tr></thead><tbody>' + kalanTable + '</tbody></table></div></div>' +
      '</div>' + karCard + bedenCard;
  }

  /* ------------------------------------------------------------------ */
  /* Sürüm                                                               */
  /* ------------------------------------------------------------------ */
  var SURUM = '2.2.0';

  var YENILIKLER = [
    {
      v: '2.2.0', t: '31.10.2026', m: [
        'Model kartında “Yeni renk” kısayolu: modelden ayrılmadan renk tanımlama',
        'Yeni renk kaydedilince model formunda otomatik seçilir ve matrise eklenir',
        'İç içe pencerelerde Escape yalnızca üstteki pencereyi kapatır'
      ]
    },
    {
      v: '2.1.1', t: '31.10.2026', m: [
        'Siparişte renk artık model kartındaki tanımlı renklerden seçilir; elle yazılamaz',
        'Model değişince renk listesi güncellenir; geçersiz renk ilk tanımlı renge çekilir',
        'Model seçilince satır otomatik Asortili/Açık moda geçer'
      ]
    },
    {
      v: '2.1.0', t: '31.10.2026', m: [
        'Renkler artık ayrı tabloda; model kartında çoklu renk seçimi',
        'Asorti şablonları Ayarlar’da tanımlanır; modele atanır',
        'Model kartında renk × beden matrisi önizlemesi',
        'Excelde RENKLER, ASORTİ ŞABLONLARI ve MODEL RENKLERİ sayfaları',
        'Eski kartlar otomatik renk/şablon kayıtlarına taşınır'
      ]
    },
    {
      v: '2.0.1', t: '31.10.2026', m: [
        'Modeller sayfasında Düzenle, Sil ve Resim butonları düzeltildi',
        'Model kartı yardımcı fonksiyonları geri eklendi (modelById, showModelImage, removeModel)'
      ]
    },
    {
      v: '2.0.0', t: '31.10.2026', m: [
        'Renk–beden–asorti matrisi: model kartında kategori, renkler ve asorti şablonu',
        'Siparişte renk/beden satırları; asortili veya açık; çok renkli sipariş',
        'Satır bazlı sevk, kısmi sevk ve satır kalanı kontrolü',
        'Fişte yalnızca sevk edilen bedenler; boş beden yok; “Açık · 9’lu”',
        'Beden dökümü raporu; A4/A5 fiş',
        'Eski dosyalar ESKI satırına taşınır; bakiye ve sevkler korunur'
      ]
    },
    {
      v: '1.8.0', t: '30.10.2026', m: [
        'Proje adı DMR AYAKKABI olarak güncellendi',
        'Uygulama dosyası DMR_SEVK.html, veri dosyası DMR_VERI.xlsx',
        'Varsayılan marka DMR / AYAKKABI; ilk cari YENİ CARİ',
        'Eski dosyalardaki marka ayarı açılışta DMR markasına taşınır'
      ]
    },
    {
      v: '1.7.0', t: '30.10.2026', m: [
        'Model kartlarına resim ve asorti alanı',
        'Siparişte model seçilince asorti otomatik dolar',
        'Model resimleri Excelde ayrı gizli sayfada saklanır',
        'Model listesinde fotoğraf ve asorti kolonları'
      ]
    },
    {
      v: '1.6.0', t: '30.10.2026', m: [
        'Model kartları: fiyat, maliyet, barkod, sezon ve model özeti',
        'Kârlılık raporu (ciro, maliyet, kâr, marj)',
        'Sevk fişine fatura no ve fatura tarihi',
        'Siparişi kopyala, toplu sevk, Ctrl+K hızlı arama',
        'Sipariş formunda Enter ile ilerleme, “Kaydet ve yeni”',
        'Çöp kutusu (30 gün) ve işlem günlüğü',
        'Günlük otomatik yedek (son 7 gün) ve tek tıkla geri yükleme',
        'Dosya sağlık kontrolü'
      ]
    },
    {
      v: '1.5.0', t: '29.10.2026', m: [
        'Marka adı, alt başlık, kısa işaret ve logo ayarları',
        'Mevcut veritabanına cari aktarma; “Database” dosya adı',
        'Yeni giriş ekranı ve “Beni hatırla”'
      ]
    },
    {
      v: '1.4.0', t: '29.10.2026', m: [
        'Kullanıcı hesapları, roller ve oturum kilidi',
        'A5 sevk fişi',
        'Resim yolu kolonu kaldırıldı'
      ]
    },
    { v: '1.3.0', t: '28.10.2026', m: ['Çoklu cari hesap, global fiş numarası', 'Cari bazlı ekstre'] },
    { v: '1.2.0', t: '27.10.2026', m: ['Tek HTML dosya, Excel veritabanı', 'Sipariş, sevk, cari hesap ve raporlar'] }
  ];

  function log(islem, detay) {
    try {
      var kim = S.user ? (S.user.ad || S.user.kullanici) : '';
      Core.audit(data, kim, islem, detay);
    } catch (e) { }
  }

  /* ------------------------------------------------------------------ */
  /* Yedekler (tarayıcı içi, son 7 gün)                                  */
  /* ------------------------------------------------------------------ */
  var BACKUP_MAX = 7;

  function backupDates() {
    return withTimeout(idbGet('backup:list'), 900, []).then(function (list) {
      return Array.isArray(list) ? list.slice().sort().reverse() : [];
    });
  }

  function backupSnapshot(bytes, force) {
    if (!bytes) return Promise.resolve(false);
    var today = Core.todayISO();
    return backupDates().then(function (list) {
      if (!force && list.indexOf(today) !== -1) return false;
      var buf = bytes.buffer ? bytes.buffer.slice(bytes.byteOffset || 0, (bytes.byteOffset || 0) + bytes.byteLength) : bytes;
      var rec = { date: today, at: new Date().toISOString(), size: buf.byteLength || 0, name: S.file.name || '', bytes: buf };
      return withTimeout(idbSet('backup:' + today, rec), 2500, null).then(function () {
        var yeni = list.filter(function (d) { return d !== today; });
        yeni.unshift(today);
        yeni.sort();
        yeni.reverse();
        var atilan = yeni.slice(BACKUP_MAX);
        yeni = yeni.slice(0, BACKUP_MAX);
        atilan.forEach(function (d) { idbSet('backup:' + d, null); });
        return withTimeout(idbSet('backup:list', yeni), 1500, null).then(function () { return true; });
      });
    }).catch(function () { return false; });
  }

  function boyutYazi(n) {
    n = Number(n) || 0;
    if (n > 1048576) return (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
    return Math.max(1, Math.round(n / 1024)) + ' KB';
  }

  function openBackups() {
    var m = openModal({
      title: 'Otomatik yedekler',
      subtitle: 'Son ' + BACKUP_MAX + ' gün · tarayıcıda saklanır',
      body: '<div id="backupList"><div class="muted small">Yükleniyor…</div></div>' +
        '<p class="muted small" style="margin:14px 0 0">Yedek, her günün ilk kaydında otomatik alınır. Dosyanızı ayrıca OneDrive/Drive klasöründe tutmak sürüm geçmişi de sağlar.</p>',
      footer: '<button class="btn" data-modal-close>Kapat</button>' +
        '<button class="btn btn-primary" id="backupSnap">' + ICONS.shield + ' Şimdi yedekle</button>'
    });
    var box = $('#backupList', m.el);

    function render() {
      backupDates().then(function (list) {
        if (!list.length) {
          box.innerHTML = '<div class="muted small">Henüz yedek yok. İlk kayıtta otomatik oluşturulur.</div>';
          return;
        }
        box.innerHTML = list.map(function (d) {
          return '<div class="backup-row">' +
            '<div class="br-main"><b>' + dateTR(d) + '</b><span id="bsize-' + esc(d) + '">…</span></div>' +
            '<div class="br-actions">' +
            '<button class="btn btn-sm" data-backup-restore="' + esc(d) + '">' + ICONS.refresh + ' Geri yükle</button>' +
            '<button class="btn btn-sm btn-ghost" data-backup-download="' + esc(d) + '">' + ICONS.download + ' İndir</button>' +
            '</div></div>';
        }).join('');
        list.forEach(function (d) {
          withTimeout(idbGet('backup:' + d), 900, null).then(function (rec) {
            var el = $('#bsize-' + d);
            if (el && rec) el.textContent = boyutYazi(rec.size) + ' · ' + timeTR(new Date(rec.at)) + (rec.name ? ' · ' + rec.name : '');
          });
        });
      });
    }

    render();
    $('#backupSnap', m.el).addEventListener('click', function () {
      try {
        backupSnapshot(writeBytes(), true).then(function (ok) {
          toast(ok ? 'Yedek alındı' : 'Yedek alınamadı (tarayıcı izni)', ok ? 'ok' : 'err');
          render();
        });
      } catch (e) { toast('Yedek alınamadı: ' + e.message, 'err'); }
    });
    box.addEventListener('click', function (e) {
      var r = e.target.closest('[data-backup-restore]');
      var dl = e.target.closest('[data-backup-download]');
      if (r) { m.close(); restoreBackup(r.getAttribute('data-backup-restore')); }
      if (dl) indirBackup(dl.getAttribute('data-backup-download'));
    });
  }

  function indirBackup(date) {
    withTimeout(idbGet('backup:' + date), 1200, null).then(function (rec) {
      if (!rec || !rec.bytes) { toast('Yedek bulunamadı.', 'err'); return; }
      download(new Uint8Array(rec.bytes), 'YEDEK_' + date + '.xlsx');
      toast('Yedek indiriliyor', 'ok');
    });
  }

  function restoreBackup(date) {
    withTimeout(idbGet('backup:' + date), 1500, null).then(function (rec) {
      if (!rec || !rec.bytes) { toast('Yedek bulunamadı.', 'err'); return; }
      confirmDialog({
        title: 'Yedek geri yüklensin mi?',
        message: dateTR(date) + ' tarihli yedek açılacak' + (rec.name ? ' (' + rec.name + ')' : '') + '. Ekrandaki mevcut veriler değişir; kaydetmediyseniz önce iptal edip kaydedin.',
        confirmText: 'Geri yükle', danger: true
      }).then(function (ok) {
        if (!ok) return;
        XLSX.readWorkbook(rec.bytes).then(function (wb) {
          var d = Core.readData(wb.sheets);
          applyLoadedData(d, S.file.name, S.file.handle);
          S.file.dirty = true;
          S.view = 'dashboard';
          startApp();
          setDirty(true);
          log('YEDEK GERİ', date);
          toast(dateTR(date) + ' yedeği geri yüklendi', 'ok');
        }).catch(function (e) { toast('Yedek açılamadı: ' + e.message, 'err'); });
      });
    });
  }

  function yedekIndir() {
    try {
      download(writeBytes(), 'YEDEK_' + Core.todayISO() + '.xlsx');
      toast('Yedek indiriliyor', 'ok');
    } catch (e) { toast('Yedek oluşturulamadı: ' + e.message, 'err'); }
  }

  /* ------------------------------------------------------------------ */
  /* Çöp kutusu / işlem günlüğü                                          */
  /* ------------------------------------------------------------------ */
  var TRASH_TUR = { sevk: 'Sevk fişi', siparis: 'Sipariş', hareket: 'Cari hareket', cari: 'Cari hesap' };

  function openTrash() {
    var list = (data.trash || []).slice().sort(function (a, b) { return b.id - a.id; });
    var body;
    if (!list.length) {
      body = emptyState('archive', 'Çöp kutusu boş', 'Silinen sevk fişleri, siparişler ve hareketler 30 gün burada saklanır.', '');
    } else {
      body = '<div class="table-wrap" style="max-height:52vh"><table class="data"><thead><tr>' +
        '<th>Tarih</th><th>Tür</th><th>Kayıt</th><th>Silen</th><th></th></tr></thead><tbody>' +
        list.map(function (t) {
          var tr = new Date(t.tarih);
          return '<tr>' +
            '<td class="nowrap">' + dateTR(String(t.tarih).slice(0, 10)) + '<div class="sub">' + (isNaN(tr) ? '' : timeTR(tr)) + '</div></td>' +
            '<td>' + esc(TRASH_TUR[t.tur] || t.tur) + '</td>' +
            '<td><div class="strong">' + esc(t.ad || '—') + '</div></td>' +
            '<td class="sub">' + esc(t.kullanici || '—') + '</td>' +
            '<td><div class="row-actions">' +
            '<button class="btn btn-sm" data-act="trash-restore" data-id="' + t.id + '">' + ICONS.refresh + ' Geri yükle</button>' +
            '<button class="btn btn-icon danger" data-act="trash-purge" data-id="' + t.id + '" title="Kalıcı sil" aria-label="Kalıcı sil">' + ICONS.trash + '</button>' +
            '</div></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    openModal({
      title: 'Çöp kutusu',
      subtitle: '30 günden eski kayıtlar otomatik silinir',
      body: body,
      footer: '<button class="btn" data-modal-close>Kapat</button>'
    });
  }

  function openAudit() {
    var list = (data.audit || []).slice().sort(function (a, b) { return b.id - a.id; }).slice(0, 300);
    var body;
    if (!list.length) {
      body = emptyState('history', 'Henüz işlem yok', 'Sipariş, sevk ve silme işlemleri burada listelenir.', '');
    } else {
      body = '<div class="table-wrap" style="max-height:56vh"><table class="data"><thead><tr>' +
        '<th>Tarih</th><th>Kullanıcı</th><th>İşlem</th><th>Detay</th></tr></thead><tbody>' +
        list.map(function (a) {
          var d = new Date(a.tarih);
          return '<tr>' +
            '<td class="nowrap">' + dateTR(String(a.tarih).slice(0, 10)) + '<div class="sub">' + (isNaN(d) ? '' : timeTR(d)) + '</div></td>' +
            '<td>' + esc(a.kullanici || '—') + '</td>' +
            '<td><span class="pill muted">' + esc(a.islem) + '</span></td>' +
            '<td>' + esc(a.detay) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    openModal({
      title: 'İşlem günlüğü',
      subtitle: 'Son 300 kayıt',
      body: body,
      footer: '<button class="btn" data-modal-close>Kapat</button>'
    });
  }

  /* ------------------------------------------------------------------ */
  /* Dosya sağlık kontrolü                                               */
  /* ------------------------------------------------------------------ */
  function openHealth(silent) {
    var issues = Core.healthCheck(data);
    if (!issues.length) {
      if (!silent) toast('Dosya kontrolü: sorun bulunmadı', 'ok');
      return;
    }
    openModal({
      title: 'Dosya kontrolü',
      subtitle: issues.length + ' uyarı bulundu',
      body: '<p class="muted small" style="margin:0 0 10px">Aşağıdaki kayıtlar tutarsız görünüyor. Verileriniz silinmedi; yine de yedek almanızı öneririz.</p>' +
        '<ul class="issue-list">' + issues.slice(0, 40).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        (issues.length > 40 ? '<p class="muted small">… ve ' + (issues.length - 40) + ' uyarı daha</p>' : ''),
      footer: '<button class="btn" data-modal-close>Kapat</button>' +
        '<button class="btn btn-primary" data-act="backup-file">' + ICONS.shield + ' Yedek indir</button>'
    });
  }

  function openChangelog() {
    openModal({
      title: 'Yenilikler',
      subtitle: 'Sürüm ' + SURUM,
      body: YENILIKLER.map(function (s) {
        return '<div class="changelog"><div class="cl-head"><b>v' + esc(s.v) + '</b><span>' + esc(s.t) + '</span></div>' +
          '<ul>' + s.m.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      }).join(''),
      footer: '<button class="btn" data-modal-close>Kapat</button>'
    });
  }

  /* ------------------------------------------------------------------ */
  /* Komut paleti (Ctrl+K)                                               */
  /* ------------------------------------------------------------------ */
  function openPalette() {
    var m = openModal({
      title: 'Hızlı arama',
      subtitle: 'Model, cari veya fiş no yazın · Ctrl+K',
      body: '<div class="palette"><div class="search">' + ICONS.search +
        '<input class="input" id="palInput" placeholder="Ara…" autocomplete="off" spellcheck="false"></div>' +
        '<div class="pal-list" id="palList"></div></div>',
      footer: '<span class="muted small">↑ ↓ gez · Enter aç · Esc kapat</span>'
    });
    var input = $('#palInput', m.el);
    var listEl = $('#palList', m.el);
    var aktif = 0, sonuc = [];

    function topla(q) {
      q = q.toLocaleLowerCase('tr-TR').trim();
      var out = [];
      if (!q) {
        data.orders.slice().sort(function (a, b) { return b.id - a.id; }).slice(0, 5).forEach(function (o) {
          out.push({ tur: 'Sipariş', ad: o.model, alt: cariAdi(o.cariId) + ' · #' + o.sipno, fn: function () { openOrderForm(o); } });
        });
        data.cariler.slice(0, 4).forEach(function (c) {
          out.push({ tur: 'Cari', ad: c.ad, alt: 'Bakiye ' + money(Core.balance(data, c.id)), fn: function () { setActiveCari(c.id); go('cariler'); } });
        });
        return out;
      }
      data.orders.forEach(function (o) {
        var sc = [o.model, o.renk, o.sipno, cariAdi(o.cariId), o.kod].join(' ').toLocaleLowerCase('tr-TR');
        if (sc.indexOf(q) >= 0) out.push({ tur: 'Sipariş', ad: o.model, alt: cariAdi(o.cariId) + ' · #' + o.sipno, fn: function () { openOrderForm(o); } });
      });
      data.cariler.forEach(function (c) {
        if ((c.ad + ' ' + (c.kod || '')).toLocaleLowerCase('tr-TR').indexOf(q) >= 0) {
          out.push({ tur: 'Cari', ad: c.ad, alt: 'Bakiye ' + money(Core.balance(data, c.id)), fn: function () { setActiveCari(c.id); go('cariler'); } });
        }
      });
      data.shipments.forEach(function (sh) {
        if ((String(sh.fisNo) + ' ' + (sh.cari || '') + ' ' + (sh.faturaNo || '')).toLocaleLowerCase('tr-TR').indexOf(q) >= 0) {
          out.push({ tur: 'Fiş', ad: 'Fiş #' + sh.fisNo, alt: (sh.cari || '') + ' · ' + dateTR(sh.tarih), fn: function () { previewShipment(sh.id); } });
        }
      });
      (data.modeller || []).forEach(function (k) {
        if (k.model.toLocaleLowerCase('tr-TR').indexOf(q) >= 0) {
          out.push({ tur: 'Model', ad: k.model, alt: 'Liste ' + money(k.fiyat), fn: function () { openModelForm(k); } });
        }
      });
      return out.slice(0, 14);
    }

    function render() {
      sonuc = topla(input.value);
      if (!sonuc.length) { listEl.innerHTML = '<div class="pal-empty">Sonuç yok</div>'; return; }
      aktif = Math.min(aktif, sonuc.length - 1);
      listEl.innerHTML = sonuc.map(function (r, i) {
        return '<button class="pal-item' + (i === aktif ? ' active' : '') + '" data-i="' + i + '">' +
          '<span class="pal-tur">' + esc(r.tur) + '</span>' +
          '<span class="pal-text"><b>' + esc(r.ad) + '</b><span>' + esc(r.alt) + '</span></span>' +
          ICONS.right + '</button>';
      }).join('');
    }

    function sec(i) {
      var r = sonuc[i];
      if (!r) return;
      m.close();
      setTimeout(r.fn, 60);
    }

    input.addEventListener('input', function () { aktif = 0; render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); aktif = Math.min(aktif + 1, sonuc.length - 1); render(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); aktif = Math.max(aktif - 1, 0); render(); }
      if (e.key === 'Enter') { e.preventDefault(); sec(aktif); }
    });
    listEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-i]');
      if (b) sec(parseInt(b.dataset.i, 10));
    });
    render();
    setTimeout(function () { input.focus(); }, 60);
  }

  /* ------------------------------------------------------------------ */
  /* Model kartları                                                      */
  /* ------------------------------------------------------------------ */
  function viewModels() {
    var ozet = Core.modelSummary(data);
    var ozetMap = {};
    ozet.forEach(function (r) { ozetMap[Core.normKey(r.model)] = r; });
    var kartMap = {};
    (data.modeller || []).forEach(function (k) { kartMap[Core.normKey(k.model)] = k; });

    var keys = Object.keys(kartMap);
    ozet.forEach(function (r) {
      var k = Core.normKey(r.model);
      if (keys.indexOf(k) === -1) keys.push(k);
    });

    if (!keys.length) {
      return emptyState('tag', 'Henüz model kartı yok',
        'Model kartına fiyat, maliyet, barkod ve sezon bilgisi girin; siparişte fiyat otomatik dolsun.',
        '<button class="btn btn-primary" data-act="model-new">' + ICONS.plus + ' Yeni model</button>');
    }

    var toplamKalan = 0, kartsiz = 0;
    var rows = keys.map(function (k) {
      var kart = kartMap[k] || {};
      var r = ozetMap[k] || { siparis: 0, sevk: 0, kalan: 0 };
      var model = kart.model || r.model;
      toplamKalan += r.kalan;
      if (!kart.model) kartsiz++;
      var marj = Core.num(kart.fiyat) > 0 ? (Core.num(kart.fiyat) - Core.num(kart.maliyet)) / Core.num(kart.fiyat) * 100 : 0;
      var foto = kart.model ? (data.modelImages[kart.id] || '') : '';
      var alt = [];
      if (kart.kategori) alt.push((Matris.kategori(kart.kategori) || {}).ad || kart.kategori);
      if (kart.renkler && kart.renkler.length) alt.push(kart.renkler.length + ' renk');
      if (kart.sezon) alt.push(kart.sezon);
      if (kart.barkod) alt.push(kart.barkod);
      var thumb = foto
        ? '<div class="thumb" data-act="model-image" data-id="' + kart.id + '" title="Resmi büyüt" style="background-image:url(&quot;' + esc(foto) + '&quot;);cursor:zoom-in"></div>'
        : '<div class="thumb" style="color:#cbd5e1">' + ICONS.image + '</div>';
      return '<tr>' +
        '<td>' + thumb + '</td>' +
        '<td><div class="strong">' + esc(model) + '</div>' +
          '<div class="sub">' + esc(alt.join(' · ') || '—') + '</div></td>' +
        '<td class="right">' + (kart.model ? nf2(kart.fiyat) : '—') + '</td>' +
        '<td class="right">' + (kart.model && (Matris.asortiToplam(kart.asortiSablon) || Core.num(kart.asorti)) ? nf0(Matris.asortiToplam(kart.asortiSablon) || kart.asorti) : '—') + '</td>' +
        '<td class="right">' + (kart.model && Core.num(kart.maliyet) ? nf2(kart.maliyet) : '—') + '</td>' +
        '<td class="right">' + (kart.model && Core.num(kart.fiyat) ? nf1(marj) + '%' : '—') + '</td>' +
        '<td class="right">' + nf0(r.siparis) + '</td>' +
        '<td class="right">' + nf0(r.sevk) + '</td>' +
        '<td class="right strong">' + nf0(r.kalan) + '</td>' +
        '<td><div class="row-actions">' +
        (kart.model
          ? '<button class="btn btn-icon" data-act="model-edit" data-id="' + kart.id + '" title="Düzenle" aria-label="Düzenle">' + ICONS.edit + '</button>' +
          '<button class="btn btn-icon danger" data-act="model-del" data-id="' + kart.id + '" title="Sil" aria-label="Sil">' + ICONS.trash + '</button>'
          : '<button class="btn btn-sm" data-act="model-new" data-model="' + esc(model) + '">' + ICONS.plus + ' Kart ekle</button>') +
        '</div></td></tr>';
    }).join('');

    return '<div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))">' +
      '<div class="kpi"><div class="kpi-label">Model kartı</div><div class="kpi-value">' + data.modeller.length + '</div><div class="kpi-foot">fiyat ve maliyet tanımlı</div></div>' +
      '<div class="kpi warn"><div class="kpi-label">Kartsız model</div><div class="kpi-value">' + kartsiz + '</div><div class="kpi-foot">fiyat listede yok</div></div>' +
      '<div class="kpi info"><div class="kpi-label">Toplam kalan</div><div class="kpi-value">' + nf0(toplamKalan) + '<small>çift</small></div><div class="kpi-foot">tüm cariler</div></div>' +
      '</div>' +
      '<div class="card"><div class="table-wrap" style="max-height:none"><table class="data"><thead><tr>' +
      '<th></th><th>Model</th><th class="right">Liste</th><th class="right">Asorti</th><th class="right">Maliyet</th><th class="right">Marj</th>' +
      '<th class="right">Sipariş</th><th class="right">Sevk</th><th class="right">Kalan</th><th></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function openModelForm(model, modelAdi) {
    var isEdit = !!model;
    var m = model || {
      model: modelAdi || '', asortiSablonId: 0, renkIds: [], kategori: '',
      fiyat: '', maliyet: '', barkod: '', sezon: '', not: ''
    };
    var currentImage = model ? (data.modelImages[model.id] || null) : null;
    var templates = (data.asortiSablonlari || []).filter(function (t) { return t.aktif !== false || Core.num(m.asortiSablonId) === t.id; });
    var colors = (data.renkler || []).slice();
    var secili = {};
    (m.renkIds || Matris.modelColorIds(data, m.id) || []).forEach(function (id) { secili[id] = 1; });
    if (!Object.keys(secili).length && m.renkler) {
      m.renkler.forEach(function (ad) { var c = colors.filter(function (x) { return Core.normKey(x.ad) === Core.normKey(ad); })[0]; if (c) secili[c.id] = 1; });
    }

    var tOpts = '<option value="">Şablon seçin…</option>' + templates.map(function (t) {
      var kat = Matris.kategori(t.kategori);
      return '<option value="' + t.id + '"' + (Core.num(m.asortiSablonId) === t.id ? ' selected' : '') + '>' +
        esc(t.ad) + ' · ' + esc(kat ? kat.ad : '—') + ' · ' + nf0(Matris.asortiToplam(t.dagilim)) + ' çift/koli</option>';
    }).join('');

    var colorHtml = colors.filter(function (c) { return c.aktif !== false || secili[c.id]; }).map(function (c) {
      return '<label class="color-pick-item"><input type="checkbox" data-color-id="' + c.id + '"' + (secili[c.id] ? ' checked' : '') + '>' +
        '<span>' + esc(c.ad) + '</span>' + (c.kod ? '<small>' + esc(c.kod) + '</small>' : '') + '</label>';
    }).join('');

    var modal = openModal({
      title: isEdit ? 'Model kartını düzenle' : 'Yeni model kartı',
      subtitle: 'Asorti şablonu + renkler; beden dağılımı şablondan gelir',
      size: 'wide',
      body:
        '<form id="modelForm" class="form-grid g2" autocomplete="off">' +
        '  <div class="field span2"><label for="mfModel">Model *</label><input id="mfModel" class="input" required value="' + esc(m.model) + '"></div>' +
        '  <div class="field"><label for="mfSablon">Asorti şablonu *</label><select id="mfSablon" class="select" required>' + tOpts + '</select></div>' +
        '  <div class="field"><label>Kategori</label><div class="input" id="mfKategori" style="background:var(--surface-2)">—</div></div>' +
        '  <div class="span2"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px">' +
        '    <label class="f" style="margin:0">Renkler * <span class="hint" id="mfRenkSayisi">(' + colors.length + ' renk tanımlı)</span></label>' +
        '    <button type="button" class="btn btn-sm" id="mfRenkEkle">' + ICONS.plus + ' Yeni renk</button></div>' +
        '    <div id="mfRenkler" class="color-pick">' + (colorHtml || '<span class="muted small">Önce <b>Ayarlar → Renkler</b> bölümünden renk ekleyin.</span>') + '</div></div>' +
        '  <div class="span2"><label class="f">Renk × beden matrisi <span class="hint">(koli içi çift)</span></label><div id="mfMatrix" class="table-wrap" style="max-height:none"></div></div>' +
        '  <div class="field"><label for="mfFiyat">Liste fiyatı</label><input id="mfFiyat" class="input num" type="text" inputmode="decimal" value="' + esc(m.fiyat || '') + '"></div>' +
        '  <div class="field"><label for="mfMaliyet">Maliyet</label><input id="mfMaliyet" class="input num" type="text" inputmode="decimal" value="' + esc(m.maliyet || '') + '"></div>' +
        '  <div class="field"><label for="mfBarkod">Barkod</label><input id="mfBarkod" class="input" value="' + esc(m.barkod || '') + '"></div>' +
        '  <div class="field"><label for="mfSezon">Sezon</label><input id="mfSezon" class="input" value="' + esc(m.sezon || '') + '"></div>' +
        '  <div class="field span2"><label for="mfNot">Not</label><input id="mfNot" class="input" value="' + esc(m.not || '') + '"></div>' +
        '  <div class="span2" style="display:flex;gap:14px;align-items:center;padding:12px;background:var(--surface-2);border:1px solid var(--line);border-radius:10px">' +
        '    <div class="thumb lg" id="mfThumb" style="' + (currentImage ? 'background-image:url(&quot;' + esc(currentImage) + '&quot;)' : '') + '">' + (currentImage ? '' : 'RESİM') + '</div>' +
        '    <div style="flex:1;min-width:0">' +
        '      <div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '        <button type="button" class="btn btn-sm" data-mimg-pick>' + ICONS.image + ' Resim seç</button>' +
        '        <button type="button" class="btn btn-sm btn-ghost" data-mimg-clear>Kaldır</button>' +
        '      </div>' +
        '      <p class="muted small" style="margin:8px 0 0">Resmi yapıştırabilir (Ctrl+V) veya sürükleyebilirsiniz.</p>' +
        '    </div>' +
        '    <input type="file" accept="image/*" id="mfImage" class="hidden">' +
        '  </div>' +
        '  <div class="auth-err span2" id="mfErr"></div>' +
        '</form>',
      footer: '<button class="btn" data-modal-close>Vazgeç</button>' +
        '<button class="btn btn-primary" type="submit" form="modelForm">' + ICONS.check + ' Kaydet</button>'
    });

    var wrap = modal.el;

    function seciliTpl() {
      return Matris.templateById(data, Core.num($('#mfSablon', wrap).value));
    }
    function seciliRenkler() {
      return $$('#mfRenkler input[data-color-id]:checked', wrap).map(function (i) { return Core.num(i.getAttribute('data-color-id')); });
    }
    function renderColorPicker() {
      var html = colors.filter(function (c) { return c.aktif !== false || secili[c.id]; }).map(function (c) {
        return '<label class="color-pick-item"><input type="checkbox" data-color-id="' + c.id + '"' + (secili[c.id] ? ' checked' : '') + '>' +
          '<span>' + esc(c.ad) + '</span>' + (c.kod ? '<small>' + esc(c.kod) + '</small>' : '') + '</label>';
      }).join('');
      $('#mfRenkler', wrap).innerHTML = html || '<span class="muted small">Henüz renk yok. “Yeni renk” ile ekleyin.</span>';
      var say = $('#mfRenkSayisi', wrap); if (say) say.textContent = '(' + colors.length + ' renk tanımlı)';
    }

    function renderKategori() {
      var t = seciliTpl();
      var k = t ? Matris.kategori(t.kategori) : null;
      $('#mfKategori', wrap).textContent = k ? k.ad + ' (' + k.min + '–' + k.max + ')' : '—';
    }
    function renderMatrix() {
      var t = seciliTpl();
      var ids = seciliRenkler();
      var box = $('#mfMatrix', wrap);
      if (!t) { box.innerHTML = '<div class="empty">Asorti şablonu seçin.</div>'; return; }
      if (!ids.length) { box.innerHTML = '<div class="empty">En az bir renk seçin.</div>'; return; }
      var sizes = Object.keys(t.dagilim).map(Number).sort(function (a, b) { return a - b; });
      var byId = {};
      colors.forEach(function (c) { byId[c.id] = c; });
      var total = Matris.asortiToplam(t.dagilim);
      box.innerHTML = '<table class="data mini"><thead><tr><th>Renk</th>' +
        sizes.map(function (sz) { return '<th class="right">' + sz + '</th>'; }).join('') +
        '<th class="right">Koli içi</th></tr></thead><tbody>' +
        ids.map(function (id) {
          var c = byId[id] || { ad: '—' };
          return '<tr><td><div class="strong">' + esc(c.ad) + '</div><div class="sub">' + esc(c.kod || '') + '</div></td>' +
            sizes.map(function (sz) { var q = Core.num(t.dagilim[sz]); return '<td class="right">' + (q ? nf0(q) : '—') + '</td>'; }).join('') +
            '<td class="right strong">' + nf0(total) + '</td></tr>';
        }).join('') + '</tbody></table>';
    }
    function renderAll() { renderKategori(); renderMatrix(); }

    $('#mfSablon', wrap).addEventListener('change', renderAll);
    $('#mfRenkler', wrap).addEventListener('change', function (e) {
      var cb = e.target.closest('input[data-color-id]');
      if (cb) {
        var cid = Core.num(cb.getAttribute('data-color-id'));
        if (cb.checked) secili[cid] = 1; else delete secili[cid];
      }
      renderMatrix();
    });
    $('#mfRenkEkle', wrap).addEventListener('click', function () {
      openColorForm(null, function (c) {
        if (!colors.some(function (x) { return x.id === c.id; })) colors.push(c);
        secili[c.id] = 1;
        renderColorPicker();
        renderMatrix();
      });
    });
    renderAll();

    // ---- resim ----
    function setModelImage(dataUrl) {
      currentImage = dataUrl;
      var th = $('#mfThumb', wrap);
      if (dataUrl) { th.style.backgroundImage = 'url("' + dataUrl + '")'; th.textContent = ''; }
      else { th.style.backgroundImage = ''; th.textContent = 'RESİM'; }
    }
    $('[data-mimg-pick]', wrap).addEventListener('click', function () { $('#mfImage', wrap).click(); });
    $('[data-mimg-clear]', wrap).addEventListener('click', function () { setModelImage(null); });
    $('#mfImage', wrap).addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) imageToDataUrl(f, function (url) { setModelImage(url); });
    });
    wrap.addEventListener('paste', function (e) {
      var items = (e.clipboardData && e.clipboardData.items) || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') === 0) {
          e.preventDefault();
          imageToDataUrl(items[i].getAsFile(), function (url) { setModelImage(url); toast('Resim eklendi', 'ok'); });
          break;
        }
      }
    });
    wrap.addEventListener('dragover', function (e) { e.preventDefault(); });
    wrap.addEventListener('drop', function (e) {
      e.preventDefault();
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && f.type.indexOf('image') === 0) imageToDataUrl(f, function (url) { setModelImage(url); });
    });

    $('#modelForm', wrap).addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('#mfErr', wrap);
      var t = seciliTpl();
      if (!t) { err.textContent = 'Asorti şablonu seçin. Ayarlar → Asorti şablonları.'; return; }
      var ids = seciliRenkler();
      if (!ids.length) { err.textContent = 'En az bir renk seçin. Ayarlar → Renkler.'; return; }
      var payload = {
        model: $('#mfModel', wrap).value,
        asortiSablonId: t.id,
        renkIds: ids,
        fiyat: $('#mfFiyat', wrap).value.replace(',', '.'),
        maliyet: $('#mfMaliyet', wrap).value.replace(',', '.'),
        barkod: $('#mfBarkod', wrap).value,
        sezon: $('#mfSezon', wrap).value,
        not: $('#mfNot', wrap).value,
        resim: currentImage || null
      };
      try {
        var kayit = isEdit ? Core.updateModel(data, m.id, payload) : Core.addModel(data, payload);
        log(isEdit ? 'MODEL DÜZENLE' : 'MODEL EKLE', kayit.model + ' · ' + t.ad + ' · ' + ids.length + ' renk');
        setDirty(true);
        modal.close();
        renderView();
        toast(isEdit ? 'Model güncellendi' : 'Model eklendi', 'ok');
      } catch (ex) { err.textContent = ex.message; }
    });
  }

  function modelById(id) {
    return (data.modeller || []).filter(function (m) { return m.id === id; })[0] || null;
  }

  function showModelImage(id) {
    var kart = modelById(id);
    var src = data.modelImages[id];
    if (!kart || !src) return;
    openModal({
      title: kart.model,
      subtitle: 'Model resmi',
      body: '<div style="text-align:center"><img src="' + esc(src) + '" alt="" style="max-width:100%;max-height:62vh;border-radius:10px;border:1px solid var(--line)"></div>',
      footer: '<button class="btn" data-modal-close>Kapat</button>'
    });
  }

  function removeModel(id) {
    var kart = modelById(id);
    if (!kart) return;
    var kullanim = data.orders.filter(function (o) { return Core.normKey(o.model) === Core.normKey(kart.model); }).length;
    confirmDialog({
      title: 'Model kartı silinsin mi?',
      message: kart.model + ' kartı silinecek.' + (kullanim ? ' Bu modele ait ' + kullanim + ' sipariş etkilenmez, sadece fiyat/maliyet bilgisi silinir.' : ''),
      confirmText: 'Sil', danger: true
    }).then(function (ok) {
      if (!ok) return;
      Core.deleteModel(data, id);
      log('MODEL SİL', kart.model);
      setDirty(true);
      renderView();
      toast('Model kartı silindi', 'ok');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Ayarlar  /* ------------------------------------------------------------------ */
  /* Ayarlar                                                             */
  /* ------------------------------------------------------------------ */
  function openColorForm(renk, onSaved) {
    var isEdit = !!renk;
    var c = renk || { ad: '', kod: '', aktif: true };
    var m = openModal({
      title: isEdit ? 'Rengi düzenle' : 'Yeni renk',
      subtitle: 'Model kartlarında bu renk seçilir',
      body: '<form id="colorForm" class="form-grid g2" autocomplete="off">' +
        '  <div class="field span2"><label for="cfAd">Renk adı *</label><input id="cfAd" class="input" required value="' + esc(c.ad) + '"></div>' +
        '  <div class="field"><label for="cfKod">Kısa kod</label><input id="cfKod" class="input" maxlength="8" value="' + esc(c.kod || '') + '"></div>' +
        '  <div class="field" style="display:flex;align-items:flex-end"><label class="check"><input type="checkbox" id="cfAktif"' + (c.aktif !== false ? ' checked' : '') + '> Aktif</label></div>' +
        '  <div class="auth-err span2" id="cfErr"></div>' +
        '</form>',
      footer: '<button class="btn" data-modal-close>Vazgeç</button>' +
        '<button class="btn btn-primary" type="submit" form="colorForm">' + ICONS.check + ' Kaydet</button>'
    });
    $('#colorForm', m.el).addEventListener('submit', function (e) {
      e.preventDefault();
      try {
        var payload = { ad: $('#cfAd', m.el).value, kod: $('#cfKod', m.el).value, aktif: $('#cfAktif', m.el).checked };
        var kayit = isEdit ? Core.updateColor(data, c.id, payload) : Core.addColor(data, payload);
        log(isEdit ? 'RENK DÜZENLE' : 'RENK EKLE', kayit.ad);
        setDirty(true); m.close();
        if (onSaved) onSaved(kayit); else renderView();
        toast(isEdit ? 'Renk güncellendi' : 'Renk eklendi', 'ok');
      } catch (ex) { $('#cfErr', m.el).textContent = ex.message; }
    });
  }

  function removeColorMaster(id) {
    var c = (data.renkler || []).filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    confirmDialog({
      title: 'Renk silinsin mi?', message: c.ad + ' rengi silinecek. Kullanılan model varsa silinmez.', confirmText: 'Sil', danger: true
    }).then(function (ok) {
      if (!ok) return;
      try {
        Core.deleteColor(data, id);
        log('RENK SİL', c.ad); setDirty(true); renderView(); toast('Renk silindi', 'ok');
      } catch (ex) { toast(ex.message, 'err'); }
    });
  }

  function openSablonForm(sablon) {
    var isEdit = !!sablon;
    var t = sablon || { ad: '', kategori: 'MERDANE', dagilim: {} };
    var dagilim = Object.assign({}, t.dagilim || {});
    var katOpts = '<option value="">Kategori seçin</option>' + Object.keys(Matris.KATEGORILER).map(function (k) {
      return '<option value="' + k + '"' + (t.kategori === k ? ' selected' : '') + '>' + Matris.KATEGORILER[k].ad + ' (' + Matris.KATEGORILER[k].min + '–' + Matris.KATEGORILER[k].max + ')</option>';
    }).join('');
    var m = openModal({
      title: isEdit ? 'Asorti şablonunu düzenle' : 'Yeni asorti şablonu',
      subtitle: 'Koli içi beden dağılımı; modele atanır',
      size: 'wide',
      body: '<form id="sablonForm" class="form-grid g2" autocomplete="off">' +
        '  <div class="field span2"><label for="sfAd">Şablon adı *</label><input id="sfAd" class="input" required value="' + esc(t.ad) + '" placeholder="Örn. Merdane 10\'lu 40-45"></div>' +
        '  <div class="field"><label for="sfKat">Kategori *</label><select id="sfKat" class="select" required>' + katOpts + '</select></div>' +
        '  <div class="field"><label>Koli içi toplam</label><div class="input" id="sfToplam" style="background:var(--surface-2)">0 çift</div></div>' +
        '  <div class="span2"><label class="f">Beden dağılımı <span class="hint">(her numaradan kaç çift)</span></label><div id="sfGrid" class="m-sz-grid"></div></div>' +
        '  <div class="auth-err span2" id="sfErr"></div>' +
        '</form>',
      footer: '<button class="btn" data-modal-close>Vazgeç</button>' +
        '<button class="btn btn-primary" type="submit" form="sablonForm">' + ICONS.check + ' Kaydet</button>'
    });

    function renderGrid() {
      var kat = $('#sfKat', m.el).value;
      var list = Matris.bedenler(kat);
      if (!list.length) { $('#sfGrid', m.el).innerHTML = '<span class="muted small">Önce kategori seçin.</span>'; updateTotal(); return; }
      $('#sfGrid', m.el).innerHTML = list.map(function (sz) {
        return '<label class="m-sz"><span>' + sz + '</span><input type="number" min="0" step="1" data-size="' + sz + '" value="' + (Core.num(dagilim[sz]) || '') + '" placeholder="0"></label>';
      }).join('');
      updateTotal();
    }
    function updateTotal() {
      var total = 0;
      $$('#sfGrid [data-size]', m.el).forEach(function (inp) { total += Core.num(inp.value); });
      $('#sfToplam', m.el).textContent = nf0(total) + ' çift';
    }
    $('#sfKat', m.el).addEventListener('change', renderGrid);
    $('#sfGrid', m.el).addEventListener('input', updateTotal);
    renderGrid();

    $('#sablonForm', m.el).addEventListener('submit', function (e) {
      e.preventDefault();
      var yeni = {};
      $$('#sfGrid [data-size]', m.el).forEach(function (inp) {
        var q = Core.num(inp.value);
        if (q > 0) yeni[inp.getAttribute('data-size')] = Math.round(q);
      });
      try {
        var payload = { ad: $('#sfAd', m.el).value, kategori: $('#sfKat', m.el).value, dagilim: yeni, aktif: true };
        var kayit = isEdit ? Core.updateAsortiSablon(data, t.id, payload) : Core.addAsortiSablon(data, payload);
        log(isEdit ? 'ŞABLON DÜZENLE' : 'ŞABLON EKLE', kayit.ad);
        setDirty(true); m.close(); renderView();
        toast(isEdit ? 'Şablon güncellendi' : 'Şablon eklendi', 'ok');
      } catch (ex) { $('#sfErr', m.el).textContent = ex.message; }
    });
  }

  function removeSablonMaster(id) {
    var t = (data.asortiSablonlari || []).filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    confirmDialog({
      title: 'Şablon silinsin mi?', message: t.ad + ' şablonu silinecek. Kullanan model varsa silinmez.', confirmText: 'Sil', danger: true
    }).then(function (ok) {
      if (!ok) return;
      try {
        Core.deleteAsortiSablon(data, id);
        log('ŞABLON SİL', t.ad); setDirty(true); renderView(); toast('Şablon silindi', 'ok');
      } catch (ex) { toast(ex.message, 'err'); }
    });
  }

  function viewSettings() {
    if (!isAdmin()) return viewSettingsKullanici();
    var s = data.settings;
    var paras = ['₺', '$', '€', '£'];
    var userRows = data.kullanicilar.map(function (u) {
      return '<tr>' +
        '<td><div class="strong">' + esc(u.ad) + '</div><div class="sub">' + (u.aktif === false ? 'Pasif' : 'Aktif') + '</div></td>' +
        '<td>' + esc(u.kullanici) + '</td>' +
        '<td>' + (u.rol === 'YÖNETİCİ' ? '<span class="pill info">Yönetici</span>' : '<span class="pill muted">Kullanıcı</span>') + '</td>' +
        '<td class="sub nowrap">' + (u.sonGiris ? dateTR(u.sonGiris) : '—') + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="btn btn-icon" data-act="user-pass" data-id="' + u.id + '" title="Şifre sıfırla" aria-label="Şifre sıfırla">' + ICONS.lock + '</button>' +
        '<button class="btn btn-icon" data-act="user-edit" data-id="' + u.id + '" title="Düzenle" aria-label="Düzenle">' + ICONS.edit + '</button>' +
        '<button class="btn btn-icon danger" data-act="user-del" data-id="' + u.id + '" title="Sil" aria-label="Sil">' + ICONS.trash + '</button>' +
        '</div></td></tr>';
    }).join('');

    var renkRows = (data.renkler || []).map(function (c) {
      return '<tr><td><div class="strong">' + esc(c.ad) + '</div><div class="sub">' + esc(c.kod || '—') + '</div></td>' +
        '<td class="right sub">' + Matris.colorUsage(data, c.id) + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="btn btn-icon" data-act="color-edit" data-id="' + c.id + '" title="Düzenle" aria-label="Düzenle">' + ICONS.edit + '</button>' +
        '<button class="btn btn-icon danger" data-act="color-del" data-id="' + c.id + '" title="Sil" aria-label="Sil">' + ICONS.trash + '</button>' +
        '</div></td></tr>';
    }).join('');
    var sablonRows = (data.asortiSablonlari || []).map(function (t) {
      var top = Matris.asortiToplam(t.dagilim);
      return '<tr><td><div class="strong">' + esc(t.ad) + '</div><div class="sub">' + esc(Matris.bedenler(t.kategori).length ? (Matris.kategori(t.kategori) || {}).ad : '—') + '</div></td>' +
        '<td class="right">' + nf0(top) + '</td>' +
        '<td class="right sub">' + Matris.templateUsage(data, t.id) + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="btn btn-icon" data-act="sablon-edit" data-id="' + t.id + '" title="Düzenle" aria-label="Düzenle">' + ICONS.edit + '</button>' +
        '<button class="btn btn-icon danger" data-act="sablon-del" data-id="' + t.id + '" title="Sil" aria-label="Sil">' + ICONS.trash + '</button>' +
        '</div></td></tr>';
    }).join('');

    return '<div class="grid-2 even">' +
      '<div class="card"><div class="card-head"><div><h2>Firma ve görünüm</h2><div class="sub">Sol üst marka ve sevk fişi başlığı</div></div></div>' +
      '<form id="settingsForm" class="card-body form-grid g2">' +
      '  <div class="field"><label for="setMarka">Uygulama adı <span class="hint">(sol üst)</span></label><input id="setMarka" name="markaAdi" class="input" maxlength="24" value="' + esc(s.markaAdi || 'DMR') + '"></div>' +
      '  <div class="field"><label for="setMarkaAlt">Alt başlık</label><input id="setMarkaAlt" name="markaAlt" class="input" maxlength="24" value="' + esc(s.markaAlt || 'AYAKKABI') + '"></div>' +
      '  <div class="field"><label for="setMarkaKisa">Kısa işaret <span class="hint">(logo yoksa)</span></label><input id="setMarkaKisa" name="markaKisa" class="input" maxlength="3" value="' + esc(s.markaKisa || 'DMR') + '"></div>' +
      '  <div class="field"><label for="setDosyaAdi">Varsayılan dosya adı</label><input id="setDosyaAdi" name="dosyaAdi" class="input" value="' + esc(s.dosyaAdi || 'DMR_VERI') + '" placeholder="Database"></div>' +
      '  <div class="field span2"><label for="setFirma">Firma adı (sevk eden)</label><input id="setFirma" name="firmaAdi" class="input" value="' + esc(s.firmaAdi) + '"></div>' +
      '  <div class="field"><label for="setTel">Telefon</label><input id="setTel" name="firmaTel" class="input" value="' + esc(s.firmaTel) + '"></div>' +
      '  <div class="field"><label for="setVd">Vergi dairesi</label><input id="setVd" name="vergiDairesi" class="input" value="' + esc(s.vergiDairesi) + '"></div>' +
      '  <div class="field span2"><label for="setAdres">Adres</label><input id="setAdres" name="firmaAdres" class="input" value="' + esc(s.firmaAdres) + '"></div>' +
      '  <div class="field"><label for="setVn">Vergi no</label><input id="setVn" name="vergiNo" class="input" value="' + esc(s.vergiNo) + '"></div>' +
      '  <div class="field"><label for="setBaslik">Fiş başlığı</label><input id="setBaslik" name="sevkBaslik" class="input" value="' + esc(s.sevkBaslik) + '"></div>' +
      '  <div class="field"><label for="setPara">Para birimi</label><select id="setPara" name="para" class="select">' +
      paras.map(function (p) { return '<option value="' + p + '"' + (s.para === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') +
      '</select></div>' +
      '  <div class="field"><label for="setKagit">Sevk fişi kağıdı</label><select id="setKagit" name="kagit" class="select">' +
      ['A4', 'A5'].map(function (k) { return '<option value="' + k + '"' + ((s.kagit || 'A4') === k ? ' selected' : '') + '>' + k + ' (varsayılan)</option>'; }).join('') +
      '</select></div>' +
      '  <div class="field"><label for="setAsorti">Varsayılan asorti (çift / koli)</label><input id="setAsorti" name="varsayilanAsorti" class="input num" type="number" min="1" value="' + esc(s.varsayilanAsorti) + '"></div>' +
      '  <div class="field"></div>' +
      '  <div class="field span2"><label>Logo</label><div style="display:flex;align-items:center;gap:12px">' +
      '    <div class="thumb lg" id="logoPreview" style="' + (s.logo ? 'background-image:url(&quot;' + esc(s.logo) + '&quot;)' : '') + '">' + (s.logo ? '' : 'LOGO') + '</div>' +
      '    <div style="display:flex;gap:8px">' +
      '      <button type="button" class="btn btn-sm" data-logo-pick>Resim seç</button>' +
      '      <button type="button" class="btn btn-sm btn-ghost" data-logo-clear>Kaldır</button></div>' +
      '    <input type="file" accept="image/*" id="logoInput" class="hidden">' +
      '    <input type="hidden" name="logo" id="logoData" value="' + esc(s.logo) + '">' +
      '  </div></div>' +
      '  <div class="span2 muted small" style="padding-top:2px">Cari hesap bilgileri (ad, adres, telefon) <b>Cariler</b> sayfasından yönetilir.</div>' +
      '  <div class="span2" style="display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--line);padding-top:14px">' +
      '    <button type="submit" class="btn btn-primary">' + ICONS.check + ' Bilgileri kaydet</button>' +
      '  </div>' +
      '</form></div>' +
      '<div>' +
      '  <div class="card"><div class="card-head"><div><h2>Veri dosyası</h2><div class="sub">Tüm kayıtlar seçtiğiniz Excel dosyasında tutulur</div></div></div>' +
      '    <div class="card-body">' +
      '      <div class="kv"><span>Dosya</span><b>' + esc(S.file.name || 'Henüz seçilmedi') + '</b></div>' +
      '      <div class="kv"><span>Durum</span><b>' + (S.file.dirty ? '<span class="pill warn">Kaydedilmedi</span>' : '<span class="pill ok">Güncel</span>') + '</b></div>' +
      '      <div class="kv"><span>Son kayıt</span><b>' + (S.file.lastSaved ? dateTR(S.file.lastSaved.toISOString().slice(0, 10)) + ' ' + timeTR(S.file.lastSaved) : '—') + '</b></div>' +
      '      <div class="kv"><span>Kayıt modu</span><b>' + (FS_OK ? 'Doğrudan Excel dosyasına' : 'İndirme (tarayıcı)') + '</b></div>' +
      '      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
      '        <button class="btn btn-primary btn-sm" data-act="save">' + ICONS.save + ' Kaydet</button>' +
      '        <button class="btn btn-sm" data-act="save-as">' + ICONS.folder + ' Farklı kaydet</button>' +
      '        <button class="btn btn-sm" data-act="open-file">' + ICONS.upload + ' Dosya aç</button>' +
      '      </div>' +
      '      <p class="muted small" style="margin:12px 0 0">Excel dosyasını bu ekran açıkken de açabilirsiniz; ancak kaydetmeden önce Excel\'de kapatın.</p>' +
      '    </div></div>' +
      '  <div class="card"><div class="card-head"><div><h2>Renkler</h2><div class="sub">Model kartlarında seçilir</div></div>' +
      '    <button class="btn btn-sm" data-act="color-new">' + ICONS.plus + ' Renk</button></div>' +
      '    <div class="table-wrap" style="max-height:none"><table class="data"><thead><tr><th>Renk</th><th class="right">Model</th><th></th></tr></thead><tbody>' +
      (renkRows || '<tr><td colspan="3">' + emptyState('tag', 'Renk yok', 'Model kartlarında kullanmak için renk ekleyin.', '') + '</td></tr>') +
      '    </tbody></table></div></div>' +
      '  <div class="card"><div class="card-head"><div><h2>Asorti şablonları</h2><div class="sub">Modele atanır; beden dağılımı burada tanımlanır</div></div>' +
      '    <button class="btn btn-sm" data-act="sablon-new">' + ICONS.plus + ' Şablon</button></div>' +
      '    <div class="table-wrap" style="max-height:none"><table class="data"><thead><tr><th>Şablon</th><th class="right">Çift</th><th class="right">Model</th><th></th></tr></thead><tbody>' +
      (sablonRows || '<tr><td colspan="4">' + emptyState('tag', 'Şablon yok', 'Asorti şablonu ekleyip modele atayın.', '') + '</td></tr>') +
      '    </tbody></table></div></div>' +
      '  <div class="card"><div class="card-head"><div><h2>Yedekler</h2><div class="sub">Günde bir otomatik · son 7 gün</div></div></div>' +
      '    <div class="card-body">' +
      '      <div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '        <button class="btn btn-sm btn-primary" data-act="open-backups">' + ICONS.shield + ' Yedekleri aç</button>' +
      '        <button class="btn btn-sm" data-act="backup-file">' + ICONS.download + ' Yedek indir</button>' +
      '      </div>' +
      '      <p class="muted small" style="margin:10px 0 0">Yedekler tarayıcıda saklanır; dosyanızı ayrıca OneDrive/Drive klasöründe tutmanız önerilir.</p>' +
      '    </div></div>' +
      '  <div class="card"><div class="card-head"><div><h2>Kayıt güvenliği</h2></div></div>' +
      '    <div class="card-body" style="display:flex;flex-direction:column;gap:8px">' +
      '      <button class="btn btn-sm" style="justify-content:flex-start" data-act="open-trash">' + ICONS.archive + ' Çöp kutusu <span class="muted small">(' + (data.trash || []).length + ' kayıt)</span></button>' +
      '      <button class="btn btn-sm" style="justify-content:flex-start" data-act="open-audit">' + ICONS.history + ' İşlem günlüğü <span class="muted small">(' + (data.audit || []).length + ')</span></button>' +
      '      <button class="btn btn-sm" style="justify-content:flex-start" data-act="open-health">' + ICONS.shield + ' Dosya kontrolü</button>' +
      '    </div></div>' +
      '  <div class="card"><div class="card-head"><div><h2>Kullanıcılar</h2><div class="sub">Uygulama giriş hesapları</div></div>' +
      '    <button class="btn btn-sm" data-act="user-new">' + ICONS.plus + ' Yeni kullanıcı</button></div>' +
      '    <div class="table-wrap" style="max-height:none"><table class="data"><thead><tr><th>Ad soyad</th><th>Kullanıcı adı</th><th>Rol</th><th>Son giriş</th><th></th></tr></thead><tbody>' +
      (userRows || '<tr><td colspan="5">' + emptyState('users', 'Kullanıcı yok', 'Yeni kullanıcı ekleyin.', '') + '</td></tr>') +
      '</tbody></table></div>' +
      '    <div class="card-body" style="border-top:1px solid var(--line)">' +
      '      <p class="muted small" style="margin:0 0 10px">Bu giriş ekranı uygulamayı kilitler. Excel dosyasını açan biri verileri görebilir; dosyayı güvenli bir yerde tutun.</p>' +
      '      <button class="btn btn-sm" data-act="change-pass">Şifremi değiştir</button>' +
      '    </div></div>' +
      '  <div class="card"><div class="card-head"><div><h2>Çalışma tercihleri</h2></div></div>' +
      '    <div class="card-body">' +
      '      <label class="switch"><input type="checkbox" id="autoSaveChk"' + (S.autosave ? ' checked' : '') + '><span class="track"></span>' +
      '      <span>Her değişiklikte otomatik kaydet</span></label>' +
      '      <p class="muted small" style="margin:8px 0 0">Kapalıysa Ctrl+S ile veya sol alttaki "Kaydet" düğmesiyle kaydedin.</p>' +
      '    </div></div>' +
      '  <div class="card"><div class="card-head"><div><h2>Veri işlemleri</h2></div></div>' +
      '    <div class="card-body" style="display:flex;flex-direction:column;gap:8px">' +
      '      <button class="btn btn-sm" style="justify-content:flex-start" data-act="import-cari">' + ICONS.upload + ' Excel dosyasından cari aktar <span class="muted small">(mevcut veritabanına)</span></button>' +
      '      <button class="btn btn-sm" style="justify-content:flex-start" data-act="import-legacy">' + ICONS.upload + ' Eski dosyadan yeni veritabanı oluştur</button>' +
      '      <button class="btn btn-sm" style="justify-content:flex-start" data-act="new-file">' + ICONS.file + ' Yeni boş dosya oluştur</button>' +
      '      <button class="btn btn-sm btn-danger" style="justify-content:flex-start" data-act="clear-all">' + ICONS.trash + ' Tüm verileri sil</button>' +
      '    </div></div>' +
      '  <div class="card"><div class="card-body" style="display:flex;align-items:center;justify-content:space-between;gap:10px">' +
      '    <div><div class="strong">Sürüm ' + SURUM + '</div><div class="sub">' + YENILIKLER[0].t + ' · son güncelleme</div></div>' +
      '    <button class="btn btn-sm" data-act="open-changelog">' + ICONS.history + ' Yenilikler</button>' +
      '  </div></div>' +
      '</div>' +
      '</div>';
  }

  /** Yönetici olmayan kullanıcılar için sade ayarlar. */
  function viewSettingsKullanici() {
    var s = data.settings;
    return '<div class="grid-2 even">' +
      '<div class="card"><div class="card-head"><div><h2>Profilim</h2><div class="sub">Giriş bilgileri</div></div></div>' +
      '  <div class="card-body">' +
      '    <div class="kv"><span>Ad soyad</span><b>' + esc(S.user.ad) + '</b></div>' +
      '    <div class="kv"><span>Kullanıcı adı</span><b>' + esc(S.user.kullanici) + '</b></div>' +
      '    <div class="kv"><span>Yetki</span><b>' + (S.user.rol === 'YÖNETİCİ' ? 'Yönetici' : 'Kullanıcı') + '</b></div>' +
      '    <button class="btn btn-sm" style="margin-top:14px" data-act="change-pass">Şifremi değiştir</button>' +
      '  </div></div>' +
      '<div>' +
      '  <div class="card"><div class="card-head"><div><h2>Veri dosyası</h2><div class="sub">Tüm kayıtlar Excel dosyasında tutulur</div></div></div>' +
      '    <div class="card-body">' +
      '      <div class="kv"><span>Dosya</span><b>' + esc(S.file.name || '—') + '</b></div>' +
      '      <div class="kv"><span>Durum</span><b>' + (S.file.dirty ? '<span class="pill warn">Kaydedilmedi</span>' : '<span class="pill ok">Güncel</span>') + '</b></div>' +
      '      <div class="kv"><span>Son kayıt</span><b>' + (S.file.lastSaved ? dateTR(S.file.lastSaved.toISOString().slice(0, 10)) + ' ' + timeTR(S.file.lastSaved) : '—') + '</b></div>' +
      '      <div style="display:flex;gap:8px;margin-top:14px">' +
      '        <button class="btn btn-primary btn-sm" data-act="save">' + ICONS.save + ' Kaydet</button>' +
      '      </div>' +
      '      <p class="muted small" style="margin:12px 0 0">Firma bilgileri ve veri işlemleri yalnızca yönetici tarafından değiştirilebilir.</p>' +
      '    </div></div>' +
      '  <div class="card"><div class="card-head"><div><h2>Çalışma tercihleri</h2></div></div>' +
      '    <div class="card-body">' +
      '      <label class="switch"><input type="checkbox" id="autoSaveChk"' + (S.autosave ? ' checked' : '') + '><span class="track"></span>' +
      '      <span>Her değişiklikte otomatik kaydet</span></label>' +
      '    </div></div>' +
      '</div></div>';
  }

  /* ------------------------------------------------------------------ */
  /* Sipariş formu                                                       */
  /* ------------------------------------------------------------------ */
  function uniq(list) {
    var seen = {}, out = [];
    list.forEach(function (v) {
      var s = String(v === null || v === undefined ? '' : v).trim();
      if (!s || seen[s.toLocaleLowerCase('tr-TR')]) return;
      seen[s.toLocaleLowerCase('tr-TR')] = 1;
      out.push(s);
    });
    return out;
  }

  function datalist(id, values) {
    return '<datalist id="' + id + '">' + values.map(function (v) { return '<option value="' + esc(v) + '">'; }).join('') + '</datalist>';
  }

  function openOrderForm(order, kopya, sablon) {
    var isEdit = !!order;
    var kaynak = order || kopya || null;
    var o = order || (kopya ? Object.assign({}, kopya, {
      sipno: Core.nextOrderNo(data), tarih: Core.todayISO()
    }) : {
      cariId: (sablon && sablon.cariId) || S.ui.cariId || Core.defaultCariId(data),
      sipno: Core.nextOrderNo(data), tarih: Core.todayISO(),
      model: '', renk: '', asorti: data.settings.varsayilanAsorti, adet: '', fiyat: '',
      tur: 'DİĞER', grup: '', kod: '', not: ''
    });
    var resim = order ? data.images[order.id] : null;
    var shippedNow = order ? (Core.shippedMap(data)[order.id] || 0) : 0;
    var kilit = isEdit && shippedNow > 0;
    var models = uniq((data.modeller || []).map(function (m) { return m.model; })
      .concat(data.orders.map(function (x) { return x.model; }))).sort();
    var renkler = uniq(data.orders.map(function (x) { return x.renk; })
      .concat((data.modeller || []).reduce(function (a, m) { return a.concat(m.renkler || []); }, []))).sort();
    var gruplar = uniq(data.orders.map(function (x) { return x.grup; }).concat(['MERDANE', 'BATTAL', 'SPOR', 'BOT', 'TERLİK']));
    var turler = uniq(data.orders.map(function (x) { return x.tur; }).concat(['DİĞER', 'MERDANE', 'BOT', 'SPOR', 'TERLİK', 'ÇİZME']));

    var lines = [];
    if (kaynak) {
      lines = Matris.orderLinesOf(data, kaynak.id).map(function (l) {
        return { id: isEdit ? l.id : 0, renk: l.renk || '', mod: l.mod || 'ESKI', beden: Core.num(l.beden), koli: Core.num(l.koli), koliIci: Core.num(l.koliIci), cift: Core.num(l.cift) };
      });
      if (kopya && lines.length === 1 && lines[0].mod === 'ESKI') lines = [];
    }
    if (!lines.length) {
      lines = [{ id: 0, renk: o.renk || '', mod: 'ASORTILI', beden: 0, koli: 1, koliIci: Core.num(o.asorti) || 10, cift: 0, auto: true }];
    }

    var body =
      '<form id="orderForm" class="form-grid g4" autocomplete="off">' +
      '  <div class="field span2"><label for="ofCari">Cari hesap' + (kilit ? ' <span class="hint">(sevk başladı, değiştirilemez)</span>' : '') + '</label>' +
      '    <select id="ofCari" class="select"' + (kilit ? ' disabled' : '') + '>' + cariOptions(o.cariId, false) + '</select></div>' +
      '  <div class="field span2"><label for="ofSipno">Sipariş no</label><input id="ofSipno" class="input num" type="number" min="1" value="' + esc(o.sipno) + '"></div>' +
      '  <div class="field span3"><label for="ofModel">Model *</label><input id="ofModel" class="input" required value="' + esc(o.model) + '" list="dlOModels" placeholder="Model kartından seçin">' + datalist('dlOModels', models) + '</div>' +
      '  <div class="field"><label for="ofTarih">Tarih</label><input id="ofTarih" class="input" type="date" value="' + esc(o.tarih) + '"></div>' +
      '  <div class="field span2"><label for="ofFiyat">Birim fiyat <span class="hint">(tüm renkler)</span></label><input id="ofFiyat" class="input num" type="text" inputmode="decimal" value="' + esc(o.fiyat) + '"><div class="sub" id="ofListe" style="font-size:10.5px;min-height:14px"></div></div>' +
      '  <div class="field span2"><label for="ofNot">Not</label><input id="ofNot" class="input" value="' + esc(o.not) + '"></div>' +
      '  <div class="field"><label for="ofTur">Tür</label><select id="ofTur" class="select">' + turler.map(function (t) { return '<option' + (o.tur === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
      '  <div class="field"><label for="ofGrup">Grup</label><input id="ofGrup" class="input" value="' + esc(o.grup) + '" list="dlOGrup">' + datalist('dlOGrup', gruplar) + '</div>' +
      '  <div class="field span2"><label for="ofKod">Kod <span class="hint">(boşsa otomatik)</span></label><input id="ofKod" class="input" value="' + esc(o.kod) + '"></div>' +
      '  <div class="span4" style="margin-top:2px">' +
      '    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">' +
      '      <label class="f" style="margin:0">Renk / beden satırları <span class="hint">(renkler model kartından; her beden ayrı satır)</span></label>' +
      '      <button type="button" class="btn btn-sm" id="ofAddLine"' + (kilit ? ' disabled' : '') + '>' + ICONS.plus + ' Satır ekle</button>' +
      '    </div>' +
      '    <div style="overflow:auto;border:1px solid var(--line);border-radius:10px">' +
      '      <table class="order-lines"><thead><tr><th style="min-width:112px">Renk</th><th style="min-width:96px">Mod</th><th style="width:78px">Beden</th><th style="width:72px">Koli</th><th style="width:78px">Koli içi</th><th class="right" style="width:66px">Çift</th><th style="width:30px"></th></tr></thead><tbody id="ofLines"></tbody></table>' +
      '    </div>' +
      '  </div>' +
      '  <div class="span4" id="ofSummary" style="display:flex;gap:22px;font-size:12.5px;color:var(--ink-2);flex-wrap:wrap"></div>' +
      '  <div class="span4" style="display:flex;gap:14px;align-items:center;padding:12px;background:var(--surface-2);border:1px solid var(--line);border-radius:10px">' +
      '    <div class="thumb lg" id="ofThumb" style="' + (resim ? 'background-image:url(&quot;' + esc(resim) + '&quot;)' : '') + '">' + (resim ? '' : 'RESİM') + '</div>' +
      '    <div style="flex:1;min-width:0">' +
      '      <div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '        <button type="button" class="btn btn-sm" data-img-pick>' + ICONS.image + ' Resim seç</button>' +
      '        <button type="button" class="btn btn-sm btn-ghost" data-img-clear>Kaldır</button>' +
      '      </div>' +
      '      <p class="muted small" style="margin:8px 0 0">Resmi yapıştırabilir (Ctrl+V) veya sürükleyebilirsiniz.</p>' +
      '    </div>' +
      '    <input type="file" accept="image/*" id="ofImage" class="hidden">' +
      '  </div>' +
      '  <div class="span4 auth-err" id="ofErr"></div>' +
      '</form>';

    var m = openModal({
      title: isEdit ? 'Siparişi düzenle' : 'Yeni sipariş',
      subtitle: isEdit ? '#' + o.sipno + ' · ' + o.model : 'Renk ve beden satırlarıyla sipariş',
      size: 'wide',
      body: body,
      footer: '<button class="btn" data-modal-close>Vazgeç</button>' +
        (isEdit || kilit ? '' : '<button class="btn" type="button" id="ofSaveNew">' + ICONS.plus + ' Kaydet ve yeni</button>') +
        '<button class="btn btn-primary" type="submit" form="orderForm">' + ICONS.check + ' ' + (isEdit ? 'Değişiklikleri kaydet' : 'Siparişi kaydet') + '</button>'
    });
    var wrap = m.el;
    var form = $('#orderForm', wrap);
    var currentImage = resim;

    function kart() { return Core.modelKart(data, $('#ofModel', wrap).value); }
    function perBox() {
      var k = kart();
      return k ? (Matris.asortiToplam(k.asortiSablon) || Core.num(k.asorti)) : 0;
    }
    function bedenler() {
      var k = kart();
      return k ? Matris.bedenler(k.kategori) : [];
    }
    function lineCift(l) {
      if (l.mod === 'ESKI') return Core.num(l.cift);
      if (l.mod === 'ACIK') return Core.num(l.koli) * Core.num(l.koliIci);
      return Core.num(l.koli) * (perBox() || Core.num(l.koliIci));
    }
    function renkSecenekleri(l) {
      var k = kart();
      var list = (k && k.renkler ? k.renkler.slice() : []);
      if (l.renk && list.indexOf(l.renk) < 0) list.push(l.renk);
      if (!list.length) return '<option value="">Modelde renk yok</option>';
      return '<option value="">Renk seçin…</option>' + list.map(function (r) {
        return '<option value="' + esc(r) + '"' + (r === l.renk ? ' selected' : '') + '>' + esc(r) + '</option>';
      }).join('');
    }
    function renderLines() {
      var pb = perBox();
      var sizes = bedenler();
      $('#ofLines', wrap).innerHTML = lines.map(function (l, i) {
        var renk = '<select data-f="renk" data-i="' + i + '"' + (kilit ? ' disabled' : '') + '>' + renkSecenekleri(l) + '</select>';
        var beden = l.mod === 'ACIK'
          ? (sizes.length
            ? '<select data-f="beden" data-i="' + i + '"' + (kilit ? ' disabled' : '') + '>' + sizes.map(function (s) { return '<option value="' + s + '"' + (s === Core.num(l.beden) ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>'
            : '<input data-f="beden" data-i="' + i + '" type="number" min="16" max="50" value="' + esc(l.beden || '') + '"' + (kilit ? ' disabled' : '') + '>')
          : '<span class="muted">—</span>';
        var koliIci = (l.mod === 'ACIK' || l.mod === 'ESKI')
          ? '<input data-f="koliIci" data-i="' + i + '" type="number" min="1" step="1" value="' + esc(l.koliIci || '') + '"' + (kilit ? ' disabled' : '') + '>'
          : '<span class="muted">' + (pb || '—') + '</span>';
        var mod = '<select data-f="mod" data-i="' + i + '"' + (kilit || l.mod === 'ESKI' ? ' disabled' : '') + '>' +
          '<option value="ASORTILI"' + (l.mod === 'ASORTILI' ? ' selected' : '') + '>Asortili</option>' +
          '<option value="ACIK"' + (l.mod === 'ACIK' ? ' selected' : '') + '>Açık</option>' +
          (l.mod === 'ESKI' ? '<option value="ESKI" selected>Eski</option>' : '') + '</select>';
        return '<tr data-row="' + i + '">' +
          '<td>' + renk + '</td>' +
          '<td>' + mod + '</td>' +
          '<td>' + beden + '</td>' +
          '<td><input data-f="koli" data-i="' + i + '" type="number" min="0" step="1" value="' + esc(l.koli || '') + '"' + (kilit || l.mod === 'ESKI' ? ' disabled' : '') + '></td>' +
          '<td>' + koliIci + '</td>' +
          '<td class="right strong" data-cift="' + i + '">' + nf0(lineCift(l)) + '</td>' +
          '<td>' + (kilit ? '' : '<button type="button" class="btn btn-icon danger" data-del="' + i + '" title="Satırı kaldır">×</button>') + '</td>' +
          '</tr>';
      }).join('');
      refresh();
    }
    function refresh() {
      var koli = 0, cift = 0;
      lines.forEach(function (l) { koli += Core.num(l.koli); cift += lineCift(l); });
      var fiyat = Core.num($('#ofFiyat', wrap).value);
      $('#ofSummary', wrap).innerHTML =
        '<span><b>' + nf1(koli) + '</b> koli</span>' +
        '<span><b>' + nf0(cift) + '</b> çift</span>' +
        '<span><b>' + money(cift * fiyat) + '</b> toplam</span>' +
        '<span class="muted">' + lines.length + ' satır</span>';
      lines.forEach(function (l, i) {
        var el = $('[data-cift="' + i + '"]', wrap);
        if (el) el.textContent = nf0(lineCift(l));
      });
      var k = kart();
      var el = $('#ofListe', wrap);
      if (el) {
        if (!k) { el.textContent = ''; }
        else {
          var marj = Core.num(k.fiyat) > 0 ? (Core.num(k.fiyat) - Core.num(k.maliyet)) / Core.num(k.fiyat) * 100 : 0;
          el.innerHTML = 'Liste: <b>' + money(k.fiyat) + '</b> · Marj %' + nf1(marj) + (k.renkler && k.renkler.length ? ' · ' + k.renkler.length + ' renk' : '');
        }
      }
    }

    function syncFromDom() {
      lines.forEach(function (l, i) {
        var row = $('[data-row="' + i + '"]', wrap);
        if (!row) return;
        ['renk', 'mod', 'beden', 'koli', 'koliIci'].forEach(function (f) {
          var el = $('[data-f="' + f + '"][data-i="' + i + '"]', wrap);
          if (!el) return;
          if (f === 'renk') l.renk = el.value;
          else if (f === 'mod') l.mod = el.value;
          else if (f === 'beden') l.beden = Core.num(el.value);
          else if (f === 'koli') l.koli = Core.num(el.value);
          else if (f === 'koliIci') l.koliIci = Core.num(el.value);
        });
      });
    }

    $('#ofLines', wrap).addEventListener('input', function (e) {
      var el = e.target.closest('[data-f]');
      if (!el) return;
      syncFromDom();
      refresh();
    });
    $('#ofLines', wrap).addEventListener('change', function (e) {
      var el = e.target.closest('[data-f]');
      if (!el) return;
      syncFromDom();
      if (el.getAttribute('data-f') === 'mod') {
        var i = Core.num(el.getAttribute('data-i'));
        lines[i].auto = false;
        if (lines[i].mod === 'ACIK' && !lines[i].beden) lines[i].beden = bedenler()[0] || 0;
        if (lines[i].mod === 'ASORTILI') lines[i].koliIci = perBox();
        renderLines();
      } else {
        refresh();
      }
    });
    $('#ofLines', wrap).addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]');
      if (!b || kilit) return;
      lines.splice(Core.num(b.getAttribute('data-del')), 1);
      if (!lines.length) lines.push({ id: 0, renk: '', mod: 'ASORTILI', beden: 0, koli: 1, koliIci: perBox(), cift: 0 });
      renderLines();
    });
    $('#ofAddLine', wrap).addEventListener('click', function () {
      if (kilit) return;
      var k = kart();
      var sizes = bedenler();
      lines.push({
        id: 0, renk: (k && k.renkler && k.renkler[0]) || '', mod: perBox() ? 'ASORTILI' : 'ACIK',
        beden: sizes[0] || 0, koli: 1, koliIci: perBox() || 10, cift: 0, auto: false
      });
      renderLines();
    });

    var sonModel = $('#ofModel', wrap).value;
    function modelChanged() {
      var k = kart();
      var yeniModel = $('#ofModel', wrap).value;
      var modelDegisti = yeniModel !== sonModel;
      sonModel = yeniModel;
      if (modelDegisti && k && k.renkler && k.renkler.length) {
        lines.forEach(function (l) { if (k.renkler.indexOf(l.renk) < 0) l.renk = k.renkler[0]; });
      }
      if (modelDegisti && lines.length === 1 && lines[0].auto) {
        lines[0].mod = perBox() ? 'ASORTILI' : 'ACIK';
        if (perBox()) lines[0].koliIci = perBox();
        else { lines[0].beden = lines[0].beden || 40; lines[0].koliIci = lines[0].koliIci || 10; }
      }
      if (k && Core.num(k.fiyat) && !$('#ofFiyat', wrap).value) $('#ofFiyat', wrap).value = String(k.fiyat).replace('.', ',');
      if (k && lines.length === 1 && !lines[0].renk && k.renkler && k.renkler.length) lines[0].renk = k.renkler[0];
      if (k && lines.length === 1 && lines[0].mod === 'ASORTILI' && !lines[0].koliIci) lines[0].koliIci = perBox();
      if (!perBox() && lines.length === 1 && lines[0].mod === 'ASORTILI') { lines[0].mod = 'ACIK'; lines[0].beden = lines[0].beden || 40; lines[0].koliIci = lines[0].koliIci || 10; }
      renderLines();
    }
    $('#ofModel', wrap).addEventListener('change', modelChanged);
    $('#ofFiyat', wrap).addEventListener('input', refresh);
    modelChanged();

    // ---- resim ----
    function setImage(dataUrl) {
      currentImage = dataUrl;
      var th = $('#ofThumb', wrap);
      if (dataUrl) { th.style.backgroundImage = 'url("' + dataUrl + '")'; th.textContent = ''; }
      else { th.style.backgroundImage = ''; th.textContent = 'RESİM'; }
    }
    $('[data-img-pick]', wrap).addEventListener('click', function () { $('#ofImage', wrap).click(); });
    $('[data-img-clear]', wrap).addEventListener('click', function () { setImage(null); });
    $('#ofImage', wrap).addEventListener('change', function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) imageToDataUrl(f, function (url) { setImage(url); });
    });
    wrap.addEventListener('paste', function (e) {
      var items = (e.clipboardData && e.clipboardData.items) || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') === 0) {
          e.preventDefault();
          imageToDataUrl(items[i].getAsFile(), function (url) { setImage(url); toast('Resim eklendi', 'ok'); });
          break;
        }
      }
    });
    wrap.addEventListener('dragover', function (e) { e.preventDefault(); });
    wrap.addEventListener('drop', function (e) {
      e.preventDefault();
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && f.type.indexOf('image') === 0) imageToDataUrl(f, function (url) { setImage(url); });
    });

    function kaydet(yeni) {
      syncFromDom();
      var err = $('#ofErr', wrap);
      err.textContent = '';
      if (kilit) {
        try {
          Core.updateOrder(data, o.id, { cariId: o.cariId, sipno: $('#ofSipno', wrap).value, tarih: $('#ofTarih', wrap).value, model: o.model, renk: o.renk, asorti: o.asorti, adet: o.adet, fiyat: $('#ofFiyat', wrap).value, tur: o.tur, grup: o.grup, kod: o.kod, not: $('#ofNot', wrap).value, resim: currentImage || null });
          log('SİPARİŞ DÜZENLE', o.model + ' · not/fiyat');
          setDirty(true); m.close(); renderView(); updateChrome(); toast('Sipariş güncellendi', 'ok');
        } catch (ex) { err.textContent = ex.message; }
        return;
      }
      var pb = perBox();
      for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        if (!l.renk) l.renk = (kart() && kart().renkler[0]) || o.renk || '';
        if (!l.renk) { err.textContent = 'Her satırda renk seçin. Model kartında renk tanımlı değilse Modeller → renkler.'; return; }
        if (l.mod === 'ACIK' && !l.beden) { err.textContent = 'Açık satırda beden seçin.'; return; }
        if (l.mod === 'AÇIK' || l.mod === 'ACIK') { if (Core.num(l.koliIci) <= 0) { err.textContent = 'Açık satırda koli içi girin.'; return; } }
        if (l.mod === 'ASORTILI' && !pb) { err.textContent = 'Model kartında asorti tanımlı değil; açık satır kullanın.'; return; }
        if (Core.num(l.koli) <= 0) { err.textContent = 'Her satırda koli girin.'; return; }
      }
      var toplamKoli = 0, toplamCift = 0;
      lines.forEach(function (l) { toplamKoli += Core.num(l.koli); toplamCift += lineCift(l); });
      if (!toplamCift) { err.textContent = 'Sipariş çifti sıfır.'; return; }
      var ilk = lines[0];
      var payload = {
        cariId: Core.num($('#ofCari', wrap).value),
        sipno: $('#ofSipno', wrap).value,
        tarih: $('#ofTarih', wrap).value,
        model: $('#ofModel', wrap).value,
        renk: ilk.renk,
        asorti: ilk.koliIci || pb || 1,
        adet: toplamCift,
        fiyat: $('#ofFiyat', wrap).value,
        tur: $('#ofTur', wrap).value,
        grup: $('#ofGrup', wrap).value,
        kod: $('#ofKod', wrap).value,
        not: $('#ofNot', wrap).value,
        resim: currentImage || null
      };
      try {
        var kayit = isEdit ? Core.updateOrder(data, o.id, payload) : Core.addOrder(data, payload);
        if (!isEdit) data.orderLines = (data.orderLines || []).filter(function (l) { return l.orderId !== kayit.id; });
        else data.orderLines = (data.orderLines || []).filter(function (l) { return l.orderId !== kayit.id; });
        lines.forEach(function (l) {
          var c = lineCift(l);
          data.orderLines.push({
            id: Core.nextId(data.orderLines),
            orderId: kayit.id,
            renk: l.renk,
            mod: l.mod,
            beden: l.mod === 'ACIK' ? Core.num(l.beden) : 0,
            koli: Core.num(l.koli),
            koliIci: l.mod === 'ACIK' ? Core.num(l.koliIci) : (pb || Core.num(l.koliIci)),
            cift: c
          });
        });
        log(isEdit ? 'SİPARİŞ DÜZENLE' : 'SİPARİŞ EKLE', kayit.model + ' · ' + nf0(toplamKoli) + ' koli · ' + nf0(toplamCift) + ' çift · ' + cariAdi(kayit.cariId));
        setDirty(true);
        m.close();
        renderView();
        updateChrome();
        toast(isEdit ? 'Sipariş güncellendi' : 'Sipariş eklendi', 'ok');
        if (yeni) setTimeout(function () { openOrderForm(null, null, { cariId: payload.cariId }); }, 150);
      } catch (ex) { err.textContent = ex.message; }
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); kaydet(false); });
    var yeniKaydet = false;
    var saveNew = $('#ofSaveNew', wrap);
    if (saveNew) saveNew.addEventListener('click', function () { yeniKaydet = true; kaydet(true); });
  }

  function copyOrder(id) {
    var o = findOrder(id);
    if (!o) return;
    openOrderForm(null, o);
  }

  function fillCart() {
    var cid = shipCariId();
    if (!cid) { toast('Önce cari hesap seçin.', 'err'); return; }
    normalizeCart();
    var mevcut = {};
    S.ui.cart.forEach(function (c) { mevcut[c.lineId] = 1; });
    var eklenen = 0;
    data.orders.forEach(function (o) {
      if (o.cariId !== cid) return;
      Matris.orderLinesOf(data, o.id).forEach(function (l) {
        if (mevcut[l.id]) return;
        var info = Core.lineInfo(data, l);
        if (info.kalan <= 0) return;
        S.ui.cart.push({ lineId: l.id, orderId: o.id, cift: info.kalan, koli: info.kalanKoli, fiyat: o.fiyat });
        eklenen++;
      });
    });
    if (!eklenen) { toast('Eklenecek kalan satır yok.', ''); return; }
    renderView();
    toast(eklenen + ' satır sepete eklendi', 'ok');
  }

  function trashRestore(id) {
    try {
      var item = Core.restoreTrash(data, id, S.user ? (S.user.ad || S.user.kullanici) : '');
      setDirty(true);
      closeModals();
      renderView();
      updateChrome();
      toast('Geri yüklendi: ' + item.ad, 'ok');
      setTimeout(openTrash, 180);
    } catch (e) { toast(e.message, 'err'); }
  }

  function trashPurge(id) {
    confirmDialog({ title: 'Kalıcı olarak silinsin mi?', message: 'Bu kayıt çöp kutusundan tamamen silinecek.', confirmText: 'Kalıcı sil', danger: true })
      .then(function (ok) {
        if (!ok) return;
        Core.trashPurge(data, id);
        setDirty(true);
        closeModals();
        toast('Kalıcı olarak silindi', 'ok');
        setTimeout(openTrash, 150);
      });
  }

  function openInvoiceForm(id) {
    var s = findShipment(id);
    if (!s) return;
    var m = openModal({
      title: 'Fatura bilgisi',
      subtitle: 'Fiş #' + s.fisNo + ' · ' + (s.cari || ''),
      body: '<form id="invForm" class="form-grid g2">' +
        '  <div class="field"><label for="invNo">Fatura no</label><input id="invNo" class="input" value="' + esc(s.faturaNo || '') + '"></div>' +
        '  <div class="field"><label for="invDate">Fatura tarihi</label><input id="invDate" type="date" class="input" value="' + esc(s.faturaTarih || '') + '"></div>' +
        '  <div class="auth-err span2" id="invErr"></div>' +
        '</form>',
      footer: '<button class="btn" data-modal-close>Vazgeç</button>' +
        '<button class="btn btn-primary" type="submit" form="invForm">' + ICONS.check + ' Kaydet</button>'
    });
    $('#invForm', m.el).addEventListener('submit', function (e) {
      e.preventDefault();
      try {
        Core.updateShipment(data, id, {
          faturaNo: $('#invNo', m.el).value,
          faturaTarih: $('#invDate', m.el).value
        });
        log('FATURA BİLGİSİ', '#' + s.fisNo + ' · ' + ($('#invNo', m.el).value || '—'));
        setDirty(true);
        m.close();
        renderView();
        toast('Fatura bilgisi kaydedildi', 'ok');
      } catch (ex) { $('#invErr', m.el).textContent = ex.message; }
    });
  }

  function removeOrder(id) {
    var o = findOrder(id);
    if (!o) return;
    confirmDialog({
      title: 'Sipariş silinsin mi?',
      message: '#' + o.sipno + ' · ' + o.model + ' siparişi kalıcı olarak silinecek.',
      confirmText: 'Sil', danger: true
    }).then(function (ok) {
      if (!ok) return;
      try {
        Core.deleteOrder(data, id, S.user ? (S.user.ad || S.user.kullanici) : '');
        log('SİPARİŞ SİL', o.model + ' · #' + o.sipno);
        setDirty(true); renderView(); updateChrome();
        toast('Sipariş silindi (çöp kutusundan geri alınabilir)', 'ok');
      } catch (e) { toast(e.message, 'err'); }
    });
  }

  function removeLedger(id) {
    confirmDialog({ title: 'Hareket silinsin mi?', message: 'Cari hesap kaydı kalıcı olarak silinecek.', confirmText: 'Sil', danger: true })
      .then(function (ok) {
        if (!ok) return;
        try {
          Core.deleteLedgerEntry(data, id, S.user ? (S.user.ad || S.user.kullanici) : '');
          log('HAREKET SİL', 'cari hareket #' + id);
          setDirty(true); renderView();
          toast('Hareket silindi (çöp kutusundan geri alınabilir)', 'ok');
        } catch (e) { toast(e.message, 'err'); }
      });
  }

  function removeShipment(id) {
    var s = findShipment(id);
    if (!s) return;
    confirmDialog({
      title: 'Sevk fişi silinsin mi?',
      message: '#' + s.fisNo + ' numaralı sevk fişi, cari kayıtları ve stok düşümü geri alınacak.',
      confirmText: 'Fişi sil', danger: true
    }).then(function (ok) {
      if (!ok) return;
      Core.deleteShipment(data, id, S.user ? (S.user.ad || S.user.kullanici) : '');
      log('FİŞ SİL', '#' + s.fisNo + ' · ' + (s.cari || ''));
      setDirty(true); renderView(); updateChrome();
      toast('Sevk fişi silindi (çöp kutusundan geri alınabilir)', 'ok');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Sepet                                                               */
  /* ------------------------------------------------------------------ */
  function shipOrder(id) {
    var o = findOrder(id);
    if (!o) return;
    var ls = Matris.orderLinesOf(data, id).filter(function (l) { return Core.lineInfo(data, l).kalan > 0; });
    if (!ls.length) { toast('Bu siparişin kalanı yok.', 'err'); return; }
    if (ls.length === 1) { addToCart(ls[0].id, true); return; }
    S.ui.shipCariId = o.cariId;
    S.ui.shipSearch = o.model;
    if (S.view === 'ship') renderView(); else go('ship');
    toast('Siparişin renk/beden satırını listeden seçin.', '');
  }

  function addToCart(lineId, jump) {
    normalizeCart();
    var l = findLine(lineId);
    if (!l) return;
    var o = findOrder(l.orderId);
    if (!o) return;
    var info = Core.lineInfo(data, l);
    if (info.kalan <= 0) { toast('Bu satırın kalanı yok.', 'err'); return; }
    var scid = shipCariId();
    if (o.cariId !== scid) {
      if (S.ui.cariId) {
        toast('Bu sipariş ' + cariAdi(o.cariId) + ' carisine ait. Üstten o cariyi seçin.', 'err');
        return;
      }
      if (S.ui.cart.length && S.ui.cart.some(function (c) { var x = findOrder(c.orderId); return x && x.cariId !== o.cariId; })) {
        toast('Sepette farklı cariye ait satır var. Önce sepeti temizleyin.', 'err');
        return;
      }
      S.ui.shipCariId = o.cariId;
      S.ui.cart = [];
      toast('Cari ' + cariAdi(o.cariId) + ' olarak değiştirildi.', '');
    }
    if (!S.ui.cart.some(function (c) { return c.lineId === l.id; })) {
      S.ui.cart.push({ lineId: l.id, orderId: o.id, cift: info.kalan, koli: info.kalanKoli, fiyat: o.fiyat });
    }
    if (S.view !== 'ship') go('ship');
    else renderView();
  }

  function removeFromCart(lineId) {
    S.ui.cart = S.ui.cart.filter(function (c) { return c.lineId !== lineId; });
    renderView();
  }

  function updateCartField(input) {
    var id = Core.num(input.dataset.id);
    var field = input.dataset.cart;
    var line = S.ui.cart.filter(function (c) { return c.lineId === id; })[0];
    var l = findLine(id);
    if (!line || !l) return;
    var per = linePerBox(l) || 1;
    var val = Core.num(input.value);
    if (field === 'koli') {
      line.koli = val;
      line.cift = Math.round(val * per * 1000) / 1000;
      var ciftInput = $('[data-cart="cift"][data-id="' + id + '"]');
      if (ciftInput) ciftInput.value = nf1(line.cift);
    } else if (field === 'cift') {
      line.cift = val;
      line.koli = Math.round((val / per) * 1000) / 1000;
      var koliInput = $('[data-cart="koli"][data-id="' + id + '"]');
      if (koliInput) koliInput.value = nf1(line.koli);
    } else {
      line.fiyat = val;
    }
    var tutarCell = $('[data-line-tutar="' + id + '"]');
    if (tutarCell) tutarCell.textContent = money(line.cift * Core.num(line.fiyat));
    refreshCartSummary();
  }

  function refreshCartSummary() {
    var t = cartTotals();
    var sum = $('.ship-summary');
    if (sum) {
      var vals = sum.querySelectorAll('b');
      if (vals[0]) vals[0].textContent = nf1(t.koli);
      if (vals[1]) vals[1].textContent = nf0(t.cift);
      if (vals[2]) vals[2].textContent = money(t.tutar);
    }
    var cnt = $('#cartCount');
    if (cnt) cnt.textContent = S.ui.cart.length + ' satır';
    var btn = $('[data-act="ship-create"]');
    if (btn) btn.disabled = !S.ui.cart.length || cartHasError();
  }

  function cartHasError() {
    return S.ui.cart.some(function (c) {
      var l = findLine(c.lineId);
      if (!l) return true;
      var info = Core.lineInfo(data, l);
      var cift = Core.num(c.cift);
      return cift <= 0 || cift > info.kalan + 0.001;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Yardım                                                              */
  /* ------------------------------------------------------------------ */
  function openHelp() {
    openModal({
      title: 'Nasıl kullanılır?',
      subtitle: 'Kısa kullanım kılavuzu',
      size: 'wide',
      body:
        '<div class="help-grid">' +
        '  <div class="help-step"><b>1</b><div><h3>Cari seçin veya ekleyin</h3><p>Üstteki <b>Cari</b> kutusundan çalıştığınız müşteriyi seçin. “Tüm cariler” seçeneğiyle hepsini birlikte görürsünüz. Yeni müşteri için <b>Cariler → Yeni cari</b>; açılış bakiyesi girebilirsiniz.</p></div></div>' +
        '  <div class="help-step"><b>2</b><div><h3>Sipariş ekleyin</h3><p>“Siparişler → Yeni sipariş”. Cari otomatik seçili gelir; model, renk, asorti (koliye giren çift), sipariş çifti ve fiyatı girin. Resmi sürükleyip bırakabilir veya Ctrl+V ile yapıştırabilirsiniz.</p></div></div>' +
        '  <div class="help-step"><b>3</b><div><h3>Sevk fişi oluşturun</h3><p>“Sevk İşlemi” ekranında siparişi seçin, koli veya çift adedini yazın. Fiş no ve tarih otomatik gelir. Önizlemede <b>A4 / A5</b> seçip yazdırabilirsiniz.</p></div></div>' +
        '  <div class="help-step"><b>4</b><div><h3>Cari hesap kendiliğinden işlenir</h3><p>Sevk edilen her model o cariye borç olarak yazılır, siparişin kalanı düşer. Tahsilat ve masrafları “Cari Hesap → Hareket ekle” ile girin.</p></div></div>' +
        '</div>' +
        '<div class="help-note">' +
        '  <h3>Giriş ve kullanıcılar</h3>' +
        '  <p>Uygulama açılışta kullanıcı adı ve şifre ister. Yönetici; <b>Ayarlar → Kullanıcılar</b> bölümünden yeni kullanıcı ekleyebilir, şifre sıfırlayabilir ve yetki verebilir. Sol alttaki kilit simgesiyle oturumu kapatabilirsiniz.</p>' +
        '</div>' +
        '<div class="help-note">' +
        '  <h3>Görünüm ve veritabanı</h3>' +
        '  <p>Sol üstteki ad, alt başlık, kısa işaret ve logo <b>Ayarlar → Firma ve görünüm</b> bölümünden değiştirilir. Yeni boş dosya oluştururken varsayılan dosya adı kullanılır (ör. <b>Database</b>). Başka müşterilerin Excel dosyalarını <b>Ayarlar → Excel dosyasından cari aktar</b> ile aynı veritabanına ekleyebilirsiniz.</p>' +
        '</div>' +
        '<div class="help-note">' +
        '  <h3>Hız ve güvenlik</h3>' +
        '  <ul><li><b>Ctrl+K</b>: model, cari veya fiş no ile hızlı arama.</li>' +
        '  <li><b>Modeller</b>: fiyat, maliyet, barkod ve sezon kartları; siparişte fiyat otomatik dolar.</li>' +
        '  <li>Sipariş listesinde <b>kopyala</b> simgesi benzer siparişi açar; formda <b>Enter</b> sonraki alana geçer, <b>Ctrl+Enter</b> kaydeder.</li>' +
        '  <li>Sevk ekranında <b>Tüm kalanları ekle</b> ile cariye ait kalanların tamamını tek fişe alabilirsiniz.</li>' +
        '  <li>Ayarlar → <b>Yedekler</b> (son 7 gün), <b>Çöp kutusu</b> (30 gün) ve <b>İşlem günlüğü</b>.</li></ul>' +
        '</div>' +
        '<div class="help-note">' +
        '  <h3>Excel dosyanız</h3>' +
        '  <p>Bütün kayıtlar seçtiğiniz <b>.xlsx</b> dosyasında; <b>CARİLER</b>, <b>KULLANICILAR</b>, <b>MODEL KARTLARI</b>, <b>SİPARİŞLER</b>, <b>CARİ HESAP</b>, <b>SEVK FİŞLERİ</b>, <b>SEVK SATIRLARI</b>, <b>İŞLEM GÜNLÜĞÜ</b>, <b>ÇÖP KUTUSU</b> ve <b>AYARLAR</b> sayfalarında tutulur. Her kayıtta <b>CARİ ID</b> kolonu vardır; Excel’de cari bazlı filtreleyebilirsiniz.</p>' +
        '</div>' +
        '<div class="help-note">' +
        '  <h3>Püf noktaları</h3>' +
        '  <ul><li>Sevk fişi silinirse stok ve cari kayıtları geri alınır.</li><li>Farklı carilerin siparişleri aynı sevk fişine eklenemez.</li><li>Kalanı sıfır olan siparişler “Tamamlandı” görünür.</li><li>Ekstre ve raporlar A4 olarak yazdırılabilir.</li><li>Değişiklikler otomatik kaydedilir; Ctrl+S ile de kaydedebilirsiniz. Dosyanızı ara ara “Ayarlar → Yedek indir” ile yedekleyin.</li></ul>' +
        '</div>',
      footer: '<button class="btn btn-primary" data-modal-close>Anladım</button>'
    });
  }

  function createShipmentFromCart() {
    normalizeCart();
    if (!S.ui.cart.length) { toast('Önce sipariş ekleyin.', 'err'); return; }
    var tarih = $('#shipTarih') ? $('#shipTarih').value : S.ui.shipTarih;
    var fisNo = $('#shipFisNo') ? Core.num($('#shipFisNo').value) : S.ui.shipFisNo;
    var aciklama = $('#shipAciklama') ? $('#shipAciklama').value : S.ui.shipAciklama;
    var faturaNo = $('#shipFaturaNo') ? $('#shipFaturaNo').value : S.ui.shipFaturaNo;
    var faturaTarih = $('#shipFaturaTarih') ? $('#shipFaturaTarih').value : S.ui.shipFaturaTarih;
    try {
      var res = Core.createShipment(data, {
        cariId: shipCariId(),
        tarih: tarih, fisNo: fisNo, aciklama: aciklama,
        faturaNo: faturaNo, faturaTarih: faturaTarih,
        lines: S.ui.cart.map(function (c) {
          var o = findOrder(c.orderId);
          return { orderId: c.orderId, orderLineId: c.lineId, cift: c.cift, koli: c.koli, fiyat: c.fiyat !== '' ? c.fiyat : o.fiyat };
        })
      });
      log('SEVK FİŞİ', '#' + res.shipment.fisNo + ' · ' + (res.shipment.cari || '') + ' · ' + nf0(res.shipment.cift) + ' çift');
      S.ui.cart = [];
      S.ui.shipFisNo = Core.nextFisNo(data);
      S.ui.shipAciklama = '';
      S.ui.shipFaturaNo = '';
      S.ui.shipFaturaTarih = '';
      S.ui.shipTarih = tarih || Core.todayISO();
      setDirty(true);
      renderView();
      updateChrome();
      previewShipment(res.shipment.id);
      toast('Sevk fişi #' + res.shipment.fisNo + ' oluşturuldu', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  /* ------------------------------------------------------------------ */
  /* Yazdırma belgeleri                                                  */
  /* ------------------------------------------------------------------ */
  function docHeader(title, extraRight) {
    var s = data.settings;
    var logo = s.logo ? '<img src="' + esc(s.logo) + '" alt="">' : '';
    return '<div class="pf-top">' +
      '<div class="pf-brand">' + logo + '<div><div class="t1">' + esc(s.firmaAdi) + '</div>' +
      '<div class="t2">' + esc(s.firmaAdres || '') + (s.firmaTel ? ' · Tel: ' + esc(s.firmaTel) : '') + '</div></div></div>' +
      '<div class="pf-title"><b>' + esc(title || s.sevkBaslik || 'SEVK FİŞİ') + '</b><div class="t2">' + esc(extraRight || '') + '</div></div>' +
      '</div>';
  }

  function shipmentDocHtml(s, kagit) {
    var a5 = kagit === 'A5';
    var fisCari = Core.cariById(data, s.cariId) || { ad: s.cari || '', adres: '', tel: '' };
    var lines = Core.shipmentLines(data, s.id);
    var minRows = Math.max(a5 ? 8 : 10, lines.length);
    var rows = '';
    for (var i = 0; i < minRows; i++) {
      var l = lines[i];
      var img = '';
      if (l) {
        var o = findOrder(l.orderId);
        var src = o && data.images[o.id];
        if (src) img = '<img src="' + esc(src) + '" alt="">';
      }
      rows += '<tr><td class="imgcell">' + img + '</td>' +
        '<td class="model">' + (l ? esc(l.model) : '') +
        (l && (l.renk || l.mod) ? '<div style="font-weight:400;font-size:9.5px;color:#555">' + esc([l.renk, l.mod ? lineLabel(l) : ''].filter(Boolean).join(' · ')) + '</div>' : '') +
        '</td>' +
        '<td class="n">' + (l ? nf1(l.koli) : '') + '</td>' +
        '<td class="n">' + (l ? nf0(l.cift) : '') + '</td></tr>';
    }
    var totalKoli = lines.reduce(function (a, l) { return a + Core.num(l.koli); }, 0);
    var totalCift = lines.reduce(function (a, l) { return a + Core.num(l.cift); }, 0);
    var totalTutar = lines.reduce(function (a, l) { return a + Core.num(l.tutar); }, 0);

    // Beden dökümü: yalnızca sevk edilen, boş beden yok
    var sizeSet = {};
    lines.forEach(function (l) {
      Object.keys(l.dagilim || {}).forEach(function (sz) { if (Core.num(l.dagilim[sz])) sizeSet[sz] = 1; });
    });
    var sizes = Object.keys(sizeSet).map(Number).sort(function (a, b) { return a - b; });
    var sizeTable = '';
    if (sizes.length) {
      var colTotals = {};
      var body = lines.filter(function (l) {
        return Object.keys(l.dagilim || {}).some(function (sz) { return Core.num(l.dagilim[sz]); });
      }).map(function (l) {
        return '<tr><td>' + esc(l.renk || l.model) + '<div class="szsub">' + esc(lineLabel(l)) + '</div></td>' +
          sizes.map(function (sz) {
            var q = Core.num((l.dagilim || {})[sz]);
            if (q) colTotals[sz] = (colTotals[sz] || 0) + q;
            return '<td class="n">' + (q ? nf0(q) : '') + '</td>';
          }).join('') + '<td class="n strong">' + nf0(l.cift) + '</td></tr>';
      }).join('');
      sizeTable = '<div class="pf-sizes"><div class="pf-sizes-title">BEDEN DÖKÜMÜ · SEVK EDİLEN</div>' +
        '<table class="pf-table pf-mx"><thead><tr><th>RENK</th>' +
        sizes.map(function (sz) { return '<th class="n">' + sz + '</th>'; }).join('') +
        '<th class="n">TOPLAM</th></tr></thead><tbody>' + body + '</tbody>' +
        '<tfoot><tr><td>TOPLAM</td>' + sizes.map(function (sz) { return '<td class="n">' + nf0(colTotals[sz] || 0) + '</td>'; }).join('') +
        '<td class="n">' + nf0(totalCift) + '</td></tr></tfoot></table></div>';
    }

    return '<div class="print-doc' + (a5 ? ' a5' : '') + '">' +
      docHeader(data.settings.sevkBaslik || 'SEVK FİŞİ', '') +
      '<div class="pf-meta">' +
      '<div class="row"><span class="k">FİRMA</span><span class="v">' + esc(fisCari.ad) + '</span></div>' +
      '<div class="row"><span class="k">TARİH</span><span class="v">' + dateTR(s.tarih) + '</span></div>' +
      '<div class="row"><span class="k">ADRES</span><span class="v">' + esc(fisCari.adres || data.settings.firmaAdres || '') + '</span></div>' +
      '<div class="row"><span class="k">FİŞ NO</span><span class="v">' + esc(s.fisNo) + '</span></div>' +
      (s.faturaNo ? '<div class="row"><span class="k">FATURA</span><span class="v">' + esc(s.faturaNo) + (s.faturaTarih ? ' · ' + dateTR(s.faturaTarih) : '') + '</span></div>' : '') +
      '</div>' +
      '<table class="pf-table"><thead><tr><th style="width:62px">RESİM</th><th>MODEL BİLGİLERİ</th><th style="width:74px">KOLİ</th><th style="width:74px">ÇİFT</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td colspan="2">GENEL TOPLAM</td><td class="n">' + nf1(totalKoli) + '</td><td class="n">' + nf0(totalCift) + '</td></tr></tfoot>' +
      '</table>' +
      sizeTable +
      '<div class="pf-note">' + (s.aciklama ? 'Not: ' + esc(s.aciklama) : '') + '</div>' +
      '<div class="pf-note" style="text-align:right;font-weight:600">Tutar: ' + money(totalTutar) + '</div>' +
      '<div class="pf-sign"><div class="line">TESLİM EDEN</div><div class="line">TESLİM ALAN</div></div>' +
      '<div class="pf-foot"><span>' + esc(data.settings.firmaAdi) + '</span><span>' + esc(fisCari.ad) + ' · ' + dateTR(s.tarih) + '</span></div>' +
      '</div>';
  }

  function ekstreDocHtml(rows, from, to, cari) {
    var eksCari = cari || { ad: '' };
    var borc = rows.reduce(function (a, r) { return a + Core.num(r.borc); }, 0);
    var alacak = rows.reduce(function (a, r) { return a + Core.num(r.alacak); }, 0);
    var bakiye = borc - alacak;
    var body = rows.map(function (r) {
      return '<tr><td>' + dateTR(r.tarih) + '</td><td>' + esc(r.fisNo || '') + '</td>' +
        '<td>' + esc(r.aciklama) + '</td>' +
        '<td class="n">' + (Core.num(r.borc) ? nf2(r.borc) : '') + '</td>' +
        '<td class="n">' + (Core.num(r.alacak) ? nf2(r.alacak) : '') + '</td>' +
        '<td class="n">' + nf2(r.bakiye) + '</td></tr>';
    }).join('');
    return '<div class="print-doc">' +
      docHeader('CARİ HESAP EKSTRESİ', '') +
      '<div class="pf-meta">' +
      '<div class="row"><span class="k">CARİ</span><span class="v">' + esc(eksCari.ad) + '</span></div>' +
      '<div class="row"><span class="k">DÖNEM</span><span class="v">' + (from ? dateTR(from) : 'Başlangıç') + ' — ' + (to ? dateTR(to) : dateTR(Core.todayISO())) + '</span></div>' +
      '<div class="row"><span class="k">DÜZENLEME</span><span class="v">' + dateTR(Core.todayISO()) + '</span></div>' +
      '<div class="row"><span class="k">BAKİYE</span><span class="v">' + money(bakiye) + '</span></div>' +
      '</div>' +
      '<table class="pf-table ekstre-table"><thead><tr><th style="width:70px">TARİH</th><th style="width:50px">FİŞ</th><th>AÇIKLAMA</th><th style="width:80px">BORÇ</th><th style="width:80px">ALACAK</th><th style="width:84px">BAKİYE</th></tr></thead>' +
      '<tbody>' + (body || '<tr><td colspan="6" style="text-align:center">Kayıt yok</td></tr>') + '</tbody>' +
      '<tfoot><tr><td colspan="3">TOPLAM</td><td class="n">' + nf2(borc) + '</td><td class="n">' + nf2(alacak) + '</td><td class="n">' + nf2(bakiye) + '</td></tr></tfoot>' +
      '</table>' +
      '<div class="pf-sign"><div class="line">HESABI VEREN</div><div class="line">HESABI ALAN</div></div>' +
      '<div class="pf-foot"><span>' + esc(data.settings.firmaAdi) + '</span><span>' + esc(eksCari.ad) + '</span></div>' +
      '</div>';
  }

  function printHtml(html, kagit) {
    var a5 = kagit === 'A5';
    var st = document.getElementById('printPageStyle');
    if (!st) {
      st = document.createElement('style');
      st.id = 'printPageStyle';
      document.head.appendChild(st);
    }
    st.textContent = '@page { size: ' + (a5 ? 'A5 portrait' : 'A4 portrait') + '; margin: ' + (a5 ? '6mm' : '12mm') + '; }';
    var root = document.getElementById('printRoot');
    root.innerHTML = html;
    document.body.classList.add('printing');
    var done = function () {
      document.body.classList.remove('printing');
      setTimeout(function () { root.innerHTML = ''; }, 600);
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); }, 60);
  }

  function printShipment(id, kagit) {
    var s = findShipment(id);
    if (!s) return;
    printHtml(shipmentDocHtml(s, kagit || data.settings.kagit || 'A4'), kagit || data.settings.kagit || 'A4');
  }

  function previewShipment(id) {
    var s = findShipment(id);
    if (!s) return;
    var lines = Core.shipmentLines(data, s.id);
    var kagit = data.settings.kagit || 'A4';
    var m = openModal({
      title: 'Sevk fişi #' + s.fisNo,
      subtitle: dateTR(s.tarih) + ' · ' + lines.length + ' satır · ' + nf0(s.cift) + ' çift',
      size: 'xwide',
      body: '<div class="preview-wrap" id="pvDoc">' + shipmentDocHtml(s, kagit) + '</div>',
      footer:
        '<div class="seg" id="pvPaper" style="margin-right:auto">' +
        '  <button type="button" data-paper="A4"' + (kagit === 'A4' ? ' class="active"' : '') + '>A4</button>' +
        '  <button type="button" data-paper="A5"' + (kagit === 'A5' ? ' class="active"' : '') + '>A5</button>' +
        '</div>' +
        '<button class="btn" data-modal-close>Kapat</button>' +
        '<button class="btn btn-primary" id="btnPrintDoc">' + ICONS.print + ' Yazdır</button>'
    });

    function applyPaper(p) {
      kagit = p;
      $('#pvDoc', m.el).innerHTML = shipmentDocHtml(s, kagit);
      $$('#pvPaper [data-paper]', m.el).forEach(function (b) { b.classList.toggle('active', b.dataset.paper === kagit); });
    }
    $$('#pvPaper [data-paper]', m.el).forEach(function (b) {
      b.addEventListener('click', function () {
        applyPaper(b.dataset.paper);
        // varsayılanı hatırla
        data.settings.kagit = b.dataset.paper;
        setDirty(true);
      });
    });
    $('#btnPrintDoc', m.el).addEventListener('click', function () { m.close(); printShipment(id, kagit); });
  }

  function printEkstre() {
    if (!S.ui.cariId) { toast('Ekstre için önce bir cari seçin.', 'err'); return; }
    var rows = filteredLedger();
    if (!rows.length) { toast('Yazdırılacak hareket yok.', 'err'); return; }
    printHtml(ekstreDocHtml(rows, S.ui.ledgerFrom, S.ui.ledgerTo, activeCari()));
  }

  function printReport() {
    var ay = S.ui.reportMonth;
    var cid = S.ui.cariId;
    var rows = data.ledger.filter(function (r) {
      return (r.tarih || '').slice(0, 7) === ay && r.islem === 'SATIŞ' && (!cid || r.cariId === cid);
    });
    var byModel = {};
    rows.forEach(function (r) {
      var k = cid ? r.aciklama : String(r.cariId);
      byModel[k] = byModel[k] || { model: cid ? r.aciklama : cariAdi(r.cariId), koli: 0, cift: 0, tutar: 0 };
      byModel[k].koli += Core.num(r.koli);
      byModel[k].cift += Core.num(r.cift);
      byModel[k].tutar += Core.num(r.tutar);
    });
    var list = Object.keys(byModel).map(function (k) { return byModel[k]; });
    var toplamTutar = list.reduce(function (a, m) { return a + m.tutar; }, 0);
    var toplamCift = list.reduce(function (a, m) { return a + m.cift; }, 0);
    var body = list.map(function (m) {
      return '<tr><td>' + esc(m.model) + '</td><td class="n">' + nf1(m.koli) + '</td><td class="n">' + nf0(m.cift) + '</td><td class="n">' + nf2(m.tutar) + '</td></tr>';
    }).join('');
    printHtml('<div class="print-doc">' + docHeader('AYLIK SEVKİYAT RAPORU', monthName(ay)) +
      '<div class="pf-meta"><div class="row"><span class="k">DÖNEM</span><span class="v">' + monthName(ay) + '</span></div>' +
      '<div class="row"><span class="k">CARİ</span><span class="v">' + (cid ? esc(activeCari().ad) : 'Tüm cariler') + '</span></div>' +
      '<div class="row"><span class="k">TOPLAM</span><span class="v">' + money(toplamTutar) + '</span></div></div>' +
      '<table class="pf-table"><thead><tr><th>' + (cid ? 'MODEL' : 'CARİ') + '</th><th style="width:70px">KOLİ</th><th style="width:70px">ÇİFT</th><th style="width:100px">TUTAR</th></tr></thead><tbody>' + body + '</tbody>' +
      '<tfoot><tr><td>TOPLAM</td><td class="n">' + nf1(list.reduce(function (a, m) { return a + m.koli; }, 0)) + '</td><td class="n">' + nf0(toplamCift) + '</td><td class="n">' + nf2(toplamTutar) + '</td></tr></tfoot></table>' +
      '<div class="pf-foot"><span>' + esc(data.settings.firmaAdi) + '</span><span>DMR Sevk</span></div></div>');
  }

  function backup() {
    try {
      var bytes = writeBytes();
      var d = new Date();
      var stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
      download(bytes, 'DMR_YEDEK_' + stamp + '.xlsx');
      toast('Yedek indirildi', 'ok');
    } catch (e) { toast('Yedek oluşturulamadı: ' + e.message, 'err'); }
  }

  /* ------------------------------------------------------------------ */
  /* Sonradan bağlama                                                    */
  /* ------------------------------------------------------------------ */
  function afterRender() {
    // görünüme özel odak/tema işlemleri (şimdilik yok)
  }

  function renderOrdersTableOnly() {
    var box = $('#ordersTable');
    if (box) box.innerHTML = ordersTableHtml();
  }
  function renderLedgerTableOnly() {
    var box = $('#ledgerTable');
    if (box) box.innerHTML = ledgerTableHtml();
  }

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.dataset) return;
    if (t.dataset.role === 'order-search') {
      S.ui.orderSearch = t.value; S.ui.orderPage = 1; renderOrdersTableOnly();
    } else if (t.dataset.role === 'ledger-search') {
      S.ui.ledgerSearch = t.value; S.ui.ledgerPage = 1; renderLedgerTableOnly();
    } else if (t.dataset.role === 'ship-search') {
      S.ui.shipSearch = t.value;
      var list = $('#pickList');
      if (list) list.innerHTML = pickListHtml();
    } else if (t.dataset.role === 'ship-list-search') {
      S.ui.shipListSearch = t.value;
      S.ui.shipListPage = 1;
      renderView();
      var inp = $('[data-role="ship-list-search"]');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    } else if (t.dataset.role === 'report-month') {
      S.ui.reportMonth = t.value; renderView();
    } else if (t.dataset.cart) {
      updateCartField(t);
    } else if (t.id === 'shipTarih') {
      S.ui.shipTarih = t.value;
    } else if (t.id === 'shipAciklama') {
      S.ui.shipAciklama = t.value;
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || !t.dataset) return;
    if (t.dataset.role === 'ledger-from') { S.ui.ledgerFrom = t.value; S.ui.ledgerPage = 1; renderLedgerTableOnly(); }
    if (t.dataset.role === 'ledger-to') { S.ui.ledgerTo = t.value; S.ui.ledgerPage = 1; renderLedgerTableOnly(); }
    if (t.dataset.role === 'cari-select') { setActiveCari(Core.num(t.value)); }
    if (t.dataset.role === 'ship-cari') {
      S.ui.shipCariId = Core.num(t.value);
      S.ui.cart = [];
      renderView();
    }
    if (t.dataset.cart) {
      // hatalı satırları yeniden çiz
      var area = $('#cartArea');
      if (area) area.innerHTML = cartHtml();
    }
    if (t.id === 'autoSaveChk') {
      S.autosave = t.checked;
      try { localStorage.setItem('dmr:autosave', S.autosave ? '1' : '0'); } catch (err) { }
      toast(S.autosave ? 'Otomatik kaydetme açık' : 'Otomatik kaydetme kapalı', 'ok');
    }
    if (t.id === 'logoInput' && t.files && t.files[0]) {
      imageToDataUrl(t.files[0], function (url) {
        $('#logoData').value = url;
        var prev = $('#logoPreview');
        if (prev) { prev.style.backgroundImage = 'url("' + url + '")'; prev.textContent = ''; }
      });
    }
  });

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-filter]');
    if (el) {
      S.ui.orderFilter = el.dataset.filter;
      S.ui.orderPage = 1;
      $$('[data-filter]').forEach(function (b) { b.classList.toggle('active', b === el); });
      renderOrdersTableOnly();
      return;
    }
    var sort = e.target.closest('[data-sort]');
    if (sort) {
      var key = sort.dataset.sort;
      if (S.ui.orderSortKey === key) S.ui.orderSortDir = S.ui.orderSortDir === 'asc' ? 'desc' : 'asc';
      else { S.ui.orderSortKey = key; S.ui.orderSortDir = key === 'model' ? 'asc' : 'desc'; }
      S.ui.orderPage = 1;
      renderOrdersTableOnly();
      return;
    }
    var page = e.target.closest('[data-page]');
    if (page) {
      var role = page.dataset.page;
      var to = parseInt(page.dataset.to, 10);
      if (role === 'orders') { S.ui.orderPage = to; renderOrdersTableOnly(); }
      if (role === 'ledger') { S.ui.ledgerPage = to; renderLedgerTableOnly(); }
      if (role === 'shipments') { S.ui.shipListPage = to; renderView(); }
      return;
    }
    var lt = e.target.closest('[data-ledger-type]');
    if (lt) {
      S.ui.ledgerType = lt.dataset.ledgerType;
      S.ui.ledgerPage = 1;
      $$('[data-ledger-type]').forEach(function (b) { b.classList.toggle('active', b === lt); });
      renderLedgerTableOnly();
      return;
    }
    var logoPick = e.target.closest('[data-logo-pick]');
    if (logoPick) { $('#logoInput').click(); return; }
    var logoClear = e.target.closest('[data-logo-clear]');
    if (logoClear) {
      $('#logoData').value = '';
      var prev = $('#logoPreview');
      if (prev) { prev.style.backgroundImage = ''; prev.textContent = 'LOGO'; }
      return;
    }
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'settingsForm') {
      e.preventDefault();
      var fd = new FormData(f);
      data.settings.markaAdi = String(fd.get('markaAdi') || '').trim() || 'DMR';
      data.settings.markaAlt = String(fd.get('markaAlt') || '').trim();
      data.settings.markaKisa = (String(fd.get('markaKisa') || '').trim() || 'AF').slice(0, 3).toLocaleUpperCase('tr-TR');
      data.settings.dosyaAdi = String(fd.get('dosyaAdi') || '').trim().replace(/\.xlsx$/i, '') || 'DMR_VERI';
      data.settings.firmaAdi = String(fd.get('firmaAdi') || '').trim();
      data.settings.firmaAdres = String(fd.get('firmaAdres') || '').trim();
      data.settings.firmaTel = String(fd.get('firmaTel') || '').trim();
      data.settings.vergiDairesi = String(fd.get('vergiDairesi') || '').trim();
      data.settings.vergiNo = String(fd.get('vergiNo') || '').trim();
      data.settings.sevkBaslik = String(fd.get('sevkBaslik') || '').trim() || 'SEVK FİŞİ';
      data.settings.para = String(fd.get('para') || '₺');
      data.settings.kagit = String(fd.get('kagit') || 'A4') === 'A5' ? 'A5' : 'A4';
      data.settings.varsayilanAsorti = Core.num(fd.get('varsayilanAsorti')) || 10;
      data.settings.logo = String(fd.get('logo') || '');
      setDirty(true);
      renderShell();
      updateChrome();
      renderView();
      toast('Ayarlar kaydedildi', 'ok');
      return;
    }
  });

  /* ------------------------------------------------------------------ */
  /* Karşılama ekranı                                                    */
  /* ------------------------------------------------------------------ */
  function renderWelcome(ctx) {
    var handleName = '';
    if (ctx.handle && ctx.handle.name) handleName = ctx.handle.name;
    var cacheAt = ctx.cache && ctx.cache.at ? new Date(ctx.cache.at) : null;

    var html =
      '<div class="welcome"><div class="welcome-card">' +
      '<div class="welcome-head">' +
      '  <div class="logo">AF</div>' +
      '  <h1>DMR AYAKKABI</h1>' +
      '  <p>Sipariş, sevk fişi ve cari hesap takibi. Tüm verileriniz seçtiğiniz Excel dosyasında saklanır; internet bağlantısı gerekmez.</p>' +
      '</div>';

    if (handleName || cacheAt) {
      html += '<div class="resume-bar">' + ICONS.file + '<div class="grow"><b>' +
        (handleName ? 'Son dosya: ' + esc(handleName) : 'Kaydedilmemiş çalışma') + '</b>' +
        '<span>' + (handleName ? 'Kaldığınız yerden devam edin' : 'Son çalışma: ' + dateTR(cacheAt.toISOString().slice(0, 10)) + ' ' + timeTR(cacheAt)) + '</span></div>' +
        '<button class="btn btn-primary" id="btnResume">' + ICONS.right + ' Devam et</button></div>';
    }

    html += '<div class="choice-grid">' +
      '  <button class="choice" id="btnNew"><div class="ic">' + ICONS.plus + '</div><b>Yeni dosya oluştur</b>' +
      '    <span>Boş bir Excel veri dosyası oluşturup sipariş girmeye başlayın.</span></button>' +
      '  <button class="choice" id="btnOpen"><div class="ic">' + ICONS.folder + '</div><b>Excel dosyası aç</b>' +
      '    <span>Daha önce bu programla oluşturulmuş DMR veri dosyasını açın.</span></button>' +
      '  <button class="choice" id="btnImport"><div class="ic">' + ICONS.upload + '</div><b>Eski Excel\'den aktar</b>' +
      '    <span>Mevcut Excel dosyanızdaki sipariş ve cari kayıtlarını içe aktarın.</span></button>' +
      '</div>' +
      '<div class="welcome-foot">' +
      (FS_OK ? 'Dosya erişimi destekleniyor — kayıtlar doğrudan seçtiğiniz Excel dosyasına yazılır.' : 'Bu tarayıcıda dosya erişimi kısıtlı; kayıtlar indirilen Excel dosyası olarak alınır. Chrome veya Edge önerilir.') +
      '<br>Başlarken bir Excel dosyası seçmeniz istenir. Verileriniz yalnızca bu dosyada saklanır.' +
      '</div>' +
      '</div></div>';

    document.getElementById('root').innerHTML = html;

    $('#btnNew').addEventListener('click', function () { newFile(); });
    $('#btnOpen').addEventListener('click', function () { pickOpen(); });
    $('#btnImport').addEventListener('click', function () { $('#legacyInput').click(); });
    var resume = $('#btnResume');
    if (resume) {
      resume.addEventListener('click', async function () {
        if (ctx.handle) {
          var ok = await openFromHandle(ctx.handle);
          if (ok) return;
        }
        if (ctx.cache && ctx.cache.data) {
          applyLoadedData(ctx.cache.data, 'DMR_VERI.xlsx', null);
          beginSession();
          toast('Kaydedilmemiş çalışma geri yüklendi. Excel\'e kaydetmeyi unutmayın.', '');
        }
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Başlatma                                                            */
  /* ------------------------------------------------------------------ */
  var booted = false;
  async function init() {
    if (booted) return;
    booted = true;
    try {
      var v = localStorage.getItem('dmr:autosave');
      if (v === '0') S.autosave = false;
    } catch (e) { }

    bindGlobal();

    // Karşılama ekranını hemen göster; dosya/önbellek bilgisi hazır olunca güncelle
    renderWelcome({ handle: null, cache: null });

    var handle = null, cache = null;
    try { handle = await withTimeout(idbGet('handle'), 900, null); } catch (e) { }
    try { cache = await withTimeout(idbGet('cache'), 900, null); } catch (e) { }

    if (handle && handle.queryPermission) {
      try {
        var perm = await withTimeout(handle.queryPermission({ mode: 'readwrite' }), 900, 'denied');
        if (perm === 'granted') {
          var ok = await openFromHandle(handle);
          if (ok) return;
        }
      } catch (e) { }
    }
    if (handle || cache) renderWelcome({ handle: handle, cache: cache });
  }

  // global click handler (data-act) içinde settings aksiyonları
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    if ((el.dataset.act === 'clear-all' || el.dataset.act === 'new-file') && !isAdmin()) return;
    if (el.dataset.act === 'clear-all') {
      confirmDialog({
        title: 'Tüm veriler silinsin mi?',
        message: 'Siparişler, sevk fişleri ve cari hesap kayıtlarının tamamı silinecek. Bu işlem geri alınamaz.',
        confirmText: 'Tümünü sil', danger: true
      }).then(function (ok) {
        if (!ok) return;
        var kullanicilar = data.kullanicilar.slice();
        data = Core.newData();
        data.kullanicilar = kullanicilar;
        S.ui.cariId = Core.defaultCariId(data);
        S.ui.shipCariId = S.ui.cariId;
        S.ui.cart = [];
        setDirty(true);
        startApp();
        toast('Tüm veriler silindi', 'ok');
      });
    }
    if (el.dataset.act === 'new-file') {
      confirmDialog({
        title: 'Yeni dosya oluşturulsun mu?',
        message: 'Mevcut veriler kaydedilmediyse kaybolur. Yeni boş bir Excel dosyası oluşturulacak.',
        confirmText: 'Devam et', danger: true
      }).then(function (ok) { if (ok) newFile(); });
    }
    if (el.dataset.act === 'go-orders') go('orders');
    if (el.dataset.act === 'go-ledger') go('ledger');
    if (el.dataset.act === 'print-report') printReport();
    if (el.dataset.act === 'ledger-edit') openLedgerForm(data.ledger.filter(function (r) { return r.id === parseInt(el.dataset.id, 10); })[0]);
  });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
      if (!data || !S.user) return;
      if (document.querySelector('.modal-backdrop')) return;
      e.preventDefault();
      openPalette();
    }
  });

  window.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

})();
