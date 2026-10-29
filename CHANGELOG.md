# Değişiklik Günlüğü

Tüm önemli değişiklikler bu dosyada tutulur. Sürümler `vMAJOR.MINOR.PATCH` etiketleriyle işaretlenir.

## v1.8.0 — 30.10.2026

### Değişti
- Proje adı **DMR AYAKKABI** olarak güncellendi; eski proje adı yalnızca müşteri kayıtlarında kalır
- Uygulama dosyası **DMR_SEVK.html**, varsayılan veri dosyası **DMR_VERI.xlsx**
- Varsayılan marka **DMR / AYAKKABI**, kısa işaret **DMR**; ilk cari **YENİ CARİ**
- Eski dosyalardaki marka ayarları açılışta otomatik DMR'ye taşınır (müşteri kayıtlarına dokunulmaz)
- Depo adı **dmr-sevk**

## v1.7.0 — 30.10.2026

### Eklendi
- **Model kartlarına resim**: dosyadan seçme, yapıştırma (Ctrl+V) veya sürükleme; model listesinde fotoğraf
- **Model kartlarına asorti** (çift/koli); siparişte model seçilince asorti otomatik dolar
- Model resimleri için Excel'de gizli MODEL RESİMLERİ sayfası
- Model listesinde fotoğraf ve asorti kolonları; fotoğrafa tıklayınca büyük önizleme

## v1.6.0 — 30.10.2026

### Eklendi
- **Model kartları**: fiyat, maliyet, barkod, sezon; model bazlı sipariş/sevk/kalan özeti
- **Kârlılık raporu**: aylık ciro, maliyet, kâr ve marj; maliyetsiz satır uyarısı
- **Sevk fişine fatura no ve fatura tarihi**; listede görünüm ve düzenleme, basılı fişte satır
- **Siparişi kopyala**: benzer siparişi tek tıkla açma
- **Toplu sevk**: cariye ait tüm kalanları tek fişe ekleme
- **Ctrl+K hızlı arama**: model, cari, fiş ve fatura no
- **Klavye akışı**: Enter ile sonraki alan, Ctrl+Enter ile kaydet, “Kaydet ve yeni”
- **Çöp kutusu**: silinen fiş, sipariş, hareket ve cariyi 30 gün saklama ve geri yükleme
- **İşlem günlüğü**: kim, ne zaman, hangi kaydı değiştirdi
- **Günlük otomatik yedek**: tarayıcıda son 7 gün, tek tıkla geri yükleme ve indirme
- **Dosya sağlık kontrolü**: açılışta tutarsızlık uyarısı
- **Sürüm numarası ve yenilikler** ekranı
- Excel'e `MODEL KARTLARI`, `İŞLEM GÜNLÜĞÜ`, `ÇÖP KUTUSU` sayfaları

### Değişti
- Sevk Fişleri tablosuna fatura kolonu eklendi
- Ayarlar ekranına yedekler ve kayıt güvenliği kartları eklendi

## v1.5.0 — 29.10.2026

- Marka adı, alt başlık, kısa işaret ve logo ayarları
- Mevcut veritabanına cari aktarma; varsayılan dosya adı (ör. `Database`)
- İki panelli yeni giriş ekranı ve “Beni hatırla” (yalnızca kullanıcı adı)

## v1.4.0 — 29.10.2026

- Kullanıcı hesapları, yönetici/kullanıcı rolleri ve oturum kilidi
- A5 sevk fişi
- Resim yolu kolonu kaldırıldı; resimler gömülü önizleme olarak tutuluyor

## v1.3.0 — 28.10.2026

- Çoklu cari hesap ve global fiş numarası
- Cari bazlı ekstre; mevcut kayıtların ilk cariye atanması

## v1.2.0 — 27.10.2026

- Tek HTML dosya, Excel veritabanı
- Sipariş, sevk, cari hesap, raporlar ve yazdırma
