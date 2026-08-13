# DestekSinyali

Türkiye'deki yazılım ajansları, küçük teknoloji şirketleri ve dijital hizmet
ihracatçıları için resmi teşvik ve destek radarı.

## Ürün tezi

Hedef kullanıcı desteklerin varlığından çok, hangisinin kendisine uyduğunu ve
son başvuru tarihini kaçırmamayı önemsiyor. İlk sürüm bu nedenle kapsamlı bir
haber portalı değil; az sayıda resmi kaynaktan gelen fırsatları sadeleştiren bir
filtre ve bildirim ürünüdür.

## İlk sürümü çalıştırma

Bu depo bağımlılıksız statik bir site olarak başlar. Dağıtılabilir `public`
klasörünü üretmek için aşağıdaki komutu çalıştırın. Veriler tarayıcı tarafından
alındığı için siteyi doğrudan `file://` ile değil bir statik sunucuda görüntüleyin.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build.ps1
```

Veri doğrulama komutu (Windows/PowerShell, ek bağımlılık gerekmez):

```powershell
./scripts/validate_data.ps1
```

Resmî kaynakların erişilebilirliğini kontrol etmek için:

```powershell
./scripts/check_sources.ps1
```

Yeni duyuru adaylarını inceleme kuyruğuna almak için:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/collect_candidates.ps1
```

Tüm yerel kontroller:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
```

Kayıt formu hazır olduğunda bağlantıyı `config/site.json` içindeki
`waitlist_url` alanına yazmak yeterlidir. GitHub Pages dağıtım iş akışı
`.github/workflows/deploy-pages.yml` dosyasında hazırdır.

## Yol haritası

1. Landing page ve bekleme listesiyle 20 hedef kullanıcıya ulaş.
2. En az 5 görüşme ve 10 kayıt olmadan ücretli altyapı geliştirme.
3. Resmi kaynaklardan günlük veri toplama ve tekrarları eleme.
4. Haftalık ücretsiz özet gönderme.
5. Kullanıcı başına filtre ve anlık alarmı ücretli katman olarak açma.

Stratejik kararlar için [docs/STRATEGY.md](docs/STRATEGY.md), günlük görevler
için [docs/EVENING_CHECKLIST.md](docs/EVENING_CHECKLIST.md) dosyasına bakın.

## Ücretsiz Gmail otomasyonu

FormSubmit kayıtlarını abone tablosuna aktaran, hoş geldin mesajını ve haftalık
bülteni gönderen Google Apps Script paketi `automation/google-apps-script`
klasöründedir. Tek seferlik kurulum için
[docs/FINAL_SETUP.md](docs/FINAL_SETUP.md) belgesini izleyin.
