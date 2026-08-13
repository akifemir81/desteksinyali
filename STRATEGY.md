# DestekSinyali — son kurulum

Bu depo; canlı site, resmî kaynak taraması, fırsat inceleme kuyruğu, kampanya
takibi ve Gmail bülten otomasyonunu içerir.

## 1. GitHub'a yükleme

Final paketin içindeki dosya ve klasörleri `akifemir81/desteksinyali` deposunun
ana dizinine yükleyin. `.github` klasörünün de yüklendiğinden emin olun.

Yükleme tamamlanınca GitHub **Actions** bölümünde şu işler görünür:

- `Deploy DestekSinyali`
- `Monitor official sources`
- `Build weekly operating pack`

İlk iş yeşil olduğunda site şu adreste güncellenir:

<https://akifemir81.github.io/desteksinyali/>

## 2. Canlı kayıt testi

Siteyi gizli sekmede açın ve kendinize ait bir test adresiyle kayıt olun.
`desteksinyali@gmail.com` hesabına FormSubmit kayıt e-postası gelmelidir. E-postada
şu alanlar görünmelidir:

- `email`
- `company`
- `paid_alert_interest`
- `campaign_source`
- `campaign_id`
- `consent`

## 3. Gmail otomasyonunu bir kez yetkilendirme

`automation/google-apps-script/README.md` içindeki adımları
`desteksinyali@gmail.com` hesabında uygulayın. Google'ın zorunlu izin ekranı
hesap sahibi tarafından yalnızca bir kez onaylanır.

Kurulumdan sonra sistem:

- saatte bir yeni kayıtları işler,
- hoş geldin mesajını yollar,
- pazartesi haftalık özeti gönderir,
- abonelikten çıkış taleplerini uygular.

## 4. Pazarlamayı başlatma kapısı

Canlı sayfa ve kayıt testi doğrulanmadan dış mesaj gönderilmez. Test başarılıysa
`output/campaign-messages.md` dosyasındaki ilk üç kişiselleştirilmiş mesajla
başlanır. Mesaj dosyası şu komutla üretilir:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate_campaign_messages.ps1
```

## Başarı kararı

İlk karar 20 doğru temas sonrasında verilir. Ücretli kişisel alarm yalnızca en az
10 nitelikli kayıtta 3 kişinin aylık 249 TL pilot ilgisi göstermesi halinde
geliştirilir. Formdaki ilgi beyanı ödeme değildir; gerçek ücretli pilot ayrıca
açık onayla sunulur.

