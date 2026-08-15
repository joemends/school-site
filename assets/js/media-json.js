/* ViviChild Academy - Shared Gallery & Student Life media loader
   Admin storage keys:
   vivichild_cms_gallery_v2
   vivichild_cms_studentlife_v1
   JSON files:
   content/gallery.json
   content/student-life.json
*/
(function () {
  'use strict';

  const GKEY = 'vivichild_cms_gallery_v2';
  const SKEY = 'vivichild_cms_studentlife_v1';
  const GURL = 'content/gallery.json';
  const SURL = 'content/student-life.json';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function readStore(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  async function readJson(url, key, bundled) {
    const local = readStore(key);
    if (local.length) return local;

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.gallery || data.studentLife || []);
      return Array.isArray(items) ? items : [];
    } catch (_) {
      // Opening HTML directly with file:// blocks fetch(). Use bundled fallback instead.
      return Array.isArray(bundled) ? bundled : [];
    }
  }

  function getImage(item) { return item && (item.image || item.src || item.url || ''); }
  function isPublished(item) {
    if (!item || item.status == null) return true;
    const status = String(item.status).trim().toLowerCase();
    return !['draft','unpublished','inactive','hidden'].includes(status);
  }

  const bundledStudentLife = [
    {id:'sl1',title:'Classroom Learning',category:'Learning',image:'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=82',alt:'Children learning together in a bright classroom'},
    {id:'sl2',title:'Reading Time',category:'Learning',image:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=82',alt:'Young learners reading and studying'},
    {id:'sl3',title:'ICT Activities',category:'Technology',image:'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1000&q=82',alt:'Students using computers for learning'},
    {id:'sl4',title:'Creative Activities',category:'Creativity',image:'https://images.unsplash.com/photo-1564429238817-393bd428d17f?auto=format&fit=crop&w=1000&q=82',alt:'Children taking part in a creative classroom activity'},
    {id:'sl5',title:'Outdoor Play',category:'Play',image:'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=1000&q=82',alt:'Children enjoying outdoor play'},
    {id:'sl6',title:'Group Learning',category:'Learning',image:'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=82',alt:'Students working together during a lesson'},
    {id:'sl7',title:'School Celebrations',category:'Events',image:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=82',alt:'Children celebrating together at school'},
    {id:'sl8',title:'Graduation Day',category:'Events',image:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=82',alt:'Students celebrating a graduation ceremony'}
  ];

  function renderCards(container, items, mode) {
    if (!container) return;
    const published = items.filter(isPublished).filter(item => getImage(item));
    if (!published.length) {
      container.innerHTML = '<p class="gallery-empty">Photos are being added — check back soon.</p>';
      return;
    }
    const limit = Number(container.dataset.limit || (mode === 'gallery' ? 8 : 8));
    container.innerHTML = published.slice(0, limit).map(item => {
      const title = item.title || 'ViviChild Academy';
      const category = item.category || (mode === 'gallery' ? 'School Life' : 'Student Life');
      const image = getImage(item);
      return `<article class="m-item reveal media-card">
        <div class="ph" style="height:${mode === 'gallery' ? 230 : 240}px;overflow:hidden;padding:0;position:relative;">
          <img src="${esc(image)}" alt="${esc(item.alt || title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">
          <span class="ph-tag" style="left:14px;bottom:14px;">${esc(title)}</span>
        </div>
      </article>`;
    }).join('');
    if (window.setupScrollReveal) window.setupScrollReveal();
  }

  function renderGalleryPage(items) {
    const container = document.querySelector('[data-gallery]');
    if (!container) return;
    const filters = document.querySelector('[data-gallery-filters]');
    const published = items.filter(isPublished).filter(item => getImage(item));
    const categories = ['All', ...new Set(published.map(x => x.category).filter(Boolean))];
    if (filters) {
      filters.innerHTML = categories.map((c,i) => `<button type="button" class="gallery-filter${i===0?' active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('');
      filters.onclick = event => {
        const button = event.target.closest('.gallery-filter');
        if (!button) return;
        filters.querySelectorAll('.gallery-filter').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        const filter = String(button.dataset.filter || '').toLowerCase();
        renderCards(container, filter === 'all' ? published : published.filter(x => String(x.category || '').toLowerCase() === filter), 'gallery');
      };
    }
    renderCards(container, published, 'gallery');
  }

  async function init() {
    if (window.VC && window.VC.supabase) {
      try { await window.VC.ready; } catch (_) {}
      const media = window.VC.media || [];
      const galleryContainer = document.querySelector('[data-gallery]');
      const studentContainer = document.querySelector('[data-student-life-gallery]');
      const homeGallery = document.querySelector('[data-home-gallery]');
      const homeStudent = document.querySelector('[data-home-student-life]');
      if (galleryContainer) renderGalleryPage(media.filter(x=>x.type==='gallery'));
      if (studentContainer) renderCards(studentContainer, media.filter(x=>x.type==='student-life'), 'student');
      if (homeGallery) renderCards(homeGallery, media.filter(x=>x.type==='gallery'), 'gallery');
      if (homeStudent) renderCards(homeStudent, media.filter(x=>x.type==='student-life'), 'student');
      return;
    }
    const galleryContainer = document.querySelector('[data-gallery]');
    const studentContainer = document.querySelector('[data-student-life-gallery]');
    const homeGallery = document.querySelector('[data-home-gallery]');
    const homeStudent = document.querySelector('[data-home-student-life]');
    if (!galleryContainer && !studentContainer && !homeGallery && !homeStudent) return;

    const [gallery, student] = await Promise.all([
      readJson(GURL, GKEY, []),
      readJson(SURL, SKEY, bundledStudentLife)
    ]);

    if (galleryContainer) renderGalleryPage(gallery);
    if (studentContainer) renderCards(studentContainer, student, 'student');
    if (homeGallery) renderCards(homeGallery, gallery, 'gallery');
    if (homeStudent) renderCards(homeStudent, student, 'student');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
