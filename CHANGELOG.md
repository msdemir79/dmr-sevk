# Değişiklik Günlüğü

Tüm önemli değişiklikler bu dosyada tutulur. Sürümler `vMAJOR.MINOR.PATCH` etiketleriyle işaretlenir.

## v2.3.1 — 31.10.2026

### Düzeltildi
- **Model kartına resim ekleme** çalışmıyordu; eksik `imageToDataUrl` fonksiyonu geri eklendi.
- Resim seçilince küçük önizleme oluşur; kaydedince model listesinde görünür.
- Sipariş resmi ve logo yükleme aynı düzeltmeden yararlanır.

## v2.3.0 — 31.10.2026

### Eklendi
- **Cari Hesap → Tahsilat:** cariye alacak olarak hızlı tahsilat girişi.
- **Cari Hesap → Gider:** GİDER işlem türü; varsayılan **cariye borç**, yön alacak olarak değiştirilebilir.
- Gider filtresi ve işlem etiketi.

### Düzeltildi
- Cari hesap **“Hareket ekle”** butonu çalışmıyordu; eksik `openLedgerForm` fonksiyonu geri eklendi.

## v2.2.0 — 31.10.2026

### Eklendi
- **Model kartında “Yeni renk” kısayolu:** Ayarlar’a gitmeden renk tanımlama.
- Yeni renk kaydedilince model formu kapanmaz; renk otomatik seçilir ve renk × beden matrisine eklenir.
- İç içe pencerelerde Escape yalnızca üstteki pencereyi kapatır.

## v2.1.1 — 31.10.2026

### Düzeltildi
- Sipariş satırındaki **renk** artık serbest metin değil, model kartındaki tanımlı renklerden **seçim**.
- Model değiştirildiğinde renk listesi güncellenir; modelde olmayan renk ilk tanımlı renge çekilir.
- Model seçilince satır otomatik **Asortili/Açık** moda geçer.

## v2.1.0 — 31.10.2026

### Eklendi
- **Renk ustası:** Renkler ayrı tabloda (ad, kısa kod, aktif); model kartında çoklu seçim.
- **Asorti şablonları:** Ayarlar’da ad + kategori + beden dağılımı; modele atanır.
- **Model renkleri:** Model ↔ renk ilişkisi ayrı tabloda.
- Model kartında **renk × beden matrisi** önizlemesi.
- Excel: **RENKLER**, **ASORTİ ŞABLONLARI**, **MODEL RENKLERİ** sayfaları.

### Değişti
- Model formu: kategori yerine şablon seçimi; renkler metin yerine usta kayıttan seçilir.
- Eski model kartlarındaki renkler ve asorti şablonları otomatik olarak ustalara taşınır; aynı dağılım tek şablonda birleşir.

### Düzeltildi
- v2.0.1: Modeller sayfasında Düzenle/Sil/Resim butonları.

## v2.0.1 — 31.10.2026

### Düzeltildi
- **Modeller sayfasında Düzenle / Sil / Resim butonları** çalışmıyordu; eksik `modelById`, `showModelImage` ve `removeModel` fonksiyonları geri eklendi.

## v2.0.0 — 31.10.2026

### Eklendi
- **Renk–beden–asorti matrisi:** model kartında kategori (Bebe…Merdane), çoklu renk listesi ve beden bazlı asorti şablonu
- Siparişte renk/beden satırları; **asortili** veya **açık** (tek numara, elle koli içi), aynı siparişte çok renk
- **Satır bazlı sevk:** her renk/beden satırının kalanı ayrı; kısmi sevk ve fazla sevk engeli
- Fişte **yalnızca sevk edilen bedenler**; boş beden kolonu yok; “Açık · 9’lu” etiketi
- **Beden dökümü raporu**; A4/A5 fiş tek sayfa

### Değişti
- Excel: **SİPARİŞ SATIRLARI** sayfası; model kartı ve sevk satırı yeni kolonları
- Sevk ekranı ve sepet sipariş yerine **renk/beden satırı** bazlı
- Eski siparişler `ESKI` satırına taşınır; bakiye, sevk ve kalanlar korunur

### Not
- Eski Excel dosyası ilk açılışta yeni şemaya yükseltilir; veri silinmez.

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
