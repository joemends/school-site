/* ViviChild Academy — Supabase-powered public site layer */
(function () {
  const rawCfg = window.SUPABASE_CONFIG || window.VIVICHILD_SUPABASE || {};
  const normalizedUrl = String(rawCfg.url || '').trim()
    .replace(/\/+$/, '')
    .replace(/\/(rest\/v1|auth\/v1|storage\/v1)(\/.*)?$/i, '');
  const cfg = { url: normalizedUrl, anonKey: String(rawCfg.anonKey || '').trim() };
  const valid = cfg.url && cfg.anonKey &&
    !String(cfg.url).includes('YOUR_') && !String(cfg.anonKey).includes('YOUR_');
  window.VC = window.VC || {};

  if (!valid || !window.supabase) {
    window.VC.ready = Promise.resolve(null);
    window.VC.configError = !valid ? 'Supabase configuration is missing.' : 'Supabase library did not load.';
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });
  window.VC.supabase = client;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate = d => { const x = new Date(d); return isNaN(x) ? (d || '') : x.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); };

  function pathNameIsContact() { return (location.pathname.split('/').pop() || 'index.html') === 'contact.html'; }

  function applySettings(settings) {
    if (!settings) return;
    const root = document.documentElement;
    const css = settings.colors || {};

    // Reset CMS classes so changes take effect immediately on navigation/cache refresh.
    document.body.classList.remove('theme-forest','theme-ocean','theme-royal','theme-warm','theme-modern',
      'layout-classic','layout-split','layout-editorial','layout-minimal','header-solid','header-soft','header-transparent');
    document.body.classList.add('theme-' + (settings.theme || 'forest'));
    document.body.classList.add('layout-' + (settings.layout || 'classic'));
    document.body.classList.add('header-' + (settings.headerStyle || 'solid'));

    Object.entries({
      '--leaf': css.primary, '--leaf-dark': css.primaryDark, '--sun': css.accent,
      '--ink': css.ink, '--ink-soft': css.muted, '--cream': css.background, '--card': css.card,
      '--font-heading': settings.fonts?.heading ? '"' + settings.fonts.heading + '", sans-serif' : null,
      '--font-body': settings.fonts?.body ? '"' + settings.fonts.body + '", sans-serif' : null,
      '--radius': settings.radius || '16px'
    }).forEach(([k,v]) => { if (v) root.style.setProperty(k,v); });

    const name = settings.schoolName || 'ViviChild Academy';
    const phone = settings.phone || '';
    const address = settings.address || '';
    const email = settings.email || '';
    const motto = settings.motto || settings.tagline || '';
    const shortDescription = settings.shortDescription || '';
    const story = settings.story || '';

    // Dedicated CMS fields always win over hard-coded placeholder text.
    document.querySelectorAll('[data-site-name]').forEach(el => el.textContent = name);
    document.querySelectorAll('[data-site-phone]').forEach(el => { el.textContent = phone; if (el.tagName === 'A') el.href = phone ? 'tel:' + phone.replace(/\s+/g,'') : '#'; });
    document.querySelectorAll('[data-site-email]').forEach(el => { el.textContent = email; if (el.tagName === 'A') el.href = email ? 'mailto:' + email : '#'; });
    document.querySelectorAll('[data-site-address]').forEach(el => el.textContent = address);
    if (email && pathNameIsContact()) {
      const contactInfo = document.querySelector('.contact-info');
      if (contactInfo && !contactInfo.querySelector('[data-site-email]')) {
        const row = document.createElement('div'); row.className = 'info-line';
        row.innerHTML = '<div><strong>Email</strong><span data-site-email></span></div>';
        contactInfo.insertBefore(row, contactInfo.querySelector('.hero-cta-row') || null);
      }
    }
    document.querySelectorAll('[data-site-motto]').forEach(el => el.textContent = motto);
    document.querySelectorAll('[data-site-description]').forEach(el => el.textContent = shortDescription);
    document.querySelectorAll('[data-site-story]').forEach(el => el.textContent = story);
    document.querySelectorAll('[data-footer-text]').forEach(el => el.textContent = settings.footerText || shortDescription || motto);

    document.querySelectorAll('[data-site-logo]').forEach(el => {
      if (settings.logoUrl) el.innerHTML = '<img src="' + esc(settings.logoUrl) + '" alt="' + esc(name) + ' logo" style="max-height:52px;max-width:90px;object-fit:contain;margin-right:8px;vertical-align:middle;"><span data-site-name>' + esc(name) + '</span>';
      else el.innerHTML = '<span data-site-name>' + esc(name) + '</span>';
    });

    // Update remaining legacy hard-coded identity/contact text, while excluding scripts/styles.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      if (!n.parentElement || ['SCRIPT','STYLE'].includes(n.parentElement.tagName)) return;
      if (n.parentElement.closest('[data-site-name],[data-site-phone],[data-site-email],[data-site-address],[data-site-motto],[data-site-description],[data-site-story],[data-footer-text],[data-cms-bound]')) return;
      n.nodeValue = n.nodeValue
        .replace(/ViviChild Academy/g, name)
        .replace(/\+233\s*59\s*475\s*2241/g, phone || '+233 59 475 2241')
        .replace(/Gbawe, Weija-Gbawe Municipal, Greater Accra, Ghana/g, address || 'Gbawe, Weija-Gbawe Municipal, Greater Accra, Ghana')
        .replace(/Gbawe, Greater Accra, Ghana/g, address || 'Gbawe, Greater Accra, Ghana');
    });

    if (phone) document.querySelectorAll('a[href^="tel:"]').forEach(a => a.href = 'tel:' + phone.replace(/\s+/g,''));
    if (settings.social?.facebook) document.querySelectorAll('[data-social="facebook"]').forEach(a => a.href = settings.social.facebook);
    if (settings.social?.instagram) document.querySelectorAll('[data-social="instagram"]').forEach(a => a.href = settings.social.instagram);
    if (settings.social?.tiktok) document.querySelectorAll('[data-social="tiktok"]').forEach(a => a.href = settings.social.tiktok);
    if (settings.social?.whatsapp) document.querySelectorAll('[data-social="whatsapp"]').forEach(a => a.href = settings.social.whatsapp);

    if (settings.faviconUrl) {
      let f = document.querySelector('link[rel="icon"]');
      if (!f) { f = document.createElement('link'); f.rel = 'icon'; document.head.appendChild(f); }
      f.href = settings.faviconUrl;
    }
    document.title = document.title.replace(/ViviChild Academy/g, name);
    document.querySelectorAll('meta[name="description"],meta[property="og:site_name"]').forEach(m => {
      if (m.name === 'description' && settings.seoDescription) m.content = settings.seoDescription;
      if (m.getAttribute('property') === 'og:site_name') m.content = name;
    });

    const content = settings.content || {};
    const path = location.pathname.split('/').pop() || 'index.html';
    const setText = (selector, value, allowHtml=false) => {
      if (!value) return;
      document.querySelectorAll(selector).forEach(el => {
        if (el.matches('[data-cms-bound]')) return;
        if (allowHtml) el.innerHTML = value;
        else el.textContent = value;
        el.setAttribute('data-cms-bound','1');
      });
    };

    // Main content fields. These selectors intentionally target the real page structure,
    // not only IDs that may differ between pages.
    const maps = {
      'index.html': {
        homeHeroTitle: ['.hero .hero-copy h1'], homeHeroText: ['.hero .hero-copy p.lead'],
        homeWelcomeTitle: ['section#about h2'], homeWelcomeText: ['section#about .intro-grid > div:last-child p'],
        homeWhyTitle: ['.section-tint .section-head h2'], homeWhyText: ['.section-tint .section-head p'],
        homeNewsTitle: ['section#news .section-head h2'], homeCtaTitle: ['#final-cta h2'], homeCtaText: ['#final-cta p']
      },
      'about.html': {
        aboutWelcomeTitle: ['main .intro-grid h2'], aboutWelcomeText: ['main .intro-grid > div:last-child p'],
        aboutStoryTitle: ['#our-story h2'], aboutStoryText: ['#our-story .story-copy p', '#our-story p']
      },
      'academics.html': { academicsTitle: ['main h1','main h2'], academicsText: ['main .section-head p'] },
      'admissions.html': { admissionsTitle: ['main h1','main h2'], admissionsText: ['main .section-head p'] },
      'student-life.html': { studentLifeTitle: ['main h1','main h2'], studentLifeText: ['main .section-head p'] },
      'gallery.html': { galleryTitle: ['main h1','main h2'], galleryText: ['main .section-head p'] },
      'news.html': { newsTitle: ['main h1','main h2'], newsText: ['main .section-head p'] },
      'contact.html': { contactTitle: ['main h1','main h2'], contactText: ['main .section-head p'] }
    };
    const pageMap = maps[path] || {};
    Object.entries(pageMap).forEach(([key, selectors]) => {
      if (!content[key]) return;
      const selector = selectors.join(',');
      const el = document.querySelector(selector);
      if (el) setText(selector, content[key]);
    });

    if (story) {
      document.querySelectorAll('#our-story .story-copy p, #our-story .story-text, [data-site-story]').forEach(el => {
        if (!el.matches('[data-site-story]')) el.textContent = story;
      });
    }
    if (settings.heroImageUrl) document.querySelectorAll('.hero').forEach(el => el.style.setProperty('--cms-hero-image', "url('" + settings.heroImageUrl.replace(/'/g,"\\'") + "')"));
  }

  async function loadSettings(){
    const {data,error}=await client.from('site_settings').select('settings').eq('id',1).maybeSingle();
    if(error)throw error;
    window.VC.settings=data?.settings||{};
    applySettings(window.VC.settings);
  }

  async function submitEnquiry(form){
    const fd=new FormData(form);
    const payload={name:String(fd.get('pname')||'').trim(),phone:String(fd.get('pphone')||'').trim(),email:String(fd.get('pemail')||'').trim(),child_age:String(fd.get('cage')||'').trim(),programme:String(fd.get('pprog')||'').trim(),message:String(fd.get('pmsg')||'').trim(),source_page:location.pathname};
    const {data,error}=await client.from('enquiries').insert(payload).select('id').single();
    if(error){
      const msg=error.message||'Unknown Supabase error';
      console.error('Supabase enquiry error:',error);
      throw new Error(msg+' ['+(error.code||'no-code')+']');
    }
    return data;
  }

  function wireForms(){
    document.querySelectorAll('form#enquiryForm').forEach(form=>{
      if(form.dataset.supabaseWired==='1')return;
      form.dataset.supabaseWired='1';
      form.addEventListener('submit',async e=>{
        e.preventDefault();
        const button=form.querySelector('button[type="submit"]'),success=form.querySelector('#formSuccess'),errorBox=form.querySelector('#formError');
        const original=button?.textContent;
        if(button){button.disabled=true;button.textContent='Sending…';}
        if(errorBox)errorBox.style.display='none';
        try{await submitEnquiry(form);if(success)success.style.display='block';form.reset();}
        catch(err){console.error(err);if(errorBox){errorBox.textContent='We could not submit the enquiry right now. Please try again or call/WhatsApp the school. Error: '+err.message;errorBox.style.display='block';}else alert('We could not submit the enquiry right now. Please call or WhatsApp the school.\n\n'+err.message);}
        finally{if(button){button.disabled=false;button.textContent=original||'Submit Enquiry';}}
      });
    });
  }

  async function loadArticlesAndReviews(){
    const [{data:articles,error:aErr},{data:reviews,error:rErr}]=await Promise.all([
      client.from('articles').select('*').eq('status','Published').order('date',{ascending:false}),
      client.from('reviews').select('*').eq('status','Published').order('created_at',{ascending:false})
    ]);
    if(aErr)throw aErr;
    window.VC.articles=articles||[];
    const grid=document.getElementById('newsGrid') || document.querySelector('#news .news-grid');
    if(grid){
      if(window.VC.articles.length){
        grid.innerHTML=window.VC.articles.slice(0,3).map((a,i)=>'<article class="news-card '+(i===0?'featured':'')+'">'+
          (a.image_url?'<div class="ph"><img src="'+esc(a.image_url)+'" alt="'+esc(a.alt||'Featured image')+'" loading="lazy"></div>':'<div class="ph"><span class="ph-tag">Featured image</span></div>')+
          '<div class="news-body"><span class="news-cat">'+esc(a.category||'School News')+'</span><a href="news-article.html?slug='+encodeURIComponent(a.slug)+'" style="text-decoration:none;color:inherit"><h3>'+esc(a.title)+'</h3></a><span class="news-date">'+fmtDate(a.date)+'</span><p class="news-excerpt">'+esc(a.excerpt||'')+'</p><a href="news-article.html?slug='+encodeURIComponent(a.slug)+'" class="news-read">Read More →</a></div></article>').join('');
      }
    }
    const wrap=document.getElementById('testimonialsWrap');
    if(wrap&&!rErr&&(reviews||[]).length)wrap.innerHTML='<div class="card-grid">'+reviews.map(r=>'<div class="feature-card reveal"><p style="font-style:italic;color:var(--ink-soft);font-size:15px;">&ldquo;'+esc(r.quote)+'&rdquo;</p><h3 style="font-size:15.5px;margin-bottom:2px;">'+esc(r.name||'Parent')+'</h3>'+(r.relation?'<p style="font-size:13px;color:var(--ink-soft);margin:0;">'+esc(r.relation)+'</p>':'')+'</div>').join('')+'</div>';
    await renderArticleFromSupabase(window.VC.articles);
  }

  async function renderArticleFromSupabase(articles){
    const slug=new URLSearchParams(location.search).get('slug');
    if(!slug)return;
    const article=(articles||[]).find(x=>x.slug===slug);
    const titleEl=document.getElementById('articleTitle');
    if(!article){if(titleEl)titleEl.textContent='Article not found';return;}
    const name=window.VC.settings?.schoolName||'ViviChild Academy';
    document.title=(article.seotitle||article.title)+' | '+name;
    const pageTitle=document.getElementById('pageTitle');if(pageTitle)pageTitle.textContent=document.title;
    const pageDesc=document.getElementById('pageDesc');if(pageDesc)pageDesc.setAttribute('content',article.metadesc||article.excerpt||'');
    const breadcrumb=document.getElementById('breadcrumbTitle');if(breadcrumb)breadcrumb.textContent=article.title;
    if(titleEl)titleEl.textContent=article.title;
    const cat=document.getElementById('articleCategory');if(cat)cat.textContent=article.category||'School News';
    const date=document.getElementById('articleDate');if(date)date.textContent=fmtDate(article.date);
    const author=document.getElementById('articleAuthor');if(author)author.textContent=article.author?'By '+article.author:'';
    const hero=document.getElementById('articleHero');
    if(hero){hero.innerHTML=article.image_url?'<img src="'+esc(article.image_url)+'" alt="'+esc(article.alt||article.title)+'" style="width:100%;height:100%;object-fit:cover;display:block;">':'<span class="ph-tag">'+esc(article.alt||'Featured image')+'</span>';}
    const body=document.getElementById('articleContent');
    if(body){const paragraphs=Array.isArray(article.content)?article.content:String(article.content||'').split(/\n+/).filter(Boolean);body.innerHTML=paragraphs.length?paragraphs.map(p=>'<p>'+esc(p)+'</p>').join(''):'<p>'+esc(article.excerpt||'')+'</p>';}
    const related=(articles||[]).filter(a=>a.slug!==article.slug).slice(0,3),relatedGrid=document.getElementById('relatedGrid');
    if(relatedGrid)relatedGrid.innerHTML=related.map(a=>'<a href="news-article.html?slug='+encodeURIComponent(a.slug)+'" style="text-decoration:none;color:inherit"><div class="news-card" style="height:100%;">'+(a.image_url?'<div class="ph"><img src="'+esc(a.image_url)+'" alt="'+esc(a.alt||a.title)+'"></div>':'<div class="ph"><span class="ph-tag">Featured image</span></div>')+'<div class="news-body"><span class="news-cat">'+esc(a.category||'School News')+'</span><h3 style="font-size:15.5px;">'+esc(a.title)+'</h3></div></div></a>').join('');
  }

  async function loadMedia(){
    const {data,error}=await client.from('media').select('*').eq('status','Published').order('created_at',{ascending:false});
    if(error)throw error;
    window.VC.media=data||[];
    const gallery=window.VC.media.filter(x=>x.type==='gallery'),student=window.VC.media.filter(x=>x.type==='student-life');
    const render=(selector,items)=>{const box=document.querySelector(selector);if(!box||!items.length)return;box.innerHTML=items.slice(0,Number(box.dataset.limit||8)).map(x=>'<article class="m-item reveal media-card"><div class="ph" style="height:240px;overflow:hidden;padding:0;position:relative;"><img src="'+esc(x.url)+'" alt="'+esc(x.alt||x.title||'School photo')+'" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"><span class="ph-tag" style="left:14px;bottom:14px;">'+esc(x.title||'School Life')+'</span></div></article>').join('');if(window.setupScrollReveal)window.setupScrollReveal();};
    render('[data-gallery]',gallery);render('[data-student-life]',student);render('[data-student-life-gallery]',student);render('[data-home-gallery]',gallery);render('[data-home-student-life]',student);
  }

  function hideSiteLoader(){
    const loader=document.getElementById('siteLoader');
    if(!loader)return;
    loader.classList.add('is-hidden');
    window.setTimeout(()=>loader.remove(),500);
  }

  const domReady=document.readyState==='loading'?new Promise(r=>document.addEventListener('DOMContentLoaded',r,{once:true})):Promise.resolve();
  window.VC.ready=domReady.then(async()=>{
    try{await loadSettings();}catch(e){console.warn('Supabase site settings unavailable:',e.message);}
    try{await loadMedia();}catch(e){console.warn('Supabase media unavailable:',e.message);}
    try{await loadArticlesAndReviews();}catch(e){console.warn('Supabase articles/reviews unavailable:',e.message);}
    wireForms();
    return window.VC;
  }).finally(()=>{
    window.setTimeout(hideSiteLoader,150);
  });
  window.setTimeout(hideSiteLoader,5000);
})();
