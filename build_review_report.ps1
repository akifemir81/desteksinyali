# Haftalık yönetim panosu

İlk aşamada analitik servisine ihtiyaç yoktur. Her pazar aşağıdaki sayılar
`operations/weekly-metrics.csv` dosyasına eklenir.

- Doğru hedef kişiye gönderilen mesaj
- Gelen cevap
- Yapılan görüşme
- Bekleme listesi kaydı
- Bülten gönderimi ve yanıtı
- “Ücretli alarmı denerim” diyen kişi

## Karar kuralları

- 20 doğru temas / 5 görüşmeden azsa dağıtım henüz test edilmemiştir.
- 5 görüşmenin 3'ünde sorun düşük puanlıysa segment veya sorun değiştirilir.
- 10 kayıt içinde 3 ödeme niyeti yoksa ücretli özellik geliştirilmez.
- İnsanlar fırsatı değerli bulup bildirim istemiyorsa bülten modeli korunur;
  kişisel SaaS katmanı ertelenir.
- Üç pilot ödeme niyeti oluşursa fiyat testi iki paketle yapılır; fiyat görüşmede
  söylenir, yanıltıcı indirim veya sahte kıtlık kullanılmaz.
