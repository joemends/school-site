const ENQUIRY_EMAIL_ADDRESS = 'joemends217@gmial.com';
const ENQUIRY_EMAIL_ENDPOINT = `https://formsubmit.co/${encodeURIComponent(ENQUIRY_EMAIL_ADDRESS)}`;

function buildEnquiryEmailBody(entry) {
  return [
    `Parent/Guardian Name: ${entry.name}`,
    `Phone Number: ${entry.phone}`,
    `Email: ${entry.email}`,
    `Child's Age: ${entry.childAge}`,
    `Programme / Class: ${entry.programme}`,
    '',
    'Message:',
    entry.message,
    '',
    `Submitted: ${entry.date}`
  ].join('\n');
}

async function sendEnquiryByEmail(entry, formData) {
  const subject = `New school enquiry from ${entry.name || 'website visitor'}`;
  const body = buildEnquiryEmailBody(entry);
  const mailtoLink = `mailto:${ENQUIRY_EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  try {
    const payload = new FormData();
    for (const [key, value] of formData.entries()) payload.append(key, value);
    payload.append('_subject', subject);
    payload.append('_captcha', 'false');
    payload.append('_template', 'table');
    payload.append('_next', window.location.href.split('#')[0] + '?sent=1');

    const response = await fetch(ENQUIRY_EMAIL_ENDPOINT, {
      method: 'POST',
      body: payload,
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error(`Email service response ${response.status}`);
    return true;
  } catch (err) {
    console.warn('Online email submission failed. Opening the visitor email client instead.', err);
    window.location.href = mailtoLink;
    return false;
  }
}

function setupMobileNav() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburgerBtn || !mobileNav) return;
  hamburgerBtn.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }));
}

function setupScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
}

function setupGalleryFilter() {
  const filterBtns = Array.from(document.querySelectorAll('.gallery-filters button'));
  const items = Array.from(document.querySelectorAll('.masonry .m-item'));
  if (!filterBtns.length || !items.length) return;
  const applyFilter = filter => {
    const normalized = filter.trim().toLowerCase();
    items.forEach(item => {
      const category = (item.dataset.category || item.querySelector('.ph-tag')?.alt || item.querySelector('.ph-tag')?.textContent || '').trim().toLowerCase();
      item.style.display = normalized === 'all' || category === normalized ? '' : 'none';
    });
  };
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.toggle('active', b === btn));
    applyFilter(btn.textContent);
  }));
}

function setupEnquiryForm() {
  if (window.VC && window.VC.supabase) return;
  const form = document.getElementById('enquiryForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    if (submit) { submit.disabled = true; submit.dataset.originalText = submit.textContent; submit.textContent = 'Sending…'; }

    const formData = new FormData(form);
    const entry = {
      name: formData.get('pname') || '',
      phone: formData.get('pphone') || '',
      email: formData.get('pemail') || '',
      childAge: formData.get('cage') || '',
      programme: formData.get('pprog') || '',
      message: formData.get('pmsg') || '',
      date: new Date().toISOString()
    };

    const sent = await sendEnquiryByEmail(entry, formData);
    if (sent) {
      success.style.display = 'block';
      form.reset();
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (submit) { submit.disabled = false; submit.textContent = submit.dataset.originalText || 'Send'; }
  });
}

function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text; textarea.style.position = 'fixed'; textarea.style.left = '-9999px';
    document.body.appendChild(textarea); textarea.select();
    try { document.execCommand('copy'); resolve(); } catch (err) { reject(err); }
    finally { document.body.removeChild(textarea); }
  });
}

function setupShareButtons() {
  const shareRow = document.querySelector('.share-row');
  if (!shareRow) return;
  const url = window.location.href, title = document.title;
  shareRow.querySelectorAll('a[data-share]').forEach(link => {
    link.addEventListener('click', async event => {
      event.preventDefault();
      const type = link.dataset.share;
      if (type === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener');
      if (type === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank', 'noopener');
      if (type === 'copy') {
        try { await copyTextToClipboard(url); const old = link.textContent; link.textContent = 'Link Copied'; setTimeout(() => link.textContent = old, 2000); }
        catch (err) { console.error('Failed to copy link:', err); }
      }
    });
  });
}

function setupSite() {
  setupMobileNav(); setupScrollReveal(); setupGalleryFilter(); setupEnquiryForm(); setupShareButtons();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupSite);
else setupSite();
