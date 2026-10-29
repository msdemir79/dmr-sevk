# Yol Haritası

Bu dosya, henüz uygulanmayan ama değerlendirilen geliştirmeleri tutar. Uygulanan işler `CHANGELOG.md` ve GitHub sürümlerine taşınır.

## Renk–beden–asorti matrisi (tasarım + prototip v2)

**Durum:** Tasarım netleşti, prototip v2 hazır — üretim koduna **henüz alınmadı**. Takip: [#1](https://github.com/msdemir79/dmr-sevk/issues/1)

**Deneme ekranı:** [`prototype/matris.html`](prototype/matris.html) — veri kaydetmez; 6049 kısmi sevk, 1001 açık ve karışık örnekleri içerir.

![Karışık örnek](prototype/onizleme-mix.png)

**Amaç:** Siparişi renk × beden kırılımında girmek; modeldeki asorti şablonuyla koli içi dağılımı hesaplamak; fişte **sevk edilen** miktarların beden dökümünü (isteğe bağlı) göstermek. Sevkiyat ve stok takibi **toplam koli/çift** üzerinden devam eder.

### Netleşen kararlar (30.10.2026)

- **Beden setleri ayrı:** Bebe 22–26, Patik 26–30, Filet 31–35, Garson 36–40, Zenne 36–40, Merdane 36–48. Numaralar EU (Paris); kategori adları Türkiye sektör terimidir.
- **Modelde birden çok renk:** Ör. 6049 → Siyah, Beyaz, Lacivert, Turuncu Beyaz, Beyaz Kırmızı. Siparişte bu renklerden satır açılır; **tek sipariş/tek fişte** toplanır.
- **Asorti model başına tek:** Her modelin tek asortisi olur. Farklı asorti gerektiğinde yeni model kodu açılır (ör. `6049` → `6049-1`).
- **Asorti örneği:** 40–45 için 40-1, 41-2, 42-3, 43-2, 44-1, 45-1 = koli içi 10 çift.
- **Kısmi sevk beden bazında değil:** Sevk ve kalan takibi toplam koli/çift üzerinden yürür.
- **Açık (tek numara) sipariş:** Müşteri aynı modeli tek numara isteyebilir. Koli içi çift **elle** girilir (6, 9, 10, 12…). Ör. 10 koli × 10 çift = 100 çift 40 numara.
- **Fişte sevk edilen görünür:** Kısmi sevk varsa fiş, siparişin tamamını değil **sevk edilen koli/çifti** gösterir.
- **Fiyat toplam mantığı:** Tutar = sevk edilen çift × liste fiyatı; beden bazlı fiyat yok.
- **Fişte boş bedenler gizlenir:** Yalnızca sevk edilen bedenler tabloya girer.

### Prototip v2’nin gösterdikleri

1. Model kartında kategori + beden aralığı + çoklu renk listesi + liste fiyatı + koli içi asorti ızgarası.
2. Siparişte renk satırları; her satır **Asortili** veya **Açık**.
3. Asortili satırda sipariş koli / sevk koli × asorti → numara dağılımı.
4. Açık satırda tek numara, elle koli içi çift.
5. Renk × beden matrisi; **Sipariş / Sevk edilen** görünümü.
6. Fiş: yalnızca sevk edilen satırlar; boş bedenler gizli; tutar = çift × fiyat.

### Kalan küçük sorular

1. **Sevk girişi:** Koli mi, çift mi girilecek? (Prototip koli üzerinden çalışıyor; çift girişi de eklenebilir.)
2. **Renk bazlı fiyat:** Aynı modelde renkler arasında fiyat farkı oluyor mu? (Prototip tek liste fiyatı kullanıyor.)
3. **Açık siparişte koli içi:** 6/9/12 gibi değerler için fişte “koli içi” bilgisi görünsün mü?
4. **Kısmi sevk:** Sevk koli ondalıklı olabilir mi (ör. 5,5 koli), yoksa tam koli mi?

### Aşamalar

1. ✅ Kağıt tasarım — kategori, asorti, açık sipariş, fiş kararları.
2. ✅ HTML prototip v2 — çoklu renk, kısmi sevk, fiyat, boş beden gizleme.
3. ⏳ Geri bildirim — prototip üzerinde son küçük sorular.
4. ⏳ Çekirdek — veri modeli, Excel şeması (`MATRİS` sayfası), migration, testler.
5. ⏳ Arayüz — mevcut uygulamaya sipariş matrisi + fiş seçeneği.
6. ⏳ Rapor + kabul testi → sürüm.

**Neden önce prototip?** Veri modeli ve fiş yerleşimi değişiyor; mevcut dosyalarla uyumluluk riski var. Gerçek siparişlerle denemeden üretime almamak gerekiyor.

---

### Notlar

- Bu başlık kullanıcı talebiyle 30.10.2026’da yol haritasına alındı.
- Öncelik sırası: önce tasarım + deneme, sonra üretim.
