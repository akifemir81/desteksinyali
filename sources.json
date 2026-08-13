# DestekSinyali Gmail otomasyonu

Bu paket, `desteksinyali@gmail.com` hesabına gelen FormSubmit kayıtlarını işler,
Google Sheet abone tablosu oluşturur, hoş geldin mesajını yollar, çıkış taleplerini
uygular ve pazartesi günleri haftalık fırsat özetini gönderir.

## Maliyet ve kapasite

Google'ın tüketici Gmail hesapları için güncel Apps Script sınırı günde 100 e-posta
alıcısıdır. Kod güvenlik payı bırakır ve bir çalışmada en fazla 80 bülten gönderir.
Bu kapasite ürün doğrulama dönemi için yeterlidir; limitler Google tarafından
değiştirilebildiği için büyüme öncesinde yeniden kontrol edilmelidir.

## Tek seferlik zorunlu kurulum

1. `desteksinyali@gmail.com` hesabıyla <https://script.google.com/> adresini açın.
2. **Yeni proje** oluşturup adını `DestekSinyali Otomasyon` yapın.
3. `Code.gs` içeriğini editördeki dosyaya yapıştırın.
4. Proje ayarlarında manifest dosyasını görünür yapın ve `appsscript.json`
   içeriğini mevcut manifestle değiştirin.
5. Fonksiyon listesinden önce `runSelfTest`, sonra `setupDestekSinyali`
   fonksiyonunu çalıştırın.
6. Google'ın istediği Gmail, e-posta gönderme ve Sheets izinlerini onaylayın.
7. Çalıştırma günlüğünde dönen `spreadsheetUrl` bağlantısını açıp `Subscribers`
   ve `Logs` sayfalarının oluştuğunu doğrulayın.

Bu işlem bir kez yapılır. `setupDestekSinyali` şu zamanlayıcıları otomatik kurar:

- saatte bir yeni FormSubmit kaydı,
- altı saatte bir abonelikten çıkış,
- pazartesi 10:00 civarında haftalık bülten,
- pazartesi 11:00 civarında hesap sahibine kayıt ve kanal özeti.

Kod daha önce kurulmuşsa güncel `Code.gs` yapıştırıldıktan sonra
`setupDestekSinyali` bir kez yeniden çalıştırılır. Abone tablosu korunur; yalnızca
zamanlayıcılar güncel listeyle yeniden kurulur.

## İlk pazarlama dalgası

`Campaign.gs` dosyası ilk üç doğrulanmış kurumsal alıcı için ölçümlü kampanya taslaklarını
içerir. Apps Script projesine aynı adla yeni bir komut dosyası olarak eklenir.
Önce `previewFirstCampaignWave` çalıştırılarak alıcı ve metinler incelenir.
`createFirstCampaignDrafts` yalnızca Gmail taslakları oluşturur; mesaj göndermez.
Ticari ileti gönderici kimliği, İYS ve ret hakkı yükümlülükleri doğrulanmadan taslaklar
gönderilmez. Kod aynı kampanya kimliği için ikinci taslağı oluşturmaz ve sonuçları
`Marketing` sayfasına kaydeder.

Google, saat tabanlı çalıştırma zamanını seçilen saatin içinde bir miktar
rastgeleleştirebilir.

## Güvenlik davranışı

- Yalnızca `submissions@formsubmit.co` göndereninden ve beklenen konuyla gelen
  kayıtlar işlenir.
- `consent: yes` olmayan kayıt eklenmez.
- Aynı e-posta ikinci kez eklenmez veya tekrar hoş geldin mesajı almaz.
- Çıkış yapan adres otomatik olarak yeniden etkinleştirilmez.
- Tablo formülü enjeksiyonuna dönüşebilecek hücre değerleri etkisizleştirilir.
- Bültenler tek tek gönderilir; aboneler birbirlerinin adreslerini görmez.
- Günlük gönderim kotası çalışmadan önce kontrol edilir.

## İşletim

Normal durumda müdahale gerekmez. Google zamanlayıcı hatalarında hesap sahibine
otomatik hata özeti gönderir. `Logs` sayfasındaki `ERROR` kayıtları yalnızca
hata oluştuğunda incelenmelidir.

İlk kurulumdan sonra canlı kayıt testi yapın. Test adresi `Subscribers` sayfasına
eklenmeli ve hoş geldin mesajı gelmelidir.
