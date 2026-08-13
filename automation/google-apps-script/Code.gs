/**
 * DestekSinyali free Gmail automation.
 * Run setupDestekSinyali() once from the Apps Script editor.
 */

const DS = Object.freeze({
  spreadsheetProperty: 'DESTEK_SINYALI_SHEET_ID',
  subscribersSheet: 'Subscribers',
  logSheet: 'Logs',
  processedLabel: 'DestekSinyali/Islendi',
  registrationSubject: 'Yeni DestekSinyali erken erişim kaydı',
  opportunitiesUrl: 'https://raw.githubusercontent.com/akifemir81/desteksinyali/main/data/opportunities.json',
  siteUrl: 'https://akifemir81.github.io/desteksinyali/',
  contactEmail: 'desteksinyali@gmail.com',
  senderName: 'DestekSinyali',
  maxRegistrationsPerRun: 25,
  maxDigestRecipientsPerRun: 80
});

const SUBSCRIBER_HEADERS = Object.freeze([
  'email', 'company', 'export_status', 'paid_alert_interest',
  'campaign_source', 'campaign_id', 'status', 'registered_at',
  'welcome_sent_at', 'last_digest_at', 'unsubscribed_at'
]);

function setupDestekSinyali() {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = props.getProperty(DS.spreadsheetProperty);
  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create('DestekSinyali Aboneleri');
    spreadsheetId = spreadsheet.getId();
    props.setProperty(DS.spreadsheetProperty, spreadsheetId);
  }

  ensureSheet_(spreadsheet, DS.subscribersSheet, SUBSCRIBER_HEADERS);
  ensureSheet_(spreadsheet, DS.logSheet, ['timestamp', 'level', 'event', 'detail']);
  GmailApp.getUserLabelByName(DS.processedLabel) || GmailApp.createLabel(DS.processedLabel);
  replaceTriggers_();
  log_('INFO', 'setup_complete', spreadsheet.getUrl());

  return {
    spreadsheetUrl: spreadsheet.getUrl(),
    triggers: ScriptApp.getProjectTriggers().map(function(trigger) {
      return trigger.getHandlerFunction();
    })
  };
}

function processRegistrationEmails() {
  return withLock_(function() {
    const label = GmailApp.getUserLabelByName(DS.processedLabel) || GmailApp.createLabel(DS.processedLabel);
    const query = 'from:submissions@formsubmit.co subject:"' + DS.registrationSubject + '" -label:"' + DS.processedLabel + '" newer_than:30d';
    const threads = GmailApp.search(query, 0, DS.maxRegistrationsPerRun);
    let added = 0;
    let skipped = 0;

    threads.forEach(function(thread) {
      const messages = thread.getMessages();
      const message = messages[messages.length - 1];
      try {
        const fields = parseFormSubmitBody_(message.getPlainBody());
        if (!isValidEmail_(fields.email) || String(fields.consent).toLowerCase() !== 'yes') {
          skipped += 1;
          log_('WARN', 'registration_skipped', 'Missing valid email or consent');
          thread.addLabel(label);
          return;
        }

        const result = upsertSubscriber_(fields, message.getDate());
        if (result.created) {
          sendWelcomeEmail_(fields.email, fields.company || '');
          markWelcomeSent_(fields.email);
          added += 1;
        } else {
          skipped += 1;
        }
        thread.addLabel(label);
      } catch (error) {
        log_('ERROR', 'registration_failed', safeError_(error));
      }
    });

    log_('INFO', 'registration_run', 'added=' + added + ', skipped=' + skipped + ', threads=' + threads.length);
    return {added: added, skipped: skipped, scanned: threads.length};
  });
}

function processUnsubscribeEmails() {
  return withLock_(function() {
    const query = 'to:' + DS.contactEmail + ' subject:"ABONELIKTEN CIK" newer_than:30d';
    const threads = GmailApp.search(query, 0, 50);
    let removed = 0;

    threads.forEach(function(thread) {
      const message = thread.getMessages()[0];
      const sender = extractEmail_(message.getFrom());
      if (sender && unsubscribe_(sender)) removed += 1;
    });

    log_('INFO', 'unsubscribe_run', 'removed=' + removed);
    return {removed: removed};
  });
}

function sendWeeklyDigest() {
  return withLock_(function() {
    const opportunities = fetchActiveOpportunities_();
    if (!opportunities.length) {
      log_('WARN', 'digest_skipped', 'No active opportunities');
      return {sent: 0, reason: 'no_active_opportunities'};
    }

    const sheet = getSpreadsheet_().getSheetByName(DS.subscribersSheet);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const index = headerIndex_(headers);
    const digestKey = Utilities.formatDate(new Date(), 'Europe/Istanbul', "YYYY-'W'ww");
    const remainingQuota = MailApp.getRemainingDailyQuota();
    const sendLimit = Math.min(DS.maxDigestRecipientsPerRun, Math.max(0, remainingQuota - 5));
    let sent = 0;

    for (let row = 1; row < data.length && sent < sendLimit; row += 1) {
      const values = data[row];
      if (values[index.status] !== 'active') continue;
      if (String(values[index.last_digest_at]).indexOf(digestKey) === 0) continue;

      const email = String(values[index.email]).trim();
      if (!isValidEmail_(email)) continue;

      const message = buildDigest_(opportunities, email);
      MailApp.sendEmail({
        to: email,
        subject: message.subject,
        body: message.text,
        htmlBody: message.html,
        name: DS.senderName,
        replyTo: DS.contactEmail
      });
      sheet.getRange(row + 1, index.last_digest_at + 1).setValue(digestKey + ' ' + new Date().toISOString());
      sent += 1;
    }

    log_('INFO', 'digest_run', 'sent=' + sent + ', active_opportunities=' + opportunities.length + ', quota_before=' + remainingQuota);
    return {sent: sent, activeOpportunities: opportunities.length, quotaBefore: remainingQuota};
  });
}

function runSelfTest() {
  const sample = [
    'email:',
    'test@example.com',
    'company:',
    'Örnek Yazılım',
    'export_status:',
    'Henüz değil',
    'paid_alert_interest:',
    'pilot_249_yes',
    'campaign_source:',
    'outreach',
    'campaign_id:',
    'DS-005',
    'consent:',
    'yes'
  ].join('\n');
  const parsed = parseFormSubmitBody_(sample);
  if (parsed.email !== 'test@example.com') throw new Error('Email parser failed');
  if (parsed.campaign_id !== 'DS-005') throw new Error('Campaign parser failed');
  if (parsed.paid_alert_interest !== 'pilot_249_yes') throw new Error('Pricing parser failed');
  if (!isValidEmail_(parsed.email)) throw new Error('Email validation failed');
  return {ok: true, parsed: parsed};
}

function parseFormSubmitBody_(body) {
  const normalized = String(body || '').replace(/\r/g, '');
  const lines = normalized.split('\n');
  const result = {};
  const allowed = {
    email: true,
    company: true,
    export_status: true,
    paid_alert_interest: true,
    campaign_source: true,
    campaign_id: true,
    landing_variant: true,
    consent: true
  };

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].trim().match(/^([a-z_]+):$/i);
    if (!match) continue;
    const key = match[1].toLowerCase();
    if (!allowed[key]) continue;
    let value = '';
    for (let j = i + 1; j < lines.length; j += 1) {
      const candidate = lines[j].trim();
      if (candidate) {
        value = candidate;
        break;
      }
    }
    result[key] = sanitizeCell_(value);
  }
  return result;
}

function upsertSubscriber_(fields, registeredAt) {
  const sheet = getSpreadsheet_().getSheetByName(DS.subscribersSheet);
  const data = sheet.getDataRange().getValues();
  const index = headerIndex_(data[0]);
  const email = String(fields.email).trim().toLowerCase();

  for (let row = 1; row < data.length; row += 1) {
    if (String(data[row][index.email]).trim().toLowerCase() === email) {
      if (data[row][index.status] === 'unsubscribed') return {created: false, reason: 'unsubscribed'};
      return {created: false, reason: 'duplicate'};
    }
  }

  sheet.appendRow([
    email,
    sanitizeCell_(fields.company || ''),
    sanitizeCell_(fields.export_status || ''),
    sanitizeCell_(fields.paid_alert_interest || ''),
    sanitizeCell_(fields.campaign_source || 'direct'),
    sanitizeCell_(fields.campaign_id || ''),
    'active',
    registeredAt || new Date(),
    '',
    '',
    ''
  ]);
  return {created: true};
}

function markWelcomeSent_(email) {
  const sheet = getSpreadsheet_().getSheetByName(DS.subscribersSheet);
  const data = sheet.getDataRange().getValues();
  const index = headerIndex_(data[0]);
  for (let row = 1; row < data.length; row += 1) {
    if (String(data[row][index.email]).trim().toLowerCase() === String(email).trim().toLowerCase()) {
      sheet.getRange(row + 1, index.welcome_sent_at + 1).setValue(new Date());
      return;
    }
  }
}

function unsubscribe_(email) {
  const sheet = getSpreadsheet_().getSheetByName(DS.subscribersSheet);
  const data = sheet.getDataRange().getValues();
  const index = headerIndex_(data[0]);
  const normalized = String(email).trim().toLowerCase();
  for (let row = 1; row < data.length; row += 1) {
    if (String(data[row][index.email]).trim().toLowerCase() === normalized && data[row][index.status] === 'active') {
      sheet.getRange(row + 1, index.status + 1).setValue('unsubscribed');
      sheet.getRange(row + 1, index.unsubscribed_at + 1).setValue(new Date());
      return true;
    }
  }
  return false;
}

function sendWelcomeEmail_(email, company) {
  const companyLine = company ? '<p><strong>' + escapeHtml_(company) + '</strong> için uygun fırsatları daha iyi eşleştirebilmek üzere kayıt bilgilerinizi aldık.</p>' : '';
  const unsubscribe = unsubscribeMailto_(email);
  const html = '<div style="font-family:Arial,sans-serif;max-width:620px;color:#0c2238;line-height:1.6">' +
    '<h1 style="font-size:28px">DestekSinyali’ne hoş geldiniz</h1>' +
    '<p>Yeni destekleri kısa, anlaşılır ve resmî kaynak bağlantısıyla paylaşacağız.</p>' + companyLine +
    '<p>İlk haftalık özet pazartesi günü gelecek. Bir sorunuz olduğunda bu e-postayı yanıtlayabilirsiniz.</p>' +
    '<p><a href="' + DS.siteUrl + '">Güncel fırsatları açın</a></p>' +
    '<hr style="border:0;border-top:1px solid #dfe7ef"><p style="font-size:12px;color:#607286">Başvuru danışmanlığı sunmuyoruz. Karar vermeden önce resmî kaynağı kontrol edin. <a href="' + unsubscribe + '">Listeden ayrıl</a></p></div>';
  MailApp.sendEmail({
    to: email,
    subject: 'DestekSinyali’ne hoş geldiniz',
    body: 'DestekSinyali’ne hoş geldiniz. Yeni destekleri kısa ve resmî kaynak bağlantısıyla paylaşacağız. Çıkış: ' + unsubscribe,
    htmlBody: html,
    name: DS.senderName,
    replyTo: DS.contactEmail
  });
}

function fetchActiveOpportunities_() {
  const response = UrlFetchApp.fetch(DS.opportunitiesUrl, {muteHttpExceptions: true});
  if (response.getResponseCode() !== 200) throw new Error('Opportunity feed HTTP ' + response.getResponseCode());
  const payload = JSON.parse(response.getContentText('UTF-8'));
  return (payload.opportunities || []).filter(function(item) {
    return item.status === 'open' || item.status === 'evergreen';
  });
}

function buildDigest_(opportunities, recipientEmail) {
  const date = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'dd.MM.yyyy');
  const cards = opportunities.map(function(item) {
    const deadline = item.deadline ? '<p><strong>Son tarih:</strong> ' + escapeHtml_(String(item.deadline).slice(0, 10)) + '</p>' : '<p><strong>Başvuru:</strong> Dönemsel veya sürekli kontrol ediliyor</p>';
    return '<div style="border:1px solid #dfe7ef;border-radius:12px;padding:18px;margin:16px 0">' +
      '<div style="font-size:12px;color:#1769e0;font-weight:bold">' + escapeHtml_(item.organization) + '</div>' +
      '<h2 style="font-size:20px">' + escapeHtml_(item.title) + '</h2>' +
      '<p>' + escapeHtml_(item.summary) + '</p>' + deadline +
      '<p><strong>Kimler için?</strong> ' + escapeHtml_(item.who_is_it_for) + '</p>' +
      '<p><strong>İlk adım:</strong> ' + escapeHtml_(item.first_step) + '</p>' +
      '<a href="' + encodeURI(item.source_url) + '">Resmî duyuruyu aç →</a></div>';
  }).join('');
  const unsubscribe = unsubscribeMailto_(recipientEmail);
  const html = '<div style="font-family:Arial,sans-serif;max-width:680px;color:#0c2238;line-height:1.55">' +
    '<p style="color:#607286">' + date + '</p><h1>Bu hafta radarda</h1>' +
    '<p>Bu hafta kontrol ettiğimiz aktif fırsatlar aşağıda. Başvurmadan önce resmî kaynağı doğrulayın.</p>' + cards +
    '<p><a href="' + DS.siteUrl + '">DestekSinyali’ni açın</a></p>' +
    '<hr style="border:0;border-top:1px solid #dfe7ef"><p style="font-size:12px;color:#607286">DestekSinyali bağımsız bilgi hizmetidir. <a href="' + unsubscribe + '">Listeden ayrıl</a></p></div>';
  const text = opportunities.map(function(item) {
    return item.title + '\n' + item.summary + '\nResmî kaynak: ' + item.source_url;
  }).join('\n\n---\n\n');
  return {subject: 'DestekSinyali: Bu hafta radarda (' + date + ')', html: html, text: text + '\n\nÇıkış: ' + unsubscribe};
}

function replaceTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) { ScriptApp.deleteTrigger(trigger); });
  ScriptApp.newTrigger('processRegistrationEmails').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('processUnsubscribeEmails').timeBased().everyHours(6).create();
  ScriptApp.newTrigger('sendWeeklyDigest').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(10).create();
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  sheet.setFrozenRows(1);
  return sheet;
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(DS.spreadsheetProperty);
  if (!id) throw new Error('Run setupDestekSinyali first');
  return SpreadsheetApp.openById(id);
}

function log_(level, event, detail) {
  try {
    const sheet = getSpreadsheet_().getSheetByName(DS.logSheet);
    sheet.appendRow([new Date(), level, event, String(detail || '').slice(0, 1000)]);
  } catch (error) {
    console.log(level + ' ' + event + ' ' + detail);
  }
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return callback(); } finally { lock.releaseLock(); }
}

function headerIndex_(headers) {
  const index = {};
  headers.forEach(function(header, i) { index[String(header)] = i; });
  return index;
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function extractEmail_(value) {
  const match = String(value || '').match(/<([^>]+)>/);
  return (match ? match[1] : value).trim().toLowerCase();
}

function sanitizeCell_(value) {
  const clean = String(value || '').trim().slice(0, 500);
  return /^[=+\-@]/.test(clean) ? "'" + clean : clean;
}

function escapeHtml_(value) {
  return String(value || '').replace(/[&<>"']/g, function(character) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];
  });
}

function unsubscribeMailto_(email) {
  return 'mailto:' + DS.contactEmail + '?subject=' + encodeURIComponent('ABONELIKTEN CIK') + '&body=' + encodeURIComponent(String(email).trim().toLowerCase());
}

function safeError_(error) {
  return String(error && error.message ? error.message : error).slice(0, 1000);
}

