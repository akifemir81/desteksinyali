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

Pilot soru aylık **249 TL** üzerinden sorulur. Bu bir satış veya indirim vaadi
değildir; ödeme alınmadan önce talep sinyalini ölçen bir fiyat araştırmasıdır.

## Karar kapısı

- En az 10 nitelikli kayıt olmadan sonuç yorumlanmaz.
- En az 3 kişi `pilot_249_yes` seçmeden ödeme altyapısı kurulmaz.
- Form cevabı gerçek ödeme yerine geçmez; sonraki aşamada açık şartlarla küçük bir
  ücretli pilot teklifi yapılır.
- Üçten az sinyal varsa önce teklif, hedef segment veya fayda anlatımı değiştirilir.

## Ölçüm

FormSubmit kaydındaki `paid_alert_interest`, `campaign_source` ve `campaign_id`
alanları birlikte değerlendirilir. Böylece yalnızca fiyat niyeti değil, hangi
kampanya mesajının nitelikli talep getirdiği görülür.

