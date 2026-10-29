# Yol Haritası

Bu dosya, henüz uygulanmayan ama değerlendirilen geliştirmeleri tutar. Uygulanan işler `CHANGELOG.md` ve GitHub sürümlerine taşınır.

## Renk–beden–asorti matrisi (tasarım + prototip)

**Durum:** Tasarım netleşti, prototip hazır — üretim koduna **henüz alınmadı**. Takip: [#1](https://github.com/msdemir79/dmr-sevk/issues/1)

**Deneme ekranı:** [`prototype/matris.html`](../prototype/matris.html) — veri kaydetmez; 6049, 1001 açık ve karışık örnekleri içerir.

**Amaç:** Siparişi renk × beden kırılımında girmek; asorti şablonuyla koli içi dağılımı otomatik hesaplamak; fişte isteğe bağlı beden dökümü göstermek. Sevkiyat ve stok takibi **toplam koli/çift** üzerinden devam eder.

### Netleşen kararlar (30.10.2026)

- **Beden setleri ayrı:** Bebe 22–26, Patik 26–30, Filet 31–35, Garson 36–40, Zenne 36–40, Merdane 36–48. Numaralar EU (Paris); kategori adları Türkiye sektör terimidir.
- **Asorti model başına tek:** Her modelin tek asortisi olur. Farklı asorti gerektiğinde yeni model kodu açılır (ör. `6049` → `6049-1`).
- **Asorti örneği:** 40–45 için 40-1, 41-2, 42-3, 43-2, 44-1, 45-1 = koli içi 10 çift.
- **Kısmi sevk beden bazında değil:** Sevk ve kalan takibi toplam koli/çift üzerinden yürür.
- **Açık (tek numara) sipariş:** Müşteri aynı modeli tek numara isteyebilir. Ör. 100 çift 40 numara = 10 koli × 10 çift 40 numara.
- **Fişte beden tablosu:** Zorunlu değil; seçenek olarak eklenip çıkarılabilir.

### Prototipin gösterdikleri

1. Model kartında kategori + beden aralığı + koli içi asorti ızgarası.
2. Siparişte renk satırları; her satır **Asortili** veya **Açık (tek numara)**.
3. Asortili satırda koli × asorti → numara bazlı çift dağılımı.
4. Açık satırda tek numara × koli × koli içi çift.
5. Renk × beden matrisi ve toplamlar.
6. Fiş önizlemesi; beden dökümü aç/kapat.

### Kalan sorular (prototip üzerinde netleşecek)

1. **Renk satırları:** Bir siparişte birden çok renk tek fişte mi toplanacak, yoksa her renk ayrı sipariş mi olacak?
2. **Açık asorti:** Koli içi çift her zaman modelin asorti toplamı mı (ör. 10), yoksa ayrıca mı girilecek?
3. **Kısmi sevk:** Fişte beden tablosu siparişin tamamını mı göstermeli, yoksa kısmi sevk için oransal mı hesaplanmalı?
4. **Fiyat:** Matris/tutar hesabı sipariş ekranına dahil edilsin mi, yoksa ayrı mı kalsın?

### Aşamalar

1. ✅ Kağıt tasarım — kategori, asorti, açık sipariş, fiş kararları.
2. ✅ HTML prototip — matris girişi, açık/asortili, fiş.
3. ⏳ Geri bildirim — prototip üzerinde kalan soruların netleşmesi.
4. ⏳ Çekirdek — veri modeli, Excel şeması (`MATRİS` sayfası), migration, testler.
5. ⏳ Arayüz — mevcut uygulamaya sipariş matrisi + fiş seçeneği.
6. ⏳ Rapor + kabul testi → sürüm.

**Neden önce prototip?** Veri modeli ve fiş yerleşimi değişiyor; mevcut dosyalarla uyumluluk riski var. Gerçek siparişlerle denemeden üretime almamak gerekiyor.

---

### Notlar

- Bu başlık kullanıcı talebiyle 30.10.2026’da yol haritasına alındı.
- Öncelik sırası: önce tasarım + deneme, sonra üretim.
