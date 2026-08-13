# DestekSinyali — başlangıç stratejisi

## Müşteri

İlk müşteri segmenti 1-20 çalışanlı yazılım ajansları, SaaS girişimleri ve
dijital hizmet ihracatı yapan küçük şirketlerdir. Bu gruba çevrimiçi ulaşmak
kolaydır; kaçırılan bir desteğin ekonomik değeri de abonelik ücretinden çok
daha yüksektir.

## Sorun

Resmi bilgiler farklı kurumlarda, uzun metinler ve ek PDF'ler halinde yayılır.
Kullanıcı üç kısa cevap ister:

- Bana uygun mu?
- Ne kadar zaman kaldı?
- İlk yapmam gereken nedir?

## Ürün

Her fırsat için kaynak bağlantısı, uygunluk özeti, son tarih, gerekli ilk adım
ve güven notu gösterilir. Sistem hukuki veya mali danışmanlık iddiasında
bulunmaz; kullanıcıyı daima resmi kaynağa yönlendirir.

## Gelir merdiveni

1. Ücretsiz: haftalık genel özet.
2. Pro: şirket profiline göre eşleşme ve anlık bildirim.
3. Takım: birden fazla şirket/proje, ekip içi görev ve takvim aktarımı.

Fiyat henüz belirlenmeyecek. Önce görüşmelerde “bu bildirimi zamanında almak
size ne kazandırırdı?” sorusunun cevabı ölçülecek.

## Sıfır maliyet mimarisi

- Statik arayüz: HTML/CSS/JavaScript.
- Veri: sürüm kontrollü JSON.
- Toplama: Python standart kütüphanesi ve zamanlanmış CI işi.
- Barındırma: ücretsiz statik hosting.
- İlk kayıt toplama: ücretsiz form sağlayıcısı veya kullanıcının mevcut formu.
- İlk bültenler: elle onaylanan taslak; talep kanıtlanınca otomasyon.

Üçüncü taraf ücretsiz planları değişebileceğinden servis seçimi hesap açılacağı
gün yeniden kontrol edilecektir.

## Doğrulama eşikleri

- 20 doğru kişiye erişim.
- En az 10 bekleme listesi kaydı.
- En az 5 kısa müşteri görüşmesi.
- En az 3 kişinin kişisel alarm için ödeme niyeti belirtmesi.

Bu eşikler yakalanmazsa ürün büyütülmez; mesaj veya segment değiştirilir.

## Riskler

- Yanlış/eskimiş bilgi: yayın zamanı, kaynak URL'si ve son kontrol zamanı zorunlu.
- Kaynak sayfası değişikliği: toplayıcı hata verdiğinde eski kayıt yayımlamaz.
- Spam: açık izin, kolay çıkış ve düşük gönderim sıklığı.
- Mevzuat: ürün başvuru danışmanlığı değil, bilgi ve yönlendirme aracıdır.
- Dağıtım: ilk kanal SEO değil, doğrudan hedef müşteri görüşmeleridir.

