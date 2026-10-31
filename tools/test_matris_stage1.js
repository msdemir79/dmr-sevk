const fs = require('fs');
const path = require('path');
const X = require(path.join(__dirname, '..', 'src', 'xlsx.js'));
const M = require(path.join(__dirname, '..', 'src', 'matris.js'));
const Core = require(path.join(__dirname, '..', 'src', 'core.js'));

function ok(c, m) { console.log((c ? 'ok  ' : 'FAIL') + ' - ' + m); if (!c) process.exitCode = 1; }
const S = { 40: 1, 41: 2, 42: 3, 43: 2, 44: 1, 45: 1 };

(async () => {
  // ---- saf yardımcılar ----
  ok(M.asortiToplam(S) === 10, 'asorti toplamı 10');
  ok(M.formatAsorti(S) === '40:1;41:2;42:3;43:2;44:1;45:1', 'asorti metni');
  ok(M.parseAsorti('40:1;41:2')['41'] === 2, 'asorti ayrıştırma');
  ok(M.bedenler('MERDANE').length === 13 && M.bedenler('GARSON').length === 5, 'kategori bedenleri');
  ok(M.formatRenkler(['SİYAH', 'BEYAZ']) === 'SİYAH|BEYAZ', 'renk metni');
  ok(M.parseRenkler('SİYAH|BEYAZ').length === 2, 'renk ayrıştırma');
  const nk = M.normalizeKart({ kategori: 'merdane', renkler: 'SİYAH|BEYAZ', asortiSablon: '40:1;41:2' });
  ok(nk.kategori === 'MERDANE' && nk.renkler.length === 2 && nk.asortiSablon['41'] === 2, 'kart normalizasyonu');

  ok(M.lineCift({ mod: 'ASORTILI', koli: 5, koliIci: 10 }, { asortiSablon: S }) === 50, 'asortili çift 5 koli = 50');
  const d1 = M.lineDagilim({ mod: 'ASORTILI', koli: 5 }, { asortiSablon: S });
  ok(d1['40'] === 5 && d1['41'] === 10 && d1['42'] === 15, 'asortili dağılımı');
  ok(M.lineCift({ mod: 'ACIK', koli: 10, koliIci: 9, beden: 42 }) === 90, 'açık 10 koli × 9 = 90');
  ok(M.lineDagilim({ mod: 'ACIK', koli: 10, koliIci: 9, beden: 42 })['42'] === 90, 'açık tek beden dağılımı');

  // ---- eski sipariş: ESKI satır ----
  const d = Core.newData();
  const c = Core.addCari(d, { ad: 'TEST CARİ' });
  Core.addModel(d, { model: '6049', kategori: 'MERDANE', renkler: ['SİYAH', 'BEYAZ'], asortiSablon: S, asorti: 10, fiyat: 75, maliyet: 50 });
  const o = Core.addOrder(d, { cariId: c.id, model: '6049', renk: 'SİYAH', asorti: 10, adet: 50, fiyat: 75 });
  M.ensureLines(d);
  ok(d.orderLines.length === 1, 'eski sipariş için tek satır');
  ok(d.orderLines[0].mod === 'ESKI' && d.orderLines[0].koli === 5 && d.orderLines[0].cift === 50, 'ESKI satır 5 koli/50 çift');

  const sh = Core.createShipment(d, { cariId: c.id, tarih: '2026-10-01', lines: [{ orderId: o.id, cift: 30, koli: 3 }] });
  ok(sh.lines[0].orderLineId === d.orderLines[0].id, 'sevk satırı sipariş satırına bağlı');
  ok(Core.balance(d, c.id) === 2250, 'bakiye 2.250');

  const bytes = X.writeWorkbook(Core.buildWorkbook(d));
  fs.writeFileSync(path.join(__dirname, 'matris-test.xlsx'), Buffer.from(bytes));
  const wb = await X.readWorkbook(bytes);
  ok(wb.sheets.some(s => s.name === 'SİPARİŞ SATIRLARI'), 'SİPARİŞ SATIRLARI sayfası var');
  const d2 = Core.readData(wb.sheets);
  ok(d2.orderLines.length === 1 && d2.orderLines[0].mod === 'ESKI', 'satır Excelden okundu');
  ok(d2.lines[0].orderLineId === d2.orderLines[0].id, 'sevk bağı Excelden okundu');
  ok(d2.orders[0].adet === 50 && d2.orders[0].asorti === 10, 'eski sipariş alanları korundu');
  ok(Core.balance(d2, c.id) === 2250, 'bakiye gidiş-dönüşte korundu');
  const card2 = d2.modeller[0];
  ok(card2.kategori === 'MERDANE' && card2.renkler.length === 2 && M.asortiToplam(card2.asortiSablon) === 10, 'model kartı alanları korundu');

  // ---- yeni model: asortili + açık çok beden ----
  const d3 = Core.newData();
  const c3 = d3.cariler[0];
  Core.addModel(d3, { model: '1001', kategori: 'GARSON', renkler: ['SİYAH', 'BEYAZ'], asortiSablon: { 36: 1, 37: 2, 38: 3, 39: 2, 40: 2 }, fiyat: 62 });
  const o3 = Core.addOrder(d3, { cariId: c3.id, model: '1001', renk: 'SİYAH', asorti: 10, adet: 150, fiyat: 62 });
  d3.orderLines = [
    { id: 1, orderId: o3.id, renk: 'SİYAH', mod: 'ASORTILI', beden: 0, koli: 5, koliIci: 10, cift: 50 },
    { id: 2, orderId: o3.id, renk: 'BEYAZ', mod: 'ACIK', beden: 40, koli: 4, koliIci: 9, cift: 36 }
  ];
  const tot = M.orderTotals(d3, o3.id);
  ok(tot.koli === 9 && tot.cift === 86, 'sipariş toplamı 9 koli/86 çift');
  ok(tot.dagilim['36'] === 5 && tot.dagilim['40'] === 10 + 36, 'renk/beden dağılımı');

  const sh3 = Core.createShipment(d3, {
    cariId: c3.id, tarih: '2026-10-02',
    lines: [{ orderId: o3.id, orderLineId: 1, cift: 20, koli: 2 }]
  });
  ok(sh3.lines[0].mod === 'ASORTILI' && sh3.lines[0].orderLineId === 1, 'sevk asortili satıra bağlı');
  ok(sh3.lines[0].dagilim['36'] === 2 && sh3.lines[0].dagilim['40'] === 4, 'sevk dağılımı koliye göre');
  const sd = M.shipmentDagilim(d3, sh3.shipment.id);
  ok(sd['37'] === 4 && sd['38'] === 6, 'fiş dağılımı');

  ok(Core.lineInfo(d3, d3.orderLines[0]).kalan === 30, 'asortili satır kalanı 30');
  ok(Core.lineInfo(d3, d3.orderLines[1]).kalan === 36, 'açık satır kalanı 36');
  const sh3b = Core.createShipment(d3, {
    cariId: c3.id, tarih: '2026-10-03',
    lines: [{ orderId: o3.id, orderLineId: 2, cift: 18, koli: 2 }]
  });
  ok(sh3b.lines[0].mod === 'ACIK' && sh3b.lines[0].beden === 40 && sh3b.lines[0].dagilim['40'] === 18, 'açık satır sevki 18 çift');
  const sl3 = Core.shipmentLines(d3, sh3b.shipment.id)[0];
  ok(sl3.beden === 40 && sl3.koliIci === 9 && sl3.mod === 'ACIK', 'fiş satırı beden/koli içi taşıyor');
  ok(M.shipmentDagilim(d3, sh3b.shipment.id)['40'] === 18, 'fiş beden dökümü 42 = 18');
  let fazla = false;
  try { Core.createShipment(d3, { cariId: c3.id, tarih: '2026-10-04', lines: [{ orderId: o3.id, orderLineId: 1, cift: 31, koli: 3.1 }] }); }
  catch (e) { fazla = true; }
  ok(fazla, 'satır kalanından fazla sevk engellendi');

  const bytes3 = X.writeWorkbook(Core.buildWorkbook(d3));
  const wb3 = await X.readWorkbook(bytes3);
  const d4 = Core.readData(wb3.sheets);
  ok(d4.orderLines.length === 2, 'iki sipariş satırı Excelden okundu');
  ok(d4.orderLines[1].mod === 'ACIK' && d4.orderLines[1].beden === 40, 'açık satır bedeni korundu');

  // ---- eski dosya: satır sayfası yok ----
  const eskiSheets = wb.sheets.filter(s => s.name !== 'SİPARİŞ SATIRLARI');
  const d5 = Core.readData(eskiSheets);
  ok(d5.orderLines.length === 1 && d5.orderLines[0].mod === 'ESKI', 'eski dosyada satır üretildi');
  ok(d5.lines[0].orderLineId === d5.orderLines[0].id, 'eski dosyada sevk bağı kuruldu');
  ok(Core.balance(d5, c.id) === 2250, 'eski dosya bakiyesi korundu');
})().catch(e => { console.error('HATA', e); process.exit(1); });
