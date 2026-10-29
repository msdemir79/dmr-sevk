# Yol Haritası

Bu dosya, henüz uygulanmayan ama değerlendirilen geliştirmeleri tutar. Uygulanan işler `CHANGELOG.md` ve GitHub sürümlerine taşınır.

## Renk–beden–asorti matrisi (planlanıyor)

**Durum:** Fikir / tasarım aşaması — henüz kod yok. Takip: [#1](https://github.com/msdemir79/dmr-sevk/issues/1)

**Amaç:** Sipariş ve sevkiyatı renk × beden kırılımında tutmak; asorti şablonlarıyla (koli içi beden dağılımı) hızlı ve hatasız giriş yapmak.

**Neden:**

- Kısmi sevkte “hangi beden kaldı” sorusunu yanıtlamak
- Fişte beden dökümü göstermek
- Model / renk / beden bazlı kalan ve satış raporu
- Asorti koli dağılımını standartlaştırmak

**Tasarım kararları (verilecek):**

1. Beden seti ve sırası: 35–46 mı, kadın/erkek/çocuk ayrı mı?
2. Asorti: modelde sabit şablon mu, sipariş bazında değişebilir mi? Birden çok şablon olacak mı?
3. Sipariş girişi: renk × beden matrisi; “koli sayısı × asorti” ile hızlı doldurma; hücre düzeltme.
4. Sevk: beden bazlı kalan; koli/çift otomatik; kısmi sevk.
5. Fiş: beden tablosu A4/A5’e nasıl sığar; hangi toplamlar gösterilir?
6. Excel: yeni `MATRİS` sayfası (sipariş / renk / beden / çift) mı, mevcut satırlara JSON kolon mu? Öneri: ayrı sayfa + satır bazlı.
7. Eski veri: beden kırılımı olmayan siparişler “toplam” olarak kalır; migration ve geriye uyum.
8. Rapor: model / renk / beden toplamları, kalanlar, sevk edilen.

**Aşamalar:**

1. **Kağıt prototip** — gerçek 2–3 sipariş ve fiş üzerinden tasarım; kararlar.
2. **HTML prototip** — ayrı dosyada matris girişi + fiş; gerçek veriyle deneme.
3. **Çekirdek** — veri modeli, Excel şeması, migration ve birim testleri.
4. **Arayüz** — sipariş matrisi, sevk beden seçimi, fiş.
5. **Rapor + kabul testi** — sürüm ve GitHub release.

**Neden önce prototip?** Veri modeli ve fiş yerleşimi değişiyor; mevcut dosyalarla uyumluluk riski var. Gerçek siparişlerle denemeden üretime almamak gerekiyor.

---

### Notlar

- Bu başlık kullanıcı talebiyle 30.10.2026’da yol haritasına alındı.
- Öncelik sırası: önce tasarım + deneme, sonra üretim.
