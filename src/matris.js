/*
 * matris.js — renk / beden / asorti yardımcıları
 * Sipariş satırları, asorti şablonu ve beden dağılımı hesapları.
 * Hem tarayıcıda (window.Matris) hem Node testlerinde kullanılabilir.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Matris = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var KATEGORILER = {
    BEBE: { ad: "Bebe", min: 22, max: 26 },
    PATIK: { ad: "Patik", min: 26, max: 30 },
    FILET: { ad: "Filet", min: 31, max: 35 },
    GARSON: { ad: "Garson", min: 36, max: 40 },
    ZENNE: { ad: "Zenne", min: 36, max: 40 },
    MERDANE: { ad: "Merdane", min: 36, max: 48 }
  };

  function num(v) {
    if (v === null || v === undefined || v === "") return 0;
    var n = Number(String(v).replace(",", "."));
    return isFinite(n) ? n : 0;
  }

  function round3(n) {
    return Math.round((Number(n) || 0) * 1000) / 1000;
  }

  function normKey(s) {
    return String(s == null ? "" : s).toLocaleUpperCase("tr-TR").replace(/\s+/g, " ").trim();
  }

  function kategoriKodu(k) {
    var key = String(k || "").toLocaleUpperCase("tr-TR");
    return KATEGORILER[key] ? key : "";
  }

  function kategori(k) {
    return KATEGORILER[kategoriKodu(k)] || null;
  }

  function bedenler(k) {
    var c = kategori(k);
    if (!c) return [];
    var out = [];
    for (var s = c.min; s <= c.max; s++) out.push(s);
    return out;
  }

  function asortiToplam(sablon) {
    var t = 0;
    Object.keys(sablon || {}).forEach(function (s) { t += num(sablon[s]); });
    return t;
  }

  function normalizeSablon(sablon) {
    if (typeof sablon === "string") sablon = parseAsorti(sablon);
    var out = {};
    Object.keys(sablon || {}).forEach(function (s) {
      var size = Math.round(num(s));
      var q = Math.round(num(sablon[s]));
      if (size > 0 && q > 0) out[String(size)] = q;
    });
    return out;
  }

  function formatAsorti(sablon) {
    var s = normalizeSablon(sablon);
    return Object.keys(s).sort(function (a, b) { return num(a) - num(b); })
      .map(function (k) { return k + ":" + s[k]; }).join(";");
  }

  function parseAsorti(text) {
    var out = {};
    String(text || "").split(/[;,]/).forEach(function (parca) {
      var p = parca.split(/[:=]/);
      if (p.length < 2) return;
      var size = Math.round(num(p[0])), q = Math.round(num(p[1]));
      if (size > 0 && q > 0) out[String(size)] = q;
    });
    return out;
  }

  function formatRenkler(renkler) {
    return (Array.isArray(renkler) ? renkler : []).map(function (r) { return String(r).trim(); }).filter(Boolean).join("|");
  }

  function parseRenkler(text) {
    return String(text || "").split(/[|,;]/).map(function (r) { return r.trim(); }).filter(Boolean);
  }

  function formatDagilim(d) {
    var out = {};
    Object.keys(d || {}).forEach(function (s) {
      var q = num(d[s]);
      if (q) out[String(Math.round(num(s)))] = round3(q);
    });
    return Object.keys(out).length ? JSON.stringify(out) : "";
  }

  function parseDagilim(text) {
    if (!text) return {};
    if (typeof text === "object") return text;
    try {
      var o = JSON.parse(String(text));
      var out = {};
      Object.keys(o || {}).forEach(function (s) { out[String(s)] = num(o[s]); });
      return out;
    } catch (e) { return {}; }
  }

  /** Model kartındaki kategori/renk/asorti alanlarını normalize eder. */
  function normalizeKart(kart) {
    var k = kart || {};
    var sablon = normalizeSablon(k.asortiSablon);
    var renkler = k.renkler;
    if (typeof renkler === "string") renkler = parseRenkler(renkler);
    return {
      kategori: kategoriKodu(k.kategori),
      renkler: (Array.isArray(renkler) ? renkler : []).map(function (r) { return String(r).trim(); }).filter(Boolean),
      asortiSablon: sablon,
      fiyat: num(k.fiyat)
    };
  }

  /* ------------------------------------------------------------------ */
  /* Renk ve asorti şablonu ustaları                                     */
  /* ------------------------------------------------------------------ */
  function ensureMasterArrays(data) {
    if (!Array.isArray(data.renkler)) data.renkler = [];
    if (!Array.isArray(data.asortiSablonlari)) data.asortiSablonlari = [];
    if (!Array.isArray(data.modelRenkleri)) data.modelRenkleri = [];
    return data;
  }

  function nextMasterId(arr) {
    var m = 0;
    (arr || []).forEach(function (x) { if (num(x.id) > m) m = num(x.id); });
    return m + 1;
  }

  function colorById(data, id) {
    return (data.renkler || []).filter(function (c) { return c.id === id; })[0] || null;
  }

  function templateById(data, id) {
    return (data.asortiSablonlari || []).filter(function (t) { return t.id === id; })[0] || null;
  }

  function findColorByName(data, ad) {
    var key = normKey(ad);
    if (!key) return null;
    return (data.renkler || []).filter(function (c) { return normKey(c.ad) === key; })[0] || null;
  }

  function uniqueColorName(data, ad) {
    var base = String(ad || '').trim() || 'RENK';
    var ad2 = base, n = 2;
    while ((data.renkler || []).some(function (c) { return normKey(c.ad) === normKey(ad2); })) {
      ad2 = base + ' ' + n;
      n++;
    }
    return ad2;
  }

  function findOrCreateColor(data, ad, kod) {
    ensureMasterArrays(data);
    var mevcut = findColorByName(data, ad);
    if (mevcut) {
      if (kod && !mevcut.kod) mevcut.kod = String(kod).trim();
      return mevcut;
    }
    var renk = {
      id: nextMasterId(data.renkler),
      ad: uniqueColorName(data, ad),
      kod: String(kod || '').trim(),
      aktif: true
    };
    data.renkler.push(renk);
    return renk;
  }

  function templateKey(t) {
    return normKey(t && t.kategori) + '|' + formatAsorti(t && t.dagilim);
  }

  function uniqueTemplateName(data, ad) {
    var base = String(ad || '').trim() || 'ASORTİ';
    var ad2 = base, n = 2;
    while ((data.asortiSablonlari || []).some(function (t) { return normKey(t.ad) === normKey(ad2); })) {
      ad2 = base + ' (' + n + ')';
      n++;
    }
    return ad2;
  }

  function findOrCreateTemplate(data, opts) {
    ensureMasterArrays(data);
    var dagilim = normalizeSablon(opts && opts.dagilim);
    if (!Object.keys(dagilim).length) return null;
    var kategori = kategoriKodu(opts && opts.kategori);
    var key = kategori + '|' + formatAsorti(dagilim);
    var mevcut = (data.asortiSablonlari || []).filter(function (t) { return templateKey(t) === key; })[0];
    if (mevcut) return mevcut;
    var sablon = {
      id: nextMasterId(data.asortiSablonlari),
      ad: uniqueTemplateName(data, (opts && opts.ad) || (kategori || 'ASORTİ') + ' · ' + asortiToplam(dagilim) + "'li"),
      kategori: kategori,
      dagilim: dagilim,
      aktif: true
    };
    data.asortiSablonlari.push(sablon);
    return sablon;
  }

  function modelColorIds(data, modelId) {
    return (data.modelRenkleri || []).filter(function (r) { return r.modelId === modelId; })
      .sort(function (a, b) { return num(a.sira) - num(b.sira); })
      .map(function (r) { return r.renkId; });
  }

  function modelColors(data, modelId) {
    var byId = {};
    (data.renkler || []).forEach(function (c) { byId[c.id] = c; });
    return modelColorIds(data, modelId).map(function (id) { return byId[id]; }).filter(Boolean);
  }

  function setModelColors(data, modelId, colorIds) {
    ensureMasterArrays(data);
    data.modelRenkleri = (data.modelRenkleri || []).filter(function (r) { return r.modelId !== modelId; });
    (colorIds || []).forEach(function (cid, i) {
      var c = colorById(data, num(cid));
      if (c) data.modelRenkleri.push({ modelId: modelId, renkId: c.id, sira: i + 1 });
    });
  }

  function hydrateModel(data, kart) {
    if (!kart) return kart;
    ensureMasterArrays(data);
    var tpl = templateById(data, kart.asortiSablonId);
    if (!tpl && kart.asortiSablon && Object.keys(kart.asortiSablon).length) {
      tpl = findOrCreateTemplate(data, { kategori: kart.kategori, dagilim: kart.asortiSablon, ad: kart.model + ' · asorti' });
    }
    if (tpl) {
      kart.asortiSablonId = tpl.id;
      kart.kategori = tpl.kategori || kart.kategori;
      kart.asortiSablon = JSON.parse(JSON.stringify(tpl.dagilim));
      kart.asorti = asortiToplam(tpl.dagilim);
    } else {
      kart.asortiSablonId = 0;
      if (!kart.asortiSablon) kart.asortiSablon = {};
    }

    var ids = modelColorIds(data, kart.id);
    if (!ids.length && Array.isArray(kart.renkler) && kart.renkler.length) {
      var yeni = [];
      kart.renkler.forEach(function (ad) {
        var c = findOrCreateColor(data, ad);
        if (c) yeni.push(c.id);
      });
      setModelColors(data, kart.id, yeni);
    }
    kart.renkler = modelColors(data, kart.id).map(function (c) { return c.ad; });
    kart.renkIds = modelColors(data, kart.id).map(function (c) { return c.id; });
    return kart;
  }

  /**
   * Eski model kartlarını renk/şablon ustalarına taşır.
   * Idempotent: tekrar çağrılması veriyi çoğaltmaz.
   */
  function migrateMaster(data) {
    ensureMasterArrays(data);

    data.renkler = data.renkler.map(function (c) {
      return { id: num(c.id), ad: String(c.ad || '').trim(), kod: String(c.kod || '').trim(), aktif: c.aktif !== false };
    }).filter(function (c) { return c.id > 0 && c.ad; });

    data.asortiSablonlari = data.asortiSablonlari.map(function (t) {
      return { id: num(t.id), ad: String(t.ad || '').trim(), kategori: kategoriKodu(t.kategori), dagilim: normalizeSablon(t.dagilim), aktif: t.aktif !== false };
    }).filter(function (t) { return t.id > 0 && Object.keys(t.dagilim).length; });

    var modelById = {};
    (data.modeller || []).forEach(function (m) { modelById[m.id] = m; });
    var gorulen = {};
    data.modelRenkleri = data.modelRenkleri.filter(function (r) {
      if (!modelById[r.modelId] || !colorById(data, r.renkId)) return false;
      var k = r.modelId + '|' + r.renkId;
      if (gorulen[k]) return false;
      gorulen[k] = 1;
      return true;
    });

    (data.modeller || []).forEach(function (m) { hydrateModel(data, m); });
    return data;
  }

  function templateUsage(data, id) {
    return (data.modeller || []).filter(function (m) { return num(m.asortiSablonId) === id; }).length;
  }

  function colorUsage(data, id) {
    return (data.modelRenkleri || []).filter(function (r) { return r.renkId === id; }).length;
  }


  function kartToplam(kart) {
    if (!kart) return 0;
    return asortiToplam(kart.asortiSablon) || num(kart.asorti);
  }

  function lineKoli(line) {
    return num(line && line.koli);
  }

  function lineCift(line, kart) {
    if (!line) return 0;
    if (line.mod === "ACIK") return round3(num(line.koli) * num(line.koliIci));
    if (line.mod === "ASORTILI") {
      var pb = kartToplam(kart);
      if (pb) return round3(num(line.koli) * pb);
      return num(line.cift);
    }
    return num(line.cift);
  }

  /** Sipariş satırının beden dağılımı (satırın kendi snapshot'ı varsa o). */
  function lineDagilim(line, kart) {
    if (!line) return {};
    if (line.dagilim && typeof line.dagilim === "object" && Object.keys(line.dagilim).length) {
      var snap = {};
      Object.keys(line.dagilim).forEach(function (s) { snap[String(s)] = num(line.dagilim[s]); });
      return snap;
    }
    var out = {};
    if (line.mod === "ACIK") {
      if (num(line.beden) > 0) out[String(Math.round(num(line.beden)))] = round3(num(line.koli) * num(line.koliIci));
    } else if (line.mod === "ASORTILI" && kart) {
      Object.keys(kart.asortiSablon || {}).forEach(function (s) {
        out[String(s)] = round3(num(line.koli) * num(kart.asortiSablon[s]));
      });
    }
    return out;
  }

  function dagilimEkle(hedef, kaynak) {
    Object.keys(kaynak || {}).forEach(function (s) {
      hedef[s] = round3((hedef[s] || 0) + num(kaynak[s]));
    });
    return hedef;
  }

  function nextLineId(data) {
    var m = 0;
    (data.orderLines || []).forEach(function (l) { if (num(l.id) > m) m = num(l.id); });
    return m + 1;
  }

  function orderLinesOf(data, orderId) {
    return (data.orderLines || []).filter(function (l) { return l.orderId === orderId; });
  }

  /**
   * Eski siparişler için tek bir ESKI satırı üretir ve sevk satırlarını bağlar.
   * Tekrar çağrılması güvenlidir.
   */
  function ensureLines(data) {
    if (!data) return data;
    if (!Array.isArray(data.orderLines)) data.orderLines = [];

    var byOrder = {};
    data.orderLines.forEach(function (l) {
      byOrder[l.orderId] = byOrder[l.orderId] || [];
      byOrder[l.orderId].push(l);
    });

    (data.orders || []).forEach(function (o) {
      if (byOrder[o.id] && byOrder[o.id].length) return;
      var cift = num(o.adet);
      var koliIci = num(o.asorti);
      var line = {
        id: nextLineId(data),
        orderId: o.id,
        renk: o.renk || "",
        mod: "ESKI",
        beden: 0,
        koli: koliIci ? round3(cift / koliIci) : 0,
        koliIci: koliIci,
        cift: cift
      };
      data.orderLines.push(line);
      byOrder[o.id] = [line];
    });

    // Eski sevk satırlarını siparişin tek satırına bağla
    (data.lines || []).forEach(function (l) {
      if (num(l.orderLineId)) return;
      var arr = byOrder[l.orderId];
      if (arr && arr.length === 1) l.orderLineId = arr[0].id;
    });

    return data;
  }

  function kartBul(data, model) {
    var key = normKey(model);
    return (data.modeller || []).filter(function (m) { return normKey(m.model) === key; })[0] || null;
  }

  function orderTotals(data, orderId) {
    var o = (data.orders || []).filter(function (x) { return x.id === orderId; })[0];
    if (!o) return { koli: 0, cift: 0, dagilim: {} };
    var kart = kartBul(data, o.model);
    var lines = orderLinesOf(data, orderId);
    var out = { koli: 0, cift: 0, dagilim: {} };
    if (!lines.length) {
      out.cift = num(o.adet);
      out.koli = num(o.asorti) ? round3(out.cift / num(o.asorti)) : 0;
      return out;
    }
    lines.forEach(function (l) {
      out.koli = round3(out.koli + num(l.koli));
      out.cift = round3(out.cift + (num(l.cift) || lineCift(l, kart)));
      dagilimEkle(out.dagilim, lineDagilim(l, kart));
    });
    return out;
  }

  /** Sevk fişinin beden dağılımı: sevk satırlarının koli/çiftinden hesaplanır. */
  function shipmentDagilim(data, sevkId) {
    var out = {};
    var byId = {};
    (data.orderLines || []).forEach(function (l) { byId[l.id] = l; });
    (data.lines || []).filter(function (l) { return l.sevkId === sevkId; }).forEach(function (l) {
      if (l.dagilim && Object.keys(l.dagilim).length) {
        dagilimEkle(out, l.dagilim);
        return;
      }
      var ol = byId[l.orderLineId];
      if (!ol) return;
      var kart = kartBul(data, ol.model) || null;
      // Sevk edilen koliye göre dağıtım
      if (ol.mod === "ACIK") {
        if (num(ol.beden) > 0) out[String(Math.round(num(ol.beden)))] = round3((out[String(Math.round(num(ol.beden)))] || 0) + num(l.cift));
      } else if (ol.mod === "ASORTILI" && kart) {
        Object.keys(kart.asortiSablon || {}).forEach(function (s) {
          out[String(s)] = round3((out[String(s)] || 0) + num(l.koli) * num(kart.asortiSablon[s]));
        });
      }
    });
    return out;
  }

  return {
    ensureMasterArrays: ensureMasterArrays,
    findOrCreateColor: findOrCreateColor,
    findOrCreateTemplate: findOrCreateTemplate,
    colorById: colorById,
    templateById: templateById,
    modelColorIds: modelColorIds,
    modelColors: modelColors,
    setModelColors: setModelColors,
    hydrateModel: hydrateModel,
    migrateMaster: migrateMaster,
    templateUsage: templateUsage,
    colorUsage: colorUsage,
    KATEGORILER: KATEGORILER,
    num: num,
    round3: round3,
    normKey: normKey,
    kategoriKodu: kategoriKodu,
    kategori: kategori,
    bedenler: bedenler,
    asortiToplam: asortiToplam,
    normalizeSablon: normalizeSablon,
    formatAsorti: formatAsorti,
    parseAsorti: parseAsorti,
    formatRenkler: formatRenkler,
    parseRenkler: parseRenkler,
    formatDagilim: formatDagilim,
    parseDagilim: parseDagilim,
    normalizeKart: normalizeKart,
    kartToplam: kartToplam,
    lineKoli: lineKoli,
    lineCift: lineCift,
    lineDagilim: lineDagilim,
    ensureLines: ensureLines,
    orderLinesOf: orderLinesOf,
    orderTotals: orderTotals,
    shipmentDagilim: shipmentDagilim,
    kartBul: kartBul
  };
});
