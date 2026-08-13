/**
 * DestekSinyali talep doğrulama kampanyası.
 * İlk dalgayı göndermeden önce kullanıcı alıcıları ve metni açıkça onaylamalıdır.
 */

const DS_CAMPAIGN_HEADERS = Object.freeze([
  'campaign_id', 'company', 'recipient', 'status', 'sent_at', 'reply_detected_at', 'notes'
]);

const DS_FIRST_WAVE = Object.freeze([
  {
    id: 'DS-005',
    company: 'DX Türkiye',
    to: 'hello@dxturkiye.com',
    detail: 'SaaS ve dijital dönüşüm odağınız',
    url: 'https://akifemir81.github.io/desteksinyali/?ref=outreach&cid=DS-005'
  },
  {
    id: 'DS-006',
    company: 'Dehasoft',
    to: 'info@dehasoft.com.tr',
    detail: 'B2B e-ticaret ve ERP entegrasyonları geliştirmeniz',
    url: 'https://akifemir81.github.io/desteksinyali/?ref=outreach&cid=DS-006'
  },
  {
    id: 'DS-007',
    company: 'Lime Yazılım',
    to: 'hello@lime.com.tr',
    detail: 'Konya Teknokent’te yazılım ve dijital büyüme çözümleri geliştirmeniz',
    url: 'https://akifemir81.github.io/desteksinyali/?ref=outreach&cid=DS-007'
  }
]);

function previewFirstCampaignWave() {
  return DS_FIRST_WAVE.map(function(target) {
    const message = buildCampaignMessage_(target);
    return {id: target.id, company: target.company, to: target.to, subject: message.subject, body: message.body};
  });
}

function createFirstCampaignDrafts() {
  return withLock_(function() {
    const spreadsheet = getSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet, 'Marketing', DS_CAMPAIGN_HEADERS);
    const existing = campaignRowsById_(sheet);
    let created = 0;
    let skipped = 0;
    DS_FIRST_WAVE.forEach(function(target) {
      const current = existing[target.id];
      if (current && (current.status === 'draft' || current.status === 'sent' || current.status === 'replied')) {
        skipped += 1;
        return;
      }

      const message = buildCampaignMessage_(target);
      GmailApp.createDraft(target.to, message.subject, message.body, {
        name: DS.senderName,
        replyTo: DS.contactEmail
      });
      upsertCampaignRow_(sheet, target, 'draft', '', '', 'Gönderilmedi; hukuki ve kimlik kontrolü bekleniyor');
      created += 1;
    });

    log_('INFO', 'campaign_first_wave_drafts', 'created=' + created + ', skipped=' + skipped);
    return {created: created, skipped: skipped, recipients: DS_FIRST_WAVE.map(function(item) { return item.to; })};
  });
}

function monitorCampaignReplies() {
  return withLock_(function() {
    const sheet = ensureSheet_(getSpreadsheet_(), 'Marketing', DS_CAMPAIGN_HEADERS);
    const rows = campaignRowsById_(sheet);
    let replies = 0;

    DS_FIRST_WAVE.forEach(function(target) {
      const current = rows[target.id];
      if (!current || current.status !== 'sent') return;
      const threads = GmailApp.search('"cid=' + target.id + '" newer_than:30d', 0, 10);
      const hasReply = threads.some(function(thread) {
        return thread.getMessages().some(function(message) {
          return extractEmail_(message.getFrom()) !== DS.contactEmail.toLowerCase();
        });
      });
      if (hasReply) {
        upsertCampaignRow_(sheet, target, 'replied', current.sentAt || '', new Date(), 'Yanıt otomatik algılandı');
        replies += 1;
      }
    });

    log_('INFO', 'campaign_reply_monitor', 'new_replies=' + replies);
    return {newReplies: replies};
  });
}

function buildCampaignMessage_(target) {
  return {
    subject: 'Size uygun destekleri nasıl takip ediyorsunuz?',
    body: [
      'Merhaba,',
      '',
      target.company + ' ekibinde ' + target.detail + ' dikkatimi çekti. Şirketlerin kendilerine uygun kamu desteklerini zamanında bulup bulamadığını araştırıyorum.',
      '',
      'DestekSinyali, uzun kurum duyurularını “bize uygun mu, son gün ne zaman, ilk adım ne?” diye sadeleştiren erken aşama bir ürün. Satış görüşmesi değil; deneyiminizi anlamak için dört kısa soru sormak istiyorum. 12 dakikalık bir görüşme veya kısa bir yazılı yanıt mümkün olur mu?',
      '',
      target.url,
      '',
      'Teşekkürler,',
      'DestekSinyali'
    ].join('\n')
  };
}

function campaignRowsById_(sheet) {
  const data = sheet.getDataRange().getValues();
  const result = {};
  for (let row = 1; row < data.length; row += 1) {
    if (!data[row][0]) continue;
    result[String(data[row][0])] = {row: row + 1, status: String(data[row][3]), sentAt: data[row][4]};
  }
  return result;
}

function upsertCampaignRow_(sheet, target, status, sentAt, replyAt, notes) {
  const existing = campaignRowsById_(sheet)[target.id];
  const values = [target.id, target.company, target.to, status, sentAt || '', replyAt || '', notes || ''];
  if (existing) sheet.getRange(existing.row, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
}
