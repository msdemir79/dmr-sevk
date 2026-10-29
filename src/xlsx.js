/*!
 * xlsx-lite — bağımlılıksız XLSX okuyucu / yazıcı
 * DMR AYAKKABI Sevk & Cari Yönetimi için özel olarak yazıldı.
 * Okuma: ZIP (store/deflate) + SpreadsheetML (sharedStrings, inlineStr, sayı, tarih)
 * Yazma: ZIP (store) + minimal SpreadsheetML + stiller (başlık, sayı, tarih, para)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.XLSXLite = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var enc = new TextEncoder();
  var dec = new TextDecoder('utf-8');

  /* ------------------------------------------------------------------ */
  /* CRC32                                                               */
  /* ------------------------------------------------------------------ */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(u8) {
    var c = 0xffffffff;
    for (var i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  /* ------------------------------------------------------------------ */
  /* ZIP yazıcı (sıkıştırmasız)                                          */
  /* ------------------------------------------------------------------ */
  function dosTime(d) {
    var time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
    var date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
    return { time: time, date: date };
  }

  function zipStore(entries) {
    var now = dosTime(new Date());
    var chunks = [];
    var central = [];
    var offset = 0;

    entries.forEach(function (entry) {
      var nameBytes = enc.encode(entry.name);
      var data = entry.data;
      var crc = crc32(data);

      var local = new Uint8Array(30 + nameBytes.length);
      var lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true); // UTF-8 isim
      lv.setUint16(8, 0, true); // store
      lv.setUint16(10, now.time, true);
      lv.setUint16(12, now.date, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      local.set(nameBytes, 30);

      chunks.push(local, data);

      var cd = new Uint8Array(46 + nameBytes.length);
      var cv = new DataView(cd.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, now.time, true);
      cv.setUint16(14, now.date, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      cd.set(nameBytes, 46);
      central.push(cd);

      offset += local.length + data.length;
    });

    var cdSize = central.reduce(function (a, b) { return a + b.length; }, 0);
    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);

    var total = offset + cdSize + 22;
    var out = new Uint8Array(total);
    var p = 0;
    chunks.forEach(function (c) { out.set(c, p); p += c.length; });
    central.forEach(function (c) { out.set(c, p); p += c.length; });
    out.set(eocd, p);
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* ZIP okuyucu                                                         */
  /* ------------------------------------------------------------------ */
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('Tarayıcı sıkıştırılmış Excel dosyalarını açamıyor (DecompressionStream yok).');
    }
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    var buf = await new Response(stream).arrayBuffer();
    return new Uint8Array(buf);
  }

  async function unzip(input) {
    var u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
    var dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    var eocd = -1;
    var min = Math.max(0, u8.length - 66000);
    for (var i = u8.length - 22; i >= min; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Geçersiz XLSX dosyası (ZIP sonu bulunamadı).');
    var count = dv.getUint16(eocd + 10, true);
    var cdOffset = dv.getUint32(eocd + 16, true);
    var p = cdOffset;
    var files = {};
    for (var k = 0; k < count; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      var method = dv.getUint16(p + 10, true);
      var csize = dv.getUint32(p + 20, true);
      var nameLen = dv.getUint16(p + 28, true);
      var extraLen = dv.getUint16(p + 30, true);
      var cmtLen = dv.getUint16(p + 32, true);
      var localOff = dv.getUint32(p + 42, true);
      var name = dec.decode(u8.subarray(p + 46, p + 46 + nameLen));
      p += 46 + nameLen + extraLen + cmtLen;
      if (dv.getUint32(localOff, true) !== 0x04034b50) continue;
      var lNameLen = dv.getUint16(localOff + 26, true);
      var lExtraLen = dv.getUint16(localOff + 28, true);
      var start = localOff + 30 + lNameLen + lExtraLen;
      files[name] = { method: method, data: u8.subarray(start, start + csize) };
    }
    return {
      names: Object.keys(files),
      async text(name) {
        var f = files[name];
        if (!f) return null;
        var data = f.method === 8 ? await inflateRaw(f.data) : f.data;
        return dec.decode(data);
      },
      has(name) { return !!files[name]; }
    };
  }

  /* ------------------------------------------------------------------ */
  /* XML yardımcıları                                                    */
  /* ------------------------------------------------------------------ */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  }

  function unesc(s) {
    return s
      .replace(/&#x([0-9a-fA-F]+);/g, function (m, h) { return String.fromCodePoint(parseInt(h, 16)); })
      .replace(/&#(\d+);/g, function (m, d) { return String.fromCodePoint(parseInt(d, 10)); })
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }

  function attrs(s) {
    var out = {};
    var re = /([\w:.-]+)\s*=\s*"([^"]*)"/g;
    var m;
    while ((m = re.exec(s))) out[m[1]] = unesc(m[2]);
    return out;
  }

  function colToIndex(ref) {
    var letters = (ref.match(/^[A-Z]+/i) || ['A'])[0].toUpperCase();
    var n = 0;
    for (var i = 0; i < letters.length; i++) n = n * 26 + (letters.charCodeAt(i) - 64);
    return n - 1;
  }

  function indexToCol(i) {
    var s = '';
    i = i + 1;
    while (i > 0) {
      var r = (i - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      i = Math.floor((i - 1) / 26);
    }
    return s;
  }

  /* ------------------------------------------------------------------ */
  /* Tarih dönüşümleri                                                   */
  /* ------------------------------------------------------------------ */
  var DATE_XF_IDS = { 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 45: 1, 46: 1, 47: 1 };

  function serialToDate(n) {
    var ms = Math.round((n - 25569) * 86400 * 1000);
    return new Date(ms);
  }

  function isoDate(d) {
    var y = d.getUTCFullYear();
    var m = String(d.getUTCMonth() + 1).padStart(2, '0');
    var day = String(d.getUTCDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function dateToSerial(d) {
    var utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return utc / 86400000 + 25569;
  }

  /* ------------------------------------------------------------------ */
  /* Okuyucu                                                             */
  /* ------------------------------------------------------------------ */
  async function readWorkbook(input, opts) {
    opts = opts || {};
    var zip = await unzip(input);

    // [Content_Types] gerekmiyor; doğrudan workbook ilişkilerini oku
    var wbXml = await zip.text('xl/workbook.xml');
    if (!wbXml) throw new Error('Excel dosyası okunamadı (workbook.xml yok).');
    var relsXml = (await zip.text('xl/_rels/workbook.xml.rels')) || '';

    var rels = {};
    var relRe = /<Relationship\b([^>]*)\/?>/g;
    var rm;
    while ((rm = relRe.exec(relsXml))) {
      var a = attrs(rm[1]);
      if (a.Id) rels[a.Id] = a.Target;
    }

    var shared = [];
    if (zip.has('xl/sharedStrings.xml')) {
      var sstXml = await zip.text('xl/sharedStrings.xml');
      var siRe = /<si\b[^>]*>([\s\S]*?)<\/si>|<si\b[^>]*\/>/g;
      var sm;
      while ((sm = siRe.exec(sstXml))) {
        var body = sm[1] || '';
        var texts = [];
        var tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
        var tm;
        while ((tm = tRe.exec(body))) texts.push(unesc(tm[1]));
        shared.push(texts.join(''));
      }
    }

    // stiller: hangi xf tarih biçimli?
    var dateXfs = {};
    var styleXml = (await zip.text('xl/styles.xml')) || '';
    var customDate = {};
    var nfRe = /<numFmt\b([^>]*)\/?>/g;
    var nm;
    while ((nm = nfRe.exec(styleXml))) {
      var na = attrs(nm[1]);
      var code = (na.formatCode || '').replace(/"[^"]*"/g, '').replace(/\[[^\]]*\]/g, '');
      if (/[dmy]/i.test(code) && !/^(#|0|,|\.|\s)+$/.test(code)) customDate[na.numFmtId] = 1;
    }
    var xfsMatch = styleXml.match(/<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/);
    if (xfsMatch) {
      var xfRe = /<xf\b([^>]*?)(?:\/>|>[\s\S]*?<\/xf>)/g;
      var xm, idx = 0;
      while ((xm = xfRe.exec(xfsMatch[1]))) {
        var xa = attrs(xm[1]);
        var id = parseInt(xa.numFmtId || '0', 10);
        if (DATE_XF_IDS[id] || customDate[id]) dateXfs[idx] = 1;
        idx++;
      }
    }

    var sheetTags = [];
    var shRe = /<sheet\b([^>]*)\/?>/g;
    var shm;
    var workbookBody = wbXml.replace(/<sheets>[\s\S]*?<\/sheets>/, function (b) { return b; });
    while ((shm = shRe.exec(workbookBody))) {
      var sa = attrs(shm[1]);
      if (!sa.name) continue;
      sheetTags.push({ name: unesc(sa.name), rid: sa['r:id'], state: sa.state || 'visible' });
    }

    var sheets = [];
    for (var i = 0; i < sheetTags.length; i++) {
      var tag = sheetTags[i];
      var target = rels[tag.rid] || '';
      target = target.replace(/^\/?xl\//, '').replace(/^\//, '');
      var path = 'xl/' + target;
      if (!zip.has(path)) {
        // bazen hedef "worksheets/sheet1.xml" biçiminde gelir
        path = 'xl/worksheets/sheet' + (i + 1) + '.xml';
      }
      var xml = await zip.text(path);
      if (!xml) continue;
      var parsed = parseSheet(xml, shared, dateXfs);
      sheets.push({
        name: tag.name,
        hidden: tag.state !== 'visible',
        rows: parsed.rows,
        cols: parsed.cols
      });
    }

    return { sheets: sheets };
  }

  function parseSheet(xml, shared, dateXfs) {
    var rows = [];
    var maxCol = 0;
    var rowRe = /<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g;
    var rm, autoRow = 0;

    while ((rm = rowRe.exec(xml))) {
      var ra = attrs(rm[1]);
      var rowIdx = ra.r ? parseInt(ra.r, 10) - 1 : autoRow;
      autoRow = rowIdx + 1;
      var body = rm[2] || '';
      var cells = [];
      var cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
      var cm;
      while ((cm = cellRe.exec(body))) {
        var ca = attrs(cm[1]);
        var inner = cm[2] || '';
        var ci = ca.r ? colToIndex(ca.r) : cells.length;
        var v = cellValue(ca, inner, shared, dateXfs);
        cells[ci] = v;
        if (ci + 1 > maxCol) maxCol = ci + 1;
      }
      for (var z = 0; z < cells.length; z++) if (cells[z] === undefined) cells[z] = null;
      rows[rowIdx] = cells;
    }

    for (var r = 0; r < rows.length; r++) if (!rows[r]) rows[r] = [];
    // boş satırları dizinin sonundan at
    while (rows.length && rows[rows.length - 1].every(function (c) { return c === null || c === ''; })) rows.pop();
    return { rows: rows, cols: maxCol };
  }

  function cellValue(a, inner, shared, dateXfs) {
    var t = a.t || 'n';
    if (t === 'inlineStr') {
      var texts = [];
      var re = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
      var m;
      while ((m = re.exec(inner))) texts.push(unesc(m[1]));
      return texts.join('');
    }
    var vm = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);
    var raw = vm ? unesc(vm[1]) : null;
    if (raw === null) return null;

    if (t === 's') {
      var idx = parseInt(raw, 10);
      return shared[idx] === undefined ? null : shared[idx];
    }
    if (t === 'str') return raw;
    if (t === 'b') return raw === '1';
    if (t === 'e') return null;
    if (t === 'd') return raw; // ISO tarih metni

    var num = parseFloat(raw);
    if (isNaN(num)) return raw;
    if (a.s !== undefined && dateXfs[parseInt(a.s, 10)]) {
      var d = serialToDate(num);
      var h = d.getUTCHours(), mi = d.getUTCMinutes(), s = d.getUTCSeconds();
      return (h || mi || s) ? d.toISOString() : isoDate(d);
    }
    return num;
  }

  /* ------------------------------------------------------------------ */
  /* Yazıcı                                                              */
  /* ------------------------------------------------------------------ */
  var STYLE = {
    DEFAULT: 0,
    HEADER: 1,
    TEXT: 2,
    INT: 3,
    NUM: 4,
    DATE: 5,
    WRAP: 6
  };

  function stylesXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd.mm.yyyy"/></numFmts>' +
      '<fonts count="2">' +
      '<font><sz val="11"/><color rgb="FF1F2937"/><name val="Calibri"/><family val="2"/></font>' +
      '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>' +
      '</fonts>' +
      '<fills count="3">' +
      '<fill><patternFill patternType="none"/></fill>' +
      '<fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill>' +
      '</fills>' +
      '<borders count="2">' +
      '<border><left/><right/><top/><bottom/><diagonal/></border>' +
      '<border>' +
      '<left style="thin"><color rgb="FFD6DDE3"/></left>' +
      '<right style="thin"><color rgb="FFD6DDE3"/></right>' +
      '<top style="thin"><color rgb="FFD6DDE3"/></top>' +
      '<bottom style="thin"><color rgb="FFD6DDE3"/></bottom>' +
      '<diagonal/></border>' +
      '</borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="7">' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>' +
      '<xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>' +
      '<xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>' +
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' +
      '</cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '</styleSheet>';
  }

  function cellXml(ref, value, sst) {
    if (value === null || value === undefined || value === '') return '';
    var style = null;
    var type = null;
    var text = null;

    if (value instanceof Date) {
      style = STYLE.DATE;
      text = String(dateToSerial(value));
    } else if (typeof value === 'number' || (value && typeof value === 'object' && typeof value.v === 'number')) {
      var n = typeof value === 'number' ? value : value.v;
      var isInt = Math.abs(n - Math.round(n)) < 1e-9;
      style = (value && value.s === 'num') ? STYLE.NUM : (isInt ? STYLE.INT : STYLE.NUM);
      n = Math.round(n * 1e6) / 1e6;
      text = String(n);
    } else if (value && typeof value === 'object' && value.v instanceof Date) {
      style = STYLE.DATE;
      text = String(dateToSerial(value.v));
    } else if (typeof value === 'boolean') {
      type = 'b';
      text = value ? '1' : '0';
    } else {
      style = STYLE.TEXT;
      type = 's';
      var str = String(value);
      if (str.length > 32000) str = str.slice(0, 32000);
      var si = sst.index(str);
      text = String(si);
    }

    var sAttr = style !== null ? ' s="' + style + '"' : '';
    if (type) return '<c r="' + ref + '"' + sAttr + ' t="' + type + '"><v>' + text + '</v></c>';
    return '<c r="' + ref + '"' + sAttr + '><v>' + text + '</v></c>';
  }

  function sheetXml(sheet, sst) {
    var columns = sheet.columns || [];
    var rows = sheet.rows || [];
    var totalCols = columns.length;
    var totalRows = rows.length + 1;
    var lastRef = indexToCol(Math.max(totalCols - 1, 0)) + Math.max(totalRows, 1);

    var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<dimension ref="A1:' + lastRef + '"/>' +
      '<sheetViews><sheetView workbookViewId="0">' +
      (sheet.freeze === false ? '' : '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/>') +
      '</sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="15"/>';

    if (columns.length) {
      xml += '<cols>';
      columns.forEach(function (c, i) {
        var w = c.width || 12;
        xml += '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>';
      });
      xml += '</cols>';
    }

    xml += '<sheetData>';
    // başlık satırı
    xml += '<row r="1" ht="28" customHeight="1">';
    columns.forEach(function (c, i) {
      xml += '<c r="' + indexToCol(i) + '1" s="' + STYLE.HEADER + '" t="inlineStr"><is><t>' + esc(c.header) + '</t></is></c>';
    });
    xml += '</row>';

    rows.forEach(function (row, ri) {
      var r = ri + 2;
      xml += '<row r="' + r + '">';
      for (var ci = 0; ci < totalCols; ci++) {
        var val = row[ci];
        var c = cellXml(indexToCol(ci) + r, val, sst);
        xml += c;
      }
      xml += '</row>';
    });
    xml += '</sheetData>';

    if (rows.length) {
      xml += '<autoFilter ref="A1:' + indexToCol(Math.max(totalCols - 1, 0)) + totalRows + '"/>';
    }
    xml += '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>' +
      '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>' +
      '</worksheet>';
    return xml;
  }

  function writeWorkbook(model, meta) {
    meta = meta || {};
    var sheets = model.sheets || [];
    var sst = {
      list: [],
      map: new Map(),
      index: function (s) {
        if (this.map.has(s)) return this.map.get(s);
        var i = this.list.length;
        this.map.set(s, i);
        this.list.push(s);
        return i;
      }
    };

    var sheetFiles = sheets.map(function (sheet) {
      return { xml: sheetXml(sheet, sst), name: sheet.name, hidden: !!sheet.hidden };
    });

    var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      sheetFiles.map(function (f, i) {
        return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
      }).join('') +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '</Types>';

    var rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      '</Relationships>';

    var workbookXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<workbookPr defaultThemeVersion="166925"/>' +
      '<bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="14000"/></bookViews>' +
      '<sheets>' +
      sheetFiles.map(function (f, i) {
        return '<sheet name="' + esc(f.name) + '" sheetId="' + (i + 1) + '"' + (f.hidden ? ' state="hidden"' : '') + ' r:id="rId' + (i + 1) + '"/>';
      }).join('') +
      '</sheets>' +
      '</workbook>';

    var workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      sheetFiles.map(function (f, i) {
        return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>';
      }).join('') +
      '<Relationship Id="rId' + (sheetFiles.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      '<Relationship Id="rId' + (sheetFiles.length + 2) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>' +
      '</Relationships>';

    var sstXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="' + sst.list.length + '" uniqueCount="' + sst.list.length + '">' +
      sst.list.map(function (s) {
        return '<si><t xml:space="preserve">' + esc(s) + '</t></si>';
      }).join('') +
      '</sst>';

    var now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    var coreXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>' + esc(meta.title || 'DMR AYAKKABI Veri') + '</dc:title>' +
      '<dc:creator>' + esc(meta.creator || 'DMR Sevk') + '</dc:creator>' +
      '<cp:lastModifiedBy>' + esc(meta.creator || 'DMR Sevk') + '</cp:lastModifiedBy>' +
      '<dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created>' +
      '<dcterms:modified xsi:type="dcterms:W3CDTF">' + now + '</dcterms:modified>' +
      '</cp:coreProperties>';

    var files = [
      { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
      { name: '_rels/.rels', data: enc.encode(rootRels) },
      { name: 'docProps/core.xml', data: enc.encode(coreXml) },
      { name: 'xl/workbook.xml', data: enc.encode(workbookXml) },
      { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(workbookRels) },
      { name: 'xl/styles.xml', data: enc.encode(stylesXml()) },
      { name: 'xl/sharedStrings.xml', data: enc.encode(sstXml) }
    ];
    sheetFiles.forEach(function (f, i) {
      files.push({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: enc.encode(f.xml) });
    });

    return zipStore(files);
  }

  /* ------------------------------------------------------------------ */
  return {
    readWorkbook: readWorkbook,
    writeWorkbook: writeWorkbook,
    inflateRaw: inflateRaw,
    _internal: { crc32: crc32, zipStore: zipStore, unzip: unzip, colToIndex: colToIndex, indexToCol: indexToCol, dateToSerial: dateToSerial, serialToDate: serialToDate }
  };
});
