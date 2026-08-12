const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function setupSlider(slider) {
  const track = slider.querySelector('.slides');
  const slides = [...slider.querySelectorAll('.slide')];
  const dotsBox = slider.querySelector('.dots');
  let current = 0;
  let timer;
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button'; dot.className = 'dot'; dot.setAttribute('aria-label', `${index + 1}. slaytı göster`);
    dot.addEventListener('click', () => show(index, true)); dotsBox.appendChild(dot);
  });
  const dots = [...dotsBox.children];
  function show(index, restart = false) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    if (restart) start();
  }
  slider.querySelector('.prev').addEventListener('click', () => show(current - 1, true));
  slider.querySelector('.next').addEventListener('click', () => show(current + 1, true));
  function start() {
    clearInterval(timer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => show(current + 1), Number(slider.dataset.autoplay || 7000));
  }
  slider.addEventListener('mouseenter', () => clearInterval(timer)); slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', () => clearInterval(timer)); slider.addEventListener('focusout', start);
  show(0); start();
}
document.querySelectorAll('[data-slider]').forEach(setupSlider);

function daysLeft(deadline) { return deadline ? Math.ceil((new Date(deadline) - new Date()) / 86400000) : null; }
function renderCard(item) {
  const days = daysLeft(item.deadline);
  const timing = days === null ? 'Dönemsel olarak kontrol ediliyor' : days >= 0 ? `${days} gün kaldı` : 'Başvuru dönemi kapandı';
  const tags = item.tags.map(tag => `<span class="tag">${escapeHtml(tag.replaceAll('-', ' '))}</span>`).join('');
  return `<article class="opportunity"><div class="opportunity-top"><span class="org">${escapeHtml(item.organization)}</span><span class="timing">${timing}</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><details><summary>Bana uygun mu, ilk ne yapmalıyım?</summary><p><strong>Kimler için:</strong> ${escapeHtml(item.who_is_it_for)}</p><p><strong>İlk adım:</strong> ${escapeHtml(item.first_step)}</p></details><div class="tags">${tags}</div><a class="source" href="${encodeURI(item.source_url)}" target="_blank" rel="noopener">Resmî duyuruyu aç →</a></article>`;
}
fetch('data/opportunities.json').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => { const open = data.opportunities.filter(i => i.status === 'open' || i.status === 'evergreen'); document.querySelector('#opportunities').innerHTML = open.map(renderCard).join(''); document.querySelector('#updated').textContent = `Son kontrol: ${new Date(data.updated_at).toLocaleDateString('tr-TR')}`; }).catch(() => { document.querySelector('#opportunities').innerHTML = '<p>Fırsat listesi kısa süre içinde yeniden yüklenecek.</p>'; });

fetch('config/site.json').then(r => r.json()).then(config => {
  const form = document.querySelector('#signup-form'); const button = form.querySelector('button'); const status = document.querySelector('#form-status');
  if (!config.contact_email) { status.textContent = 'Kayıtlar henüz açılmadı.'; return; }
  button.disabled = false;
  form.addEventListener('submit', async event => { event.preventDefault(); button.disabled = true; status.textContent = 'Kaydınız gönderiliyor…'; try { const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(config.contact_email)}`, {method:'POST',body:new FormData(form),headers:{Accept:'application/json'}}); if (!response.ok) throw new Error(); form.reset(); status.textContent = 'Kaydınız alındı. Hoş geldiniz!'; } catch { status.innerHTML = `Şu anda gönderilemedi. <a href="mailto:${encodeURIComponent(config.contact_email)}">Bize e-posta gönderin.</a>`; } finally { button.disabled = false; } });
});
