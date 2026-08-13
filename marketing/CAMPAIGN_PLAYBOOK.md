# DestekSinyali — ilk talep doğrulama kampanyası

## Amaç

İlk kampanyanın amacı yüksek gönderim sayısı değil, şu üç soruyu kanıtlamaktır:

1. İşletmeler destekleri takip etmekte gerçekten zorlanıyor mu?
2. Kısa ve kaynaklı bir haftalık özet istiyorlar mı?
3. Şirketlerine özel anlık bildirim için ödeme düşünürler mi?

## İlk hedef profil

- Türkiye'de faaliyet gösteren küçük yazılım, SaaS veya dijital hizmet şirketi,
- açık bir şirket sitesi ve doğrulanabilir faaliyet alanı,
- kurucu, iş geliştirme, satış veya ihracat sorumlusu,
- Ar-Ge, ihracat, yapay zekâ ya da yurt dışı büyüme ihtimali.

Bu yalnızca ilk doğrulama segmentidir; ürünün kalıcı sınırı değildir.

## Kanal sırası

1. Kamuya açık kurumsal e-posta varsa kişisel ve tekil e-posta.
2. Kurucu/iş geliştirme kişisi belliyse kişisel LinkedIn mesajı.
3. Yalnızca iletişim formu varsa form; otomatik/toplu gönderim yok.

Satın alınmış liste, kazınmış kişisel adres ve toplu gönderim kullanılmaz.

## Gönderim temposu

- İlk gün en fazla 3 yeni temas.
- Sonraki günler, cevap kalitesine göre en fazla 5 yeni temas.
- Cevap yoksa 4 gün sonra yalnızca bir hatırlatma.
- İkinci yanıtsız mesajdan sonra kişi kapatılır.
- Olumsuz cevap veren veya iletişim istemeyen kişi tekrar aranmaz.

## Mesaj ilkeleri

- İlk mesaj 90 kelimenin altında kalır.
- Şirket hakkında yalnızca resmî sitesinde görülen tek bir gerçek kullanılır.
- “Destek kazandırıyoruz” veya “başvurunuzu yapıyoruz” denmez.
- Görüşme talebi 12 dakika ve dört soru olarak açıkça belirtilir.
- Bağlantı yalnızca canlı site son kontrolden geçtiyse eklenir.

## Başarı eşiği

20 doğru temastan sonra: en az 5 anlamlı cevap, 5 problem görüşmesi, 10 ücretsiz
özet kaydı ve 3 kişisel alarm ödeme niyeti aranır. Bu sinyaller oluşmadan ücretli
altyapı veya reklam bütçesi açılmaz.

## Günlük çalışma

```powershell
powershell -ExecutionPolicy Bypass -File scripts/campaign_queue.ps1
```

Durumlar: `research`, `ready`, `sent`, `replied`, `interviewed`, `followed_up`,
`closed`, `do_not_contact`.

