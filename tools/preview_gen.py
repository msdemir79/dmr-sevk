# -*- coding: utf-8 -*-
"""Görsel doğrulama için çoklu cari demo sayfası üretir."""
import io
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "DMR_SEVK.html")
OUT = os.path.join(ROOT, "tests", "preview.html")

BOOT = r"""
<script>
(function () {
  function showErr(msg) {
    var d = document.getElementById('screenshot-errors') || document.createElement('div');
    d.id = 'screenshot-errors';
    d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;background:#7f1d1d;color:#fff;font:12px monospace;padding:8px 12px;z-index:9999;white-space:pre-wrap';
    d.textContent += msg + '\n';
    document.body.appendChild(d);
  }
  window.addEventListener('error', function (e) { showErr('HATA: ' + e.message + ' @ ' + (e.filename || '') + ':' + e.lineno); });
  window.addEventListener('unhandledrejection', function (e) { showErr('PROMISE: ' + (e.reason && e.reason.message ? e.reason.message : e.reason)); });

  async function demo() {
    var Core = window.Core, APP = window.APP;
    var st = document.createElement('style');
    st.textContent = '.modal-backdrop{animation:none!important;opacity:1!important}';
    document.head.appendChild(st);
    var d = Core.emptyData();
    d.settings.firmaAdi = 'DMR AYAKKABI - FABRİKA';
    d.settings.firmaAdres = 'SEFAKÖY / İSTANBUL';
    d.settings.firmaTel = '0212 555 44 33';
    d.settings.sonFisNo = 244;
    d.settings.sonSiparisNo = 68;

    var tuz = 'demotuz';
    var adminHash = await APP.sifreHash('ali', '1234', tuz);
    var admin = Core.addKullanici(d, { ad: 'Ali Veli', kullanici: 'ali', tuz: tuz, sifre: adminHash, rol: 'YÖNETİCİ' });
    Core.addKullanici(d, { ad: 'Ayşe Kaya', kullanici: 'ayse', tuz: tuz, sifre: adminHash, rol: 'KULLANICI' });

    var gns = Core.addCari(d, { ad: 'GÜNEŞ AYAKKABI', kod: 'GNS', adres: 'Sefaköy / İstanbul', tel: '0212 555 44 33' });
    var mod = Core.addCari(d, { ad: 'MODA AYAKKABI', kod: 'MOD', adres: 'İkitelli / İstanbul', tel: '0212 444 22 11', devir: 25000, devirYon: 'BORC' });
    var yld = Core.addCari(d, { ad: 'YILDIZ SPOR', kod: 'YLD', adres: 'Kadıköy / İstanbul', tel: '0216 333 11 22' });

    function svgImg(bg, label) {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="' + bg + '"/><path d="M18 76c14-4 24-14 34-26 6-7 14-6 17 2l7 18c2 5 6 8 11 9l6 1v10H24c-6 0-9-8-6-14z" fill="rgba(255,255,255,.28)"/><text x="60" y="106" font-family="Arial" font-size="14" fill="#fff" text-anchor="middle">' + label + '</text></svg>';
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    var t = new Date();
    function dt(daysAgo) { var x = new Date(t.getFullYear(), t.getMonth(), t.getDate() - daysAgo); return x.toISOString().slice(0, 10); }

    var tanim = [
      [gns, 'JALEPENO- J5E - BEYAZ', 'BEYAZ', 10, 3000, 75, 'MERDANE', '#0f766e', 'J5E'],
      [gns, 'JALEPENO SİYAH SİYAH -2 - AÇIK', 'SİYAH SİYAH', 8, 2200, 62, 'MERDANE', '#334155', 'J5S'],
      [gns, 'CURE GARSON SİYAH', 'SİYAH', 10, 1800, 62, 'MERDANE', '#1e293b', 'CURE'],
      [gns, 'CURE GARSON BEYAZ - AÇIK ASORTİ', 'BEYAZ', 10, 1500, 62, 'MERDANE', '', ''],
      [gns, 'MOCHA GARSON BEYAZ', 'BEYAZ', 8, 960, 62, 'GARSON', '', ''],
      [gns, 'TALKIEN SİYAH HUC', 'SİYAH', 10, 1200, 62, 'MERDANE', '#7c2d12', 'TALK'],
      [gns, 'BENZEMA FÜME RSZ', 'FÜME', 10, 900, 62, 'SPOR', '', ''],
      [mod, 'BİRCE BEJ', 'BEJ', 10, 640, 62, 'BATTAL', '', ''],
      [mod, 'NAIROBI - HUC - SİYAH', 'SİYAH', 10, 5000, 75, 'MERDANE', '#0b4a6f', 'NAIR'],
      [mod, 'PABLO HUC', 'SİYAH', 10, 10000, 75, 'MERDANE', '', ''],
      [yld, 'RUNNER GRİ', 'GRİ', 10, 1200, 70, 'SPOR', '#475569', 'RUN'],
      [yld, 'RUNNER LACİVERT', 'LACİVERT', 10, 800, 70, 'SPOR', '', '']
    ];

    tanim.forEach(function (x, i) {
      var o = Core.addOrder(d, {
        cariId: x[0].id, sipno: 59 + i, tarih: dt(40 - i * 2), model: x[1], renk: x[2],
        asorti: x[3], adet: x[4], fiyat: x[5], grup: x[6], tur: 'DİĞER'
      });
      if (x[7]) d.images[o.id] = svgImg(x[7], x[8]);
    });

    var omm = Core.addOrder(d, { cariId: gns.id, sipno: 72, tarih: dt(1), model: '6049', renk: 'SİYAH', asorti: 10, adet: 48, fiyat: 75 });
    d.orderLines = (d.orderLines || []).filter(function (l) { return l.orderId !== omm.id; });
    var oml1 = Core.nextId(d.orderLines);
    d.orderLines.push({ id: oml1, orderId: omm.id, renk: 'SİYAH', mod: 'ASORTILI', beden: 0, koli: 3, koliIci: 10, cift: 30 });
    d.orderLines.push({ id: oml1 + 1, orderId: omm.id, renk: 'BEYAZ', mod: 'ACIK', beden: 42, koli: 2, koliIci: 9, cift: 18 });

    var o = d.orders;
    Core.createShipment(d, { cariId: gns.id, tarih: dt(30), fisNo: 242, aciklama: 'Kargo: Aras', lines: [
      { orderId: o[0].id, cift: 1200 }, { orderId: o[2].id, cift: 600 }
    ] });
    Core.createShipment(d, { cariId: gns.id, tarih: dt(18), fisNo: 243, lines: [
      { orderId: o[0].id, cift: 800 }, { orderId: o[1].id, cift: 900 },
      { orderId: o[3].id, cift: 640 }, { orderId: o[4].id, cift: 480 }
    ] });
    Core.createShipment(d, { cariId: gns.id, tarih: dt(6), fisNo: 244, lines: [
      { orderId: o[5].id, cift: 500 }, { orderId: o[6].id, cift: 400 }
    ] });
    Core.createShipment(d, { cariId: mod.id, tarih: dt(12), fisNo: 245, aciklama: 'Kargo: MNG', lines: [
      { orderId: o[7].id, cift: 300 }, { orderId: o[8].id, cift: 1500 }
    ] });
    Core.createShipment(d, { cariId: yld.id, tarih: dt(4), fisNo: 246, lines: [
      { orderId: o[10].id, cift: 400 }
    ] });

    Core.addModel(d, { model: 'JALEPENO- J5E - BEYAZ', fiyat: 75, maliyet: 52, asorti: 10, barkod: '8680000000011', sezon: '2026', resim: svgImg('#0f766e', 'J5E') });
    Core.addModel(d, { model: 'JALEPENO SİYAH SİYAH -2 - AÇIK', fiyat: 62, maliyet: 44, asorti: 8, barkod: '8680000000028', sezon: '2026', resim: svgImg('#334155', 'J5S') });
    Core.addModel(d, { model: 'CURE GARSON SİYAH', fiyat: 62, maliyet: 41, asorti: 10, barkod: '8680000000035', sezon: '2026' });
    Core.addModel(d, { model: 'TALKIEN SİYAH HUC', fiyat: 62, maliyet: 45, asorti: 10, barkod: '8680000000042', sezon: '2026', resim: svgImg('#7c2d12', 'TALK') });
    Core.addModel(d, { model: 'BENZEMA FÜME RSZ', fiyat: 62, maliyet: 43, asorti: 10, barkod: '8680000000059', sezon: '2026' });
    Core.addModel(d, { model: 'BİRCE BEJ', fiyat: 62, maliyet: 40, asorti: 10, sezon: '2025' });
    Core.addModel(d, { model: '6049', kategori: 'MERDANE', renkler: ['SİYAH', 'BEYAZ', 'LACİVERT', 'KAHVE'], asortiSablon: { 40: 1, 41: 2, 42: 3, 43: 2, 44: 1, 45: 1 }, fiyat: 75, maliyet: 48, asorti: 10, sezon: '2026' });

    Core.audit(d, 'Ali Veli', 'SEVK FİŞİ', '#246 · YILDIZ SPOR · 400 çift');
    Core.audit(d, 'Ali Veli', 'SİPARİŞ EKLE', 'RUNNER LACİVERT · 800 çift · YILDIZ SPOR');
    Core.audit(d, 'Ayşe Kaya', 'HAREKET EKLE', 'TAHSİLAT · 90.000,00 ₺ · GÜNEŞ AYAKKABI');
    var gecici = Core.addOrder(d, { cariId: yld.id, model: 'SİLİNEN MODEL', renk: 'GRİ', asorti: 10, adet: 120, fiyat: 70 });
    Core.deleteOrder(d, gecici.id, 'Ali Veli');
    d.orders = d.orders.filter(function (x) { return x.id !== gecici.id; });

    Core.addLedgerEntry(d, { cariId: gns.id, tarih: dt(28), islem: 'TAHSİLAT', tutar: 120000, aciklama: 'Havale', fisNo: 'T- 41' });
    Core.addLedgerEntry(d, { cariId: gns.id, tarih: dt(14), islem: 'TAHSİLAT', tutar: 90000, aciklama: 'Nakit tahsilat', fisNo: 'T- 42' });
    Core.addLedgerEntry(d, { cariId: gns.id, tarih: dt(9), islem: 'ALIŞ', tutar: 45280, aciklama: '18.112 çift bağcık', fisNo: 'T- 43' });
    Core.addLedgerEntry(d, { cariId: gns.id, tarih: dt(8), islem: 'GELİR', tutar: 1983.72, aciklama: 'İlaç ve silme suyu', fisNo: 'T- 44' });
    Core.addLedgerEntry(d, { cariId: mod.id, tarih: dt(10), islem: 'TAHSİLAT', tutar: 40000, aciklama: 'Çek tahsilatı', fisNo: 'T- 51' });

    Matris.migrateMaster(d);
    Matris.ensureLines(d);

    APP.data = d;
    APP.S.file.name = 'DMR_VERI.xlsx';
    APP.S.file.lastSaved = new Date();
    APP.S.file.dirty = false;
    APP.S.ui.cariId = gns.id;
    APP.S.ui.shipCariId = gns.id;
    APP.S.user = admin;
    APP.startApp();

    var h = (location.hash || '').slice(1) || 'dashboard';
    if (h === 'all-dashboard') { APP.S.ui.cariId = 0; APP.updateChrome(); APP.renderView(); }
    if (h === 'cariler') { APP.S.view = 'cariler'; APP.updateChrome(); APP.renderView(); }
    if (h === 'settings') { APP.S.view = 'settings'; APP.updateChrome(); APP.renderView(); }
    if (h === 'check-update-new') {
      APP.S.view = 'dashboard'; APP.updateChrome(); APP.renderView();
      var gercekFetch = window.fetch;
      window.fetch = function () {
        return Promise.resolve({
          ok: true,
          json: function () {
            return Promise.resolve({
              tag_name: 'v9.9.9',
              html_url: 'https://github.com/msdemir79/dmr-sevk/releases/tag/v9.9.9',
              body: 'Test sürüm notu.\nYeni özellikler burada görünür.',
              published_at: '2026-10-31T18:00:00Z',
              assets: [{ name: 'DMR_SEVK.html', browser_download_url: 'https://github.com/msdemir79/dmr-sevk/releases/download/v9.9.9/DMR_SEVK.html' }]
            });
          }
        });
      };
      setTimeout(function () {
        var b = document.querySelector('[data-act="check-update"]');
        if (b) b.click();
      }, 250);
      setTimeout(function () { window.fetch = gercekFetch; }, 3000);
    }
    if (h === 'check-update') {
      APP.S.view = 'dashboard'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="check-update"]');
        if (b) b.click();
      }, 250);
    }
    if (h === 'ledger-gider-save') {
      APP.S.view = 'ledger'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="ledger-gider"]');
        if (b) b.click();
        setTimeout(function () {
          var t = document.getElementById('lfTutar');
          var a = document.getElementById('lfAciklama');
          if (t) t.value = '1250';
          if (a) a.value = 'Kargo gideri';
          var f = document.getElementById('ledgerForm');
          if (f) f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }, 250);
      }, 250);
    }
    if (h === 'ledger-open' || h === 'ledger-gider-open') {
      APP.S.view = 'ledger'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="' + (h === 'ledger-gider-open' ? 'ledger-gider' : 'ledger-new') + '"]');
        if (b) b.click();
      }, 250);
    }
    if (h === 'ledger') { APP.S.view = 'ledger'; APP.updateChrome(); APP.renderView(); }
    if (h === 'shipments') { APP.S.view = 'shipments'; APP.updateChrome(); APP.renderView(); }
    if (h === 'cari-edit' || h === 'cari-delete') {
      APP.S.view = 'cariler'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="' + (h === 'cari-delete' ? 'cari-del' : 'cari-edit') + '"]');
        if (b) b.click();
      }, 250);
    }
    if (h === 'user-edit') {
      APP.S.view = 'settings'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="user-edit"]');
        if (b) b.click();
      }, 250);
    }
    if (h === 'change-pass') {
      APP.S.view = 'settings'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="change-pass"]');
        if (b) b.click();
      }, 250);
    }
    if (h === 'orders') { APP.S.view = 'orders'; APP.updateChrome(); APP.renderView(); }
    if (h === 'reports') { APP.S.view = 'reports'; APP.updateChrome(); APP.renderView(); }
    if (h === 'ledger-all') { APP.S.ui.cariId = 0; APP.S.view = 'ledger'; APP.updateChrome(); APP.renderView(); }
    if (h === 'orders-all') { APP.S.ui.cariId = 0; APP.S.view = 'orders'; APP.updateChrome(); APP.renderView(); }
    if (h === 'ship-cart') {
      APP.S.view = 'ship';
      APP.S.ui.cart = [{ orderId: o[0].id, cift: 600, koli: 60, fiyat: 75 }, { orderId: o[1].id, cift: 400, koli: 50, fiyat: 62 }];
      APP.updateChrome(); APP.renderView();
    }
    if (h === 'ship-lines') {
      var om3 = d.orders.filter(function (o) { return o.sipno === 72; })[0];
      var ls3 = Matris.orderLinesOf(d, om3.id);
      APP.S.ui.shipCariId = om3.cariId;
      APP.S.ui.cart = ls3.map(function (l) {
        return { lineId: l.id, orderId: om3.id, cift: Core.lineInfo(d, l).kalan, koli: Core.lineInfo(d, l).kalanKoli, fiyat: om3.fiyat };
      });
      APP.S.view = 'ship'; APP.updateChrome(); APP.renderView();
    }
    if (h === 'report-matris') {
      var om5 = d.orders.filter(function (o) { return o.sipno === 72; })[0];
      var ls5 = Matris.orderLinesOf(d, om5.id);
      Core.createShipment(d, {
        cariId: om5.cariId, tarih: om5.tarih,
        lines: ls5.map(function (l) {
          return { orderId: om5.id, orderLineId: l.id, cift: l.cift, koli: l.koli, fiyat: om5.fiyat };
        })
      });
      APP.S.view = 'reports';
      APP.S.ui.reportMonth = (om5.tarih || '').slice(0, 7);
      APP.updateChrome(); APP.renderView();
    }
    if (h === 'print-fis' || h === 'print-fis-a5') {
      var om4 = d.orders.filter(function (o) { return o.sipno === 72; })[0];
      var ls4 = Matris.orderLinesOf(d, om4.id);
      var res4 = Core.createShipment(d, {
        cariId: om4.cariId, tarih: om4.tarih,
        lines: ls4.map(function (l) {
          return { orderId: om4.id, orderLineId: l.id, cift: l.cift, koli: l.koli, fiyat: om4.fiyat };
        })
      });
      APP.S.view = 'ship'; APP.renderView();
      setTimeout(function () { APP.printShipment(res4.shipment.id, h === 'print-fis-a5' ? 'A5' : 'A4'); }, 250);
    }
    if (h === 'fis-full') {
      var omf = d.orders.filter(function (o) { return o.sipno === 72; })[0];
      var lsf = Matris.orderLinesOf(d, omf.id);
      APP.S.ui.shipCariId = omf.cariId;
      APP.S.ui.cart = lsf.map(function (l) {
        return { lineId: l.id, orderId: omf.id, cift: Matris.lineCift(l, Core.modelKart(d, omf.model)), koli: l.koli, fiyat: omf.fiyat };
      });
      APP.S.view = 'ship'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        document.querySelector('[data-act="ship-create"]').click();
        setTimeout(function () {
          var b = document.getElementById('btnPvFull');
          if (b) b.click();
        }, 500);
      }, 350);
    }
    if (h === 'ship-matris') {
      var om2 = d.orders.filter(function (o) { return o.sipno === 72; })[0];
      var ls2 = Matris.orderLinesOf(d, om2.id);
      APP.S.ui.shipCariId = om2.cariId;
      APP.S.ui.cart = ls2.map(function (l) {
        return { lineId: l.id, orderId: om2.id, cift: Matris.lineCift(l, Core.modelKart(d, om2.model)), koli: l.koli, fiyat: om2.fiyat };
      });
      APP.S.view = 'ship'; APP.updateChrome(); APP.renderView();
      setTimeout(function () { document.querySelector('[data-act="ship-create"]').click(); }, 350);
    }
    if (h === 'flow-create') {
      APP.S.view = 'ship';
      APP.S.ui.cart = [{ orderId: o[2].id, cift: 500, koli: 50, fiyat: 62 }, { orderId: o[3].id, cift: 640, koli: 64, fiyat: 62 }];
      APP.S.ui.shipFisNo = 247;
      APP.updateChrome(); APP.renderView();
      setTimeout(function () { document.querySelector('[data-act="ship-create"]').click(); }, 250);
    }
    if (h === 'flow-order') {
      APP.S.view = 'orders'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        document.querySelector('[data-act="order-new"]').click();
        setTimeout(function () {
          var f = document.getElementById('orderForm');
          var model = document.getElementById('ofModel');
          model.value = 'TEST MODEL ÇOK CARİ';
          model.dispatchEvent(new Event('change', { bubbles: true }));
          document.getElementById('ofFiyat').value = '99,50';
          document.getElementById('ofCari').value = String(mod.id);
          var renk = document.querySelector('[data-f="renk"][data-i="0"]');
          var koli = document.querySelector('[data-f="koli"][data-i="0"]');
          var koliIci = document.querySelector('[data-f="koliIci"][data-i="0"]');
          if (renk) renk.value = 'SİYAH';
          if (koli) koli.value = '12';
          if (koliIci) koliIci.value = '10';
          setTimeout(function () { f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }, 100);
        }, 200);
      }, 150);
    }    if (h === 'order-form-matris') {
      APP.S.view = 'orders'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        document.querySelector('[data-act="order-new"]').click();
        setTimeout(function () {
          var model = document.getElementById('ofModel');
          model.value = '6049';
          model.dispatchEvent(new Event('change', { bubbles: true }));
          setTimeout(function () {
            document.getElementById('ofAddLine').click();
            setTimeout(function () {
              var i = 1;
              var mod = document.querySelector('[data-f="mod"][data-i="' + i + '"]');
              mod.value = 'ACIK';
              mod.dispatchEvent(new Event('change', { bubbles: true }));
              setTimeout(function () {
                var renk = document.querySelector('[data-f="renk"][data-i="' + i + '"]'); if (renk) renk.value = 'BEYAZ';
                var beden = document.querySelector('[data-f="beden"][data-i="' + i + '"]'); if (beden) beden.value = '42';
                var koli = document.querySelector('[data-f="koli"][data-i="' + i + '"]'); if (koli) koli.value = '2';
                var ki = document.querySelector('[data-f="koliIci"][data-i="' + i + '"]'); if (ki) ki.value = '9';
                var k0 = document.querySelector('[data-f="koli"][data-i="0"]'); if (k0) k0.value = '3';
                document.getElementById('orderForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              }, 150);
            }, 150);
          }, 200);
        }, 200);
      }, 150);
    }
    if (h === 'model-form-matris') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        document.querySelector('[data-act="model-new"]').click();
        setTimeout(function () {
          var sel = document.getElementById('mfKategori');
          sel.value = 'MERDANE';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          var ins = document.querySelectorAll('#mfAsortiGrid input');
          [1, 2, 3, 2, 1, 1].forEach(function (v, i) { if (ins[i]) ins[i].value = v; });
        }, 200);
      }, 150);
    }
    if (h === 'model-delete-yes') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="model-del"]');
        if (b) b.click();
        setTimeout(function () {
          var yes = document.querySelector('[data-yes]');
          if (yes) yes.click();
        }, 200);
      }, 250);
    }
    if (h === 'model-image-save') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var mm = d.modeller.filter(function (m) { return m.model === '6049'; })[0];
        var b = mm ? document.querySelector('[data-act="model-edit"][data-id="' + mm.id + '"]') : null;
        if (b) b.click();
        setTimeout(function () {
          var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#0f766e"/><circle cx="150" cy="120" r="55" fill="#fbbf24"/><text x="150" y="240" font-size="42" text-anchor="middle" fill="white" font-family="Arial">IMG</text></svg>';
          var f = new File([svg], 'test.svg', { type: 'image/svg+xml' });
          var dt = new DataTransfer();
          dt.items.add(f);
          var inp = document.getElementById('mfImage');
          if (inp) {
            inp.files = dt.files;
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          }
          setTimeout(function () {
            var form = document.getElementById('modelForm');
            if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }, 700);
        }, 250);
      }, 160);
    }
    if (h === 'model-color-shortcut') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var mm = d.modeller.filter(function (m) { return m.model === '6049'; })[0];
        var b = mm ? document.querySelector('[data-act="model-edit"][data-id="' + mm.id + '"]') : null;
        if (b) b.click();
        setTimeout(function () {
          var ekle = document.getElementById('mfRenkEkle');
          if (ekle) ekle.click();
          setTimeout(function () {
            var ad = document.getElementById('cfAd');
            if (ad) ad.value = 'YEŞİL';
            var kod = document.getElementById('cfKod');
            if (kod) kod.value = 'YSL';
            var form = document.getElementById('colorForm');
            if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }, 220);
        }, 220);
      }, 160);
    }
    if (h === 'order-color') {
      APP.S.view = 'orders'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        document.querySelector('[data-act="order-new"]').click();
        setTimeout(function () {
          var model = document.getElementById('ofModel');
          model.value = '6049';
          model.dispatchEvent(new Event('change', { bubbles: true }));
        }, 200);
      }, 150);
    }
    if (h === 'model-master-save') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var mm = d.modeller.filter(function (m) { return m.model === '6049'; })[0];
        var b = mm ? document.querySelector('[data-act="model-edit"][data-id="' + mm.id + '"]') : null;
        if (b) b.click();
        setTimeout(function () {
          var f = document.getElementById('mfFiyat');
          if (f) f.value = '80';
          var form = document.getElementById('modelForm');
          if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }, 250);
      }, 200);
    }
    if (h === 'settings-color' || h === 'settings-sablon') {
      APP.S.view = 'settings'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="' + (h === 'settings-sablon' ? 'sablon-new' : 'color-new') + '"]');
        if (b) b.click();
      }, 250);
    }
    if (h === 'model-master') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var mm = d.modeller.filter(function (m) { return m.model === '6049'; })[0];
        var b = mm ? document.querySelector('[data-act="model-edit"][data-id="' + mm.id + '"]') : null;
        if (b) b.click();
      }, 250);
    }
    if (h === 'model-edit' || h === 'model-delete') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="' + (h === 'model-delete' ? 'model-del' : 'model-edit') + '"]');
        if (b) b.click();
      }, 250);
    }
    if (h === 'model-save-matris') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        document.querySelector('[data-act="model-new"]').click();
        setTimeout(function () {
          document.getElementById('mfModel').value = 'TEST 6049';
          document.getElementById('mfFiyat').value = '88';
          var sel = document.getElementById('mfKategori');
          sel.value = 'MERDANE';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          var ins = document.querySelectorAll('#mfAsortiGrid input');
          [1, 2, 3, 2, 1, 1].forEach(function (v, i) { if (ins[i]) { ins[i].value = v; ins[i].dispatchEvent(new Event('input', { bubbles: true })); } });
          setTimeout(function () { document.getElementById('modelForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }, 120);
        }, 200);
      }, 150);
    }
    if (h === 'modal-order') setTimeout(function () { document.querySelector('[data-act="order-new"]').click(); }, 150);
    if (h === 'modal-cari') { APP.S.view = 'cariler'; APP.updateChrome(); APP.renderView(); setTimeout(function () { document.querySelector('[data-act="cari-new"]').click(); }, 150); }
    if (h === 'modal-ship') { APP.previewShipment(3); }
    if (h === 'upgrade') {
      var v1 = { sheets: [
        { name: 'SİPARİŞLER', rows: [['ID', 'SİP. NO', 'TARİH', 'MODEL', 'SİPARİŞ ÇİFT', 'FİYAT'], [1, 1, '2026-01-05', 'ESKİ MODEL', 100, 50]] },
        { name: 'CARİ HESAP', rows: [['ID', 'TARİH', 'FİŞ NO', 'İŞLEM', 'AÇIKLAMA', 'TUTAR', 'BORÇ', 'ALACAK'], [1, '2026-01-06', 1, 'SATIŞ', 'ESKİ MODEL', 5000, 5000, 0]] },
        { name: 'SEVK FİŞLERİ', rows: [['ID', 'FİŞ NO', 'TARİH', 'CARİ', 'ÇİFT'], [1, 1, '2026-01-06', 'GÜNEŞ AYAKKABI', 100]] },
        { name: 'AYARLAR', rows: [['AYAR', 'DEĞER'], ['cariAdi', 'GÜNEŞ AYAKKABI'], ['firmaAdres', 'Sefaköy']] }
      ] };
      var up = Core.readData(v1.sheets);
      APP.data = up;
      APP.S.ui.cariId = up.cariler[0].id;
      APP.S.file.name = 'DMR_VERI.xlsx';
      APP.startApp();
    }
    if (h === 'brand') {
      APP.data.settings.markaAdi = 'EFE AYAKKABI';
      APP.data.settings.markaAlt = 'SEVK & CARİ';
      APP.data.settings.markaKisa = 'EA';
      APP.renderShell();
      APP.updateChrome();
      APP.renderView();
    }
    if (h === 'do-import-cari') {
      var sh2 = [
        { name: 'SİPARİŞ TAKİBİ', rows: [
          ['SİP. NO', 'MODEL BİLGİSİ', 'RENK', 'SİPARİŞ ÇİFT', 'ASORTİ', 'FİYAT', 'GRUP', 'KOD'],
          [1, 'EFE MODEL', 'BEYAZ', 1000, 10, 75, 'MERDANE', 'EFE - BEYAZ'],
          [2, 'EFE MODEL 2', 'SİYAH', 500, 10, 80, 'MERDANE', 'EFE - SİYAH']
        ] },
        { name: 'CARİ HESAP', rows: [
          ['TARİH', 'FİŞ NO', 'SİP.NO', 'AÇIKLAMA 1', 'AÇIKLAMA 2', 'KOLİ', 'MİKTAR', 'FİYAT', 'TUTAR', 'BORÇ', 'ALACAK', 'GRUP', 'KOD'],
          ['01.01.2026', 900, 1, 'EFE MODEL', 'BEYAZ', 30, 300, 75, 22500, 22500, 0, 'MERDANE', 'EFE - BEYAZ']
        ] },
        { name: 'SEVK FİŞİ', rows: [[null], [null, 'EFE AYAKKABI'], [null, 'FİRMA :', 'EFE AYAKKABI']] }
      ];
      APP.openImportCariModal(Core.importLegacy(sh2), 'EFE AYK.xlsx');
      setTimeout(function () { var b = document.getElementById('ciBtn'); if (b) b.click(); }, 400);
    }
    if (h === 'import-cari') {
      var sheets = [
        { name: 'SİPARİŞ TAKİBİ', rows: [
          ['SİP. NO', 'MODEL BİLGİSİ', 'RENK', 'SİPARİŞ ÇİFT', 'ASORTİ', 'FİYAT', 'GRUP', 'KOD'],
          [1, 'EFE MODEL', 'BEYAZ', 1000, 10, 75, 'MERDANE', 'EFE - BEYAZ']
        ] },
        { name: 'CARİ HESAP', rows: [
          ['TARİH', 'FİŞ NO', 'SİP.NO', 'AÇIKLAMA 1', 'AÇIKLAMA 2', 'KOLİ', 'MİKTAR', 'FİYAT', 'TUTAR', 'BORÇ', 'ALACAK', 'GRUP', 'KOD'],
          ['01.01.2026', 1, 1, 'EFE MODEL', 'BEYAZ', 30, 300, 75, 22500, 22500, 0, 'MERDANE', 'EFE - BEYAZ']
        ] },
        { name: 'SEVK FİŞİ', rows: [[null], [null, 'EFE AYAKKABI'], [null, 'FİRMA :', 'EFE AYAKKABI']] }
      ];
      APP.openImportCariModal(Core.importLegacy(sheets), 'EFE AYK.xlsx');
    }
    if (h === 'print-ekstre') {
      var ca = d.cariler[0];
      var rows = Core.ledgerWithBalance(d, ca.id);
      document.getElementById('root').innerHTML = '<div style="background:#fff">' + APP.ekstreDocHtml(rows, '', '', ca) + '</div>';
    }
    if (h === 'print-ship') {
      document.getElementById('root').innerHTML = '<div style="background:#fff">' + APP.shipmentDocHtml(d.shipments[2]) + '</div>';
    }
    if (h === 'print-ship-a5') {
      document.getElementById('root').innerHTML = '<div style="background:#fff">' + APP.shipmentDocHtml(d.shipments[2], 'A5') + '</div>';
    }
    if (h === 'modal-ship-a5') {
      APP.previewShipment(3);
      setTimeout(function () { var b = document.querySelector('#pvPaper [data-paper="A5"]'); if (b) b.click(); }, 300);
    }
    if (h === 'do-login' || h === 'do-login-bad') {
      APP.S.user = null;
      APP.startApp();
      APP.showLogin();
      setTimeout(function () {
        document.getElementById('lgUser').value = 'ali';
        document.getElementById('lgPass').value = h === 'do-login' ? '1234' : 'yanlis';
        document.getElementById('loginForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }, 300);
    }
    if (h === 'login-remember') {
      try { localStorage.setItem('dmr:hatirla', 'ali'); } catch (e) { }
      APP.S.user = null;
      APP.startApp();
      APP.showLogin();
      setTimeout(function () {
        var p = document.getElementById('lgPass');
        if (p) { p.value = '1234'; }
        var eye = document.getElementById('lgEye');
        if (eye) eye.click();
      }, 300);
    }
    if (h === 'measure') {
      APP.S.user = null;
      APP.startApp();
      APP.showLogin();
      setTimeout(function () {
        var p = document.querySelector('.auth-panel');
        var a = document.querySelector('.auth-page');
        var r = p ? p.getBoundingClientRect() : null;
        var ar = a ? a.getBoundingClientRect() : null;
        var as = document.querySelector('.auth-aside');
        var pre = document.createElement('pre');
        pre.id = 'measure-out';
        pre.textContent = 'inner=' + innerWidth + ' dpr=' + devicePixelRatio +
          ' mq860=' + matchMedia('(max-width: 860px)').matches +
          ' aside=' + (as ? getComputedStyle(as).display : 'yok') +
          ' page=' + (ar && ar.width) + ' panel=' + (r && r.width) + ' x=' + (r && r.x) +
          ' bodyScroll=' + document.documentElement.scrollWidth;
        document.body.appendChild(pre);
      }, 700);
    }
    if (h === 'keytest') {
      APP.S.view = 'orders'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="order-new"]');
        if (b) b.click();
        setTimeout(function () {
          var inp = document.getElementById('ofModel');
          if (!inp) { document.title = 'form yok'; return; }
          inp.focus();
          inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
          document.title = 'aktif=' + (document.activeElement && document.activeElement.id) + ' modal=' + !!document.querySelector('.modal-backdrop');
        }, 250);
      }, 250);
    }
    if (h === 'invoice') {
      APP.S.view = 'shipments'; APP.updateChrome(); APP.renderView();
      setTimeout(function () { var b = document.querySelector('[data-act="ship-invoice"]'); if (b) b.click(); }, 300);
    }
    if (h === 'restore-test') {
      APP.openTrash();
      setTimeout(function () { var b = document.querySelector('[data-act="trash-restore"]'); if (b) b.click(); }, 300);
      setTimeout(function () {
        document.title = 'orders=' + APP.data.orders.length + ' trash=' + APP.data.trash.length + ' audit=' + APP.data.audit.length;
      }, 1000);
    }
    if (h === 'savenew-test') {
      APP.S.view = 'orders'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="order-new"]'); if (b) b.click();
        setTimeout(function () {
          var m = document.getElementById('ofModel');
          var a = document.getElementById('ofAdet');
          var sv = document.getElementById('ofSaveNew');
          if (!m || !a || !sv) { document.title = 'form yok'; return; }
          m.value = 'TEST KAYIT'; a.value = '10';
          sv.click();
          setTimeout(function () {
            var f = document.getElementById('orderForm');
            document.title = 'orders=' + APP.data.orders.length + ' form=' + !!f + ' sipno=' + (f ? document.getElementById('ofSipno').value : '');
          }, 500);
        }, 250);
      }, 250);
    }
    if (h === 'backups') { APP.openBackups(); }
    if (h === 'orders-copy') {
      APP.S.view = 'orders'; APP.updateChrome(); APP.renderView();
      setTimeout(function () { var b = document.querySelector('[data-act="order-copy"]'); if (b) b.click(); }, 300);
    }
    if (h === 'ship-fill') {
      APP.S.view = 'ship'; APP.updateChrome(); APP.renderView();
      setTimeout(function () { var b = document.querySelector('[data-act="cart-fill"]'); if (b) b.click(); }, 300);
    }
    if (h === 'model-form') { APP.openModelForm(null, 'TEST MODEL'); }
    if (h === 'model-form-img') { APP.openModelForm(APP.data.modeller[0]); }
    if (h === 'asorti-test') {
      APP.S.view = 'orders'; APP.updateChrome(); APP.renderView();
      setTimeout(function () {
        var b = document.querySelector('[data-act="order-new"]'); if (b) b.click();
        setTimeout(function () {
          var m = document.getElementById('ofModel');
          if (!m) { document.title = 'form yok'; return; }
          m.value = 'JALEPENO SİYAH SİYAH -2 - AÇIK';
          m.dispatchEvent(new Event('change', { bubbles: true }));
          var a = document.getElementById('ofAsorti');
          var f = document.getElementById('ofFiyat');
          var l = document.getElementById('ofListe');
          document.title = 'asorti=' + a.value + ' fiyat=' + f.value + ' hint=' + (l ? l.textContent : '');
        }, 300);
      }, 250);
    }
    if (h === 'changelog2') { APP.openChangelog(); }
    if (h === 'models') {
      APP.S.view = 'models'; APP.updateChrome(); APP.renderView();
    }
    if (h === 'palette') { APP.openPalette(); }
    if (h === 'trash') { APP.openTrash(); }
    if (h === 'audit') { APP.openAudit(); }
    if (h === 'changelog') { APP.openChangelog(); }
    if (h === 'settings-new') {
      APP.S.view = 'settings'; APP.updateChrome(); APP.renderView();
    }
    if (h === 'login') {
      APP.S.user = null;
      APP.startApp();
      APP.showLogin();
    }
    if (h === 'settings-user-role') {
      APP.S.user = d.kullanicilar[1];
      APP.S.view = 'settings';
      APP.updateChrome();
      APP.renderView();
    }
    if (h === 'do-first-user') {
      APP.S.user = null;
      APP.data = Core.newData();
      APP.S.file.name = 'DMR_VERI.xlsx';
      APP.showFirstUser();
      setTimeout(function () {
        document.getElementById('fuAd').value = 'Mehmet Demir';
        document.getElementById('fuUser').value = 'mehmet';
        document.getElementById('fuPass').value = '1234';
        document.getElementById('fuPass2').value = '1234';
        document.getElementById('firstForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }, 300);
    }
    if (h === 'first-user') {
      APP.S.user = null;
      APP.data = Core.newData();
      APP.S.file.name = 'DMR_VERI.xlsx';
      APP.showFirstUser();
    }
    if (h === 'settings-users') {
      APP.S.view = 'settings'; APP.updateChrome(); APP.renderView();
      setTimeout(function () { document.querySelector('[data-act="user-new"]').click(); }, 200);
    }

    window.__demoReady = true;
  }

  window.addEventListener('load', function () {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (window.APP && window.Core && document.getElementById('btnNew')) {
        clearInterval(iv);
        demo();
      } else if (tries > 140) {
        clearInterval(iv);
        showErr('APP/Core/karşılama ekranı yüklenemedi');
      }
    }, 50);
  });
})();
</script>
"""


def main():
    with io.open(SRC, encoding="utf-8") as f:
        html = f.read()

    welcome = os.path.join(ROOT, "tests", "welcome.html")
    os.makedirs(os.path.dirname(welcome), exist_ok=True)
    with io.open(welcome, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)

    html = html.replace("</body>", BOOT + "\n</body>")
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    print("hazır:", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
