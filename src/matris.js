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
      out.cift = round3(out.cift + lineCift(l, kart));
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
