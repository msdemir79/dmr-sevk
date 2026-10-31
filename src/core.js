/*!
 * core.js — DMR AYAKKABI veri modeli ve iş kuralları
 * Sipariş, sevk fişi ve cari hesap işlemlerinin tamamı burada; arayüzden bağımsız.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var Matris = null;
  if (typeof module === 'object' && module.exports && typeof require === 'function') {
    try { Matris = require('./matris.js'); } catch (e) { Matris = null; }
  } else {
    Matris = (typeof globalThis !== 'undefined' && globalThis.Matris) || null;
  }
  if (!Matris) throw new Error('matris.js yüklenmedi');

  var TYPES = { SATIS: 'SATIŞ', TAHSILAT: 'TAHSİLAT', ALIS: 'ALIŞ', GELIR: 'GELİR', DEVIR: 'DEVRİ', DIGER: 'DİĞER' };

  var SHEET = {
    CARILER: 'CARİLER',
    KULLANICILAR: 'KULLANICILAR',
    MODELLER: 'MODEL KARTLARI',
    MODEL_IMAGES: 'MODEL RESİMLERİ',
    ORDERS: 'SİPARİŞLER',
    ORDER_LINES: 'SİPARİŞ SATIRLARI',
    LEDGER: 'CARİ HESAP',
    SHIPMENTS: 'SEVK FİŞLERİ',
    LINES: 'SEVK SATIRLARI',
    AUDIT: 'İŞLEM GÜNLÜĞÜ',
    TRASH: 'ÇÖP KUTUSU',
    IMAGES: 'RESİMLER',
    SETTINGS: 'AYARLAR'
  };

  /* ------------------------------------------------------------------ */
  /* Yardımcılar                                                         */
  /* ------------------------------------------------------------------ */
  function pad(n) { return String(n).padStart(2, '0'); }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  /** Her türlü tarih girdisini YYYY-MM-DD biçimine çevirir. */
  function toISODate(value) {
    if (!value && value !== 0) return '';
    if (value instanceof Date) {
      if (isNaN(value)) return '';
      return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
    }
    if (typeof value === 'number' && value > 20000 && value < 80000) {
      // Excel seri tarihi
      var ms = Math.round((value - 25569) * 86400 * 1000);
      var d = new Date(ms);
      return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
    }
    var s = String(value).trim();
    if (!s) return '';
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return m[1] + '-' + pad(+m[2]) + '-' + pad(+m[3]);
    m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
    if (m) {
      var y = +m[3];
      if (y < 100) y += 2000;
      return y + '-' + pad(+m[2]) + '-' + pad(+m[1]);
    }
    var d2 = new Date(s);
    if (!isNaN(d2)) return d2.getFullYear() + '-' + pad(d2.getMonth() + 1) + '-' + pad(d2.getDate());
    return '';
  }

  /** "1.234,56", "1234.56", "1 234" gibi girdileri sayıya çevirir. */
  function num(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    var s = String(value).trim().replace(/\s/g, '').replace(/[₺$€£]/g, '');
    if (!s) return 0;
    var hasDot = s.indexOf('.') > -1, hasComma = s.indexOf(',') > -1;
    if (hasDot && hasComma) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
    } else if (hasComma) {
      s = s.replace(/\./g, '').replace(',', '.');
    }
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  function normKey(s) {
    return String(s === null || s === undefined ? '' : s)
      .toLocaleUpperCase('tr-TR')
      .replace(/İ/g, 'I').replace(/I/g, 'I')
      .replace(/Ş/g, 'S').replace(/Ğ/g, 'G').replace(/Ü/g, 'U')
      .replace(/Ö/g, 'O').replace(/Ç/g, 'C')
      .replace(/[^A-Z0-9]/g, '');
  }

  function nextId(list) {
    var max = 0;
    for (var i = 0; i < list.length; i++) if ((list[i].id || 0) > max) max = list[i].id;
    return max + 1;
  }

  function kodUret(model, renk) {
    var m = String(model || '').trim();
    if (!m) return '';
    var p = m.slice(0, 4).toLocaleUpperCase('tr-TR');
    return renk ? p + ' - ' + String(renk).toLocaleUpperCase('tr-TR') : p;
  }

  /* ------------------------------------------------------------------ */
  /* Varsayılanlar                                                       */
  /* ------------------------------------------------------------------ */
  /** Eski marka ayarlarını DMR'ye taşır (veri kaybetmeden). */
  function markaMigrate(data) {
    var s = data && data.settings;
    if (!s) return data;
    // Eski varsayılan firma adı, markanın da eski varsayılan olduğunu gösterir.
    if (s.firmaAdi === 'DEMİR AYAKKABI - FABRİKA') {
      s.firmaAdi = 'DMR AYAKKABI - FABRİKA';
      s.markaAdi = 'DMR';
      s.markaAlt = 'AYAKKABI';
      s.markaKisa = 'DMR';
    }
    return data;
  }

  function defaultSettings() {
    return {
      firmaAdi: 'DMR AYAKKABI - FABRİKA',
      cariAdi: 'YENİ CARİ',
      firmaAdres: 'SEFAKÖY',
      firmaTel: '',
      vergiDairesi: '',
      vergiNo: '',
      sevkBaslik: 'SEVK FİŞİ',
      kagit: 'A4',
      para: '₺',
      markaAdi: 'DMR',
      markaAlt: 'AYAKKABI',
      markaKisa: 'DMR',
      dosyaAdi: 'DMR_VERI',
      sonSiparisNo: 0,
      sonFisNo: 0,
      varsayilanAsorti: 10,
      logo: '',
      kurulum: ''
    };
  }

  function emptyData() {
    return {
      cariler: [], kullanicilar: [], modeller: [], orders: [], orderLines: [], ledger: [], shipments: [],
      lines: [], audit: [], trash: [], images: {}, modelImages: {}, settings: defaultSettings()
    };
  }

  /** Yeni dosya: boş veri + varsayılan cari hesap. */
  function newData() {
    var d = emptyData();
    d.cariler.push(defaultCari(d.settings.cariAdi || 'YENİ CARİ'));
    d.settings.kurulum = new Date().toISOString();
    return d;
  }

  /* ------------------------------------------------------------------ */
  /* Kullanıcılar                                                        */
  /* ------------------------------------------------------------------ */
  function normalizeKullanici(input) {
    return {
      id: num(input.id),
      ad: String(input.ad || '').trim(),
      kullanici: String(input.kullanici || '').trim(),
      tuz: String(input.tuz || ''),
      sifre: String(input.sifre || ''),
      rol: String(input.rol || '').toLocaleUpperCase('tr-TR') === 'YÖNETİCİ' ? 'YÖNETİCİ' : 'KULLANICI',
      aktif: input.aktif === false || input.aktif === 0 || String(input.aktif).toLocaleUpperCase('tr-TR') === 'HAYIR' ? false : true,
      sonGiris: String(input.sonGiris || '')
    };
  }

  function kullaniciById(data, id) {
    return data.kullanicilar.filter(function (u) { return u.id === id; })[0] || null;
  }

  function kullaniciBul(data, kullanici) {
    var key = normKey(kullanici);
    return data.kullanicilar.filter(function (u) { return normKey(u.kullanici) === key; })[0] || null;
  }

  function aktifYoneticiVar(data, haricId) {
    return data.kullanicilar.some(function (u) {
      return u.rol === 'YÖNETİCİ' && u.aktif !== false && u.id !== haricId;
    });
  }

  function addKullanici(data, input) {
    var u = normalizeKullanici(input);
    if (!u.ad) throw new Error('Ad soyad zorunlu.');
    if (!u.kullanici) throw new Error('Kullanıcı adı zorunlu.');
    if (!u.sifre) throw new Error('Şifre zorunlu.');
    if (kullaniciBul(data, u.kullanici)) throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
    u.id = nextId(data.kullanicilar);
    data.kullanicilar.push(u);
    return u;
  }

  function updateKullanici(data, id, input) {
    var u = kullaniciById(data, id);
    if (!u) throw new Error('Kullanıcı bulunamadı.');
    var next = normalizeKullanici(Object.assign({}, u, input, { id: id }));
    if (!next.ad) throw new Error('Ad soyad zorunlu.');
    if (!next.kullanici) throw new Error('Kullanıcı adı zorunlu.');
    var ayni = kullaniciBul(data, next.kullanici);
    if (ayni && ayni.id !== id) throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
    var yoneticiKaliyor = next.rol === 'YÖNETİCİ' && next.aktif !== false;
    if (next.rol !== u.rol || next.aktif === false) {
      if (!yoneticiKaliyor && !aktifYoneticiVar(data, id)) {
        throw new Error('En az bir aktif yönetici kalmalı.');
      }
    }
    for (var k in next) u[k] = next[k];
    return u;
  }

  function deleteKullanici(data, id) {
    var u = kullaniciById(data, id);
    if (!u) return;
    if (data.kullanicilar.length <= 1) throw new Error('En az bir kullanıcı kalmalı.');
    if (u.rol === 'YÖNETİCİ' && u.aktif !== false && !aktifYoneticiVar(data, id)) {
      throw new Error('Son aktif yönetici silinemez.');
    }
    data.kullanicilar = data.kullanicilar.filter(function (x) { return x.id !== id; });
  }

  /* ------------------------------------------------------------------ */
  /* Cari hesaplar                                                       */
  /* ------------------------------------------------------------------ */
  function defaultCari(ad) {
    return {
      id: 1,
      kod: 'C1',
      ad: String(ad || 'YENİ CARİ').trim(),
      adres: '',
      tel: '',
      vergiDairesi: '',
      vergiNo: '',
      not: '',
      aktif: true
    };
  }

  function cariById(data, id) {
    return data.cariler.filter(function (c) { return c.id === id; })[0] || null;
  }

  function cariName(data, id) {
    var c = cariById(data, id);
    return c ? c.ad : '';
  }

  function defaultCariId(data) {
    return data.cariler.length ? data.cariler[0].id : 0;
  }

  function normalizeCari(input) {
    return {
      id: num(input.id),
      kod: String(input.kod || '').trim(),
      ad: String(input.ad || '').trim(),
      adres: String(input.adres || '').trim(),
      tel: String(input.tel || '').trim(),
      vergiDairesi: String(input.vergiDairesi || '').trim(),
      vergiNo: String(input.vergiNo || '').trim(),
      not: String(input.not || '').trim(),
      aktif: input.aktif === false || input.aktif === 'false' || input.aktif === 0 ? false : true
    };
  }

  function addCari(data, input) {
    var c = normalizeCari(input);
    if (!c.ad) throw new Error('Cari adı zorunlu.');
    if (data.cariler.some(function (x) { return normKey(x.ad) === normKey(c.ad); })) {
      throw new Error('Bu isimde bir cari zaten var.');
    }
    c.id = nextId(data.cariler);
    if (!c.kod) c.kod = 'C' + c.id;
    data.cariler.push(c);

    var devir = num(input.devir);
    if (devir > 0) {
      addLedgerEntry(data, {
        cariId: c.id,
        tarih: input.devirTarih || todayISO(),
        islem: TYPES.DEVIR,
        aciklama: 'Devir bakiyesi',
        tutar: devir,
        yon: input.devirYon === 'ALACAK' ? 'ALACAK' : 'BORC'
      });
    }
    return c;
  }

  function updateCari(data, id, input) {
    var c = cariById(data, id);
    if (!c) throw new Error('Cari bulunamadı.');
    var next = normalizeCari(Object.assign({}, c, input, { id: id }));
    if (!next.ad) throw new Error('Cari adı zorunlu.');
    if (data.cariler.some(function (x) { return x.id !== id && normKey(x.ad) === normKey(next.ad); })) {
      throw new Error('Bu isimde başka bir cari var.');
    }
    for (var k in next) c[k] = next[k];
    return c;
  }

  function deleteCari(data, id, kullanici) {
    if (data.cariler.length <= 1) throw new Error('En az bir cari hesap kalmalı.');
    var used = data.orders.some(function (o) { return o.cariId === id; }) ||
      data.ledger.some(function (r) { return r.cariId === id; }) ||
      data.shipments.some(function (s) { return s.cariId === id; });
    if (used) throw new Error('Bu cariye ait sipariş, sevk fişi veya cari hareket var. Önce onları silin.');
    var cari = data.cariler.filter(function (c) { return c.id === id; })[0];
    if (!cari) return;
    trashPush(data, kullanici, 'cari', cari.ad, { cari: cari });
    data.cariler = data.cariler.filter(function (c) { return c.id !== id; });
  }

  /* ------------------------------------------------------------------ */
  /* Hesaplamalar                                                        */
  /* ------------------------------------------------------------------ */
  function shippedMap(data) {
    var map = {};
    data.lines.forEach(function (l) {
      map[l.orderId] = (map[l.orderId] || 0) + num(l.cift);
    });
    return map;
  }

  function lineInfo(data, line, kart) {
    if (!line) return { toplam: 0, giden: 0, kalan: 0, koli: 0, kalanKoli: 0 };
    var order = (data.orders || []).filter(function (o) { return o.id === line.orderId; })[0] || null;
    var k = kart || (order ? modelKart(data, order.model) : null);
    var toplam = num(line.cift) || Matris.lineCift(line, k);
    var giden = (data.lines || []).filter(function (l) { return num(l.orderLineId) === line.id; })
      .reduce(function (a, l) { return a + num(l.cift); }, 0);
    var kalan = Math.max(0, toplam - giden);
    var koli = num(line.koli) || (kalan ? toplam / (num(line.koliIci) || 1) : 0);
    return {
      line: line, order: order, kart: k, toplam: toplam, giden: giden, kalan: kalan,
      koli: koli, kalanKoli: toplam ? kalan * (koli / toplam) : 0
    };
  }

  function orderInfo(data, order, shipped) {
    var giden = (shipped || shippedMap(data))[order.id] || 0;
    var satirlar = (data.orderLines || []).filter(function (l) { return l.orderId === order.id; });
    var toplam = satirlar.length ? Matris.orderTotals(data, order.id) : null;
    var adet = toplam && toplam.cift ? toplam.cift : num(order.adet);
    var koli = toplam && toplam.koli ? toplam.koli : adet / (num(order.asorti) || 1);
    var kalan = Math.max(0, adet - giden);
    var kalanKoli = adet ? kalan * (koli / adet) : 0;
    return {
      giden: giden,
      kalan: kalan,
      kalanKoli: kalanKoli,
      koli: koli,
      tutar: round2(adet * num(order.fiyat)),
      kalanTutar: round2(kalan * num(order.fiyat)),
      durum: kalan <= 0 ? 'TAMAMLANDI' : (giden > 0 ? 'KISMİ' : 'AÇIK')
    };
  }

  function ledgerSorted(data, cariId) {
    var rows = data.ledger.filter(function (r) { return !cariId || r.cariId === cariId; });
    return rows.slice().sort(function (a, b) {
      if (a.tarih !== b.tarih) return a.tarih < b.tarih ? -1 : 1;
      return (a.id || 0) - (b.id || 0);
    });
  }

  function withBalance(rows) {
    var balances = {};
    return rows.map(function (r) {
      var key = r.cariId || 0;
      balances[key] = (balances[key] || 0) + num(r.borc) - num(r.alacak);
      var c = {};
      for (var k in r) c[k] = r[k];
      c.bakiye = round2(balances[key]);
      return c;
    });
  }

  /** Bakiye her cari için ayrı yürür; cariId verilmezse tüm cariler. */
  function ledgerWithBalance(data, cariId) {
    var rows = data.ledger.filter(function (r) { return !cariId || r.cariId === cariId; }).slice();
    rows.sort(function (a, b) {
      if ((a.cariId || 0) !== (b.cariId || 0)) return (a.cariId || 0) - (b.cariId || 0);
      if (a.tarih !== b.tarih) return a.tarih < b.tarih ? -1 : 1;
      return (a.id || 0) - (b.id || 0);
    });
    var out = withBalance(rows);
    out.sort(function (a, b) {
      if (a.tarih !== b.tarih) return a.tarih < b.tarih ? -1 : 1;
      return (a.id || 0) - (b.id || 0);
    });
    return out;
  }

  function balance(data, cariId) {
    var b = 0;
    data.ledger.forEach(function (r) {
      if (cariId && r.cariId !== cariId) return;
      b += num(r.borc) - num(r.alacak);
    });
    return round2(b);
  }

  function nextOrderNo(data) {
    var max = num(data.settings.sonSiparisNo);
    data.orders.forEach(function (o) { if (num(o.sipno) > max) max = num(o.sipno); });
    return max + 1;
  }

  function nextFisNo(data) {
    var max = num(data.settings.sonFisNo);
    data.shipments.forEach(function (s) { if (num(s.fisNo) > max) max = num(s.fisNo); });
    return max + 1;
  }

  function monthKey(iso) { return (iso || '').slice(0, 7); }

  function stats(data, cariId) {
    var shipped = shippedMap(data);
    var open = 0, openCount = 0, totalCift = 0, remaining = 0;
    data.orders.forEach(function (o) {
      if (cariId && o.cariId !== cariId) return;
      var i = orderInfo(data, o, shipped);
      totalCift += num(o.adet);
      remaining += i.kalan;
      if (i.kalan > 0) { open++; openCount += i.kalanTutar; }
    });
    var ay = monthKey(todayISO());
    var aySevk = 0, ayTahsilat = 0, ayAdet = 0;
    data.ledger.forEach(function (r) {
      if (cariId && r.cariId !== cariId) return;
      if (monthKey(r.tarih) !== ay) return;
      if (r.islem === TYPES.SATIS) { aySevk += num(r.tutar); ayAdet += num(r.cift); }
      if (r.islem === TYPES.TAHSILAT) ayTahsilat += num(r.tutar);
    });
    return {
      orderCount: cariId ? data.orders.filter(function (o) { return o.cariId === cariId; }).length : data.orders.length,
      openOrders: open,
      openValue: round2(openCount),
      totalCift: totalCift,
      remainingCift: remaining,
      balance: balance(data, cariId),
      monthShipment: round2(aySevk),
      monthShipmentQty: ayAdet,
      monthCollection: round2(ayTahsilat),
      shipmentCount: cariId ? data.shipments.filter(function (s) { return s.cariId === cariId; }).length : data.shipments.length
    };
  }

  /* ------------------------------------------------------------------ */
  /* Sipariş işlemleri                                                   */
  /* ------------------------------------------------------------------ */
  function normalizeOrder(input) {
    var asorti = num(input.asorti) > 0 ? num(input.asorti) : 10;
    return {
      id: input.id || 0,
      cariId: num(input.cariId),
      sipno: num(input.sipno),
      tarih: toISODate(input.tarih) || todayISO(),
      model: String(input.model || '').trim(),
      renk: String(input.renk || '').trim(),
      asorti: asorti,
      adet: num(input.adet),
      fiyat: num(input.fiyat),
      tur: String(input.tur || '').trim(),
      grup: String(input.grup || '').trim(),
      kod: String(input.kod || '').trim() || kodUret(input.model, input.renk),
      not: String(input.not || '').trim()
    };
  }

  function addOrder(data, input) {
    var order = normalizeOrder(input);
    if (!order.model) throw new Error('Model bilgisi zorunlu.');
    if (order.adet <= 0) throw new Error('Sipariş çift adedi sıfırdan büyük olmalı.');
    if (!order.cariId) order.cariId = defaultCariId(data);
    if (!cariById(data, order.cariId)) throw new Error('Cari hesap seçin.');
    order.id = nextId(data.orders);
    if (!order.sipno) order.sipno = nextOrderNo(data);
    if (order.sipno > num(data.settings.sonSiparisNo)) data.settings.sonSiparisNo = order.sipno;
    data.orders.push(order);
    Matris.ensureLines(data);
    if (input.resim) data.images[order.id] = String(input.resim);
    return order;
  }

  function updateOrder(data, id, input) {
    var order = data.orders.filter(function (o) { return o.id === id; })[0];
    if (!order) throw new Error('Sipariş bulunamadı.');
    var shipped = shippedMap(data)[id] || 0;
    var next = normalizeOrder(Object.assign({}, order, input, { id: id, sipno: input.sipno !== undefined ? input.sipno : order.sipno }));
    if (next.adet < shipped) throw new Error('Sipariş adedi, sevk edilen ' + shipped + ' çiftin altına indirilemez.');
    if (!next.cariId) next.cariId = order.cariId;
    if (next.cariId !== order.cariId && shipped > 0) {
      throw new Error('Sevkiyatı başlamış siparişin cari hesabı değiştirilemez.');
    }
    if (!cariById(data, next.cariId)) throw new Error('Cari hesap bulunamadı.');
    for (var k in next) order[k] = next[k];
    if (input.resim) data.images[id] = String(input.resim);
    else if (input.resim === null) delete data.images[id];
    return order;
  }

  function deleteOrder(data, id, kullanici) {
    var used = data.lines.filter(function (l) { return l.orderId === id; });
    if (used.length) throw new Error('Bu siparişe ait sevk kaydı var. Önce sevk fişini silin.');
    var order = data.orders.filter(function (o) { return o.id === id; })[0];
    if (!order) return;
    trashPush(data, kullanici, 'siparis', order.model + ' · #' + order.sipno, { order: order, image: data.images[id] || '' });
    data.orders = data.orders.filter(function (o) { return o.id !== id; });
    data.orderLines = (data.orderLines || []).filter(function (l) { return l.orderId !== id; });
    delete data.images[id];
  }

  /* ------------------------------------------------------------------ */
  /* Sevk fişi                                                           */
  /* ------------------------------------------------------------------ */
  function createShipment(data, input) {
    var items = (input.lines || []).filter(function (l) { return num(l.cift) > 0; });
    if (!items.length) throw new Error('Sevk edilecek en az bir satır girin.');
    var fisNo = num(input.fisNo) || nextFisNo(data);
    var tarih = toISODate(input.tarih) || todayISO();
    if (data.shipments.some(function (s) { return num(s.fisNo) === fisNo; })) {
      throw new Error(fisNo + ' numaralı sevk fişi zaten var. Farklı bir fiş no girin.');
    }
    var shipped = shippedMap(data);
    var id = nextId(data.shipments);

    var ilkSiparis = data.orders.filter(function (o) { return o.id === items[0].orderId; })[0];
    var cariId = num(input.cariId) || (ilkSiparis && ilkSiparis.cariId) || defaultCariId(data);
    var cari = cariById(data, cariId);
    if (!cari) throw new Error('Sevk fişi için cari hesap seçin.');

    var shipment = {
      id: id,
      fisNo: fisNo,
      tarih: tarih,
      cariId: cariId,
      cari: String(cari.ad || ''),
      aciklama: String(input.aciklama || '').trim(),
      faturaNo: String(input.faturaNo || '').trim(),
      faturaTarih: toISODate(input.faturaTarih) || '',
      koli: 0,
      cift: 0,
      tutar: 0
    };

    var lines = [], ledger = [];
    items.forEach(function (item) {
      var order = data.orders.filter(function (o) { return o.id === item.orderId; })[0];
      if (!order) throw new Error('Sevk satırındaki sipariş bulunamadı.');
      if (order.cariId !== cariId) {
        throw new Error('Farklı cari hesaplara ait siparişler aynı sevk fişine eklenemez.');
      }
      var already = (shipped[order.id] || 0) + lines.filter(function (l) { return l.orderId === order.id; }).reduce(function (a, l) { return a + l.cift; }, 0);
      var kalan = num(order.adet) - already;
      var cift = num(item.cift);
      if (cift > kalan + 0.001) {
        throw new Error((order.model || 'Sipariş') + ' için kalan ' + kalan + ' çift; ' + cift + ' çift sevk edilemez.');
      }
      var fiyat = item.fiyat !== undefined && item.fiyat !== '' ? num(item.fiyat) : num(order.fiyat);
      var tutar = round2(cift * fiyat);
      var koli = num(item.koli) || cift / (num(order.asorti) || 1);
      var ols2 = (data.orderLines || []).filter(function (x) { return x.orderId === order.id; });
      if (!item.orderLineId && ols2.length > 1) throw new Error(order.model + ' için renk/beden satırı seçin.');
      var ol2 = item.orderLineId ? ols2.filter(function (x) { return x.id === item.orderLineId; })[0] : ols2[0];
      if (ol2 && ol2.mod !== 'ESKI' && Math.abs(koli - Math.round(koli)) > 0.001) throw new Error('Koli tam sayı olmalı.');
      if (ol2) {
        var satirToplam = num(ol2.cift) || Matris.lineCift(ol2, modelKart(data, order.model));
        var satirGiden = data.lines.filter(function (l) { return num(l.orderLineId) === ol2.id; })
          .concat(lines.filter(function (l) { return num(l.orderLineId) === ol2.id; }))
          .reduce(function (a, l) { return a + num(l.cift); }, 0);
        var satirKalan = satirToplam - satirGiden;
        if (cift > satirKalan + 0.001) {
          throw new Error((ol2.renk || order.model) + (ol2.mod === 'ACIK' && ol2.beden ? ' / ' + ol2.beden : '') + ' satırında kalan ' + satirKalan + ' çift; ' + cift + ' çift sevk edilemez.');
        }
      }
      var dag2 = {};
      if (ol2) {
        var gecici = Object.assign({}, ol2, { koli: koli, cift: cift });
        dag2 = Matris.lineDagilim(gecici, modelKart(data, order.model));
      }

      lines.push({
        id: 0,
        sevkId: id,
        orderId: order.id,
        orderLineId: ol2 ? ol2.id : 0,
        model: order.model,
        renk: ol2 ? (ol2.renk || order.renk) : order.renk,
        beden: ol2 ? num(ol2.beden) : 0,
        mod: ol2 ? (ol2.mod || 'ESKI') : 'ESKI',
        koliIci: ol2 ? num(ol2.koliIci) : num(order.asorti),
        koli: Math.round(koli * 1000) / 1000,
        cift: cift,
        fiyat: fiyat,
        tutar: tutar,
        dagilim: dag2
      });

      ledger.push({
        id: 0,
        cariId: cariId,
        tarih: tarih,
        fisNo: String(fisNo),
        sipno: String(order.sipno || ''),
        islem: TYPES.SATIS,
        aciklama: order.model + ((ol2 ? ol2.renk : order.renk) ? ' / ' + (ol2 ? ol2.renk : order.renk) : ''),
        renk: (ol2 ? ol2.renk : order.renk) || '',
        koli: Math.round(koli * 1000) / 1000,
        cift: cift,
        fiyat: fiyat,
        tutar: tutar,
        borc: tutar,
        alacak: 0,
        grup: order.grup || '',
        kod: order.kod || '',
        sevkFisNo: String(fisNo),
        sevkId: id
      });

      shipment.koli += koli;
      shipment.cift += cift;
      shipment.tutar += tutar;
    });

    shipment.koli = Math.round(shipment.koli * 1000) / 1000;
    shipment.cift = Math.round(shipment.cift * 1000) / 1000;
    shipment.tutar = round2(shipment.tutar);

    data.shipments.push(shipment);
    lines.forEach(function (l) { l.id = nextId(data.lines); data.lines.push(l); });
    ledger.forEach(function (l) { l.id = nextId(data.ledger); data.ledger.push(l); });
    if (fisNo > num(data.settings.sonFisNo)) data.settings.sonFisNo = fisNo;
    return { shipment: shipment, lines: lines, ledger: ledger };
  }

  function shipmentLines(data, sevkId) {
    var orderById = {};
    data.orders.forEach(function (o) { orderById[o.id] = o; });
    return data.lines.filter(function (l) { return l.sevkId === sevkId; }).map(function (l) {
      var o = orderById[l.orderId];
      return {
        id: l.id,
        sevkId: l.sevkId,
        orderId: l.orderId,
        orderLineId: num(l.orderLineId),
        model: l.model || (o && o.model) || '',
        renk: l.renk || (o && o.renk) || '',
        beden: num(l.beden),
        mod: l.mod || '',
        koliIci: num(l.koliIci),
        dagilim: l.dagilim || {},
        koli: num(l.koli),
        cift: num(l.cift),
        fiyat: num(l.fiyat),
        tutar: num(l.tutar)
      };
    });
  }

  function deleteShipment(data, id, kullanici) {
    var shipment = data.shipments.filter(function (s) { return s.id === id; })[0];
    if (!shipment) return;
    var lines = data.lines.filter(function (l) { return l.sevkId === id; });
    var ledger = data.ledger.filter(function (r) { return r.sevkId === id; });
    trashPush(data, kullanici, 'sevk', 'Fiş #' + shipment.fisNo + ' · ' + (shipment.cari || ''), {
      shipment: shipment, lines: lines, ledger: ledger
    });
    data.shipments = data.shipments.filter(function (s) { return s.id !== id; });
    data.lines = data.lines.filter(function (l) { return l.sevkId !== id; });
    data.ledger = data.ledger.filter(function (r) { return r.sevkId !== id; });
  }

  /** Sevk fişindeki bir satırın çift adedini günceller (fiş düzenleme). */
  function updateShipment(data, id, patch) {
    var shipment = data.shipments.filter(function (s) { return s.id === id; })[0];
    if (!shipment) throw new Error('Sevk fişi bulunamadı.');
    if (patch.tarih) {
      shipment.tarih = toISODate(patch.tarih) || shipment.tarih;
      data.ledger.forEach(function (r) { if (r.sevkId === id) r.tarih = shipment.tarih; });
    }
    if (patch.aciklama !== undefined) shipment.aciklama = String(patch.aciklama || '').trim();
    if (patch.faturaNo !== undefined) shipment.faturaNo = String(patch.faturaNo || '').trim();
    if (patch.faturaTarih !== undefined) shipment.faturaTarih = toISODate(patch.faturaTarih) || '';
    if (!patch.lines) return shipment;

    // Mevcut satırları ve cari kayıtlarını koruyarak yeniden yaz
    var shipped = {};
    data.lines.forEach(function (l) {
      if (l.sevkId === id) return;
      shipped[l.orderId] = (shipped[l.orderId] || 0) + num(l.cift);
    });
    data.lines = data.lines.filter(function (l) { return l.sevkId !== id; });
    data.ledger = data.ledger.filter(function (r) { return r.sevkId !== id; });

    var totals = { koli: 0, cift: 0, tutar: 0 };
    patch.lines.forEach(function (item) {
      var cift = num(item.cift);
      if (cift <= 0) return;
      var order = data.orders.filter(function (o) { return o.id === item.orderId; })[0];
      if (!order) return;
      if (order.cariId !== shipment.cariId) throw new Error('Farklı cari hesaplara ait siparişler aynı sevk fişine eklenemez.');
      var kalan = num(order.adet) - (shipped[order.id] || 0);
      if (cift > kalan + 0.001) throw new Error(order.model + ' için kalan ' + kalan + ' çift; ' + cift + ' çift sevk edilemez.');
      var fiyat = item.fiyat !== undefined && item.fiyat !== '' ? num(item.fiyat) : num(order.fiyat);
      var tutar = round2(cift * fiyat);
      var koli = num(item.koli) || cift / (num(order.asorti) || 1);
      var ols2 = (data.orderLines || []).filter(function (x) { return x.orderId === order.id; });
      var ol2 = item.orderLineId ? ols2.filter(function (x) { return x.id === item.orderLineId; })[0] : ols2[0];
      var dag2 = {};
      if (ol2) {
        var gecici = Object.assign({}, ol2, { koli: koli, cift: cift });
        dag2 = Matris.lineDagilim(gecici, modelKart(data, order.model));
      }
      data.lines.push({
        id: nextId(data.lines), sevkId: id, orderId: order.id, orderLineId: ol2 ? ol2.id : 0,
        model: order.model, renk: ol2 ? (ol2.renk || order.renk) : order.renk,
        beden: ol2 ? num(ol2.beden) : 0, mod: ol2 ? (ol2.mod || 'ESKI') : 'ESKI',
        koliIci: ol2 ? num(ol2.koliIci) : num(order.asorti),
        koli: koli, cift: cift, fiyat: fiyat, tutar: tutar, dagilim: dag2
      });
      data.ledger.push({
        id: nextId(data.ledger), cariId: shipment.cariId, tarih: shipment.tarih, fisNo: String(shipment.fisNo), sipno: String(order.sipno || ''),
        islem: TYPES.SATIS, aciklama: order.model + (order.renk ? ' / ' + order.renk : ''), renk: order.renk || '',
        koli: koli, cift: cift, fiyat: fiyat, tutar: tutar, borc: tutar, alacak: 0,
        grup: order.grup || '', kod: order.kod || '', sevkFisNo: String(shipment.fisNo), sevkId: id
      });
      shipped[order.id] = (shipped[order.id] || 0) + cift;
      totals.koli += koli; totals.cift += cift; totals.tutar += tutar;
    });
    shipment.koli = Math.round(totals.koli * 1000) / 1000;
    shipment.cift = Math.round(totals.cift * 1000) / 1000;
    shipment.tutar = round2(totals.tutar);
    return shipment;
  }

  /* ------------------------------------------------------------------ */
  /* Cari hesap                                                          */
  /* ------------------------------------------------------------------ */
  function addLedgerEntry(data, input) {
    var islem = input.islem || TYPES.DIGER;
    var tutar = round2(num(input.tutar));
    if (tutar <= 0) throw new Error('Tutar sıfırdan büyük olmalı.');
    var cariId = num(input.cariId) || defaultCariId(data);
    if (!cariById(data, cariId)) throw new Error('Cari hesap seçin.');
    var yon = input.yon || (islem === TYPES.SATIS ? 'BORC' : islem === TYPES.DIGER ? 'BORC' : 'ALACAK');
    var entry = {
      id: nextId(data.ledger),
      cariId: cariId,
      tarih: toISODate(input.tarih) || todayISO(),
      fisNo: String(input.fisNo || '').trim(),
      sipno: String(input.sipno || '').trim(),
      islem: islem,
      aciklama: String(input.aciklama || islem).trim(),
      renk: '',
      koli: num(input.koli),
      cift: num(input.cift),
      fiyat: num(input.fiyat),
      tutar: tutar,
      borc: yon === 'BORC' ? tutar : 0,
      alacak: yon === 'ALACAK' ? tutar : 0,
      grup: String(input.grup || '').trim(),
      kod: String(input.kod || '').trim(),
      sevkFisNo: '',
      sevkId: 0
    };
    data.ledger.push(entry);
    return entry;
  }

  function updateLedgerEntry(data, id, input) {
    var row = data.ledger.filter(function (r) { return r.id === id; })[0];
    if (!row) throw new Error('Cari kaydı bulunamadı.');
    if (row.sevkId) throw new Error('Sevk fişinden gelen kayıt buradan değiştirilemez.');
    ['tarih', 'aciklama', 'fisNo', 'sipno', 'koli', 'cift', 'fiyat', 'grup', 'kod'].forEach(function (k) {
      if (input[k] !== undefined) row[k] = (k === 'tarih' ? toISODate(input[k]) : input[k]);
    });
    if (input.cariId !== undefined) {
      var yeniCari = num(input.cariId);
      if (!cariById(data, yeniCari)) throw new Error('Cari hesap bulunamadı.');
      row.cariId = yeniCari;
    }
    if (input.tutar !== undefined) {
      var t = round2(num(input.tutar));
      if (t <= 0) throw new Error('Tutar sıfırdan büyük olmalı.');
      row.tutar = t;
      row.borc = 0;
      row.alacak = 0;
      if ((input.yon || (row.borc ? 'BORC' : 'ALACAK')) === 'BORC') row.borc = t; else row.alacak = t;
    } else if (input.yon) {
      row.borc = 0;
      row.alacak = 0;
      if (input.yon === 'BORC') row.borc = row.tutar; else row.alacak = row.tutar;
    }
    if (input.islem) row.islem = input.islem;
    return row;
  }

  function deleteLedgerEntry(data, id, kullanici) {
    var row = data.ledger.filter(function (r) { return r.id === id; })[0];
    if (row && row.sevkId) throw new Error('Sevk fişinden gelen kayıt silinemez. Sevk fişini silin.');
    if (!row) return;
    trashPush(data, kullanici, 'hareket', (row.islem || '') + ' · ' + (row.aciklama || ''), { row: row });
    data.ledger = data.ledger.filter(function (r) { return r.id !== id; });
  }

  /* ------------------------------------------------------------------ */
  /* Model kartları                                                      */
  /* ------------------------------------------------------------------ */
  function normalizeModel(input) {
    var m = Matris.normalizeKart(input);
    return {
      id: num(input.id),
      model: String(input.model || '').trim(),
      kategori: m.kategori,
      renkler: m.renkler,
      asortiSablon: m.asortiSablon,
      fiyat: input.fiyat === '' || input.fiyat === undefined || input.fiyat === null ? 0 : num(input.fiyat),
      maliyet: input.maliyet === '' || input.maliyet === undefined || input.maliyet === null ? 0 : num(input.maliyet),
      asorti: input.asorti === '' || input.asorti === undefined || input.asorti === null ? 0 : num(input.asorti),
      barkod: String(input.barkod || '').trim(),
      sezon: String(input.sezon || '').trim(),
      not: String(input.not || '').trim()
    };
  }

  function modelKart(data, model) {
    var key = normKey(model);
    if (!key) return null;
    return (data.modeller || []).filter(function (m) { return normKey(m.model) === key; })[0] || null;
  }

  function addModel(data, input) {
    if (!data.modelImages) data.modelImages = {};
    var m = normalizeModel(input);
    if (!m.model) throw new Error('Model adı zorunlu.');
    if (modelKart(data, m.model)) throw new Error('Bu model kartı zaten var.');
    m.id = nextId(data.modeller || []);
    (data.modeller = data.modeller || []).push(m);
    if (input.resim) data.modelImages[m.id] = String(input.resim);
    return m;
  }

  function updateModel(data, id, input) {
    if (!data.modelImages) data.modelImages = {};
    var mevcut = (data.modeller || []).filter(function (m) { return m.id === id; })[0];
    if (!mevcut) throw new Error('Model kartı bulunamadı.');
    var next = normalizeModel(Object.assign({}, mevcut, input, { id: id }));
    if (!next.model) throw new Error('Model adı zorunlu.');
    var ayni = modelKart(data, next.model);
    if (ayni && ayni.id !== id) throw new Error('Bu model adı başka kartta kullanılıyor.');
    for (var k in next) mevcut[k] = next[k];
    if (input.resim) data.modelImages[id] = String(input.resim);
    else if (input.resim === null) delete data.modelImages[id];
    return mevcut;
  }

  function deleteModel(data, id) {
    data.modeller = (data.modeller || []).filter(function (m) { return m.id !== id; });
    if (data.modelImages) delete data.modelImages[id];
  }

  /** Model bazlı sipariş / sevk / kalan özeti (cariler arası). */
  function modelSummary(data) {
    var map = {};
    function satir(model) {
      var k = normKey(model);
      if (!map[k]) map[k] = { model: String(model || ''), siparis: 0, sevk: 0, kalan: 0 };
      return map[k];
    }
    data.orders.forEach(function (o) {
      var r = satir(o.model);
      r.siparis += num(o.adet);
      r.kalan += orderInfo(data, o).kalan;
    });
    data.lines.forEach(function (l) {
      var r = satir(l.model);
      r.sevk += num(l.cift);
    });
    return Object.keys(map).map(function (k) { return map[k]; })
      .filter(function (r) { return r.model; })
      .sort(function (a, b) { return b.kalan - a.kalan || a.model.localeCompare(b.model, 'tr'); });
  }

  /** Aylık ciro / maliyet / kâr (sevk satırlarından). */
  function profitReport(data, from, to, cariId) {
    var byMonth = {};
    var kartByKey = {};
    (data.modeller || []).forEach(function (m) { kartByKey[normKey(m.model)] = m; });
    data.lines.forEach(function (l) {
      var s = data.shipments.filter(function (x) { return x.id === l.sevkId; })[0];
      if (!s) return;
      if (cariId && s.cariId !== cariId) return;
      var t = String(s.tarih || '');
      if (from && t < from) return;
      if (to && t > to) return;
      var kart = kartByKey[normKey(l.model)];
      var maliyet = kart ? num(kart.maliyet) : 0;
      var ciro = num(l.tutar);
      var mal = round2(maliyet * num(l.cift));
      var ay = t.slice(0, 7) || '—';
      byMonth[ay] = byMonth[ay] || { ay: ay, ciro: 0, maliyet: 0, kar: 0, satir: 0, maliyetsiz: 0 };
      byMonth[ay].ciro += ciro;
      byMonth[ay].maliyet += mal;
      byMonth[ay].kar += (ciro - mal);
      byMonth[ay].satir++;
      if (!maliyet) byMonth[ay].maliyetsiz++;
    });
    return Object.keys(byMonth).sort().map(function (k) {
      var r = byMonth[k];
      r.ciro = round2(r.ciro); r.maliyet = round2(r.maliyet); r.kar = round2(r.kar);
      r.marj = r.ciro ? round2(r.kar / r.ciro * 100) : 0;
      return r;
    });
  }

  /* ------------------------------------------------------------------ */
  /* İşlem günlüğü                                                       */
  /* ------------------------------------------------------------------ */
  function audit(data, kullanici, islem, detay) {
    if (!data.audit) data.audit = [];
    data.audit.push({
      id: nextId(data.audit),
      tarih: new Date().toISOString(),
      kullanici: String(kullanici || ''),
      islem: String(islem || ''),
      detay: String(detay || '')
    });
    if (data.audit.length > 5000) data.audit = data.audit.slice(-5000);
  }

  /* ------------------------------------------------------------------ */
  /* Çöp kutusu                                                          */
  /* ------------------------------------------------------------------ */
  function trashPush(data, kullanici, tur, ad, veri) {
    if (!data.trash) data.trash = [];
    data.trash.push({
      id: nextId(data.trash),
      tarih: new Date().toISOString(),
      kullanici: String(kullanici || ''),
      tur: String(tur || ''),
      ad: String(ad || ''),
      veri: veri || {}
    });
    if (data.trash.length > 200) data.trash = data.trash.slice(-200);
  }

  function trashTemizle(data, gun) {
    var sinir = Date.now() - (num(gun) || 30) * 86400000;
    data.trash = (data.trash || []).filter(function (t) {
      return new Date(t.tarih).getTime() >= sinir;
    });
  }

  function trashPurge(data, id) {
    data.trash = (data.trash || []).filter(function (t) { return t.id !== id; });
  }

  function restoreTrash(data, trashId, kullanici) {
    var item = (data.trash || []).filter(function (t) { return t.id === trashId; })[0];
    if (!item) throw new Error('Çöp kutusunda böyle bir kayıt yok.');
    var v = item.veri || {};
    if (item.tur === 'sevk') {
      var s = Object.assign({}, v.shipment);
      if (data.shipments.some(function (x) { return x.id === s.id; })) s.id = nextId(data.shipments);
      var fis = num(s.fisNo);
      if (data.shipments.some(function (x) { return num(x.fisNo) === fis; })) fis = nextFisNo(data);
      s.fisNo = fis;
      data.shipments.push(s);
      (v.lines || []).forEach(function (l) {
        var kopya = Object.assign({}, l);
        kopya.id = nextId(data.lines);
        kopya.sevkId = s.id;
        data.lines.push(kopya);
      });
      (v.ledger || []).forEach(function (r) {
        var kopya = Object.assign({}, r);
        kopya.id = nextId(data.ledger);
        kopya.sevkId = s.id;
        kopya.fisNo = String(fis);
        kopya.sevkFisNo = String(fis);
        data.ledger.push(kopya);
      });
      if (fis > num(data.settings.sonFisNo)) data.settings.sonFisNo = fis;
    } else if (item.tur === 'siparis') {
      var o = Object.assign({}, v.order);
      if (data.orders.some(function (x) { return x.id === o.id; })) o.id = nextId(data.orders);
      data.orders.push(o);
      if (v.image) data.images[o.id] = v.image;
      if (num(o.sipno) > num(data.settings.sonSiparisNo)) data.settings.sonSiparisNo = num(o.sipno);
    } else if (item.tur === 'hareket') {
      var r = Object.assign({}, v.row);
      if (data.ledger.some(function (x) { return x.id === r.id; })) r.id = nextId(data.ledger);
      data.ledger.push(r);
    } else if (item.tur === 'cari') {
      var c = Object.assign({}, v.cari);
      if (data.cariler.some(function (x) { return x.id === c.id; })) c.id = nextId(data.cariler);
      data.cariler.push(c);
    } else {
      throw new Error('Bilinmeyen kayıt türü.');
    }
    data.trash = data.trash.filter(function (t) { return t.id !== trashId; });
    audit(data, kullanici, 'GERİ YÜKLE', item.tur + ' · ' + item.ad);
    return item;
  }

  /* ------------------------------------------------------------------ */
  /* Dosya sağlık kontrolü                                               */
  /* ------------------------------------------------------------------ */
  function healthCheck(data) {
    var issues = [];
    var fis = {}, sip = {};
    data.shipments.forEach(function (s) {
      var k = String(num(s.fisNo));
      if (fis[k]) issues.push('Fiş numarası tekrar ediyor: #' + s.fisNo);
      fis[k] = 1;
    });
    data.orders.forEach(function (o) {
      if (sip[o.id]) issues.push('Sipariş kimliği tekrar ediyor: #' + o.id);
      sip[o.id] = 1;
    });
    var shipIds = {};
    data.shipments.forEach(function (s) { shipIds[s.id] = 1; });
    data.lines.forEach(function (l) {
      if (l.orderId && !sip[l.orderId]) issues.push('Sevk satırında bulunmayan sipariş: #' + l.orderId);
      if (!shipIds[l.sevkId]) issues.push('Sevk satırında bulunmayan fiş: #' + l.sevkId);
    });
    data.ledger.forEach(function (r) {
      if (r.sevkId && !shipIds[r.sevkId]) issues.push('Cari kaydında bulunmayan fiş: #' + r.sevkId);
      if (!data.cariler.some(function (c) { return c.id === r.cariId; })) issues.push('Cari kaydında bulunmayan cari kimliği: #' + r.cariId);
    });
    data.orders.forEach(function (o) {
      var bilgi = orderInfo(data, o);
      if (bilgi.kalan < -0.001) issues.push('Fazla sevk: ' + o.model + ' (kalan ' + bilgi.kalan + ')');
      if (!data.cariler.some(function (c) { return c.id === o.cariId; })) issues.push('Siparişte bulunmayan cari: ' + o.model);
    });
    var tekil = [];
    issues.forEach(function (x) { if (tekil.indexOf(x) === -1) tekil.push(x); });
    return tekil;
  }

  /* ------------------------------------------------------------------ */
  /* Excel'e yazma                                                       */
  /* ------------------------------------------------------------------ */
  function money(n) { return round2(num(n)); }

  /** ISO tarih metnini Excel'in gerçek tarih hücresine çevirir. */
  function dcell(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    return isNaN(d) ? iso : d;
  }

  function buildWorkbook(data) {
    Matris.ensureLines(data);
    var shipped = shippedMap(data);

    var cariRows = data.cariler.map(function (c) {
      return [c.id, c.kod, c.ad, c.adres, c.tel, c.vergiDairesi, c.vergiNo,
        c.aktif === false ? 'HAYIR' : 'EVET', c.not, money(balance(data, c.id))];
    });

    var orderRows = data.orders.slice().sort(function (a, b) {
      if (a.sipno !== b.sipno) return a.sipno - b.sipno;
      return a.id - b.id;
    }).map(function (o) {
      var i = orderInfo(data, o, shipped);
      return [
        o.id, num(o.cariId), cariName(data, o.cariId), o.sipno, dcell(o.tarih), o.model, o.renk, o.asorti, o.adet,
        Math.round(i.koli * 1000) / 1000, money(o.fiyat), i.tutar,
        i.giden, i.kalan, Math.round(i.kalanKoli * 1000) / 1000,
        o.tur, o.grup, o.kod, o.not
      ];
    });

    var ledgerRows = ledgerWithBalance(data).slice().sort(function (a, b) {
      if ((a.cariId || 0) !== (b.cariId || 0)) return (a.cariId || 0) - (b.cariId || 0);
      if (a.tarih !== b.tarih) return a.tarih < b.tarih ? -1 : 1;
      return (a.id || 0) - (b.id || 0);
    }).map(function (r) {
      return [
        r.id, num(r.cariId), cariName(data, r.cariId), dcell(r.tarih), r.fisNo, r.sipno, r.islem, r.aciklama, r.renk,
        num(r.koli), money(r.cift), money(r.fiyat), money(r.tutar),
        money(r.borc), money(r.alacak), money(r.bakiye), r.grup, r.kod, r.sevkFisNo || ''
      ];
    });

    var shipmentRows = data.shipments.slice().sort(function (a, b) { return a.fisNo - b.fisNo; }).map(function (s) {
      return [s.id, num(s.cariId), cariName(data, s.cariId) || s.cari || '', s.fisNo, dcell(s.tarih), s.aciklama,
        s.faturaNo || '', s.faturaTarih ? dcell(s.faturaTarih) : '', money(s.koli), money(s.cift), money(s.tutar)];
    });

    var lineRows = data.lines.map(function (l) {
      return [l.id, l.sevkId, l.orderId, l.orderLineId || 0, l.model, l.renk, num(l.beden), l.mod || '',
        money(l.koli), money(l.koliIci), money(l.cift), money(l.fiyat), money(l.tutar), Matris.formatDagilim(l.dagilim)];
    });

    var imageRows = Object.keys(data.images).map(function (k) { return [num(k), data.images[k]]; });

    var kullaniciRows = data.kullanicilar.map(function (u) {
      return [u.id, u.ad, u.kullanici, u.tuz, u.sifre, u.rol, u.aktif === false ? 'HAYIR' : 'EVET', u.sonGiris || ''];
    });

    var modelRows = (data.modeller || []).map(function (m) {
      return [m.id, m.model, m.kategori || '', Matris.formatRenkler(m.renkler), money(m.fiyat), num(m.asorti) || '',
        Matris.formatAsorti(m.asortiSablon), money(m.maliyet), m.barkod || '', m.sezon || '', m.not || ''];
    });

    var orderById = {};
    data.orders.forEach(function (o) { orderById[o.id] = o; });
    var orderLineRows = (data.orderLines || []).map(function (l) {
      var o = orderById[l.orderId];
      var kart = o ? modelKart(data, o.model) : null;
      return [l.id, l.orderId, l.renk || '', l.mod || '', num(l.beden), money(l.koli), money(l.koliIci), money(Matris.lineCift(l, kart))];
    });

    var modelImageRows = Object.keys(data.modelImages || {}).map(function (k) { return [num(k), data.modelImages[k]]; });

    var auditRows = (data.audit || []).map(function (a) {
      return [a.id, a.tarih || '', a.kullanici || '', a.islem || '', a.detay || ''];
    });

    var trashRows = (data.trash || []).map(function (t) {
      return [t.id, t.tarih || '', t.kullanici || '', t.tur || '', t.ad || '', JSON.stringify(t.veri || {})];
    });

    var settingRows = Object.keys(data.settings).map(function (k) { return [k, data.settings[k]]; });

    return {
      sheets: [
        {
          name: SHEET.CARILER,
          columns: [
            { header: 'ID', width: 6 }, { header: 'KOD', width: 10 }, { header: 'CARİ ADI', width: 34 },
            { header: 'ADRES', width: 38 }, { header: 'TELEFON', width: 16 }, { header: 'VERGİ DAİRESİ', width: 16 },
            { header: 'VERGİ NO', width: 14 }, { header: 'AKTİF', width: 9 }, { header: 'NOT', width: 28 },
            { header: 'BAKİYE', width: 14 }
          ],
          rows: cariRows
        },
        {
          name: SHEET.KULLANICILAR,
          columns: [
            { header: 'ID', width: 6 }, { header: 'AD SOYAD', width: 24 }, { header: 'KULLANICI ADI', width: 18 },
            { header: 'TUZ', width: 20 }, { header: 'ŞİFRE', width: 34 }, { header: 'ROL', width: 12 },
            { header: 'AKTİF', width: 9 }, { header: 'SON GİRİŞ', width: 20 }
          ],
          rows: kullaniciRows
        },
        {
          name: SHEET.MODELLER,
          columns: [
            { header: 'ID', width: 6 }, { header: 'MODEL', width: 38 }, { header: 'KATEGORİ', width: 11 },
            { header: 'RENKLER', width: 30 }, { header: 'FİYAT', width: 11 }, { header: 'ASORTİ', width: 8 },
            { header: 'ASORTİ ŞABLONU', width: 24 }, { header: 'MALİYET', width: 11 },
            { header: 'BARKOD', width: 18 }, { header: 'SEZON', width: 10 }, { header: 'NOT', width: 26 }
          ],
          rows: modelRows
        },
        {
          name: SHEET.ORDERS,
          columns: [
            { header: 'ID', width: 6 }, { header: 'CARİ ID', width: 8 }, { header: 'CARİ', width: 24 },
            { header: 'SİP. NO', width: 8 }, { header: 'TARİH', width: 12 },
            { header: 'MODEL', width: 38 }, { header: 'RENK', width: 16 }, { header: 'ASORTİ', width: 8 },
            { header: 'SİPARİŞ ÇİFT', width: 12 }, { header: 'SİPARİŞ KOLİ', width: 12 },
            { header: 'FİYAT', width: 11 }, { header: 'TUTAR', width: 14 },
            { header: 'GİDEN ÇİFT', width: 11 }, { header: 'KALAN ÇİFT', width: 11 },
            { header: 'KALAN KOLİ', width: 11 }, { header: 'TÜR', width: 11 }, { header: 'GRUP', width: 11 },
            { header: 'KOD', width: 18 }, { header: 'NOT', width: 28 }
          ],
          rows: orderRows
        },
        {
          name: SHEET.ORDER_LINES,
          columns: [
            { header: 'ID', width: 6 }, { header: 'SİPARİŞ ID', width: 10 }, { header: 'RENK', width: 18 },
            { header: 'MOD', width: 10 }, { header: 'BEDEN', width: 8 }, { header: 'KOLİ', width: 9 },
            { header: 'KOLİ İÇİ', width: 9 }, { header: 'ÇİFT', width: 10 }
          ],
          rows: orderLineRows
        },
        {
          name: SHEET.LEDGER,
          columns: [
            { header: 'ID', width: 6 }, { header: 'CARİ ID', width: 8 }, { header: 'CARİ', width: 24 },
            { header: 'TARİH', width: 12 }, { header: 'FİŞ NO', width: 9 },
            { header: 'SİP. NO', width: 8 }, { header: 'İŞLEM', width: 12 }, { header: 'AÇIKLAMA', width: 38 },
            { header: 'RENK', width: 14 }, { header: 'KOLİ', width: 9 }, { header: 'ÇİFT', width: 9 },
            { header: 'FİYAT', width: 11 }, { header: 'TUTAR', width: 13 }, { header: 'BORÇ', width: 13 },
            { header: 'ALACAK', width: 13 }, { header: 'BAKİYE', width: 14 }, { header: 'GRUP', width: 11 },
            { header: 'KOD', width: 18 }, { header: 'SEVK FİŞ NO', width: 12 }
          ],
          rows: ledgerRows
        },
        {
          name: SHEET.SHIPMENTS,
          columns: [
            { header: 'ID', width: 6 }, { header: 'CARİ ID', width: 8 }, { header: 'CARİ', width: 24 },
            { header: 'FİŞ NO', width: 9 }, { header: 'TARİH', width: 12 }, { header: 'AÇIKLAMA', width: 34 },
            { header: 'FATURA NO', width: 14 }, { header: 'FATURA TARİH', width: 13 },
            { header: 'KOLİ', width: 10 }, { header: 'ÇİFT', width: 10 }, { header: 'TUTAR', width: 14 }
          ],
          rows: shipmentRows
        },
        {
          name: SHEET.LINES,
          columns: [
            { header: 'ID', width: 6 }, { header: 'SEVK ID', width: 8 }, { header: 'SİPARİŞ ID', width: 11 },
            { header: 'SİPARİŞ SATIR ID', width: 12 }, { header: 'MODEL', width: 34 }, { header: 'RENK', width: 16 },
            { header: 'BEDEN', width: 8 }, { header: 'MOD', width: 10 }, { header: 'KOLİ', width: 8 },
            { header: 'KOLİ İÇİ', width: 9 }, { header: 'ÇİFT', width: 8 }, { header: 'FİYAT', width: 10 },
            { header: 'TUTAR', width: 12 }, { header: 'DAĞILIM', width: 30 }
          ],
          rows: lineRows
        },
        {
          name: SHEET.AUDIT,
          columns: [
            { header: 'ID', width: 6 }, { header: 'TARİH', width: 22 }, { header: 'KULLANICI', width: 18 },
            { header: 'İŞLEM', width: 16 }, { header: 'DETAY', width: 60 }
          ],
          rows: auditRows
        },
        {
          name: SHEET.TRASH,
          columns: [
            { header: 'ID', width: 6 }, { header: 'TARİH', width: 22 }, { header: 'KULLANICI', width: 18 },
            { header: 'TÜR', width: 10 }, { header: 'AD', width: 40 }, { header: 'VERİ', width: 60 }
          ],
          rows: trashRows
        },
        {
          name: SHEET.IMAGES,
          hidden: true,
          columns: [{ header: 'SİPARİŞ ID', width: 11 }, { header: 'RESİM', width: 40 }],
          rows: imageRows
        },
        {
          name: SHEET.MODEL_IMAGES,
          hidden: true,
          columns: [{ header: 'MODEL ID', width: 11 }, { header: 'RESİM', width: 40 }],
          rows: modelImageRows
        },
        {
          name: SHEET.SETTINGS,
          columns: [{ header: 'AYAR', width: 22 }, { header: 'DEĞER', width: 60 }],
          rows: settingRows
        }
      ]
    };
  }

  /* ------------------------------------------------------------------ */
  /* Excel'den okuma                                                     */
  /* ------------------------------------------------------------------ */
  var CARI_KEYS = {
    ID: 'id', KOD: 'kod', CARIADI: 'ad', AD: 'ad', UNVAN: 'ad', ADRES: 'adres', TELEFON: 'tel', TEL: 'tel',
    VERGIDAIRESI: 'vergiDairesi', VERGINO: 'vergiNo', AKTIF: 'aktif', NOT: 'not'
  };
  var KULLANICI_KEYS = {
    ID: 'id', AD: 'ad', ADSOYAD: 'ad', KULLANICIADI: 'kullanici', KULLANICI: 'kullanici',
    TUZ: 'tuz', SIFRE: 'sifre', ROL: 'rol', AKTIF: 'aktif', SONGIRIS: 'sonGiris'
  };
  var MODEL_KEYS = {
    ID: 'id', MODEL: 'model', MODELBILGISI: 'model', FIYAT: 'fiyat', ASORTI: 'asorti', MALIYET: 'maliyet',
    KATEGORI: 'kategori', RENKLER: 'renkler', ASORTISABLONU: 'asortiSablon',
    BARKOD: 'barkod', SEZON: 'sezon', NOT: 'not'
  };
  var ORDER_KEYS = {
    ID: 'id', CARIID: 'cariId', CARI: 'cariName',
    SIPNO: 'sipno', TARIH: 'tarih', MODEL: 'model', MODELBILGISI: 'model', RENK: 'renk',
    ASORTI: 'asorti', SIPARISCIFT: 'adet', SIPARISKOLI: 'koli', FIYAT: 'fiyat', TUTAR: 'tutar',
    GIDENCIFT: 'giden', KALANCIFT: 'kalan', KALANKOLI: 'kalanKoli', TUR: 'tur', GRUP: 'grup',
    KOD: 'kod', NOT: 'not'
  };
  var LEDGER_KEYS = {
    ID: 'id', CARIID: 'cariId', CARI: 'cariName',
    TARIH: 'tarih', FISNO: 'fisNo', SIPNO: 'sipno', ISLEM: 'islem', ACIKLAMA: 'aciklama',
    ACIKLAMA1: 'aciklama', ACIKLAMA2: 'renk', RENK: 'renk', KOLI: 'koli', MIKTAR: 'cift', CIFT: 'cift',
    FIYAT: 'fiyat', TUTAR: 'tutar', BORC: 'borc', ALACAK: 'alacak', BAKIYE: 'bakiye', GRUP: 'grup',
    KOD: 'kod', SEVKFISNO: 'sevkFisNo'
  };
  var SHIPMENT_KEYS = { ID: 'id', CARIID: 'cariId', CARI: 'cariName', FISNO: 'fisNo', TARIH: 'tarih', ACIKLAMA: 'aciklama', FATURANO: 'faturaNo', FATURATARIH: 'faturaTarih', KOLI: 'koli', CIFT: 'cift', TUTAR: 'tutar' };
  var ORDER_LINE_KEYS = { ID: 'id', SIPARISID: 'orderId', RENK: 'renk', MOD: 'mod', BEDEN: 'beden', KOLI: 'koli', KOLIICI: 'koliIci', CIFT: 'cift' };
  var LINE_KEYS = { ID: 'id', SEVKID: 'sevkId', SEVKFISNO: 'sevkId', SIPARISID: 'orderId', SIPARISSATIRID: 'orderLineId', ORDERLINEID: 'orderLineId', MODEL: 'model', RENK: 'renk', BEDEN: 'beden', MOD: 'mod', KOLI: 'koli', KOLIICI: 'koliIci', CIFT: 'cift', FIYAT: 'fiyat', TUTAR: 'tutar', DAGILIM: 'dagilim' };

  function headerMap(row, keys) {
    var map = {};
    (row || []).forEach(function (h, i) {
      var k = keys[normKey(h)];
      if (k) map[k] = i;
    });
    return map;
  }

  function pick(row, map, key) {
    if (map[key] === undefined) return undefined;
    return row[map[key]];
  }

  function sheetByName(sheets, name) {
    var target = normKey(name);
    return sheets.filter(function (s) { return normKey(s.name) === target; })[0] || null;
  }

  function readData(sheets) {
    var ordersSheet = sheetByName(sheets, SHEET.ORDERS) || sheetByName(sheets, 'SİPARİŞ TAKİBİ');
    if (!ordersSheet) throw new Error('Bu dosya DMR veri dosyası değil (SİPARİŞLER sayfası yok).');
    if (!sheetByName(sheets, SHEET.ORDERS) && !sheetByName(sheets, SHEET.LINES)) {
      throw new Error('Bu dosya eski VBA dosyası gibi görünüyor. "Eski Excel\'den içe aktar" seçeneğini kullanın.');
    }

    var data = emptyData();

    // --- ayarlar
    var setSheet = sheetByName(sheets, SHEET.SETTINGS);
    if (setSheet) {
      var sm = headerMap(setSheet.rows[0], { AYAR: 'k', ANAHTAR: 'k', DEGER: 'v', DEGER2: 'v' });
      for (var i = 1; i < setSheet.rows.length; i++) {
        var row = setSheet.rows[i];
        var key = pick(row, sm, 'k');
        if (!key) continue;
        var val = pick(row, sm, 'v');
        if (key === 'sonSiparisNo' || key === 'sonFisNo' || key === 'varsayilanAsorti') val = num(val);
        data.settings[key] = val === undefined || val === null ? '' : val;
      }
    }
    data.settings = Object.assign(defaultSettings(), data.settings);

    // --- cariler
    var cariSheet = sheetByName(sheets, SHEET.CARILER);
    if (cariSheet) {
      var cm = headerMap(cariSheet.rows[0], CARI_KEYS);
      for (var ci = 1; ci < cariSheet.rows.length; ci++) {
        var crow = cariSheet.rows[ci];
        if (!crow) continue;
        var ad = pick(crow, cm, 'ad');
        if (!ad) continue;
        var c = normalizeCari({
          id: num(pick(crow, cm, 'id')) || nextId(data.cariler),
          kod: pick(crow, cm, 'kod'),
          ad: ad,
          adres: pick(crow, cm, 'adres'),
          tel: pick(crow, cm, 'tel'),
          vergiDairesi: pick(crow, cm, 'vergiDairesi'),
          vergiNo: pick(crow, cm, 'vergiNo'),
          not: pick(crow, cm, 'not'),
          aktif: pick(crow, cm, 'aktif')
        });
        if (!c.kod) c.kod = 'C' + c.id;
        if (data.cariler.some(function (x) { return x.id === c.id; })) c.id = nextId(data.cariler);
        data.cariler.push(c);
      }
    }
    if (!data.cariler.length) {
      var def = defaultCari(data.settings.cariAdi || 'YENİ CARİ');
      if (data.settings.firmaAdres) def.adres = data.settings.firmaAdres;
      data.cariler.push(def);
      data._upgraded = !cariSheet;
    }

    var varsayilanCari = data.cariler[0].id;
    var cariByName = {};
    data.cariler.forEach(function (c) { cariByName[normKey(c.ad)] = c.id; });

    function resolveCari(id, name) {
      var nid = num(id);
      if (nid && data.cariler.some(function (c) { return c.id === nid; })) return nid;
      var key = normKey(name);
      if (key && cariByName[key]) return cariByName[key];
      return varsayilanCari;
    }

    // --- kullanıcılar
    var ks = sheetByName(sheets, SHEET.KULLANICILAR);
    if (ks) {
      var km = headerMap(ks.rows[0], KULLANICI_KEYS);
      for (var ki = 1; ki < ks.rows.length; ki++) {
        var krow = ks.rows[ki];
        if (!krow) continue;
        var kadi = pick(krow, km, 'kullanici');
        if (!kadi) continue;
        var u = normalizeKullanici({
          id: num(pick(krow, km, 'id')) || nextId(data.kullanicilar),
          ad: pick(krow, km, 'ad'),
          kullanici: kadi,
          tuz: pick(krow, km, 'tuz'),
          sifre: pick(krow, km, 'sifre'),
          rol: pick(krow, km, 'rol'),
          aktif: pick(krow, km, 'aktif'),
          sonGiris: pick(krow, km, 'sonGiris')
        });
        data.kullanicilar.push(u);
      }
    }

    // --- model kartları
    var mk = sheetByName(sheets, SHEET.MODELLER);
    if (mk) {
      var mkm = headerMap(mk.rows[0], MODEL_KEYS);
      for (var mi = 1; mi < mk.rows.length; mi++) {
        var mrow = mk.rows[mi];
        if (!mrow) continue;
        var mname = pick(mrow, mkm, 'model');
        if (!mname) continue;
        data.modeller.push(normalizeModel({
          id: num(pick(mrow, mkm, 'id')) || nextId(data.modeller),
          model: mname,
          kategori: pick(mrow, mkm, 'kategori'),
          renkler: pick(mrow, mkm, 'renkler'),
          asortiSablon: pick(mrow, mkm, 'asortiSablon'),
          fiyat: pick(mrow, mkm, 'fiyat'),
          asorti: pick(mrow, mkm, 'asorti'),
          maliyet: pick(mrow, mkm, 'maliyet'),
          barkod: pick(mrow, mkm, 'barkod'),
          sezon: pick(mrow, mkm, 'sezon'),
          not: pick(mrow, mkm, 'not')
        }));
      }
    }

    // --- siparişler
    var om = headerMap(ordersSheet.rows[0], ORDER_KEYS);
    if (om.model === undefined) throw new Error('SİPARİŞLER sayfasında MODEL kolonu bulunamadı.');
    for (var r = 1; r < ordersSheet.rows.length; r++) {
      var orow = ordersSheet.rows[r];
      if (!orow || !orow[om.model]) continue;
      var o = normalizeOrder({
        id: num(pick(orow, om, 'id')),
        cariId: resolveCari(pick(orow, om, 'cariId'), pick(orow, om, 'cariName')),
        sipno: pick(orow, om, 'sipno'),
        tarih: pick(orow, om, 'tarih'),
        model: pick(orow, om, 'model'),
        renk: pick(orow, om, 'renk'),
        asorti: pick(orow, om, 'asorti'),
        adet: pick(orow, om, 'adet'),
        fiyat: pick(orow, om, 'fiyat'),
        tur: pick(orow, om, 'tur'),
        grup: pick(orow, om, 'grup'),
        kod: pick(orow, om, 'kod'),
        not: pick(orow, om, 'not')
      });
      if (!o.sipno) o.sipno = nextOrderNo(data);
      o.id = o.id || nextId(data.orders);
      data.orders.push(o);
    }

    // --- cari hesap
    var ls = sheetByName(sheets, SHEET.LEDGER) || sheetByName(sheets, 'CARIHESAP');
    if (ls) {
      var lhIndex = 0;
      for (var q = 0; q < Math.min(ls.rows.length, 12); q++) {
        var joined = normKey((ls.rows[q] || []).join(''));
        if (joined.indexOf('ACIKLAMA') >= 0 && joined.indexOf('TARIH') >= 0) { lhIndex = q; break; }
      }
      var lm = headerMap(ls.rows[lhIndex], LEDGER_KEYS);
      for (var rr = lhIndex + 1; rr < ls.rows.length; rr++) {
        var lrow = ls.rows[rr];
        if (!lrow) continue;
        var aciklama = pick(lrow, lm, 'aciklama');
        var tutar = num(pick(lrow, lm, 'tutar'));
        var borc = num(pick(lrow, lm, 'borc'));
        var alacak = num(pick(lrow, lm, 'alacak'));
        if (!aciklama && !tutar && !borc && !alacak) continue;
        if (borc === 0 && alacak === 0 && tutar > 0) borc = tutar;
        var islemRaw = pick(lrow, lm, 'islem');
        var islem = islemRaw ? String(islemRaw).toLocaleUpperCase('tr-TR') : (alacak > 0 ? TYPES.TAHSILAT : TYPES.SATIS);
        var lentry = {
          id: num(pick(lrow, lm, 'id')) || nextId(data.ledger),
          cariId: resolveCari(pick(lrow, lm, 'cariId'), pick(lrow, lm, 'cariName')),
          tarih: toISODate(pick(lrow, lm, 'tarih')) || todayISO(),
          fisNo: String(pick(lrow, lm, 'fisNo') === undefined ? '' : pick(lrow, lm, 'fisNo')),
          sipno: String(pick(lrow, lm, 'sipno') === undefined ? '' : pick(lrow, lm, 'sipno')),
          islem: islem,
          aciklama: String(aciklama || ''),
          renk: String(pick(lrow, lm, 'renk') || ''),
          koli: num(pick(lrow, lm, 'koli')),
          cift: num(pick(lrow, lm, 'cift')),
          fiyat: num(pick(lrow, lm, 'fiyat')),
          tutar: tutar || borc || alacak,
          borc: borc,
          alacak: alacak,
          grup: String(pick(lrow, lm, 'grup') || ''),
          kod: String(pick(lrow, lm, 'kod') || ''),
          sevkFisNo: String(pick(lrow, lm, 'sevkFisNo') || ''),
          sevkId: 0
        };
        data.ledger.push(lentry);
      }
    }

    // --- sipariş satırları
    var ols = sheetByName(sheets, SHEET.ORDER_LINES);
    if (ols) {
      var olm = headerMap(ols.rows[0], ORDER_LINE_KEYS);
      for (var oli = 1; oli < ols.rows.length; oli++) {
        var olrow = ols.rows[oli];
        if (!olrow || !num(pick(olrow, olm, 'orderId'))) continue;
        data.orderLines.push({
          id: num(pick(olrow, olm, 'id')) || nextId(data.orderLines),
          orderId: num(pick(olrow, olm, 'orderId')),
          renk: String(pick(olrow, olm, 'renk') || ''),
          mod: String(pick(olrow, olm, 'mod') || 'ESKI'),
          beden: num(pick(olrow, olm, 'beden')),
          koli: num(pick(olrow, olm, 'koli')),
          koliIci: num(pick(olrow, olm, 'koliIci')),
          cift: num(pick(olrow, olm, 'cift'))
        });
      }
    }

    // --- sevk fişleri / satırları
    var ss = sheetByName(sheets, SHEET.SHIPMENTS);
    if (ss) {
      var smm = headerMap(ss.rows[0], SHIPMENT_KEYS);
      for (var s1 = 1; s1 < ss.rows.length; s1++) {
        var srow = ss.rows[s1];
        if (!srow || !num(pick(srow, smm, 'fisNo'))) continue;
        var scariId = resolveCari(pick(srow, smm, 'cariId'), pick(srow, smm, 'cariName'));
        data.shipments.push({
          id: num(pick(srow, smm, 'id')) || nextId(data.shipments),
          cariId: scariId,
          cari: cariName(data, scariId),
          fisNo: num(pick(srow, smm, 'fisNo')),
          tarih: toISODate(pick(srow, smm, 'tarih')) || todayISO(),
          aciklama: String(pick(srow, smm, 'aciklama') || ''),
          faturaNo: String(pick(srow, smm, 'faturaNo') || ''),
          faturaTarih: toISODate(pick(srow, smm, 'faturaTarih')) || '',
          koli: num(pick(srow, smm, 'koli')),
          cift: num(pick(srow, smm, 'cift')),
          tutar: num(pick(srow, smm, 'tutar'))
        });
      }
    }

    var ln = sheetByName(sheets, SHEET.LINES);
    if (ln) {
      var lmm = headerMap(ln.rows[0], LINE_KEYS);
      for (var s2 = 1; s2 < ln.rows.length; s2++) {
        var lrow2 = ln.rows[s2];
        if (!lrow2 || !num(pick(lrow2, lmm, 'sevkId'))) continue;
        data.lines.push({
          id: num(pick(lrow2, lmm, 'id')) || nextId(data.lines),
          sevkId: num(pick(lrow2, lmm, 'sevkId')),
          orderId: num(pick(lrow2, lmm, 'orderId')),
          orderLineId: num(pick(lrow2, lmm, 'orderLineId')),
          model: String(pick(lrow2, lmm, 'model') || ''),
          renk: String(pick(lrow2, lmm, 'renk') || ''),
          beden: num(pick(lrow2, lmm, 'beden')),
          mod: String(pick(lrow2, lmm, 'mod') || ''),
          koliIci: num(pick(lrow2, lmm, 'koliIci')),
          dagilim: Matris.parseDagilim(pick(lrow2, lmm, 'dagilim')),
          koli: num(pick(lrow2, lmm, 'koli')),
          cift: num(pick(lrow2, lmm, 'cift')),
          fiyat: num(pick(lrow2, lmm, 'fiyat')),
          tutar: num(pick(lrow2, lmm, 'tutar'))
        });
      }
    }

    // --- resimler
    var im = sheetByName(sheets, SHEET.IMAGES);
    if (im) {
      for (var r2 = 1; r2 < im.rows.length; r2++) {
        var irow = im.rows[r2];
        if (!irow) continue;
        var oid = num(irow[0]);
        if (oid && irow[1]) data.images[oid] = String(irow[1]);
      }
    }

    // --- model resimleri
    var mimg = sheetByName(sheets, SHEET.MODEL_IMAGES);
    if (mimg) {
      for (var mi2 = 1; mi2 < mimg.rows.length; mi2++) {
        var mrow2 = mimg.rows[mi2];
        if (!mrow2) continue;
        var mid2 = num(mrow2[0]);
        if (mid2 && mrow2[1]) data.modelImages[mid2] = String(mrow2[1]);
      }
    }

    // --- işlem günlüğü
    var au = sheetByName(sheets, SHEET.AUDIT);
    if (au) {
      for (var ai = 1; ai < au.rows.length; ai++) {
        var arow = au.rows[ai];
        if (!arow || !arow[0]) continue;
        data.audit.push({
          id: num(arow[0]),
          tarih: String(arow[1] || ''),
          kullanici: String(arow[2] || ''),
          islem: String(arow[3] || ''),
          detay: String(arow[4] || '')
        });
      }
    }

    // --- çöp kutusu
    var tr = sheetByName(sheets, SHEET.TRASH);
    if (tr) {
      for (var ti = 1; ti < tr.rows.length; ti++) {
        var trow = tr.rows[ti];
        if (!trow || !trow[0]) continue;
        var veri = {};
        try { veri = JSON.parse(String(trow[5] || '{}')); } catch (e) { veri = {}; }
        data.trash.push({
          id: num(trow[0]),
          tarih: String(trow[1] || ''),
          kullanici: String(trow[2] || ''),
          tur: String(trow[3] || ''),
          ad: String(trow[4] || ''),
          veri: veri
        });
      }
    }

    Matris.ensureLines(data);

    data.settings.sonSiparisNo = Math.max(num(data.settings.sonSiparisNo), data.orders.reduce(function (m, o) { return Math.max(m, num(o.sipno)); }, 0));
    data.settings.sonFisNo = Math.max(num(data.settings.sonFisNo), data.shipments.reduce(function (m, s) { return Math.max(m, num(s.fisNo)); }, 0), data.ledger.reduce(function (m, l) { return Math.max(m, num(l.fisNo) || 0); }, 0));

    return data;
  }

  /* ------------------------------------------------------------------ */
  /* Eski VBA dosyasından içe aktarma                       */
  /* ------------------------------------------------------------------ */
  function importLegacy(sheets) {
    var data = emptyData();
    var orderSheet = null, cariSheet = null, sevkSheet = null;
    sheets.forEach(function (s) {
      var n = normKey(s.name);
      if (n.indexOf('SIPARIS') === 0 || n === 'SIPARISTAKIBI') orderSheet = s;
      if (n === 'CARIHESAP') cariSheet = s;
      if (n.indexOf('SEVKFIS') === 0) sevkSheet = s;
    });
    if (!orderSheet) throw new Error('Dosyada "SİPARİŞ TAKİBİ" sayfası bulunamadı.');

    // firma bilgileri
    if (sevkSheet) {
      var txt = function (v) { return v === null || v === undefined ? '' : String(v).trim(); };
      var findCell = function (label) {
        for (var r = 0; r < Math.min(sevkSheet.rows.length, 12); r++) {
          var row = sevkSheet.rows[r] || [];
          for (var c = 0; c < row.length; c++) {
            if (normKey(row[c]).indexOf(normKey(label)) === 0 && c + 1 < row.length) return row[c + 1];
          }
        }
        return '';
      };
      var cari = findCell('FİRMA');
      var adres = findCell('ADRES');
      if (cari) data.settings.cariAdi = txt(cari);
      if (adres) data.settings.firmaAdres = txt(adres);
      var title = sevkSheet.rows[1] && sevkSheet.rows[1][1];
      if (title) data.settings.firmaAdi = txt(title);
    }

    // tek cari oluştur (eski dosya tek müşteriye ait)
    var legacyCari = defaultCari(data.settings.cariAdi || 'YENİ CARİ');
    legacyCari.id = 1;
    if (data.settings.firmaAdres) legacyCari.adres = data.settings.firmaAdres;
    data.cariler.push(legacyCari);

    // siparişler
    var om = headerMap(orderSheet.rows[0], ORDER_KEYS);
    for (var r = 1; r < orderSheet.rows.length; r++) {
      var row = orderSheet.rows[r];
      if (!row || !row[om.model]) continue;
      if (row[om.sipno] === undefined || row[om.sipno] === null || row[om.sipno] === '') continue;
      var adet = num(pick(row, om, 'adet'));
      if (!adet) continue;
      var o = normalizeOrder({
        id: nextId(data.orders),
        cariId: legacyCari.id,
        sipno: pick(row, om, 'sipno'),
        tarih: todayISO(),
        model: pick(row, om, 'model'),
        renk: pick(row, om, 'renk'),
        asorti: pick(row, om, 'asorti'),
        adet: adet,
        fiyat: pick(row, om, 'fiyat'),
        tur: pick(row, om, 'tur'),
        grup: pick(row, om, 'grup'),
        kod: pick(row, om, 'kod'),
        not: ''
      });
      data.orders.push(o);
    }

    // cari hesap
    var ledgerRows = [];
    if (cariSheet) {
      var hIdx = 0;
      for (var q = 0; q < Math.min(cariSheet.rows.length, 12); q++) {
        var joined = normKey((cariSheet.rows[q] || []).join(''));
        if (joined.indexOf('ACIKLAMA') >= 0 && joined.indexOf('TARIH') >= 0) { hIdx = q; break; }
      }
      var lm = headerMap(cariSheet.rows[hIdx], LEDGER_KEYS);
      for (var rr = hIdx + 1; rr < cariSheet.rows.length; rr++) {
        var lrow = cariSheet.rows[rr];
        if (!lrow) continue;
        var aciklama = pick(lrow, lm, 'aciklama');
        var tutar = num(pick(lrow, lm, 'tutar'));
        var borc = num(pick(lrow, lm, 'borc'));
        var alacak = num(pick(lrow, lm, 'alacak'));
        if (!aciklama && !tutar && !borc && !alacak) continue;
        if (borc === 0 && alacak === 0 && tutar > 0) borc = tutar;
        var islemRaw = pick(lrow, lm, 'islem');
        var sipnoRaw = pick(lrow, lm, 'sipno');
        var islem;
        // Eski dosyada C kolonu hem sipariş no hem işlem türü olarak kullanılıyor
        if (islemRaw === undefined || islemRaw === null || islemRaw === '') {
          islemRaw = sipnoRaw;
        }
        if (islemRaw === undefined || islemRaw === null || islemRaw === '' || !isNaN(parseFloat(islemRaw))) {
          islem = alacak > 0 && borc === 0 ? TYPES.TAHSILAT : TYPES.SATIS;
        } else {
          islem = String(islemRaw).toLocaleUpperCase('tr-TR').trim();
          sipnoRaw = '';
        }
        ledgerRows.push({
          cariId: legacyCari.id,
          tarih: toISODate(pick(lrow, lm, 'tarih')) || todayISO(),
          fisNo: String(pick(lrow, lm, 'fisNo') === undefined ? '' : pick(lrow, lm, 'fisNo')),
          sipno: String(sipnoRaw === undefined || sipnoRaw === null ? '' : sipnoRaw),
          islem: islem,
          aciklama: String(aciklama || ''),
          renk: String(pick(lrow, lm, 'renk') || ''),
          koli: num(pick(lrow, lm, 'koli')),
          cift: num(pick(lrow, lm, 'cift')),
          fiyat: num(pick(lrow, lm, 'fiyat')),
          tutar: tutar || borc || alacak,
          borc: borc,
          alacak: alacak,
          grup: String(pick(lrow, lm, 'grup') || ''),
          kod: String(pick(lrow, lm, 'kod') || ''),
          sevkFisNo: '',
          sevkId: 0
        });
      }
    }

    // Sevk fişlerini cari kayıtlarından yeniden kur (model bazlı eşleştirme)
    var ordersByModel = {};
    data.orders.forEach(function (o) {
      var key = normKey(o.model);
      (ordersByModel[key] = ordersByModel[key] || []).push(o);
    });
    var allocIndex = {};
    var shipmentByKey = {};

    ledgerRows.forEach(function (row) {
      if (row.islem !== TYPES.SATIS) return;
      var qty = row.cift || (row.fiyat > 0 ? row.tutar / row.fiyat : 0);
      if (qty <= 0) return;

      var key = normKey(row.aciklama.split(' / ')[0]);
      var list = ordersByModel[key] || [];
      var sevkKey = String(row.fisNo || '') + '|' + row.tarih;
      var shipment = shipmentByKey[sevkKey];

      if (!shipment) {
        shipment = {
          id: nextId(data.shipments),
          fisNo: num(row.fisNo) || (data.shipments.reduce(function (m, s) { return Math.max(m, num(s.fisNo)); }, 0) + 1),
          tarih: row.tarih, cariId: legacyCari.id, cari: legacyCari.ad, aciklama: '', koli: 0, cift: 0, tutar: 0
        };
        data.shipments.push(shipment);
        shipmentByKey[sevkKey] = shipment;
      }

      var idx = allocIndex[key] || 0;
      var remaining = qty;
      var dagitilanTutar = 0;
      var fiyat = row.fiyat || 0;

      while (remaining > 0.001 && idx < list.length) {
        var order = list[idx];
        var used = data.lines.filter(function (l) { return l.orderId === order.id; }).reduce(function (a, l) { return a + l.cift; }, 0);
        var free = num(order.adet) - used;
        if (free <= 0.001) { idx++; continue; }
        var take = Math.min(free, remaining);
        var lineTutar = round2(row.tutar * (take / qty));
        var asorti = num(order.asorti) || 1;
        data.lines.push({
          id: nextId(data.lines), sevkId: shipment.id, orderId: order.id, model: order.model, renk: order.renk,
          koli: take / asorti, cift: take, fiyat: fiyat || num(order.fiyat), tutar: lineTutar
        });
        shipment.koli += take / asorti;
        shipment.cift += take;
        shipment.tutar += lineTutar;
        remaining -= take;
        dagitilanTutar += lineTutar;
        if (take >= free - 0.001) idx++;
      }
      allocIndex[key] = idx;

      if (remaining > 0.001) {
        // Sipariş listesinde karşılığı olmayan (eski) model: arşiv satırı — stoğa etki etmez
        var kalanTutar = round2(Math.max(0, row.tutar - dagitilanTutar));
        var kalanKoli = row.koli ? row.koli * (remaining / qty) : remaining / 10;
        data.lines.push({
          id: nextId(data.lines), sevkId: shipment.id, orderId: 0,
          model: row.aciklama, renk: row.renk,
          koli: Math.round(kalanKoli * 1000) / 1000, cift: remaining, fiyat: fiyat, tutar: kalanTutar
        });
        shipment.koli += kalanKoli;
        shipment.cift += remaining;
        shipment.tutar += kalanTutar;
      }

      row.sevkId = shipment.id;
      row.sevkFisNo = String(shipment.fisNo);
    });

    data.shipments.forEach(function (s) {
      s.koli = Math.round(s.koli * 1000) / 1000;
      s.cift = Math.round(s.cift * 1000) / 1000;
      s.tutar = round2(s.tutar);
      delete s._key;
    });

    ledgerRows.forEach(function (row) {
      row.id = nextId(data.ledger);
      data.ledger.push(row);
    });

    data.settings.sonSiparisNo = data.orders.reduce(function (m, o) { return Math.max(m, num(o.sipno)); }, 0);
    data.settings.sonFisNo = Math.max(
      data.shipments.reduce(function (m, s) { return Math.max(m, num(s.fisNo)); }, 0),
      data.ledger.reduce(function (m, l) { return Math.max(m, num(l.fisNo) || 0); }, 0)
    );
    data.settings.kurulum = new Date().toISOString();
    return data;
  }

  /**
   * Eski bir VBA dosyasını mevcut veritabanına yeni bir cari olarak ekler.
   * Kimlikler, fiş numaraları ve bağlantılar çakışmayacak şekilde yeniden üretilir.
   */
  function mergeLegacy(data, legacy, opts) {
    opts = opts || {};
    var kaynakCari = legacy.cariler[0] || {};
    var istenen = String(opts.cariAd || kaynakCari.ad || 'Yeni Cari').trim();
    var cari;
    var bosVeritabani = !data.orders.length && !data.ledger.length && !data.shipments.length;

    if (bosVeritabani && data.cariler.length === 1) {
      // Boş veritabanındaki yer tutucu cariyi kullan
      cari = data.cariler[0];
      cari.ad = istenen;
      cari.adres = kaynakCari.adres || cari.adres || '';
      cari.tel = kaynakCari.tel || cari.tel || '';
      cari.vergiDairesi = kaynakCari.vergiDairesi || cari.vergiDairesi || '';
      cari.vergiNo = kaynakCari.vergiNo || cari.vergiNo || '';
      if (opts.kod) cari.kod = String(opts.kod).trim();
    } else {
      var ad = istenen, n = 2;
      while (data.cariler.some(function (c) { return normKey(c.ad) === normKey(ad); })) {
        ad = istenen + ' (' + n + ')';
        n++;
      }
      cari = {
        id: nextId(data.cariler),
        kod: String(opts.kod || '').trim() || ('C' + (data.cariler.length + 1)),
        ad: ad,
        adres: kaynakCari.adres || '',
        tel: kaynakCari.tel || '',
        vergiDairesi: kaynakCari.vergiDairesi || '',
        vergiNo: kaynakCari.vergiNo || '',
        not: String(opts.not || '').trim(),
        aktif: true
      };
      data.cariler.push(cari);
    }

    var orderMap = {};
    legacy.orders.forEach(function (o) {
      var nid = nextId(data.orders);
      orderMap[o.id] = nid;
      var copy = Object.assign({}, o, { id: nid, cariId: cari.id });
      data.orders.push(copy);
      if (num(copy.sipno) > num(data.settings.sonSiparisNo)) data.settings.sonSiparisNo = num(copy.sipno);
    });

    var shipMap = {};
    legacy.shipments.slice().sort(function (a, b) { return num(a.fisNo) - num(b.fisNo); }).forEach(function (s) {
      var nid = nextId(data.shipments);
      shipMap[s.id] = nid;
      var wanted = num(s.fisNo);
      var fis = wanted && !data.shipments.some(function (x) { return num(x.fisNo) === wanted; }) ? wanted : nextFisNo(data);
      data.shipments.push(Object.assign({}, s, { id: nid, cariId: cari.id, cari: cari.ad, fisNo: fis }));
    });

    var satirSayisi = 0;
    legacy.lines.forEach(function (l) {
      data.lines.push(Object.assign({}, l, {
        id: nextId(data.lines),
        sevkId: shipMap[l.sevkId] || 0,
        orderId: orderMap[l.orderId] || 0
      }));
      satirSayisi++;
    });

    var shipById = {};
    data.shipments.forEach(function (s) { shipById[s.id] = s; });

    var hareketSayisi = 0;
    legacy.ledger.forEach(function (r) {
      var copy = Object.assign({}, r, { id: nextId(data.ledger), cariId: cari.id });
      if (r.sevkId && shipMap[r.sevkId]) {
        copy.sevkId = shipMap[r.sevkId];
        copy.sevkFisNo = String(shipById[copy.sevkId].fisNo);
        copy.fisNo = String(shipById[copy.sevkId].fisNo);
      } else {
        copy.sevkId = 0;
      }
      data.ledger.push(copy);
      hareketSayisi++;
    });

    Matris.ensureLines(data);
    data.settings.sonFisNo = data.shipments.reduce(function (m, s) { return Math.max(m, num(s.fisNo)); }, num(data.settings.sonFisNo));
    data.settings.sonSiparisNo = data.orders.reduce(function (m, o) { return Math.max(m, num(o.sipno)); }, num(data.settings.sonSiparisNo));

    return {
      cari: cari,
      orders: legacy.orders.length,
      ledger: hareketSayisi,
      shipments: legacy.shipments.length,
      lines: satirSayisi,
      balance: balance(data, cari.id)
    };
  }

  /* ------------------------------------------------------------------ */
  return {
    TYPES: TYPES,
    SHEET: SHEET,
    emptyData: emptyData,
    newData: newData,
    defaultSettings: defaultSettings,
    defaultCari: defaultCari,
    normalizeCari: normalizeCari,
    addCari: addCari,
    updateCari: updateCari,
    deleteCari: deleteCari,
    cariById: cariById,
    cariName: cariName,
    defaultCariId: defaultCariId,
    normalizeKullanici: normalizeKullanici,
    addKullanici: addKullanici,
    updateKullanici: updateKullanici,
    deleteKullanici: deleteKullanici,
    kullaniciById: kullaniciById,
    kullaniciBul: kullaniciBul,
    aktifYoneticiVar: aktifYoneticiVar,
    markaMigrate: markaMigrate,
    modelKart: modelKart,
    addModel: addModel,
    updateModel: updateModel,
    deleteModel: deleteModel,
    modelSummary: modelSummary,
    profitReport: profitReport,
    audit: audit,
    trashPush: trashPush,
    trashTemizle: trashTemizle,
    trashPurge: trashPurge,
    restoreTrash: restoreTrash,
    healthCheck: healthCheck,
    toISODate: toISODate,
    todayISO: todayISO,
    num: num,
    round2: round2,
    normKey: normKey,
    nextId: nextId,
    kodUret: kodUret,
    shippedMap: shippedMap,
    orderInfo: orderInfo,
    lineInfo: lineInfo,
    ledgerSorted: ledgerSorted,
    ledgerWithBalance: ledgerWithBalance,
    balance: balance,
    nextOrderNo: nextOrderNo,
    nextFisNo: nextFisNo,
    stats: stats,
    addOrder: addOrder,
    updateOrder: updateOrder,
    deleteOrder: deleteOrder,
    createShipment: createShipment,
    shipmentLines: shipmentLines,
    updateShipment: updateShipment,
    deleteShipment: deleteShipment,
    addLedgerEntry: addLedgerEntry,
    updateLedgerEntry: updateLedgerEntry,
    deleteLedgerEntry: deleteLedgerEntry,
    buildWorkbook: buildWorkbook,
    readData: readData,
    importLegacy: importLegacy,
    mergeLegacy: mergeLegacy
  };
});
