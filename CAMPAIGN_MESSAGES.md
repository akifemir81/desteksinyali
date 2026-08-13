# Kişisel alarm fiyat doğrulaması

## Ücretsiz ve ücretli değer ayrımı

Piyasada genel destek listesi ve ücretsiz bilgilendirme sunan alternatifler vardır.
Bu nedenle DestekSinyali genel fırsat özetini ücretsiz tutar. Ücretli değer şunlardan
oluşur:

- şirket profiline göre eşleştirme,
- uygun fırsatta haftalık bülteni beklemeden uyarı,
- son tarih yaklaşırken hatırlatma,
- ilgisiz duyuruların elenmesi.

## İlk fiyat hipotezi

Somut pilot teklif aylık **490 TL** üzerinden doğrulanır. Kapsam; şirket profiline
göre eşleştirme, kritik tarih hatırlatması ve ilk adım/belge kontrol listesidir.
Talep aşamasında ödeme alınmaz.

## Karar kapısı

- En az 100 nitelikli ziyaret veya 30 günlük test oluşmadan sonuç yorumlanmaz.
- En az 3 kişi `pilot_490_request` göndermeden ödeme altyapısı kurulmaz.
- Form cevabı gerçek ödeme yerine geçmez; sonraki aşamada açık şartlarla küçük bir
  ücretli pilot teklifi yapılır.
- Üçten az ciddi talep varsa yeni özellik geliştirilmez ve gelir modeli değiştirilir.

## Ölçüm

FormSubmit kaydındaki `paid_alert_interest`, `campaign_source` ve `campaign_id`
alanları birlikte değerlendirilir. Böylece yalnızca fiyat niyeti değil, hangi
kampanya mesajının nitelikli talep getirdiği görülür.
