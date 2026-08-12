const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / 86400000);
}

function renderCard(item) {
  const days = daysLeft(item.deadline);
  const timing = days === null ? 'Sürekli başvuru / dönemsel kontrol' : days >= 0 ? `${days} gün kaldı` : 'Başvuru dönemi kapandı';
  const tags = item.tags.map(tag => `<span class="tag">${escapeHtml(tag.replaceAll('-', ' '))}</span>`).join('');
  return `<article class="opportunity">
    <div class="opportunity-top"><span class="org">${escapeHtml(item.organization)}</span><span class="timing">${timing}</span></div>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.summary)}</p>
    <details><summary>Kimler için ve ilk adım</summary><p><strong>Uygunluk:</strong> ${escapeHtml(item.who_is_it_for)}</p><p><strong>İlk adım:</strong> ${escapeHtml(item.first_step)}</p></details>
    <div class="tags">${tags}</div>
    <a class="source" href="${encodeURI(item.source_url)}" target="_blank" rel="noopener">Resmî kaynağı aç →</a>
  </article>`;
}

fetch('data/opportunities.json')
  .then(response => { if (!response.ok) throw new Error('Veri yüklenemedi'); return response.json(); })
  .then(data => {
    const open = data.opportunities.filter(item => item.status === 'open' || item.status === 'evergreen');
    document.querySelector('#opportunities').innerHTML = open.map(renderCard).join('');
    document.querySelector('#updated').textContent = `Son kontrol: ${new Date(data.updated_at).toLocaleDateString('tr-TR')}`;
  })
  .catch(() => { document.querySelector('#opportunities').innerHTML = '<p class="load-note">Fırsat listesi barındırma sonrası burada görünecek.</p>'; });

fetch('config/site.json')
  .then(response => response.json())
  .then(config => {
    const form = document.querySelector('#signup-form');
    const button = form.querySelector('button');
    const status = document.querySelector('#form-status');
    if (!config.contact_email) { status.textContent = 'Kayıtlar henüz açılmadı.'; return; }
    button.disabled = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      button.disabled = true; status.textContent = 'Kaydın gönderiliyor…';
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(config.contact_email)}`, {
          method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('submission_failed');
        form.reset(); status.textContent = 'Kaydın alındı. Hoş geldin!';
      } catch {
        status.innerHTML = `Şu anda gönderilemedi. <a href="mailto:${encodeURIComponent(config.contact_email)}">Bize e-posta gönder.</a>`;
      } finally { button.disabled = false; }
    });
  });
