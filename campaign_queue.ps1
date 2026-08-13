# Fırsat inceleme ve yayınlama prosedürü

Otomatik tarayıcı yalnızca aday bağlantı üretir. Bir kayıt aşağıdaki kontroller
tamamlanmadan `data/opportunities.json` dosyasına eklenmez.

## Zorunlu kontroller

1. Bağlantı ilgili kurumun resmî alan adında ve HTTPS olmalı.
2. Duyuru halen yürürlükte olmalı; eski veya mülga mevzuat canlı fırsat olarak
   yayımlanmamalı.
3. Son başvuru tarihi ve saat dilimi birincil kaynaktan doğrulanmalı.
4. Uygunluk özeti kesin vaat içermemeli; belirsizlik resmi belgeye yönlendirilmeli.
5. `checked_at` gerçek kontrol günü olmalı.
6. Harcama öncesi onay gibi kritik koşullar `first_step` alanına yazılmalı.

## Güven seviyeleri

- `high`: Birincil kurum sayfası veya güncel çağrı belgesi açıkça doğruluyor.
- `medium`: Kurum sayfası var fakat önemli ayrıntı ek belgeye bağlı.
- `low`: Yayımlanmaz; inceleme kuyruğunda kalır.

## Hata halinde

- Bir kaynak erişilemiyorsa mevcut kayıt otomatik güncellenmez veya silinmez.
- Kaynak iki kontrol boyunca erişilemiyorsa bültende “yeniden doğrulanıyor” notu
  kullanılır.
- Yanlış kayıt fark edilirse yayından kaldırılır, etkilenen abonelere düzeltme
  gönderilir ve olay `operations/incidents.csv` dosyasına yazılır.
