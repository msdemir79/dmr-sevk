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

  const sr = Core.sizeReport(d3, '', c3.id);
  ok(sr.sizes.join(',') === '36,37,38,39,40', 'beden raporu boyutları');
  ok(sr.toplam === 38 && sr.totals['40'] === 22, 'beden raporu 40 = 22, toplam 38');
  ok(sr.rows.length === 2, 'beden raporu iki renk satırı');

  const bytes3 = X.writeWorkbook(Core.buildWorkbook(d3));
  const wb3 = await X.readWorkbook(bytes3);
  const d4 = Core.readData(wb3.sheets);
  ok(d4.orderLines.length === 2, 'iki sipariş satırı Excelden okundu');
  ok(d4.orderLines[1].mod === 'ACIK' && d4.orderLines[1].beden === 40, 'açık satır bedeni korundu');

  // ---- tahsilat / gider ----
  const dg = Core.newData();
  const cg = dg.cariler[0];
  const gider = Core.addLedgerEntry(dg, { cariId: cg.id, islem: 'GİDER', tutar: 1250, aciklama: 'Kargo gideri' });
  ok(gider.borc === 1250 && gider.alacak === 0, 'gider borç olarak eklendi');
  const tahsil = Core.addLedgerEntry(dg, { cariId: cg.id, islem: 'TAHSİLAT', tutar: 500, aciklama: 'Nakit' });
  ok(tahsil.alacak === 500 && tahsil.borc === 0, 'tahsilat alacak olarak eklendi');
  ok(Core.balance(dg, cg.id) === 750, 'gider/tahsilat bakiyesi 750');

  // ---- renk / asorti şablonu ustaları ----
  const dm = Core.newData();
  const syh = Core.addColor(dm, { ad: 'SİYAH', kod: 'SYH' });
  const byz = Core.addColor(dm, { ad: 'BEYAZ' });
  const sab = Core.addAsortiSablon(dm, { ad: 'Merdane 10 lu', kategori: 'MERDANE', dagilim: S });
  const mm = Core.addModel(dm, { model: '7001', asortiSablonId: sab.id, renkIds: [syh.id, byz.id], fiyat: 100 });
  ok(mm.kategori === 'MERDANE' && mm.asortiSablonId === sab.id, 'model şablonu referans alıyor');
  ok(mm.renkler.length === 2 && mm.renkIds.length === 2, 'model iki renk bağlı');
  ok(M.templateUsage(dm, sab.id) === 1, 'şablon kullanımı 1');
  let renkSilindi = false;
  try { Core.deleteColor(dm, syh.id); } catch (e) { renkSilindi = true; }
  ok(renkSilindi, 'kullanılan renk silinemiyor');

  const dmOld = Core.newData();
  Core.addModel(dmOld, { model: '7002', kategori: 'MERDANE', renkler: ['SİYAH', 'MAVİ'], asortiSablon: S, fiyat: 90 });
  Core.addModel(dmOld, { model: '7003', kategori: 'MERDANE', renkler: ['SİYAH'], asortiSablon: S, fiyat: 95 });
  M.migrateMaster(dmOld);
  ok(dmOld.renkler.length === 2, 'eski kartlardan 2 renk üretildi');
  ok(dmOld.asortiSablonlari.length === 1, 'aynı asorti tek şablonda toplandı');
  ok(dmOld.modeller[0].asortiSablonId === dmOld.asortiSablonlari[0].id, 'eski model şablona bağlandı');
  const once = { r: dmOld.renkler.length, t: dmOld.asortiSablonlari.length, m: dmOld.modelRenkleri.length };
  M.migrateMaster(dmOld);
  ok(dmOld.renkler.length === once.r && dmOld.asortiSablonlari.length === once.t && dmOld.modelRenkleri.length === once.m, 'migration idempotent');

  const wbm = X.writeWorkbook(Core.buildWorkbook(dm));
  const wbmm = await X.readWorkbook(wbm);
  ok(wbmm.sheets.length === 20 && wbmm.sheets.some(x => x.name === 'RENKLER') && wbmm.sheets.some(x => x.name === 'ASORTİ ŞABLONLARI') && wbmm.sheets.some(x => x.name === 'MODEL RENKLERİ') && wbmm.sheets.some(x => x.name === 'PERSONEL') && wbmm.sheets.some(x => x.name === 'PUANTAJ') && wbmm.sheets.some(x => x.name === 'HESAPLAR') && wbmm.sheets.some(x => x.name === 'KASA HAREKETLERİ'), 'renk/şablon/personel/kasa sayfaları Excelde');
  const dm2 = Core.readData(wbmm.sheets);
  const mm2 = dm2.modeller.filter(x => x.model === '7001')[0];
  ok(mm2 && mm2.asortiSablonId === sab.id && mm2.renkler.length === 2, 'model şablon/renk Excelden okundu');

  // ---- personel / puantaj ----
const dp = Core.newData();
const per = Core.addPersonel(dp, { ad: 'Test Personel', gorev: 'Satış', maas: 10000, gunlukSaat: 8 }, 'test');
ok(per.id > 0 && per.maas === 10000 && per.gunlukSaat === 8, 'personel eklendi');
const tam = Core.getPuantaj(dp, per.id, '2026-11');
ok(tam.net === 10000, 'tam ay maaş 10000');
const kayit = Core.savePuantaj(dp, { personelId: per.id, ay: '2026-11', eksikGun: 2, eksikSaat: 4, fazlaMesai: 10 }, 'test');
ok(kayit.net === 9791.67, 'eksik gün/saat ve fazla mesai hesabı');
const hesap = Core.getPuantaj(dp, per.id, '2026-11');
ok(hesap.eksikGunKesinti === 666.67 && hesap.eksikSaatKesinti === 166.67 && hesap.fazlaMesaiTutar === 625, 'kesinti ve FM kalemleri');
ok(Core.payrollTotal(dp, '2026-11') === 9791.67, 'aylık maaş toplamı');
Core.updatePersonel(dp, per.id, { maas: 12000 }, 'test');
const eski = Core.getPuantaj(dp, per.id, '2026-11');
ok(eski.maas === 10000 && eski.net === 9791.67, 'maaş snapshot korunuyor');
const gchar = new Array(31).fill('T');
gchar[0] = 'Y'; gchar[1] = 'I'; gchar[2] = 'R'; gchar[3] = 'H';
const aralik = Core.savePuantaj(dp, { personelId: per.id, ay: '2026-12', gunler: gchar.join('') }, 'test');
ok(Core.monthDays('2026-12') === 31 && Core.gridDays(aralik, '2026-12').length === 31, 'ay gün sayısı ve grid');
ok(aralik.eksikGun === 1 && aralik.net === 11600, 'gridde Y eksik gün, İ/R/H kesintisiz');
const df = Core.newData();
df.settings.fisBaslangic = 1000;
ok(Core.nextFisNo(df) === 1000, 'fiş başlangıç numarası');
df.settings.sonFisNo = 1000;
ok(Core.nextFisNo(df) === 1001, 'fiş numarası son kullanılandan devam ediyor');
const dk = Core.newData();
const hk = dk.hesaplar[0];
Core.addKasa(dk, { hesapId: hk.id, yon: 'GIRIS', tutar: 1000, tur: 'DEVIR', aciklama: 'test' }, 'test');
Core.addKasa(dk, { hesapId: hk.id, yon: 'CIKIS', tutar: 300, tur: 'GIDER', aciklama: 'test' }, 'test');
ok(Core.hesapBakiye(dk, hk.id) === 700, 'kasa bakiyesi hareketlerden hesaplanıyor');
const hk2 = dk.hesaplar[1];
Core.transferKasa(dk, { fromHesapId: hk.id, toHesapId: hk2.id, tutar: 200, tarih: '2026-11-10', aciklama: 'test' }, 'test');
ok(Core.hesapBakiye(dk, hk.id) === 500 && Core.hesapBakiye(dk, hk2.id) === 200, 'kasa-banka transferi');
const wg = Core.gridDays({ ay: '2026-11' }, '2026-11', [0, 6]);
ok(wg[0] === 'H' && wg[1] === 'T' && wg.length === 30, 'hafta tatili günleri H başlıyor');
const dp3 = Core.newData();
const p3 = Core.addPersonel(dp3, { ad: 'Çıkış Test', maas: 9000, cinsiyet: 'BAY', cikisTarihi: '2026-11-30' }, 'test');
ok(dp3.settings.personelGunlukSaat === 8 && dp3.settings.personelHaftaTatili === '0,6' && p3.cinsiyet === 'BAY', 'personel varsayılanları ve cinsiyet');
const r3 = Core.savePuantaj(dp3, { personelId: p3.id, ay: '2026-11' }, 'test');
ok(Core.personelById(dp3, p3.id).aktif === true, 'çıkış maaşı ödenmeden aktif');
Core.setPuantajStatus(dp3, r3.id, 'ODENDI', '2026-11-30', 'test');
ok(Core.personelById(dp3, p3.id).aktif === false, 'çıkış maaşı ödenince otomatik pasif');
let silHata = false;
try { Core.deletePersonel(dp, per.id, 'test'); } catch (e) { silHata = true; }
ok(silHata, 'puantajı olan personel silinemiyor');
const wbp = await X.readWorkbook(X.writeWorkbook(Core.buildWorkbook(dp)));
const pSheet = wbp.sheets.filter(x => x.name === 'PERSONEL')[0];
const uSheet = wbp.sheets.filter(x => x.name === 'PUANTAJ')[0];
ok(pSheet && pSheet.rows.length === 2 && uSheet && uSheet.rows.length === 3, 'personel/puantaj Excelde');
const dp2 = Core.readData(wbp.sheets);
const uAra = dp2.puantaj.filter(x => x.ay === '2026-12')[0];
ok(dp2.personel.length === 1 && dp2.puantaj.length === 2 && uAra && uAra.gunler.length === 31, 'personel/puantaj Excelden okundu');

// ---- eski dosya: satır sayfası yok ----
  const eskiSheets = wb.sheets.filter(s => s.name !== 'SİPARİŞ SATIRLARI');
  const d5 = Core.readData(eskiSheets);
  ok(d5.orderLines.length === 1 && d5.orderLines[0].mod === 'ESKI', 'eski dosyada satır üretildi');
  ok(d5.lines[0].orderLineId === d5.orderLines[0].id, 'eski dosyada sevk bağı kuruldu');
  ok(Core.balance(d5, c.id) === 2250, 'eski dosya bakiyesi korundu');
})().catch(e => { console.error('HATA', e); process.exit(1); });
