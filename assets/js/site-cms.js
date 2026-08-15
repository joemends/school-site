/* ViviChild Academy — Supabase-powered public site layer */
(function () {
  const cfg = window.SUPABASE_CONFIG || {};
  const valid = cfg.url && cfg.anonKey &&
    !cfg.url.includes('YOUR_') && !cfg.anonKey.includes('YOUR_');
  window.VC = window.VC || {};
  if (!valid || !window.supabase) {
    window.VC.ready = Promise.resolve(null);
    return;
  }
  const client = window.supabase.createClient(cfg.url, cfg.anonKey);
  window.VC.supabase = client;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function applySettings(settings) {
    if (!settings) return;
    const root = document.documentElement;
    const css = settings.colors || {};
    Object.entries({
      '--leaf': css.primary,
      '--leaf-dark': css.primaryDark,
      '--sun': css.accent,
      '--ink': css.ink,
      '--ink-soft': css.muted,
      '--cream': css.background,
      '--card': css.card
    }).forEach(([k,v]) => { if (v) root.style.setProperty(k,v); });
    if (settings.fonts?.heading) root.style.setProperty('--font-heading', settings.fonts.heading);
    if (settings.fonts?.body) root.style.setProperty('--font-body', settings.fonts.body);
    document.body.classList.add('theme-' + (settings.theme || 'forest'));
    document.body.classList.add('layout-' + (settings.layout || 'classic'));
    document.body.classList.add('header-' + (settings.headerStyle || 'solid'));
    root.style.setProperty('--radius', settings.radius || '16px');

    const name = settings.schoolName || 'ViviChild Academy';
    const phone = settings.phone || '';
    const address = settings.address || '';
    const email = settings.email || '';
    // Replace the most common hard-coded identity values so existing pages
    // become editable even where older markup did not have data-* attributes.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(n => {
      if (n.parentElement && ['SCRIPT','STYLE'].includes(n.parentElement.tagName)) return;
      n.nodeValue = n.nodeValue
        .replace(/ViviChild Academy/g, name)
        .replace(/\+233\s*59\s*475\s*2241/g, phone || '+233 59 475 2241')
        .replace(/Gbawe, Weija-Gbawe Municipal, Greater Accra, Ghana/g, address || 'Gbawe, Weija-Gbawe Municipal, Greater Accra, Ghana');
    });
    if (phone) document.querySelectorAll('a[href^="tel:"]').forEach(a => a.href='tel:'+phone.replace(/\s+/g,''));
    const siteUrl = settings.siteUrl || location.origin;

    document.querySelectorAll('[data-site-name]').forEach(el => el.textContent = name);
    document.querySelectorAll('[data-site-phone]').forEach(el => {
      el.textContent = phone;
      if (el.tagName === 'A') el.href = phone ? 'tel:' + phone.replace(/\s+/g,'') : '#';
    });
    document.querySelectorAll('[data-site-email]').forEach(el => {
      el.textContent = email;
      if (el.tagName === 'A') el.href = email ? 'mailto:' + email : '#';
    });
    document.querySelectorAll('[data-site-address]').forEach(el => el.textContent = address);
    document.querySelectorAll('[data-site-logo]').forEach(el => {
      if (settings.logoUrl) {
        el.innerHTML = '<img src="' + esc(settings.logoUrl) + '" alt="' + esc(name) + ' logo" style="max-height:52px;max-width:210px;object-fit:contain;">';
      } else { /* keep the designed text/SVG logo when no custom logo is supplied */ }
    });
    if (settings.faviconUrl) {
      let f = document.querySelector('link[rel="icon"]');
      if (!f) { f=document.createElement('link'); f.rel='icon'; document.head.appendChild(f); }
      f.href = settings.faviconUrl;
    }
    document.title = document.title.replace(/ViviChild Academy/g, name);
    document.querySelectorAll('meta[name="description"],meta[property="og:site_name"]').forEach(m => {
      if (m.name === 'description' && settings.seoDescription) m.content = settings.seoDescription;
      if (m.getAttribute('property') === 'og:site_name') m.content = name;
    });
    if (settings.social?.facebook) document.querySelectorAll('[data-social="facebook"]').forEach(a=>a.href=settings.social.facebook);
    if (settings.social?.instagram) document.querySelectorAll('[data-social="instagram"]').forEach(a=>a.href=settings.social.instagram);
    if (settings.social?.tiktok) document.querySelectorAll('[data-social="tiktok"]').forEach(a=>a.href=settings.social.tiktok);
    if (settings.social?.whatsapp) document.querySelectorAll('[data-social="whatsapp"]').forEach(a=>a.href=settings.social.whatsapp);

    const content = settings.content || {};
    const map = {
      homeHeroTitle: '.hero .hero-copy h1',
      homeHeroText: '.hero .hero-copy p',
      homeWelcomeTitle: '#welcome h2',
      homeWhyTitle: '#why h2',
      homeAcademicsTitle: '#academics h2',
      homeAdmissionsTitle: '.admissions h2',
      homeStudentLifeTitle: '#student-life h2',
      homeGalleryTitle: '#gallery h2',
      homeNewsTitle: '#news h2',
      homeCtaTitle: '#final-cta h2',
      aboutWelcomeTitle: '#about h2',
      aboutStoryTitle: '#story h2',
      academicsTitle: '#academics h1, #academics h2',
      admissionsTitle: '#admissions h2',
      studentLifeTitle: '#student-life h2',
      galleryTitle: '#gallery h1, #gallery h2',
      newsTitle: '#news h1, #news h2',
      contactTitle: '#contact h2'
    };
    Object.entries(map).forEach(([key, selector]) => {
      if (!content[key]) return;
      const el = document.querySelector(selector);
      if (el) el.textContent = content[key];
    });

    if (settings.heroImageUrl) {
      document.querySelectorAll('.hero').forEach(el => {
        el.style.setProperty('--cms-hero-image', "url('" + settings.heroImageUrl.replace(/'/g, "\\'") + "')");
      });
    }
    if (settings.footerText) {
      document.querySelectorAll('footer p, [data-footer-text]').forEach(el => el.textContent = settings.footerText);
    }
  }

  async function load() {
    try {
      const { data, error } = await client.from('site_settings').select('settings').eq('id',1).maybeSingle();
      if (error) throw error;
      window.VC.settings = data?.settings || {};
      applySettings(window.VC.settings);
    } catch (e) {
      console.warn('Supabase site settings unavailable:', e.message);
    }
  }

  async function submitEnquiry(form) {
    const fd = new FormData(form);
    const payload = {
      name: fd.get('pname') || '',
      phone: fd.get('pphone') || '',
      email: fd.get('pemail') || '',
      child_age: fd.get('cage') || '',
      programme: fd.get('pprog') || '',
      message: fd.get('pmsg') || '',
      source_page: location.pathname
    };
    const { error } = await client.from('enquiries').insert(payload);
    if (error) throw error;
    return payload;
  }

  function wireForms() {
    document.querySelectorAll('form#enquiryForm').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        const success = form.querySelector('#formSuccess');
        const original = button?.textContent;
        if (button) { button.disabled = true; button.textContent = 'Sending…'; }
        try {
          await submitEnquiry(form);
          if (success) success.style.display='block';
          form.reset();
        } catch (err) {
          console.error(err);
          alert('We could not submit the enquiry right now. Please call or WhatsApp the school.');
        } finally {
          if (button) { button.disabled = false; button.textContent = original || 'Submit Enquiry'; }
        }
      });
    });
  }


  async function loadArticlesAndReviews() {
    if (!client) return;
    try {
      const [{data:articles,error:aErr},{data:reviews,error:rErr}] = await Promise.all([
        client.from('articles').select('*').eq('status','Published').order('date',{ascending:false}),
        client.from('reviews').select('*').eq('status','Published').order('created_at',{ascending:false})
      ]);
      if (aErr) throw aErr;
      window.VC.articles = articles || [];
      const grid = document.getElementById('newsGrid');
      if (grid && window.VC.articles.length) {
        const fmt = d => { const x=new Date(d); return isNaN(x)?(d||''):x.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); };
        grid.innerHTML = window.VC.articles.map((a,i) => {
          const image = a.image_url || '';
          return '<article class="news-card '+(i===0?'featured':'')+'">'+
            (image?'<div class="ph"><img src="'+esc(image)+'" alt="'+esc(a.alt||'Featured image')+'"></div>':'<div class="ph"><span class="ph-tag">Featured image</span></div>')+
            '<div class="news-body"><span class="news-cat">'+esc(a.category||'School News')+'</span>'+
            '<a href="news-article.html?slug='+encodeURIComponent(a.slug)+'" style="text-decoration:none;color:inherit"><h3>'+esc(a.title)+'</h3></a>'+
            '<span class="news-date">'+fmt(a.date)+'</span><p class="news-excerpt">'+esc(a.excerpt||'')+'</p>'+
            '<a href="news-article.html?slug='+encodeURIComponent(a.slug)+'" class="news-read">Read More →</a></div></article>';
        }).join('');
      }
      const wrap=document.getElementById('testimonialsWrap');
      if (wrap && !rErr && (reviews||[]).length) {
        wrap.innerHTML='<div class="card-grid">'+(reviews||[]).map(r=>'<div class="feature-card reveal"><p style="font-style:italic;color:var(--ink-soft);font-size:15px;">&ldquo;'+esc(r.quote)+'&rdquo;</p><h3 style="font-size:15.5px;margin-bottom:2px;">'+esc(r.name||'Parent')+'</h3>'+(r.relation?'<p style="font-size:13px;color:var(--ink-soft);margin:0;">'+esc(r.relation)+'</p>':'')+'</div>').join('')+'</div>';
      }
      const params=new URLSearchParams(location.search), slug=params.get('slug'), pageTitle=document.getElementById('pageTitle');
      if (slug && window.VC.articles.length && pageTitle) {
        const a=window.VC.articles.find(x=>x.slug===slug);
        if (a) {
          const title=a.seotitle||a.title;
          document.title=title+' | '+(window.VC.settings?.schoolName||'ViviChild Academy');
          pageTitle.textContent=document.title;
          const desc=document.getElementById('pageDesc'); if(desc) desc.setAttribute('content',a.metadesc||a.excerpt||'');
          const h=document.getElementById('articleTitle'); if(h) h.textContent=a.title; const cat=document.getElementById('articleCategory'); if(cat) cat.textContent=a.category||'School News'; const dt=document.getElementById('articleDate'); if(dt) dt.textContent=a.date||'';
          const ex=document.getElementById('articleAlt'); if(ex) ex.textContent=a.excerpt||'';
          const body=document.getElementById('articleContent'); if(body) body.innerHTML=(Array.isArray(a.content)?a.content:[a.content||'']).filter(Boolean).map(p=>'<p>'+esc(p)+'</p>').join('');
          const img=document.getElementById('articleHero'); if(img&&a.image_url){img.src=a.image_url;img.alt=a.alt||a.title;img.style.display='block'}
        }
      }
    } catch(e) { console.warn('Supabase articles/reviews unavailable:', e.message); }
  }

  async function loadMedia() {
    try {
      const { data, error } = await client.from('media').select('*').eq('status','Published').order('created_at',{ascending:false});
      if (error) throw error;
      window.VC.media = data || [];
      const gallery = window.VC.media.filter(x=>x.type==='gallery');
      const student = window.VC.media.filter(x=>x.type==='student-life');
      const render = (selector, items) => {
        const box = document.querySelector(selector);
        if (!box || !items.length) return;
        box.innerHTML = items.slice(0, Number(box.dataset.limit || 8)).map(x =>
          '<article class="m-item reveal media-card"><div class="ph" style="height:240px;overflow:hidden;padding:0;position:relative;">' +
          '<img src="' + esc(x.url) + '" alt="' + esc(x.alt || x.title || 'School photo') + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">' +
          '<span class="ph-tag" style="left:14px;bottom:14px;">' + esc(x.title || 'School Life') + '</span></div></article>'
        ).join('');
        if (window.setupScrollReveal) window.setupScrollReveal();
      };
      render('[data-gallery]', gallery);
      render('[data-student-life]', student);
      render('[data-student-life-gallery]', student);
      render('[data-home-gallery]', gallery);
      render('[data-home-student-life]', student);
    } catch(e) { console.warn('Media unavailable:', e.message); }
  }

  const domReady = document.readyState === 'loading' ? new Promise(r=>document.addEventListener('DOMContentLoaded',r,{once:true})) : Promise.resolve();
  window.VC.ready = domReady.then(() => Promise.all([load(), loadMedia(), loadArticlesAndReviews()])).then(() => { wireForms(); return window.VC; });
})();
