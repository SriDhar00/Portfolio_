/* =========================================================
   SRIDHAR N — PORTFOLIO ENGINE
   Loads every section from /data/*.json so the site can be
   updated by editing JSON files only — no HTML/JS changes.
   ========================================================= */

const ICONS = {
  FiCode: 'fa-solid fa-code',
  FiGlobe: 'fa-solid fa-globe',
  FiBarChart2: 'fa-solid fa-chart-column',
  FiDatabase: 'fa-solid fa-database',
  FiCloud: 'fa-solid fa-cloud',
  FiCpu: 'fa-solid fa-microchip',
  FiUsers: 'fa-solid fa-users'
};

const SOCIAL_ICONS = {
  github: 'fa-brands fa-github',
  linkedin: 'fa-brands fa-linkedin-in',
  portfolio: 'fa-solid fa-globe',
  email: 'fa-regular fa-envelope',
  phone: 'fa-solid fa-phone'
};

let DATA = {};

/* ---------- Data loading (JSON files, with inline fallback) ---------- */
async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn('Could not fetch', path, '— serve this site over http(s) (e.g. via a local server, GitHub Pages, Netlify, or Vercel) for the /data JSON files to load.', e);
    return null;
  }
}

async function loadAllData() {
  const [profile, skills, projects, education, experience, certificates, socials] = await Promise.all([
    loadJSON('data/profile.json'),
    loadJSON('data/skills.json'),
    loadJSON('data/projects.json'),
    loadJSON('data/education.json'),
    loadJSON('data/experience.json'),
    loadJSON('data/certificates.json'),
    loadJSON('data/socials.json')
  ]);
  DATA = { profile, skills, projects, education, experience, certificates, socials };
}

/* ---------- Helpers ---------- */
function el(tag, className, html) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

/* ---------- Render: Hero ---------- */
function renderHero() {
  const p = DATA.profile;
  if (!p) return;
  document.getElementById('hero-name').textContent = p.name;
  document.getElementById('hero-desc').textContent = p.tagline;
  document.getElementById('hero-photo').src = p.photo;
  document.getElementById('hero-photo').alt = 'Portrait of ' + p.name;
  document.title = p.name + ' — ' + p.title;

  const statsWrap = document.getElementById('hero-stats');
  (p.stats || []).forEach(s => {
    const card = el('div', 'stat-card', `<div class="num" data-target="${s.value}">0${s.suffix || ''}</div><div class="lbl">${s.label}</div>`);
    statsWrap.appendChild(card);
  });

  typeRoles(p.roles || [p.title]);
  animateStats();
}

function typeRoles(roles) {
  const target = document.getElementById('typed-role');
  let ri = 0, ci = 0, deleting = false;
  function tick() {
    const word = roles[ri];
    if (!deleting) {
      ci++;
      target.textContent = word.slice(0, ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, 1400); return; }
    } else {
      ci--;
      target.textContent = word.slice(0, ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(tick, deleting ? 35 : 65);
  }
  tick();
}

function animateStats() {
  const nums = document.querySelectorAll('.stat-card .num');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = parseFloat(node.dataset.target);
      const suffix = node.textContent.replace(/[0-9.]/g, '').trim();
      let cur = 0;
      const isFloat = !Number.isInteger(target);
      const step = target / 40;
      const anim = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(anim); }
        node.textContent = (isFloat ? cur.toFixed(2) : Math.round(cur)) + suffix;
      }, 25);
      obs.unobserve(node);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
}

/* ---------- Render: About ---------- */
function renderAbout() {
  const p = DATA.profile;
  if (!p) return;
  document.getElementById('about-intro').textContent = p.intro;
  document.getElementById('about-objective').textContent = p.objective;
  fillTags('about-languages', p.languages);
  fillTags('about-interests', p.interests);
  fillTags('about-strengths', p.strengths);
}
function fillTags(id, arr) {
  const wrap = document.getElementById(id);
  (arr || []).forEach(t => wrap.appendChild(el('span', 'tag', t)));
}

/* ---------- Render: Skills ---------- */
function renderSkills() {
  const s = DATA.skills;
  if (!s) return;
  const grid = document.getElementById('skills-grid');
  s.categories.forEach(cat => {
    const card = el('div', 'skill-card reveal');
    const iconClass = ICONS[cat.icon] || 'fa-solid fa-star';
    let rows = '';
    cat.skills.forEach(sk => {
      rows += `
      <div class="skill-row">
        <div class="row-top"><span>${sk.name}</span><span class="pct">${sk.level}%</span></div>
        <div class="bar-track"><div class="bar-fill" data-level="${sk.level}"></div></div>
      </div>`;
    });
    card.innerHTML = `<h4><span class="ic"><i class="${iconClass}"></i></span>${cat.name}</h4>${rows}`;
    grid.appendChild(card);
  });
  observeReveals();
  observeBars();
}
function observeBars() {
  const bars = document.querySelectorAll('.bar-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.level + '%';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => obs.observe(b));
}

/* ---------- Render: Projects ---------- */
let activeFilter = 'All';
let searchTerm = '';

function renderProjects() {
  const projects = DATA.projects || [];
  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const filterWrap = document.getElementById('project-filters');
  filterWrap.innerHTML = '';
  categories.forEach(cat => {
    const chip = el('button', 'filter-chip' + (cat === activeFilter ? ' active' : ''), cat);
    chip.addEventListener('click', () => {
      activeFilter = cat;
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      drawProjects();
    });
    filterWrap.appendChild(chip);
  });

  document.getElementById('project-search').addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    drawProjects();
  });

  drawProjects();
}

function drawProjects() {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';
  const projects = (DATA.projects || []).filter(p => {
    const matchesCat = activeFilter === 'All' || p.category === activeFilter;
    const matchesSearch = !searchTerm ||
      p.title.toLowerCase().includes(searchTerm) ||
      p.technologies.join(' ').toLowerCase().includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  if (projects.length === 0) {
    grid.appendChild(el('p', '', 'No projects match your search.'));
    return;
  }

  projects.forEach(p => {
    const card = el('div', 'project-card reveal');
    card.innerHTML = `
      <div class="project-thumb">
        ${p.featured ? '<span class="badge">Featured</span>' : ''}
        <i class="fa-solid fa-diagram-project" style="font-size:1.8rem;"></i>
      </div>
      <div class="project-body">
        <h4>${p.title}</h4>
        <p class="desc">${p.description}</p>
        <div class="project-tech">${p.technologies.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="project-role">${p.role}</div>
        <div class="project-actions">
          ${p.github ? `<a class="btn btn-outline btn-sm" href="${p.github}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> GitHub</a>` : ''}
          ${p.demo ? `<a class="btn btn-outline btn-sm" href="${p.demo}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>` : ''}
          <button class="btn btn-ghost btn-sm view-details" data-id="${p.id}"><i class="fa-solid fa-circle-info"></i> View Details</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  observeReveals();

  document.querySelectorAll('.view-details').forEach(btn => {
    btn.addEventListener('click', () => openProjectModal(btn.dataset.id));
  });
}

function openProjectModal(id) {
  const p = (DATA.projects || []).find(pr => pr.id === id);
  if (!p) return;
  document.getElementById('modal-content').innerHTML = `
    <h3>${p.title}</h3>
    <span class="project-role">${p.role}</span>
    <p style="color:var(--slate);margin-bottom:14px;">${p.description}</p>
    <h4 style="font-family:var(--font-display);font-size:0.95rem;margin-bottom:6px;">Key Features</h4>
    <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
    <h4 style="font-family:var(--font-display);font-size:0.95rem;margin-bottom:6px;">Technologies</h4>
    <div class="project-tech" style="margin-bottom:18px;">${p.technologies.map(t => `<span>${t}</span>`).join('')}</div>
    <div class="project-actions">
      ${p.github ? `<a class="btn btn-outline btn-sm" href="${p.github}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> GitHub</a>` : ''}
      ${p.demo ? `<a class="btn btn-primary btn-sm" href="${p.demo}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>` : ''}
    </div>`;
  document.getElementById('project-modal').classList.add('open');
}

/* ---------- Render: Experience & Education timelines ---------- */
function renderExperience() {
  const wrap = document.getElementById('experience-timeline');
  (DATA.experience || []).forEach(ex => {
    const item = el('div', 'timeline-item reveal');
    item.innerHTML = `
      <div class="timeline-card">
        <div class="tl-top">
          <div>
            <h4>${ex.role}</h4>
            <div class="tl-org">${ex.company}</div>
          </div>
          <span class="tl-date">${ex.duration}</span>
        </div>
        <ul>${ex.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>`;
    wrap.appendChild(item);
  });
  observeReveals();
}

function renderEducation() {
  const wrap = document.getElementById('education-timeline');
  (DATA.education || []).forEach(ed => {
    const item = el('div', 'timeline-item reveal');
    item.innerHTML = `
      <div class="timeline-card">
        <div class="tl-top">
          <div>
            <h4>${ed.degree}</h4>
            <div class="tl-org">${ed.institution}</div>
          </div>
          <span class="tl-date">${ed.duration}</span>
        </div>
        <div class="tl-score">${ed.score}</div>
      </div>`;
    wrap.appendChild(item);
  });
  observeReveals();
}

/* ---------- Render: Certificates ---------- */
function renderCertificates() {
  const wrap = document.getElementById('cert-grid');
  (DATA.certificates || []).forEach(c => {
    const card = el('div', 'cert-card reveal');
    const meta = [c.date, c.credentialId ? `ID: ${c.credentialId}` : null].filter(Boolean).join(' · ');
    card.innerHTML = `
      <div class="cert-icon"><i class="fa-solid fa-certificate"></i></div>
      <div class="cert-info">
        <h4>${c.name}</h4>
        <p>Issued by ${c.issuer}${meta ? ` — ${meta}` : ''}</p>
        ${c.link ? `<a class="btn btn-outline btn-sm" href="${c.link}" target="_blank" rel="noopener"><i class="fa-solid fa-eye"></i> View Certificate</a>` : `<span style="font-size:0.75rem;color:var(--slate-dim);font-family:var(--font-mono);">Add link in certificates.json</span>`}
      </div>`;
    wrap.appendChild(card);
  });
  observeReveals();
}

/* ---------- Render: Contact ---------- */
function renderContact() {
  const p = DATA.profile;
  const s = DATA.socials || {};
  if (!p) return;

  const infoWrap = document.getElementById('contact-info-list');
  infoWrap.innerHTML = `
    <a class="contact-info-item" href="mailto:${p.email}">
      <div class="ic"><i class="fa-regular fa-envelope"></i></div>
      <div class="txt"><small>Email</small>${p.email}</div>
    </a>
    <a class="contact-info-item" href="tel:${p.phone}">
      <div class="ic"><i class="fa-solid fa-phone"></i></div>
      <div class="txt"><small>Phone</small>${p.phone}</div>
    </a>
    <div class="contact-info-item">
      <div class="ic"><i class="fa-solid fa-location-dot"></i></div>
      <div class="txt"><small>Address</small>${p.address}</div>
    </div>`;

  const socialHTML = buildSocialButtons(s);
  document.getElementById('social-row').innerHTML = socialHTML;
  document.getElementById('footer-social-row').innerHTML = socialHTML;
}

function buildSocialButtons(s) {
  let html = '';
  if (s.github) html += `<a class="social-btn" href="${s.github}" target="_blank" rel="noopener" aria-label="GitHub"><i class="${SOCIAL_ICONS.github}"></i></a>`;
  if (s.linkedin) html += `<a class="social-btn" href="${s.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="${SOCIAL_ICONS.linkedin}"></i></a>`;
  if (s.portfolio) html += `<a class="social-btn" href="${s.portfolio}" target="_blank" rel="noopener" aria-label="Portfolio"><i class="${SOCIAL_ICONS.portfolio}"></i></a>`;
  if (s.email) html += `<a class="social-btn" href="mailto:${s.email}" aria-label="Email"><i class="${SOCIAL_ICONS.email}"></i></a>`;
  if (s.phone) html += `<a class="social-btn" href="tel:${s.phone}" aria-label="Phone"><i class="${SOCIAL_ICONS.phone}"></i></a>`;
  return html;
}

/* ---------- Reveal on scroll ---------- */
function observeReveals() {
  const items = document.querySelectorAll('.reveal:not(.in)');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(i => obs.observe(i));
}

/* ---------- Theme switcher ---------- */
function initTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  let theme = 'dark';
  try { theme = window.__portfolioTheme || 'dark'; } catch (e) {}
  html.setAttribute('data-theme', theme);
  updateThemeIcon(theme);

  btn.addEventListener('click', () => {
    theme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    window.__portfolioTheme = theme;
    updateThemeIcon(theme);
  });
}
function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle i');
  icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
}

/* ---------- Navbar / scroll progress / signal trace ---------- */
function initScrollFX() {
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('scroll-progress');
  const traceFill = document.querySelector('#signal-trace .trace-fill');
  const backToTop = document.getElementById('back-to-top');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    progress.style.width = pct + '%';
    if (traceFill) traceFill.style.height = pct + '%';

    navbar.classList.toggle('scrolled', scrolled > 20);
    backToTop.classList.toggle('show', scrolled > 400);

    let current = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom > 120) current = sec.id;
    });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
}

/* ---------- In-page smooth scroll for every #anchor link ----------
   Handled manually (instead of relying on default browser anchor
   navigation) so links like "Hire Me" / "Contact Me" / nav items
   reliably scroll within the page instead of being intercepted by
   any surrounding preview/embed environment. ---------- */
function initAnchorScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    e.preventDefault();
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('mobile-menu').classList.remove('open');
  });
}

/* ---------- Project modal close ---------- */
function initModal() {
  const overlay = document.getElementById('project-modal');
  document.getElementById('modal-close').addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.classList.remove('open'); });
}

/* ---------- Contact form validation (client-side; wire to your own backend/email service to actually send) ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: 'cf-name', field: 'field-name', err: 'err-name', validate: v => v.trim().length >= 2, msg: 'Please enter your name' },
      { id: 'cf-email', field: 'field-email', err: 'err-email', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email' },
      { id: 'cf-subject', field: 'field-subject', err: 'err-subject', validate: v => v.trim().length >= 3, msg: 'Please add a short subject' },
      { id: 'cf-message', field: 'field-message', err: 'err-message', validate: v => v.trim().length >= 10, msg: 'Message should be at least 10 characters' }
    ];

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const ok = f.validate(input.value);
      document.getElementById(f.field).classList.toggle('invalid', !ok);
      document.getElementById(f.err).textContent = ok ? '' : f.msg;
      if (!ok) valid = false;
    });

    const status = document.getElementById('form-status');
    if (valid) {
      status.textContent = 'Message ready — connect this form to your own backend or email service (e.g. Formspree, EmailJS) to actually deliver it.';
      status.className = 'success';
      form.reset();
    } else {
      status.textContent = 'Please fix the highlighted fields.';
      status.className = 'error';
    }
  });
}

/* ---------- Visitor counter (session-only demo; wire to a real backend/analytics for accurate counts) ---------- */
function initVisitorCounter() {
  const base = 1280;
  const bump = Math.floor(Math.random() * 40);
  document.getElementById('visitor-count').textContent = (base + bump).toLocaleString();
}

/* ---------- Footer year ---------- */
function initFooter() {
  document.getElementById('footer-year').textContent = new Date().getFullYear();
}

/* ---------- Loader ---------- */
function hideLoader() {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 500);
}

/* ---------- Init ---------- */
(async function init() {
  initTheme();
  initMobileMenu();
  initAnchorScroll();
  initModal();
  initContactForm();
  initFooter();
  initVisitorCounter();

  await loadAllData();

  renderHero();
  renderAbout();
  renderSkills();
  renderProjects();
  renderExperience();
  renderEducation();
  renderCertificates();
  renderContact();

  observeReveals();
  initScrollFX();
  hideLoader();
})();
